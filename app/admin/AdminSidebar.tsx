"use client";

/**
 * app/admin/AdminSidebar.tsx
 *
 * Client component sidebar for admin navigation.
 * Uses usePathname() for active route detection.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Home, Car, Calendar, Wrench, CreditCard, Speedometer, Document, Settings,
} from "../components/Icons";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", Icon: Home, exact: true },
  { href: "/admin/fleet", label: "Fleet", Icon: Car },
  { href: "/admin/rentals", label: "Rentals", Icon: Calendar },
  { href: "/admin/maintenance", label: "Maintenance", Icon: Wrench },
  { href: "/admin/expenses", label: "Expenses", Icon: CreditCard },
  { href: "/admin/mileage", label: "Mileage", Icon: Speedometer },
  { href: "/admin/reports", label: "Reports", Icon: Document },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-56 bg-[#0D0F1A] border-r border-[#1a1d2e] flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#1a1d2e]">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image
            src="/logo-dark-transparent.png"
            alt="SureShift"
            width={28}
            height={28}
            className="rounded"
          />
          <div>
            <p className="text-white font-bold text-sm leading-tight">SureShift</p>
            <p className="text-[#4a5568] text-[10px] leading-tight">Operations</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150 group
                ${active
                  ? "bg-[#2952CC] text-white shadow-lg shadow-[#2952CC]/20"
                  : "text-[#6b7280] hover:text-white hover:bg-[#1a1d2e]"
                }
              `}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-white" : "text-[#4a5568] group-hover:text-[#9ca3af]"}`} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom badge */}
      <div className="px-4 py-4 border-t border-[#1a1d2e]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#2952CC]/20 border border-[#2952CC]/40 flex items-center justify-center">
            <span className="text-[#2952CC] text-xs font-bold">A</span>
          </div>
          <div>
            <p className="text-white text-xs font-semibold">Admin</p>
            <p className="text-[#4a5568] text-[10px]">v1.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
