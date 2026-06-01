# Handoff: MeuAlbum — Design Completo

> **Gerado em:** 17 mai 2026  
> **Specs de referência:** `../spec_*.md` no repositório de design

---

## Visão Geral

**MeuAlbum** é uma aplicação web responsiva (PWA-ready) para acompanhar a coleção de figurinhas da Copa do Mundo 2026. O produto cobre o ciclo completo:

```
Cadastro → Login → Home → Abrir Pacotinhos → Colar Figurinhas → Gerenciar Álbuns → Perfil
```

Este pacote contém **designs de referência em HTML** para todos os fluxos, especificações funcionais completas e tokens de design.

---

## Sobre os Arquivos de Design

Os arquivos `.html` / `.jsx` neste pacote são **protótipos de referência criados em HTML** — não são código de produção para ser copiado diretamente. A tarefa é **recriar esses designs no ambiente existente do projeto** (React, Next.js, Vue, etc.) usando seus padrões, bibliotecas e design system estabelecidos.

Caso não exista ambiente definido, **React + Next.js App Router** é a recomendação para o perfil mobile-first da aplicação.

Para abrir os protótipos: abra cada `.html` diretamente no browser. O canvas interno permite pan/zoom e abertura em fullscreen por artboard.

---

## Fidelidade por Tela

| Arquivo HTML | Fluxo | Fidelidade | O que implementar |
|---|---|---|---|
| `Meu Album.html` | Landing page + Login | **Alta (hi-fi)** | Cores, tipografia, espaçamentos e interações do protótipo com fidelidade pixel. |
| `Meu Album.html` (seções login-wf) | Cadastro · Login · Recuperação de Senha | **Média (wireframe anotado)** | Estrutura, campos, validações e fluxos anotados; aplicar visual system da landing. |
| `Home.html` | Home pós-login | **Baixa (wireframe)** | Guia de estrutura e regras de negócio; aplicar design system da landing para estilização. |
| `Abrir Pacotinhos.html` | Abrir Pacotinhos (AP0 · AP1 · modais) | **Alta (hi-fi anotado)** | Seguir com fidelidade. Anotações de RN nas margens são referência, não decoração. |
| `Cadastro Album.html` | Cadastro de Álbum (CA1 · CA2) | **Alta (hi-fi anotado)** | Seguir com fidelidade. Animação de variante (RN-CA05) é intencional. |
| `Albuns.html` | Álbuns — Gerenciamento (AL0 · AL1) | **Média (wireframe anotado)** | Estrutura e regras; estilizar com design system. |
| `Colar Figurinhas.html` | Colar Figurinhas (CF0 · CF1 · MFN) | **Média (wireframe anotado)** | Estrutura e regras; estilizar com design system. |
| `Perfil do Usuario.html` | Perfil / Configurações (P1 · P2) | **Média (wireframe anotado)** | Estrutura e regras; estilizar com design system. |

---

## Design Tokens

```css
/* ── Cores ─────────────────────────────────────────── */
--c-red:   #E5142A;   /* ação primária, destaque */
--c-green: #0A9145;   /* sucesso, acento */
--c-blue:  #0B2A66;   /* acento terciário */
--c-dark:  #0A1024;   /* fundos escuros */
--c-ink:   #0A0907;   /* texto principal, bordas */
--c-cream: #F0E9D6;   /* fundo warm */
--c-paper: #FBF8EE;   /* fundo mais claro */
--c-bg:    #F0EDE4;   /* fundo canvas (externo ao conteúdo) */
--c-line:  rgba(10,9,7,0.18);  /* separadores e bordas suaves */
--c-mute:  rgba(10,9,7,0.55);  /* texto secundário */

/* ── Tipografia ─────────────────────────────────────── */
--font-display: "Archivo Black", "Helvetica Neue", Helvetica, Arial, sans-serif;
--font-body:    "Geist", ui-sans-serif, system-ui, -apple-system, sans-serif;
--font-mono:    "Geist Mono", ui-monospace, "SF Mono", Menlo, monospace;

/* Google Fonts a importar:
   Archivo Black (weight 400)
   Geist (400, 500, 600, 700)
   Geist Mono (400, 500) */

/* ── Espaçamento (density scale) ────────────────────── */
--d: 1;                          /* compact = 0.86 · regular = 1 · comfy = 1.14 */
--pad-x: calc(72px * var(--d));
--pad-y: calc(72px * var(--d));
--gap-md: calc(20px * var(--d));
--gap-lg: calc(40px * var(--d));

/* ── Padrão de sombra flat (deliberado — sem blur) ──── */
/* Primário:  3px 3px 0 var(--c-ink) */
/* Destaque:  5px 5px 0 var(--c-red) */
/* Box card:  6px 6px 0 var(--c-ink) ou 6px 6px 0 <cor-da-variante> */

/* ── Border-radius ───────────────────────────────────── */
/* 0px (bordas retas) em quase tudo — é deliberado */
/* Exceção: inputs têm border-radius: 4px */
```

