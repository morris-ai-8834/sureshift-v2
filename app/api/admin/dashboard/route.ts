/**
 * app/api/admin/dashboard/route.ts
 *
 * GET /api/admin/dashboard
 *
 * Returns all statistics and data needed to render the admin dashboard.
 * Runs multiple focused queries and assembles them into a single bundle
 * so the dashboard page makes one request instead of many.
 *
 * Returns:
 *   - totalVehicles       — count of all vehicles in fleet
 *   - availableVehicles   — count with status = available or limited_availability
 *   - reservedVehicles    — count with status = reserved
 *   - activeRentals       — count of reservations with status = active
 *   - pendingDeposits     — count of reservations awaiting deposit payment
 *   - pendingSignatures   — count of reservations with unsigned agreements
 *   - upcomingPickups     — reservations in the next 48 hours
 *   - recentReservations  — last 10 reservations created
 *
 * Response: DashboardStats
 */

import { NextResponse } from "next/server";
import { sql, typedSql } from "@/lib/db";
import {
  VehicleStatus,
  ReservationStatus,
  DepositStatus,
  SignatureStatus,
  BusinessRules,
} from "@/lib/constants";
import { getErrorMessage } from "@/lib/helpers";
import type { DashboardStats, ReservationWithDetails } from "@/lib/types";

// ============================================
// GET /api/admin/dashboard
// ============================================

export async function GET(): Promise<NextResponse> {
  try {
    // ============================================
    // SECTION: Fleet counts
    // Quick aggregate counts on the vehicles table.
    // ============================================

    // Total vehicles ever added to the fleet (regardless of status)
    const totalVehiclesResult = await typedSql<[{ count: string }]>`
      SELECT COUNT(*) AS count FROM vehicles
    `;
    const totalVehicles = parseInt(totalVehiclesResult[0].count, 10);

    // Available = ready to book right now
    const availableVehiclesResult = await typedSql<[{ count: string }]>`
      SELECT COUNT(*) AS count FROM vehicles
      WHERE status IN (
        ${VehicleStatus.AVAILABLE},
        ${VehicleStatus.LIMITED_AVAILABILITY}
      )
    `;
    const availableVehicles = parseInt(availableVehiclesResult[0].count, 10);

    // Reserved = currently out on rental or confirmed and waiting for pickup
    const reservedVehiclesResult = await typedSql<[{ count: string }]>`
      SELECT COUNT(*) AS count FROM vehicles
      WHERE status = ${VehicleStatus.RESERVED}
    `;
    const reservedVehicles = parseInt(reservedVehiclesResult[0].count, 10);

    // ============================================
    // SECTION: Reservation counts
    // Status-filtered counts for the action items panel.
    // ============================================

    // Active rentals: car is currently out with a customer
    const activeRentalsResult = await typedSql<[{ count: string }]>`
      SELECT COUNT(*) AS count FROM reservations
      WHERE reservation_status = ${ReservationStatus.ACTIVE}
    `;
    const activeRentals = parseInt(activeRentalsResult[0].count, 10);

    // Pending deposits: reservation created but customer hasn't paid yet
    const pendingDepositsResult = await typedSql<[{ count: string }]>`
      SELECT COUNT(*) AS count FROM reservations
      WHERE reservation_status = ${ReservationStatus.AWAITING_DEPOSIT}
        AND deposit_status = ${DepositStatus.NOT_PAID}
    `;
    const pendingDeposits = parseInt(pendingDepositsResult[0].count, 10);

    // Pending signatures: agreement sent but not yet signed
    // (awaiting_deposit reservations with unsigned agreements)
    const pendingSignaturesResult = await typedSql<[{ count: string }]>`
      SELECT COUNT(*) AS count FROM reservations
      WHERE signature_status != ${SignatureStatus.SIGNED}
        AND reservation_status IN (
          ${ReservationStatus.DEPOSIT_PAID},
          ${ReservationStatus.AGREEMENT_SENT}
        )
    `;
    const pendingSignatures = parseInt(pendingSignaturesResult[0].count, 10);

    // ============================================
    // SECTION: Upcoming pickups
    // Reservations with pickup in the next UPCOMING_PICKUP_WINDOW_HOURS hours.
    // These need admin attention — confirm vehicle is prepped, customer is ready.
    // ============================================
    const upcomingPickups = await typedSql<ReservationWithDetails[]>`
      SELECT
        r.*,
        c.first_name  AS customer_first_name,
        c.last_name   AS customer_last_name,
        c.email       AS customer_email,
        c.phone       AS customer_phone,
        v.headline_name AS vehicle_headline_name,
        v.make        AS vehicle_make,
        v.model       AS vehicle_model,
        v.year        AS vehicle_year,
        v.slug        AS vehicle_slug
      FROM reservations r
      JOIN customers c ON c.id = r.customer_id
      JOIN vehicles  v ON v.id = r.vehicle_id
      WHERE r.reservation_status IN (
          ${ReservationStatus.CONFIRMED},
          ${ReservationStatus.DEPOSIT_PAID}
        )
        AND r.pickup_datetime >= NOW()
        AND r.pickup_datetime <= NOW() + INTERVAL '${BusinessRules.UPCOMING_PICKUP_WINDOW_HOURS} hours'
      ORDER BY r.pickup_datetime ASC
    `;

    // ============================================
    // SECTION: Recent reservations
    // Last N reservations across all statuses — the admin's activity feed.
    // ============================================
    const recentReservations = await typedSql<ReservationWithDetails[]>`
      SELECT
        r.*,
        c.first_name  AS customer_first_name,
        c.last_name   AS customer_last_name,
        c.email       AS customer_email,
        c.phone       AS customer_phone,
        v.headline_name AS vehicle_headline_name,
        v.make        AS vehicle_make,
        v.model       AS vehicle_model,
        v.year        AS vehicle_year,
        v.slug        AS vehicle_slug
      FROM reservations r
      JOIN customers c ON c.id = r.customer_id
      JOIN vehicles  v ON v.id = r.vehicle_id
      ORDER BY r.created_at DESC
      LIMIT ${BusinessRules.DASHBOARD_RECENT_RESERVATIONS_LIMIT}
    `;

    // ============================================
    // SECTION: Assemble and return response
    // ============================================
    const stats: DashboardStats = {
      totalVehicles,
      availableVehicles,
      reservedVehicles,
      activeRentals,
      pendingDeposits,
      pendingSignatures,
      upcomingPickups,
      recentReservations,
    };

    return NextResponse.json(stats);
  } catch (err) {
    console.error("[GET /api/admin/dashboard] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to load dashboard data", detail: getErrorMessage(err) },
      { status: 500 }
    );
  }
}
