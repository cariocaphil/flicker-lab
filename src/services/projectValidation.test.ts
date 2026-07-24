import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import {
  parseCreateProjectBody,
  parseProjectId,
  parseUpdateProjectBody,
} from './projectValidation';

describe('projectValidation', () => {
  it('accepts a valid create body', () => {
    const parsed = parseCreateProjectBody({
      name: '  My Score  ',
      sequence: [
        { resolution: 1, cells: [[1]] },
        {
          resolution: 2,
          cells: [
            [0, 1],
            [1, 0],
          ],
        },
      ],
    });
    expect(parsed.name).toBe('My Score');
    expect(parsed.sequence).toHaveLength(2);
  });

  it('rejects empty name', () => {
    expect(() => parseCreateProjectBody({ name: '   ', sequence: [] })).toThrow(
      ZodError
    );
  });

  it('rejects non-array sequence', () => {
    expect(() => parseCreateProjectBody({ name: 'x', sequence: {} })).toThrow(
      ZodError
    );
  });

  it('rejects invalid resolution', () => {
    expect(() =>
      parseCreateProjectBody({
        name: 'x',
        sequence: [
          {
            resolution: 3,
            cells: [
              [0, 0, 0],
              [0, 0, 0],
              [0, 0, 0],
            ],
          },
        ],
      })
    ).toThrow(ZodError);
  });

  it('rejects cells that are not 0 or 1', () => {
    expect(() =>
      parseCreateProjectBody({
        name: 'x',
        sequence: [{ resolution: 1, cells: [[2]] }],
      })
    ).toThrow(ZodError);
  });

  it('rejects cell matrix that does not match resolution', () => {
    expect(() =>
      parseCreateProjectBody({
        name: 'x',
        sequence: [
          {
            resolution: 2,
            cells: [[0, 1]],
          },
        ],
      })
    ).toThrow(ZodError);

    expect(() =>
      parseCreateProjectBody({
        name: 'x',
        sequence: [
          {
            resolution: 2,
            cells: [[0, 1], [0]],
          },
        ],
      })
    ).toThrow(ZodError);
  });

  it('requires at least one field on update', () => {
    expect(() => parseUpdateProjectBody({})).toThrow(ZodError);
  });

  it('validates project id as UUID', () => {
    expect(parseProjectId('11111111-1111-4111-8111-111111111111')).toBe(
      '11111111-1111-4111-8111-111111111111'
    );
    expect(() => parseProjectId('not-a-uuid')).toThrow(ZodError);
  });
});
