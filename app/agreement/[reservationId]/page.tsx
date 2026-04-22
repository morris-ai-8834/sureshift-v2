/**
 * app/agreement/[reservationId]/page.tsx
 *
 * The agreement signing page at /agreement/[reservationId].
 *
 * Shows the rental agreement text and a signature form.
 * On submission, POSTs to /api/agreements/[reservationId]/sign.
 * On success, redirects back to the portal page.
 *
 * This is a client component because it manages form state and
 * the signature interaction.
 */

"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import type { ReservationWithDetails } from "@/lib/types";
import { formatDollars, formatDate, formatDatetime } from "@/lib/helpers";

// ============================================
// RENTAL AGREEMENT TEXT
// The legal terms displayed to the customer before signing.
// Real copy — not lorem ipsum.
// ============================================

const AGREEMENT_TEXT = `
SURESHIFT RENTALS — RENTAL AGREEMENT

This Rental Agreement ("Agreement") is entered into between SureShift Rentals ("Company") and the renter identified below ("Renter").

1. RENTAL PERIOD
The vehicle is rented for the period specified at time of booking. Early return does not entitle Renter to a refund. Late returns are subject to additional daily charges.

2. DEPOSIT
A refundable security deposit is required at the time of rental. The deposit will be returned within 3–5 business days after the vehicle is returned in its original condition. The Company reserves the right to withhold the deposit in whole or in part for damage, excessive cleaning, or policy violations.

3. AUTHORIZED USE
The vehicle may only be operated by the Renter identified in this agreement. Renter must possess a valid driver's license at all times while operating the vehicle. Vehicle may be used for rideshare (Uber/Lyft) if selected at booking.

4. PROHIBITED USE
Renter shall not: use the vehicle for any illegal purpose; transport hazardous materials; allow unauthorized operators; drive under the influence of drugs or alcohol; use the vehicle off-road or in racing events.

5. INSURANCE
The Company provides liability coverage as required by Texas state law. Renter is responsible for any damage to the vehicle not covered by the Company's coverage. Renter is encouraged to verify their personal auto insurance coverage before renting.

6. FUEL
Vehicle will be provided with a full tank of fuel. Renter is responsible for returning the vehicle with a full tank. Failure to do so will result in a fuel charge.

7. MILEAGE
This rental includes unlimited mileage within the continental United States. Interstate travel outside Texas requires advance written approval from SureShift Rentals.

8. DAMAGE REPORTING
Renter must report any damage, accidents, or incidents immediately by calling (800) 000-0000. Failure to report an incident may result in forfeiture of the deposit.

9. BREAKDOWN & ROADSIDE
In the event of a mechanical breakdown, contact SureShift Rentals immediately at (800) 000-0000. Do not authorize any repairs without prior written approval from the Company.

10. RETURN CONDITION
The vehicle must be returned clean and in the same condition as received, normal wear excepted. Excessive dirt, odors (including smoke), or interior damage may result in cleaning or repair charges deducted from the deposit.

11. GOVERNING LAW
This Agreement shall be governed by the laws of the State of Texas. Any disputes shall be resolved in Houston, Harris County, Texas.

BY SIGNING BELOW, RENTER ACKNOWLEDGES READING, UNDERSTANDING, AND AGREEING TO ALL TERMS AND CONDITIONS OF THIS RENTAL AGREEMENT.
`.trim();

// ============================================
// MAIN PAGE COMPONENT
// ============================================

interface PageProps {
  params: Promise<{ reservationId: string }>;
}

