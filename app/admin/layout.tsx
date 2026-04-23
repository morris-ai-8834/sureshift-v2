/**
 * app/admin/layout.tsx
 *
 * Persistent admin layout — sidebar nav + main content area.
 * All /admin/* routes render inside this layout.
 */

import type { Metadata } from "next";
import AdminSidebar from "./AdminSidebar";

export const metadata: Metadata = {
  title: "SureShift Admin",
  description: "SureShift Rentals — Internal Operations Dashboard",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex">
      <AdminSidebar />
      {/* Main content — offset by sidebar width */}
      <main className="flex-1 ml-56 min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
