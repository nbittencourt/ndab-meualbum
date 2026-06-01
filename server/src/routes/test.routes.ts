import { Router } from 'express';
import mongoose, { Types } from 'mongoose';
import { readFileSync } from 'fs';
import { join } from 'path';
import { User } from '../models/User.js';
import { TokenConfirmacaoCadastro } from '../models/TokenConfirmacaoCadastro.js';
import { TokenOperacao } from '../models/TokenOperacao.js';
import { EstoqueFigurinha } from '../models/EstoqueFigurinha.js';
import { PilhaDaSessao } from '../models/PilhaDaSessao.js';
import { Sticker } from '../models/Sticker.js';
import { TipoAlbum } from '../models/TipoAlbum.js';
import { Secao } from '../models/Secao.js';
import { Album } from '../models/Album.js';
import { randomUUID } from 'crypto';

const router = Router();

const guard = (_req: any, res: any, next: any) => {
  if (process.env.NODE_ENV !== 'test') return res.status(403).json({ error: 'Forbidden' });
  next();
};
router.use(guard);

router.post('/reset-db', async (_req, res) => {
  const db = mongoose.connection.db!;
  const cols = await db.listCollections().toArray();
  await Promise.all(cols.map((c) => db.collection(c.name).deleteMany({})));
  res.json({ ok: true });
});

router.get('/usuario-info', async (req, res) => {
  const user = await User.findOne({ email: req.query.email as string }).lean();
  if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }
  res.json({ identificador: (user as any).publicId, status: (user as any).status });
});

router.post('/confirmar-email', async (req, res) => {
  const { identificador } = req.body;
  const user = await User.findOne({ publicId: identificador });
  if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }
  const token = await TokenConfirmacaoCadastro.findOne({ usuarioId: user._id, usadoEm: null });
  if (token) { token.usadoEm = new Date(); await token.save(); }
  (user as any).status = 'ATIVO';
  await user.save();
  res.json({ ok: true });
});

router.get('/token-confirmacao/:identificador', async (req, res) => {
  const user = await User.findOne({ publicId: req.params.identificador }).lean();
  if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }
  const token = await TokenConfirmacaoCadastro.findOne({
    usuarioId: (user as any)._id,
    usadoEm: null,
  }).lean();
  if (!token) { res.status(404).json({ error: 'Token não encontrado' }); return; }
  res.json({ token: (token as any).token });
});

router.get('/token-recuperacao', async (req, res) => {
  const user = await User.findOne({ email: req.query.email as string }).lean();
  if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }
  const token = await TokenOperacao.findOne({
    usuarioIdentificador: (user as any).publicId,
    tipo: 'RECUPERACAO_SENHA',
    usadoEm: null,
  }).lean();
  if (!token) { res.status(404).json({ error: 'Token não encontrado' }); return; }
  res.json({ token: (token as any).token });
});

router.post('/expirar-token', async (req, res) => {
  const { token } = req.body;
  const past = new Date(0);
  await TokenConfirmacaoCadastro.updateOne({ token }, { $set: { expiraEm: past } });
  await TokenOperacao.updateOne({ token }, { $set: { expiraEm: past } });
  res.json({ ok: true });
});

router.post('/invalidar-sessao', async (req, res) => {
  const { identificador } = req.body;
  if (!identificador) { res.status(400).json({ error: 'identificador obrigatório' }); return; }
  const user = await User.findOne({ publicId: identificador }).lean();
  if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }
  await User.findByIdAndUpdate((user as any)._id, { $inc: { tokenVersao: 1 } });
  res.json({ ok: true });
});

router.post('/criar-pilha-pendente', async (req, res) => {
  const { tipo_album_id, numeros, identificador } = req.body;
  let usuarioId = req.body.usuarioId;
  if (!usuarioId && identificador) {
    const u = await User.findOne({ publicId: identificador }).lean();
    usuarioId = (u as any)?._id;
  }
  const stickers = await Sticker.find({ number: { $in: numeros } }).lean();
  const docs = stickers.map((s) => ({
    usuarioId,
    tipoAlbumId: tipo_album_id,
    figurinhaId: s._id,
    figurinhaNumero: (s as any).number,
    figurinhaNome: (s as any).subject,
    origem: 'DIGITACAO',
    statusDestino: 'PENDENTE',
  }));
  await PilhaDaSessao.insertMany(docs);
  res.json({ ok: true, criados: docs.length });
});

router.post('/popular-pilha', async (req, res) => {
  const { tipo_album_id, quantidade, identificador } = req.body;
  let usuarioId = req.body.usuarioId;
  if (!usuarioId && identificador) {
    const u = await User.findOne({ publicId: identificador }).lean();
    usuarioId = (u as any)?._id;
  }
  const allStickers = await Sticker.find().lean();
  if (allStickers.length === 0) { res.status(400).json({ error: 'Nenhuma figurinha no catálogo' }); return; }
  const docs = Array.from({ length: quantidade as number }, (_, i) => {
    const s = allStickers[i % allStickers.length] as any;
    return {
      usuarioId,
      tipoAlbumId: tipo_album_id,
      figurinhaId: s._id,
      figurinhaNumero: s.number,
      figurinhaNome: s.subject,
      origem: 'DIGITACAO',
      statusDestino: 'PENDENTE',
    };
  });
  await PilhaDaSessao.insertMany(docs);
  res.json({ ok: true, criados: docs.length });
});

