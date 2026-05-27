import { Router } from 'express';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { ZipArchive } from 'archiver';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { sendEmailAlteracaoEmail } from '../lib/email.js';
import { logger, maskEmail } from '../lib/logger.js';
import { User } from '../models/User.js';
import { TokenOperacao } from '../models/TokenOperacao.js';
import { Album } from '../models/Album.js';
import { FigurinhaColada } from '../models/FigurinhaColada.js';
import { EstoqueFigurinha } from '../models/EstoqueFigurinha.js';
import { PilhaDaSessao } from '../models/PilhaDaSessao.js';
import { TokenConfirmacaoCadastro } from '../models/TokenConfirmacaoCadastro.js';

const router = Router();
const COOLDOWN_MINS = 5;
const CLIENT_URL = () => process.env.CLIENT_URL ?? 'http://localhost:5173';

const passwordPolicy = (p: string) =>
  p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p) &&
  /[!@#$%^&*()_+\-=\[\]{}|;':",.<>?/~`]/.test(p);

function issueToken(userId: string, tokenVersao: number, res: import('express').Response) {
  const token = jwt.sign({ sub: userId, tokenVersao }, process.env.JWT_SECRET!, { expiresIn: '30d' });
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('__session', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

router.patch('/nome', requireAuth, async (req: AuthRequest, res) => {
  const parsed = z.object({ name: z.string().min(2).max(100).trim() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { name } = parsed.data;
  const user = await User.findByIdAndUpdate(req.userId, { name }, { new: true }).lean();
  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }
  const u = user as any;
  res.json({ ok: true, user: {
    _id: u._id, name: u.name, email: u.email, publicId: u.publicId,
    status: u.status, tokenVersao: u.tokenVersao,
    emailPendente: u.emailPendente ?? null,
    declaracaoMaioridadeEm: u.declaracaoMaioridadeEm ?? null,
  } });
});

router.post('/email', requireAuth, async (req: AuthRequest, res) => {
  const parsedEmail = z.object({ email: z.string().email().toLowerCase() }).safeParse(req.body);
  if (!parsedEmail.success) {
    res.status(400).json({ error: parsedEmail.error.flatten() });
    return;
  }
  const { email } = parsedEmail.data;
  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }
  if (email === (user as any).email) {
    res.status(400).json({ error: 'Novo email igual ao atual' });
    return;
  }
  if (await User.exists({ email, _id: { $ne: user._id } })) {
    res.status(409).json({ error: 'Email já está em uso' });
    return;
  }
  const now = new Date();
  const ultimo = (user as any).ultimoEnvioEmailPendenteEm as Date | null;
  if (ultimo && now.getTime() - ultimo.getTime() < COOLDOWN_MINS * 60 * 1000) {
    logger.warn('profile:email-cooldown', { userId: req.userId });
    res.status(429).json({ error: 'COOLDOWN', message: `Aguarde ${COOLDOWN_MINS} minutos antes de solicitar novamente.` });
    return;
  }

  const token = randomUUID();
  const expiraEm = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  await TokenOperacao.create({
    token,
    usuarioIdentificador: (user as any).publicId,
    tipo: 'ALTERACAO_EMAIL',
    emailNovo: email,
    criadoEm: now,
    expiraEm,
  });

  (user as any).emailPendente = email;
  (user as any).ultimoEnvioEmailPendenteEm = now;
  (user as any).status = 'EMAIL_PENDENTE';
  await user.save();

  const confirmUrl = `${CLIENT_URL()}/confirmar-email?token=${token}`;
  await sendEmailAlteracaoEmail(email, confirmUrl);

  logger.info('profile:email-change-requested', { email: maskEmail(email), userId: req.userId });
  res.json({ ok: true, message: 'Email de confirmação enviado.' });
});

router.get('/confirmar-email', async (req, res) => {
  const { token } = req.query;
  if (!token) {
    res.status(400).json({ error: 'TOKEN_INVALID' });
    return;
  }
  const now = new Date();
  const tokenDoc = await TokenOperacao.findOne({
    token,
    tipo: 'ALTERACAO_EMAIL',
    usadoEm: null,
    expiraEm: { $gt: now },
  });
  if (!tokenDoc) {
    res.status(400).json({ error: 'TOKEN_INVALID' });
    return;
  }
  const user = await User.findOne({ publicId: tokenDoc.usuarioIdentificador });
  if (!user) {
    res.status(400).json({ error: 'TOKEN_INVALID' });
    return;
  }
  (user as any).email = tokenDoc.emailNovo;
  (user as any).emailPendente = null;
  (user as any).ultimoEnvioEmailPendenteEm = null;
  (user as any).status = 'ATIVO';
  await user.save();
  tokenDoc.usadoEm = now;
  await tokenDoc.save();
  logger.info('profile:email-confirmed', { userId: String(user._id) });
  res.json({ ok: true });
});

router.post('/reenviar-email', requireAuth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.userId);
  if (!user || !(user as any).emailPendente) {
    res.status(400).json({ error: 'Sem alteração de email pendente' });
    return;
  }
  const now = new Date();
  const ultimo = (user as any).ultimoEnvioEmailPendenteEm as Date | null;
  if (ultimo && now.getTime() - ultimo.getTime() < COOLDOWN_MINS * 60 * 1000) {
    res.status(429).json({ error: 'COOLDOWN' });
    return;
  }
  const token = randomUUID();
  const expiraEm = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  await TokenOperacao.create({
    token,
    usuarioIdentificador: (user as any).publicId,
    tipo: 'ALTERACAO_EMAIL',
    emailNovo: (user as any).emailPendente,
    criadoEm: now,
    expiraEm,
  });
  (user as any).ultimoEnvioEmailPendenteEm = now;
  await user.save();

  const confirmUrl = `${CLIENT_URL()}/confirmar-email?token=${token}`;
  await sendEmailAlteracaoEmail((user as any).emailPendente, confirmUrl);

  res.json({ ok: true });
});

router.post('/cancelar-alteracao-email', requireAuth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }
  (user as any).emailPendente = null;
  (user as any).ultimoEnvioEmailPendenteEm = null;
  if ((user as any).status === 'EMAIL_PENDENTE') {
    (user as any).status = 'ATIVO';
  }
  await user.save();
  res.json({ ok: true });
});

