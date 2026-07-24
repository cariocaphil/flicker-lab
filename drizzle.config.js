var _a;
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
        url: (_a = process.env.DATABASE_URL) !== null && _a !== void 0 ? _a : 'postgresql://postgres:postgres@localhost:5432/flickerlab',
    },
});
