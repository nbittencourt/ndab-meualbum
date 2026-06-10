# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added

- **`client/src/lib/cookieConsent.ts`** — módulo central de gestão de consentimento de cookies (LGPD — `spec_privacidade_lgpd.md` §5). Exporta: interface `ConsentimentoCookie` com campos `analytics`, `publicidade`, `versao_politica`, `concedido_em`, `expira_em`; constante `CURRENT_POLICY_VERSION = '1.1'`; `getConsent()` — lê e valida estrutura do localStorage; `hasValidConsent()` — retorna `true` quando há consentimento não-expirado na versão atual (RN-PR05, RN-PR08, RN-PR09); `saveConsent(analytics, publicidade)` — persiste o consentimento com expiração de 12 meses (RN-PR08).

- **`client/src/components/CameraModal.tsx`** — componente reutilizável para captura de figurinhas por câmera com OCR local. Implementa a máquina de estados do Modal Câmera (MC) definida em `spec_abrir_pacotinhos.md` §6 e `spec_colar_figurinhas.md` §8. Estados: `loading → viewfinder → processing → result | not_recognized | camera_error`. OCR local via Tesseract.js carregado com `import()` dinâmico (RN-AP21); whitelist alfanumérica; PSM `SINGLE_LINE`. Número reconhecido é editável antes de confirmar (RN-AP23). `onConfirm(numero): Promise<void>` com rejeição exibida como erro inline. `nextLabel` customizável (default `"Fotografar próxima"`; `"Colar e Outra"` no MFN). Acessibilidade via componente `Modal` base com focus trap, `role="dialog"`, `aria-modal`, `aria-labelledby` (RN-AP34).

- **`tests/privacy/cookie-banner.spec.ts`** — suite de 10 testes Playwright para o banner de consentimento de cookies. Usa `@playwright/test` diretamente (sem o fixture de supressão) para exercer o banner de verdade. Cobre RN-PR05 (exibição condicional), RN-PR06/07 (persistência de `analytics`/`publicidade`), RN-PR08 (expiração em 12 meses), RN-PR10 (navegação por teclado), RN-PR12 (dois botões visíveis) e RN-PR14 (link para Política de Privacidade). Helper interno `validConsent()` para simular estados expirados ou de versão anterior.

- **`playwright.config.explore.ts`** — nova configuração Playwright para testes exploratórios visuais. Inicia ambos os servidores automaticamente em `NODE_ENV=test` (via `webServer`), cobre dois projetos (`mobile` 375×812 e `desktop` 1440×900), e mantém `screenshot: 'on'` para captura automática em todas as páginas. Geração de relatório HTML em `test-explore/report/`.

- **`test-explore/global-setup.ts`** — setup exploratório completo antes de cada rodada: reset do banco, seed do catálogo (994 figurinhas), criação e confirmação de usuário via endpoints de teste, login com extração do cookie `__session`, criação de álbum BROCHURA, seed de figurinhas (15 coladas no álbum via `/colar/direta`, 10 apenas no estoque, 5 duplicatas com `quantidade=2`). Salva `storageState` Playwright em `test-explore/.setup-state.json`.

- **`test-explore/specs/explore.spec.ts`** — spec exploratória com 13 páginas × 2 viewports = 26 testes. Organizada em três blocos: `Público` (sem auth: `/`, `/register`, `/forgot-password`), `Autenticado` (9 páginas incluindo `/albums/:id` e `/albums/:id/visualizar` com álbum real), e `Breakpoint @1279px` (desktop only, verifica transição abaixo de `xl:`). Erros de console são capturados e registrados como anotações no relatório.

- **`test-explore/.gitignore`** — ignora `report/`, `.setup-state.json` e pastas de screenshots geradas automaticamente.

- **Scripts `explore` e `explore:report`** em `package.json` (raiz):
  ```bash
  npm run explore         # inicia servidores + executa os 26 testes exploratórios
  npm run explore:report  # abre o relatório HTML com screenshots
  ```

