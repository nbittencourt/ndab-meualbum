import { Schema, Types, model } from 'mongoose';
import type { FigurinhaOrigem } from '@meualbum/shared';

const figurinhaColadaSchema = new Schema({
  albumId: { type: Types.ObjectId, ref: 'Album', required: true, index: true },
  figurinhaId: { type: Types.ObjectId, ref: 'Sticker', required: true },
  origem: {
    type: String,
    enum: ['ESTOQUE', 'DIRETA'] satisfies FigurinhaOrigem[],
    required: true,
  },
  coladaEm: { type: Date, default: Date.now },
});

figurinhaColadaSchema.index({ albumId: 1, figurinhaId: 1 }, { unique: true });

export const FigurinhaColada = model('FigurinhaColada', figurinhaColadaSchema);
