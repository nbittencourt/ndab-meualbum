import { test, expect } from '../support/fixtures';
import { usuarioAtivo, criarUsuario } from '../support/helpers';

test.describe('Perfil do Usuário', () => {

  // ── Identificador ────────────────────────────────────────────────────────────

  test.describe('Identificador', () => {

    test('deve exibir identificador de 6 chars em modo somente leitura (RN-P02)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await expect(page.getByText(identificador)).toBeVisible();
    });

    test('deve copiar identificador e exibir confirmação temporária "Copiado!" (RN-P03)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await page.getByRole('button', { name: /copiar/i }).click();
      await expect(page.getByText('Copiado!', { exact: true })).toBeVisible();
      await expect(page.getByText('Copiado!', { exact: true })).not.toBeVisible({ timeout: 5000 });
    });
  });

  // ── Nome ──────────────────────────────────────────────────────────────────────

  test.describe('Alteração de nome', () => {

    test('deve pré-preencher campo com nome atual ao entrar em edição', async ({ page, request }) => {
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

    test('deve salvar novo nome com sucesso e atualizar header (RN-P04)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await page.getByRole('button', { name: /editar/i }).click();
      await page.getByLabel('Nome completo').fill('Nome Alterado');
      await page.getByTestId('salvar-nome').click();
      await expect(page.getByText(/salvo|sucesso/i)).toBeVisible();
      await expect(page.getByText('Nome Alterado')).toBeVisible();
    });

    test('deve rejeitar nome com mais de 100 caracteres (RN-P04)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await page.getByRole('button', { name: /editar/i }).click();
      await page.getByLabel('Nome completo').fill('A'.repeat(101));
      await page.getByTestId('salvar-nome').click();
      await expect(page.getByText(/máximo de 100|limite de 100|muito longo/i)).toBeVisible();
    });
  });

  // ── Email ─────────────────────────────────────────────────────────────────────

  test.describe('Alteração de email', () => {

    test('deve iniciar alteração e exibir aviso de EMAIL_PENDENTE', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await page.getByLabel('Email').fill(`novo+${Date.now()}@exemplo.com`);
      await page.getByTestId('salvar-email').click();
      await expect(page.getByText(/pendente|aguardando confirmação/i)).toBeVisible();
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

    test('deve rejeitar email igual ao email_pendente já em espera (RN-P40)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/perfil');
      const emailNovo = `mesmo+${Date.now()}@exemplo.com`;
      await page.getByLabel('Email').fill(emailNovo);
      await page.getByTestId('salvar-email').click();

      await page.goto('/perfil');
      await page.getByLabel('Email').fill(emailNovo);
      await page.getByTestId('salvar-email').click();
      await expect(page.getByText(/já em espera|mesmo email pendente|aguarde/i)).toBeVisible();
    });

    test('deve cancelar alteração e retornar status ATIVO (RN-P14)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await page.getByLabel('Email').fill(`novo+${Date.now()}@exemplo.com`);
      await page.getByTestId('salvar-email').click();
      await page.getByRole('button', { name: /cancelar alteração/i }).click();
      await expect(page.getByText(/pendente|aguardando confirmação/i)).not.toBeVisible();
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
      await expect(page.getByText(/senha atual incorreta|senha atual inválida/i)).toBeVisible();
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

    test('deve limpar campos de nova senha e confirmação após alteração (RN-P42)', async ({ page, request }) => {
      const dados = await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await page.getByLabel('Senha atual').fill(dados.password as string);
      await page.getByLabel('Nova senha', { exact: true }).fill('NovaSenha@123');
      await page.getByLabel('Confirmar nova senha', { exact: true }).fill('NovaSenha@123');
      await page.getByRole('button', { name: /alterar senha/i }).click();
      await expect(page.getByLabel('Nova senha', { exact: true })).toHaveValue('');
      await expect(page.getByLabel('Confirmar nova senha', { exact: true })).toHaveValue('');
    });

    test('deve invalidar outras sessões após troca de senha (RN-P22)', async ({ page, context, request }) => {
      const dados = await usuarioAtivo(page, request);

      // Save the current session cookie before the password change (simulates another active device)
      const cookiesBefore = await page.context().cookies();
      const oldCookie = cookiesBefore.find((c) => c.name === '__session');

      await page.goto('/perfil');
      await page.getByLabel('Senha atual').fill(dados.password as string);
      await page.getByLabel('Nova senha', { exact: true }).fill('NovaSenha@123');
      await page.getByLabel('Confirmar nova senha', { exact: true }).fill('NovaSenha@123');
      await page.getByRole('button', { name: /alterar senha/i }).click();
      await expect(page.getByText(/senha alterada com sucesso/i)).toBeVisible();

      // Simulate the other device using the old session cookie
      const ctx2 = await context.browser()!.newContext();
      const page2 = await ctx2.newPage();
      if (oldCookie) {
        await ctx2.addCookies([{ ...oldCookie, domain: 'localhost' }]);
      }
      await page2.goto('/home');
      await expect(page2).toHaveURL('/');

      await ctx2.close();
    });
  });

  // ── Exportar Dados (LGPD — RN-P29, P30) ─────────────────────────────────────

  test.describe('Exportar Dados', () => {

    test('deve exibir seção "Exportar meus dados" na Tela P1 (RN-P29)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await expect(page.getByText(/exportar meus dados/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /exportar/i })).toBeVisible();
    });

    test('botão "Exportar" inicia download de arquivo ZIP (RN-P30)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/perfil');
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByRole('button', { name: /exportar meus dados/i }).or(
          page.getByRole('button', { name: /exportar/i })
        ).first().click(),
      ]);
      expect(download.suggestedFilename()).toMatch(/\.zip$/i);
    });

    test('botão "Exportar" desabilitado durante geração — não pode ser acionado duas vezes (RN-P44)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await page.route('**/profile/exportar', async (route) => {
        await new Promise<void>((r) => setTimeout(r, 2000));
        await route.continue();
      });
      const botao = page.getByRole('button', { name: /exportar/i }).first();
      await botao.click();
      await expect(botao).toBeDisabled();
    });

    test('deve exibir link "Exercer direitos de privacidade" (RN-P31)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await expect(page.getByRole('link', { name: /exercer direitos de privacidade/i })).toBeVisible();
    });
  });

  // ── Tela P2 — URL protection (RN-P45) ────────────────────────────────────────

  test.describe('Tela P2 – Confirmação de email', () => {

    test('deve redirecionar ou exibir erro ao acessar /confirmar-email sem token (RN-P45)', async ({ page }) => {
      await page.goto('/confirmar-email');
      await expect(
        page.getByText(/link inválido|token inválido|expirado/i).or(page.getByText(/não autorizado/i))
      ).toBeVisible().catch(async () => {
        await expect(page).toHaveURL('/');
      });
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

    test('campo de identificador na exclusão converte entrada para maiúsculas em tempo real (RN-P43)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/perfil');
      await page.getByRole('button', { name: /excluir minha conta/i }).click();
      const campo = page.getByPlaceholder(/identificador/i);
      await campo.fill('abc123');
      await expect(campo).toHaveValue('ABC123');
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
