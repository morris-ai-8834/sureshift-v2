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

    const [vehicles, revenueRes, expenseRes] = await Promise.all([
      sql`SELECT id, year, make, model, vehicle_code FROM vehicles ORDER BY year DESC, make ASC`,
      sql`
        SELECT vehicle_id, COALESCE(SUM(estimated_rental_subtotal::numeric), 0) AS revenue, COUNT(*) AS rentals
        FROM reservations WHERE reservation_status NOT IN ('cancelled') GROUP BY vehicle_id`,
      sql`
        SELECT vehicle_id, COALESCE(SUM(amount::numeric), 0) AS expenses
        FROM vehicle_expenses GROUP BY vehicle_id`,
    ]);

    const revMap: Record<string, { revenue: number; rentals: number }> = {};
    for (const r of revenueRes as Record<string, unknown>[]) {
      revMap[String(r.vehicle_id)] = {
        revenue: parseFloat(String(r.revenue)) || 0,
        rentals: parseInt(String(r.rentals)) || 0,
      };
    }
    const expMap: Record<string, number> = {};
    for (const e of expenseRes as Record<string, unknown>[]) {
      expMap[String(e.vehicle_id)] = parseFloat(String(e.expenses)) || 0;
    }

    const rows = (vehicles as Record<string, unknown>[]).map((v) => {
      const id = String(v.id);
      const revenue = revMap[id]?.revenue ?? 0;
      const expenses = expMap[id] ?? 0;
      const profit = revenue - expenses;
      const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : "0.0";
      return [
        `${v.year} ${v.make} ${v.model}`,
        String(v.vehicle_code ?? ""),
        String(revMap[id]?.rentals ?? 0),
        revenue.toFixed(2),
        expenses.toFixed(2),
        profit.toFixed(2),
        `${margin}%`,
      ];
    });

    const csv = buildCSV(
      ["Vehicle", "Code", "Rentals", "Revenue", "Expenses", "Gross Profit", "Margin %"],
      rows
    );

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="vehicle-pnl.csv"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