export default function AgreementPage({ params }: PageProps) {
  const { reservationId } = use(params);
  const router = useRouter();

  // ----------------------------------------
  // STATE
  // ----------------------------------------
  const [reservation, setReservation] = useState<ReservationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signerName, setSignerName] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  // ----------------------------------------
  // LOAD reservation data
  // ----------------------------------------
  useEffect(() => {
    async function loadReservation() {
      try {
        const res = await fetch(`/api/admin/reservations/${reservationId}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Reservation not found");
        }
        const data: ReservationWithDetails = await res.json();
        setReservation(data);
        // Pre-fill signer name with customer's full name
        setSignerName(`${data.customer_first_name} ${data.customer_last_name}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reservation");
      } finally {
        setLoading(false);
      }
    }
    loadReservation();
  }, [reservationId]);

  // ----------------------------------------
  // SIGN HANDLER
  // ----------------------------------------
  async function handleSign() {
    if (!reservation || !signerName.trim() || !consentChecked) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/agreements/${reservationId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signerName: signerName.trim(),
          signatureMethod: "typed",
          consentChecked: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Signing failed");
      }

      // Redirect to portal page on success
      router.push(`/portal/${data.reservationCode}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  // ----------------------------------------
  // LOADING STATE
  // ----------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2952CC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-[#0D0D0D]">
        <Navbar />
        <div className="pt-32 text-center px-4">
          <p className="text-red-400 text-lg mb-4">⚠️ {error ?? "Reservation not found"}</p>
          <p className="text-[#7A8B9A]">Please contact us at (800) 000-0000 for assistance.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const canSign = signerName.trim().length >= 3 && consentChecked && hasScrolled;

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navbar />

      <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[#2952CC] text-sm font-semibold uppercase tracking-widest mb-2">Rental Agreement</p>
          <h1 className="text-3xl font-black text-white mb-2">Sign Your Agreement</h1>
          <p className="text-[#7A8B9A]">
            Code: <span className="font-mono text-white">{reservation.reservation_code}</span>
          </p>
        </div>

        {/* Reservation summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[#7A8B9A] text-xs uppercase tracking-wider mb-1">Renter</p>
              <p className="text-white font-semibold">{reservation.customer_first_name} {reservation.customer_last_name}</p>
            </div>
            <div>
              <p className="text-[#7A8B9A] text-xs uppercase tracking-wider mb-1">Vehicle</p>
              <p className="text-white font-semibold">{reservation.vehicle_headline_name}</p>
            </div>
            <div>
              <p className="text-[#7A8B9A] text-xs uppercase tracking-wider mb-1">Pickup</p>
              <p className="text-white">{formatDatetime(new Date(reservation.pickup_datetime))}</p>
            </div>
            <div>
              <p className="text-[#7A8B9A] text-xs uppercase tracking-wider mb-1">Return</p>
              <p className="text-white">{formatDatetime(new Date(reservation.return_datetime))}</p>
            </div>
            <div>
              <p className="text-[#7A8B9A] text-xs uppercase tracking-wider mb-1">Total Days</p>
              <p className="text-white">{reservation.estimated_total_days}</p>
            </div>
            <div>
              <p className="text-[#7A8B9A] text-xs uppercase tracking-wider mb-1">Rental Total</p>
              <p className="text-white font-bold">{formatDollars(reservation.estimated_rental_subtotal)}</p>
            </div>
          </div>
        </div>

        {/* Agreement text scroll box */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-white font-bold text-sm">Rental Agreement Terms</h2>
            {!hasScrolled && (
              <span className="text-xs text-amber-400 font-medium">↓ Scroll to read all terms</span>
            )}
            {hasScrolled && (
              <span className="text-xs text-emerald-400 font-medium">✓ Terms read</span>
            )}
          </div>
          <div
            className="h-72 overflow-y-auto px-5 py-4 text-sm text-[#7A8B9A] leading-relaxed whitespace-pre-line"
            onScroll={(e) => {
              const el = e.currentTarget;
              // Mark as scrolled when within 50px of the bottom
              if (el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
                setHasScrolled(true);
              }
            }}
          >
            {AGREEMENT_TEXT}
          </div>
        </div>

        {/* Signature form */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-5">Sign Below</h2>

          {/* Typed signature */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-[#7A8B9A] mb-2">
              Type Your Full Legal Name as Your Signature
            </label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Your full legal name"
              className="w-full bg-gray-950 border border-gray-700 rounded-xl text-white px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-[#2952CC] font-medium"
            />
            {signerName.trim().length > 0 && (
              <div className="mt-3 p-3 bg-gray-950 rounded-xl border border-gray-700">
                <p className="text-[#7A8B9A] text-xs mb-1">Preview:</p>
                <p className="text-white text-xl italic font-serif">{signerName}</p>
              </div>
            )}
          </div>

          {/* Date */}
          <div className="mb-5 text-sm text-[#7A8B9A]">
            <p>Date: <span className="text-white">{formatDate(new Date())}</span></p>
          </div>

          {/* Consent checkbox */}
          <label className={`flex items-start gap-3 mb-6 cursor-pointer p-3 rounded-xl border transition-colors ${
            consentChecked ? "border-[#2952CC]/40 bg-[#2952CC]/5" : "border-gray-800"
          }`}>
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#2952CC] flex-shrink-0"
            />
            <span className="text-sm text-[#7A8B9A]">
              I, <strong className="text-white">{signerName || "[your name]"}</strong>, confirm that I have read and agree to all terms of this Rental Agreement. I understand that typing my name constitutes a legally binding electronic signature.
            </span>
          </label>

          {/* Scroll reminder */}
          {!hasScrolled && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4 text-xs text-amber-400">
              ⚠️ Please scroll through and read the full agreement before signing.
            </div>
          )}

          {/* Submit error */}
          {submitError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
              <p className="text-red-400 text-sm">⚠️ {submitError}</p>
            </div>
          )}

          {/* Sign button */}
          <button
            onClick={handleSign}
            disabled={!canSign || submitting}
            className="w-full py-4 bg-[#2952CC] text-white font-bold rounded-xl hover:bg-[#3561e0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting Signature...
              </>
            ) : (
              "✍️ Sign & Confirm Reservation"
            )}
          </button>

          <p className="text-xs text-gray-600 text-center mt-3">
            Your signature is encrypted and stored securely. Questions? Call (800) 000-0000.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
