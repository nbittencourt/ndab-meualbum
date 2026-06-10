import { test, expect } from '../support/fixtures';
import {
  usuarioAtivo,
  criarUsuario,
  confirmarEmail,
  criarAlbum,
  adicionarEstoque,
  getTipoAlbumId,
  arquivarAlbum,
} from '../support/helpers';

test.describe('Colar Figurinhas', () => {

  // ── Controle de acesso ────────────────────────────────────────────────────────

  test('deve redirecionar usuário não autenticado (RN-CF01)', async ({ page }) => {
    await page.goto('/colar');
    await expect(page).toHaveURL('/');
  });

  test('deve permitir acesso a usuário EMAIL_PENDENTE (RN-CF01)', async ({ page, request }) => {
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
    await page.goto('/colar');
    await expect(page).not.toHaveURL('/');
  });

  // ── CF0: Seleção de álbum ─────────────────────────────────────────────────────

  test.describe('Tela CF0 – Seleção de álbum', () => {

    test('deve exibir CF0 quando acessado sem contexto (entrada C, RN-CF03)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await criarAlbum(request, await getTipoAlbumId(request), 'BROCHURA');
      await page.goto('/colar');
      await expect(page.getByText('Escolha um álbum', { exact: true })).toBeVisible();
    });

    test('deve pular CF0 quando album_id está na URL (entradas A/B, RN-CF02)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const album = await criarAlbum(request, await getTipoAlbumId(request), 'BROCHURA');
      await page.goto(`/colar?albumId=${album._id ?? album.id}`);
      await expect(page.getByText('Escolha um álbum', { exact: true })).not.toBeVisible();
    });

    test('deve exibir estado vazio com CTA de Cadastro de Álbum (RN-CF04)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await page.goto('/colar');
      await expect(page.getByText(/nenhum álbum|criar álbum/i).first()).toBeVisible();
      await expect(
        page.getByRole('link', { name: /novo álbum|criar álbum/i }).or(
          page.getByRole('button', { name: /novo álbum|criar álbum/i })
        )
      ).toBeVisible();
    });

    test('botão "Cancelar" na CF0 retorna para tela de origem', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      await criarAlbum(request, await getTipoAlbumId(request), 'BROCHURA');
      await page.goto('/home');
      await page.goto('/colar');
      await page.getByRole('button', { name: /cancelar/i }).click();
      await expect(page).toHaveURL(/\/home/);
    });

    test('álbum arquivado não aparece na lista de seleção (RN-AL03)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const albumArquivado = await criarAlbum(request, tipoId, 'BROCHURA');
      await arquivarAlbum(request, albumArquivado._id ?? albumArquivado.id);
      await criarAlbum(request, tipoId, 'CAPA_DURA');
      await page.goto('/colar');
      await expect(page.getByRole('button', { name: /Brochura/i })).not.toBeVisible();
      await expect(page.getByRole('button', { name: /Capa Dura/i })).toBeVisible();
    });
  });

  // ── CF1: Colagem ──────────────────────────────────────────────────────────────

  test.describe('Tela CF1 – Colagem', () => {

    test('deve exibir apenas figurinhas do tipo do álbum ativo (RN-CF06)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album = await criarAlbum(request, tipoId, 'BROCHURA');
      await adicionarEstoque(request, identificador, 'FWC1', 1);
      await page.goto(`/colar?albumId=${album._id ?? album.id}`);
      await expect(page.getByText('FWC1')).toBeVisible();
    });

    test('deve exibir estado vazio do estoque e manter botão MFN disponível', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album = await criarAlbum(request, tipoId, 'BROCHURA');
      await page.goto(`/colar?albumId=${album._id ?? album.id}`);
      await expect(page.getByText(/nenhuma figurinha|estoque vazio/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /figurinha não registrada/i })).toBeVisible();
    });

    test('deve exibir % conclusão e atualizar após colagem (RN-CF15)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album = await criarAlbum(request, tipoId, 'BROCHURA');
      await adicionarEstoque(request, identificador, 'FWC1', 1);
      await page.goto(`/colar?albumId=${album._id ?? album.id}`);
      const percentualAntes = await page.getByText(/0,0\s*%|0%/).first().textContent();
      await page.getByText('FWC1').locator('..').getByRole('button', { name: /colar/i }).click();
      await expect(page.getByText(/colada/i)).toBeVisible();
      const completoEl = page.locator('p').filter({ hasText: 'completo' });
      await expect(completoEl).not.toHaveText(/^0%/);
      const percentualDepois = await completoEl.textContent();
      expect(percentualDepois).not.toBe(percentualAntes);
    });

    test('deve exigir confirmação para colar sobre figurinha já colada (RN-CF09)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album = await criarAlbum(request, tipoId, 'BROCHURA');
      await adicionarEstoque(request, identificador, 'FWC1', 2);
      await page.goto(`/colar?albumId=${album._id ?? album.id}`);
      await page.getByText('FWC1').locator('..').getByRole('button', { name: /colar/i }).click();
      await page.goto(`/colar?albumId=${album._id ?? album.id}`);
      await adicionarEstoque(request, identificador, 'FWC1', 1);
      await page.reload();
      await page.getByText('FWC1').locator('..').getByRole('button', { name: /colar/i }).click();
      await expect(page.getByText(/já está colada|substituir/i).first()).toBeVisible();
      await expect(page.getByRole('button', { name: /confirmar/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /cancelar/i })).toBeVisible();
    });

    test('deve decrementar estoque ao colar figurinha do estoque (RN-CF10)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album = await criarAlbum(request, tipoId, 'BROCHURA');
      await adicionarEstoque(request, identificador, 'FWC1', 2);
      await page.goto(`/colar?albumId=${album._id ?? album.id}`);
      const fwc1Row = page.getByText('FWC1').locator('..');
      await expect(fwc1Row.getByText('2', { exact: true })).toBeVisible();
      await fwc1Row.getByRole('button', { name: /colar/i }).click();
      await expect(fwc1Row.getByText('1', { exact: true })).toBeVisible();
    });

    test('não deve alterar estoque ao colar via MFN (RN-CF11)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album = await criarAlbum(request, tipoId, 'BROCHURA');
      await adicionarEstoque(request, identificador, 'FWC2', 1);
      await page.goto(`/colar?albumId=${album._id ?? album.id}`);
      const fwc2Row = page.getByText('FWC2').locator('..');
      const qtdAntes = await fwc2Row.locator('span.font-mono').last().textContent();
      await page.getByRole('button', { name: /figurinha não registrada/i }).click();
      await page.getByRole('dialog').getByRole('textbox').fill('FWC1');
      await page.getByRole('dialog').getByRole('button', { name: /^confirmar$/i }).click();
      const qtdDepois = await fwc2Row.locator('span.font-mono').last().textContent();
      expect(qtdDepois).toBe(qtdAntes);
    });

    test('deve trocar álbum ativo sem desfazer colagens anteriores (RN-CF14)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album1 = await criarAlbum(request, tipoId, 'BROCHURA');
      const album2 = await criarAlbum(request, tipoId, 'CAPA_DURA');
      await adicionarEstoque(request, identificador, 'FWC1', 1);
      await page.goto(`/colar?albumId=${album1._id ?? album1.id}`);
      await page.getByText('FWC1').locator('..').getByRole('button', { name: /colar/i }).click();

      await page.getByRole('button', { name: /trocar álbum|selecionar álbum/i }).click();
      await page.getByText(/Capa Dura/i).click();

      const res = await page.request.get(`/api/v1/albums/${album1._id ?? album1.id}/faltantes`);
      expect(res.ok()).toBeTruthy();
      const data = await res.json();
      const faltantes = data.faltantes ?? [];
      expect(faltantes.some((f: { numero?: string }) => f.numero === 'FWC1')).toBe(false);
      void album2;
    });
  });

  // ── Modal de Figurinha Não Registrada (MFN) ───────────────────────────────────

  test.describe('Modal de Figurinha Não Registrada – MFN', () => {

    test('deve exibir mensagem amigável para figurinha não encontrada (RN-CF25)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album = await criarAlbum(request, tipoId, 'BROCHURA');
      await page.goto(`/colar?albumId=${album._id ?? album.id}`);
      await page.getByRole('button', { name: /figurinha não registrada/i }).click();
      await page.getByRole('dialog').getByRole('textbox').fill('INEXISTENTE-999');
      await page.getByRole('dialog').getByRole('button', { name: /^confirmar$/i }).click();
      await expect(page.getByText('Figurinha INEXISTENTE-999 não encontrada neste álbum. Verifique o número e tente novamente.', { exact: true })).toBeVisible();
      await expect(page.getByRole('textbox')).toBeVisible();
    });

    test('deve manter modal aberto e limpar campo com "Colar e Outra" (RN-CF26)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album = await criarAlbum(request, tipoId, 'BROCHURA');
      await page.goto(`/colar?albumId=${album._id ?? album.id}`);
      await page.getByRole('button', { name: /figurinha não registrada/i }).click();
      await page.getByRole('dialog').getByRole('textbox').fill('FWC1');
      await page.getByRole('dialog').getByRole('button', { name: /^confirmar$/i }).click();
      await expect(page.getByRole('dialog').getByRole('button', { name: /colar e outra/i })).toBeVisible();
      await expect(page.getByRole('dialog').getByRole('button').filter({ hasText: /^Fechar$/ })).toBeVisible();
      await page.getByRole('dialog').getByRole('button', { name: /colar e outra/i }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('dialog').getByRole('textbox')).toHaveValue('');
    });

    test('câmera não ativa automaticamente ao abrir MFN — requer ação explícita (RN-CF27)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album = await criarAlbum(request, tipoId, 'BROCHURA');
      await page.goto(`/colar?albumId=${album._id ?? album.id}`);
      await page.getByRole('button', { name: /figurinha não registrada/i }).click();
      await expect(page.getByRole('button', { name: /abrir câmera/i })).toBeVisible();
      await expect(page.locator('video')).not.toBeVisible();
    });
  });

  // ── Invalidação de cache ──────────────────────────────────────────────────────

  test.describe('Invalidação de cache', () => {

    test('CF-CACHE-01 — colar do estoque → percentual atualizado em Gerenciar Álbum (cross-page)', async ({ page, request }) => {
      const { identificador } = await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album = await criarAlbum(request, tipoId, 'BROCHURA');
      await adicionarEstoque(request, identificador, 'FWC1', 1);
      await page.goto(`/colar?albumId=${album._id ?? album.id}`);
      await page.getByText('FWC1').locator('..').getByRole('button', { name: /colar/i }).click();
      await expect(page.getByText(/colada/i)).toBeVisible();
      await page.goto(`/albums/${album._id ?? album.id}`);
      const pctText = await page.getByText(/\d+[,.]?\d*\s*%/).first().textContent();
      expect(parseFloat(pctText!.replace(',', '.'))).toBeGreaterThan(0);
    });

    test('CF-CACHE-02 — colar via MFN ("Fechar") → álbum atualizado em Gerenciar Álbum (cross-page)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album = await criarAlbum(request, tipoId, 'BROCHURA');
      await page.goto(`/colar?albumId=${album._id ?? album.id}`);
      await page.getByRole('button', { name: /figurinha não registrada/i }).click();
      await page.getByRole('dialog').getByRole('textbox').fill('FWC1');
      await page.getByRole('dialog').getByRole('button', { name: /^confirmar$/i }).click();
      await page.getByRole('dialog').getByRole('button').filter({ hasText: /^Fechar$/ }).click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
      await page.goto(`/albums/${album._id ?? album.id}`);
      const pctText = await page.getByText(/\d+[,.]?\d*\s*%/).first().textContent();
      expect(parseFloat(pctText!.replace(',', '.'))).toBeGreaterThan(0);
    });

    test('CF-CACHE-03 — colar via MFN ("Colar e Outra" — mantém aberto) → álbum atualizado ao fechar (cross-page)', async ({ page, request }) => {
      await usuarioAtivo(page, request);
      const tipoId = await getTipoAlbumId(request);
      const album = await criarAlbum(request, tipoId, 'BROCHURA');
      await page.goto(`/colar?albumId=${album._id ?? album.id}`);
      await page.getByRole('button', { name: /figurinha não registrada/i }).click();
      await page.getByRole('dialog').getByRole('textbox').fill('FWC1');
      await page.getByRole('dialog').getByRole('button', { name: /^confirmar$/i }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('dialog').getByRole('textbox')).toHaveValue('');
      await page.getByRole('dialog').getByRole('button').filter({ hasText: /^Fechar$/ }).click();
      await page.goto(`/albums/${album._id ?? album.id}`);
      const pctText = await page.getByText(/\d+[,.]?\d*\s*%/).first().textContent();
      expect(parseFloat(pctText!.replace(',', '.'))).toBeGreaterThan(0);
    });
  });
});
