/**
 * app/admin/reservations/page.tsx
 *
 * Admin reservations management — /admin/reservations
 * Server-rendered directly from DB. No public Navbar — uses admin layout.
 */

import Link from "next/link";
import { getDB } from "@/lib/db";

export const dynamic = "force-dynamic";

// ─── Status config ────────────────────────────────────────────────

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Awaiting Deposit", value: "awaiting_deposit" },
  { label: "Deposit Paid", value: "deposit_paid" },
  { label: "Agreement Sent", value: "agreement_sent" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const STATUS_CHIP: Record<string, string> = {
  awaiting_deposit: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  deposit_paid: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  agreement_sent: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  confirmed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  active: "bg-[#2952CC]/25 text-[#6b9fff] border-[#2952CC]/35",
  completed: "bg-gray-500/15 text-gray-400 border-gray-500/25",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/25",
  expired: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

// ─── Data fetching ────────────────────────────────────────────────

async function getReservations(statusFilter?: string) {
  try {
    const sql = getDB();
    const rows = statusFilter
      ? await sql`
          SELECT r.*, c.first_name, c.last_name, c.email, c.phone,
                 v.year, v.make, v.model, v.slug
          FROM reservations r
          LEFT JOIN customers c ON c.id = r.customer_id
          LEFT JOIN vehicles v ON v.id = r.vehicle_id
          WHERE r.reservation_status = ${statusFilter}
          ORDER BY r.created_at DESC`
      : await sql`
          SELECT r.*, c.first_name, c.last_name, c.email, c.phone,
                 v.year, v.make, v.model, v.slug
          FROM reservations r
          LEFT JOIN customers c ON c.id = r.customer_id
          LEFT JOIN vehicles v ON v.id = r.vehicle_id
          ORDER BY r.created_at DESC`;
    return rows as Record<string, unknown>[];
  } catch (err) {
    console.error("[AdminReservations]", err);
    return [];
  }
}

// ─── Page ────────────────────────────────────────────────────────

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const reservations = await getReservations(status);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Reservations</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {reservations.length} reservation{reservations.length !== 1 ? "s" : ""}
            {status ? ` · filtered by: ${status.replace(/_/g, " ")}` : ""}
          </p>
        </div>
      </div>

      {/* Status filter tabs — horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {STATUS_TABS.map((tab) => {
          const active = (status ?? "") === tab.value;
          const href = tab.value ? `/admin/reservations?status=${tab.value}` : "/admin/reservations";
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
      {reservations.length === 0 ? (
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-12 text-center">
          <p className="text-gray-400 text-base font-medium">No reservations found</p>
          <p className="text-gray-600 text-sm mt-1">
            {status ? `No reservations with status: ${status.replace(/_/g, " ")}` : "No reservations have been created yet."}
          </p>
        </div>
      ) : (
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-[#1f2937]">
                  {["Code", "Customer", "Vehicle", "Pickup", "Status", "Amount", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-gray-500 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]">
                {reservations.map((r) => (
                  <tr key={String(r.id)} className="hover:bg-[#1f2937]/50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-[#2952CC] text-xs font-semibold">
                        {String(r.reservation_code)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-white text-sm font-medium">
                        {r.first_name ? `${String(r.first_name)} ${String(r.last_name)}` : "—"}
                      </p>
                      <p className="text-gray-500 text-xs">{String(r.email ?? "")}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-300 text-sm">
                      {r.year ? `${String(r.year)} ${String(r.make)} ${String(r.model)}` : "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                      {r.pickup_datetime
                        ? new Date(String(r.pickup_datetime)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-semibold border ${STATUS_CHIP[String(r.reservation_status)] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                        {String(r.reservation_status ?? "").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-white font-semibold text-sm">
                      {r.estimated_rental_subtotal ? `$${Number(r.estimated_rental_subtotal).toFixed(0)}` : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/portal/${String(r.reservation_code)}`}
                        className="text-xs text-[#2952CC] hover:text-blue-400 font-semibold whitespace-nowrap"
                        target="_blank"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
