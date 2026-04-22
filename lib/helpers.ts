/**
 * lib/helpers.ts
 *
 * Shared utility functions used across API routes and server-side logic.
 *
 * Rule: if the same logic appears in more than one file, it belongs here.
 * Keep each function small, pure (no side effects where possible), and
 * clearly documented.
 */

import { randomBytes } from "crypto";
import { ReservationCodePrefix, BusinessRules } from "./constants";

// ============================================
// RESERVATION CODE GENERATION
// Format: SSR-RES-XXXX where XXXX is 4 uppercase alphanumeric chars.
// These are customer-facing identifiers used to look up portal pages.
// ============================================

/**
 * Generates a unique reservation code in the SSR-RES-XXXX format.
 * Uses cryptographically random bytes to reduce collision risk.
 *
 * @returns string — e.g. "SSR-RES-A3K9"
 */
export function generateReservationCode(): string {
  // 2 random bytes → 4 uppercase hex chars (0-9, A-F)
  const suffix = randomBytes(2).toString("hex").toUpperCase();
  return `${ReservationCodePrefix}${suffix}`;
}

// ============================================
// DATE & DURATION HELPERS
// ============================================

/**
 * Calculates the number of rental days between two datetimes.
 * Rounds up to the nearest whole day — a 25-hour rental counts as 2 days.
 *
 * @param pickupDatetime - When the customer picks up the vehicle
 * @param returnDatetime - When the customer returns the vehicle
 * @returns number — total billable days (minimum 1)
 */
export function calculateRentalDays(
  pickupDatetime: Date,
  returnDatetime: Date
): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = returnDatetime.getTime() - pickupDatetime.getTime();
  // Math.ceil so partial days are billed as full days
  return Math.max(1, Math.ceil(diffMs / msPerDay));
}

/**
 * Calculates the hold expiration timestamp for a new reservation.
 * The hold lasts HOLD_EXPIRATION_MINUTES from now, after which the
 * blackout date is released and the car becomes available again.
 *
 * @returns Date — the timestamp when the hold expires
 */
export function calculateHoldExpiration(): Date {
  const now = new Date();
  const expiration = new Date(
    now.getTime() + BusinessRules.HOLD_EXPIRATION_MINUTES * 60 * 1000
  );
  return expiration;
}

/**
 * Calculates the estimated rental subtotal (before deposit).
 * Simple multiplication: days × daily rate.
 *
 * @param days - Number of rental days
 * @param dailyRate - Rate per day in USD (as a number)
 * @returns number — total rental cost in USD (2 decimal places)
 */
export function calculateRentalSubtotal(days: number, dailyRate: number): number {
  return parseFloat((days * dailyRate).toFixed(2));
}

/**
 * Calculates the estimated balance due after deposit is applied.
 * This is an estimate — actual balance is reconciled at return.
 *
 * @param rentalSubtotal - Total rental cost
 * @param depositPaidAmount - Amount of deposit already paid
 * @returns number — estimated balance owed at or after pickup
 */
export function calculateBalanceDue(
  rentalSubtotal: number,
  depositPaidAmount: number
): number {
  return Math.max(0, parseFloat((rentalSubtotal - depositPaidAmount).toFixed(2)));
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validates that a string is a non-empty, trimmed value.
 * Used for required field checks in API route bodies.
 *
 * @param value - The value to check
 * @returns boolean — true if the string has content after trimming
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Validates that a value is a valid ISO 8601 datetime string that
 * can be parsed into a real Date object (not NaN).
 *
 * @param value - The string to validate
 * @returns boolean — true if parseable as a valid date
 */
export function isValidDateString(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const parsed = new Date(value);
  return !isNaN(parsed.getTime());
}

/**
 * Validates that a string looks like a valid email address.
 * Uses a simple RFC-5322-inspired regex — not exhaustive but catches
 * the vast majority of typos and malformed inputs.
 *
 * @param value - The string to validate
 * @returns boolean — true if it looks like a valid email
 */
export function isValidEmail(value: unknown): value is string {
  if (typeof value !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * Validates that a pickup datetime is in the future.
 * We don't allow booking a car for a date that has already passed.
 *
 * @param pickupDatetime - The proposed pickup time
 * @returns boolean — true if pickup is in the future
 */
export function isPickupInFuture(pickupDatetime: Date): boolean {
  return pickupDatetime.getTime() > Date.now();
}

/**
 * Validates that return datetime is strictly after pickup datetime.
 * A zero-duration rental (same pickup and return) is not valid.
 *
 * @param pickupDatetime - Start of the rental
 * @param returnDatetime - End of the rental
 * @returns boolean — true if return is after pickup
 */
export function isReturnAfterPickup(
  pickupDatetime: Date,
  returnDatetime: Date
): boolean {
  return returnDatetime.getTime() > pickupDatetime.getTime();
}

// ============================================
// FORMATTING HELPERS
// ============================================

/**
 * Formats a Postgres numeric string (e.g. "55.00") as a US dollar string.
 * Postgres numeric columns come back as strings — never as JS numbers.
 *
 * @param value - Postgres numeric string or number
 * @returns string — e.g. "$55.00"
 */
export function formatDollars(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

/**
 * Formats a Date object into a human-readable date string.
 * Uses America/Chicago timezone since SureShift operates in Houston, TX.
 *
 * @param date - The date to format
 * @returns string — e.g. "Tuesday, April 22, 2026"
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Chicago",
  }).format(date);
}

/**
 * Formats a Date object into a short date+time string for display.
 *
 * @param date - The date to format
 * @returns string — e.g. "Apr 22, 2026 at 10:00 AM"
 */
export function formatDatetime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Chicago",
  }).format(date);
}

/**
 * Converts a vehicle make + model + year into a URL-safe slug.
 * Example: "2020 Toyota Corolla LE" → "2020-toyota-corolla-le"
 *
 * @param year - Vehicle year
 * @param make - Vehicle make (e.g. "Toyota")
 * @param model - Vehicle model (e.g. "Corolla")
 * @param trim - Optional trim level (e.g. "LE")
 * @returns string — lowercase hyphenated slug
 */
export function buildVehicleSlug(
  year: number,
  make: string,
  model: string,
  trim?: string | null
): string {
  const parts = [year.toString(), make, model, trim].filter(Boolean);
  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ============================================
// ERROR HELPERS
// ============================================

/**
 * Extracts a human-readable error message from an unknown thrown value.
 * Avoids leaking internal stack traces — only returns the message string.
 *
 * @param err - The caught error (unknown type)
 * @returns string — the error message, or a generic fallback
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "An unexpected error occurred";
}
