import type { User, AuthResponse, HomeData, Album, AlbumVariante, PreferenciasCookie, EstoqueItem, PilhaDaSessao, PilhaOrigem, SecaoGrid } from '@meualbum/shared';

const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api/v1';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { skipAuthRedirect?: boolean } = {}
): Promise<T> {
  const { skipAuthRedirect, ...fetchOptions } = options;
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...fetchOptions.headers },
    ...fetchOptions,
  });

  if (res.status === 401) {
    if (!skipAuthRedirect) {
      window.location.href = '/';
      throw new ApiError(401, 'Não autenticado');
    }
    const errData = await res.json().catch(() => ({}));
    throw new ApiError(401, (errData as { error?: string }).error ?? 'Não autenticado', errData);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, data?.error ?? `HTTP ${res.status}`, data);
  }

  return data as T;
}

export const authApi = {
  register: (name: string, email: string, password: string, declaracaoMaioridade: true) =>
    request<{ ok: boolean; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, declaracaoMaioridade }),
    }),

  confirmarCadastro: (token: string) =>
    request<AuthResponse>('/auth/confirmar-cadastro' + `?token=${token}`, { skipAuthRedirect: true }),

  reenviarConfirmacaoCadastro: (publicId: string) =>
    request<{ ok: boolean; cooldownSecs: number }>('/auth/reenviar-confirmacao', {
      method: 'POST',
      body: JSON.stringify({ publicId }),
      skipAuthRedirect: true,
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuthRedirect: true,
    }),

  logout: () => request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),

  me: () => request<AuthResponse>('/auth/me', { skipAuthRedirect: true }),

  forgotPassword: (email: string) =>
    request<{ ok: boolean; message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    request<{ ok: boolean; user?: User }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),

  checkResetToken: (token: string) =>
    request<{ valid: boolean }>(`/auth/check-reset-token?token=${encodeURIComponent(token)}`, {
      skipAuthRedirect: true,
    }),
};

export const homeApi = {
  getHome: (pagina = 1) =>
    request<HomeData>(`/home?pagina=${pagina}`),
};

export const albumsApi = {
  create: (tipoAlbumId: string, variante: AlbumVariante, nomePersonalizado?: string) =>
    request<{ album: Album; temEstoque: boolean }>('/albums', {
      method: 'POST',
      body: JSON.stringify({ tipoAlbumId, variante, nomePersonalizado }),
    }),

  list: () =>
    request<{ ativos: Album[]; arquivados: Album[] }>('/albums'),

  get: (id: string) =>
    request<{ album: Album; secoes: Array<{ _id: string; nome: string; ordem: number; totalFigurinhas: number; figurinhasColadas: number }> }>(`/albums/${id}`),

  faltantes: (id: string) =>
    request<{ faltantes: Array<{ numero: string; nome: string; secaoId: string }> }>(`/albums/${id}/faltantes`),

  arquivar: (id: string) =>
    request<{ album: Album }>(`/albums/${id}/arquivar`, { method: 'PATCH' }),

  desarquivar: (id: string) =>
    request<{ album: Album }>(`/albums/${id}/desarquivar`, { method: 'PATCH' }),

  getTipos: () =>
    request<{ tipos: Array<{ _id: string; nome: string; totalFigurinhas: number }> }>('/albums/tipos'),

  getFigurinhas: (id: string) =>
    request<{ secoes: SecaoGrid[] }>(`/albums/${id}/figurinhas`),

  removerColada: (albumId: string, numero: string) =>
    request<{ ok: boolean }>(`/albums/${albumId}/colada/${encodeURIComponent(numero)}`, { method: 'DELETE' }),

  compartilhar: (albumId: string) =>
    request<{ token: string }>(`/albums/${albumId}/share`, { method: 'POST' }),

  revogarCompartilhamento: (albumId: string) =>
    request<{ ok: boolean }>(`/albums/${albumId}/share`, { method: 'DELETE' }),
};

