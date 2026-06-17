import { TokenOperacao } from '../models/TokenOperacao.js';
import { TokenConfirmacaoCadastro } from '../models/TokenConfirmacaoCadastro.js';
import { ConsentimentoCookie } from '../models/ConsentimentoCookie.js';
import { RegistroEliminacao } from '../models/RegistroEliminacao.js';
import { logger } from './logger.js';

const DIA_MS = 24 * 60 * 60 * 1000;
const RETENCAO_TOKENS_DIAS = 90; // §3 spec_privacidade_lgpd.md
const RETENCAO_CONSENTIMENTO_ANOS = 5; // Art. 8º LGPD

export interface ResultadoPurga {
  executadoEm: Date;
  eliminacoes: Array<{ colecao: string; eliminados: number }>;
}

/**
 * Rotina de purga com registro de eliminação (RN-PR01).
 * Os TTL indexes do MongoDB permanecem como contingência; esta rotina executa
 * o mesmo critério de forma auditável — quem chegar primeiro elimina.
 */
export async function executarPurga(origem: 'scheduler' | 'manual'): Promise<ResultadoPurga> {
  const agora = new Date();
  const limiteTokens = new Date(agora.getTime() - RETENCAO_TOKENS_DIAS * DIA_MS);
  const limiteConsentimento = new Date(agora.getTime() - RETENCAO_CONSENTIMENTO_ANOS * 365 * DIA_MS);

  const alvos = [
    {
      regra: 'RN-PR01: tokens de operação expirados há mais de 90 dias',
      colecao: 'tokenoperacaos',
      criterio: `expiraEm < ${limiteTokens.toISOString()}`,
      executar: () => TokenOperacao.deleteMany({ expiraEm: { $lt: limiteTokens } }),
    },
    {
      regra: 'RN-PR01: tokens de confirmação de cadastro expirados há mais de 90 dias',
      colecao: 'tokenconfirmacaocadastros',
      criterio: `expiraEm < ${limiteTokens.toISOString()}`,
      executar: () => TokenConfirmacaoCadastro.deleteMany({ expiraEm: { $lt: limiteTokens } }),
    },
    {
      regra: 'Art. 8º: registros de consentimento além da retenção de 5 anos',
      colecao: 'consentimentocookies',
      criterio: `expiraEm < ${limiteConsentimento.toISOString()}`,
      executar: () => ConsentimentoCookie.deleteMany({ expiraEm: { $lt: limiteConsentimento } }),
    },
  ];

  const eliminacoes: ResultadoPurga['eliminacoes'] = [];
  for (const alvo of alvos) {
    const { deletedCount } = await alvo.executar();
    await RegistroEliminacao.create({
      executadoEm: agora,
      regra: alvo.regra,
      colecao: alvo.colecao,
      criterio: alvo.criterio,
      documentosEliminados: deletedCount ?? 0,
      origem,
    });
    logger.info('purga:executada', { colecao: alvo.colecao, eliminados: deletedCount ?? 0, origem });
    eliminacoes.push({ colecao: alvo.colecao, eliminados: deletedCount ?? 0 });
  }

  return { executadoEm: agora, eliminacoes };
}
