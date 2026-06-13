import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../../.env') });
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { connectDB } from './db.js';
import { logger, maskIp } from './lib/logger.js';
import authRouter from './routes/auth.js';
import albumsRouter from './routes/albums.js';
import homeRouter from './routes/home.js';
import secoesRouter from './routes/secoes.js';
import abrirPacotinhosRouter from './routes/abrir-pacotinhos.js';
import colarFigurinhasRouter from './routes/colar-figurinhas.js';
import profileRouter from './routes/profile.js';
import privacidadeRouter from './routes/privacidade.js';
import seedRouter from './routes/seed.js';
import testRouter from './routes/test.routes.js';

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

// Cloud Run sits behind Firebase Hosting (and GCP load balancer), which sets X-Forwarded-For.
// Without this, express-rate-limit cannot identify clients and throws ERR_ERL_UNEXPECTED_X_FORWARDED_FOR.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use((req, _res, next) => {
  logger.info('request', { method: req.method, path: req.path, ip: maskIp(req.ip ?? '') });
  next();
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/albums', albumsRouter);
app.use('/api/v1/home', homeRouter);
app.use('/api/v1/secoes', secoesRouter);
app.use('/api/v1', abrirPacotinhosRouter);
app.use('/api/v1', colarFigurinhasRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1', privacidadeRouter);
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/v1/seed', seedRouter);
}
if (process.env.NODE_ENV === 'test') {
  app.use('/api/v1/test', testRouter);
}

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('unhandled-error', { err: err?.message ?? String(err) });
  if (!res.headersSent) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

const server = app.listen(PORT, () => logger.info('server:started', { port: PORT }));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('unhandledRejection', (reason) => {
  logger.error('unhandled-rejection', { reason: String(reason) });
});

connectDB().catch((err) => {
  logger.error('db:fatal', { err: err?.message });
  process.exit(1);
});
