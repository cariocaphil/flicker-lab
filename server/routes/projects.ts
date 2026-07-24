import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import { ZodError } from 'zod';
import { ProjectNotFoundError } from '../../src/services/projectErrors';
import type { ProjectRepository } from '../../src/services/projectRepository';
import {
  parseCreateProjectBody,
  parseProjectId,
  parseUpdateProjectBody,
} from '../../src/services/projectValidation';

function sendZodError(res: Response, error: ZodError): void {
  res.status(400).json({
    error: 'Validation failed',
    details: error.flatten(),
  });
}

export function createProjectsRouter(repo: ProjectRepository): Router {
  const router = Router();

  router.get('/', async (_req, res, next) => {
    try {
      const projects = await repo.list();
      res.status(200).json(projects);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const id = parseProjectId(req.params.id);
      const project = await repo.getById(id);
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      res.status(200).json(project);
    } catch (err) {
      if (err instanceof ZodError) {
        sendZodError(res, err);
        return;
      }
      next(err);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const input = parseCreateProjectBody(req.body);
      const project = await repo.create(input);
      res.status(201).json(project);
    } catch (err) {
      if (err instanceof ZodError) {
        sendZodError(res, err);
        return;
      }
      next(err);
    }
  });

  router.patch('/:id', async (req, res, next) => {
    try {
      const id = parseProjectId(req.params.id);
      const input = parseUpdateProjectBody(req.body);
      const project = await repo.update(id, input);
      res.status(200).json(project);
    } catch (err) {
      if (err instanceof ZodError) {
        sendZodError(res, err);
        return;
      }
      if (err instanceof ProjectNotFoundError) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      next(err);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const id = parseProjectId(req.params.id);
      await repo.delete(id);
      res.status(204).send();
    } catch (err) {
      if (err instanceof ZodError) {
        sendZodError(res, err);
        return;
      }
      if (err instanceof ProjectNotFoundError) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      next(err);
    }
  });

  return router;
}

export function projectsErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  void next;
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}
