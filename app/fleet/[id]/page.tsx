/**
 * app/fleet/[id]/page.tsx
 *
 * Vehicle detail / profile page at /fleet/[slug].
 * Server-side rendered directly from database — no API fetch needed.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getDB } from "@/lib/db";

// ============================================
// GENERATE STATIC PARAMS
// Pre-renders all vehicle slugs at build time
// ============================================
export async function generateStaticParams() {
  try {
    const sql = getDB();
    const rows = await sql`SELECT slug FROM vehicles WHERE is_bookable = TRUE`;
    return rows.map((r: Record<string, unknown>) => ({ id: String(r.slug) }));
  } catch {
    return [];
  }
}

// ============================================
// PAGE
// ============================================
export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch vehicle from DB by slug
  let vehicle: Record<string, unknown> | null = null;
  try {
    const sql = getDB();
    const rows = await sql`
      SELECT * FROM vehicles WHERE slug = ${id} AND is_bookable = TRUE LIMIT 1
    `;
    vehicle = rows[0] as Record<string, unknown> ?? null;
  } catch (err) {
    console.error("[VehicleDetail] DB error:", err);
  }

  if (!vehicle) notFound();

  const weekly = vehicle.weekly_rate
    ? Number(vehicle.weekly_rate)
    : Math.round(Number(vehicle.daily_rate) * 7);
  const deposit = Number(vehicle.deposit_amount);
  const isBookable = vehicle.status === "available" || vehicle.status === "limited_availability";

  const statusLabel =
    vehicle.status === "available" ? "Available Now" :
    vehicle.status === "limited_availability" ? "Limited Availability" :
    "Reserved";

  const statusColor =
    vehicle.status === "available" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
    vehicle.status === "limited_availability" ? "bg-amber-50 text-amber-700 border-amber-200" :
    "bg-gray-100 text-gray-500 border-gray-200";

  const gradients: Record<string, string> = {
    Toyota: "from-slate-700 to-slate-900",
    Nissan: "from-blue-800 to-slate-900",
    Ford: "from-blue-900 to-slate-900",
    default: "from-gray-700 to-gray-900",
  };
  const gradient = gradients[String(vehicle.make)] ?? gradients.default;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-24">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/fleet" className="hover:text-gray-600">Fleet</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{String(vehicle.year)} {String(vehicle.make)} {String(vehicle.model)}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* LEFT — Image + specs */}
          <div>
            {/* Main image */}
            <div className={`aspect-[4/3] rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 overflow-hidden`}>
              <svg className="w-48 h-32 text-white opacity-20" viewBox="0 0 200 120" fill="none">
                <path d="M20 75 L40 45 Q52 32 68 30 L132 30 Q148 32 160 45 L180 75 L186 92 L14 92 Z" fill="currentColor"/>
                <circle cx="55" cy="92" r="18" fill="none" stroke="white" strokeWidth="4"/>
                <circle cx="145" cy="92" r="18" fill="none" stroke="white" strokeWidth="4"/>
                <path d="M68 50 L85 36 L115 36 L132 50 Z" fill="white" fillOpacity="0.3"/>
              </svg>
            </div>

            {/* Specs grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Seats", value: `${String(vehicle.seats)} passengers` },
                { label: "Transmission", value: String(vehicle.transmission) },
                { label: "Fuel Type", value: String(vehicle.fuel_type) },
                { label: "City MPG", value: vehicle.mpg_city ? `${String(vehicle.mpg_city)} mpg` : "N/A" },
                { label: "Highway MPG", value: vehicle.mpg_highway ? `${String(vehicle.mpg_highway)} mpg` : "N/A" },
                { label: "Location", value: String(vehicle.location_city) },
              ].map((spec) => (
                <div key={spec.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{spec.label}</div>
                  <div className="text-sm font-semibold text-gray-900">{spec.value}</div>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {Boolean(vehicle.work_ready) && <span className="px-3 py-1.5 bg-[#2952CC]/08 text-[#2952CC] text-xs font-semibold rounded-lg border border-[#2952CC]/15">Gig Work Ready</span>}
              {Boolean(vehicle.commuter_friendly) && <span className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-lg border border-gray-100">Commuter Friendly</span>}
              {Boolean(vehicle.fuel_efficient) && <span className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-lg border border-gray-100">Fuel Efficient</span>}
            </div>
          </div>

          {/* RIGHT — Info + booking */}
          <div className="lg:sticky lg:top-28">

            {/* Status */}
            <div className="mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusColor}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                {statusLabel}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-3">
              {String(vehicle.year)} {String(vehicle.make)} {String(vehicle.model)}
              {Boolean(vehicle.trim) && <span className="text-gray-400 font-light ml-2 text-2xl">{String(vehicle.trim)}</span>}
            </h1>

            <p className="text-gray-500 leading-relaxed mb-8">
              {String(vehicle.description_short)}
            </p>

            {/* Pricing card */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-6">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-black text-gray-900">${weekly}</span>
                <span className="text-gray-400 text-sm">/week</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">${deposit} refundable deposit required</p>

              {isBookable ? (
                <Link
                  href={`/book?vehicle=${String(vehicle.slug)}`}
                  className="block w-full text-center px-6 py-4 bg-[#2952CC] text-white font-bold rounded-xl hover:bg-[#1e3fa8] transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-[#2952CC]/25"
                >
                  Reserve This Car
                </Link>
              ) : (
                <div className="w-full text-center px-6 py-4 bg-gray-100 text-gray-400 font-bold rounded-xl">
                  Currently Reserved
                </div>
              )}
            </div>

            {/* Requirements */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Requirements</h3>
              <ul className="space-y-2">
                {[
                  "Valid driver's license",
                  "Refundable deposit",
                  "Signed rental agreement",
                  "Liability coverage included",
                ].map((req) => (
                  <li key={req} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-4 h-4 rounded-full bg-[#2952CC]/10 text-[#2952CC] flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                    {req}
                  </li>
                ))}
              </ul>

              {Boolean(vehicle.requirements_note) && (
                <p className="mt-4 text-xs text-gray-400 leading-relaxed">{String(vehicle.requirements_note)}</p>
              )}
            </div>

            {/* How it works mini */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                Questions? Call us at{" "}
                <a href="tel:+18000000000" className="text-[#2952CC] font-semibold">(800) 000-0000</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
