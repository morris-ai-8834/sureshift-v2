/**
 * app/admin/layout.tsx
 *
 * Admin layout — responsive sidebar + main content.
 * Mobile: top bar + slide-in sidebar, no left offset
 * Desktop: fixed 224px sidebar, content offset by sidebar width
 */

import type { Metadata } from "next";
import AdminSidebar from "./AdminSidebar";

export const metadata: Metadata = {
  title: "SureShift Admin",
  description: "SureShift Rentals — Internal Operations Dashboard",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <AdminSidebar />
      {/* Mobile: padding-top for the fixed top bar */}
      {/* Desktop: margin-left for the fixed sidebar */}
      <main className="pt-14 lg:pt-0 lg:ml-56 min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
