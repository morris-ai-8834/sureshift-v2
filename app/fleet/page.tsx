/**
 * app/fleet/page.tsx
 *
 * The public fleet listing page at /fleet.
 *
 * Fetches real vehicle data from the database via /api/vehicles.
 * Supports client-side filtering by make and tag (work-ready, fuel-efficient, etc.)
 * after the initial server-rendered data loads.
 *
 * Date filtering is passed as query params to the API so the availability
 * engine can exclude blocked vehicles before they reach the UI.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import type { VehicleRow } from "@/lib/types";
import { VehicleStatus } from "@/lib/constants";
import { formatDollars } from "@/lib/helpers";
import Link from "next/link";

// ============================================
// HELPER: Convert DB status value to display label
// ============================================

function getStatusLabel(status: string): { label: string; color: string } {
  switch (status) {
    case VehicleStatus.AVAILABLE:
      return { label: "Available Now", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" };
    case VehicleStatus.LIMITED_AVAILABILITY:
      return { label: "Limited Dates", color: "bg-amber-500/15 text-amber-400 border-amber-500/20" };
    case VehicleStatus.RESERVED:
      return { label: "Reserved", color: "bg-red-500/15 text-red-400 border-red-500/20" };
    case VehicleStatus.MAINTENANCE:
      return { label: "Maintenance", color: "bg-gray-500/15 text-gray-400 border-gray-500/20" };
    default:
      return { label: status, color: "bg-gray-500/15 text-gray-400 border-gray-500/20" };
  }
}

// ============================================
// HELPER: Build tag badges from boolean flags
// ============================================

function getVehicleTags(vehicle: VehicleRow): string[] {
  const tags: string[] = [];
  if (vehicle.work_ready) tags.push("Gig Work Ready");
  if (vehicle.fuel_efficient) tags.push("Fuel Efficient");
  if (vehicle.commuter_friendly) tags.push("Commuter Friendly");
  return tags;
}

// ============================================
// COMPONENT: VehicleCard
// Individual vehicle listing card for the fleet grid.
// ============================================

function VehicleCard({ vehicle }: { vehicle: VehicleRow }) {
  const status = getStatusLabel(vehicle.status);
  const tags = getVehicleTags(vehicle);
  const isBookable =
    vehicle.is_bookable &&
    (vehicle.status === VehicleStatus.AVAILABLE ||
      vehicle.status === VehicleStatus.LIMITED_AVAILABILITY);

  // Gradient colors keyed by make for visual variety
  const gradientByMake: Record<string, string> = {
    Toyota: "from-slate-700 to-slate-900",
    Nissan: "from-gray-700 to-gray-900",
    Ford: "from-blue-900 to-blue-950",
  };
  const gradient = gradientByMake[vehicle.make] ?? "from-neutral-700 to-neutral-900";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden group hover:border-[#2952CC]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#2952CC]/10 flex flex-col">
      {/* Vehicle image / placeholder */}
      <div className={`relative h-48 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
        {vehicle.image_cover_url ? (
          <img
            src={vehicle.image_cover_url}
            alt={vehicle.headline_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg viewBox="0 0 200 80" className="w-48 h-24 text-white/20 group-hover:text-white/30 transition-colors" fill="currentColor">
            <path d="M170 50H30c-5 0-10-3-10-8V38c0-5 3-8 8-8h8l20-20c3-3 7-5 12-5h64c5 0 9 2 12 5l20 20h6c5 0 8 3 8 8v4c0 5-3 8-8 8zM68 10H52l-16 16h32V10zm52 0H80v16h56V10h-16zm32 16h-16l16-16v16z" />
            <circle cx="55" cy="54" r="12" /><circle cx="145" cy="54" r="12" />
            <circle cx="55" cy="54" r="7" fill="#0D0D0D" /><circle cx="145" cy="54" r="7" fill="#0D0D0D" />
          </svg>
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Card content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">
              {vehicle.year} {vehicle.make} {vehicle.model}
              {vehicle.trim && <span className="text-[#7A8B9A] font-normal"> {vehicle.trim}</span>}
            </h3>
            <p className="text-sm text-[#7A8B9A] mt-0.5">
              {vehicle.fuel_type} · {vehicle.seats} seats · {vehicle.transmission}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{formatDollars(vehicle.daily_rate)}</p>
            <p className="text-xs text-[#7A8B9A]">per day</p>
          </div>
        </div>

        {/* Feature tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[#2952CC]/15 text-[#2952CC] border border-[#2952CC]/20 font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Deposit & MPG */}
        <p className="text-xs text-[#7A8B9A] mb-4">
          {formatDollars(vehicle.deposit_amount)} refundable deposit
          {vehicle.mpg_highway && ` · ${vehicle.mpg_highway} MPG hwy`}
        </p>

        {/* CTA buttons */}
        <div className="mt-auto flex gap-2">
          <Link
            href={`/fleet/${vehicle.slug}`}
            className="flex-1 text-center py-2.5 rounded-xl border border-gray-700 text-sm font-medium text-[#7A8B9A] hover:text-white hover:border-gray-600 transition-colors"
          >
            View Details
          </Link>
          <Link
            href={isBookable ? `/book?vehicle=${vehicle.id}` : "#"}
            className={`flex-1 text-center py-2.5 rounded-xl text-sm font-bold transition-all ${
              isBookable
                ? "bg-[#2952CC] text-white hover:bg-[#3561e0] hover:shadow-lg hover:shadow-[#2952CC]/30"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isBookable ? "Reserve" : "Unavailable"}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [makeFilter, setMakeFilter] = useState("All");
  const [tagFilter, setTagFilter] = useState("All");

  // Fetch vehicles from the live API on mount
  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/vehicles");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to load vehicles");
      }
      const data: VehicleRow[] = await res.json();
      setVehicles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // Derive unique makes from loaded vehicles
  const makes = ["All", ...Array.from(new Set(vehicles.map((v) => v.make))).sort()];

  // Client-side filter: by make and tag
  const filtered = vehicles.filter((v) => {
    const makeMatch = makeFilter === "All" || v.make === makeFilter;
    const tagMatch =
      tagFilter === "All" ||
      (tagFilter === "Work Ready" && v.work_ready) ||
      (tagFilter === "Fuel Efficient" && v.fuel_efficient) ||
      (tagFilter === "Commuter Friendly" && v.commuter_friendly);
    return makeMatch && tagMatch;
  });

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navbar />

      {/* Page header */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 border-b border-gray-800/60">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#2952CC] text-sm font-semibold uppercase tracking-widest mb-2">Our Fleet</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Available Vehicles</h1>
          <p className="text-[#7A8B9A] text-lg max-w-2xl">
            All vehicles are Uber and Lyft eligible. Daily and weekly rates include unlimited miles
            and liability coverage. Reserve online or call{" "}
            <a href="tel:8000000000" className="text-[#2952CC] hover:underline">(800) 000-0000</a>.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="px-4 sm:px-6 lg:px-8 py-5 bg-gray-950/40 border-b border-gray-800/40 sticky top-16 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Tag filters */}
          <div className="flex flex-wrap gap-2">
            {["All", "Work Ready", "Fuel Efficient", "Commuter Friendly"].map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tag)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  tagFilter === tag
                    ? "bg-[#2952CC] text-white"
                    : "bg-gray-900 text-[#7A8B9A] border border-gray-800 hover:border-gray-600 hover:text-white"
                }`}
              >
                {tag === "All" ? "All Vehicles" : tag}
              </button>
            ))}
          </div>

          {/* Make dropdown */}
          <select
            value={makeFilter}
            onChange={(e) => setMakeFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl text-sm text-white px-4 py-2 focus:outline-none focus:border-[#2952CC]"
          >
            {makes.map((m) => (
              <option key={m} value={m}>{m === "All" ? "All Makes" : m}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Fleet grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading && (
            <div className="text-center py-24">
              <div className="inline-block w-8 h-8 border-2 border-[#2952CC] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[#7A8B9A]">Loading fleet...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-24">
              <p className="text-red-400 mb-4">⚠️ {error}</p>
              <button
                onClick={loadVehicles}
                className="px-6 py-3 bg-[#2952CC] text-white rounded-xl font-medium hover:bg-[#3561e0] transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <>
              <p className="text-[#7A8B9A] text-sm mb-6">
                Showing {filtered.length} vehicle{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
              </div>
            </>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">🚗</div>
              <h3 className="text-xl font-bold text-white mb-2">No vehicles match your filters</h3>
              <p className="text-[#7A8B9A] mb-6">Try adjusting your filters or check back soon.</p>
              <button
                onClick={() => { setMakeFilter("All"); setTagFilter("All"); }}
                className="px-6 py-3 bg-[#2952CC] text-white rounded-xl font-medium hover:bg-[#3561e0] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-950/50 border-t border-gray-800/60">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-black text-white mb-3">Don&apos;t See What You Need?</h2>
          <p className="text-[#7A8B9A] mb-6">
            Our fleet updates regularly. Call or text us and we&apos;ll let you know when your ideal vehicle becomes available.
          </p>
          <a
            href="tel:8000000000"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2952CC] text-white font-bold rounded-xl hover:bg-[#3561e0] transition-colors"
          >
            📞 (800) 000-0000
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
