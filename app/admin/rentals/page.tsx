/**
 * app/admin/rentals/page.tsx — Rentals & Sales Module
 * Server-rendered directly from DB.
 */

import Link from "next/link";
import { getDB } from "@/lib/db";

export const dynamic = "force-dynamic";

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Awaiting Deposit", value: "awaiting_deposit" },
];

const STATUS_CHIP: Record<string, string> = {
  awaiting_deposit: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  deposit_paid: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  agreement_sent: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  confirmed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  active: "bg-[#2952CC]/25 text-[#6b9fff] border-[#2952CC]/35",
  completed: "bg-gray-500/15 text-gray-400 border-gray-500/25",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/25",
};

async function getRentalsData(statusFilter?: string) {
  try {
    const sql = getDB();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [rows, statsRes, vehicleRevRes] = await Promise.all([
      statusFilter
        ? sql`
            SELECT r.*, c.first_name, c.last_name, c.email,
                   v.year, v.make, v.model, v.slug
            FROM reservations r
            LEFT JOIN customers c ON c.id = r.customer_id
            LEFT JOIN vehicles v ON v.id = r.vehicle_id
            WHERE r.reservation_status = ${statusFilter}
            ORDER BY r.created_at DESC`
        : sql`
            SELECT r.*, c.first_name, c.last_name, c.email,
                   v.year, v.make, v.model, v.slug
            FROM reservations r
            LEFT JOIN customers c ON c.id = r.customer_id
            LEFT JOIN vehicles v ON v.id = r.vehicle_id
            ORDER BY r.created_at DESC`,
      sql`
        SELECT
          COALESCE(SUM(CASE WHEN created_at >= ${startOfMonth.toISOString()} THEN estimated_rental_subtotal::numeric END), 0) AS revenue_month,
          COALESCE(SUM(CASE WHEN created_at >= ${startOfWeek.toISOString()} THEN estimated_rental_subtotal::numeric END), 0) AS revenue_week,
          COUNT(CASE WHEN reservation_status = 'active' THEN 1 END) AS active_rentals,
          COUNT(CASE WHEN created_at >= ${startOfMonth.toISOString()} THEN 1 END) AS reservations_month,
          COALESCE(AVG(estimated_rental_subtotal::numeric), 0) AS avg_value,
          COALESCE(AVG(estimated_total_days::numeric), 0) AS avg_days
        FROM reservations
        WHERE reservation_status NOT IN ('cancelled')`,
      sql`
        SELECT v.make, v.model, v.year,
               COALESCE(SUM(r.estimated_rental_subtotal::numeric), 0) AS revenue,
               COUNT(r.id) AS count
        FROM reservations r
        JOIN vehicles v ON v.id = r.vehicle_id
        WHERE r.reservation_status NOT IN ('cancelled')
        GROUP BY v.id, v.make, v.model, v.year
        ORDER BY revenue DESC
        LIMIT 8`,
    ]);

    const stats = statsRes[0] as Record<string, unknown>;
    const revenueMonth = parseFloat(String(stats.revenue_month)) || 0;
    const revenueWeek = parseFloat(String(stats.revenue_week)) || 0;
    const activeRentals = parseInt(String(stats.active_rentals)) || 0;
    const reservationsMonth = parseInt(String(stats.reservations_month)) || 0;
    const avgValue = parseFloat(String(stats.avg_value)) || 0;
    const avgDays = parseFloat(String(stats.avg_days)) || 0;

    // Repeat renter rate
    const repeatRes = await sql`
      SELECT COUNT(*) AS total, COUNT(CASE WHEN cnt > 1 THEN 1 END) AS repeats
      FROM (SELECT customer_id, COUNT(*) AS cnt FROM reservations GROUP BY customer_id) t`;
    const repeatRow = repeatRes[0] as Record<string, unknown>;
    const total = parseInt(String(repeatRow.total)) || 0;
    const repeats = parseInt(String(repeatRow.repeats)) || 0;
    const repeatRate = total > 0 ? Math.round((repeats / total) * 100) : 0;

    return {
      rows: rows as Record<string, unknown>[],
      revenueMonth,
      revenueWeek,
      activeRentals,
      reservationsMonth,
      avgValue,
      avgDays,
      repeatRate,
      vehicleRevenue: vehicleRevRes as Record<string, unknown>[],
    };
  } catch (err) {
    console.error("[AdminRentals]", err);
    return {
      rows: [],
      revenueMonth: 0,
      revenueWeek: 0,
      activeRentals: 0,
      reservationsMonth: 0,
      avgValue: 0,
      avgDays: 0,
      repeatRate: 0,
      vehicleRevenue: [],
    };
  }
}

