/**
 * app/admin/expenses/page.tsx — Expenses Module
 */

import { getDB } from "@/lib/db";
import AddExpenseForm from "./AddExpenseForm";

export const dynamic = "force-dynamic";

const CATEGORIES = ["oil_change", "insurance", "repair", "tracker", "detailing", "tires", "registration", "misc"];

async function getExpensesData() {
  try {
    const sql = getDB();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [expenses, vehicles, statsRes, byCategoryRes, highestVehicleRes] = await Promise.all([
      sql`
        SELECT e.*, v.year, v.make, v.model
        FROM vehicle_expenses e
        LEFT JOIN vehicles v ON v.id = e.vehicle_id
        ORDER BY e.date DESC, e.created_at DESC`,
      sql`SELECT id, year, make, model FROM vehicles ORDER BY year DESC, make ASC`,
      sql`
        SELECT
          COALESCE(SUM(CASE WHEN date >= ${startOfMonth.toISOString().slice(0, 10)} THEN amount::numeric END), 0) AS month_total,
          COALESCE(SUM(CASE WHEN date >= ${startOfYear.toISOString().slice(0, 10)} THEN amount::numeric END), 0) AS year_total,
          COALESCE(SUM(CASE WHEN renter_caused = false THEN amount::numeric END), 0) AS unreimbursed
        FROM vehicle_expenses`,
      sql`
        SELECT category,
               COALESCE(SUM(amount::numeric), 0) AS total
        FROM vehicle_expenses
        GROUP BY category`,
      sql`
        SELECT v.year, v.make, v.model,
               COALESCE(SUM(e.amount::numeric), 0) AS total
        FROM vehicle_expenses e
        JOIN vehicles v ON v.id = e.vehicle_id
        GROUP BY v.id, v.year, v.make, v.model
        ORDER BY total DESC
        LIMIT 1`,
    ]);

    const stats = statsRes[0] as Record<string, unknown>;
    const catMap: Record<string, number> = {};
    for (const row of byCategoryRes as Record<string, unknown>[]) {
      catMap[String(row.category)] = parseFloat(String(row.total)) || 0;
    }
    const maxCat = Math.max(...Object.values(catMap), 1);

    const highestVehicle = (highestVehicleRes as Record<string, unknown>[])[0];

    return {
      expenses: expenses as Record<string, unknown>[],
      vehicles: vehicles as { id: string; year: number; make: string; model: string }[],
      monthTotal: parseFloat(String(stats.month_total)) || 0,
      yearTotal: parseFloat(String(stats.year_total)) || 0,
      unreimbursed: parseFloat(String(stats.unreimbursed)) || 0,
      catMap,
      maxCat,
      highestVehicle: highestVehicle as Record<string, unknown> | undefined,
    };
  } catch (err) {
    console.error("[AdminExpenses]", err);
    return { expenses: [], vehicles: [], monthTotal: 0, yearTotal: 0, unreimbursed: 0, catMap: {}, maxCat: 1, highestVehicle: undefined };
  }
}

export default async function AdminExpensesPage() {
  const data = await getExpensesData();

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Expenses</h1>
        <p className="text-gray-500 text-sm mt-0.5">Vehicle cost tracking and analysis</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4">
          <p className="text-gray-500 text-xs font-medium mb-1">Expenses This Month</p>
          <p className="text-red-400 text-2xl font-black">${data.monthTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4">
          <p className="text-gray-500 text-xs font-medium mb-1">Expenses This Year</p>
          <p className="text-white text-2xl font-black">${data.yearTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4">
          <p className="text-gray-500 text-xs font-medium mb-1">Highest Cost Vehicle</p>
          <p className="text-white text-lg font-black">
            {data.highestVehicle
              ? `${String(data.highestVehicle.year)} ${String(data.highestVehicle.make)} ${String(data.highestVehicle.model)}`
              : "—"}
          </p>
          {data.highestVehicle && (
            <p className="text-red-400 text-sm font-semibold">${(parseFloat(String(data.highestVehicle.total)) || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
          )}
        </div>
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4">
          <p className="text-gray-500 text-xs font-medium mb-1">Unreimbursed Damage</p>
          <p className="text-amber-400 text-2xl font-black">${data.unreimbursed.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
        </div>
      </div>

      {/* Expenses by category (horizontal bar chart) */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Expenses by Category</h2>
        <div className="space-y-3">
          {CATEGORIES.map((cat) => {
            const val = data.catMap[cat] ?? 0;
            const pct = (val / data.maxCat) * 100;
            return (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-gray-400 text-xs w-24 flex-shrink-0">{cat.replace(/_/g, " ")}</span>
                <div className="flex-1 bg-[#1f2937] rounded-full h-2.5">
                  <div
                    className="bg-red-500 h-2.5 rounded-full transition-all"
                    style={{ width: val > 0 ? `${pct}%` : "0%" }}
                  />
                </div>
                <span className="text-white text-xs font-semibold w-16 text-right">
                  ${val.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add expense form (client component) */}
      <AddExpenseForm vehicles={data.vehicles} />

      {/* Expenses table */}
      {data.expenses.length === 0 ? (
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-12 text-center">
          <p className="text-gray-400">No expenses recorded yet.</p>
        </div>
      ) : (
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-[#1f2937]">
                  {["Date", "Vehicle", "Category", "Vendor", "Amount", "Renter Caused", "Notes"].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-gray-500 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]">
                {data.expenses.map((e) => {
                  const isRenterCaused = e.renter_caused === true;
                  return (
                    <tr
                      key={String(e.id)}
                      className={`transition-colors ${isRenterCaused ? "bg-red-900/10 hover:bg-red-900/20" : "hover:bg-[#1f2937]/50"}`}
                    >
                      <td className="px-5 py-4 text-gray-300 text-xs whitespace-nowrap">{String(e.date ?? "").slice(0, 10)}</td>
                      <td className="px-5 py-4 text-gray-300 text-sm">
                        {e.year ? `${String(e.year)} ${String(e.make)} ${String(e.model)}` : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className="bg-[#1f2937] text-gray-300 px-2 py-0.5 rounded-md text-xs">
                          {String(e.category ?? "").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-sm">{String(e.vendor ?? "—")}</td>
                      <td className="px-5 py-4 text-white font-semibold text-sm">
                        ${(parseFloat(String(e.amount)) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-4">
                        {isRenterCaused ? (
                          <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-md text-xs font-semibold">Yes</span>
                        ) : (
                          <span className="text-gray-600 text-xs">No</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs max-w-[200px] truncate">{String(e.notes ?? "—")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
