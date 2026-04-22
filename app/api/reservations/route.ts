/**
 * app/api/reservations/route.ts
 *
 * POST /api/reservations
 *
 * Creates a new reservation. This is the core booking endpoint — it:
 *
 *   1. Validates all required fields
 *   2. Verifies the vehicle exists, is bookable, and is available on the dates
 *   3. Upserts the customer record by email (existing customers get updated info)
 *   4. Calculates pricing: days × daily_rate, deposit from vehicle record
 *   5. Creates the reservation record with status = awaiting_deposit
 *   6. Creates a 30-minute reservation hold (blackout date) on the vehicle
 *   7. Writes the first reservation_status_history entry
 *   8. Returns { reservationId, reservationCode, depositDue, estimatedTotal, expiresAt }
 *
 * The hold expires automatically — no active job needed. The availability
 * query in GET /api/vehicles ignores holds where expires_at < NOW().
 *
 * Response: CreateReservationResponse
 */

import { NextRequest, NextResponse } from "next/server";
import { sql, typedSql } from "@/lib/db";
import {
  ReservationStatus,
  DepositStatus,
  AgreementStatus,
  SignatureStatus,
  BlackoutReasonType,
  ChangedByType,
  VehicleStatus,
} from "@/lib/constants";
import {
  generateReservationCode,
  calculateRentalDays,
  calculateRentalSubtotal,
  calculateHoldExpiration,
  isNonEmptyString,
  isValidDateString,
  isValidEmail,
  isPickupInFuture,
  isReturnAfterPickup,
  getErrorMessage,
} from "@/lib/helpers";
import type {
  CreateReservationBody,
  CreateReservationResponse,
  VehicleRow,
  CustomerRow,
} from "@/lib/types";

