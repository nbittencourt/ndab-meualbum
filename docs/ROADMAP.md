# Roadmap de Produto — MeuAlbum Copa 2026

> Documento vivo. Atualizado em 2026-06-13 com base em deep dive completo da aplicação.
> Inclui também o tratamento da Issue #23 (pilha do Abrir Pacotinhos nunca limpa — RN-AP17), resolvida no M1.
> Hierarquia de fontes: design handoff > specs canônicas > implementação atual.

---

## Estado atual

A aplicação cobre os fluxos principais: autenticação completa (cadastro com confirmação de e-mail, login, recuperação e alteração de senha/e-mail), gestão de álbuns (CRUD, variantes, arquivamento, PDF), Abrir Pacotinhos (pilha persistida no backend, câmera OCR client-side), Colar Figurinhas (estoque, colagem direta MFN), perfil (exportação LGPD, exclusão de conta) e consentimento de cookies. Cobertura de testes: 171 testes E2E em 11 specs Playwright.

---

## Milestones

### M1 — Qualidade e Conformidade ✅ CONCLUÍDO (2026-06-13)

Foco: eliminar dívidas técnicas bloqueantes e garantir conformidade legal.
Inclui o bug-fix da Issue #23 (limpeza da pilha — RN-AP17). Status final:
87 testes de integração no servidor + suíte E2E completa verdes.

#### 1.1 — Dívidas de alta prioridade

| # | Item | Status |
|---|------|--------|
| B1 | N+1 query na Home/Álbuns → aggregation única (`server/src/lib/albumProgress.ts`) | ✅ |
| B2 | `VARIANT_STYLES` consolidado em `client/src/lib/albumVariant.ts` (+ gradiente prata alinhado ao handoff) | ✅ |
| B3 | `asyncHandler` (`server/src/lib/asyncHandler.ts`) em todas as ~38 rotas | ✅ |
| B4 | Paginação opt-in retrocompatível em `GET /albums` e `GET /estoque` | ✅ |
| B5 | Validação de ObjectId — verificado: já presente em todas as rotas; sem ação | ✅ |
| B6 | Código morto removido: `PasswordResetToken`, `Collection` (model+rota+tipos), `AlbumPage.tsx` | ✅ |

#### 1.2 — Conformidade LGPD

| # | Item | Status |
|---|------|--------|
| L1 | Purga com registro de eliminação: `POST /api/v1/admin/purga` + Cloud Scheduler (`server/src/lib/purga.ts`, `RegistroEliminacao`) | ✅ |
| L2 | Página `/politica-de-privacidade` (`PoliticaPrivacidadePage.tsx`) com conteúdo mínimo da spec §7.2 | ✅ |
| L3 | Documento LIA em `docs/legal/lia_analytics_logs.md` | ✅ |

#### 1.3 — Conformidade WCAG

| # | Item | Status |
|---|------|--------|
| W1 | `tests/a11y/axe.spec.ts` (`@axe-core/playwright`) sem violações AA nas páginas principais + correções de contraste | ✅ |
| W2 | `tests/a11y/teclado.spec.ts` — skip link, login, navegação, Esc/foco em modal, banner | ✅ |
| W3 | CTAs da Home convertidos de `<Link><button>` para links estilizados | ✅ |

#### 1.4 — Testes de integração do backend

| # | Item | Status |
|---|------|--------|
| T1 | supertest + mongodb-memory-server; `createApp()` extraído; rotas pilha/colar/álbuns/profile | ✅ |
| T2 | Edge cases de exclusão de conta e exportação LGPD em `profile.int.test.ts` | ✅ |

#### 1.0 — Bug Issue #23 (pilha nunca limpa)

| # | Item | Status |
|---|------|--------|
| #23 | RN-AP17: pilha finalizada removida na reentrada; descarte explícito limpa COLADA/REPETIDA | ✅ |

---

### M2 — PWA e Performance (sprint seguinte)