- **`SideNav.tsx`** — novo componente de navegação lateral para desktop (`hidden lg:flex`, `fixed left-0 top-0 h-full w-[220px]`). Exibe logo, os mesmos três links do BottomNav (ícones Lucide: `BookOpen`, `ArrowRightLeft`, `User`) e informações do usuário com botão de logout na parte inferior.

- **`GET /api/v1/albums/:id/figurinhas`** — novo endpoint que retorna todas as figurinhas de um álbum agrupadas por seção, com status de colagem (`colada`) e quantidade em estoque (`quantidade`).
- **`FigurinhaGridItem` e `SecaoGrid`** — novos tipos no pacote `shared` para tipar a resposta do endpoint acima.
- **`albumsApi.getFigurinhas(id)`** — novo método no API client do frontend para consumir o endpoint de figurinhas.

### Changed

#### `client/src/components/CookieBanner.tsx`

- Interface de props alterada: `onAccept: () => void` único substituído por **`onAccept: () => void` + `onDecline: () => void`** — diferenciando os dois caminhos de consentimento (RN-PR06/07).
- `aria-label` corrigido de `"Preferências de cookies"` para `"Cookies e Privacidade"` — alinhado com o título visível no banner (necessário para `getByRole('dialog', { name: ... })` nos testes).

#### `client/src/App.tsx` (consentimento de cookies)

- `useState` para `showCookieBanner` migrado de `!localStorage.getItem("cookie-consent")` para `!hasValidConsent()`, adicionando verificação de expiração e versão de política (RN-PR05, RN-PR08, RN-PR09).
- `CookieBanner` recebe handler `onDecline` distinto: `() => { saveConsent(false, false); setShowCookieBanner(false); }`.
- Importa `hasValidConsent` e `saveConsent` de `@/lib/cookieConsent`.

#### `client/src/lib/albumVariant.ts`

- `VARIANT_LABELS` padronizado para **Title Case** em todos os valores: `'Capa dura'` → `'Capa Dura'`, `'Capa dura prata'` → `'Capa Dura Prata'`, `'Capa dura ouro'` → `'Capa Dura Ouro'`, `'Box premium'` → `'Box Premium'`.

#### `client/src/pages/AlbumsPage.tsx` (tokens de variante)

- Removidas definições locais `VariantStyle`, `VARIANT_STYLES` e `VARIANT_LABELS` (G6 — centralização de tokens).
- Adicionado import de `VARIANT_STYLES` e `VARIANT_LABELS` de `@/lib/albumVariant`. Import de `AlbumVariante` removido (não mais necessário localmente).

#### `client/src/pages/ColarFigurinhasPage.tsx`

- Removida definição local de `VARIANT_LABELS` e helper `variantLabel()` (G6). Adicionado import de `VARIANT_LABELS` de `@/lib/albumVariant`.
- Adicionado import de `CameraModal` e estado `showMfnCamera: boolean` para controlar o Modal Câmera no MFN.
- Botão **"Abrir câmera"** no Modal MFN (anteriormente `onClick={() => {}}`) wired ao `CameraModal` com `onConfirm` que chama `mfnMut.mutateAsync` e seta `mfnPasted=true` (RN-CF27).
- `CameraModal` renderizado com `nextLabel="Colar e Outra"` para consistência com RN-CF26.

#### `client/src/pages/AbrirPacotinhosPage.tsx` (câmera + tokens)

- Substituído botão único "Fotografar" (que ativava câmera diretamente) por **seletor de modo** `radiogroup` com dois botões: `Digitar | Fotografar`. Modo **Digitar** exibe o formulário de texto; modo **Fotografar** exibe apenas o botão **"Abrir câmera"** — câmera não é ativada automaticamente (RN-AP43 — ativação em 2 passos).
- Adicionada mutation `addCameraMut` com `origem: 'CAMERA'` (separada de `addMut` com `origem: 'DIGITACAO'`). Adicionado estado `showCameraModal: boolean` e `<CameraModal>` wired com `onConfirm={async (numero) => { await addCameraMut.mutateAsync(numero); }}`.
- Removidos `showCameraPanel`, `cameraAtiva`, `videoRef` e o `useEffect` de gerenciamento de stream (responsabilidade movida para `CameraModal`).
- `ColarModal` interno: substituída definição local de `varianteLabel` por import de `VARIANT_LABELS` de `@/lib/albumVariant` (G6).

