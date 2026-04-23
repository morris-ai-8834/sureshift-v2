import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

const values = [
  {
    icon: "🤝",
    title: "Transparency",
    body: "No hidden fees. No bait-and-switch rates. What you see is what you pay. We believe you can't build trust on fine print.",
  },
  {
    icon: "💪",
    title: "Driver First",
    body: "Every decision we make starts with the question: does this help our drivers earn more? If the answer is no, we don't do it.",
  },
  {
    icon: "🔧",
    title: "Maintained & Ready",
    body: "Every vehicle is fully inspected and serviced before your rental. We don't send you out in a car we wouldn't drive ourselves.",
  },
];

const team = [
  {
    initials: "MJ",
    name: "Marcus J.",
    role: "Founder & Operator",
    bio: "Former rideshare driver who built SureShift after struggling to find a reliable, honest rental for gig work in Houston. Now he makes sure no driver has to go through what he did.",
  },
  {
    initials: "TW",
    name: "Tamika W.",
    role: "Customer Relations",
    bio: "Tamika keeps our drivers happy and our operations smooth. She knows every customer by name and takes pride in getting answers fast.",
  },
  {
    initials: "RV",
    name: "Ray V.",
    role: "Fleet & Maintenance",
    bio: "20 years of auto mechanics. Ray personally signs off on every vehicle before it leaves our lot. If Ray doesn't approve, the car doesn't go out.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0D0D0D] to-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#2952CC] text-sm font-semibold uppercase tracking-widest mb-3">
            Our Story
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
            Built by Drivers,<br />
            <span className="text-[#2952CC]">for Drivers.</span>
          </h1>
          <p className="text-lg text-[#7A8B9A] leading-relaxed max-w-2xl mx-auto">
            SureShift Rentals was born in Houston out of frustration — the frustration of needing a
            reliable vehicle to earn a living and getting burned by corporate rental companies that
            don't care about gig workers.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-invert max-w-none text-[#7A8B9A] leading-relaxed space-y-5 text-base">
            <p>
              When our founder started driving for rideshare platforms in Houston, the biggest
              obstacle wasn't finding rides — it was finding a car. Traditional rental companies
              either prohibited rideshare use or charged a premium that made it nearly impossible
              to turn a profit. Credit checks, minimum age requirements, and rigid contracts made
              it even harder.
            </p>
            <p>
              SureShift Rentals was built to solve that problem. We offer weekly rentals with no
              credit check, no long-term contracts, and vehicles that are fully approved for Uber
              and Lyft. We designed every part of our process around the reality of what gig
              workers actually need.
            </p>
            <p>
              Today, we're proud to serve Houston and Dallas's hardworking communities of drivers, commuters,
              and hustle-getters. Every vehicle in our fleet is well-maintained, inspected, and
              ready to work as hard as you do.
            </p>
            <p className="text-white font-medium">
              We're local, we're honest, and we're here to help you earn.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-950/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-10">
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{v.title}</h3>
                <p className="text-[#7A8B9A] text-sm leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-10">
            The Team Behind SureShift
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4"
              >
                <div className="w-14 h-14 bg-[#2952CC] rounded-2xl flex items-center justify-center">
                  <span className="text-white font-black text-lg">{member.initials}</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{member.name}</h3>
                  <p className="text-[#2952CC] text-sm font-medium">{member.role}</p>
                </div>
                <p className="text-[#7A8B9A] text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#2952CC]/10 border-y border-[#2952CC]/20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: "200+", label: "Rentals Completed" },
              { value: "6", label: "Vehicles in Fleet" },
              { value: "4.9★", label: "Average Rating" },
              { value: "Houston & Dallas", label: "Serving Texas" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl sm:text-4xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-[#7A8B9A] text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            Ready to Drive with SureShift?
          </h2>
          <p className="text-[#7A8B9A] mb-8">
            Browse our fleet or give us a call. We're here to get you on the road.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/fleet"
              className="px-8 py-4 bg-[#2952CC] text-white font-bold rounded-2xl hover:bg-[#3561e0] transition-colors"
            >
              Browse the Fleet
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 border border-gray-700 text-[#7A8B9A] font-bold rounded-2xl hover:border-gray-500 hover:text-white transition-colors"
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
