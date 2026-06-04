/**
 * Exploração desktop 1440px — layout, responsividade, breakpoints.
 *
 * Rotas corretas do app:
 *   /albums/novo          → CadastroAlbumPage
 *   /albums/:id           → AlbumManagePage
 *   /albums/:id/visualizar → AlbumVisualizarPage (grid de figurinhas)
 *   /abrir                → AbrirPacotinhosPage
 *   /colar                → ColarFigurinhasPage  (query: ?albumId=...)
 *   /trocas               → SwapsPage
 *   /perfil               → ProfilePage
 *
 * App.tsx l.104: authenticated pages wrapped in max-w-[430px] mx-auto
 *   → TODAS as telas autenticadas têm 430px de largura máxima em qualquer viewport.
 */
import { test, Page, ConsoleMessage } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE     = 'http://localhost:5173';
const SS_DIR   = path.join(__dirname, 'screenshots-desktop');
const EMAIL    = 'explore_1780527207714@test.com';
const PASS     = 'Explore@1234!';
const ALBUM_ID = '6a20b90509a97e3dc0f56b50';

const consoleLogs: { url: string; type: string; text: string }[] = [];
const timings:     { label: string; ms: number }[]               = [];

function track(page: Page) {
  page.on('console', (msg: ConsoleMessage) => {
    if (['error', 'warning'].includes(msg.type()))
      consoleLogs.push({ url: page.url(), type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', err =>
    consoleLogs.push({ url: page.url(), type: 'pageerror', text: err.message }));
}

async function ss(page: Page, name: string) {
  fs.mkdirSync(SS_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SS_DIR, `${name}.png`), fullPage: true }).catch(() => {});
}

async function go(page: Page, label: string, url: string) {
  const t0 = Date.now();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 12000 });
  } catch {
    // se networkidle demorar demais, tenta domcontentloaded
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(600);
  }
  const ms = Date.now() - t0;
  timings.push({ label, ms });
  console.log(`[TIMING] ${label}: ${ms}ms  →  ${page.url()}`);
}

async function dismissCookies(page: Page) {
  const btn = page.locator('button:has-text("Aceitar essenciais")').first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click({ force: true });
    await page.waitForTimeout(300);
  }
}

async function login(page: Page) {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await dismissCookies(page);
  await page.locator('input[type="email"]').first().fill(EMAIL);
  await page.locator('input[type="password"]').first().fill(PASS);
  const t0 = Date.now();
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(/\/home/, { timeout: 15000 });
  await page.waitForTimeout(400);
  timings.push({ label: 'login', ms: Date.now() - t0 });
  console.log(`[LOGIN] ok → ${page.url()} (${timings.at(-1)!.ms}ms)`);
}

