/**
 * app/portal/dashboard/page.tsx — Customer Dashboard
 * Access via /portal/dashboard?email=[email]
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getDB } from "@/lib/db";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  confirmed: "bg-blue-100 text-blue-700",
  awaiting_deposit: "bg-amber-100 text-amber-700",
  deposit_paid: "bg-blue-100 text-blue-700",
  agreement_sent: "bg-purple-100 text-purple-700",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-700",
};

async function getCustomerData(email: string) {
  try {
    const sql = getDB();

    const customers = await sql`
      SELECT * FROM customers WHERE LOWER(email) = LOWER(${email.trim()}) LIMIT 1`;

    if (customers.length === 0) return null;
    const customer = customers[0] as Record<string, unknown>;

    const reservations = await sql`
      SELECT r.*, v.year, v.make, v.model, v.headline_name, v.image_cover_url, v.slug
      FROM reservations r
      LEFT JOIN vehicles v ON v.id = r.vehicle_id
      WHERE r.customer_id = ${String(customer.id)}
      ORDER BY r.created_at DESC`;

    return {
      customer,
      reservations: reservations as Record<string, unknown>[],
    };
  } catch (err) {
    console.error("[PortalDashboard]", err);
    return null;
  }
}

interface PageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function PortalDashboardPage({ searchParams }: PageProps) {
  const { email } = await searchParams;

  if (!email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center max-w-sm mx-4">
          <p className="text-gray-900 font-bold text-lg mb-2">Sign in required</p>
          <p className="text-gray-500 text-sm mb-4">Please sign in to view your dashboard.</p>
          <Link href="/portal/login" className="inline-flex px-5 py-2.5 bg-[#2952CC] text-white font-bold rounded-xl text-sm hover:bg-[#3561e0] transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const data = await getCustomerData(email);

  if (!data) notFound();

  const { customer, reservations } = data;

  const activeReservation = reservations.find(
    (r) => String(r.reservation_status) === "active" || String(r.reservation_status) === "confirmed"
  );
  const pastReservations = reservations.filter(
    (r) => String(r.reservation_status) === "completed"
  );

  const totalSpent = reservations
    .filter((r) => String(r.reservation_status) !== "cancelled")
    .reduce((s, r) => s + (parseFloat(String(r.estimated_rental_subtotal)) || 0), 0);

  const memberSince = customer.created_at
    ? new Date(String(customer.created_at)).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  const emailParam = `?email=${encodeURIComponent(email)}`;

  // Days remaining for active rental
  let daysRemaining: number | null = null;
  if (activeReservation?.return_datetime) {
    const ret = new Date(String(activeReservation.return_datetime));
    const now = new Date();
    daysRemaining = Math.max(0, Math.ceil((ret.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-[#2952CC] text-sm font-semibold uppercase tracking-widest mb-1">Customer Portal</p>
            <h1 className="text-3xl font-black text-gray-900">
              Welcome back, {String(customer.first_name ?? "there")}
            </h1>
            <p className="text-gray-500 text-sm mt-1">{email}</p>
          </div>
          <Link
            href="/portal/login"
            className="text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-xl px-4 py-2 transition-colors"
          >
            Sign Out
          </Link>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Total Rentals", value: String(reservations.length) },
            { label: "Total Spent", value: `$${totalSpent.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
            { label: "Member Since", value: memberSince },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm text-center">
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              <p className="text-gray-500 text-xs font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Active rental card */}
        {activeReservation ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Current Rental</h2>
            <div className="flex flex-col sm:flex-row gap-4">
{Boolean(activeReservation.image_cover_url) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={String(activeReservation.image_cover_url)}
                  alt={String(activeReservation.headline_name ?? "")}
                  className="w-full sm:w-48 h-32 object-cover rounded-xl flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-gray-900 font-bold text-lg">
                    {activeReservation.headline_name
                      ? String(activeReservation.headline_name)
                      : `${String(activeReservation.year ?? "")} ${String(activeReservation.make ?? "")} ${String(activeReservation.model ?? "")}`}
                  </p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${STATUS_COLORS[String(activeReservation.reservation_status)] ?? "bg-gray-100 text-gray-600"}`}>
                    {String(activeReservation.reservation_status).replace(/_/g, " ")}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-gray-500 text-xs">Pickup</p>
                    <p className="text-gray-900 font-medium">
                      {activeReservation.pickup_datetime
                        ? new Date(String(activeReservation.pickup_datetime)).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Return</p>
                    <p className="text-gray-900 font-medium">
                      {activeReservation.return_datetime
                        ? new Date(String(activeReservation.return_datetime)).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : "—"}
                    </p>
                  </div>
                  {daysRemaining !== null && (
                    <div>
                      <p className="text-gray-500 text-xs">Days Remaining</p>
                      <p className="text-gray-900 font-medium">{daysRemaining} day{daysRemaining !== 1 ? "s" : ""}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/portal/${String(activeReservation.reservation_code)}${emailParam}`}
                    className="px-4 py-2 bg-[#2952CC] text-white text-sm font-bold rounded-xl hover:bg-[#3561e0] transition-colors"
                  >
                    View Details →
                  </Link>
                  <a
                    href="tel:8000000000"
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8 text-center">
            <p className="text-gray-500 text-sm">No active rental.</p>
            <Link href="/fleet" className="inline-flex mt-3 px-4 py-2 bg-[#2952CC] text-white text-sm font-bold rounded-xl hover:bg-[#3561e0] transition-colors">
              Browse Fleet
            </Link>
          </div>
        )}

        {/* Rental history */}
        {pastReservations.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Rental History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Vehicle", "Dates", "Amount", "Status", ""].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pastReservations.map((r) => (
                    <tr key={String(r.id)} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 text-gray-900 font-medium">
                        {String(r.headline_name ?? `${r.year} ${r.make} ${r.model}`)}
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                        {r.pickup_datetime
                          ? new Date(String(r.pickup_datetime)).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          : "—"}
                        {" – "}
                        {r.return_datetime
                          ? new Date(String(r.return_datetime)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="px-5 py-4 text-gray-900 font-semibold">
                        {r.estimated_rental_subtotal ? `$${Number(r.estimated_rental_subtotal).toFixed(0)}` : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${STATUS_COLORS[String(r.reservation_status)] ?? "bg-gray-100 text-gray-600"}`}>
                          {String(r.reservation_status).replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/portal/${String(r.reservation_code)}${emailParam}`}
                          className="text-xs text-[#2952CC] hover:text-blue-600 font-semibold"
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

      <Footer />
    </div>
  );
}
