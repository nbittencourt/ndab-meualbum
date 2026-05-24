# Handoff: Meu Album — Landing + Login + Home

## Overview

**Meu Album** é uma aplicação web/mobile para acompanhar a coleção de figurinhas da Copa do Mundo 2026. Este pacote contém os designs de referência para duas telas:

1. **Landing page + Login integrado** (`Meu Album.html`) — tela de entrada pública
2. **Home (página principal pós-login)** (`Home.html`) — wireframe anotado com regras de negócio mapeadas

A identidade visual é original, inspirada no espírito do Mundial 2026 (tricolor anfitriões: vermelho, verde, azul), sem uso de ativos oficiais da FIFA ou Panini.

---

## Sobre os arquivos de design

Os arquivos `.html` / `.jsx` neste pacote são **protótipos de referência criados em HTML** — não são código de produção. A tarefa é **recriar esses designs no ambiente existente do projeto** (React, Next.js, Vue, etc.) usando seus padrões, bibliotecas e design system estabelecidos. Caso não exista ambiente definido ainda, React + Next.js App Router é a recomendação natural dado o perfil mobile-first da aplicação.

---

## Fidelidade

| Tela | Fidelidade | O que implementar |
|---|---|---|
| `Meu Album.html` — Landing + Login | **Alta** (hi-fi) | Cores, tipografia, espaçamentos e interações do protótipo devem ser seguidos com fidelidade. |
| `Home.html` — Home pós-login | **Baixa** (wireframe anotado) | Usar como guia de estrutura, layout e regras de negócio. Aplicar o design system da landing para estilização final. |

---

## Telas

### 1. Landing Page + Login (`Meu Album.html`)

**Propósito:** Tela de entrada pública. Convencer o visitante a criar uma conta e permitir o login de usuários existentes.

**Arquivo de referência:** `Meu Album.html` (monte o canvas e expanda o artboard "Meu Album · padrão" em fullscreen para inspecionar)

**Layout geral (desktop 1440px):**
- `<nav>` fixed top — 68px de altura, padding 20px 56px, border-bottom 2px ink
- Hero section — grid `1.05fr 1fr`, gap 48px, padding 72px 56px 96px
  - Coluna esquerda: eyebrow tag rotacionado + h1 display 100px + corpo 17px + CTAs + social proof
  - Coluna direita: login card como "ticket-stub" (border 2.5px ink, box-shadow 8px 8px 0 ink, rotação +1.5deg)
- Countdown band — background ink, border-top 4px red, border-bottom 4px green, padding 56px
- Stats "scoreboard" — grid 4 colunas separado por 4px gap, cada célula cream, shadow 8px 8px 0 red
- Steps section — 3 cards com `box-shadow: 6px 6px 0 <cor-da-etapa>`, rotações alternadas (-0.4deg, -1deg, +0.8deg)
- Footer — background ink, border-top 6px red, layout flex space-between

**Componentes — Login card:**
```
Posição:       Coluna direita do hero, rotacionado 1.5deg
Background:    #fff
Border:        2.5px solid #0A0907
Box-shadow:    8px 8px 0 #0A0907

  ┌─ Header interno (ticket stub) ─────────────────────┐
  │ Background: #0A0907 (ink)                          │
  │ Texto: branco, Geist Mono 11px, uppercase, ls 0.16em│
  │ "● ABRIR ÁLBUM"  ·  "N° 0001"                     │
  └────────────────────────────────────────────────────┘
  ┌─ Perfuração ───────────────────────────────────────┐
  │ Height: 14px · background: cream · border-bottom: 2.5px dashed ink │
  │ Semicírculos laterais: ⌀20px, posição absoluta nos extremos │
  └────────────────────────────────────────────────────┘
  ┌─ Corpo (padding 32px 28px) ────────────────────────┐
  │ h3 "Entrar": Archivo Black 30px, ink               │
  │ Input Email:  label uppercase 11px + input 14px    │
  │ Input Senha:  label + link "Esqueci" alinhado right│
  │ Botão primário: full-width, 16px padding, red,     │
  │   box-shadow 3px 3px 0 ink                         │
  │ Link cadastro: "Sem conta? Cadastrar grátis"       │
  │   cor: --c-green, fontWeight 700                   │
  └────────────────────────────────────────────────────┘
```

**Estados de login:**
- Input focus: border-color red + box-shadow `0 0 0 3px rgba(229,20,42,0.18)`
- Botão hover: background darken (use `filter: brightness(0.9)`)
- Link "Esqueci a senha": cor red, fontWeight 600

---

### 2. Home — Pós-login (`Home.html`)

**Propósito:** Dashboard principal após autenticação. Três seções: CTA Abrir Pacotinhos, Meus Álbuns, Figurinhas Repetidas.

**Arquivo de referência:** `Home.html` — artboard "Estado normal" e "Estado vazio".

**Layout geral (mobile 390px):**

