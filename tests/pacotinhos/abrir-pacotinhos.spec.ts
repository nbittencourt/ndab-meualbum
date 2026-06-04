import { test, expect } from '../support/fixtures';
import {
  usuarioAtivo,
  criarAlbum,
  getTipoAlbumId,
  arquivarAlbum,
  criarTipoAlbumExtra,
} from '../support/helpers';

test.describe('Abrir Pacotinhos', () => {

  // ── AP0: Seleção de tipo ──────────────────────────────────────────────────────
  // Testes que validam a UI da AP0 precisam de 2+ TipoAlbums para evitar o
  // auto-skip de RN-AP43 (com 1 tipo, AP0 é pulada automaticamente).

  test.describe('Tela AP0 – Seleção de tipo (2+ tipos)', () => {
    let tipoExtraId: string;

    test.beforeAll(async ({ request }) => {
      tipoExtraId = await criarTipoAlbumExtra(request);
    });

    test.afterAll(async ({ request }) => {
      if (tipoExtraId) await request.delete(`/api/v1/test/tipo-album/${tipoExtraId}`);
    });

    test('deve exibir AP0 quando há 2+ TipoAlbums', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/abrir');
      await expect(page.getByText(/que álbum você está abrindo/i)).toBeVisible();
    });

    test('deve manter "Confirmar" desabilitado até seleção', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/abrir');
      await expect(page.getByRole('button', { name: /confirmar/i })).toBeDisabled();
    });

    test('"Descartar" deve remover pilha e exibir AP0 (RN-AP17)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      await request.post('/api/v1/test/criar-pilha-pendente', {
        data: { tipo_album_id: tipoId, numeros: ['FWC1'], identificador },
      });
      await page.goto('/abrir');
      await page.getByRole('button', { name: /descartar e começar do zero/i }).click();
      await expect(page.getByText(/que álbum você está abrindo/i)).toBeVisible();
    });
  });

  // RN-AP43: com exatamente 1 TipoAlbum, AP0 é pulada e AP1 abre diretamente
  test('deve pular AP0 e abrir AP1 diretamente com 1 TipoAlbum (RN-AP43)', async ({ page, request }) => {
    await usuarioAtivo(page, request);
    await page.goto('/abrir');
    await expect(page.getByText(/que álbum você está abrindo/i)).not.toBeVisible();
    await expect(page.getByRole('textbox')).toBeVisible();
  });

  // ── Retomada ─────────────────────────────────────────────────────────────────

  test.describe('Retomada de pilha pendente (RN-AP19)', () => {

    test('deve exibir modal de retomada quando há pilha PENDENTE', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      await request.post('/api/v1/test/criar-pilha-pendente', {
        data: { tipo_album_id: tipoId, numeros: ['FWC1', 'FWC2', 'FWC3'], identificador },
      });
      await page.goto('/abrir');

      await expect(page.getByText(/sessão anterior/i).first()).toBeVisible();
      await expect(page.getByRole('button', { name: /continuar sessão anterior/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /descartar e começar do zero/i })).toBeVisible();
    });

    test('"Continuar" deve restaurar pilha e pular AP0 (RN-AP20)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      await request.post('/api/v1/test/criar-pilha-pendente', {
        data: { tipo_album_id: tipoId, numeros: ['FWC1'], identificador },
      });
      await page.goto('/abrir');
      await page.getByRole('button', { name: /continuar sessão anterior/i }).click();

      await expect(page.getByText(/que álbum você está abrindo/i)).not.toBeVisible();
    });
  });

  // ── Entrada por digitação ─────────────────────────────────────────────────────
  // Com 1 TipoAlbum (RN-AP43), AP1 abre diretamente — sem interação com AP0.

  test.describe('Entrada por digitação', () => {

    test('deve converter entrada para maiúsculas', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/abrir');
      const campo = page.getByRole('textbox');
      await expect(campo).toBeVisible();
      await campo.fill('abc');
      await expect(campo).toHaveValue('ABC');
    });

    test('deve exibir erro inline para número inexistente no catálogo (RN-AP04)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/abrir');
      const campo = page.getByRole('textbox');
      await expect(campo).toBeVisible();
      await campo.fill('INEXISTENTE-999');
      await campo.press('Enter');
      await expect(page.getByText(/Figurinha INEXISTENTE-999 não encontrada no álbum/i)).toBeVisible();
    });

    test('deve bloquear adição ao atingir 100 itens PENDENTES (RN-AP28)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      await request.post('/api/v1/test/popular-pilha', {
        data: { tipo_album_id: tipoId, quantidade: 100, identificador },
      });
      await page.goto('/abrir');
      await page.getByRole('button', { name: /continuar sessão anterior/i }).click();
      const campo = page.getByRole('textbox');
      await campo.fill('FWC1');
      await campo.press('Enter');
      await expect(page.getByText(/limite de 100|máximo de 100/i)).toBeVisible();
    });

    test('deve limpar campo e manter foco após adição bem-sucedida', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/abrir');
      const campo = page.getByRole('textbox');
      await expect(campo).toBeVisible();
      await campo.fill('FWC1');
      await campo.press('Enter');
      await expect(campo).toHaveValue('');
      await expect(campo).toBeFocused();
    });
  });

  // ── Descarte ─────────────────────────────────────────────────────────────────

  test.describe('Descarte de figurinha (RN-AP24)', () => {

    test('deve exibir confirmação com número e nome antes de descartar', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      await request.post('/api/v1/test/criar-pilha-pendente', {
        data: { tipo_album_id: tipoId, numeros: ['FWC1'], identificador },
      });
      await page.goto('/abrir');
      await page.getByRole('button', { name: /continuar sessão anterior/i }).click();
      await page.getByRole('button', { name: /descartar/i }).first().click();
      await expect(page.getByText(/FWC1/).first()).toBeVisible();
      await expect(page.getByRole('button', { name: /confirmar/i })).toBeVisible();
    });
  });

  // ── Alerta de saída ───────────────────────────────────────────────────────────

  test.describe('Alerta de saída (RN-AP16, RN-AP32)', () => {

    test('deve exibir alerta ao navegar via header com itens PENDENTES', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      await request.post('/api/v1/test/criar-pilha-pendente', {
        data: { tipo_album_id: tipoId, numeros: ['FWC1'], identificador },
      });
      await page.goto('/abrir');
      await page.getByRole('button', { name: /continuar sessão anterior/i }).click();
      // Abre menu de navegação mobile e navega para Álbuns
      await page.getByRole('button', { name: /abrir menu de navegação/i }).click();
      await page.getByRole('link', { name: /álbum/i }).click();

      await expect(page.getByRole('heading', { name: /figurinhas sem destino/i })).toBeVisible();
    });

    test('"Ficar" deve fechar alerta e manter o usuário na AP1', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      await request.post('/api/v1/test/criar-pilha-pendente', {
        data: { tipo_album_id: tipoId, numeros: ['FWC1'], identificador },
      });
      await page.goto('/abrir');
      await page.getByRole('button', { name: /continuar sessão anterior/i }).click();
      await page.getByRole('button', { name: /abrir menu de navegação/i }).click();
      await page.getByRole('link', { name: /álbum/i }).click();
      await page.getByRole('button', { name: /ficar/i }).click();

      await expect(page).toHaveURL(/\/abrir/);
    });

    test('logout com itens PENDENTES deve encerrar sem alerta (RN-AP32)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      await request.post('/api/v1/test/criar-pilha-pendente', {
        data: { tipo_album_id: tipoId, numeros: ['FWC1'], identificador },
      });
      await page.goto('/abrir');
      await page.getByRole('button', { name: /continuar sessão anterior/i }).click();
      // Logout via header (RN-AP32: encerra diretamente sem alerta)
      await page.locator('header').getByRole('button', { name: 'Sair', exact: true }).click();

      await expect(page).toHaveURL('/');
    });
  });

  // ── Tela AP1 – comportamento (RN-AP41, AP42) ─────────────────────────────────

  test.describe('Tela AP1 – estrutura e comportamento', () => {

    test('botão "Sair" dedicado não deve existir na AP1 (RN-AP41)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      await request.post('/api/v1/test/criar-pilha-pendente', {
        data: { tipo_album_id: tipoId, numeros: ['FWC1'], identificador },
      });
      await page.goto('/abrir');
      await page.getByRole('button', { name: /continuar sessão anterior/i }).click();
      // Apenas o botão de logout do header deve ter o nome "Sair"
      // AP1 não deve adicionar seu próprio botão de saída dedicado
      await expect(page.getByRole('button', { name: 'Sair', exact: true })).toHaveCount(1);
      await expect(page.locator('header').getByRole('button', { name: 'Sair', exact: true })).toBeVisible();
    });

    test('deve exibir nome do tipo de álbum da sessão no topo da AP1 (RN-AP42)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/abrir');
      // Com 1 tipo (RN-AP43), AP1 abre diretamente com tipo pré-selecionado
      await expect(page.getByRole('textbox')).toBeVisible();
      await expect(page.getByText(/FIFA World Cup 2026/i)).toBeVisible();
    });

    test('câmera não ativa automaticamente — requer ação explícita (RN-AP43)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/abrir');
      // Com 1 tipo, AP1 abre diretamente
      await page.getByRole('button', { name: /fotografar|câmera/i }).click();
      await expect(page.getByRole('button', { name: /abrir câmera/i })).toBeVisible();
      await expect(page.locator('video')).not.toBeVisible();
    });
  });

  // ── Modal de Colagem (MCol) ───────────────────────────────────────────────────

  test.describe('Modal de Colagem – MCol', () => {

    test('deve pré-selecionar álbum quando há exatamente 1 elegível (RN-AP09)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      await criarAlbum(request, tipoId, 'BROCHURA');
      await request.post('/api/v1/test/criar-pilha-pendente', {
        data: { tipo_album_id: tipoId, numeros: ['FWC1'], identificador },
      });
      await page.goto('/abrir');
      await page.getByRole('button', { name: /continuar sessão anterior/i }).click();
      await page.getByRole('button', { name: /colar/i }).first().click();
      await expect(page.getByRole('radio', { name: /brochura/i }).or(
        page.getByText(/álbum selecionado/i)
      )).toBeVisible();
      await expect(page.getByRole('button', { name: /confirmar colagem/i })).toBeEnabled();
    });

    test('deve exigir seleção manual com 2+ álbuns elegíveis (RN-AP09)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      await criarAlbum(request, tipoId, 'BROCHURA');
      await criarAlbum(request, tipoId, 'CAPA_DURA');
      await request.post('/api/v1/test/criar-pilha-pendente', {
        data: { tipo_album_id: tipoId, numeros: ['FWC1'], identificador },
      });
      await page.goto('/abrir');
      await page.getByRole('button', { name: /continuar sessão anterior/i }).click();
      await page.getByRole('button', { name: /colar/i }).first().click();
      await expect(page.getByRole('button', { name: /confirmar colagem/i })).toBeDisabled();
      await page.getByRole('radio', { name: /brochura/i }).click();
      await expect(page.getByRole('button', { name: /confirmar colagem/i })).toBeEnabled();
    });

    test('não deve exibir botão "Colar" sem álbuns cadastrados (RN-AP06)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      await request.post('/api/v1/test/criar-pilha-pendente', {
        data: { tipo_album_id: tipoId, numeros: ['FWC1'], identificador },
      });
      await page.goto('/abrir');
      await page.getByRole('button', { name: /continuar sessão anterior/i }).click();
      await expect(page.getByRole('button', { name: /colar/i }).first()).not.toBeVisible();
    });

    test('álbum arquivado não aparece nos elegíveis do MCol (RN-AL03)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const albumArquivado = await criarAlbum(request, tipoId, 'BROCHURA');
      await arquivarAlbum(request, albumArquivado._id ?? albumArquivado.id);
      await criarAlbum(request, tipoId, 'CAPA_DURA');
      await request.post('/api/v1/test/criar-pilha-pendente', {
        data: { tipo_album_id: tipoId, numeros: ['FWC1'], identificador },
      });
      await page.goto('/abrir');
      await page.getByRole('button', { name: /continuar sessão anterior/i }).click();
      await page.getByRole('button', { name: /colar/i }).first().click();
      await expect(page.getByRole('radio', { name: /brochura/i })).not.toBeVisible();
      await expect(page.getByRole('radio', { name: /capa dura/i })).toBeVisible();
    });
  });
});
