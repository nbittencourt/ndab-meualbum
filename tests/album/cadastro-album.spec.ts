import { test, expect } from '../support/fixtures';
import { usuarioAtivo, adicionarEstoque } from '../support/helpers';

test.describe('Cadastro de Álbum', () => {

  test('deve exibir formulário com campos Tipo, Variante e Nome personalizado', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    await page.goto('/albums/novo');
    await expect(page.getByRole('heading', { name: /novo álbum/i })).toBeVisible();
    await expect(page.getByRole('radio', { name: /brochura/i })).toBeVisible();
    await expect(page.getByLabel(/nome personalizado/i)).toBeVisible();
  });

  test('deve exibir bloco de detalhes do tipo selecionado (RN-CA13)', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    await page.goto('/albums/novo');
    await expect(page.getByText(/980|total de figurinhas/i)).toBeVisible();
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
    await adicionarEstoque(request, identificador, 'FWC1', 1);
    await page.goto('/albums/novo');
    await page.getByRole('radio', { name: /brochura/i }).click();
    await page.getByRole('button', { name: /criar álbum/i }).click();

    await expect(page.getByText(/álbum criado/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /colar figurinhas/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /agora não/i })).toBeVisible();
  });

  test('"Agora não" no CA2 redireciona para Home (RN-CA10)', async ({ page, request }) => {
    const { identificador } = await usuarioAtivo(page, request);
    await adicionarEstoque(request, identificador, 'FWC1', 1);
    await page.goto('/albums/novo');
    await page.getByRole('radio', { name: /brochura/i }).click();
    await page.getByRole('button', { name: /criar álbum/i }).click();
    await page.getByRole('button', { name: /agora não/i }).click();
    await expect(page).toHaveURL(/\/home/);
  });

  test('"Colar figurinhas" no CA2 redireciona para Colar Figurinhas (RN-CA11)', async ({ page, request }) => {
    const { identificador } = await usuarioAtivo(page, request);
    await adicionarEstoque(request, identificador, 'FWC1', 1);
    await page.goto('/albums/novo');
    await page.getByRole('radio', { name: /brochura/i }).click();
    await page.getByRole('button', { name: /criar álbum/i }).click();
    await page.getByRole('button', { name: /colar figurinhas/i }).click();
    await expect(page).toHaveURL(/\/colar/);
  });

  test('deve truncar nome personalizado em 60 chars (RN-CA06)', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    await page.goto('/albums/novo');
    const campo = page.getByLabel(/nome personalizado/i);
    await campo.fill('A'.repeat(61));
    await expect(campo).toHaveValue('A'.repeat(60));
  });

  test('deve sanitizar nome personalizado – sem tags HTML (RN-CA06)', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    await page.goto('/albums/novo');
    await page.getByLabel(/nome personalizado/i).fill('<b>teste</b>');
    await page.getByRole('radio', { name: /brochura/i }).click();
    await page.getByRole('button', { name: /criar álbum/i }).click();
    await page.waitForURL(/\/home/);
    const cardAlbum = page.getByRole('article').first();
    await expect(cardAlbum.locator('b')).not.toBeVisible();
    await expect(cardAlbum.getByText('<b>teste</b>', { exact: true })).not.toBeVisible();
  });
});
