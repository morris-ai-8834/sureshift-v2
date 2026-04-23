/**
 * app/admin/maintenance/page.tsx
 *
 * Maintenance — /admin/maintenance
 * All maintenance records across fleet with filter tabs.
 */

import MaintenanceTable from "./MaintenanceTable";

async function getMaintenanceRecords() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/admin/maintenance`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function MaintenancePage() {
  const records = await getMaintenanceRecords();

  const overdue = records.filter((r: { status: string }) => r.status === "overdue").length;

  return (
    <div className="p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Maintenance</h1>
            {overdue > 0 && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold">
                {overdue} overdue
              </span>
            )}
          </div>
          <p className="text-[#6b7280] text-sm mt-0.5">{records.length} records across {5} vehicles</p>
        </div>
        <button className="px-4 py-2 bg-[#2952CC] text-white rounded-lg text-sm font-medium hover:bg-[#3561e0] transition-colors">
          + Add Record
        </button>
      </div>

      <MaintenanceTable records={records} />
    </div>
  );
}
