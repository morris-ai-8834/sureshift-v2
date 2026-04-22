/**
 * lib/seed.ts
 *
 * Seeds the SureShift database with the initial fleet of 5 vehicles.
 *
 * Run with: npx tsx lib/seed.ts
 *
 * This script is idempotent — it uses INSERT ... ON CONFLICT (vehicle_code) DO NOTHING
 * so re-running it will not create duplicates or overwrite manual edits.
 *
 * Vehicle codes follow the SSR-NNN format and are the permanent identifier
 * for each physical car across its entire life in the fleet.
 */

import { config } from "dotenv";

// Load .env.local before db connection is initialized
config({ path: ".env.local" });

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { sql } = require("./db") as typeof import("./db");

// ============================================
// FLEET DATA
// Each vehicle entry is a complete record ready for INSERT.
// Pricing is in USD, rates are daily.
// Slugs are used in URLs: /fleet/[slug]
// ============================================

const vehicleSeeds = [
  // ----------------------------------------
  // SSR-001: 2020 Toyota Corolla LE
  // Work-ready daily driver, best fuel economy in the fleet.
  // ----------------------------------------
  {
    vehicle_code: "SSR-001",
    year: 2020,
    make: "Toyota",
    model: "Corolla",
    trim: "LE",
    slug: "2020-toyota-corolla-le",
    headline_name: "2020 Toyota Corolla LE",
    description_short:
      "The most fuel-efficient car in our fleet. Perfect for gig work, daily commuting, or anyone who wants to keep fuel costs low without sacrificing reliability.",
    description_long:
      "Toyota built the Corolla to last — and the 2020 LE shows it. With up to 38 MPG highway, a smooth 2.0L engine, and legendary Toyota dependability, this car is designed to earn money, not spend it. The interior is clean, the tech is modern (Apple CarPlay, lane-departure warning, adaptive cruise), and the trunk is generous enough to handle grocery runs or rideshare passengers' luggage. Whether you're running 12-hour Uber shifts or just need a reliable commuter, the Corolla delivers every time.",
    daily_rate: "55.00",
    deposit_amount: "200.00",
    weekly_rate: "330.00",
    vehicle_type: "Sedan",
    transmission: "Automatic CVT",
    fuel_type: "Gasoline",
    mpg_city: 30,
    mpg_highway: 38,
    seats: 5,
    location_name: "SureShift Houston Hub",
    location_city: "Houston, TX",
    status: "available",
    featured: true,
    is_bookable: true,
    work_ready: true,
    commuter_friendly: true,
    fuel_efficient: true,
    requirements_note:
      "Valid Texas driver's license required. Must be 21+. No major violations in last 3 years. $200 refundable deposit due at pickup.",
    pickup_note:
      "Pickup by appointment. Call (832) 627-7706 to confirm your window. Car will be fueled and inspected before handoff.",
  },

  // ----------------------------------------
  // SSR-002: 2021 Nissan Altima S
  // Premium mid-size feel, work-ready, strong highway performer.
  // ----------------------------------------
  {
    vehicle_code: "SSR-002",
    year: 2021,
    make: "Nissan",
    model: "Altima",
    trim: "S",
    slug: "2021-nissan-altima-s",
    headline_name: "2021 Nissan Altima S",
    description_short:
      "A step up in size and comfort. The Altima S gives you a roomy cabin, smooth highway ride, and a presence your passengers will notice — ideal for serious gig workers.",
    description_long:
      "The 2021 Nissan Altima S strikes the balance between economy and mid-size presence. Nissan's variable compression engine adapts to driving conditions, squeezing efficiency without sacrificing power. The cabin is genuinely spacious — rear legroom that won't leave passengers cramped after a long ride, a 7-inch touchscreen with Apple CarPlay, and Nissan's ProPilot Assist for safer highway driving. If you're running long shifts on Uber or Lyft and want something that feels premium without the premium price tag, the Altima is your answer.",
    daily_rate: "65.00",
    deposit_amount: "250.00",
    weekly_rate: "390.00",
    vehicle_type: "Sedan",
    transmission: "Automatic CVT",
    fuel_type: "Gasoline",
    mpg_city: 28,
    mpg_highway: 39,
    seats: 5,
    location_name: "SureShift Houston Hub",
    location_city: "Houston, TX",
    status: "available",
    featured: true,
    is_bookable: true,
    work_ready: true,
    commuter_friendly: false,
    fuel_efficient: false,
    requirements_note:
      "Valid Texas driver's license required. Must be 21+. No major violations in last 3 years. $250 refundable deposit due at pickup.",
    pickup_note:
      "Pickup by appointment only. Call or text (832) 627-7706 to schedule.",
  },

  // ----------------------------------------
  // SSR-003: 2019 Toyota Camry SE
  // Commuter-favorite, smooth on the highway, solid resale of comfort.
  // ----------------------------------------
  {
    vehicle_code: "SSR-003",
    year: 2019,
    make: "Toyota",
    model: "Camry",
    trim: "SE",
    slug: "2019-toyota-camry-se",
    headline_name: "2019 Toyota Camry SE",
    description_short:
      "The Camry SE is the commuter's gold standard. Sport-tuned suspension, upgraded interior trim, and Toyota's proven powertrain — everything you need for long days on the road.",
    description_long:
      "The Toyota Camry has been America's best-selling car for good reason — and the SE trim adds a sharper edge to an already excellent formula. Sport-tuned suspension keeps long highway stretches comfortable without feeling floaty. The 2.5L four-cylinder engine delivers 203 horsepower with solid fuel economy. Inside, you'll find leather-trimmed seats, dual-zone climate, and a 9-inch touchscreen. This is the car you rent when you want passengers to feel like they got a deal — and you want to end the week with money in your pocket.",
    daily_rate: "60.00",
    deposit_amount: "225.00",
    weekly_rate: "360.00",
    vehicle_type: "Sedan",
    transmission: "Automatic",
    fuel_type: "Gasoline",
    mpg_city: 29,
    mpg_highway: 41,
    seats: 5,
    location_name: "SureShift Houston Hub",
    location_city: "Houston, TX",
    status: "available",
    featured: false,
    is_bookable: true,
    work_ready: false,
    commuter_friendly: true,
    fuel_efficient: false,
    requirements_note:
      "Valid Texas driver's license required. Must be 21+. No major violations in last 3 years. $225 refundable deposit due at pickup.",
    pickup_note:
      "Pickup by appointment. Call (832) 627-7706 to schedule your handoff.",
  },

  // ----------------------------------------
  // SSR-004: 2020 Ford Fusion SE
  // American reliability, roomy trunk, solid work vehicle.
  // ----------------------------------------
  {
    vehicle_code: "SSR-004",
    year: 2020,
    make: "Ford",
    model: "Fusion",
    trim: "SE",
    slug: "2020-ford-fusion-se",
    headline_name: "2020 Ford Fusion SE",
    description_short:
      "American durability meets practical work-ready design. The Fusion SE offers a large trunk, comfortable ride, and Ford's dependable EcoBoost engine — a workhorse for busy weeks.",
    description_long:
      "Ford's Fusion SE has always been a serious contender in the midsize sedan space — and the 2020 model is no different. The 1.5L EcoBoost delivers a peppy, fuel-conscious drive with enough confidence on the highway to make long shifts feel easy. The trunk is one of the largest in its class at 16 cubic feet — great for rideshare passengers with bags or for anyone who needs hauling capacity. Inside, SYNC 3 infotainment with Apple CarPlay, heated front seats, and rear parking sensors make this a comfortable, capable daily driver. Currently in limited availability — book early.",
    daily_rate: "58.00",
    deposit_amount: "200.00",
    weekly_rate: "348.00",
    vehicle_type: "Sedan",
    transmission: "Automatic",
    fuel_type: "Gasoline",
    mpg_city: 23,
    mpg_highway: 34,
    seats: 5,
    location_name: "SureShift Houston Hub",
    location_city: "Houston, TX",
    // Limited availability — car has some upcoming dates blocked
    status: "limited_availability",
    featured: false,
    is_bookable: true,
    work_ready: true,
    commuter_friendly: false,
    fuel_efficient: false,
    requirements_note:
      "Valid Texas driver's license required. Must be 21+. No major violations in last 3 years. $200 refundable deposit due at pickup.",
    pickup_note:
      "Pickup by appointment. Call (832) 627-7706 to confirm availability for your dates.",
  },

  // ----------------------------------------
  // SSR-005: 2019 Nissan Sentra SV
  // Most affordable option — compact, fuel-sipping, commuter-perfect.
  // ----------------------------------------
  {
    vehicle_code: "SSR-005",
    year: 2019,
    make: "Nissan",
    model: "Sentra",
    trim: "SV",
    slug: "2019-nissan-sentra-sv",
    headline_name: "2019 Nissan Sentra SV",
    description_short:
      "The most affordable car in our fleet. Compact enough for easy city parking, fuel-efficient enough to keep your costs down — the ideal choice for commuters and budget-conscious drivers.",
    description_long:
      "The Nissan Sentra SV is built for one thing: keeping your costs down. At $50/day it's our most accessible rental, and the Sentra delivers far more than its price suggests. The 1.8L engine is smooth and quiet, and with 37 MPG highway you'll be stopping at the pump far less often than other cars. The cabin is compact but thoughtfully designed — Nissan's Zero Gravity seats reduce fatigue on long drives, and the 7-inch touchscreen with Apple CarPlay keeps you connected. For commuters driving regular routes or drivers who need reliable day-to-day transportation without premium pricing, the Sentra hits the mark.",
    daily_rate: "50.00",
    deposit_amount: "175.00",
    weekly_rate: "300.00",
    vehicle_type: "Sedan",
    transmission: "Automatic CVT",
    fuel_type: "Gasoline",
    mpg_city: 29,
    mpg_highway: 37,
    seats: 5,
    location_name: "SureShift Houston Hub",
    location_city: "Houston, TX",
    status: "available",
    featured: false,
    is_bookable: true,
    work_ready: false,
    commuter_friendly: true,
    fuel_efficient: true,
    requirements_note:
      "Valid Texas driver's license required. Must be 21+. No major violations in last 3 years. $175 refundable deposit due at pickup.",
    pickup_note:
      "Pickup by appointment. Call or text (832) 627-7706 to schedule.",
  },
];

