# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: albums\albums.spec.ts >> Álbuns (Gerenciamento) >> Tela AL1 — Gerenciamento do Álbum >> deve expandir seção e listar figurinhas faltantes
- Location: tests\albums\albums.spec.ts:172:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="figurinha-faltante"], [aria-label*="faltante"]').first()
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 3000ms
  - waiting for locator('[data-testid="figurinha-faltante"], [aria-label*="faltante"]').first()

```

```yaml
- link "Pular para o conteúdo":
  - /url: "#main"
- main:
  - button "Voltar":
    - img
  - button "Abrir menu de navegação" [expanded]: MA Meu Album
  - text: "Usuário Teste #KN0AP1"
  - button "Sair":
    - img
  - dialog "Menu de navegação":
    - text: MA Meu Album
    - button "Fechar menu":
      - img
    - navigation "Navegação principal":
      - list:
        - listitem:
          - link "Início":
            - /url: /home
        - listitem:
          - link "Álbuns":
            - /url: /albums
        - listitem:
          - link "Abrir Pacotinhos":
            - /url: /abrir
        - listitem:
          - link "Colar Figurinhas":
            - /url: /colar
        - listitem:
          - link "Trocas":
            - /url: /trocas
        - listitem:
          - link "Perfil":
            - /url: /perfil
  - heading "FIFA World Cup 2026™" [level=1]
  - paragraph: FIFA World Cup 2026™ · Brochura
  - text: Progresso
  - progressbar "Progresso"
  - button "Colar figurinhas"
  - button "Baixar PDF"
  - button "Arquivar"
  - button "Página Inicial 0/9 ▼"
  - button "México 0/20 ▼"
  - button "África do Sul 0/20 ▼"
  - button "Coreia do Sul 0/20 ▼"
  - button "República Tcheca 0/20 ▼"
  - button "Canadá 0/20 ▼"
  - button "Bósnia e Herzegovina 0/20 ▼"
  - button "Catar 0/20 ▼"
  - button "Suíça 0/20 ▼"
  - button "Brasil 0/20 ▼"
  - button "Marrocos 0/20 ▼"
  - button "Haiti 0/20 ▼"
  - button "Escócia 0/20 ▼"
  - button "Estados Unidos 0/20 ▼"
  - button "Paraguai 0/20 ▼"
  - button "Austrália 0/20 ▼"
  - button "Turquia 0/20 ▼"
  - button "Alemanha 0/20 ▼"
  - button "Curaçao 0/20 ▼"
  - button "Costa do Marfim 0/20 ▼"
  - button "Equador 0/20 ▼"
  - button "Holanda 0/20 ▼"
  - button "Japão 0/20 ▼"
  - button "Suécia 0/20 ▼"
  - button "Tunísia 0/20 ▼"
  - button "Bélgica 0/20 ▼"
  - button "Egito 0/20 ▼"
  - button "Irã 0/20 ▼"
  - button "Nova Zelândia 0/20 ▼"
  - button "Espanha 0/20 ▼"
  - button "Cabo Verde 0/20 ▼"
  - button "Arábia Saudita 0/20 ▼"
  - button "Uruguai 0/20 ▼"
  - button "França 0/20 ▼"
  - button "Senegal 0/20 ▼"
  - button "Iraque 0/20 ▼"
  - button "Noruega 0/20 ▼"
  - button "Argentina 0/20 ▼"
  - button "Argélia 0/20 ▼"
  - button "Áustria 0/20 ▼"
  - button "Jordânia 0/20 ▼"
  - button "Portugal 0/20 ▼"
  - button "Congo RD 0/20 ▼"
  - button "Uzbequistão 0/20 ▼"
  - button "Colômbia 0/20 ▼"
  - button "Inglaterra 0/20 ▼"
  - button "Croácia 0/20 ▼"
  - button "Gana 0/20 ▼"
  - button "Panamá 0/20 ▼"
  - button "FIFA World Cup History 0/11 ▼"
  - button "Coca-Cola 0/14 ▼"
- contentinfo:
  - navigation "Links de rodapé":
    - link "Política de Privacidade (abre em nova aba)":
      - /url: /politica-de-privacidade
    - link "Gerenciar cookies":
      - /url: /perfil#cookies