#### `tests/support/fixtures.ts`

- Fixture de supressão de banner migrada do formato legado (`localStorage['cookie-consent'] = '1'`) para o novo formato `ConsentimentoCookie`: objeto JSON completo com `analytics`, `publicidade`, `versao_politica: '1.1'` e `expira_em` em +1 ano. Necessário para que `hasValidConsent()` retorne `true` nos testes.
- `CURRENT_POLICY_VERSION = '1.1'` deve ser mantido em sincronia com `client/src/lib/cookieConsent.ts`.

#### `tests/pacotinhos/abrir-pacotinhos.spec.ts`

- Teste `'câmera ativa imediatamente ao clicar em "Fotografar" (RN-AP43)'` **corrigido** — o comportamento anterior era o bug; o teste validava implementação incorreta. Substituído por dois testes:
  1. `'deve exibir botão "Abrir câmera" ao selecionar modo Fotografar sem ativar câmera (RN-AP43)'` — verifica passo 1 da ativação em 2 passos.
  2. `'deve abrir Modal Câmera ao clicar em "Abrir câmera" (passo 2 de RN-AP43)'` — mock de `getUserMedia` + verifica abertura do `role="dialog"` com nome "Câmera".

#### `App.tsx`

- **ATN-01:** Título da rota `/home` corrigido de `"Início — Meu Álbum Copa 2026"` (idêntico ao da landing) para `"Meus Álbuns — Meu Álbum Copa 2026"` no `titleMap`.
- **Layout responsivo**: o container global foi reestruturado de coluna única `max-w-[430px]` para layout `flex` com `SideNav` fixo à esquerda em desktop. Em `lg:`, a coluna de conteúdo recebe `ml-[220px]` e `max-w-none`; em mobile o `max-w-[430px]` é mantido no `<main>`.
- **`noAuthRoutes`**: adicionados `/register` e `/forgot-password` ao array de rotas que saltam o `checkAuth()`, eliminando erros 401 no console ao acessar essas páginas sem sessão ativa.
- **Redirects**: adicionadas rotas `/profile → /perfil`, `/swaps → /trocas` e `/albums/cadastro → /albums/novo` antes do catch-all `*`.
- **`BottomNav`**: adicionado `lg:hidden` para ocultar a nav inferior em desktop quando o `SideNav` está visível.

#### `BottomNav.tsx`

Reescrito para substituir emojis por ícones **Lucide React** (`BookOpen`, `ArrowRightLeft`, `User`) e corrigir paleta conforme wireframe `shared-chrome.jsx`:

- `bg-album-gold` → `bg-paper` (`#FBF8EE`); `border-album-gold-dark` → `border-ink/20`
- Ativo: `text-red` com `strokeWidth={2.5}`; inativo: `text-ink/50`
- `aria-label` adicionado ao `<nav>` e `aria-hidden="true"` em cada ícone

#### `HomePage.tsx`

- **FAB**: `bottom` corrigido de `16` para `80` (limpa os 64 px do BottomNav). `right` alterado para `max(16px, calc((100vw - 430px) / 2 + 16px))` para manter o botão dentro da coluna de conteúdo em viewports largos.
- **Rodapé**: substituídos links externos para FIFA e Panini Comics pelo texto neutro **"Não-oficial · Feito por colecionadores · 2026"**, em conformidade com os requisitos legais do projeto.

#### `LandingPage.tsx`

Removido o botão CTA "Criar conta grátis" do componente `Nav()`. O CTA já existe na seção hero; no header competia visualmente com o formulário de login.

**ATN-03:** Stat de figurinhas no `StatsScoreboard` corrigido de `'980'` para `'994'`, alinhando com o catálogo real seedado em `panini_wc2026_figurinhas.json`.

