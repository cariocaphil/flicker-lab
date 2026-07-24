import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit config for generating/applying migrations.
 * Run `npm run db:generate` to create SQL from schema.ts.
 * Do not apply migrations until PostgreSQL is provisioned (`npm run db:migrate`).
 */
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/flickerlab',
  },
});
