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
import { randomUUID } from 'crypto';

const router = Router();

const guard = (_req: any, res: any, next: any) => {
  if (process.env.NODE_ENV !== 'test') return res.status(403).json({ error: 'Forbidden' });
  next();
};
router.use(guard);

router.post('/reset-db', async (_req, res) => {
  const db = mongoose.connection.db!;
  const preserve = new Set(['tipoalbums', 'stickers', 'secaos']);
  const cols = await db.listCollections().toArray();
  await Promise.all(
    cols.filter((c) => !preserve.has(c.name)).map((c) => db.collection(c.name).deleteMany({}))
  );
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
  const stickers = await Sticker.find().limit(quantidade as number).lean();
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

router.get('/tipo-album-id', async (_req, res) => {
  const tipo = await TipoAlbum.findOne().lean();
  if (!tipo) { res.status(404).json({ error: 'Nenhum TipoAlbum encontrado' }); return; }
  res.json({ tipoAlbumId: String((tipo as any)._id) });
});

router.post('/seed', async (_req, res) => {
  const seedDir = join(process.cwd(), '..', 'tests', '_seed');
  const tiposData = JSON.parse(readFileSync(join(seedDir, 'seed_tipo_album.json'), 'utf-8'));
  const figurinhasData = JSON.parse(readFileSync(join(seedDir, 'seed_figurinhas.json'), 'utf-8'));
  const tipos: Array<{ nome: string; total_figurinhas: number }> = tiposData.tipo_albums;
  const figurinhas: Array<{
    numero: string; nome: string; secao_id: number;
    tipo_album_id: number; conta_para_fechar: boolean;
  }> = figurinhasData.figurinhas;

  const tipoCount = await TipoAlbum.countDocuments();
  if (tipoCount > 0) {
    res.json({ ok: true, skipped: true });
    return;
  }

  // TipoAlbum is empty but stickers/secoes may still exist from a previous partial seed.
  // Clear them to avoid duplicate key errors on insertMany.
  await Sticker.deleteMany({});
  await Secao.deleteMany({});

  const tipoMap = new Map<number, Types.ObjectId>();
  for (let i = 0; i < tipos.length; i++) {
    const t = tipos[i];
    const created = await TipoAlbum.create({ nome: t.nome, totalFigurinhas: t.total_figurinhas });
    tipoMap.set(i + 1, created._id as Types.ObjectId);
  }

  const tipoAlbumId = tipoMap.get(1)!;

  const secaoMap = new Map<number, Types.ObjectId>();
  const secaoGroups = new Map<number, string[]>();
  figurinhas.forEach((f) => {
    const prefix = f.numero.split('-')[0];
    if (!secaoGroups.has(f.secao_id)) secaoGroups.set(f.secao_id, []);
    secaoGroups.get(f.secao_id)!.push(prefix);
  });

  const secaoIds = [...secaoGroups.keys()].sort((a, b) => a - b);
  for (const sid of secaoIds) {
    const prefix = secaoGroups.get(sid)![0];
    const count = figurinhas.filter((f) => f.secao_id === sid).length;
    const secao = await Secao.create({
      tipoAlbumId,
      nome: prefix,
      ordem: sid,
      totalFigurinhas: count,
    });
    secaoMap.set(sid, secao._id as Types.ObjectId);
  }

  const stickerDocs = figurinhas.map((f) => {
    const prefix = f.numero.split('-')[0];
    const secaoId = secaoMap.get(f.secao_id)!;
    const isSpecial = f.secao_id === 1;
    return {
      number: f.numero,
      section: prefix,
      secaoId,
      subject: f.nome,
      type: isSpecial ? 'special' : 'player',
      isShiny: false,
    };
  });

  await Sticker.insertMany(stickerDocs, { ordered: false });

  res.json({ ok: true, tipos: tipos.length, secoes: secaoIds.length, stickers: stickerDocs.length });
});

export default router;