### Tipografia — uso por elemento

| Elemento | Família | Peso | Tamanho | Transform |
|---|---|---|---|---|
| Títulos display / h1 | Archivo Black | 900 | 72–100px (landing) | uppercase |
| Títulos de seção | Archivo Black | 900 | 22–30px | uppercase |
| Labels de campo / eyebrows | Geist Mono | 500 | 10–11px | uppercase, ls 0.14–0.16em |
| Corpo / parágrafos | Geist | 400–600 | 13–17px | — |
| Botões | Archivo Black | 900 | 11–14px | uppercase |
| Badges / tags | Geist Mono | 500 | 9–11px | uppercase |
| Identificador público (6 chars) | Geist Mono | 700 | 28–36px | uppercase |

---

## Logo / Identidade

```
Logo "MA":
  Quadrado 26–36px
  Background: --c-red
  Texto: "MA" branco, Archivo Black
  Border: 2px solid --c-ink
  Box-shadow: 2px 2px 0 --c-ink
  Transform: rotate(-4deg)
```

---

## Padrão de Botão

```
Primário:   bg #E5142A · fg #fff · border 2px ink · shadow 3px 3px 0 ink
Ink/Escuro: bg #0A0907 · fg #fff · border 2px ink · shadow 3px 3px 0 red
Ghost:      bg transparent · fg ink · border 2px ink · shadow none
Perigo:     bg #fff · fg red · border 2px red · shadow 2px 2px 0 red

Font: Archivo Black · uppercase · letter-spacing 0.04em
Border-radius: 0
Hover: filter brightness(0.9) em 0.15s
Active: translateY(1px)
```

---

## Variantes de Álbum

| Enum | Label | Background | Border | Box-shadow | Tag bg | Tag fg |
|---|---|---|---|---|---|---|
| `BROCHURA` | Brochura | `#ffffff` | `1.5px solid #0A0907` | none | `#E0DDD5` | `#0A0907` |
| `CAPA_DURA` | Capa dura | `#F5F0E4` | `2px solid #0A0907` | `3px 3px 0 #C8C4BC` | `#C8C4BC` | `#0A0907` |
| `CAPA_DURA_PRATA` | Capa dura prata | listras diagonais `#F0EDE4`/`#E0DDD5` (135deg, 6px/8px) | `2px solid #0A0907` | `3px 3px 0 #9E9E9E` | `#9E9E9E` | `#fff` |
| `CAPA_DURA_OURO` | Capa dura ouro | `#FEF3CC` | `2px solid #8B6914` | `3px 3px 0 #C49A1A` | `#C49A1A` | `#fff` |
| `BOX_PREMIUM` | Box Premium | `#0A0907` (ink) | `2px solid #0A0907` | `4px 4px 0 #E5142A` | `#E5142A` | `#fff` |

> Ao selecionar variante (CA1), o visual da tela inteira se atualiza para refletir a identidade da variante escolhida (RN-CA05). No BOX_PREMIUM, texto branco sobre fundo escuro.

---

## Fluxo 1 — Landing Page + Login

**Arquivo:** `Meu Album.html` · **Fidelidade:** hi-fi  
**Artboards:** "Meu Album · padrão", "Meu Album · estadio", "Meu Album · minimal" (3 variações visuais)

### Layout geral (desktop 1440px)

```
nav (fixed, 68px, padding 20px 56px, border-bottom 2px ink)
hero (grid 1.05fr / 1fr, gap 48px, padding 72px 56px 96px)
  ├── col esquerda: eyebrow rotacionado + h1 100px + corpo + CTAs + social proof
  └── col direita: login card (ticket stub, rotação +1.5deg)
countdown band (bg ink, border-top 4px red, border-bottom 4px green, padding 56px)
stats "scoreboard" (grid 4 col, gap 4px, cada célula cream, shadow 8px 8px 0 red)
steps section (3 cards, shadow 6px 6px 0 <cor-da-etapa>, rotações alternadas)
footer (bg ink, border-top 6px red, flex space-between)
```

### Login card (ticket stub)

```
Posição: coluna direita do hero, rotate(1.5deg)
Background: #fff
Border: 2.5px solid #0A0907
Box-shadow: 8px 8px 0 #0A0907

┌─ Header (ticket) ──────────────────────────────────┐
│ bg: #0A0907 · texto branco                         │
│ Geist Mono 11px uppercase ls 0.16em                │
│ "● ABRIR ÁLBUM"  ·  "N° 0001"                     │
├─ Perfuração ────────────────────────────────────────┤
│ height 14px · bg cream · border-bottom 2.5px dashed│
│ Semicírculos ⌀20px nos extremos                    │
├─ Corpo (padding 32px 28px) ────────────────────────┤
│ h3 "Entrar": Archivo Black 30px                    │
│ Input Email + label uppercase 11px                 │
│ Input Senha + link "Esqueci" (alinhado right)      │
│ Botão primário full-width: 16px padding            │
│ Link cadastro: "Sem conta? Cadastrar grátis" green │
└────────────────────────────────────────────────────┘
```

