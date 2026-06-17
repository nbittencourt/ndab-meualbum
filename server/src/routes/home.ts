import { Router } from 'express';
import { Types } from 'mongoose';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { Album } from '../models/Album.js';
import { EstoqueFigurinha } from '../models/EstoqueFigurinha.js';
import { Sticker } from '../models/Sticker.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { contarColadasPorAlbum, percentualConclusao } from '../lib/albumProgress.js';

const router = Router();
const PAGE_SIZE = 5;

router.get('/', requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const usuarioId = new Types.ObjectId(req.userId);
  const pagina = Math.max(1, Number(req.query.pagina) || 1);
  const skip = (pagina - 1) * PAGE_SIZE;

  const [totalAlbums, albumDocs] = await Promise.all([
    Album.countDocuments({ usuarioId, arquivadoEm: null }),
    Album.find({ usuarioId, arquivadoEm: null })
      .sort({ criadoEm: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .populate('tipoAlbumId')
      .lean(),
  ]);

  // Uma única aggregation para todos os álbuns da página (evita N+1)
  const coladasMap = await contarColadasPorAlbum(albumDocs.map((a) => a._id as Types.ObjectId));

  const albumsWithProgress = albumDocs.map((album) => {
      const tipo = album.tipoAlbumId as any;
      const coladas = coladasMap.get(String(album._id)) ?? 0;
      const total = tipo?.totalFigurinhas ?? 980;
      const percentual = percentualConclusao(coladas, total);

      return {
        _id: album._id,
        usuarioId: album.usuarioId,
        tipoAlbum: tipo
          ? {
              _id: tipo._id,
              nome: tipo.nome,
              variante: tipo.variante,
              totalFigurinhas: tipo.totalFigurinhas,
            }
          : null,
        variante: (album as any).variante ?? null,
        nomePersonalizado: album.nomePersonalizado ?? null,
        criadoEm: (album as any).criadoEm,
        percentualConclusao: percentual,
      };
    });

  // Top 5 figurinhas com mais estoque (RN-H07/08/09)
  const topEstoque = await EstoqueFigurinha.find({
    usuarioId,
    quantidade: { $gte: 1 },
  })
    .sort({ quantidade: -1 })
    .limit(20) // busca extra para desempate por número
    .populate({ path: 'figurinhaId', model: Sticker })
    .lean();

  // Desempate por numero ASC (RN-H09)
  const sorted = topEstoque
    .filter((e) => e.figurinhaId)
    .sort((a, b) => {
      if (b.quantidade !== a.quantidade) return b.quantidade - a.quantidade;
      return String((a.figurinhaId as any).number).localeCompare(
        String((b.figurinhaId as any).number)
      );
    })
    .slice(0, 5);

  const figurinhasRepetidas = sorted.map((e) => {
    const fig = e.figurinhaId as any;
    return {
      figurinhaId: String(fig._id),
      numero: fig.number,
      nome: fig.subject,
      quantidade: e.quantidade,
    };
  });

  // Total de repetidas (RN-H10)
  const totalResult = await EstoqueFigurinha.aggregate([
    { $match: { usuarioId, quantidade: { $gte: 1 } } },
    { $group: { _id: null, total: { $sum: '$quantidade' } } },
  ]);
  const totalRepetidas: number = totalResult[0]?.total ?? 0;

  res.json({
    albums: albumsWithProgress,
    totalAlbums,
    pagina,
    totalPaginas: Math.ceil(totalAlbums / PAGE_SIZE),
    figurinhasRepetidas,
    totalRepetidas,
  });
}));

export default router;
