/**
 * Database package entry — schema + client for future API / ProjectRepository.
 * The frontend must not import this; keep DB access on the server side only.
 */
export { getDb, type Db } from './client';
export { visualProjects } from './schema';
