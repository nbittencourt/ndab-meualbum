import { test, expect } from '@playwright/test';
import { usuarioAtivo, adicionarEstoque } from '../support/helpers';

test.describe('Cadastro de Álbum', () => {

  test('deve exibir formulário com Tipo, Variante e Nome personalizado', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    await page.goto('/albums/novo');
    await expect(page.getByText(/novo álbum/i)).toBeVisible();
    // TODO: verificar campos por label/role
  });

  test('deve manter "Criar álbum" desabilitado sem variante selecionada (RN-CA03)', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    await page.goto('/albums/novo');
    await expect(page.getByRole('button', { name: /criar álbum/i })).toBeDisabled();
  });

  test('deve habilitar "Criar álbum" após selecionar variante', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    await page.goto('/albums/novo');
    await page.getByRole('radio', { name: /brochura/i }).click();
    await expect(page.getByRole('button', { name: /criar álbum/i })).toBeEnabled();
  });

  test('deve exibir bloco de detalhes do tipo ao selecionar (RN-CA13)', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    await page.goto('/albums/novo');
    // TODO: selecionar tipo e verificar bloco de detalhes (nome e total de figurinhas)
  });

  test('deve cancelar e retornar para Home sem persistir (RN-CA12)', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    await page.goto('/albums/novo');
    await page.getByRole('button', { name: /cancelar/i }).click();
    await expect(page).toHaveURL(/\/home/);
  });

  test('deve criar álbum e ir para Home quando estoque está vazio (RN-CA08)', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    await page.goto('/albums/novo');
    await page.getByRole('radio', { name: /brochura/i }).click();
    await page.getByRole('button', { name: /criar álbum/i }).click();
    await expect(page).toHaveURL(/\/home/);
  });

  test('deve exibir Diálogo CA2 quando há figurinhas no estoque (RN-CA09)', async ({ page, request }) => {
    const { identificador } = await usuarioAtivo(page, request);
    await adicionarEstoque(request, identificador, 'ESP-01', 1);
    await page.goto('/albums/novo');
    await page.getByRole('radio', { name: /brochura/i }).click();
    await page.getByRole('button', { name: /criar álbum/i }).click();

    await expect(page.getByText(/álbum criado/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /colar figurinhas/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /agora não/i })).toBeVisible();
  });

  test('"Agora não" no CA2 redireciona para Home (RN-CA10)', async ({ page, request }) => {
    const { identificador } = await usuarioAtivo(page, request);
    await adicionarEstoque(request, identificador, 'ESP-01', 1);
    await page.goto('/albums/novo');
    await page.getByRole('radio', { name: /brochura/i }).click();
    await page.getByRole('button', { name: /criar álbum/i }).click();
    await page.getByRole('button', { name: /agora não/i }).click();
    await expect(page).toHaveURL(/\/home/);
  });

  test('"Colar figurinhas" no CA2 redireciona para Colar Figurinhas (RN-CA11)', async ({ page, request }) => {
    const { identificador } = await usuarioAtivo(page, request);
    await adicionarEstoque(request, identificador, 'ESP-01', 1);
    await page.goto('/albums/novo');
    await page.getByRole('radio', { name: /brochura/i }).click();
    await page.getByRole('button', { name: /criar álbum/i }).click();
    await page.getByRole('button', { name: /colar figurinhas/i }).click();
    await expect(page).toHaveURL(/\/colar/);
  });

  test('deve rejeitar nome personalizado com mais de 60 chars (RN-CA06)', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    await page.goto('/albums/novo');
    await page.getByLabel(/nome personalizado/i).fill('A'.repeat(61));
    await page.getByRole('radio', { name: /brochura/i }).click();
    await page.getByRole('button', { name: /criar álbum/i }).click();
    // TODO: verificar mensagem de erro de comprimento
  });

  test('deve sanitizar nome personalizado – sem tags HTML (RN-CA06)', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    await page.goto('/albums/novo');
    await page.getByLabel(/nome personalizado/i).fill('<b>teste</b>');
    await page.getByRole('radio', { name: /brochura/i }).click();
    await page.getByRole('button', { name: /criar álbum/i }).click();
    // TODO: verificar que o card não renderiza HTML
  });
});
