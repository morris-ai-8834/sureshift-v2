/**
 * app/admin/page.tsx
 *
 * Admin dashboard at /admin.
 *
 * Fetches real stats from /api/admin/dashboard and displays:
 *   - Fleet overview cards (total, available, reserved, active)
 *   - Action-required counters (pending deposits, unsigned agreements)
 *   - Upcoming pickups in the next 48 hours
 *   - Recent reservations list
 *
 * This is a server component — data is always fresh on load.
 * No authentication yet — this should be protected before production.
 */

import Link from "next/link";
import Navbar from "../components/Navbar";
import type { DashboardStats } from "@/lib/types";
import { formatDollars, formatDatetime } from "@/lib/helpers";
import { ReservationStatus } from "@/lib/constants";

// ============================================
// DATA FETCHING
// ============================================

async function getDashboardStats(): Promise<DashboardStats | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/admin/dashboard`, {
      cache: "no-store", // Always fetch fresh data for admin views
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ============================================
// HELPER COMPONENTS
// ============================================

/** A metric card for the stats overview row */
function StatCard({
  label,
  value,
  accent,
  note,
}: {
  label: string;
  value: number;
  accent?: string;
  note?: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <p className="text-[#7A8B9A] text-sm font-medium mb-2">{label}</p>
      <p className={`text-4xl font-black mb-1 ${accent ?? "text-white"}`}>{value}</p>
      {note && <p className="text-[#7A8B9A] text-xs">{note}</p>}
    </div>
  );
}

/** Renders a status pill for reservation status values */
function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    awaiting_deposit: "bg-amber-500/15 text-amber-400",
    deposit_paid: "bg-blue-500/15 text-blue-400",
    agreement_sent: "bg-violet-500/15 text-violet-400",
    confirmed: "bg-emerald-500/15 text-emerald-400",
    active: "bg-green-500/15 text-green-400",
    completed: "bg-gray-500/15 text-gray-400",
    cancelled: "bg-red-500/15 text-red-400",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[status] ?? "bg-gray-800 text-gray-400"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navbar />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
              <span className="px-2.5 py-1 bg-[#2952CC]/20 text-[#2952CC] border border-[#2952CC]/30 rounded-lg text-xs font-bold uppercase tracking-wider">
                Admin
              </span>
            </div>
            <p className="text-[#7A8B9A] text-sm">SureShift Rentals — Operations Overview</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/fleet"
              className="px-4 py-2 bg-gray-900 border border-gray-800 text-[#7A8B9A] rounded-xl text-sm font-medium hover:text-white hover:border-gray-600 transition-colors"
            >
              Manage Fleet
            </Link>
            <Link
              href="/admin/reservations"
              className="px-4 py-2 bg-[#2952CC] text-white rounded-xl text-sm font-medium hover:bg-[#3561e0] transition-colors"
            >
              All Reservations
            </Link>
          </div>
        </div>

        {!stats ? (
          <div className="text-center py-24">
            <p className="text-red-400 mb-2">⚠ Failed to load dashboard data</p>
            <p className="text-[#7A8B9A] text-sm">Check the server logs or database connection.</p>
          </div>
        ) : (
          <>
            {/* ===== FLEET OVERVIEW ===== */}
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-[#7A8B9A] uppercase tracking-wider mb-4">Fleet Overview</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Vehicles" value={stats.totalVehicles} />
                <StatCard label="Available Now" value={stats.availableVehicles} accent="text-emerald-400" />
                <StatCard label="Reserved" value={stats.reservedVehicles} accent="text-amber-400" />
                <StatCard label="Active Rentals" value={stats.activeRentals} accent="text-violet-400" />
              </div>
            </section>

            {/* ===== ACTION REQUIRED ===== */}
            {(stats.pendingDeposits > 0 || stats.pendingSignatures > 0) && (
              <section className="mb-8">
                <h2 className="text-sm font-semibold text-[#7A8B9A] uppercase tracking-wider mb-4">Action Required</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {stats.pendingDeposits > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex items-center gap-4">
                      <div className="text-3xl"></div>
                      <div>
                        <p className="text-white font-bold text-xl">{stats.pendingDeposits}</p>
                        <p className="text-amber-400 text-sm font-medium">Pending Deposit{stats.pendingDeposits !== 1 ? "s" : ""}</p>
                        <p className="text-[#7A8B9A] text-xs mt-0.5">Reservations awaiting payment</p>
                      </div>
                      <Link href="/admin/reservations?status=awaiting_deposit"
                        className="ml-auto text-xs text-[#2952CC] hover:underline font-medium"
                      >
                        View →
                      </Link>
                    </div>
                  )}
                  {stats.pendingSignatures > 0 && (
                    <div className="bg-violet-500/10 border border-violet-500/30 rounded-2xl p-5 flex items-center gap-4">
                      <div className="text-3xl"></div>
                      <div>
                        <p className="text-white font-bold text-xl">{stats.pendingSignatures}</p>
                        <p className="text-violet-400 text-sm font-medium">Unsigned Agreement{stats.pendingSignatures !== 1 ? "s" : ""}</p>
                        <p className="text-[#7A8B9A] text-xs mt-0.5">Sent but not yet signed</p>
                      </div>
                      <Link href="/admin/reservations?status=agreement_sent"
                        className="ml-auto text-xs text-[#2952CC] hover:underline font-medium"
                      >
                        View →
                      </Link>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ===== UPCOMING PICKUPS ===== */}
            {stats.upcomingPickups.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-semibold text-[#7A8B9A] uppercase tracking-wider mb-4">
                  Upcoming Pickups <span className="text-gray-600 normal-case font-normal">(next 48 hours)</span>
                </h2>
                <div className="flex flex-col gap-3">
                  {stats.upcomingPickups.map((res) => (
                    <div key={res.id} className="bg-gray-900 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center text-lg flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">
                          {res.customer_first_name} {res.customer_last_name}
                        </p>
                        <p className="text-[#7A8B9A] text-xs">{res.vehicle_headline_name}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-emerald-400 text-sm font-medium">
                          {formatDatetime(new Date(res.pickup_datetime))}
                        </p>
                        <StatusPill status={res.reservation_status} />
                      </div>
                      <Link href={`/portal/${res.reservation_code}`}
                        className="text-xs text-[#2952CC] hover:underline font-medium flex-shrink-0"
                      >
                        View →
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ===== RECENT RESERVATIONS ===== */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#7A8B9A] uppercase tracking-wider">Recent Reservations</h2>
                <Link href="/admin/reservations" className="text-xs text-[#2952CC] hover:underline font-medium">
                  View All →
                </Link>
              </div>

              {stats.recentReservations.length === 0 ? (
                <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-2xl">
                  <p className="text-[#7A8B9A]">No reservations yet</p>
                </div>
              ) : (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left px-4 py-3 text-[#7A8B9A] font-medium">Code</th>
                          <th className="text-left px-4 py-3 text-[#7A8B9A] font-medium">Customer</th>
                          <th className="text-left px-4 py-3 text-[#7A8B9A] font-medium hidden md:table-cell">Vehicle</th>
                          <th className="text-left px-4 py-3 text-[#7A8B9A] font-medium hidden lg:table-cell">Pickup</th>
                          <th className="text-left px-4 py-3 text-[#7A8B9A] font-medium">Status</th>
                          <th className="text-left px-4 py-3 text-[#7A8B9A] font-medium hidden md:table-cell">Total</th>
                          <th className="px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {stats.recentReservations.map((res) => (
                          <tr key={res.id} className="hover:bg-gray-800/50 transition-colors">
                            <td className="px-4 py-3">
                              <span className="font-mono text-white text-xs">{res.reservation_code}</span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-white font-medium">{res.customer_first_name} {res.customer_last_name}</p>
                              <p className="text-[#7A8B9A] text-xs">{res.customer_phone}</p>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <p className="text-[#7A8B9A] text-xs">{res.vehicle_make} {res.vehicle_model} {res.vehicle_year}</p>
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                              <p className="text-[#7A8B9A] text-xs">{formatDatetime(new Date(res.pickup_datetime))}</p>
                            </td>
                            <td className="px-4 py-3">
                              <StatusPill status={res.reservation_status} />
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <p className="text-white text-xs">{formatDollars(res.estimated_rental_subtotal)}</p>
                            </td>
                            <td className="px-4 py-3">
                              <Link href={`/portal/${res.reservation_code}`}
                                className="text-[#2952CC] hover:underline text-xs font-medium"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
