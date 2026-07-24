import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app';
import { ProjectNotFoundError } from '../../src/services/projectErrors';
import type { ProjectRepository } from '../../src/services/projectRepository';
import type { FlickerProject, Frame, Sequence } from '../../src/types';

const blankFrame = (): Frame => ({ resolution: 1, cells: [[0]] });

class TestProjectRepository implements ProjectRepository {
  private projects = new Map<string, FlickerProject>();
  private nextId = 1;
  failNext = false;

  async list(): Promise<FlickerProject[]> {
    if (this.failNext) {
      this.failNext = false;
      throw new Error('db down');
    }
    return Array.from(this.projects.values()).sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt)
    );
  }

  async getById(id: string): Promise<FlickerProject | null> {
    return this.projects.get(id) ?? null;
  }

  async create(input: {
    name: string;
    sequence: Sequence;
  }): Promise<FlickerProject> {
    const now = new Date().toISOString();
    const project: FlickerProject = {
      id: `00000000-0000-4000-8000-${String(this.nextId++).padStart(12, '0')}`,
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
    input: { name?: string; sequence?: Sequence }
  ): Promise<FlickerProject> {
    const existing = this.projects.get(id);
    if (!existing) {
      throw new ProjectNotFoundError(id);
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
      throw new ProjectNotFoundError(id);
    }
    this.projects.delete(id);
  }
}

describe('projects API', () => {
  let repo: TestProjectRepository;
  let app: express.Express;

  beforeEach(() => {
    repo = new TestProjectRepository();
    app = createApp({ repository: repo });
  });

  it('POST /api/projects creates a project (201) and preserves frame order', async () => {
    const sequence: Sequence = [
      { resolution: 1, cells: [[0]] },
      { resolution: 1, cells: [[1]] },
      blankFrame(),
    ];

    const createRes = await request(app)
      .post('/api/projects')
      .send({ name: 'Demo', sequence })
      .expect(201);

    expect(createRes.body.name).toBe('Demo');
    expect(createRes.body.sequence).toEqual(sequence);
    expect(createRes.body.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );

    const getRes = await request(app)
      .get(`/api/projects/${createRes.body.id}`)
      .expect(200);

    expect(getRes.body.sequence.map((f: Frame) => f.cells[0][0])).toEqual([
      0, 1, 0,
    ]);
  });

  it('GET /api/projects lists projects (200)', async () => {
    await repo.create({ name: 'A', sequence: [blankFrame()] });
    await repo.create({ name: 'B', sequence: [blankFrame()] });

    const res = await request(app).get('/api/projects').expect(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.map((p: FlickerProject) => p.name)).toEqual(['A', 'B']);
  });

  it('returns 404 for missing project', async () => {
    await request(app)
      .get('/api/projects/11111111-1111-4111-8111-111111111111')
      .expect(404);

    await request(app)
      .patch('/api/projects/11111111-1111-4111-8111-111111111111')
      .send({ name: 'Nope' })
      .expect(404);

    await request(app)
      .delete('/api/projects/11111111-1111-4111-8111-111111111111')
      .expect(404);
  });

  it('returns 400 for invalid create/update input', async () => {
    await request(app)
      .post('/api/projects')
      .send({ name: '', sequence: [] })
      .expect(400);

    await request(app)
      .post('/api/projects')
      .send({
        name: 'Bad',
        sequence: [{ resolution: 2, cells: [[0]] }],
      })
      .expect(400);

    const created = await repo.create({
      name: 'Ok',
      sequence: [blankFrame()],
    });

    await request(app)
      .patch(`/api/projects/${created.id}`)
      .send({})
      .expect(400);

    await request(app).get('/api/projects/not-a-uuid').expect(400);
  });

  it('PATCH updates and DELETE removes (200 / 204)', async () => {
    const created = await repo.create({
      name: 'Before',
      sequence: [blankFrame()],
    });

    const patched = await request(app)
      .patch(`/api/projects/${created.id}`)
      .send({ name: 'After' })
      .expect(200);

    expect(patched.body.name).toBe('After');

    await request(app).delete(`/api/projects/${created.id}`).expect(204);
    await request(app).get(`/api/projects/${created.id}`).expect(404);
  });

  it('returns 500 on unexpected repository errors', async () => {
    repo.failNext = true;
    await request(app).get('/api/projects').expect(500);
  });
});
