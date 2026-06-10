/**
 * Gestão de consentimento de cookies — LGPD / spec_privacidade_lgpd.md §5
 *
 * Entidade: ConsentimentoCookie
 *   analytics      Boolean  — true = usuário não optou por sair
 *   publicidade    Boolean  — true = usuário consentiu explicitamente
 *   versao_politica String  — versão da política em vigor no ato
 *   concedido_em   ISO string
 *   expira_em      ISO string — concedido_em + 12 meses (RN-PR08)
 *
 * Regras:
 *   RN-PR05: banner exibido quando: sem consentimento, expirado, ou versão desatualizada
 *   RN-PR06: publicidade = opt-in; inativo via "Remover não essenciais"
 *   RN-PR07: analytics = opt-out via "Remover não essenciais"
 *   RN-PR08: expiração em 12 meses
 *   RN-PR09: mudança de versão invalida consentimentos anteriores
 */

/** Versão atual da Política de Privacidade. Incrementar em mudanças materiais. */
export const CURRENT_POLICY_VERSION = '1.1';

const STORAGE_KEY = 'cookie-consent-data';

export interface ConsentimentoCookie {
  analytics: boolean;
  publicidade: boolean;
  versao_politica: string;
  concedido_em: string; // ISO
  expira_em: string;    // ISO — +12 meses
}

/** Lê o consentimento armazenado, ou null se ausente/inválido. */
export function getConsent(): ConsentimentoCookie | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentimentoCookie;
    // Validação mínima de estrutura
    if (typeof parsed.analytics !== 'boolean') return null;
    if (typeof parsed.publicidade !== 'boolean') return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Retorna true quando há um consentimento válido, não-expirado e na versão atual.
 * Usado para decidir se o banner deve ser exibido (RN-PR05).
 */
export function hasValidConsent(): boolean {
  const consent = getConsent();
  if (!consent) return false;
  if (!consent.expira_em || new Date(consent.expira_em) <= new Date()) return false; // RN-PR08
  if (consent.versao_politica !== CURRENT_POLICY_VERSION) return false;              // RN-PR09
  return true;
}

/**
 * Persiste a escolha do usuário.
 * - "Aceitar"              → analytics=true,  publicidade=true  (RN-PR06/RN-PR07)
 * - "Remover não essenciais" → analytics=false, publicidade=false
 */
export function saveConsent(analytics: boolean, publicidade: boolean): ConsentimentoCookie {
  const now = new Date();
  const expira = new Date(now);
  expira.setFullYear(expira.getFullYear() + 1); // RN-PR08: 12 meses

  const consent: ConsentimentoCookie = {
    analytics,
    publicidade,
    versao_politica: CURRENT_POLICY_VERSION,
    concedido_em: now.toISOString(),
    expira_em: expira.toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  return consent;
}
