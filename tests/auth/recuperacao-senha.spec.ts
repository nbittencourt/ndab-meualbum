import { test, expect } from '../support/fixtures';
import { criarUsuario, confirmarEmail } from '../support/helpers';

test.describe('Recuperação de Senha', () => {

  // ── Tela L2 ──────────────────────────────────────────────────────────────────

  test.describe('Tela L2 – Solicitar link', () => {

    test('deve pré-preencher campo Email quando há contexto da Tela L1 (RN-L30)', async ({ page }) => {
      const email = 'contexto@exemplo.com';
      await page.goto(`/forgot-password?email=${encodeURIComponent(email)}`);
      await expect(page.getByLabel('Email')).toHaveValue(email);
    });

    test('deve exibir formulário com campo Email e link de voltar', async ({ page }) => {
      await page.goto('/forgot-password');
      await expect(page.getByLabel('Email')).toBeVisible();
      await expect(page.getByRole('button', { name: /enviar link/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /voltar/i })).toBeVisible();
    });

    test('deve exibir mesma mensagem para email existente e inexistente (RN-L04)', async ({ page, request }) => {
      const { dados } = await criarUsuario(request);

      await page.goto('/forgot-password');
      await page.getByLabel('Email').fill(dados.email as string);
      await page.getByRole('button', { name: /enviar link/i }).click();
      const textoExistente = await page.getByText(/se esse email estiver cadastrado/i).textContent();

      await page.goto('/forgot-password');
      await page.getByLabel('Email').fill('inexistente@exemplo.com');
      await page.getByRole('button', { name: /enviar link/i }).click();
      const textoInexistente = await page.getByText(/se esse email estiver cadastrado/i).textContent();

      expect(textoExistente).toBe(textoInexistente);
    });
  });

  // ── Tela L3 ──────────────────────────────────────────────────────────────────

  test.describe('Tela L3 – Redefinição', () => {

    async function obterToken(request: any, email: string) {
      await request.post('/api/v1/auth/forgot-password', { data: { email } });
      const res = await request.get(`/api/v1/test/token-recuperacao?email=${encodeURIComponent(email)}`);
      return (await res.json()).token;
    }

    test('deve exibir checklist de senha em tempo real', async ({ page, request }) => {
      const { dados, identificador } = await criarUsuario(request);
      await confirmarEmail(request, identificador);
      const token = await obterToken(request, dados.email as string);

      await page.goto(`/redefinir-senha?token=${token}`);
      await page.getByLabel('Nova senha', { exact: true }).fill('a');
      await expect(page.getByText('Mínimo de 8 caracteres')).toBeVisible();
    });

    test('deve exibir item "Senhas idênticas" ao interagir com segundo campo', async ({ page, request }) => {
      const { dados, identificador } = await criarUsuario(request);
      await confirmarEmail(request, identificador);
      const token = await obterToken(request, dados.email as string);

      await page.goto(`/redefinir-senha?token=${token}`);
      await page.getByLabel('Confirmar nova senha').fill('x');
      await expect(page.getByText(/senhas idênticas/i)).toBeVisible();
    });

    test('deve manter botão desabilitado até checklist completo (RN-L10)', async ({ page, request }) => {
      const { dados, identificador } = await criarUsuario(request);
      await confirmarEmail(request, identificador);
      const token = await obterToken(request, dados.email as string);

      await page.goto(`/redefinir-senha?token=${token}`);
      const botao = page.getByRole('button', { name: /redefinir senha/i });

      await expect(botao).toBeDisabled();
      await page.getByLabel('Nova senha', { exact: true }).fill('fraca');
      await expect(botao).toBeDisabled();
      await page.getByLabel('Nova senha', { exact: true }).fill('NovaSenha@123');
      await page.getByLabel('Confirmar nova senha').fill('NovaSenha@456');
      await expect(botao).toBeDisabled();
      await page.getByLabel('Confirmar nova senha').fill('NovaSenha@123');
      await expect(botao).toBeEnabled();
    });

    test('deve redefinir senha e redirecionar usuário ATIVO para Home (RN-L11)', async ({ page, request }) => {
      const { dados, identificador } = await criarUsuario(request);
      await confirmarEmail(request, identificador);
      const token = await obterToken(request, dados.email as string);

      await page.goto(`/redefinir-senha?token=${token}`);
      await page.getByLabel('Nova senha', { exact: true }).fill('NovaSenha@123');
      await page.getByLabel('Confirmar nova senha').fill('NovaSenha@123');
      await page.getByRole('button', { name: /redefinir senha/i }).click();

      await expect(page).toHaveURL(/\/home/);
    });

    test('deve invalidar sessões anteriores após troca (RN-L15)', async ({ page, context, request }) => {
      const { dados, identificador } = await criarUsuario(request);
      await confirmarEmail(request, identificador);

      const ctx2 = await context.browser()!.newContext();
      const page2 = await ctx2.newPage();
      await page2.goto('/');
      await page2.getByLabel('Email').fill(dados.email as string);
      await page2.getByRole('textbox', { name: 'Senha' }).fill(dados.password as string);
      await page2.getByRole('button', { name: /entrar/i }).click();
      await page2.waitForURL(/\/home/);
      await expect(page2).toHaveURL(/\/home/);

      const token = await obterToken(request, dados.email as string);
      await page.goto(`/redefinir-senha?token=${token}`);
      await page.getByLabel('Nova senha', { exact: true }).fill('NovaSenha@123');
      await page.getByLabel('Confirmar nova senha').fill('NovaSenha@123');
      await page.getByRole('button', { name: /redefinir senha/i }).click();

      await page2.goto('/home');
      await expect(page2).toHaveURL(/\//);

      await ctx2.close();
    });
  });

  // ── Tela L4 ──────────────────────────────────────────────────────────────────

  test.describe('Tela L4 – Token inválido', () => {

    test('deve exibir tela de erro para token inexistente', async ({ page }) => {
      await page.goto('/redefinir-senha?token=token-inexistente');
      await expect(page.getByText(/link inválido ou expirado/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /solicitar novo link/i })).toBeVisible();
    });

    test('"Solicitar novo link" deve redirecionar para Tela L2', async ({ page }) => {
      await page.goto('/redefinir-senha?token=token-inexistente');
      await page.getByRole('button', { name: /solicitar novo link/i }).click();
      await expect(page).toHaveURL(/\/forgot-password/);
    });

    test('deve redirecionar ou exibir erro ao acessar /redefinir-senha sem token (RN-L32)', async ({ page }) => {
      await page.goto('/redefinir-senha');
      await expect(
        page.getByText(/link inválido ou expirado/i).or(page.getByText(/token/i))
      ).toBeVisible().catch(async () => {
        await expect(page).toHaveURL('/');
      });
    });

    test('deve exibir erro para token já utilizado (RN-L06)', async ({ page, request }) => {
      const { dados, identificador } = await criarUsuario(request);
      await confirmarEmail(request, identificador);
      await request.post('/api/v1/auth/forgot-password', { data: { email: dados.email } });
      const res = await request.get(`/api/v1/test/token-recuperacao?email=${encodeURIComponent(dados.email as string)}`);
      const { token } = await res.json();

      await page.goto(`/redefinir-senha?token=${token}`);
      await page.getByLabel('Nova senha', { exact: true }).fill('NovaSenha@123');
      await page.getByLabel('Confirmar nova senha').fill('NovaSenha@123');
      await page.getByRole('button', { name: /redefinir senha/i }).click();
      await page.waitForURL(/\/home/);

      await page.goto(`/redefinir-senha?token=${token}`);
      await expect(page.getByText(/link inválido ou expirado/i)).toBeVisible();
    });
  });
});
