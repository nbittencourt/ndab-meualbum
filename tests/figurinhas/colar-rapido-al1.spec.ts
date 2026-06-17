import { test, expect } from '../support/fixtures';
import { usuarioAtivo, criarAlbum, getTipoAlbumId, adicionarEstoque } from '../support/helpers';

test.describe('Colagem rápida na AL1 (#24 + #34)', () => {

  async function abrirAl1ComFigurinha(page: any, request: any) {
    const { identificador } = await usuarioAtivo(page, request);
    const tipoId = await getTipoAlbumId(request);
    const album = await criarAlbum(request, tipoId, 'BROCHURA');
    const albumId = String(album._id ?? album.id);
    await page.goto(`/albums/${albumId}`);
    return { identificador, album, albumId };
  }

  // ── Colagem sempre ativa (#34) ─────────────────────────────────────────────

  test('botão Colar aparece sem ativação prévia: toggle removido (#34)', async ({ page, request }) => {
    const { albumId } = await abrirAl1ComFigurinha(page, request);

    // O botão toggle "Ativar colagem rápida" não deve existir
    await expect(page.getByRole('button', { name: /ativar colagem rápida/i })).not.toBeVisible();

    // Expandir a primeira seção — o botão Colar já deve estar visível
    await page.getByTestId('section-toggle').first().click();

    const btnColar = page.getByRole('button', { name: /^colar figurinha FWC1$/i });
    await expect(btnColar).toBeVisible();
    void albumId;
  });

  // ── Colar inline: faltante sem estoque (→ colarDireta) ─────────────────────

  test('colar faltante sem estoque usa colagem direta (RN-AL-CR02)', async ({ page, request }) => {
    const { albumId } = await abrirAl1ComFigurinha(page, request);
    // Não adicionamos estoque para FWC1
    await page.getByTestId('section-toggle').first().click();

    const btnColar = page.getByRole('button', { name: /^colar figurinha FWC1$/i });
    await expect(btnColar).toBeVisible();
    await btnColar.click();

    await expect(page.getByText(/figurinha colada/i)).toBeVisible();
    void albumId;
  });

  // ── Colar inline: repetida com estoque (→ debita estoque) ──────────────────

  test('colar repetida com estoque debita o estoque (RN-AL-CR03)', async ({ page, request }) => {
    const { identificador, albumId } = await abrirAl1ComFigurinha(page, request);
    await adicionarEstoque(request, identificador, 'FWC1', 2);
    await page.reload();

    await page.getByTestId('section-toggle').first().click();

    const btnColar = page.getByRole('button', { name: /^colar figurinha FWC1$/i });
    await expect(btnColar).toBeVisible();
    await btnColar.click();

    await expect(page.getByText(/figurinha colada/i)).toBeVisible();
    void albumId;
  });

  // ── Remover colagem via menu de contexto ───────────────────────────────────

  test('menu ⋮ em card colado → Remover exige código → remove colagem (RN-AL-CR04)', async ({ page, request }) => {
    const { albumId } = await abrirAl1ComFigurinha(page, request);

    // Colar FWC1 via API antes de navegar
    await request.post('/api/v1/colar/direta', {
      data: { albumId, figurinhaNumero: 'FWC1' },
    });
    await page.reload();

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
