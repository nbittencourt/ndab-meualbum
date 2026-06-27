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
    shareToken: { type: String, default: null },
  },
  { timestamps: { createdAt: 'criadoEm', updatedAt: false } }
);

albumSchema.index({ usuarioId: 1, arquivadoEm: 1 });
// Partial em vez de sparse: o campo tem `default: null`, então existe em todos
// os documentos e um índice sparse ainda indexaria as chaves null (E11000 em
// múltiplos álbuns). O partial indexa apenas tokens reais (string).
albumSchema.index(
  { shareToken: 1 },
  { unique: true, partialFilterExpression: { shareToken: { $type: 'string' } } }
);

export const Album = model('Album', albumSchema);
