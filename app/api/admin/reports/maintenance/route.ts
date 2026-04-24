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
      SELECT m.service_type, m.status, m.due_date, m.due_mileage, m.completed_date,
             m.completed_mileage, m.cost, m.vendor, m.notes,
             v.year, v.make, v.model, v.vehicle_code
      FROM maintenance_records m
      LEFT JOIN vehicles v ON v.id = m.vehicle_id
      WHERE m.status != 'completed'
      ORDER BY m.due_date ASC NULLS LAST`;

    const csv = buildCSV(
      ["Vehicle", "Code", "Service Type", "Status", "Due Date", "Due Mileage", "Cost", "Vendor", "Notes"],
      (rows as Record<string, unknown>[]).map((r) => [
        `${r.year ?? ""} ${r.make ?? ""} ${r.model ?? ""}`.trim(),
        String(r.vehicle_code ?? ""),
        String(r.service_type ?? ""),
        String(r.status ?? ""),
        String(r.due_date ?? "").slice(0, 10),
        String(r.due_mileage ?? ""),
        String(r.cost ?? ""),
        String(r.vendor ?? ""),
        String(r.notes ?? ""),
      ])
    );

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="maintenance-due.csv"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
