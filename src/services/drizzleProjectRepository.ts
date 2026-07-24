import { asc, eq } from 'drizzle-orm';
import { getDb, type Db } from '../db/client';
import { visualProjects } from '../db/schema';
import type {
  CreateFlickerProjectInput,
  FlickerProject,
  UpdateFlickerProjectInput,
} from '../types';
import { ProjectNotFoundError } from './projectErrors';
import type { ProjectRepository } from './projectRepository';

type VisualProjectRow = typeof visualProjects.$inferSelect;

/**
 * Maps a visual_projects row to the canonical FlickerProject document.
 * Timestamps are exposed as ISO strings for the API/domain model.
 */
export function mapVisualProjectRow(row: VisualProjectRow): FlickerProject {
  return {
    id: row.id,
    name: row.name,
    sequence: row.sequence,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Server-only PostgreSQL implementation of ProjectRepository.
 * Must never be imported from React/browser code — use the HTTP API instead.
 * localStorage remains the automatic client-side draft.
 */
export class DrizzleProjectRepository implements ProjectRepository {
  constructor(private readonly db: Db = getDb()) {}

  async list(): Promise<FlickerProject[]> {
    const rows = await this.db
      .select()
      .from(visualProjects)
      .orderBy(asc(visualProjects.createdAt));
    return rows.map(mapVisualProjectRow);
  }

  async getById(id: string): Promise<FlickerProject | null> {
    const rows = await this.db
      .select()
      .from(visualProjects)
      .where(eq(visualProjects.id, id))
      .limit(1);
    const row = rows[0];
    return row ? mapVisualProjectRow(row) : null;
  }

  async create(input: CreateFlickerProjectInput): Promise<FlickerProject> {
    const rows = await this.db
      .insert(visualProjects)
      .values({
        name: input.name,
        sequence: input.sequence,
      })
      .returning();
    const row = rows[0];
    if (!row) {
      throw new Error('Insert returned no row');
    }
    return mapVisualProjectRow(row);
  }

  async update(
    id: string,
    input: UpdateFlickerProjectInput
  ): Promise<FlickerProject> {
    const rows = await this.db
      .update(visualProjects)
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.sequence !== undefined ? { sequence: input.sequence } : {}),
        updatedAt: new Date(),
      })
      .where(eq(visualProjects.id, id))
      .returning();
    const row = rows[0];
    if (!row) {
      throw new ProjectNotFoundError(id);
    }
    return mapVisualProjectRow(row);
  }

  async delete(id: string): Promise<void> {
    const rows = await this.db
      .delete(visualProjects)
      .where(eq(visualProjects.id, id))
      .returning({ id: visualProjects.id });
    if (!rows[0]) {
      throw new ProjectNotFoundError(id);
    }
  }
}
