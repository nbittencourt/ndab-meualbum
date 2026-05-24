import { Schema, Types, model } from 'mongoose';

const VERSAO_POLITICA_ATUAL = '1.0';

const consentimentoCookieSchema = new Schema({
  usuarioId: { type: Types.ObjectId, ref: 'User', default: null },
  sessionId: { type: String, default: null },
  analytics: { type: Boolean, required: true, default: true },
  publicidade: { type: Boolean, required: true, default: false },
  versaoPolitica: { type: String, required: true, default: VERSAO_POLITICA_ATUAL },
  concedidoEm: { type: Date, required: true, default: Date.now },
  expiraEm: { type: Date, required: true },
});

consentimentoCookieSchema.index({ usuarioId: 1, concedidoEm: -1 });
consentimentoCookieSchema.index({ sessionId: 1 }, { sparse: true });
consentimentoCookieSchema.index({ expiraEm: 1 }, { expireAfterSeconds: 157680000 }); // TTL 5 anos

export { VERSAO_POLITICA_ATUAL };
export const ConsentimentoCookie = model('ConsentimentoCookie', consentimentoCookieSchema);