```
┌─ Header (60px) ──────────────────────────────────────┐
│ Logo MA + "Meu Album" | Nome + #ID6chars + LogoutBtn │
└──────────────────────────────────────────────────────┘
┌─ FAB sticky (posição fixa, bottom 16px, right 16px) ─┐
│ "+ Abrir" · background red · border 2px ink          │
│ z-index acima de todo conteúdo                       │
└──────────────────────────────────────────────────────┘
┌─ Banner CTA "Abrir Pacotinhos" (sempre visível) ─────┐
│ margin 16px · bg ink · border 2.5px ink              │
│ box-shadow 5px 5px 0 red                             │
│ padding 22px 20px                                    │
│ Eyebrow mono 10px + h2 Archivo Black 28px + p 13px   │
│ Botão "Abrir pacotinhos →": red, border ink, shadow  │
└──────────────────────────────────────────────────────┘
┌─ Seção: Meus Álbuns ─────────────────────────────────┐
│ padding 0 16px                                       │
│ Header: h2 + botão "+ Novo álbum" (red, shadow ink)  │
│ Cards: flex-col, gap 14px (ver Card do Álbum abaixo) │
│ Paginação: só se > 5 álbuns                          │
└──────────────────────────────────────────────────────┘
┌─ Seção: Figurinhas Repetidas ────────────────────────┐
│ Total consolidado (número grande em red)             │
│ Lista: 5 itens · grid "24px 56px 1fr auto"           │
│ Cada item: rank · placeholder imagem · número+nome · qty badge │
└──────────────────────────────────────────────────────┘
┌─ Footer ─────────────────────────────────────────────┐
│ 2 links externos em nova aba                         │
└──────────────────────────────────────────────────────┘
```

**Card do Álbum — variantes visuais:**

| Variante | Background | Border | Box-shadow | Tag bg | Texto |
|---|---|---|---|---|---|
| `BROCHURA` | `#ffffff` | `1.5px solid ink` | none | `#E0DDD5` | ink |
| `CAPA_DURA` | `#F5F0E4` | `2px solid ink` | `3px 3px 0 #C8C4BC` | `#C8C4BC` | ink |
| `CAPA_DURA_PRATA` | listras diag. `#F0EDE4`/`#E0DDD5` | `2px solid ink` | `3px 3px 0 #9E9E9E` | `#9E9E9E` | white |
| `CAPA_DURA_OURO` | `#FEF3CC` | `2px solid #8B6914` | `3px 3px 0 #C49A1A` | `#C49A1A` | white |
| `BOX_PREMIUM` | `#0A0907` (ink) | `2px solid ink` | `4px 4px 0 red` | `#E5142A` | white |

**Card do Álbum — anatomia:**
```
┌─ Tag variante + data de criação ──────────────────┐
│ Título: tipo_album.nome (Archivo Black 16px)      │
│ Subtítulo: nome_personalizado (Geist 12px, 60%)   │  ← RN-H13: só quando preenchido
├─ Progresso ───────────────────────────────────────┤
│ "PROGRESSO"  ·  68.3%  (número Archivo Black 22px)│  ← RN-H02: 1 casa decimal
│ [████████████░░░░░] barra 8px altura              │
├─ Ação ────────────────────────────────────────────┤
│ [Colar figurinhas →] full-width, border ink       │  ← RN-H12: disponível sempre
└───────────────────────────────────────────────────┘
```

**Seção Figurinhas Repetidas — item:**
```
rank (24px col) · imagem (56×72px placeholder) · número + nome · badge quantidade
```
- Badge: 40×40px, bg ink (1º lugar: red), Archivo Black 18px branco
- Imagem: placeholder para asset a ser produzido (ver Seção Assets)

---

## Regras de Negócio (mapeadas no wireframe)

| Cód. | Regra | Onde impacta |
|---|---|---|
| RN-H02 | Progresso = `coladas / total × 100`, 1 casa decimal | Card do álbum |
| RN-H03 | Sem álbuns → exibe só estado vazio com CTA | Seção Meus Álbuns |
| RN-H04 | Ordem: `criado_em DESC` | Lista de álbuns |
| RN-H05/06 | Paginação ativa só se > 5 álbuns; 5 por página | Seção Meus Álbuns |
| RN-H07/08 | Estoque global, só qty ≥ 1 | Seção Repetidas |
| RN-H09 | Empate no ranking: `figurinha.numero ASC` | Ranking repetidas |
| RN-H10 | Total = `SUM(EstoqueFigurinha.quantidade)` | Total no header da seção |
| RN-H11 | Estoque vazio → estado vazio próprio | Seção Repetidas |
| RN-H12 | Botão "Colar figurinhas" sempre disponível | Todos os cards |
| RN-H13 | Título = `tipo_album.nome`; `nome_personalizado` como subtítulo | Card do álbum |
| RN-H14 | CTA Abrir Pacotinhos sempre visível | Banner + FAB |

---

## Interações e Comportamento

### Landing
- Botão "Criar conta grátis" → `/register`
- Link "Cadastrar grátis" no form → transição para modo cadastro no mesmo card
- Link "Esqueci a senha" → modal ou `/forgot-password`
- Botão "Entrar" → `POST /auth/login`, redirect para `/home` em sucesso
- Sessão expirada (JWT inválido) → redirect automático para `/login`

