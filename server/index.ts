import 'dotenv/config';
import { createApp } from './app';

/**
 * API server entrypoint.
 * localStorage remains the Vite app's automatic draft; this process persists
 * explicit projects to PostgreSQL via DrizzleProjectRepository.
 */
const port = Number(process.env.PORT ?? 3001);
const app = createApp();

app.listen(port, () => {
  console.log(`Flicker Lab API listening on http://localhost:${port}`);
});
