/**
 * app/fleet/[id]/page.tsx
 *
 * Vehicle detail page — modeled after Turo's mobile vehicle detail layout.
 *
 * Layout:
 * - Full-bleed hero photo
 * - Car name, rating, trip count
 * - "Your rental" section (dates + location)
 * - Sticky bottom bar with price + CTA
 * - Content sections with clean dividers:
 *   miles policy, insurance, features, included, cancellation, ratings
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { getDB } from "@/lib/db";

// ============================================
// STATIC PARAMS — pre-render all vehicle slugs
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
// ICON COMPONENTS — outline style like Turo
// ============================================
function IconMiles() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function IconCar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a2 2 0 01-2-2V9l3-4h12l3 4v6a2 2 0 01-2 2h-2"/>
      <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>
    </svg>
  );
}
function IconStar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#2952CC" stroke="#2952CC" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
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

  let vehicle: Record<string, unknown> | null = null;
  try {
    const sql = getDB();
    const rows = await sql`
      SELECT * FROM vehicles WHERE slug = ${id} LIMIT 1
    `;
    vehicle = (rows[0] as Record<string, unknown>) ?? null;
  } catch (err) {
    console.error("[VehicleDetail] DB error:", err);
  }

  if (!vehicle) notFound();

  const weekly = vehicle.weekly_rate
    ? Number(vehicle.weekly_rate)
    : Math.round(Number(vehicle.daily_rate) * 7);
  const daily = Number(vehicle.daily_rate);
  const deposit = Number(vehicle.deposit_amount);
  const isBookable = vehicle.status === "available" || vehicle.status === "limited_availability";

  const gradients: Record<string, string> = {
    Toyota: "from-slate-600 to-slate-800",
    Nissan: "from-blue-700 to-slate-800",
    Ford: "from-blue-800 to-slate-900",
    default: "from-gray-600 to-gray-800",
  };
  const gradient = gradients[String(vehicle.make)] ?? gradients.default;

  // Feature chips
  const featureChips = [
    `${String(vehicle.seats)} seats`,
    String(vehicle.transmission),
    String(vehicle.fuel_type),
    vehicle.mpg_city ? `${String(vehicle.mpg_city)} mpg city` : null,
    vehicle.mpg_highway ? `${String(vehicle.mpg_highway)} mpg hwy` : null,
  ].filter(Boolean) as string[];

  // Tags
  const tags: string[] = [];
  if (vehicle.work_ready) tags.push("Gig Work Ready");
  if (vehicle.commuter_friendly) tags.push("Commuter Friendly");
  if (vehicle.fuel_efficient) tags.push("Fuel Efficient");

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      {/* ---- HERO IMAGE ---- */}
      <div className="relative pt-16">
        <div className={`w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
          <svg className="w-48 h-32 sm:w-64 sm:h-44 text-white opacity-15" viewBox="0 0 200 120" fill="none">
            <path d="M20 75 L40 45 Q52 32 68 30 L132 30 Q148 32 160 45 L180 75 L186 92 L14 92 Z" fill="currentColor"/>
            <circle cx="55" cy="92" r="18" fill="none" stroke="white" strokeWidth="4"/>
            <circle cx="145" cy="92" r="18" fill="none" stroke="white" strokeWidth="4"/>
            <path d="M68 50 L85 36 L115 36 L132 50 Z" fill="white" fillOpacity="0.3"/>
          </svg>
          {/* Photo counter badge */}
          <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
            1 of 1
          </div>
          {/* Back button */}
          <Link href="/fleet" className="absolute top-4 left-4 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </Link>
        </div>
      </div>

      {/* ---- MAIN CONTENT ---- */}
      <div className="max-w-2xl mx-auto px-5 pb-32">

        {/* Car title + rating */}
        <div className="pt-6 pb-5 border-b border-gray-100">
          <h1 className="text-2xl font-black text-gray-900 mb-0.5">
            {String(vehicle.year)} {String(vehicle.make)} {String(vehicle.model)}
            {Boolean(vehicle.trim) && <span className="font-normal text-gray-500"> {String(vehicle.trim)}</span>}
          </h1>
          <div className="flex items-center gap-1.5 mt-1">
            <IconStar />
            <span className="text-sm font-bold text-gray-900">4.9</span>
            <span className="text-sm text-gray-400">(12 rentals)</span>
          </div>
        </div>

        {/* Your rental section */}
        <div className="py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4">Your rental</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">Rental period</div>
                <div className="text-sm text-gray-500 mt-0.5">Weekly rentals · flexible start date</div>
              </div>
              <Link href={`/book?vehicle=${String(vehicle.slug)}`} className="text-sm text-[#2952CC] font-semibold">
                Select dates
              </Link>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">Pickup & return</div>
                <div className="text-sm text-gray-500 mt-0.5">{String(vehicle.location_name)}, Houston TX</div>
              </div>
            </div>
          </div>
        </div>

        {/* Miles included */}
        <div className="py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4">Miles included</h2>
          <div className="flex items-start gap-3">
            <div className="text-gray-400 mt-0.5"><IconMiles /></div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Unlimited miles</div>
              <div className="text-sm text-gray-500">Drive as much as you need with no mileage cap</div>
            </div>
          </div>
        </div>

        {/* Insurance */}
        <div className="py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4">Insurance &amp; Protection</h2>
          <div className="flex items-start gap-3">
            <div className="text-gray-400 mt-0.5"><IconShield /></div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Liability coverage included</div>
              <div className="text-sm text-gray-500">Basic liability is built into every SureShift rental at no extra charge</div>
            </div>
          </div>
        </div>

        {/* Vehicle features */}
        <div className="py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4">Vehicle features</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {featureChips.map((chip) => (
              <span key={chip} className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium">
                <IconCar />
                {chip}
              </span>
            ))}
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="px-3 py-1.5 bg-[#2952CC]/08 text-[#2952CC] border border-[#2952CC]/15 rounded-xl text-xs font-semibold">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* What&apos;s included */}
        <div className="py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4">Included in the price</h2>
          <div className="space-y-4">
            {[
              { title: "Skip the rental counter", desc: "Reserve online and get pickup instructions directly" },
              { title: "Digital rental agreement", desc: "Review and sign your agreement online before pickup" },
              { title: "Liability coverage", desc: "Basic liability included in every rental" },
              { title: "Roadside support", desc: "Call us anytime during your rental at (800) 000-0000" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="text-gray-400 mt-0.5"><IconCheck /></div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cancellation */}
        <div className="py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4">Cancellation policy</h2>
          <div className="flex items-start gap-3">
            <div className="text-gray-400 mt-0.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/></svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Contact us to cancel</div>
              <div className="text-sm text-gray-500">Call (800) 000-0000 or email hello@sureshiftrentals.com to discuss cancellation terms</div>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4">Payment</h2>
          <div className="flex items-start gap-3">
            <div className="text-gray-400 mt-0.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Deposit to reserve</div>
              <div className="text-sm text-gray-500">${deposit} refundable deposit locks in your vehicle. Balance due at pickup.</div>
            </div>
          </div>
        </div>

        {/* Ratings */}
        <div className="py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4">Ratings &amp; reviews</h2>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl font-black text-gray-900">4.9</span>
            <IconStar />
            <span className="text-sm text-gray-400">(12 rentals)</span>
          </div>
          {[
            { label: "Cleanliness", score: 5.0 },
            { label: "Maintenance", score: 4.9 },
            { label: "Communication", score: 5.0 },
            { label: "Accuracy", score: 4.9 },
          ].map((r) => (
            <div key={r.label} className="flex items-center gap-3 mb-2">
              <span className="text-sm text-gray-600 w-32">{r.label}</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#2952CC] rounded-full" style={{ width: `${(r.score / 5) * 100}%` }} />
              </div>
              <span className="text-sm text-gray-500 w-8 text-right">{r.score}</span>
            </div>
          ))}
        </div>

        {/* Requirements note */}
        {Boolean(vehicle.requirements_note) && (
          <div className="py-5 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-3">Additional requirements</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{String(vehicle.requirements_note)}</p>
          </div>
        )}

        {/* Description */}
        <div className="py-5">
          <h2 className="text-base font-bold text-gray-900 mb-3">About this vehicle</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{String(vehicle.description_short)}</p>
        </div>
      </div>

      {/* ---- STICKY BOTTOM BAR ---- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4 z-40 shadow-lg shadow-black/05">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-gray-900">${weekly}</span>
              <span className="text-sm text-gray-400">/week</span>
            </div>
            <div className="text-xs text-gray-400">${deposit} deposit · before taxes</div>
          </div>
          {isBookable ? (
            <Link
              href={`/book?vehicle=${String(vehicle.slug)}`}
              className="px-8 py-3.5 bg-[#2952CC] text-white font-bold rounded-xl hover:bg-[#1e3fa8] transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-[#2952CC]/25 text-sm"
            >
              Continue
            </Link>
          ) : (
            <div className="px-8 py-3.5 bg-gray-100 text-gray-400 font-bold rounded-xl text-sm">
              Reserved
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
