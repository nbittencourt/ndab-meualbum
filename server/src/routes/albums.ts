import { Router } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { Album } from '../models/Album.js';
import { TipoAlbum } from '../models/TipoAlbum.js';
import { Secao } from '../models/Secao.js';
import { Sticker } from '../models/Sticker.js';
import { FigurinhaColada } from '../models/FigurinhaColada.js';
import { EstoqueFigurinha } from '../models/EstoqueFigurinha.js';
import type { AlbumVariante } from '@meualbum/shared';

const router = Router();

const createAlbumSchema = z.object({
  tipoAlbumId: z.string(),
  variante: z.enum(['BROCHURA', 'CAPA_DURA', 'CAPA_DURA_PRATA', 'CAPA_DURA_OURO', 'BOX_PREMIUM']),
  nomePersonalizado: z.string().trim().max(60).optional(),
});

function serializeAlbum(album: any, tipo: any, percentualConclusao: number) {
  return {
    _id: String(album._id),
    usuarioId: String(album.usuarioId),
    tipoAlbum: tipo ? { _id: String(tipo._id), nome: tipo.nome, totalFigurinhas: tipo.totalFigurinhas } : null,
    variante: album.variante as AlbumVariante,
    nomePersonalizado: album.nomePersonalizado ?? null,
    criadoEm: album.criadoEm,
    arquivadoEm: album.arquivadoEm ?? null,
    percentualConclusao,
  };
}

async function calcPercent(albumId: any, totalFigurinhas: number): Promise<number> {
  const coladas = await FigurinhaColada.countDocuments({ albumId });
  const total = totalFigurinhas || 1;
  return Math.round((coladas / total) * 1000) / 10;
}

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const parsed = createAlbumSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { tipoAlbumId, variante, nomePersonalizado } = parsed.data;
  if (!Types.ObjectId.isValid(tipoAlbumId)) {
    res.status(400).json({ error: 'tipoAlbumId inválido' });
    return;
  }
  const tipo = await TipoAlbum.findById(tipoAlbumId).lean();
  if (!tipo) {
    res.status(404).json({ error: 'Tipo de álbum não encontrado' });
    return;
  }
  const album = await Album.create({
    usuarioId: new Types.ObjectId(req.userId),
    tipoAlbumId: new Types.ObjectId(tipoAlbumId),
    variante,
    nomePersonalizado: nomePersonalizado ?? null,
  });

  const temEstoque = await EstoqueFigurinha.exists({ usuarioId: new Types.ObjectId(req.userId), quantidade: { $gte: 1 } });
  res.status(201).json({ album: serializeAlbum(album, tipo, 0), temEstoque: !!temEstoque });
});

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const usuarioId = new Types.ObjectId(req.userId);
  const [ativos, arquivados] = await Promise.all([
    Album.find({ usuarioId, arquivadoEm: null }).sort({ criadoEm: -1 }).populate('tipoAlbumId').lean(),
    Album.find({ usuarioId, arquivadoEm: { $ne: null } }).sort({ arquivadoEm: -1 }).populate('tipoAlbumId').lean(),
  ]);

  const serialize = async (album: any) => {
    const tipo = album.tipoAlbumId as any;
    const percent = await calcPercent(album._id, tipo?.totalFigurinhas ?? 0);
    return serializeAlbum(album, tipo, percent);
  };

  const [albumsAtivos, albumsArquivados] = await Promise.all([
    Promise.all(ativos.map(serialize)),
    Promise.all(arquivados.map(serialize)),
  ]);

  res.json({ ativos: albumsAtivos, arquivados: albumsArquivados });
});

router.get('/tipos', requireAuth, async (_req, res) => {
  const tipos = await TipoAlbum.find().lean();
  res.json({ tipos });
});

router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const album = await Album.findOne({ _id: id, usuarioId: new Types.ObjectId(req.userId) })
    .populate('tipoAlbumId')
    .lean();
  if (!album) {
    res.status(404).json({ error: 'Álbum não encontrado' });
    return;
  }
  const tipo = album.tipoAlbumId as any;
  const percent = await calcPercent(album._id, tipo?.totalFigurinhas ?? 0);

  const secoes = await Secao.find({ tipoAlbumId: tipo?._id }).sort({ ordem: 1 }).lean();
  const coladasPorSecao = await FigurinhaColada.aggregate([
    { $match: { albumId: album._id } },
    { $lookup: { from: 'stickers', localField: 'figurinhaId', foreignField: '_id', as: 'fig' } },
    { $unwind: '$fig' },
    { $group: { _id: '$fig.secaoId', count: { $sum: 1 } } },
  ]);
  const coladasMap = Object.fromEntries(coladasPorSecao.map((c) => [String(c._id), c.count]));

  const secoesDetalhe = secoes.map((s) => ({
    _id: String(s._id),
    tipoAlbumId: String(s.tipoAlbumId),
    nome: s.nome,
    ordem: s.ordem,
    totalFigurinhas: s.totalFigurinhas,
    figurinhasColadas: coladasMap[String(s._id)] ?? 0,
  }));

  res.json({ album: serializeAlbum(album, tipo, percent), secoes: secoesDetalhe });
});

