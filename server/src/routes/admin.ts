import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { executarPurga } from '../lib/purga.js';
import { logger } from '../lib/logger.js';

const router = Router();

/**
 * Disparo da rotina de purga (RN-PR01). Pensado para o Cloud Scheduler —
 * Cloud Run escala a zero, então um cron in-process não é confiável.
 * Protegido por segredo compartilhado no header X-Purge-Token.
 */
router.post('/purga', asyncHandler(async (req, res) => {
  const segredo = process.env.PURGE_TOKEN;
  if (!segredo) {
    logger.error('admin:purga-sem-token-configurado');
    res.status(503).json({ error: 'Rotina de purga não configurada' });
    return;
  }
  if (req.get('X-Purge-Token') !== segredo) {
    logger.warn('admin:purga-token-invalido');
    res.status(403).json({ error: 'Não autorizado' });
    return;
  }
  const resultado = await executarPurga('scheduler');
  res.json({ ok: true, ...resultado });
}));

export default router;
