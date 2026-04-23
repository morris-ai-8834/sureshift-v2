/**
 * app/admin/page.tsx
 *
 * Executive Dashboard — /admin
 * Server-rendered. Fetches all stats from /api/admin/dashboard.
 */

import Link from "next/link";
import type { DashboardStats } from "@/lib/types";
import { formatDollars, formatDatetime } from "@/lib/helpers";
import {
  Car, CreditCard, Calendar, Wrench, TrendUp, Alert,
  CheckCircle, ArrowRight,
} from "../components/Icons";

// ─── Data Fetching ────────────────────────────────────────────────

async function getDashboardStats(): Promise<DashboardStats | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/admin/dashboard`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ─── Stat Card ────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent = "text-white",
  Icon,
  trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  Icon?: React.ComponentType<{ className?: string }>;
  trend?: { dir: "up" | "down"; label: string };
}) {
  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 relative overflow-hidden">
      {Icon && (
        <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[#1f2937] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#6b7280]" />
        </div>
      )}
      <p className="text-[#6b7280] text-xs font-medium uppercase tracking-wider mb-3">{label}</p>
      <p className={`text-3xl font-black mb-1 ${accent}`}>{value}</p>
      {sub && <p className="text-[#6b7280] text-xs">{sub}</p>}
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend.dir === "up" ? "text-emerald-400" : "text-red-400"}`}>
          <TrendUp className={`w-3 h-3 ${trend.dir === "down" ? "rotate-180" : ""}`} />
          {trend.label}
        </div>
      )}
    </div>
  );
}

