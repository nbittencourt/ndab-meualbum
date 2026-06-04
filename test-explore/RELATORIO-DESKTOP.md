# Exploração Desktop 1440px — MeuAlbum
**Data:** 2026-06-03  
**Usuário de teste:** `explore_1780527207714@test.com`  
**Ambiente:** `http://localhost:5173` (dev local, viewport 1440×900)  
**Método:** Playwright headless Chromium, screenshots em `test-explore/screenshots-desktop/`

---

## Resumo Executivo

| Categoria | Total | Crítico | Médio | Baixo |
|---|---|---|---|---|
| Ausência de layout desktop | 1 | 1 | — | — |
| Inconsistências vs wireframe (agravadas em desktop) | 4 | 1 | 2 | 1 |
| Erros funcionais | 2 | 1 | 1 | — |
| Performance | 1 | — | 1 | — |

**Achado principal:** o aplicativo **não possui layout desktop**. Todas as telas autenticadas são confinadas a 430px de largura máxima — o mesmo limite do mobile — independentemente do viewport. Em 1440px, o resultado é uma coluna estreita centralizada com ~500px de área vazia de cada lado.

---

## 1. Ausência de Layout Desktop

### 🔴 DT-01 — Todas as telas autenticadas têm `max-w-[430px]` fixo em qualquer viewport
**Arquivo:** `client/src/App.tsx`, linha 104  
**Screenshot:** `04-home.png`, `06-albums.png`, `08-album-manage.png`

```tsx
// App.tsx:64 — determina se a rota usa bottom nav
const showBottomNav = BOTTOM_NAV_ROUTES.some((r) => location.pathname.startsWith(r));

// App.tsx:104 — container que envolve TODAS as páginas autenticadas
<div className={['flex flex-col min-h-dvh',
  showBottomNav ? 'max-w-[430px] mx-auto' : ''].join(' ')}>
```

`BOTTOM_NAV_ROUTES` inclui `/home`, `/albums`, `/abrir`, `/colar`, `/trocas`, `/perfil` — cobrindo todo o conjunto de telas autenticadas. A presença do usuário em qualquer dessas rotas aplica o cap de 430px ao container raiz.

**Confirmação em runtime:** avaliação JavaScript na página `/home` em viewport 1440px retornou:  
```
[NOTE] max-w-430px aplicado? → 430px
```

**Impacto:** Em desktop, o aplicativo apresenta uma coluna estreita de 430px centralizada em um fundo creme vazio. Usuários em notebooks/desktops veem ~500px de espaço desperdiçado de cada lado. Não existe breakpoint de adaptação.

**Telas públicas** (`/`, `/register`, `/forgot-password`) são full-width e renderizam corretamente em desktop — o problema afeta exclusivamente as rotas autenticadas.

**Recomendação:** Para uma solução mínima, remover o `max-w-[430px]` do container raiz e aplicar um layout de duas colunas (sidebar + conteúdo) a partir de `md:` ou `lg:`. O bottom nav pode ser substituído por uma sidebar em desktop.

---

## 2. Inconsistências vs Wireframe (agravadas em desktop)

### 🔴 DT-02 — FAB "+ Abrir" posicionado fora da coluna de conteúdo em desktop
**Tela:** Home (`/home`)  
**Screenshot:** `04-home.png`

Com a coluna de conteúdo limitada a 430px e o FAB posicionado como `fixed` ou `absolute` relativo ao viewport (não ao container), o botão flutuante "+ Abrir" aparece no canto inferior **direito da tela** — muito fora da área de conteúdo. Em mobile esse comportamento é aceitável; em desktop cria uma desconexão visual severa: o botão flutua sobre o espaço vazio, longe de qualquer conteúdo.

Essa é uma agravante do IC-01 reportado na exploração mobile.

---

### 🟡 DT-03 — Telas públicas usam largura total mas não têm layout desktop elaborado
**Telas:** Landing (`/`), Cadastro (`/register`), Recuperar Senha (`/forgot-password`)  
**Screenshots:** `01-landing.png`, `02-register.png`, `03-forgot-password.png`

As telas públicas corretamente não aplicam o cap de 430px e exibem conteúdo full-width em 1440px. Porém o design não foi adaptado para desktop — os formulários ficam enormemente esticados (inputs com ~1440px de largura). Não há `max-w-*` de conteúdo nem layout de duas colunas como sugerem os wireframes.

---

### 🟡 DT-04 — Grid de figurinhas (`/albums/:id/visualizar`) renderiza sem virtualização
**Tela:** Album Visualizar  
**Screenshots:** `09-album-visualizar-topo.png`, `09b-album-visualizar-meio.png`  
**Wireframe ref:** `CLAUDE.md` — "sticker catalog may have 600–700 entries; virtualize long lists (`@tanstack/virtual`)"

A tela de visualização do álbum renderiza todos os itens no DOM de uma vez. O screenshot `09-album-visualizar-topo.png` resultou em ~2.5MB (fullPage), indicando página muito longa. Com 600–700 figurinhas esse comportamento causa:
- Tempo de renderização inicial elevado
- Alto consumo de memória
- Scroll lento em dispositivos de médio desempenho

O CLAUDE.md especifica explicitamente o uso de `@tanstack/virtual` para listas longas.

---

### 🟢 DT-05 — Trocas continua placeholder em desktop
**Tela:** Trocas (`/trocas`)  
**Screenshot:** `13-trocas.png`