### Navegação pós-login (card)

- **"Entrar"** → `POST /auth/login` → `/home`
- **"Cadastrar grátis"** → transição para modo cadastro no card
- **"Esqueci a senha"** → `/forgot-password`

---

## Fluxo 2 — Cadastro de Usuários + Login + Recuperação de Senha

**Arquivo:** `Meu Album.html` (seções inferiores do canvas) via `login-wf.jsx`  
**Fidelidade:** wireframe anotado

### Telas

| Tela | ID artboard | Descrição |
|---|---|---|
| L1 — Login | `l1-login` | Formulário email + senha |
| L2 — Esqueci a senha | `l2-forgot` | Campo email + estado pós-envio |
| L3 — Redefinição de senha | `l3-reset` | Nova senha + confirmação + checklist |
| L4 — Link inválido | `l4-invalid` | Estado de token expirado/usado |
| Cadastro Tela 1 | `reg-t1` | Nome + email + senha + checklist |
| Cadastro Tela 2 | `reg-t2` | Confirmação de email (magic link) + estado de erro |
| Cadastro Tela 3 | `reg-t3` | Sucesso + identificador em destaque |

### Componentes compartilhados

**LgCard** — container padrão de formulário:
```
background: #FBF8EE
border: 2.5px solid #0A0907
box-shadow: 6px 6px 0 #0A0907
padding: 28px 24px
```

**LgField** — campo de formulário:
```
label: Geist Mono 10px, uppercase, ls 0.14em, cor rgba(10,9,7,0.65)
input: 14px, padding 12px, border 1.5px solid rgba(10,9,7,0.18)
      focus: border-color red, box-shadow 0 0 0 3px rgba(229,20,42,0.18)
erro inline: texto 11px vermelho abaixo do campo
```

**Checklist de senha** (Telas: Cadastro T1, L3):
```
[ ] Mínimo de 8 caracteres
[ ] Ao menos uma letra maiúscula
[ ] Ao menos uma letra minúscula
[ ] Ao menos um número
[ ] Ao menos um caractere especial
[ ] Senhas idênticas  ← apenas em L3, ao preencher 2º campo
```
Item ativo: cor green + checkmark. Item inativo: cor mute + traço.

**Identificador (6 chars)**:
```
Display: Geist Mono 700, 28–36px, uppercase
Acompanha botão "Copiar" → confirmação visual temporária "Copiado!"
```

### Regras de negócio críticas

| Regra | Impacto |
|---|---|
| RN-06 | Confirmação exclusivamente via magic link UUID — sem digitação de código |
| RN-L01 | Erro de credenciais sempre genérico: nunca revelar qual campo falhou |
| RN-L04 | Resposta de "Esqueci" sempre igual, exista o email ou não |
| RN-L10 | "Redefinir senha" desabilitado até todos os itens do checklist atendidos |
| RN-18 | Rate limiting: 100 req/IP/min; HTTP 429 com Retry-After |
| RN-21 | JWT carrega `token_versao`; backend rejeita versão inferior ao atual |

---

## Fluxo 3 — Home (pós-login)

**Arquivo:** `Home.html` · **Fidelidade:** wireframe anotado  
**Artboards:** "Estado normal" (390px) · "Estado vazio" (390px)

### Layout geral (mobile 390px)

```
┌─ Header (60px) ──────────────────────────────────────┐
│ Logo MA | Nome + #ID6chars + Botão Logout            │
│ border-bottom 2px ink                                │
└──────────────────────────────────────────────────────┘
┌─ FAB sticky (fixed, bottom 16px, right 16px) ────────┐
│ "+ Abrir" · bg red · border 2px ink                  │
│ box-shadow 3px 3px 0 ink · z-index acima de tudo     │
└──────────────────────────────────────────────────────┘
┌─ Banner CTA "Abrir Pacotinhos" ──────────────────────┐
│ margin 16px · bg ink · border 2.5px ink              │
│ box-shadow 5px 5px 0 red · padding 22px 20px         │
│ eyebrow 10px + h2 Archivo Black 28px + p 13px        │
│ Botão "Abrir pacotinhos →": red, border ink          │
└──────────────────────────────────────────────────────┘
┌─ Seção: Meus Álbuns ─────────────────────────────────┐
│ padding 0 16px                                       │
│ Header: h2 + "+ Novo álbum" + "Ver todos"            │
│ Cards: flex-col gap 14px                             │
│ Paginação: só se > 5 álbuns (RN-H05)                 │
└──────────────────────────────────────────────────────┘
┌─ Seção: Figurinhas Repetidas ────────────────────────┐
│ Total em red Archivo Black grande                    │
│ Lista 5 itens · grid "24px 56px 1fr auto"            │
│ rank · placeholder imagem · número+nome · qty badge  │
└──────────────────────────────────────────────────────┘
┌─ Footer ─────────────────────────────────────────────┐
│ Links externos: FIFA + Panini · target="_blank"      │
└──────────────────────────────────────────────────────┘
```

