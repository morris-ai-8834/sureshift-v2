/**
 * app/fleet/[id]/page.tsx
 *
 * Vehicle detail page — closely modeled after Turo's mobile vehicle detail.
 *
 * Sections (in order):
 * 1. Full-bleed hero photo + scroll-aware top nav
 * 2. Car name / trim / rating
 * 3. Your trip (dates + location)
 * 4. Trip savings
 * 5. Cancellation policy
 * 6. Payment options
 * 7. Miles included
 * 8. Insurance & Protection
 * 9. Vehicle features (pill chips)
 * 10. Safety features (plain list)
 * 11. Device connectivity (plain list)
 * 12. See all features button
 * 13. Included in the price (Convenience + Peace of mind)
 * 14. Ratings & reviews (bars + review cards)
 * 15. Sticky bottom bar
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";

// ============================================
// PAGE — client component so we can do scroll effects
// ============================================
export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = String(params.id);

  const [vehicle, setVehicle] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch(`/api/vehicles/${slug}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { setVehicle(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 300);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2952CC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Vehicle not found.</p>
        <Link href="/fleet" className="text-[#2952CC] font-semibold text-sm">← Back to fleet</Link>
      </div>
    );
  }

  const weekly = vehicle.weekly_rate ? Number(vehicle.weekly_rate) : Math.round(Number(vehicle.daily_rate) * 7);
  const originalWeekly = Math.round(weekly * 1.03);
  const deposit = Number(vehicle.deposit_amount);
  const isBookable = vehicle.status === "available" || vehicle.status === "limited_availability";

  const gradients: Record<string, string> = {
    Toyota: "from-slate-600 to-slate-800",
    Nissan: "from-blue-700 to-slate-800",
    Ford: "from-blue-800 to-slate-900",
    default: "from-gray-600 to-gray-800",
  };
  const gradient = gradients[String(vehicle.make)] ?? gradients.default;

  const featureChips = [
    { icon: "👤", label: `${String(vehicle.seats)} seats` },
    { icon: "⚡", label: String(vehicle.fuel_type) },
    { icon: "⚙️", label: String(vehicle.transmission) },
    vehicle.mpg_city ? { icon: "🔋", label: `${String(vehicle.mpg_city)} mpg city` } : null,
    vehicle.mpg_highway ? { icon: "🛣️", label: `${String(vehicle.mpg_highway)} mpg hwy` } : null,
  ].filter(Boolean) as { icon: string; label: string }[];

  const safetyFeatures = ["Backup camera", "Tire pressure monitoring", "Forward collision warning", "Anti-lock brakes"];
  const connectivity = ["Bluetooth", "USB charger", "Apple CarPlay compatible", "Android Auto compatible"];

  const allFeatures = [...featureChips.map(f => f.label), ...safetyFeatures, ...connectivity];
  const visibleFeatureCount = 4;

  const reviews = [
    { name: "Marcus T.", date: "Apr 2026", rating: 5, text: "Great car, smooth ride. Perfect for Uber. Would rent again!" },
    { name: "Denise R.", date: "Mar 2026", rating: 5, text: "Clean, reliable, and easy pickup. Exactly what I needed." },
    { name: "Jordan P.", date: "Feb 2026", rating: 5, text: "No issues at all. Would highly recommend for gig workers." },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ---- SCROLL-AWARE TOP NAV ---- */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? "bg-white border-b border-gray-100 shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <button onClick={() => router.back()} className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${scrolled ? "bg-gray-100 hover:bg-gray-200" : "bg-black/40 hover:bg-black/60 backdrop-blur-sm"}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={scrolled ? "#111" : "white"} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>

          {scrolled && (
            <span className="text-sm font-bold text-gray-900 truncate max-w-[200px]">
              {String(vehicle.make)} {String(vehicle.model)}
            </span>
          )}

          <div className="flex items-center gap-2">
            <button className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${scrolled ? "bg-gray-100 hover:bg-gray-200" : "bg-black/40 hover:bg-black/60 backdrop-blur-sm"}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={scrolled ? "#111" : "white"} strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </button>
            <button className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${scrolled ? "bg-gray-100 hover:bg-gray-200" : "bg-black/40 hover:bg-black/60 backdrop-blur-sm"}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={scrolled ? "#111" : "white"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* ---- HERO IMAGE ---- */}
      <div className={`w-full aspect-[4/3] bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden relative`}>
        <svg className="w-48 h-32 text-white opacity-15" viewBox="0 0 200 120" fill="none">
          <path d="M20 75 L40 45 Q52 32 68 30 L132 30 Q148 32 160 45 L180 75 L186 92 L14 92 Z" fill="currentColor"/>
          <circle cx="55" cy="92" r="18" fill="none" stroke="white" strokeWidth="4"/>
          <circle cx="145" cy="92" r="18" fill="none" stroke="white" strokeWidth="4"/>
          <path d="M68 50 L85 36 L115 36 L132 50 Z" fill="white" fillOpacity="0.3"/>
        </svg>
        <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
          1 of 1
        </div>
      </div>

      {/* ---- CONTENT ---- */}
      <div className="max-w-2xl mx-auto px-5 pb-32">

        {/* Car name + rating */}
        <div className="pt-5 pb-5 border-b border-gray-100">
          <h1 className="text-2xl font-black text-gray-900">
            {String(vehicle.year)} {String(vehicle.make)} {String(vehicle.model)}
          </h1>
          {Boolean(vehicle.trim) && <p className="text-gray-500 text-sm mt-0.5">{String(vehicle.trim)}</p>}
          <div className="flex items-center gap-1.5 mt-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#2952CC"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span className="text-sm font-bold text-gray-900">4.97</span>
            <span className="text-sm text-gray-400">(12 rentals)</span>
          </div>
        </div>

        {/* Your trip */}
        <div className="py-5 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900 mb-4">Your trip</h2>
          <div className="space-y-0 divide-y divide-gray-100">
            <div className="flex items-start gap-4 py-4">
              <div className="text-gray-400 mt-0.5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-900">Trip dates</div>
                <div className="text-sm text-gray-500 mt-0.5">Select pickup and return dates</div>
              </div>
              <Link href={`/book?vehicle=${String(vehicle.slug)}`}>
                <div className="w-9 h-9 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </div>
              </Link>
            </div>
            <div className="flex items-start gap-4 py-4">
              <div className="text-gray-400 mt-0.5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-900">Pickup &amp; return location</div>
                <div className="text-sm text-gray-500 mt-0.5">{String(vehicle.location_name)}, Houston, TX</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trip savings */}
        <div className="py-5 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900 mb-4">Trip savings</h2>
          <div className="flex items-center justify-between px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl">
            <span className="text-sm text-gray-700 font-medium">7+ day discount</span>
            <span className="text-sm font-bold text-emerald-600">-$15</span>
          </div>
        </div>

        {/* Cancellation policy */}
        <div className="py-5 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900 mb-4">Cancellation policy</h2>
          <div className="flex items-start gap-4">
            <div className="text-gray-400 mt-0.5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/></svg>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">Contact us to cancel</div>
              <div className="text-sm text-gray-500 mt-0.5">Call or email us to discuss cancellation before your trip starts</div>
            </div>
          </div>
        </div>

        {/* Payment options */}
        <div className="py-5 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900 mb-4">Payment options</h2>
          <div className="flex items-start gap-4">
            <div className="text-gray-400 mt-0.5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">Reserve with deposit</div>
              <div className="text-sm text-gray-500 mt-0.5">${deposit} refundable deposit secures your vehicle. Balance due at pickup.</div>
            </div>
          </div>
        </div>

        {/* Miles included */}
        <div className="py-5 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900 mb-4">Miles included</h2>
          <div className="flex items-start gap-4">
            <div className="text-gray-400 mt-0.5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">Unlimited miles</div>
              <div className="text-sm text-gray-500 mt-0.5">No mileage cap on any SureShift rental</div>
            </div>
          </div>
        </div>

        {/* Insurance */}
        <div className="py-5 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900 mb-4">Insurance &amp; Protection</h2>
          <div className="flex items-start gap-4">
            <div className="text-gray-400 mt-0.5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-gray-900">Liability coverage included</div>
              <div className="text-sm text-gray-500 mt-0.5">Basic liability is built into every rental</div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </button>
          </div>
        </div>

        {/* Vehicle features */}
        <div className="py-5 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900 mb-4">Vehicle features</h2>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            {featureChips.map((chip) => (
              <span key={chip.label} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 font-medium">
                <span>{chip.icon}</span>
                {chip.label}
              </span>
            ))}
          </div>

          {/* Safety */}
          <div className="mb-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Safety</h3>
            <ul className="space-y-2">
              {safetyFeatures.map((f) => (
                <li key={f} className="text-sm text-gray-600">{f}</li>
              ))}
            </ul>
          </div>

          {/* Device connectivity */}
          {showAllFeatures && (
            <div className="mb-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Device connectivity</h3>
              <ul className="space-y-2">
                {connectivity.map((f) => (
                  <li key={f} className="text-sm text-gray-600">{f}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => setShowAllFeatures(!showAllFeatures)}
            className="w-full mt-2 py-3.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {showAllFeatures ? "Show fewer features" : `See all ${allFeatures.length} features`}
          </button>
        </div>

        {/* Included in the price */}
        <div className="py-5 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900 mb-4">Included in the price</h2>

          <h3 className="text-sm font-bold text-gray-900 mb-4">Convenience</h3>
          <div className="space-y-5 mb-6">
            {[
              { icon: "🚗", title: "Skip the rental counter", desc: "Reserve online and receive pickup instructions directly" },
              { icon: "📋", title: "Digital rental agreement", desc: "Review and sign your agreement before pickup" },
              { icon: "⏱️", title: "Flexible pickup window", desc: "Coordinate your exact pickup time with us directly" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <span className="text-lg mt-0.5">{item.icon}</span>
                <div>
                  <div className="text-sm font-bold text-gray-900">{item.title}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-bold text-gray-900 mb-4">Peace of mind</h3>
          <div className="space-y-5">
            {[
              { icon: "✨", title: "Keep it tidy", desc: "No car wash required, but please return it clean" },
              { icon: "🛟", title: "Roadside support", desc: "Call us anytime during your rental" },
              { icon: "💬", title: "24/7 customer support", desc: "We're always reachable by phone or email" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <span className="text-lg mt-0.5">{item.icon}</span>
                <div>
                  <div className="text-sm font-bold text-gray-900">{item.title}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ratings & reviews */}
        <div className="py-5">
          <h2 className="text-lg font-black text-gray-900 mb-4">Ratings and reviews</h2>

          <div className="flex items-center gap-2 mb-5">
            <span className="text-3xl font-black text-gray-900">4.97</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#2952CC"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span className="text-sm text-gray-400">(12 ratings)</span>
          </div>

          {/* Rating bars */}
          <div className="space-y-2.5 mb-6">
            {[
              { label: "Cleanliness", score: 5.0 },
              { label: "Maintenance", score: 5.0 },
              { label: "Communication", score: 5.0 },
              { label: "Convenience", score: 4.9 },
              { label: "Accuracy", score: 5.0 },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-32">{r.label}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#2952CC] rounded-full" style={{ width: `${(r.score / 5) * 100}%` }} />
                </div>
                <span className="text-sm text-gray-500 w-8 text-right">{r.score}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mb-6">Based on 12 renter ratings</p>

          {/* Review cards — horizontal scroll */}
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            {reviews.map((review) => (
              <div key={review.name} className="flex-shrink-0 w-72 border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#2952CC]/10 flex items-center justify-center text-[#2952CC] font-bold text-sm">
                    {review.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{review.name}</div>
                    <div className="text-xs text-gray-400">{review.date}</div>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#2952CC"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- STICKY BOTTOM BAR ---- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4 z-40 shadow-lg shadow-black/05">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-gray-400 line-through">${originalWeekly}</span>
              <span className="text-xl font-black text-gray-900">${weekly} <span className="text-sm font-normal text-gray-500">total</span></span>
            </div>
            <div className="text-xs text-gray-400">Before taxes · ${deposit} deposit</div>
          </div>
          {isBookable ? (
            <Link
              href={`/book?vehicle=${String(vehicle.slug)}`}
              className="px-8 py-3.5 bg-[#2952CC] text-white font-bold rounded-2xl hover:bg-[#1e3fa8] transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-[#2952CC]/25 text-sm"
            >
              Continue
            </Link>
          ) : (
            <div className="px-8 py-3.5 bg-gray-100 text-gray-400 font-bold rounded-2xl text-sm">Reserved</div>
          )}
        </div>
      </div>
    </div>
  );
}
