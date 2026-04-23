/**
 * app/api/admin/fleet/route.ts
 *
 * GET /api/admin/fleet
 *
 * Returns all vehicles with fleet management fields + maintenance summary.
 */

import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getErrorMessage } from "@/lib/helpers";

export async function GET(): Promise<NextResponse> {
  const sql = getDB();
  try {
    // Main vehicle query with fleet fields
    const vehicles = await sql`
      SELECT
        v.*,
        -- Last completed oil change mileage for due calc
        (
          SELECT completed_mileage
          FROM maintenance_records
          WHERE vehicle_id = v.id
            AND service_type = 'Oil Change'
            AND status = 'completed'
          ORDER BY completed_date DESC
          LIMIT 1
        ) AS last_oil_change_mileage,
        -- Days since last rental completed
        (
          SELECT EXTRACT(DAY FROM NOW() - MAX(return_datetime))::INTEGER
          FROM reservations
          WHERE vehicle_id = v.id
            AND reservation_status = 'completed'
        ) AS days_since_last_rental,
        -- Active reservation count
        (
          SELECT COUNT(*)
          FROM reservations
          WHERE vehicle_id = v.id
            AND reservation_status = 'active'
        ) AS active_reservation_count
      FROM vehicles v
      ORDER BY v.vehicle_code ASC
    `;

    return NextResponse.json(vehicles);
  } catch (err) {
    console.error("[GET /api/admin/fleet]", err);
    return NextResponse.json(
      { error: "Failed to load fleet", detail: getErrorMessage(err) },
      { status: 500 }
    );
  }
}