### Card do Álbum (anatomia)

```
┌─ Tag variante + data de criação ───────────────────┐
│ Título: tipo_album.nome (Archivo Black 16px)       │
│ Subtítulo: nome_personalizado (Geist 12px, 60%)    │  ← RN-H13: só quando preenchido
├─ Progresso ────────────────────────────────────────┤
│ "PROGRESSO" · 68.3% (Archivo Black 22px)           │  ← RN-H02: 1 casa decimal
│ [████████████░░░░░] barra 8px                      │
├─ Ação ──────────────────────────────────────────────┤
│ [Colar figurinhas →] full-width                    │  ← RN-H12: sempre disponível
└────────────────────────────────────────────────────┘
```

**Badge de figurinhas repetidas:**
- 40×40px, bg ink (1º lugar: red), Archivo Black 18px branco

### Regras de negócio críticas

| Cód. | Regra |
|---|---|
| RN-H01 | `PENDENTE` → redirect para Confirmação de Email |
| RN-H02 | Progresso: `coladas / total × 100`, 1 casa decimal |
| RN-H03 | Sem álbuns → estado vazio + CTA |
| RN-H04 | Ordem: `criado_em DESC` |
| RN-H05/06 | Paginação só se > 5 álbuns; 5 por página |
| RN-H07/08 | Ranking estoque global; só `quantidade ≥ 1` |
| RN-H09 | Empate: `figurinha.numero ASC` |
| RN-H14 | CTA "Abrir Pacotinhos" sempre visível |

---

## Fluxo 4 — Abrir Pacotinhos

**Arquivo:** `Abrir Pacotinhos.html` · **Fidelidade:** hi-fi anotado  
**Telas:** AP0 (seleção de tipo) · AP1 (entrada + pilha) · Modal Câmera · Modal Colagem

### Artboards disponíveis

| ID | Descrição |
|---|---|
| `ap1-active` | AP1 em uso — pilha com PENDENTE / COLADA / REPETIDA / sem álbum elegível |
| `ap1-empty` | AP1 início — pilha vazia, modo Digitar |
| `ap1-error` | AP1 erro de validação — número fora do catálogo |
| `ap1-camera-mode` | AP1 modo Fotografar selecionado |
| `ap1-limit` | AP1 limite de 100 pendentes atingido (RN-AP28) |
| `ap0` | Tela AP0 — seleção de tipo de álbum |
| `mc` | Modal Câmera aberto |
| `mcol` | Modal de Colagem — 1 álbum elegível (pré-selecionado) |
| `mcol-multi` | Modal de Colagem — múltiplos álbuns elegíveis |
| `mcol-archived` | Modal de Colagem — álbum arquivado rejeitado (RN-AP27) |
| `discard-confirm` | Confirmação de descarte inline (RN-AP24) |
| `exit-alert` | Alerta de saída com pendentes (RN-AP16) |
| `resume-modal` | Modal de retomada de sessão anterior (RN-AP19) |
| `offline-banner` | Indicador de modo offline (RN-AP29) |

### AP1 — Card da pilha (anatomia)

```
PENDENTE com álbum elegível:
┌──────────────────────────────────────────────────┐
│ [ORIGEM tag] · [ELEGÍVEL tag verde]              │
│ Número · Nome do jogador                         │
│ [Colar →]  [Enviar para Repetidas]  [✕ descartar]│
└──────────────────────────────────────────────────┘

PENDENTE sem álbum elegível:
┌──────────────────────────────────────────────────┐
│ [ORIGEM tag] · [SEM ÁLBUM tag âmbar]             │
│ Número · Nome                                    │
│ [Enviar para Repetidas]  [✕ descartar]           │
└──────────────────────────────────────────────────┘

COLADA (somente leitura):
┌──────────────────────────────────────────────────┐
│ [COLADA tag green] · Nome do álbum               │
│ Número · Nome · colada_em                        │
└──────────────────────────────────────────────────┘

REPETIDA (somente leitura):
┌──────────────────────────────────────────────────┐
│ [REPETIDA tag âmbar]                             │
│ Número · Nome · adicionada ao estoque            │
└──────────────────────────────────────────────────┘
```

### Regras de negócio críticas

