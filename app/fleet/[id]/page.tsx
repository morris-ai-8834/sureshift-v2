/**
 * app/fleet/[id]/page.tsx
 *
 * Vehicle detail page at /fleet/[slug].
 *
 * Fetches the vehicle by slug from the database via /api/vehicles/[slug].
 * Shows full specs, pricing, requirements, and a reservation CTA.
 *
 * This is a server component — data is fetched at request time.
 * Uses Next.js notFound() for 404 handling.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import type { VehicleRow } from "@/lib/types";
import { VehicleStatus } from "@/lib/constants";
import { formatDollars } from "@/lib/helpers";

// ============================================
// DATA FETCHING
// Fetches a vehicle by slug from the API.
// Returns null if not found or if the request fails.
// ============================================

async function getVehicleBySlug(slug: string): Promise<VehicleRow | null> {
  try {
    // Use absolute URL for server-side fetch in Next.js
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/vehicles/${slug}`, {
      // Revalidate every 60 seconds — fleet data changes infrequently
      next: { revalidate: 60 },
    });

    if (res.status === 404) return null;
    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}

// ============================================
// HELPER: Status display data
// ============================================

function getStatusDisplay(status: string): { label: string; color: string } {
  switch (status) {
    case VehicleStatus.AVAILABLE:
      return { label: "Available Now", color: "text-emerald-400" };
    case VehicleStatus.LIMITED_AVAILABILITY:
      return { label: "Limited Availability", color: "text-amber-400" };
    case VehicleStatus.RESERVED:
      return { label: "Currently Reserved", color: "text-red-400" };
    default:
      return { label: status, color: "text-gray-400" };
  }
}

// ============================================
// HELPER: Vehicle gradient by make
// ============================================

function getGradient(make: string): string {
  const gradients: Record<string, string> = {
    Toyota: "from-slate-700 to-slate-900",
    Nissan: "from-gray-700 to-gray-900",
    Ford: "from-blue-900 to-blue-950",
  };
  return gradients[make] ?? "from-neutral-700 to-neutral-900";
}

// ============================================
// PAGE COMPONENT
// ============================================

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const vehicle = await getVehicleBySlug(id);

  // 404 if vehicle not found or API failed
  if (!vehicle) {
    notFound();
  }

  const statusDisplay = getStatusDisplay(vehicle.status);
  const isBookable =
    vehicle.is_bookable &&
    (vehicle.status === VehicleStatus.AVAILABLE ||
      vehicle.status === VehicleStatus.LIMITED_AVAILABILITY);
  const gradient = getGradient(vehicle.make);
  const dailyRate = parseFloat(vehicle.daily_rate);
  const weeklyRate = vehicle.weekly_rate ? parseFloat(vehicle.weekly_rate) : null;
  const deposit = parseFloat(vehicle.deposit_amount);

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navbar />

      {/* Breadcrumb */}
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <nav className="flex items-center gap-2 text-sm text-[#7A8B9A] py-4">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/fleet" className="hover:text-white transition-colors">Fleet</Link>
          <span>/</span>
          <span className="text-white">{vehicle.headline_name}</span>
        </nav>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ===== LEFT: Image + Details ===== */}
          <div className="lg:col-span-3 flex flex-col gap-6">

            {/* Vehicle image */}
            <div className={`relative h-64 sm:h-80 lg:h-96 bg-gradient-to-br ${gradient} rounded-2xl overflow-hidden flex items-center justify-center border border-gray-800`}>
              {vehicle.image_cover_url ? (
                <img
                  src={vehicle.image_cover_url}
                  alt={vehicle.headline_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg viewBox="0 0 200 80" className="w-64 h-32 text-white/20" fill="currentColor">
                  <path d="M170 50H30c-5 0-10-3-10-8V38c0-5 3-8 8-8h8l20-20c3-3 7-5 12-5h64c5 0 9 2 12 5l20 20h6c5 0 8 3 8 8v4c0 5-3 8-8 8zM68 10H52l-16 16h32V10zm52 0H80v16h56V10h-16zm32 16h-16l16-16v16z" />
                  <circle cx="55" cy="54" r="12" /><circle cx="145" cy="54" r="12" />
                  <circle cx="55" cy="54" r="7" fill="#0D0D0D" /><circle cx="145" cy="54" r="7" fill="#0D0D0D" />
                </svg>
              )}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full bg-black/50 border border-white/10 text-sm font-semibold ${statusDisplay.color}`}>
                  {statusDisplay.label}
                </span>
              </div>
              {vehicle.vehicle_code && (
                <div className="absolute bottom-4 left-4 text-white/40 text-xs font-mono">
                  {vehicle.vehicle_code}
                </div>
              )}
            </div>

            {/* Title + description */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">{vehicle.headline_name}</h1>
              <p className="text-[#7A8B9A] mt-3 text-lg leading-relaxed">{vehicle.description_short}</p>
              {vehicle.description_long && (
                <p className="text-[#7A8B9A]/80 mt-3 text-base leading-relaxed">{vehicle.description_long}</p>
              )}
            </div>

            {/* Feature tags */}
            {(vehicle.work_ready || vehicle.fuel_efficient || vehicle.commuter_friendly) && (
              <div className="flex flex-wrap gap-2">
                {vehicle.work_ready && (
                  <span className="px-3 py-1.5 rounded-full bg-[#2952CC]/15 text-[#2952CC] border border-[#2952CC]/20 text-sm font-medium">
                    🔧 Gig Work Ready
                  </span>
                )}
                {vehicle.fuel_efficient && (
                  <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-sm font-medium">
                    ⛽ Fuel Efficient
                  </span>
                )}
                {vehicle.commuter_friendly && (
                  <span className="px-3 py-1.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20 text-sm font-medium">
                    🏙️ Commuter Friendly
                  </span>
                )}
              </div>
            )}

            {/* Specs table */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-4">Vehicle Specs</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {[
                  { label: "Transmission", value: vehicle.transmission },
                  { label: "Fuel Type", value: vehicle.fuel_type },
                  { label: "Seats", value: `${vehicle.seats} passengers` },
                  { label: "MPG City", value: vehicle.mpg_city ? `${vehicle.mpg_city} MPG` : "N/A" },
                  { label: "MPG Highway", value: vehicle.mpg_highway ? `${vehicle.mpg_highway} MPG` : "N/A" },
                  { label: "Vehicle Type", value: vehicle.vehicle_type },
                  { label: "Location", value: vehicle.location_city },
                  { label: "Mileage Policy", value: "Unlimited miles" },
                  { label: "Insurance", value: "Liability included" },
                ].map((spec) => (
                  <div key={spec.label} className="flex flex-col gap-1">
                    <span className="text-xs text-[#7A8B9A] uppercase tracking-wider">{spec.label}</span>
                    <span className="text-white text-sm font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            {vehicle.requirements_note && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-white font-bold text-lg mb-3">Rental Requirements</h2>
                <p className="text-[#7A8B9A] text-sm leading-relaxed">{vehicle.requirements_note}</p>
              </div>
            )}

            {/* Pickup note */}
            {vehicle.pickup_note && (
              <div className="bg-[#2952CC]/10 border border-[#2952CC]/20 rounded-xl p-4">
                <p className="text-[#2952CC] font-semibold text-sm mb-1">📍 Pickup Information</p>
                <p className="text-[#7A8B9A] text-sm">{vehicle.pickup_note}</p>
              </div>
            )}
          </div>

          {/* ===== RIGHT: Pricing box ===== */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">

                {/* Price display */}
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-black text-white">{formatDollars(vehicle.daily_rate)}</span>
                  <span className="text-[#7A8B9A]">/ day</span>
                </div>
                {weeklyRate && (
                  <p className="text-sm text-emerald-400 mb-4">
                    {formatDollars(weeklyRate)}/week — save {formatDollars(dailyRate * 7 - weeklyRate)}
                  </p>
                )}

                {/* Status badge */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 border border-white/10 text-sm font-semibold mb-6 ${statusDisplay.color}`}>
                  <span className={`w-2 h-2 rounded-full ${vehicle.status === VehicleStatus.AVAILABLE ? "bg-emerald-400" : vehicle.status === VehicleStatus.LIMITED_AVAILABILITY ? "bg-amber-400" : "bg-red-400"}`} />
                  {statusDisplay.label}
                </div>

                {/* Pricing breakdown */}
                <div className="flex flex-col gap-0 mb-6 text-sm divide-y divide-gray-800">
                  <div className="flex justify-between py-3">
                    <span className="text-[#7A8B9A]">Daily rate</span>
                    <span className="text-white font-semibold">{formatDollars(vehicle.daily_rate)}</span>
                  </div>
                  {weeklyRate && (
                    <div className="flex justify-between py-3">
                      <span className="text-[#7A8B9A]">Weekly rate</span>
                      <span className="text-white font-semibold">{formatDollars(weeklyRate)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3">
                    <span className="text-[#7A8B9A]">Refundable deposit</span>
                    <span className="text-white font-semibold">{formatDollars(deposit)}</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-[#7A8B9A]">Mileage</span>
                    <span className="text-emerald-400 font-semibold">Unlimited</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-[#7A8B9A]">Insurance</span>
                    <span className="text-emerald-400 font-semibold">Included</span>
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="flex flex-col gap-3">
                  <Link
                    href={isBookable ? `/book?vehicle=${vehicle.id}` : "#"}
                    className={`w-full text-center py-4 rounded-xl font-bold text-lg transition-all ${
                      isBookable
                        ? "bg-[#2952CC] text-white hover:bg-[#3561e0] hover:shadow-lg hover:shadow-[#2952CC]/30"
                        : "bg-gray-800 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isBookable ? "Reserve This Car" : "Currently Unavailable"}
                  </Link>
                  <a
                    href="tel:8000000000"
                    className="w-full text-center py-3.5 rounded-xl border border-gray-700 font-semibold text-[#7A8B9A] hover:border-gray-500 hover:text-white transition-all"
                  >
                    📞 Call to Book
                  </a>
                </div>
              </div>

              {/* Tip box */}
              <div className="bg-[#2952CC]/10 border border-[#2952CC]/20 rounded-xl p-4 text-sm text-[#7A8B9A]">
                <p className="font-semibold text-[#2952CC] mb-1">💡 Quick Tip</p>
                <p>
                  Have your license and rideshare app ready. Most rentals are confirmed within a few hours.
                  Call{" "}
                  <a href="tel:8000000000" className="text-[#2952CC] hover:underline">(800) 000-0000</a>{" "}
                  for faster service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
