import { Router } from 'express';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User.js';
import { TokenOperacao } from '../models/TokenOperacao.js';
import { TokenConfirmacaoCadastro } from '../models/TokenConfirmacaoCadastro.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { sendEmailConfirmacaoCadastro, sendEmailRecuperacaoSenha } from '../lib/email.js';
import { logger, maskEmail } from '../lib/logger.js';

const router = Router();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em alguns instantes.' },
});

// Limites rígidos para endpoints sensíveis de recuperação de senha
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Tente novamente em 1 hora.' },
  skipFailedRequests: false,
});

const checkResetTokenLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em alguns instantes.' },
});

if (process.env.NODE_ENV !== 'test') {
  router.use(limiter);
}

export const passwordPolicy = (p: string) =>
  p.length >= 8 &&
  /[A-Z]/.test(p) &&
  /[a-z]/.test(p) &&
  /[0-9]/.test(p) &&
  /[!@#$%^&*()_+\-=\[\]{}|;':",.<>?/~`]/.test(p);

const CLIENT_URL = () => process.env.CLIENT_URL ?? 'http://localhost:5173';
const JWT_EXPIRY = '30d';
const JWT_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

function issueToken(userId: string, tokenVersao: number, res: import('express').Response) {
  const token = jwt.sign({ sub: userId, tokenVersao }, process.env.JWT_SECRET!, { expiresIn: JWT_EXPIRY });
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('__session', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: JWT_MAX_AGE,
  });
}

function serializeUser(user: any) {
  return {
    _id: user.id ?? user._id,
    name: user.name,
    email: user.email,
    publicId: user.publicId,
    status: user.status,
    tokenVersao: user.tokenVersao,
    emailPendente: user.emailPendente ?? null,
    declaracaoMaioridadeEm: user.declaracaoMaioridadeEm ?? null,
  };
}

export const registerSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
  declaracaoMaioridade: z.literal(true, { errorMap: () => ({ message: 'Declaração de maioridade obrigatória' }) }),
});

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { name, email, password } = parsed.data;
  if (!passwordPolicy(password)) {
    res.status(400).json({ error: 'Senha não atende à política de segurança' });
    return;
  }
  const now = new Date();
  try {
    if (await User.exists({ email })) {
      logger.warn('register:email-exists', { email: maskEmail(email) });
      res.status(409).json({ error: 'Email já cadastrado' });
      return;
    }
    const user = await User.create({
      name,
      email,
      passwordHash: password,
      status: 'PENDENTE',
      declaracaoMaioridadeEm: now,
      ultimoEnvioEm: now,
    });

    const confirmToken = randomUUID();
    await TokenConfirmacaoCadastro.create({
      token: confirmToken,
      usuarioId: user.id,
      criadoEm: now,
      expiraEm: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    });

    const confirmUrl = `${CLIENT_URL()}/confirmar-cadastro?token=${confirmToken}`;
    await sendEmailConfirmacaoCadastro(email, confirmUrl);

    logger.info('register:success', { email: maskEmail(email) });
    res.status(201).json({ ok: true, message: 'Cadastro realizado! Verifique seu email para confirmar a conta.' });
  } catch (err: any) {
    logger.error('register:error', { email: maskEmail(email), err: err?.message });
    if (err.code === 11000) {
      res.status(409).json({ error: 'Email já cadastrado' });
    } else {
      res.status(500).json({ error: 'Erro interno ao criar conta.' });
    }
  }
});

