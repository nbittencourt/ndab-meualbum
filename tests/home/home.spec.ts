import { test, expect } from '@playwright/test';
import { usuarioAtivo, criarAlbum, getTipoAlbumId } from '../support/helpers';

test.describe('Home', () => {

  test('deve redirecionar usuário não autenticado para login', async ({ page }) => {
    await page.goto('/home');
    await expect(page).toHaveURL('/');
  });

  test('deve exibir CTA "Abrir Pacotinhos" sempre (RN-H14)', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    await expect(page.getByRole('button', { name: /abrir pacotinhos/i })).toBeVisible();
  });

  test('deve exibir nome e identificador do usuário no header', async ({ page, request }) => {
    const dados = await usuarioAtivo(page, request);
    await expect(page.getByText(dados.identificador)).toBeVisible();
  });

  test.describe('Seção Meus Álbuns', () => {

    test('deve exibir estado vazio sem álbuns (RN-H03)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      // TODO: verificar mensagem de estado vazio e CTA de criação
    });

    test('deve listar álbuns com tipo, variante por extenso e % conclusão (RN-H13, RN-H16)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await criarAlbum(request, await getTipoAlbumId(request), 'BROCHURA');
      await page.reload();
      // TODO: verificar card com nome do tipo, variante "Brochura" e percentual
    });

    test('deve ordenar por criado_em DESC – mais recente primeiro (RN-H04)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      await criarAlbum(request, tipoId, 'BROCHURA');
      await criarAlbum(request, tipoId, 'CAPA_DURA');
      await page.reload();
      // TODO: verificar que CAPA_DURA aparece antes de BROCHURA
    });

    test('deve paginar com mais de 5 álbuns – exatamente 5 por página (RN-H05, RN-H06)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      for (let i = 0; i < 6; i++) {
        await criarAlbum(request, tipoId, 'BROCHURA');
      }
      await page.reload();
      // TODO: contar cards = 5; verificar controles de paginação
    });

    test('não deve exibir paginação com 5 ou menos álbuns (RN-H05)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      for (let i = 0; i < 5; i++) {
        await criarAlbum(request, tipoId, 'BROCHURA');
      }
      await page.reload();
      // TODO: verificar ausência de controles de paginação
    });
  });

  test.describe('Seção Figurinhas Repetidas', () => {

    test('deve exibir estado vazio quando estoque está vazio (RN-H11)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      // TODO: verificar mensagem de estado vazio do estoque
    });

    test('deve exibir no máximo 5 figurinhas no ranking (RN-H07)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      // TODO: adicionar 6+ figurinhas ao estoque e verificar que apenas 5 aparecem
    });

    test('deve desempatar por figurinha.numero ASC (RN-H09)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      // TODO: criar figurinhas com mesma quantidade e verificar ordem por número
    });
  });

  test.describe('Sessão expirada', () => {

    test('deve redirecionar para login quando token_versao diverge', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      await request.post('/api/v1/test/invalidar-sessao', { data: { identificador } });
      await page.goto('/home', { waitUntil: 'commit' }).catch(() => {});
      await expect(page).toHaveURL('/');
    });
  });
});
