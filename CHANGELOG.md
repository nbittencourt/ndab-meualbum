# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added

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

### Fixed

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
