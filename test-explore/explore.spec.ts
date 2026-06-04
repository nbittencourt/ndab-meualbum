import { test, Page, ConsoleMessage } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE = 'http://localhost:5173';
const SS_DIR = path.join(__dirname, 'screenshots');
// Pre-confirmed user (confirmed via /api/v1/auth/confirmar-cadastro)
const TEST_EMAIL = 'explore_1780527207714@test.com';
const TEST_PASS = 'Explore@1234!';

const consoleErrors: { page: string; type: string; text: string }[] = [];
const timings: { page: string; ms: number }[] = [];

function trackConsole(page: Page) {
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleErrors.push({ page: page.url(), type: msg.type(), text: msg.text() });
    }
  });
  page.on('pageerror', (err) => {
    consoleErrors.push({ page: page.url(), type: 'pageerror', text: err.message });
  });
}

async function ss(page: Page, name: string) {
  if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SS_DIR, `${name}.png`), fullPage: true });
}

async function timed(label: string, fn: () => Promise<void>): Promise<number> {
  const start = Date.now();
  await fn();
  const ms = Date.now() - start;
  timings.push({ page: label, ms });
  console.log(`[TIMING] ${label}: ${ms}ms`);
  return ms;
}

async function dismissCookieBanner(page: Page) {
  const banner = page.locator('[aria-label*="cookie" i], [aria-label*="Preferências de cookies"]');
  if (await banner.count() > 0) {
    const btn = page.locator('button:has-text("Aceitar essenciais")').first();
    if (await btn.count() > 0) {
      await btn.click({ force: true });
      await page.waitForTimeout(300);
      console.log('[COOKIE] Banner dismissed');
    }
  }
}

