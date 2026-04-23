/**
 * app/admin/fleet/[id]/page.tsx
 *
 * Vehicle Detail — /admin/fleet/[id]
 * Tabs: Overview | Maintenance | Expenses | Trips
 */

import { notFound } from "next/navigation";
import Link from "next/link";
export const dynamic = 'force-dynamic';
import { getDB } from "@/lib/db";
import VehicleDetailClient from "./VehicleDetailClient";

async function getVehicle(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/admin/fleet/${id}`, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Failed");
    return await res.json();
  } catch {
    return null;
  }
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getVehicle(id);

  if (!data) notFound();

  return (
    <div className="p-8 max-w-[1200px]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#6b7280] mb-6">
        <Link href="/admin" className="hover:text-white transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href="/admin/fleet" className="hover:text-white transition-colors">Fleet</Link>
        <span>/</span>
        <span className="text-white">{data.vehicle.vehicle_code}</span>
      </div>

      <VehicleDetailClient
        vehicle={data.vehicle}
        maintenance={data.maintenance}
        expenses={data.expenses}
        trips={data.trips}
        rentals={data.rentals}
        revenue={data.revenue}
      />
    </div>
  );
}
