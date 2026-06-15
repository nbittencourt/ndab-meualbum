# Plano — Isolamento do banco na suíte E2E

Plano para fechar a brecha que permitiu a suíte E2E gravar/limpar o **Firestore de homologação** em vez do banco local. As duas ações são complementares e devem ser entregues juntas: a **B1** remove a causa (vazamento de `MONGODB_URI` do shell para o servidor de teste) e a **B2** instala uma rede de segurança (rotas destrutivas recusam qualquer banco que não seja local). Nenhuma altera regra de negócio do produto.

## Contexto do incidente

`playwright.config.ts:34` repassa `MONGODB_URI: process.env.MONGODB_URI` para o servidor de teste, e o `dotenv` do `server/src/index.ts:4` **não sobrescreve** variável já presente em `process.env`. Quando a sessão do PowerShell tinha `$env:MONGODB_URI` apontando para o Firestore (carregado de `.env.tst` ou definido por `scripts/seed-tst.ps1`), o Playwright subiu o servidor com `NODE_ENV=test` contra o Firestore. O `tests/global-setup.ts` então rodou `reset-db` (apaga todas as coleções) + `seed` (recria `TipoAlbum` com `_id` novos) e os specs criaram usuários/álbuns — o que orfanizou a relação `Album.tipoAlbumId → TipoAlbum._id` em homologação.

Decisão de design: o `.env` da raiz é a **fonte única de verdade** para a execução local/E2E. Não criar novos arquivos de configuração.

## Sequenciamento sugerido

Bloco 0 (remediação dos dados): B0 — restaurar homologação antes de qualquer nova execução E2E.
Bloco 1 (corrige a causa): B1.
Bloco 2 (defesa em profundidade): B2.

B1 e B2 são independentes entre si e podem entrar no mesmo commit/PR; B0 é pré-requisito operacional, não de código.

---

## B0 — Remediar o Firestore de homologação  ·  Crítico  ·  ~30 min

Objetivo. Restaurar o catálogo de homologação corrompido pela execução do test plan antes de fechar a brecha.

Passos.
1. Conferir no Firestore o estrago: documentos `TipoAlbum`/`Secao`/`Sticker` criados hoje e álbuns órfãos (`tipoAlbumId` sem `TipoAlbum` correspondente).
2. Re-semear com `scripts/seed-db.ts` (idempotente por `nome`), apontando para a URI de homologação de forma **explícita e isolada** — sessão de shell dedicada, nunca a mesma usada para E2E.
3. Decidir o destino dos álbuns/usuários de teste criados hoje em homologação (remover, já que são lixo do test plan).

Critério de pronto. Homologação com catálogo consistente (toda `Album.tipoAlbumId` resolve para um `TipoAlbum` existente) e sem registros espúrios do test plan.

Observação. Executar **depois** de B1/B2 estarem prontos para mesclar, evitando recontaminar entre o conserto e o merge.

## B1 — Forçar o `.env` na suíte E2E  ·  Crítico  ·  ~20 min

Objetivo. Garantir que a E2E sempre use o banco do `.env` (localhost), neutralizando qualquer `MONGODB_URI` herdado do shell.

Passos.
1. No topo do `playwright.config.ts`, antes do `defineConfig`, carregar o `.env` com override:
   ```ts
   import { config as loadEnv } from 'dotenv';
   // Fonte única de verdade: o .env da raiz manda na suíte E2E.
   // override:true neutraliza um MONGODB_URI vazado no shell (ex.: .env.tst/Firestore).
   loadEnv({ override: true });
   ```
2. Manter `MONGODB_URI: process.env.MONGODB_URI!` no `webServer.env` — agora o valor vem sempre do `.env`.
3. Validar que o `dotenv` resolve a partir da raiz (já é dependência hoisted do server; o `npm run test:e2e` roda em `process.cwd()` = raiz, default do dotenv).
4. Confirmar que `NODE_ENV` do `webServer.env` continua `'test'` (vence o `development` do `.env` para o processo filho) — as rotas de teste seguem habilitadas.

