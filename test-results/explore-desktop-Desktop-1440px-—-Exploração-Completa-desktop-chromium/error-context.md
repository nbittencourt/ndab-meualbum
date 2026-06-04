# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: explore-desktop.spec.ts >> Desktop 1440px — Exploração Completa
- Location: test-explore\explore-desktop.spec.ts:78:5

# Error details

```
Test timeout of 180000ms exceeded.
```

```
Error: locator.fill: Test timeout of 180000ms exceeded.
Call log:
  - waiting for locator('input[type="email"]').first()

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
            - generic [ref=e11]: MA
            - generic [ref=e12]: Meu Album
          - generic [ref=e13]:
            - generic [ref=e14]:
              - paragraph [ref=e15]: Explorador Teste
              - paragraph [ref=e16]: "#9X53AQ"
            - button "Sair" [ref=e17] [cursor=pointer]:
              - img [ref=e18]
        - link "+ Abrir":
          - /url: /abrir
          - button "+ Abrir" [ref=e20] [cursor=pointer]
        - generic [ref=e21]:
          - generic [ref=e23]:
            - paragraph [ref=e24]: Nova remessa disponível
            - heading "Abrir Pacotinhos" [level=2] [ref=e25]
            - paragraph [ref=e26]: Adicione novas figurinhas à sua coleção e veja o álbum evoluir.
            - link "Abrir pacotinhos →" [ref=e27] [cursor=pointer]:
              - /url: /abrir
              - button "Abrir pacotinhos →" [ref=e28]
          - generic [ref=e29]:
            - generic [ref=e30]:
              - generic [ref=e31]:
                - heading "Meus Álbuns" [level=2] [ref=e32]
                - link "Ver todos os álbuns" [ref=e33] [cursor=pointer]:
                  - /url: /albums
              - link "+ Novo álbum" [ref=e34] [cursor=pointer]:
                - /url: /albums/novo
                - button "+ Novo álbum" [ref=e35]
            - article [ref=e37]:
              - generic [ref=e38]:
                - generic [ref=e39]: Brochura
                - generic [ref=e40]: 03/06/26
              - heading "FIFA World Cup 2026™" [level=3] [ref=e41]
              - paragraph [ref=e42]: Album Desktop Teste
              - generic [ref=e44]:
                - generic [ref=e45]: Progresso
                - generic [ref=e46]: 0.0%
              - link "Colar figurinhas →" [ref=e48] [cursor=pointer]:
                - /url: /colar?albumId=6a20b90509a97e3dc0f56b50
                - button "Colar figurinhas →" [ref=e49]
          - generic [ref=e50]:
            - heading "Figurinhas Repetidas" [level=2] [ref=e51]
            - paragraph [ref=e52]: "Total: 0"
            - paragraph [ref=e54]: Nenhuma figurinha repetida no seu estoque.
          - generic [ref=e55]:
            - link "FIFA 2026 →" [ref=e56] [cursor=pointer]:
              - /url: https://www.fifaworld.cup/pt
            - link "Panini Comics →" [ref=e57] [cursor=pointer]:
              - /url: https://paninicomics.com.br
    - navigation [ref=e58]:
      - list [ref=e59]:
        - listitem [ref=e60]:
          - link "📖 Álbum" [ref=e61] [cursor=pointer]:
            - /url: /albums
            - generic [ref=e62]: 📖
            - text: Álbum
        - listitem [ref=e63]:
          - link "🔄 Trocas" [ref=e64] [cursor=pointer]:
            - /url: /trocas
            - generic [ref=e65]: 🔄
            - text: Trocas
        - listitem [ref=e66]:
          - link "👤 Perfil" [ref=e67] [cursor=pointer]:
            - /url: /perfil
            - generic [ref=e68]: 👤
            - text: Perfil
```

# Test source

