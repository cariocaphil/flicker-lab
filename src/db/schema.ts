import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import type { Sequence } from '../types';

/**
 * visual_projects — server-side persistence for explicitly saved scores.
 *
 * sequence is JSONB (not normalized frames) because:
 * - the app already treats Sequence as one document (Frame[])
 * - PDF export and the Zustand store consume that shape as-is
 * - avoids join-heavy CRUD for a nested grid that is always loaded whole
 *
 * Browser localStorage (`flickerlab-project`) remains the automatic draft.
 * The React app must not import this schema; persistence goes through the HTTP API.
 */
export const visualProjects = pgTable('visual_projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  sequence: jsonb('sequence').$type<Sequence>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
