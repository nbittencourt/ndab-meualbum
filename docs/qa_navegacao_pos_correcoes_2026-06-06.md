# Relatório de QA Pós-Correções — MeuAlbum Copa 2026

**Data:** 2026-06-06
**Usuário:** test@user.com / Test3Senh@ (recriado)
**Ferramenta:** Playwright MCP (headless)
**Viewports testados:** Mobile 390×844 · Desktop 1280×800
**Base de referência:** [`docs/qa_navegacao_2026-06-05.md`](qa_navegacao_2026-06-05.md)
**Mudanças validadas:** ver lista de fixes do dia 2026-06-06

---

## Resumo Executivo

| Status | Quantidade |
|---|---|
| ✅ Corrigido e validado | 9 |
| ⚠️ Correção parcial / regressão | 1 (BUG-02) |
| 🆕 Novo bug encontrado | 2 (BUG-12, BUG-13) |
| 🆕 Bugs desktop ≥1280px adicionais validados | 2 (BUG-14, BUG-15) |

---

## ✅ Bugs Corrigidos (validados nesta navegação)

| Bug | Tela | Resultado da validação |
|---|---|---|
| **BUG-03** Pilha persistente | `/abrir` | Card FWC1 mantém status "COLADA" e card FWC2 mantém "REPETIDA" na pilha como somente leitura após mutação — conforme RN-AP15. ✓ |
| **BUG-04** Botão "Ver Álbum" | AL1 (`/albums/:id`) | Botão "Ver Álbum" presente na action bar; ao clicar navega para `/albums/:id/visualizar`. ✓ |
| **BUG-05** Footer "Gerenciar cookies" | Footer global | Elemento agora é `<button>` (não `<a>`); ao clicar dispara `CustomEvent('abrir-cookie-banner')`. ✓ (mas ver BUG-12) |
| **BUG-06** FAB sobre conteúdo | `/home` | `paddingBottom` aumentado para 112; conteúdo de "Figurinhas Repetidas" passa a ser rolável até ficar livre do FAB. ✓ |
| **BUG-07** Links FIFA/Panini | Landing `/` | Footer da landing sem links externos `fifaworld.cup` / `paninicomics.com.br`. ✓ |
| **BUG-08** Texto de arquivamento | AL1 modal arquivar | Texto "Arquivar este álbum? Ele ficará oculto das listas principais e não poderá receber novas colagens enquanto arquivado." renderizado acima dos botões. ✓ |
| **BUG-09** Seção expandida só faltantes | AL1 expandida | Seção "Página Inicial" (1/9) exibe apenas 8 figurinhas faltantes; mensagem "✓ Seção completa" prevista para 100%. ✓ |
| **BUG-10** Link "Esqueci minha senha" | Perfil `/perfil` | Link `<a href="/forgot-password">` presente abaixo do campo "Senha atual". ✓ |
| **BUG-11** MFN — botões dinâmicos | Colar > MFN | Estado inicial mostra **"Confirmar"/"Cancelar"**; após paste bem-sucedido troca para **"Colar e Outra"/"Fechar"**. Conforme spec seção 6.1. ✓ |
| **OBS-01** Texto identificador | Perfil — seção Identificador | Texto agora diz "Este código é público e identifica você na plataforma." ✓ |
| **OBS-02** Progressbar Home | Home card de álbum | `role="progressbar"` + `aria-valuenow="0"` + `aria-valuetext="0.0% concluído"` + `aria-valuemin/max` aplicados. ✓ |

---

## ⚠️ Correção Parcial — BUG-02 (Layout desktop)

**Tela:** `/albums`, `/abrir`, `/colar`, `/perfil`, `/albums/{id}` no viewport ≥ 1024px (testado em 1280×800)
**Comportamento atual:** A sidebar aparece em 1280px (`hidden lg:flex` funcionando — `lg:flex` é gerado pelo Tailwind), mas o **conteúdo principal continua sob a sidebar**, sobreposto.

**Causa raiz (descoberta nesta validação):**
A classe `lg:pl-[228px]` está colada à interpolação `${...}` no template literal de `client/src/App.tsx:103`:

```tsx
<main id="main" className={`flex-1 overflow-y-auto lg:pl-[228px]${showCookieBanner ? ' pb-[140px]' : ''}`}>
```

Tailwind v4 **não gera** o utilitário `.lg\:pl-\[228px\]` no CSS — provavelmente porque o scanner de conteúdo trata `lg:pl-[228px]${showCookieBanner` como um único token inválido. Verifiquei o stylesheet: a única regra com `228px` ou `pl-[…]` ausente, enquanto `pb-[140px]` (delimitada por espaço dentro de string literal) é gerada normalmente.