| Cód. | Regra |
|---|---|
| RN-AP00 | `figurinha.numero` único por `tipo_album_id` |
| RN-AP01 | Pilha persistida no backend — retomável em qualquer dispositivo |
| RN-AP21 | OCR executado localmente — nenhuma imagem vai ao backend |
| RN-AP24 | Descarte exige confirmação com número e nome da figurinha |
| RN-AP26 | Colagem via MCol usa upsert `(album_id, figurinha_id)` |
| RN-AP28 | Limite de 100 itens PENDENTES; `COLADA`/`REPETIDA` não contam |
| RN-AP29–31 | Modo offline: fila local, sync automático ao reconectar |
| RN-AP32 | Navegação no header com PENDENTES dispara alerta de saída |

---

## Fluxo 5 — Cadastro de Álbum

**Arquivo:** `Cadastro Album.html` · **Fidelidade:** hi-fi anotado  
**Telas:** CA1 (formulário) · CA2 (diálogo pós-criação)

### Artboards disponíveis

| ID | Descrição |
|---|---|
| `ca1-mobile` | CA1 mobile — variante "Capa dura ouro" selecionada |
| `ca2-mobile` | CA2 mobile — diálogo pós-criação |
| `ca1-desktop` | CA1 desktop 1280px |
| `ca2-desktop` | CA2 desktop |

### CA1 — Seleção de variante

Cada variante é um card clicável com visual próprio (ver tabela de variantes acima). Ao selecionar:
- Card recebe borda e shadow da cor de destaque da variante
- Fundo da tela/preview atualiza para o `bg` da variante (RN-CA05)
- Preço exibido como informação (não armazenado — RN-CA04)

**Botão "Criar álbum":** desabilitado até variante selecionada (RN-CA03). Não há pré-seleção.

### CA2 — Diálogo pós-criação

Modal bloqueante exibido apenas se usuário tem figurinhas no estoque (RN-CA08):

```
"Álbum criado!"
"Você tem figurinhas no seu acervo. Deseja colar agora no álbum recém-criado?"

[Colar figurinhas]  [Agora não]
```

### Regras de negócio críticas

| Cód. | Regra |
|---|---|
| RN-CA03 | `variante` obrigatório; sem pré-seleção no formulário |
| RN-CA05 | Visual da tela atualiza ao selecionar variante |
| RN-CA06 | `nome_personalizado`: max 60 chars, sanitizado, sem HTML/escape |
| RN-CA07 | Múltiplos álbuns do mesmo tipo e variante são permitidos |
| RN-CA08/09 | CA2 exibido uma única vez se estoque > 0 |

---

## Fluxo 6 — Álbuns (Gerenciamento)

**Arquivo:** `Albuns.html` · **Fidelidade:** wireframe anotado  
**Telas:** AL0 (lista) · AL1 (gerenciamento individual)

### Artboards disponíveis

| ID | Descrição |
|---|---|
| `al0-mob-normal` | AL0 mobile — ativos + arquivados |
| `al0-mob-noarchive` | AL0 mobile — sem arquivados (seção oculta, RN-AL13) |
| `al0-desk-normal` | AL0 desktop 1280px |
| `al1-mobile` | AL1 mobile — cabeçalho + barra de ações + seções |
| `al1-expanding` | AL1 mobile — seção expandida (figurinhas faltantes) |
| `al1-archive-confirm` | AL1 — confirmação de arquivamento inline |
| `al1-pdf-loading` | AL1 — estado "Gerando PDF..." (RN-AL19) |
| `al1-desktop` | AL1 desktop 1280px |

### AL1 — Barra de ações

```
[Colar figurinhas]  [Baixar PDF]  [Arquivar]

Estado "Gerando PDF":
  "Baixar PDF" → spinner + "Gerando PDF..."
  "Colar figurinhas" e "Arquivar" → desabilitados (RN-AL19)
```

### AL1 — Seções do álbum (lista)

```
┌─ Nome da seção (ex: "BRASIL") ─── 12/23 ─── [barra] ─┐
│ ▶ Expandir                       [██████░░░░░] 52.2%  │
├─ (expandida) ─────────────────────────────────────────┤
│ Lista figurinhas faltantes: número · nome             │
│ Seção completa: "✓ Seção completa"                    │
└───────────────────────────────────────────────────────┘
```

### PDF de figurinhas faltantes

- Gerado **sincronamente** (sem cache) — spinner bloqueante durante geração
- Conteúdo: identificação do álbum, data/hora, totais, lista faltantes por seção em múltiplas colunas
- Seções 100% completas omitidas (RN-AL08)
- Formato compacto: apenas número + nome, sem imagens

### Regras de negócio críticas

| Cód. | Regra |
|---|---|
| RN-AL02 | Ativo: `arquivado_em IS NULL`; arquivado: `IS NOT NULL` |
| RN-AL03 | Arquivados não aparecem em nenhum fluxo de colagem |
| RN-AL09 | Arquivamento exige confirmação; desarquivamento é direto |
| RN-AL13 | Seção de arquivados ocultada quando vazia (sem estado vazio) |
| RN-AL18/18a | Álbum arquivado não recebe colagem; erro de UX específico por fluxo |
| RN-AL19 | PDF síncrono com spinner bloqueante; demais ações desabilitadas |
| RN-AL20 | `Secao.total_figurinhas` é desnormalizado; recalcular ao alterar catálogo |

