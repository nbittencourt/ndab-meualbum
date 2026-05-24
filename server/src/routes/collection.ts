import { Router } from 'express';
import { z } from 'zod';
import { Collection } from '../models/Collection.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const updateSchema = z.object({
  stickerId: z.string(),
  status: z.enum(['owned', 'needed', 'duplicate']),
  quantity: z.number().int().min(0).optional(),
});

router.get('/', async (req: AuthRequest, res) => {
  const collection = await Collection.findOne({ userId: req.userId }).lean();
  res.json(collection ?? { userId: req.userId, entries: [] });
});

router.patch('/sticker', async (req: AuthRequest, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { stickerId, status, quantity = 1 } = parsed.data;

  // Try to update an existing entry first
  const updated = await Collection.findOneAndUpdate(
    { userId: req.userId, 'entries.stickerId': stickerId },
    { $set: { 'entries.$.status': status, 'entries.$.quantity': quantity } },
    { new: true }
  );

  if (updated) {
    res.json({ ok: true });
    return;
  }

  // Entry doesn't exist yet — upsert the collection doc and push new entry
  await Collection.findOneAndUpdate(
    { userId: req.userId },
    { $push: { entries: { stickerId, status, quantity } } },
    { upsert: true, setDefaultsOnInsert: true }
  );

  res.json({ ok: true });
});

export default router;
