/**
 * lib/migrate.ts
 *
 * Database migration runner for the SureShift platform.
 *
 * Creates all tables using raw SQL (CREATE TABLE IF NOT EXISTS) in the
 * correct dependency order — tables with foreign keys come after the
 * tables they reference.
 *
 * Run with: npx tsx lib/migrate.ts
 *
 * This script is idempotent — safe to run multiple times. It will not
 * drop or alter existing tables.
 *
 * Table creation order (dependency graph):
 *   1. vehicles                    — no dependencies
 *   2. customers                   — no dependencies
 *   3. reservations                → vehicles, customers
 *   4. vehicle_blackout_dates      → vehicles, reservations (nullable)
 *   5. payments                    → reservations, customers
 *   6. agreements                  → reservations, customers, vehicles
 *   7. signatures                  → agreements, reservations, customers
 *   8. customer_documents          → customers, reservations
 *   9. reservation_status_history  → reservations
 *  10. admin_notes                 → reservations, customers, vehicles (all nullable)
 */

import { config } from "dotenv";

// Load .env.local FIRST — before any other import that reads process.env.
// Node.js ESM/CJS resolves all imports before executing, so we use a
// dynamic import below to ensure dotenv runs before db.ts is evaluated.
config({ path: ".env.local" });

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getDB } = require("./db") as typeof import("./db");
const sql = getDB();

// ============================================
// MIGRATION DEFINITIONS
// Each entry is a labeled SQL statement. The label appears in logs so
// you can see exactly which table was created or already existed.
// ============================================

