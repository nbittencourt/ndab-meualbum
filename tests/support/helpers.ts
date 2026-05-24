import { Page, APIRequestContext } from '@playwright/test';

export async function criarUsuario(request: APIRequestContext, overrides: Record<string, unknown> = {}) {
  const dados = {
    name: 'Usuário Teste',
    email: `teste+${Date.now()}_${Math.random().toString(36).slice(2, 8)}@exemplo.com`,
    password: 'Senha@123',
    declaracaoMaioridade: true,
    ...overrides,
  };
  const res = await request.post('/api/v1/auth/register', { data: dados });
  if (!res.ok()) throw new Error(`Falha ao criar usuário: ${res.status()}`);
  const infoRes = await request.get(`/api/v1/test/usuario-info?email=${encodeURIComponent(dados.email as string)}`);
  const { identificador } = await infoRes.json();
  return { dados, identificador };
}

export async function confirmarEmail(request: APIRequestContext, identificador: string) {
  await request.post('/api/v1/test/confirmar-email', { data: { identificador } });
}

export async function loginPorUI(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.getByLabel('Email').fill(email);
  await page.getByRole('textbox', { name: 'Senha' }).fill(password);
  await page.getByRole('button', { name: /entrar/i }).click();
  await page.waitForURL(/\/home/);
}

export async function usuarioAtivo(page: Page, request: APIRequestContext) {
  const { dados, identificador } = await criarUsuario(request);
  await confirmarEmail(request, identificador);
  await loginPorUI(page, dados.email as string, dados.password as string);
  await request.post('/api/v1/auth/login', {
    data: { email: dados.email, password: dados.password },
  });
  return { ...dados, identificador };
}

export async function getTipoAlbumId(request: APIRequestContext): Promise<string> {
  const res = await request.get('/api/v1/test/tipo-album-id');
  const json = await res.json();
  return String(json.tipoAlbumId);
}

export async function criarAlbum(request: APIRequestContext, tipoAlbumId: string, variante = 'BROCHURA') {
  const res = await request.post('/api/v1/albums', { data: { tipoAlbumId, variante } });
  const json = await res.json();
  return json.album ?? json;
}

export async function adicionarEstoque(
  request: APIRequestContext,
  identificador: string,
  figurinhaNumero: string,
  quantidade = 1
) {
  await request.post('/api/v1/test/popular-estoque', {
    data: { identificador, figurinha_numero: figurinhaNumero, quantidade },
  });
}

export async function expirarToken(request: APIRequestContext, token: string) {
  await request.post('/api/v1/test/expirar-token', { data: { token } });
}
