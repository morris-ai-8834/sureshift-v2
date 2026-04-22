/**
 * lib/constants.ts
 *
 * Central source of truth for all status enums, magic strings, and
 * configuration values used across the SureShift platform.
 *
 * Why this exists: prevents typos in status comparisons, makes status
 * transitions traceable, and gives editors autocomplete on every value.
 * Never hardcode a status string elsewhere — always import from here.
 */

// ============================================
// VEHICLE STATUS
// Tracks the overall rental readiness of a vehicle in the fleet.
// ============================================

export const VehicleStatus = {
  /** Car is clean, inspected, and ready to rent right now */
  AVAILABLE: "available",
  /** Car is rentable but has fewer open date windows — e.g. nearly booked */
  LIMITED_AVAILABILITY: "limited_availability",
  /** Car is currently on an active rental; not bookable until returned */
  RESERVED: "reserved",
  /** Car is in the shop, awaiting repair, or otherwise not in service */
  MAINTENANCE: "maintenance",
  /** Pulled from the fleet entirely — no longer listed */
  RETIRED: "retired",
} as const;

export type VehicleStatusValue = (typeof VehicleStatus)[keyof typeof VehicleStatus];

// ============================================
// RESERVATION STATUS
// Tracks the lifecycle of a booking from initial request to completion.
// ============================================

export const ReservationStatus = {
  /** Reservation created; waiting for customer to pay deposit */
  AWAITING_DEPOSIT: "awaiting_deposit",
  /** Deposit confirmed; rental agreement being prepared */
  DEPOSIT_PAID: "deposit_paid",
  /** Agreement has been generated and sent to customer */
  AGREEMENT_SENT: "agreement_sent",
  /** Agreement signed; all pre-rental steps complete */
  CONFIRMED: "confirmed",
  /** Customer has the car; rental is in progress */
  ACTIVE: "active",
  /** Car returned; rental closed out */
  COMPLETED: "completed",
  /** Reservation cancelled before pickup */
  CANCELLED: "cancelled",
  /** Customer no-showed at scheduled pickup */
  NO_SHOW: "no_show",
} as const;

export type ReservationStatusValue = (typeof ReservationStatus)[keyof typeof ReservationStatus];

// ============================================
// DEPOSIT STATUS
// Tracks payment of the refundable security deposit specifically.
// ============================================

export const DepositStatus = {
  /** No deposit payment initiated yet */
  NOT_PAID: "not_paid",
  /** Payment link sent but not yet completed */
  PENDING: "pending",
  /** Deposit successfully collected */
  PAID: "paid",
  /** Deposit returned to customer after rental */
  REFUNDED: "refunded",
  /** Deposit partially withheld (damage, fees) */
  PARTIAL_REFUND: "partial_refund",
  /** Deposit withheld — damage or policy violation */
  FORFEITED: "forfeited",
} as const;

export type DepositStatusValue = (typeof DepositStatus)[keyof typeof DepositStatus];

// ============================================
// AGREEMENT STATUS
// Tracks the rental agreement document lifecycle.
// ============================================

export const AgreementStatus = {
  /** Agreement hasn't been generated yet */
  NOT_CREATED: "not_created",
  /** Agreement document created but not yet sent */
  CREATED: "created",
  /** Agreement emailed/texted to customer */
  SENT: "sent",
  /** Customer opened/viewed the agreement */
  VIEWED: "viewed",
  /** Customer applied their signature */
  SIGNED: "signed",
  /** Admin confirmed the signature is valid */
  CONFIRMED: "confirmed",
  /** Agreement voided or replaced */
  VOID: "void",
} as const;

export type AgreementStatusValue = (typeof AgreementStatus)[keyof typeof AgreementStatus];

// ============================================
// SIGNATURE STATUS
// Tracks whether the customer has signed the rental agreement.
// ============================================

export const SignatureStatus = {
  /** No signature requested yet */
  NOT_REQUESTED: "not_requested",
  /** Signature link sent but not completed */
  REQUESTED: "requested",
  /** Signature applied successfully */
  SIGNED: "signed",
} as const;

export type SignatureStatusValue = (typeof SignatureStatus)[keyof typeof SignatureStatus];

// ============================================
// PAYMENT TYPE
// Categorizes what a payment is for.
// ============================================

