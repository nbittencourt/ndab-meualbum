import { Schema, model } from 'mongoose';

const tipoAlbumSchema = new Schema({
  nome: { type: String, required: true, unique: true },
  totalFigurinhas: { type: Number, required: true, default: 0 },
});

export const TipoAlbum = model('TipoAlbum', tipoAlbumSchema);
