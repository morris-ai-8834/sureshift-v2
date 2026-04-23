/**
 * app/admin/maintenance/page.tsx
 *
 * Maintenance — /admin/maintenance
 * All maintenance records across fleet with filter tabs.
 */

export const dynamic = 'force-dynamic';
import { getDB } from "@/lib/db";
import MaintenanceTable from "./MaintenanceTable";

async function getMaintenanceRecords() {
  try {
    const sql = getDB();
    const rows = await sql`
      SELECT m.*, v.year, v.make, v.model, v.slug
      FROM maintenance_records m
      LEFT JOIN vehicles v ON v.id = m.vehicle_id
      ORDER BY
        CASE WHEN m.due_date < NOW() AND m.status != 'completed' THEN 0
             WHEN m.due_date < NOW() + INTERVAL '14 days' AND m.status != 'completed' THEN 1
             ELSE 2 END,
        m.due_date ASC NULLS LAST
    `;
    return rows;
  } catch (err) {
    console.error("[AdminMaint]", err);
    return [];
  }
}

export default async function MaintenancePage() {
  const records = await getMaintenanceRecords();

  const overdue = (records as Record<string,unknown>[]).filter((r) => String(r.status ?? "") === "overdue").length;

  return (
    <div className="p-4 lg:p-8">
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
