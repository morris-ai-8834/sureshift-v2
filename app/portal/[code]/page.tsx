/**
 * app/portal/[code]/page.tsx
 *
 * The customer reservation portal at /portal/[code].
 *
 * This is the most important customer-facing page. It shows the full state
 * of a reservation and adapts its content based on where the reservation is
 * in its lifecycle. Each status has a distinct, action-oriented UI.
 *
 * Status → UI mapping:
 *   awaiting_deposit  → "Pay Your Deposit" — prominent CTA, hold countdown
 *   deposit_paid      → "Agreement Being Prepared" — waiting state
 *   agreement_sent    → "Sign Your Agreement" — sign CTA
 *   confirmed         → "You're All Set" — pickup details, calendar-ready
 *   active            → "Rental In Progress" — support info
 *   completed         → "Rental Complete" — thank you, return summary
 *   cancelled         → "Reservation Cancelled" — next steps
 *   no_show           → "Missed Pickup" — contact info
 *
 * Data is fetched server-side from /api/portal/[code].
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import type { PortalData } from "@/lib/types";
import { ReservationStatus } from "@/lib/constants";
import { formatDollars, formatDate, formatDatetime } from "@/lib/helpers";

// ============================================
// DATA FETCHING
// ============================================

async function getPortalData(code: string): Promise<PortalData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/portal/${code}`, {
      // No cache — portal data must always be fresh
      cache: "no-store",
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ============================================
// HELPER COMPONENTS
// Small, focused UI building blocks for the portal.
// ============================================

/** Status step indicator showing where the reservation is in its lifecycle */
function StatusTimeline({ current }: { current: string }) {
  const steps = [
    { key: ReservationStatus.AWAITING_DEPOSIT, label: "Deposit" },
    { key: ReservationStatus.DEPOSIT_PAID, label: "Agreement" },
    { key: ReservationStatus.CONFIRMED, label: "Confirmed" },
    { key: ReservationStatus.ACTIVE, label: "Active" },
    { key: ReservationStatus.COMPLETED, label: "Complete" },
  ];

  const currentIndex = steps.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((step, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        const isFuture = i > currentIndex;

        return (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                isDone ? "bg-emerald-500 border-emerald-500 text-white" :
                isActive ? "bg-[#2952CC] border-[#2952CC] text-white" :
                "bg-transparent border-gray-700 text-gray-600"
              }`}>
                {isDone ? "✓" : i + 1}
              </div>
              <span className={`text-xs mt-1.5 font-medium hidden sm:block ${
                isDone ? "text-emerald-400" : isActive ? "text-white" : "text-gray-600"
              }`}>
                {step.label}
              </span>
            </div>
            {/* Connector line between steps */}
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${isDone ? "bg-emerald-500" : "bg-gray-800"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Info row used inside detail cards */
function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between items-start py-3 border-b border-gray-800 last:border-0">
      <span className="text-[#7A8B9A] text-sm">{label}</span>
      <span className="text-white text-sm font-medium text-right ml-4">{value ?? "—"}</span>
    </div>
  );
}

// ============================================
// STATUS-DRIVEN CONTENT PANELS
// Each function returns the primary action panel for a given status.
// ============================================

function AwaitingDepositPanel({ data }: { data: PortalData }) {
  const depositDue = parseFloat(data.reservation.deposit_due);
  const expiresAt = data.reservation.expiration_datetime
    ? new Date(data.reservation.expiration_datetime)
    : null;

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="text-3xl">💳</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">Deposit Required to Confirm</h3>
          <p className="text-[#7A8B9A] text-sm mb-4">
            Your reservation is on hold for <strong className="text-white">30 minutes</strong>.
            Pay your {formatDollars(depositDue)} deposit to lock in your dates before the hold expires.
          </p>
          {expiresAt && (
            <div className="bg-amber-500/20 rounded-lg px-3 py-2 mb-4 inline-block">
              <p className="text-amber-400 text-xs font-semibold">
                ⏱ Hold expires: {formatDatetime(expiresAt)}
              </p>
            </div>
          )}

          {/* Stripe payment — placeholder until Stripe is wired */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
            <p className="text-white font-semibold mb-1">Pay {formatDollars(depositDue)} Deposit</p>
            <p className="text-[#7A8B9A] text-xs mb-3">
              Online payment via Stripe coming soon. For now, contact us directly to arrange deposit.
            </p>
            <a
              href="tel:8326277706"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2952CC] text-white text-sm font-bold rounded-xl hover:bg-[#3561e0] transition-colors"
            >
              📞 Call to Pay: (832) 627-7706
            </a>
          </div>
          <p className="text-xs text-[#7A8B9A]">
            The deposit is fully refundable when the vehicle is returned in the same condition.
          </p>
        </div>
      </div>
    </div>
  );
}

function AgreementSentPanel({ data }: { data: PortalData }) {
  return (
    <div className="bg-[#2952CC]/10 border border-[#2952CC]/30 rounded-2xl p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="text-3xl">📄</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">Sign Your Rental Agreement</h3>
          <p className="text-[#7A8B9A] text-sm mb-4">
            Your deposit is confirmed. Review and sign your rental agreement to complete your reservation.
          </p>
          <Link
            href={`/agreement/${data.reservation.id}`}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#2952CC] text-white text-sm font-bold rounded-xl hover:bg-[#3561e0] transition-colors"
          >
            ✍️ Sign Agreement
          </Link>
        </div>
      </div>
    </div>
  );
}

function ConfirmedPanel({ data }: { data: PortalData }) {
  const pickup = new Date(data.reservation.pickup_datetime);

  return (
    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="text-3xl">✅</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">You&apos;re All Set!</h3>
          <p className="text-[#7A8B9A] text-sm mb-4">
            Your reservation is confirmed. See you on <strong className="text-white">{formatDate(pickup)}</strong>.
          </p>
          <div className="bg-gray-900 rounded-xl p-4 text-sm">
            <p className="text-[#7A8B9A] mb-2 font-semibold text-xs uppercase tracking-wider">Pickup Details</p>
            <p className="text-white mb-1">📅 {formatDatetime(pickup)}</p>
            <p className="text-white mb-1">📍 {data.reservation.pickup_location ?? "SureShift Houston Hub — address confirmed via text"}</p>
            <p className="text-white">📞 Questions? <a href="tel:8326277706" className="text-[#2952CC] hover:underline">(832) 627-7706</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveRentalPanel({ data }: { data: PortalData }) {
  const returnDate = new Date(data.reservation.return_datetime);

  return (
    <div className="bg-violet-500/10 border border-violet-500/30 rounded-2xl p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="text-3xl">🚗</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">Rental In Progress</h3>
          <p className="text-[#7A8B9A] text-sm mb-3">
            Your rental is active. Please return the vehicle by{" "}
            <strong className="text-white">{formatDatetime(returnDate)}</strong>.
          </p>
          <div className="flex flex-col gap-2 text-sm">
            <p className="text-[#7A8B9A]">Need help during your rental?</p>
            <a href="tel:8326277706" className="text-[#2952CC] hover:underline font-semibold">📞 (832) 627-7706</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompletedPanel() {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="text-3xl">🎉</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">Rental Complete</h3>
          <p className="text-[#7A8B9A] text-sm mb-3">
            Thanks for renting with SureShift! Your deposit will be refunded within 3–5 business days if no damage was noted.
          </p>
          <Link href="/fleet"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2952CC] text-white text-sm font-bold rounded-xl hover:bg-[#3561e0] transition-colors"
          >
            Browse Fleet Again
          </Link>
        </div>
      </div>
    </div>
  );
}

function CancelledPanel() {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="text-3xl">❌</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">Reservation Cancelled</h3>
          <p className="text-[#7A8B9A] text-sm mb-3">
            This reservation has been cancelled. If you have questions about your deposit, please contact us.
          </p>
          <a href="tel:8326277706"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition-colors"
          >
            📞 Contact SureShift
          </a>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PAGE COMPONENT
// ============================================

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function PortalPage({ params }: PageProps) {
  const { code } = await params;
  const data = await getPortalData(code);

  if (!data) notFound();

  const { reservation, vehicle, customer } = data;
  const status = reservation.reservation_status;

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navbar />

      <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">

        {/* Portal header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[#2952CC] text-sm font-semibold uppercase tracking-widest">Customer Portal</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-black text-white">Your Reservation</h1>
              <p className="text-[#7A8B9A] text-sm mt-1">
                Code: <span className="font-mono text-white">{reservation.reservation_code}</span>
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-white font-semibold">{customer.full_name}</p>
              <p className="text-[#7A8B9A] text-sm">{customer.email}</p>
            </div>
          </div>
        </div>

        {/* Status timeline (hide for cancelled/no_show/completed) */}
        {status !== ReservationStatus.CANCELLED && status !== ReservationStatus.NO_SHOW && (
          <StatusTimeline current={status} />
        )}

        {/* Status-driven primary action panel */}
        {status === ReservationStatus.AWAITING_DEPOSIT && <AwaitingDepositPanel data={data} />}
        {status === ReservationStatus.DEPOSIT_PAID && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚙️</div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Deposit Received — Agreement Being Prepared</h3>
                <p className="text-[#7A8B9A] text-sm">We received your deposit and are generating your rental agreement. You&apos;ll receive it shortly.</p>
              </div>
            </div>
          </div>
        )}
        {status === ReservationStatus.AGREEMENT_SENT && <AgreementSentPanel data={data} />}
        {status === ReservationStatus.CONFIRMED && <ConfirmedPanel data={data} />}
        {status === ReservationStatus.ACTIVE && <ActiveRentalPanel data={data} />}
        {status === ReservationStatus.COMPLETED && <CompletedPanel />}
        {status === ReservationStatus.CANCELLED && <CancelledPanel />}

        {/* Main detail grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Vehicle card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-[#7A8B9A] uppercase tracking-wider mb-4">Vehicle</h2>
            <p className="text-white font-bold text-lg mb-1">{vehicle.headline_name}</p>
            <p className="text-[#7A8B9A] text-sm mb-4">{vehicle.vehicle_code} · {vehicle.vehicle_type}</p>
            <DetailRow label="Transmission" value={vehicle.transmission} />
            <DetailRow label="Fuel Type" value={vehicle.fuel_type} />
            <DetailRow label="Seats" value={`${vehicle.seats} passengers`} />
            <DetailRow label="Location" value={vehicle.location_city} />
          </div>

          {/* Pricing card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-[#7A8B9A] uppercase tracking-wider mb-4">Pricing</h2>
            <DetailRow label="Daily rate" value={formatDollars(reservation.estimated_daily_rate)} />
            <DetailRow label="Total days" value={`${reservation.estimated_total_days} day${reservation.estimated_total_days !== 1 ? "s" : ""}`} />
            <DetailRow label="Rental subtotal" value={formatDollars(reservation.estimated_rental_subtotal)} />
            <DetailRow label="Deposit due" value={formatDollars(reservation.deposit_due)} />
            <DetailRow label="Deposit paid" value={formatDollars(reservation.deposit_paid_amount)} />
            <div className="pt-3 border-t border-gray-800 mt-1">
              <div className="flex justify-between">
                <span className="text-white font-bold">Balance estimate</span>
                <span className="text-[#2952CC] font-bold">{formatDollars(reservation.balance_due_estimate)}</span>
              </div>
            </div>
          </div>

          {/* Dates card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-[#7A8B9A] uppercase tracking-wider mb-4">Rental Dates</h2>
            <DetailRow label="Pickup" value={formatDatetime(new Date(reservation.pickup_datetime))} />
            <DetailRow label="Return" value={formatDatetime(new Date(reservation.return_datetime))} />
            {reservation.pickup_location && (
              <DetailRow label="Pickup location" value={reservation.pickup_location} />
            )}
            {reservation.intended_use && (
              <DetailRow label="Intended use" value={reservation.intended_use} />
            )}
          </div>

          {/* Status card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-[#7A8B9A] uppercase tracking-wider mb-4">Status Summary</h2>
            <DetailRow label="Reservation" value={reservation.reservation_status.replace(/_/g, " ")} />
            <DetailRow label="Deposit" value={reservation.deposit_status.replace(/_/g, " ")} />
            <DetailRow label="Agreement" value={reservation.agreement_status.replace(/_/g, " ")} />
            <DetailRow label="Signature" value={reservation.signature_status.replace(/_/g, " ")} />
            {data.payments.length > 0 && (
              <DetailRow label="Payments" value={`${data.payments.length} transaction${data.payments.length !== 1 ? "s" : ""}`} />
            )}
          </div>
        </div>

        {/* Status history timeline */}
        {data.statusHistory.length > 0 && (
          <div className="mt-6 bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-[#7A8B9A] uppercase tracking-wider mb-4">Activity Log</h2>
            <div className="flex flex-col gap-3">
              {data.statusHistory.map((entry) => (
                <div key={entry.id} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[#2952CC] mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">{entry.new_status.replace(/_/g, " ")}</p>
                    {entry.note && <p className="text-[#7A8B9A] text-xs mt-0.5">{entry.note}</p>}
                    <p className="text-gray-600 text-xs mt-0.5">
                      {formatDatetime(new Date(entry.created_at))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer help */}
        <div className="mt-6 text-center">
          <p className="text-[#7A8B9A] text-sm mb-2">Questions about your reservation?</p>
          <a href="tel:8326277706" className="text-[#2952CC] hover:underline font-semibold">
            📞 (832) 627-7706
          </a>
          <span className="text-gray-700 mx-3">·</span>
          <Link href="/contact" className="text-[#7A8B9A] hover:text-white text-sm transition-colors">
            Contact Form
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
