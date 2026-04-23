"use client";

/**
 * app/admin/fleet/FleetTable.tsx
 *
 * Client component — fleet table with city filter tabs.
 */

import { useState } from "react";
import Link from "next/link";
import { Car } from "../../components/Icons";

type FleetRow = {
  id: string;
  vehicle_code: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  status: string;
  location_city: string;
  weekly_rate: string | null;
  daily_rate: string;
  current_odometer: number | null;
  color: string | null;
  plate: string | null;
  last_oil_change_mileage: number | null;
  days_since_last_rental: number | null;
};

const STATUS_COLORS: Record<string, string> = {
  available:            "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  limited_availability: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  reserved:             "bg-[#2952CC]/20 text-[#5b82f5] border border-[#2952CC]/30",
  maintenance:          "bg-orange-500/15 text-orange-400 border border-orange-500/20",
  retired:              "bg-[#1f2937] text-[#6b7280] border border-[#374151]",
};

const STATUS_LABELS: Record<string, string> = {
  available: "Available",
  limited_availability: "Limited",
  reserved: "Reserved",
  maintenance: "Maintenance",
  retired: "Retired",
};

function formatRate(rate: string | null | undefined): string {
  if (!rate) return "—";
  return `$${parseFloat(rate).toFixed(0)}/wk`;
}

export default function FleetTable({ vehicles }: { vehicles: FleetRow[] }) {
  const [filter, setFilter] = useState<"All" | "Houston" | "Dallas">("All");

  const filtered = vehicles.filter((v) => {
    if (filter === "All") return true;
    return v.location_city.toLowerCase().includes(filter.toLowerCase());
  });

  const tabs = ["All", "Houston", "Dallas"] as const;
  const counts = {
    All: vehicles.length,
    Houston: vehicles.filter((v) => v.location_city.toLowerCase().includes("houston")).length,
    Dallas: vehicles.filter((v) => v.location_city.toLowerCase().includes("dallas")).length,
  };

  // Status breakdown quick stats
  const byStatus = vehicles.reduce<Record<string, number>>((acc, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      {/* Quick stats strip */}
      <div className="flex flex-wrap gap-3 mb-5">
        {Object.entries(byStatus).map(([status, count]) => (
          <div key={status} className="flex items-center gap-2 bg-[#111827] border border-[#1f2937] rounded-lg px-3 py-2">
            <div className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_COLORS[status] ?? "bg-[#1f2937] text-[#6b7280]"}`}>
              {STATUS_LABELS[status] ?? status}
            </div>
            <span className="text-white text-sm font-bold">{count}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === tab
                ? "bg-[#2952CC] text-white"
                : "text-[#6b7280] hover:text-white hover:bg-[#1f2937]"
            }`}
          >
            {tab}
            <span className="ml-1.5 text-xs opacity-60">{counts[tab]}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1f2937]">
                {["Vehicle", "Status", "City", "Weekly Rate", "Odometer", "Next Oil Change", "Last Rental", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[#6b7280] text-xs font-medium uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]">
              {filtered.map((v) => {
                const nextOilChange = v.last_oil_change_mileage
                  ? v.last_oil_change_mileage + 3000
                  : null;
                const oilDueMiles = nextOilChange && v.current_odometer
                  ? nextOilChange - v.current_odometer
                  : null;

                return (
                  <tr key={v.id} className="hover:bg-[#1f2937]/50 transition-colors">
                    {/* Vehicle thumbnail + info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#1f2937] flex items-center justify-center flex-shrink-0">
                          <Car className="w-5 h-5 text-[#4b5563]" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {v.year} {v.make} {v.model}
                          </p>
                          <p className="text-[#6b7280] text-xs">
                            <span className="font-mono">{v.vehicle_code}</span>
                            {v.plate && <span className="ml-1.5">· {v.plate}</span>}
                            {v.color && <span className="ml-1.5 text-[#4b5563]">{v.color}</span>}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_COLORS[v.status] ?? "bg-[#1f2937] text-[#6b7280]"}`}>
                        {STATUS_LABELS[v.status] ?? v.status}
                      </span>
                    </td>

                    {/* City */}
                    <td className="px-4 py-3 text-[#9ca3af] text-xs whitespace-nowrap">
                      {v.location_city}
                    </td>

                    {/* Rate */}
                    <td className="px-4 py-3">
                      <p className="text-white font-semibold text-sm">{formatRate(v.weekly_rate)}</p>
                    </td>

                    {/* Odometer */}
                    <td className="px-4 py-3 text-[#9ca3af] text-xs whitespace-nowrap">
                      {v.current_odometer ? v.current_odometer.toLocaleString() + " mi" : "—"}
                    </td>

                    {/* Next Oil Change */}
                    <td className="px-4 py-3">
                      {nextOilChange ? (
                        <div>
                          <p className={`text-xs font-medium ${oilDueMiles !== null && oilDueMiles <= 500 ? "text-orange-400" : oilDueMiles !== null && oilDueMiles <= 1000 ? "text-yellow-400" : "text-[#9ca3af]"}`}>
                            {nextOilChange.toLocaleString()} mi
                          </p>
                          {oilDueMiles !== null && (
                            <p className="text-[11px] text-[#6b7280]">
                              {oilDueMiles > 0 ? `${oilDueMiles.toLocaleString()} mi away` : "OVERDUE"}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#6b7280] text-xs">—</span>
                      )}
                    </td>

                    {/* Days since last rental */}
                    <td className="px-4 py-3 text-[#9ca3af] text-xs whitespace-nowrap">
                      {v.days_since_last_rental !== null
                        ? `${v.days_since_last_rental}d ago`
                        : "—"}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/fleet/${v.id}`}
                          className="text-[#5b82f5] text-xs hover:underline font-medium"
                        >
                          View
                        </Link>
                        <Link
                          href={`/fleet/${v.id}`}
                          className="text-[#6b7280] text-xs hover:text-white"
                          target="_blank"
                        >
                          Site ↗
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
