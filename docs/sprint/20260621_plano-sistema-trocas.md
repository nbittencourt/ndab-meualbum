# Plano — Sistema de Trocas (M5)

Única funcionalidade core ainda pendente — já aparece no menu de navegação como "EM BREVE". Este plano consolida o escopo TR1–TR6 e os pré-requisitos. **Bloqueado** até existir spec canônica + design handoff: não iniciar código antes disso (hierarquia de fontes do CLAUDE.md).

> **Branch:** `claude/product-roadmap-update-43u4oj` (planejamento)
> **Milestone:** M5 — ver [`../ROADMAP.md`](../ROADMAP.md)
> **Status:** 🔒 Bloqueado por spec + handoff

---

## Contexto

O app permite marcar figurinhas que o usuário tem (estoque/repetidas) e que faltam por álbum. As Trocas são o passo natural: cruzar o que o usuário A tem (repetidas) com o que o usuário B precisa (faltantes) e vice-versa, e gerenciar a oferta/aceite. Os dados base já existem: [`EstoqueFigurinha`](../../server/src/models/EstoqueFigurinha.ts), [`FigurinhaColada`](../../server/src/models/FigurinhaColada.ts) e o `publicId` por usuário em [`User`](../../server/src/models/User.ts).

## Pré-requisitos bloqueantes (fazer antes de codar)

1. **Spec canônica** `docs/spec_trocas.md` com as regras de negócio (estados, quem pode propor, expiração, débito de estoque na conclusão, notificações).
2. **Design handoff** em `docs/design_handoff/` (telas de busca de parceiro, comparação de figurinhas, proposta, aceite/recusa).
3. **Modelo de dados** definido (matching entre `EstoqueFigurinha` de dois usuários), incluindo política de concorrência (dois aceites simultâneos).

> Enquanto os três não existirem, este sprint permanece em planejamento. Divergências entre spec, handoff e implementação devem ser escaladas como decisão explícita antes do código.

## Escopo (TR1–TR6)

| # | Item | Notas técnicas |
|---|------|----------------|
| TR1 | Modelo de dados: oferta de troca, match, estado (`pendente`/`aceita`/`recusada`/`concluida`/`cancelada`) | Novo modelo Mongoose `Troca`/`OfertaTroca`; índices por participantes e estado; transição de estado atômica |
| TR2 | Busca de parceiro por `publicId` | Reusar `User.publicId`; endpoint autenticado que resolve o parceiro pelo ID público |
| TR3 | Visualização: o que o parceiro precisa × o que você tem (e vice-versa) | Cross-query `EstoqueFigurinha` (repetidas de A) × faltantes de B; reaproveitar lógica de faltantes de [`albums.ts`](../../server/src/routes/albums.ts) e progresso de [`albumProgress.ts`](../../server/src/lib/albumProgress.ts) |
| TR4 | Fluxo de proposta e aceite/recusa | Modal bilateral; transição de estado com confirmação; débito/ajuste de estoque na conclusão |
| TR5 | Notificação de match | In-app inicialmente (toast/badge); Web Push fica para M6/N3 |
| TR6 | Testes E2E completos | `tests/trocas/trocas.spec.ts` |

## Plano de implementação (alto nível — detalhar após spec/handoff)

1. **Backend**: modelo(s) Mongoose + rotas sob `/api/v1/trocas` (criar oferta, listar, aceitar, recusar, cancelar), com `requireAuth` e `asyncHandler` (padrão das ~38 rotas). Transições de estado idempotentes e seguras contra corrida.
2. **Matching**: serviço que, dados dois usuários, computa as figurinhas trocáveis em ambas as direções, reutilizando os helpers de faltantes/estoque existentes (não duplicar).
3. **Frontend**: página de Trocas (substituir "EM BREVE"), busca por `publicId`, tela de comparação, modal de proposta e gestão de estado via TanStack Query; estado de UI via Zustand/Context.
4. **Notificações**: in-app (badge no menu + toast) ao receber proposta/aceite; deixar gancho para Web Push (N3).
5. **LGPD/WCAG**: expor o mínimo do parceiro necessário; aplicar contraste AA e navegação por teclado a todas as telas novas (cross-cutting — valem mesmo sem wireframe).

## Testes (TDD)

- **Vitest** (`server/src/__tests__/`): transições de estado da troca (pendente→aceita→concluída; recusa; cancelamento); matching bidirecional; corrida de dois aceites. `mongodb-memory-server` + `createApp()`.
- **Playwright** (`tests/trocas/trocas.spec.ts`): fluxo completo entre dois usuários (dois contextos de browser), da busca por `publicId` ao aceite.
- Escrever os testes a partir das RN da `spec_trocas.md` antes de implementar.

## Arquivos (previstos)

| Arquivo | Mudança |
|---|---|
| `docs/spec_trocas.md` (novo) | Spec canônica — **pré-requisito** |
| `docs/design_handoff/*` | Telas de trocas — **pré-requisito** |
| `server/src/models/Troca.ts` (novo) | Modelo de oferta/estado |
| `server/src/routes/trocas.ts` (novo) | Rotas de troca |
| `server/src/lib/matchingTrocas.ts` (novo) | Cross-query estoque × faltantes |
| `client/src/pages/TrocasPage.tsx` (novo) | UI principal |
| `tests/trocas/trocas.spec.ts` (novo) | E2E |

## Riscos e observações

- **Concorrência**: dois usuários aceitando ofertas conflitantes sobre a mesma figurinha — definir reserva/lock e transição atômica na spec.
- **Consistência de estoque**: a conclusão de uma troca deve ajustar `EstoqueFigurinha`/`FigurinhaColada` de forma consistente e idempotente.
- **Escopo grande**: provavelmente exige múltiplos sub-sprints (modelo+matching; UI; notificações). Fatiar após a spec.

## Verificação end-to-end

1. `npm run lint` e `npm run typecheck`.
2. `npm test` (Vitest — estados e matching).
3. E2E: `npx kill-port 5173; npx kill-port 3000; npm run test:e2e` (fluxo entre dois usuários).
4. **Manual:** dois cadastros; A busca B por `publicId`; propõe; B aceita; conferir ajuste de estoque/coladas e notificações in-app.