test('Desktop 1440px — Exploração Completa', async ({ page }) => {
  test.setTimeout(180_000);
  track(page);
  fs.mkdirSync(SS_DIR, { recursive: true });

  // ── Telas públicas (sem max-width) ─────────────────────────────────────────

  await go(page, '01-landing', BASE);
  await ss(page, '01-landing');

  await go(page, '02-register', `${BASE}/register`);
  await ss(page, '02-register');

  await go(page, '03-forgot-password', `${BASE}/forgot-password`);
  await ss(page, '03-forgot-password');

  // ── Login ──────────────────────────────────────────────────────────────────
  await login(page);
  await ss(page, '04-home');
  console.log('[NOTE] max-w-430px aplicado? →', await page.evaluate(() => {
    const el = document.querySelector('main')?.parentElement;
    return el ? window.getComputedStyle(el).maxWidth : 'n/a';
  }));

  // ── Telas autenticadas (todas com max-w-[430px]) ───────────────────────────

  // Home scroll completo
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);
  await ss(page, '05-home-scroll');

  // Álbuns
  await go(page, '06-albums', `${BASE}/albums`);
  await ss(page, '06-albums');

  // Cadastro (/albums/novo)
  await go(page, '07-cadastro', `${BASE}/albums/novo`);
  await page.waitForSelector('[role="radio"]', { timeout: 12000 }).catch(() => {});
  await page.waitForTimeout(200);
  await ss(page, '07-cadastro');
  const temVariantes = await page.locator('[role="radio"]').count() > 0;
  if (temVariantes) {
    await page.locator('[role="radio"]').first().click();
    await page.waitForTimeout(200);
    await ss(page, '07b-cadastro-variante');
  }

  // Album detail/manage
  await go(page, '08-album-manage', `${BASE}/albums/${ALBUM_ID}`);
  await ss(page, '08-album-manage');

  // Album visualizar (grid de figurinhas) — pode ter muitas figurinhas, limitar scroll
  await go(page, '09-album-visualizar', `${BASE}/albums/${ALBUM_ID}/visualizar`);
  await page.waitForTimeout(800);
  await ss(page, '09-album-visualizar-topo');
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }));
  await page.waitForTimeout(400);
  await ss(page, '09b-album-visualizar-meio');

  // Abrir Pacotinhos (/abrir)
  await go(page, '10-abrir', `${BASE}/abrir`);
  await ss(page, '10-abrir-pacotinhos');

  // Colar Figurinhas (/colar?albumId=...)
  await go(page, '11-colar', `${BASE}/colar?albumId=${ALBUM_ID}`);
  await page.waitForTimeout(600);
  await ss(page, '11-colar');
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'instant' }));
  await page.waitForTimeout(300);
  await ss(page, '11b-colar-scroll');

  // Perfil
  await go(page, '12-perfil', `${BASE}/perfil`);
  await ss(page, '12-perfil');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);
  await ss(page, '12b-perfil-scroll');

  // Trocas
  await go(page, '13-trocas', `${BASE}/trocas`);
  await ss(page, '13-trocas');

  // ── Logout e tela pós-logout ──────────────────────────────────────────────
  const logoutBtn = page.locator('button[aria-label*="Sair" i]').first();
  if (await logoutBtn.isVisible().catch(() => false)) {
    await logoutBtn.click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(500);
    await ss(page, '14-pos-logout');
    console.log(`[LOGOUT] → ${page.url()}`);
  }

  // ── Comparação de breakpoints ─────────────────────────────────────────────
  // Relogar
  await login(page);

  const breakpoints = [
    { w: 375,  h: 812,  tag: '375-mobile'   },
    { w: 768,  h: 1024, tag: '768-tablet'   },
    { w: 1024, h: 768,  tag: '1024-laptop'  },
    { w: 1280, h: 800,  tag: '1280-hd'      },
    { w: 1440, h: 900,  tag: '1440-desktop' },
  ] as const;

  for (const bp of breakpoints) {
    await page.setViewportSize({ width: bp.w, height: bp.h });

    // Home
    await page.goto(`${BASE}/home`, { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(300);
    await ss(page, `15-bp-${bp.tag}-home`);

    // Álbuns
    await page.goto(`${BASE}/albums`, { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(200);
    await ss(page, `15-bp-${bp.tag}-albums`);

    // Landing (público — não tem max-width)
    await page.goto(`${BASE}/register`, { waitUntil: 'networkidle', timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(200);
    await ss(page, `15-bp-${bp.tag}-register`);

    // Medir largura real do conteúdo autenticado
    await page.goto(`${BASE}/home`, { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    const maxW = await page.evaluate(() => {
      const el = document.querySelector('main')?.parentElement;
      return el ? `${window.getComputedStyle(el).maxWidth} (viewport:${window.innerWidth}px)` : 'n/a';
    });
    console.log(`[BREAKPOINT] ${bp.tag}: maxWidth=${maxW}`);
  }

  // ── Salvar relatório ─────────────────────────────────────────────────────
  const report = { testedAt: new Date().toISOString(), testUser: EMAIL, albumId: ALBUM_ID, timings, consoleLogs };
  fs.writeFileSync(path.join(__dirname, 'raw-report-desktop.json'), JSON.stringify(report, null, 2));
  console.log('\n[SUMMARY] erros de console:', consoleLogs.length);
  console.log('[SUMMARY] lentos (>1s):', timings.filter(t => t.ms > 1000).map(t => `${t.label}=${t.ms}ms`).join(', ') || 'nenhum');
});
