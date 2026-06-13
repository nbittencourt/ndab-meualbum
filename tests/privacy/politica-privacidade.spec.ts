import { test, expect } from '../support/fixtures';

// L2 — Página de Política de Privacidade (RN-PR14, RN-P29)
// Os links existentes (footer, cadastro, banner) apontam para
// /politica-de-privacidade com target=_blank; a página deve existir e
// apresentar o conteúdo mínimo exigido pela spec_privacidade_lgpd.md.

test.describe('Política de Privacidade', () => {

  test('link do rodapé abre a política em nova aba com conteúdo mínimo', async ({ page, context }) => {
    await page.goto('/');
    const [politica] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('link', { name: /política de privacidade/i }).click(),
    ]);
    await politica.waitForLoadState();
    await expect(politica.getByRole('heading', { level: 1, name: /política de privacidade/i })).toBeVisible();
    // Conteúdo mínimo: dados/bases legais, cookies, direitos do titular, retenção e versão
    await expect(politica.getByRole('heading', { name: /dados que tratamos/i })).toBeVisible();
    await expect(politica.getByRole('heading', { name: /cookies/i }).first()).toBeVisible();
    await expect(politica.getByRole('heading', { name: /seus direitos/i })).toBeVisible();
    await expect(politica.getByRole('heading', { name: /retenção/i })).toBeVisible();
    await expect(politica.getByText(/versão 1\.1/i)).toBeVisible();
  });

  test('link da tela de cadastro abre a política em nova aba', async ({ page, context }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /cadastre-se|criar conta/i }).first().click();
    const [politica] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('link', { name: /política de privacidade/i }).first().click(),
    ]);
    await politica.waitForLoadState();
    await expect(politica.getByRole('heading', { level: 1, name: /política de privacidade/i })).toBeVisible();
  });

  test('página informa o canal de contato e o prazo de resposta (15 dias)', async ({ page }) => {
    // Acesso direto é permitido aqui: a página é pública e linkada externamente
    await page.goto('/politica-de-privacidade');
    await expect(page.getByText(/15 dias/i)).toBeVisible();
    await expect(page.getByText(/@/).first()).toBeVisible();
  });
});
