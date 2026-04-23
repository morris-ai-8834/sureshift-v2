/**
 * app/admin/page.tsx
 *
 * Executive Dashboard — /admin
 * Server-rendered directly from DB — no fetch, no base URL issues.
 */

import Link from "next/link";
import { getDB } from "@/lib/db";
import Icons from "../components/Icons";

// Force dynamic rendering so DATABASE_URL is available at runtime
export const dynamic = 'force-dynamic';

// ─── Direct DB queries ────────────────────────────────────────────

async function getDashboardData() {
  try {
    const sql = getDB();

    const [
      vehicleStats,
      revenueStats,
      pendingDeposits,
      pendingSigs,
      maintenanceDue,
      recentReservations,
      monthlyRevenue,
    ] = await Promise.all([
      // Vehicle counts
      sql`SELECT
        COUNT(*) FILTER (WHERE is_bookable = TRUE) as total,
        COUNT(*) FILTER (WHERE status = 'available') as available,
        COUNT(*) FILTER (WHERE status = 'active_rental' OR reservation_status IS NOT NULL) as active,
        COUNT(*) FILTER (WHERE status = 'maintenance') as maintenance
        FROM vehicles`,

      // Revenue this month
      sql`SELECT
        COALESCE(SUM(estimated_rental_subtotal), 0) as month_revenue,
        COALESCE(SUM(deposit_paid_amount), 0) as deposits_collected,
        COUNT(*) as total_reservations
        FROM reservations
        WHERE created_at >= date_trunc('month', NOW())`,

      // Pending deposits
      sql`SELECT COUNT(*) as count FROM reservations WHERE deposit_status = 'not_paid' AND reservation_status NOT IN ('cancelled', 'expired')`,

      // Pending signatures
      sql`SELECT COUNT(*) as count FROM reservations WHERE signature_status IN ('pending', 'not_requested') AND deposit_status = 'paid'`,

      // Maintenance due soon (next 14 days) or overdue
      sql`SELECT
        COUNT(*) FILTER (WHERE due_date <= NOW() + INTERVAL '14 days' AND status != 'completed') as due_soon,
        COUNT(*) FILTER (WHERE due_date < NOW() AND status != 'completed') as overdue
        FROM maintenance_records`,

      // Recent reservations with customer + vehicle
      sql`SELECT r.reservation_code, r.reservation_status, r.estimated_rental_subtotal, r.deposit_status,
          r.pickup_datetime, r.return_datetime, r.created_at,
          c.first_name, c.last_name,
          v.make, v.model, v.year
        FROM reservations r
        LEFT JOIN customers c ON c.id = r.customer_id
        LEFT JOIN vehicles v ON v.id = r.vehicle_id
        ORDER BY r.created_at DESC LIMIT 8`,

      // Monthly revenue last 6 months
      sql`SELECT
        to_char(date_trunc('month', created_at), 'Mon') as month,
        COALESCE(SUM(estimated_rental_subtotal), 0) as revenue
        FROM reservations
        WHERE created_at >= NOW() - INTERVAL '6 months'
        GROUP BY date_trunc('month', created_at)
        ORDER BY date_trunc('month', created_at) ASC`,
    ]);

    const vehicles = vehicleStats[0] as Record<string, unknown>;
    const revenue = revenueStats[0] as Record<string, unknown>;
    const maint = maintenanceDue[0] as Record<string, unknown>;

    const totalVehicles = Number(vehicles.total) || 0;
    const activeRentals = Number(vehicles.active) || 0;
    const utilization = totalVehicles > 0 ? Math.round((activeRentals / totalVehicles) * 100) : 0;

    return {
      totalVehicles,
      available: Number(vehicles.available) || 0,
      activeRentals,
      maintenance: Number(vehicles.maintenance) || 0,
      utilization,
      monthRevenue: Number(revenue.month_revenue) || 0,
      totalReservations: Number(revenue.total_reservations) || 0,
      pendingDeposits: Number((pendingDeposits[0] as Record<string, unknown>).count) || 0,
      pendingSigs: Number((pendingSigs[0] as Record<string, unknown>).count) || 0,
      maintenanceDueSoon: Number(maint.due_soon) || 0,
      maintenanceOverdue: Number(maint.overdue) || 0,
      recentReservations: recentReservations as Record<string, unknown>[],
      monthlyRevenue: monthlyRevenue as Record<string, unknown>[],
    };
  } catch (err) {
    console.error("[AdminDashboard] DB error:", err);
    return null;
  }
}

