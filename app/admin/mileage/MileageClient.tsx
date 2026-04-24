"use client";

import { useState } from "react";

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
}

interface PreviewRow {
  device_name: string;
  miles: string;
  trip_start: string;
  trip_end: string;
  start_location: string;
  end_location: string;
}

export default function MileageCSVUpload({ vehicles }: { vehicles: Vehicle[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [error, setError] = useState("");

  async function handlePreview() {
    if (!file) return;
    setError("");
    const text = await file.text();
    const lines = text.trim().split("\n");
    if (lines.length < 2) { setError("CSV appears empty."); return; }
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

    const idx = (name: string) => headers.findIndex((h) => h.toLowerCase().includes(name.toLowerCase()));
    const deviceIdx = idx("Device Name");
    const distIdx = idx("Trip Distance");
    const startIdx = idx("Trip Start");
    const endIdx = idx("Trip End");
    const startAddrIdx = idx("Start Address");
    const endAddrIdx = idx("End Address");

    const rows: PreviewRow[] = [];
    for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      rows.push({
        device_name: deviceIdx >= 0 ? cols[deviceIdx] : "—",
        miles: distIdx >= 0 ? cols[distIdx] : "—",
        trip_start: startIdx >= 0 ? cols[startIdx] : "—",
        trip_end: endIdx >= 0 ? cols[endIdx] : "—",
        start_location: startAddrIdx >= 0 ? cols[startAddrIdx] : "—",
        end_location: endAddrIdx >= 0 ? cols[endAddrIdx] : "—",
      });
    }
    setPreview(rows);
  }

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/mileage/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setResult(data);
      setFile(null);
      setPreview([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6 mb-6">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Upload Bouncie CSV</h2>

      {/* Field mapping reference */}
      <div className="bg-[#0A0A0F] border border-[#1f2937] rounded-xl p-4 mb-4 text-xs text-gray-500">
        <p className="text-gray-400 font-semibold mb-2">Expected CSV columns:</p>
        <div className="grid grid-cols-2 gap-1">
          {[
            ["Device Name", "→ vehicle identifier"],
            ["Trip Distance (mi)", "→ miles"],
            ["Trip Start", "→ trip_start"],
            ["Trip End", "→ trip_end"],
            ["Start Address", "→ start_location"],
            ["End Address", "→ end_location"],
          ].map(([col, desc]) => (
            <div key={col} className="flex gap-2">
              <span className="text-[#6b9fff]">{col}</span>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <label className="flex items-center gap-2 px-4 py-2.5 bg-[#1f2937] border border-[#2952CC]/50 rounded-xl text-sm text-white cursor-pointer hover:bg-[#2952CC]/10 transition-colors">
          <span>📁</span>
          <span>{file ? file.name : "Choose CSV file"}</span>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => { setFile(e.target.files?.[0] ?? null); setPreview([]); setResult(null); }}
          />
        </label>
        {file && (
          <button
            onClick={handlePreview}
            className="px-4 py-2.5 bg-[#1f2937] border border-[#1f2937] text-white text-sm rounded-xl hover:bg-[#2a3444] transition-colors"
          >
            Preview Import
          </button>
        )}
        {preview.length > 0 && (
          <button
            onClick={handleImport}
            disabled={loading}
            className="px-4 py-2.5 bg-[#2952CC] text-white text-sm font-bold rounded-xl hover:bg-[#3561e0] transition-colors disabled:opacity-50"
          >
            {loading ? "Importing..." : "Confirm Import"}
          </button>
        )}
      </div>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      {result && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-3 text-sm">
          <p className="text-emerald-400 font-semibold">Import complete!</p>
          <p className="text-gray-300 mt-1">Imported: {result.imported} · Skipped: {result.skipped}</p>
          {result.errors.length > 0 && (
            <p className="text-red-400 text-xs mt-1">{result.errors.slice(0, 3).join(", ")}</p>
          )}
        </div>
      )}

      {preview.length > 0 && (
        <div className="overflow-x-auto">
          <p className="text-gray-500 text-xs mb-2">Preview (first {preview.length} rows):</p>
          <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-[#1f2937]">
                {["Device", "Miles", "Start", "End", "From", "To"].map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-gray-500 text-[10px] font-semibold uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className="border-b border-[#1f2937]">
                  <td className="px-3 py-2 text-gray-300">{row.device_name}</td>
                  <td className="px-3 py-2 text-white font-semibold">{row.miles}</td>
                  <td className="px-3 py-2 text-gray-400">{row.trip_start.slice(0, 16)}</td>
                  <td className="px-3 py-2 text-gray-400">{row.trip_end.slice(0, 16)}</td>
                  <td className="px-3 py-2 text-gray-500 truncate max-w-[120px]">{row.start_location}</td>
                  <td className="px-3 py-2 text-gray-500 truncate max-w-[120px]">{row.end_location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-600">
        <p>Available vehicles for matching: {vehicles.map((v) => `${v.make} ${v.model}`).join(", ")}</p>
      </div>
    </div>
  );
}
