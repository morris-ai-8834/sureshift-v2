/**
 * app/api/admin/fleet/[id]/route.ts
 *
 * GET /api/admin/fleet/[id]
 *
 * Returns full vehicle detail with maintenance, expenses, trips, and rental history.
 */

import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getErrorMessage } from "@/lib/helpers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const sql = getDB();
  const { id } = await params;

  try {
    // Vehicle with fleet fields
    const vehicleRes = await sql`
      SELECT * FROM vehicles WHERE id = ${id} LIMIT 1
    `;
    if (!vehicleRes.length) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }
    const vehicle = vehicleRes[0];

    // Maintenance records
    const maintenance = await sql`
      SELECT * FROM maintenance_records
      WHERE vehicle_id = ${id}
      ORDER BY due_date DESC NULLS LAST, created_at DESC
    `;

    // Expenses
    const expenses = await sql`
      SELECT * FROM vehicle_expenses
      WHERE vehicle_id = ${id}
      ORDER BY date DESC
    `;

    // Trips
    const trips = await sql`
      SELECT * FROM trips
      WHERE vehicle_id = ${id}
      ORDER BY trip_start DESC
      LIMIT 20
    `;

    // Recent rentals
    const rentals = await sql`
      SELECT
        r.*,
        c.first_name AS customer_first_name,
        c.last_name  AS customer_last_name,
        c.phone      AS customer_phone
      FROM reservations r
      JOIN customers c ON c.id = r.customer_id
      WHERE r.vehicle_id = ${id}
      ORDER BY r.created_at DESC
      LIMIT 10
    `;

    // Revenue stats
    const revenueRes = await sql`
      SELECT
        COALESCE(SUM(CASE WHEN DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW()) THEN estimated_rental_subtotal ELSE 0 END), 0) AS this_month,
        COALESCE(SUM(estimated_rental_subtotal), 0) AS lifetime
      FROM reservations
      WHERE vehicle_id = ${id}
        AND reservation_status IN ('active', 'completed', 'confirmed')
    `;

    return NextResponse.json({
      vehicle,
      maintenance,
      expenses,
      trips,
      rentals,
      revenue: {
        thisMonth: parseFloat(revenueRes[0].this_month) || 0,
        lifetime: parseFloat(revenueRes[0].lifetime) || 0,
      },
    });
  } catch (err) {
    console.error("[GET /api/admin/fleet/[id]]", err);
    return NextResponse.json(
      { error: "Failed to load vehicle", detail: getErrorMessage(err) },
      { status: 500 }
    );
  }
}
