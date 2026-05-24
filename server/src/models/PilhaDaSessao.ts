import { Schema, Types, model } from 'mongoose';
import type { StatusDestino, PilhaOrigem } from '@meualbum/shared';

const pilhaDaSessaoSchema = new Schema({
  usuarioId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  tipoAlbumId: { type: Types.ObjectId, ref: 'TipoAlbum', required: true },
  figurinhaId: { type: Types.ObjectId, ref: 'Sticker', default: null },
  figurinhaNumero: { type: String, required: true },
  figurinhaNome: { type: String, default: null },
  origem: {
    type: String,
    enum: ['DIGITACAO', 'CAMERA'] satisfies PilhaOrigem[],
    required: true,
  },
  statusDestino: {
    type: String,
    enum: ['PENDENTE', 'COLADA', 'REPETIDA'] satisfies StatusDestino[],
    default: 'PENDENTE',
  },
  criadoEm: { type: Date, default: Date.now },
});

pilhaDaSessaoSchema.index({ usuarioId: 1, statusDestino: 1, criadoEm: 1 });

export const PilhaDaSessao = model('PilhaDaSessao', pilhaDaSessaoSchema);
