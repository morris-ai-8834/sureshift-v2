import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import VehicleCard from "./components/VehicleCard";
import vehicles from "./data/vehicles";

const featuredVehicles = vehicles.filter((v) => v.status !== "Reserved").slice(0, 3);

const valueProps = [
  {
    icon: "⚡",
    title: "Gig-Worker Approved",
    body: "Every vehicle in our fleet is Uber and Lyft eligible. Drive for the apps, earn from day one.",
  },
  {
    icon: "📋",
    title: "No Credit Check",
    body: "We don't run your credit. All we need is a valid license, deposit, and your drive to hustle.",
  },
  {
    icon: "🔄",
    title: "Flexible Weekly Terms",
    body: "Rent week-by-week with no long-term contract. Scale up or step back on your own schedule.",
  },
  {
    icon: "🛡️",
    title: "Liability Included",
    body: "Basic liability coverage comes with every rental. You're protected from the moment you drive off.",
  },
  {
    icon: "📍",
    title: "Local Houston Team",
    body: "We're not a faceless corporation — we're Houston based, Houston focused, and always reachable.",
  },
  {
    icon: "🚗",
    title: "Well-Maintained Fleet",
    body: "Every vehicle goes through a full inspection before your rental. No surprises, no breakdowns.",
  },
];

const steps = [
  {
    num: "01",
    title: "Browse the Fleet",
    body: "Explore our available vehicles online. Filter by availability and find the right car for your needs.",
  },
  {
    num: "02",
    title: "Reserve Your Car",
    body: "Pick your dates, fill out a quick form, and lock in your vehicle with a refundable deposit.",
  },
  {
    num: "03",
    title: "Sign the Agreement",
    body: "We'll walk you through the rental agreement. Everything is clear — no hidden fees, no surprises.",
  },
  {
    num: "04",
    title: "Drive & Earn",
    body: "Pick up your car and hit the road. You're set up, insured, and ready to stack your earnings.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D0D0D] via-gray-950 to-[#0D0D0D]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#2952CC22,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#2952CC11,_transparent_60%)]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#7A8B9A 1px, transparent 1px), linear-gradient(90deg, #7A8B9A 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2952CC]/15 border border-[#2952CC]/30 text-[#2952CC] text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 bg-[#2952CC] rounded-full animate-pulse" />
            Houston's Gig-Worker Car Rental
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
            Reliable Cars for
            <br />
            <span className="text-[#2952CC]">the Hustle.</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#7A8B9A] max-w-2xl mx-auto leading-relaxed mb-10">
            Flexible weekly rentals designed for Houston's gig workers and commuters. No credit
            check. Uber & Lyft approved. Drive tomorrow.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/fleet"
              className="px-8 py-4 bg-[#2952CC] text-white font-bold rounded-2xl text-lg hover:bg-[#3561e0] transition-all duration-200 hover:shadow-xl hover:shadow-[#2952CC]/40 hover:-translate-y-0.5 w-full sm:w-auto"
            >
              Browse Available Cars
            </Link>
            <Link
              href="tel:8000000000"
              className="px-8 py-4 bg-transparent text-white font-bold rounded-2xl text-lg border border-gray-700 hover:border-gray-500 hover:bg-gray-900/50 transition-all duration-200 w-full sm:w-auto"
            >
              Call (800) 000-0000
            </Link>
          </div>

          {/* Trust signals */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm text-[#7A8B9A]">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-lg">✓</span> No credit check
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-lg">✓</span> Uber & Lyft eligible
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-lg">✓</span> Weekly rates from $275
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-lg">✓</span> Houston local team
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-600 animate-bounce">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Featured Fleet */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[#2952CC] text-sm font-semibold uppercase tracking-widest mb-2">
              Available Now
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Featured Fleet</h2>
          </div>
          <Link
            href="/fleet"
            className="hidden sm:flex items-center gap-2 text-[#7A8B9A] hover:text-white transition-colors text-sm font-medium"
          >
            View all cars
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/fleet" className="text-[#7A8B9A] hover:text-white text-sm font-medium underline">
            View all 6 vehicles →
          </Link>
        </div>
      </section>

      {/* Why SureShift */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#2952CC] text-sm font-semibold uppercase tracking-widest mb-2">
              Why Choose Us
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Built for Drivers Who Mean Business
            </h2>
            <p className="mt-4 text-[#7A8B9A] text-lg max-w-2xl mx-auto">
              We know what it takes to stay on the road and keep earning. Every policy we have was
              designed with you in mind.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {valueProps.map((prop) => (
              <div
                key={prop.title}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-[#2952CC]/30 hover:bg-gray-900/80 transition-all duration-300 group"
              >
                <div className="text-3xl mb-4">{prop.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-[#2952CC] transition-colors">
                  {prop.title}
                </h3>
                <p className="text-[#7A8B9A] text-sm leading-relaxed">{prop.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#2952CC] text-sm font-semibold uppercase tracking-widest mb-2">
              Simple Process
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">How It Works</h2>
            <p className="mt-4 text-[#7A8B9A] text-lg max-w-xl mx-auto">
              From browsing to driving in 4 straightforward steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                {/* Connector */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-[#2952CC]/40 to-transparent z-0 -translate-x-8" />
                )}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative z-10">
                  <div className="text-4xl font-black text-[#2952CC]/30 mb-3">{step.num}</div>
                  <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-[#7A8B9A] text-sm leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#2952CC]/10 border-y border-[#2952CC]/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Ready to Get Behind the Wheel?
          </h2>
          <p className="text-[#7A8B9A] text-lg mb-8 max-w-xl mx-auto">
            Spots go fast. Check availability now and reserve your vehicle before someone else
            does.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/fleet"
              className="px-8 py-4 bg-[#2952CC] text-white font-bold rounded-2xl text-lg hover:bg-[#3561e0] transition-all duration-200 hover:shadow-xl hover:shadow-[#2952CC]/40 w-full sm:w-auto"
            >
              View Available Cars
            </Link>
            <a
              href="tel:8000000000"
              className="px-8 py-4 border border-[#2952CC]/40 text-[#2952CC] font-bold rounded-2xl text-lg hover:bg-[#2952CC]/10 transition-all duration-200 w-full sm:w-auto"
            >
              (800) 000-0000
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
