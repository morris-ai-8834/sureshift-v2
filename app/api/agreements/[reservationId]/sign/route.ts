/**
 * app/api/agreements/[reservationId]/sign/route.ts
 *
 * POST /api/agreements/[reservationId]/sign
 *
 * Records the customer's signature on their rental agreement and advances
 * the reservation through the signature → confirmed lifecycle.
 *
 * What this route does:
 *   1. Validates that the reservation exists and is in a signable state
 *   2. Validates the agreement exists and hasn't already been signed
 *   3. Creates a signature record (typed or drawn)
 *   4. Updates the agreement status → signed
 *   5. Updates the reservation: agreement_status → signed, signature_status → signed,
 *      reservation_status → confirmed, confirmed_at = NOW()
 *   6. Writes a status history entry for the confirmation
 *
 * Request body: { signerName: string, signatureMethod: "typed"|"drawn", consentChecked: boolean }
 * Response: { success: true, reservationCode: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { sql, typedSql } from "@/lib/db";
import {
  ReservationStatus,
  AgreementStatus,
  SignatureStatus,
  ChangedByType,
} from "@/lib/constants";
import { isNonEmptyString, getErrorMessage } from "@/lib/helpers";
import type {
  SignAgreementBody,
  ReservationRow,
  AgreementRow,
} from "@/lib/types";

// ============================================
// POST /api/agreements/[reservationId]/sign
// ============================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reservationId: string }> }
): Promise<NextResponse> {
  try {
    const { reservationId } = await params;

    if (!reservationId || reservationId.trim().length === 0) {
      return NextResponse.json(
        { error: "Reservation ID is required" },
        { status: 400 }
      );
    }

    // ============================================
    // SECTION: Parse & validate request body
    // ============================================
    let body: SignAgreementBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body", detail: "Expected JSON" },
        { status: 400 }
      );
    }

    if (!isNonEmptyString(body.signerName)) {
      return NextResponse.json(
        { error: "signerName is required" },
        { status: 400 }
      );
    }

    if (!body.signatureMethod || !["typed", "drawn"].includes(body.signatureMethod)) {
      return NextResponse.json(
        { error: "signatureMethod must be 'typed' or 'drawn'" },
        { status: 400 }
      );
    }

    // Consent must be explicitly checked — this is a legal agreement
    if (!body.consentChecked) {
      return NextResponse.json(
        { error: "Customer must check the consent checkbox to sign the agreement" },
        { status: 400 }
      );
    }

    // ============================================
    // SECTION: Validate reservation state
    // Only reservations with agreement_sent or deposit_paid status can be signed.
    // A confirmed or completed reservation cannot be re-signed.
    // ============================================
    const reservations = await typedSql<ReservationRow[]>`
      SELECT * FROM reservations
      WHERE id = ${reservationId}
      LIMIT 1
    `;

    if (reservations.length === 0) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    const reservation = reservations[0];

    // Check that the reservation is in a state where signing makes sense.
    // We allow signing from deposit_paid or agreement_sent states.
    const signableStatuses = [
      ReservationStatus.DEPOSIT_PAID,
      ReservationStatus.AGREEMENT_SENT,
    ];

    if (!signableStatuses.includes(reservation.reservation_status as typeof signableStatuses[number])) {
      return NextResponse.json(
        {
          error: "Agreement cannot be signed in current reservation status",
          detail: `Current status: ${reservation.reservation_status}. Agreement must be in deposit_paid or agreement_sent status.`,
        },
        { status: 409 }
      );
    }

    // Ensure signature hasn't already been applied
    if (reservation.signature_status === SignatureStatus.SIGNED) {
      return NextResponse.json(
        { error: "Agreement has already been signed for this reservation" },
        { status: 409 }
      );
    }

    // ============================================
    // SECTION: Validate agreement exists
    // An agreement document must exist before it can be signed.
    // ============================================
    const agreements = await typedSql<AgreementRow[]>`
      SELECT * FROM agreements
      WHERE reservation_id = ${reservationId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (agreements.length === 0) {
      return NextResponse.json(
        { error: "No agreement found for this reservation. Please contact SureShift at (832) 627-7706." },
        { status: 404 }
      );
    }

    const agreement = agreements[0];
    const signedAt = new Date();

    // ============================================
    // SECTION: Create signature record
    // Records who signed, when, how, and that consent was given.
    // ============================================
    await sql`
      INSERT INTO signatures (
        agreement_id,
        reservation_id,
        customer_id,
        signature_method,
        signer_name,
        signed_at,
        consent_checked
      ) VALUES (
        ${agreement.id},
        ${reservationId},
        ${reservation.customer_id},
        ${body.signatureMethod},
        ${body.signerName.trim()},
        ${signedAt.toISOString()},
        ${body.consentChecked}
      )
    `;

    // ============================================
    // SECTION: Update agreement status
    // Mark the agreement document as signed with timestamp.
    // ============================================
    await sql`
      UPDATE agreements SET
        agreement_status = ${AgreementStatus.SIGNED},
        signed_at        = ${signedAt.toISOString()},
        updated_at       = NOW()
      WHERE id = ${agreement.id}
    `;

    // ============================================
    // SECTION: Update reservation status
    // Advance the reservation to confirmed — all pre-rental steps complete.
    // ============================================
    await sql`
      UPDATE reservations SET
        reservation_status = ${ReservationStatus.CONFIRMED},
        agreement_status   = ${AgreementStatus.SIGNED},
        signature_status   = ${SignatureStatus.SIGNED},
        confirmed_at       = ${signedAt.toISOString()},
        updated_at         = NOW()
      WHERE id = ${reservationId}
    `;

    // ============================================
    // SECTION: Write status history entry
    // Immutable record that the reservation moved to confirmed via signature.
    // ============================================
    await sql`
      INSERT INTO reservation_status_history (
        reservation_id,
        old_status,
        new_status,
        changed_by_type,
        note
      ) VALUES (
        ${reservationId},
        ${reservation.reservation_status},
        ${ReservationStatus.CONFIRMED},
        ${ChangedByType.CUSTOMER},
        ${`Agreement signed by ${body.signerName.trim()} via ${body.signatureMethod} method. Reservation confirmed.`}
      )
    `;

    return NextResponse.json({
      success: true,
      reservationCode: reservation.reservation_code,
    });
  } catch (err) {
    console.error("[POST /api/agreements/[reservationId]/sign] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to process signature", detail: getErrorMessage(err) },
      { status: 500 }
    );
  }
}
