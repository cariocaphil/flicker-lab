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
 *   updates, lists, or deletes (future remote storage).
 * - A future API-backed implementation (e.g. PostgreSQL via HTTP) will
 *   implement this interface without changing Zustand or UI callers.
 */
export interface ProjectRepository {
  list(): Promise<FlickerProject[]>;

  getById(id: string): Promise<FlickerProject | null>;

  create(input: CreateFlickerProjectInput): Promise<FlickerProject>;

  update(id: string, input: UpdateFlickerProjectInput): Promise<FlickerProject>;

  delete(id: string): Promise<void>;
}
