import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

function generatePublicId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    status: {
      type: String,
      enum: ['ATIVO', 'PENDENTE', 'EMAIL_PENDENTE'],
      default: 'PENDENTE',
    },
    publicId: { type: String, unique: true, sparse: true },
    tokenVersao: { type: Number, required: true, default: 1 },
    emailPendente: { type: String, default: null, lowercase: true },
    ultimoEnvioEmailPendenteEm: { type: Date, default: null },
    declaracaoMaioridadeEm: { type: Date, default: null },
    ultimoEnvioEm: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash as string);
};

userSchema.pre('save', async function () {
  if (this.isModified('passwordHash')) {
    const rounds = process.env.NODE_ENV === 'production' ? 12 : 10;
    this.passwordHash = await bcrypt.hash(this.passwordHash as string, rounds);
  }
  if (!this.publicId) {
    this.publicId = generatePublicId();
  }
});

export const User = model('User', userSchema);
