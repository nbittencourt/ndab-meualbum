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
import { User } from '../models/User.js';
import { buildPdfHtml, type StickerPdf, type SecaoPdf } from '../lib/pdfTemplate.js';
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
  const { tipoAlbumId, variante } = parsed.data;
  const nomePersonalizado = parsed.data.nomePersonalizado
    ?.replace(/<[^>]+>/g, '')
    .trim() || undefined;
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

router.get('/:id/figurinhas', requireAuth, async (req: AuthRequest, res) => {
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

  const secoes = await Secao.find({ tipoAlbumId: tipoId }).sort({ ordem: 1 }).lean();
  const secaoIds = secoes.map((s) => s._id);

  const [todasFigurinhas, coladas, estoqueItens] = await Promise.all([
    Sticker.find({ secaoId: { $in: secaoIds } }).sort({ number: 1 }).lean(),
    FigurinhaColada.find({ albumId: album._id }).lean(),
    EstoqueFigurinha.find({ usuarioId: new Types.ObjectId(req.userId) }).lean(),
  ]);

  const coladasSet = new Set(coladas.map((c) => String(c.figurinhaId)));
  const estoqueMap = new Map(estoqueItens.map((e) => [String(e.figurinhaId), e.quantidade]));

  const figurinhasPorSecao = new Map<string, any[]>();
  for (const f of todasFigurinhas) {
    const secaoKey = String(f.secaoId);
    const arr = figurinhasPorSecao.get(secaoKey) ?? [];
    arr.push({
      _id: String(f._id),
      numero: f.number,
      nome: f.subject ?? '',
      colada: coladasSet.has(String(f._id)),
      quantidade: estoqueMap.get(String(f._id)) ?? 0,
    });
    figurinhasPorSecao.set(secaoKey, arr);
  }

  const result = secoes.map((s) => ({
    _id: String(s._id),
    nome: s.nome,
    ordem: s.ordem,
    figurinhas: figurinhasPorSecao.get(String(s._id)) ?? [],
  }));

  res.json({ secoes: result });
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

  const [album, usuario] = await Promise.all([
    Album.findOne({ _id: id, usuarioId: new Types.ObjectId(req.userId) })
      .populate('tipoAlbumId').lean(),
    User.findById(req.userId, { name: 1, publicId: 1 }).lean(),
  ]);

  if (!album) {
    res.status(404).json({ error: 'Álbum não encontrado' });
    return;
  }

  const tipoId = (album.tipoAlbumId as any)?._id ?? album.tipoAlbumId;
  const nomeAlbum = (album.tipoAlbumId as any)?.nome ?? 'Álbum';
  const nomePersonalizado = (album as any).nomePersonalizado as string | undefined;

  const secaoDocs = await Secao.find({ tipoAlbumId: tipoId })
    .sort({ ordem: 1 }).lean();

  const secaoIds = secaoDocs.map((s) => s._id);
  const [todasFigurinhas, coladas, estoque] = await Promise.all([
    Sticker.find({ secaoId: { $in: secaoIds } }).sort({ number: 1 }).lean(),
    FigurinhaColada.find({ albumId: album._id }).lean(),
    EstoqueFigurinha.find({ usuarioId: new Types.ObjectId(req.userId), quantidade: { $gt: 1 } }).lean(),
  ]);

  const coladasSet = new Set(coladas.map((c) => String(c.figurinhaId)));
  const repetidosSet = new Set(estoque.map((e) => String(e.figurinhaId)));

  const secoes: SecaoPdf[] = secaoDocs.map((s) => ({
    _id: String(s._id),
    nome: s.nome,
    grupo: (s as any).grupo ?? null,
    sigla_time: (s as any).sigla_time ?? null,
    ordem: s.ordem,
  }));

  const stickers: StickerPdf[] = todasFigurinhas.map((f) => {
    const fid = String(f._id);
    const status: StickerPdf['status'] = coladasSet.has(fid)
      ? 'colada'
      : repetidosSet.has(fid)
        ? 'repetida'
        : 'faltante';
    return {
      id: fid,
      number: f.number,
      section: f.section,
      subject: f.subject,
      secaoId: String(f.secaoId),
      grupo: null,
      sigla_time: null,
      status,
    };
  });

  const html = buildPdfHtml({
    nomeAlbum: nomePersonalizado ?? nomeAlbum,
    nomeUsuario: usuario?.name ?? 'Colecionador',
    identificador: (usuario as any)?.publicId ?? '—',
    stickers,
    secoes,
  });

  const puppeteer = await import('puppeteer').then((m) => m.default);
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate('document.fonts.ready');
    const pdfBuffer = await page.pdf({ format: 'A4', margin: { top: '7mm', right: '7mm', bottom: '7mm', left: '7mm' }, printBackground: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="figurinhas-faltantes.pdf"');
    res.send(Buffer.from(pdfBuffer));
  } finally {
    await browser.close();
  }
});

export default router;