// ============================================
// SEED RUNNER
// Inserts each vehicle using INSERT ... ON CONFLICT DO NOTHING
// so this script is safe to re-run without creating duplicates.
// ============================================

async function seedVehicles(): Promise<void> {
  console.log("\n🌱 SureShift Rentals — Database Seed");
  console.log("======================================\n");

  let insertedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const vehicle of vehicleSeeds) {
    process.stdout.write(`   → ${vehicle.vehicle_code}: ${vehicle.headline_name}... `);

    try {
      // Use INSERT ... ON CONFLICT DO NOTHING so reruns are safe.
      // vehicle_code is the unique identifier for dedup.
      const result = await sql`
        INSERT INTO vehicles (
          vehicle_code, year, make, model, trim,
          slug, headline_name, description_short, description_long,
          daily_rate, deposit_amount, weekly_rate,
          vehicle_type, transmission, fuel_type,
          mpg_city, mpg_highway, seats,
          location_name, location_city,
          status, featured, is_bookable,
          work_ready, commuter_friendly, fuel_efficient,
          requirements_note, pickup_note
        ) VALUES (
          ${vehicle.vehicle_code}, ${vehicle.year}, ${vehicle.make}, ${vehicle.model}, ${vehicle.trim},
          ${vehicle.slug}, ${vehicle.headline_name}, ${vehicle.description_short}, ${vehicle.description_long},
          ${vehicle.daily_rate}, ${vehicle.deposit_amount}, ${vehicle.weekly_rate},
          ${vehicle.vehicle_type}, ${vehicle.transmission}, ${vehicle.fuel_type},
          ${vehicle.mpg_city}, ${vehicle.mpg_highway}, ${vehicle.seats},
          ${vehicle.location_name}, ${vehicle.location_city},
          ${vehicle.status}, ${vehicle.featured}, ${vehicle.is_bookable},
          ${vehicle.work_ready}, ${vehicle.commuter_friendly}, ${vehicle.fuel_efficient},
          ${vehicle.requirements_note}, ${vehicle.pickup_note}
        )
        ON CONFLICT (vehicle_code) DO NOTHING
        RETURNING id
      `;

      if (result.length > 0) {
        console.log(`✅ (id: ${result[0].id})`);
        insertedCount++;
      } else {
        console.log("⏭  (already exists)");
        skippedCount++;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`\n❌ ERROR: ${message}`);
      errorCount++;
    }
  }

  console.log("\n======================================");
  console.log(`✅ Inserted: ${insertedCount}`);
  console.log(`⏭  Skipped:  ${skippedCount}`);
  if (errorCount > 0) {
    console.log(`❌ Errors:   ${errorCount}`);
    process.exit(1);
  }
  console.log("\n🎉 Seed complete! Fleet is ready.\n");

  // Print a quick confirmation query
  const vehicles = await sql`
    SELECT vehicle_code, headline_name, status, daily_rate
    FROM vehicles
    ORDER BY vehicle_code
  `;

  console.log("Current fleet in database:\n");
  for (const v of vehicles) {
    console.log(
      `  ${v.vehicle_code}  |  ${v.headline_name.padEnd(30)}  |  ${v.status.padEnd(20)}  |  $${v.daily_rate}/day`
    );
  }
  console.log("");
}

seedVehicles();
