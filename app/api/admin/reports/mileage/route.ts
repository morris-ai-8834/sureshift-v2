import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

function buildCSV(headers: string[], rows: string[][]): string {
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(",")];
  for (const row of rows) lines.push(row.map(escape).join(","));
  return lines.join("\n");
}

export async function GET() {
  try {
    const sql = getDB();
    const rows = await sql`
      SELECT t.trip_start, t.trip_end, t.miles, t.duration_minutes, t.source,
             t.start_location, t.end_location,
             v.year, v.make, v.model
      FROM trips t
      LEFT JOIN vehicles v ON v.id = t.vehicle_id
      ORDER BY t.trip_start DESC NULLS LAST`;

    const csv = buildCSV(
      ["Vehicle", "Trip Start", "Trip End", "Miles", "Duration (min)", "Source", "Start Location", "End Location"],
      (rows as Record<string, unknown>[]).map((r) => [
        `${r.year ?? ""} ${r.make ?? ""} ${r.model ?? ""}`.trim(),
        r.trip_start ? new Date(String(r.trip_start)).toLocaleDateString() : "",
        r.trip_end ? new Date(String(r.trip_end)).toLocaleDateString() : "",
        String(r.miles ?? ""),
        String(r.duration_minutes ?? ""),
        String(r.source ?? ""),
        String(r.start_location ?? ""),
        String(r.end_location ?? ""),
      ])
    );

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="mileage-report.csv"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
