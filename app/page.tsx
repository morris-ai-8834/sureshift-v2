/**
 * page.tsx — SureShift Rentals Homepage
 *
 * Design direction:
 * - Light/white overall feel (Porsche Drive influence)
 * - Dark hero section with full-bleed automotive energy (Linear influence)
 * - Turo-style fleet preview cards
 * - Clean sections with generous whitespace
 * - Premium but approachable — built for gig workers, feels trustworthy
 */

import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import VehicleCard from "./components/VehicleCard";
import vehicles from "./data/vehicles";

const featuredVehicles = vehicles.filter((v) => v.status !== "Reserved").slice(0, 3);

const valueProps = [
  {
    icon: "✓",
    title: "No Credit Check",
    body: "Valid license, deposit, and your drive to hustle. That's all we need.",
  },
  {
    icon: "⚡",
    title: "Uber & Lyft Approved",
    body: "Every vehicle is eligible for rideshare platforms from day one.",
  },
  {
    icon: "🔄",
    title: "Week-by-Week Terms",
    body: "No long-term commitment. Rent weekly and adjust as your needs change.",
  },
  {
    icon: "🛡️",
    title: "Liability Included",
    body: "Basic liability coverage is built into every rental. You're covered.",
  },
  {
    icon: "📍",
    title: "Houston Local",
    body: "We're a real Houston team — not a faceless platform. Call us directly.",
  },
  {
    icon: "🔧",
    title: "Inspected Fleet",
    body: "Every vehicle is mechanically inspected before it reaches your hands.",
  },
];

const steps = [
  {
    num: "01",
    title: "Browse Available Cars",
    body: "Filter our fleet by availability, vehicle type, and weekly rate.",
  },
  {
    num: "02",
    title: "Reserve with Deposit",
    body: "Submit your info and lock in your vehicle with a simple deposit.",
  },
  {
    num: "03",
    title: "Sign Digitally",
    body: "Review and sign your rental agreement online — no paperwork needed.",
  },
  {
    num: "04",
    title: "Pick Up & Drive",
    body: "Show your license, do a quick walk-around, and you're on the road.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ============================================
          HERO — Dark, cinematic, automotive
          ============================================ */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0A0A0F]">

        {/* Subtle blue glow top right */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#2952CC]/10 rounded-full blur-[120px] pointer-events-none" />
        {/* Subtle blue glow bottom left */}
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#2952CC]/06 rounded-full blur-[100px] pointer-events-none" />

        {/* Fine grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-24">
          <div className="max-w-3xl">

            {/* Location pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/60 text-xs font-medium tracking-wide uppercase">Houston, TX · Available Now</span>
            </div>

            {/* Main headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
              Reliable cars<br />
              for the{" "}
              <span className="text-[#2952CC]">hustle.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-white/50 max-w-xl leading-relaxed mb-10 font-light">
              Weekly rentals built for Houston's gig workers and commuters. No credit check. Uber & Lyft eligible. Drive as early as tomorrow.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/fleet"
                className="inline-flex items-center gap-2 px-7 py-4 bg-[#2952CC] text-white font-semibold rounded-xl hover:bg-[#1e3fa8] transition-all duration-200 shadow-lg shadow-[#2952CC]/25 hover:shadow-[#2952CC]/40 text-sm"
              >
                View Available Cars
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <Link
                href="/#how-it-works"
                className="inline-flex items-center gap-2 px-7 py-4 text-white/60 hover:text-white font-medium rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 text-sm"
              >
                How it works
              </Link>
            </div>

            {/* Social proof strip */}
            <div className="flex flex-wrap items-center gap-6 mt-14 pt-10 border-t border-white/08">
              {[
                { value: "$275", label: "Weekly from" },
                { value: "0", label: "Credit checks" },
                { value: "24hr", label: "Approval time" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-xs text-white/40 mt-0.5 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade to white */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white pointer-events-none" />
      </section>

      {/* ============================================
          FLEET PREVIEW — Turo-style cards on white
          ============================================ */}
      <section className="bg-white py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Section header */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[#2952CC] text-sm font-semibold uppercase tracking-widest mb-2">Available Now</p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Featured Fleet</h2>
            </div>
            <Link href="/fleet" className="hidden sm:flex items-center gap-1.5 text-sm text-[#2952CC] font-semibold hover:gap-3 transition-all duration-200">
              View all cars
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>

          <div className="mt-10 text-center sm:hidden">
            <Link href="/fleet" className="inline-flex items-center gap-2 text-sm text-[#2952CC] font-semibold">
              View all available cars →
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          WHY SURESHIFT — Light grey section
          ============================================ */}
      <section className="bg-gray-50 py-24 px-6 lg:px-8 border-y border-gray-100">
        <div className="max-w-7xl mx-auto">

          <div className="max-w-xl mb-16">
            <p className="text-[#2952CC] text-sm font-semibold uppercase tracking-widest mb-3">Why SureShift</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
              Built for drivers<br />who mean business.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {valueProps.map((prop) => (
              <div key={prop.title} className="group">
                <div className="w-10 h-10 rounded-xl bg-[#2952CC]/08 flex items-center justify-center text-[#2952CC] text-lg font-bold mb-4 group-hover:bg-[#2952CC]/15 transition-colors">
                  {prop.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{prop.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{prop.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS — White, minimal numbered steps
          ============================================ */}
      <section id="how-it-works" className="bg-white py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          <div className="max-w-xl mb-16">
            <p className="text-[#2952CC] text-sm font-semibold uppercase tracking-widest mb-3">Process</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              From browse to keys<br />in four steps.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-[calc(50%+24px)] right-[-calc(50%-24px)] h-px bg-gray-100" />
                )}
                <div className="text-5xl font-black text-gray-100 mb-4 leading-none">{step.num}</div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          CTA STRIP — Dark section, clean and confident
          ============================================ */}
      <section className="bg-[#0A0A0F] py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
              Ready to get on the road?
            </h2>
            <p className="text-white/40 text-base">Browse available vehicles and reserve online in minutes.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              href="/fleet"
              className="px-8 py-4 bg-[#2952CC] text-white font-semibold rounded-xl hover:bg-[#1e3fa8] transition-all duration-200 text-sm text-center shadow-lg shadow-[#2952CC]/25"
            >
              View Available Cars
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 text-white/60 hover:text-white border border-white/10 hover:border-white/20 font-medium rounded-xl transition-all duration-200 text-sm text-center"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
