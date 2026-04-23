"use client";

/**
 * app/admin/maintenance/MaintenanceTable.tsx
 *
 * Client component with filter tabs: All | Due Soon | Overdue | Completed
 */

import { useState } from "react";
import Link from "next/link";

type MaintenanceRow = {
  id: string;
  vehicle_id: string;
  vehicle_code: string;
  vehicle_year: number;
  vehicle_make: string;
  vehicle_model: string;
  current_odometer: number | null;
  service_type: string;
  due_date: string | null;
  due_mileage: number | null;
  completed_date: string | null;
  cost: string | null;
  vendor: string | null;
  status: string;
  notes: string | null;
};

type FilterKey = "All" | "Overdue" | "Due Soon" | "Completed";

const STATUS_STYLE: Record<string, { dot: string; text: string; badge: string }> = {
  overdue:   { dot: "bg-red-500",    text: "text-red-400",    badge: "bg-red-500/15 text-red-400 border border-red-500/20" },
  pending:   { dot: "bg-blue-400",   text: "text-blue-400",   badge: "bg-blue-500/15 text-blue-400 border border-blue-500/20" },
  completed: { dot: "bg-emerald-500",text: "text-emerald-400",badge: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" },
  due_soon:  { dot: "bg-amber-500",  text: "text-amber-400",  badge: "bg-amber-500/15 text-amber-400 border border-amber-500/20" },
};

function fmtDate(v: string | null | undefined) {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtDollars(v: string | null | undefined) {
  if (!v) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(v));
}

function isDueSoon(row: MaintenanceRow): boolean {
  if (row.status === "completed") return false;
  if (row.due_date) {
    const due = new Date(row.due_date);
    const diff = (due.getTime() - Date.now()) / 86400000;
    return diff <= 14 && diff >= 0;
  }
  if (row.due_mileage && row.current_odometer) {
    const milesAway = row.due_mileage - row.current_odometer;
    return milesAway <= 1000 && milesAway >= 0;
  }
  return false;
}

export default function MaintenanceTable({ records }: { records: MaintenanceRow[] }) {
  const [filter, setFilter] = useState<FilterKey>("All");

  const counts: Record<FilterKey, number> = {
    All: records.length,
    Overdue: records.filter((r) => r.status === "overdue").length,
    "Due Soon": records.filter((r) => r.status !== "completed" && r.status !== "overdue" && isDueSoon(r)).length,
    Completed: records.filter((r) => r.status === "completed").length,
  };

  const filtered = records.filter((r) => {
    if (filter === "All") return true;
    if (filter === "Overdue") return r.status === "overdue";
    if (filter === "Due Soon") return r.status !== "completed" && r.status !== "overdue" && isDueSoon(r);
    if (filter === "Completed") return r.status === "completed";
    return true;
  });

  const FILTERS: FilterKey[] = ["All", "Overdue", "Due Soon", "Completed"];

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-4">
        {FILTERS.map((f) => {
          const isActive = filter === f;
          const isAlert = (f === "Overdue" && counts.Overdue > 0) || (f === "Due Soon" && counts["Due Soon"] > 0);
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive
                  ? f === "Overdue" ? "bg-red-500 text-white" : "bg-[#2952CC] text-white"
                  : "text-[#6b7280] hover:text-white hover:bg-[#1f2937]"
              }`}
            >
              {f}
              {isAlert && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
              )}
              <span className={`text-xs opacity-60 ml-0.5`}>{counts[f]}</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-[#6b7280] text-sm">No records matching filter</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1f2937]">
                  {["Vehicle", "Service Type", "Due Date", "Due Mileage", "Status", "Cost", "Vendor"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[#6b7280] text-xs font-medium uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]">
                {filtered.map((rec) => {
                  const style = STATUS_STYLE[rec.status] ?? STATUS_STYLE.pending;
                  const due = isDueSoon(rec) && rec.status !== "overdue";

                  return (
                    <tr
                      key={rec.id}
                      className={`hover:bg-[#1f2937]/50 transition-colors ${
                        rec.status === "overdue" ? "bg-red-500/5" :
                        due ? "bg-amber-500/5" : ""
                      }`}
                    >
                      {/* Vehicle */}
                      <td className="px-4 py-3">
                        <Link href={`/admin/fleet/${rec.vehicle_id}`} className="hover:underline">
                          <p className="text-white text-sm font-medium">
                            {rec.vehicle_year} {rec.vehicle_make} {rec.vehicle_model}
                          </p>
                          <p className="text-[#6b7280] text-xs font-mono">{rec.vehicle_code}</p>
                        </Link>
                      </td>

                      {/* Service Type */}
                      <td className="px-4 py-3 text-white text-sm font-medium whitespace-nowrap">
                        {rec.service_type}
                      </td>

                      {/* Due Date */}
                      <td className="px-4 py-3">
                        <span className={`text-xs ${rec.status === "overdue" ? "text-red-400 font-semibold" : due ? "text-amber-400 font-semibold" : "text-[#9ca3af]"}`}>
                          {fmtDate(rec.due_date)}
                        </span>
                      </td>

                      {/* Due Mileage */}
                      <td className="px-4 py-3 text-[#9ca3af] text-xs whitespace-nowrap">
                        {rec.due_mileage ? rec.due_mileage.toLocaleString() + " mi" : "—"}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${style.badge}`}>
                          {rec.status}
                        </span>
                      </td>

                      {/* Cost */}
                      <td className="px-4 py-3 text-white text-sm">
                        {fmtDollars(rec.cost)}
                      </td>

                      {/* Vendor */}
                      <td className="px-4 py-3 text-[#9ca3af] text-xs">
                        {rec.vendor ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
