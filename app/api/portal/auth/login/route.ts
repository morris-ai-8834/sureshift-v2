/**
 * app/api/portal/auth/login/route.ts
 * POST — Look up customer by email, generate auth token
 */

import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const sql = getDB();
    const rows = await sql`
      SELECT id, first_name, email FROM customers
      WHERE LOWER(email) = LOWER(${email.trim()})
      LIMIT 1`;

    if (rows.length === 0) {
      // Don't reveal if email exists — always return success
      return NextResponse.json({ success: true, redirect: null });
    }

    const customer = rows[0] as Record<string, unknown>;
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await sql`
      UPDATE customers
      SET auth_token = ${token}, token_expires_at = ${expiresAt.toISOString()}
      WHERE id = ${String(customer.id)}`;

    // For MVP: return the redirect URL directly (no email sending)
    return NextResponse.json({
      success: true,
      redirect: `/portal/dashboard?email=${encodeURIComponent(String(customer.email))}`,
      firstName: String(customer.first_name ?? ""),
    });
  } catch (err) {
    console.error("[POST /api/portal/auth/login]", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
