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
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getDB } from "@/lib/db";

// ============================================
// CAR SILHOUETTE SVG — centered floating look
// ============================================
function CarSilhouette({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 320 160" className="w-full" fill="none">
      {/* Shadow under car */}
      <ellipse cx="160" cy="148" rx="110" ry="8" fill={color} opacity="0.08"/>
      {/* Car body */}
      <path
        d="M48 110 L72 68 Q88 50 110 46 L210 46 Q232 50 248 68 L272 110 L280 128 L40 128 Z"
        fill={color}
        opacity="0.85"
      />
      {/* Roof */}
      <path
        d="M108 70 L130 50 L190 50 L212 70 Z"
        fill={color}
        opacity="0.95"
      />
      {/* Windows */}
      <path d="M118 68 L132 53 L158 53 L158 68 Z" fill="white" opacity="0.25"/>
      <path d="M162 68 L162 53 L188 53 L202 68 Z" fill="white" opacity="0.25"/>
      {/* Window divider */}
      <line x1="159" y1="53" x2="159" y2="68" stroke="white" strokeWidth="1.5" opacity="0.3"/>
      {/* Wheels */}
      <circle cx="96" cy="128" r="22" fill="#1a1a2e"/>
      <circle cx="96" cy="128" r="14" fill="#2a2a3e"/>
      <circle cx="96" cy="128" r="6" fill="#8892b0"/>
      <circle cx="224" cy="128" r="22" fill="#1a1a2e"/>
      <circle cx="224" cy="128" r="14" fill="#2a2a3e"/>
      <circle cx="224" cy="128" r="6" fill="#8892b0"/>
      {/* Headlights */}
      <ellipse cx="264" cy="102" rx="7" ry="4" fill="white" opacity="0.6"/>
      <ellipse cx="56" cy="102" rx="7" ry="4" fill="#ff9500" opacity="0.4"/>
      {/* Grille */}
      <path d="M256 108 L272 108 L272 116 L256 116 Z" fill="#0a0a14" opacity="0.4"/>
    </svg>
  );
}

// ============================================
// VEHICLE CARD — Porsche Drive style
// ============================================
function VehicleCard({ v }: { v: Record<string, unknown> }) {
  const weekly = v.weekly_rate ? Number(v.weekly_rate) : Math.round(Number(v.daily_rate) * 7);
  const isBookable = v.status === "available" || v.status === "limited_availability";

  const carColors: Record<string, string> = {
    Toyota: "#1e3a5f",
    Nissan: "#1a1a4e",
    Ford: "#0a2463",
    default: "#2d3561",
  };
  const carColor = carColors[String(v.make)] ?? carColors.default;

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

        {/* Tags — centered small pills */}
        <div className="flex justify-center gap-1.5 px-6 mb-4 flex-wrap">
          {Boolean(v.work_ready) && (
            <span className="text-[10px] text-[#2952CC] font-semibold px-2 py-0.5 rounded-full border border-[#2952CC]/20 bg-[#2952CC]/05">
              Gig Ready
            </span>
          )}
          {Boolean(v.fuel_efficient) && (
            <span className="text-[10px] text-gray-500 font-semibold px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50">
              Fuel Efficient
            </span>
          )}
        </div>

        {/* Car image — centered, floating */}
        <div className="px-6 pb-4">
          <CarSilhouette color={carColor} />
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
export default async function FleetPage() {
  let vehicles: Record<string, unknown>[] = [];

  try {
    const sql = getDB();
    const rows = await sql`
      SELECT *
      FROM vehicles
      WHERE is_bookable = TRUE
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
        <h1 className="text-3xl font-black text-gray-900 mb-1">Available Fleet</h1>
        <p className="text-gray-500 text-sm">
          Houston, TX · All vehicles are gig-work eligible
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
