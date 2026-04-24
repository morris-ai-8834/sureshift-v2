/**
 * app/admin/reports/page.tsx — Reports Module
 */

"use client";

import { useState } from "react";

const REPORTS = [
  {
    id: "sales",
    name: "Monthly Sales Report",
    description: "Reservations with customer, vehicle, and revenue details.",
    endpoint: "/api/admin/reports/sales",
  },
  {
    id: "vehicle-sales",
    name: "Sales by Vehicle",
    description: "Revenue grouped and summarized by vehicle.",
    endpoint: "/api/admin/reports/sales?groupBy=vehicle",
  },
  {
    id: "mileage",
    name: "Mileage Report",
    description: "Trip log grouped by vehicle with total miles.",
    endpoint: "/api/admin/reports/mileage",
  },
  {
    id: "maintenance",
    name: "Maintenance Due Report",
    description: "Maintenance records not yet completed.",
    endpoint: "/api/admin/reports/maintenance",
  },
  {
    id: "expenses",
    name: "Expense Report",
    description: "Vehicle expenses grouped by category.",
    endpoint: "/api/admin/reports/expenses",
  },
  {
    id: "pnl",
    name: "Vehicle P&L Report",
    description: "Full profit & loss per vehicle.",
    endpoint: "/api/admin/reports/pnl",
  },
];

function ReportCard({ report }: { report: typeof REPORTS[0] }) {
  const [toast, setToast] = useState("");

  function handleCSV() {
    window.open(`${report.endpoint}?format=csv`, "_blank");
  }

  function handlePDF() {
    setToast("PDF export coming soon!");
    setTimeout(() => setToast(""), 3000);
  }

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5 flex flex-col gap-4">
      <div>
        <h3 className="text-white font-bold text-base mb-1">{report.name}</h3>
        <p className="text-gray-500 text-sm">{report.description}</p>
      </div>
      <div className="flex gap-2 mt-auto">
        <button
          onClick={handleCSV}
          className="flex-1 px-3 py-2 bg-[#2952CC] text-white text-sm font-semibold rounded-xl hover:bg-[#3561e0] transition-colors"
        >
          Generate CSV
        </button>
        <button
          onClick={handlePDF}
          className="flex-1 px-3 py-2 bg-[#1f2937] text-gray-400 text-sm font-semibold rounded-xl hover:bg-[#2a3444] transition-colors"
        >
          PDF
        </button>
      </div>
      {toast && (
        <p className="text-amber-400 text-xs">{toast}</p>
      )}
    </div>
  );
}

export default function AdminReportsPage() {
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Reports</h1>
        <p className="text-gray-500 text-sm mt-0.5">Export business data as CSV or PDF</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {REPORTS.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>
    </div>
  );
}
