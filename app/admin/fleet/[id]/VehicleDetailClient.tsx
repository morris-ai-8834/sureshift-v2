"use client";

/**
 * app/admin/fleet/[id]/VehicleDetailClient.tsx
 *
 * Client component with tabs: Overview | Maintenance | Expenses | Trips
 */

import { useState } from "react";
import Link from "next/link";
import { Car, Wrench, CreditCard, Speedometer, CheckCircle, Alert } from "../../../components/Icons";
import { formatDollars } from "@/lib/helpers";

type Props = {
  vehicle: Record<string, unknown>;
  maintenance: Record<string, unknown>[];
  expenses: Record<string, unknown>[];
  trips: Record<string, unknown>[];
  rentals: Record<string, unknown>[];
  revenue: { thisMonth: number; lifetime: number };
};

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-emerald-500/15 text-emerald-400",
  pending:   "bg-blue-500/15 text-blue-400",
  overdue:   "bg-red-500/15 text-red-400",
  due_soon:  "bg-amber-500/15 text-amber-400",
};

const RES_STATUS_COLORS: Record<string, string> = {
  active:    "bg-[#2952CC]/20 text-[#5b82f5]",
  completed: "bg-[#1f2937] text-[#6b7280]",
  confirmed: "bg-emerald-500/15 text-emerald-400",
  awaiting_deposit: "bg-yellow-500/15 text-yellow-400",
  agreement_sent: "bg-violet-500/15 text-violet-400",
};

function fmt(val: unknown): string {
  if (val === null || val === undefined) return "—";
  return String(val);
}