Em desktop, a tela "Em breve: gerencie suas trocas aqui." ocupa ainda menos da tela (coluna de 430px em 1440px de viewport), tornando o espaçamento vazio mais evidente. Sem estrutura de empty state.

---

## 3. Erros Funcionais

### 🔴 DT-FN-01 — Rota `/albums/cadastro` não existe
O script de exploração anterior (mobile) navegou para `/albums/cadastro`, que na realidade é capturado pelo matcher dinâmico `/albums/:id` e renderiza `AlbumManagePage` com o ID "cadastro" — resultando em "Álbum não encontrado." A rota correta é `/albums/novo`. O erro pode afetar deep-links de outras fontes.

**Rota correta:** `/albums/novo` → `CadastroAlbumPage`  
**Rota incorreta:** `/albums/cadastro` → AlbumManagePage (erro silencioso)

---

### 🟡 DT-FN-02 — Erros 401 em console nas telas públicas
**Screenshots:** `01-landing.png`, `02-register.png`

Ao navegar para telas públicas sem sessão ativa, o browser dispara requisições autenticadas (provavelmente pelo React Query tentando buscar dados do usuário) que retornam 401. Os erros aparecem no console do browser:

```
Failed to load resource: 401 (Unauthorized)  [http://localhost:5173/api/v1/auth/me]
```

O erro é esperado (usuário não autenticado), mas poderia ser suprimido ou tratado silenciosamente no cliente para não poluir o console e não gerar ruído em ferramentas de monitoramento como Sentry.

---

## 4. Tempos de Carregamento (Desktop, 2ª+ carga)

| Rota | Tempo | Status |
|---|---|---|
| `/` (Landing — warm cache) | **1 008 ms** | 🟡 Aceitável (1s) |
| Login submit (POST + redirect) | **506 ms** | ✅ OK |
| `/albums` | 551 ms | ✅ OK |
| `/albums/novo` | 554 ms | ✅ OK |
| `/albums/:id` (manage) | 577 ms | ✅ OK |
| `/albums/:id/visualizar` | 736 ms | ✅ OK |
| `/abrir` | 563 ms | ✅ OK |
| `/colar?albumId=...` | 566 ms | ✅ OK |
| `/perfil` | 567 ms | ✅ OK |
| `/trocas` | 552 ms | ✅ OK |

**Nota:** A landing em desktop exibiu 1.008ms (vs 3.688ms no mobile, primeira carga fria). A diferença é atribuída ao cache do browser entre as execuções. O problema de performance PT-01 (landing lenta na primeira carga) documentado no relatório mobile permanece válido para desktop.

---

## 5. Comparação Mobile vs Desktop

| Aspecto | Mobile (393px) | Desktop (1440px) |
|---|---|---|
| Telas públicas | Corretas | Corretas mas sem layout desktop |
| Telas autenticadas | Corretas (430px intencionais) | 430px cap — sem adaptação |
| FAB "+ Abrir" | Correto (sobre bottom nav) | Fora da coluna de conteúdo |
| Bottom nav | Visível, funcional | Visível mas deslocada visualmente |
| Grid de figurinhas | Sem virtualização | Sem virtualização (mais crítico: mais itens visíveis) |

---

## Anexos

| Arquivo | Descrição |
|---|---|
| `screenshots-desktop/01-landing.png` | Landing page — full-width, 1440px |
| `screenshots-desktop/02-register.png` | Tela de cadastro — full-width |
| `screenshots-desktop/03-forgot-password.png` | Recuperar senha — full-width |
| `screenshots-desktop/04-home.png` | Home após login — coluna 430px visível em 1440px |
| `screenshots-desktop/05-home-scroll.png` | Home scrollada até o rodapé |
| `screenshots-desktop/06-albums.png` | Lista de álbuns — coluna 430px |
| `screenshots-desktop/07-cadastro.png` | Cadastro de álbum — variantes carregando |
| `screenshots-desktop/07b-cadastro-variante.png` | Cadastro com variante selecionada |
| `screenshots-desktop/08-album-manage.png` | Gerenciar álbum |
| `screenshots-desktop/09-album-visualizar-topo.png` | Grid de figurinhas — topo |
| `screenshots-desktop/09b-album-visualizar-meio.png` | Grid de figurinhas — meio |
| `screenshots-desktop/10-abrir-pacotinhos.png` | Abrir Pacotinhos |
| `screenshots-desktop/11-colar.png` | Colar Figurinhas — topo |
| `screenshots-desktop/11b-colar-scroll.png` | Colar Figurinhas — scroll |
| `screenshots-desktop/12-perfil.png` | Perfil |
| `screenshots-desktop/12b-perfil-scroll.png` | Perfil — rodapé |
| `screenshots-desktop/13-trocas.png` | Trocas — placeholder |

---

## Prioridade de Correção

| ID | Problema | Esforço | Impacto |
|---|---|---|---|
| DT-01 | Ausência de layout desktop (max-w-430px) | Alto | Crítico |
| DT-02 | FAB fora da coluna de conteúdo | Baixo | Alto |
| DT-04 | Grid sem virtualização | Médio | Alto |
| DT-FN-01 | Rota `/albums/cadastro` inválida | Baixo | Médio |
| DT-03 | Formulários públicos sem layout desktop | Médio | Médio |
| DT-FN-02 | Erros 401 no console | Baixo | Baixo |
| DT-05 | Trocas placeholder | Alto | Médio |

---

*Gerado em 2026-06-03 por exploração automatizada (Playwright 1440px) + análise manual.*
