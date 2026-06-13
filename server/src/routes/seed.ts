import { Router } from 'express';
import { TipoAlbum } from '../models/TipoAlbum.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

const TIPOS_COPA_2026 = [
  { nome: 'Copa do Mundo 2026 (Brochura)',        variante: 'BROCHURA',       totalFigurinhas: 980 },
  { nome: 'Copa do Mundo 2026 (Capa Dura)',        variante: 'CAPA_DURA',      totalFigurinhas: 980 },
  { nome: 'Copa do Mundo 2026 (Capa Dura Prata)', variante: 'CAPA_DURA_PRATA', totalFigurinhas: 980 },
  { nome: 'Copa do Mundo 2026 (Capa Dura Ouro)',  variante: 'CAPA_DURA_OURO',  totalFigurinhas: 980 },
  { nome: 'Copa do Mundo 2026 (Box Premium)',      variante: 'BOX_PREMIUM',     totalFigurinhas: 980 },
];

router.post('/tipos-album', asyncHandler(async (_req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({ error: 'Seed desabilitado em produção' });
    return;
  }
  const results = await Promise.all(
    TIPOS_COPA_2026.map((t) =>
      TipoAlbum.findOneAndUpdate({ variante: t.variante }, t, { upsert: true, new: true })
    )
  );
  res.json({ ok: true, count: results.length, tipos: results });
}));

export default router;
