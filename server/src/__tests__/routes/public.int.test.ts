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

describe('Rota pública GET /public/faltantes/:token — #39', () => {
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

  it('token inválido responde 404', async () => {
    const res = await request(app).get('/api/v1/public/faltantes/token-inexistente');
    expect(res.status).toBe(404);
  });

  it('figurinha faltante (sem colagem, sem estoque) retorna colada=false, quantidade=0', async () => {
    const { user } = await criarUsuarioAutenticado();
    const token = 'tok-faltante';
    await Album.create({ usuarioId: user._id, tipoAlbumId: seed.tipo._id, variante: 'BROCHURA', shareToken: token });

    const res = await request(app).get(`/api/v1/public/faltantes/${token}`);
    expect(res.status).toBe(200);
    const fig = res.body.secoes[0].figurinhas.find((f: any) => f.numero === 'FWC1');
    expect(fig).toMatchObject({ colada: false, quantidade: 0 });
  });

  it('figurinha colada sem repetidas retorna colada=true, quantidade=0', async () => {
    const { user } = await criarUsuarioAutenticado();
    const token = 'tok-colada';
    const album = await Album.create({ usuarioId: user._id, tipoAlbumId: seed.tipo._id, variante: 'BROCHURA', shareToken: token });
    await FigurinhaColada.create({ albumId: album._id, figurinhaId: seed.stickers[0]._id, origem: 'DIRETA' });

    const res = await request(app).get(`/api/v1/public/faltantes/${token}`);
    expect(res.status).toBe(200);
    const fig = res.body.secoes[0].figurinhas.find((f: any) => f.numero === 'FWC1');
    expect(fig).toMatchObject({ colada: true, quantidade: 0 });
  });

  it('figurinha colada com 2 repetidas no estoque retorna colada=true, quantidade=2 — Bug2', async () => {
    const { user } = await criarUsuarioAutenticado();
    const token = 'tok-repetida';
    const album = await Album.create({ usuarioId: user._id, tipoAlbumId: seed.tipo._id, variante: 'BROCHURA', shareToken: token });
    await FigurinhaColada.create({ albumId: album._id, figurinhaId: seed.stickers[0]._id, origem: 'DIRETA' });
    await EstoqueFigurinha.create({ usuarioId: user._id, figurinhaId: seed.stickers[0]._id, quantidade: 2 });

    const res = await request(app).get(`/api/v1/public/faltantes/${token}`);
    expect(res.status).toBe(200);
    const fig = res.body.secoes[0].figurinhas.find((f: any) => f.numero === 'FWC1');
    // Deve expor quantidade para que o cliente calcule statusFigurinha() corretamente
    expect(fig).toMatchObject({ colada: true, quantidade: 2 });
  });

  it('percentual conta figurinhas coladas-com-repetidas — #47', async () => {
    // 3 coladas (FWC1, FWC2, FWC3); FWC1 também tem repetidas no estoque
    // Esperado: percentual = 3/10 = 30.0, não 2/10=20 (excluindo a colada-com-repetida)
    const { user } = await criarUsuarioAutenticado();
    const token = 'tok-pct-47';
    const album = await Album.create({ usuarioId: user._id, tipoAlbumId: seed.tipo._id, variante: 'BROCHURA', shareToken: token });
    await FigurinhaColada.create([
      { albumId: album._id, figurinhaId: seed.stickers[0]._id, origem: 'DIRETA' },
      { albumId: album._id, figurinhaId: seed.stickers[1]._id, origem: 'DIRETA' },
      { albumId: album._id, figurinhaId: seed.stickers[2]._id, origem: 'DIRETA' },
    ]);
    // FWC1 colada + 2 no estoque (= repetida)
    await EstoqueFigurinha.create({ usuarioId: user._id, figurinhaId: seed.stickers[0]._id, quantidade: 2 });

    const res = await request(app).get(`/api/v1/public/faltantes/${token}`);
    expect(res.status).toBe(200);
    // Todas as 3 coladas devem contar no percentual, inclusive a colada-com-repetida
    expect(res.body.percentual).toBe(30.0);
  });
});
