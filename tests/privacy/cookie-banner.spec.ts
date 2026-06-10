/**
 * Testes: Banner de Consentimento de Cookies (LGPD)
 * Spec: docs/spec_privacidade_lgpd.md §5 — RN-PR05 a RN-PR14
 *
 * IMPORTANTE: Este arquivo usa @playwright/test diretamente (não fixtures)
 * para que o banner apareça sem supressão prévia de consentimento.
 */
import { test, expect } from '@playwright/test';

const CURRENT_POLICY_VERSION = '1.1';
const STORAGE_KEY = 'cookie-consent-data';

function validConsent(overrides: Record<string, unknown> = {}) {
  const now = new Date();
  const expira = new Date(now);
  expira.setFullYear(expira.getFullYear() + 1);
  return {
    analytics: true,
    publicidade: true,
    versao_politica: CURRENT_POLICY_VERSION,
    concedido_em: now.toISOString(),
    expira_em: expira.toISOString(),
    ...overrides,
  };
}

test.describe('Banner de Cookies (LGPD)', () => {

  test.beforeEach(async ({ page }) => {
    // Garante que não haja consentimento armazenado
    await page.addInitScript(() => {
      localStorage.removeItem('cookie-consent-data');
      localStorage.removeItem('cookie-consent'); // formato legado
    });
  });

  // ── Exibição do banner ────────────────────────────────────────────────────────

  test('deve exibir banner quando não há consentimento registrado (RN-PR05)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('dialog', { name: /cookies e privacidade/i })).toBeVisible();
  });

  test('não deve exibir banner quando consentimento válido e na versão atual (RN-PR05)', async ({ page }) => {
    await page.addInitScript((data) => {
      localStorage.setItem('cookie-consent-data', JSON.stringify(data));
    }, validConsent());
    await page.goto('/');
    await expect(page.getByRole('dialog', { name: /cookies e privacidade/i })).not.toBeVisible();
  });

  test('deve reexibir banner quando consentimento expirou (RN-PR08)', async ({ page }) => {
    const expired = validConsent({
      concedido_em: new Date(Date.now() - 366 * 24 * 60 * 60 * 1000).toISOString(),
      expira_em: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // expirou ontem
    });
    await page.addInitScript((data) => {
      localStorage.setItem('cookie-consent-data', JSON.stringify(data));
    }, expired);
    await page.goto('/');
    await expect(page.getByRole('dialog', { name: /cookies e privacidade/i })).toBeVisible();
  });

  test('deve reexibir banner quando versão da política mudou (RN-PR09)', async ({ page }) => {
    const oldVersion = validConsent({ versao_politica: '1.0' });
    await page.addInitScript((data) => {
      localStorage.setItem('cookie-consent-data', JSON.stringify(data));
    }, oldVersion);
    await page.goto('/');
    await expect(page.getByRole('dialog', { name: /cookies e privacidade/i })).toBeVisible();
  });

  // ── Conteúdo do banner ────────────────────────────────────────────────────────

  test('deve exibir dois botões: "Aceitar" e "Remover não essenciais" (RN-PR12)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Aceitar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Remover não essenciais' })).toBeVisible();
  });

  test('deve conter link para Política de Privacidade no banner (RN-PR14)', async ({ page }) => {
    await page.goto('/');
    const dialog = page.getByRole('dialog', { name: /cookies e privacidade/i });
    await expect(dialog.getByRole('link', { name: /política de privacidade/i })).toBeVisible();
  });

  // ── Persistência de consentimento ─────────────────────────────────────────────

  test('"Aceitar" deve persistir analytics=true e publicidade=true (RN-PR06, RN-PR07)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Aceitar' }).click();

    // Banner deve fechar
    await expect(page.getByRole('dialog', { name: /cookies e privacidade/i })).not.toBeVisible();

    // Verificar dados persistidos
    const data = await page.evaluate((key) => {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    }, STORAGE_KEY);

    expect(data).not.toBeNull();
    expect(data.analytics).toBe(true);
    expect(data.publicidade).toBe(true);
    expect(data.versao_politica).toBeTruthy();
    expect(data.expira_em).toBeTruthy();
    expect(new Date(data.expira_em).getTime()).toBeGreaterThan(Date.now());
  });

  test('"Remover não essenciais" deve persistir analytics=false e publicidade=false (RN-PR06, RN-PR07) — BUG G4', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Remover não essenciais' }).click();

    // Banner deve fechar
    await expect(page.getByRole('dialog', { name: /cookies e privacidade/i })).not.toBeVisible();

    // Verificar dados persistidos — DIFERENÇA CRÍTICA: analytics=false, publicidade=false
    const data = await page.evaluate((key) => {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    }, STORAGE_KEY);

    expect(data).not.toBeNull();
    expect(data.analytics).toBe(false);   // analytics = false (opt-out)
    expect(data.publicidade).toBe(false); // publicidade = false (opt-out)
    expect(data.versao_politica).toBeTruthy();
    expect(data.expira_em).toBeTruthy();
  });

  test('"Remover não essenciais" deve ocultar banner após clique (RN-PR05)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Remover não essenciais' }).click();
    await expect(page.getByRole('dialog', { name: /cookies e privacidade/i })).not.toBeVisible();
  });

  test('consentimento via "Aceitar" deve ter expiração em ~12 meses (RN-PR08)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Aceitar' }).click();

    const data = await page.evaluate((key) => {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    }, STORAGE_KEY);

    const expira = new Date(data.expira_em).getTime();
    const umAnoMs = 365 * 24 * 60 * 60 * 1000;
    // Deve expirar entre 11 e 13 meses a partir de agora
    expect(expira).toBeGreaterThan(Date.now() + 11 * 30 * 24 * 60 * 60 * 1000);
    expect(expira).toBeLessThan(Date.now() + 13 * 30 * 24 * 60 * 60 * 1000);
    void umAnoMs;
  });

  // ── Acessibilidade (RN-PR10) ──────────────────────────────────────────────────

  test('banner deve ser operável por teclado (RN-PR10)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('dialog', { name: /cookies e privacidade/i })).toBeVisible();

    // Tab para navegar dentro do banner
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName ?? '');
    expect(['A', 'BUTTON'].includes(focused)).toBe(true);
  });

});