test.describe('MeuAlbum — Exploração Completa', () => {
  test.setTimeout(180_000);

  test('Exploração completa do app', async ({ page }) => {
    if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });
    trackConsole(page);

    // ── 1. Landing Page ──────────────────────────────────────────────────────
    await timed('01-landing-load', async () => {
      await page.goto(BASE, { waitUntil: 'networkidle' });
    });
    await ss(page, '01-landing');
    console.log('[URL]', page.url());

    // ── 2. Register Page ─────────────────────────────────────────────────────
    await timed('02-register-load', async () => {
      await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
    });
    await ss(page, '02-register');

    // ── 3. Login ─────────────────────────────────────────────────────────────
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await dismissCookieBanner(page);
    // The landing page has the login form embedded
    const emailField = page.locator('input[type="email"]').first();
    const passField = page.locator('input[type="password"]').first();
    await emailField.fill(TEST_EMAIL);
    await passField.fill(TEST_PASS);
    await ss(page, '03-login-filled');
    await timed('03-login-submit', async () => {
      await page.locator('button[type="submit"]').first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
    });
    await ss(page, '04-after-login');
    console.log('[URL] After login:', page.url());

    // ── 4. Home ───────────────────────────────────────────────────────────────
    if (!page.url().includes('/home')) {
      await timed('04-home-load', async () => {
        await page.goto(`${BASE}/home`, { waitUntil: 'networkidle' });
      });
    }
    await ss(page, '05-home');
    console.log('[URL] Home:', page.url());

    // ── 5. Albums ─────────────────────────────────────────────────────────────
    await timed('05-albums-load', async () => {
      await page.goto(`${BASE}/albums`, { waitUntil: 'networkidle' });
    });
    await ss(page, '06-albums');
    console.log('[URL] Albums:', page.url());

    // ── 6. Cadastro Album ─────────────────────────────────────────────────────
    await timed('06-cadastro-load', async () => {
      await page.goto(`${BASE}/albums/cadastro`, { waitUntil: 'networkidle' });
    });
    await ss(page, '07-cadastro-album');
    console.log('[URL] Cadastro:', page.url());

    // Try to fill and save a test album
    const apelidoField = page.locator('input').first();
    if (await apelidoField.count() > 0) {
      await apelidoField.fill('Copa do Mundo 2026 — Teste');
    }
    // Select first variant option
    const variantOption = page.locator('[role="radio"], button[aria-pressed], label:has(input[type="radio"])').first();
    if (await variantOption.count() > 0) {
      await variantOption.click().catch(() => {});
    }
    await ss(page, '07b-cadastro-filled');
    const saveBtn = page.locator('button[type="submit"], button:has-text("Salvar"), button:has-text("Criar")').first();
    if (await saveBtn.count() > 0) {
      await timed('06b-cadastro-save', async () => {
        await saveBtn.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);
      });
    }
    await ss(page, '08-after-cadastro');
    console.log('[URL] After cadastro:', page.url());

    // ── 7. Album detail ───────────────────────────────────────────────────────
    const albumUrlMatch = page.url().match(/\/albums\/([^/]+)/);
    let albumId = albumUrlMatch && albumUrlMatch[1] !== 'cadastro' ? albumUrlMatch[1] : null;

    if (!albumId) {
      await page.goto(`${BASE}/albums`, { waitUntil: 'networkidle' });
      const albumLink = page.locator('a[href*="/albums/"]').filter({ hasNot: page.locator('[href*="cadastro"]') }).first();
      if (await albumLink.count() > 0) {
        const href = await albumLink.getAttribute('href') ?? '';
        const m = href.match(/\/albums\/([^/]+)/);
        if (m) albumId = m[1];
        await albumLink.click();
        await page.waitForLoadState('networkidle');
      }
    }
    await ss(page, '09-album-detail');
    console.log('[URL] Album detail:', page.url(), '| albumId:', albumId);

    if (albumId) {
      // ── 8. Abrir Pacotinhos ─────────────────────────────────────────────────
      await timed('08-pacotinhos-load', async () => {
        await page.goto(`${BASE}/albums/${albumId}/pacotinhos`, { waitUntil: 'networkidle' });
      });
      await ss(page, '10-abrir-pacotinhos');
      console.log('[URL] Pacotinhos:', page.url());

      // Try the "abrir" action
      const abrirBtn = page.locator('button:has-text("Abrir"), button:has-text("abrir"), button[aria-label*="pacotinho" i]').first();
      if (await abrirBtn.count() > 0) {
        await abrirBtn.click().catch(() => {});
        await page.waitForTimeout(1000);
        await ss(page, '10b-pacotinhos-aberto');
      }

      // ── 9. Colar Figurinhas ─────────────────────────────────────────────────
      await timed('09-colar-load', async () => {
        await page.goto(`${BASE}/albums/${albumId}/colar`, { waitUntil: 'networkidle' });
      });
      await ss(page, '11-colar-figurinhas');
      console.log('[URL] Colar:', page.url());

      // ── 10. Album Visualizar ────────────────────────────────────────────────
      await timed('10-visualizar-load', async () => {
        await page.goto(`${BASE}/albums/${albumId}`, { waitUntil: 'networkidle' });
      });
      await ss(page, '12-album-visualizar');
      console.log('[URL] Visualizar:', page.url());

      // Try scrolling to load all content
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(500);
      await ss(page, '12b-album-scrolled');
    }

    // ── 11. Profile ──────────────────────────────────────────────────────────
    await timed('11-profile-load', async () => {
      await page.goto(`${BASE}/profile`, { waitUntil: 'networkidle' });
    });
    await ss(page, '13-profile');
    console.log('[URL] Profile:', page.url());

    // ── 12. Swaps ─────────────────────────────────────────────────────────────
    await timed('12-swaps-load', async () => {
      await page.goto(`${BASE}/swaps`, { waitUntil: 'networkidle' });
    });
    await ss(page, '14-swaps');
    console.log('[URL] Swaps:', page.url());

    // ── 13. Navigate all bottom nav items ─────────────────────────────────────
    await page.goto(`${BASE}/home`, { waitUntil: 'networkidle' });
    const navLinks = page.locator('nav a');
    const navCount = await navLinks.count();
    console.log(`[NAV] ${navCount} nav links found`);
    for (let i = 0; i < navCount; i++) {
      const link = navLinks.nth(i);
      const href = await link.getAttribute('href').catch(() => '');
      const label = (await link.textContent().catch(() => '?'))?.trim() ?? '';
      console.log(`[NAV] ${i}: "${label}" → ${href}`);
      if (href && href !== '#') {
        await link.click().catch(() => {});
        await page.waitForLoadState('networkidle').catch(() => {});
        await page.waitForTimeout(400);
        await ss(page, `15-nav-${i}-${label.replace(/\W+/g, '-').toLowerCase().slice(0, 20) || 'item'}`);
        console.log(`[NAV] → ${page.url()}`);
        await page.goto(`${BASE}/home`, { waitUntil: 'networkidle' });
      }
    }

    // ── Save report ───────────────────────────────────────────────────────────
    const report = { testedAt: new Date().toISOString(), testUser: TEST_EMAIL, timings, consoleErrors };
    fs.writeFileSync(path.join(__dirname, 'raw-report.json'), JSON.stringify(report, null, 2));
    console.log('\n[SUMMARY] Console errors/warnings:', consoleErrors.length);
    console.log('[SUMMARY] Slow pages (>1s):', timings.filter(t => t.ms > 1000).map(t => `${t.page}=${t.ms}ms`).join(', '));
  });
});