router.patch('/senha', requireAuth, async (req: AuthRequest, res) => {
  const parsedSenha = z.object({
    senhaAtual: z.string(),
    novaSenha: z.string().min(8),
  }).safeParse(req.body);
  if (!parsedSenha.success) {
    res.status(400).json({ error: parsedSenha.error.flatten() });
    return;
  }
  const { senhaAtual, novaSenha } = parsedSenha.data;

  if (!passwordPolicy(novaSenha)) {
    res.status(400).json({ error: 'Senha não atende à política de segurança' });
    return;
  }

  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }
  if (!(await (user as any).comparePassword(senhaAtual))) {
    logger.warn('profile:password-wrong', { userId: req.userId });
    res.status(401).json({ error: 'Senha atual incorreta' });
    return;
  }

  (user as any).passwordHash = novaSenha;
  (user as any).tokenVersao = ((user as any).tokenVersao as number) + 1;
  await user.save();

  issueToken(user.id as string, (user as any).tokenVersao as number, res);
  logger.info('profile:password-changed', { userId: req.userId });
  res.json({ ok: true });
});

router.get('/exportar', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const user = await User.findById(userId).lean();
  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }

  const [albums, coladas, estoque, pilha] = await Promise.all([
    Album.find({ usuarioId: userId }).populate('tipoAlbumId').lean(),
    FigurinhaColada.find({ albumId: { $in: (await Album.find({ usuarioId: userId }).distinct('_id')) } })
      .populate('figurinhaId').lean(),
    EstoqueFigurinha.find({ usuarioId: userId }).populate('figurinhaId').lean(),
    PilhaDaSessao.find({ usuarioId: userId }).lean(),
  ]);

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="meus-dados.zip"');

  const archive = new ZipArchive();
  archive.pipe(res);

  const toCsv = (rows: string[][], header: string[]) =>
    [header, ...rows].map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

  const userU = user as any;
  archive.append(
    toCsv(
      [[userU._id, userU.name, userU.email, userU.publicId, userU.status, userU.createdAt]],
      ['id', 'nome', 'email', 'identificador', 'status', 'criado_em']
    ),
    { name: 'usuario.csv' }
  );

  archive.append(
    toCsv(
      albums.map((a: any) => [a._id, (a.tipoAlbumId as any)?.nome ?? '', a.variante ?? '', a.nomePersonalizado ?? '', a.criadoEm, a.arquivadoEm ?? '']),
      ['id', 'tipo', 'variante', 'nome_personalizado', 'criado_em', 'arquivado_em']
    ),
    { name: 'albums.csv' }
  );

  archive.append(
    toCsv(
      coladas.map((c: any) => [c._id, c.albumId, (c.figurinhaId as any)?.number ?? '', c.origem, c.coladaEm]),
      ['id', 'album_id', 'figurinha_numero', 'origem', 'colada_em']
    ),
    { name: 'figurinhas_coladas.csv' }
  );

  archive.append(
    toCsv(
      estoque.map((e: any) => [e._id, (e.figurinhaId as any)?.number ?? '', e.quantidade]),
      ['id', 'figurinha_numero', 'quantidade']
    ),
    { name: 'estoque_figurinhas.csv' }
  );

  archive.append(
    toCsv(
      pilha.map((p: any) => [p._id, p.tipoAlbumId, p.figurinhaNumero, p.origem, p.statusDestino, p.criadoEm]),
      ['id', 'tipo_album_id', 'figurinha_numero', 'origem', 'status', 'criado_em']
    ),
    { name: 'pilha_sessao.csv' }
  );

  archive.append(
    'Dicionário de colunas:\n' +
    'usuario.csv: id, nome, email, identificador (código 6 chars), status, criado_em\n' +
    'albums.csv: id, tipo (nome do tipo de álbum), variante, nome_personalizado, criado_em, arquivado_em\n' +
    'figurinhas_coladas.csv: id, album_id, figurinha_numero, origem (ESTOQUE|DIRETA), colada_em\n' +
    'estoque_figurinhas.csv: id, figurinha_numero, quantidade\n' +
    'pilha_sessao.csv: id, tipo_album_id, figurinha_numero, origem (DIGITACAO|CAMERA), status (PENDENTE|COLADA|REPETIDA), criado_em\n',
    { name: 'README.txt' }
  );

  await archive.finalize();
});

