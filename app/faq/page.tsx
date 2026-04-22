"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

const faqs = [
  {
    id: "requirements",
    category: "Requirements",
    question: "What do I need to rent a car from SureShift?",
    answer:
      "You'll need a valid Texas driver's license, to be at least 21 years old (23+ for premium vehicles), a refundable deposit (typically $300–$400), and no major traffic violations in the past 3 years. We do NOT run a credit check.",
  },
  {
    id: "gig-work",
    category: "Gig Work",
    question: "Can I use your vehicles for Uber or Lyft?",
    answer:
      "Yes! Every vehicle in our fleet is approved for rideshare platforms including Uber and Lyft. This is a core part of what we offer. Just let us know when booking and we'll make sure your rental is gig-work ready.",
  },
  {
    id: "credit-check",
    category: "Requirements",
    question: "Do you run a credit check?",
    answer:
      "No. We do not run credit checks. We believe your ability to drive and your driving record matter more than your credit score. All we need is your license, deposit, and a clean driving history.",
  },
  {
    id: "payment",
    category: "Payment",
    question: "What forms of payment do you accept?",
    answer:
      "We accept cash, debit cards, and credit cards. The deposit must be paid at the time of pickup. Weekly rental payments can be made weekly in advance. We do not hold cards on file without your consent.",
  },
  {
    id: "deposit",
    category: "Payment",
    question: "How does the deposit work?",
    answer:
      "The deposit ($300–$400 depending on the vehicle) is fully refundable when you return the car in the same condition you received it — no new damage, no missing parts. Deposits are returned within 3 business days of return.",
  },
  {
    id: "mileage",
    category: "Rental Terms",
    question: "Is there a mileage limit?",
    answer:
      "No mileage limit. All SureShift rentals include unlimited miles. Drive as much as you need to earn. We won't nickel-and-dime you for every mile.",
  },
  {
    id: "insurance",
    category: "Rental Terms",
    question: "What insurance is included?",
    answer:
      "Every rental includes basic Texas state liability coverage. This covers third-party property damage and injury. It does not include collision or comprehensive coverage for the rental vehicle itself. We recommend a rideshare insurance policy or personal supplemental coverage if you want full protection.",
  },
  {
    id: "rental-length",
    category: "Rental Terms",
    question: "How long can I rent a vehicle?",
    answer:
      "Our standard rental is weekly (7 days). You can extend week-by-week as long as the vehicle is available and payments are current. There's no long-term commitment required. We also accommodate longer-term arrangements — just ask.",
  },
  {
    id: "cancel",
    category: "Rental Terms",
    question: "What's your cancellation policy?",
    answer:
      "Cancel at least 48 hours before your pickup and you'll receive a full deposit refund. Cancellations within 48 hours may forfeit the deposit. If we cancel due to vehicle unavailability, you receive a full refund with no penalties.",
  },
  {
    id: "breakdown",
    category: "Support",
    question: "What happens if the car breaks down?",
    answer:
      "Call us immediately at (832) 627-7706. We'll work to get you back on the road as quickly as possible. Our team is available 7 days a week. For major mechanical issues caused by normal wear, we'll arrange a replacement vehicle or prorate the downtime from your rental.",
  },
  {
    id: "return",
    category: "Rental Terms",
    question: "How does the return process work?",
    answer:
      "Return the vehicle to our Houston location at the agreed time, with a full tank of gas (or we deduct the cost). We'll do a walkthrough inspection together and process your deposit refund on the spot if everything checks out.",
  },
  {
    id: "under21",
    category: "Requirements",
    question: "Can I rent if I'm under 21?",
    answer:
      "Our minimum age is 21 for standard vehicles and 23 for premium options. We're unable to make exceptions to this policy for insurance reasons. If you're 20, check back in — we'd love to have you as a customer when you're eligible.",
  },
];

const categories = ["All", ...Array.from(new Set(faqs.map((f) => f.category)))];

export default function FAQPage() {
  const [open, setOpen] = useState<string | null>(null);
  const [cat, setCat] = useState("All");

  const filtered = cat === "All" ? faqs : faqs.filter((f) => f.category === cat);

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navbar />

      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 border-b border-gray-800/60">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#2952CC] text-sm font-semibold uppercase tracking-widest mb-2">
            Help Center
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-[#7A8B9A] text-lg">
            Everything you need to know about renting with SureShift. Can't find your answer?{" "}
            <a href="tel:8326277706" className="text-[#2952CC] hover:underline">
              Call us
            </a>
            .
          </p>
        </div>
      </section>

      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  cat === c
                    ? "bg-[#2952CC] text-white"
                    : "bg-gray-900 border border-gray-800 text-[#7A8B9A] hover:border-gray-600 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Accordion */}
          <div className="flex flex-col gap-2">
            {filtered.map((faq) => (
              <div
                key={faq.id}
                id={faq.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors"
              >
                <button
                  onClick={() => setOpen(open === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                >
                  <div className="flex-1">
                    <span className="text-xs text-[#2952CC] font-semibold uppercase tracking-wider block mb-1">
                      {faq.category}
                    </span>
                    <span className="text-white font-semibold text-sm sm:text-base">
                      {faq.question}
                    </span>
                  </div>
                  <span
                    className={`text-[#7A8B9A] transition-transform duration-300 flex-shrink-0 ${
                      open === faq.id ? "rotate-180" : ""
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    open === faq.id ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="px-6 pb-5 text-[#7A8B9A] text-sm leading-relaxed border-t border-gray-800 pt-4">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Still have questions */}
          <div className="mt-12 bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 text-center">
            <h2 className="text-white font-bold text-xl mb-3">Still Have Questions?</h2>
            <p className="text-[#7A8B9A] text-sm mb-6">
              Our team is available 7 days a week. Call, text, or email — we'll get back to you
              fast.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="tel:8326277706"
                className="px-6 py-3 bg-[#2952CC] text-white font-bold rounded-xl hover:bg-[#3561e0] transition-colors"
              >
                📞 (832) 627-7706
              </a>
              <Link
                href="/contact"
                className="px-6 py-3 border border-gray-700 text-[#7A8B9A] font-medium rounded-xl hover:border-gray-500 hover:text-white transition-colors"
              >
                Send a Message
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
