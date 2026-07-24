import 'dotenv/config';
/**
 * Drizzle Kit config for generating/applying migrations.
 * Run `npm run db:generate` to create SQL from schema.ts.
 * Do not apply migrations until PostgreSQL is provisioned (`npm run db:migrate`).
 */
declare const _default: import("drizzle-kit").Config;
export default _default;
