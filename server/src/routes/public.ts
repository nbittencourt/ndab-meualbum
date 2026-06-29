import { Router } from 'express';
import { Album } from '../models/Album.js';
import { Secao } from '../models/Secao.js';
import { Sticker } from '../models/Sticker.js';
import { FigurinhaColada } from '../models/FigurinhaColada.js';
import { EstoqueFigurinha } from '../models/EstoqueFigurinha.js';
import { percentualConclusao } from '../lib/albumProgress.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

router.get('/faltantes/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;
  if (!token || typeof token !== 'string') {
    res.status(400).json({ error: 'Token inválido' });
    return;
  }

  const album = await Album.findOne({ shareToken: token })
    .populate('tipoAlbumId')
    .lean();
  if (!album) {
    res.status(404).json({ error: 'Link não encontrado ou revogado' });
    return;
  }

  const tipo = album.tipoAlbumId as any;
  const tipoId = tipo?._id ?? album.tipoAlbumId;
  const albumNome = (album as any).nomePersonalizado ?? tipo?.nome ?? 'Álbum';

  const secoes = await Secao.find({ tipoAlbumId: tipoId }).sort({ ordem: 1 }).lean();
  const secaoIds = secoes.map((s) => s._id);

  const numSufixo = (s: string) => parseInt(s.replace(/^[^\d]+/, ''), 10) || 0;

  const [figurinhasBruto, coladas, estoqueItens] = await Promise.all([
    Sticker.find({ secaoId: { $in: secaoIds } }).lean(),
    FigurinhaColada.find({ albumId: album._id }).lean(),
    EstoqueFigurinha.find({ usuarioId: (album as any).usuarioId }).lean(),
  ]);
  const figurinhas = figurinhasBruto.sort((a: any, b: any) => numSufixo(a.number) - numSufixo(b.number));

  const coladasSet = new Set(coladas.map((c) => String(c.figurinhaId)));
  const estoqueMap = new Map(estoqueItens.map((e) => [String(e.figurinhaId), e.quantidade]));
  const percentual = percentualConclusao(coladas.length, tipo?.totalFigurinhas ?? 0);

  const figurinhasPorSecao = new Map<string, any[]>();
  for (const f of figurinhas) {
    const key = String(f.secaoId);
    const arr = figurinhasPorSecao.get(key) ?? [];
    arr.push({
      _id: String(f._id),
      numero: f.number,
      colada: coladasSet.has(String(f._id)),
      quantidade: estoqueMap.get(String(f._id)) ?? 0,
    });
    figurinhasPorSecao.set(key, arr);
  }

  const result = secoes.map((s) => ({
    _id: String(s._id),
    nome: s.nome,
    figurinhas: figurinhasPorSecao.get(String(s._id)) ?? [],
  }));

  res.setHeader('Cache-Control', 'no-store');
  res.json({ albumNome, percentual, secoes: result });
}));

export default router;
