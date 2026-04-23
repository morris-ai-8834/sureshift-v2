/**
 * app/book/page.tsx
 *
 * Booking / reservation form — light theme, Turo-inspired flow.
 *
 * Steps:
 * 1. Trip details (vehicle + dates)
 * 2. Driver info
 * 3. Review & submit
 *
 * On submit → POST /api/reservations → redirect to /portal/[code]
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";

// ============================================
// PROGRESS INDICATOR
// ============================================
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
            i + 1 < current ? "bg-[#2952CC] text-white" :
            i + 1 === current ? "bg-[#2952CC] text-white" :
            "bg-gray-100 text-gray-400"
          }`}>
            {i + 1 < current ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (i + 1)}
          </div>
          {i < total - 1 && (
            <div className={`h-0.5 w-12 rounded-full transition-colors ${i + 1 < current ? "bg-[#2952CC]" : "bg-gray-100"}`} />
          )}
        </div>
      ))}
      <span className="ml-2 text-xs text-gray-400 font-medium">Step {current} of {total}</span>
    </div>
  );
}

// ============================================
// FORM INPUT COMPONENTS
// ============================================
function InputField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2952CC] focus:ring-1 focus:ring-[#2952CC]/20 transition-colors bg-white";

// ============================================
// BOOKING FORM
// ============================================
function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedSlug = searchParams.get("vehicle") ?? "";

  const [vehicles, setVehicles] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    vehicleId: "",
    vehicleSlug: preselectedSlug,
    pickupDate: "",
    pickupTime: "09:00",
    returnDate: "",
    returnTime: "09:00",
    intendedUse: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    licenseNumber: "",
    licenseState: "TX",
    emergencyName: "",
    emergencyPhone: "",
    specialRequests: "",
    agreeTerms: false,
  });

  // Load vehicles
  useEffect(() => {
    fetch("/api/vehicles")
      .then(r => r.json())
      .then((data: Record<string, unknown>[]) => {
        setVehicles(data);
        // Find preselected vehicle by slug or default to first
        const match = preselectedSlug
          ? data.find(v => String(v.slug) === preselectedSlug)
          : data[0];
        if (match) {
          setForm(prev => ({ ...prev, vehicleId: String(match.id), vehicleSlug: String(match.slug) }));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [preselectedSlug]);

  const selected = vehicles.find(v => String(v.id) === form.vehicleId) ?? vehicles[0];
  const today = new Date().toISOString().split("T")[0];

  // Calculate pricing
  const days = form.pickupDate && form.returnDate
    ? Math.max(1, Math.ceil((new Date(form.returnDate).getTime() - new Date(form.pickupDate).getTime()) / 86400000))
    : 7;
  const weekly = selected ? (selected.weekly_rate ? Number(selected.weekly_rate) : Math.round(Number(selected.daily_rate) * 7)) : 0;
  const weeks = Math.max(1, Math.round(days / 7));
  const subtotal = weekly * weeks;
  const deposit = selected ? Number(selected.deposit_amount) : 0;

  function update<K extends keyof typeof form>(field: K, value: typeof form[K]) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  const step1Valid = form.vehicleId && form.pickupDate && form.returnDate &&
    new Date(form.returnDate) > new Date(form.pickupDate);
  const step2Valid = form.firstName && form.lastName && form.email && form.phone;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: form.vehicleId,
          pickupDatetime: `${form.pickupDate}T${form.pickupTime}:00`,
          returnDatetime: `${form.returnDate}T${form.returnTime}:00`,
          intendedUse: form.intendedUse,
          specialRequests: form.specialRequests,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          driverLicenseNumber: form.licenseNumber,
          driverLicenseState: form.licenseState,
          emergencyContactName: form.emergencyName,
          emergencyContactPhone: form.emergencyPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create reservation");
      router.push(`/portal/${data.reservationCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F0F0]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-5 pt-24 pb-16">

        {/* Header */}
        <div className="mb-8">
          <Link href={form.vehicleSlug ? `/fleet/${form.vehicleSlug}` : "/fleet"} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to vehicle
          </Link>
          <h1 className="text-2xl font-black text-gray-900">Reserve your car</h1>
          <p className="text-gray-500 text-sm mt-1">Complete the form to lock in your vehicle</p>
        </div>

        <StepIndicator current={step} total={3} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ---- FORM ---- */}
          <div className="lg:col-span-2">

            {/* STEP 1 */}
            {step === 1 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <h2 className="text-lg font-black text-gray-900">Trip details</h2>

                {/* Vehicle */}
                <InputField label="Select vehicle" required>
                  {loading ? (
                    <div className={`${inputClass} text-gray-400`}>Loading vehicles...</div>
                  ) : (
                    <select value={form.vehicleId} onChange={e => update("vehicleId", e.target.value)} className={inputClass}>
                      {vehicles.map(v => (
                        <option key={String(v.id)} value={String(v.id)}>
                          {String(v.year)} {String(v.make)} {String(v.model)} — ${
                            v.weekly_rate ? Number(v.weekly_rate) : Math.round(Number(v.daily_rate) * 7)
                          }/wk
                        </option>
                      ))}
                    </select>
                  )}
                </InputField>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Pickup date" required>
                    <input type="date" value={form.pickupDate} min={today}
                      onChange={e => update("pickupDate", e.target.value)}
                      className={inputClass}
                    />
                  </InputField>
                  <InputField label="Pickup time">
                    <input type="time" value={form.pickupTime}
                      onChange={e => update("pickupTime", e.target.value)}
                      className={inputClass}
                    />
                  </InputField>
                  <InputField label="Return date" required>
                    <input type="date" value={form.returnDate} min={form.pickupDate || today}
                      onChange={e => update("returnDate", e.target.value)}
                      className={inputClass}
                    />
                  </InputField>
                  <InputField label="Return time">
                    <input type="time" value={form.returnTime}
                      onChange={e => update("returnTime", e.target.value)}
                      className={inputClass}
                    />
                  </InputField>
                </div>

                {/* Intended use */}
                <InputField label="How will you use the car?">
                  <select value={form.intendedUse} onChange={e => update("intendedUse", e.target.value)} className={inputClass}>
                    <option value="">Select one (optional)</option>
                    <option value="rideshare">Rideshare — Uber / Lyft</option>
                    <option value="delivery">Delivery / gig work</option>
                    <option value="personal">Personal use</option>
                    <option value="commuter">Daily commuting</option>
                    <option value="other">Other</option>
                  </select>
                </InputField>

                <button
                  onClick={() => setStep(2)}
                  disabled={!step1Valid}
                  className="w-full py-4 bg-[#2952CC] text-white font-bold rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1e3fa8] transition-colors shadow-sm"
                >
                  Continue
                </button>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <h2 className="text-lg font-black text-gray-900">Driver information</h2>

                <div className="grid grid-cols-2 gap-4">
                  <InputField label="First name" required>
                    <input type="text" value={form.firstName} placeholder="John"
                      onChange={e => update("firstName", e.target.value)}
                      className={inputClass}
                    />
                  </InputField>
                  <InputField label="Last name" required>
                    <input type="text" value={form.lastName} placeholder="Smith"
                      onChange={e => update("lastName", e.target.value)}
                      className={inputClass}
                    />
                  </InputField>
                </div>

                <InputField label="Email address" required>
                  <input type="email" value={form.email} placeholder="john@email.com"
                    onChange={e => update("email", e.target.value)}
                    className={inputClass}
                  />
                </InputField>

                <InputField label="Phone number" required>
                  <input type="tel" value={form.phone} placeholder="(713) 000-0000"
                    onChange={e => update("phone", e.target.value)}
                    className={inputClass}
                  />
                </InputField>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <InputField label="Driver's license number">
                      <input type="text" value={form.licenseNumber} placeholder="TX00000000"
                        onChange={e => update("licenseNumber", e.target.value)}
                        className={inputClass}
                      />
                    </InputField>
                  </div>
                  <InputField label="State">
                    <select value={form.licenseState} onChange={e => update("licenseState", e.target.value)} className={inputClass}>
                      <option>TX</option><option>CA</option><option>FL</option><option>NY</option><option>Other</option>
                    </select>
                  </InputField>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Emergency contact</p>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Contact name">
                      <input type="text" value={form.emergencyName} placeholder="Jane Smith"
                        onChange={e => update("emergencyName", e.target.value)}
                        className={inputClass}
                      />
                    </InputField>
                    <InputField label="Contact phone">
                      <input type="tel" value={form.emergencyPhone} placeholder="(713) 000-0000"
                        onChange={e => update("emergencyPhone", e.target.value)}
                        className={inputClass}
                      />
                    </InputField>
                  </div>
                </div>

                <InputField label="Special requests">
                  <textarea value={form.specialRequests} placeholder="Any notes for us..."
                    onChange={e => update("specialRequests", e.target.value)}
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </InputField>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors">
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!step2Valid}
                    className="flex-[2] py-4 bg-[#2952CC] text-white font-bold rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1e3fa8] transition-colors shadow-sm"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <h2 className="text-lg font-black text-gray-900">Review & confirm</h2>

                {/* Summary */}
                <div className="space-y-3 pb-4 border-b border-gray-100">
                  {[
                    { label: "Vehicle", value: selected ? `${String(selected.year)} ${String(selected.make)} ${String(selected.model)}` : "—" },
                    { label: "Pickup", value: form.pickupDate ? `${form.pickupDate} at ${form.pickupTime}` : "—" },
                    { label: "Return", value: form.returnDate ? `${form.returnDate} at ${form.returnTime}` : "—" },
                    { label: "Duration", value: `${days} days (~${weeks} week${weeks !== 1 ? "s" : ""})` },
                    { label: "Driver", value: `${form.firstName} ${form.lastName}` },
                    { label: "Contact", value: form.email },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{item.label}</span>
                      <span className="font-semibold text-gray-900 text-right max-w-[60%]">{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">${weekly}/week × {weeks} week{weeks !== 1 ? "s" : ""}</span>
                    <span className="font-semibold text-gray-900">${subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-gray-100 pt-2">
                    <span className="font-bold text-gray-900">Deposit due now</span>
                    <span className="font-bold text-[#2952CC]">${deposit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Balance due at pickup</span>
                    <span className="text-gray-400">${subtotal}</span>
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.agreeTerms}
                    onChange={e => update("agreeTerms", e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#2952CC] focus:ring-[#2952CC]"
                  />
                  <span className="text-xs text-gray-500 leading-relaxed">
                    I confirm the information above is accurate and I agree to SureShift&apos;s rental terms. A rental agreement will be sent before pickup.
                  </span>
                </label>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 py-4 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors">
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!form.agreeTerms || submitting}
                    className="flex-[2] py-4 bg-[#2952CC] text-white font-bold rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1e3fa8] transition-colors shadow-sm"
                  >
                    {submitting ? "Submitting..." : "Submit Reservation"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ---- SIDEBAR SUMMARY ---- */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
              {selected && (
                <>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Your vehicle</p>
                  <h3 className="font-black text-gray-900 text-sm mb-4">
                    {String(selected.year)} {String(selected.make)} {String(selected.model)}
                  </h3>

                  <div className="space-y-2 text-xs border-t border-gray-100 pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Weekly rate</span>
                      <span className="font-semibold">${weekly}/wk</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Deposit</span>
                      <span className="font-semibold">${deposit}</span>
                    </div>
                    {form.pickupDate && form.returnDate && (
                      <div className="flex justify-between border-t border-gray-100 pt-2">
                        <span className="font-bold text-gray-900">Subtotal</span>
                        <span className="font-bold text-[#2952CC]">${subtotal}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      Liability included
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      Unlimited miles
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PAGE EXPORT with Suspense boundary
// ============================================
export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2952CC] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BookingForm />
    </Suspense>
  );
}