**Evidência:**
- `getComputedStyle(main).paddingLeft === "0px"` mesmo com viewport 1280
- Pesquisa no `document.styleSheets` por "228" não retorna nada
- Screenshot `v2_desktop_albums_BUG02_persiste.png` mostra card "...AR FIGURINHAS" — texto "COLAR FIGURINHAS" cortado atrás da sidebar
- O mesmo problema existia com `xl:pl-[228px]` na versão original — o fix de breakpoint não resolve a causa raiz

**Sugestão de correção (não aplicada — aguardando aprovação):**

```tsx
<main
  id="main"
  className={`flex-1 overflow-y-auto lg:pl-[228px] ${showCookieBanner ? 'pb-[140px]' : ''}`}
>
```

(adicionar **espaço** antes de `${...}` para que o scanner reconheça `lg:pl-[228px]` como classe completa).

**Severidade:** 🔴 Crítico — bloqueia uso do app em desktop.

---

## 🆕 BUG-12 — Botão "Gerenciar cookies" não reabre painel

**Telas afetadas:** Footer (todas as páginas autenticadas) + Perfil seção "Privacidade e Dados"
**Comportamento:** Tanto o botão do footer (recém-corrigido em BUG-05) quanto o botão pré-existente em ProfilePage disparam `document.dispatchEvent(new CustomEvent('abrir-cookie-banner'))`, mas **nenhum componente escuta esse evento**. O painel de cookies não reabre.
**Causa raiz:** `client/src/App.tsx` mantém `showCookieBanner` em state local com `setShowCookieBanner` mas não há `document.addEventListener('abrir-cookie-banner', ...)` em nenhum `useEffect`.
**Spec violada:** spec_privacidade_lgpd RN-PR16 — "link 'Gerenciar cookies' (reabre painel de preferências de cookies)".

**✅ Solução aprovada (2026-06-06):** **Remover** o botão "Gerenciar cookies" (footer + Perfil) e o botão "Gerenciar preferências" do `CookieBanner`. O banner passa a ter **apenas dois botões: "Aceitar" e "Remover"** (rejeitar não essenciais). Com isso o evento `abrir-cookie-banner` (que não tinha listener) deixa de existir — o bug é eliminado por remoção da funcionalidade quebrada.

> ⚠️ **DIVERGÊNCIA COM A SPEC LGPD — requer decisão.** Esta solução conflita com `spec_privacidade_lgpd.md`:
> - **RN-PR16** exige link "Gerenciar cookies" no rodapé que reabra o painel de preferências → seria removido.
> - **RN-PR05 / 5.5** exige banner com **três** opções, incluindo "Gerenciar preferências" com toggles por categoria.
> - **RN-PR06 / RN-PR07** exigem consentimento granular (analytics opt-out, publicidade opt-in) — só possível via painel.
> - **RN-PR12** veda dark patterns; com 2 botões a regra perde objeto, mas o controle granular continua exigido.
>
> Para implementar a solução aprovada **sem deixar o código em violação documental**, a spec LGPD DEVE ser atualizada (rebaixar RN-PR05/06/07/16) **ou** assumir formalmente o risco de compliance. Ver "Plano de Correção → Divergências" abaixo. Alternativa compatível: manter o painel e apenas **conectar** o evento (1 `useEffect`), preservando LGPD.

**Severidade:** 🟠 Alto — compliance LGPD comprometido (usuário não consegue revisar/granularizar consentimento após primeira escolha).

**Observação:** O QA original (2026-06-05) afirmou que o botão no Perfil "funciona corretamente". Reanalisando, esse comportamento provavelmente não foi testado de fato — o botão pré-existia mas igualmente não funcional. O bug é mais antigo do que parecia.

---

## 🆕 BUG-13 — Home renderiza como mobile (coluna de 480px) em qualquer viewport

**Tela:** Home (`/home`) em viewports ≥ 1024px (reproduzido em 1280 e 1980)
**Comportamento:** O conteúdo da Home é renderizado em uma coluna de 480px centralizada (`maxWidth: 480, margin: '0 auto'`), independente do tamanho do viewport. Em 1980×1024, o conteúdo ocupa x=750–1230, deixando grandes faixas vazias à esquerda e à direita.
**Evidência:** `homeWrapperRect: { x: 750, width: 480 }` no viewport 1980
**Causa raiz:** `client/src/pages/HomePage.tsx:174`
```tsx
<div style={{ maxWidth: 480, margin: '0 auto', position: 'relative' }}>
  <AppHeader />
  <FAB />
  <div style={{ paddingBottom: 112 }}>
    <CTABanner />
    ...
```
O wrapper externo limita toda a Home (incluindo AppHeader) a 480px. Não há ajuste responsivo.
**Spec violada:** spec_home_albums RN-H30 (layout adaptativo).
**Efeito colateral:** Por o wrapper começar em x=750 no desktop, o AppHeader não cobre a sidebar (228px), o que faz a marca "MA Meu Album" da sidebar aparecer apenas na Home — gerando a impressão de bug BUG-14 (ver abaixo).
**Severidade:** 🟠 Alto — degrada uso em desktop e contradiz princípio responsivo do design system.

