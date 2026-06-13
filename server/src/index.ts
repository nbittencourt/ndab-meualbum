import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../../.env') });
import { createApp } from './app.js';
import { connectDB } from './db.js';
import { logger } from './lib/logger.js';

const PORT = Number(process.env.PORT ?? 3000);

const app = createApp();

const server = app.listen(PORT, () => logger.info('server:started', { port: PORT }));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('unhandledRejection', (reason) => {
  logger.error('unhandled-rejection', { reason: String(reason) });
});

connectDB().catch((err) => {
  logger.error('db:fatal', { err: err?.message });
  process.exit(1);
});