### Home
- FAB "+ Abrir" → `/packs/open`
- Banner "Abrir pacotinhos →" → `/packs/open`
- "+ Novo álbum" → `/albums/new`
- "Colar figurinhas" (card) → `/albums/:id/stickers`
- Paginação → `GET /home?pagina=N` (recarrega só a seção de álbuns)
- Logout → `DELETE /auth/session`, redirect para `/`

### Estados de carregamento
- Seções exibem skeletons durante `GET /home`
- Falha de carga: mensagem inline + botão "Tentar novamente"
- RN-H01: usuário `PENDENTE` → redirect para confirmação de email

### Animações
- Hover em botões primários: `filter: brightness(0.9)`, transição `0.15s ease`
- Hover em cards de álbum: `transform: translateY(-2px)`, transição `0.15s ease`
- FAB: `box-shadow` expand em hover

---

## Design Tokens

```css
/* Cores */
--c-red:   #E5142A;   /* ação primária */
--c-green: #0A9145;   /* sucesso, acento */
--c-blue:  #0B2A66;   /* acento terciário */
--c-dark:  #0A1024;   /* fundos escuros */
--c-ink:   #0A0907;   /* texto principal, bordas */
--c-cream: #F0E9D6;   /* fundo warm */
--c-paper: #FBF8EE;   /* fundo mais claro */
--c-line:  rgba(10,9,7,0.22); /* separadores */

/* Tipografia */
--font-display: "Archivo Black", Helvetica, Arial, sans-serif;  /* display, all-caps */
--font-body:    "Geist", ui-sans-serif, system-ui, sans-serif;   /* corpo */
--font-mono:    "Geist Mono", ui-monospace, "SF Mono", monospace;/* labels, eyebrows */

/* Google Fonts necessárias */
/* Archivo Black (weight 400) */
/* Geist (400, 500, 600, 700) */
/* Geist Mono (400, 500) */

/* Espaçamento (escala density) */
--d: 1;                          /* multiplicador: compact=0.86, regular=1, comfy=1.14 */
--pad-x: calc(72px * var(--d));
--pad-y: calc(72px * var(--d));
--gap-md: calc(20px * var(--d));
--gap-lg: calc(40px * var(--d));

/* Padrão de sombra flat */
/* Primário:  4px 4px 0 var(--c-ink)  */
/* Danger:    4px 4px 0 var(--c-red)  */
/* Destaque:  5px 5px 0 var(--c-red)  */

/* Border radius: 0 (design intencional — bordas retas) */
/* Exceção: inputs têm border-radius: 4px */
```

---

## Assets

| Asset | Status | Nota |
|---|---|---|
| Logo "MA" | Inline (SVG/div CSS) | Quadrado vermelho rotacionado −4deg com letras brancas |
| Imagens de figurinhas | **A produzir** | Placeholder `56×72px` em cada item da seção Repetidas. Formato esperado: foto do jogador em moldura da figurinha Panini. |
| Ícones | Inline SVG simples | Logout (seta), check (progresso), setas (paginação) — todos simples o suficiente para redesenhar |

---

## Arquivos neste pacote

| Arquivo | Tipo | Descrição |
|---|---|---|
| `Meu Album.html` | Hi-fi prototype | Landing + Login — referência visual definitiva |
| `Home.html` | Wireframe anotado | Home pós-login — referência de estrutura e regras |
| `styles.css` | Tokens CSS | Design tokens compartilhados (cores, fontes, spacing) |
| `variations/pack.jsx` | JSX (Babel) | Componentes da landing — fonte da verdade visual |
| `home-wf.jsx` | JSX (Babel) | Componentes do wireframe da Home |
| `design-canvas.jsx` | JSX (suporte) | Canvas para visualização lado a lado — ignorar na implementação |
| `tweaks-panel.jsx` | JSX (suporte) | Painel de tweaks — ignorar na implementação |
| `app.jsx` | JSX (suporte) | Mount do canvas da landing — ignorar na implementação |

> **Para visualizar:** abra `Meu Album.html` ou `Home.html` diretamente no browser. O canvas permite pan/zoom e fullscreen por artboard.

---

## Notas para o Claude Code

1. Os tokens CSS em `styles.css` devem ser migrados para o sistema de design do projeto (Tailwind config, CSS-in-JS theme, design tokens, etc.)
2. As variantes de álbum (`BROCHURA`, `CAPA_DURA`, `CAPA_DURA_PRATA`, `CAPA_DURA_OURO`, `BOX_PREMIUM`) precisam de um mapa de estilos no frontend — ver tabela "Card do Álbum — variantes visuais" acima.
3. O padrão visual de sombra flat (`Npx Npx 0 <cor>`) é deliberado — não substituir por `box-shadow` com blur.
4. A tipografia usa `text-transform: uppercase` extensivamente em elementos display e labels mono.
5. O FAB da Home deve ser implementado com `position: fixed` e `z-index` acima do header.
6. A seção de Figurinhas Repetidas é **somente leitura** nesta tela — sem ações de edição.
