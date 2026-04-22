/**
 * app/api/availability/route.ts
 *
 * POST /api/availability
 *
 * Checks whether a specific vehicle is available for a requested date range.
 *
 * This is the single-vehicle availability check used on the vehicle detail
 * page before a customer clicks "Reserve". It returns:
 *   - available: true/false
 *   - conflictingDates: array of blocking windows (if unavailable)
 *   - nextAvailable: the next date the vehicle is free (if unavailable)
 *
 * Request body: { vehicleId: string, pickupDate: string, returnDate: string }
 * Response: AvailabilityResponse
 *
 * Note: This checks BOTH vehicle status (is it bookable?) AND blackout dates
 * (does it have a conflicting hold or confirmed booking?).
 */

import { NextRequest, NextResponse } from "next/server";
import { sql, typedSql } from "@/lib/db";
import { VehicleStatus } from "@/lib/constants";
import {
  isNonEmptyString,
  isValidDateString,
  isPickupInFuture,
  isReturnAfterPickup,
  getErrorMessage,
} from "@/lib/helpers";
import type { CheckAvailabilityBody, AvailabilityResponse, VehicleRow } from "@/lib/types";

// ============================================
// POST /api/availability
// ============================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // ----------------------------------------
    // SECTION: Parse & validate request body
    // ----------------------------------------
    let body: CheckAvailabilityBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body", detail: "Expected JSON with vehicleId, pickupDate, returnDate" },
        { status: 400 }
      );
    }

    const { vehicleId, pickupDate, returnDate } = body;

    // All three fields are required
    if (!isNonEmptyString(vehicleId)) {
      return NextResponse.json({ error: "vehicleId is required" }, { status: 400 });
    }
    if (!isValidDateString(pickupDate)) {
      return NextResponse.json({ error: "pickupDate must be a valid ISO date string" }, { status: 400 });
    }
    if (!isValidDateString(returnDate)) {
      return NextResponse.json({ error: "returnDate must be a valid ISO date string" }, { status: 400 });
    }

    const pickup = new Date(pickupDate);
    const returnDt = new Date(returnDate);

    // Pickup must be in the future
    if (!isPickupInFuture(pickup)) {
      return NextResponse.json(
        { error: "pickupDate must be in the future" },
        { status: 400 }
      );
    }

    // Return must be after pickup
    if (!isReturnAfterPickup(pickup, returnDt)) {
      return NextResponse.json(
        { error: "returnDate must be after pickupDate" },
        { status: 400 }
      );
    }

    // ----------------------------------------
    // SECTION: Check vehicle exists and is bookable
    // A vehicle can exist in the fleet but be marked not bookable (e.g. maintenance).
    // ----------------------------------------
    const vehicles = await typedSql<VehicleRow[]>`
      SELECT id, status, is_bookable FROM vehicles
      WHERE id = ${vehicleId}
      LIMIT 1
    `;

    if (vehicles.length === 0) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const vehicle = vehicles[0];

    // Vehicle must be in an available state to be bookable
    const isBookableStatus =
      vehicle.status === VehicleStatus.AVAILABLE ||
      vehicle.status === VehicleStatus.LIMITED_AVAILABILITY;

    if (!vehicle.is_bookable || !isBookableStatus) {
      const response: AvailabilityResponse = { available: false };
      return NextResponse.json(response);
    }

    // ----------------------------------------
    // SECTION: Availability Engine
    // Query any blackout dates that overlap the requested window.
    // We return the conflicting windows so the UI can show why.
    // ----------------------------------------
    const conflicts = await typedSql<{
      start_datetime: Date;
      end_datetime: Date;
      reason_type: string;
    }[]>`
      SELECT start_datetime, end_datetime, reason_type
      FROM vehicle_blackout_dates
      WHERE vehicle_id = ${vehicleId}
        -- Interval overlap: blackout starts before our return AND ends after our pickup
        AND start_datetime < ${returnDt.toISOString()}
        AND end_datetime   > ${pickup.toISOString()}
        -- Ignore expired holds — they no longer count as blocks
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY start_datetime ASC
    `;

    if (conflicts.length > 0) {
      // Find the next date the vehicle becomes available:
      // Take the latest end_datetime across all conflicts.
      const latestEnd = conflicts.reduce((latest, c) => {
        const endDate = new Date(c.end_datetime);
        return endDate > latest ? endDate : latest;
      }, new Date(conflicts[0].end_datetime));

      const response: AvailabilityResponse = {
        available: false,
        nextAvailable: latestEnd.toISOString(),
        conflictingDates: conflicts.map((c) => ({
          start: new Date(c.start_datetime).toISOString(),
          end: new Date(c.end_datetime).toISOString(),
        })),
      };
      return NextResponse.json(response);
    }

    // ----------------------------------------
    // SECTION: Vehicle is available
    // No conflicts found — the vehicle is free for the requested window.
    // ----------------------------------------
    const response: AvailabilityResponse = { available: true };
    return NextResponse.json(response);
  } catch (err) {
    console.error("[POST /api/availability] Unexpected error:", err);
    return NextResponse.json(
      { error: "Availability check failed", detail: getErrorMessage(err) },
      { status: 500 }
    );
  }
}
