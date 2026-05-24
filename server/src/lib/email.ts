import { Resend } from 'resend';
import { logger, maskEmail } from './logger.js';

const FROM = 'MeuAlbum <naoresponda@ndab-meualbum-prd.web.app>';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendEmailConfirmacaoCadastro(to: string, confirmUrl: string) {
  if (!process.env.RESEND_API_KEY) {
    logger.debug('email:dev-fallback', { to: maskEmail(to), template: 'confirmacao-cadastro', url: confirmUrl });
    return;
  }
  await getResend().emails.send({
    from: FROM,
    to,
    subject: 'Confirme seu cadastro no MeuAlbum',
    html: `<p>Clique no link para confirmar seu cadastro:</p><p><a href="${confirmUrl}">${confirmUrl}</a></p>`,
  });
  logger.info('email:sent', { to: maskEmail(to), template: 'confirmacao-cadastro' });
}

export async function sendEmailAlteracaoEmail(to: string, confirmUrl: string) {
  if (!process.env.RESEND_API_KEY) {
    logger.debug('email:dev-fallback', { to: maskEmail(to), template: 'alteracao-email', url: confirmUrl });
    return;
  }
  await getResend().emails.send({
    from: FROM,
    to,
    subject: 'Confirme seu novo email no MeuAlbum',
    html: `<p>Clique no link para confirmar o novo email:</p><p><a href="${confirmUrl}">${confirmUrl}</a></p>`,
  });
  logger.info('email:sent', { to: maskEmail(to), template: 'alteracao-email' });
}

export async function sendEmailRecuperacaoSenha(to: string, resetUrl: string) {
  if (!process.env.RESEND_API_KEY) {
    logger.debug('email:dev-fallback', { to: maskEmail(to), template: 'recuperacao-senha', url: resetUrl });
    return;
  }
  await getResend().emails.send({
    from: FROM,
    to,
    subject: 'Redefinição de senha — MeuAlbum',
    html: `<p>Clique no link para redefinir sua senha (válido por 1 hora):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });
  logger.info('email:sent', { to: maskEmail(to), template: 'recuperacao-senha' });
}