**Sugestão (não aplicada):** trocar `maxWidth: 480` por uma estratégia responsiva (ex.: `max-w-[480px] lg:max-w-none` + grid de cards horizontalizado, ou simplesmente remover o limite e deixar a sidebar + main controlarem a largura).

---

## 🆕 BUG-14 — Marca "MA Meu Album" da sidebar fica oculta atrás do AppHeader nas páginas internas (desktop)

**Telas afetadas:** AL0 (`/albums`), AP1 (`/abrir`), CF0 (`/colar`), Trocas (`/trocas`), Perfil (`/perfil`), AL1 (`/albums/:id`) em viewport ≥ 1024px
**Não afeta:** Home (porque o `maxWidth: 480` do BUG-13 já confina o AppHeader, deixando a sidebar visível)
**Comportamento:** O bloco da logo "MA Meu Album" no topo da `DesktopSidebar` (x=0..228, y=0..60) é coberto pelo `AppHeader` (`position: sticky, top: 0, zIndex: 50`, fundo `#FBF8EE`). O usuário vê apenas o botão "Voltar" do AppHeader ou (na ausência dele) o fundo cream do header. A lista de navegação abaixo aparece, mas começa diretamente em "Início" sem a marca acima.

**Evidência (em /albums, viewport 1980):**
- `header.rect: { x: 0, width: 1964, height: 60 }`
- `header.background: rgb(251, 248, 238)` (cobre a área da logo)
- `header.zIndex: 50` > `sidebar.zIndex: 40`
- `sidebarLogoRect: { x: 0, y: 0, width: 226, height: 60 }` → coberto

**Causa raiz combinada:**
1. `AppHeader` se estende de x=0 a viewport-width porque `main` não tem `padding-left: 228px` (BUG-02 não corrigido)
2. `AppHeader` tem `zIndex: 50` enquanto `DesktopSidebar` tem `zIndex: 40` → o header ganha a sobreposição
3. Mesmo se o z-index fosse igualado, o background do AppHeader ainda cobriria visualmente a logo

**Spec violada:** spec_home_albums RN-H22 — "A marca do produto deve estar sempre visível na navegação principal em todos os viewports".

**Severidade:** 🟠 Alto — quebra identidade visual e dificulta localização de "voltar à home" pelo logo.

**✅ Solução aprovada (2026-06-06):** **Atualizar o `top` (Y) da `DesktopSidebar`** para que seu conteúdo fique **sempre abaixo da `AppHeader`**. Concretamente: `top: 60` + `height: calc(100vh - 60px)` no `aside`, removendo o bloco de logo interno (a marca passa a ser exibida pela `AppHeader`, ver BUG-15). Combinado com o fix de `padding-left` da main (BUG-02), o header deixa de cobrir a navegação e a marca volta a ser visível. Ver passo a passo no "Plano de Correção".

---

## 🆕 BUG-15 — Menu lateral oculta conteúdo em TODAS as páginas internas no desktop ≥1024px

**Status real do BUG-02:** confirmado ainda presente em viewport 1280 E 1980 em todas as páginas que não sejam Home.

**Páginas afetadas:** `/albums`, `/abrir`, `/colar`, `/trocas`, `/perfil`, `/albums/:id`, `/albums/:id/visualizar`, `/albums/novo`
**Comportamento:** `main` element continua com `padding-left: 0px` no viewport 1980. Todo conteúdo principal começa em x=0 e fica parcialmente coberto pela sidebar (228px). Exemplos visíveis:
- AL0: card "FIFA World Cup 2026™" com texto "AR FIGURINHAS" (em vez de "COLAR FIGURINHAS")
- AP1: campo "Número da figurinha" sem rótulo visível
- CF0: campo de busca cortado, texto "Buscar figurinha" oculto
- Perfil: títulos de seção cortados
- Trocas: lista de bullets com início cortado ("repetidas...", "rio a um amigo...")

**Causa raiz:** Tailwind v4 não está gerando a regra `.lg\:pl-\[228px\]` porque a classe está colada à interpolação `${...}` no template literal em `client/src/App.tsx:103`. Veja **BUG-02** acima.

**✅ Solução aprovada (2026-06-06):** **Unificar os componentes de menu Desktop (`DesktopSidebar`) e Mobile (`SideMenu`)** num único componente compartilhado, para consistência de identidade visual (mesmos rótulos, mesmos estilos de item ativo, mesma marca). Na renderização **desktop**, o menu **não deve ocupar todo o viewport**: permanece como sidebar fixa de 228px e o conteúdo recebe `padding-left: 228px` (corrige a causa raiz do Tailwind colado a `${...}` adicionando espaço antes da interpolação). Na renderização **mobile**, o mesmo componente é exibido como drawer sobreposto acionado pela `AppHeader`. Inclui a unificação do breakpoint (hoje `DesktopSidebar` usa `lg:` e `AppHeader` usa `xl:`, gerando menu duplicado entre 1024–1279px) e do rótulo de navegação ("Álbuns" vs "Meus Álbuns"). Ver passo a passo no "Plano de Correção".

