import { Schema, Types, model } from 'mongoose';
import type { StickerType } from '@meualbum/shared';

const stickerSchema = new Schema({
  number: { type: String, required: true, unique: true },
  section: { type: String, required: true, index: true },
  secaoId: { type: Types.ObjectId, ref: 'Secao', required: true, index: true },
  subject: { type: String, required: true },
  country: { type: String },
  type: {
    type: String,
    enum: ['player', 'badge', 'stadium', 'special'] satisfies StickerType[],
    required: true,
  },
  isShiny: { type: Boolean, default: false },
});

export const Sticker = model('Sticker', stickerSchema);
