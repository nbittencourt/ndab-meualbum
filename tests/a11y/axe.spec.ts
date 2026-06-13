import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { test, expect } from '../support/fixtures';
import { usuarioAtivo, criarAlbum, getTipoAlbumId, adicionarEstoque, navegarPorMenu } from '../support/helpers';

// W1 — Varredura automatizada WCAG 2.0/2.1 AA com axe-core nas páginas
// principais (docs/legal/wcag-2_0-aa-guia-sistemas.md). Roda nos dois
// projetos (mobile e desktop) — layouts diferentes, violações diferentes.

async function analisar(page: Page) {
  const resultados = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  return resultados.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    description: v.description,
    nodes: v.nodes.map((n) => n.target.join(' ')).slice(0, 5),
  }));
}

test.describe('Acessibilidade (axe-core) — páginas principais', () => {

  test('Landing (login) sem violações AA', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
    expect(await analisar(page)).toEqual([]);
  });

  test('Cadastro sem violações AA', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('button', { name: /criar conta|cadastrar/i })).toBeVisible();
    expect(await analisar(page)).toEqual([]);
  });

  test('Home autenticada sem violações AA', async ({ page, request }) => {
    const { identificador } = await usuarioAtivo(page, request);
    const tipoId = await getTipoAlbumId(request);
    await criarAlbum(request, tipoId, 'BROCHURA');
    await adicionarEstoque(request, identificador, 'FWC1', 2);
    await page.reload();
    await expect(page.getByRole('heading', { name: /meus álbuns/i })).toBeVisible();
    expect(await analisar(page)).toEqual([]);
  });

  test('Álbuns (AL0) sem violações AA', async ({ page, request }) => {
    const { identificador } = await usuarioAtivo(page, request);
    void identificador;
    const tipoId = await getTipoAlbumId(request);
    await criarAlbum(request, tipoId, 'CAPA_DURA');
    await navegarPorMenu(page, /álbuns/i);
    await expect(page.getByRole('button', { name: /gerenciar/i }).first()).toBeVisible();
    expect(await analisar(page)).toEqual([]);
  });

  test('Abrir Pacotinhos (AP1) sem violações AA', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    await navegarPorMenu(page, /abrir/i);
    await expect(page.getByRole('textbox')).toBeVisible();
    expect(await analisar(page)).toEqual([]);
  });

  test('Colar Figurinhas sem violações AA', async ({ page, request }) => {
    const { identificador } = await usuarioAtivo(page, request);
    const tipoId = await getTipoAlbumId(request);
    await criarAlbum(request, tipoId, 'BROCHURA');
    await adicionarEstoque(request, identificador, 'FWC1', 1);
    await navegarPorMenu(page, /colar/i);
    expect(await analisar(page)).toEqual([]);
  });

  test('Perfil sem violações AA', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    await navegarPorMenu(page, /perfil/i);
    await expect(page.getByRole('heading', { name: /perfil/i }).first()).toBeVisible();
    expect(await analisar(page)).toEqual([]);
  });

  test('Política de Privacidade sem violações AA', async ({ page }) => {
    await page.goto('/politica-de-privacidade');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await analisar(page)).toEqual([]);
  });
});
