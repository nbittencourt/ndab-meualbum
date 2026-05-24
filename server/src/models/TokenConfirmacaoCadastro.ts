import { Schema, Types, model } from 'mongoose';

const tokenConfirmacaoCadastroSchema = new Schema({
  token: { type: String, required: true, unique: true },
  usuarioId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  criadoEm: { type: Date, required: true, default: Date.now },
  expiraEm: { type: Date, required: true },
  usadoEm: { type: Date, default: null },
});

tokenConfirmacaoCadastroSchema.index({ expiraEm: 1 }, { expireAfterSeconds: 7776000 }); // TTL 90 dias

export const TokenConfirmacaoCadastro = model('TokenConfirmacaoCadastro', tokenConfirmacaoCadastroSchema);