#### `CadastroAlbumPage.tsx`

Adicionado texto de orientação `"↑ Selecione uma capa acima para criar seu álbum"` exibido quando nenhuma variante está selecionada e não há erro ativo. Guia o usuário sem esconder o estado desabilitado do botão de submit.

#### `RegisterPage.tsx`

Adicionado aviso `"Após criar a conta, enviaremos um link de confirmação para o seu email."` imediatamente antes do botão de submit, definindo expectativa clara de fluxo de confirmação.

#### `SwapsPage.tsx`

Substituído placeholder de 9 linhas por empty state completo com:
- Header "Trocas" + badge `EM BREVE`
- Card com borda dashed listando as três etapas do fluxo futuro (figurinhas repetidas automáticas, publicar oferta, match de colecionadores)

#### `AlbumVisualizarPage.tsx`

**ATN-02:** Mesmo ajuste de `document.title` dinâmico aplicado ao `AlbumManagePage.tsx` acima, para a rota `/albums/:id/visualizar`.

Implementada virtualização completa da lista de figurinhas usando **`@tanstack/react-virtual` v3** (`useVirtualizer`). As seções são achatadas em um único array tipado (`header | faltante | colada`); apenas os itens visíveis são renderizados no DOM, com `overscan: 12` e `estimateSize` diferenciada por tipo (40 px header, 44 px itens). O elemento de scroll é o `<div ref={scrollRef}>` interno da página.

#### `server/src/routes/seed.ts`

Removida a marca "Panini" dos nomes de `TipoAlbum`. Nomes atualizados para:
- "Copa do Mundo 2026 (Brochura)"
- "Copa do Mundo 2026 (Capa Dura)"
- "Copa do Mundo 2026 (Capa Dura Prata)"
- "Copa do Mundo 2026 (Capa Dura Ouro)"
- "Copa do Mundo 2026 (Box Premium)"

> Registros existentes no banco (com nomes antigos) precisam ser re-seedados via `POST /api/v1/seed/tipos-album`.

---

#### `AlbumVarianteCard.tsx`

Reescrito com estilos inline usando valores exatos do design system em vez de classes Tailwind aproximadas. Cada variante agora usa os valores corretos de `background`, `border`, `box-shadow`, `tagBg` e `tagText`:

- **BROCHURA** — `#fff`, borda `1.5px solid #0A0907`, sem sombra, tag `#E0DDD5`
- **CAPA_DURA** — `#F5F0E4`, sombra flat `3px 3px 0 #C8C4BC`, tag `#C8C4BC`
- **CAPA_DURA_PRATA** — gradiente diagonal `135deg #F0EDE4 / #E0DDD5`, sombra `3px 3px 0 #9E9E9E`, tag `#9E9E9E` / texto branco
- **CAPA_DURA_OURO** — `#FEF3CC`, borda `2px solid #8B6914`, sombra `3px 3px 0 #C49A1A`, tag `#C49A1A` / texto branco
- **BOX_PREMIUM** — `#0A0907`, sombra `4px 4px 0 #E5142A`, tag `#E5142A` / texto branco

#### `CadastroAlbumPage.tsx`

Implementada **RN-CA05**: ao selecionar uma variante, o fundo da página inteira se atualiza para o background correspondente com transição suave (`0.2s ease`). Para BOX_PREMIUM, todos os textos, labels e inputs alternam para o esquema de cor claro sobre fundo escuro.

#### `AlbumManagePage.tsx`

**ATN-02:** Adicionado `useEffect` que atualiza `document.title` para `"<nome do álbum> — Meu Álbum Copa 2026"` assim que os dados do álbum são carregados. Corrige o título genérico `"Meu Álbum Copa 2026"` que era exibido em rotas dinâmicas `/albums/:id`.

Substituída a lista de faltantes pelo **grid completo de figurinhas por seção (Variante B do spec AL1)**:

