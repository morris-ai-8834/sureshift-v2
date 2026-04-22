/**
 * app/api/admin/vehicles/[id]/route.ts
 *
 * GET    /api/admin/vehicles/[id]  — Get single vehicle by UUID
 * PUT    /api/admin/vehicles/[id]  — Update vehicle fields
 * DELETE /api/admin/vehicles/[id]  — Mark vehicle as retired (soft delete)
 *
 * DELETE is a soft delete — sets status = retired rather than removing
 * the row, so historical reservations remain intact.
 */

import { NextRequest, NextResponse } from "next/server";
import { sql, typedSql } from "@/lib/db";
import { VehicleStatus } from "@/lib/constants";
import { getErrorMessage } from "@/lib/helpers";
import type { VehicleRow } from "@/lib/types";

type RouteParams = { params: Promise<{ id: string }> };

// ============================================
// GET /api/admin/vehicles/[id]
// ============================================

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;

    const vehicles = await typedSql<VehicleRow[]>`
      SELECT * FROM vehicles WHERE id = ${id} LIMIT 1
    `;

    if (vehicles.length === 0) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json(vehicles[0]);
  } catch (err) {
    console.error("[GET /api/admin/vehicles/[id]]", err);
    return NextResponse.json(
      { error: "Failed to fetch vehicle", detail: getErrorMessage(err) },
      { status: 500 }
    );
  }
}

// ============================================
// PUT /api/admin/vehicles/[id]
// Updates any subset of vehicle fields.
// ============================================

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // Confirm the vehicle exists before attempting update
    const existing = await typedSql<VehicleRow[]>`
      SELECT id FROM vehicles WHERE id = ${id} LIMIT 1
    `;

    if (existing.length === 0) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    let body: Partial<VehicleRow>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Update the vehicle with whatever fields were provided.
    // Only provided fields are changed — others retain their current values.
    await sql`
      UPDATE vehicles SET
        status            = COALESCE(${body.status ?? null}, status),
        headline_name     = COALESCE(${body.headline_name ?? null}, headline_name),
        description_short = COALESCE(${body.description_short ?? null}, description_short),
        description_long  = COALESCE(${body.description_long ?? null}, description_long),
        daily_rate        = COALESCE(${body.daily_rate ?? null}, daily_rate),
        deposit_amount    = COALESCE(${body.deposit_amount ?? null}, deposit_amount),
        weekly_rate       = COALESCE(${body.weekly_rate ?? null}, weekly_rate),
        featured          = COALESCE(${body.featured ?? null}, featured),
        is_bookable       = COALESCE(${body.is_bookable ?? null}, is_bookable),
        work_ready        = COALESCE(${body.work_ready ?? null}, work_ready),
        commuter_friendly = COALESCE(${body.commuter_friendly ?? null}, commuter_friendly),
        fuel_efficient    = COALESCE(${body.fuel_efficient ?? null}, fuel_efficient),
        image_cover_url   = COALESCE(${body.image_cover_url ?? null}, image_cover_url),
        requirements_note = COALESCE(${body.requirements_note ?? null}, requirements_note),
        pickup_note       = COALESCE(${body.pickup_note ?? null}, pickup_note),
        updated_at        = NOW()
      WHERE id = ${id}
    `;

    // Return the updated vehicle record
    const updated = await typedSql<VehicleRow[]>`
      SELECT * FROM vehicles WHERE id = ${id} LIMIT 1
    `;

    return NextResponse.json(updated[0]);
  } catch (err) {
    console.error("[PUT /api/admin/vehicles/[id]]", err);
    return NextResponse.json(
      { error: "Failed to update vehicle", detail: getErrorMessage(err) },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE /api/admin/vehicles/[id]
// Soft delete: sets status = retired. Preserves historical data.
// ============================================

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;

    const existing = await typedSql<{ id: string }[]>`
      SELECT id FROM vehicles WHERE id = ${id} LIMIT 1
    `;

    if (existing.length === 0) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    // Soft delete: retire the vehicle rather than deleting the row.
    // Historical reservations reference this vehicle_id — deletion would break them.
    await sql`
      UPDATE vehicles SET
        status      = ${VehicleStatus.RETIRED},
        is_bookable = FALSE,
        updated_at  = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true, message: "Vehicle retired from fleet" });
  } catch (err) {
    console.error("[DELETE /api/admin/vehicles/[id]]", err);
    return NextResponse.json(
      { error: "Failed to retire vehicle", detail: getErrorMessage(err) },
      { status: 500 }
    );
  }
}
