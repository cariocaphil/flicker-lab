import { beforeEach, describe, expect, it } from 'vitest';
import {
  CreateFlickerProjectInput,
  FlickerProject,
  Frame,
  UpdateFlickerProjectInput,
} from '../types';
import { ProjectRepository } from './projectRepository';

const blankFrame = (): Frame => ({
  resolution: 1,
  cells: [[0]],
});

/** In-memory fake used only to exercise the ProjectRepository contract. */
class InMemoryProjectRepository implements ProjectRepository {
  private projects = new Map<string, FlickerProject>();
  private nextId = 1;

  async list(): Promise<FlickerProject[]> {
    return Array.from(this.projects.values()).sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt)
    );
  }

  async getById(id: string): Promise<FlickerProject | null> {
    return this.projects.get(id) ?? null;
  }

  async create(input: CreateFlickerProjectInput): Promise<FlickerProject> {
    const now = new Date().toISOString();
    const project: FlickerProject = {
      id: String(this.nextId++),
      name: input.name,
      sequence: input.sequence,
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(project.id, project);
    return project;
  }

  async update(
    id: string,
    input: UpdateFlickerProjectInput
  ): Promise<FlickerProject> {
    const existing = this.projects.get(id);
    if (!existing) {
      throw new Error(`Project not found: ${id}`);
    }
    const updated: FlickerProject = {
      ...existing,
      name: input.name ?? existing.name,
      sequence: input.sequence ?? existing.sequence,
      updatedAt: new Date().toISOString(),
    };
    this.projects.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!this.projects.has(id)) {
      throw new Error(`Project not found: ${id}`);
    }
    this.projects.delete(id);
  }
}

describe('ProjectRepository contract', () => {
  let repo: ProjectRepository;

  beforeEach(() => {
    repo = new InMemoryProjectRepository();
  });

  it('creates a project with generated id and timestamps', async () => {
    const sequence = [blankFrame()];
    const created = await repo.create({ name: 'draft-one', sequence });

    expect(created.id).toBeTruthy();
    expect(created.name).toBe('draft-one');
    expect(created.sequence).toEqual(sequence);
    expect(created.createdAt).toBeTruthy();
    expect(created.updatedAt).toBe(created.createdAt);
  });

  it('lists, gets, updates, and deletes projects', async () => {
    const a = await repo.create({
      name: 'a',
      sequence: [blankFrame()],
    });
    const b = await repo.create({
      name: 'b',
      sequence: [{ resolution: 1, cells: [[1]] }],
    });

    const listed = await repo.list();
    expect(listed.map((p) => p.id)).toEqual([a.id, b.id]);

    expect(await repo.getById(a.id)).toEqual(a);
    expect(await repo.getById('missing')).toBeNull();

    const updated = await repo.update(a.id, { name: 'a-renamed' });
    expect(updated.name).toBe('a-renamed');
    expect(updated.sequence).toEqual(a.sequence);
    expect(updated.createdAt).toBe(a.createdAt);
    expect(updated.updatedAt >= a.updatedAt).toBe(true);

    await repo.delete(a.id);
    expect(await repo.getById(a.id)).toBeNull();
    expect((await repo.list()).map((p) => p.id)).toEqual([b.id]);
  });

  it('update can replace the sequence', async () => {
    const created = await repo.create({
      name: 'score',
      sequence: [blankFrame()],
    });
    const nextSequence = [
      {
        resolution: 2 as const,
        cells: [
          [1, 0],
          [0, 1],
        ] as Frame['cells'],
      },
    ];

    const updated = await repo.update(created.id, { sequence: nextSequence });
    expect(updated.sequence).toEqual(nextSequence);
  });
});
