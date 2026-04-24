/**
 * app/admin/pnl/page.tsx — Vehicle P&L Module
 */

import Link from "next/link";
import { getDB } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getPnLData() {
  try {
    const sql = getDB();

    const [vehicles, revenueRes, expenseRes] = await Promise.all([
      sql`SELECT id, year, make, model, slug, color, status FROM vehicles ORDER BY year DESC, make ASC`,
      sql`
        SELECT vehicle_id,
               COALESCE(SUM(estimated_rental_subtotal::numeric), 0) AS revenue,
               COUNT(*) AS rental_count
        FROM reservations
        WHERE reservation_status NOT IN ('cancelled')
        GROUP BY vehicle_id`,
      sql`
        SELECT vehicle_id,
               COALESCE(SUM(amount::numeric), 0) AS expenses
        FROM vehicle_expenses
        GROUP BY vehicle_id`,
    ]);

    const revMap: Record<string, { revenue: number; rental_count: number }> = {};
    for (const r of revenueRes as Record<string, unknown>[]) {
      revMap[String(r.vehicle_id)] = {
        revenue: parseFloat(String(r.revenue)) || 0,
        rental_count: parseInt(String(r.rental_count)) || 0,
      };
    }
    const expMap: Record<string, number> = {};
    for (const e of expenseRes as Record<string, unknown>[]) {
      expMap[String(e.vehicle_id)] = parseFloat(String(e.expenses)) || 0;
    }

    const pnl = (vehicles as Record<string, unknown>[]).map((v) => {
      const id = String(v.id);
      const revenue = revMap[id]?.revenue ?? 0;
      const expenses = expMap[id] ?? 0;
      const profit = revenue - expenses;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
      return {
        id,
        name: `${String(v.year)} ${String(v.make)} ${String(v.model)}`,
        slug: String(v.slug ?? ""),
        color: String(v.color ?? ""),
        revenue,
        expenses,
        profit,
        margin,
        rental_count: revMap[id]?.rental_count ?? 0,
      };
    });

    pnl.sort((a, b) => b.profit - a.profit);

    const totalRevenue = pnl.reduce((s, v) => s + v.revenue, 0);
    const totalExpenses = pnl.reduce((s, v) => s + v.expenses, 0);
    const totalProfit = totalRevenue - totalExpenses;

    const mostProfitable = pnl[0];
    const leastProfitable = pnl[pnl.length - 1];

    return { pnl, totalRevenue, totalExpenses, totalProfit, mostProfitable, leastProfitable };
  } catch (err) {
    console.error("[AdminPnL]", err);
    return { pnl: [], totalRevenue: 0, totalExpenses: 0, totalProfit: 0, mostProfitable: null, leastProfitable: null };
  }
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default async function AdminPnLPage() {
  const data = await getPnLData();

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Vehicle P&amp;L</h1>
        <p className="text-gray-500 text-sm mt-0.5">Profit &amp; loss by vehicle</p>
      </div>

      {/* Fleet summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total Fleet Revenue", value: `$${fmt(data.totalRevenue)}`, color: "text-emerald-400" },
          { label: "Total Fleet Expenses", value: `$${fmt(data.totalExpenses)}`, color: "text-red-400" },
          { label: "Total Fleet Profit", value: `$${fmt(data.totalProfit)}`, color: data.totalProfit >= 0 ? "text-emerald-400" : "text-red-400" },
          { label: "Most Profitable", value: data.mostProfitable?.name ?? "—", color: "text-emerald-300", small: true },
          { label: "Least Profitable", value: data.leastProfitable?.name ?? "—", color: "text-red-300", small: true },
        ].map((card) => (
          <div key={card.label} className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4">
            <p className="text-gray-500 text-xs font-medium mb-1">{card.label}</p>
            <p className={`font-black ${card.small ? "text-sm" : "text-2xl"} ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Per-vehicle cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.pnl.map((v) => {
          const maxBar = Math.max(v.revenue, v.expenses, 1);
          const revPct = (v.revenue / maxBar) * 100;
          const expPct = (v.expenses / maxBar) * 100;
          const isProfit = v.profit >= 0;

          return (
            <div key={v.id} className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white font-bold text-sm">{v.name}</p>
                  {v.color && (
                    <p className="text-gray-500 text-xs mt-0.5">{v.color}</p>
                  )}
                  <p className="text-gray-600 text-xs mt-0.5">{v.rental_count} rental{v.rental_count !== 1 ? "s" : ""}</p>
                </div>
                <span className={`text-xs font-black px-2 py-1 rounded-lg ${isProfit ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                  {isProfit ? "+" : ""}${fmt(v.profit)}
                </span>
              </div>

              {/* Metric rows */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Revenue</span>
                  <span className="text-emerald-400 font-semibold">${fmt(v.revenue)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Expenses</span>
                  <span className="text-red-400 font-semibold">${fmt(v.expenses)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Margin</span>
                  <span className={`font-semibold ${isProfit ? "text-emerald-400" : "text-red-400"}`}>{v.margin.toFixed(1)}%</span>
                </div>
              </div>

              {/* Mini bar chart */}
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-[10px] w-14">Revenue</span>
                  <div className="flex-1 bg-[#1f2937] rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${revPct}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-[10px] w-14">Expenses</span>
                  <div className="flex-1 bg-[#1f2937] rounded-full h-1.5">
                    <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${expPct}%` }} />
                  </div>
                </div>
              </div>

              <Link
                href={`/admin/fleet/${v.slug || v.id}`}
                className="text-xs text-[#2952CC] hover:text-blue-400 font-semibold"
              >
                View vehicle →
              </Link>
            </div>
          );
        })}
      </div>

      {data.pnl.length === 0 && (
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-12 text-center">
          <p className="text-gray-400">No vehicles found.</p>
        </div>
      )}
    </div>
  );
}
