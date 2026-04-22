/**
 * app/api/admin/reservations/[id]/route.ts
 *
 * GET /api/admin/reservations/[id]  — Get single reservation with full details
 * PUT /api/admin/reservations/[id]  — Update reservation status fields
 *
 * The PUT endpoint is the admin's primary tool for advancing reservations
 * through their lifecycle: marking deposits paid, sending agreements,
 * marking cars active or returned, etc.
 *
 * Every status change via PUT is recorded in reservation_status_history
 * so there's a complete audit trail of every admin action.
 */

import { NextRequest, NextResponse } from "next/server";
import { sql, typedSql } from "@/lib/db";
import { ChangedByType } from "@/lib/constants";
import { isNonEmptyString, getErrorMessage } from "@/lib/helpers";
import type {
  ReservationRow,
  ReservationWithDetails,
  UpdateReservationBody,
} from "@/lib/types";

type RouteParams = { params: Promise<{ id: string }> };

// ============================================
// GET /api/admin/reservations/[id]
// Full reservation detail with customer and vehicle data.
// ============================================

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;

    const reservations = await typedSql<ReservationWithDetails[]>`
      SELECT
        r.*,
        c.first_name  AS customer_first_name,
        c.last_name   AS customer_last_name,
        c.email       AS customer_email,
        c.phone       AS customer_phone,
        v.headline_name AS vehicle_headline_name,
        v.make        AS vehicle_make,
        v.model       AS vehicle_model,
        v.year        AS vehicle_year,
        v.slug        AS vehicle_slug
      FROM reservations r
      JOIN customers c ON c.id = r.customer_id
      JOIN vehicles  v ON v.id = r.vehicle_id
      WHERE r.id = ${id}
      LIMIT 1
    `;

    if (reservations.length === 0) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    return NextResponse.json(reservations[0]);
  } catch (err) {
    console.error("[GET /api/admin/reservations/[id]]", err);
    return NextResponse.json(
      { error: "Failed to fetch reservation", detail: getErrorMessage(err) },
      { status: 500 }
    );
  }
}

// ============================================
// PUT /api/admin/reservations/[id]
// Updates status fields. Records status change in history table.
// ============================================

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // Fetch current reservation to capture old_status for history log
    const existing = await typedSql<ReservationRow[]>`
      SELECT * FROM reservations WHERE id = ${id} LIMIT 1
    `;

    if (existing.length === 0) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    const currentReservation = existing[0];

    let body: UpdateReservationBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // ----------------------------------------
    // UPDATE: Reservation status fields
    // Uses COALESCE so only provided fields change.
    // confirmed_at is set automatically when status changes to confirmed.
    // cancelled_at is set automatically when status changes to cancelled.
    // ----------------------------------------
    await sql`
      UPDATE reservations SET
        reservation_status = COALESCE(${body.reservationStatus ?? null}, reservation_status),
        deposit_status     = COALESCE(${body.depositStatus ?? null}, deposit_status),
        agreement_status   = COALESCE(${body.agreementStatus ?? null}, agreement_status),
        signature_status   = COALESCE(${body.signatureStatus ?? null}, signature_status),
        confirmed_at = CASE
          WHEN ${body.reservationStatus ?? null} = 'confirmed' AND confirmed_at IS NULL
          THEN NOW()
          ELSE confirmed_at
        END,
        cancelled_at = CASE
          WHEN ${body.reservationStatus ?? null} = 'cancelled' AND cancelled_at IS NULL
          THEN NOW()
          ELSE cancelled_at
        END,
        updated_at = NOW()
      WHERE id = ${id}
    `;

    // ----------------------------------------
    // AUDIT: Write status history entry
    // Record every status change with the admin note (if provided).
    // ----------------------------------------
    if (body.reservationStatus && body.reservationStatus !== currentReservation.reservation_status) {
      const note = isNonEmptyString(body.adminNote)
        ? body.adminNote
        : `Status changed from ${currentReservation.reservation_status} to ${body.reservationStatus} by admin`;

      await sql`
        INSERT INTO reservation_status_history (
          reservation_id, old_status, new_status, changed_by_type, note
        ) VALUES (
          ${id},
          ${currentReservation.reservation_status},
          ${body.reservationStatus},
          ${ChangedByType.ADMIN},
          ${note}
        )
      `;
    }

    // Return updated reservation
    const updated = await typedSql<ReservationRow[]>`
      SELECT * FROM reservations WHERE id = ${id} LIMIT 1
    `;

    return NextResponse.json(updated[0]);
  } catch (err) {
    console.error("[PUT /api/admin/reservations/[id]]", err);
    return NextResponse.json(
      { error: "Failed to update reservation", detail: getErrorMessage(err) },
      { status: 500 }
    );
  }
}