**Severidade:** 🔴 Crítico — torna toda navegação inutilizável em desktop. É a causa raiz dos sintomas reportados pelo usuário ("Menu esconde funcionalidade" em Meus Álbuns, Abrir Pacotinhos, Colar Figurinhas, Trocas, Perfil).

---

## ✅ Comportamentos verificados conformes

- Login + redirecionamento `/home`
- Criação de álbum (variante BROCHURA) → volta para `/home` com card listado
- Footer sem links FIFA/Panini na landing (BUG-07 ✓)
- Footer logado contém apenas "Política de Privacidade" + "Gerenciar cookies" (BUG-05 corretamente substituiu `<a>` por `<button>`)
- Identidade visual respeita tokens de design handoff (cream/paper, ink, red accent, monospace para números)
- Sidebar desktop aparece corretamente em 1024px+ (`lg:flex` funcionando)
- AL2 (Visualizar Álbum) acessível via "Ver Álbum"
- Pilha persistida no backend (GET `/api/v1/pilha` agora retorna itens não-PENDENTE)
- Modal de Colagem (MCol) com pre-seleção do único álbum elegível

---

## Erros de Console Observados

| Origem | Erro | Notas |
|---|---|---|
| `/favicon.ico` | 404 | Pré-existente; não-crítico |
| `/api/v1/auth/me` antes do login | 401 (×2) | Esperado |
| WebSocket Vite | ECONNREFUSED | Ocorre apenas após restart manual do dev server durante a sessão; não-crítico |

**Não há mais o erro 404 em POST `/api/v1/pilha`** (BUG-01 original era falso positivo, resposta correta para figurinha inválida).

---

## Performance / Lentidão

Nenhum carregamento excessivo observado. Todas as transições de rota e mutações respondem em <1s.

---

## Pendências para o próximo ciclo

1. **BUG-02 / BUG-15 (real fix)** — Adicionar espaço antes de `${...}` em `client/src/App.tsx:103` para que Tailwind v4 reconheça `lg:pl-[228px]`. Validar gerando o CSS e visualmente em viewport ≥ 1024px. **Bloqueia BUG-14** (uma vez corrigido, a marca da sidebar provavelmente fica visível).
2. **BUG-12** — Adicionar `useEffect` em `App.tsx` com `document.addEventListener('abrir-cookie-banner', () => setShowCookieBanner(true))`.
3. **BUG-13** — Remover `maxWidth: 480` do wrapper externo em `client/src/pages/HomePage.tsx:174` (ou tornar responsivo). Repensar layout da Home para desktop (grid de cards de álbuns, área de repetidas mais larga, etc.).
4. **BUG-14** — Validar após resolver BUG-02. Se a marca ainda ficar coberta, aumentar o z-index do `aside` para 60 ou separar a área da logo em elemento próprio com z-index mais alto.
5. **Cobertura de teste** — Criar testes Playwright para:
   - `getComputedStyle(main).paddingLeft === '228px'` em viewport 1280 (BUG-02/15)
   - Evento `abrir-cookie-banner` reabre o banner (BUG-12)
   - Conteúdo da Home ocupa mais que 480px em viewport ≥1280 (BUG-13)
   - Marca "Meu Album" visível em todas as páginas internas em desktop (BUG-14)

---

## Screenshots Gerados

| Arquivo | Descrição |
|---|---|
| `v2_mobile_home_empty.png` | Home mobile estado vazio |
| `v2_mobile_home_com_album.png` | Home após criação de álbum (progressbar ARIA OK) |
| `v2_mobile_pilha_persistente.png` | Pilha com FWC1 COLADA + FWC2 REPETIDA (BUG-03 OK) |
| `v2_mobile_al1_arquivar.png` | Modal de arquivamento com texto explicativo (BUG-08 OK) |
| `v2_mobile_mfn_inicial.png` | MFN estado inicial — "Confirmar"/"Cancelar" |
| `v2_mobile_mfn_apos_paste.png` | MFN pós-paste — "Colar e Outra"/"Fechar" |
| `v2_mobile_perfil.png` | Perfil com link "Esqueci minha senha" + texto identificador correto |
| `v2_desktop_home.png` | Home desktop 1280 |
| `v2_desktop_home_1980.png` | Home desktop 1980 — conteúdo confinado a coluna 480px (BUG-13) |
| `v2_desktop_albums_BUG02_persiste.png` | AL0 desktop — conteúdo ainda atrás da sidebar (BUG-15) |
| `v2_desktop_trocas_1980.png` | Trocas desktop 1980 — bullets cortados, marca da sidebar oculta (BUG-14/15) |