// ============================================
// POST /api/reservations
// ============================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // ============================================
    // SECTION: Parse request body
    // ============================================
    let body: CreateReservationBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body", detail: "Expected JSON" },
        { status: 400 }
      );
    }

    // ============================================
    // SECTION: Field validation
    // Validate every required field before touching the database.
    // This gives the client clear error messages per-field.
    // ============================================
    const validationErrors: string[] = [];

    if (!isNonEmptyString(body.vehicleId)) {
      validationErrors.push("vehicleId is required");
    }
    if (!isValidDateString(body.pickupDatetime)) {
      validationErrors.push("pickupDatetime must be a valid ISO datetime string");
    }
    if (!isValidDateString(body.returnDatetime)) {
      validationErrors.push("returnDatetime must be a valid ISO datetime string");
    }
    if (!isNonEmptyString(body.firstName)) {
      validationErrors.push("firstName is required");
    }
    if (!isNonEmptyString(body.lastName)) {
      validationErrors.push("lastName is required");
    }
    if (!isValidEmail(body.email)) {
      validationErrors.push("email must be a valid email address");
    }
    if (!isNonEmptyString(body.phone)) {
      validationErrors.push("phone is required");
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", detail: validationErrors.join("; ") },
        { status: 400 }
      );
    }

    // Parse the datetime strings into Date objects for comparison and calculation
    const pickupDatetime = new Date(body.pickupDatetime);
    const returnDatetime = new Date(body.returnDatetime);

    // Pickup must be in the future — can't book yesterday's car
    if (!isPickupInFuture(pickupDatetime)) {
      return NextResponse.json(
        { error: "Pickup date must be in the future" },
        { status: 400 }
      );
    }

    // Return must come after pickup
    if (!isReturnAfterPickup(pickupDatetime, returnDatetime)) {
      return NextResponse.json(
        { error: "Return date must be after pickup date" },
        { status: 400 }
      );
    }

    // ============================================
    // SECTION: Vehicle validation
    // Confirm the vehicle exists, is bookable, and has an appropriate status.
    // ============================================
    const vehicles = await typedSql<VehicleRow[]>`
      SELECT * FROM vehicles
      WHERE id = ${body.vehicleId}
      LIMIT 1
    `;

    if (vehicles.length === 0) {
      return NextResponse.json(
        { error: "Vehicle not found", detail: `No vehicle with id: ${body.vehicleId}` },
        { status: 404 }
      );
    }

    const vehicle = vehicles[0];

    // Vehicle must be set to bookable and in an available status
    const isBookableStatus =
      vehicle.status === VehicleStatus.AVAILABLE ||
      vehicle.status === VehicleStatus.LIMITED_AVAILABILITY;

    if (!vehicle.is_bookable || !isBookableStatus) {
      return NextResponse.json(
        {
          error: "Vehicle is not available for booking",
          detail: `Vehicle status: ${vehicle.status}, bookable: ${vehicle.is_bookable}`,
        },
        { status: 409 }
      );
    }

    // ============================================
    // SECTION: Availability check
    // Check for any overlapping blackout dates on the requested window.
    // A vehicle is unavailable if it has any non-expired blocking entry
    // that overlaps our requested pickup→return window.
    // ============================================
    const conflicts = await typedSql<{ id: string }[]>`
      SELECT id FROM vehicle_blackout_dates
      WHERE vehicle_id = ${body.vehicleId}
        AND start_datetime < ${returnDatetime.toISOString()}
        AND end_datetime   > ${pickupDatetime.toISOString()}
        AND (expires_at IS NULL OR expires_at > NOW())
      LIMIT 1
    `;

    if (conflicts.length > 0) {
      return NextResponse.json(
        {
          error: "Vehicle is not available for the requested dates",
          detail: "Please choose different dates or a different vehicle",
        },
        { status: 409 }
      );
    }

    // ============================================
    // SECTION: Customer upsert
    // Look up customer by email. If found, update their contact info
    // (people move and change phones). If not found, create new record.
    // ============================================
    const existingCustomers = await typedSql<CustomerRow[]>`
      SELECT * FROM customers
      WHERE email = ${body.email.toLowerCase().trim()}
      LIMIT 1
    `;

    let customerId: string;

    if (existingCustomers.length > 0) {
      // Update existing customer with any new info they provided
      customerId = existingCustomers[0].id;
      await sql`
        UPDATE customers SET
          first_name             = ${body.firstName.trim()},
          last_name              = ${body.lastName.trim()},
          full_name              = ${`${body.firstName.trim()} ${body.lastName.trim()}`},
          phone                  = ${body.phone.trim()},
          address_line_1         = ${body.addressLine1 ?? existingCustomers[0].address_line_1},
          city                   = ${body.city ?? existingCustomers[0].city},
          state                  = ${body.state ?? existingCustomers[0].state},
          zip_code               = ${body.zipCode ?? existingCustomers[0].zip_code},
          driver_license_number  = ${body.driverLicenseNumber ?? existingCustomers[0].driver_license_number},
          driver_license_state   = ${body.driverLicenseState ?? existingCustomers[0].driver_license_state},
          updated_at             = NOW()
        WHERE id = ${customerId}
      `;
    } else {
      // Create new customer record
      const newCustomers = await typedSql<{ id: string }[]>`
        INSERT INTO customers (
          first_name, last_name, full_name,
          email, phone,
          date_of_birth, address_line_1, city, state, zip_code,
          driver_license_number, driver_license_state
        ) VALUES (
          ${body.firstName.trim()},
          ${body.lastName.trim()},
          ${`${body.firstName.trim()} ${body.lastName.trim()}`},
          ${body.email.toLowerCase().trim()},
          ${body.phone.trim()},
          ${body.dateOfBirth ?? null},
          ${body.addressLine1 ?? null},
          ${body.city ?? null},
          ${body.state ?? null},
          ${body.zipCode ?? null},
          ${body.driverLicenseNumber ?? null},
          ${body.driverLicenseState ?? null}
        )
        RETURNING id
      `;
      customerId = newCustomers[0].id;
    }

    // ============================================
    // SECTION: Pricing calculation
    // Calculate days, subtotal, and balance estimate.
    // All amounts are stored as strings to match Postgres numeric type.
    // ============================================
    const totalDays = calculateRentalDays(pickupDatetime, returnDatetime);
    const dailyRate = parseFloat(vehicle.daily_rate);
    const depositAmount = parseFloat(vehicle.deposit_amount);
    const rentalSubtotal = calculateRentalSubtotal(totalDays, dailyRate);
    // Balance due estimate = subtotal (deposit collected separately at pickup)
    const balanceDueEstimate = rentalSubtotal;

    // ============================================
    // SECTION: Create reservation record
    // ============================================
    const reservationCode = generateReservationCode();
    const holdExpiration = calculateHoldExpiration();

    const newReservations = await typedSql<{ id: string }[]>`
      INSERT INTO reservations (
        reservation_code,
        vehicle_id,
        customer_id,
        pickup_datetime,
        return_datetime,
        pickup_location,
        intended_use,
        special_requests,
        reservation_status,
        deposit_status,
        agreement_status,
        signature_status,
        estimated_daily_rate,
        estimated_total_days,
        estimated_rental_subtotal,
        deposit_due,
        deposit_paid_amount,
        balance_due_estimate,
        expiration_datetime
      ) VALUES (
        ${reservationCode},
        ${body.vehicleId},
        ${customerId},
        ${pickupDatetime.toISOString()},
        ${returnDatetime.toISOString()},
        ${body.pickupLocation ?? null},
        ${body.intendedUse ?? null},
        ${body.specialRequests ?? null},
        ${ReservationStatus.AWAITING_DEPOSIT},
        ${DepositStatus.NOT_PAID},
        ${AgreementStatus.NOT_CREATED},
        ${SignatureStatus.NOT_REQUESTED},
        ${dailyRate.toFixed(2)},
        ${totalDays},
        ${rentalSubtotal.toFixed(2)},
        ${depositAmount.toFixed(2)},
        ${"0.00"},
        ${balanceDueEstimate.toFixed(2)},
        ${holdExpiration.toISOString()}
      )
      RETURNING id
    `;

    const reservationId = newReservations[0].id;

    // ============================================
    // SECTION: Create reservation hold (blackout date)
    // Blocks the vehicle for 30 minutes while customer arranges deposit.
    // The hold record includes expires_at so it's automatically ignored
    // by availability queries after the window closes.
    // ============================================
    await sql`
      INSERT INTO vehicle_blackout_dates (
        vehicle_id,
        start_datetime,
        end_datetime,
        reason_type,
        reason_note,
        reservation_id,
        expires_at
      ) VALUES (
        ${body.vehicleId},
        ${pickupDatetime.toISOString()},
        ${returnDatetime.toISOString()},
        ${BlackoutReasonType.RESERVATION_HOLD},
        ${"Pending deposit — hold expires if not paid within 30 minutes"},
        ${reservationId},
        ${holdExpiration.toISOString()}
      )
    `;

    // ============================================
    // SECTION: Write initial status history entry
    // Every status transition gets an immutable history record.
    // This first entry marks the moment the reservation was created.
    // ============================================
    await sql`
      INSERT INTO reservation_status_history (
        reservation_id,
        old_status,
        new_status,
        changed_by_type,
        note
      ) VALUES (
        ${reservationId},
        NULL,
        ${ReservationStatus.AWAITING_DEPOSIT},
        ${ChangedByType.SYSTEM},
        ${"Reservation created via online booking form. Hold placed on vehicle."}
      )
    `;

    // ============================================
    // SECTION: Build and return response
    // ============================================
    const response: CreateReservationResponse = {
      reservationId,
      reservationCode,
      depositDue: depositAmount,
      estimatedTotal: rentalSubtotal,
      expiresAt: holdExpiration.toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error("[POST /api/reservations] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to create reservation", detail: getErrorMessage(err) },
      { status: 500 }
    );
  }
}
