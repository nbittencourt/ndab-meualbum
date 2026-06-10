# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pacotinhos\abrir-pacotinhos.spec.ts >> Abrir Pacotinhos >> Alerta de saída (RN-AP16, RN-AP32) >> deve exibir alerta ao navegar via header com itens PENDENTES
- Location: tests\pacotinhos\abrir-pacotinhos.spec.ts:161:9

# Error details

```
Test timeout of 10000ms exceeded.
```

```
Error: locator.click: Test timeout of 10000ms exceeded.
Call log:
  - waiting for getByRole('link', { name: /álbum/i })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - link "Pular para o conteúdo" [ref=e3] [cursor=pointer]:
    - /url: "#main"
  - generic [ref=e5]:
    - main [ref=e6]:
      - generic [ref=e7]:
        - generic [ref=e8]:
          - generic [ref=e9]:
            - button "Voltar" [ref=e10] [cursor=pointer]:
              - img [ref=e11]
            - button "Abrir menu de navegação" [expanded] [ref=e13] [cursor=pointer]:
              - generic [ref=e14]: MA
              - generic [ref=e15]: Meu Album
          - generic [ref=e16]:
            - generic [ref=e17]:
              - generic [ref=e18]: Usuário Teste
              - generic [ref=e19]: "#8NMUP6"
            - button "Sair" [ref=e20] [cursor=pointer]:
              - img [ref=e21]
        - dialog "Menu de navegação" [ref=e25]:
          - generic [ref=e26]:
            - generic [ref=e27]:
              - generic [ref=e28]: MA
              - generic [ref=e29]: Meu Album
            - button "Fechar menu" [active] [ref=e30] [cursor=pointer]:
              - img [ref=e31]
          - navigation "Navegação principal" [ref=e33]:
            - list [ref=e34]:
              - listitem [ref=e35]:
                - link "Início" [ref=e36] [cursor=pointer]:
                  - /url: /home
              - listitem [ref=e37]:
                - link "Álbuns" [ref=e38] [cursor=pointer]:
                  - /url: /albums
              - listitem [ref=e39]:
                - link "Abrir Pacotinhos" [ref=e40] [cursor=pointer]:
                  - /url: /abrir
              - listitem [ref=e41]:
                - link "Colar Figurinhas" [ref=e42] [cursor=pointer]:
                  - /url: /colar
              - listitem [ref=e43]:
                - link "Trocas" [ref=e44] [cursor=pointer]:
                  - /url: /trocas
              - listitem [ref=e45]:
                - link "Perfil" [ref=e46] [cursor=pointer]:
                  - /url: /perfil
        - generic [ref=e47]:
          - generic [ref=e48]:
            - generic [ref=e49]:
              - heading "Abrir Pacotinhos" [level=1] [ref=e50]
              - paragraph [ref=e51]: FIFA World Cup 2026™
            - generic [ref=e52]:
              - button "Todas P/ Repetidas" [ref=e53] [cursor=pointer]
              - button "Limpar pilha" [ref=e54] [cursor=pointer]
          - generic [ref=e56]:
            - generic [ref=e58]:
              - generic [ref=e60]: Número da figurinha
              - textbox "Número da figurinha para adicionar à pilha" [ref=e62]:
                - /placeholder: "Ex.: 42 ou BR01"
            - generic [ref=e63]:
              - button "+" [disabled] [ref=e64]
              - button "Fotografar" [ref=e65] [cursor=pointer]
          - region "Pilha da sessão" [ref=e66]:
            - heading "Pilha (1)" [level=2] [ref=e67]
            - 'article "Figurinha FWC1, status: PENDENTE" [ref=e69]':
              - generic [ref=e70]:
                - generic [ref=e71]: Digitação
                - generic [ref=e72]: Sem álbum
              - generic [ref=e73]:
                - generic [ref=e74]: FWC1
                - generic [ref=e75]: Official Emblem
              - generic [ref=e76]:
                - button "Enviar para Repetidas" [ref=e77] [cursor=pointer]
                - button "✕ Descartar" [ref=e78] [cursor=pointer]
    - contentinfo [ref=e79]:
      - navigation "Links de rodapé" [ref=e80]:
        - link "Política de Privacidade (abre em nova aba)" [ref=e81] [cursor=pointer]:
          - /url: /politica-de-privacidade
          - text: Política de Privacidade
          - generic [ref=e82]: (abre em nova aba)
        - link "Gerenciar cookies" [ref=e83] [cursor=pointer]:
          - /url: /perfil#cookies
```

