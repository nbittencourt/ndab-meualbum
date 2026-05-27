import { Router } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { EstoqueFigurinha } from '../models/EstoqueFigurinha.js';
import { FigurinhaColada } from '../models/FigurinhaColada.js';
import { Album } from '../models/Album.js';
import { Sticker } from '../models/Sticker.js';

const router = Router();

router.get('/estoque', requireAuth, async (req: AuthRequest, res) => {
  const usuarioId = new Types.ObjectId(req.userId);
  const { albumId, busca } = req.query;

  const estoque = await EstoqueFigurinha.find({ usuarioId, quantidade: { $gte: 1 } })
    .populate({ path: 'figurinhaId', model: Sticker })
    .lean();

  let coladas: Set<string> = new Set();
  if (albumId && Types.ObjectId.isValid(albumId as string)) {
    const docs = await FigurinhaColada.find({ albumId: new Types.ObjectId(albumId as string) }).lean();
    coladas = new Set(docs.map((d) => String(d.figurinhaId)));
  }

  const itens = estoque
    .filter((e) => e.figurinhaId)
    .map((e) => {
      const fig = e.figurinhaId as any;
      const elegibilidade = coladas.has(String(fig._id)) ? 'JA_COLADA' : 'PODE_COLAR';
      return {
        _id: String(e._id),
        figurinha: { _id: String(fig._id), number: fig.number, subject: fig.subject, secaoId: String(fig.secaoId) },
        quantidade: e.quantidade,
        elegibilidade,
      };
    })
    .filter((e) => {
      if (!busca) return true;
      const q = (busca as string).toLowerCase();
      return e.figurinha.number.toLowerCase().includes(q) || e.figurinha.subject.toLowerCase().includes(q);
    });

  res.json({ itens });
});

const colarEstoqueSchema = z.object({
  albumId: z.string(),
  estoqueId: z.string(),
});

router.post('/colar', requireAuth, async (req: AuthRequest, res) => {
  const parsed = colarEstoqueSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { albumId, estoqueId } = parsed.data;
  const usuarioId = new Types.ObjectId(req.userId);

  const album = await Album.findOne({ _id: albumId, usuarioId, arquivadoEm: null });
  if (!album) {
    res.status(404).json({ error: album ? 'ALBUM_ARQUIVADO' : 'Álbum não encontrado' });
    return;
  }

  const estoqueItem = await EstoqueFigurinha.findOne({ _id: estoqueId, usuarioId, quantidade: { $gte: 1 } });
  if (!estoqueItem) {
    res.status(404).json({ error: 'Item de estoque não encontrado ou sem quantidade' });
    return;
  }

  await FigurinhaColada.findOneAndUpdate(
    { albumId: new Types.ObjectId(albumId), figurinhaId: estoqueItem.figurinhaId },
    { $set: { origem: 'ESTOQUE', coladaEm: new Date() } },
    { upsert: true }
  );

  estoqueItem.quantidade -= 1;
  await estoqueItem.save();

  res.json({ ok: true });
});

const colarDiretaSchema = z.object({
  albumId: z.string(),
  figurinhaNumero: z.string().toUpperCase(),
});

router.post('/colar/direta', requireAuth, async (req: AuthRequest, res) => {
  const parsed = colarDiretaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { albumId, figurinhaNumero } = parsed.data;
  const usuarioId = new Types.ObjectId(req.userId);

  const album = await Album.findOne({ _id: albumId, usuarioId, arquivadoEm: null });
  if (!album) {
    res.status(404).json({ error: 'Álbum não encontrado ou arquivado' });
    return;
  }

  const sticker = await Sticker.findOne({ number: figurinhaNumero }).lean();
  if (!sticker) {
    res.status(404).json({ error: `Figurinha ${figurinhaNumero} não encontrada neste álbum. Verifique o número e tente novamente.` });
    return;
  }

  await FigurinhaColada.findOneAndUpdate(
    { albumId: new Types.ObjectId(albumId), figurinhaId: sticker._id },
    { $set: { origem: 'DIRETA', coladaEm: new Date() } },
    { upsert: true }
  );

  res.json({ ok: true });
});

export default router;
