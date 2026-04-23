/**
 * app/api/admin/dashboard/route.ts
 *
 * GET /api/admin/dashboard
 *
 * Returns all stats needed to render the Phase 1 executive dashboard.
 */

import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import {
  VehicleStatus,
  ReservationStatus,
  DepositStatus,
  SignatureStatus,
  BusinessRules,
} from "@/lib/constants";
import { getErrorMessage } from "@/lib/helpers";
import type { DashboardStats } from "@/lib/types";

export async function GET(): Promise<NextResponse> {
  const sql = getDB();
  try {
    // Fleet counts
    const [totalRes, availRes, reservedRes, maintRes] = await Promise.all([
      sql`SELECT COUNT(*) AS count FROM vehicles`,
      sql`SELECT COUNT(*) AS count FROM vehicles WHERE status IN (${VehicleStatus.AVAILABLE}, ${VehicleStatus.LIMITED_AVAILABILITY})`,
      sql`SELECT COUNT(*) AS count FROM vehicles WHERE status = ${VehicleStatus.RESERVED}`,
      sql`SELECT COUNT(*) AS count FROM vehicles WHERE status = ${VehicleStatus.MAINTENANCE}`,
    ]);

    const totalVehicles = parseInt(totalRes[0].count, 10);
    const availableVehicles = parseInt(availRes[0].count, 10);
    const reservedVehicles = parseInt(reservedRes[0].count, 10);
    const maintenanceVehicles = parseInt(maintRes[0].count, 10);

    // Reservation counts
    const [activeRes, depositRes, sigRes, pendingDepositRes] = await Promise.all([
      sql`SELECT COUNT(*) AS count FROM reservations WHERE reservation_status = ${ReservationStatus.ACTIVE}`,
      sql`SELECT COUNT(*) AS count FROM reservations WHERE deposit_status = ${DepositStatus.NOT_PAID} AND reservation_status NOT IN (${ReservationStatus.CANCELLED}, ${ReservationStatus.COMPLETED})`,
      sql`SELECT COUNT(*) AS count FROM reservations WHERE signature_status != ${SignatureStatus.SIGNED} AND reservation_status IN (${ReservationStatus.DEPOSIT_PAID}, ${ReservationStatus.AGREEMENT_SENT})`,
      sql`SELECT COUNT(*) AS count FROM reservations WHERE deposit_status = ${DepositStatus.NOT_PAID} AND reservation_status NOT IN (${ReservationStatus.CANCELLED}, ${ReservationStatus.COMPLETED})`,
    ]);

    const activeRentals = parseInt(activeRes[0].count, 10);
    const pendingDeposits = parseInt(depositRes[0].count, 10);
    const pendingSignatures = parseInt(sigRes[0].count, 10);

    // Revenue this month
    const revenueRes = await sql`
      SELECT COALESCE(SUM(estimated_rental_subtotal), 0) AS revenue
      FROM reservations
      WHERE reservation_status IN (${ReservationStatus.ACTIVE}, ${ReservationStatus.COMPLETED}, ${ReservationStatus.CONFIRMED})
        AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
    `;
    const revenueThisMonth = parseFloat(revenueRes[0].revenue) || 0;

    // Maintenance due soon (next 14 days) or overdue
    const maintDueRes = await sql`
      SELECT COUNT(*) AS count FROM maintenance_records
      WHERE status IN ('pending', 'overdue')
        AND (due_date IS NULL OR due_date <= NOW() + INTERVAL '14 days')
    `;
    const maintenanceDueSoon = parseInt(maintDueRes[0].count, 10);

    // Fleet utilization
    const bookableVehicles = totalVehicles - maintenanceVehicles;
    const fleetUtilization = bookableVehicles > 0
      ? Math.round((activeRentals / bookableVehicles) * 100)
      : 0;

    // Monthly revenue — last 6 months
    const monthlyRevenueRes = await sql`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') AS month,
        COALESCE(SUM(estimated_rental_subtotal), 0) AS revenue
      FROM reservations
      WHERE reservation_status IN (${ReservationStatus.ACTIVE}, ${ReservationStatus.COMPLETED}, ${ReservationStatus.CONFIRMED})
        AND created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '5 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) ASC
    `;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const monthlyRevenue = monthlyRevenueRes.map((r: any) => ({
      month: r.month,
      revenue: parseFloat(r.revenue) || 0,
    }));

    // Fleet status breakdown for donut
    const fleetStatusBreakdown = {
      available: availableVehicles,
      active: reservedVehicles,
      maintenance: maintenanceVehicles,
    };

    // Upcoming pickups (next 48 hours)
    const upcomingPickups = await sql`
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
      WHERE r.reservation_status IN (${ReservationStatus.CONFIRMED}, ${ReservationStatus.DEPOSIT_PAID})
        AND r.pickup_datetime >= NOW()
        AND r.pickup_datetime <= NOW() + INTERVAL '${BusinessRules.UPCOMING_PICKUP_WINDOW_HOURS} hours'
      ORDER BY r.pickup_datetime ASC
    `;

    // Recent reservations
    const recentReservations = await sql`
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

    const stats: DashboardStats = {
      totalVehicles,
      availableVehicles,
      reservedVehicles,
      activeRentals,
      pendingDeposits,
      pendingSignatures,
      revenueThisMonth,
      maintenanceDueSoon,
      fleetUtilization,
      upcomingPickups,
      recentReservations,
      monthlyRevenue,
      fleetStatusBreakdown,
    };

    return NextResponse.json(stats);
  } catch (err) {
    console.error("[GET /api/admin/dashboard]", err);
    return NextResponse.json(
      { error: "Failed to load dashboard data", detail: getErrorMessage(err) },
      { status: 500 }
    );
  }
}
