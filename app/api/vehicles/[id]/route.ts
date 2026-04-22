/**
 * app/api/vehicles/[id]/route.ts
 *
 * GET /api/vehicles/[id]
 *
 * Returns a single vehicle by its slug or UUID.
 *
 * The [id] segment accepts either format:
 *   - Slug (URL-friendly): /api/vehicles/2020-toyota-corolla-le
 *   - UUID: /api/vehicles/7aa0f952-b56c-4e5d-bf70-711fd658bcea
 *
 * This flexibility lets the fleet detail page use the slug in the URL
 * while internal tools can look up by UUID.
 *
 * Response: Single VehicleRow object, or 404 if not found.
 */

import { NextRequest, NextResponse } from "next/server";
import { sql, typedSql } from "@/lib/db";
import { getErrorMessage } from "@/lib/helpers";
import type { VehicleRow } from "@/lib/types";

// ============================================
// UUID DETECTION
// A UUID v4 has the form: 8-4-4-4-12 hex chars separated by hyphens.
// If the [id] segment matches this pattern, query by id column.
// Otherwise, treat it as a slug.
// ============================================

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ============================================
// GET /api/vehicles/[id]
// ============================================

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    if (!id || id.trim().length === 0) {
      return NextResponse.json(
        { error: "Vehicle ID or slug is required" },
        { status: 400 }
      );
    }

    // Determine whether the caller passed a UUID or a slug,
    // then query the appropriate column.
    const isUUID = UUID_REGEX.test(id);

    // Fetch the vehicle by either id (UUID) or slug
    const vehicles = isUUID
      ? await typedSql<VehicleRow[]>`
          SELECT * FROM vehicles
          WHERE id = ${id}
          LIMIT 1
        `
      : await typedSql<VehicleRow[]>`
          SELECT * FROM vehicles
          WHERE slug = ${id}
          LIMIT 1
        `;

    // 404 if no matching vehicle found
    if (vehicles.length === 0) {
      return NextResponse.json(
        {
          error: "Vehicle not found",
          detail: `No vehicle found with ${isUUID ? "id" : "slug"}: ${id}`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(vehicles[0]);
  } catch (err) {
    console.error("[GET /api/vehicles/[id]] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to fetch vehicle", detail: getErrorMessage(err) },
      { status: 500 }
    );
  }
}