Foco: experiência offline real e performance com catálogos grandes.

| # | Item | Arquivo(s) | Notas |
|---|------|-----------|-------|
| P1 | `runtimeCaching` no Workbox para GETs de catálogo/álbuns (stale-while-revalidate) | `client/vite.config.ts` | RN-AP29-31 já preveem offline |
| P2 | Background Sync para pilha pendente (fila local offline → sync ao reconectar) | `client/src/pages/AbrirPacotinhosPage.tsx` + SW | RN-AP29-31 |
| P3 | Virtualização da lista de estoque em `ColarFigurinhasPage` | `client/src/pages/ColarFigurinhasPage.tsx` | Catálogo tem ~994 itens |
| P4 | Limitar concorrência do Puppeteer no PDF + cache de resultado | `server/src/routes/albums.ts` (rota `/pdf`) | Risco de memória no Cloud Run |
| P5 | Validar PDF/UA (tagged PDF) na geração de faltantes | RN-AL19 | Acessibilidade do PDF |

---

### M3 — Sistema de Trocas (feature principal pendente)

Foco: única funcionalidade core faltando — já está no menu de navegação como "EM BREVE".

**Pré-requisitos antes de codar:**
- Escrever `docs/spec_trocas.md` com regras de negócio
- Criar design handoff em `docs/design_handoff/`
- Definir modelo de dados (matching entre `EstoqueFigurinha` de dois usuários)

**Escopo esperado:**

| # | Item | Notas |
|---|------|-------|
| TR1 | Modelo de dados: oferta de troca, match, estado (pendente/aceita/recusada) | Novo modelo Mongoose |
| TR2 | Busca de parceiro por `publicId` | Usuário informa o ID público do outro |
| TR3 | Visualização de figurinhas que o parceiro precisa vs. o que você tem | Cross-query estoque × faltantes |
| TR4 | Fluxo de proposta e aceite/recusa | Modal bilateral |
| TR5 | Notificação de match (in-app inicialmente; Web Push no M4) | Toast / badge |
| TR6 | Testes E2E completos | `tests/trocas/trocas.spec.ts` |

---

### M4 — Novas Funcionalidades (backlog)

Itens a serem detalhados em spec antes de implementar.

| # | Item | Valor | Dependência |
|---|------|-------|-------------|
| N1 | **Estatísticas de progresso** — histórico de colagens/dia, projeção de conclusão, gráfico por seção | Alto | Dados já existem em `FigurinhaColada.coladaEm` |
| N2 | **Compartilhamento social** — link público read-only do progresso (usa `publicId`), imagem OG gerada | Médio | — |
| N3 | **Notificações push (Web Push)** — avisar match de troca, lembrete de sessão pendente | Médio | Requer M3 |
| N4 | **Busca/filtros avançados** — filtrar estoque e álbum por seção, país, raridade | Médio | Campos já existem em `Sticker` |
| N5 | **Imagens de figurinhas** — avaliar CDN e implicações de licença antes de qualquer implementação | Alto (UX) | Decisão de produto + licenciamento |

---

## Convenções para implementação

- **TDD**: escrever/ajustar testes E2E antes de implementar (`tests/TESTS.md`)
- **Hierarquia de fontes**: design handoff > spec canônica > implementação
- **Antes de codar nova feature**: spec em `/docs/spec_*.md` + design handoff
- **Antes de rodar testes**: `npx kill-port 5173 && npx kill-port 3000`
- **Policy version sync**: manter `CURRENT_POLICY_VERSION` em sync entre `client/src/lib/cookieConsent.ts` e `tests/support/fixtures.ts`
- **VARIANT_STYLES**: sempre importar de `client/src/lib/albumVariant.ts` — nunca copiar localmente

---

## Fora de escopo (decisão consciente)

- Rebrand / mudança de identidade visual
- Multi-idioma
- App nativo (React Native / Flutter) — PWA é suficiente para o target
- Integração com APIs Panini/FIFA (sem licença)