---

## Fluxo 7 — Colar Figurinhas

**Arquivo:** `Colar Figurinhas.html` · **Fidelidade:** wireframe anotado  
**Telas:** CF0 (seleção de álbum) · CF1 (colagem) · Modal MFN

### Artboards disponíveis

| ID | Descrição |
|---|---|
| `cf0-normal` | CF0 — lista de álbuns para seleção manual |
| `cf0-empty` | CF0 — estado vazio (sem álbuns cadastrados, RN-CF04) |
| `cf1-normal` | CF1 — 3 estados de elegibilidade no estoque |
| `cf1-colar-cima` | CF1 — confirmação inline "colar por cima" (RN-CF09) |
| `cf1-estoque-vazio` | CF1 — estoque vazio (MFN permanece disponível) |
| `mfn-digitar` | Modal MFN — modo digitação |
| `mfn-camera` | Modal MFN — modo câmera |
| `cf1-desktop` | CF1 desktop 1280px |

### CF1 — Indicadores de elegibilidade

| Estado | Condição | Visual |
|---|---|---|
| **Pode colar** | Figurinha não está em `FigurinhaColada` do álbum ativo | Badge verde |
| **Já colada** | Figurinha já em `FigurinhaColada` do álbum ativo | Badge âmbar + ícone de aviso |
| **Fora do catálogo** | `figurinha.tipo_album_id` ≠ álbum ativo | Item desabilitado |

### Alerta "colar por cima" (RN-CF09)

```
Exibido inline no item (ou modal leve):
"Esta figurinha já está colada neste álbum. 
 Colar novamente irá substituir o registro anterior. Confirmar?"

[Confirmar]  [Cancelar]
```

### Regras de negócio críticas

| Cód. | Regra |
|---|---|
| RN-CF00 | Par `(album_id, figurinha_id)` único em `FigurinhaColada` |
| RN-CF01 | Apenas `ATIVO` acessa; `PENDENTE` → redirect Confirmação de Email |
| RN-CF09 | "Colar por cima" exige confirmação explícita |
| RN-CF10 | Colar do estoque: decrementa `EstoqueFigurinha.quantidade`; se = 0, sai da lista |
| RN-CF11 | MFN (figurinha não registrada): `EstoqueFigurinha` não é alterado |
| RN-CF15 | Progresso atualizado após cada colagem sem reload completo |
| RN-CF17 | Cada colagem é individual e imediata — sem lote, sem sessão backend |
| RN-CF18 | Sem alerta de saída — este fluxo não tem pilha persistida |

---

## Fluxo 8 — Perfil do Usuário

**Arquivo:** `Perfil do Usuario.html` · **Fidelidade:** wireframe anotado  
**Telas:** P1 (perfil/configurações) · P2 (confirmação alteração de email)

### Artboards disponíveis

| ID | Descrição |
|---|---|
| `p1-mob-normal` | P1 mobile — status ATIVO |
| `p1-mob-email-pending` | P1 mobile — EMAIL_PENDENTE (aviso de alteração aguardando) |
| `p1-mob-delete` | P1 mobile — confirmação de exclusão expandida |
| `p1-desk-normal` | P1 desktop 1280px |
| `p1-desk-email-pending` | P1 desktop — EMAIL_PENDENTE |
| `p2-success` | P2 — confirmação de alteração bem-sucedida |
| `p2-error` | P2 — link inválido/expirado |

### P1 — Seções

**1. Identificador (somente leitura)**
```
Código 6 chars — Geist Mono 700, 28px, uppercase
Botão "Copiar" → "Copiado!" temporário
Texto: "Este código é público e identifica você na plataforma."
```

**2. Nome**
- Campo pré-preenchido; "Salvar" habilitado apenas se valor diferente e não-vazio (RN-P05)

**3. Email — variações por status**

| Status | Comportamento |
|---|---|
| `ATIVO` | Campo email + "Salvar". Cooldown 5min entre alterações (RN-P12) |
| `EMAIL_PENDENTE` | Campo email + aviso de pendência: email mascarado, countdown, "Reenviar", "Cancelar alteração" |
| `PENDENTE` | Campo substitui `email` diretamente; reenvia magic link de cadastro |

**4. Senha**
```
Campos: Senha atual · Nova senha (+ checklist) · Confirmar
Link "Esqueci minha senha" → /forgot-password (sem encerrar sessão)
"Alterar senha" habilitado só com todos checklist items ✓ (RN-P21)
Troca de senha invalida outras sessões; mantém sessão corrente (RN-P22/22a)
```

