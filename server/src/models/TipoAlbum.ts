import { Schema, model } from 'mongoose';

const tipoAlbumSchema = new Schema({
  nome: { type: String, required: true, unique: true },
  totalFigurinhas: { type: Number, required: true, min: [1, 'totalFigurinhas deve ser maior que zero'] },
});

export const TipoAlbum = model('TipoAlbum', tipoAlbumSchema);
