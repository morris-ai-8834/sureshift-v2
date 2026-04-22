/**
 * app/api/admin/reservations/route.ts
 *
 * GET /api/admin/reservations
 *
 * Returns all reservations joined with customer and vehicle data.
 * Supports optional status filtering via query param.
 *
 * Query params:
 *   ?status=awaiting_deposit    — filter by reservation_status
 *   ?limit=50                   — max results (default 100)
 *   ?offset=0                   — pagination offset
 *
 * Response: Array of ReservationWithDetails, newest first.
 */

import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getErrorMessage } from "@/lib/helpers";


// ============================================
// GET /api/admin/reservations
// ============================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  const sql = getDB();
  try {
    const { searchParams } = request.nextUrl;
    const statusFilter = searchParams.get("status");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "100", 10), 500);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    // Fetch all reservations with a full JOIN for display context.
    // If a status filter is provided, narrow results to that status.
    // Without a filter, all reservations are returned newest-first.
    let reservations: any[];

    if (statusFilter) {
      // Status-filtered query — used by tab views in the admin reservations page
      reservations = await sql`
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
        WHERE r.reservation_status = ${statusFilter}
        ORDER BY r.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      // No filter — return everything
      reservations = await sql`
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
        ORDER BY r.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    return NextResponse.json(reservations);
  } catch (err) {
    console.error("[GET /api/admin/reservations] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to fetch reservations", detail: getErrorMessage(err) },
      { status: 500 }
    );
  }
}
