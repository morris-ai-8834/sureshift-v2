/**
 * app/api/admin/maintenance/route.ts
 *
 * GET /api/admin/maintenance
 *
 * Returns all maintenance records across fleet, joined with vehicle info.
 */

import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getErrorMessage } from "@/lib/helpers";

export async function GET(): Promise<NextResponse> {
  const sql = getDB();
  try {
    const records = await sql`
      SELECT
        mr.*,
        v.vehicle_code,
        v.year AS vehicle_year,
        v.make AS vehicle_make,
        v.model AS vehicle_model,
        v.current_odometer
      FROM maintenance_records mr
      JOIN vehicles v ON v.id = mr.vehicle_id
      ORDER BY
        CASE mr.status
          WHEN 'overdue' THEN 0
          WHEN 'pending' THEN 1
          WHEN 'completed' THEN 2
          ELSE 3
        END,
        mr.due_date ASC NULLS LAST
    `;

    return NextResponse.json(records);
  } catch (err) {
    console.error("[GET /api/admin/maintenance]", err);
    return NextResponse.json(
      { error: "Failed to load maintenance records", detail: getErrorMessage(err) },
      { status: 500 }
    );
  }
}
