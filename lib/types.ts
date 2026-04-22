/**
 * lib/types.ts
 *
 * TypeScript interfaces for every data shape in the SureShift platform.
 * These types represent database rows as returned by SQL queries, as well
 * as the shapes of API request bodies and response payloads.
 *
 * Rule: no `any` types anywhere in this codebase. If the shape is unknown,
 * use `unknown` and narrow it explicitly before use.
 */

import type {
  VehicleStatusValue,
  ReservationStatusValue,
  DepositStatusValue,
  AgreementStatusValue,
  SignatureStatusValue,
  PaymentTypeValue,
  PaymentStatusValue,
  BlackoutReasonTypeValue,
  DocumentTypeValue,
  ChangedByTypeValue,
  SignatureMethodValue,
} from "./constants";

// ============================================
// DATABASE ROW TYPES
// Represent exact shapes returned from SELECT queries.
// Column names match the schema exactly.
// ============================================

/** A vehicle in the fleet as stored in the database */
export interface VehicleRow {
  id: string;
  vehicle_code: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  slug: string;
  headline_name: string;
  description_short: string;
  description_long: string | null;
  daily_rate: string; // Postgres numeric comes back as string
  deposit_amount: string;
  weekly_rate: string | null;
  vehicle_type: string;
  transmission: string;
  fuel_type: string;
  mpg_city: number | null;
  mpg_highway: number | null;
  seats: number;
  location_name: string;
  location_city: string;
  status: VehicleStatusValue;
  featured: boolean;
  is_bookable: boolean;
  work_ready: boolean;
  commuter_friendly: boolean;
  fuel_efficient: boolean;
  image_cover_url: string | null;
  requirements_note: string | null;
  pickup_note: string | null;
  created_at: Date;
  updated_at: Date;
}

/** A blackout date block on a specific vehicle */
export interface VehicleBlackoutDateRow {
  id: string;
  vehicle_id: string;
  start_datetime: Date;
  end_datetime: Date;
  reason_type: BlackoutReasonTypeValue;
  reason_note: string | null;
  reservation_id: string | null;
  expires_at: Date | null;
  created_at: Date;
}

/** A customer record */
export interface CustomerRow {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: Date | null;
  address_line_1: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  driver_license_number: string | null;
  driver_license_state: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  notes_internal: string | null;
  created_at: Date;
  updated_at: Date;
}

/** A reservation record */
export interface ReservationRow {
  id: string;
  reservation_code: string;
  vehicle_id: string;
  customer_id: string;
  pickup_datetime: Date;
  return_datetime: Date;
  pickup_location: string | null;
  intended_use: string | null;
  special_requests: string | null;
  reservation_status: ReservationStatusValue;
  deposit_status: DepositStatusValue;
  agreement_status: AgreementStatusValue;
  signature_status: SignatureStatusValue;
  estimated_daily_rate: string;
  estimated_total_days: number;
  estimated_rental_subtotal: string;
  deposit_due: string;
  deposit_paid_amount: string;
  balance_due_estimate: string;
  expiration_datetime: Date | null;
  confirmed_at: Date | null;
  cancelled_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

/** A payment transaction record */
export interface PaymentRow {
  id: string;
  reservation_id: string;
  customer_id: string;
  payment_type: PaymentTypeValue;
  payment_status: PaymentStatusValue;
  amount: string;
  currency: string;
  receipt_url: string | null;
  paid_at: Date | null;
  notes: string | null;
  created_at: Date;
}

/** A rental agreement document record */
export interface AgreementRow {
  id: string;
  reservation_id: string;
  customer_id: string;
  vehicle_id: string;
  agreement_status: AgreementStatusValue;
  agreement_file_url: string | null;
  signed_agreement_file_url: string | null;
  sent_at: Date | null;
  viewed_at: Date | null;
  signed_at: Date | null;
  confirmed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

/** A signature record attached to an agreement */
export interface SignatureRow {
  id: string;
  agreement_id: string;
  reservation_id: string;
  customer_id: string;
  signature_method: SignatureMethodValue;
  signer_name: string;
  signed_at: Date;
  consent_checked: boolean;
  created_at: Date;
}

/** A document uploaded by a customer */
export interface CustomerDocumentRow {
  id: string;
  customer_id: string;
  reservation_id: string;
  document_type: DocumentTypeValue;
  file_url: string;
  status: string;
  uploaded_at: Date;
  created_at: Date;
}

/** A reservation status history entry */
export interface ReservationStatusHistoryRow {
  id: string;
  reservation_id: string;
  old_status: string | null;
  new_status: string;
  changed_by_type: ChangedByTypeValue;
  note: string | null;
  created_at: Date;
}

/** An admin note attached to a reservation, customer, or vehicle */
export interface AdminNoteRow {
  id: string;
  reservation_id: string | null;
  customer_id: string | null;
  vehicle_id: string | null;
  note_text: string;
  note_type: string;
  created_by: string | null;
  created_at: Date;
}

// ============================================
// API REQUEST BODY TYPES
// What the client sends in POST/PUT request bodies.
// ============================================

/** Body for POST /api/reservations — create a new reservation */
export interface CreateReservationBody {
  vehicleId: string;
  pickupDatetime: string; // ISO 8601 string
  returnDatetime: string;
  pickupLocation?: string;
  intendedUse?: string;
  specialRequests?: string;

