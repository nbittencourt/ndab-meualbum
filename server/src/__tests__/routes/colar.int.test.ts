import './../setup/env.js';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { startMongo, stopMongo, clearCollections } from '../setup/mongo.js';
import { criarUsuarioAutenticado } from '../setup/auth.js';
import { seedCatalogoMinimo } from '../setup/seed.js';
import { createApp } from '../../app.js';
import { EstoqueFigurinha } from '../../models/EstoqueFigurinha.js';
import { FigurinhaColada } from '../../models/FigurinhaColada.js';
import { Album } from '../../models/Album.js';

let app: Express;
let seed: Awaited<ReturnType<typeof seedCatalogoMinimo>>;

describe('Rotas de Colar Figurinhas (estoque)', () => {
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

  it('GET /estoque retorna itens com elegibilidade PODE_COLAR/JA_COLADA', async () => {
    const { user, cookie } = await criarUsuarioAutenticado();
    const album = await Album.create({ usuarioId: user._id, tipoAlbumId: seed.tipo._id, variante: 'BROCHURA' });
    await EstoqueFigurinha.create([
      { usuarioId: user._id, figurinhaId: seed.stickers[0]._id, quantidade: 2 },
      { usuarioId: user._id, figurinhaId: seed.stickers[1]._id, quantidade: 1 },
    ]);
    await FigurinhaColada.create({ albumId: album._id, figurinhaId: seed.stickers[0]._id, origem: 'DIRETA' });

    const res = await request(app)
      .get(`/api/v1/estoque?albumId=${album._id}`)
      .set('Cookie', cookie);
    expect(res.status).toBe(200);
    const porNumero = Object.fromEntries(res.body.itens.map((i: any) => [i.figurinha.number, i.elegibilidade]));
    expect(porNumero.FWC1).toBe('JA_COLADA');
    expect(porNumero.FWC2).toBe('PODE_COLAR');
  });

  it('GET /estoque filtra por busca (número ou nome)', async () => {
    const { user, cookie } = await criarUsuarioAutenticado();
    await EstoqueFigurinha.create([
      { usuarioId: user._id, figurinhaId: seed.stickers[0]._id, quantidade: 1 },
      { usuarioId: user._id, figurinhaId: seed.stickers[1]._id, quantidade: 1 },
    ]);
    const res = await request(app).get('/api/v1/estoque?busca=fwc2').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.itens).toHaveLength(1);
    expect(res.body.itens[0].figurinha.number).toBe('FWC2');
  });

  it('GET /estoque não vaza estoque de outro usuário', async () => {
    const { cookie } = await criarUsuarioAutenticado();
    const outro = await criarUsuarioAutenticado();
    await EstoqueFigurinha.create({ usuarioId: outro.user._id, figurinhaId: seed.stickers[0]._id, quantidade: 5 });
    const res = await request(app).get('/api/v1/estoque').set('Cookie', cookie);
    expect(res.body.itens).toHaveLength(0);
  });

  describe('GET /estoque — paginação opt-in (B4)', () => {
    it('sem ?pagina retorna shape {itens} completo', async () => {
      const { user, cookie } = await criarUsuarioAutenticado();
      await EstoqueFigurinha.create(
        seed.stickers.slice(0, 7).map((s) => ({ usuarioId: user._id, figurinhaId: s._id, quantidade: 1 }))
      );
      const res = await request(app).get('/api/v1/estoque').set('Cookie', cookie);
      expect(Object.keys(res.body)).toEqual(['itens']);
      expect(res.body.itens).toHaveLength(7);
    });

    it('com ?pagina pagina após o filtro de busca', async () => {
      const { user, cookie } = await criarUsuarioAutenticado();
      await EstoqueFigurinha.create(
        [...seed.stickers.slice(0, 7), seed.stickers[9]].map((s) => ({
          usuarioId: user._id,
          figurinhaId: s._id,
          quantidade: 1,
        }))
      );
      const res = await request(app).get('/api/v1/estoque?pagina=2&limite=3').set('Cookie', cookie);
      expect(res.body.itens).toHaveLength(3);
      expect(res.body).toMatchObject({ pagina: 2, limite: 3, total: 8, totalPaginas: 3 });

      const comBusca = await request(app)
        .get('/api/v1/estoque?busca=FWC1&pagina=1&limite=5')
        .set('Cookie', cookie);
      // FWC1 e FWC10 casam com a busca "FWC1"
      expect(comBusca.body.total).toBe(2);
    });
  });

  it('POST /colar debita o estoque e registra FigurinhaColada com origem ESTOQUE', async () => {
    const { user, cookie } = await criarUsuarioAutenticado();
    const album = await Album.create({ usuarioId: user._id, tipoAlbumId: seed.tipo._id, variante: 'BROCHURA' });
    const estoque = await EstoqueFigurinha.create({ usuarioId: user._id, figurinhaId: seed.stickers[0]._id, quantidade: 2 });

    const res = await request(app)
      .post('/api/v1/colar')
      .set('Cookie', cookie)
      .send({ albumId: String(album._id), estoqueId: String(estoque._id) });
    expect(res.status).toBe(200);
    expect((await EstoqueFigurinha.findById(estoque._id).lean())?.quantidade).toBe(1);
    const colada = await FigurinhaColada.findOne({ albumId: album._id, figurinhaId: seed.stickers[0]._id }).lean();
    expect(colada?.origem).toBe('ESTOQUE');
  });

  it('POST /colar com estoque zerado responde 404 e não cola', async () => {
    const { user, cookie } = await criarUsuarioAutenticado();
    const album = await Album.create({ usuarioId: user._id, tipoAlbumId: seed.tipo._id, variante: 'BROCHURA' });
    const estoque = await EstoqueFigurinha.create({ usuarioId: user._id, figurinhaId: seed.stickers[0]._id, quantidade: 0 });
    const res = await request(app)
      .post('/api/v1/colar')
      .set('Cookie', cookie)
      .send({ albumId: String(album._id), estoqueId: String(estoque._id) });
    expect(res.status).toBe(404);
    expect(await FigurinhaColada.countDocuments({ albumId: album._id })).toBe(0);
  });

  it('POST /colar em álbum arquivado responde 404 (RN-AP27)', async () => {
    const { user, cookie } = await criarUsuarioAutenticado();
    const album = await Album.create({
      usuarioId: user._id,
      tipoAlbumId: seed.tipo._id,
      variante: 'BROCHURA',
      arquivadoEm: new Date(),
    });
    const estoque = await EstoqueFigurinha.create({ usuarioId: user._id, figurinhaId: seed.stickers[0]._id, quantidade: 1 });
    const res = await request(app)
      .post('/api/v1/colar')
      .set('Cookie', cookie)
      .send({ albumId: String(album._id), estoqueId: String(estoque._id) });
    expect(res.status).toBe(404);
  });

  it('POST /colar/direta é idempotente por par (album, figurinha) — RN-CF00', async () => {
    const { user, cookie } = await criarUsuarioAutenticado();
    const album = await Album.create({ usuarioId: user._id, tipoAlbumId: seed.tipo._id, variante: 'BROCHURA' });
    for (let i = 0; i < 2; i++) {
      const res = await request(app)
        .post('/api/v1/colar/direta')
        .set('Cookie', cookie)
        .send({ albumId: String(album._id), figurinhaNumero: 'FWC4' });
      expect(res.status).toBe(200);
    }
    expect(await FigurinhaColada.countDocuments({ albumId: album._id, figurinhaId: seed.stickers[3]._id })).toBe(1);
  });

  it('POST /colar/direta responde 404 para número fora do catálogo (MFN)', async () => {
    const { user, cookie } = await criarUsuarioAutenticado();
    const album = await Album.create({ usuarioId: user._id, tipoAlbumId: seed.tipo._id, variante: 'BROCHURA' });
    const res = await request(app)
      .post('/api/v1/colar/direta')
      .set('Cookie', cookie)
      .send({ albumId: String(album._id), figurinhaNumero: 'ZZZ999' });
    expect(res.status).toBe(404);
  });

  describe('POST /estoque/descartar — #25', () => {
    it('decrementa a quantidade do item de estoque', async () => {
      const { user, cookie } = await criarUsuarioAutenticado();
      const est = await EstoqueFigurinha.create({ usuarioId: user._id, figurinhaId: seed.stickers[0]._id, quantidade: 3 });

      const res = await request(app)
        .post('/api/v1/estoque/descartar')
        .set('Cookie', cookie)
        .send({ estoqueId: String(est._id) });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect((await EstoqueFigurinha.findById(est._id).lean())?.quantidade).toBe(2);
    });

    it('remove o documento quando quantidade chega a zero', async () => {
      const { user, cookie } = await criarUsuarioAutenticado();
      const est = await EstoqueFigurinha.create({ usuarioId: user._id, figurinhaId: seed.stickers[0]._id, quantidade: 1 });

      await request(app)
        .post('/api/v1/estoque/descartar')
        .set('Cookie', cookie)
        .send({ estoqueId: String(est._id) })
        .expect(200);
      expect(await EstoqueFigurinha.findById(est._id)).toBeNull();
    });

    it('rejeita estoqueId de outro usuário com 404', async () => {
      const { cookie } = await criarUsuarioAutenticado();
      const outro = await criarUsuarioAutenticado();
      const est = await EstoqueFigurinha.create({ usuarioId: outro.user._id, figurinhaId: seed.stickers[0]._id, quantidade: 2 });

      const res = await request(app)
        .post('/api/v1/estoque/descartar')
        .set('Cookie', cookie)
        .send({ estoqueId: String(est._id) });
      expect(res.status).toBe(404);
    });
  });
});
