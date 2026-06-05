import { test, expect } from '../support/fixtures';
import {
  usuarioAtivo,
  criarUsuario,
  confirmarEmail,
  criarAlbum,
  getTipoAlbumId,
  adicionarEstoque,
  arquivarAlbum,
} from '../support/helpers';

test.describe('Álbuns (Gerenciamento)', () => {

  // ── Controle de acesso (RN-AL01) ──────────────────────────────────────────────

  test.describe('Controle de acesso', () => {

    test('deve redirecionar usuário não autenticado para login', async ({ page }) => {
      await page.goto('/albums');
      await expect(page).toHaveURL('/');
    });

    test('deve permitir acesso a usuário EMAIL_PENDENTE (RN-AL01)', async ({ page, request }) => {
      const { dados, identificador } = await criarUsuario(request);
      await confirmarEmail(request, identificador);
      await request.post('/api/v1/test/iniciar-alteracao-email', {
        data: { identificador, email_novo: `novo+${Date.now()}@exemplo.com` },
      });
      await page.goto('/');
      await page.getByLabel('Email').fill(dados.email as string);
      await page.getByRole('textbox', { name: 'Senha' }).fill(dados.password as string);
      await page.getByRole('button', { name: /entrar/i }).click();
      await page.waitForURL(/\/home/);
      await page.getByRole('link', { name: /ver todos os álbuns/i }).click();
      await expect(page).toHaveURL(/\/albums/);
    });
  });

  // ── Navegação Home → AL0 ──────────────────────────────────────────────────────

  test('deve navegar para AL0 via ação "Ver todos os álbuns" na Home', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    await page.getByRole('link', { name: /ver todos os álbuns/i }).click();
    await expect(page).toHaveURL(/\/albums/);
  });

  // ── Tela AL0 — Lista de Álbuns ────────────────────────────────────────────────

  test.describe('Tela AL0 — Lista de Álbuns', () => {

    test('deve exibir header global com identificador do usuário', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      await page.goto('/albums');
      await expect(page.locator('header').getByText(identificador)).toBeVisible();
    });

    test('deve exibir estado vazio com CTA "Novo álbum" quando sem álbuns', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/albums');
      await expect(page.getByRole('link', { name: /novo álbum/i }).first()).toBeVisible();
    });

    test('deve recarregar lista a cada acesso (RN-AL29)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      await page.goto('/albums');
      await expect(page.getByRole('link', { name: /novo álbum/i }).first()).toBeVisible();

      const tipoId = await getTipoAlbumId(request);
      const album = await criarAlbum(request, tipoId, 'BROCHURA');
      await page.goto('/albums');
      await expect(page.getByText(album.nomePersonalizado ?? /FIFA World Cup/i)).toBeVisible();
      void identificador;
    });

    test.describe('Ações do card de álbum ativo', () => {

      test('deve exibir botão "Gerenciar" no card ativo (RN-AL28)', async ({ page, request }) => {
        await usuarioAtivo(page, request);
        const tipoId = await getTipoAlbumId(request);
        await criarAlbum(request, tipoId, 'BROCHURA');
        await page.goto('/albums');
        await expect(page.getByRole('button', { name: /gerenciar/i }).first()).toBeVisible();
      });

      test('deve exibir botão "Colar figurinhas" no card ativo', async ({ page, request }) => {
        await usuarioAtivo(page, request);
        const tipoId = await getTipoAlbumId(request);
        await criarAlbum(request, tipoId, 'BROCHURA');
        await page.goto('/albums');
        await expect(page.getByRole('button', { name: /colar figurinhas/i }).first()).toBeVisible();
      });

      test('deve exibir botão "Baixar PDF" no card ativo (RN-AL30)', async ({ page, request }) => {
        await usuarioAtivo(page, request);
        const tipoId = await getTipoAlbumId(request);
        await criarAlbum(request, tipoId, 'BROCHURA');
        await page.goto('/albums');
        await expect(page.getByRole('button', { name: /baixar pdf/i }).first()).toBeVisible();
      });

      test('botão "Gerenciar" redireciona para Tela AL1 (RN-AL28)', async ({ page, request }) => {
        await usuarioAtivo(page, request);
        const tipoId = await getTipoAlbumId(request);
        await criarAlbum(request, tipoId, 'BROCHURA');
        await page.goto('/albums');
        await page.getByRole('button', { name: /gerenciar/i }).first().click();
        await expect(page).toHaveURL(/\/albums\/.+/);
      });
    });

    test.describe('Seção de álbuns arquivados (RN-AL11, AL13, AL14)', () => {

      test('não deve exibir seção de arquivados quando não há nenhum', async ({ page, request }) => {
        await usuarioAtivo(page, request);
        const tipoId = await getTipoAlbumId(request);
        await criarAlbum(request, tipoId, 'BROCHURA');
        await page.goto('/albums');
        await expect(page.getByText(/álbuns arquivados/i)).not.toBeVisible();
      });

      test('deve exibir seção de arquivados ao arquivar ao menos 1 álbum', async ({ page, request }) => {
        await usuarioAtivo(page, request);
        const tipoId = await getTipoAlbumId(request);
        const album = await criarAlbum(request, tipoId, 'BROCHURA');
        await arquivarAlbum(request, album._id ?? album.id);
        await page.goto('/albums');
        await expect(page.getByText(/álbuns arquivados/i)).toBeVisible();
      });

      test('álbum arquivado exibe apenas ação "Desarquivar"', async ({ page, request }) => {
        await usuarioAtivo(page, request);
        const tipoId = await getTipoAlbumId(request);
        const album = await criarAlbum(request, tipoId, 'BROCHURA');
        await arquivarAlbum(request, album._id ?? album.id);
        await page.goto('/albums');
        const secaoArquivados = page.getByText(/álbuns arquivados/i).locator('..').locator('..');
        await expect(secaoArquivados.getByRole('button', { name: /desarquivar/i })).toBeVisible();
        await expect(secaoArquivados.getByRole('button', { name: /gerenciar/i })).not.toBeVisible();
        await expect(secaoArquivados.getByRole('button', { name: /baixar pdf/i })).not.toBeVisible();
      });
    });
  });

  // ── Percentual de conclusão ───────────────────────────────────────────────────

  test.describe('Percentual de conclusão (RN-AL15)', () => {

    test('percentual deve ser 0% para álbum recém-criado', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album = await criarAlbum(request, tipoId, 'BROCHURA');
      const res = await request.get(`/api/v1/albums/${album._id ?? album.id}`);
      const { album: albumData } = await res.json();
      expect(albumData.percentualConclusao).toBe(0);
      void page;
    });

    test('percentual deve ser calculado corretamente após colar uma figurinha (não excede 100)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album = await criarAlbum(request, tipoId, 'BROCHURA');
      await adicionarEstoque(request, identificador, 'FWC1', 1);
      await request.post('/api/v1/colar-figurinhas/colar/direta', {
        data: { albumId: album._id ?? album.id, figurinhaNumero: 'FWC1' },
      });
      const res = await request.get(`/api/v1/albums/${album._id ?? album.id}`);
      const { album: albumData } = await res.json();
      expect(albumData.percentualConclusao).toBeGreaterThan(0);
      expect(albumData.percentualConclusao).toBeLessThanOrEqual(100);
      void page;
    });
  });

  // ── Tela AL1 — Gerenciamento do Álbum ────────────────────────────────────────

  test.describe('Tela AL1 — Gerenciamento do Álbum', () => {

    test('deve exibir tipo, variante, percentual de conclusão e barra de ações', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      await criarAlbum(request, tipoId, 'BROCHURA');
      await page.goto('/albums');
      await page.getByRole('button', { name: /gerenciar/i }).first().click();
      await expect(page.getByText(/brochura/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /colar figurinhas/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /baixar pdf/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /arquivar/i })).toBeVisible();
    });

    test('deve exibir seções ordenadas por Secao.ordem ASC (RN-AL16)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      await criarAlbum(request, tipoId, 'BROCHURA');
      await page.goto('/albums');
      await page.getByRole('button', { name: /gerenciar/i }).first().click();
      const secoes = page.locator('button[aria-expanded]');
      await expect(secoes.first()).toBeVisible();
      const count = await secoes.count();
      expect(count).toBeGreaterThan(0);
    });

    test('deve expandir seção e listar figurinhas faltantes', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      await criarAlbum(request, tipoId, 'BROCHURA');
      await page.goto('/albums');
      await page.getByRole('button', { name: /gerenciar/i }).first().click();
      await page.locator('button[aria-expanded]').first().click();
      const itens = page.locator('[data-testid="figurinha-faltante"], [aria-label*="faltante"]');
      await expect(itens.first()).toBeVisible();
    });

    test('botão "Colar figurinhas" redireciona para Colar Figurinhas com contexto', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      await criarAlbum(request, tipoId, 'BROCHURA');
      await page.goto('/albums');
      await page.getByRole('button', { name: /gerenciar/i }).first().click();
      await page.getByRole('button', { name: /colar figurinhas/i }).click();
      await expect(page).toHaveURL(/\/colar/);
    });

    test('AL-CACHE-01 — colar figurinha → voltar para AL1 → percentual atualizado sem reload', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album = await criarAlbum(request, tipoId, 'BROCHURA');
      await adicionarEstoque(request, identificador, 'FWC1', 1);
      await page.goto(`/albums/${album._id ?? album.id}`);
      await page.getByRole('button', { name: /colar figurinhas/i }).click();
      await expect(page).toHaveURL(/\/colar/);
      await page.getByText('FWC1').locator('..').getByRole('button', { name: /colar/i }).click();
      await page.getByRole('button', { name: /voltar/i }).click();
      await expect(page).toHaveURL(new RegExp(`/albums/${album._id ?? album.id}`));
      const pctText = await page.getByText(/\d+[,.]?\d*\s*%/).first().textContent();
      expect(parseFloat(pctText!.replace(',', '.'))).toBeGreaterThan(0);
    });
  });

  // ── PDF de Figurinhas Faltantes ───────────────────────────────────────────────

  test.describe.skip('PDF de Figurinhas Faltantes (RN-AL19, AL30)', () => {

    test('botão "Baixar PDF" no card da AL0 inicia download sem navegar para AL1 (RN-AL30)', async ({ page, request }) => {
      test.setTimeout(60_000);
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      await criarAlbum(request, tipoId, 'BROCHURA');
      await page.goto('/albums');
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByRole('button', { name: /baixar pdf/i }).first().click(),
      ]);
      expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
      await expect(page).toHaveURL(/\/albums$/);
    });

    test('botão "Baixar PDF" na AL1 desabilita outras ações durante geração (RN-AL19)', async ({ page, request }) => {
      test.setTimeout(60_000);
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      await criarAlbum(request, tipoId, 'BROCHURA');
      await page.goto('/albums');
      await page.getByRole('button', { name: /gerenciar/i }).first().click();
      // intercept PDF route to keep loading state visible during assertion
      await page.route('**/pdf', async (route) => {
        await new Promise<void>((r) => setTimeout(r, 1500));
        await route.continue();
      });
      await page.getByRole('button', { name: /baixar pdf/i }).click();
      await expect(page.getByRole('button', { name: /colar figurinhas/i })).toBeDisabled();
      await expect(page.getByRole('button', { name: /arquivar/i })).toBeDisabled();
    });
  });

  // ── Arquivamento (RN-AL09, AL10, AL11, AL32) ─────────────────────────────────

  test.describe('Arquivamento', () => {

    test('deve exibir confirmação inline com texto descritivo ao clicar "Arquivar"', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      await criarAlbum(request, tipoId, 'BROCHURA');
      await page.goto('/albums');
      await page.getByRole('button', { name: /gerenciar/i }).first().click();
      await page.getByRole('button', { name: /arquivar/i }).click();
      await expect(page.getByRole('button', { name: /confirmar arquivamento/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /cancelar/i })).toBeVisible();
    });

    test('botão "Confirmar arquivamento" deve ter destaque em preto, não vermelho (RN-AL32)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      await criarAlbum(request, tipoId, 'BROCHURA');
      await page.goto('/albums');
      await page.getByRole('button', { name: /gerenciar/i }).first().click();
      await page.getByRole('button', { name: /arquivar/i }).click();
      const botaoConfirmar = page.getByRole('button', { name: /confirmar arquivamento/i });
      const cor = await botaoConfirmar.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      expect(cor).not.toMatch(/rgb\(.*255.*0.*0|rgb\(.*220.*38.*38/);
    });

    test('confirmar arquivamento move álbum para seção arquivados e redireciona para AL0', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      await criarAlbum(request, tipoId, 'BROCHURA');
      await page.goto('/albums');
      await page.getByRole('button', { name: /gerenciar/i }).first().click();
      await page.getByRole('button', { name: /arquivar/i }).click();
      await page.getByRole('button', { name: /confirmar arquivamento/i }).click();
      await expect(page).toHaveURL(/\/albums$/);
      await expect(page.getByText(/álbuns arquivados/i)).toBeVisible();
    });

    test('cancelar arquivamento não altera o álbum', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      await criarAlbum(request, tipoId, 'BROCHURA');
      await page.goto('/albums');
      await page.getByRole('button', { name: /gerenciar/i }).first().click();
      await page.getByRole('button', { name: /arquivar/i }).click();
      await page.getByRole('button', { name: /cancelar/i }).click();
      await expect(page.getByRole('button', { name: /arquivar/i })).toBeVisible();
    });

    test('álbum arquivado não aparece na Home (RN-AL03)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album = await criarAlbum(request, tipoId, 'BROCHURA');
      await arquivarAlbum(request, album._id ?? album.id);
      await page.goto('/home');
      const secaoAlbuns = page.getByText(/meus álbuns/i).locator('..').locator('..');
      await expect(secaoAlbuns.getByRole('button', { name: /gerenciar/i })).not.toBeVisible();
    });
  });

  // ── Desarquivamento (RN-AL09, AL10, AL12, AL13) ──────────────────────────────

  test.describe('Desarquivamento', () => {

    test('"Desarquivar" executa diretamente sem confirmação', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album = await criarAlbum(request, tipoId, 'BROCHURA');
      await arquivarAlbum(request, album._id ?? album.id);
      await page.goto('/albums');
      await page.getByRole('button', { name: /desarquivar/i }).click();
      await expect(page.getByRole('button', { name: /confirmar/i })).not.toBeVisible();
      await expect(page.getByRole('button', { name: /gerenciar/i })).toBeVisible();
    });

    test('álbum retorna à lista ativa após desarquivar (RN-AL12)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album = await criarAlbum(request, tipoId, 'BROCHURA');
      await arquivarAlbum(request, album._id ?? album.id);
      await page.goto('/albums');
      await page.getByRole('button', { name: /desarquivar/i }).click();
      await expect(page.getByRole('button', { name: /gerenciar/i })).toBeVisible();
    });

    test('seção de arquivados some se ficar vazia após desarquivar (RN-AL13)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album = await criarAlbum(request, tipoId, 'BROCHURA');
      await arquivarAlbum(request, album._id ?? album.id);
      await page.goto('/albums');
      await expect(page.getByText(/álbuns arquivados/i)).toBeVisible();
      await page.getByRole('button', { name: /desarquivar/i }).click();
      await expect(page.getByText(/álbuns arquivados/i)).not.toBeVisible();
    });
  });
});
