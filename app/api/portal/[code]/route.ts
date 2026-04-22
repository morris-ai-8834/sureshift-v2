/**
 * app/api/portal/[code]/route.ts
 *
 * GET /api/portal/[code]
 *
 * Returns the complete portal data bundle for a reservation identified by
 * its human-readable reservation_code (e.g. "SSR-RES-A3K9").
 *
 * This is the primary data source for the customer portal page at
 * /portal/[code]. It returns everything the portal needs in a single
 * request to avoid waterfall fetches on the client.
 *
 * Bundle includes:
 *   - reservation  — the core reservation record
 *   - vehicle      — the rented vehicle details
 *   - customer     — the renter's contact info
 *   - payments     — all payment transactions for this reservation
 *   - agreement    — the rental agreement document status (if created)
 *   - signature    — the customer's signature record (if signed)
 *   - documents    — uploaded files (license, insurance, etc.)
 *   - statusHistory — complete audit trail of status changes
 *
 * Response: PortalData object
 */

import { NextRequest, NextResponse } from "next/server";
import { sql, typedSql } from "@/lib/db";
import { getErrorMessage } from "@/lib/helpers";
import type {
  PortalData,
  ReservationRow,
  VehicleRow,
  CustomerRow,
  PaymentRow,
  AgreementRow,
  SignatureRow,
  CustomerDocumentRow,
  ReservationStatusHistoryRow,
} from "@/lib/types";

// ============================================
// GET /api/portal/[code]
// ============================================

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
): Promise<NextResponse> {
  try {
    const { code } = await params;

    if (!code || code.trim().length === 0) {
      return NextResponse.json(
        { error: "Reservation code is required" },
        { status: 400 }
      );
    }

    // Normalize the code to uppercase — customers might type it in lowercase
    const normalizedCode = code.toUpperCase().trim();

    // ----------------------------------------
    // FETCH: Core reservation record
    // The reservation_code is the customer-facing key for portal lookup.
    // ----------------------------------------
    const reservations = await typedSql<ReservationRow[]>`
      SELECT * FROM reservations
      WHERE reservation_code = ${normalizedCode}
      LIMIT 1
    `;

    if (reservations.length === 0) {
      return NextResponse.json(
        {
          error: "Reservation not found",
          detail: `No reservation found with code: ${normalizedCode}`,
        },
        { status: 404 }
      );
    }

    const reservation = reservations[0];
    const { id: reservationId, vehicle_id, customer_id } = reservation;

    // ----------------------------------------
    // FETCH: Vehicle details
    // The vehicle record linked to this reservation.
    // ----------------------------------------
    const vehicles = await typedSql<VehicleRow[]>`
      SELECT * FROM vehicles
      WHERE id = ${vehicle_id}
      LIMIT 1
    `;

    if (vehicles.length === 0) {
      // This should never happen (FK constraint) but handle defensively
      return NextResponse.json(
        { error: "Associated vehicle not found — please contact support" },
        { status: 500 }
      );
    }

    // ----------------------------------------
    // FETCH: Customer details
    // The customer record linked to this reservation.
    // ----------------------------------------
    const customers = await typedSql<CustomerRow[]>`
      SELECT * FROM customers
      WHERE id = ${customer_id}
      LIMIT 1
    `;

    if (customers.length === 0) {
      return NextResponse.json(
        { error: "Associated customer not found — please contact support" },
        { status: 500 }
      );
    }

    // ----------------------------------------
    // FETCH: Payment history for this reservation
    // All payment transactions (deposits, fees, refunds) ordered newest first.
    // ----------------------------------------
    const payments = await typedSql<PaymentRow[]>`
      SELECT * FROM payments
      WHERE reservation_id = ${reservationId}
      ORDER BY created_at DESC
    `;

    // ----------------------------------------
    // FETCH: Agreement document (if exists)
    // One agreement per reservation — null if not yet generated.
    // ----------------------------------------
    const agreements = await typedSql<AgreementRow[]>`
      SELECT * FROM agreements
      WHERE reservation_id = ${reservationId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const agreement = agreements.length > 0 ? agreements[0] : null;

    // ----------------------------------------
    // FETCH: Signature record (if agreement was signed)
    // Null if agreement hasn't been signed yet.
    // ----------------------------------------
    let signature: SignatureRow | null = null;
    if (agreement !== null) {
      const signatures = await typedSql<SignatureRow[]>`
        SELECT * FROM signatures
        WHERE agreement_id = ${agreement.id}
        ORDER BY created_at DESC
        LIMIT 1
      `;
      signature = signatures.length > 0 ? signatures[0] : null;
    }

    // ----------------------------------------
    // FETCH: Customer documents for this reservation
    // Files uploaded by the customer (license, insurance, etc.)
    // ----------------------------------------
    const documents = await typedSql<CustomerDocumentRow[]>`
      SELECT * FROM customer_documents
      WHERE reservation_id = ${reservationId}
      ORDER BY uploaded_at DESC
    `;

    // ----------------------------------------
    // FETCH: Status history audit trail
    // All status changes from newest to oldest — used for portal timeline.
    // ----------------------------------------
    const statusHistory = await typedSql<ReservationStatusHistoryRow[]>`
      SELECT * FROM reservation_status_history
      WHERE reservation_id = ${reservationId}
      ORDER BY created_at ASC
    `;

    // ----------------------------------------
    // BUILD: Portal data bundle
    // Assemble all fetched data into the PortalData shape.
    // ----------------------------------------
    const portalData: PortalData = {
      reservation,
      vehicle: vehicles[0],
      customer: customers[0],
      payments,
      agreement,
      signature,
      documents,
      statusHistory,
    };

    return NextResponse.json(portalData);
  } catch (err) {
    console.error("[GET /api/portal/[code]] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to load portal data", detail: getErrorMessage(err) },
      { status: 500 }
    );
  }
}
