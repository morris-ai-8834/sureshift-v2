"use client";

/**
 * app/admin/AdminSidebar.tsx
 *
 * Responsive admin sidebar.
 * - Desktop: fixed 224px sidebar always visible
 * - Mobile: hidden by default, slides in via hamburger menu button
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Icons from "../components/Icons";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", Icon: Icons.Car, exact: true },
  { href: "/admin/fleet", label: "Fleet", Icon: Icons.Car },
  { href: "/admin/rentals", label: "Rentals", Icon: Icons.Calendar },
  { href: "/admin/maintenance", label: "Maintenance", Icon: Icons.Wrench },
  { href: "/admin/expenses", label: "Expenses", Icon: Icons.CreditCard },
  { href: "/admin/mileage", label: "Mileage", Icon: Icons.Speedometer },
  { href: "/admin/pnl", label: "P&L", Icon: Icons.Document },
  { href: "/admin/reports", label: "Reports", Icon: Icons.Document },
  { href: "/admin/integrations", label: "Integrations", Icon: Icons.Settings },
  { href: "/admin/settings", label: "Settings", Icon: Icons.Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const sidebar = document.getElementById("admin-sidebar");
      if (sidebar && !sidebar.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#1a1d2e]">
        <Link href="/admin" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <div className="w-7 h-7 rounded-lg bg-[#2952CC] flex items-center justify-center">
            <span className="text-white text-xs font-black">SS</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">SureShift</p>
            <p className="text-[#4a5568] text-[10px] leading-tight">Operations</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ href, label, Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    active
                      ? "bg-[#2952CC] text-white shadow-sm shadow-[#2952CC]/20"
                      : "text-[#6b7280] hover:text-white hover:bg-[#1f2937]"
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-white" : "text-[#4b5563]"}`} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="px-4 py-4 border-t border-[#1a1d2e]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#2952CC] flex items-center justify-center text-white text-xs font-bold">A</div>
          <div>
            <p className="text-white text-xs font-semibold">Admin</p>
            <p className="text-[#4a5568] text-[10px]">v1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* ── MOBILE: top bar with hamburger ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0D0F1A] border-b border-[#1a1d2e] flex items-center justify-between px-4 h-14">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#2952CC] flex items-center justify-center">
            <span className="text-white text-xs font-black">SS</span>
          </div>
          <span className="text-white font-bold text-sm">SureShift</span>
          <span className="text-[#4a5568] text-xs">Admin</span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-[#1f2937] transition-colors"
          aria-label="Toggle menu"
        >
          <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${open ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${open ? "opacity-0" : ""}`} />
          <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* ── MOBILE: slide-in overlay sidebar ── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}
      <aside
        id="admin-sidebar"
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-64 bg-[#0D0F1A] border-r border-[#1a1d2e] flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-14 flex items-center px-5 border-b border-[#1a1d2e]">
          <span className="text-white font-bold text-sm">Menu</span>
          <button onClick={() => setOpen(false)} className="ml-auto text-gray-400 hover:text-white p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* ── DESKTOP: fixed sidebar ── */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-56 bg-[#0D0F1A] border-r border-[#1a1d2e] flex-col z-40">
        <SidebarContent />
      </aside>
    </>
  );
}
