export type UserStatus = 'ATIVO' | 'PENDENTE' | 'EMAIL_PENDENTE';

export interface User {
  _id: string;
  name: string;
  email: string;
  publicId: string;
  status: UserStatus;
  tokenVersao: number;
  emailPendente: string | null;
  ultimoEnvioEmailPendenteEm: string | null;
  declaracaoMaioridadeEm: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
}

export interface SwapOffer {
  _id: string;
  fromUser: string;
  toUser?: string;
  offeredStickers: string[];
  wantedStickers: string[];
  status: 'open' | 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}
