/**
 * app/fleet/page.tsx
 *
 * Fleet listing page — Porsche Drive card aesthetic.
 *
 * Design:
 * - Light gray page background
 * - Sticky "Select rental period" card at top
 * - White elevated vehicle cards, single column on mobile / 2-col on tablet / 3-col desktop
 * - Car name bold centered at top of card
 * - Large car image centered (floating silhouette on white)
 * - Price simple below image
 * - "Select model" underlined text link
 * - Minimal — no chips, no clutter
 */

import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getDB } from "@/lib/db";

// ============================================
// CITY CONFIG
// ============================================
const cityConfig: Record<string, { label: string; emoji: string }> = {
  houston: { label: "Houston", emoji: "" },
  dallas: { label: "Dallas", emoji: "" },
};

// ============================================
// CAR IMAGE MAP — slug to photo file
// ============================================
const carImages: Record<string, string> = {
  "toyota": "/cars/toyota-camry.png",
  "nissan": "/cars/nissan-altima.png",
  "ford": "/cars/ford-fusion.png",
};

// ============================================
// CUSTOM ICON COMPONENTS — unique to SureShift
// ============================================
function GigIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}
function LeafIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8C8 10 5.9 16.17 3.82 19.5c1.12.5 2.5.5 3.68 0C9.28 15.4 12 13 17 13V8z"/>
      <path d="M17 8h4v5c-1.5 0-3-.5-4-1"/>
    </svg>
  );
}

// ============================================
// VEHICLE CARD — Porsche Drive style
// ============================================
function VehicleCard({ v }: { v: Record<string, unknown> }) {
  const weekly = v.weekly_rate ? Number(v.weekly_rate) : Math.round(Number(v.daily_rate) * 7);
  const isBookable = v.status === "available" || v.status === "limited_availability";
  const make = String(v.make).toLowerCase();
  const imgSrc = carImages[make] ?? carImages["toyota"];

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100">
      {/* Available tag — subtle, top right */}
      {v.status === "available" && (
        <div className="flex justify-end px-5 pt-5">
          <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
            Available
          </span>
        </div>
      )}
      {v.status === "limited_availability" && (
        <div className="flex justify-end px-5 pt-5">
          <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2.5 py-1 rounded-full">
            Limited
          </span>
        </div>
      )}
      {v.status === "reserved" && (
        <div className="flex justify-end px-5 pt-5">
          <span className="text-xs text-gray-400 font-semibold bg-gray-50 px-2.5 py-1 rounded-full">
            Reserved
          </span>
        </div>
      )}

      <div className={v.status ? "pt-2" : "pt-6"}>
        {/* Car name — centered, bold */}
        <h3 className="text-center text-base font-black text-gray-900 px-6 mb-1">
          {String(v.year)} {String(v.make)} {String(v.model)}
        </h3>
        {Boolean(v.trim) && (
          <p className="text-center text-xs text-gray-400 mb-1">{String(v.trim)}</p>
        )}

        {/* Tags — centered small pills with custom icons */}
        <div className="flex justify-center gap-1.5 px-6 mb-4 flex-wrap">
          {Boolean(v.work_ready) && (
            <span className="inline-flex items-center gap-1 text-[10px] text-[#2952CC] font-semibold px-2 py-0.5 rounded-full border border-[#2952CC]/20 bg-[#2952CC]/05">
              <GigIcon /> Gig Ready
            </span>
          )}
          {Boolean(v.fuel_efficient) && (
            <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 font-semibold px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50">
              <LeafIcon /> Fuel Efficient
            </span>
          )}
        </div>

        {/* Real car photo */}
        <div className="px-4 pb-2 flex items-center justify-center h-44 relative">
          <Image
            src={imgSrc}
            alt={`${String(v.year)} ${String(v.make)} ${String(v.model)}`}
            width={360}
            height={200}
            className="object-contain w-full h-full drop-shadow-md"
          />
        </div>

        {/* Price */}
        <div className="text-center pb-2">
          <span className="text-lg font-bold text-gray-900">${weekly}</span>
          <span className="text-sm text-gray-400"> / week</span>
        </div>
        <p className="text-center text-xs text-gray-400 pb-5">${Number(v.deposit_amount)} deposit</p>

        {/* CTA — Porsche Drive style underlined link */}
        <div className="border-t border-gray-100 py-4 px-6 text-center">
          {isBookable ? (
            <Link
              href={`/fleet/${String(v.slug)}`}
              className="text-sm font-semibold text-gray-900 underline underline-offset-4 decoration-gray-900 hover:text-[#2952CC] hover:decoration-[#2952CC] transition-colors"
            >
              Select model
            </Link>
          ) : (
            <span className="text-sm text-gray-400">Currently reserved</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// PAGE — server rendered
// ============================================
export default async function FleetPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city } = await searchParams;
  const cityKey = city?.toLowerCase() ?? "houston";
  const cityInfo = cityConfig[cityKey] ?? cityConfig.houston;

  let vehicles: Record<string, unknown>[] = [];

  try {
    const sql = getDB();
    const rows = await sql`
      SELECT *
      FROM vehicles
      WHERE is_bookable = TRUE
        AND LOWER(location_city) = ${cityKey}
      ORDER BY daily_rate ASC, vehicle_code ASC
    `;
    vehicles = rows as Record<string, unknown>[];
  } catch (err) {
    console.error("[FleetPage] DB error:", err);
  }

  return (
    <div className="min-h-screen bg-[#F0F0F0]">
      <Navbar />

      {/* Page header */}
      <div className="pt-24 pb-6 px-5 max-w-5xl mx-auto">
        {/* City switcher */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/fleet?city=houston" className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
            cityKey === "houston" ? "bg-[#2952CC] text-white shadow-sm" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
          }`}>
            Houston
          </Link>
          <Link href="/fleet?city=dallas" className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
            cityKey === "dallas" ? "bg-[#2952CC] text-white shadow-sm" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
          }`}>
            Dallas
          </Link>
          <Link href="/locations" className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ← Change city
          </Link>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-1">{cityInfo.label} Fleet</h1>
        <p className="text-gray-500 text-sm">
          {cityInfo.label}, TX · All vehicles are gig-work eligible
        </p>
      </div>

      {/* Sticky rental period selector */}
      <div className="sticky top-16 z-30 px-5 pb-4 max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500 font-medium mb-2">Select your rental period</p>
          <Link
            href="/book"
            className="block w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-400 hover:border-[#2952CC] hover:text-gray-600 transition-colors"
          >
            Select your rental period
          </Link>
        </div>
      </div>

      {/* Fleet grid */}
      <div className="px-5 pb-16 max-w-5xl mx-auto">
        {vehicles.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl">
            <p className="text-gray-400 text-lg mb-2">No vehicles available right now.</p>
            <p className="text-gray-400 text-sm">Check back soon or call <a href="tel:+18000000000" className="text-[#2952CC]">(800) 000-0000</a></p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((v) => (
              <VehicleCard key={String(v.id)} v={v} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
