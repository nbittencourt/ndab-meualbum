export type TokenOperacaoTipo = 'RECUPERACAO_SENHA' | 'ALTERACAO_EMAIL';

export interface TokenOperacao {
  _id: string;
  token: string;
  usuarioIdentificador: string;
  tipo: TokenOperacaoTipo;
  emailNovo: string | null;
  criadoEm: string;
  expiraEm: string;
  usadoEm: string | null;
}

export interface TokenConfirmacaoCadastro {
  _id: string;
  token: string;
  usuarioId: string;
  criadoEm: string;
  expiraEm: string;
  usadoEm: string | null;
}
