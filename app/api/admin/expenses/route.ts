/**
 * app/api/admin/expenses/route.ts
 * GET all expenses, POST create expense
 */

import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET() {
  try {
    const sql = getDB();
    const rows = await sql`
      SELECT e.*, v.year, v.make, v.model
      FROM vehicle_expenses e
      LEFT JOIN vehicles v ON v.id = e.vehicle_id
      ORDER BY e.date DESC, e.created_at DESC`;
    return NextResponse.json(rows);
  } catch (err) {
    console.error("[GET /api/admin/expenses]", err);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, vehicle_id, category, vendor, amount, payment_method, renter_caused, notes } = body;

    if (!date || !vehicle_id || !category || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sql = getDB();
    const result = await sql`
      INSERT INTO vehicle_expenses (vehicle_id, date, category, vendor, amount, payment_method, renter_caused, notes)
      VALUES (${vehicle_id}, ${date}, ${category}, ${vendor || null}, ${amount}, ${payment_method || null}, ${renter_caused ?? false}, ${notes || null})
      RETURNING *`;

    return NextResponse.json(result[0], { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/expenses]", err);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
