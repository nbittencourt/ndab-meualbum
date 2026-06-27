import { Router } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { EstoqueFigurinha } from '../models/EstoqueFigurinha.js';
import { FigurinhaColada } from '../models/FigurinhaColada.js';
import { Album } from '../models/Album.js';
import { Sticker } from '../models/Sticker.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

router.get('/estoque', requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const usuarioId = new Types.ObjectId(req.userId);
  const { albumId, busca } = req.query;

  const estoque = await EstoqueFigurinha.find({ usuarioId, quantidade: { $gte: 1 } })
    .populate({ path: 'figurinhaId', model: Sticker })
    .lean();

  // coladaMap: figurinhaId → albumId[]
  const coladaMap = new Map<string, string[]>();
  if (albumId && Types.ObjectId.isValid(albumId as string)) {
    const docs = await FigurinhaColada.find({ albumId: new Types.ObjectId(albumId as string) }).lean();
    docs.forEach((d) => coladaMap.set(String(d.figurinhaId), [albumId as string]));
  } else {
    const albums = await Album.find({ usuarioId, arquivadoEm: null }).lean();
    if (albums.length > 0) {
      const docs = await FigurinhaColada.find({ albumId: { $in: albums.map((a) => a._id) } }).lean();
      docs.forEach((d) => {
        const key = String(d.figurinhaId);
        const aId = String(d.albumId);
        const list = coladaMap.get(key);
        if (list) list.push(aId);
        else coladaMap.set(key, [aId]);
      });
    }
  }

  const itens = estoque
    .filter((e) => e.figurinhaId)
    .map((e) => {
      const fig = e.figurinhaId as any;
      const figId = String(fig._id);
      const albumsColados = coladaMap.get(figId) ?? [];
      const elegibilidade = albumsColados.length > 0 ? 'JA_COLADA' : 'PODE_COLAR';
      return {
        _id: String(e._id),
        figurinha: { _id: figId, number: fig.number, subject: fig.subject, secaoId: String(fig.secaoId) },
        quantidade: e.quantidade,
        elegibilidade,
        coladaEm: albumsColados,
      };
    })
    .filter((e) => {
      if (!busca) return true;
      const q = (busca as string).toLowerCase();
      return e.figurinha.number.toLowerCase().includes(q) || e.figurinha.subject.toLowerCase().includes(q);
    });

  // Paginação opt-in (B4): sem ?pagina o shape atual {itens} é preservado.
  // A página é aplicada em memória após o filtro de busca — a elegibilidade
  // depende do populate, e o catálogo (~1k itens) é pequeno para o servidor;
  // o ganho da paginação aqui é payload/render no client.
  if (req.query.pagina !== undefined) {
    const pagina = Math.max(1, Number(req.query.pagina) || 1);
    const limite = Math.min(100, Math.max(1, Number(req.query.limite) || 50));
    const total = itens.length;
    res.json({
      itens: itens.slice((pagina - 1) * limite, pagina * limite),
      pagina,
      limite,
      total,
      totalPaginas: Math.ceil(total / limite),
    });
    return;
  }

  res.json({ itens });
}));

const colarEstoqueSchema = z.object({
  albumId: z.string(),
  estoqueId: z.string(),
});

router.post('/colar', requireAuth, asyncHandler(async (req: AuthRequest, res) => {
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
}));

const colarDiretaSchema = z.object({
  albumId: z.string(),
  figurinhaNumero: z.string().toUpperCase(),
});

router.post('/colar/direta', requireAuth, asyncHandler(async (req: AuthRequest, res) => {
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
}));

const adicionarRepetidaSchema = z.object({ figurinhaNumero: z.string().toUpperCase() });

router.post('/estoque/adicionar', requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const parsed = adicionarRepetidaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { figurinhaNumero } = parsed.data;
  const usuarioId = new Types.ObjectId(req.userId);

  const sticker = await Sticker.findOne({ number: figurinhaNumero }).lean();
  if (!sticker) {
    res.status(404).json({ error: `Figurinha ${figurinhaNumero} não encontrada no catálogo.` });
    return;
  }

  await EstoqueFigurinha.findOneAndUpdate(
    { usuarioId, figurinhaId: sticker._id },
    { $inc: { quantidade: 1 } },
    { upsert: true, setDefaultsOnInsert: true }
  );

  res.json({ ok: true });
}));

const descartarSchema = z.object({ estoqueId: z.string() });

router.post('/estoque/descartar', requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const parsed = descartarSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { estoqueId } = parsed.data;
  const usuarioId = new Types.ObjectId(req.userId);

  const item = await EstoqueFigurinha.findOne({ _id: estoqueId, usuarioId, quantidade: { $gte: 1 } });
  if (!item) {
    res.status(404).json({ error: 'Item de estoque não encontrado' });
    return;
  }

  if (item.quantidade <= 1) {
    await item.deleteOne();
  } else {
    item.quantidade -= 1;
    await item.save();
  }

  res.json({ ok: true });
}));

export default router;
