import { test, expect } from '../support/fixtures';
import { test as testComBanner, expect as expectComBanner } from '@playwright/test';
import { usuarioAtivo } from '../support/helpers';

// W2 — Operabilidade por teclado (WCAG 2.1.1, 2.4.x) nas páginas principais.

test.describe('Navegação por teclado', () => {

  test('primeiro Tab foca o skip link e Enter move o foco para o conteúdo', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    const skip = page.getByRole('link', { name: /pular para o conteúdo/i });
    await expect(skip).toBeAttached();
    // Garante ponto de partida determinístico (sem foco residual da navegação)
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur?.());
    await page.keyboard.press('Tab');
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main/);
  });

  test('login é operável por teclado de ponta a ponta', async ({ page, request }) => {
    // Cria usuário ativo via API e faz login só com teclado
    const { criarUsuario, confirmarEmail } = await import('../support/helpers');
    const { dados, identificador } = await criarUsuario(request);
    await confirmarEmail(request, identificador);

    await page.goto('/');
    await page.getByLabel('Email').focus();
    await page.keyboard.type(dados.email as string);
    await page.keyboard.press('Tab');
    await page.keyboard.type(dados.password as string);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/home/);
  });

  test('links da navegação principal são alcançáveis e acionáveis por Enter', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    // Desktop: sidebar visível; mobile: abre o menu primeiro
    const hamburger = page.getByRole('button', { name: /abrir menu de navegação/i });
    if (await hamburger.isVisible()) {
      await hamburger.focus();
      await page.keyboard.press('Enter');
    }
    const linkAlbuns = page.getByRole('link', { name: /álbuns/i }).first();
    await linkAlbuns.focus();
    await expect(linkAlbuns).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/albums/);
  });

  test('CTAs da Home (links estilizados como botão) respondem a Enter', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    const cta = page.getByRole('link', { name: /abrir pacotinhos/i }).first();
    await cta.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/abrir/);
  });

  test('modal de exclusão de conta: Esc fecha e devolve o foco ao acionador', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    await page.goto('/perfil');
    const acionador = page.getByRole('button', { name: /excluir minha conta/i }).first();
    await acionador.click();
    const dialog = page.getByRole('dialog').or(page.getByRole('alertdialog'));
    await expect(dialog.first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog.first()).not.toBeVisible();
    await expect(acionador).toBeFocused();
  });
});

// O banner precisa estar visível: importa @playwright/test direto (sem fixture)
testComBanner('banner de cookies é operável por teclado (RN-PR10)', async ({ page }) => {
  await page.goto('/');
  const aceitar = page.getByRole('button', { name: /^aceitar$/i });
  await expectComBanner(aceitar).toBeVisible();
  await aceitar.focus();
  await expectComBanner(aceitar).toBeFocused();
  await page.keyboard.press('Enter');
  await expectComBanner(aceitar).not.toBeVisible();
});
