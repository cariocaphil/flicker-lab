import { z } from 'zod';
import type {
  CreateFlickerProjectInput,
  Sequence,
  UpdateFlickerProjectInput,
} from '../types';

const cellSchema = z.union([z.literal(0), z.literal(1)]);

const resolutionSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(4),
  z.literal(8),
]);

const frameSchema = z
  .object({
    resolution: resolutionSchema,
    cells: z.array(z.array(cellSchema)),
  })
  .superRefine((frame, ctx) => {
    if (frame.cells.length !== frame.resolution) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `cells must have ${frame.resolution} rows to match resolution`,
        path: ['cells'],
      });
      return;
    }
    frame.cells.forEach((row, rowIndex) => {
      if (row.length !== frame.resolution) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `cells[${rowIndex}] must have ${frame.resolution} columns to match resolution`,
          path: ['cells', rowIndex],
        });
      }
    });
  });

export const sequenceSchema: z.ZodType<Sequence> = z.array(frameSchema);

export const createProjectBodySchema = z.object({
  name: z.string().trim().min(1, 'name must be a non-empty string'),
  sequence: sequenceSchema,
});

export const updateProjectBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'name must be a non-empty string')
      .optional(),
    sequence: sequenceSchema.optional(),
  })
  .refine((body) => body.name !== undefined || body.sequence !== undefined, {
    message: 'At least one of name or sequence is required',
  });

export const projectIdParamSchema = z.string().uuid('id must be a valid UUID');

export function parseCreateProjectBody(
  body: unknown
): CreateFlickerProjectInput {
  return createProjectBodySchema.parse(body);
}

export function parseUpdateProjectBody(
  body: unknown
): UpdateFlickerProjectInput {
  return updateProjectBodySchema.parse(body);
}

export function parseProjectId(id: unknown): string {
  return projectIdParamSchema.parse(id);
}