Critério de pronto. Com `$env:MONGODB_URI` apontando para o Firestore na sessão, `npm run test:e2e` sobe o servidor em `mongodb://localhost` (verificar no log `db:connected` / inspeção da conexão) e **não** toca em homologação. Sem `.env.tst` referenciado em lugar nenhum do código.

Trade-off aceito. Com `override:true`, apontar a E2E para outro banco local via `$env:MONGODB_URI` deixa de funcionar; o ajuste passa a ser editar o `.env`. Comportamento determinístico é o desejado aqui.

## B2 — Guarda de host local nas rotas destrutivas  ·  Crítico  ·  ~45 min

Objetivo. Impedir, por construção, que `reset-db`/`seed` (e demais rotas de `test.routes.ts`) rodem contra um banco remoto, mesmo com configuração equivocada futura. Não cria arquivo novo — apenas código no servidor.

Passos (TDD — vitest primeiro, conforme `tests/TESTS.md`).
1. Extrair um helper puro, ex. `server/src/lib/isLocalDbHost.ts`, que receba o host da conexão (`mongoose.connection.host`) e retorne `true` apenas para `localhost`/`127.0.0.1`/`::1`.
2. Escrever spec vitest do helper cobrindo: localhost/127.0.0.1/::1 → `true`; host `*.firestore.goog`, `*.mongodb.net` e qualquer outro → `false`.
3. Endurecer o `guard` de `server/src/routes/test.routes.ts:19`: além de exigir `NODE_ENV === 'test'`, recusar (`403`) quando `isLocalDbHost(mongoose.connection.host)` for falso.
4. Adicionar teste de integração: com `mongodb-memory-server` (host `127.0.0.1`) o `reset-db` responde `200`; simular host remoto e esperar `403` (mockando `mongoose.connection.host` ou testando o guard isolado).

Critério de pronto. Helper com spec vitest verde; chamada a `reset-db`/`seed` com conexão não-local retorna `403` sem executar `deleteMany`/`create`; suíte E2E local segue verde (host é localhost).

Observação. Respeitar a regra anti-subversão: os testes do helper/guard entram **antes** da implementação, como contrato read-only.

---

## Alinhamento das ações

| Aspecto | B1 (causa) | B2 (defesa) |
|---|---|---|
| O que ataca | Vazamento do `MONGODB_URI` do shell para o servidor de teste | Execução de rota destrutiva contra banco remoto |
| Camada | Config da suíte (`playwright.config.ts`) | Runtime do servidor (`test.routes.ts`) |
| Falha que cobre | Sessão com `$env:MONGODB_URI` contaminado | Qualquer caminho que aponte `MONGODB_URI` para remoto (CI, script, env futuro) |
| Sem B1, B2... | bloquearia a corrida, mas a config seguiria frágil | — |
| Sem B2, B1... | resolve hoje, mas uma nova rota/script poderia revazar | — |

Juntas: B1 garante o caminho feliz (E2E sempre local) e B2 torna o caminho destrutivo **impossível** fora do localhost. Fonte única de verdade preservada no `.env`; nenhum arquivo de configuração novo.

## Resumo

| Item | Prioridade | Esforço | Depende de |
|---|---|---|---|
| B0 Remediar Firestore de homologação | Crítico | ~30 min | B1, B2 prontos para merge |
| B1 Forçar `.env` na E2E | Crítico | ~20 min | — |
| B2 Guarda de host local nas rotas de teste | Crítico | ~45 min | — |

Sem alterações em arquivos do projeto até aprovação. Execução em TDD no item com teste (B2); B1 é ajuste de config. Commits sugeridos com conventional commits: `test:`/`fix:` para B2, `fix:` para B1, e registro operacional de B0 fora do código.
