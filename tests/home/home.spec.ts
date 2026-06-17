import { test, expect } from '../support/fixtures';
import { usuarioAtivo, criarAlbum, getTipoAlbumId, adicionarEstoque } from '../support/helpers';

test.describe('Home', () => {

  test('deve redirecionar usuário não autenticado para login', async ({ page }) => {
    await page.goto('/home');
    await expect(page).toHaveURL('/');
  });

  test('deve exibir CTA "Figurinhas" sempre (RN-H14)', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    // FAB e CTA Banner são ambos spec-compliant; verifica que ao menos um está visível.
    // São links estilizados como botão (navegam para /figurinhas) — role correto é link (W3/WCAG).
    // Escopado ao main para não casar com o link homônimo da sidebar desktop.
    await expect(page.locator('main').getByRole('link', { name: /figurinhas/i }).first()).toBeVisible();
  });

  test('deve exibir nome e identificador do usuário no header', async ({ page, request }) => {
    const dados = await usuarioAtivo(page, request);
    await expect(page.locator('header').getByText(dados.identificador)).toBeVisible();
  });

  test('deve exibir ação "Ver todos os álbuns" na seção Meus Álbuns', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    await expect(page.getByRole('link', { name: /ver todos os álbuns/i })).toBeVisible();
  });

  test.describe('Seção Meus Álbuns', () => {

    test('deve exibir estado vazio com CTA de criação sem álbuns (RN-H03)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await expect(page.getByText(/nenhum álbum|sem álbuns/i).first()).toBeVisible();
      await expect(page.getByRole('link', { name: /novo álbum/i }).or(
        page.getByRole('button', { name: /novo álbum/i })
      ).first()).toBeVisible();
    });

    test('deve listar álbuns com tipo, variante por extenso e % conclusão (RN-H13, RN-H16)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await criarAlbum(request, await getTipoAlbumId(request), 'BROCHURA');
      await page.reload();
      await expect(page.getByText(/Copa do Mundo|FIFA World Cup/i)).toBeVisible();
      await expect(page.getByText(/Brochura/i)).toBeVisible();
      await expect(page.getByText(/0,0\s*%|0%/i)).toBeVisible();
    });

    test('deve ordenar por criado_em DESC – mais recente primeiro (RN-H04)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      await criarAlbum(request, tipoId, 'BROCHURA');
      await criarAlbum(request, tipoId, 'CAPA_DURA');
      await page.reload();
      const cards = page.locator('[data-testid="album-card"], .album-card').or(
        page.getByRole('link', { name: /Gerenciar álbum/i })
      );
      const primeiro = cards.first();
      await expect(primeiro.getByText(/Capa Dura/i)).toBeVisible();
    });

    test('deve paginar com mais de 5 álbuns – exatamente 5 por página (RN-H05, RN-H06)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      for (let i = 0; i < 6; i++) {
        await criarAlbum(request, tipoId, 'BROCHURA');
      }
      await page.reload();
      const cards = page.locator('[data-testid="album-card"], .album-card').or(
        page.getByRole('link', { name: /Gerenciar álbum/i })
      );
      await expect(cards).toHaveCount(5);
      await expect(page.getByRole('navigation', { name: /paginação/i })).toBeVisible();
    });

    test('não deve exibir paginação com 5 ou menos álbuns (RN-H05)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      for (let i = 0; i < 5; i++) {
        await criarAlbum(request, tipoId, 'BROCHURA');
      }
      await page.reload();
      await expect(page.getByRole('button', { name: /próxima página|página 2/i })).not.toBeVisible();
    });

    test('deve recarregar seção ao acessar Home (não usar cache entre navegações — RN-H27)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.waitForURL(/\/home/);
      await expect(page.getByText(/nenhum álbum|sem álbuns/i)).toBeVisible();

      const tipoId = await getTipoAlbumId(request);
      await criarAlbum(request, tipoId, 'BROCHURA');

      await page.goto('/home');
      await expect(page.getByText(/Copa do Mundo|FIFA World Cup/i)).toBeVisible();
    });

    test('deve recarregar ao retornar do fluxo de Cadastro de Álbum (RN-H28)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      await adicionarEstoque(request, identificador, 'FWC1', 1);
      await page.goto('/albums/novo');
      await page.getByRole('radio', { name: /brochura/i }).click();
      await page.getByRole('button', { name: /criar álbum/i }).click();
      await page.getByRole('button', { name: /agora não/i }).click();
      await expect(page).toHaveURL(/\/home/);
      await expect(page.getByText(/Copa do Mundo|FIFA World Cup/i).first()).toBeVisible();
    });

    test('deve exibir link "Ver todos os álbuns" que navega para AL0 (RN-H29 parcial)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.getByRole('link', { name: /ver todos os álbuns/i }).click();
      await expect(page).toHaveURL(/\/albums/);
    });
  });

  test.describe('Seção Figurinhas Repetidas', () => {

    test('deve exibir estado vazio quando estoque está vazio (RN-H11)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await expect(page.getByText(/nenhuma figurinha repetida|estoque vazio/i)).toBeVisible();
    });

    test('deve exibir no máximo 5 figurinhas no ranking (RN-H07)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const numeros = ['FWC1', 'FWC2', 'FWC3', 'FWC4', 'FWC5', 'FWC6'];
      for (const num of numeros) {
        await adicionarEstoque(request, identificador, num, 2);
      }
      await page.reload();
      // O ranking tem dois layouts (cards no mobile, tabela no desktop);
      // ambos marcam os itens com data-testid e só um fica visível por viewport.
      const itens = page.getByTestId('ranking-item').filter({ visible: true });
      await expect(itens.first()).toBeVisible();
      const count = await itens.count();
      expect(count).toBeLessThanOrEqual(5);
      expect(count).toBeGreaterThan(0);
    });

    test('deve desempatar por figurinha.numero ASC (RN-H09)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      await adicionarEstoque(request, identificador, 'FWC5', 3);
      await adicionarEstoque(request, identificador, 'FWC1', 3);
      await adicionarEstoque(request, identificador, 'FWC3', 3);
      await page.reload();
      const itens = page.getByTestId('ranking-item').filter({ visible: true });
      await expect(itens.first()).toBeVisible();
      // Empate em quantidade (3): o primeiro do ranking deve ser FWC1 (menor número)
      await expect(itens.first().getByText(/FWC1/).first()).toBeVisible();
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
