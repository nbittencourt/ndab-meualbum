import './../setup/env.js';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { startMongo, stopMongo, clearCollections } from '../setup/mongo.js';
import { criarUsuarioAutenticado } from '../setup/auth.js';
import { seedCatalogoMinimo } from '../setup/seed.js';
import { createApp } from '../../app.js';
import { PilhaDaSessao } from '../../models/PilhaDaSessao.js';
import { EstoqueFigurinha } from '../../models/EstoqueFigurinha.js';
import { FigurinhaColada } from '../../models/FigurinhaColada.js';
import { Album } from '../../models/Album.js';

let app: Express;
let seed: Awaited<ReturnType<typeof seedCatalogoMinimo>>;

describe('Rotas da pilha (Abrir Pacotinhos)', () => {
  beforeAll(async () => {
    await startMongo();
    app = createApp();
  });

  afterAll(async () => {
    await stopMongo();
  });

  beforeEach(async () => {
    await clearCollections();
    seed = await seedCatalogoMinimo();
  });

  it('exige autenticação (401 sem cookie)', async () => {
    const res = await request(app).get('/api/v1/pilha');
    expect(res.status).toBe(401);
  });

  it('POST /pilha adiciona figurinha do catálogo como PENDENTE', async () => {
    const { cookie } = await criarUsuarioAutenticado();
    const res = await request(app)
      .post('/api/v1/pilha')
      .set('Cookie', cookie)
      .send({ tipoAlbumId: String(seed.tipo._id), figurinhaNumero: 'fwc1', origem: 'DIGITACAO' });
    expect(res.status).toBe(201);
    expect(res.body.item.figurinhaNumero).toBe('FWC1');
    expect(res.body.item.statusDestino).toBe('PENDENTE');
  });

  it('POST /pilha responde 404 para número fora do catálogo (RN-AP04)', async () => {
    const { cookie } = await criarUsuarioAutenticado();
    const res = await request(app)
      .post('/api/v1/pilha')
      .set('Cookie', cookie)
      .send({ tipoAlbumId: String(seed.tipo._id), figurinhaNumero: 'NAOEXISTE', origem: 'DIGITACAO' });
    expect(res.status).toBe(404);
  });

  it('POST /pilha respeita o limite de 100 itens PENDENTES (RN-AP28)', async () => {
    const { user, cookie } = await criarUsuarioAutenticado();
    await PilhaDaSessao.insertMany(
      Array.from({ length: 100 }, () => ({
        usuarioId: user._id,
        tipoAlbumId: seed.tipo._id,
        figurinhaId: seed.stickers[0]._id,
        figurinhaNumero: 'FWC1',
        figurinhaNome: 'Figurinha 1',
        origem: 'DIGITACAO',
        statusDestino: 'PENDENTE',
      }))
    );
    const res = await request(app)
      .post('/api/v1/pilha')
      .set('Cookie', cookie)
      .send({ tipoAlbumId: String(seed.tipo._id), figurinhaNumero: 'FWC2', origem: 'DIGITACAO' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('LIMITE_PILHA');
  });

  it('POST /pilha/colar cola no álbum e marca o item como COLADA', async () => {
    const { user, cookie } = await criarUsuarioAutenticado();
    const album = await Album.create({ usuarioId: user._id, tipoAlbumId: seed.tipo._id, variante: 'BROCHURA' });
    const item = await PilhaDaSessao.create({
      usuarioId: user._id,
      tipoAlbumId: seed.tipo._id,
      figurinhaId: seed.stickers[0]._id,
      figurinhaNumero: 'FWC1',
      origem: 'DIGITACAO',
      statusDestino: 'PENDENTE',
    });
    const res = await request(app)
      .post('/api/v1/pilha/colar')
      .set('Cookie', cookie)
      .send({ itemId: String(item._id), albumId: String(album._id) });
    expect(res.status).toBe(200);
    expect(await FigurinhaColada.countDocuments({ albumId: album._id, figurinhaId: seed.stickers[0]._id })).toBe(1);
    const atualizado = await PilhaDaSessao.findById(item._id).lean();
    expect(atualizado?.statusDestino).toBe('COLADA');
  });

  it('POST /pilha/colar não permite colar em álbum de outro usuário (404)', async () => {
    const { cookie, user } = await criarUsuarioAutenticado();
    const outro = await criarUsuarioAutenticado();
    const albumDoOutro = await Album.create({ usuarioId: outro.user._id, tipoAlbumId: seed.tipo._id, variante: 'BROCHURA' });
    const item = await PilhaDaSessao.create({
      usuarioId: user._id,
      tipoAlbumId: seed.tipo._id,
      figurinhaId: seed.stickers[0]._id,
      figurinhaNumero: 'FWC1',
      origem: 'DIGITACAO',
      statusDestino: 'PENDENTE',
    });
    const res = await request(app)
      .post('/api/v1/pilha/colar')
      .set('Cookie', cookie)
      .send({ itemId: String(item._id), albumId: String(albumDoOutro._id) });
    expect(res.status).toBe(404);
  });

  it('POST /pilha/repetida incrementa o estoque e marca o item como REPETIDA', async () => {
    const { user, cookie } = await criarUsuarioAutenticado();
    const item = await PilhaDaSessao.create({
      usuarioId: user._id,
      tipoAlbumId: seed.tipo._id,
      figurinhaId: seed.stickers[2]._id,
      figurinhaNumero: 'FWC3',
      origem: 'DIGITACAO',
      statusDestino: 'PENDENTE',
    });
    const res = await request(app)
      .post('/api/v1/pilha/repetida')
      .set('Cookie', cookie)
      .send({ itemId: String(item._id) });
    expect(res.status).toBe(200);
    const estoque = await EstoqueFigurinha.findOne({ usuarioId: user._id, figurinhaId: seed.stickers[2]._id }).lean();
    expect(estoque?.quantidade).toBe(1);
    expect((await PilhaDaSessao.findById(item._id).lean())?.statusDestino).toBe('REPETIDA');
  });

  it('DELETE /pilha remove itens de todos os status — descarte encerra a sessão (RN-AP17b)', async () => {
    const { user, cookie } = await criarUsuarioAutenticado();
    await PilhaDaSessao.insertMany(
      (['PENDENTE', 'COLADA', 'REPETIDA'] as const).map((statusDestino, i) => ({
        usuarioId: user._id,
        tipoAlbumId: seed.tipo._id,
        figurinhaId: seed.stickers[i]._id,
        figurinhaNumero: `FWC${i + 1}`,
        origem: 'DIGITACAO',
        statusDestino,
      }))
    );
    const res = await request(app).delete('/api/v1/pilha').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(await PilhaDaSessao.countDocuments({ usuarioId: user._id })).toBe(0);
  });

  it('DELETE /pilha/:itemId remove apenas o item PENDENTE indicado', async () => {
    const { user, cookie } = await criarUsuarioAutenticado();
    const [a, b] = await PilhaDaSessao.create([
      {
        usuarioId: user._id,
        tipoAlbumId: seed.tipo._id,
        figurinhaId: seed.stickers[0]._id,
        figurinhaNumero: 'FWC1',
        origem: 'DIGITACAO',
        statusDestino: 'PENDENTE',
      },
      {
        usuarioId: user._id,
        tipoAlbumId: seed.tipo._id,
        figurinhaId: seed.stickers[1]._id,
        figurinhaNumero: 'FWC2',
        origem: 'DIGITACAO',
        statusDestino: 'PENDENTE',
      },
    ]);
    const res = await request(app).delete(`/api/v1/pilha/${a._id}`).set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(await PilhaDaSessao.countDocuments({ usuarioId: user._id })).toBe(1);
    expect(await PilhaDaSessao.findById(b._id)).not.toBeNull();
  });
});