**5. Excluir conta (seção destrutiva)**
```
Botão "Excluir minha conta" — estilo vermelho/alerta
↓ expandido:
"Esta ação é permanente e não pode ser desfeita. [...]
 Para confirmar, digite seu identificador abaixo."
Campo: identificador (6 chars)
"Confirmar exclusão" — desabilitado até identificador == Usuário.identificador
```

### Regras de negócio críticas

| Cód. | Regra |
|---|---|
| RN-P03 | "Copiar" identificador exibe confirmação visual temporária |
| RN-P12 | Cooldown 5min cobre tanto "Reenviar" quanto nova solicitação de email |
| RN-P24/25 | Exclusão exige digitação do identificador exato (case-insensitive após maiúsculas) |
| RN-P26 | Hard delete em cascata: Usuário, Álbuns, FigurinhaColada, EstoqueFigurinha, Pilha, Tokens |
| RN-P27 | Pós-exclusão: redirect landing com mensagem "Sua conta foi excluída." |

---

## Modelo de Dados — Mapa de Entidades

```
Usuário (identificador PK, nome, email, senha_hash, status, token_versao,
         ultimo_envio_em, confirmado_em, email_pendente, ultimo_envio_email_pendente_em)

TipoAlbum (id, nome, total_figurinhas [desnorm.])

Figurinha (id, numero, nome, tipo_album_id FK, secao_id FK)

Secao (id, tipo_album_id FK, nome, ordem, total_figurinhas [desnorm.])

Álbum (id, usuario_id FK, tipo_album_id FK, variante ENUM, nome_personalizado,
       criado_em, arquivado_em)
       variante: BROCHURA | CAPA_DURA | CAPA_DURA_PRATA | CAPA_DURA_OURO | BOX_PREMIUM
       default: BROCHURA

FigurinhaColada (id, album_id FK, figurinha_id FK, colada_em, origem ENUM)
       UNIQUE (album_id, figurinha_id)
       origem: ESTOQUE | DIRETA

EstoqueFigurinha (id, usuario_id FK, figurinha_id FK, quantidade >= 0)
       UNIQUE (usuario_id, figurinha_id)

PilhaSessao (entrada_id PK, usuario_id FK, tipo_album_id FK, figurinha_id FK,
             figurinha_numero, figurinha_nome, origem, status_destino, criado_em)
       origem: DIGITACAO | CAMERA
       status_destino: PENDENTE | COLADA | REPETIDA

TokenConfirmacaoCadastro (token UUID PK, usuario_identificador FK, criado_em,
                          expira_em [+24h], usado_em)

TokenOperacao (token UUID PK, usuario_identificador FK, tipo ENUM, email_novo,
               criado_em, expira_em [+2h], usado_em)
       tipo: RECUPERACAO_SENHA | ALTERACAO_EMAIL
```

---

## Rotas / Navegação

| Rota | Fluxo | Acesso |
|---|---|---|
| `/` | Landing + Login | Público |
| `/register` | Cadastro Tela 1 | Público |
| `/confirm-email` | Cadastro Tela 2 | Público (link do email) |
| `/confirmar-cadastro?token=<UUID>` | Confirmação magic link | Público |
| `/forgot-password` | Esqueci a senha (L2) | Público |
| `/redefinir-senha?token=<UUID>` | Redefinição (L3/L4) | Público |
| `/confirmar-email?token=<UUID>` | Confirmação alteração de email (P2) | Público |
| `/home` | Home | ATIVO · EMAIL_PENDENTE |
| `/packs/open` | Abrir Pacotinhos (AP0/AP1) | ATIVO · EMAIL_PENDENTE |
| `/albums/new` | Cadastro de Álbum (CA1/CA2) | ATIVO · EMAIL_PENDENTE |
| `/albums` | Lista de Álbuns (AL0) | ATIVO · EMAIL_PENDENTE |
| `/albums/:id` | Gerenciamento (AL1) | ATIVO · EMAIL_PENDENTE |
| `/albums/:id/stickers` | Colar Figurinhas (CF1) | ATIVO |
| `/stickers` | Colar Figurinhas sem contexto (CF0) | ATIVO |
| `/profile` | Perfil do Usuário (P1) | ATIVO · EMAIL_PENDENTE · PENDENTE (via link) |

---

## Interações e Animações

| Elemento | Comportamento |
|---|---|
| Botões | hover `filter: brightness(0.9)` 0.15s ease; active `translateY(1px)` |
| Cards de álbum | hover `translateY(-2px)` 0.15s ease |
| FAB (Home) | hover: `box-shadow` expand |
| Input focus | `border-color red` + `box-shadow 0 0 0 3px rgba(229,20,42,0.18)` |
| Feedback inline (salvo/copiado) | aparece instantaneamente, desaparece após ~2s |
| Countdown de cooldown | atualiza a cada segundo (`setInterval`) |
| Checklist senha | atualiza em `onChange` / `onInput` do campo |
| Progresso CF1 | atualiza inline após cada colagem sem reload |

