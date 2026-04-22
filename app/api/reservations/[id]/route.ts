/**
 * app/api/reservations/[id]/route.ts
 *
 * GET /api/reservations/[id]
 *
 * Returns a single reservation with its associated vehicle and customer data.
 * The [id] segment is the reservation UUID.
 *
 * Used by admin views that need full reservation context including
 * customer contact info and vehicle details.
 *
 * Response: ReservationWithDetails object (reservation joined with vehicle + customer)
 */

import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getErrorMessage } from "@/lib/helpers";
import type { ReservationWithDetails } from "@/lib/types";

// ============================================
// GET /api/reservations/[id]
// ============================================

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const sql = getDB();
  try {
    const { id } = await params;

    if (!id || id.trim().length === 0) {
      return NextResponse.json(
        { error: "Reservation ID is required" },
        { status: 400 }
      );
    }

    // Fetch the reservation joined with vehicle and customer data.
    // This single query gives us everything needed for the admin detail view.
    const reservations = await sql`
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
      return NextResponse.json(
        { error: "Reservation not found", detail: `No reservation with id: ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json(reservations[0]);
  } catch (err) {
    console.error("[GET /api/reservations/[id]] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to fetch reservation", detail: getErrorMessage(err) },
      { status: 500 }
    );
  }
}
