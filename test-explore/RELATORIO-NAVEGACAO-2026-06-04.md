# Relatório de Navegação Exploratória — MeuAlbum

**Data:** 2026-06-04  
**Usuário testado:** user@test.mail  
**Viewports:** Mobile 375×812 · Desktop 1440×900  
**Ferramenta:** Playwright MCP (browser headless)  
**Referência:** `docs/design_handoff/README.md` + `docs/design_handoff/specs/`

---

## Sumário Executivo

A aplicação está funcional nos fluxos principais (login, criação de álbum, abrir pacotinhos, colar figurinhas, perfil). Foram identificados **2 bugs ativos**, **1 divergência de implementação** e **4 pontos de atenção menores**. Nenhum erro crítico impede o uso da aplicação. O layout desktop com sidebar funciona corretamente. O layout mobile é funcional.

---

## Erros de Console

| Severidade | Mensagem | Ocorrência | Avaliação |
|---|---|---|---|
| ⚠️ 404 | `GET /api/v1/pilha` | 3× na tela Abrir Pacotinhos | **Impacto real** — impossibilita retomada de sessão anterior (RN-AP01) |
| ℹ️ 404 | `GET /favicon.ico` | 1× na landing | Cosmético |
| ℹ️ 401 | `GET /api/v1/auth/me` | 2× na landing (usuário não autenticado) | Esperado — verificação de sessão |

### Detalhe: 404 em `/api/v1/pilha`

A rota `GET /api/v1/pilha` existe em `server/src/routes/abrir-pacotinhos.ts:15` e está montada em `server/src/index.ts:45` como `app.use('/api/v1', abrirPacotinhosRouter)`. O erro 404 ocorre ao carregar a página `/abrir`, indicando que o servidor não está servindo essa rota corretamente — possivelmente problema de build/hot-reload do servidor em dev. As operações subsequentes (POST para adicionar à pilha) funcionaram normalmente.

---

## Fluxo: Landing + Login

**Viewport:** Mobile e Desktop  
**Screenshot:** `01-landing-mobile.png`

| # | Observação | Tipo | Spec Ref |
|---|---|---|---|
| L1 | Login funciona corretamente — credenciais aceitas, redirecionamento para `/home` | ✅ OK | — |
| L2 | Cookie banner exibido na primeira visita com 3 opções (Aceitar essenciais / Gerenciar / Rejeitar) | ✅ OK | spec_privacidade_lgpd |
| L3 | Link "Pular para o conteúdo" presente como primeiro elemento focável | ✅ OK | RN-H26 |
| L4 | Stats do "scoreboard" na landing exibem **980 figurinhas** — número desatualizado, catálogo real tem 994. **Corrigir na landing page.** | ⚠️ Pendente código | Spec atualizada (v1.6) |
| L5 | Desktop: layout hero 2 colunas com login card à direita — conforme spec | ✅ OK | Fluxo 1 — Layout geral desktop |

---

## Fluxo: Home (`/home`)

**Viewport:** Mobile e Desktop  
**Screenshots:** `02-home-mobile.png`, `02b-home-mobile-full.png`, `D01-home-desktop.png`

| # | Observação | Tipo | Spec Ref |
|---|---|---|---|
| H1 | Header exibe email do usuário (`user@test.mail`) em vez do nome — **usuário de teste foi cadastrado com email no campo nome**. Não é bug de código. | ℹ️ Dado de teste | — |
| H2 | FAB `+ Abrir` fixo na parte inferior — posicionamento correto | ✅ OK | RN-H14 |
| H3 | CTA "Abrir Pacotinhos" exibido em destaque acima da seção de álbuns | ✅ OK | RN-H14 |
| H4 | Estado vazio da seção "Meus Álbuns" com CTA de criação — correto | ✅ OK | RN-H03 |
| H5 | Após criar álbum, card aparece imediatamente na Home sem precisar recarregar | ✅ OK | RN-H28 |
| H6 | Footer da Home sem links FIFA/Panini — **intencional por direitos autorais**. Spec atualizada (v1.6). | ✅ OK | RN-H25 descontinuado |
| H7 | `<title>` da página Home (`/home`) é "Início — Meu Álbum Copa 2026" — idêntico ao da landing | ⚠️ Menor | — |
| H8 | Seção "Figurinhas Repetidas" exibe estado vazio corretamente quando estoque = 0 | ✅ OK | RN-H11 |
| H9 | Card de álbum mostra variante ("Brochura"), data de criação, progresso e botão "Colar figurinhas →" | ✅ OK | RN-H16, RN-H12 |
| H10 | Progresso atualizado para 0.1% após colar 1 figurinha de 994 | ✅ OK | RN-H02 |
| H11 | Desktop: sidebar de navegação lateral com links para todas as seções presentes | ✅ OK | — |

