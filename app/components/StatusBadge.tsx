import type { VehicleStatus } from "../data/vehicles";

interface StatusBadgeProps {
  status: VehicleStatus;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = {
    "Available Now": {
      dot: "bg-emerald-400",
      text: "text-emerald-400",
      bg: "bg-emerald-400/10 border-emerald-400/20",
    },
    "Available Tomorrow": {
      dot: "bg-yellow-400",
      text: "text-yellow-400",
      bg: "bg-yellow-400/10 border-yellow-400/20",
    },
    Reserved: {
      dot: "bg-red-400",
      text: "text-red-400",
      bg: "bg-red-400/10 border-red-400/20",
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${config.bg} ${config.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      {status}
    </span>
  );
}
