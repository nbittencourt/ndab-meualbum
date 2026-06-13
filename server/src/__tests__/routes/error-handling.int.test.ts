import './../setup/env.js';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express, { type Response } from 'express';
import { startMongo, stopMongo } from '../setup/mongo.js';
import { createApp } from '../../app.js';
import { asyncHandler } from '../../lib/asyncHandler.js';

describe('Aplicação Express — saúde e tratamento de erros', () => {
  beforeAll(async () => {
    await startMongo();
  });

  afterAll(async () => {
    await stopMongo();
  });

  it('GET /api/health responde 200 {ok:true}', async () => {
    const res = await request(createApp()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('rejeição em handler async envolvido por asyncHandler cai no error middleware (500 JSON)', async () => {
    const app = express();
    app.get(
      '/explode',
      asyncHandler(async () => {
        throw new Error('falha assíncrona simulada');
      })
    );
    app.use((err: Error, _req: express.Request, res: Response, _next: express.NextFunction) => {
      void err; void _req; void _next;
      res.status(500).json({ error: 'Erro interno do servidor' });
    });

    const res = await request(app).get('/explode');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Erro interno do servidor' });
  });

  it('rota autenticada sem cookie responde 401 (e não derruba o processo)', async () => {
    const res = await request(createApp()).get('/api/v1/home');
    expect(res.status).toBe(401);
    expect(res.body.error).toBeTruthy();
  });
});