# Test source

```ts
  71  |       await expect(page.getByText(/sessão anterior/i).first()).toBeVisible();
  72  |       await expect(page.getByRole('button', { name: /continuar sessão anterior/i })).toBeVisible();
  73  |       await expect(page.getByRole('button', { name: /descartar e começar do zero/i })).toBeVisible();
  74  |     });
  75  | 
  76  |     test('"Continuar" deve restaurar pilha e pular AP0 (RN-AP20)', async ({ page, request }) => {
  77  |       const { identificador } = await usuarioAtivo(page, request);
  78  |       const tipoId = await getTipoAlbumId(request);
  79  |       await request.post('/api/v1/test/criar-pilha-pendente', {
  80  |         data: { tipo_album_id: tipoId, numeros: ['FWC1'], identificador },
  81  |       });
  82  |       await page.goto('/abrir');
  83  |       await page.getByRole('button', { name: /continuar sessão anterior/i }).click();
  84  | 
  85  |       await expect(page.getByText(/que álbum você está abrindo/i)).not.toBeVisible();
  86  |     });
  87  |   });
  88  | 
  89  |   // ── Entrada por digitação ─────────────────────────────────────────────────────
  90  |   // Com 1 TipoAlbum (RN-AP43), AP1 abre diretamente — sem interação com AP0.
  91  | 
  92  |   test.describe('Entrada por digitação', () => {
  93  | 
  94  |     test('deve converter entrada para maiúsculas', async ({ page, request }) => {
  95  |       await usuarioAtivo(page, request);
  96  |       await page.goto('/abrir');
  97  |       const campo = page.getByRole('textbox');
  98  |       await expect(campo).toBeVisible();
  99  |       await campo.fill('abc');
  100 |       await expect(campo).toHaveValue('ABC');
  101 |     });
  102 | 
  103 |     test('deve exibir erro inline para número inexistente no catálogo (RN-AP04)', async ({ page, request }) => {
  104 |       await usuarioAtivo(page, request);
  105 |       await page.goto('/abrir');
  106 |       const campo = page.getByRole('textbox');
  107 |       await expect(campo).toBeVisible();
  108 |       await campo.fill('INEXISTENTE-999');
  109 |       await campo.press('Enter');
  110 |       await expect(page.getByText(/Figurinha INEXISTENTE-999 não encontrada no álbum/i)).toBeVisible();
  111 |     });
  112 | 
  113 |     test('deve bloquear adição ao atingir 100 itens PENDENTES (RN-AP28)', async ({ page, request }) => {
  114 |       const { identificador } = await usuarioAtivo(page, request);
  115 |       const tipoId = await getTipoAlbumId(request);
  116 |       await request.post('/api/v1/test/popular-pilha', {
  117 |         data: { tipo_album_id: tipoId, quantidade: 100, identificador },
  118 |       });
  119 |       await page.goto('/abrir');
  120 |       await page.getByRole('button', { name: /continuar sessão anterior/i }).click();
  121 |       const campo = page.getByRole('textbox');
  122 |       await campo.fill('FWC1');
  123 |       await campo.press('Enter');
  124 |       await expect(page.getByText(/limite de 100|máximo de 100/i)).toBeVisible();
  125 |     });
  126 | 
  127 |     test('deve limpar campo e manter foco após adição bem-sucedida', async ({ page, request }) => {
  128 |       await usuarioAtivo(page, request);
  129 |       await page.goto('/abrir');
  130 |       const campo = page.getByRole('textbox');
  131 |       await expect(campo).toBeVisible();
  132 |       await campo.fill('FWC1');
  133 |       await campo.press('Enter');
  134 |       await expect(campo).toHaveValue('');
  135 |       await expect(campo).toBeFocused();
  136 |     });
  137 |   });
  138 | 
  139 |   // ── Descarte ─────────────────────────────────────────────────────────────────
  140 | 
  141 |   test.describe('Descarte de figurinha (RN-AP24)', () => {
  142 | 
  143 |     test('deve exibir confirmação com número e nome antes de descartar', async ({ page, request }) => {
  144 |       const { identificador } = await usuarioAtivo(page, request);
  145 |       const tipoId = await getTipoAlbumId(request);
  146 |       await request.post('/api/v1/test/criar-pilha-pendente', {
  147 |         data: { tipo_album_id: tipoId, numeros: ['FWC1'], identificador },
  148 |       });
  149 |       await page.goto('/abrir');
  150 |       await page.getByRole('button', { name: /continuar sessão anterior/i }).click();
  151 |       await page.getByRole('button', { name: /descartar/i }).first().click();
  152 |       await expect(page.getByText(/FWC1/).first()).toBeVisible();
  153 |       await expect(page.getByRole('button', { name: /confirmar/i })).toBeVisible();
  154 |     });
  155 |   });
  156 | 
  157 |   // ── Alerta de saída ───────────────────────────────────────────────────────────
  158 | 
  159 |   test.describe('Alerta de saída (RN-AP16, RN-AP32)', () => {
  160 | 
  161 |     test('deve exibir alerta ao navegar via header com itens PENDENTES', async ({ page, request }) => {
  162 |       const { identificador } = await usuarioAtivo(page, request);
  163 |       const tipoId = await getTipoAlbumId(request);
  164 |       await request.post('/api/v1/test/criar-pilha-pendente', {
  165 |         data: { tipo_album_id: tipoId, numeros: ['FWC1'], identificador },
  166 |       });
  167 |       await page.goto('/abrir');
  168 |       await page.getByRole('button', { name: /continuar sessão anterior/i }).click();
  169 |       // Abre menu de navegação mobile e navega para Álbuns
  170 |       await page.getByRole('button', { name: /abrir menu de navegação/i }).click();
> 171 |       await page.getByRole('link', { name: /álbum/i }).click();
      |                                                        ^ Error: locator.click: Test timeout of 10000ms exceeded.
  172 | 
  173 |       await expect(page.getByRole('heading', { name: /figurinhas sem destino/i })).toBeVisible();
  174 |     });
  175 | 
  176 |     test('"Ficar" deve fechar alerta e manter o usuário na AP1', async ({ page, request }) => {
  177 |       const { identificador } = await usuarioAtivo(page, request);
  178 |       const tipoId = await getTipoAlbumId(request);
  179 |       await request.post('/api/v1/test/criar-pilha-pendente', {
  180 |         data: { tipo_album_id: tipoId, numeros: ['FWC1'], identificador },
  181 |       });
  182 |       await page.goto('/abrir');
  183 |       await page.getByRole('button', { name: /continuar sessão anterior/i }).click();
  184 |       await page.getByRole('button', { name: /abrir menu de navegação/i }).click();
  185 |       await page.getByRole('link', { name: /álbum/i }).click();
  186 |       await page.getByRole('button', { name: /ficar/i }).click();
  187 | 
  188 |       await expect(page).toHaveURL(/\/abrir/);
  189 |     });
  190 | 
  191 |     test('logout com itens PENDENTES deve encerrar sem alerta (RN-AP32)', async ({ page, request }) => {
  192 |       const { identificador } = await usuarioAtivo(page, request);
  193 |       const tipoId = await getTipoAlbumId(request);
  194 |       await request.post('/api/v1/test/criar-pilha-pendente', {
  195 |         data: { tipo_album_id: tipoId, numeros: ['FWC1'], identificador },
  196 |       });
  197 |       await page.goto('/abrir');
  198 |       await page.getByRole('button', { name: /continuar sessão anterior/i }).click();
  199 |       // Logout via header (RN-AP32: encerra diretamente sem alerta)
  200 |       await page.locator('header').getByRole('button', { name: 'Sair', exact: true }).click();
  201 | 
  202 |       await expect(page).toHaveURL('/');
  203 |     });
  204 |   });
  205 | 
  206 |   // ── Tela AP1 – comportamento (RN-AP41, AP42) ─────────────────────────────────
  207 | 
  208 |   test.describe('Tela AP1 – estrutura e comportamento', () => {
  209 | 
  210 |     test('botão "Sair" dedicado não deve existir na AP1 (RN-AP41)', async ({ page, request }) => {
  211 |       const { identificador } = await usuarioAtivo(page, request);
  212 |       const tipoId = await getTipoAlbumId(request);
  213 |       await request.post('/api/v1/test/criar-pilha-pendente', {
  214 |         data: { tipo_album_id: tipoId, numeros: ['FWC1'], identificador },
  215 |       });
  216 |       await page.goto('/abrir');
  217 |       await page.getByRole('button', { name: /continuar sessão anterior/i }).click();
  218 |       // Apenas o botão de logout do header deve ter o nome "Sair"
  219 |       // AP1 não deve adicionar seu próprio botão de saída dedicado
  220 |       await expect(page.getByRole('button', { name: 'Sair', exact: true })).toHaveCount(1);
  221 |       await expect(page.locator('header').getByRole('button', { name: 'Sair', exact: true })).toBeVisible();
  222 |     });
  223 | 
  224 |     test('deve exibir nome do tipo de álbum da sessão no topo da AP1 (RN-AP42)', async ({ page, request }) => {
  225 |       await usuarioAtivo(page, request);
  226 |       await page.goto('/abrir');
  227 |       // Com 1 tipo (RN-AP43), AP1 abre diretamente com tipo pré-selecionado
  228 |       await expect(page.getByRole('textbox')).toBeVisible();
  229 |       await expect(page.getByText(/FIFA World Cup 2026/i)).toBeVisible();
  230 |     });
  231 | 
  232 |     test('câmera não ativa automaticamente — requer ação explícita (RN-AP43)', async ({ page, request }) => {
  233 |       await usuarioAtivo(page, request);
  234 |       await page.goto('/abrir');
  235 |       // Com 1 tipo, AP1 abre diretamente
  236 |       await page.getByRole('button', { name: /fotografar|câmera/i }).click();
  237 |       await expect(page.getByRole('button', { name: /abrir câmera/i })).toBeVisible();
  238 |       await expect(page.locator('video')).not.toBeVisible();
  239 |     });
  240 |   });
  241 | 
  242 |   // ── Modal de Colagem (MCol) ───────────────────────────────────────────────────
  243 | 
  244 |   test.describe('Modal de Colagem – MCol', () => {
  245 | 
  246 |     test('deve pré-selecionar álbum quando há exatamente 1 elegível (RN-AP09)', async ({ page, request }) => {
  247 |       const { identificador } = await usuarioAtivo(page, request);
  248 |       const tipoId = await getTipoAlbumId(request);
  249 |       await criarAlbum(request, tipoId, 'BROCHURA');
  250 |       await request.post('/api/v1/test/criar-pilha-pendente', {
  251 |         data: { tipo_album_id: tipoId, numeros: ['FWC1'], identificador },
  252 |       });
  253 |       await page.goto('/abrir');
  254 |       await page.getByRole('button', { name: /continuar sessão anterior/i }).click();
  255 |       await page.getByRole('button', { name: /colar/i }).first().click();
  256 |       await expect(page.getByRole('radio', { name: /brochura/i }).or(
  257 |         page.getByText(/álbum selecionado/i)
  258 |       )).toBeVisible();
  259 |       await expect(page.getByRole('button', { name: /confirmar colagem/i })).toBeEnabled();
  260 |     });
  261 | 
  262 |     test('deve exigir seleção manual com 2+ álbuns elegíveis (RN-AP09)', async ({ page, request }) => {
  263 |       const { identificador } = await usuarioAtivo(page, request);
  264 |       const tipoId = await getTipoAlbumId(request);
  265 |       await criarAlbum(request, tipoId, 'BROCHURA');
  266 |       await criarAlbum(request, tipoId, 'CAPA_DURA');
  267 |       await request.post('/api/v1/test/criar-pilha-pendente', {
  268 |         data: { tipo_album_id: tipoId, numeros: ['FWC1'], identificador },
  269 |       });
  270 |       await page.goto('/abrir');
  271 |       await page.getByRole('button', { name: /continuar sessão anterior/i }).click();
```