function fmtDate(val: unknown): string {
  if (!val) return "—";
  const d = new Date(String(val));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function VehicleDetailClient({ vehicle, maintenance, expenses, trips, rentals, revenue }: Props) {
  const [tab, setTab] = useState<"overview" | "maintenance" | "expenses" | "trips">("overview");

  const v = vehicle;
  const odo = Number(v.current_odometer) || 0;

  // Next oil change
  const lastOilCompleted = [...maintenance]
    .filter((m) => m.service_type === "Oil Change" && m.status === "completed")
    .sort((a, b) => new Date(String(b.completed_date)).getTime() - new Date(String(a.completed_date)).getTime())[0];
  const nextOilMileage = lastOilCompleted
    ? (Number(lastOilCompleted.completed_mileage) || 0) + 3000
    : null;

  // Expenses this month
  const now = new Date();
  const expensesThisMonth = expenses
    .filter((e) => {
      const d = new Date(String(e.date));
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + parseFloat(String(e.amount) || "0"), 0);

  const TABS = [
    { key: "overview",     label: "Overview",     Icon: Car },
    { key: "maintenance",  label: "Maintenance",  Icon: Wrench },
    { key: "expenses",     label: "Expenses",     Icon: CreditCard },
    { key: "trips",        label: "Trips",        Icon: Speedometer },
  ] as const;

  return (
    <div>
      {/* Vehicle Header */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-16 rounded-xl bg-[#1f2937] flex items-center justify-center flex-shrink-0">
            <Car className="w-8 h-8 text-[#4b5563]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-white">
                {fmt(v.year)} {fmt(v.make)} {fmt(v.model)}
                {v.trim ? <span className="text-[#6b7280] font-normal"> {fmt(v.trim)}</span> : null}
              </h1>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                String(v.status) === "available" ? "bg-emerald-500/15 text-emerald-400" :
                String(v.status) === "reserved" ? "bg-[#2952CC]/20 text-[#5b82f5]" :
                "bg-[#1f2937] text-[#6b7280]"
              }`}>
                {String(v.status).replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-xs text-[#6b7280]">
              <span>Code: <span className="font-mono text-[#9ca3af]">{fmt(v.vehicle_code)}</span></span>
              {v.plate ? <span>Plate: <span className="text-[#9ca3af]">{fmt(v.plate)}</span></span> : null}
              {v.color ? <span>Color: <span className="text-[#9ca3af]">{fmt(v.color)}</span></span> : null}
              {v.vin ? <span>VIN: <span className="font-mono text-[#9ca3af]">{fmt(v.vin)}</span></span> : null}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-white font-bold text-lg">{v.weekly_rate ? formatDollars(String(v.weekly_rate)) : "—"}<span className="text-[#6b7280] text-xs font-normal">/wk</span></p>
            <p className="text-[#6b7280] text-xs">{v.location_city as string}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key
                ? "bg-[#2952CC] text-white"
                : "text-[#6b7280] hover:text-white hover:bg-[#1f2937]"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* Key stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Revenue This Month", value: formatDollars(revenue.thisMonth), accent: "text-emerald-400" },
              { label: "Lifetime Revenue", value: formatDollars(revenue.lifetime), accent: "text-white" },
              { label: "Current Odometer", value: odo ? odo.toLocaleString() + " mi" : "—", accent: "text-white" },
              { label: "Next Oil Change", value: nextOilMileage ? nextOilMileage.toLocaleString() + " mi" : "—", accent: nextOilMileage && odo && nextOilMileage - odo < 500 ? "text-orange-400" : "text-white" },
            ].map(({ label, value, accent }) => (
              <div key={label} className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
                <p className="text-[#6b7280] text-xs uppercase tracking-wider mb-2">{label}</p>
                <p className={`text-xl font-bold ${accent}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Recent rentals */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1f2937]">
              <h3 className="text-white font-semibold text-sm">Recent Rentals</h3>
            </div>
            {rentals.length === 0 ? (
              <div className="p-6 text-center text-[#6b7280] text-sm">No rentals yet</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1f2937]">
                    {["Customer", "Pickup", "Return", "Status", "Amount"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[#6b7280] text-xs font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937]">
                  {rentals.map((r) => (
                    <tr key={String(r.id)} className="hover:bg-[#1f2937]/40 transition-colors">
                      <td className="px-4 py-3 text-white text-sm">{fmt(r.customer_first_name)} {fmt(r.customer_last_name)}</td>
                      <td className="px-4 py-3 text-[#9ca3af] text-xs">{fmtDate(r.pickup_datetime)}</td>
                      <td className="px-4 py-3 text-[#9ca3af] text-xs">{fmtDate(r.return_datetime)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${RES_STATUS_COLORS[String(r.reservation_status)] ?? "bg-[#1f2937] text-[#6b7280]"}`}>
                          {String(r.reservation_status).replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white text-sm font-medium">{formatDollars(String(r.estimated_rental_subtotal))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── MAINTENANCE TAB ── */}
      {tab === "maintenance" && (
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1f2937] flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Maintenance Records</h3>
            <button className="px-3 py-1.5 bg-[#2952CC] text-white rounded-lg text-xs font-medium hover:bg-[#3561e0] transition-colors">
              + Add Record
            </button>
          </div>
          {maintenance.length === 0 ? (
            <div className="p-6 text-center text-[#6b7280] text-sm">No records yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1f2937]">
                    {["Service", "Due Date", "Due Mileage", "Completed", "Cost", "Vendor", "Status"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[#6b7280] text-xs font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937]">
                  {maintenance.map((m) => (
                    <tr key={String(m.id)} className="hover:bg-[#1f2937]/40 transition-colors">
                      <td className="px-4 py-3 text-white text-sm font-medium">{fmt(m.service_type)}</td>
                      <td className="px-4 py-3 text-[#9ca3af] text-xs">{fmtDate(m.due_date)}</td>
                      <td className="px-4 py-3 text-[#9ca3af] text-xs">{m.due_mileage ? Number(m.due_mileage).toLocaleString() + " mi" : "—"}</td>
                      <td className="px-4 py-3 text-[#9ca3af] text-xs">{fmtDate(m.completed_date)}</td>
                      <td className="px-4 py-3 text-white text-sm">{m.cost ? formatDollars(String(m.cost)) : "—"}</td>
                      <td className="px-4 py-3 text-[#9ca3af] text-xs">{fmt(m.vendor)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_COLORS[String(m.status)] ?? "bg-[#1f2937] text-[#6b7280]"}`}>
                          {fmt(m.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── EXPENSES TAB ── */}
      {tab === "expenses" && (
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1f2937] flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-sm">Vehicle Expenses</h3>
              <p className="text-[#6b7280] text-xs mt-0.5">
                This month: <span className="text-white font-medium">{formatDollars(expensesThisMonth)}</span>
              </p>
            </div>
            <button className="px-3 py-1.5 bg-[#2952CC] text-white rounded-lg text-xs font-medium hover:bg-[#3561e0] transition-colors">
              + Add Expense
            </button>
          </div>
          {expenses.length === 0 ? (
            <div className="p-6 text-center text-[#6b7280] text-sm">No expenses yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1f2937]">
                    {["Date", "Category", "Vendor", "Amount", "Payment", "Renter Caused"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[#6b7280] text-xs font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937]">
                  {expenses.map((e) => (
                    <tr key={String(e.id)} className="hover:bg-[#1f2937]/40 transition-colors">
                      <td className="px-4 py-3 text-[#9ca3af] text-xs">{fmtDate(e.date)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-[#1f2937] text-[#9ca3af] rounded text-[11px] font-medium">{fmt(e.category)}</span>
                      </td>
                      <td className="px-4 py-3 text-[#9ca3af] text-xs">{fmt(e.vendor)}</td>
                      <td className="px-4 py-3 text-white text-sm font-semibold">{formatDollars(String(e.amount))}</td>
                      <td className="px-4 py-3 text-[#9ca3af] text-xs">{fmt(e.payment_method)}</td>
                      <td className="px-4 py-3">
                        {e.renter_caused ? (
                          <span className="flex items-center gap-1 text-orange-400 text-xs font-medium">
                            <Alert className="w-3 h-3" /> Yes
                          </span>
                        ) : (
                          <span className="text-[#6b7280] text-xs">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TRIPS TAB ── */}
      {tab === "trips" && (
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1f2937]">
            <h3 className="text-white font-semibold text-sm">Trip Log</h3>
          </div>
          {trips.length === 0 ? (
            <div className="p-6 text-center text-[#6b7280] text-sm">No trips recorded</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1f2937]">
                    {["Date", "Start", "End", "Miles", "Duration"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[#6b7280] text-xs font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937]">
                  {trips.map((t) => (
                    <tr key={String(t.id)} className="hover:bg-[#1f2937]/40 transition-colors">
                      <td className="px-4 py-3 text-[#9ca3af] text-xs">{fmtDate(t.trip_start)}</td>
                      <td className="px-4 py-3 text-[#9ca3af] text-xs max-w-[200px] truncate">{fmt(t.start_location)}</td>
                      <td className="px-4 py-3 text-[#9ca3af] text-xs max-w-[200px] truncate">{fmt(t.end_location)}</td>
                      <td className="px-4 py-3 text-white text-sm font-medium">{t.miles ? parseFloat(String(t.miles)).toFixed(1) + " mi" : "—"}</td>
                      <td className="px-4 py-3 text-[#9ca3af] text-xs">{t.duration_minutes ? t.duration_minutes + " min" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