export default async function AdminRentalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const data = await getRentalsData(status);
  const maxRevenue = Math.max(...data.vehicleRevenue.map((v) => parseFloat(String(v.revenue)) || 0), 1);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Rentals & Sales</h1>
        <p className="text-gray-500 text-sm mt-0.5">Revenue tracking and rental performance</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Revenue This Month", value: `$${data.revenueMonth.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, color: "text-emerald-400" },
          { label: "Revenue This Week", value: `$${data.revenueWeek.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, color: "text-blue-400" },
          { label: "Active Rentals", value: String(data.activeRentals), color: "text-[#6b9fff]" },
          { label: "Avg Rental Value", value: `$${data.avgValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, color: "text-white" },
          { label: "Reservations / Month", value: String(data.reservationsMonth), color: "text-white" },
        ].map((card) => (
          <div key={card.label} className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4">
            <p className="text-gray-500 text-xs font-medium mb-1">{card.label}</p>
            <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Sales by Vehicle chart */}
      {data.vehicleRevenue.length > 0 && (
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Revenue by Vehicle</h2>
          <div className="space-y-3">
            {data.vehicleRevenue.map((v, i) => {
              const rev = parseFloat(String(v.revenue)) || 0;
              const pct = (rev / maxRevenue) * 100;
              const label = `${String(v.year)} ${String(v.make)} ${String(v.model)}`;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs w-36 truncate flex-shrink-0">{label}</span>
                  <div className="flex-1 bg-[#1f2937] rounded-full h-2.5">
                    <div
                      className="bg-[#2952CC] h-2.5 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-white text-xs font-semibold w-16 text-right">
                    ${rev.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Sales This Week", value: `$${data.revenueWeek.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
          { label: "Sales This Month", value: `$${data.revenueMonth.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
          { label: "Avg Rental Duration", value: `${data.avgDays.toFixed(1)} days` },
          { label: "Repeat Renter Rate", value: `${data.repeatRate}%` },
        ].map((m) => (
          <div key={m.label} className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4">
            <p className="text-gray-500 text-xs font-medium mb-1">{m.label}</p>
            <p className="text-white text-xl font-black">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {STATUS_TABS.map((tab) => {
          const active = (status ?? "") === tab.value;
          const href = tab.value ? `/admin/rentals?status=${tab.value}` : "/admin/rentals";
          return (
            <Link
              key={tab.value}
              href={href}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                active
                  ? "bg-[#2952CC] text-white"
                  : "bg-[#111827] text-gray-400 border border-[#1f2937] hover:text-white hover:border-gray-600"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      {data.rows.length === 0 ? (
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-12 text-center">
          <p className="text-gray-400">No rentals found</p>
        </div>
      ) : (
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-[#1f2937]">
                  {["Code", "Customer", "Vehicle", "Start", "End", "Days", "Rate", "Status", "Revenue", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-gray-500 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]">
                {data.rows.map((r) => {
                  const pickup = r.pickup_datetime ? new Date(String(r.pickup_datetime)) : null;
                  const ret = r.return_datetime ? new Date(String(r.return_datetime)) : null;
                  const days = r.estimated_total_days ? String(r.estimated_total_days) : "—";
                  const rate = r.estimated_daily_rate ? `$${Number(r.estimated_daily_rate).toFixed(0)}/day` : "—";
                  const rev = r.estimated_rental_subtotal ? `$${Number(r.estimated_rental_subtotal).toFixed(0)}` : "—";
                  return (
                    <tr key={String(r.id)} className="hover:bg-[#1f2937]/50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono text-[#2952CC] text-xs font-semibold">{String(r.reservation_code)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-white text-sm font-medium">
                          {r.first_name ? `${String(r.first_name)} ${String(r.last_name)}` : "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-gray-300 text-sm">
                        {r.year ? `${String(r.year)} ${String(r.make)} ${String(r.model)}` : "—"}
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {pickup ? pickup.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {ret ? ret.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs">{days}</td>
                      <td className="px-5 py-4 text-gray-400 text-xs">{rate}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-semibold border ${STATUS_CHIP[String(r.reservation_status)] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                          {String(r.reservation_status).replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-white font-semibold text-sm">{rev}</td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/portal/${String(r.reservation_code)}`}
                          className="text-xs text-[#2952CC] hover:text-blue-400 font-semibold whitespace-nowrap"
                          target="_blank"
                        >
                          Portal →
                        </Link>
                      </td>
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