// ─── Status Chip ─────────────────────────────────────────────────

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:         "bg-yellow-500/15 text-yellow-400",
    awaiting_deposit:"bg-yellow-500/15 text-yellow-400",
    deposit_paid:    "bg-blue-500/15 text-blue-400",
    agreement_sent:  "bg-violet-500/15 text-violet-400",
    confirmed:       "bg-emerald-500/15 text-emerald-400",
    active:          "bg-[#2952CC]/20 text-[#5b82f5]",
    completed:       "bg-[#1f2937] text-[#6b7280]",
    cancelled:       "bg-red-500/15 text-red-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${map[status] ?? "bg-[#1f2937] text-[#6b7280]"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ─── Bar Chart (inline SVG) ───────────────────────────────────────

function RevenueBarChart({ data }: { data: Array<{ month: string; revenue: number }> }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const W = 320;
  const H = 100;
  const barW = 30;
  const gap = (W - data.length * barW) / (data.length + 1);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full">
        {data.map((d, i) => {
          const barH = Math.max(4, (d.revenue / max) * H);
          const x = gap + i * (barW + gap);
          const y = H - barH;
          return (
            <g key={i}>
              <rect
                x={x} y={y} width={barW} height={barH}
                rx={4}
                fill={i === data.length - 1 ? "#2952CC" : "#1f2937"}
                className="transition-all"
              />
              <text
                x={x + barW / 2} y={H + 14}
                textAnchor="middle"
                fill="#6b7280"
                fontSize={9}
              >
                {d.month}
              </text>
              {i === data.length - 1 && (
                <text
                  x={x + barW / 2} y={y - 4}
                  textAnchor="middle"
                  fill="#5b82f5"
                  fontSize={8}
                  fontWeight="600"
                >
                  ${Math.round(d.revenue / 100) * 100 === d.revenue ? (d.revenue / 1000).toFixed(1) + "k" : d.revenue}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Donut Chart (inline SVG) ─────────────────────────────────────

function FleetDonut({ available, active, maintenance }: { available: number; active: number; maintenance: number }) {
  const total = available + active + maintenance || 1;
  const R = 40;
  const cx = 60;
  const cy = 60;
  const circumference = 2 * Math.PI * R;

  const segments = [
    { value: active, color: "#2952CC", label: "Active" },
    { value: available, color: "#10b981", label: "Available" },
    { value: maintenance, color: "#f59e0b", label: "Maintenance" },
  ];

  let offset = 0;
  const arcs = segments.map((seg) => {
    const pct = seg.value / total;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const arc = { ...seg, dasharray: `${dash} ${gap}`, offset: circumference * (1 - offset) - circumference * 0.25 };
    offset += pct;
    return arc;
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 120 120" className="w-28 h-28 flex-shrink-0">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#1f2937" strokeWidth={16} />
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={R}
            fill="none"
            stroke={arc.color}
            strokeWidth={16}
            strokeDasharray={arc.dasharray}
            strokeDashoffset={arc.offset}
            strokeLinecap="butt"
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize={14} fontWeight="bold">{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#6b7280" fontSize={7}>vehicles</text>
      </svg>
      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-[#9ca3af] text-xs">{seg.label}</span>
            <span className="text-white text-xs font-semibold ml-auto pl-3">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  if (!stats) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <p className="text-red-400 font-semibold">⚠ Failed to load dashboard data</p>
          <p className="text-[#6b7280] text-sm mt-1">Check server logs or database connection.</p>
        </div>
      </div>
    );
  }

  const {
    totalVehicles, availableVehicles, reservedVehicles, activeRentals,
    pendingDeposits, pendingSignatures, revenueThisMonth, maintenanceDueSoon,
    fleetUtilization, recentReservations, monthlyRevenue, fleetStatusBreakdown,
  } = stats;

  return (
    <div className="p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-[#6b7280] text-sm mt-0.5">SureShift Rentals — Operations Overview</p>
        </div>
        <Link
          href="/admin/reservations"
          className="flex items-center gap-2 px-4 py-2 bg-[#2952CC] text-white rounded-lg text-sm font-medium hover:bg-[#3561e0] transition-colors"
        >
          All Reservations
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stat Cards — 6 across */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard
          label="Revenue This Month"
          value={formatDollars(revenueThisMonth)}
          accent="text-emerald-400"
          Icon={CreditCard}
          trend={{ dir: "up", label: "+12% vs last month" }}
        />
        <StatCard
          label="Active Rentals"
          value={activeRentals}
          sub="vehicles currently out"
          accent="text-[#5b82f5]"
          Icon={Car}
        />
        <StatCard
          label="Available"
          value={availableVehicles}
          sub={`of ${totalVehicles} total`}
          accent="text-emerald-400"
          Icon={CheckCircle}
        />
        <StatCard
          label="Pending Deposits"
          value={pendingDeposits}
          sub="awaiting payment"
          accent={pendingDeposits > 0 ? "text-yellow-400" : "text-white"}
          Icon={CreditCard}
        />
        <StatCard
          label="Maintenance Due"
          value={maintenanceDueSoon}
          sub="next 14 days"
          accent={maintenanceDueSoon > 0 ? "text-orange-400" : "text-white"}
          Icon={Wrench}
        />
        <StatCard
          label="Fleet Utilization"
          value={`${fleetUtilization}%`}
          sub={`${activeRentals} of ${totalVehicles - (stats.fleetStatusBreakdown.maintenance || 0)} bookable`}
          accent="text-white"
          Icon={Calendar}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Bar Chart */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-sm">Monthly Revenue</h3>
              <p className="text-[#6b7280] text-xs">Last 6 months</p>
            </div>
            <span className="text-emerald-400 text-xs font-medium bg-emerald-400/10 px-2 py-1 rounded-full">
              {formatDollars(revenueThisMonth)} this month
            </span>
          </div>
          {monthlyRevenue.length > 0 ? (
            <RevenueBarChart data={monthlyRevenue} />
          ) : (
            <div className="h-32 flex items-center justify-center text-[#6b7280] text-sm">
              No revenue data yet
            </div>
          )}
        </div>

        {/* Fleet Status Donut */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-6">
          <div className="mb-4">
            <h3 className="text-white font-semibold text-sm">Fleet Status</h3>
            <p className="text-[#6b7280] text-xs">Current distribution</p>
          </div>
          <FleetDonut
            available={fleetStatusBreakdown.available}
            active={fleetStatusBreakdown.active}
            maintenance={fleetStatusBreakdown.maintenance}
          />
        </div>
      </div>

      {/* Action Queue */}
      {(pendingDeposits > 0 || pendingSignatures > 0 || maintenanceDueSoon > 0) && (
        <div className="mb-8">
          <h2 className="text-[#6b7280] text-xs font-semibold uppercase tracking-wider mb-3">
            Action Queue
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {pendingDeposits > 0 && (
              <Link href="/admin/reservations?status=awaiting_deposit">
                <div className="bg-yellow-500/8 border border-yellow-500/20 rounded-xl p-4 flex items-center gap-4 hover:border-yellow-500/40 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/15 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-lg leading-none">{pendingDeposits}</p>
                    <p className="text-yellow-400 text-xs font-medium mt-0.5">Awaiting Deposit</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#4b5563] flex-shrink-0" />
                </div>
              </Link>
            )}
            {pendingSignatures > 0 && (
              <Link href="/admin/reservations?status=agreement_sent">
                <div className="bg-violet-500/8 border border-violet-500/20 rounded-xl p-4 flex items-center gap-4 hover:border-violet-500/40 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                    <Alert className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-lg leading-none">{pendingSignatures}</p>
                    <p className="text-violet-400 text-xs font-medium mt-0.5">Awaiting Signature</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#4b5563] flex-shrink-0" />
                </div>
              </Link>
            )}
            {maintenanceDueSoon > 0 && (
              <Link href="/admin/maintenance">
                <div className="bg-orange-500/8 border border-orange-500/20 rounded-xl p-4 flex items-center gap-4 hover:border-orange-500/40 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/15 flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-lg leading-none">{maintenanceDueSoon}</p>
                    <p className="text-orange-400 text-xs font-medium mt-0.5">Maintenance Due</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#4b5563] flex-shrink-0" />
                </div>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Recent Reservations Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[#6b7280] text-xs font-semibold uppercase tracking-wider">
            Recent Reservations
          </h2>
          <Link href="/admin/reservations" className="text-[#5b82f5] text-xs hover:underline">
            View all →
          </Link>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
          {recentReservations.length === 0 ? (
            <div className="py-12 text-center text-[#6b7280] text-sm">No reservations yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1f2937]">
                    {["Code", "Customer", "Vehicle", "Dates", "Status", "Amount"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[#6b7280] text-xs font-medium uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937]">
                  {recentReservations.map((res) => (
                    <tr key={res.id} className="hover:bg-[#1f2937]/50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/portal/${res.reservation_code}`} className="font-mono text-[#5b82f5] text-xs hover:underline">
                          {res.reservation_code}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white text-sm font-medium">{res.customer_first_name} {res.customer_last_name}</p>
                        <p className="text-[#6b7280] text-xs">{res.customer_phone}</p>
                      </td>
                      <td className="px-4 py-3 text-[#9ca3af] text-xs">
                        {res.vehicle_year} {res.vehicle_make} {res.vehicle_model}
                      </td>
                      <td className="px-4 py-3 text-[#9ca3af] text-xs">
                        <div>{formatDatetime(new Date(res.pickup_datetime))}</div>
                        <div className="text-[#6b7280]">→ {formatDatetime(new Date(res.return_datetime))}</div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusChip status={res.reservation_status} />
                      </td>
                      <td className="px-4 py-3 text-white text-sm font-medium">
                        {formatDollars(res.estimated_rental_subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