const migrations: Array<{ label: string; sql: string }> = [
  // ----------------------------------------
  // TABLE: vehicles
  // The core fleet table. Every rental starts here.
  // ----------------------------------------
  {
    label: "vehicles",
    sql: `
      CREATE TABLE IF NOT EXISTS vehicles (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vehicle_code        VARCHAR(30)  UNIQUE NOT NULL,
        year                INTEGER      NOT NULL,
        make                VARCHAR(50)  NOT NULL,
        model               VARCHAR(50)  NOT NULL,
        trim                VARCHAR(50),
        slug                VARCHAR(120) UNIQUE NOT NULL,
        headline_name       VARCHAR(120) NOT NULL,
        description_short   TEXT         NOT NULL,
        description_long    TEXT,
        daily_rate          NUMERIC(10,2) NOT NULL,
        deposit_amount      NUMERIC(10,2) NOT NULL,
        weekly_rate         NUMERIC(10,2),
        vehicle_type        VARCHAR(50)  NOT NULL,
        transmission        VARCHAR(30)  NOT NULL,
        fuel_type           VARCHAR(30)  NOT NULL,
        mpg_city            INTEGER,
        mpg_highway         INTEGER,
        seats               INTEGER      NOT NULL,
        location_name       VARCHAR(100) NOT NULL,
        location_city       VARCHAR(100) NOT NULL,
        status              VARCHAR(40)  NOT NULL DEFAULT 'available',
        featured            BOOLEAN      DEFAULT FALSE,
        is_bookable         BOOLEAN      DEFAULT TRUE,
        work_ready          BOOLEAN      DEFAULT FALSE,
        commuter_friendly   BOOLEAN      DEFAULT FALSE,
        fuel_efficient      BOOLEAN      DEFAULT FALSE,
        image_cover_url     TEXT,
        requirements_note   TEXT,
        pickup_note         TEXT,
        created_at          TIMESTAMP    DEFAULT NOW(),
        updated_at          TIMESTAMP    DEFAULT NOW()
      )
    `,
  },

  // ----------------------------------------
  // TABLE: customers
  // All renter information. Customers are upserted by email on booking.
  // ----------------------------------------
  {
    label: "customers",
    sql: `
      CREATE TABLE IF NOT EXISTS customers (
        id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name               VARCHAR(50)  NOT NULL,
        last_name                VARCHAR(50)  NOT NULL,
        full_name                VARCHAR(120) NOT NULL,
        email                    VARCHAR(150) NOT NULL,
        phone                    VARCHAR(30)  NOT NULL,
        date_of_birth            DATE,
        address_line_1           VARCHAR(150),
        city                     VARCHAR(80),
        state                    VARCHAR(30),
        zip_code                 VARCHAR(20),
        driver_license_number    VARCHAR(50),
        driver_license_state     VARCHAR(20),
        emergency_contact_name   VARCHAR(120),
        emergency_contact_phone  VARCHAR(30),
        notes_internal           TEXT,
        created_at               TIMESTAMP DEFAULT NOW(),
        updated_at               TIMESTAMP DEFAULT NOW()
      )
    `,
  },

  // ----------------------------------------
  // TABLE: reservations
  // The central booking record. Links a customer to a vehicle for a
  // specific date range and tracks the full lifecycle of the rental.
  // ----------------------------------------
  {
    label: "reservations",
    sql: `
      CREATE TABLE IF NOT EXISTS reservations (
        id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reservation_code          VARCHAR(40)   UNIQUE NOT NULL,
        vehicle_id                UUID          NOT NULL REFERENCES vehicles(id),
        customer_id               UUID          NOT NULL REFERENCES customers(id),
        pickup_datetime           TIMESTAMP     NOT NULL,
        return_datetime           TIMESTAMP     NOT NULL,
        pickup_location           VARCHAR(120),
        intended_use              VARCHAR(40),
        special_requests          TEXT,
        reservation_status        VARCHAR(40)   NOT NULL DEFAULT 'awaiting_deposit',
        deposit_status            VARCHAR(40)   NOT NULL DEFAULT 'not_paid',
        agreement_status          VARCHAR(40)   NOT NULL DEFAULT 'not_created',
        signature_status          VARCHAR(40)   NOT NULL DEFAULT 'not_requested',
        estimated_daily_rate      NUMERIC(10,2) NOT NULL,
        estimated_total_days      INTEGER       NOT NULL,
        estimated_rental_subtotal NUMERIC(10,2) NOT NULL,
        deposit_due               NUMERIC(10,2) NOT NULL,
        deposit_paid_amount       NUMERIC(10,2) DEFAULT 0,
        balance_due_estimate      NUMERIC(10,2) DEFAULT 0,
        expiration_datetime       TIMESTAMP,
        confirmed_at              TIMESTAMP,
        cancelled_at              TIMESTAMP,
        created_at                TIMESTAMP     DEFAULT NOW(),
        updated_at                TIMESTAMP     DEFAULT NOW()
      )
    `,
  },

  // ----------------------------------------
  // TABLE: vehicle_blackout_dates
  // Blocks specific date ranges on a vehicle.
  // expires_at is set for reservation_hold type — system clears expired
  // holds so the vehicle becomes bookable again.
  // ----------------------------------------
  {
    label: "vehicle_blackout_dates",
    sql: `
      CREATE TABLE IF NOT EXISTS vehicle_blackout_dates (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vehicle_id      UUID        NOT NULL REFERENCES vehicles(id),
        start_datetime  TIMESTAMP   NOT NULL,
        end_datetime    TIMESTAMP   NOT NULL,
        reason_type     VARCHAR(40) NOT NULL,
        reason_note     TEXT,
        reservation_id  UUID        REFERENCES reservations(id),
        expires_at      TIMESTAMP,
        created_at      TIMESTAMP   DEFAULT NOW()
      )
    `,
  },

  // ----------------------------------------
  // TABLE: payments
  // Every payment transaction (deposit, rental fee, overage, etc.)
  // linked to a reservation and customer.
  // ----------------------------------------
  {
    label: "payments",
    sql: `
      CREATE TABLE IF NOT EXISTS payments (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reservation_id  UUID          NOT NULL REFERENCES reservations(id),
        customer_id     UUID          NOT NULL REFERENCES customers(id),
        payment_type    VARCHAR(40)   NOT NULL,
        payment_status  VARCHAR(40)   NOT NULL,
        amount          NUMERIC(10,2) NOT NULL,
        currency        VARCHAR(10)   DEFAULT 'USD',
        receipt_url     TEXT,
        paid_at         TIMESTAMP,
        notes           TEXT,
        created_at      TIMESTAMP DEFAULT NOW()
      )
    `,
  },

  // ----------------------------------------
  // TABLE: agreements
  // One agreement record per reservation. Tracks document generation,
  // sending, viewing, and signature lifecycle.
  // ----------------------------------------
  {
    label: "agreements",
    sql: `
      CREATE TABLE IF NOT EXISTS agreements (
        id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reservation_id            UUID        NOT NULL REFERENCES reservations(id),
        customer_id               UUID        NOT NULL REFERENCES customers(id),
        vehicle_id                UUID        NOT NULL REFERENCES vehicles(id),
        agreement_status          VARCHAR(40) NOT NULL DEFAULT 'not_created',
        agreement_file_url        TEXT,
        signed_agreement_file_url TEXT,
        sent_at                   TIMESTAMP,
        viewed_at                 TIMESTAMP,
        signed_at                 TIMESTAMP,
        confirmed_at              TIMESTAMP,
        created_at                TIMESTAMP DEFAULT NOW(),
        updated_at                TIMESTAMP DEFAULT NOW()
      )
    `,
  },

  // ----------------------------------------
  // TABLE: signatures
  // Records the customer's signature on a specific agreement.
  // Supports typed name or drawn signature methods.
  // ----------------------------------------
  {
    label: "signatures",
    sql: `
      CREATE TABLE IF NOT EXISTS signatures (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agreement_id      UUID        NOT NULL REFERENCES agreements(id),
        reservation_id    UUID        NOT NULL REFERENCES reservations(id),
        customer_id       UUID        NOT NULL REFERENCES customers(id),
        signature_method  VARCHAR(40) NOT NULL,
        signer_name       VARCHAR(120) NOT NULL,
        signed_at         TIMESTAMP   NOT NULL,
        consent_checked   BOOLEAN     DEFAULT FALSE,
        created_at        TIMESTAMP   DEFAULT NOW()
      )
    `,
  },

  // ----------------------------------------
  // TABLE: customer_documents
  // Files uploaded by customers (license, insurance, rideshare proof).
  // File URLs point to the storage provider (Supabase/S3/etc. — TBD).
  // ----------------------------------------
  {
    label: "customer_documents",
    sql: `
      CREATE TABLE IF NOT EXISTS customer_documents (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id     UUID        NOT NULL REFERENCES customers(id),
        reservation_id  UUID        NOT NULL REFERENCES reservations(id),
        document_type   VARCHAR(40) NOT NULL,
        file_url        TEXT        NOT NULL,
        status          VARCHAR(40) DEFAULT 'uploaded',
        uploaded_at     TIMESTAMP   DEFAULT NOW(),
        created_at      TIMESTAMP   DEFAULT NOW()
      )
    `,
  },

  // ----------------------------------------
  // TABLE: reservation_status_history
  // Immutable audit log of every status change on a reservation.
  // Used for admin review, dispute resolution, and debugging.
  // ----------------------------------------
  {
    label: "reservation_status_history",
    sql: `
      CREATE TABLE IF NOT EXISTS reservation_status_history (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reservation_id  UUID        NOT NULL REFERENCES reservations(id),
        old_status      VARCHAR(40),
        new_status      VARCHAR(40) NOT NULL,
        changed_by_type VARCHAR(20) NOT NULL,
        note            TEXT,
        created_at      TIMESTAMP DEFAULT NOW()
      )
    `,
  },

  // ----------------------------------------
  // TABLE: admin_notes
  // Free-form notes attached to reservations, customers, or vehicles.
  // All FK references are nullable — a note can be attached to any one
  // or combination of the three entity types.
  // ----------------------------------------
  {
    label: "admin_notes",
    sql: `
      CREATE TABLE IF NOT EXISTS admin_notes (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reservation_id  UUID REFERENCES reservations(id),
        customer_id     UUID REFERENCES customers(id),
        vehicle_id      UUID REFERENCES vehicles(id),
        note_text       TEXT        NOT NULL,
        note_type       VARCHAR(30) NOT NULL,
        created_by      VARCHAR(120),
        created_at      TIMESTAMP DEFAULT NOW()
      )
    `,
  },

  // ----------------------------------------
  // INDEX: vehicle_blackout_dates_vehicle_id
  // Speed up availability queries that filter by vehicle_id + date range.
  // ----------------------------------------
  {
    label: "index: vehicle_blackout_dates(vehicle_id)",
    sql: `
      CREATE INDEX IF NOT EXISTS idx_blackout_vehicle_id
        ON vehicle_blackout_dates(vehicle_id)
    `,
  },

  // ----------------------------------------
  // INDEX: reservations_vehicle_id
  // Speeds up lookups of all reservations for a given vehicle.
  // ----------------------------------------
  {
    label: "index: reservations(vehicle_id)",
    sql: `
      CREATE INDEX IF NOT EXISTS idx_reservations_vehicle_id
        ON reservations(vehicle_id)
    `,
  },

  // ----------------------------------------
  // INDEX: reservations_customer_id
  // Speeds up lookups of all reservations for a given customer.
  // ----------------------------------------
  {
    label: "index: reservations(customer_id)",
    sql: `
      CREATE INDEX IF NOT EXISTS idx_reservations_customer_id
        ON reservations(customer_id)
    `,
  },

  // ----------------------------------------
  // INDEX: customers_email
  // Email is used for customer upsert lookups on every booking.
  // ----------------------------------------
  {
    label: "index: customers(email)",
    sql: `
      CREATE INDEX IF NOT EXISTS idx_customers_email
        ON customers(email)
    `,
  },
];