---

## Estados de Carregamento e Erro (padrão global)

| Situação | Comportamento |
|---|---|
| Carregamento de dados | Skeleton/placeholder nas seções afetadas |
| Falha de API | Mensagem de erro inline + botão "Tentar novamente" |
| Sessão expirada (JWT `token_versao` inválido) | Redirect automático para `/login` |
| Rate limit (HTTP 429) | Mensagem com tempo restante do `Retry-After` header |

---

## Assets

| Asset | Status | Especificação |
|---|---|---|
| Logo "MA" | Inline CSS/SVG | Quadrado ink + texto branco, rotate(-4deg) — ver seção Logo acima |
| Imagens de figurinhas | **A produzir** | Placeholder `56×72px` (seção Repetidas na Home). Formato: foto do jogador em moldura estilo Panini |
| Ícones | Inline SVG simples | Logout (seta), check (progresso), câmera, ×, setas de paginação — simples o suficiente para reimplementar |

---

## Arquivos deste Pacote

| Arquivo | Tipo | Descrição |
|---|---|---|
| `Meu Album.html` | Hi-fi prototype | Landing + Login + Cadastro + Recuperação de Senha |
| `Home.html` | Wireframe anotado | Home pós-login |
| `Abrir Pacotinhos.html` | Hi-fi anotado | Fluxo completo de abertura de pacotinhos |
| `Cadastro Album.html` | Hi-fi anotado | Formulário CA1 + diálogo CA2 |
| `Albuns.html` | Wireframe anotado | AL0 (lista) + AL1 (gerenciamento) |
| `Colar Figurinhas.html` | Wireframe anotado | CF0 + CF1 + Modal MFN |
| `Perfil do Usuario.html` | Wireframe anotado | P1 (configurações) + P2 (confirmação email) |
| `styles.css` | Tokens CSS | Design tokens compartilhados — migrar para design system do projeto |
| `variations/pack.jsx` | JSX | Componentes hi-fi da landing — fonte visual definitiva |
| `login-wf.jsx` | JSX | Wireframes: Login · Recuperação · Cadastro de Usuários |
| `abrir-pacotinhos.jsx` | JSX | Componentes hi-fi: AP0 · AP1 · modais |
| `cadastro-album.jsx` | JSX | Componentes hi-fi: CA1 · CA2 |
| `home-wf.jsx` | JSX | Componentes wireframe: Home |
| `albuns-wf.jsx` | JSX | Componentes wireframe: AL0 · AL1 |
| `colar-figurinhas-wf.jsx` | JSX | Componentes wireframe: CF0 · CF1 · MFN |
| `perfil-wf.jsx` | JSX | Componentes wireframe: P1 · P2 |
| `design-canvas.jsx` | JSX (suporte) | Canvas pan/zoom — ignorar na implementação |
| `tweaks-panel.jsx` | JSX (suporte) | Painel de tweaks — ignorar na implementação |
| `app.jsx` | JSX (suporte) | Mount point — ignorar na implementação |

---

## Notas para o Claude Code

1. **Tokens CSS** em `styles.css` devem ser migrados para o sistema de design do projeto (Tailwind config, CSS-in-JS theme, design tokens, etc.).

2. **Sombra flat** (`Npx Npx 0 <cor>`) é deliberada. Não substituir por `box-shadow` com blur. É o padrão visual de toda a aplicação.

3. **Bordas retas** (`border-radius: 0`) em praticamente todos os elementos — é escolha de design. Exceção: inputs usam `border-radius: 4px`.

4. **`text-transform: uppercase`** é usado extensivamente em labels mono e elementos display.

5. **Variantes de álbum** precisam de um mapa de estilos no frontend — ver tabela "Variantes de Álbum" acima.

6. **FAB da Home** deve ser `position: fixed` com `z-index` acima do header.

7. **`token_versao`** deve ser validado em **toda** requisição autenticada — overhead de leitura adicional é inerente ao design.

8. **Pilha da Sessão** (Abrir Pacotinhos) é persistida no backend por `usuario_id` — não é estado de cliente. Retomável entre dispositivos.

9. **PDF (AL1)** é gerado sincronamente no backend; o frontend aguarda a resposta antes de restaurar a UI.

10. **OCR** (Modal Câmera, Abrir Pacotinhos e MFN em Colar Figurinhas) deve rodar localmente no cliente — nenhuma imagem é enviada ao backend (RN-AP21).

11. **Progressos e contadores** que mudam por interação (CF1, Home) devem atualizar sem reload completo — invalidar/atualizar query específica no cache do cliente.

12. **Breakpoint desktop:** a maioria dos fluxos tem layout sidebar + conteúdo para ≥ 1024px (sidebar fixa de 228px). Verificar artboards "Desktop" em cada arquivo.
