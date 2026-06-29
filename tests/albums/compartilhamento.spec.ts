import { test, expect } from '../support/fixtures';
import { usuarioAtivo, criarAlbum, getTipoAlbumId } from '../support/helpers';

test.describe('Link compartilhado — #47', () => {

  test('cenário 1: figurinha colada após gerar o link aparece colada ao reabrir o link', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    const tipoId = await getTipoAlbumId(request);
    const album = await criarAlbum(request, tipoId, 'BROCHURA');
    const albumId = String(album._id ?? album.id);

    // Cola FWC1 antes de gerar o link
    await request.post('/api/v1/colar/direta', { data: { albumId, figurinhaNumero: 'FWC1' } });

    // Gera o link
    const shareRes = await request.post(`/api/v1/albums/${albumId}/share`);
    const { token } = await shareRes.json();

    // Abre o link — FWC1 deve aparecer colada
    await page.goto(`/faltam/${token}`);
    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible();
    const celFWC1antes = page.locator('[aria-label="FWC1 colada"]');
    await expect(celFWC1antes).toBeVisible();

    // Cola FWC2 DEPOIS de ter gerado o link
    await request.post('/api/v1/colar/direta', { data: { albumId, figurinhaNumero: 'FWC2' } });

    // Reabre o link — FWC2 deve aparecer colada
    await page.goto(`/faltam/${token}`);
    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible();
    const celFWC2depois = page.locator('[aria-label="FWC2 colada"]');
    await expect(celFWC2depois).toBeVisible();
  });

  test('cenário 2: figurinha adicionada ao bolo de repetidas após gerar o link aparece repetida ao reabrir o link', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    const tipoId = await getTipoAlbumId(request);
    const album = await criarAlbum(request, tipoId, 'BROCHURA');
    const albumId = String(album._id ?? album.id);

    // Cola FWC1 antes de gerar o link
    await request.post('/api/v1/colar/direta', { data: { albumId, figurinhaNumero: 'FWC1' } });

    // Gera o link
    const shareRes = await request.post(`/api/v1/albums/${albumId}/share`);
    const { token } = await shareRes.json();

    // Abre o link — FWC1 deve aparecer colada (sem repetida ainda)
    await page.goto(`/faltam/${token}`);
    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible();
    await expect(page.locator('[aria-label="FWC1 colada"]')).toBeVisible();

    // Adiciona FWC1 (já colada) ao bolo de repetidas DEPOIS de ter gerado o link
    await request.post('/api/v1/estoque/adicionar', { data: { figurinhaNumero: 'FWC1' } });

    // Reabre o link — FWC1 deve aparecer repetida
    await page.goto(`/faltam/${token}`);
    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible();
    const celFWC1repetida = page.locator('[aria-label="FWC1 repetida"]');
    await expect(celFWC1repetida).toBeVisible();
  });

});
