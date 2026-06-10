import { Router } from 'express';
import { Types } from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import { Secao } from '../models/Secao.js';
import { TipoAlbum } from '../models/TipoAlbum.js';
import { Sticker } from '../models/Sticker.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const tipoAlbumId = req.query.tipoAlbumId as string;
  if (!tipoAlbumId || !Types.ObjectId.isValid(tipoAlbumId)) {
    res.status(400).json({ error: 'tipoAlbumId obrigatório e válido' });
    return;
  }
  const secoes = await Secao.find({ tipoAlbumId: new Types.ObjectId(tipoAlbumId) }).sort({ ordem: 1 }).lean();
  res.json({ secoes });
});

// Recalcular total_figurinhas de uma seção (operação administrativa)
router.post('/:id/recalcular', requireAuth, async (req, res) => {
  const id = req.params.id as string;
  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const total = await Sticker.countDocuments({ secaoId: new Types.ObjectId(id) });
  const secao = await Secao.findByIdAndUpdate(id, { totalFigurinhas: total }, { new: true }).lean();
  if (!secao) {
    res.status(404).json({ error: 'Seção não encontrada' });
    return;
  }

  // Atualizar total desnormalizado no TipoAlbum
  const totalTipo = await Sticker.countDocuments({
    secaoId: { $in: await Secao.find({ tipoAlbumId: secao.tipoAlbumId }).distinct('_id') },
  });
  await TipoAlbum.findByIdAndUpdate(secao.tipoAlbumId, { totalFigurinhas: totalTipo });

  res.json({ secao });
});

export default router;