```

# Test source

```ts
  80  |         await criarAlbum(request, tipoId, 'BROCHURA');
  81  |         await page.goto('/albums');
  82  |         await expect(page.getByRole('button', { name: /gerenciar/i }).first()).toBeVisible();
  83  |       });
  84  | 
  85  |       test('deve exibir botão "Colar figurinhas" no card ativo', async ({ page, request }) => {
  86  |         await usuarioAtivo(page, request);
  87  |         const tipoId = await getTipoAlbumId(request);
  88  |         await criarAlbum(request, tipoId, 'BROCHURA');
  89  |         await page.goto('/albums');
  90  |         await expect(page.getByRole('button', { name: /colar figurinhas/i }).first()).toBeVisible();
  91  |       });
  92  | 
  93  |       test('deve exibir botão "Baixar PDF" no card ativo (RN-AL30)', async ({ page, request }) => {
  94  |         await usuarioAtivo(page, request);
  95  |         const tipoId = await getTipoAlbumId(request);
  96  |         await criarAlbum(request, tipoId, 'BROCHURA');
  97  |         await page.goto('/albums');
  98  |         await expect(page.getByRole('button', { name: /baixar pdf/i }).first()).toBeVisible();
  99  |       });
  100 | 
  101 |       test('botão "Gerenciar" redireciona para Tela AL1 (RN-AL28)', async ({ page, request }) => {
  102 |         await usuarioAtivo(page, request);
  103 |         const tipoId = await getTipoAlbumId(request);
  104 |         await criarAlbum(request, tipoId, 'BROCHURA');
  105 |         await page.goto('/albums');
  106 |         await page.getByRole('button', { name: /gerenciar/i }).first().click();
  107 |         await expect(page).toHaveURL(/\/albums\/.+/);
  108 |       });
  109 |     });
  110 | 
  111 |     test.describe('Seção de álbuns arquivados (RN-AL11, AL13, AL14)', () => {
  112 | 
  113 |       test('não deve exibir seção de arquivados quando não há nenhum', async ({ page, request }) => {
  114 |         await usuarioAtivo(page, request);
  115 |         const tipoId = await getTipoAlbumId(request);
  116 |         await criarAlbum(request, tipoId, 'BROCHURA');
  117 |         await page.goto('/albums');
  118 |         await expect(page.getByText(/álbuns arquivados/i)).not.toBeVisible();
  119 |       });
  120 | 
  121 |       test('deve exibir seção de arquivados ao arquivar ao menos 1 álbum', async ({ page, request }) => {
  122 |         await usuarioAtivo(page, request);
  123 |         const tipoId = await getTipoAlbumId(request);
  124 |         const album = await criarAlbum(request, tipoId, 'BROCHURA');
  125 |         await arquivarAlbum(request, album._id ?? album.id);
  126 |         await page.goto('/albums');
  127 |         await expect(page.getByText(/álbuns arquivados/i)).toBeVisible();
  128 |       });
  129 | 
  130 |       test('álbum arquivado exibe apenas ação "Desarquivar"', async ({ page, request }) => {
  131 |         await usuarioAtivo(page, request);
  132 |         const tipoId = await getTipoAlbumId(request);
  133 |         const album = await criarAlbum(request, tipoId, 'BROCHURA');
  134 |         await arquivarAlbum(request, album._id ?? album.id);
  135 |         await page.goto('/albums');
  136 |         const secaoArquivados = page.getByText(/álbuns arquivados/i).locator('..').locator('..');
  137 |         await expect(secaoArquivados.getByRole('button', { name: /desarquivar/i })).toBeVisible();
  138 |         await expect(secaoArquivados.getByRole('button', { name: /gerenciar/i })).not.toBeVisible();
  139 |         await expect(secaoArquivados.getByRole('button', { name: /baixar pdf/i })).not.toBeVisible();
  140 |       });
  141 |     });
  142 |   });
  143 | 
  144 |   // ── Tela AL1 — Gerenciamento do Álbum ────────────────────────────────────────
  145 | 
  146 |   test.describe('Tela AL1 — Gerenciamento do Álbum', () => {
  147 | 
  148 |     test('deve exibir tipo, variante, percentual de conclusão e barra de ações', async ({ page, request }) => {
  149 |       await usuarioAtivo(page, request);
  150 |       const tipoId = await getTipoAlbumId(request);
  151 |       await criarAlbum(request, tipoId, 'BROCHURA');
  152 |       await page.goto('/albums');
  153 |       await page.getByRole('button', { name: /gerenciar/i }).first().click();
  154 |       await expect(page.getByText(/brochura/i)).toBeVisible();
  155 |       await expect(page.getByRole('button', { name: /colar figurinhas/i })).toBeVisible();
  156 |       await expect(page.getByRole('button', { name: /baixar pdf/i })).toBeVisible();
  157 |       await expect(page.getByRole('button', { name: /arquivar/i })).toBeVisible();
  158 |     });
  159 | 
  160 |     test('deve exibir seções ordenadas por Secao.ordem ASC (RN-AL16)', async ({ page, request }) => {
  161 |       await usuarioAtivo(page, request);
  162 |       const tipoId = await getTipoAlbumId(request);
  163 |       await criarAlbum(request, tipoId, 'BROCHURA');
  164 |       await page.goto('/albums');
  165 |       await page.getByRole('button', { name: /gerenciar/i }).first().click();
  166 |       const secoes = page.locator('button[aria-expanded]');
  167 |       await expect(secoes.first()).toBeVisible();
  168 |       const count = await secoes.count();
  169 |       expect(count).toBeGreaterThan(0);
  170 |     });
  171 | 
  172 |     test('deve expandir seção e listar figurinhas faltantes', async ({ page, request }) => {
  173 |       await usuarioAtivo(page, request);
  174 |       const tipoId = await getTipoAlbumId(request);
  175 |       await criarAlbum(request, tipoId, 'BROCHURA');
  176 |       await page.goto('/albums');
  177 |       await page.getByRole('button', { name: /gerenciar/i }).first().click();
  178 |       await page.locator('button[aria-expanded]').first().click();
  179 |       const itens = page.locator('[data-testid="figurinha-faltante"], [aria-label*="faltante"]');
> 180 |       await expect(itens.first()).toBeVisible();
      |                                   ^ Error: expect(locator).toBeVisible() failed
  181 |     });
  182 | 
  183 |     test('botão "Colar figurinhas" redireciona para Colar Figurinhas com contexto', async ({ page, request }) => {
  184 |       await usuarioAtivo(page, request);
  185 |       const tipoId = await getTipoAlbumId(request);
  186 |       await criarAlbum(request, tipoId, 'BROCHURA');
  187 |       await page.goto('/albums');
  188 |       await page.getByRole('button', { name: /gerenciar/i }).first().click();
  189 |       await page.getByRole('button', { name: /colar figurinhas/i }).click();
  190 |       await expect(page).toHaveURL(/\/colar/);
  191 |     });
  192 |   });
  193 | 
  194 |   // ── PDF de Figurinhas Faltantes ───────────────────────────────────────────────
  195 | 
  196 |   test.describe.skip('PDF de Figurinhas Faltantes (RN-AL19, AL30)', () => {
  197 | 
  198 |     test('botão "Baixar PDF" no card da AL0 inicia download sem navegar para AL1 (RN-AL30)', async ({ page, request }) => {
  199 |       test.setTimeout(60_000);
  200 |       await usuarioAtivo(page, request);
  201 |       const tipoId = await getTipoAlbumId(request);
  202 |       await criarAlbum(request, tipoId, 'BROCHURA');
  203 |       await page.goto('/albums');
  204 |       const [download] = await Promise.all([
  205 |         page.waitForEvent('download'),
  206 |         page.getByRole('button', { name: /baixar pdf/i }).first().click(),
  207 |       ]);
  208 |       expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  209 |       await expect(page).toHaveURL(/\/albums$/);
  210 |     });
  211 | 
  212 |     test('botão "Baixar PDF" na AL1 desabilita outras ações durante geração (RN-AL19)', async ({ page, request }) => {
  213 |       test.setTimeout(60_000);
  214 |       await usuarioAtivo(page, request);
  215 |       const tipoId = await getTipoAlbumId(request);
  216 |       await criarAlbum(request, tipoId, 'BROCHURA');
  217 |       await page.goto('/albums');
  218 |       await page.getByRole('button', { name: /gerenciar/i }).first().click();
  219 |       // intercept PDF route to keep loading state visible during assertion
  220 |       await page.route('**/pdf', async (route) => {
  221 |         await new Promise<void>((r) => setTimeout(r, 1500));
  222 |         await route.continue();
  223 |       });
  224 |       await page.getByRole('button', { name: /baixar pdf/i }).click();
  225 |       await expect(page.getByRole('button', { name: /colar figurinhas/i })).toBeDisabled();
  226 |       await expect(page.getByRole('button', { name: /arquivar/i })).toBeDisabled();
  227 |     });
  228 |   });
  229 | 
  230 |   // ── Arquivamento (RN-AL09, AL10, AL11, AL32) ─────────────────────────────────
  231 | 
  232 |   test.describe('Arquivamento', () => {
  233 | 
  234 |     test('deve exibir confirmação inline com texto descritivo ao clicar "Arquivar"', async ({ page, request }) => {
  235 |       await usuarioAtivo(page, request);
  236 |       const tipoId = await getTipoAlbumId(request);
  237 |       await criarAlbum(request, tipoId, 'BROCHURA');
  238 |       await page.goto('/albums');
  239 |       await page.getByRole('button', { name: /gerenciar/i }).first().click();
  240 |       await page.getByRole('button', { name: /arquivar/i }).click();
  241 |       await expect(page.getByRole('button', { name: /confirmar arquivamento/i })).toBeVisible();
  242 |       await expect(page.getByRole('button', { name: /cancelar/i })).toBeVisible();
  243 |     });
  244 | 
  245 |     test('botão "Confirmar arquivamento" deve ter destaque em preto, não vermelho (RN-AL32)', async ({ page, request }) => {
  246 |       await usuarioAtivo(page, request);
  247 |       const tipoId = await getTipoAlbumId(request);
  248 |       await criarAlbum(request, tipoId, 'BROCHURA');
  249 |       await page.goto('/albums');
  250 |       await page.getByRole('button', { name: /gerenciar/i }).first().click();
  251 |       await page.getByRole('button', { name: /arquivar/i }).click();
  252 |       const botaoConfirmar = page.getByRole('button', { name: /confirmar arquivamento/i });
  253 |       const cor = await botaoConfirmar.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  254 |       expect(cor).not.toMatch(/rgb\(.*255.*0.*0|rgb\(.*220.*38.*38/);
  255 |     });
  256 | 
  257 |     test('confirmar arquivamento move álbum para seção arquivados e redireciona para AL0', async ({ page, request }) => {
  258 |       await usuarioAtivo(page, request);
  259 |       const tipoId = await getTipoAlbumId(request);
  260 |       await criarAlbum(request, tipoId, 'BROCHURA');
  261 |       await page.goto('/albums');
  262 |       await page.getByRole('button', { name: /gerenciar/i }).first().click();
  263 |       await page.getByRole('button', { name: /arquivar/i }).click();
  264 |       await page.getByRole('button', { name: /confirmar arquivamento/i }).click();
  265 |       await expect(page).toHaveURL(/\/albums$/);
  266 |       await expect(page.getByText(/álbuns arquivados/i)).toBeVisible();
  267 |     });
  268 | 
  269 |     test('cancelar arquivamento não altera o álbum', async ({ page, request }) => {
  270 |       await usuarioAtivo(page, request);
  271 |       const tipoId = await getTipoAlbumId(request);
  272 |       await criarAlbum(request, tipoId, 'BROCHURA');
  273 |       await page.goto('/albums');
  274 |       await page.getByRole('button', { name: /gerenciar/i }).first().click();
  275 |       await page.getByRole('button', { name: /arquivar/i }).click();
  276 |       await page.getByRole('button', { name: /cancelar/i }).click();
  277 |       await expect(page.getByRole('button', { name: /arquivar/i })).toBeVisible();
  278 |     });
  279 | 
  280 |     test('álbum arquivado não aparece na Home (RN-AL03)', async ({ page, request }) => {
```