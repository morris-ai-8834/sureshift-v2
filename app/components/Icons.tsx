/**
 * app/components/Icons.tsx
 *
 * SureShift Rentals — custom SVG icon library.
 *
 * All icons are:
 * - Outline style (stroke-based, not filled)
 * - 24x24 viewBox by default, scalable via className
 * - Consistent 1.5px stroke weight
 * - Rounded line caps and joins
 * - Designed to feel automotive / professional
 *
 * Usage: <Icons.Shield className="w-5 h-5 text-gray-500" />
 */

const defaultProps = {
  width: 20,
  height: 20,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.5",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// Car / Vehicle
export function Car({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <path d="M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11" />
      <rect x="2" y="11" width="20" height="7" rx="2" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
      <path d="M2 15h20" />
    </svg>
  );
}

// Shield / Protection
export function Shield({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <path d="M12 3L4 7v5c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V7l-8-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

// Check / Verified
export function Check({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

// Clock / Time
export function Clock({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

// Location Pin
export function Pin({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <path d="M12 2C8.7 2 6 4.7 6 8c0 4.5 6 13 6 13s6-8.5 6-13c0-3.3-2.7-6-6-6z" />
      <circle cx="12" cy="8" r="2" />
    </svg>
  );
}

// Calendar
export function Calendar({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

// Phone
export function Phone({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.1-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 2 .7 2.9a2 2 0 01-.4 2.1L8.1 9.9a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.9.3 1.9.6 2.9.7A2 2 0 0122 16.9z" />
    </svg>
  );
}

// Mail / Email
export function Mail({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  );
}

// Wrench / Maintenance
export function Wrench({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

// Lightning / Gig / Fast
export function Lightning({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H13L13 2z" />
    </svg>
  );
}

// Leaf / Eco / Fuel Efficient
export function Leaf({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <path d="M17 8C8 10 5.9 16.2 3.8 19.5c1.1.5 2.5.5 3.7 0C9.3 15.4 12 13 17 13V8z" />
      <path d="M17 8h4v5c-1.5 0-3-.5-4-1" />
      <path d="M3.8 19.5C6 15 8 13 12 13" />
    </svg>
  );
}

// Person / Driver
export function Person({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="7" r="4" />
      <path d="M4 21v-1a8 8 0 0116 0v1" />
    </svg>
  );
}

// Credit Card / Payment
export function CreditCard({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h2M10 15h4" />
    </svg>
  );
}

// Star / Rating
export function Star({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// Document / Agreement
export function Document({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

// Sparkle / Clean / Premium
export function Sparkle({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// Support / Chat
export function Support({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

// Speedometer / Fast / No delay
export function Speedometer({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" />
      <path d="M12 12l-4-4" />
      <path d="M8 6l1 3M16 6l-1 3M4 12h2M18 12h2" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

// Lock / Secure
export function Lock({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

// Info
export function Info({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}

// Arrow Right
export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

// Arrow Left
export function ArrowLeft({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

// Share
export function Share({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}

// Heart / Favorite
export function Heart({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 000-7.6z" />
    </svg>
  );
}

// City / Building
export function City({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <path d="M3 21h18M9 21V7l6-4v18M15 21V3" />
      <path d="M9 11h.01M9 14h.01M9 17h.01M15 7h.01M15 11h.01M15 14h.01M15 17h.01" />
    </svg>
  );
}

// Fuel / Gas
export function Fuel({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <path d="M3 22V6a2 2 0 012-2h8a2 2 0 012 2v16" />
      <path d="M3 10h12" />
      <path d="M15 8h2a2 2 0 012 2v2a2 2 0 002 2v5a2 2 0 01-2 2" />
      <path d="M19 12v3" />
    </svg>
  );
}

// Settings / Gear
export function Settings({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

// Thumbs Up / Approval
export function ThumbsUp({ className }: { className?: string }) {
  return (
    <svg {...defaultProps} viewBox="0 0 24 24" className={className}>
      <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.3a2 2 0 002-1.7l1.4-9a2 2 0 00-2-2.3H14z" />
      <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
    </svg>
  );
}

// Export all as namespace
const Icons = {
  Car, Shield, Check, Clock, Pin, Calendar, Phone, Mail, Wrench,
  Lightning, Leaf, Person, CreditCard, Star, Document, Sparkle,
  Support, Speedometer, Lock, Info, ArrowRight, ArrowLeft,
  Share, Heart, City, Fuel, Settings, ThumbsUp,
};

export default Icons;
