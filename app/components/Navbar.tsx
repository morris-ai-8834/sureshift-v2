"use client";

/**
 * Navbar.tsx
 *
 * Global navigation bar for SureShift Rentals.
 *
 * Design: Clean white/light background on scroll, transparent over hero.
 * On light pages it transitions to white with a subtle shadow.
 * Primary CTA always visible on desktop.
 */

import Link from "next/link";
import { useState, useEffect } from "react";

const navLinks = [
  { label: "Fleet", href: "/fleet" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-4">

          {/* Logo wordmark */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center">
              <span className={`text-xl font-black tracking-tight transition-colors duration-300 ${scrolled ? "text-gray-900" : "text-white"}`}>
                Sure<span className="text-[#2952CC]">Shift</span>
              </span>
              <span className={`ml-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors duration-300 ${scrolled ? "text-gray-400" : "text-white/50"}`}>
                Rentals
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  scrolled
                    ? "text-gray-500 hover:text-gray-900"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/portal"
              className={`text-sm font-medium transition-colors duration-200 ${
                scrolled ? "text-gray-500 hover:text-gray-900" : "text-white/70 hover:text-white"
              }`}
            >
              My Reservation
            </Link>
            <Link
              href="/fleet"
              className="px-5 py-2.5 bg-[#2952CC] text-white text-sm font-semibold rounded-lg hover:bg-[#1e3fa8] transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-[#2952CC]/20"
            >
              Browse Fleet
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg"
            aria-label="Toggle menu"
          >
            <div className="w-5 flex flex-col gap-1.5">
              <span className={`block h-0.5 transition-all duration-300 ${scrolled ? "bg-gray-900" : "bg-white"} ${isOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 transition-all duration-300 ${scrolled ? "bg-gray-900" : "bg-white"} ${isOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 transition-all duration-300 ${scrolled ? "bg-gray-900" : "bg-white"} ${isOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${isOpen ? "max-h-80" : "max-h-0"}`}>
        <div className="bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="px-3 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
            <Link href="/portal" onClick={() => setIsOpen(false)} className="px-3 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors text-center">
              My Reservation
            </Link>
            <Link href="/fleet" onClick={() => setIsOpen(false)} className="w-full text-center px-4 py-3 bg-[#2952CC] text-white text-sm font-semibold rounded-lg hover:bg-[#1e3fa8] transition-colors">
              Browse Fleet
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