---

## Fluxo: Novo Álbum (`/albums/novo`)

**Viewport:** Mobile e Desktop  
**Screenshots:** `03-novo-album-mobile.png`, `04-novo-album-brochura.png`

| # | Observação | Tipo | Spec Ref |
|---|---|---|---|
| CA1 | Botão "Criar álbum" desabilitado até selecionar variante — correto | ✅ OK | RN-CA03 |
| CA2 | Seleção de variante habilita o botão imediatamente | ✅ OK | RN-CA03 |
| CA3 | Após criar álbum (estoque = 0), o modal CA2 não foi exibido — correto | ✅ OK | RN-CA08 |
| CA4 | Redirecionamento para Home após criação do álbum — correto | ✅ OK | — |
| CA5 | Total de figurinhas exibido como "994" — correto após atualização de spec | ✅ OK | Spec v1.6 |

---

## Fluxo: Abrir Pacotinhos (`/abrir`)

**Viewport:** Mobile e Desktop  
**Screenshots:** `06-abrir-pacotinhos-mobile.png`, `07-abrir-pilha-ativa.png`, `08-modal-colar.png`, `D05-abrir-pacotinhos-desktop.png`

| # | Observação | Tipo | Spec Ref |
|---|---|---|---|
| AP1 | Tela AP0 ausente com 1 tipo de álbum cadastrado — **comportamento correto**. Spec atualizada com RN-AP43: AP0 é pulada quando há apenas 1 `TipoAlbum`. | ✅ OK | RN-AP43 (novo, v1.6) |
| AP2 | **BUG-03:** `GET /api/v1/pilha` retorna 404 ao carregar a página — pilha anterior não é recuperada (RN-AP01 violado). | 🔴 Bug ativo | RN-AP01 |
| AP3 | Figurinhas com número inválido (ex.: "1", "100") mostram erro inline descritivo | ✅ OK | RN-AP04 |
| AP4 | Figurinha `FWC1` adicionada com sucesso; card exibe tags "Digitação" e "Elegível" | ✅ OK | AP1 card anatomy |
| AP5 | Ações "Colar →", "Enviar para Repetidas" e "✕ Descartar" presentes para PENDENTE elegível | ✅ OK | AP1 card anatomy |
| AP6 | Modal de colagem (MCol) abre com álbum pré-selecionado quando há 1 álbum | ✅ OK | Spec MCol |
| AP7 | Colagem confirmada com sucesso; feedback "Figurinha colada!" exibido via `role="status"` | ✅ OK | — |
| AP8 | "Enviar para Repetidas" funciona | ✅ OK | — |
| AP9 | **BUG-04:** Confirmação de descarte não exibe o número e nome da figurinha — card mostra apenas "Confirmar descarte" e "Cancelar" sem identificar qual figurinha será descartada. | 🔴 Bug ativo | RN-AP24 |
| AP10 | Botões "Todas P/ Repetidas" e "Limpar pilha" aparecem ao ter itens na pilha | ✅ OK | — |
| AP11 | Botão "Fotografar" presente para modo câmera | ✅ OK | — |

---

## Fluxo: Lista de Álbuns (`/albums`)

**Viewport:** Mobile e Desktop  
**Screenshots:** `09-albums-lista-mobile.png`, `D02-albums-desktop.png`

| # | Observação | Tipo | Spec Ref |
|---|---|---|---|
| AL1 | Seção "Ativos (N)" com contagem correta | ✅ OK | RN-AL02 |
| AL2 | Progresso do álbum exibido na listagem (0.1%) | ✅ OK | — |
| AL3 | Botões "Gerenciar", "Colar figurinhas" e "Baixar PDF" presentes no card | ✅ OK | — |
| AL4 | Seção "Arquivados" não exibida quando vazia | ✅ OK | RN-AL13 |

---

