import { test, expect } from '../support/fixtures';
import { usuarioAtivo } from '../support/helpers';

test.describe('Logout', () => {

  test('deve redirecionar para login/landing após logout (RN-L18)', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    await page.getByRole('button', { name: /sair|logout/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('não deve exibir confirmação antes do logout (RN-L18)', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    await page.getByRole('button', { name: /sair|logout/i }).click();
    await expect(page).toHaveURL('/');
    // Verificar que nenhum modal/diálogo foi exibido durante a navegação
  });

  test('deve invalidar JWTs em outras sessões após logout (RN-L17)', async ({ page, context, request }) => {
    await usuarioAtivo(page, request);

    const page2 = await context.newPage();
    await page2.goto('/home');
    await expect(page2).toHaveURL(/\/home/);

    await page.getByRole('button', { name: /sair|logout/i }).click();

    await page2.goto('/home');
    await expect(page2).toHaveURL('/');
  });
});