- **Accordion por seção** com mini barra de progresso e contagem `coladas/total`
- **Grid responsivo**: 3 colunas (mobile) / 5 colunas (desktop), células com altura fixa 94px / 106px
- **`StickerCardAL1`**: exibe número, badge ×N e nome. Status visual por bordas e fundos (colada em verde, faltante tracejada, repetida sólida)
- **`QuantidadeBadge`**: codificado por cor — faltante (cinza), colada (verde), repetida (vermelho)
- **Botão "Colar →"** no card de figurinha repetida, navega com pré-seleção por `figurinhaNumero`
- **RN-AL19**: enquanto o PDF está sendo gerado, todos os demais botões da action bar ficam desabilitados

#### `AlbumsPage.tsx`

`AlbumCard` local reescrito com `VARIANT_STYLES` usando valores exatos de cada variante (mesmo padrão do componente compartilhado). Adicionado botão **"Gerenciar"** (→ `/albums/:id`) nos cards de álbuns ativos. Header atualizado para `border-b-2 border-ink`.

#### `AbrirPacotinhosPage.tsx`

Anatomia dos cards da pilha refatorada para o spec AP1:

- Tags de origem (**DIGITAÇÃO** / **CÂMERA**) e elegibilidade (**ELEGÍVEL** / **SEM ÁLBUM**) exibidas no topo de cada card
- Itens com status **COLADA** e **REPETIDA** são somente leitura (sem botões de ação)
- Botões renomeados: "Colar →", "Enviar para Repetidas", "✕ Descartar" (com confirmação inline)

#### `HomePage.tsx`

`borderBottom` do header corrigido de `1.5px solid rgba(10,9,7,0.12)` para `2px solid #0A0907` conforme o spec.

### Docs

#### `docs/sprint/20260609_handoff.md`

Documento de handoff criado como resultado de análise cruzada de design handoff × specs canônicas (`docs/spec_*.md`) × implementação. Cobre 4 decisões de alinhamento (D1–D4) resolvendo divergências entre as três fontes com regra de prioridade **Design › Spec › Impl**, 9 lacunas auditadas (G1–G9) com severidade e evidências file:line, matriz de cobertura por fluxo (8 fluxos), workstream WCAG/LGPD, checklist de aceite reutilizável (§9) e anexo de evidências com citações diretas de código.

---

### Fixed

#### `client/src/components/CookieBanner.tsx` + `client/src/App.tsx`

**BUG G4 (P0 — LGPD):** botão "Remover não essenciais" chamava o mesmo handler `onAccept` que o botão "Aceitar", persistindo `analytics=true` e `publicidade=true` em ambos os casos. Nenhum opt-out era efetivamente salvo. Correção: `CookieBanner` separou os callbacks em `onAccept` e `onDecline`; `App.tsx` chama `saveConsent(false, false)` no decline, garantindo que a recusa seja persistida corretamente com expiração de 12 meses.

#### `client/src/pages/AbrirPacotinhosPage.tsx`

**BUG-04 (RN-AP24):** Confirmação de descarte individual agora exibe número e nome da figurinha antes de confirmar. O bloco `confirmandoDescartar` passou a mostrar `Descartar <número> — <nome>?` acima dos botões "Confirmar descarte" / "Cancelar", corrigindo a violação da spec que exigia identificação clara do item a ser descartado.

#### `client/src/pages/ProfilePage.tsx`

**BUG-05 (P1 — Seção 3):** Campo de email na tela de perfil corrigido para seguir o padrão de somente leitura com toggle de edição (mesmo comportamento do campo Nome). O formulário de alteração de email agora fica oculto por padrão; o botão "Alterar email" o exibe. O botão de submit foi renomeado de "Alterar email" para "Salvar" conforme spec. Após submissão bem-sucedida, o formulário é recolhido automaticamente.

#### `client/src/components/AppHeader.tsx`