## Fluxo: Gerenciamento de Álbum (`/albums/:id`)

**Viewport:** Mobile e Desktop  
**Screenshots:** `10-album-gerenciar-mobile.png`, `11b-album-secao-expandida-full.png`, `D03-album-gerenciar-desktop.png`, `D04-album-secao-expandida-desktop.png`

| # | Observação | Tipo | Spec Ref |
|---|---|---|---|
| AL5 | `<title>` da página genérico "Meu Álbum Copa 2026" — não inclui nome do álbum | ⚠️ Menor | — |
| AL6 | Barra de ações com "Colar figurinhas", "Baixar PDF" e "Arquivar" — correto | ✅ OK | AL1 barra de ações |
| AL7 | Accordeon de seções recolhido por padrão, com nome e progresso (ex.: "Página Inicial 1/9") | ✅ OK | AL1 seções |
| AL8 | Seção expandida exibe grid de figurinhas com FWC1 marcada como colada | ✅ OK | AL1 grid |

---

## Fluxo: Colar Figurinhas (`/colar`)

**Viewport:** Mobile e Desktop  
**Screenshots:** `12-colar-figurinhas-mobile.png`, `13-colar-cf1-mobile.png`, `D06-colar-desktop.png`

| # | Observação | Tipo | Spec Ref |
|---|---|---|---|
| CF1 | Implementação usa rota única `/colar` com query param opcional `?albumId=`: sem param → CF0 (lista de álbuns); com param → CF1 (colagem direta). Spec atualizada para refletir isso. | ✅ OK | Spec rotas v1.6 |
| CF2 | CF0 exibe lista de álbuns para seleção | ✅ OK | CF0 normal |
| CF3 | CF1 exibe estoque com 1 figurinha (FWC2) disponível — badge "Pode colar" e quantidade | ✅ OK | CF1 |
| CF4 | Buscador e botão "Colar figurinha não registrada" (MFN) presentes | ✅ OK | RN-CF11 |
| CF5 | Progresso "0.1% completo" exibido e atualiza após colagem | ✅ OK | RN-CF15 |

---

## Fluxo: Perfil (`/perfil`)

**Viewport:** Mobile e Desktop  
**Screenshots:** `14-perfil-mobile.png`, `D07-perfil-desktop.png`

| # | Observação | Tipo | Spec Ref |
|---|---|---|---|
| P1 | Identificador "62ILAW" em destaque com botão "Copiar identificador" | ✅ OK | P1 — Seção 1 |
| P2 | Campo "Nome" exibe email — dado de teste (usuário cadastrado com email no campo nome) | ℹ️ Dado de teste | — |
| P3 | **BUG-05:** Campo de email no perfil sempre exibe input editável (status ATIVO). Spec define campo pré-preenchido somente leitura com botão "Salvar" separado. | 🔴 Bug ativo | P1 — Seção 3 (status ATIVO) |
| P4 | Seção "Privacidade e Dados" com exportação LGPD | ✅ OK | LGPD |
| P5 | Seção "Excluir minha conta" presente | ✅ OK | P1 — Seção 5 |
| P6 | "Alterar senha" desabilitado enquanto campos não preenchidos | ✅ OK | RN-P21 |
| P7 | "Gerenciar cookies" abre `/perfil#cookies` (âncora na página de perfil) | ℹ️ OK | spec_privacidade_lgpd RN-PR16 |

---

## Tela: Trocas (`/trocas`)

| # | Observação | Tipo |
|---|---|---|
| T1 | Página exibe "EM BREVE" com prévia do fluxo. Link visível na sidebar desktop. | ℹ️ Funcionalidade pendente |

---

## Acessibilidade (WCAG 2.0 AA)

| # | Observação | Status |
|---|---|---|
| A1 | Link "Pular para o conteúdo" como primeiro elemento focável em todas as páginas | ✅ OK |
| A2 | Barra de progresso com `role="progressbar"` | ✅ OK |
| A3 | Links externos com "(abre em nova aba)" no footer | ✅ OK |
| A4 | Identificador com `aria-label` descritivo no perfil | ✅ OK |
| A5 | Artigos da pilha com `aria-label` descritivo (ex.: "Figurinha FWC1, status: PENDENTE") | ✅ OK |
| A6 | `role="alert"` para erro de figurinha não encontrada | ✅ OK |
| A7 | `role="status"` para feedback de colagem bem-sucedida | ✅ OK |

