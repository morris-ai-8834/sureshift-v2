/**
 * app/admin/mileage/page.tsx — Mileage & Trips Module
 */

import { getDB } from "@/lib/db";
import MileageCSVUpload from "./MileageClient";

export const dynamic = "force-dynamic";

async function getMileageData() {
  try {
    const sql = getDB();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [trips, vehicles, statsRes, byVehicleRes] = await Promise.all([
      sql`
        SELECT t.*, v.year, v.make, v.model
        FROM trips t
        LEFT JOIN vehicles v ON v.id = t.vehicle_id
        ORDER BY t.trip_start DESC NULLS LAST
        LIMIT 100`,
      sql`SELECT id, year, make, model FROM vehicles ORDER BY year DESC, make ASC`,
      sql`
        SELECT
          COALESCE(SUM(CASE WHEN trip_start >= ${startOfMonth.toISOString()} THEN miles::numeric END), 0) AS miles_month,
          COALESCE(SUM(CASE WHEN trip_start >= ${startOfWeek.toISOString()} THEN miles::numeric END), 0) AS miles_week,
          COALESCE(SUM(miles::numeric), 0) AS miles_all,
          COALESCE(AVG(miles::numeric), 0) AS avg_miles
        FROM trips`,
      sql`
        SELECT v.year, v.make, v.model,
               COALESCE(SUM(t.miles::numeric), 0) AS total_miles,
               COUNT(t.id) AS trip_count
        FROM trips t
        JOIN vehicles v ON v.id = t.vehicle_id
        GROUP BY v.id, v.year, v.make, v.model
        ORDER BY total_miles DESC`,
    ]);

    const stats = statsRes[0] as Record<string, unknown>;
    const milesMonth = parseFloat(String(stats.miles_month)) || 0;
    const milesWeek = parseFloat(String(stats.miles_week)) || 0;
    const milesAll = parseFloat(String(stats.miles_all)) || 0;
    const avgMiles = parseFloat(String(stats.avg_miles)) || 0;
    const maxMiles = Math.max(...(byVehicleRes as Record<string, unknown>[]).map((v) => parseFloat(String(v.total_miles)) || 0), 1);

    return {
      trips: trips as Record<string, unknown>[],
      vehicles: vehicles as { id: string; year: number; make: string; model: string }[],
      milesMonth,
      milesWeek,
      milesAll,
      avgMiles,
      byVehicle: byVehicleRes as Record<string, unknown>[],
      maxMiles,
    };
  } catch (err) {
    console.error("[AdminMileage]", err);
    return { trips: [], vehicles: [], milesMonth: 0, milesWeek: 0, milesAll: 0, avgMiles: 0, byVehicle: [], maxMiles: 1 };
  }
}

export default async function AdminMileagePage() {
  const data = await getMileageData();

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Mileage &amp; Trips</h1>
        <p className="text-gray-500 text-sm mt-0.5">Trip log and odometer tracking</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Miles This Month", value: data.milesMonth.toLocaleString("en-US", { maximumFractionDigits: 0 }) },
          { label: "Miles This Week", value: data.milesWeek.toLocaleString("en-US", { maximumFractionDigits: 0 }) },
          { label: "Avg Miles / Rental", value: data.avgMiles.toLocaleString("en-US", { maximumFractionDigits: 0 }) },
          { label: "Fleet Miles All Time", value: data.milesAll.toLocaleString("en-US", { maximumFractionDigits: 0 }) },
        ].map((card) => (
          <div key={card.label} className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4">
            <p className="text-gray-500 text-xs font-medium mb-1">{card.label}</p>
            <p className="text-white text-2xl font-black">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Miles by vehicle */}
      {data.byVehicle.length > 0 && (
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Miles by Vehicle</h2>
          <div className="space-y-3">
            {data.byVehicle.map((v, i) => {
              const miles = parseFloat(String(v.total_miles)) || 0;
              const pct = (miles / data.maxMiles) * 100;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs w-36 truncate flex-shrink-0">
                    {String(v.year)} {String(v.make)} {String(v.model)}
                  </span>
                  <div className="flex-1 bg-[#1f2937] rounded-full h-2.5">
                    <div className="bg-[#2952CC] h-2.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-white text-xs font-semibold w-20 text-right">
                    {miles.toLocaleString("en-US", { maximumFractionDigits: 0 })} mi
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CSV Upload */}
      <MileageCSVUpload vehicles={data.vehicles} />

      {/* Recent trips table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1f2937]">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Recent Trips</h2>
        </div>
        {data.trips.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400">No trips recorded yet. Upload a Bouncie CSV to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-[#1f2937]">
                  {["Vehicle", "Date", "Start Location", "End Location", "Miles", "Duration", "Source"].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-gray-500 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]">
                {data.trips.map((t) => {
                  const tripStart = t.trip_start ? new Date(String(t.trip_start)) : null;
                  const durationMins = t.duration_minutes ? parseInt(String(t.duration_minutes)) : null;
                  const durationStr = durationMins
                    ? durationMins >= 60
                      ? `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`
                      : `${durationMins}m`
                    : "—";
                  return (
                    <tr key={String(t.id)} className="hover:bg-[#1f2937]/50 transition-colors">
                      <td className="px-5 py-4 text-gray-300 text-sm">
                        {t.year ? `${String(t.year)} ${String(t.make)} ${String(t.model)}` : "—"}
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {tripStart ? tripStart.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs max-w-[150px] truncate">{String(t.start_location ?? "—")}</td>
                      <td className="px-5 py-4 text-gray-500 text-xs max-w-[150px] truncate">{String(t.end_location ?? "—")}</td>
                      <td className="px-5 py-4 text-white font-semibold text-sm">
                        {t.miles ? `${parseFloat(String(t.miles)).toFixed(1)} mi` : "—"}
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs">{durationStr}</td>
                      <td className="px-5 py-4">
                        <span className="bg-[#1f2937] text-gray-400 px-2 py-0.5 rounded-md text-xs">
                          {String(t.source ?? "manual")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