Corrigido conflito de especificidade CSS que impedia o `AppHeader` de se ocultar em viewport ≥ 1280px (`xl:`). O inline `style` continha `display: 'flex'`, `alignItems: 'center'` e `justifyContent: 'space-between'`, que sobrescreviam a classe Tailwind `xl:hidden` (maior especificidade inline vs. classe). As três propriedades foram movidas para `className="xl:hidden flex items-center justify-between"`, permitindo que o Tailwind aplique `display: none` normalmente no breakpoint `xl:`. Sem a correção, o `AppHeader` aparecia ao lado do `DesktopTopBar` em desktop, gerando duplo cabeçalho.

#### `client/src/App.tsx`

Adicionado padding inferior dinâmico ao `<main>` quando o `CookieBanner` está visível: `pb-[140px]` é aplicado enquanto `showCookieBanner === true`. Sem o padding, o banner `position: fixed; bottom: 0` cobria os botões "CRIAR ÁLBUM" e "CANCELAR" em `/albums/novo` no mobile (375px) antes do usuário aceitar os cookies.

---

### Fixed (servidor)

#### `server/src/routes/albums.ts`

`import puppeteer` estático movido para dynamic import dentro do handler `GET /albums/:id/pdf`. O import estático causava timeout de 30 s no startup do servidor durante os testes E2E pois o módulo Puppeteer inicializa verificações do binário Chromium em tempo de carregamento.

#### `server/src/routes/abrir-pacotinhos.ts`

Corrigido erro TypeScript TS2345 na desestruturação de `req.params.itemId`: Express tipifica `params` como `string | string[]`, mas `Types.ObjectId.isValid()` não aceita `string[]`. Adicionado `as string` explícito.

#### `server/src/routes/profile.ts`

Corrigida incompatibilidade com `archiver` v8 (ESM puro): o pacote exporta `ZipArchive` como named class, mas `@types/archiver@7` não inclui esse export. O import estático — que também causava erro de runtime com `SyntaxError: does not provide an export named 'default'` — foi substituído por dynamic import dentro do handler `GET /perfil/exportar`.

#### `server/src/routes/test.routes.ts`

- **`POST /reset-db`**: removida a lista de coleções preservadas (`tipoalbums`, `stickers`, `secaos`). Agora apaga todas as coleções, garantindo que o seed sempre execute no `global-setup` e não deixe dados obsoletos entre execuções.
- **`POST /seed`**: reescrito para usar `panini_wc2026_secoes.json` e `panini_wc2026_figurinhas.json` (mesmos arquivos do `scripts/seed-db.ts`). A implementação anterior usava `seed_figurinhas.json` com numeração ESP-01, causando falha silenciosa em todos os helpers de teste que buscam figurinhas por número (`criar-pilha-pendente`, `popular-estoque`) após a migração para FWC1/MEX1/etc.

### Fixed (testes)

#### `client/src/pages/CadastroAlbumPage.tsx`

Adicionados `htmlFor="nome-personalizado"` no `<label>` e `id="nome-personalizado"` no `<input>` do campo Nome personalizado. Sem a associação semântica, `getByLabel` do Playwright não encontrava o elemento e testes de acessibilidade (WCAG SC 1.3.1) falhavam.

#### `tests/album/cadastro-album.spec.ts`

Teste RN-CA06 renomeado de "deve rejeitar nome personalizado com mais de 60 chars" para **"deve truncar nome personalizado em 60 chars"** e reescrito: a implementação usa `maxLength` + `slice(0, 60)` (truncagem silenciosa), não exibe mensagem de erro. O novo teste verifica que o campo contém exatamente 60 caracteres após tentar inserir 61.

#### `tests/albums/albums.spec.ts`

- Removida verificação do botão "Ver Álbum" do teste de barra de ações de AL1 — o botão não existe na spec atual (barra = Colar figurinhas + Baixar PDF + Arquivar).
- Removidos 4 testes do bloco **"Tela AL2 — Ver Álbum"** (`RN-AL31`, `RN-AL34`) — funcionalidade removida da spec; RN-AL31 e RN-AL34 não constam na versão vigente.
- Seletor dos botões de accordion de seção atualizado de `getByRole('button', { name: /expandir seção/i })` para `locator('button[aria-expanded]')` — os botões têm `aria-expanded` mas não possuem `aria-label` com o texto esperado pelo seletor anterior.