```ts
  1   | /**
  2   |  * Exploração desktop 1440px — layout, responsividade, breakpoints.
  3   |  *
  4   |  * Rotas corretas do app:
  5   |  *   /albums/novo          → CadastroAlbumPage
  6   |  *   /albums/:id           → AlbumManagePage
  7   |  *   /albums/:id/visualizar → AlbumVisualizarPage (grid de figurinhas)
  8   |  *   /abrir                → AbrirPacotinhosPage
  9   |  *   /colar                → ColarFigurinhasPage  (query: ?albumId=...)
  10  |  *   /trocas               → SwapsPage
  11  |  *   /perfil               → ProfilePage
  12  |  *
  13  |  * App.tsx l.104: authenticated pages wrapped in max-w-[430px] mx-auto
  14  |  *   → TODAS as telas autenticadas têm 430px de largura máxima em qualquer viewport.
  15  |  */
  16  | import { test, Page, ConsoleMessage } from '@playwright/test';
  17  | import * as fs from 'fs';
  18  | import * as path from 'path';
  19  | 
  20  | const BASE     = 'http://localhost:5173';
  21  | const SS_DIR   = path.join(__dirname, 'screenshots-desktop');
  22  | const EMAIL    = 'explore_1780527207714@test.com';
  23  | const PASS     = 'Explore@1234!';
  24  | const ALBUM_ID = '6a20b90509a97e3dc0f56b50';
  25  | 
  26  | const consoleLogs: { url: string; type: string; text: string }[] = [];
  27  | const timings:     { label: string; ms: number }[]               = [];
  28  | 
  29  | function track(page: Page) {
  30  |   page.on('console', (msg: ConsoleMessage) => {
  31  |     if (['error', 'warning'].includes(msg.type()))
  32  |       consoleLogs.push({ url: page.url(), type: msg.type(), text: msg.text() });
  33  |   });
  34  |   page.on('pageerror', err =>
  35  |     consoleLogs.push({ url: page.url(), type: 'pageerror', text: err.message }));
  36  | }
  37  | 
  38  | async function ss(page: Page, name: string) {
  39  |   fs.mkdirSync(SS_DIR, { recursive: true });
  40  |   await page.screenshot({ path: path.join(SS_DIR, `${name}.png`), fullPage: true }).catch(() => {});
  41  | }
  42  | 
  43  | async function go(page: Page, label: string, url: string) {
  44  |   const t0 = Date.now();
  45  |   try {
  46  |     await page.goto(url, { waitUntil: 'networkidle', timeout: 12000 });
  47  |   } catch {
  48  |     // se networkidle demorar demais, tenta domcontentloaded
  49  |     await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 8000 }).catch(() => {});
  50  |     await page.waitForTimeout(600);
  51  |   }
  52  |   const ms = Date.now() - t0;
  53  |   timings.push({ label, ms });
  54  |   console.log(`[TIMING] ${label}: ${ms}ms  →  ${page.url()}`);
  55  | }
  56  | 
  57  | async function dismissCookies(page: Page) {
  58  |   const btn = page.locator('button:has-text("Aceitar essenciais")').first();
  59  |   if (await btn.isVisible().catch(() => false)) {
  60  |     await btn.click({ force: true });
  61  |     await page.waitForTimeout(300);
  62  |   }
  63  | }
  64  | 
  65  | async function login(page: Page) {
  66  |   await page.goto(BASE, { waitUntil: 'networkidle' });
  67  |   await dismissCookies(page);
> 68  |   await page.locator('input[type="email"]').first().fill(EMAIL);
      |                                                     ^ Error: locator.fill: Test timeout of 180000ms exceeded.
  69  |   await page.locator('input[type="password"]').first().fill(PASS);
  70  |   const t0 = Date.now();
  71  |   await page.locator('button[type="submit"]').first().click();
  72  |   await page.waitForURL(/\/home/, { timeout: 15000 });
  73  |   await page.waitForTimeout(400);
  74  |   timings.push({ label: 'login', ms: Date.now() - t0 });
  75  |   console.log(`[LOGIN] ok → ${page.url()} (${timings.at(-1)!.ms}ms)`);
  76  | }
  77  | 
  78  | test('Desktop 1440px — Exploração Completa', async ({ page }) => {
  79  |   test.setTimeout(180_000);
  80  |   track(page);
  81  |   fs.mkdirSync(SS_DIR, { recursive: true });
  82  | 
  83  |   // ── Telas públicas (sem max-width) ─────────────────────────────────────────
  84  | 
  85  |   await go(page, '01-landing', BASE);
  86  |   await ss(page, '01-landing');
  87  | 
  88  |   await go(page, '02-register', `${BASE}/register`);
  89  |   await ss(page, '02-register');
  90  | 
  91  |   await go(page, '03-forgot-password', `${BASE}/forgot-password`);
  92  |   await ss(page, '03-forgot-password');
  93  | 
  94  |   // ── Login ──────────────────────────────────────────────────────────────────
  95  |   await login(page);
  96  |   await ss(page, '04-home');
  97  |   console.log('[NOTE] max-w-430px aplicado? →', await page.evaluate(() => {
  98  |     const el = document.querySelector('main')?.parentElement;
  99  |     return el ? window.getComputedStyle(el).maxWidth : 'n/a';
  100 |   }));
  101 | 
  102 |   // ── Telas autenticadas (todas com max-w-[430px]) ───────────────────────────
  103 | 
  104 |   // Home scroll completo
  105 |   await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  106 |   await page.waitForTimeout(300);
  107 |   await ss(page, '05-home-scroll');
  108 | 
  109 |   // Álbuns
  110 |   await go(page, '06-albums', `${BASE}/albums`);
  111 |   await ss(page, '06-albums');
  112 | 
  113 |   // Cadastro (/albums/novo)
  114 |   await go(page, '07-cadastro', `${BASE}/albums/novo`);
  115 |   await page.waitForSelector('[role="radio"]', { timeout: 12000 }).catch(() => {});
  116 |   await page.waitForTimeout(200);
  117 |   await ss(page, '07-cadastro');
  118 |   const temVariantes = await page.locator('[role="radio"]').count() > 0;
  119 |   if (temVariantes) {
  120 |     await page.locator('[role="radio"]').first().click();
  121 |     await page.waitForTimeout(200);
  122 |     await ss(page, '07b-cadastro-variante');
  123 |   }
  124 | 
  125 |   // Album detail/manage
  126 |   await go(page, '08-album-manage', `${BASE}/albums/${ALBUM_ID}`);
  127 |   await ss(page, '08-album-manage');
  128 | 
  129 |   // Album visualizar (grid de figurinhas) — pode ter muitas figurinhas, limitar scroll
  130 |   await go(page, '09-album-visualizar', `${BASE}/albums/${ALBUM_ID}/visualizar`);
  131 |   await page.waitForTimeout(800);
  132 |   await ss(page, '09-album-visualizar-topo');
  133 |   await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }));
  134 |   await page.waitForTimeout(400);
  135 |   await ss(page, '09b-album-visualizar-meio');
  136 | 
  137 |   // Abrir Pacotinhos (/abrir)
  138 |   await go(page, '10-abrir', `${BASE}/abrir`);
  139 |   await ss(page, '10-abrir-pacotinhos');
  140 | 
  141 |   // Colar Figurinhas (/colar?albumId=...)
  142 |   await go(page, '11-colar', `${BASE}/colar?albumId=${ALBUM_ID}`);
  143 |   await page.waitForTimeout(600);
  144 |   await ss(page, '11-colar');
  145 |   await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'instant' }));
  146 |   await page.waitForTimeout(300);
  147 |   await ss(page, '11b-colar-scroll');
  148 | 
  149 |   // Perfil
  150 |   await go(page, '12-perfil', `${BASE}/perfil`);
  151 |   await ss(page, '12-perfil');
  152 |   await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  153 |   await page.waitForTimeout(300);
  154 |   await ss(page, '12b-perfil-scroll');
  155 | 
  156 |   // Trocas
  157 |   await go(page, '13-trocas', `${BASE}/trocas`);
  158 |   await ss(page, '13-trocas');
  159 | 
  160 |   // ── Logout e tela pós-logout ──────────────────────────────────────────────
  161 |   const logoutBtn = page.locator('button[aria-label*="Sair" i]').first();
  162 |   if (await logoutBtn.isVisible().catch(() => false)) {
  163 |     await logoutBtn.click();
  164 |     await page.waitForLoadState('networkidle').catch(() => {});
  165 |     await page.waitForTimeout(500);
  166 |     await ss(page, '14-pos-logout');
  167 |     console.log(`[LOGOUT] → ${page.url()}`);
  168 |   }
```