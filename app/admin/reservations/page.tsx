/**
 * app/admin/reservations/page.tsx
 *
 * Admin reservations management page at /admin/reservations.
 *
 * Fetches all reservations from /api/admin/reservations with optional
 * status filtering via query params. Shows a sortable table with
 * customer, vehicle, date, and status info.
 *
 * This is a server component — status filter from the URL is applied
 * server-side for a fast, accessible filtered view.
 */

import Link from "next/link";
import Navbar from "../../components/Navbar";
import type { ReservationWithDetails } from "@/lib/types";
import { ReservationStatus } from "@/lib/constants";
import { formatDollars, formatDatetime } from "@/lib/helpers";

// ============================================
// DATA FETCHING
// ============================================

async function getReservations(statusFilter?: string): Promise<ReservationWithDetails[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const url = statusFilter
      ? `${baseUrl}/api/admin/reservations?status=${statusFilter}`
      : `${baseUrl}/api/admin/reservations`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// ============================================
// STATUS TABS
// The tab bar allows quick filtering by reservation status.
// ============================================

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Awaiting Deposit", value: ReservationStatus.AWAITING_DEPOSIT },
  { label: "Deposit Paid", value: ReservationStatus.DEPOSIT_PAID },
  { label: "Agreement Sent", value: ReservationStatus.AGREEMENT_SENT },
  { label: "Confirmed", value: ReservationStatus.CONFIRMED },
  { label: "Active", value: ReservationStatus.ACTIVE },
  { label: "Completed", value: ReservationStatus.COMPLETED },
  { label: "Cancelled", value: ReservationStatus.CANCELLED },
];

// ============================================
// HELPER: Status pill
// ============================================

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    [ReservationStatus.AWAITING_DEPOSIT]: "bg-amber-500/15 text-amber-400",
    [ReservationStatus.DEPOSIT_PAID]: "bg-blue-500/15 text-blue-400",
    [ReservationStatus.AGREEMENT_SENT]: "bg-violet-500/15 text-violet-400",
    [ReservationStatus.CONFIRMED]: "bg-emerald-500/15 text-emerald-400",
    [ReservationStatus.ACTIVE]: "bg-green-500/15 text-green-400",
    [ReservationStatus.COMPLETED]: "bg-gray-500/15 text-gray-400",
    [ReservationStatus.CANCELLED]: "bg-red-500/15 text-red-400",
    [ReservationStatus.NO_SHOW]: "bg-rose-500/15 text-rose-400",
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

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminReservationsPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const statusFilter = status ?? "";
  const reservations = await getReservations(statusFilter || undefined);

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navbar />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-white">Reservations</h1>
              <span className="px-2.5 py-1 bg-[#2952CC]/20 text-[#2952CC] border border-[#2952CC]/30 rounded-lg text-xs font-bold uppercase tracking-wider">
                Admin
              </span>
            </div>
            <p className="text-[#7A8B9A] text-sm">
              {reservations.length} reservation{reservations.length !== 1 ? "s" : ""}
              {statusFilter && ` · filtered by: ${statusFilter.replace(/_/g, " ")}`}
            </p>
          </div>
          <Link href="/admin"
            className="px-4 py-2 bg-gray-900 border border-gray-800 text-[#7A8B9A] rounded-xl text-sm font-medium hover:text-white hover:border-gray-600 transition-colors"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={tab.value ? `/admin/reservations?status=${tab.value}` : "/admin/reservations"}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                statusFilter === tab.value
                  ? "bg-[#2952CC] text-white"
                  : "bg-gray-900 text-[#7A8B9A] border border-gray-800 hover:border-gray-600 hover:text-white"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Reservations table */}
        {reservations.length === 0 ? (
          <div className="text-center py-24 bg-gray-900 border border-gray-800 rounded-2xl">
            <div className="text-4xl mb-3"></div>
            <p className="text-white font-semibold mb-1">No reservations found</p>
            <p className="text-[#7A8B9A] text-sm">
              {statusFilter ? "No reservations with this status." : "No reservations have been created yet."}
            </p>
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
                    <th className="text-left px-4 py-3 text-[#7A8B9A] font-medium hidden lg:table-cell">Return</th>
                    <th className="text-left px-4 py-3 text-[#7A8B9A] font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-[#7A8B9A] font-medium hidden sm:table-cell">Total</th>
                    <th className="text-left px-4 py-3 text-[#7A8B9A] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {reservations.map((res) => (
                    <tr key={res.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-white text-xs bg-gray-800 px-2 py-1 rounded">
                          {res.reservation_code}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-white font-medium">
                          {res.customer_first_name} {res.customer_last_name}
                        </p>
                        <p className="text-[#7A8B9A] text-xs">{res.customer_phone}</p>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <p className="text-[#7A8B9A] text-xs">
                          {res.vehicle_year} {res.vehicle_make} {res.vehicle_model}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <p className="text-[#7A8B9A] text-xs">
                          {formatDatetime(new Date(res.pickup_datetime))}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <p className="text-[#7A8B9A] text-xs">
                          {formatDatetime(new Date(res.return_datetime))}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusPill status={res.reservation_status} />
                        <div className="flex flex-col gap-0.5 mt-1">
                          {res.deposit_status !== "not_paid" && (
                            <span className="text-xs text-[#7A8B9A]">
                              Deposit: {res.deposit_status.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <p className="text-white text-xs font-semibold">
                          {formatDollars(res.estimated_rental_subtotal)}
                        </p>
                        <p className="text-[#7A8B9A] text-xs">
                          {res.estimated_total_days}d · {formatDollars(res.estimated_daily_rate)}/day
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-3">
                          <Link
                            href={`/portal/${res.reservation_code}`}
                            className="text-[#2952CC] hover:underline text-xs font-medium"
                          >
                            Portal
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
