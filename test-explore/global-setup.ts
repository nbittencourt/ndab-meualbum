import { FullConfig } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const API = 'http://localhost:3000/api/v1';

async function post(url: string, body?: unknown, cookie?: string) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`POST ${url} → ${res.status}: ${text}`);
  }
  return res.json().catch(() => null);
}

async function get(url: string, cookie?: string) {
  const res = await fetch(url, {
    headers: cookie ? { Cookie: cookie } : {},
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GET ${url} → ${res.status}: ${text}`);
  }
  return res.json().catch(() => null);
}

export default async function globalSetup(_config: FullConfig) {
  console.log('\n[explore] Iniciando setup exploratório...');

  // 1. Reset + seed do catálogo
  await post(`${API}/test/reset-db`);
  console.log('[explore] Banco resetado.');

  await post(`${API}/test/seed`);
  console.log('[explore] Catálogo seedado.');

  const { tipoAlbumId } = await get(`${API}/test/tipo-album-id`);

  // 2. Obter números de figurinhas válidos a partir do seed JSON
  const seedPath = path.join(process.cwd(), 'tests', '_seed', 'panini_wc2026_figurinhas.json');
  const seedData = JSON.parse(readFileSync(seedPath, 'utf-8')) as {
    figurinhas: { numero: string; conta_para_fechar: boolean }[];
  };
  // Usa apenas figurinhas coláveis (conta_para_fechar=true) para o seed visual
  const colaveis = seedData.figurinhas
    .filter(f => f.conta_para_fechar)
    .map(f => f.numero);

  const forColar     = colaveis.slice(0, 15);  // 15 coladas no álbum
  const forEstoque   = colaveis.slice(15, 25); // 10 apenas no estoque (visíveis em /colar)
  const forDuplicatas = colaveis.slice(25, 30);// 5 duplicatas (qty=2, coladas=1)

  // 3. Criar usuário
  const email    = `qa-explore-${Date.now()}@meualbum.test`;
  const password = 'Teste@1234';

  await post(`${API}/auth/register`, {
    name: 'QA Exploratório',
    email,
    password,
    declaracaoMaioridade: true,
  });

  const { identificador } = await get(
    `${API}/test/usuario-info?email=${encodeURIComponent(email)}`
  );
  await post(`${API}/test/confirmar-email`, { identificador });
  console.log(`[explore] Usuário criado e confirmado: ${email}`);

  // 4. Login → extrair cookie __session
  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!loginRes.ok) throw new Error(`Login falhou: ${loginRes.status}`);

  const setCookieHeader = loginRes.headers.get('set-cookie') ?? '';
  const sessionValue = setCookieHeader.match(/__session=([^;]+)/)?.[1] ?? '';
  if (!sessionValue) throw new Error('Cookie __session não encontrado na resposta de login.');

  const authCookie = `__session=${sessionValue}`;

  // 5. Criar álbum
  const { album } = await post(
    `${API}/albums`,
    { tipoAlbumId, variante: 'BROCHURA' },
    authCookie
  );
  const albumId: string = album._id;
  console.log(`[explore] Álbum criado: ${albumId}`);

  // 6. Seed de figurinhas
  const addEstoque = (num: string, qty: number) =>
    post(`${API}/test/popular-estoque`, { identificador, figurinha_numero: num, quantidade: qty });

  const colarDireta = (num: string) =>
    post(`${API}/colar/direta`, { albumId, figurinhaNumero: num }, authCookie);

  // Estoque: forColar + forEstoque (qty=1), forDuplicatas (qty=2)
  for (const num of [...forColar, ...forEstoque]) await addEstoque(num, 1);
  for (const num of forDuplicatas)               await addEstoque(num, 2);

  // Colar: forColar + forDuplicatas (each gets one sticker pasted, 1 remaining as duplicate)
  for (const num of [...forColar, ...forDuplicatas]) await colarDireta(num);

  console.log(
    `[explore] Figurinhas: ${forColar.length + forDuplicatas.length} coladas, ` +
    `${forEstoque.length} no estoque, ${forDuplicatas.length} duplicatas.`
  );

  // 7. Escrever storageState no formato Playwright + metadata extra
  const stateDir = path.join(process.cwd(), 'test-explore');
  mkdirSync(stateDir, { recursive: true });

  const storageState = {
    cookies: [
      {
        name: '__session',
        value: sessionValue,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax' as const,
        expires: -1,
      },
    ],
    origins: [
      {
        origin: 'http://localhost:5173',
        localStorage: [{ name: 'cookie-consent', value: '1' }],
      },
    ],
    _explore: { albumId, email, password, identificador },
  };

  const statePath = path.join(stateDir, '.setup-state.json');
  writeFileSync(statePath, JSON.stringify(storageState, null, 2));
  console.log(`[explore] Setup concluído. Estado salvo em test-explore/.setup-state.json`);
}
