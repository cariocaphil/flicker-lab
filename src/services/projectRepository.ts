import {
  CreateFlickerProjectInput,
  FlickerProject,
  UpdateFlickerProjectInput,
} from '../types';

/**
 * Persistence boundary for explicitly saved projects.
 *
 * - localStorage (`flickerlab-project`) remains the automatic browser draft
 *   of the current Sequence; it is not managed through this interface.
 * - This repository represents projects the user intentionally creates,
 *   updates, lists, or deletes.
 * - Server: DrizzleProjectRepository (PostgreSQL). Browser: call the HTTP API;
 *   never import Drizzle or DATABASE_URL into client code.
 */
export interface ProjectRepository {
  list(): Promise<FlickerProject[]>;

  getById(id: string): Promise<FlickerProject | null>;

  create(input: CreateFlickerProjectInput): Promise<FlickerProject>;

  update(id: string, input: UpdateFlickerProjectInput): Promise<FlickerProject>;

  delete(id: string): Promise<void>;
}
