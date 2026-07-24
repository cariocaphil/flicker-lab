import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Db } from '../db/client';
import type { Sequence } from '../types';
import {
  DrizzleProjectRepository,
  mapVisualProjectRow,
} from './drizzleProjectRepository';
import { ProjectNotFoundError } from './projectErrors';

const sequenceA: Sequence = [
  { resolution: 1, cells: [[0]] },
  { resolution: 1, cells: [[1]] },
  {
    resolution: 2,
    cells: [
      [1, 0],
      [0, 1],
    ],
  },
];

const baseRow = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Score A',
  sequence: sequenceA,
  createdAt: new Date('2024-06-01T10:00:00.000Z'),
  updatedAt: new Date('2024-06-01T11:00:00.000Z'),
};

describe('mapVisualProjectRow', () => {
  it('maps snake_case timestamps to ISO createdAt/updatedAt', () => {
    const project = mapVisualProjectRow(baseRow);
    expect(project).toEqual({
      id: baseRow.id,
      name: 'Score A',
      sequence: sequenceA,
      createdAt: '2024-06-01T10:00:00.000Z',
      updatedAt: '2024-06-01T11:00:00.000Z',
    });
  });

  it('preserves frame order in sequence', () => {
    const project = mapVisualProjectRow(baseRow);
    expect(project.sequence.map((f) => f.cells[0][0])).toEqual([0, 1, 1]);
    expect(project.sequence[2].resolution).toBe(2);
  });
});

describe('DrizzleProjectRepository', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('lists projects ordered by created_at', async () => {
    const rows = [
      baseRow,
      {
        ...baseRow,
        id: '22222222-2222-4222-8222-222222222222',
        name: 'Score B',
        createdAt: new Date('2024-06-02T10:00:00.000Z'),
      },
    ];
    const db = {
      select: () => ({
        from: () => ({
          orderBy: () => Promise.resolve(rows),
        }),
      }),
    } as unknown as Db;

    const repo = new DrizzleProjectRepository(db);
    const listed = await repo.list();
    expect(listed).toHaveLength(2);
    expect(listed[0].name).toBe('Score A');
    expect(listed[1].name).toBe('Score B');
    expect(listed[0].sequence).toEqual(sequenceA);
  });

  it('getById returns null when missing', async () => {
    const db = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([]),
          }),
        }),
      }),
    } as unknown as Db;

    const repo = new DrizzleProjectRepository(db);
    expect(await repo.getById(baseRow.id)).toBeNull();
  });

  it('create returns mapped project and preserves sequence order', async () => {
    const inserted = {
      ...baseRow,
      createdAt: new Date('2024-07-01T00:00:00.000Z'),
      updatedAt: new Date('2024-07-01T00:00:00.000Z'),
    };
    const db = {
      insert: () => ({
        values: () => ({
          returning: () => Promise.resolve([inserted]),
        }),
      }),
    } as unknown as Db;

    const repo = new DrizzleProjectRepository(db);
    const created = await repo.create({
      name: 'Score A',
      sequence: sequenceA,
    });
    expect(created.id).toBe(baseRow.id);
    expect(created.sequence).toEqual(sequenceA);
    expect(created.createdAt).toBe('2024-07-01T00:00:00.000Z');
  });

  it('update sets updatedAt and throws when missing', async () => {
    const now = new Date('2024-08-01T12:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(now);

    let capturedSet: Record<string, unknown> | undefined;
    const updatedRow = {
      ...baseRow,
      name: 'Renamed',
      updatedAt: now,
    };

    const db = {
      update: () => ({
        set: (values: Record<string, unknown>) => {
          capturedSet = values;
          return {
            where: () => ({
              returning: () => Promise.resolve([updatedRow]),
            }),
          };
        },
      }),
    } as unknown as Db;

    const repo = new DrizzleProjectRepository(db);
    const updated = await repo.update(baseRow.id, { name: 'Renamed' });
    expect(capturedSet?.updatedAt).toEqual(now);
    expect(capturedSet?.name).toBe('Renamed');
    expect(updated.name).toBe('Renamed');
    expect(updated.updatedAt).toBe(now.toISOString());

    const emptyDb = {
      update: () => ({
        set: () => ({
          where: () => ({
            returning: () => Promise.resolve([]),
          }),
        }),
      }),
    } as unknown as Db;

    await expect(
      new DrizzleProjectRepository(emptyDb).update(baseRow.id, {
        name: 'x',
      })
    ).rejects.toBeInstanceOf(ProjectNotFoundError);
  });

  it('delete throws ProjectNotFoundError when missing', async () => {
    const db = {
      delete: () => ({
        where: () => ({
          returning: () => Promise.resolve([]),
        }),
      }),
    } as unknown as Db;

    await expect(
      new DrizzleProjectRepository(db).delete(baseRow.id)
    ).rejects.toBeInstanceOf(ProjectNotFoundError);
  });
});