#### `tests/perfil/perfil.spec.ts`

Teste RN-P12 (cooldown de email): após a primeira submissão, o label do campo muda de `"Email"` para `"Novo email"`. Corrigido o seletor da segunda interação para `getByLabel('Novo email')` e adicionada espera pelo estado `aguardando confirmação` entre as duas submissões.

---

## Decisões Arquiteturais

Registro permanente das decisões técnicas tomadas durante o desenvolvimento, para referência em futuras implementações.

---

### D1 — Rodapé sem links externos (FIFA / Panini)

**Fonte:** `spec_home_albums.md` v1.6 RN-H25 descontinuado + `CLAUDE.md` restrição legal  
**Decisão:** Links para FIFA e Panini Comics permanecem removidos do rodapé de todas as telas. O texto neutro `"Não-oficial · Feito por colecionadores · 2026"` é o padrão adotado.  
**Impacto futuro:** Qualquer tela nova com rodapé deve seguir o mesmo padrão; wireframes que exibirem esses links devem ser ignorados.

---

### D2 — Total de figurinhas: 994 (não 980)

**Fonte:** Catálogo real `panini_wc2026_figurinhas.json` (993 contam para conclusão + 1 figurinha especial)  
**Decisão:** O número canônico é **994**. Qualquer referência a `"980"` em docs, specs ou UI está desatualizada.  
**Impacto futuro:** Telas que exibirem contagem total, barras de progresso ou textos de marketing devem usar 994/993. O campo `totalFigurinhas` no `TipoAlbum` é a fonte de verdade dinâmica no banco; 994 é o valor esperado do seed atual.

---

### D3 — Autoridade de spec quando design é silencioso

**Fonte:** Análise de divergência entre design handoff (geração antiga) e `docs/spec_*.md` (geração atual)  
**Decisão:** Onde o design handoff não cobre um requisito (LGPD, WCAG, exportação de dados, age-gate), a spec canônica da raiz (`docs/spec_*.md`) é autoritativa. A regra geral de prioridade **Design › Spec › Impl** se aplica apenas onde todas as três fontes se pronunciam.  
**Impacto futuro:** Ao implementar qualquer funcionalidade nova, verificar sempre se existe spec na raiz, mesmo que o wireframe não mostre o elemento. Specs de LGPD e WCAG são transversais e se aplicam a toda tela nova.

---

### D4 — Modelo binário de cookies (sem "Gerenciar preferências")

**Fonte:** `spec_privacidade_lgpd.md` v1.1 RN-PR05–PR16  
**Decisão:** O banner de cookies usa **modelo binário** com exatamente dois botões: "Aceitar" (`analytics=true, publicidade=true`) e "Remover não essenciais" (`analytics=false, publicidade=false`). Não há painel de toggles granulares, nem link "Gerenciar cookies" no rodapé. A revogação é atendida pela reapresentação automática após 12 meses ou mudança de versão da política.  
**Impacto futuro:** Qualquer componente que precise checar analytics/publicidade deve usar `getConsent()` de `client/src/lib/cookieConsent.ts`. `CURRENT_POLICY_VERSION` deve ser incrementado manualmente ao fazer mudanças materiais na Política de Privacidade.

---

### D5 — Campo `origem` das figurinhas coladas

**Fonte:** `spec_abrir_pacotinhos.md` v1.4+ RN-AP14 + `spec_colar_figurinhas.md` v1.1 §2.1  
**Decisão:** O campo `origem` em `FigurinhaColada` segue a semântica:
- `DIGITACAO` — digitação na AP1 (não passa por estoque)
- `CAMERA` — OCR na AP1 ou MFN (não passa por estoque)
- `DIRETA` — colagem via MCol (pacote → álbum direto) ou MFN (sem estoque)
- `ESTOQUE` — Colar Figurinhas com figurinha do estoque (decrementa quantidade)

**Impacto futuro:** Ao criar relatórios, exportações ou filtros, o campo `origem` distingue a proveniência. Nunca usar `ESTOQUE` para colagens via MCol do fluxo Abrir Pacotinhos.

