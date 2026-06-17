import './../setup/env.js';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { startMongo, stopMongo, clearCollections } from '../setup/mongo.js';
import { criarUsuarioAutenticado } from '../setup/auth.js';
import { seedCatalogoMinimo } from '../setup/seed.js';
import { createApp } from '../../app.js';
import { User } from '../../models/User.js';
import { Album } from '../../models/Album.js';
import { FigurinhaColada } from '../../models/FigurinhaColada.js';
import { EstoqueFigurinha } from '../../models/EstoqueFigurinha.js';
import { PilhaDaSessao } from '../../models/PilhaDaSessao.js';

let app: Express;
let seed: Awaited<ReturnType<typeof seedCatalogoMinimo>>;

async function popularConta(user: { _id: unknown }) {
  const album = await Album.create({ usuarioId: user._id, tipoAlbumId: seed.tipo._id, variante: 'CAPA_DURA' });
  await FigurinhaColada.create({ albumId: album._id, figurinhaId: seed.stickers[0]._id, origem: 'DIRETA' });
  await EstoqueFigurinha.create({ usuarioId: user._id, figurinhaId: seed.stickers[1]._id, quantidade: 3 });
  await PilhaDaSessao.create({
    usuarioId: user._id,
    tipoAlbumId: seed.tipo._id,
    figurinhaId: seed.stickers[2]._id,
    figurinhaNumero: 'FWC3',
    origem: 'DIGITACAO',
    statusDestino: 'PENDENTE',
  });
  return album;
}

describe('Rotas de Perfil — exportação e exclusão (LGPD)', () => {
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

  describe('GET /exportar (Art. 18 — portabilidade)', () => {
    it('exige autenticação (401 sem cookie)', async () => {
      const res = await request(app).get('/api/v1/profile/exportar');
      expect(res.status).toBe(401);
    });

    it('conta vazia gera ZIP válido com headers corretos', async () => {
      const { cookie } = await criarUsuarioAutenticado();
      const res = await request(app)
        .get('/api/v1/profile/exportar')
        .set('Cookie', cookie)
        .buffer(true)
        .parse((res, cb) => {
          const chunks: Buffer[] = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => cb(null, Buffer.concat(chunks)));
        });
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/zip');
      expect(res.headers['content-disposition']).toContain('meus-dados.zip');
      // Assinatura ZIP (PK\x03\x04)
      expect((res.body as Buffer).subarray(0, 2).toString()).toBe('PK');
    });

    it('conta com dados inclui todas as categorias no ZIP', async () => {
      const { user, cookie } = await criarUsuarioAutenticado();
      await popularConta(user);
      const res = await request(app)
        .get('/api/v1/profile/exportar')
        .set('Cookie', cookie)
        .buffer(true)
        .parse((res, cb) => {
          const chunks: Buffer[] = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => cb(null, Buffer.concat(chunks)));
        });
      expect(res.status).toBe(200);
      const conteudo = (res.body as Buffer).toString('latin1');
      for (const arquivo of [
        'usuario.csv',
        'albums.csv',
        'figurinhas_coladas.csv',
        'estoque_figurinhas.csv',
        'pilha_sessao.csv',
        'README.txt',
      ]) {
        expect(conteudo).toContain(arquivo);
      }
    });
  });

  describe('DELETE / (Art. 18 — eliminação, RN-P24..P28)', () => {
    it('identificador incorreto responde 400 e não exclui nada', async () => {
      const { user, cookie } = await criarUsuarioAutenticado();
      await popularConta(user);
      const res = await request(app)
        .delete('/api/v1/profile')
        .set('Cookie', cookie)
        .send({ identificador: 'XXXXXX' });
      expect(res.status).toBe(400);
      expect(await User.countDocuments({ _id: user._id })).toBe(1);
      expect(await Album.countDocuments({ usuarioId: user._id })).toBe(1);
    });

    it('exclusão purga usuário, álbuns, coladas, estoque e pilha (RN-P26)', async () => {
      const { user, cookie } = await criarUsuarioAutenticado();
      const album = await popularConta(user);
      const res = await request(app)
        .delete('/api/v1/profile')
        .set('Cookie', cookie)
        .send({ identificador: (user as any).publicId });
      expect(res.status).toBe(200);
      expect(await User.countDocuments({ _id: user._id })).toBe(0);
      expect(await Album.countDocuments({ usuarioId: user._id })).toBe(0);
      expect(await FigurinhaColada.countDocuments({ albumId: album._id })).toBe(0);
      expect(await EstoqueFigurinha.countDocuments({ usuarioId: user._id })).toBe(0);
      expect(await PilhaDaSessao.countDocuments({ usuarioId: user._id })).toBe(0);
    });

    it('exclusão limpa o cookie de sessão e o JWT antigo deixa de valer (401)', async () => {
      const { user, cookie } = await criarUsuarioAutenticado();
      const res = await request(app)
        .delete('/api/v1/profile')
        .set('Cookie', cookie)
        .send({ identificador: (user as any).publicId });
      expect(res.status).toBe(200);
      const setCookie = res.headers['set-cookie']?.[0] ?? '';
      expect(setCookie).toContain('__session=;');

      const depois = await request(app).get('/api/v1/home').set('Cookie', cookie);
      expect(depois.status).toBe(401);
    });

    it('identificador aceita minúsculas (normalizado para maiúsculas — RN-P43)', async () => {
      const { user, cookie } = await criarUsuarioAutenticado();
      const res = await request(app)
        .delete('/api/v1/profile')
        .set('Cookie', cookie)
        .send({ identificador: ((user as any).publicId as string).toLowerCase() });
      expect(res.status).toBe(200);
      expect(await User.countDocuments({ _id: user._id })).toBe(0);
    });

    it('não exclui dados de outro usuário', async () => {
      const { user, cookie } = await criarUsuarioAutenticado();
      const outro = await criarUsuarioAutenticado();
      await popularConta(outro.user);
      const res = await request(app)
        .delete('/api/v1/profile')
        .set('Cookie', cookie)
        .send({ identificador: (user as any).publicId });
      expect(res.status).toBe(200);
      expect(await User.countDocuments({ _id: outro.user._id })).toBe(1);
      expect(await Album.countDocuments({ usuarioId: outro.user._id })).toBe(1);
      expect(await EstoqueFigurinha.countDocuments({ usuarioId: outro.user._id })).toBe(1);
    });
  });
});
