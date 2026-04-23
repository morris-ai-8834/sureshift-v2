/**
 * lib/admin-migrate.ts
 *
 * Phase 1 admin schema migrations — fleet management tables.
 * Run with: npx tsx lib/admin-migrate.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

const migrations: Array<{ label: string; sql: string }> = [
  {
    label: "vehicles: add vin",
    sql: `ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS vin VARCHAR(20)`,
  },
  {
    label: "vehicles: add plate",
    sql: `ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS plate VARCHAR(20)`,
  },
  {
    label: "vehicles: add color",
    sql: `ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS color VARCHAR(30)`,
  },
  {
    label: "vehicles: add purchase_date",
    sql: `ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS purchase_date DATE`,
  },
  {
    label: "vehicles: add purchase_price",
    sql: `ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS purchase_price NUMERIC(10,2)`,
  },
  {
    label: "vehicles: add current_odometer",
    sql: `ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS current_odometer INTEGER DEFAULT 0`,
  },
  {
    label: "vehicles: add tracker_device_id",
    sql: `ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS tracker_device_id VARCHAR(50)`,
  },
  {
    label: "vehicles: add insurance_policy",
    sql: `ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS insurance_policy VARCHAR(100)`,
  },
  {
    label: "vehicles: add registration_due",
    sql: `ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS registration_due DATE`,
  },
  {
    label: "vehicles: add inspection_due",
    sql: `ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS inspection_due DATE`,
  },
  {
    label: "maintenance_records",
    sql: `
      CREATE TABLE IF NOT EXISTS maintenance_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vehicle_id UUID REFERENCES vehicles(id),
        service_type VARCHAR(60) NOT NULL,
        due_mileage INTEGER,
        due_date DATE,
        completed_date DATE,
        completed_mileage INTEGER,
        cost NUMERIC(10,2),
        vendor VARCHAR(100),
        notes TEXT,
        status VARCHAR(30) DEFAULT 'pending',
        invoice_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `,
  },
  {
    label: "vehicle_expenses",
    sql: `
      CREATE TABLE IF NOT EXISTS vehicle_expenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vehicle_id UUID REFERENCES vehicles(id),
        date DATE NOT NULL,
        category VARCHAR(60) NOT NULL,
        vendor VARCHAR(100),
        amount NUMERIC(10,2) NOT NULL,
        payment_method VARCHAR(40),
        renter_caused BOOLEAN DEFAULT FALSE,
        reimbursable BOOLEAN DEFAULT FALSE,
        notes TEXT,
        attachment_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,
  },
  {
    label: "trips",
    sql: `
      CREATE TABLE IF NOT EXISTS trips (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vehicle_id UUID REFERENCES vehicles(id),
        source VARCHAR(30) DEFAULT 'manual',
        trip_start TIMESTAMP,
        trip_end TIMESTAMP,
        start_location TEXT,
        end_location TEXT,
        miles NUMERIC(8,2),
        duration_minutes INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,
  },
  {
    label: "telematics_sync_log",
    sql: `
      CREATE TABLE IF NOT EXISTS telematics_sync_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vehicle_id UUID REFERENCES vehicles(id),
        sync_source VARCHAR(30),
        sync_time TIMESTAMP DEFAULT NOW(),
        odometer INTEGER,
        location TEXT,
        ignition_status VARCHAR(20),
        raw_payload JSONB
      )
    `,
  },
];

async function run() {
  console.log("\n🚀 SureShift Admin — Phase 1 Migration");
  console.log("========================================\n");

  const sql = neon(process.env.DATABASE_URL!);
  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const m of migrations) {
    process.stdout.write(`   → ${m.label}... `);
    try {
      await sql.query(m.sql);
      console.log("✅");
      ok++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("already exists") || msg.includes("duplicate column")) {
        console.log("⏭  (already exists)");
        skip++;
      } else {
        console.log(`\n❌ ${msg}`);
        fail++;
      }
    }
  }

  console.log("\n========================================");
  console.log(`✅ Applied: ${ok}  ⏭  Skipped: ${skip}  ❌ Failed: ${fail}`);
  if (fail > 0) process.exit(1);
  console.log("🎉 Migration complete!\n");
}

run().catch((e) => { console.error(e); process.exit(1); });
