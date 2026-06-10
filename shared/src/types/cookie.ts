export interface PreferenciasCookie {
  analytics: boolean;
  publicidade: boolean;
}

export interface ConsentimentoCookie {
  _id: string;
  usuarioId: string | null;
  analytics: boolean;
  publicidade: boolean;
  versaoPolitica: string;
  concedidoEm: string;
  expiraEm: string;
}