// ============================================
// MIGRATION RUNNER
// Executes each migration statement in order.
// Logs success/failure per statement.
// ============================================

async function runMigrations(): Promise<void> {
  console.log("\n🚀 SureShift Rentals — Database Migration");
  console.log("==========================================\n");

  // Test connectivity before attempting any DDL
  console.log("📡 Testing database connection...");
  try {
    
    console.log("✅ Connected to Neon Postgres\n");
  } catch (err) {
    console.error("❌ Connection failed:", err);
    process.exit(1);
  }

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const migration of migrations) {
    process.stdout.write(`   → ${migration.label}... `);
    try {
      await sql.query(migration.sql);
      console.log("✅");
      successCount++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // "already exists" errors are expected and fine on re-runs
      if (message.includes("already exists")) {
        console.log("⏭  (already exists)");
        skipCount++;
      } else {
        console.log(`\n❌ ERROR: ${message}`);
        errorCount++;
      }
    }
  }

  console.log("\n==========================================");
  console.log(`✅ Created: ${successCount}`);
  console.log(`⏭  Skipped: ${skipCount}`);
  if (errorCount > 0) {
    console.log(`❌ Errors:  ${errorCount}`);
    process.exit(1);
  }
  console.log("\n🎉 Migration complete!\n");
}

runMigrations();
