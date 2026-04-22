/**
 * app/api/admin/vehicles/route.ts
 *
 * GET  /api/admin/vehicles  — Returns all vehicles (all statuses, for admin)
 * POST /api/admin/vehicles  — Creates a new vehicle in the fleet
 *
 * Unlike GET /api/vehicles (which filters to bookable/available only),
 * this endpoint returns everything — including maintenance, retired, etc.
 * Intended for the admin fleet management table.
 */

import { NextRequest, NextResponse } from "next/server";
import { sql, typedSql } from "@/lib/db";
import { VehicleStatus } from "@/lib/constants";
import {
  isNonEmptyString,
  buildVehicleSlug,
  getErrorMessage,
} from "@/lib/helpers";
import type { VehicleRow, CreateVehicleBody } from "@/lib/types";

// ============================================
// GET /api/admin/vehicles
// Returns all vehicles in the fleet ordered by vehicle_code.
// ============================================

export async function GET(): Promise<NextResponse> {
  try {
    // Fetch all vehicles without status filtering — admin sees everything
    const vehicles = await typedSql<VehicleRow[]>`
      SELECT * FROM vehicles
      ORDER BY vehicle_code ASC
    `;

    return NextResponse.json(vehicles);
  } catch (err) {
    console.error("[GET /api/admin/vehicles] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to fetch vehicles", detail: getErrorMessage(err) },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/admin/vehicles
// Creates a new vehicle in the fleet.
// ============================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    let body: CreateVehicleBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body", detail: "Expected JSON" },
        { status: 400 }
      );
    }

    // ----------------------------------------
    // VALIDATION: Required fields
    // ----------------------------------------
    const required: Array<keyof CreateVehicleBody> = [
      "vehicleCode", "year", "make", "model",
      "headlineName", "descriptionShort",
      "dailyRate", "depositAmount",
      "vehicleType", "transmission", "fuelType", "seats",
      "locationName", "locationCity",
    ];

    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    if (!isNonEmptyString(body.vehicleCode)) {
      return NextResponse.json({ error: "vehicleCode must be a non-empty string" }, { status: 400 });
    }

    // Auto-generate slug if not provided
    const slug = body.slug ?? buildVehicleSlug(body.year, body.make, body.model, body.trim);

    // Use provided status or default to available
    const status = body.status ?? VehicleStatus.AVAILABLE;

    const newVehicles = await typedSql<{ id: string; vehicle_code: string }[]>`
      INSERT INTO vehicles (
        vehicle_code, year, make, model, trim,
        slug, headline_name, description_short, description_long,
        daily_rate, deposit_amount, weekly_rate,
        vehicle_type, transmission, fuel_type,
        mpg_city, mpg_highway, seats,
        location_name, location_city, status,
        featured, is_bookable, work_ready, commuter_friendly, fuel_efficient,
        image_cover_url, requirements_note, pickup_note
      ) VALUES (
        ${body.vehicleCode}, ${body.year}, ${body.make}, ${body.model}, ${body.trim ?? null},
        ${slug}, ${body.headlineName}, ${body.descriptionShort}, ${body.descriptionLong ?? null},
        ${body.dailyRate.toFixed(2)}, ${body.depositAmount.toFixed(2)}, ${body.weeklyRate ? body.weeklyRate.toFixed(2) : null},
        ${body.vehicleType}, ${body.transmission}, ${body.fuelType},
        ${body.mpgCity ?? null}, ${body.mpgHighway ?? null}, ${body.seats},
        ${body.locationName}, ${body.locationCity}, ${status},
        ${body.featured ?? false}, ${true}, ${body.workReady ?? false},
        ${body.commuterFriendly ?? false}, ${body.fuelEfficient ?? false},
        ${body.imageCoverUrl ?? null}, ${body.requirementsNote ?? null}, ${body.pickupNote ?? null}
      )
      RETURNING id, vehicle_code
    `;

    return NextResponse.json(newVehicles[0], { status: 201 });
  } catch (err) {
    const message = getErrorMessage(err);
    // Unique constraint violation — vehicle_code already taken
    if (message.includes("unique") || message.includes("duplicate")) {
      return NextResponse.json(
        { error: "A vehicle with that code already exists" },
        { status: 409 }
      );
    }
    console.error("[POST /api/admin/vehicles] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to create vehicle", detail: message },
      { status: 500 }
    );
  }
}
