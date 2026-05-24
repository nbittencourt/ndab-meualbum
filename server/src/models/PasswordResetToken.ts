import { Schema, model } from 'mongoose';

const passwordResetTokenSchema = new Schema({
  token: { type: String, required: true, unique: true },
  usuarioEmail: { type: String, required: true, lowercase: true },
  criadoEm: { type: Date, required: true },
  expiraEm: { type: Date, required: true },
  usadoEm: { type: Date, default: null },
});

passwordResetTokenSchema.index({ usuarioEmail: 1, criadoEm: -1 });

export const PasswordResetToken = model('PasswordResetToken', passwordResetTokenSchema);
