import { test, expect } from '../support/fixtures';
import {
  usuarioAtivo,
  criarUsuario,
  confirmarEmail,
  criarAlbum,
  adicionarEstoque,
  getTipoAlbumId,
} from '../support/helpers';

// Após #25, a funcionalidade Colar Figurinhas foi mesclada em /figurinhas
// (FigurinhasPage, seção "Repetidas da coleção"). /colar redireciona para /figurinhas.

test.describe('Colar Figurinhas (migrado para /figurinhas)', () => {

  // ── Controle de acesso ────────────────────────────────────────────────────────

  test('deve redirecionar usuário não autenticado (RN-CF01)', async ({ page }) => {
    await page.goto('/colar');
    await expect(page).toHaveURL('/');
  });

  test('deve permitir acesso a usuário EMAIL_PENDENTE (RN-CF01)', async ({ page, request }) => {
    const { dados, identificador } = await criarUsuario(request);
    await confirmarEmail(request, identificador);
    await request.post('/api/v1/test/iniciar-alteracao-email', {
      data: { identificador, email_novo: `novo+${Date.now()}@exemplo.com` },
    });
    await page.goto('/');
    await page.getByLabel('Email').fill(dados.email as string);
    await page.getByRole('textbox', { name: 'Senha' }).fill(dados.password as string);
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL(/\/home/);
    await page.goto('/figurinhas');
    await expect(page).not.toHaveURL('/');
  });

  // ── Redirect /colar → /figurinhas ────────────────────────────────────────────

  test('deve redirecionar /colar para /figurinhas preservando albumId (RN-CF02)', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    const album = await criarAlbum(request, await getTipoAlbumId(request), 'BROCHURA');
    await page.goto(`/colar?albumId=${album._id ?? album.id}`);
    await expect(page).toHaveURL(new RegExp(`/figurinhas.*albumId=${album._id ?? album.id}`));
  });

  // ── Seção Repetidas da coleção ────────────────────────────────────────────────

  test('deve exibir seção "Repetidas da coleção" na página', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    await page.goto('/figurinhas');
    await expect(page.getByRole('heading', { name: /repetidas da coleção/i }).first()).toBeVisible();
  });

  test('deve exibir estado vazio quando estoque está vazio', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    const tipoId = await getTipoAlbumId(request);
    const album = await criarAlbum(request, tipoId, 'BROCHURA');
    await page.goto(`/figurinhas?albumId=${album._id ?? album.id}`);
    await expect(page.getByText(/estoque vazio/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /figurinha não registrada/i })).toBeVisible();
  });

  test('deve exibir figurinhas do estoque (RN-CF06)', async ({ page, request }) => {
    const { identificador } = await usuarioAtivo(page, request);
    const tipoId = await getTipoAlbumId(request);
    const album = await criarAlbum(request, tipoId, 'BROCHURA');
    await adicionarEstoque(request, identificador, 'FWC1', 1);
    await page.goto(`/figurinhas?albumId=${album._id ?? album.id}`);
    await expect(page.getByText('FWC1')).toBeVisible();
  });

  test('deve decrementar estoque ao colar figurinha (RN-CF10)', async ({ page, request }) => {
    const { identificador } = await usuarioAtivo(page, request);
    const tipoId = await getTipoAlbumId(request);
    const album = await criarAlbum(request, tipoId, 'BROCHURA');
    await adicionarEstoque(request, identificador, 'FWC1', 2);
    await page.goto(`/figurinhas?albumId=${album._id ?? album.id}`);
    await expect(page.getByText('×2')).toBeVisible();
    await page.getByText('FWC1').locator('..').getByRole('button', { name: /^colar$/i }).click();
    await expect(page.getByText('×1')).toBeVisible();
  });

  // ── Modal de Figurinha Não Registrada (MFN) ───────────────────────────────────

  test('deve exibir mensagem amigável para figurinha não encontrada (RN-CF25)', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    const tipoId = await getTipoAlbumId(request);
    const album = await criarAlbum(request, tipoId, 'BROCHURA');
    await page.goto(`/figurinhas?albumId=${album._id ?? album.id}`);
    await page.getByRole('button', { name: /figurinha não registrada/i }).click();
    await page.getByRole('dialog').getByRole('textbox').fill('INEXISTENTE-999');
    await page.getByRole('dialog').getByRole('button', { name: /^Colar$/i }).click();
    await expect(page.getByText(/INEXISTENTE-999.*não encontrada|não encontrada.*INEXISTENTE-999/i).first()).toBeVisible();
    await expect(page.getByRole('dialog').getByRole('textbox')).toBeVisible();
  });

  test('deve manter modal aberto e limpar campo após "Colar" (RN-CF26)', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    const tipoId = await getTipoAlbumId(request);
    const album = await criarAlbum(request, tipoId, 'BROCHURA');
    await page.goto(`/figurinhas?albumId=${album._id ?? album.id}`);
    await page.getByRole('button', { name: /figurinha não registrada/i }).click();
    await page.getByRole('dialog').getByRole('textbox').fill('FWC1');
    await page.getByRole('dialog').getByRole('button', { name: /^Colar$/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog').getByRole('textbox')).toHaveValue('');
    await expect(page.getByRole('dialog').getByRole('button', { name: /^Colar$/i })).toBeVisible();
    await expect(page.getByRole('dialog').getByRole('button', { name: /colar e fechar/i })).toBeVisible();
    await expect(page.getByRole('dialog').getByRole('button').filter({ hasText: /^Fechar$/ })).toBeVisible();
  });

  test('não deve alterar estoque ao colar via MFN (RN-CF11)', async ({ page, request }) => {
    const { identificador } = await usuarioAtivo(page, request);
    const tipoId = await getTipoAlbumId(request);
    const album = await criarAlbum(request, tipoId, 'BROCHURA');
    await adicionarEstoque(request, identificador, 'FWC2', 1);
    await page.goto(`/figurinhas?albumId=${album._id ?? album.id}`);
    const fwc2Row = page.getByText('FWC2').locator('..');
    const qtdAntes = await fwc2Row.getByText(/×\d+/).textContent();
    await page.getByRole('button', { name: /figurinha não registrada/i }).click();
    await page.getByRole('dialog').getByRole('textbox').fill('FWC1');
    await page.getByRole('dialog').getByRole('button', { name: /^Colar$/i }).click();
    const qtdDepois = await fwc2Row.getByText(/×\d+/).textContent();
    expect(qtdDepois).toBe(qtdAntes);
  });

  // ── Invalidação de cache ──────────────────────────────────────────────────────

  test('CF-CACHE-01 — colar do estoque → percentual atualizado em Gerenciar Álbum (cross-page)', async ({ page, request }) => {
    const { identificador } = await usuarioAtivo(page, request);
    const tipoId = await getTipoAlbumId(request);
    const album = await criarAlbum(request, tipoId, 'BROCHURA');
    await adicionarEstoque(request, identificador, 'FWC1', 1);
    await page.goto(`/figurinhas?albumId=${album._id ?? album.id}`);
    await page.getByText('FWC1').locator('..').getByRole('button', { name: /^colar$/i }).click();
    await expect(page.getByText(/figurinha colada/i)).toBeVisible();
    await page.goto(`/albums/${album._id ?? album.id}`);
    const pctText = await page.getByText(/\d+[,.]?\d*\s*%/).first().textContent();
    expect(parseFloat(pctText!.replace(',', '.'))).toBeGreaterThan(0);
  });

  test('CF-CACHE-02 — colar via MFN ("Fechar") → álbum atualizado em Gerenciar Álbum (cross-page)', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    const tipoId = await getTipoAlbumId(request);
    const album = await criarAlbum(request, tipoId, 'BROCHURA');
    await page.goto(`/figurinhas?albumId=${album._id ?? album.id}`);
    await page.getByRole('button', { name: /figurinha não registrada/i }).click();
    await page.getByRole('dialog').getByRole('textbox').fill('FWC1');
    await page.getByRole('dialog').getByRole('button', { name: /^Colar$/i }).click();
    await page.getByRole('dialog').getByRole('button').filter({ hasText: /^Fechar$/ }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await page.goto(`/albums/${album._id ?? album.id}`);
    const pctText = await page.getByText(/\d+[,.]?\d*\s*%/).first().textContent();
    expect(parseFloat(pctText!.replace(',', '.'))).toBeGreaterThan(0);
  });

  test('CF-CACHE-03 — colar via MFN ("Colar" — mantém aberto) → álbum atualizado ao fechar (cross-page)', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    const tipoId = await getTipoAlbumId(request);
    const album = await criarAlbum(request, tipoId, 'BROCHURA');
    await page.goto(`/figurinhas?albumId=${album._id ?? album.id}`);
    await page.getByRole('button', { name: /figurinha não registrada/i }).click();
    await page.getByRole('dialog').getByRole('textbox').fill('FWC1');
    await page.getByRole('dialog').getByRole('button', { name: /^Colar$/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog').getByRole('textbox')).toHaveValue('');
    await page.getByRole('dialog').getByRole('button').filter({ hasText: /^Fechar$/ }).click();
    await page.goto(`/albums/${album._id ?? album.id}`);
    const pctText = await page.getByText(/\d+[,.]?\d*\s*%/).first().textContent();
    expect(parseFloat(pctText!.replace(',', '.'))).toBeGreaterThan(0);
  });
});
