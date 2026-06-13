import './../setup/env.js';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { Types } from 'mongoose';
import type { Express } from 'express';
import { startMongo, stopMongo, clearCollections } from '../setup/mongo.js';
import { createApp } from '../../app.js';
import { TokenOperacao } from '../../models/TokenOperacao.js';
import { TokenConfirmacaoCadastro } from '../../models/TokenConfirmacaoCadastro.js';
import { RegistroEliminacao } from '../../models/RegistroEliminacao.js';

const DIA_MS = 24 * 60 * 60 * 1000;

let app: Express;

describe('POST /api/v1/admin/purga (RN-PR01)', () => {
  beforeAll(async () => {
    process.env.PURGE_TOKEN = 'segredo-de-teste';
    await startMongo();
    app = createApp();
  });

  afterAll(async () => {
    await stopMongo();
    delete process.env.PURGE_TOKEN;
  });

  beforeEach(async () => {
    await clearCollections();
  });

  it('responde 403 sem o header X-Purge-Token correto', async () => {
    const res = await request(app).post('/api/v1/admin/purga').set('X-Purge-Token', 'errado');
    expect(res.status).toBe(403);
  });

  it('elimina apenas tokens expirados há mais de 90 dias e registra a eliminação', async () => {
    const agora = Date.now();
    await TokenOperacao.create([
      {
        token: 'antigo-1',
        usuarioIdentificador: 'ABC123',
        tipo: 'RECUPERACAO_SENHA',
        expiraEm: new Date(agora - 91 * DIA_MS),
      },
      {
        token: 'recente-1',
        usuarioIdentificador: 'ABC123',
        tipo: 'RECUPERACAO_SENHA',
        expiraEm: new Date(agora - 10 * DIA_MS),
      },
    ]);
    await TokenConfirmacaoCadastro.create([
      { token: 'antigo-2', usuarioId: new Types.ObjectId(), expiraEm: new Date(agora - 120 * DIA_MS) },
      { token: 'valido-2', usuarioId: new Types.ObjectId(), expiraEm: new Date(agora + DIA_MS) },
    ]);

    const res = await request(app)
      .post('/api/v1/admin/purga')
      .set('X-Purge-Token', 'segredo-de-teste');
    expect(res.status).toBe(200);

    expect(await TokenOperacao.countDocuments()).toBe(1);
    expect(await TokenConfirmacaoCadastro.countDocuments()).toBe(1);

    // Registro auditável com contagens corretas (sem dados pessoais)
    const registros = await RegistroEliminacao.find().lean();
    expect(registros).toHaveLength(3);
    const porColecao = Object.fromEntries(registros.map((r) => [r.colecao, r.documentosEliminados]));
    expect(porColecao.tokenoperacaos).toBe(1);
    expect(porColecao.tokenconfirmacaocadastros).toBe(1);
    expect(porColecao.consentimentocookies).toBe(0);
    expect(registros[0].origem).toBe('scheduler');
  });

  it('resposta inclui o resumo das eliminações', async () => {
    const res = await request(app)
      .post('/api/v1/admin/purga')
      .set('X-Purge-Token', 'segredo-de-teste');
    expect(res.body.ok).toBe(true);
    expect(res.body.eliminacoes).toHaveLength(3);
  });
});
