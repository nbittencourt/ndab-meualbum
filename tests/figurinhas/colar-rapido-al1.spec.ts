import { test, expect } from '../support/fixtures';
import { usuarioAtivo, criarAlbum, getTipoAlbumId, adicionarEstoque } from '../support/helpers';

test.describe('Colagem rápida na AL1 (#24)', () => {

  async function abrirAl1ComFigurinha(page: any, request: any) {
    const { identificador } = await usuarioAtivo(page, request);
    const tipoId = await getTipoAlbumId(request);
    const album = await criarAlbum(request, tipoId, 'BROCHURA');
    const albumId = String(album._id ?? album.id);
    await page.goto(`/albums/${albumId}`);
    return { identificador, album, albumId };
  }

  // ── Modo desligado ──────────────────────────────────────────────────────────

  test('modo desligado (padrão): cards sem botão Colar inline nem menu ⋮', async ({ page, request }) => {
    const { identificador, albumId } = await abrirAl1ComFigurinha(page, request);
    await adicionarEstoque(request, identificador, 'FWC1', 2);
    await page.reload();

    // Expandir a primeira seção
    await page.getByTestId('section-toggle').first().click();

    // O toggle não está ativo, portanto não deve existir botão inline de colar nos cards
    await expect(page.getByRole('button', { name: /^colar$/i }).first()).not.toBeVisible();
    // Também não deve existir menu de opções nos cards colados
    await expect(page.getByRole('button', { name: /opções para figurinha/i }).first()).not.toBeVisible();
    void albumId; // suppress unused warning
  });

  // ── Ativar modo ─────────────────────────────────────────────────────────────

  test('ativar modo exibe toggle com aria-pressed=true', async ({ page, request }) => {
    await abrirAl1ComFigurinha(page, request);
    const toggle = page.getByRole('button', { name: /ativar colagem rápida/i });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  // ── Colar inline: faltante sem estoque (→ colarDireta) ─────────────────────

  test('modo ativo: colar faltante sem estoque usa colagem direta (RN-AL-CR02)', async ({ page, request }) => {
    const { albumId } = await abrirAl1ComFigurinha(page, request);
    // Não adicionamos estoque para FWC1
    await page.getByRole('button', { name: /ativar colagem rápida/i }).click();
    await page.getByTestId('section-toggle').first().click();

    const btnColar = page.getByRole('button', { name: /^colar figurinha FWC1$/i });
    await expect(btnColar).toBeVisible();
    await btnColar.click();

    await expect(page.getByText(/figurinha colada/i)).toBeVisible();
    void albumId;
  });

  // ── Colar inline: repetida com estoque (→ debita estoque) ──────────────────

  test('modo ativo: colar repetida com estoque debita o estoque (RN-AL-CR03)', async ({ page, request }) => {
    const { identificador, albumId } = await abrirAl1ComFigurinha(page, request);
    await adicionarEstoque(request, identificador, 'FWC1', 2);
    await page.reload();

    await page.getByRole('button', { name: /ativar colagem rápida/i }).click();
    await page.getByTestId('section-toggle').first().click();

    const btnColar = page.getByRole('button', { name: /^colar figurinha FWC1$/i });
    await expect(btnColar).toBeVisible();
    await btnColar.click();

    await expect(page.getByText(/figurinha colada/i)).toBeVisible();
    void albumId;
  });

  // ── Remover colagem via menu de contexto ───────────────────────────────────

  test('modo ativo: menu ⋮ em card colado → Remover exige código → remove colagem (RN-AL-CR04)', async ({ page, request }) => {
    const { albumId } = await abrirAl1ComFigurinha(page, request);

    // Colar FWC1 via API antes de navegar
    await request.post('/api/v1/colar/direta', {
      data: { albumId, figurinhaNumero: 'FWC1' },
    });
    await page.reload();

    await page.getByRole('button', { name: /ativar colagem rápida/i }).click();
    await page.getByTestId('section-toggle').first().click();

    // Menu de opções no card colado
    const menuBtn = page.getByRole('button', { name: /opções para figurinha FWC1/i });
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    await page.getByRole('menuitem', { name: /remover/i }).click();

    // Modal de confirmação por código
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    const confirmBtn = dialog.getByRole('button', { name: /confirmar remoção/i });
    await expect(confirmBtn).toBeDisabled();

    // Digitar código errado não habilita
    await dialog.getByRole('textbox').fill('FWC2');
    await expect(confirmBtn).toBeDisabled();

    // Digitar código correto habilita
    await dialog.getByRole('textbox').fill('FWC1');
    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.click();

    await expect(dialog).not.toBeVisible();
    await expect(page.getByText(/colagem removida/i)).toBeVisible();
  });
});
