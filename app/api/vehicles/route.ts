/**
 * app/api/vehicles/route.ts
 *
 * GET /api/vehicles
 *
 * Returns all bookable vehicles in the fleet. Supports optional date-range
 * filtering to exclude vehicles that are unavailable on requested dates.
 *
 * Query params:
 *   ?pickup=<ISO datetime>   — pickup datetime
 *   ?return=<ISO datetime>   — return datetime
 *
 * When dates are provided, this route runs the availability engine to filter
 * out vehicles with overlapping blackout dates. When no dates are given,
 * it returns all is_bookable vehicles with an available or limited_availability
 * status — giving the fleet page something to show before dates are selected.
 *
 * Response: JSON array of VehicleRow objects.
 */

import { NextRequest, NextResponse } from "next/server";
import { sql, typedSql } from "@/lib/db";
import { VehicleStatus } from "@/lib/constants";
import { isValidDateString, isReturnAfterPickup, getErrorMessage } from "@/lib/helpers";
import type { VehicleRow } from "@/lib/types";

// ============================================
// GET /api/vehicles
// ============================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = request.nextUrl;
    const pickupParam = searchParams.get("pickup");
    const returnParam = searchParams.get("return");

    // ----------------------------------------
    // BRANCH 1: Date-filtered availability query
    // Both pickup and return params must be valid dates.
    // ----------------------------------------
    if (pickupParam !== null && returnParam !== null) {
      // Validate that both date strings are parseable
      if (!isValidDateString(pickupParam) || !isValidDateString(returnParam)) {
        return NextResponse.json(
          { error: "Invalid date format", detail: "pickup and return must be valid ISO 8601 datetime strings" },
          { status: 400 }
        );
      }

      const pickupDate = new Date(pickupParam);
      const returnDate = new Date(returnParam);

      // Return must come after pickup — zero-duration rentals are invalid
      if (!isReturnAfterPickup(pickupDate, returnDate)) {
        return NextResponse.json(
          { error: "Invalid date range", detail: "return datetime must be after pickup datetime" },
          { status: 400 }
        );
      }

      // Fetch bookable vehicles that have NO overlapping blackout dates
      // in the requested window.
      //
      // Availability rule: a vehicle is blocked if ANY blackout entry overlaps
      // the requested period AND has not expired (for hold-type blocks).
      //
      // Overlap condition: start < returnDate AND end > pickupDate
      // (standard interval overlap check — covers all partial-overlap cases)
      const availableVehicles = await typedSql<VehicleRow[]>`
        SELECT v.*
        FROM vehicles v
        WHERE v.is_bookable = TRUE
          AND v.status IN (
            ${VehicleStatus.AVAILABLE},
            ${VehicleStatus.LIMITED_AVAILABILITY}
          )
          AND NOT EXISTS (
            SELECT 1
            FROM vehicle_blackout_dates b
            WHERE b.vehicle_id = v.id
              -- Overlap check: the blackout window intersects the requested window
              AND b.start_datetime < ${returnDate.toISOString()}
              AND b.end_datetime   > ${pickupDate.toISOString()}
              -- Exclude expired holds — they no longer block availability
              AND (b.expires_at IS NULL OR b.expires_at > NOW())
          )
        ORDER BY v.daily_rate ASC, v.vehicle_code ASC
      `;

      return NextResponse.json(availableVehicles);
    }

    // ----------------------------------------
    // BRANCH 2: No dates — return all bookable vehicles
    // Fleet page baseline: show what's in the fleet before date selection.
    // ----------------------------------------
    const allVehicles = await typedSql<VehicleRow[]>`
      SELECT *
      FROM vehicles
      WHERE is_bookable = TRUE
        AND status IN (
          ${VehicleStatus.AVAILABLE},
          ${VehicleStatus.LIMITED_AVAILABILITY}
        )
      ORDER BY daily_rate ASC, vehicle_code ASC
    `;

    return NextResponse.json(allVehicles);
  } catch (err) {
    // Log the full error server-side for debugging
    console.error("[GET /api/vehicles] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to fetch vehicles", detail: getErrorMessage(err) },
      { status: 500 }
    );
  }
}
