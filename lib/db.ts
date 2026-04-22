/**
 * lib/db.ts
 *
 * Database connection singleton for the SureShift platform.
 *
 * Uses @neondatabase/serverless which is compatible with both Node.js and
 * Next.js Edge Runtime. This is the ONLY place we read DATABASE_URL — all
 * other files import `sql` from here.
 *
 * Why @neondatabase/serverless over pg:
 * - Works in Next.js Edge Runtime (pg does not)
 * - Uses HTTP for queries, WebSockets for transactions
 * - Connection pooling handled by Neon's infrastructure
 *
 * SECURITY: DATABASE_URL is never exposed to the client. This file is
 * server-only and should only be imported inside app/api/ or lib/ files.
 *
 * TYPE NOTE: The @neondatabase/serverless v1 tagged template literal does
 * not accept a type parameter on the template call itself. Instead, we
 * export `typedSql` — a thin typed wrapper that returns the query result
 * cast to the provided type. Use `typedSql<YourType[]>` instead of
 * `sql<YourType[]>` in API routes.
 */

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// ============================================
// LAZY DATABASE CLIENT
// We resolve the connection lazily (on first use) so that Next.js can
// complete the build phase without DATABASE_URL present. The env var
// is validated at RUNTIME when a request actually hits an API route.
// This is the correct pattern for Vercel deployments where env vars
// are available at runtime but not always during static analysis.
// ============================================

let _sql: NeonQueryFunction<false, false> | null = null;

/**
 * Returns the Neon SQL client, initializing it on first call.
 * Throws a clear error at runtime if DATABASE_URL is missing.
 */
function getSQL(): NeonQueryFunction<false, false> {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "[SureShift DB] DATABASE_URL is not set. " +
          "Add it to your Vercel environment variables or .env.local."
      );
    }
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

// ============================================
// RAW SQL CLIENT PROXY
// Proxies tagged template calls to the lazy client.
// Use `sql` for write/update operations where you don't need
// type inference on the result.
// ============================================

export const sql: NeonQueryFunction<false, false> = new Proxy(
  {} as NeonQueryFunction<false, false>,
  {
    apply(_target, _thisArg, args) {
      const client = getSQL();
      return (client as unknown as Function).apply(null, args);
    },
    get(_target, prop) {
      const client = getSQL();
      return (client as unknown as Record<string | symbol, unknown>)[prop];
    },
  }
) as unknown as NeonQueryFunction<false, false>;

// ============================================
// TYPED SQL WRAPPER
// Returns query results cast to the specified type T.
// Usage: const rows = await typedSql<VehicleRow[]>`SELECT * FROM vehicles`
//
// This pattern safely bridges the gap between the Neon client's untyped
// tagged template return and our typed interfaces in lib/types.ts.
// ============================================

export function typedSql<T>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T> {
  return sql(strings, ...values) as unknown as Promise<T>;
}

/**
 * Utility: test the database connection by running a cheap query.
 * Used in the migration runner to confirm connectivity before executing DDL.
 *
 * @returns Promise<void> — resolves if connected, throws if not
 */
export async function testConnection(): Promise<void> {
  await sql`SELECT 1 AS ping`;
}