---

# Plano de Correção (aprovado 2026-06-06)

> **Diretrizes do usuário:** BUG-12 (remover "Gerenciar cookies", deixar só Aceitar/Remover) · BUG-14 (atualizar Y da DesktopSidebar para abaixo da AppHeader) · BUG-15 (unificar menu Desktop+Mobile; no desktop não ocupar todo o viewport).
> **Escopo total do plano:** BUG-02, BUG-12, BUG-13, BUG-14, BUG-15 (bugs em aberto). BUG-02/14/15 são interdependentes e tratados como um único refactor de layout desktop.

### Decisões registradas (2026-06-06)

As três decisões pendentes foram resolvidas pelo usuário:

| # | Decisão | Efeito no plano |
|---|---|---|
| **1 — LGPD (D-1/D-2)** | **Simplificar e atualizar a spec.** Adotar o banner binário ("Aceitar"/"Remover"), remover painel granular e link "Gerenciar cookies"; **atualizar `spec_privacidade_lgpd.md`** para refletir o novo fluxo (rebaixar RN-PR05/06/07/16, §5.4/§5.5). | Passo 3 desbloqueado. A atualização da spec é **parte obrigatória** do passo, não opcional. |
| **2 — Marca + sidebar** | **Marca única, fonte = sidebar.** A `DesktopSidebar` **não pode ser ocultada no desktop** (sempre visível em ≥lg, sem toggle). A marca "MA Meu Album" vive na sidebar; no mobile, a marca vive no header e seu clique abre o drawer. | **Muda a abordagem do BUG-14** (ver Passo 1, abaixo): a sidebar permanece `top:0` full-height **com** o bloco de marca (não é mais empurrada para `top:60` nem perde a logo). O header desktop deixa de sobrepor a sidebar pela correção de `padding-left` (BUG-02), seguindo o modelo `MATopBar` do handoff. |
| **3 — Home em grid** | **Redesenhar a Home em grid no desktop**, consultando o design handoff como referência. | Passo 2 ampliado: não é só "liberar largura", é um layout em grid responsivo (ver referências de handoff no passo). |

> **Referências de design handoff consultadas:**
> - `design_handoff/shared-chrome.jsx` — `MAHeader` (cabeçalho mobile: marca à esquerda + usuário à direita) e `MATopBar` (top bar desktop **com** sidebar: "a marca vive na sidebar; a top bar traz contexto título/breadcrumb", `zIndex:40`, padding `0 32px`, altura 60). Confirma decisão #2.
> - **Artboard desktop da Home (fornecido pelo usuário em 2026-06-06)** — duas telas (estado vazio e estado com álbuns). É a **referência canônica** do layout desktop da Home e substitui as derivações genéricas. Características confirmadas (ver "Layout desktop da Home" abaixo).
> - `design_handoff/README.md` §"Fluxo 3 — Home" — wireframe mobile 390px; mantém-se como referência **mobile**. README orienta "aplicar design system da landing para estilização".
> - `design_handoff/README.md` nota #13 — altura fixa de card via `height` + `box-sizing: border-box` (não `min-height`); referência técnica para grids de cards.
> - `design_handoff/shared-chrome.jsx` `MATopBar` — confirmado pelo artboard: top bar desktop com **título da página** ("INÍCIO") à esquerda + bloco de usuário à direita; marca na sidebar.

## Mapa de Divergências Spec × Implementação × Diretriz

