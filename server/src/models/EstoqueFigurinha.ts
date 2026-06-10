import { Schema, Types, model } from 'mongoose';

const estoqueFigurinhaSchema = new Schema({
  usuarioId: { type: Types.ObjectId, ref: 'User', required: true },
  figurinhaId: { type: Types.ObjectId, ref: 'Sticker', required: true },
  quantidade: { type: Number, required: true, min: 0, default: 0 },
});

estoqueFigurinhaSchema.index({ usuarioId: 1, figurinhaId: 1 }, { unique: true });

export const EstoqueFigurinha = model('EstoqueFigurinha', estoqueFigurinhaSchema);
