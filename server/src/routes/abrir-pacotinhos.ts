import { Router } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { PilhaDaSessao } from '../models/PilhaDaSessao.js';
import { Sticker } from '../models/Sticker.js';
import { TipoAlbum } from '../models/TipoAlbum.js';
import { Album } from '../models/Album.js';
import { FigurinhaColada } from '../models/FigurinhaColada.js';
import { EstoqueFigurinha } from '../models/EstoqueFigurinha.js';

const router = Router();
const LIMITE_PILHA = 100;

router.get('/pilha', requireAuth, async (req: AuthRequest, res) => {
  const usuarioId = new Types.ObjectId(req.userId);
  const { tipoAlbumId } = req.query;
  const filtro: any = { usuarioId };
  if (tipoAlbumId && Types.ObjectId.isValid(tipoAlbumId as string)) {
    filtro.tipoAlbumId = new Types.ObjectId(tipoAlbumId as string);
  }
  const itens = await PilhaDaSessao.find(filtro).sort({ criadoEm: 1 }).lean();
  res.json({ itens, total: itens.length });
});

const addSchema = z.object({
  tipoAlbumId: z.string(),
  figurinhaNumero: z.string().min(1).toUpperCase(),
  origem: z.enum(['DIGITACAO', 'CAMERA']),
});

router.post('/pilha', requireAuth, async (req: AuthRequest, res) => {
  const parsed = addSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { tipoAlbumId, figurinhaNumero, origem } = parsed.data;
  const usuarioId = new Types.ObjectId(req.userId);

  const pendentes = await PilhaDaSessao.countDocuments({ usuarioId, statusDestino: 'PENDENTE' });
  if (pendentes >= LIMITE_PILHA) {
    res.status(400).json({ error: 'LIMITE_PILHA', message: `Limite de ${LIMITE_PILHA} figurinhas pendentes atingido.` });
    return;
  }

  const sticker = await Sticker.findOne({ number: figurinhaNumero }).lean();
  if (!sticker) {
    const tipo = await TipoAlbum.findById(tipoAlbumId).lean();
    const nomeAlbum = (tipo as any)?.nome ?? 'álbum';
    res.status(404).json({ error: `Figurinha ${figurinhaNumero} não encontrada no álbum ${nomeAlbum}. Verifique o número e tente novamente.` });
    return;
  }

  const item = await PilhaDaSessao.create({
    usuarioId,
    tipoAlbumId: new Types.ObjectId(tipoAlbumId),
    figurinhaId: sticker._id,
    figurinhaNumero,
    figurinhaNome: (sticker as any).subject,
    origem,
    statusDestino: 'PENDENTE',
  });

  res.status(201).json({ item, conhecida: true });
});

const colarSchema = z.object({
  itemId: z.string(),
  albumId: z.string(),
});

router.post('/pilha/colar', requireAuth, async (req: AuthRequest, res) => {
  const parsed = colarSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { itemId: entradaId, albumId } = parsed.data;
  const usuarioId = new Types.ObjectId(req.userId);

  const entrada = await PilhaDaSessao.findOne({ _id: entradaId, usuarioId, statusDestino: 'PENDENTE' });
  if (!entrada) {
    res.status(404).json({ error: 'Item não encontrado na pilha' });
    return;
  }
  if (!entrada.figurinhaId) {
    res.status(400).json({ error: 'FIGURINHA_DESCONHECIDA', message: 'Figurinha não está no catálogo.' });
    return;
  }

  const album = await Album.findOne({ _id: albumId, usuarioId, arquivadoEm: null });
  if (!album) {
    res.status(404).json({ error: 'Álbum não encontrado ou arquivado' });
    return;
  }

  await FigurinhaColada.findOneAndUpdate(
    { albumId: new Types.ObjectId(albumId), figurinhaId: entrada.figurinhaId },
    { $set: { origem: 'DIRETA', coladaEm: new Date() } },
    { upsert: true }
  );

  entrada.statusDestino = 'COLADA';
  await entrada.save();

  res.json({ ok: true });
});

router.post('/pilha/repetida', requireAuth, async (req: AuthRequest, res) => {
  const { itemId: entradaId } = req.body;
  const usuarioId = new Types.ObjectId(req.userId);

  const entrada = await PilhaDaSessao.findOne({ _id: entradaId, usuarioId, statusDestino: 'PENDENTE' });
  if (!entrada) {
    res.status(404).json({ error: 'Item não encontrado na pilha' });
    return;
  }

  if (entrada.figurinhaId) {
    await EstoqueFigurinha.findOneAndUpdate(
      { usuarioId, figurinhaId: entrada.figurinhaId },
      { $inc: { quantidade: 1 } },
      { upsert: true }
    );
  }

  entrada.statusDestino = 'REPETIDA';
  await entrada.save();

  res.json({ ok: true });
});

// RN-AP17(b): o descarte explícito encerra a sessão por completo — remove
// também os itens já finalizados (COLADA/REPETIDA), não apenas os pendentes.
router.delete('/pilha', requireAuth, async (req: AuthRequest, res) => {
  const usuarioId = new Types.ObjectId(req.userId);
  const { tipoAlbumId } = req.query;
  const filtro: any = { usuarioId };
  if (tipoAlbumId && Types.ObjectId.isValid(tipoAlbumId as string)) {
    filtro.tipoAlbumId = new Types.ObjectId(tipoAlbumId as string);
  }
  await PilhaDaSessao.deleteMany(filtro);
  res.json({ ok: true });
});

router.delete('/pilha/:itemId', requireAuth, async (req: AuthRequest, res) => {
  const usuarioId = new Types.ObjectId(req.userId);
  const itemId = req.params.itemId as string;
  if (!Types.ObjectId.isValid(itemId)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const item = await PilhaDaSessao.findOneAndDelete({ _id: itemId, usuarioId, statusDestino: 'PENDENTE' });
  if (!item) {
    res.status(404).json({ error: 'Item não encontrado na pilha' });
    return;
  }
  res.json({ ok: true });
});

const sincronizarSchema = z.array(z.object({
  tipoAlbumId: z.string(),
  figurinhaNumero: z.string().toUpperCase(),
  origem: z.enum(['DIGITACAO', 'CAMERA']),
}));

router.patch('/pilha/sincronizar', requireAuth, async (req: AuthRequest, res) => {
  const parsed = sincronizarSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const usuarioId = new Types.ObjectId(req.userId);
  const pendentes = await PilhaDaSessao.countDocuments({ usuarioId, statusDestino: 'PENDENTE' });
  const disponiveis = LIMITE_PILHA - pendentes;
  const itens = parsed.data.slice(0, disponiveis);

  const novos = await Promise.all(itens.map(async (item) => {
    const sticker = await Sticker.findOne({ number: item.figurinhaNumero }).lean();
    return {
      usuarioId,
      tipoAlbumId: new Types.ObjectId(item.tipoAlbumId),
      figurinhaId: sticker?._id ?? null,
      figurinhaNumero: item.figurinhaNumero,
      figurinhaNome: sticker ? (sticker as any).subject : null,
      origem: item.origem,
      statusDestino: 'PENDENTE' as const,
    };
  }));

  if (novos.length > 0) {
    await PilhaDaSessao.insertMany(novos);
  }

  res.json({ sincronizados: novos.length, ignorados: parsed.data.length - novos.length });
});

export default router;
