import { Schema, model } from 'mongoose';
import type { TokenOperacaoTipo } from '@meualbum/shared';

const tokenOperacaoSchema = new Schema({
  token: { type: String, required: true, unique: true },
  usuarioIdentificador: { type: String, required: true, uppercase: true },
  tipo: {
    type: String,
    enum: ['RECUPERACAO_SENHA', 'ALTERACAO_EMAIL'] satisfies TokenOperacaoTipo[],
    required: true,
  },
  emailNovo: { type: String, default: null, lowercase: true },
  criadoEm: { type: Date, required: true, default: Date.now },
  expiraEm: { type: Date, required: true },
  usadoEm: { type: Date, default: null },
});

tokenOperacaoSchema.index({ usuarioIdentificador: 1, tipo: 1, criadoEm: -1 });
tokenOperacaoSchema.index({ expiraEm: 1 }, { expireAfterSeconds: 7776000 }); // TTL 90 dias

export const TokenOperacao = model('TokenOperacao', tokenOperacaoSchema);
