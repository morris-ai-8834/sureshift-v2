import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const groupBy = searchParams.get("groupBy");

  try {
    const sql = getDB();

    if (groupBy === "vehicle") {
      const rows = await sql`
        SELECT v.year, v.make, v.model, v.vehicle_code,
               COUNT(r.id) AS rental_count,
               COALESCE(SUM(r.estimated_rental_subtotal::numeric), 0) AS total_revenue,
               COALESCE(AVG(r.estimated_rental_subtotal::numeric), 0) AS avg_revenue
        FROM vehicles v
        LEFT JOIN reservations r ON r.vehicle_id = v.id AND r.reservation_status NOT IN ('cancelled')
        GROUP BY v.id, v.year, v.make, v.model, v.vehicle_code
        ORDER BY total_revenue DESC`;

      const csv = buildCSV(
        ["Vehicle", "Code", "Rentals", "Total Revenue", "Avg Revenue"],
        (rows as Record<string, unknown>[]).map((r) => [
          `${r.year} ${r.make} ${r.model}`,
          String(r.vehicle_code ?? ""),
          String(r.rental_count ?? 0),
          String(r.total_revenue ?? 0),
          String(parseFloat(String(r.avg_revenue ?? 0)).toFixed(2)),
        ])
      );
      return csvResponse(csv, "sales-by-vehicle.csv");
    }

    const rows = await sql`
      SELECT r.reservation_code, r.reservation_status, r.pickup_datetime, r.return_datetime,
             r.estimated_total_days, r.estimated_daily_rate, r.estimated_rental_subtotal,
             c.first_name, c.last_name, c.email, c.phone,
             v.year, v.make, v.model
      FROM reservations r
      LEFT JOIN customers c ON c.id = r.customer_id
      LEFT JOIN vehicles v ON v.id = r.vehicle_id
      ORDER BY r.created_at DESC`;

    const csv = buildCSV(
      ["Code", "Status", "Customer", "Email", "Phone", "Vehicle", "Pickup", "Return", "Days", "Daily Rate", "Total Revenue"],
      (rows as Record<string, unknown>[]).map((r) => [
        String(r.reservation_code ?? ""),
        String(r.reservation_status ?? ""),
        `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim(),
        String(r.email ?? ""),
        String(r.phone ?? ""),
        `${r.year ?? ""} ${r.make ?? ""} ${r.model ?? ""}`.trim(),
        r.pickup_datetime ? new Date(String(r.pickup_datetime)).toLocaleDateString() : "",
        r.return_datetime ? new Date(String(r.return_datetime)).toLocaleDateString() : "",
        String(r.estimated_total_days ?? ""),
        String(r.estimated_daily_rate ?? ""),
        String(r.estimated_rental_subtotal ?? ""),
      ])
    );
    return csvResponse(csv, "monthly-sales.csv");
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

function buildCSV(headers: string[], rows: string[][]): string {
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(",")];
  for (const row of rows) lines.push(row.map(escape).join(","));
  return lines.join("\n");
}

function csvResponse(csv: string, filename: string) {
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
