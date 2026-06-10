import { Schema, Types, model } from 'mongoose';
import type { AlbumVariante } from '@meualbum/shared';

const albumSchema = new Schema(
  {
    usuarioId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    tipoAlbumId: { type: Types.ObjectId, ref: 'TipoAlbum', required: true },
    variante: {
      type: String,
      enum: ['BROCHURA', 'CAPA_DURA', 'CAPA_DURA_PRATA', 'CAPA_DURA_OURO', 'BOX_PREMIUM'] satisfies AlbumVariante[],
      required: true,
    },
    nomePersonalizado: { type: String, trim: true, default: null, maxlength: 60 },
    arquivadoEm: { type: Date, default: null },
  },
  { timestamps: { createdAt: 'criadoEm', updatedAt: false } }
);

albumSchema.index({ usuarioId: 1, arquivadoEm: 1 });

export const Album = model('Album', albumSchema);
