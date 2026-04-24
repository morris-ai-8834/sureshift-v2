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
      SELECT e.date, e.category, e.vendor, e.amount, e.payment_method, e.renter_caused, e.notes,
             v.year, v.make, v.model
      FROM vehicle_expenses e
      LEFT JOIN vehicles v ON v.id = e.vehicle_id
      ORDER BY e.date DESC`;

    const csv = buildCSV(
      ["Date", "Vehicle", "Category", "Vendor", "Amount", "Payment Method", "Renter Caused", "Notes"],
      (rows as Record<string, unknown>[]).map((r) => [
        String(r.date ?? "").slice(0, 10),
        `${r.year ?? ""} ${r.make ?? ""} ${r.model ?? ""}`.trim(),
        String(r.category ?? ""),
        String(r.vendor ?? ""),
        String(r.amount ?? ""),
        String(r.payment_method ?? ""),
        r.renter_caused ? "Yes" : "No",
        String(r.notes ?? ""),
      ])
    );

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="expense-report.csv"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