| # | Divergência | Fonte | Decisão necessária |
|---|---|---|---|
| D-1 | **Banner de cookies só com 2 botões** (diretriz BUG-12) vs spec exige 3 opções + painel granular | `spec_privacidade_lgpd.md` RN-PR05, RN-PR06, RN-PR07, §5.5 | ✅ **DECIDIDO (2026-06-06): simplificar e atualizar a spec.** Adotar banner binário e reescrever RN-PR05/06/07 e §5.4/§5.5 para o novo fluxo. |
| D-2 | **Footer sem "Gerenciar cookies"** (diretriz BUG-12) vs RN-PR16 (link obrigatório no rodapé) | `spec_privacidade_lgpd.md` RN-PR16 | ✅ **DECIDIDO (2026-06-06): atualizar a spec.** Reescrever RN-PR16 — sem link "Gerenciar cookies"; revogação via reapresentação do banner (expiração/mudança de política) e canal de contato. |
| D-3 | **`CookieBanner` atual já diverge da spec**: botão "Aceitar essenciais" chama `acceptAll()` com `publicidade:false` (spec: "Aceitar todos" = analytics+publicidade `true`). Consentimento só vai p/ `localStorage` (sem `consent_id`, `versao_politica`, validade 12m, retenção 5 anos). | `spec_privacidade_lgpd.md` §5.2, §5.5, RN-PR08/PR11 | Pré-existente. A solução BUG-12 simplifica o front, mas a persistência de consentimento continua não-conforme (fora do escopo desta diretriz; registrar como dívida). |
| D-4 | **Breakpoint inconsistente**: `DesktopSidebar` aparece em `lg:` (1024) mas `AppHeader` esconde o menu-mobile em `xl:` (1280) → entre 1024–1279px aparecem **dois menus**. | Código (`DesktopSidebar.tsx` L15, `AppHeader.tsx` L52) | Unificar tudo em `lg:` (parte do BUG-15). |
| D-5 | **Rótulo de navegação divergente**: `SideMenu` usa "Álbuns", `DesktopSidebar` usa "Meus Álbuns". | Código (`SideMenu.tsx` L11, `DesktopSidebar.tsx` L5) | Unificar (handoff/Home usam "Meus Álbuns"). |
| D-6 | **Home confinada a 480px** em desktop (BUG-13) vs handoff prevê artboards desktop responsivos. | `design_handoff/README.md` (artboards `*-desk-*`) | Tornar a Home responsiva (remover/relaxar `maxWidth: 480` em ≥lg). |
| D-7 | Citações de RN no relatório anterior estavam **incorretas**: "RN-H22" e "RN-H30" foram citadas para "marca visível" / "layout adaptativo", mas em `spec_home_albums.md` RN-H22 = `aria-busy` em skeleton e RN-H30 = texto acessível da variante. **Não há RN específica de layout desktop nas specs** — o requisito vem do design handoff (artboards desktop) e das regras WCAG de reflow (RN-WG04/WG05). | `spec_home_albums.md` | Tratar BUG-13/14/15 como conformidade com **handoff + WCAG**, não com RN-H inexistente. |

## Sequência de Implementação

### Passo 1 — Refactor de layout desktop (BUG-02 + BUG-14 + BUG-15) — um bloco coeso

**1a. Unificar dados e estilos de navegação.**
- Criar `client/src/components/nav/navLinks.ts` com a lista única: `Início (/home)`, `Meus Álbuns (/albums)`, `Abrir Pacotinhos (/abrir)`, `Colar Figurinhas (/colar)`, `Trocas (/trocas)`, `Perfil (/perfil)`.
- Criar componente compartilhado `AppNav` (ou `NavList`) com os estilos de item ativo (borda esquerda vermelha, fundo `#F0EDE4`), consumido tanto pela sidebar desktop quanto pelo drawer mobile.

