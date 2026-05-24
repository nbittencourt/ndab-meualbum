import { test, expect } from '@playwright/test';
import { usuarioAtivo, criarUsuario, confirmarEmail } from '../support/helpers';

test.describe('Perfil do Usuário', () => {

  // ── Identificador ────────────────────────────────────────────────────────────

  test.describe('Identificador', () => {

    test('deve exibir identificador de 6 chars em modo somente leitura (RN-P02)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await expect(page.getByText(identificador)).toBeVisible();
    });

    test('deve copiar identificador e exibir confirmação temporária (RN-P03)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await page.getByRole('button', { name: /copiar/i }).click();
      await expect(page.getByText('Copiado!', { exact: true })).toBeVisible();
      // TODO: verificar que "Copiado!" desaparece após alguns segundos
    });
  });

  // ── Nome ──────────────────────────────────────────────────────────────────────

  test.describe('Alteração de nome', () => {

    test('deve pré-preencher campo com nome atual', async ({ page, request }) => {
      const dados = await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await page.getByRole('button', { name: /editar/i }).click();
      await expect(page.getByLabel('Nome completo')).toHaveValue(dados.name as string);
    });

    test('deve manter "Salvar" desabilitado quando nome não foi alterado (RN-P05)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await page.getByRole('button', { name: /editar/i }).click();
      await expect(page.getByTestId('salvar-nome')).toBeDisabled();
    });

    test('deve manter "Salvar" desabilitado quando campo está vazio (RN-P05)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await page.getByRole('button', { name: /editar/i }).click();
      await page.getByLabel('Nome completo').clear();
      await expect(page.getByTestId('salvar-nome')).toBeDisabled();
    });

    test('deve salvar novo nome com sucesso (RN-P04)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await page.getByRole('button', { name: /editar/i }).click();
      await page.getByLabel('Nome completo').fill('Nome Alterado');
      await page.getByTestId('salvar-nome').click();
      // TODO: verificar feedback de sucesso inline e nome atualizado no header
    });

    test('deve rejeitar nome com mais de 100 caracteres (RN-P04)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await page.getByRole('button', { name: /editar/i }).click();
      await page.getByLabel('Nome completo').fill('A'.repeat(101));
      await page.getByTestId('salvar-nome').click();
      // TODO: verificar mensagem de erro de comprimento
    });
  });

  // ── Email ─────────────────────────────────────────────────────────────────────

  test.describe('Alteração de email', () => {

    test('deve iniciar alteração e exibir aviso de EMAIL_PENDENTE', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await page.getByLabel('Email').fill(`novo+${Date.now()}@exemplo.com`);
      await page.getByTestId('salvar-email').click();
      // TODO: verificar aviso de pendência exibido abaixo do campo
    });

    test('deve bloquear nova solicitação durante cooldown de 5 min (RN-P12)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/perfil');

      await page.getByLabel('Email').fill(`novo1+${Date.now()}@exemplo.com`);
      await page.getByTestId('salvar-email').click();

      await page.getByLabel('Email').fill(`novo2+${Date.now()}@exemplo.com`);
      await page.getByTestId('salvar-email').click();

      await expect(page.getByText(/aguarde/i)).toBeVisible();
    });

    test('deve rejeitar email já em uso por outro usuário (RN-P07)', async ({ page, request }) => {
      const { dados: outro } = await criarUsuario(request);
      await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await page.getByLabel('Email').fill(outro.email as string);
      await page.getByTestId('salvar-email').click();
      await expect(page.getByText(/já está em uso/i)).toBeVisible();
    });

    test('deve cancelar alteração e retornar status ATIVO (RN-P14)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await page.getByLabel('Email').fill(`novo+${Date.now()}@exemplo.com`);
      await page.getByTestId('salvar-email').click();
      await page.getByRole('button', { name: /cancelar alteração/i }).click();
      // TODO: verificar ausência do aviso de pendência
    });
  });

  // ── Senha ─────────────────────────────────────────────────────────────────────

  test.describe('Alteração de senha', () => {

    test('deve manter "Alterar senha" desabilitado até checklist completo (RN-P21)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await expect(page.getByRole('button', { name: /alterar senha/i })).toBeDisabled();
    });

    test('deve exibir erro inline para senha atual incorreta (RN-P19)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await page.getByLabel('Senha atual').fill('SenhaErrada@1');
      await page.getByLabel('Nova senha', { exact: true }).fill('NovaSenha@123');
      await page.getByLabel('Confirmar nova senha', { exact: true }).fill('NovaSenha@123');
      await page.getByRole('button', { name: /alterar senha/i }).click();
      // TODO: verificar erro inline no campo "Senha atual"
    });

    test('deve alterar senha mantendo sessão corrente ativa (RN-P22a)', async ({ page, request }) => {
      const dados = await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await page.getByLabel('Senha atual').fill(dados.password as string);
      await page.getByLabel('Nova senha', { exact: true }).fill('NovaSenha@123');
      await page.getByLabel('Confirmar nova senha', { exact: true }).fill('NovaSenha@123');
      await page.getByRole('button', { name: /alterar senha/i }).click();
      await expect(page).not.toHaveURL('/');
    });

    test('deve invalidar outras sessões após troca de senha (RN-P22)', async ({ page, context, request }) => {
      const dados = await usuarioAtivo(page, request);

      const ctx2 = await context.browser()!.newContext();
      const page2 = await ctx2.newPage();
      await page2.goto('/');
      await page2.getByLabel('Email').fill(dados.email as string);
      await page2.getByRole('textbox', { name: 'Senha' }).fill(dados.password as string);
      await page2.getByRole('button', { name: /entrar/i }).click();
      await page2.waitForURL(/\/home/);

      await page.goto('/perfil');
      await page.getByLabel('Senha atual').fill(dados.password as string);
      await page.getByLabel('Nova senha', { exact: true }).fill('NovaSenha@123');
      await page.getByLabel('Confirmar nova senha', { exact: true }).fill('NovaSenha@123');
      await page.getByRole('button', { name: /alterar senha/i }).click();
      await expect(page.getByText(/senha alterada com sucesso/i)).toBeVisible();

      await page2.goto('/home');
      await expect(page2).toHaveURL('/');

      await ctx2.close();
    });
  });

  // ── Exclusão de conta ─────────────────────────────────────────────────────────

  test.describe('Exclusão de conta', () => {

    test('deve manter "Confirmar exclusão" desabilitado até identificador correto (RN-P24)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await page.getByRole('button', { name: /excluir minha conta/i }).click();

      const botao = page.getByRole('button', { name: /confirmar exclusão/i });
      await expect(botao).toBeDisabled();
      await page.getByPlaceholder(/identificador/i).fill('ERRADO');
      await expect(botao).toBeDisabled();
      await page.getByPlaceholder(/identificador/i).fill(identificador);
      await expect(botao).toBeEnabled();
    });

    test('deve excluir conta e redirecionar para landing com mensagem (RN-P27)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await page.getByRole('button', { name: /excluir minha conta/i }).click();
      await page.getByPlaceholder(/identificador/i).fill(identificador);
      await page.getByRole('button', { name: /confirmar exclusão/i }).click();

      await expect(page).toHaveURL('/');
      await expect(page.getByText(/conta foi excluída/i)).toBeVisible();
    });

    test('deve cancelar exclusão sem efeito', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await page.getByRole('button', { name: /excluir minha conta/i }).click();
      await page.getByRole('button', { name: /cancelar/i }).click();
      await expect(page).toHaveURL(/\/perfil/);
    });
  });
});
