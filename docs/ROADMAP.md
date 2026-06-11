# Roadmap de Produto — MeuAlbum Copa 2026

> Documento vivo. Atualizado em 2026-06-11 com base em deep dive completo da aplicação.
> Hierarquia de fontes: design handoff > specs canônicas > implementação atual.

---

## Estado atual

A aplicação cobre os fluxos principais: autenticação completa (cadastro com confirmação de e-mail, login, recuperação e alteração de senha/e-mail), gestão de álbuns (CRUD, variantes, arquivamento, PDF), Abrir Pacotinhos (pilha persistida no backend, câmera OCR client-side), Colar Figurinhas (estoque, colagem direta MFN), perfil (exportação LGPD, exclusão de conta) e consentimento de cookies. Cobertura de testes: 171 testes E2E em 11 specs Playwright.

---

## Milestones

### M1 — Qualidade e Conformidade (próximo sprint)

Foco: eliminar dívidas técnicas bloqueantes e garantir conformidade legal.

#### 1.1 — Dívidas de alta prioridade

| # | Item | Arquivo(s) | Impacto |
|---|------|-----------|---------|
| B1 | Corrigir N+1 query na Home (usar aggregation) | `server/src/routes/home.ts:27-35` | Performance crítica |
| B2 | Remover duplicação de `VARIANT_STYLES` em `AlbumVarianteCard` | `client/src/components/AlbumVarianteCard.tsx:15-71` → importar de `client/src/lib/albumVariant.ts` | Consistência visual |
| B3 | Adicionar `asyncHandler` wrapper nas rotas Express | `server/src/index.ts` + todas as rotas | Estabilidade |
| B4 | Paginação em `GET /albums` e `GET /estoque` | `server/src/routes/albums.ts`, `estoque.ts` | Escalabilidade |
| B5 | Validação de ObjectId faltante em `secoes.ts` e `home.ts` | `server/src/routes/secoes.ts:11`, `home.ts:14` | Segurança |
| B6 | Remover código morto: `PasswordResetToken`, model `Collection`, `AlbumPage.tsx` | `server/src/models/`, `client/src/pages/AlbumPage.tsx` | Manutenabilidade |

#### 1.2 — Conformidade LGPD

| # | Item | Referência | Impacto |
|---|------|-----------|---------|
| L1 | Rotina de purga automatizada de tokens/logs expirados com registro de eliminação | `docs/legal/lgpd_guia_sistemas.md` R-PR-01 | Obrigação legal |
| L2 | Página/rota de Política de Privacidade navegável + link no footer | RN-PR14, RN-P29 | Obrigação legal |
| L3 | Produzir documento LIA (Avaliação de Legítimo Interesse) para analytics/logs | BL-09 `spec_privacidade_lgpd.md` | Obrigação legal |

#### 1.3 — Conformidade WCAG

| # | Item | Referência | Impacto |
|---|------|-----------|---------|
| W1 | Adicionar `@axe-core/playwright` às páginas principais (no mínimo: Home, Abrir Pacotinhos, Colar, Álbuns, Perfil) | `docs/legal/wcag-2_0-aa-guia-sistemas.md` | Obrigação legal |
| W2 | Testes de navegação por teclado (Tab, Enter, Esc) nas páginas principais | WCAG 2.1.1 | Obrigação legal |
| W3 | Corrigir `<a><button>` aninhado no FAB da HomePage | WCAG 4.1.1 | Semântica |

#### 1.4 — Testes de integração do backend

| # | Item | Notas |
|---|------|-------|
| T1 | Adicionar testes de rotas com supertest + mongodb-memory-server | Rotas críticas: pilha, colar, álbuns, profile |
| T2 | Cobrir edge cases de exclusão de conta e exportação LGPD | `perfil.spec.ts` cobre parcialmente |

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
