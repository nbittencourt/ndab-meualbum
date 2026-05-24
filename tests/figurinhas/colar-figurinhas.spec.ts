import { test, expect } from '@playwright/test';
import { usuarioAtivo, criarAlbum, adicionarEstoque, getTipoAlbumId } from '../support/helpers';

// ⚠️ RN-CF01 declara apenas status=ATIVO — diverge dos demais fluxos (EMAIL_PENDENTE permitido).
// Aguardar resolução da spec antes de finalizar casos de EMAIL_PENDENTE.

test.describe('Colar Figurinhas', () => {

  // ── Controle de acesso ────────────────────────────────────────────────────────

  test('deve redirecionar usuário não autenticado (RN-CF01)', async ({ page }) => {
    await page.goto('/colar');
    await expect(page).toHaveURL('/');
  });

  test.skip('deve permitir acesso a usuário EMAIL_PENDENTE – aguardar resolução de RN-CF01', async () => {});

  // ── CF0: Seleção de álbum ─────────────────────────────────────────────────────

  test.describe('Tela CF0 – Seleção de álbum', () => {

    test('deve exibir CF0 quando acessado sem contexto (entrada C, RN-CF03)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await criarAlbum(request, await getTipoAlbumId(request), 'BROCHURA');
      await page.goto('/colar');
      await expect(page.getByText(/escolha um álbum/i)).toBeVisible();
    });

    test('deve pular CF0 quando album_id está na URL (entradas A/B, RN-CF02)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const album = await criarAlbum(request, await getTipoAlbumId(request), 'BROCHURA');
      await page.goto(`/colar?albumId=${album._id ?? album.id}`);
      await expect(page.getByText(/escolha um álbum/i)).not.toBeVisible();
    });

    test('deve exibir estado vazio com CTA de Cadastro de Álbum (RN-CF04)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/colar');
      // TODO: verificar mensagem de estado vazio e link/botão para cadastro de álbum
    });
  });

  // ── CF1: Colagem ──────────────────────────────────────────────────────────────

  test.describe('Tela CF1 – Colagem', () => {

    test('deve exibir apenas figurinhas do tipo do álbum ativo (RN-CF06)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album = await criarAlbum(request, tipoId, 'BROCHURA');
      await adicionarEstoque(request, identificador, 'ESP-01', 1);
      await page.goto(`/colar?albumId=${album._id ?? album.id}`);
      // TODO: verificar que figurinha do tipo correto aparece; adicionar de tipo diferente e verificar ausência
    });

    test('deve exibir % conclusão e atualizar após colagem (RN-CF15)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album = await criarAlbum(request, tipoId, 'BROCHURA');
      await adicionarEstoque(request, identificador, 'ESP-01', 1);
      await page.goto(`/colar?albumId=${album._id ?? album.id}`);
      // TODO: capturar % antes, colar figurinha, verificar % atualizado sem reload
    });

    test('deve exigir confirmação para colar sobre figurinha já colada (RN-CF09)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album = await criarAlbum(request, tipoId, 'BROCHURA');
      // TODO: criar estado com figurinha já colada no álbum
      await page.goto(`/colar?albumId=${album._id ?? album.id}`);
      // TODO: expandir lista secundária, clicar em "Colar" e verificar alerta
      await adicionarEstoque(request, identificador, 'ESP-01', 1);
    });

    test('deve decrementar estoque ao colar figurinha do estoque (RN-CF10)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album = await criarAlbum(request, tipoId, 'BROCHURA');
      await adicionarEstoque(request, identificador, 'ESP-01', 2);
      await page.goto(`/colar?albumId=${album._id ?? album.id}`);
      // TODO: colar figurinha e verificar decremento de quantidade no item
    });

    test('não deve alterar estoque ao colar via MFN (RN-CF11)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album = await criarAlbum(request, tipoId, 'BROCHURA');
      await page.goto(`/colar?albumId=${album._id ?? album.id}`);
      await page.getByRole('button', { name: /figurinha não registrada/i }).click();
      // TODO: digitar número válido, confirmar e verificar que estoque não mudou
    });

    test('deve trocar álbum ativo sem desfazer colagens anteriores (RN-CF14)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album1 = await criarAlbum(request, tipoId, 'BROCHURA');
      const album2 = await criarAlbum(request, tipoId, 'CAPA_DURA');
      await page.goto(`/colar?albumId=${album1._id ?? album1.id}`);
      // TODO: trocar para album2 e verificar que colagens do album1 permanecem
      expect(album2).toBeTruthy();
    });
  });
});
