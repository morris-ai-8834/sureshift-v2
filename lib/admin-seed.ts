/**
 * lib/admin-seed.ts
 *
 * Comprehensive seed script for SureShift admin dashboard.
 * Seeds: vehicle details, maintenance records, expenses, trips, reservations.
 *
 * Run: npx tsx lib/admin-seed.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// ─── Vehicle IDs (from DB) ───────────────────────────────────────
const V = {
  SSR001: "7aa0f952-b56c-4e5d-bf70-711fd658bcea", // Toyota Corolla
  SSR002: "d34d6289-2371-4f4f-955d-d7680e544932", // Nissan Altima
  SSR003: "522531e8-1b82-4ed2-92cc-dbe43a6c21be", // Toyota Camry
  SSR004: "72ee8aea-9c5a-4183-a292-38278d742185", // Ford Fusion
  SSR005: "f7e22787-0efc-4235-98dc-e830840f2cf3", // Nissan Sentra
};

// ─── Helpers ─────────────────────────────────────────────────────
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}
function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}
function hoursAgo(n: number): Date {
  return new Date(Date.now() - n * 3600 * 1000);
}

async function main() {
  console.log("\n🌱 SureShift Admin — Comprehensive Seed");
  console.log("=========================================\n");

  // ═══════════════════════════════════════════════════════════════
  // STEP 1: Update vehicle details (VIN, plate, color, odometer)
  // ═══════════════════════════════════════════════════════════════
  console.log("📋 Updating vehicle details...");

  const vehicleUpdates = [
    {
      id: V.SSR001,
      vin: "1NXBR32E79Z123456",
      plate: "ABC1234",
      color: "Silver",
      odometer: 52340,
      purchaseDate: "2020-03-15",
      purchasePrice: 18500,
      insurancePolicy: "PROG-2024-TX-001",
      registrationDue: daysFromNow(180),
      inspectionDue: daysFromNow(60),
    },
    {
      id: V.SSR002,
      vin: "1N4AL3AP5JC123456",
      plate: "XYZ5678",
      color: "White",
      odometer: 67890,
      purchaseDate: "2021-06-20",
      purchasePrice: 22000,
      insurancePolicy: "PROG-2024-TX-002",
      registrationDue: daysFromNow(90),
      inspectionDue: daysFromNow(120),
    },
    {
      id: V.SSR003,
      vin: "4T1BF1FK5EU123456",
      plate: "DEF9012",
      color: "Gray",
      odometer: 83450,
      purchaseDate: "2019-11-08",
      purchasePrice: 21500,
      insurancePolicy: "PROG-2024-TX-003",
      registrationDue: daysFromNow(45),
      inspectionDue: daysFromNow(30),
    },
    {
      id: V.SSR004,
      vin: "3FA6P0H76DR123456",
      plate: "GHI3456",
      color: "Black",
      odometer: 91200,
      purchaseDate: "2020-01-25",
      purchasePrice: 19800,
      insurancePolicy: "PROG-2024-TX-004",
      registrationDue: daysFromNow(210),
      inspectionDue: daysFromNow(15),
    },
    {
      id: V.SSR005,
      vin: "3N1AB7AP8JL123456",
      plate: "JKL7890",
      color: "Blue",
      odometer: 44100,
      purchaseDate: "2019-08-14",
      purchasePrice: 17200,
      insurancePolicy: "PROG-2024-TX-005",
      registrationDue: daysFromNow(150),
      inspectionDue: daysFromNow(75),
    },
  ];

  for (const v of vehicleUpdates) {
    await sql`
      UPDATE vehicles SET
        vin = ${v.vin},
        plate = ${v.plate},
        color = ${v.color},
        current_odometer = ${v.odometer},
        purchase_date = ${v.purchaseDate},
        purchase_price = ${v.purchasePrice},
        insurance_policy = ${v.insurancePolicy},
        registration_due = ${v.registrationDue},
        inspection_due = ${v.inspectionDue}
      WHERE id = ${v.id}
    `;
  }
  console.log("  ✅ 5 vehicles updated\n");

  // ═══════════════════════════════════════════════════════════════
  // STEP 2: Maintenance Records
  // ═══════════════════════════════════════════════════════════════
  console.log("🔧 Seeding maintenance records...");

  // Map vehicle → current odometer for due_mileage math
  const odometers: Record<string, number> = {
    [V.SSR001]: 52340,
    [V.SSR002]: 67890,
    [V.SSR003]: 83450,
    [V.SSR004]: 91200,
    [V.SSR005]: 44100,
  };

  const vendors = ["Jiffy Lube", "Firestone", "Valvoline", "Midas"];

  const maintenanceRecords = [];

  for (const [vehicleId, odo] of Object.entries(odometers)) {
    // 1) Completed oil change — 90 days ago
    maintenanceRecords.push({
      vehicle_id: vehicleId,
      service_type: "Oil Change",
      due_mileage: odo - 3200,
      due_date: daysAgo(95),
      completed_date: daysAgo(90),
      completed_mileage: odo - 3200,
      cost: (Math.floor(Math.random() * 15) + 40).toFixed(2),
      vendor: vendors[Math.floor(Math.random() * vendors.length)],
      notes: "Full synthetic 5W-30. Filter replaced.",
      status: "completed",
    });

    // 2) Completed tire rotation — 60 days ago
    maintenanceRecords.push({
      vehicle_id: vehicleId,
      service_type: "Tire Rotation",
      due_mileage: odo - 1500,
      due_date: daysAgo(65),
      completed_date: daysAgo(60),
      completed_mileage: odo - 1500,
      cost: (Math.floor(Math.random() * 10) + 22).toFixed(2),
      vendor: vendors[Math.floor(Math.random() * vendors.length)],
      notes: "Rotated all 4 tires. Pressure adjusted to spec.",
      status: "completed",
    });

    // 3) Upcoming oil change — due in 800 miles / 2 weeks
    maintenanceRecords.push({
      vehicle_id: vehicleId,
      service_type: "Oil Change",
      due_mileage: odo + 800,
      due_date: daysFromNow(14),
      completed_date: null,
      completed_mileage: null,
      cost: null,
      vendor: null,
      notes: "Schedule with Jiffy Lube. Use 5W-30 full synthetic.",
      status: "pending",
    });

    // 4) Brake inspection — OVERDUE (due 500 miles ago / 10 days ago)
    maintenanceRecords.push({
      vehicle_id: vehicleId,
      service_type: "Brake Inspection",
      due_mileage: odo - 500,
      due_date: daysAgo(10),
      completed_date: null,
      completed_mileage: null,
      cost: null,
      vendor: null,
      notes: "Overdue — check pad thickness and rotor condition.",
      status: "overdue",
    });
  }

  // Batch insert maintenance records
  for (const rec of maintenanceRecords) {
    await sql`
      INSERT INTO maintenance_records
        (vehicle_id, service_type, due_mileage, due_date, completed_date,
         completed_mileage, cost, vendor, notes, status)
      VALUES
        (${rec.vehicle_id}, ${rec.service_type}, ${rec.due_mileage},
         ${rec.due_date}, ${rec.completed_date ?? null}, ${rec.completed_mileage ?? null},
         ${rec.cost ?? null}, ${rec.vendor ?? null}, ${rec.notes}, ${rec.status})
    `;
  }
  console.log(`  ✅ ${maintenanceRecords.length} maintenance records seeded\n`);

  // ═══════════════════════════════════════════════════════════════
  // STEP 3: Vehicle Expenses
  // ═══════════════════════════════════════════════════════════════
  console.log("💳 Seeding vehicle expenses...");

  const expenseVehicles = [
    { id: V.SSR001, name: "Corolla" },
    { id: V.SSR002, name: "Altima" },
    { id: V.SSR003, name: "Camry" },
    { id: V.SSR004, name: "Fusion" },
    { id: V.SSR005, name: "Sentra" },
  ];

  const repairs: Record<string, string[]> = {
    SSR001: ["Brake pad replacement", "New wiper blades"],
    SSR002: ["New front tire", "Battery replacement"],
    SSR003: ["AC recharge", "Power steering fluid flush"],
    SSR004: ["Alignment & balance", "New rear tire"],
    SSR005: ["Cabin air filter", "Coolant flush"],
  };
  const repairCodes = ["SSR001", "SSR002", "SSR003", "SSR004", "SSR005"];
  const paymentMethods = ["Company Card", "ACH Transfer", "Cash", "Zelle"];

  let expenseCount = 0;
  for (let i = 0; i < expenseVehicles.length; i++) {
    const { id: vehicleId } = expenseVehicles[i];
    const code = repairCodes[i];
    const repairList = repairs[code];

    const expenses = [
      // Month 3 ago
      {
        date: daysAgo(85),
        category: "Maintenance",
        vendor: vendors[i % vendors.length],
        amount: (Math.floor(Math.random() * 15) + 42).toFixed(2),
        payment_method: "Company Card",
        renter_caused: false,
        reimbursable: false,
        notes: "Oil change + filter",
      },
      // Month 2 ago — insurance
      {
        date: daysAgo(60),
        category: "Insurance",
        vendor: "Progressive Commercial",
        amount: "85.00",
        payment_method: "ACH Transfer",
        renter_caused: false,
        reimbursable: false,
        notes: "Monthly insurance allocation",
      },
      // Month 2 ago — repair (renter caused on vehicles 1 & 3)
      {
        date: daysAgo(55),
        category: "Repair",
        vendor: vendors[(i + 1) % vendors.length],
        amount: (Math.floor(Math.random() * 160) + 120).toFixed(2),
        payment_method: paymentMethods[i % paymentMethods.length],
        renter_caused: i === 0 || i === 2,
        reimbursable: i === 0 || i === 2,
        notes: repairList[0],
      },
      // Month 1 ago — tracker
      {
        date: daysAgo(30),
        category: "Technology",
        vendor: "Bouncie GPS",
        amount: "25.00",
        payment_method: "Company Card",
        renter_caused: false,
        reimbursable: false,
        notes: "Monthly tracker subscription",
      },
      // Month 1 ago — insurance
      {
        date: daysAgo(30),
        category: "Insurance",
        vendor: "Progressive Commercial",
        amount: "85.00",
        payment_method: "ACH Transfer",
        renter_caused: false,
        reimbursable: false,
        notes: "Monthly insurance allocation",
      },
      // Recent — detailing
      {
        date: daysAgo(12),
        category: "Detailing",
        vendor: "DetailXperts Houston",
        amount: "65.00",
        payment_method: paymentMethods[(i + 2) % paymentMethods.length],
        renter_caused: i === 1 || i === 4, // 2 vehicles renter-caused
        reimbursable: i === 1 || i === 4,
        notes: "Interior & exterior detail",
      },
      // Recent — second repair (vehicles 2,4 get second repair)
      ...(i === 1 || i === 3
        ? [
            {
              date: daysAgo(8),
              category: "Repair",
              vendor: vendors[(i + 2) % vendors.length],
              amount: (Math.floor(Math.random() * 100) + 150).toFixed(2),
              payment_method: "Company Card",
              renter_caused: false,
              reimbursable: false,
              notes: repairList[1] || "General repair",
            },
          ]
        : []),
      // This month tracker
      {
        date: daysAgo(2),
        category: "Technology",
        vendor: "Bouncie GPS",
        amount: "25.00",
        payment_method: "Company Card",
        renter_caused: false,
        reimbursable: false,
        notes: "Monthly tracker subscription",
      },
    ];

    for (const exp of expenses) {
      await sql`
        INSERT INTO vehicle_expenses
          (vehicle_id, date, category, vendor, amount, payment_method,
           renter_caused, reimbursable, notes)
        VALUES
          (${vehicleId}, ${exp.date}, ${exp.category}, ${exp.vendor},
           ${exp.amount}, ${exp.payment_method}, ${exp.renter_caused},
           ${exp.reimbursable}, ${exp.notes})
      `;
      expenseCount++;
    }
  }
  console.log(`  ✅ ${expenseCount} expense records seeded\n`);

  // ═══════════════════════════════════════════════════════════════
  // STEP 4: Trips
  // ═══════════════════════════════════════════════════════════════
  console.log("🚗 Seeding trips...");

  const houstonLocations = [
    "2800 Post Oak Blvd, Houston, TX 77056",
    "5085 Westheimer Rd, Houston, TX 77056",
    "1600 Lamar St, Houston, TX 77010",
    "3100 Main St, Houston, TX 77002",
    "8000 Kirby Dr, Houston, TX 77054",
    "1400 Edwards St, Houston, TX 77007",
    "10001 Bellaire Blvd, Houston, TX 77072",
    "2929 Buffalo Speedway, Houston, TX 77025",
    "9800 Richmond Ave, Houston, TX 77042",
    "12300 Westheimer Rd, Houston, TX 77077",
    "4400 Wayside Dr, Houston, TX 77087",
    "6500 Southwest Fwy, Houston, TX 77074",
    "Bush Intercontinental Airport, Houston, TX 77032",
    "Hobby Airport, Houston, TX 77061",
    "NRG Stadium, Houston, TX 77054",
  ];

  const allVehicleIds = Object.values(V);
  const tripData = [];

  for (let t = 0; t < 15; t++) {
    const vehicleId = allVehicleIds[t % allVehicleIds.length];
    const daysBack = Math.floor(Math.random() * 30) + 1;
    const startHour = Math.floor(Math.random() * 10) + 7; // 7am-5pm
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - daysBack);
    startTime.setHours(startHour, Math.floor(Math.random() * 60), 0, 0);

    const durationMin = Math.floor(Math.random() * 70) + 20; // 20-90 min
    const endTime = new Date(startTime.getTime() + durationMin * 60 * 1000);
    const miles = (Math.random() * 70 + 15).toFixed(1); // 15-85 miles

    const startLoc = houstonLocations[Math.floor(Math.random() * houstonLocations.length)];
    let endLoc = houstonLocations[Math.floor(Math.random() * houstonLocations.length)];
    while (endLoc === startLoc) {
      endLoc = houstonLocations[Math.floor(Math.random() * houstonLocations.length)];
    }

    tripData.push({
      vehicle_id: vehicleId,
      source: "manual",
      trip_start: startTime.toISOString(),
      trip_end: endTime.toISOString(),
      start_location: startLoc,
      end_location: endLoc,
      miles,
      duration_minutes: durationMin,
      notes: null,
    });
  }

  for (const trip of tripData) {
    await sql`
      INSERT INTO trips
        (vehicle_id, source, trip_start, trip_end, start_location,
         end_location, miles, duration_minutes, notes)
      VALUES
        (${trip.vehicle_id}, ${trip.source}, ${trip.trip_start},
         ${trip.trip_end}, ${trip.start_location}, ${trip.end_location},
         ${trip.miles}, ${trip.duration_minutes}, ${trip.notes})
    `;
  }
  console.log(`  ✅ ${tripData.length} trips seeded\n`);

  // ═══════════════════════════════════════════════════════════════
  // STEP 5: Customers + Reservations
  // ═══════════════════════════════════════════════════════════════
  console.log("📅 Seeding customers and reservations...");

  const customers = [
    { first: "Marcus", last: "Williams", email: "marcus.w@gmail.com", phone: "713-555-0101" },
    { first: "Jasmine", last: "Carter", email: "jasmine.c@gmail.com", phone: "713-555-0202" },
    { first: "DeShawn", last: "Thompson", email: "deshawn.t@gmail.com", phone: "832-555-0303" },
    { first: "Aaliyah", last: "Robinson", email: "aaliyah.r@gmail.com", phone: "346-555-0404" },
    { first: "Kevin", last: "Harris", email: "kevin.h@gmail.com", phone: "713-555-0505" },
    { first: "Brianna", last: "Mitchell", email: "brianna.m@gmail.com", phone: "832-555-0606" },
  ];

  const customerIds: string[] = [];
  for (const c of customers) {
    const result = await sql`
      INSERT INTO customers
        (first_name, last_name, full_name, email, phone)
      VALUES
        (${c.first}, ${c.last}, ${c.first + " " + c.last}, ${c.email}, ${c.phone})
      RETURNING id
    `;
    customerIds.push(result[0].id);
  }
  console.log(`  ✅ ${customerIds.length} customers created`);

  // Reservations: active(3), completed(2), awaiting_deposit(1), confirmed(1), agreement_sent(1)
  const reservations = [
    // ACTIVE — 3 rentals currently out
    {
      code: "SSR-RES-A1B2",
      vehicle_id: V.SSR001,
      customer_id: customerIds[0],
      pickup: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days ago
      return_dt: new Date(Date.now() + 4 * 86400000).toISOString(), // 4 days from now
      status: "active",
      deposit_status: "paid",
      agreement_status: "signed",
      signature_status: "signed",
      daily_rate: 45,
      days: 7,
      subtotal: 315,
      deposit: 250,
    },
    {
      code: "SSR-RES-C3D4",
      vehicle_id: V.SSR002,
      customer_id: customerIds[1],
      pickup: new Date(Date.now() - 5 * 86400000).toISOString(),
      return_dt: new Date(Date.now() + 9 * 86400000).toISOString(),
      status: "active",
      deposit_status: "paid",
      agreement_status: "signed",
      signature_status: "signed",
      daily_rate: 50,
      days: 14,
      subtotal: 700,
      deposit: 250,
    },
    {
      code: "SSR-RES-E5F6",
      vehicle_id: V.SSR003,
      customer_id: customerIds[2],
      pickup: new Date(Date.now() - 1 * 86400000).toISOString(),
      return_dt: new Date(Date.now() + 6 * 86400000).toISOString(),
      status: "active",
      deposit_status: "paid",
      agreement_status: "signed",
      signature_status: "signed",
      daily_rate: 55,
      days: 7,
      subtotal: 385,
      deposit: 300,
    },
    // COMPLETED — 2 finished rentals
    {
      code: "SSR-RES-G7H8",
      vehicle_id: V.SSR004,
      customer_id: customerIds[3],
      pickup: new Date(Date.now() - 25 * 86400000).toISOString(),
      return_dt: new Date(Date.now() - 18 * 86400000).toISOString(),
      status: "completed",
      deposit_status: "paid",
      agreement_status: "signed",
      signature_status: "signed",
      daily_rate: 45,
      days: 7,
      subtotal: 315,
      deposit: 250,
    },
    {
      code: "SSR-RES-I9J0",
      vehicle_id: V.SSR005,
      customer_id: customerIds[4],
      pickup: new Date(Date.now() - 40 * 86400000).toISOString(),
      return_dt: new Date(Date.now() - 26 * 86400000).toISOString(),
      status: "completed",
      deposit_status: "paid",
      agreement_status: "signed",
      signature_status: "signed",
      daily_rate: 42,
      days: 14,
      subtotal: 588,
      deposit: 250,
    },
    // AWAITING DEPOSIT — 1 (fires action queue)
    {
      code: "SSR-RES-K1L2",
      vehicle_id: V.SSR001,
      customer_id: customerIds[5],
      pickup: new Date(Date.now() + 5 * 86400000).toISOString(),
      return_dt: new Date(Date.now() + 12 * 86400000).toISOString(),
      status: "awaiting_deposit",
      deposit_status: "not_paid",
      agreement_status: "not_created",
      signature_status: "not_requested",
      daily_rate: 45,
      days: 7,
      subtotal: 315,
      deposit: 250,
    },
    // CONFIRMED — 1
    {
      code: "SSR-RES-M3N4",
      vehicle_id: V.SSR004,
      customer_id: customerIds[0],
      pickup: new Date(Date.now() + 10 * 86400000).toISOString(),
      return_dt: new Date(Date.now() + 17 * 86400000).toISOString(),
      status: "confirmed",
      deposit_status: "paid",
      agreement_status: "signed",
      signature_status: "signed",
      daily_rate: 45,
      days: 7,
      subtotal: 315,
      deposit: 250,
    },
    // AGREEMENT SENT — 1 (fires signature action queue)
    {
      code: "SSR-RES-O5P6",
      vehicle_id: V.SSR005,
      customer_id: customerIds[1],
      pickup: new Date(Date.now() + 7 * 86400000).toISOString(),
      return_dt: new Date(Date.now() + 21 * 86400000).toISOString(),
      status: "agreement_sent",
      deposit_status: "paid",
      agreement_status: "sent",
      signature_status: "sent",
      daily_rate: 42,
      days: 14,
      subtotal: 588,
      deposit: 250,
    },
  ];

  for (const res of reservations) {
    const days = res.days;
    const balanceDue = Math.max(0, res.subtotal - res.deposit);
    const expiration = new Date(Date.now() + 2 * 86400000).toISOString();

    await sql`
      INSERT INTO reservations (
        reservation_code, vehicle_id, customer_id,
        pickup_datetime, return_datetime,
        pickup_location, intended_use,
        reservation_status, deposit_status, agreement_status, signature_status,
        estimated_daily_rate, estimated_total_days, estimated_rental_subtotal,
        deposit_due, deposit_paid_amount, balance_due_estimate,
        expiration_datetime
      ) VALUES (
        ${res.code}, ${res.vehicle_id}, ${res.customer_id},
        ${res.pickup}, ${res.return_dt},
        ${"Houston, TX"}, ${"rideshare"},
        ${res.status}, ${res.deposit_status}, ${res.agreement_status}, ${res.signature_status},
        ${res.daily_rate}, ${days}, ${res.subtotal},
        ${res.deposit}, ${res.deposit_status === "paid" ? res.deposit : 0},
        ${balanceDue},
        ${expiration}
      )
    `;
  }
  console.log(`  ✅ ${reservations.length} reservations seeded\n`);

  // ═══════════════════════════════════════════════════════════════
  // STEP 6: Update vehicle statuses to match reservations
  // ═══════════════════════════════════════════════════════════════
  console.log("🚘 Updating vehicle statuses...");

  // SSR001 has active rental + upcoming reservation → reserved temporarily available
  await sql`UPDATE vehicles SET status = 'reserved' WHERE id = ${V.SSR001}`;
  // SSR002, SSR003 → active (currently out)
  await sql`UPDATE vehicles SET status = 'reserved' WHERE id = ${V.SSR002}`;
  await sql`UPDATE vehicles SET status = 'reserved' WHERE id = ${V.SSR003}`;
  // SSR004 → limited (upcoming confirmed, currently available)
  await sql`UPDATE vehicles SET status = 'limited_availability' WHERE id = ${V.SSR004}`;
  // SSR005 → limited (upcoming agreement_sent)
  await sql`UPDATE vehicles SET status = 'limited_availability' WHERE id = ${V.SSR005}`;

  console.log("  ✅ Vehicle statuses updated\n");

  // ═══════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════
  console.log("=========================================");
  console.log("🎉 Seed complete! Summary:");
  console.log(`   Vehicles updated:      5`);
  console.log(`   Maintenance records:   ${maintenanceRecords.length}`);
  console.log(`   Vehicle expenses:      ${expenseCount}`);
  console.log(`   Trips:                 ${tripData.length}`);
  console.log(`   Customers:             ${customerIds.length}`);
  console.log(`   Reservations:          ${reservations.length}`);
  console.log("=========================================\n");
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
