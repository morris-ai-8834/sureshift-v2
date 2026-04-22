/**
 * lib/db.ts
 *
 * Database connection for SureShift Rentals.
 * Uses @neondatabase/serverless — edge-compatible Postgres client.
 *
 * SECURITY: DATABASE_URL is never exposed to the client.
 * Only import this file inside app/api/ routes (server-side only).
 */

import { neon } from "@neondatabase/serverless";

/**
 * Returns a fresh Neon SQL client.
 * Called inside each API route so DATABASE_URL is read at runtime, not build time.
 *
 * @throws Error if DATABASE_URL is not set
 */
export function getDB() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "[SureShift] DATABASE_URL is not set. Add it to your Vercel environment variables."
    );
  }
  return neon(process.env.DATABASE_URL);
}