router.get('/confirmar-cadastro', async (req, res) => {
  const token = req.query.token as string;
  if (!token) {
    res.status(400).json({ error: 'TOKEN_INVALID' });
    return;
  }
  const now = new Date();
  const confirmToken = await TokenConfirmacaoCadastro.findOne({
    token,
    usadoEm: null,
    expiraEm: { $gt: now },
  });
  if (!confirmToken) {
    res.status(400).json({ error: 'TOKEN_INVALID' });
    return;
  }
  const user = await User.findById(confirmToken.usuarioId);
  if (!user) {
    res.status(400).json({ error: 'TOKEN_INVALID' });
    return;
  }
  (user as any).status = 'ATIVO';
  await user.save();
  confirmToken.usadoEm = now;
  await confirmToken.save();

  issueToken(user.id as string, (user as any).tokenVersao as number, res);
  logger.info('register:confirmed', { publicId: (user as any).publicId });
  res.json({ ok: true, user: serializeUser(user) });
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { email: emailRaw, password } = parsed.data;
  const email = emailRaw.toLowerCase();
  const user = await User.findOne({ email });
  if (!user || !(await (user as any).comparePassword(password))) {
    logger.warn('login:failed', { email: maskEmail(email) });
    res.status(401).json({ error: 'Email ou senha incorretos' });
    return;
  }
  const status = (user as any).status as string;
  if (status === 'PENDENTE') {
    logger.warn('login:email-not-confirmed', { email: maskEmail(email) });
    res.status(403).json({
      error: 'EMAIL_NAO_CONFIRMADO',
      publicId: (user as any).publicId,
      ultimoEnvioEm: (user as any).ultimoEnvioEm ?? null,
    });
    return;
  }
  // Increment tokenVersao to invalidate all previous sessions (RN-L29)
  const updated = await User.findByIdAndUpdate(user.id, { $inc: { tokenVersao: 1 } }, { new: true });
  const newVersao = (updated as any)?.tokenVersao ?? ((user as any).tokenVersao as number) + 1;
  logger.info('login:success', { email: maskEmail(email) });
  issueToken(user.id as string, newVersao, res);
  res.json({ user: serializeUser(updated ?? user) });
});

router.post('/logout', requireAuth, async (req: AuthRequest, res) => {
  await User.findByIdAndUpdate(req.userId, { $inc: { tokenVersao: 1 } });
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('__session', { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax' });
  logger.info('logout:success', { userId: req.userId });
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.userId).select('-passwordHash');
  if (!user) {
    res.status(401).json({ error: 'Usuário não encontrado' });
    return;
  }
  res.json({ user: serializeUser(user) });
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

router.post('/forgot-password', ...(process.env.NODE_ENV !== 'test' ? [forgotPasswordLimiter] : []), async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { email } = parsed.data;
  const successMsg = { ok: true, message: 'Se esse email estiver cadastrado, você receberá um link em instantes.' };

  const user = await User.findOne({ email });
  if (!user) {
    res.json(successMsg);
    return;
  }

  const token = randomUUID();
  const now = new Date();
  const expiraEm = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  await TokenOperacao.create({
    token,
    usuarioIdentificador: (user as any).publicId,
    tipo: 'RECUPERACAO_SENHA',
    emailNovo: null,
    criadoEm: now,
    expiraEm,
  });

  const resetUrl = `${CLIENT_URL()}/redefinir-senha?token=${token}`;
  await sendEmailRecuperacaoSenha(email, resetUrl);

  logger.info('forgot-password:sent', { email: maskEmail(email) });
  res.json(successMsg);
});

router.get('/check-reset-token', ...(process.env.NODE_ENV !== 'test' ? [checkResetTokenLimiter] : []), async (req, res) => {
  const token = req.query.token as string;
  if (!token) {
    res.json({ valid: false });
    return;
  }
  const now = new Date();
  const exists = await TokenOperacao.exists({
    token,
    tipo: 'RECUPERACAO_SENHA',
    usadoEm: null,
    expiraEm: { $gt: now },
  });
  res.json({ valid: !!exists });
});

export const resetPasswordSchema = z.object({
  token: z.string().uuid(),
  password: z.string().min(8),
});

router.post('/reset-password', async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { token, password } = parsed.data;

  if (!passwordPolicy(password)) {
    res.status(400).json({ error: 'Senha não atende à política de segurança' });
    return;
  }

  const now = new Date();
  const resetToken = await TokenOperacao.findOne({
    token,
    tipo: 'RECUPERACAO_SENHA',
    usadoEm: null,
    expiraEm: { $gt: now },
  });

  if (!resetToken) {
    res.status(400).json({ error: 'TOKEN_INVALID' });
    return;
  }

  const user = await User.findOne({ publicId: resetToken.usuarioIdentificador });
  if (!user) {
    res.status(400).json({ error: 'TOKEN_INVALID' });
    return;
  }

  (user as any).passwordHash = password;
  (user as any).tokenVersao = ((user as any).tokenVersao as number) + 1;
  await user.save();

  resetToken.usadoEm = now;
  await resetToken.save();

  issueToken(user.id as string, (user as any).tokenVersao as number, res);
  logger.info('reset-password:success', { publicId: (user as any).publicId });
  res.json({ ok: true, user: serializeUser(user) });
});

export default router;
