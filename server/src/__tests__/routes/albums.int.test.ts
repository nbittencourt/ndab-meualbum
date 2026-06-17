import './../setup/env.js';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { startMongo, stopMongo, clearCollections } from '../setup/mongo.js';
import { criarUsuarioAutenticado } from '../setup/auth.js';
import { seedCatalogoMinimo } from '../setup/seed.js';
import { createApp } from '../../app.js';
import { Album } from '../../models/Album.js';
import { FigurinhaColada } from '../../models/FigurinhaColada.js';
import { EstoqueFigurinha } from '../../models/EstoqueFigurinha.js';

let app: Express;
let seed: Awaited<ReturnType<typeof seedCatalogoMinimo>>;

describe('Rotas de Álbuns', () => {
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

  it('POST / cria álbum e sanitiza HTML do nome personalizado (RN-CA06)', async () => {
    const { cookie } = await criarUsuarioAutenticado();
    const res = await request(app)
      .post('/api/v1/albums')
      .set('Cookie', cookie)
      .send({
        tipoAlbumId: String(seed.tipo._id),
        variante: 'BOX_PREMIUM',
        nomePersonalizado: '<script>alert(1)</script>Meu Álbum',
      });
    expect(res.status).toBe(201);
    expect(res.body.album.variante).toBe('BOX_PREMIUM');
    expect(res.body.album.nomePersonalizado).toBe('alert(1)Meu Álbum');
    expect(res.body.album.percentualConclusao).toBe(0);
  });

  it('POST / rejeita variante inválida (400)', async () => {
    const { cookie } = await criarUsuarioAutenticado();
    const res = await request(app)
      .post('/api/v1/albums')
      .set('Cookie', cookie)
      .send({ tipoAlbumId: String(seed.tipo._id), variante: 'INEXISTENTE' });
    expect(res.status).toBe(400);
  });

  it('GET / retorna shape {ativos, arquivados} com percentual exato', async () => {
    const { user, cookie } = await criarUsuarioAutenticado();
    const ativo = await Album.create({ usuarioId: user._id, tipoAlbumId: seed.tipo._id, variante: 'BROCHURA' });
    await Album.create({
      usuarioId: user._id,
      tipoAlbumId: seed.tipo._id,
      variante: 'CAPA_DURA',
      arquivadoEm: new Date(),
    });
    // 3 de 10 figurinhas coladas → 30%
    await FigurinhaColada.create(
      seed.stickers.slice(0, 3).map((s) => ({ albumId: ativo._id, figurinhaId: s._id, origem: 'DIRETA' }))
    );

    const res = await request(app).get('/api/v1/albums').set('Cookie', cookie);
    expect(res.status).toBe(200);
    // Shape protegido: chaves exatas da resposta (rede de proteção para B1/B4)
    expect(Object.keys(res.body).sort()).toEqual(['arquivados', 'ativos']);
    expect(res.body.ativos).toHaveLength(1);
    expect(res.body.arquivados).toHaveLength(1);
    expect(res.body.ativos[0].percentualConclusao).toBe(30);
    expect(res.body.arquivados[0].percentualConclusao).toBe(0);
  });

  it('GET / com 0 coladas e álbum sem figurinhas não divide por zero', async () => {
    const { user, cookie } = await criarUsuarioAutenticado();
    await Album.create({ usuarioId: user._id, tipoAlbumId: seed.tipo._id, variante: 'BROCHURA' });
    const res = await request(app).get('/api/v1/albums').set('Cookie', cookie);
    expect(res.body.ativos[0].percentualConclusao).toBe(0);
  });

  it('GET /:id retorna progresso por seção com arredondamento de 1 casa', async () => {
    const { user, cookie } = await criarUsuarioAutenticado();
    const album = await Album.create({ usuarioId: user._id, tipoAlbumId: seed.tipo._id, variante: 'BROCHURA' });
    // 1 de 10 → 10%; seção A (FWC1..5) com 1 colada
    await FigurinhaColada.create({ albumId: album._id, figurinhaId: seed.stickers[0]._id, origem: 'DIRETA' });

    const res = await request(app).get(`/api/v1/albums/${album._id}`).set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.album.percentualConclusao).toBe(10);
    const secaoA = res.body.secoes.find((s: any) => s.nome === 'Página Inicial');
    expect(secaoA.figurinhasColadas).toBe(1);
  });

  it('GET /:id de álbum de outro usuário responde 404 (isolamento)', async () => {
    const { cookie } = await criarUsuarioAutenticado();
    const outro = await criarUsuarioAutenticado();
    const albumDoOutro = await Album.create({
      usuarioId: outro.user._id,
      tipoAlbumId: seed.tipo._id,
      variante: 'BROCHURA',
    });
    const res = await request(app).get(`/api/v1/albums/${albumDoOutro._id}`).set('Cookie', cookie);
    expect(res.status).toBe(404);
  });

  it('PATCH /:id/arquivar e /:id/desarquivar alternam arquivadoEm', async () => {
    const { user, cookie } = await criarUsuarioAutenticado();
    const album = await Album.create({ usuarioId: user._id, tipoAlbumId: seed.tipo._id, variante: 'BROCHURA' });

    const arq = await request(app).patch(`/api/v1/albums/${album._id}/arquivar`).set('Cookie', cookie);
    expect(arq.status).toBe(200);
    expect((await Album.findById(album._id).lean())?.arquivadoEm).not.toBeNull();

    const des = await request(app).patch(`/api/v1/albums/${album._id}/desarquivar`).set('Cookie', cookie);
    expect(des.status).toBe(200);
    expect((await Album.findById(album._id).lean())?.arquivadoEm).toBeNull();
  });

  describe('Paginação opt-in (B4)', () => {
    it('sem query params mantém o shape completo {ativos, arquivados}', async () => {
      const { user, cookie } = await criarUsuarioAutenticado();
      for (let i = 0; i < 3; i++) {
        await Album.create({ usuarioId: user._id, tipoAlbumId: seed.tipo._id, variante: 'BROCHURA' });
      }
      const res = await request(app).get('/api/v1/albums').set('Cookie', cookie);
      expect(Object.keys(res.body).sort()).toEqual(['arquivados', 'ativos']);
      expect(res.body.ativos).toHaveLength(3);
    });

    it('com ?pagina aplica limite e inclui a chave aditiva paginacao', async () => {
      const { user, cookie } = await criarUsuarioAutenticado();
      for (let i = 0; i < 5; i++) {
        await Album.create({ usuarioId: user._id, tipoAlbumId: seed.tipo._id, variante: 'BROCHURA' });
      }
      const res = await request(app).get('/api/v1/albums?pagina=1&limite=2').set('Cookie', cookie);
      expect(res.body.ativos).toHaveLength(2);
      expect(res.body.paginacao).toMatchObject({
        pagina: 1,
        limite: 2,
        totalAtivos: 5,
        totalPaginasAtivos: 3,
      });
    });

    it('página além do fim retorna lista vazia', async () => {
      const { user, cookie } = await criarUsuarioAutenticado();
      await Album.create({ usuarioId: user._id, tipoAlbumId: seed.tipo._id, variante: 'BROCHURA' });
      const res = await request(app).get('/api/v1/albums?pagina=99').set('Cookie', cookie);
      expect(res.body.ativos).toHaveLength(0);
    });

    it('limite acima do teto é rebaixado para 50', async () => {
      const { cookie } = await criarUsuarioAutenticado();
      const res = await request(app).get('/api/v1/albums?pagina=1&limite=9999').set('Cookie', cookie);
      expect(res.body.paginacao.limite).toBe(50);
    });
  });

  it('GET /:id/faltantes lista apenas figurinhas não coladas', async () => {
    const { user, cookie } = await criarUsuarioAutenticado();
    const album = await Album.create({ usuarioId: user._id, tipoAlbumId: seed.tipo._id, variante: 'BROCHURA' });
    await FigurinhaColada.create(
      seed.stickers.slice(0, 4).map((s) => ({ albumId: album._id, figurinhaId: s._id, origem: 'DIRETA' }))
    );
    const res = await request(app).get(`/api/v1/albums/${album._id}/faltantes`).set('Cookie', cookie);
    expect(res.status).toBe(200);
    const numeros = JSON.stringify(res.body);
    expect(numeros).not.toContain('FWC1"');
    expect(numeros).toContain('FWC5');
    expect(numeros).toContain('FWC10');
  });

  describe('DELETE /:id/colada/:numero — colagem rápida (remoção) #24', () => {
    it('remove a FigurinhaColada e responde 200', async () => {
      const { user, cookie } = await criarUsuarioAutenticado();
      const album = await Album.create({ usuarioId: user._id, tipoAlbumId: seed.tipo._id, variante: 'BROCHURA' });
      const sticker = seed.stickers[0];
      await FigurinhaColada.create({ albumId: album._id, figurinhaId: sticker._id, origem: 'DIRETA' });

      const res = await request(app)
        .delete(`/api/v1/albums/${album._id}/colada/${sticker.number}`)
        .set('Cookie', cookie);
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(await FigurinhaColada.findOne({ albumId: album._id, figurinhaId: sticker._id })).toBeNull();
    });

    it('responde 404 quando a colagem não existe', async () => {
      const { user, cookie } = await criarUsuarioAutenticado();
      const album = await Album.create({ usuarioId: user._id, tipoAlbumId: seed.tipo._id, variante: 'BROCHURA' });

      const res = await request(app)
        .delete(`/api/v1/albums/${album._id}/colada/${seed.stickers[0].number}`)
        .set('Cookie', cookie);
      expect(res.status).toBe(404);
    });

    it('não restaura o estoque ao remover a colada (decisão #3)', async () => {
      const { user, cookie } = await criarUsuarioAutenticado();
      const album = await Album.create({ usuarioId: user._id, tipoAlbumId: seed.tipo._id, variante: 'BROCHURA' });
      const sticker = seed.stickers[0];
      const est = await EstoqueFigurinha.create({ usuarioId: user._id, figurinhaId: sticker._id, quantidade: 1 });
      await FigurinhaColada.create({ albumId: album._id, figurinhaId: sticker._id, origem: 'DIRETA' });

      await request(app)
        .delete(`/api/v1/albums/${album._id}/colada/${sticker.number}`)
        .set('Cookie', cookie)
        .expect(200);

      const estoqueDepois = await EstoqueFigurinha.findById(est._id).lean();
      expect(estoqueDepois?.quantidade).toBe(1);
    });
  });
});