export const PaymentType = {
  /** Refundable security deposit */
  DEPOSIT: "deposit",
  /** Weekly or daily rental fee */
  RENTAL_FEE: "rental_fee",
  /** Overage for extra days beyond agreed return date */
  OVERAGE: "overage",
  /** Damage assessed at return */
  DAMAGE_FEE: "damage_fee",
  /** General or miscellaneous charge */
  OTHER: "other",
} as const;

export type PaymentTypeValue = (typeof PaymentType)[keyof typeof PaymentType];

// ============================================
// PAYMENT STATUS
// Tracks the state of an individual payment record.
// ============================================

export const PaymentStatus = {
  /** Payment initiated but not yet confirmed */
  PENDING: "pending",
  /** Payment successfully completed */
  COMPLETED: "completed",
  /** Payment failed or was declined */
  FAILED: "failed",
  /** Payment was fully refunded */
  REFUNDED: "refunded",
} as const;

export type PaymentStatusValue = (typeof PaymentStatus)[keyof typeof PaymentStatus];

// ============================================
// BLACKOUT DATE REASON TYPES
// Why a vehicle is blocked on specific dates.
// ============================================

export const BlackoutReasonType = {
  /** A pending reservation hold — expires if deposit not paid in time */
  RESERVATION_HOLD: "reservation_hold",
  /** A confirmed booking with deposit paid */
  CONFIRMED_BOOKING: "confirmed_booking",
  /** Scheduled service, inspection, or repair */
  MAINTENANCE: "maintenance",
  /** Owner has manually blocked the dates */
  OWNER_BLOCK: "owner_block",
} as const;

export type BlackoutReasonTypeValue = (typeof BlackoutReasonType)[keyof typeof BlackoutReasonType];

// ============================================
// DOCUMENT TYPE
// What kind of document a customer uploaded.
// ============================================

export const DocumentType = {
  DRIVERS_LICENSE_FRONT: "drivers_license_front",
  DRIVERS_LICENSE_BACK: "drivers_license_back",
  INSURANCE_CARD: "insurance_card",
  RIDESHARE_SCREENSHOT: "rideshare_screenshot",
  OTHER: "other",
} as const;

export type DocumentTypeValue = (typeof DocumentType)[keyof typeof DocumentType];

// ============================================
// CHANGED-BY TYPE
// Who triggered a status change in the history log.
// ============================================

export const ChangedByType = {
  SYSTEM: "system",
  CUSTOMER: "customer",
  ADMIN: "admin",
} as const;

export type ChangedByTypeValue = (typeof ChangedByType)[keyof typeof ChangedByType];

// ============================================
// SIGNATURE METHOD
// How the customer applied their signature.
// ============================================

export const SignatureMethod = {
  /** Customer typed their name as a signature */
  TYPED: "typed",
  /** Customer drew their signature with mouse/touch */
  DRAWN: "drawn",
} as const;

export type SignatureMethodValue = (typeof SignatureMethod)[keyof typeof SignatureMethod];

// ============================================
// BUSINESS RULES & CONFIGURATION
// Numeric constants that drive business logic.
// ============================================

export const BusinessRules = {
  /**
   * How many minutes a reservation hold is valid before it expires.
   * After this window, the blackout date is released and the vehicle
   * becomes available to other customers.
   */
  HOLD_EXPIRATION_MINUTES: 30,

  /**
   * Minimum rental duration in days.
   * We don't book rentals shorter than this.
   */
  MIN_RENTAL_DAYS: 1,

  /**
   * Minimum customer age in years to rent any vehicle.
   */
  MIN_RENTER_AGE_YEARS: 21,

  /**
   * How many hours before pickup we consider a reservation "upcoming"
   * for the admin dashboard alert window.
   */
  UPCOMING_PICKUP_WINDOW_HOURS: 48,

  /**
   * Number of recent reservations to show on the admin dashboard.
   */
  DASHBOARD_RECENT_RESERVATIONS_LIMIT: 10,

  /**
   * Currency code used for all transactions.
   */
  DEFAULT_CURRENCY: "USD",
} as const;

// ============================================
// RESERVATION CODE FORMAT
// Pattern: SSR-RES-XXXX where X is alphanumeric.
// ============================================

export const ReservationCodePrefix = "SSR-RES-";

// ============================================
// VEHICLE CODE FORMAT
// Pattern: SSR-NNN (e.g. SSR-001)
// ============================================

export const VehicleCodePrefix = "SSR-";
