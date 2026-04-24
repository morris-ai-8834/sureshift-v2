/**
 * app/admin/integrations/page.tsx — Integrations Module
 */

import Link from "next/link";
import { getDB } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getIntegrationsData() {
  try {
    const sql = getDB();

    const [lastImport, importCount, tableCounts] = await Promise.all([
      sql`SELECT trip_start FROM trips WHERE source = 'bouncie_csv' ORDER BY created_at DESC LIMIT 1`,
      sql`SELECT COUNT(*) AS count FROM trips WHERE source = 'bouncie_csv'`,
      sql`
        SELECT
          (SELECT COUNT(*) FROM vehicles) AS vehicles,
          (SELECT COUNT(*) FROM reservations) AS reservations,
          (SELECT COUNT(*) FROM customers) AS customers,
          (SELECT COUNT(*) FROM trips) AS trips,
          (SELECT COUNT(*) FROM maintenance_records) AS maintenance_records,
          (SELECT COUNT(*) FROM vehicle_expenses) AS vehicle_expenses`,
    ]);

    const lastImportDate = lastImport[0]
      ? new Date(String((lastImport[0] as Record<string, unknown>).trip_start)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : null;
    const csvCount = parseInt(String((importCount[0] as Record<string, unknown>).count)) || 0;
    const counts = tableCounts[0] as Record<string, unknown>;

    return { lastImportDate, csvCount, counts };
  } catch (err) {
    console.error("[AdminIntegrations]", err);
    return { lastImportDate: null, csvCount: 0, counts: {} as Record<string, unknown> };
  }
}

export default async function AdminIntegrationsPage() {
  const data = await getIntegrationsData();

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Integrations</h1>
        <p className="text-gray-500 text-sm mt-0.5">Connected services and data pipelines</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

        {/* Bouncie card */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1f2937] rounded-xl flex items-center justify-center text-xl">🚗</div>
              <div>
                <p className="text-white font-bold">Bouncie GPS</p>
                <p className="text-gray-500 text-xs">Vehicle tracking</p>
              </div>
            </div>
            <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-xs font-semibold px-2 py-1 rounded-lg">
              Manual CSV
            </span>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Last import</span>
              <span className="text-gray-300">{data.lastImportDate ?? "Never"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Trips imported</span>
              <span className="text-gray-300">{data.csvCount.toLocaleString()}</span>
            </div>
          </div>
          <Link
            href="/admin/mileage"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2952CC] text-white text-sm font-semibold rounded-xl hover:bg-[#3561e0] transition-colors"
          >
            Upload CSV →
          </Link>
        </div>

        {/* Neon DB card */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1f2937] rounded-xl flex items-center justify-center text-xl">🐘</div>
              <div>
                <p className="text-white font-bold">Neon Database</p>
                <p className="text-gray-500 text-xs">PostgreSQL (serverless)</p>
              </div>
            </div>
            <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-xs font-semibold px-2 py-1 rounded-lg">
              Connected
            </span>
          </div>
          <div className="space-y-1.5 mb-2">
            {[
              ["vehicles", "Vehicles"],
              ["reservations", "Reservations"],
              ["customers", "Customers"],
              ["trips", "Trips"],
              ["maintenance_records", "Maintenance"],
              ["vehicle_expenses", "Expenses"],
            ].map(([key, label]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-300 font-mono">{String(data.counts[key] ?? 0)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stripe card */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1f2937] rounded-xl flex items-center justify-center text-xl">💳</div>
              <div>
                <p className="text-white font-bold">Stripe</p>
                <p className="text-gray-500 text-xs">Payment processing</p>
              </div>
            </div>
            <span className="bg-amber-500/15 text-amber-400 border border-amber-500/25 text-xs font-semibold px-2 py-1 rounded-lg">
              Not Connected
            </span>
          </div>
          <p className="text-gray-500 text-sm mb-4">Connect Stripe to accept deposit payments online.</p>
          <button className="px-4 py-2 bg-[#1f2937] border border-[#2952CC]/30 text-[#6b9fff] text-sm font-semibold rounded-xl hover:bg-[#2952CC]/10 transition-colors">
            Configure Stripe
          </button>
        </div>

      </div>

      {/* Future integrations */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Coming Soon</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: "Bouncie API", desc: "Real-time GPS tracking via Bouncie API", emoji: "🔌" },
            { name: "DocuSign", desc: "E-signature for rental agreements", emoji: "✍️" },
            { name: "SendGrid", desc: "Automated email notifications", emoji: "📧" },
          ].map((item) => (
            <div key={item.name} className="flex items-start gap-3 p-3 bg-[#0A0A0F] rounded-xl border border-[#1f2937]">
              <span className="text-xl">{item.emoji}</span>
              <div>
                <p className="text-gray-300 font-semibold text-sm">{item.name}</p>
                <p className="text-gray-600 text-xs mt-0.5">{item.desc}</p>
                <span className="inline-block mt-1 bg-gray-800 text-gray-500 text-[10px] px-1.5 py-0.5 rounded font-semibold">PLANNED</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
