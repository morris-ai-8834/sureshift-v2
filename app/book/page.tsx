/**
 * app/book/page.tsx
 *
 * The booking / reservation form at /book.
 *
 * Multi-step form that collects:
 *   Step 1: Vehicle selection + dates
 *   Step 2: Renter information
 *   Step 3: Review + submit
 *
 * On submit, POSTs to /api/reservations and redirects to /portal/[code]
 * on success. All vehicle data comes from the live database.
 *
 * Uses useSearchParams to pre-select a vehicle when linked from /fleet.
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookingProgress from "../components/BookingProgress";
import type { VehicleRow } from "@/lib/types";
import { formatDollars, calculateRentalDays } from "@/lib/helpers";

// ============================================
// HELPER: Calculate rental days from date inputs
// ============================================

function getDaysFromInputs(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 1;
  return calculateRentalDays(new Date(startDate), new Date(endDate));
}

// ============================================
// BOOKING FORM COMPONENT
// Separated from page for Suspense boundary (useSearchParams requirement)
// ============================================

function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedVehicleId = searchParams.get("vehicle") ?? "";

  // ----------------------------------------
  // STATE
  // ----------------------------------------
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [form, setForm] = useState({
    vehicleId: preselectedVehicleId,
    pickupDate: "",
    pickupTime: "09:00",
    returnDate: "",
    returnTime: "09:00",
    pickupLocation: "",
    intendedUse: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    driverLicenseNumber: "",
    driverLicenseState: "TX",
    agreeTerms: false,
  });

  // ----------------------------------------
  // LOAD VEHICLES from database
  // ----------------------------------------
  useEffect(() => {
    async function loadVehicles() {
      try {
        const res = await fetch("/api/vehicles");
        if (!res.ok) throw new Error("Failed to load vehicles");
        const data: VehicleRow[] = await res.json();
        setVehicles(data);
        // If no vehicle pre-selected, pick the first available one
        if (!preselectedVehicleId && data.length > 0) {
          setForm((prev) => ({ ...prev, vehicleId: data[0].id }));
        }
      } catch (err) {
        console.error("Failed to load vehicles:", err);
      } finally {
        setVehiclesLoading(false);
      }
    }
    loadVehicles();
  }, [preselectedVehicleId]);

  // ----------------------------------------
  // DERIVED STATE
  // ----------------------------------------
  const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId) ?? vehicles[0];
  const days = getDaysFromInputs(form.pickupDate, form.returnDate);
  const dailyRate = selectedVehicle ? parseFloat(selectedVehicle.daily_rate) : 0;
  const deposit = selectedVehicle ? parseFloat(selectedVehicle.deposit_amount) : 0;
  const rentalSubtotal = days * dailyRate;

  const pickupDatetime = form.pickupDate && form.pickupTime
    ? `${form.pickupDate}T${form.pickupTime}:00`
    : "";
  const returnDatetime = form.returnDate && form.returnTime
    ? `${form.returnDate}T${form.returnTime}:00`
    : "";

  const today = new Date().toISOString().split("T")[0];

  // ----------------------------------------
  // HANDLERS
  // ----------------------------------------
  function update<K extends keyof typeof form>(field: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!selectedVehicle || !pickupDatetime || !returnDatetime) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: form.vehicleId,
          pickupDatetime,
          returnDatetime,
          pickupLocation: form.pickupLocation || undefined,
          intendedUse: form.intendedUse || undefined,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          driverLicenseNumber: form.driverLicenseNumber || undefined,
          driverLicenseState: form.driverLicenseState || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? data.detail ?? "Reservation failed");
      }

      // Redirect to customer portal with reservation code
      router.push(`/portal/${data.reservationCode}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  // ----------------------------------------
  // VALIDATION per step
  // ----------------------------------------
  const step1Valid = form.vehicleId && form.pickupDate && form.returnDate &&
    new Date(form.returnDate) > new Date(form.pickupDate);
  const step2Valid = form.firstName && form.lastName && form.email && form.phone;
  const step3Valid = form.agreeTerms;

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navbar />

      <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="mb-10">
          <p className="text-[#2952CC] text-sm font-semibold uppercase tracking-widest mb-2">Booking</p>
          <h1 className="text-3xl font-black text-white mb-6">Reserve Your Vehicle</h1>
          <BookingProgress currentStep={step} />
        </div>

        {/* ===== STEP 1: Dates & Vehicle ===== */}
        {step === 1 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-6">Select Dates & Vehicle</h2>

            {/* Vehicle select */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-[#7A8B9A] mb-2">Select Vehicle</label>
              {vehiclesLoading ? (
                <div className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-[#7A8B9A] text-sm">
                  Loading vehicles...
                </div>
              ) : (
                <select
                  value={form.vehicleId}
                  onChange={(e) => update("vehicleId", e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl text-white px-4 py-3 text-sm focus:outline-none focus:border-[#2952CC]"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.headline_name} — {formatDollars(v.daily_rate)}/day
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-[#7A8B9A] mb-2">Pickup Date</label>
                <input type="date" value={form.pickupDate} min={today}
                  onChange={(e) => update("pickupDate", e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl text-white px-4 py-3 text-sm focus:outline-none focus:border-[#2952CC]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#7A8B9A] mb-2">Pickup Time</label>
                <input type="time" value={form.pickupTime}
                  onChange={(e) => update("pickupTime", e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl text-white px-4 py-3 text-sm focus:outline-none focus:border-[#2952CC]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#7A8B9A] mb-2">Return Date</label>
                <input type="date" value={form.returnDate} min={form.pickupDate || today}
                  onChange={(e) => update("returnDate", e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl text-white px-4 py-3 text-sm focus:outline-none focus:border-[#2952CC]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#7A8B9A] mb-2">Return Time</label>
                <input type="time" value={form.returnTime}
                  onChange={(e) => update("returnTime", e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl text-white px-4 py-3 text-sm focus:outline-none focus:border-[#2952CC]"
                />
              </div>
            </div>

            {/* Pickup location */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-[#7A8B9A] mb-2">Preferred Pickup Location <span className="text-gray-600">(optional)</span></label>
              <input type="text" value={form.pickupLocation}
                onChange={(e) => update("pickupLocation", e.target.value)}
                placeholder="Or we'll confirm our Houston hub address"
                className="w-full bg-gray-950 border border-gray-700 rounded-xl text-white px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-[#2952CC]"
              />
            </div>

            {/* Intended use */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#7A8B9A] mb-2">Intended Use <span className="text-gray-600">(optional)</span></label>
              <select value={form.intendedUse} onChange={(e) => update("intendedUse", e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl text-white px-4 py-3 text-sm focus:outline-none focus:border-[#2952CC]"
              >
                <option value="">Select one...</option>
                <option value="rideshare">Rideshare (Uber / Lyft)</option>
                <option value="personal">Personal use</option>
                <option value="commuter">Daily commuting</option>
                <option value="delivery">Delivery / gig work</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Pricing summary */}
            {form.pickupDate && form.returnDate && selectedVehicle && (
              <div className="bg-[#2952CC]/10 border border-[#2952CC]/20 rounded-xl p-4 mb-6">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-[#7A8B9A]">{days} day{days !== 1 ? "s" : ""} × {formatDollars(dailyRate)}</span>
                  <span className="text-white">{formatDollars(rentalSubtotal)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#7A8B9A]">Refundable deposit (due at pickup)</span>
                  <span className="text-white">{formatDollars(deposit)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-[#2952CC]/20 pt-2">
                  <span className="text-white">Estimated total</span>
                  <span className="text-[#2952CC]">{formatDollars(rentalSubtotal + deposit)}</span>
                </div>
              </div>
            )}

            <button onClick={() => setStep(2)} disabled={!step1Valid}
              className="w-full py-4 bg-[#2952CC] text-white font-bold rounded-xl hover:bg-[#3561e0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue to Renter Info →
            </button>
          </div>
        )}

        {/* ===== STEP 2: Renter Info ===== */}
        {step === 2 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-6">Your Information</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#7A8B9A] mb-2">First Name</label>
                <input type="text" value={form.firstName} onChange={(e) => update("firstName", e.target.value)}
                  placeholder="John"
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl text-white px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-[#2952CC]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#7A8B9A] mb-2">Last Name</label>
                <input type="text" value={form.lastName} onChange={(e) => update("lastName", e.target.value)}
                  placeholder="Smith"
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl text-white px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-[#2952CC]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#7A8B9A] mb-2">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                  placeholder="(832) 000-0000"
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl text-white px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-[#2952CC]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#7A8B9A] mb-2">Email</label>
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                  placeholder="you@email.com"
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl text-white px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-[#2952CC]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#7A8B9A] mb-2">Driver License Number</label>
                <input type="text" value={form.driverLicenseNumber} onChange={(e) => update("driverLicenseNumber", e.target.value)}
                  placeholder="License number"
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl text-white px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-[#2952CC]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#7A8B9A] mb-2">License State</label>
                <select value={form.driverLicenseState} onChange={(e) => update("driverLicenseState", e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl text-white px-4 py-3 text-sm focus:outline-none focus:border-[#2952CC]"
                >
                  {["TX", "OK", "LA", "AR", "NM", "CO", "KS", "MO", "Other"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="px-6 py-4 border border-gray-700 text-[#7A8B9A] font-medium rounded-xl hover:border-gray-500 hover:text-white transition-colors"
              >← Back</button>
              <button onClick={() => setStep(3)} disabled={!step2Valid}
                className="flex-1 py-4 bg-[#2952CC] text-white font-bold rounded-xl hover:bg-[#3561e0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >Review Booking →</button>
            </div>
          </div>
        )}

        {/* ===== STEP 3: Review & Submit ===== */}
        {step === 3 && selectedVehicle && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-6">Review Your Booking</h2>

            <div className="flex flex-col gap-3 mb-6">
              <div className="bg-gray-950 rounded-xl p-4">
                <p className="text-xs text-[#7A8B9A] uppercase tracking-wider mb-1">Vehicle</p>
                <p className="text-white font-semibold">{selectedVehicle.headline_name}</p>
                <p className="text-[#7A8B9A] text-sm">{formatDollars(selectedVehicle.daily_rate)}/day</p>
              </div>
              <div className="bg-gray-950 rounded-xl p-4">
                <p className="text-xs text-[#7A8B9A] uppercase tracking-wider mb-1">Dates</p>
                <p className="text-white font-semibold">{form.pickupDate} {form.pickupTime} → {form.returnDate} {form.returnTime}</p>
                <p className="text-[#7A8B9A] text-sm">{days} day{days !== 1 ? "s" : ""}</p>
              </div>
              <div className="bg-gray-950 rounded-xl p-4">
                <p className="text-xs text-[#7A8B9A] uppercase tracking-wider mb-1">Renter</p>
                <p className="text-white font-semibold">{form.firstName} {form.lastName}</p>
                <p className="text-[#7A8B9A] text-sm">{form.phone} · {form.email}</p>
              </div>
              <div className="bg-[#2952CC]/10 border border-[#2952CC]/20 rounded-xl p-4">
                <p className="text-xs text-[#7A8B9A] uppercase tracking-wider mb-2">Estimated Total</p>
                <p className="text-3xl font-black text-[#2952CC]">{formatDollars(rentalSubtotal + deposit)}</p>
                <p className="text-xs text-[#7A8B9A] mt-1">
                  {formatDollars(rentalSubtotal)} rental + {formatDollars(deposit)} refundable deposit
                </p>
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input type="checkbox" checked={form.agreeTerms} onChange={(e) => update("agreeTerms", e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#2952CC]"
              />
              <span className="text-sm text-[#7A8B9A]">
                I agree to the{" "}
                <a href="/terms" className="text-[#2952CC] hover:underline">Rental Terms & Conditions</a>.
                I understand the deposit is refundable upon return of the vehicle in good condition.
              </span>
            </label>

            {/* Error message */}
            {submitError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                <p className="text-red-400 text-sm">⚠️ {submitError}</p>
              </div>
            )}

            {/* Note about hold */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-5 text-xs text-amber-400/80">
              ⏱️ Submitting places a 30-minute hold on this vehicle while you arrange your deposit.
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="px-6 py-4 border border-gray-700 text-[#7A8B9A] font-medium rounded-xl hover:border-gray-500 hover:text-white transition-colors"
              >← Back</button>
              <button
                onClick={handleSubmit}
                disabled={!step3Valid || submitting}
                className="flex-1 py-4 bg-[#2952CC] text-white font-bold rounded-xl hover:bg-[#3561e0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Reservation...
                  </>
                ) : (
                  "Confirm Reservation →"
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

// ============================================
// PAGE EXPORT (with Suspense for useSearchParams)
// ============================================

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2952CC] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BookingForm />
    </Suspense>
  );
}
