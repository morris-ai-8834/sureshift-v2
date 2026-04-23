"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navbar />

      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 border-b border-gray-800/60">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#2952CC] text-sm font-semibold uppercase tracking-widest mb-2">
            Get in Touch
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Contact SureShift
          </h1>
          <p className="text-[#7A8B9A] text-lg max-w-xl">
            We're a local Texas team serving Houston & Dallas — real people, real answers. Reach out however is most
            convenient for you.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact Info */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-4">Reach Us Directly</h2>
              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#2952CC]/15 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-lg"></span>
                  </div>
                  <div>
                    <p className="text-xs text-[#7A8B9A] uppercase tracking-wider mb-1">Phone / Text</p>
                    <a
                      href="tel:8000000000"
                      className="text-white font-semibold hover:text-[#2952CC] transition-colors"
                    >
                      (800) 000-0000
                    </a>
                    <p className="text-[#7A8B9A] text-xs mt-0.5">Available 7 days a week</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#2952CC]/15 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-lg"></span>
                  </div>
                  <div>
                    <p className="text-xs text-[#7A8B9A] uppercase tracking-wider mb-1">Email</p>
                    <a
                      href="mailto:hello@sureshiftrentals.com"
                      className="text-white font-semibold hover:text-[#2952CC] transition-colors"
                    >
                      hello@sureshiftrentals.com
                    </a>
                    <p className="text-[#7A8B9A] text-xs mt-0.5">We reply within a few hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#2952CC]/15 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-lg"></span>
                  </div>
                  <div>
                    <p className="text-xs text-[#7A8B9A] uppercase tracking-wider mb-1">Location</p>
                    <p className="text-white font-semibold">Houston &amp; Dallas, TX</p>
                    <p className="text-[#7A8B9A] text-xs mt-0.5">Pickup address shared after booking</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-4">Hours</h2>
              <div className="flex flex-col gap-2 text-sm">
                {[
                  { day: "Monday – Friday", hours: "8:00 AM – 7:00 PM" },
                  { day: "Saturday", hours: "9:00 AM – 5:00 PM" },
                  { day: "Sunday", hours: "10:00 AM – 4:00 PM" },
                ].map((h) => (
                  <div key={h.day} className="flex justify-between py-1.5 border-b border-gray-800 last:border-0">
                    <span className="text-[#7A8B9A]">{h.day}</span>
                    <span className="text-white font-medium">{h.hours}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#7A8B9A] mt-3">
                For emergencies or breakdown support, we're reachable any time.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 bg-emerald-400/15 rounded-full flex items-center justify-center">
                  <span className="text-3xl"></span>
                </div>
                <h2 className="text-2xl font-black text-white">Message Sent!</h2>
                <p className="text-[#7A8B9A] max-w-sm">
                  Thanks for reaching out, {form.name.split(" ")[0]}. We'll get back to you at{" "}
                  <strong className="text-white">{form.email}</strong> within a few hours.
                </p>
                <p className="text-sm text-[#7A8B9A]">
                  Need a faster response?{" "}
                  <a href="tel:8000000000" className="text-[#2952CC] hover:underline">
                    Call (800) 000-0000
                  </a>
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                  className="mt-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
                <h2 className="text-white font-bold text-xl mb-6">Send Us a Message</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#7A8B9A] mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="John Smith"
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl text-white px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-[#2952CC] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#7A8B9A] mb-2">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="(832) 000-0000"
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl text-white px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-[#2952CC] transition-colors"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#7A8B9A] mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@email.com"
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl text-white px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-[#2952CC] transition-colors"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#7A8B9A] mb-2">Subject *</label>
                  <select
                    required
                    value={form.subject}
                    onChange={(e) => update("subject", e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl text-white px-4 py-3 text-sm focus:outline-none focus:border-[#2952CC] transition-colors"
                  >
                    <option value="">Select a subject...</option>
                    <option value="rental-inquiry">Rental Inquiry</option>
                    <option value="availability">Vehicle Availability</option>
                    <option value="existing-rental">Existing Rental Question</option>
                    <option value="extend">Extend My Rental</option>
                    <option value="deposit">Deposit Question</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#7A8B9A] mb-2">Message *</label>
                  <textarea
                    required
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    placeholder="Tell us what you need — which vehicle you're interested in, your timeline, any questions..."
                    rows={5}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl text-white px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-[#2952CC] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#2952CC] text-white font-bold rounded-xl hover:bg-[#3561e0] transition-all duration-200 hover:shadow-lg hover:shadow-[#2952CC]/30"
                >
                  Send Message →
                </button>

                <p className="text-xs text-gray-600 text-center mt-4">
                  We typically respond within 2–4 hours during business hours.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
