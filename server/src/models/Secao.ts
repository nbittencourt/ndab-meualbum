import { Schema, Types, model } from 'mongoose';

const secaoSchema = new Schema({
  tipoAlbumId: { type: Types.ObjectId, ref: 'TipoAlbum', required: true, index: true },
  nome: { type: String, required: true, trim: true },
  ordem: { type: Number, required: true, default: 0 },
  totalFigurinhas: { type: Number, required: true, default: 0 },
  grupo: { type: String },
  sigla_time: { type: String },
});

secaoSchema.index({ tipoAlbumId: 1, ordem: 1 });

export const Secao = model('Secao', secaoSchema);
