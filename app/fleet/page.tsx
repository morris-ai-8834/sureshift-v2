/**
 * app/fleet/page.tsx
 *
 * Fleet listing page — server-side rendered for reliability.
 * Fetches vehicles directly from DB on the server, no client-side fetch needed.
 */

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import { getDB } from "@/lib/db";

// ============================================
// STATUS BADGE
// ============================================
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; classes: string; dot: string }> = {
    available: { label: "Available Now", classes: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    limited_availability: { label: "Limited", classes: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
    reserved: { label: "Reserved", classes: "bg-gray-100 text-gray-400 border-gray-200", dot: "bg-gray-300" },
  };
  const s = config[status] ?? config["available"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${s.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ============================================
// VEHICLE CARD
// ============================================
function VehicleCard({ v }: { v: Record<string, unknown> }) {
  const isBookable = v.status === "available" || v.status === "limited_availability";
  const weekly = v.weekly_rate ? Number(v.weekly_rate) : Math.round(Number(v.daily_rate) * 7);
  const deposit = Number(v.deposit_amount);

  const gradients: Record<string, string> = {
    Toyota: "from-slate-700 to-slate-900",
    Nissan: "from-blue-800 to-slate-900",
    Ford: "from-blue-900 to-slate-900",
    default: "from-gray-700 to-gray-900",
  };
  const gradient = gradients[String(v.make)] ?? gradients.default;

  return (
    <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-gray-200/60 hover:border-gray-200 transition-all duration-300">

      {/* Image area */}
      <div className={`relative aspect-[16/10] bg-gradient-to-br ${gradient} overflow-hidden`}>
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <svg className="w-36 h-24 text-white" viewBox="0 0 200 120" fill="none">
            <path d="M20 75 L40 45 Q52 32 68 30 L132 30 Q148 32 160 45 L180 75 L186 92 L14 92 Z" fill="currentColor"/>
            <circle cx="55" cy="92" r="18" fill="none" stroke="white" strokeWidth="4"/>
            <circle cx="145" cy="92" r="18" fill="none" stroke="white" strokeWidth="4"/>
            <path d="M68 50 L85 36 L115 36 L132 50 Z" fill="white" fillOpacity="0.3"/>
          </svg>
        </div>
        <div className="absolute top-3 left-3">
          <StatusBadge status={String(v.status)} />
        </div>
        {Boolean(v.work_ready) && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/20 backdrop-blur-sm">
              Gig Ready
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-[#2952CC] transition-colors">
          {String(v.year)} {String(v.make)} {String(v.model)} {v.trim ? String(v.trim) : ""}
        </h3>
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          <span>{String(v.seats)} seats</span>
          <span className="w-1 h-1 rounded-full bg-gray-200" />
          <span className="capitalize">{String(v.transmission)}</span>
          {Boolean(v.mpg_city) && (
            <>
              <span className="w-1 h-1 rounded-full bg-gray-200" />
              <span>{String(v.mpg_city)} mpg city</span>
            </>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed line-clamp-2">{String(v.description_short)}</p>

        <div className="flex items-end justify-between pt-3 border-t border-gray-50">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-gray-900">${weekly}</span>
              <span className="text-xs text-gray-400">/week</span>
            </div>
            <div className="text-xs text-gray-400">${deposit} deposit</div>
          </div>
          {isBookable ? (
            <Link
              href={`/fleet/${String(v.slug)}`}
              className="px-5 py-2.5 bg-[#2952CC] text-white text-xs font-bold rounded-xl hover:bg-[#1e3fa8] transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-[#2952CC]/20"
            >
              Reserve
            </Link>
          ) : (
            <span className="px-5 py-2.5 bg-gray-100 text-gray-400 text-xs font-bold rounded-xl">
              Reserved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// PAGE — Server Component
// ============================================
export default async function FleetPage() {
  let vehicles: Record<string, unknown>[] = [];

  try {
    const sql = getDB();
    const rows = await sql`
      SELECT *
      FROM vehicles
      WHERE is_bookable = TRUE
        AND status IN ('available', 'limited_availability', 'reserved')
      ORDER BY daily_rate ASC, vehicle_code ASC
    `;
    vehicles = rows as Record<string, unknown>[];
  } catch (err) {
    console.error("[FleetPage] DB error:", err);
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-12 px-6 lg:px-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#2952CC] text-sm font-semibold uppercase tracking-widest mb-3">Our Fleet</p>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Available Vehicles
          </h1>
          <p className="text-gray-500 text-base max-w-xl">
            All vehicles are Uber and Lyft eligible. Weekly rates include liability coverage.
            Reserve online or call{" "}
            <a href="tel:+18000000000" className="text-[#2952CC] font-semibold">
              (800) 000-0000
            </a>
            .
          </p>
        </div>
      </section>

      {/* Fleet grid */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {vehicles.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-gray-400 text-lg mb-4">No vehicles available right now.</p>
              <p className="text-gray-400 text-sm">Check back soon or call us at (800) 000-0000</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((v) => (
                <VehicleCard key={String(v.id)} v={v} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 lg:px-8 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-3">Don&apos;t see what you need?</h2>
          <p className="text-gray-500 text-sm mb-6">Our fleet updates regularly. Call or text us and we&apos;ll find the right fit.</p>
          <a
            href="tel:+18000000000"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2952CC] text-white font-semibold rounded-xl hover:bg-[#1e3fa8] transition-colors text-sm"
          >
            Call (800) 000-0000
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
