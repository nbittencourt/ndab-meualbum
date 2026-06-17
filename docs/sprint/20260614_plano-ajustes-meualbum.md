# Plano de Ajustes — MeuAlbum

Plano para endereçar os pontos do relatório `relatorio-meualbum-vs-boas-praticas.md`. Itens ordenados por prioridade e dependência. Cada item traz objetivo, passos, critério de pronto e esforço estimado. Nada aqui altera regra de negócio do produto — são ajustes de governança, documentação e cobertura de teste.

## Sequenciamento sugerido

Bloco 1 (governança do agente, baixo esforço, destrava o resto): A1, A2.
Bloco 2 (cobertura de teste rápida): A3.
Bloco 3 (refinamento de docs e specs): A4, A5.
Bloco 4 (higiene de repositório): A6.

---

## A1 — Corrigir a seção "Tests" do CLAUDE.md  ·  Crítico  ·  ~30 min

Objetivo. Refletir as duas camadas de teste reais para o agente parar de validar tudo pelo E2E lento.

Passos.
1. Reescrever a seção `### Tests` do `CLAUDE.md` descrevendo: (a) vitest unit/integração no server (`server/src/__tests__`, roda com `npm test`), (b) Playwright E2E (`npm run test:e2e`), (c) vitest no client (`npm test -w client`, hoje sem specs).
2. Indicar quando usar cada camada: lógica pura e contrato de API → vitest; fluxo de tela e navegação → Playwright.
3. Manter a subseção de diagnóstico de flakiness que já existe.

Critério de pronto. Um agente que lê só o CLAUDE.md sabe que existem testes vitest, onde estão e como rodar a camada rápida isolada.

## A2 — Codificar a regra anti-subversão de testes  ·  Crítico  ·  ~20 min

Objetivo. Fechar a brecha que permite ao agente editar o teste para fazê-lo passar.

Passos.
1. Adicionar bloco no `CLAUDE.md` (seção de testes ou Restrições):
   - Nunca modificar um teste para fazê-lo passar. O código se adapta ao teste, nunca o contrário.
   - Se um teste falha de forma determinística e não passa sem alterá-lo, parar e reportar qual teste e por quê.
   - Commitar os testes antes de pedir a implementação da regra (snapshot read-only; o diff revela qualquer alteração).
2. Alinhar com `tests/TESTS.md`: deixar explícito que a permissão de editar seletor/assert vale só após confirmar flakiness e nunca para suavizar a verificação de uma regra de negócio.

Critério de pronto. Regra presente no CLAUDE.md e coerente com a TESTS.md, sem contradição entre os dois arquivos.

## A3 — Testes unitários no client para lógica pura  ·  Crítico  ·  ~1–2 dias

Objetivo. Reduzir a dependência do E2E (instável) para regras que não precisam de navegador, ganhando feedback em milissegundos.

Passos.
1. Confirmar setup do vitest no client (jsdom/happy-dom se necessário; o script `test` já existe).
2. Escrever specs de unidade, em TDD onde a regra ainda não estiver coberta, para:
   - `cookieConsent.ts` — `getConsent` com localStorage inválido/ausente; `hasValidConsent` em consentimento expirado e em versão de política anterior; `saveConsent` gravando expiração de 12 meses (RN-PR08).
   - `albumVariant.ts` — `VARIANT_STYLES`/`VARIANT_LABELS` cobrindo todas as variantes.
   - Demais helpers puros em `client/src/lib/`.
3. Rodar `npm test -w client` e incluir no `npm test` da raiz (já incluso).

Critério de pronto. Cada regra pura listada tem teste vitest verde; as regras de consentimento deixam de depender exclusivamente do E2E.

Observação. Manter o E2E como está para fluxo e navegação; o objetivo não é migrar E2E, é cobrir a base da pirâmide que falta.

## A4 — Enxugar e referenciar no CLAUDE.md  ·  Menor  ·  ~45 min

Objetivo. Trazer o arquivo de 198 para perto de 130–150 linhas, devolvendo orçamento de instrução.

Passos.
1. Mover a tabela de env vars e o detalhe de arquitetura de deploy para `docs/DEPLOY.md` (já referenciado) e deixar no CLAUDE.md só o ponteiro `@docs/DEPLOY.md`.
2. Avaliar `.claude/rules/` com path-scoping para regras transversais: a11y/WCAG e LGPD carregando em `client/**`; convenções de rota/erro em `server/src/routes/**`. Lembrar do bug de rules globais com `paths:` — manter no nível de projeto, não global.
3. Corrigir os erros de digitação do arquivo ("Especification", "businness", "separeted", "usindo", "contais", "Accesibility").
4. Decidir idioma do CLAUDE.md (português alinharia com specs e preferência de trabalho); se mantido em inglês, registrar a decisão.

Critério de pronto. CLAUDE.md menor, sem duplicar deploy/env, sem typos, com idioma decidido.

## A5 — Fechar out-of-scope nas specs sensíveis  ·  Menor  ·  ~1h

Objetivo. Reduzir expansão de escopo pelo agente nos fluxos de segurança e dados pessoais.

Passos.
1. Adicionar seção "Fora do escopo" em `spec_cadastro_usuarios.md`, `spec_login_recuperacao_senha.md` e `spec_privacidade_lgpd.md`, listando o que não deve ser implementado (ex.: OAuth/SSO, 2FA, login social, retenção fora do previsto na LIA).
2. Versionar a alteração em `/docs/_hist/<YYYYMMDD>/` conforme o fluxo do projeto.

Critério de pronto. As três specs têm fronteira de escopo explícita e versão histórica registrada.

## A6 — Higiene de repositório  ·  Menor  ·  ~30 min

Objetivo. Fechar riscos de versionamento e preparar o repo para colaboradores.

Passos.
1. Adicionar `.claude/settings.local.json` ao `.gitignore` (e removê-lo do índice se já versionado: `git rm --cached`). Esse arquivo carrega allowlist com tokens/e-mails de teste, é pessoal por convenção.
2. Auditar o histórico para garantir que nenhum `.env`/`.env.prd`/`.env.tst` com segredo foi commitado antes de entrar no `.gitignore`. Se houver segredo exposto no histórico, rotacionar a credencial.
3. Preencher o `README.md` (hoje vazio) com visão, setup e ponteiros para CLAUDE.md/specs.

Critério de pronto. `settings.local.json` ignorado, ausência de segredo confirmada no histórico, README com conteúdo mínimo.

---

## Resumo

| Item | Prioridade | Esforço | Depende de |
|---|---|---|---|
| A1 Seção Tests no CLAUDE.md | Crítico | ~30 min | — |
| A2 Regra anti-subversão | Crítico | ~20 min | — |
| A3 Unit tests no client | Crítico | 1–2 dias | A1, A2 |
| A4 Enxugar CLAUDE.md | Menor | ~45 min | — |
| A5 Out-of-scope nas specs | Menor | ~1h | — |
| A6 Higiene de repo | Menor | ~30 min | — |

Sem alterações em arquivos do projeto até aprovação. A execução pode seguir em TDD nos itens com teste (A3) e, para A1/A2/A4/A5, commits documentais com conventional commits (`docs:`, `chore:`, `test:`).