**1b. `DesktopSidebar` → sidebar fixa full-height, marca preservada, sempre visível (BUG-14 + decisão #2).**
- `aside`: `top: 0`, `height: 100vh`, `width: 228`, `zIndex: 40` (mantém os valores atuais).
- **Manter o bloco de marca "MA Meu Album"** no topo da sidebar (altura 60, alinhado à altura do header), pois a decisão #2 define a sidebar como **fonte única da marca no desktop**. (A abordagem anterior — empurrar a sidebar para `top:60` e remover a logo — fica **descartada**.)
- A sidebar **não pode ser ocultada no desktop**: sem botão de colapsar/esconder em ≥lg. Permanece em `hidden lg:flex` (renderiza a partir de 1024px e nunca some acima disso).
- `nav` consome `AppNav` (rótulos e estilo de item ativo unificados).

**1c. `App.tsx` → corrigir o padding da main (BUG-02, causa raiz — resolve o BUG-14 por consequência).**
- Linha 103: adicionar **espaço** antes da interpolação para o Tailwind v4 gerar a regra:
  ```tsx
  <main id="main" className={`flex-1 overflow-y-auto lg:pl-[228px] ${showCookieBanner ? 'pb-[140px]' : ''}`}>
  ```
- Com `padding-left: 228px`, **toda** a coluna de conteúdo (incluindo o `AppHeader`, que é renderizado dentro de `main`) começa em x=228. Logo o header **não sobrepõe mais a sidebar** e a marca da sidebar fica visível — sem precisar mexer no `top`/`zIndex` da sidebar. É exatamente o modelo `MATopBar` do handoff (top bar vive na coluna de conteúdo, à direita da sidebar).

**1d. `AppHeader` → unificar breakpoint e separar marca por viewport (BUG-15 / D-4 / D-5 / decisão #2).**
- Trocar `xl:hidden` por `lg:hidden` no gatilho do menu mobile (some no desktop, casando com a sidebar em `lg:flex`). Elimina o menu duplicado entre 1024–1279px (D-4).
- **Mobile (<lg) — modelo `MAHeader`:** marca "MA Meu Album" à esquerda + bloco de usuário à direita. O clique na marca/menu abre o `SideMenu` (drawer). A marca é a fonte de identidade no mobile.
- **Desktop (≥lg) — modelo `MATopBar`:** **não** repetir a marca (ela está na sidebar). O header passa a exibir o **título/contexto da página** à esquerda + bloco de usuário à direita. Usar `<div>`/título não-`<h1>` para não competir com o `<h1>` de conteúdo da página.
- `SideMenu` (drawer mobile) passa a consumir `AppNav` e os rótulos unificados (D-5: "Meus Álbuns").

> **Resultado esperado:** em ≥1024px `getComputedStyle(main).paddingLeft === "228px"`; AppHeader inicia em x=228 (não cobre a sidebar); marca da sidebar sempre visível em todas as páginas internas; um único menu em qualquer largura; sidebar não ocultável no desktop.

### Passo 2 — Home em grid responsivo (BUG-13 + decisão #3)

Redesenhar a Home para desktop seguindo o **artboard canônico fornecido pelo usuário** (2026-06-06; estados "vazio" e "com álbuns"), **preservando o layout mobile atual** (coluna única ≤ 480px). O artboard **substitui** as derivações genéricas anteriores (não é o split 2/3 + 1/3 cogitado antes).

#### Layout desktop da Home (conforme artboard)

O desktop **não** usa colunas lado a lado. É **uma coluna de conteúdo única, à direita da sidebar fixa**, com seções **empilhadas e full-width** dentro dessa coluna:

1. **Sidebar fixa à esquerda** (228px, decisão #2 / Passo 1) — ícones + rótulos de navegação, com o item **"Início" em estado ativo**; a marca "Meu Album" vive na sidebar.
2. **Top bar de contexto** (`MATopBar`) — título da página **"INÍCIO"** à esquerda + bloco de usuário (nome + `#publicId` + sair) à direita. Sem a marca (ela está na sidebar).
3. **Banner CTA "Abrir Pacotinhos"** (RN-H14) — **horizontal, full-width** no topo da coluna de conteúdo (não confinado a 480px).
4. **"Meus Álbuns"** — full-width; os cards de álbum em **grid de 2 colunas** no desktop (`lg:grid-cols-2`), `gap 14–16px`. No **estado vazio**, exibe o empty-state/CTA de criar álbum ocupando a largura. Manter a anatomia do card (tag variante, título, `nome_personalizado`, progressbar com `role="progressbar"` de OBS-02, botão "Colar figurinhas"). Paginação (RN-H05) abaixo do grid.
5. **"Figurinhas Repetidas"** — full-width, **abaixo** de "Meus Álbuns" (não é painel lateral). Renderizada como **tabela** com cabeçalho de colunas `# · FIG. · JOGADOR · DISPONÍVEL · QTD` e um **badge de total no canto superior direito** (ex.: "47 NO ESTOQUE"). Mantém RN-H07/08/09.

**2a. Remover o confinamento fixo.**
- `client/src/pages/HomePage.tsx` (~L174): o wrapper `maxWidth: 480, margin: '0 auto'` deve valer **só em mobile**. Em ≥lg, liberar a largura da coluna de conteúdo (ex.: `max-w-[480px] mx-auto lg:max-w-none lg:mx-0`). O `AppHeader`/top-bar continua dentro de `main` (que já tem `lg:pl-[228px]`).

**2b. Estrutura empilhada full-width no desktop (≥lg).**
- Banner CTA → "Meus Álbuns" → "Figurinhas Repetidas", **uma seção sob a outra**, cada uma ocupando a largura total da coluna de conteúdo (sem grid de duas colunas no nível da página).
- Dentro de "Meus Álbuns": apenas os **cards** entram em grid (`lg:grid-cols-2`; pode escalar para `xl:grid-cols-3` se a largura permitir, mas o artboard mostra 2 colunas).
- Dentro de "Figurinhas Repetidas": layout de **tabela** (cabeçalho + linhas), não o card mobile; preservar a leitura do grid de item `24px 56px 1fr auto` do wireframe como fallback mobile.
- **Estética:** sombras flat (`Npx Npx 0 cor`), bordas retas (`border-radius: 0`), tokens cream/ink/red — conforme README.

**2c. Acessibilidade / reflow.**
- Garantir reflow WCAG 2.0 AA (1.4.10) sem rolagem horizontal em qualquer largura entre 320px e desktop; os cards de álbum quebram para 1 coluna e a tabela de repetidas degrada para a leitura mobile conforme o viewport encolhe.
- FAB (`position: fixed`, z-index acima do conteúdo) permanece; revisar `paddingBottom`/posição para não cobrir a última seção em nenhuma largura (regressão do BUG-06 já corrigido).

### Passo 3 — Simplificar cookies + atualizar a spec (BUG-12) — **decisão #1: aprovado**
- `CookieBanner.tsx`: remover botão/painel "Gerenciar preferências"; manter **"Aceitar"** (analytics+publicidade) e **"Remover"** (recusa não essenciais). Ambos os botões com peso visual equivalente (RN-PR12 reescrita). Ajustar `onAccept` ao novo modelo binário (ver D-3 sobre persistência de consentimento — dívida pré-existente, fora do escopo desta diretriz).
- `App.tsx` (`Footer`): remover o `<button>` "Gerenciar cookies" e o `dispatchEvent('abrir-cookie-banner')` (o evento não tinha listener — é a raiz do BUG-12).
- `ProfilePage.tsx`: remover o botão "Gerenciar cookies" da seção Privacidade.
- **Atualizar `spec_privacidade_lgpd.md`** (parte obrigatória — decisão #1):
  - §5.4 (fluxo): 3 opções → 2 ("Aceitar"/"Remover").
  - §5.5 (conteúdo): remover descrição do painel "Gerenciar preferências"; descrever os 2 botões.
  - RN-PR05/06/07: reescrever para o modelo binário (analytics e publicidade só ativam em "Aceitar"; "Remover" mantém ambos inativos).
  - RN-PR12: "duas opções com destaque equivalente" (em vez de três botões).
  - RN-PR16 + §8.4: remover a exigência do link "Gerenciar cookies" no rodapé; revogação via reapresentação do banner (RN-PR08/09) + canal de contato.
  - Adicionar linha v1.1 no histórico de revisões.
- **D-3 (dívida pré-existente, registrar — não bloqueia):** a persistência de consentimento hoje é só `localStorage`, sem `consent_id`/`versao_politica`/validade 12m/retenção 5 anos (RN-PR08/PR11). A simplificação não piora isso, mas também não resolve. Manter como item de dívida técnica de compliance.

## Testes a criar / alterar

> Conforme `tests/TESTS.md`: navegar por **clique** (não por roteamento), sem busca parcial "LIKE", cobrindo estrutura + fluxo + regras; comparar specs com `/docs/_hist`.

| Arquivo | Ação | Cobertura |
|---|---|---|
| `tests/layout/navegacao-desktop.spec.ts` | **Criar** | Viewport ≥1024: `main` tem `padding-left: 228px`; conteúdo não fica sob a sidebar; marca "Meu Album" visível **na sidebar** em todas as páginas internas; sidebar **sempre visível** (não ocultável); clicar cada item da sidebar navega para a rota certa (BUG-02/14/15 + decisão #2). |
| `tests/layout/navegacao-mobile.spec.ts` | **Criar** | Viewport <1024: sidebar oculta; clicar na marca/gatilho da `AppHeader` abre o drawer; clicar item navega e fecha o drawer; focus trap/Esc (acessibilidade). |
| `tests/layout/breakpoint.spec.ts` | **Criar** | Em 1024px e 1279px existe **apenas um** menu visível (regressão D-4). |
| `tests/home/home.spec.ts` | **Alterar** | Em viewport ≥1024 o conteúdo principal ocupa largura > 480px; seções **empilhadas full-width** (banner → Meus Álbuns → Figurinhas Repetidas); cards de álbum em **grid de 2 colunas** (`lg:grid-cols-2`); "Figurinhas Repetidas" renderizada como **tabela** (cabeçalho `# · FIG. · JOGADOR · DISPONÍVEL · QTD`) com badge de total; top-bar mostra título "INÍCIO"; sem rolagem horizontal (reflow). Mobile mantém coluna única (BUG-13 + decisão #3, conforme artboard). |
| `tests/privacidade/cookies.spec.ts` | **Criar** (decisão #1: simplificar) | Banner mostra **apenas** "Aceitar"/"Remover" com peso visual equivalente; clicar fecha e persiste a escolha; footer e Perfil **não** contêm "Gerenciar cookies". Alinhar asserts à `spec_privacidade_lgpd.md` **já atualizada** (v1.1). |

## Decisões registradas (todas resolvidas — 2026-06-06)
1. **D-1/D-2 (LGPD):** ✅ **Simplificar e atualizar a spec.** Banner binário "Aceitar"/"Remover"; `spec_privacidade_lgpd.md` reescrita (RN-PR05/06/07/12/16, §5.4/§5.5).
2. **Fonte única da marca no desktop:** ✅ **Sidebar.** A `DesktopSidebar` é a fonte da marca e **não pode ser ocultada no desktop**. Header desktop sem marca (mostra título de página); marca no header só no mobile.
3. **BUG-13 — escopo da Home desktop:** ✅ **Redesenhar em grid responsivo**, com base no design handoff (landing + nota de grid do README).

> **Pronto para implementar.** Nenhuma decisão pendente. Sequência sugerida: Passo 1 (layout desktop) → Passo 2 (Home grid) → Passo 3 (cookies + spec) → testes. A implementação **não foi iniciada** (aguardando ordem explícita do usuário).