router.get('/:id/faltantes', requireAuth, async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const album = await Album.findOne({ _id: id, usuarioId: new Types.ObjectId(req.userId) })
    .populate('tipoAlbumId')
    .lean();
  if (!album) {
    res.status(404).json({ error: 'Álbum não encontrado' });
    return;
  }
  const tipoId = (album.tipoAlbumId as any)?._id ?? album.tipoAlbumId;
  const todasFigurinhas = await Sticker.find({ secaoId: { $in: (await Secao.find({ tipoAlbumId: tipoId }).distinct('_id')) } }).lean();
  const coladas = await FigurinhaColada.find({ albumId: album._id }).lean();
  const coladasSet = new Set(coladas.map((c) => String(c.figurinhaId)));
  const faltantes = todasFigurinhas.filter((f) => !coladasSet.has(String(f._id)));

  res.json({ faltantes: faltantes.map((f) => ({ numero: f.number, nome: f.subject, secaoId: String(f.secaoId) })) });
});

router.patch('/:id/arquivar', requireAuth, async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const album = await Album.findOneAndUpdate(
    { _id: id, usuarioId: new Types.ObjectId(req.userId), arquivadoEm: null },
    { arquivadoEm: new Date() },
    { new: true }
  ).populate('tipoAlbumId').lean();
  if (!album) {
    res.status(404).json({ error: 'Álbum não encontrado ou já arquivado' });
    return;
  }
  const tipo = album.tipoAlbumId as any;
  res.json({ album: serializeAlbum(album, tipo, 0) });
});

router.patch('/:id/desarquivar', requireAuth, async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const album = await Album.findOneAndUpdate(
    { _id: id, usuarioId: new Types.ObjectId(req.userId), arquivadoEm: { $ne: null } },
    { arquivadoEm: null },
    { new: true }
  ).populate('tipoAlbumId').lean();
  if (!album) {
    res.status(404).json({ error: 'Álbum não encontrado ou não está arquivado' });
    return;
  }
  const tipo = album.tipoAlbumId as any;
  const percent = await calcPercent(album._id, tipo?.totalFigurinhas ?? 0);
  res.json({ album: serializeAlbum(album, tipo, percent) });
});

router.get('/:id/pdf', requireAuth, async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const album = await Album.findOne({ _id: id, usuarioId: new Types.ObjectId(req.userId) })
    .populate('tipoAlbumId').lean();
  if (!album) {
    res.status(404).json({ error: 'Álbum não encontrado' });
    return;
  }
  const tipoId = (album.tipoAlbumId as any)?._id ?? album.tipoAlbumId;
  const secaoIds = await Secao.find({ tipoAlbumId: tipoId }).distinct('_id');
  const todasFigurinhas = await Sticker.find({ secaoId: { $in: secaoIds } }).sort({ number: 1 }).lean();
  const coladas = await FigurinhaColada.find({ albumId: album._id }).lean();
  const coladasSet = new Set(coladas.map((c) => String(c.figurinhaId)));
  const faltantes = todasFigurinhas.filter((f) => !coladasSet.has(String(f._id)));

  const nomeAlbum = (album.tipoAlbumId as any)?.nome ?? 'Álbum';
  const linhas = [`Figurinhas Faltantes — ${nomeAlbum}`, '', ...faltantes.map((f: any) => `${f.number}  ${f.subject || ''}`)];
  const body = linhas.join('\n');
  const pdf = buildTextPdf(body);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="figurinhas-faltantes.pdf"');
  res.send(pdf);
});

function buildTextPdf(text: string): Buffer {
  const escaped = text.replace(/[()\\]/g, (c) => `\\${c}`);
  const stream = `BT /F1 10 Tf 40 750 Td 14 TL (${escaped}) Tj ET`;
  const streamLen = Buffer.byteLength(stream, 'utf8');
  const objects: string[] = [
    '',
    '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n',
    '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n',
    `3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>>/Contents 4 0 R>>endobj\n`,
    `4 0 obj<</Length ${streamLen}>>\nstream\n${stream}\nendstream\nendobj\n`,
  ];
  let offset = 9;
  const offsets: number[] = [];
  const header = '%PDF-1.4\n';
  const parts: string[] = [header];
  for (let i = 1; i < objects.length; i++) {
    offsets.push(offset);
    parts.push(objects[i]);
    offset += Buffer.byteLength(objects[i], 'utf8');
  }
  const xref = `xref\n0 ${objects.length}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
  const trailer = `trailer<</Size ${objects.length}/Root 1 0 R>>\nstartxref\n${offset}\n%%EOF`;
  parts.push(xref, trailer);
  return Buffer.from(parts.join(''), 'utf8');
}

export default router;