  // Customer info (used to upsert customer record)
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  driverLicenseNumber?: string;
  driverLicenseState?: string;
}

/** Body for POST /api/availability — check if a vehicle is available */
export interface CheckAvailabilityBody {
  vehicleId: string;
  pickupDate: string; // ISO 8601 date string
  returnDate: string;
}

/** Body for POST /api/agreements/[reservationId]/sign */
export interface SignAgreementBody {
  signerName: string;
  signatureMethod: SignatureMethodValue;
  consentChecked: boolean;
}

/** Body for PUT /api/admin/reservations/[id] — update reservation status */
export interface UpdateReservationBody {
  reservationStatus?: ReservationStatusValue;
  depositStatus?: DepositStatusValue;
  agreementStatus?: AgreementStatusValue;
  signatureStatus?: SignatureStatusValue;
  adminNote?: string;
}

/** Body for POST /api/admin/vehicles — create a new vehicle */
export interface CreateVehicleBody {
  vehicleCode: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  slug: string;
  headlineName: string;
  descriptionShort: string;
  descriptionLong?: string;
  dailyRate: number;
  depositAmount: number;
  weeklyRate?: number;
  vehicleType: string;
  transmission: string;
  fuelType: string;
  mpgCity?: number;
  mpgHighway?: number;
  seats: number;
  locationName: string;
  locationCity: string;
  status?: VehicleStatusValue;
  featured?: boolean;
  workReady?: boolean;
  commuterFriendly?: boolean;
  fuelEfficient?: boolean;
  imageCoverUrl?: string;
  requirementsNote?: string;
  pickupNote?: string;
}

// ============================================
// API RESPONSE TYPES
// What the server sends back in JSON responses.
// ============================================

/** Standard error envelope returned when a request fails */
export interface ApiErrorResponse {
  error: string;
  detail?: string;
  code?: string;
}

/** Successful reservation creation response */
export interface CreateReservationResponse {
  reservationId: string;
  reservationCode: string;
  depositDue: number;
  estimatedTotal: number;
  expiresAt: string; // ISO 8601 — hold expiration
}

/** Availability check response */
export interface AvailabilityResponse {
  available: boolean;
  nextAvailable?: string; // ISO 8601 date string if not available
  conflictingDates?: Array<{ start: string; end: string }>;
}

/** Full portal data for a reservation — used on /portal/[code] */
export interface PortalData {
  reservation: ReservationRow;
  vehicle: VehicleRow;
  customer: CustomerRow;
  payments: PaymentRow[];
  agreement: AgreementRow | null;
  signature: SignatureRow | null;
  documents: CustomerDocumentRow[];
  statusHistory: ReservationStatusHistoryRow[];
}

/** Admin dashboard stats */
export interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  reservedVehicles: number;
  activeRentals: number;
  pendingDeposits: number;
  pendingSignatures: number;
  upcomingPickups: ReservationWithDetails[];
  recentReservations: ReservationWithDetails[];
}

// ============================================
// JOINED / ENRICHED TYPES
// Database rows enriched with data from joined tables.
// Used in list views and dashboards.
// ============================================

/** A reservation joined with customer and vehicle data */
export interface ReservationWithDetails extends ReservationRow {
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  vehicle_headline_name: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_slug: string;
}

/** A vehicle with a count of active reservations */
export interface VehicleWithReservationCount extends VehicleRow {
  active_reservation_count: number;
}

// ============================================
// UTILITY TYPES
// Helper types used internally.
// ============================================

/** Represents a date range for availability queries */
export interface DateRange {
  start: Date;
  end: Date;
}

/** Used when upserting a customer — finds by email or creates new */
export interface CustomerUpsertData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  driverLicenseNumber?: string;
  driverLicenseState?: string;
}
