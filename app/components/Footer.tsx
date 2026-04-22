import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-[#2952CC] rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">SS</span>
              </div>
              <span className="font-bold text-white text-lg tracking-tight">
                SureShift<span className="text-[#2952CC]"> Rentals</span>
              </span>
            </Link>
            <p className="text-[#7A8B9A] text-sm leading-relaxed max-w-sm">
              Reliable cars for the hustle. Houston's trusted weekly rental partner for gig workers,
              commuters, and anyone who needs to keep moving.
            </p>
            <div className="mt-4 flex flex-col gap-1.5">
              <a
                href="tel:8000000000"
                className="text-sm text-[#7A8B9A] hover:text-white transition-colors flex items-center gap-2"
              >
                <span>📞</span> (800) 000-0000
              </a>
              <a
                href="mailto:hello@sureshiftrentals.com"
                className="text-sm text-[#7A8B9A] hover:text-white transition-colors flex items-center gap-2"
              >
                <span>✉️</span> hello@sureshiftrentals.com
              </a>
              <span className="text-sm text-[#7A8B9A] flex items-center gap-2">
                <span>📍</span> Houston, TX
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <div className="flex flex-col gap-2">
              {[
                { label: "Browse Fleet", href: "/fleet" },
                { label: "Book a Car", href: "/book" },
                { label: "How It Works", href: "/#how-it-works" },
                { label: "About Us", href: "/about" },
                { label: "Customer Portal", href: "/portal" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[#7A8B9A] hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Support
            </h4>
            <div className="flex flex-col gap-2">
              {[
                { label: "FAQ", href: "/faq" },
                { label: "Contact Us", href: "/contact" },
                { label: "Rental Requirements", href: "/faq#requirements" },
                { label: "Payment Info", href: "/faq#payment" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[#7A8B9A] hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} SureShift Rentals. All rights reserved. Houston, TX.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