router.delete('/', requireAuth, async (req: AuthRequest, res) => {
  const parsedId = z.object({ identificador: z.string() }).safeParse(req.body);
  if (!parsedId.success) {
    res.status(400).json({ error: parsedId.error.flatten() });
    return;
  }
  const { identificador } = parsedId.data;
  const user = await User.findById(req.userId);
  if (!user || (user as any).publicId !== identificador.toUpperCase()) {
    logger.warn('profile:delete-wrong-id', { userId: req.userId });
    res.status(400).json({ error: 'Identificador incorreto' });
    return;
  }

  const publicId = (user as any).publicId as string;
  const albumIds = await Album.find({ usuarioId: req.userId }).distinct('_id');
  await Promise.all([
    FigurinhaColada.deleteMany({ albumId: { $in: albumIds } }),
    Album.deleteMany({ usuarioId: req.userId }),
    EstoqueFigurinha.deleteMany({ usuarioId: req.userId }),
    PilhaDaSessao.deleteMany({ usuarioId: req.userId }),
    TokenOperacao.deleteMany({ usuarioIdentificador: publicId }),
    TokenConfirmacaoCadastro.deleteMany({ usuarioId: req.userId }),
    user.deleteOne(),
  ]);

  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('__session', { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax' });
  logger.info('profile:account-deleted', { publicId });
  res.json({ ok: true });
});

export default router;
