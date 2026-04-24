"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
}

const CATEGORIES = [
  "oil_change",
  "insurance",
  "repair",
  "tracker",
  "detailing",
  "tires",
  "registration",
  "misc",
];

const PAYMENT_METHODS = ["cash", "credit_card", "debit_card", "check", "ach", "other"];

export default function AddExpenseForm({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    vehicle_id: "",
    category: "misc",
    vendor: "",
    amount: "",
    payment_method: "credit_card",
    renter_caused: false,
    notes: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const target = e.target;
    const value = target instanceof HTMLInputElement && target.type === "checkbox"
      ? target.checked
      : target.value;
    setForm((prev) => ({ ...prev, [target.name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }
      setForm({
        date: new Date().toISOString().slice(0, 10),
        vehicle_id: "",
        category: "misc",
        vendor: "",
        amount: "",
        payment_method: "credit_card",
        renter_caused: false,
        notes: "",
      });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2.5 bg-[#2952CC] text-white text-sm font-bold rounded-xl hover:bg-[#3561e0] transition-colors"
        >
          + Add Expense
        </button>
      ) : (
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-bold text-base">New Expense</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-gray-300 text-sm"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Date */}
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0A0A0F] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#2952CC]"
                />
              </div>

              {/* Vehicle */}
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Vehicle</label>
                <select
                  name="vehicle_id"
                  value={form.vehicle_id}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0A0A0F] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#2952CC]"
                >
                  <option value="">Select vehicle...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.year} {v.make} {v.model}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full bg-[#0A0A0F] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#2952CC]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>

              {/* Vendor */}
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Vendor</label>
                <input
                  type="text"
                  name="vendor"
                  value={form.vendor}
                  onChange={handleChange}
                  placeholder="Vendor name"
                  className="w-full bg-[#0A0A0F] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#2952CC] placeholder-gray-600"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  className="w-full bg-[#0A0A0F] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#2952CC] placeholder-gray-600"
                />
              </div>

              {/* Payment method */}
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Payment Method</label>
                <select
                  name="payment_method"
                  value={form.payment_method}
                  onChange={handleChange}
                  className="w-full bg-[#0A0A0F] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#2952CC]"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={2}
                placeholder="Optional notes..."
                className="w-full bg-[#0A0A0F] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#2952CC] placeholder-gray-600 resize-none"
              />
            </div>

            {/* Renter caused */}
            <div className="flex items-center gap-2 mb-5">
              <input
                type="checkbox"
                id="renter_caused"
                name="renter_caused"
                checked={form.renter_caused}
                onChange={handleChange}
                className="rounded border-gray-600 bg-[#0A0A0F] text-[#2952CC]"
              />
              <label htmlFor="renter_caused" className="text-gray-300 text-sm">
                Renter caused (damage / liability)
              </label>
            </div>

            {error && (
              <p className="text-red-400 text-sm mb-4">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#2952CC] text-white text-sm font-bold rounded-xl hover:bg-[#3561e0] transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Expense"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
