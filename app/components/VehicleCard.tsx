import Link from "next/link";
import type { Vehicle } from "../data/vehicles";
import StatusBadge from "./StatusBadge";

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const isAvailable = vehicle.status !== "Reserved";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden group hover:border-[#2952CC]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#2952CC]/10 flex flex-col">
      {/* Image Placeholder */}
      <div className={`relative h-48 bg-gradient-to-br ${vehicle.imageColor} flex items-center justify-center overflow-hidden`}>
        {/* Car silhouette SVG */}
        <svg
          viewBox="0 0 200 80"
          className="w-48 h-24 text-white/20 group-hover:text-white/30 transition-colors duration-300"
          fill="currentColor"
        >
          <path d="M170 50H30c-5 0-10-3-10-8V38c0-5 3-8 8-8h8l20-20c3-3 7-5 12-5h64c5 0 9 2 12 5l20 20h6c5 0 8 3 8 8v4c0 5-3 8-8 8zM68 10H52l-16 16h32V10zm52 0H80v16h56V10h-16zm32 16h-16l16-16v16z" />
          <circle cx="55" cy="54" r="12" />
          <circle cx="145" cy="54" r="12" />
          <circle cx="55" cy="54" r="7" fill="#0D0D0D" />
          <circle cx="145" cy="54" r="7" fill="#0D0D0D" />
        </svg>
        <div className="absolute top-3 right-3">
          <StatusBadge status={vehicle.status} />
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="text-xs text-white/60 font-medium">{vehicle.color}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-sm text-[#7A8B9A] mt-0.5">{vehicle.specs.fuel} · {vehicle.specs.seats} seats · Auto</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">${vehicle.weeklyRate}</p>
            <p className="text-xs text-[#7A8B9A]">per week</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {vehicle.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-[#2952CC]/15 text-[#2952CC] border border-[#2952CC]/20 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Deposit */}
        <p className="text-xs text-[#7A8B9A] mb-4">
          ${vehicle.deposit} refundable deposit · Unlimited miles
        </p>

        {/* Buttons */}
        <div className="mt-auto flex gap-2">
          <Link
            href={`/fleet/${vehicle.id}`}
            className="flex-1 text-center py-2.5 rounded-xl border border-gray-700 text-sm font-medium text-[#7A8B9A] hover:text-white hover:border-gray-600 transition-colors duration-200"
          >
            View Details
          </Link>
          <Link
            href={isAvailable ? `/book?vehicle=${vehicle.id}` : "#"}
            className={`flex-1 text-center py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              isAvailable
                ? "bg-[#2952CC] text-white hover:bg-[#3561e0] hover:shadow-lg hover:shadow-[#2952CC]/30"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isAvailable ? "Reserve" : "Unavailable"}
          </Link>
        </div>
      </div>
    </div>
  );
}
