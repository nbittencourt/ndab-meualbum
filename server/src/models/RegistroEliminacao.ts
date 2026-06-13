import { Schema, model } from 'mongoose';

/**
 * Registro auditável de eliminação de dados (RN-PR01 / R-PR-01 do guia LGPD).
 * Contém apenas contagens e critérios — nenhum dado pessoal.
 */
const registroEliminacaoSchema = new Schema({
  executadoEm: { type: Date, required: true, default: Date.now },
  regra: { type: String, required: true },
  colecao: { type: String, required: true },
  criterio: { type: String, required: true },
  documentosEliminados: { type: Number, required: true },
  origem: { type: String, enum: ['scheduler', 'manual'], required: true },
});

registroEliminacaoSchema.index({ executadoEm: -1 });

export const RegistroEliminacao = model('RegistroEliminacao', registroEliminacaoSchema);
