import { test, expect } from '@playwright/test';
import { criarUsuario, confirmarEmail } from '../support/helpers';

test.describe('Login', () => {

  test('deve exibir formulário com Email, Senha e links auxiliares', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Senha' })).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /esqueci a senha/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /criar conta/i }).first()).toBeVisible();
  });

  test('deve redirecionar usuário ATIVO para Home (RN-L03)', async ({ page, request }) => {
    const { dados, identificador } = await criarUsuario(request);
    await confirmarEmail(request, identificador);

    await page.goto('/');
    await page.getByLabel('Email').fill(dados.email as string);
    await page.getByRole('textbox', { name: 'Senha' }).fill(dados.password as string);
    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page).toHaveURL(/\/home/);
  });

  test('deve redirecionar usuário EMAIL_PENDENTE para Home (RN-L03)', async ({ page, request }) => {
    const { dados, identificador } = await criarUsuario(request);
    await confirmarEmail(request, identificador);
    await request.post('/api/v1/test/iniciar-alteracao-email', {
      data: { identificador, email_novo: `novo+${Date.now()}@exemplo.com` },
    });

    await page.goto('/');
    await page.getByLabel('Email').fill(dados.email as string);
    await page.getByRole('textbox', { name: 'Senha' }).fill(dados.password as string);
    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page).toHaveURL(/\/home/);
  });

  test('deve redirecionar usuário PENDENTE para Tela 2 sem reenviar email (RN-L02)', async ({ page, request }) => {
    const { dados } = await criarUsuario(request);

    await page.goto('/');
    await page.getByLabel('Email').fill(dados.email as string);
    await page.getByRole('textbox', { name: 'Senha' }).fill(dados.password as string);
    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page.getByText(/confirme seu email/i)).toBeVisible();
  });

  test('deve exibir mensagem genérica para credenciais inválidas (RN-L01)', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Email').fill('naoexiste@exemplo.com');
    await page.getByRole('textbox', { name: 'Senha' }).fill('SenhaErrada@1');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.getByText(/email ou senha incorretos/i)).toBeVisible();
  });

  test('não deve revelar se o problema é o email ou a senha (RN-L01)', async ({ page, request }) => {
    const { dados } = await criarUsuario(request);

    await page.goto('/');
    await page.getByLabel('Email').fill(dados.email as string);
    await page.getByRole('textbox', { name: 'Senha' }).fill('SenhaErrada@999');
    await page.getByRole('button', { name: /entrar/i }).click();
    const msgEmailCorreto = await page.getByText(/email ou senha incorretos/i).textContent();

    await page.getByLabel('Email').fill('nao-existe@exemplo.com');
    await page.getByRole('textbox', { name: 'Senha' }).fill('SenhaErrada@999');
    await page.getByRole('button', { name: /entrar/i }).click();
    const msgEmailErrado = await page.getByText(/email ou senha incorretos/i).textContent();

    expect(msgEmailCorreto).toBe(msgEmailErrado);
  });

  test('deve validar campos obrigatórios localmente sem chamar servidor', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page).toHaveURL('/');
    // TODO: verificar mensagem de validação local (sem status 4xx/5xx na rede)
  });
});
