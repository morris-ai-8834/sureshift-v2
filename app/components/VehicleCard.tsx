/**
 * VehicleCard.tsx
 *
 * Reusable fleet inventory card — Turo-inspired but cleaner.
 * Used on homepage featured fleet and fleet listing page.
 */

import Link from "next/link";
import { Vehicle } from "../data/vehicles";

interface VehicleCardProps {
  vehicle: Vehicle;
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  "Available Now": {
    label: "Available Now",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  "Available Tomorrow": {
    label: "Available Tomorrow",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  "Reserved": {
    label: "Reserved",
    color: "bg-gray-50 text-gray-400 border-gray-200",
    dot: "bg-gray-300",
  },
};

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const status = statusConfig[vehicle.status] ?? statusConfig["Available Now"];
  const isBookable = vehicle.status !== "Reserved";

  return (
    <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-gray-200/60 hover:border-gray-200 transition-all duration-300 cursor-pointer">

      {/* Image area */}
      <Link href={`/fleet/${vehicle.id}`}>
        <div className={`relative aspect-[16/10] bg-gradient-to-br ${vehicle.imageColor} overflow-hidden`}>
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <svg className="w-36 h-24 text-white" viewBox="0 0 200 120" fill="none">
              <path d="M20 75 L40 45 Q52 32 68 30 L132 30 Q148 32 160 45 L180 75 L186 92 L14 92 Z" fill="currentColor"/>
              <circle cx="55" cy="92" r="18" fill="none" stroke="white" strokeWidth="4"/>
              <circle cx="145" cy="92" r="18" fill="none" stroke="white" strokeWidth="4"/>
              <path d="M68 50 L85 36 L115 36 L132 50 Z" fill="white" fillOpacity="0.3"/>
              <line x1="88" y1="50" x2="88" y2="36" stroke="white" strokeWidth="1.5" strokeOpacity="0.4"/>
              <line x1="112" y1="50" x2="112" y2="36" stroke="white" strokeWidth="1.5" strokeOpacity="0.4"/>
            </svg>
          </div>

          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${status.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>

          {/* Gig tag */}
          {vehicle.tags.includes("Gig Work Ready") && (
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/20 backdrop-blur-sm">
                Gig Ready
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Card body */}
      <div className="p-5">
        <Link href={`/fleet/${vehicle.id}`}>
          <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-[#2952CC] transition-colors">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
        </Link>

        {/* Specs */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
          <span>{vehicle.specs.seats} seats</span>
          <span className="w-1 h-1 rounded-full bg-gray-200" />
          <span>{vehicle.specs.transmission}</span>
          <span className="w-1 h-1 rounded-full bg-gray-200" />
          <span>{vehicle.specs.fuel}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {vehicle.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs px-2.5 py-1 bg-gray-50 text-gray-500 rounded-lg border border-gray-100">
              {tag}
            </span>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between pt-3 border-t border-gray-50">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-gray-900">${vehicle.weeklyRate}</span>
              <span className="text-xs text-gray-400">/week</span>
            </div>
            <div className="text-xs text-gray-400">${vehicle.deposit} deposit</div>
          </div>

          {isBookable ? (
            <Link
              href={`/fleet/${vehicle.id}`}
              className="px-5 py-2.5 bg-[#2952CC] text-white text-xs font-bold rounded-xl hover:bg-[#1e3fa8] transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-[#2952CC]/20"
            >
              Reserve
            </Link>
          ) : (
            <span className="px-5 py-2.5 bg-gray-100 text-gray-400 text-xs font-bold rounded-xl">
              Reserved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
