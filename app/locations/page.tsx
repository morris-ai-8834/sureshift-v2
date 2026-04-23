/**
 * app/locations/page.tsx
 *
 * City selector page — shown before the fleet.
 * Option C: full-screen split with Houston and Dallas.
 * Click a city → goes to /fleet?city=houston or /fleet?city=dallas
 */

import Link from "next/link";
import Navbar from "../components/Navbar";

export default function LocationsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Full screen split */}
      <div className="flex flex-col lg:flex-row min-h-screen pt-16">

        {/* HOUSTON */}
        <Link
          href="/fleet?city=houston"
          className="group relative flex-1 flex flex-col items-center justify-center min-h-[50vh] lg:min-h-screen overflow-hidden cursor-pointer"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-[#0A0A0F] transition-opacity duration-500 group-hover:opacity-90" />

          {/* Houston skyline photo */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-65 transition-opacity duration-500"
            style={{ backgroundImage: "url('/houston-skyline.png')" }}
          />

          {/* Blue tint overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Content */}
          <div className="relative z-10 text-center px-8">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-[0.3em] mb-4">Texas</p>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight">
              Houston
            </h2>
            <p className="text-white/60 text-base mb-8 max-w-xs mx-auto">
              Fleet available now · Gig-worker ready
            </p>

            {/* Available badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/80 text-xs font-semibold">Cars available now</span>
            </div>

            <div className="block">
              <span className="inline-flex items-center gap-2 px-8 py-4 bg-[#2952CC] text-white font-bold rounded-2xl group-hover:bg-[#1e3fa8] transition-colors shadow-lg shadow-[#2952CC]/30 text-sm">
                Browse Houston Fleet
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </div>
          </div>
        </Link>

        {/* Divider — vertical on desktop, horizontal on mobile */}
        <div className="hidden lg:block w-px bg-white/10 relative z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg z-20">
            <span className="text-xs font-black text-gray-900">OR</span>
          </div>
        </div>
        <div className="lg:hidden h-px bg-white/10 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg z-20">
            <span className="text-xs font-black text-gray-900">OR</span>
          </div>
        </div>

        {/* DALLAS */}
        <Link
          href="/fleet?city=dallas"
          className="group relative flex-1 flex flex-col items-center justify-center min-h-[50vh] lg:min-h-screen overflow-hidden cursor-pointer"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-[#0A0F1A] transition-opacity duration-500 group-hover:opacity-90" />

          {/* Dallas skyline photo */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-65 transition-opacity duration-500"
            style={{ backgroundImage: "url('/dallas-skyline.png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Content */}
          <div className="relative z-10 text-center px-8">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-[0.3em] mb-4">Texas</p>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight">
              Dallas
            </h2>
            <p className="text-white/60 text-base mb-8 max-w-xs mx-auto">
              Coming soon · Join the waitlist
            </p>

            {/* Coming soon badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-white/80 text-xs font-semibold">Launching soon</span>
            </div>

            <div className="block">
              <span className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-2xl group-hover:bg-white/15 transition-colors text-sm backdrop-blur-sm">
                View Dallas Fleet
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
