/**
 * app/api/admin/mileage/import/route.ts
 * POST — Accept CSV file upload, parse, match vehicles, insert trips
 */

import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.trim().split("\n");
    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV has no data rows" }, { status: 400 });
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());

    function idx(name: string): number {
      return headers.findIndex((h) => h.includes(name.toLowerCase()));
    }

    const deviceIdx = idx("device name");
    const distIdx = idx("trip distance");
    const startIdx = idx("trip start");
    const endIdx = idx("trip end");
    const startAddrIdx = idx("start address");
    const endAddrIdx = idx("end address");

    // Load all vehicles for matching
    const sql = getDB();
    const vehicles = await sql`SELECT id, year, make, model, tracker_device_id FROM vehicles` as Record<string, unknown>[];

    function matchVehicle(deviceName: string): string | null {
      const dn = deviceName.toLowerCase();
      for (const v of vehicles) {
        if (v.tracker_device_id && String(v.tracker_device_id).toLowerCase() === dn) return String(v.id);
        if (dn.includes(String(v.make).toLowerCase()) || dn.includes(String(v.model).toLowerCase())) return String(v.id);
      }
      return null;
    }

    function parseDate(s: string): string | null {
      if (!s || s === "—") return null;
      try {
        return new Date(s).toISOString();
      } catch {
        return null;
      }
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));

      const deviceName = deviceIdx >= 0 ? cols[deviceIdx] : "";
      const miles = distIdx >= 0 ? parseFloat(cols[distIdx]) : NaN;
      const tripStartStr = startIdx >= 0 ? cols[startIdx] : "";
      const tripEndStr = endIdx >= 0 ? cols[endIdx] : "";
      const startAddr = startAddrIdx >= 0 ? cols[startAddrIdx] : null;
      const endAddr = endAddrIdx >= 0 ? cols[endAddrIdx] : null;

      if (!deviceName || isNaN(miles)) {
        skipped++;
        continue;
      }

      const vehicleId = matchVehicle(deviceName);
      if (!vehicleId) {
        errors.push(`Row ${i}: no vehicle match for "${deviceName}"`);
        skipped++;
        continue;
      }

      const tripStart = parseDate(tripStartStr);
      const tripEnd = parseDate(tripEndStr);

      // Calculate duration in minutes
      let durationMinutes: number | null = null;
      if (tripStart && tripEnd) {
        const ms = new Date(tripEnd).getTime() - new Date(tripStart).getTime();
        if (ms > 0) durationMinutes = Math.round(ms / 60000);
      }

      try {
        await sql`
          INSERT INTO trips (vehicle_id, source, trip_start, trip_end, start_location, end_location, miles, duration_minutes)
          VALUES (
            ${vehicleId},
            'bouncie_csv',
            ${tripStart},
            ${tripEnd},
            ${startAddr},
            ${endAddr},
            ${miles},
            ${durationMinutes}
          )`;
        imported++;
      } catch (err) {
        errors.push(`Row ${i}: ${err instanceof Error ? err.message : "insert failed"}`);
        skipped++;
      }
    }

    return NextResponse.json({ imported, skipped, errors: errors.slice(0, 10) });
  } catch (err) {
    console.error("[POST /api/admin/mileage/import]", err);
    return NextResponse.json({ error: "Import failed", detail: String(err) }, { status: 500 });
  }
}
