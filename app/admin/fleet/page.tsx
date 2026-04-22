/**
 * app/admin/fleet/page.tsx
 *
 * Admin fleet management page at /admin/fleet.
 *
 * Shows all vehicles in the fleet (all statuses) in a table view.
 * Each row has quick actions: view on site, toggle bookable status.
 *
 * This is a server component — data is always fresh on load.
 */

import Link from "next/link";
import Navbar from "../../components/Navbar";
import type { VehicleRow } from "@/lib/types";
import { VehicleStatus } from "@/lib/constants";
import { formatDollars } from "@/lib/helpers";

// ============================================
// DATA FETCHING
// ============================================

async function getAllVehicles(): Promise<VehicleRow[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/admin/vehicles`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// ============================================
// HELPER: Status display
// ============================================

function VehicleStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    [VehicleStatus.AVAILABLE]: "bg-emerald-500/15 text-emerald-400",
    [VehicleStatus.LIMITED_AVAILABILITY]: "bg-amber-500/15 text-amber-400",
    [VehicleStatus.RESERVED]: "bg-red-500/15 text-red-400",
    [VehicleStatus.MAINTENANCE]: "bg-orange-500/15 text-orange-400",
    [VehicleStatus.RETIRED]: "bg-gray-700/50 text-gray-500",
  };
  const labels: Record<string, string> = {
    [VehicleStatus.AVAILABLE]: "Available",
    [VehicleStatus.LIMITED_AVAILABILITY]: "Limited",
    [VehicleStatus.RESERVED]: "Reserved",
    [VehicleStatus.MAINTENANCE]: "Maintenance",
    [VehicleStatus.RETIRED]: "Retired",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] ?? "bg-gray-800 text-gray-400"}`}>
      {labels[status] ?? status}
    </span>
  );
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function AdminFleetPage() {
  const vehicles = await getAllVehicles();

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navbar />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-white">Fleet Management</h1>
              <span className="px-2.5 py-1 bg-[#2952CC]/20 text-[#2952CC] border border-[#2952CC]/30 rounded-lg text-xs font-bold uppercase tracking-wider">
                Admin
              </span>
            </div>
            <p className="text-[#7A8B9A] text-sm">{vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""} in fleet</p>
          </div>
          <Link href="/admin"
            className="px-4 py-2 bg-gray-900 border border-gray-800 text-[#7A8B9A] rounded-xl text-sm font-medium hover:text-white hover:border-gray-600 transition-colors"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Fleet stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total", count: vehicles.length, color: "text-white" },
            {
              label: "Available",
              count: vehicles.filter((v) => v.status === VehicleStatus.AVAILABLE || v.status === VehicleStatus.LIMITED_AVAILABILITY).length,
              color: "text-emerald-400"
            },
            {
              label: "Reserved",
              count: vehicles.filter((v) => v.status === VehicleStatus.RESERVED).length,
              color: "text-amber-400"
            },
            {
              label: "Inactive",
              count: vehicles.filter((v) => v.status === VehicleStatus.MAINTENANCE || v.status === VehicleStatus.RETIRED).length,
              color: "text-gray-500"
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <p className={`text-2xl font-black ${stat.color}`}>{stat.count}</p>
              <p className="text-[#7A8B9A] text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Fleet table */}
        {vehicles.length === 0 ? (
          <div className="text-center py-24 bg-gray-900 border border-gray-800 rounded-2xl">
            <p className="text-[#7A8B9A] text-lg mb-2">No vehicles in fleet</p>
            <p className="text-gray-600 text-sm">Run the seed script to add the initial fleet.</p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-4 py-3 text-[#7A8B9A] font-medium">Code</th>
                    <th className="text-left px-4 py-3 text-[#7A8B9A] font-medium">Vehicle</th>
                    <th className="text-left px-4 py-3 text-[#7A8B9A] font-medium hidden sm:table-cell">Type</th>
                    <th className="text-left px-4 py-3 text-[#7A8B9A] font-medium">Rate</th>
                    <th className="text-left px-4 py-3 text-[#7A8B9A] font-medium hidden md:table-cell">Deposit</th>
                    <th className="text-left px-4 py-3 text-[#7A8B9A] font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-[#7A8B9A] font-medium hidden lg:table-cell">Features</th>
                    <th className="text-left px-4 py-3 text-[#7A8B9A] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className={`hover:bg-gray-800/40 transition-colors ${vehicle.status === VehicleStatus.RETIRED ? "opacity-50" : ""}`}>
                      <td className="px-4 py-4">
                        <span className="font-mono text-white text-xs bg-gray-800 px-2 py-1 rounded">
                          {vehicle.vehicle_code}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-white font-semibold leading-tight">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                          {vehicle.trim && <span className="text-[#7A8B9A] font-normal"> {vehicle.trim}</span>}
                        </p>
                        <p className="text-[#7A8B9A] text-xs mt-0.5">{vehicle.transmission}</p>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <p className="text-[#7A8B9A] text-xs">{vehicle.vehicle_type}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-white font-semibold">{formatDollars(vehicle.daily_rate)}/day</p>
                        {vehicle.weekly_rate && (
                          <p className="text-[#7A8B9A] text-xs">{formatDollars(vehicle.weekly_rate)}/wk</p>
                        )}
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <p className="text-[#7A8B9A] text-xs">{formatDollars(vehicle.deposit_amount)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <VehicleStatusBadge status={vehicle.status} />
                        {!vehicle.is_bookable && vehicle.status !== VehicleStatus.RETIRED && (
                          <p className="text-xs text-red-400 mt-1">Not bookable</p>
                        )}
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {vehicle.work_ready && (
                            <span className="text-xs text-[#2952CC] bg-[#2952CC]/10 px-1.5 py-0.5 rounded">Work</span>
                          )}
                          {vehicle.fuel_efficient && (
                            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Eco</span>
                          )}
                          {vehicle.commuter_friendly && (
                            <span className="text-xs text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">Commuter</span>
                          )}
                          {vehicle.featured && (
                            <span className="text-xs text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">⭐ Featured</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/fleet/${vehicle.slug}`}
                            className="text-xs text-[#7A8B9A] hover:text-white transition-colors"
                            target="_blank"
                          >
                            View →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