---

## Bugs Ativos para Correção

| ID | Descrição | Página | Spec Ref |
|---|---|---|---|
| BUG-03 | `GET /api/v1/pilha` retorna 404 — pilha anterior não é recuperada ao abrir a tela | `/abrir` | RN-AP01 |
| BUG-04 | Confirmação de descarte não exibe número/nome da figurinha antes de confirmar | `/abrir` | RN-AP24 |
| BUG-05 | Campo de email no perfil (status ATIVO) sempre editável — deveria ser somente leitura com botão "Salvar" separado | `/perfil` | P1 — Seção 3 |

---

## Especificações Atualizadas nesta Revisão

| Arquivo | Versão | O que mudou |
|---|---|---|
| `docs/spec_abrir_pacotinhos.md` | v1.6 | **RN-AP43 adicionado:** AP0 é pulada quando há apenas 1 `TipoAlbum` no catálogo |
| `docs/design_handoff/specs/spec_abrir_pacotinhos.md` | — | Mesmo ajuste do RN-AP43 |
| `docs/spec_home_albums.md` | v1.6 | Total de figurinhas 980→994; footer sem links FIFA/Panini (removidos por direitos autorais); RN-H25 descontinuado |
| `docs/design_handoff/README.md` | — | Tabela de rotas atualizada: `/abrir`, `/albums/novo`, `/colar`, `/colar?albumId=:id`, `/perfil` |

---

## Pontos de Atenção Menores (não bloqueantes)

| ID | Descrição |
|---|---|
| ATN-01 | `<title>` da Home (`/home`) idêntico ao da landing ("Início — Meu Álbum Copa 2026") |
| ATN-02 | `<title>` da página `/albums/:id` genérico — não inclui nome do álbum |
| ATN-03 | Landing page ainda exibe "980 figurinhas" nos stats — deve ser atualizada para 994 |
| ATN-04 | Módulo "Trocas" visível no menu desktop mas sem implementação (EM BREVE) |

---

## Screenshots Capturados

| Arquivo | Viewport | Descrição |
|---|---|---|
| `01-landing-mobile.png` | 375px | Landing page |
| `02-home-mobile.png` | 375px | Home — estado vazio de álbuns |
| `02b-home-mobile-full.png` | 375px | Home — página inteira |
| `03-novo-album-mobile.png` | 375px | Novo Álbum — sem variante selecionada |
| `04-novo-album-brochura.png` | 375px | Novo Álbum — Brochura selecionada |
| `05-home-com-album.png` | 375px | Home — após criar álbum |
| `06-abrir-pacotinhos-mobile.png` | 375px | Abrir Pacotinhos — pilha vazia |
| `07-abrir-pilha-ativa.png` | 375px | Abrir Pacotinhos — FWC1 na pilha |
| `08-modal-colar.png` | 375px | Modal de colagem (MCol) |
| `09-albums-lista-mobile.png` | 375px | Lista de álbuns (AL0) |
| `10-album-gerenciar-mobile.png` | 375px | Gerenciamento de álbum (AL1) |
| `11-album-secao-expandida.png` | 375px | AL1 — seção expandida (viewport) |
| `11b-album-secao-expandida-full.png` | 375px | AL1 — seção expandida (full page) |
| `12-colar-figurinhas-mobile.png` | 375px | CF0 — seleção de álbum |
| `13-colar-cf1-mobile.png` | 375px | CF1 — estoque com figurinha |
| `14-perfil-mobile.png` | 375px | Perfil (P1) |
| `D01-home-desktop.png` | 1440px | Home desktop com sidebar |
| `D02-albums-desktop.png` | 1440px | Lista de álbuns desktop |
| `D03-album-gerenciar-desktop.png` | 1440px | AL1 desktop |
| `D04-album-secao-expandida-desktop.png` | 1440px | AL1 desktop — seção expandida |
| `D05-abrir-pacotinhos-desktop.png` | 1440px | Abrir Pacotinhos desktop |
| `D06-colar-desktop.png` | 1440px | Colar Figurinhas desktop |
| `D07-perfil-desktop.png` | 1440px | Perfil desktop |
| `D08-trocas-desktop.png` | 1440px | Trocas desktop (EM BREVE) |
