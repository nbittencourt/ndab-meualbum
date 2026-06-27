# Roadmap de Produto — MeuAlbum Copa 2026

> Documento vivo. Atualizado em 2026-06-21 com base no roadmap anterior (2026-06-13) e nas issues abertas no GitHub (#3, #35, #38, #39).
> Versão anterior arquivada em [`_hist/20260621/ROADMAP.md`](_hist/20260621/ROADMAP.md).
> Hierarquia de fontes: design handoff > specs canônicas > implementação atual.
> Cada milestone acionável tem um plano de sprint detalhado em [`docs/sprint/`](sprint/).

---

## Estado atual

A aplicação cobre os fluxos principais: autenticação completa (cadastro com confirmação de e-mail, login, recuperação e alteração de senha/e-mail), gestão de álbuns (CRUD, variantes, arquivamento, popup de figurinhas que faltam com impressão A4), Abrir Pacotinhos (pilha persistida no backend, câmera OCR client-side), Colar Figurinhas (estoque, colagem direta, colagem rápida na AL1), perfil (exportação LGPD, exclusão de conta) e consentimento de cookies. O M1 (Qualidade e Conformidade) foi concluído em 2026-06-13.

Quatro issues abertas no GitHub orientam o foco de curto prazo: dois bugs em funcionalidades já lançadas (câmera #3 e status de colagem #35), uma melhoria de compartilhamento (#39) e um item de higiene de build (#38).

---

## Visão geral dos milestones

| Milestone | Foco | Status | Sprint |
|---|---|---|---|
| M1 | Qualidade e Conformidade | ✅ Concluído (2026-06-13) | — |
| M2 | Correção de Bugs Críticos (#3, #35) | 🔴 Prioridade máxima | [`20260621_plano-issues-3-35.md`](sprint/20260621_plano-issues-3-35.md) |
| M3 | PWA, Performance & Higiene de Build (P1–P5, #38) | ⏳ Planejado | [`20260621_plano-pwa-performance.md`](sprint/20260621_plano-pwa-performance.md) |
| M4 | Compartilhamento (#39) | ⏳ Planejado | [`20260621_plano-issue-39.md`](sprint/20260621_plano-issue-39.md) |
| M5 | Sistema de Trocas (TR1–TR6) | 🔒 Bloqueado por spec + handoff | [`20260621_plano-sistema-trocas.md`](sprint/20260621_plano-sistema-trocas.md) |
| M6 | Backlog de Novas Funcionalidades | 💤 Backlog | — |

---

## M1 — Qualidade e Conformidade ✅ CONCLUÍDO (2026-06-13)

Foco: eliminar dívidas técnicas bloqueantes e garantir conformidade legal.
Incluiu o bug-fix da Issue #23 (limpeza da pilha — RN-AP17). Status final:
87 testes de integração no servidor + suíte E2E completa verdes.

**Dívidas de alta prioridade:** N+1 query na Home/Álbuns → aggregation única (`server/src/lib/albumProgress.ts`); `VARIANT_STYLES` consolidado em `client/src/lib/albumVariant.ts`; `asyncHandler` em todas as rotas; paginação opt-in em `GET /albums` e `GET /estoque`; remoção de código morto (`PasswordResetToken`, `Collection`, `AlbumPage.tsx`).

**Conformidade LGPD:** purga com registro de eliminação (`POST /api/v1/admin/purga` + `server/src/lib/purga.ts`, `RegistroEliminacao`); página `/politica-de-privacidade`; documento LIA em `docs/legal/lia_analytics_logs.md`.

**Conformidade WCAG:** `tests/a11y/axe.spec.ts` sem violações AA; `tests/a11y/teclado.spec.ts` (skip link, foco em modal, banner); CTAs da Home como links estilizados.

**Testes de integração do backend:** supertest + mongodb-memory-server; `createApp()` extraído; edge cases de exclusão/exportação LGPD.

---

## M2 — Correção de Bugs Críticos (NOVO — prioridade máxima)

Foco: corrigir bugs em funcionalidades já lançadas que quebram fluxos core de captura e colagem. Detalhamento em [`sprint/20260621_plano-issues-3-35.md`](sprint/20260621_plano-issues-3-35.md).

| # | Item | Arquivo(s) | Notas |
|---|------|-----------|-------|
| #3 | **Câmera não abre / OCR inválido** — vídeo preto após autorização e leitura fantasma (`"2"`) | `client/src/components/CameraModal.tsx` | `video.play()` explícito + gate por `loadedmetadata`; validar confiança/formato do Tesseract |
| #35 | **Figurinha colada não reconhecida** — status "Pode colar" devendo ser "Colada"; pills por álbum | `server/src/routes/colar-figurinhas.ts`, `client/src/pages/ColarFigurinhasPage.tsx`, `client/src/components/StickerStatusBadge.tsx` | Estado de colagem agregado multi-álbum + pill por card na seleção |

---

### M2 — Correções, Compartilhamento e Performance ✅ CONCLUÍDO (2026-06-27)

> Revisado em 2026-06-22. O M2 original ("PWA e Performance", P1–P5) foi reavaliado contra
> as specs e a implementação atual. Dois itens ficaram **obsoletos** após as issues #29/#30
> (geração de PDF Puppeteer substituída por impressão client-side `window.print()`), e o
> escopo de virtualização apontava para código fora de rota. O milestone passou a combinar
> PWA/performance enxutos + 2 bugs (#3, #35) e 2 features (#39, #43).
> Plano de implementação detalhado: [`docs/sprint/20260622_plano-m2-issues-3-35-39-43.md`](sprint/20260622_plano-m2-issues-3-35-39-43.md).

**Foco:** descontinuar o OCR, corrigir o status de figurinha colada, compartilhamento de
faltantes por link público e ganhos de PWA/performance ainda pendentes.

#### Bugs e features (issues)

| # | Item | Arquivo(s) principais | Status |
|---|------|-----------|-------|
| #3 | **Descontinuar OCR/câmera.** Remover `CameraModal`, dep `tesseract.js`, modo "Fotografar" e botões "Abrir câmera"; MFN passa a ser só digitação | `client/src/components/CameraModal.tsx`, `client/src/pages/FigurinhasPage.tsx`, `client/package.json` | ✅ |
| #35 | **Status de figurinha colada.** `GET /estoque` sem `albumId` marca tudo como "Pode colar"; computar status agregado por tipo de álbum e expor pills "colada" por álbum na seleção | `server/src/routes/colar-figurinhas.ts`, `client/src/pages/FigurinhasPage.tsx`, `shared/src/types/sticker.ts` | ✅ |
| #43 | **"+ Repetidas" rápido.** Card colado no grid AL1 ganha botão "+ Repetidas" (3/4) à esquerda do menu `⋮` (1/4); incrementa o bolo de repetidas | `client/src/pages/AlbumManagePage.tsx`, `server/src/routes/colar-figurinhas.ts` | ✅ |
| #39 | **Compartilhar faltantes por link.** Botão gera link único (UUID **persistido/reutilizado**) → página pública sem auth com a lista de faltantes (layout de impressão) | `server/src/models/Album.ts` (`shareToken`), `server/src/routes/public.ts`, `client/src/pages/FaltantesPublicaPage.tsx` | ✅ |

#### PWA / Performance (reavaliados)

| # | Item | Arquivo(s) | Status |
|---|------|-----------|-------|
| P1 | `runtimeCaching` no Workbox para GETs de catálogo/álbuns (stale-while-revalidate) | `client/vite.config.ts` | ✅ |
| P2 | Background Sync para pilha pendente (fila offline → sync ao reconectar) | `client/src/pages/FigurinhasPage.tsx` + SW | **Opcional** — pilha já persiste no backend; ganho incremental menor; postergado |
| P3 | Virtualização de lista longa (~994 itens) | `client/src/components/ListaFigurinhasModal.tsx`, `client/src/pages/AlbumManagePage.tsx` | ✅ |
| ~~P4~~ | ~~Limitar concorrência do Puppeteer no PDF~~ | — | **Obsoleto** — substituído por `window.print()` (#29/#30) |
| ~~P5~~ | ~~Validar PDF/UA (tagged PDF)~~ | — | **Obsoleto** — sem geração de PDF server-side |

---

## M4 — Compartilhamento

Foco: compartilhar a lista de figurinhas que faltam por link público. É a **primeira fatia entregável do item N2** (compartilhamento social) — o restante de N2 (progresso público + imagem OG) segue no backlog M6. Detalhamento em [`sprint/20260621_plano-issue-39.md`](sprint/20260621_plano-issue-39.md).

| # | Item | Notas |
|---|------|-------|
| #39 | **Compartilhar lista de faltantes** — botão gera link único (UUID) para página pública sem auth, como a lista de impressão; token **persistido** para reuso | `shareToken` em `Album`; `POST /albums/:id/share` + `GET /public/share/:token`; LGPD: expõe só faltantes, sem PII |

---

## M5 — Sistema de Trocas (feature principal pendente)

Foco: única funcionalidade core faltando — já está no menu de navegação como "EM BREVE". Detalhamento em [`sprint/20260621_plano-sistema-trocas.md`](sprint/20260621_plano-sistema-trocas.md).

**Pré-requisitos antes de codar (bloqueantes):**
- Escrever `docs/spec_trocas.md` com regras de negócio
- Criar design handoff em `docs/design_handoff/`
- Definir modelo de dados (matching entre `EstoqueFigurinha` de dois usuários)

| # | Item | Notas |
|---|------|-------|
| TR1 | Modelo de dados: oferta de troca, match, estado (pendente/aceita/recusada) | Novo modelo Mongoose |
| TR2 | Busca de parceiro por `publicId` | Usuário informa o ID público do outro |
| TR3 | Visualização de figurinhas que o parceiro precisa vs. o que você tem | Cross-query estoque × faltantes |
| TR4 | Fluxo de proposta e aceite/recusa | Modal bilateral |
| TR5 | Notificação de match (in-app inicialmente; Web Push no M6/N3) | Toast / badge |
| TR6 | Testes E2E completos | `tests/trocas/trocas.spec.ts` |

---

## M6 — Backlog de Novas Funcionalidades

Itens a serem detalhados em spec antes de implementar. Cada um ganhará seu próprio plano de sprint quando tiver spec + handoff.

| # | Item | Valor | Dependência |
|---|------|-------|-------------|
| N1 | **Estatísticas de progresso** — histórico de colagens/dia, projeção de conclusão, gráfico por seção | Alto | Dados já existem em `FigurinhaColada.coladaEm` |
| N2 | **Compartilhamento social (restante)** — progresso público read-only (usa `publicId`), imagem OG gerada | Médio | Link de faltantes já entregue em M4 |
| N3 | **Notificações push (Web Push)** — avisar match de troca, lembrete de sessão pendente | Médio | Requer M5 |
| N4 | **Busca/filtros avançados** — filtrar estoque e álbum por seção, país, raridade | Médio | Campos já existem em `Sticker` |
| N5 | **Imagens de figurinhas** — avaliar CDN e implicações de licença antes de qualquer implementação | Alto (UX) | Decisão de produto + licenciamento |

---

## Convenções para implementação

- **TDD**: escrever/ajustar testes antes de implementar — Vitest para lógica pura; Playwright para fluxos de tela (`tests/TESTS.md`)
- **Planos de sprint**: cada bloco acionável tem um arquivo `docs/sprint/YYYYMMDD_plano-*.md` com diagnóstico, passos, testes e verificação
- **Hierarquia de fontes**: design handoff > spec canônica > implementação
- **Antes de codar nova feature**: spec em `/docs/spec_*.md` + design handoff; ao alterar regra, arquivar a spec anterior em `docs/_hist/AAAAMMDD/`
- **Antes de rodar testes**: `npx kill-port 5173 && npx kill-port 3000`
- **Policy version sync**: manter `CURRENT_POLICY_VERSION` em sync entre `client/src/lib/cookieConsent.ts` e `tests/support/fixtures.ts`
- **VARIANT_STYLES**: sempre importar de `client/src/lib/albumVariant.ts` — nunca copiar localmente
- **Câmera + OCR**: sempre via `client/src/components/CameraModal.tsx`; OCR roda client-side (Tesseract.js) — nunca enviar frames ao backend

---

## Fora de escopo (decisão consciente)

- Rebrand / mudança de identidade visual
- Multi-idioma
- App nativo (React Native / Flutter) — PWA é suficiente para o target
- Integração com APIs Panini/FIFA (sem licença)
