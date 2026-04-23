/**
 * app/admin/fleet/page.tsx
 *
 * Fleet Overview — /admin/fleet
 * Server-rendered. Fetches all vehicles with fleet management fields.
 */

import FleetTable from "./FleetTable";
import { getDB } from "@/lib/db";

async function getFleet() {
  try {
    const sql = getDB();
    const rows = await sql`
      SELECT v.*,
        (SELECT completed_mileage FROM maintenance_records
         WHERE vehicle_id = v.id AND service_type ILIKE '%oil%' AND status = 'completed'
         ORDER BY completed_date DESC LIMIT 1) as last_oil_mileage,
        (SELECT MAX(return_datetime) FROM reservations WHERE vehicle_id = v.id) as last_rental
      FROM vehicles v
      ORDER BY v.vehicle_code ASC
    `;
    return rows;
  } catch (err) {
    console.error("[AdminFleet]", err);
    return [];
  }
}

export default async function AdminFleetPage() {
  const vehicles = await getFleet();

  return (
    <div className="p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Fleet</h1>
          <p className="text-[#6b7280] text-sm mt-0.5">{vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""} in fleet</p>
        </div>
      </div>

      {vehicles.length === 0 ? (
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-12 text-center">
          <p className="text-[#6b7280]">No vehicles found</p>
        </div>
      ) : (
        <FleetTable vehicles={vehicles} />
      )}
    </div>
  );
}
