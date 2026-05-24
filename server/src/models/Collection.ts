import { Schema, model, Types } from 'mongoose';
import type { StickerStatus } from '@meualbum/shared';

const entrySchema = new Schema(
  {
    stickerId: { type: Types.ObjectId, ref: 'Sticker', required: true },
    status: {
      type: String,
      enum: ['owned', 'needed', 'duplicate'] satisfies StickerStatus[],
      required: true,
    },
    quantity: { type: Number, default: 1, min: 0 },
  },
  { _id: false }
);

const collectionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, unique: true },
    entries: [entrySchema],
  },
  { timestamps: true }
);

export const Collection = model('Collection', collectionSchema);
