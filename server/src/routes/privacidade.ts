import { Router } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { type AuthRequest } from '../middleware/auth.js';
import { ConsentimentoCookie, VERSAO_POLITICA_ATUAL } from '../models/ConsentimentoCookie.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

const EXPIRY_ANOS = 1;

function calcExpiry(): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() + EXPIRY_ANOS);
  return d;
}

router.get('/cookies/preferencias', asyncHandler(async (req, res) => {
  const cookieId = req.cookies?.consentimento_id as string | undefined;
  const authUserId = (req as AuthRequest).userId;

  let doc = null;
  if (authUserId) {
    doc = await ConsentimentoCookie.findOne({
      usuarioId: new Types.ObjectId(authUserId),
      expiraEm: { $gt: new Date() },
      versaoPolitica: VERSAO_POLITICA_ATUAL,
    })
      .sort({ concedidoEm: -1 })
      .lean();
  }
  if (!doc && cookieId) {
    doc = await ConsentimentoCookie.findById(cookieId).lean();
  }

  if (!doc) {
    res.json({ temConsentimento: false, versaoPolitica: VERSAO_POLITICA_ATUAL });
    return;
  }

  res.json({
    temConsentimento: true,
    analytics: (doc as any).analytics,
    publicidade: (doc as any).publicidade,
    versaoPolitica: (doc as any).versaoPolitica,
    expiraEm: (doc as any).expiraEm,
  });
}));

const preferenciaSchema = z.object({
  analytics: z.boolean(),
  publicidade: z.boolean().default(false),
});

router.post('/cookies/preferencias', asyncHandler(async (req: AuthRequest, res) => {
  const parsed = preferenciaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { analytics, publicidade } = parsed.data;

  if (publicidade === true && !req.body.consentimentoExplitico) {
    res.status(400).json({ error: 'Publicidade requer consentimento explícito (opt-in)' });
    return;
  }

  const now = new Date();
  const doc = await ConsentimentoCookie.create({
    usuarioId: req.userId ? new Types.ObjectId(req.userId) : null,
    analytics,
    publicidade,
    versaoPolitica: VERSAO_POLITICA_ATUAL,
    concedidoEm: now,
    expiraEm: calcExpiry(),
  });

  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('consentimento_id', String(doc._id), {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: EXPIRY_ANOS * 365 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({ ok: true, id: String(doc._id) });
}));

export default router;
