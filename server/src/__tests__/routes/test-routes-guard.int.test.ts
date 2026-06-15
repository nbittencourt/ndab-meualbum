import './../setup/env.js';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import mongoose from 'mongoose';
import { startMongo, stopMongo, clearCollections } from '../setup/mongo.js';
import { createApp } from '../../app.js';

let app: Express;

describe('Guard de host local em test.routes.ts', () => {
  beforeAll(async () => {
    await startMongo();
    app = createApp();
  });

  afterAll(async () => {
    await stopMongo();
  });

  beforeEach(async () => {
    await clearCollections();
  });

  it('permite reset-db quando a conexão é local (127.0.0.1)', async () => {
    // mongodb-memory-server conecta em 127.0.0.1 — host local → deve passar o guard
    const res = await request(app).post('/api/v1/test/reset-db');
    expect(res.status).toBe(200);
  });

  it('rejeita reset-db com 403 quando a conexão aponta para host remoto', async () => {
    const hostSpy = vi.spyOn(mongoose.connection, 'host', 'get').mockReturnValue('cluster0.abcde.mongodb.net');
    try {
      const res = await request(app).post('/api/v1/test/reset-db');
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Remote DB');
    } finally {
      hostSpy.mockRestore();
    }
  });
});
