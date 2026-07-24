import cors from 'cors';
import express, { type Express } from 'express';
import { DrizzleProjectRepository } from '../src/services/drizzleProjectRepository';
import type { ProjectRepository } from '../src/services/projectRepository';
import { createProjectsRouter, projectsErrorHandler } from './routes/projects';

export interface CreateAppOptions {
  /** Inject a repository for tests; defaults to Drizzle (requires DATABASE_URL). */
  repository?: ProjectRepository;
}

/**
 * Express API for explicitly saved Flickerlab projects.
 * Browser React app talks to these routes only — never to PostgreSQL directly.
 */
export function createApp(options: CreateAppOptions = {}): Express {
  const app = express();
  const repository = options.repository ?? new DrizzleProjectRepository();

  app.use(cors());
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use('/api/projects', createProjectsRouter(repository));
  app.use(projectsErrorHandler);

  return app;
}
