/**
 * Footer.tsx
 *
 * Clean, minimal footer — matches the light design language.
 * Dark background section to end the page with weight.
 */

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0F] border-t border-white/05">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">

        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <span className="text-xl font-black text-white tracking-tight">
                Sure<span className="text-[#2952CC]">Shift</span>
              </span>
              <span className="ml-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30">
                Rentals
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Reliable weekly rentals for Houston's gig workers and commuters. No credit check. Drive tomorrow.
            </p>
            <div className="mt-6 flex items-center gap-2 text-white/40 text-sm">
              <span>📍</span>
              <span>Houston, TX</span>
            </div>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">Company</h4>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Fleet", href: "/fleet" },
                { label: "How It Works", href: "/#how-it-works" },
                { label: "About", href: "/about" },
                { label: "FAQ", href: "/faq" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/40 hover:text-white/80 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">Contact</h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a href="tel:+18000000000" className="text-white/40 hover:text-white/80 text-sm transition-colors">
                  (800) 000-0000
                </a>
              </li>
              <li>
                <a href="mailto:hello@sureshiftrentals.com" className="text-white/40 hover:text-white/80 text-sm transition-colors">
                  hello@sureshiftrentals.com
                </a>
              </li>
              <li className="pt-2">
                <Link href="/fleet" className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2952CC] text-white text-xs font-semibold rounded-lg hover:bg-[#1e3fa8] transition-colors">
                  Browse Fleet →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 border-t border-white/05 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs">
            © 2026 SureShift Rentals. All rights reserved.
          </p>
          <p className="text-white/25 text-xs">
            Houston, TX · Reliable Cars for the Hustle.
          </p>
        </div>
      </div>
    </footer>
  );
}