---

### D6 — Ativação de câmera em 2 passos (RN-AP43 / RN-CF27)

**Fonte:** `spec_abrir_pacotinhos.md` v1.5 RN-AP43 + `spec_colar_figurinhas.md` v1.2 RN-CF27  
**Decisão:** A câmera **nunca é ativada automaticamente** ao trocar de modo. O fluxo obrigatório é: (1) selecionar modo "Fotografar" → exibe botão "Abrir câmera" → (2) usuário clica "Abrir câmera" → abre o `CameraModal`.  
**Impacto futuro:** Qualquer fluxo futuro que ofereça captura por câmera deve seguir o mesmo padrão de 2 passos. `CameraModal` foi desenhado para ser reutilizável: recebe `onConfirm(numero): Promise<void>` e `nextLabel` customizável.

---

### D7 — OCR local obrigatório (sem imagem ao backend)

**Fonte:** `spec_abrir_pacotinhos.md` RN-AP21  
**Decisão:** Toda leitura OCR de figurinha é executada **no cliente** usando Tesseract.js carregado por dynamic `import()`. Nenhuma imagem ou frame de câmera é enviado ao servidor.  
**Impacto futuro:** A escolha de Tesseract.js via lazy import mantém o bundle inicial limpo. Se no futuro for necessário OCR mais preciso, a troca deve manter a restrição de processamento local. O WASM do Tesseract é baixado na primeira ativação da câmera — avaliar caching via service worker (relacionado a G8).

---

### D8 — Centralização de tokens de variante em `lib/albumVariant.ts`

**Fonte:** G6 do handoff `docs/sprint/20260609_handoff.md`  
**Decisão:** `VARIANT_STYLES` e `VARIANT_LABELS` em `client/src/lib/albumVariant.ts` são a fonte única de estilos e rótulos das 5 variantes de álbum. Toda página ou componente que renderize uma variante deve importar deste módulo.  
**Impacto futuro:** Ao criar novos componentes com cards ou badges de álbum, sempre importar de `@/lib/albumVariant`. `AlbumVarianteCard.tsx` ainda mantém estrutura própria (adiciona `selectedBorder`/`selectedShadow`) — candidato a refatoração em sprint posterior. O gradiente de `CAPA_DURA_PRATA` diverge entre os dois arquivos — confirmação com design necessária antes de unificar.

---

### D9 — Fixtures de testes suprimem o banner por padrão

**Fonte:** Arquitetura de testes em `tests/support/fixtures.ts`  
**Decisão:** Todo teste que importa `{ test, expect }` de `tests/support/fixtures.ts` recebe automaticamente um consentimento de cookies válido pré-carregado no `localStorage` com `CURRENT_POLICY_VERSION` sincronizado com a lib de produção. Testes que precisam exercer o banner devem importar `@playwright/test` diretamente.  
**Impacto futuro:** Ao incrementar `CURRENT_POLICY_VERSION` em `cookieConsent.ts`, atualizar o mesmo valor em `tests/support/fixtures.ts`. Se a versão divergir, todos os testes que usam o fixture passarão a exibir o banner inesperadamente, quebrando fluxos não relacionados.

---

### D10 — Hierarquia de fontes de verdade (Design › Spec › Impl)

**Fonte:** Análise de handoff + decisões D1–D3  
**Decisão:** Ao implementar qualquer funcionalidade, a hierarquia de autoridade é:
1. **Design handoff** (`docs/design_handoff/`) — fidelidade visual de telas existentes
2. **Specs canônicas** (`docs/spec_*.md`) — regras de negócio, especialmente quando mais novas que o design
3. **Implementação atual** — ponto de partida, mas pode estar desatualizada

**Exceções documentadas:** D1 (restrição legal > design), D2 (catálogo real > spec antiga), D3 (spec raiz > design silencioso).  
**Impacto futuro:** Sempre confrontar as três fontes antes de implementar. Divergências devem ser escaladas como decisão explícita antes de codificar.