// ─── Status chip ─────────────────────────────────────────────────

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    awaiting_deposit: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    deposit_paid: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    active: "bg-[#2952CC]/20 text-[#6b9fff] border-[#2952CC]/30",
    completed: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  const cls = map[status] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20";
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold border ${cls}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ─── Bar chart (inline SVG) ───────────────────────────────────────

function RevenueBarChart({ data }: { data: Record<string, unknown>[] }) {
  if (!data.length) return <div className="text-gray-600 text-sm text-center py-8">No revenue data yet</div>;
  const max = Math.max(...data.map(d => Number(d.revenue)), 1);
  const barWidth = Math.floor(280 / data.length) - 8;

  return (
    <div className="flex items-end gap-2 h-32 px-2">
      {data.map((d, i) => {
        const h = Math.max(4, Math.round((Number(d.revenue) / max) * 112));
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div className="text-[10px] text-gray-500">${Number(d.revenue) > 0 ? Math.round(Number(d.revenue)) : ""}</div>
            <div
              className="bg-[#2952CC]/70 hover:bg-[#2952CC] transition-colors rounded-t-sm w-full"
              style={{ height: `${h}px` }}
              title={`${String(d.month)}: $${Number(d.revenue).toFixed(0)}`}
            />
            <div className="text-[10px] text-gray-500">{String(d.month)}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400 text-sm">
          Failed to load dashboard data. Check database connection.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Operations Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">SureShift Rentals · Houston & Dallas</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {[
          { label: "Revenue MTD", value: `$${data.monthRevenue.toLocaleString()}`, sub: `${data.totalReservations} reservations`, Icon: Icons.CreditCard, accent: "text-emerald-400" },
          { label: "Active Rentals", value: data.activeRentals, sub: `${data.utilization}% utilization`, Icon: Icons.Car, accent: "text-blue-400" },
          { label: "Available", value: data.available, sub: `of ${data.totalVehicles} total`, Icon: Icons.Check, accent: "text-white" },
          { label: "Pending Deposits", value: data.pendingDeposits, sub: "need payment", Icon: Icons.CreditCard, accent: data.pendingDeposits > 0 ? "text-amber-400" : "text-white" },
          { label: "Maint Due Soon", value: data.maintenanceDueSoon, sub: `${data.maintenanceOverdue} overdue`, Icon: Icons.Wrench, accent: data.maintenanceOverdue > 0 ? "text-red-400" : data.maintenanceDueSoon > 0 ? "text-amber-400" : "text-white" },
          { label: "Utilization", value: `${data.utilization}%`, sub: `${data.activeRentals} active`, Icon: Icons.Speedometer, accent: data.utilization > 60 ? "text-emerald-400" : "text-white" },
        ].map((card) => (
          <div key={card.label} className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 relative">
            {card.Icon && (
              <div className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-[#1f2937] flex items-center justify-center">
                <card.Icon className="w-3.5 h-3.5 text-gray-500" />
              </div>
            )}
            <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-2">{card.label}</p>
            <p className={`text-2xl font-black mb-0.5 ${card.accent}`}>{card.value}</p>
            <p className="text-gray-600 text-[11px]">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-[#111827] border border-[#1f2937] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-white">Monthly Revenue</h2>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Last 6 months</span>
          </div>
          <RevenueBarChart data={data.monthlyRevenue} />
        </div>

        {/* Fleet status */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-6">
          <h2 className="text-sm font-bold text-white mb-6">Fleet Status</h2>
          <div className="space-y-3">
            {[
              { label: "Available", count: data.available, color: "bg-emerald-400" },
              { label: "Active Rental", count: data.activeRentals, color: "bg-[#2952CC]" },
              { label: "Maintenance", count: data.maintenance, color: "bg-amber-400" },
              { label: "Other", count: Math.max(0, data.totalVehicles - data.available - data.activeRentals - data.maintenance), color: "bg-gray-600" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="text-sm text-gray-400 flex-1">{item.label}</span>
                <span className="text-sm font-bold text-white">{item.count}</span>
                <div className="w-20 h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${data.totalVehicles ? (item.count / data.totalVehicles) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action queue */}
      {(data.pendingDeposits > 0 || data.pendingSigs > 0 || data.maintenanceOverdue > 0) && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-white mb-3">Action Required</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.pendingDeposits > 0 && (
              <Link href="/admin/reservations" className="bg-amber-500/08 border border-amber-500/20 rounded-xl p-4 hover:bg-amber-500/12 transition-colors flex items-center justify-between group">
                <div>
                  <p className="text-amber-400 font-bold text-lg">{data.pendingDeposits}</p>
                  <p className="text-amber-400/70 text-xs">Awaiting deposit</p>
                </div>
                <Icons.ArrowRight className="w-4 h-4 text-amber-400/50 group-hover:text-amber-400 transition-colors" />
              </Link>
            )}
            {data.pendingSigs > 0 && (
              <Link href="/admin/reservations" className="bg-blue-500/08 border border-blue-500/20 rounded-xl p-4 hover:bg-blue-500/12 transition-colors flex items-center justify-between group">
                <div>
                  <p className="text-blue-400 font-bold text-lg">{data.pendingSigs}</p>
                  <p className="text-blue-400/70 text-xs">Awaiting signature</p>
                </div>
                <Icons.ArrowRight className="w-4 h-4 text-blue-400/50 group-hover:text-blue-400 transition-colors" />
              </Link>
            )}
            {data.maintenanceOverdue > 0 && (
              <Link href="/admin/maintenance" className="bg-red-500/08 border border-red-500/20 rounded-xl p-4 hover:bg-red-500/12 transition-colors flex items-center justify-between group">
                <div>
                  <p className="text-red-400 font-bold text-lg">{data.maintenanceOverdue}</p>
                  <p className="text-red-400/70 text-xs">Maintenance overdue</p>
                </div>
                <Icons.ArrowRight className="w-4 h-4 text-red-400/50 group-hover:text-red-400 transition-colors" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Recent reservations */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f2937]">
          <h2 className="text-sm font-bold text-white">Recent Reservations</h2>
          <Link href="/admin/reservations" className="text-[#2952CC] text-xs font-semibold hover:text-blue-400 transition-colors">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-[11px] uppercase tracking-wider border-b border-[#1f2937]">
                <th className="text-left px-6 py-3 font-semibold">Code</th>
                <th className="text-left px-6 py-3 font-semibold">Customer</th>
                <th className="text-left px-6 py-3 font-semibold">Vehicle</th>
                <th className="text-left px-6 py-3 font-semibold">Status</th>
                <th className="text-right px-6 py-3 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]">
              {data.recentReservations.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-gray-600 py-8">No reservations yet</td></tr>
              ) : data.recentReservations.map((r) => (
                <tr key={String(r.reservation_code)} className="hover:bg-[#1f2937]/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-[#2952CC] text-xs">{String(r.reservation_code)}</td>
                  <td className="px-6 py-4 text-gray-300">{r.first_name ? `${String(r.first_name)} ${String(r.last_name)}` : "—"}</td>
                  <td className="px-6 py-4 text-gray-400">{r.year ? `${String(r.year)} ${String(r.make)} ${String(r.model)}` : "—"}</td>
                  <td className="px-6 py-4"><StatusChip status={String(r.reservation_status)} /></td>
                  <td className="px-6 py-4 text-right text-white font-semibold">
                    {r.estimated_rental_subtotal ? `$${Number(r.estimated_rental_subtotal).toFixed(0)}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
