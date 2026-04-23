/**
 * app/admin/fleet/page.tsx
 *
 * Fleet Overview — /admin/fleet
 * Server-rendered. Fetches all vehicles with fleet management fields.
 */

import FleetTable from "./FleetTable";

async function getFleet() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/admin/fleet`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
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