router.post('/iniciar-alteracao-email', async (req, res) => {
  const { identificador, email_novo } = req.body;
  const user = await User.findOne({ publicId: identificador });
  if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }
  await TokenOperacao.create({
    token: randomUUID(),
    usuarioIdentificador: identificador,
    tipo: 'ALTERACAO_EMAIL',
    emailNovo: email_novo,
    criadoEm: new Date(),
    expiraEm: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  (user as any).status = 'EMAIL_PENDENTE';
  (user as any).emailPendente = email_novo;
  await user.save();
  res.json({ ok: true });
});

router.post('/popular-estoque', async (req, res) => {
  const { identificador, figurinha_numero, quantidade = 1 } = req.body;
  const user = await User.findOne({ publicId: identificador }).lean();
  if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }
  const sticker = await Sticker.findOne({ number: figurinha_numero }).lean();
  if (!sticker) { res.status(404).json({ error: 'Figurinha não encontrada' }); return; }
  await EstoqueFigurinha.findOneAndUpdate(
    { usuarioId: (user as any)._id, figurinhaId: (sticker as any)._id },
    { $inc: { quantidade } },
    { upsert: true }
  );
  res.json({ ok: true });
});

router.post('/arquivar-album', async (req, res) => {
  const { albumId } = req.body;
  if (!albumId) { res.status(400).json({ error: 'albumId obrigatório' }); return; }
  await Album.findByIdAndUpdate(albumId, { arquivadoEm: new Date() });
  res.json({ ok: true });
});

router.get('/tipo-album-id', async (_req, res) => {
  const tipo = await TipoAlbum.findOne().lean();
  if (!tipo) { res.status(404).json({ error: 'Nenhum TipoAlbum encontrado' }); return; }
  res.json({ tipoAlbumId: String((tipo as any)._id) });
});

router.post('/seed', async (_req, res) => {
  const seedDir = join(process.cwd(), '..', 'tests', '_seed');
  const { tipo_albums }: { tipo_albums: Array<{ id: number; nome: string; total_figurinhas: number }> } =
    JSON.parse(readFileSync(join(seedDir, 'seed_tipo_album.json'), 'utf-8'));
  const { secoes: secoesData }: { secoes: Array<{ id: number; nome: string; grupo: string | null; sigla_time: string | null; tipo_album_id: number }> } =
    JSON.parse(readFileSync(join(seedDir, 'panini_wc2026_secoes.json'), 'utf-8'));
  const { figurinhas }: { figurinhas: Array<{ id: number; numero: string; nome: string; secao_id: number; tipo_album_id: number; conta_para_fechar: boolean }> } =
    JSON.parse(readFileSync(join(seedDir, 'panini_wc2026_figurinhas.json'), 'utf-8'));

  // 1. TipoAlbum
  const tipoMap = new Map<number, Types.ObjectId>();
  for (const ta of tipo_albums) {
    const created = await TipoAlbum.create({ nome: ta.nome, totalFigurinhas: ta.total_figurinhas });
    tipoMap.set(ta.id, created._id as Types.ObjectId);
  }

  // 2. Contagem de figurinhas por seção
  const totalFigurinhasMap = new Map<number, number>();
  for (const f of figurinhas) {
    totalFigurinhasMap.set(f.secao_id, (totalFigurinhasMap.get(f.secao_id) ?? 0) + 1);
  }

  // 3. Secao
  const secaoMap = new Map<number, { oid: Types.ObjectId; sigla_time: string | null }>();
  for (const s of secoesData) {
    const tipoAlbumOid = tipoMap.get(s.tipo_album_id);
    if (!tipoAlbumOid) continue;
    const secao = await Secao.create({
      tipoAlbumId: tipoAlbumOid,
      nome: s.nome,
      ordem: s.id,
      totalFigurinhas: totalFigurinhasMap.get(s.id) ?? 0,
      grupo: s.grupo ?? undefined,
      sigla_time: s.sigla_time ?? undefined,
    });
    secaoMap.set(s.id, { oid: secao._id as Types.ObjectId, sigla_time: s.sigla_time });
  }

  // 4. Sticker
  const SECOES_ESPECIAIS = new Set([1, 50, 51]);

  const stickerDocs = figurinhas.map((f) => {
    const secaoData = secaoMap.get(f.secao_id);
    const section = f.numero === '00' ? 'FWC0' : f.numero.replace(/\d+$/, '');
    const n = f.nome.toLowerCase();
    let type: string;
    if (SECOES_ESPECIAIS.has(f.secao_id) || !f.conta_para_fechar) {
      type = 'special';
    } else if (n.includes('team logo') || n.includes('escudo') || n.includes('foto do time')) {
      type = 'badge';
    } else if (n.includes('estád') || n.includes('estad')) {
      type = 'stadium';
    } else {
      type = 'player';
    }
    return {
      number: f.numero,
      section,
      secaoId: secaoData?.oid,
      subject: f.nome,
      type,
      country: secaoData?.sigla_time ?? undefined,
      isShiny: false,
    };
  });

  await Sticker.insertMany(stickerDocs, { ordered: false });

  res.json({ ok: true, tipos: tipo_albums.length, secoes: secoesData.length, stickers: stickerDocs.length });
});

// ── Rate limit test ───────────────────────────────────────────────────────────

const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX ?? 5);
const rateLimitCounter = new Map<string, number>();

router.post('/reset-rate-limit', (_req, res) => {
  rateLimitCounter.clear();
  res.json({ ok: true });
});

router.post('/rate-limit-test', (req, res) => {
  const ip = (req.ip ?? '::1').replace('::ffff:', '');
  const count = (rateLimitCounter.get(ip) ?? 0) + 1;
  rateLimitCounter.set(ip, count);
  if (count > RATE_LIMIT_MAX) {
    res.status(429).json({ error: 'Muitas requisições. Tente novamente em alguns instantes.' });
    return;
  }
  res.json({ ok: true, count });
});

export default router;
