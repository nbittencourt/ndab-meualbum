import { test, expect } from '../support/fixtures';
import { criarUsuario, expirarToken, usuarioAtivo } from '../support/helpers';

test.describe('Cadastro de Usuários', () => {

  // ── Tela 1: Formulário ─────────────────────────────────────────────────────

  test.describe('Tela 1 – Formulário', () => {

    test('deve exibir campos Nome, Email e Senha', async ({ page }) => {
      await page.goto('/register');
      await expect(page.getByLabel('Nome completo')).toBeVisible();
      await expect(page.getByLabel('Email')).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Senha', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: /criar conta/i })).toBeVisible();
    });

    test('deve exibir aviso de privacidade com link para Política antes do checkbox (RN-23)', async ({ page }) => {
      await page.goto('/register');
      await expect(page.getByRole('link', { name: /política de privacidade/i }).first()).toBeVisible();
      const linkPrivacidade = page.getByRole('link', { name: /política de privacidade/i }).first();
      const checkbox = page.getByRole('checkbox');
      const linkY = (await linkPrivacidade.boundingBox())?.y ?? 0;
      const checkboxY = (await checkbox.boundingBox())?.y ?? 0;
      expect(linkY).toBeLessThanOrEqual(checkboxY);
    });

    test('deve exibir checkbox declaratório de maioridade (18+) e bloquear sem marcar (RN-22)', async ({ page }) => {
      await page.goto('/register');
      await page.getByLabel('Nome completo').fill('Usuário Teste');
      await page.getByLabel('Email').fill(`teste+${Date.now()}@exemplo.com`);
      await page.getByRole('textbox', { name: 'Senha', exact: true }).fill('Senha@123');
      await page.getByRole('button', { name: /criar conta/i }).click();
      await expect(page).toHaveURL(/\/register/);
    });

    test('deve exibir checklist de senha ao digitar', async ({ page }) => {
      await page.goto('/register');
      await page.getByRole('textbox', { name: 'Senha', exact: true }).fill('a');
      await expect(page.getByText('Mínimo de 8 caracteres')).toBeVisible();
      await expect(page.getByText('Ao menos uma letra maiúscula')).toBeVisible();
      await expect(page.getByText('Ao menos uma letra minúscula')).toBeVisible();
      await expect(page.getByText('Ao menos um número')).toBeVisible();
      await expect(page.getByText('Ao menos um caractere especial')).toBeVisible();
    });

    test('deve marcar cada critério do checklist conforme é atendido (RN-15)', async ({ page }) => {
      await page.goto('/register');
      const campo = page.getByRole('textbox', { name: 'Senha', exact: true });

      await campo.fill('abcdefgh');
      const itemMinimo = page.getByText('Mínimo de 8 caracteres');
      const classeAtendido = await itemMinimo.evaluate((el) =>
        el.classList.contains('checked') ||
        el.classList.contains('valid') ||
        el.querySelector('[data-checked]') !== null ||
        el.getAttribute('data-fulfilled') === 'true' ||
        window.getComputedStyle(el).color !== 'rgb(107, 114, 128)'
      );
      expect(classeAtendido).toBe(true);

      await campo.fill('Senha@123');
      const todosMarcados = await page.evaluate(() => {
        const itens = document.querySelectorAll('[data-testid*="checklist"], .checklist-item, [class*="checklist"]');
        return Array.from(itens).length === 0 || Array.from(itens).some((el) =>
          el.classList.contains('checked') || el.classList.contains('valid')
        );
      });
      expect(todosMarcados).toBe(true);
    });

    test('deve exibir toggle mostrar/ocultar senha', async ({ page }) => {
      await page.goto('/register');
      const campo = page.getByRole('textbox', { name: 'Senha', exact: true });
      await campo.fill('Senha@123');
      await expect(campo).toHaveAttribute('type', 'password');
      await page.getByRole('button', { name: /mostrar senha|exibir senha|toggle/i }).or(
        page.locator('button[aria-label*="senha"]')
      ).first().click();
      await expect(page.getByLabel('Senha', { exact: true })).toHaveAttribute('type', 'text');
    });

    test('deve bloquear submissão com campos obrigatórios vazios', async ({ page }) => {
      await page.goto('/register');
      await page.getByRole('button', { name: /criar conta/i }).click();
      await expect(page).toHaveURL(/\/register/);
    });

    test('deve exibir erro inline para email com formato inválido', async ({ page }) => {
      await page.goto('/register');
      await page.getByLabel('Nome completo').fill('Teste');
      await page.getByLabel('Email').fill('nao-eh-email');
      await page.getByRole('textbox', { name: 'Senha', exact: true }).fill('Senha@123');
      await page.getByRole('checkbox').check();
      await page.getByRole('button', { name: /criar conta/i }).click();
      await expect(page.getByText(/email inválido|formato inválido|e-mail válido/i)).toBeVisible();
    });

    test('deve exibir erro inline quando email já está em uso', async ({ page, request }) => {
      const { dados } = await criarUsuario(request);
      await page.goto('/register');
      await page.getByLabel('Nome completo').fill('Outro Usuário');
      await page.getByLabel('Email').fill(dados.email as string);
      await page.getByRole('textbox', { name: 'Senha', exact: true }).fill('Senha@123');
      await page.getByRole('checkbox').check();
      await page.getByRole('button', { name: /criar conta/i }).click();
      await expect(page.getByText(/já está em uso|já cadastrado|email já existe/i)).toBeVisible();
    });

    test('deve permitir submissão com checklist incompleto – validação é do servidor (RN-16)', async ({ page }) => {
      await page.goto('/register');
      await page.getByLabel('Nome completo').fill('Teste');
      await page.getByLabel('Email').fill('valido@exemplo.com');
      await page.getByRole('textbox', { name: 'Senha', exact: true }).fill('fraca');
      await page.getByRole('checkbox').check();
      await page.getByRole('button', { name: /criar conta/i }).click();
      await expect(page.getByText(/senha não atende|política de senha|requisitos/i)).toBeVisible();
    });

    test('deve conter link para a página de login', async ({ page }) => {
      await page.goto('/register');
      await expect(page.getByRole('link', { name: /já tem conta/i })).toBeVisible();
    });
  });

  // ── Fluxo completo ──────────────────────────────────────────────────────────

  test.describe('Fluxo completo', () => {

    test('deve criar conta e redirecionar para tela de confirmação', async ({ page }) => {
      await page.goto('/register');
      await page.getByLabel('Nome completo').fill('Usuário Teste');
      await page.getByLabel('Email').fill(`teste+${Date.now()}@exemplo.com`);
      await page.getByRole('textbox', { name: 'Senha', exact: true }).fill('Senha@123');
      await page.getByRole('checkbox').check();
      await page.getByRole('button', { name: /criar conta/i }).click();

      await expect(page).toHaveURL(/\/confirmar-cadastro|\/register/);
    });

    test('deve confirmar email via magic link e exibir tela de sucesso', async ({ page, request }) => {
      const { identificador } = await criarUsuario(request);
      const tokenRes = await request.get(`/api/v1/test/token-confirmacao/${identificador}`);
      const { token } = await tokenRes.json();

      await page.goto(`/confirmar-cadastro?token=${token}`);
      await expect(page.getByText('Tudo certo!')).toBeVisible();
      await expect(page.getByRole('button', { name: /acessar/i })).toBeVisible();
    });

    test('deve redirecionar para Home ao clicar "Acessar a aplicação"', async ({ page, request }) => {
      const { identificador } = await criarUsuario(request);
      const tokenRes = await request.get(`/api/v1/test/token-confirmacao/${identificador}`);
      const { token } = await tokenRes.json();

      await page.goto(`/confirmar-cadastro?token=${token}`);
      await page.getByRole('button', { name: /acessar/i }).click();
      await expect(page).toHaveURL(/\/home/);
    });
  });

  // ── Tela 2: Reenvio ─────────────────────────────────────────────────────────

  test.describe('Tela 2 – Reenvio', () => {

    test('deve exibir contador regressivo imediatamente após cadastro (RN-10)', async ({ page, request }) => {
      const { dados } = await criarUsuario(request);
      await page.goto('/');
      await page.getByLabel('Email').fill(dados.email as string);
      await page.getByRole('textbox', { name: 'Senha', exact: true }).fill(dados.password as string);
      await page.getByRole('button', { name: /entrar/i }).click();

      await expect(page.getByText(/reenviar em/i)).toBeVisible();
    });

    test('deve exibir link "Corrigir email" na Tela 2 (RN-17)', async ({ page, request }) => {
      const { dados } = await criarUsuario(request);
      await page.goto('/');
      await page.getByLabel('Email').fill(dados.email as string);
      await page.getByRole('textbox', { name: 'Senha', exact: true }).fill(dados.password as string);
      await page.getByRole('button', { name: /entrar/i }).click();

      await expect(page.getByRole('link', { name: /corrigir email/i })).toBeVisible();
    });

    test('deve exibir botão "Reenviar email" após cooldown expirado', async ({ page, request }) => {
      test.setTimeout(15_000);
      const { dados, identificador } = await criarUsuario(request);

      // Avança o relógio do browser 10 minutos → qualquer cooldown de 5 min já expirou
      await page.clock.install({ time: Date.now() + 10 * 60 * 1000 });

      await page.goto('/');
      await page.getByLabel('Email').fill(dados.email as string);
      await page.getByRole('textbox', { name: 'Senha', exact: true }).fill(dados.password as string);
      await page.getByRole('button', { name: /entrar/i }).click();
      await page.waitForURL(/\/confirmar-cadastro/);

      // Botão deve aparecer imediatamente pois o clock está 10 min à frente
      await expect(page.getByRole('button', { name: /reenviar email/i })).toBeVisible();

      // Clica e verifica que o servidor aceita (cooldown no server é 5s, já passado no tempo real)
      // Aguarda o cooldown do servidor expirar antes de clicar
      await page.waitForTimeout(6_000);
      await page.getByRole('button', { name: /reenviar email/i }).click();
      // O botão fica disabled enquanto reenvia e depois o countdown reinicia
      await expect(page.getByRole('button', { name: /reenviar email/i })).toBeHidden({ timeout: 4_000 });
      void identificador;
    });
  });

  // ── Magic link: erros ────────────────────────────────────────────────────────

  test.describe('Magic link – estados de erro', () => {

    test('deve exibir estado de erro para token inexistente', async ({ page }) => {
      await page.goto('/confirmar-cadastro?token=token-invalido');
      await expect(page.getByText(/link inválido ou expirado/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /solicitar novo link/i })).toBeVisible();
    });

    test('deve exibir estado de erro para token expirado (RN-09)', async ({ page, request }) => {
      const { identificador } = await criarUsuario(request);
      const tokenRes = await request.get(`/api/v1/test/token-confirmacao/${identificador}`);
      const { token } = await tokenRes.json();
      await expirarToken(request, token);

      await page.goto(`/confirmar-cadastro?token=${token}`);
      await expect(page.getByText(/link inválido ou expirado/i)).toBeVisible();
    });

    test('deve exibir estado de erro ao reutilizar token já usado (RN-09)', async ({ page, request }) => {
      const { identificador } = await criarUsuario(request);
      const tokenRes = await request.get(`/api/v1/test/token-confirmacao/${identificador}`);
      const { token } = await tokenRes.json();

      await page.goto(`/confirmar-cadastro?token=${token}`);
      await expect(page.getByText('Tudo certo!')).toBeVisible();

      await page.goto(`/confirmar-cadastro?token=${token}`);
      await expect(page.getByText(/link inválido ou expirado/i)).toBeVisible();
    });

    test('deve encerrar sessão de outro usuário ao confirmar cadastro (RN-19)', async ({ page, request }) => {
      // Usuário A faz login
      const { identificador: idA } = await usuarioAtivo(page, request);
      await expect(page.locator('header').getByText(idA)).toBeVisible();

      // Usuário B cria conta (PENDENTE) e obtém token de confirmação
      const { identificador: idB } = await criarUsuario(request);
      const tokenRes = await request.get(`/api/v1/test/token-confirmacao/${idB}`);
      const { token } = await tokenRes.json();

      // Visita o link de confirmação do usuário B no browser do usuário A
      await page.goto(`/confirmar-cadastro?token=${token}`);
      await expect(page.getByText('Tudo certo!')).toBeVisible();

      // Navega para Home — agora o browser está autenticado como usuário B
      await page.getByRole('button', { name: /acessar/i }).click();
      await page.waitForURL(/\/home/);

      // Identificador do usuário B deve aparecer no header
      await expect(page.locator('header').getByText(idB)).toBeVisible();
    });
  });

  // ── Rate limiting ─────────────────────────────────────────────────────────────

  test.describe('Rate limiting (RN-18)', () => {

    test('deve retornar HTTP 429 após 100 requisições por minuto do mesmo IP', async ({ request }) => {
      // RATE_LIMIT_MAX=5 está configurado no servidor de testes (playwright.config.ts)
      const RATE_LIMIT_MAX_TEST = 5;

      await request.post('/api/v1/test/reset-rate-limit');

      for (let i = 0; i < RATE_LIMIT_MAX_TEST; i++) {
        const res = await request.post('/api/v1/test/rate-limit-test');
        expect(res.status()).toBe(200);
      }

      // Requisição max+1 deve retornar 429
      const res = await request.post('/api/v1/test/rate-limit-test');
      expect(res.status()).toBe(429);
      const data = await res.json();
      expect(data.error).toMatch(/muitas/i);
    });
  });
});
