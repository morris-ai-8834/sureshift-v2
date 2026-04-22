"use client";

import Link from "next/link";
import Image from "next/image";
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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0D0D0D]/95 backdrop-blur-md border-b border-gray-800/60 shadow-lg shadow-black/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo-dark.jpg"
              alt="SureShift Rentals"
              width={160}
              height={48}
              className="object-contain h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[#7A8B9A] hover:text-white transition-colors duration-200 font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Link
              href="/fleet"
              className="px-5 py-2.5 bg-[#2952CC] text-white text-sm font-bold rounded-xl hover:bg-[#3561e0] transition-all duration-200 hover:shadow-lg hover:shadow-[#2952CC]/30"
            >
              Browse Cars
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 group"
            aria-label="Toggle menu"
          >
            <span
              className={`w-5 h-0.5 bg-white transition-all duration-300 ${
                isOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`w-5 h-0.5 bg-white transition-all duration-300 ${
                isOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`w-5 h-0.5 bg-white transition-all duration-300 ${
                isOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-[#0D0D0D]/98 backdrop-blur-md border-t border-gray-800 px-4 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 text-[#7A8B9A] hover:text-white hover:bg-gray-900 rounded-xl transition-colors text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/fleet"
            onClick={() => setIsOpen(false)}
            className="mt-2 w-full text-center px-4 py-3 bg-[#2952CC] text-white text-sm font-bold rounded-xl hover:bg-[#3561e0] transition-colors"
          >
            Browse Cars
          </Link>
        </div>
      </div>
    </nav>
  );
}