export const profileApi = {
  getProfile: () =>
    request<{ user: User }>('/auth/me'),

  alterarNome: (nome: string) =>
    request<{ ok: boolean; user: User }>('/profile/nome', {
      method: 'PATCH',
      body: JSON.stringify({ name: nome }),
    }),

  solicitarAlteracaoEmail: (email: string) =>
    request<{ ok: boolean; message: string }>('/profile/email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  confirmarEmail: (token: string) =>
    request<{ ok: boolean }>(`/profile/confirmar-email?token=${token}`, { skipAuthRedirect: true }),

  reenviarEmailConfirmacao: () =>
    request<{ ok: boolean }>('/profile/reenviar-email', { method: 'POST' }),

  cancelarAlteracaoEmail: () =>
    request<{ ok: boolean }>('/profile/cancelar-alteracao-email', { method: 'POST' }),

  alterarSenha: (senhaAtual: string, senhaNova: string) =>
    request<{ ok: boolean }>('/profile/senha', {
      method: 'PATCH',
      body: JSON.stringify({ senhaAtual, novaSenha: senhaNova }),
      skipAuthRedirect: true,
    }),

  exportarDados: async (): Promise<Blob> => {
    const res = await fetch(`${BASE}/profile/exportar`, { credentials: 'include' });
    if (!res.ok) throw new ApiError(res.status, 'Erro ao exportar dados');
    return res.blob();
  },

  excluirConta: (identificador: string) =>
    request<{ ok: boolean }>('/profile', {
      method: 'DELETE',
      body: JSON.stringify({ identificador }),
    }),
};

export const abrirPacotinhosApi = {
  getPilha: () =>
    request<{ itens: PilhaDaSessao[] }>('/pilha'),

  adicionarItem: (dados: { tipoAlbumId: string; figurinhaNumero: string; origem: PilhaOrigem }) =>
    request<{ item: PilhaDaSessao }>('/pilha', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),

  colarItem: (itemId: string, albumId: string) =>
    request<{ ok: boolean }>('/pilha/colar', {
      method: 'POST',
      body: JSON.stringify({ itemId, albumId }),
    }),

  marcarRepetida: (itemId: string) =>
    request<{ ok: boolean }>('/pilha/repetida', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    }),

  descartarPilha: () =>
    request<{ ok: boolean }>('/pilha', { method: 'DELETE' }),

  descartarItem: (itemId: string) =>
    request<{ ok: boolean }>(`/pilha/${itemId}`, { method: 'DELETE' }),

  sincronizar: (itens: Array<{ figurinhaNumero: string; tipoAlbumId: string; origem: PilhaOrigem }>) =>
    request<{ sincronizados: number; ignorados: number }>('/pilha/sincronizar', {
      method: 'PATCH',
      body: JSON.stringify(itens),
    }),
};

export const colarFigurinhasApi = {
  getEstoque: (albumId?: string) =>
    request<{ itens: EstoqueItem[] }>(`/estoque${albumId ? `?albumId=${albumId}` : ''}`),

  colar: (estoqueId: string, albumId: string) =>
    request<{ ok: boolean }>('/colar', {
      method: 'POST',
      body: JSON.stringify({ estoqueId, albumId }),
    }),

  colarDireta: (figurinhaNumero: string, albumId: string) =>
    request<{ ok: boolean }>('/colar/direta', {
      method: 'POST',
      body: JSON.stringify({ figurinhaNumero, albumId }),
    }),

  descartarRepetida: (estoqueId: string) =>
    request<{ ok: boolean }>('/estoque/descartar', {
      method: 'POST',
      body: JSON.stringify({ estoqueId }),
    }),

  adicionarRepetida: (figurinhaNumero: string) =>
    request<{ ok: boolean }>('/estoque/adicionar', {
      method: 'POST',
      body: JSON.stringify({ figurinhaNumero }),
    }),
};

export const privacidadeApi = {
  getPreferencias: () =>
    request<{ temConsentimento: boolean; analytics?: boolean; publicidade?: boolean; versaoPolitica: string; expiraEm?: string }>(
      '/cookies/preferencias',
      { skipAuthRedirect: true }
    ),

  setPreferencias: (prefs: PreferenciasCookie & { consentimentoExplitico?: boolean }) =>
    request<{ ok: boolean; id: string }>('/cookies/preferencias', {
      method: 'POST',
      body: JSON.stringify(prefs),
      skipAuthRedirect: true,
    }),
};

export const publicApi = {
  getFaltantes: (token: string) =>
    request<{ albumNome: string; secoes: Array<{ _id: string; nome: string; figurinhas: Array<{ _id: string; numero: string; colada: boolean }> }> }>(
      `/public/faltantes/${encodeURIComponent(token)}`,
      { skipAuthRedirect: true }
    ),
};

export { ApiError };
