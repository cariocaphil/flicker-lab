import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Shared PostgreSQL + Drizzle client for future API routes.
 *
 * Not imported by the Vite/React app today — localStorage still holds the
 * browser draft, and ProjectRepository has no DB adapter yet.
 * Lazily connects so tooling/tests can import types without a live DATABASE_URL
 * until getDb() is called.
 */
export type Db = ReturnType<typeof createDb>;

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env and configure PostgreSQL.'
    );
  }
  return url;
}

function createDb() {
  const client = postgres(requireDatabaseUrl(), {
    // API/server usage; adjust pool settings when wiring routes.
    max: 10,
  });
  return drizzle(client, { schema });
}

let dbInstance: Db | undefined;

/** Returns the singleton Drizzle client (connects on first use). */
export function getDb(): Db {
  if (!dbInstance) {
    dbInstance = createDb();
  }
  return dbInstance;
}
