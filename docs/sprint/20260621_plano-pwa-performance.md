# Plano — PWA, Performance & Higiene de Build (M3)

Bloco de melhorias não-funcionais: experiência offline real, performance com o catálogo grande (~994 itens) e saúde do build. Inclui os itens P1–P5 herdados do roadmap anterior e a Issue [#38](https://github.com/nbittencourt/ndab-meualbum/issues/38) (warning de chunk no build). Itens em grande parte independentes; recomenda-se começar por #38 (rápido, destrava o ruído no CI/Playwright).

> **Branch:** `claude/product-roadmap-update-43u4oj`
> **Milestone:** M3 — ver [`../ROADMAP.md`](../ROADMAP.md)

---

## #38 — Warning de chunk > 500 kB no build · Pequeno

### Contexto

Ao rodar os testes do Playwright (que executam `npm run build -w client` no `webServer`), o build emite:

```
(!) Some chunks are larger than 500 kB after minification.
```

A issue pede tratar o alerta **sem ocultar o problema**: primeiro reduzir o tamanho via code-splitting; só então, se necessário, ajustar o limite — sem prejudicar testes ou qualidade.

### Diagnóstico

| Arquivo | Problema |
|---|---|
| [`client/vite.config.ts`](../../client/vite.config.ts) | Não define `build.rollupOptions.output.manualChunks` nem `build.chunkSizeWarningLimit`. Vendors grandes caem todos num chunk só. |
| [`client/package.json`](../../client/package.json) | `tesseract.js` (pesado) já é carregado via `import()` dinâmico em `CameraModal.tsx` (linha ~113) — deve gerar chunk próprio; demais vendors (`react`/`react-dom`, `@tanstack/*`, `react-router-dom`) não estão segmentados. |

### Plano de implementação

1. **`manualChunks` em `vite.config.ts`** — separar vendors estáveis em chunks dedicados (ex.: `react-vendor` para `react`/`react-dom`, `query` para `@tanstack/*`, `router` para `react-router-dom`). Confirmar que `tesseract.js` permanece em chunk lazy isolado (não importar estaticamente em lugar nenhum).
2. **Reavaliar o warning** após o re-chunking. Se ainda houver chunk legitimamente grande e justificável, ajustar `build.chunkSizeWarningLimit` para um valor realista **documentado em comentário** — não como forma de silenciar, mas de refletir o baseline real.
3. **Revisar `globPatterns` do VitePWA** após a mudança de nomes/quantidade de chunks, garantindo que o precache continua cobrindo os assets corretos.

### Testes

- `npm run build -w client` conclui **sem** o warning de chunk (ou com limite ajustado e justificado).
- Suíte E2E (`npm run test:e2e`) continua verde — o `webServer` faz build+preview.

### Arquivos modificados

| Arquivo | Mudança |
|---|---|
| `client/vite.config.ts` | `manualChunks` + (se necessário) `chunkSizeWarningLimit` comentado; revisão de `globPatterns` |

### Riscos

- `manualChunks` mal calibrado pode piorar o cache (chunks que mudam juntos). Agrupar por estabilidade de versão.
- Não estatizar a importação de `tesseract.js` — quebraria o ganho de bundle inicial e a RN-AP21.

---

## P1 — runtimeCaching no Workbox (offline de catálogo/álbuns) · Médio

### Contexto
RN-AP29–31 já preveem operação offline. Hoje o SW faz precache de assets, mas os GETs de catálogo/álbuns não têm estratégia de runtime cache.

### Plano
- Em [`client/vite.config.ts`](../../client/vite.config.ts) (VitePWA → Workbox), adicionar `runtimeCaching` com **stale-while-revalidate** para GETs de catálogo/álbuns (`/api/v1/...` somente leitura). Definir `cacheName`, `expiration` e `cacheableResponse`.

### Testes
- Playwright com `context.setOffline(true)` após primeira carga: catálogo/álbuns ainda renderizam.

---

## P2 — Background Sync da pilha pendente · Médio/Alto

### Contexto
Abrir Pacotinhos persiste a pilha no backend; offline, as ações precisam de fila local e sync ao reconectar (RN-AP29–31).

### Plano
- Fila local (IndexedDB) em [`client/src/pages/AbrirPacotinhosPage.tsx`](../../client/src/pages/AbrirPacotinhosPage.tsx) + Background Sync no SW; flush ao voltar online; reconciliação idempotente com o backend.

### Testes
- E2E offline → online: ações enfileiradas são sincronizadas; sem duplicação (idempotência).

---

## P3 — Virtualização da lista de estoque · Médio

### Contexto
O catálogo tem ~994 itens; a lista de estoque em Colar Figurinhas renderiza tudo.

### Plano
- Aplicar `@tanstack/react-virtual` (já em `client/package.json`) na lista de [`client/src/pages/ColarFigurinhasPage.tsx`](../../client/src/pages/ColarFigurinhasPage.tsx), preservando busca/filtros e acessibilidade (foco/teclado).

### Testes
- Playwright: rolar a lista longa; itens fora da viewport não montam; busca continua funcionando. Re-rodar isolado (specs pesados são sensíveis a flakiness).

---

## P4 — Concorrência/cache do Puppeteer no PDF · Médio

### Contexto
A geração de PDF de faltantes via Puppeteer pode estourar memória no Cloud Run sob concorrência.

### Plano
- Em [`server/src/routes/albums.ts`](../../server/src/routes/albums.ts), limitar concorrência (fila/semaphore) e cachear o resultado por estado do álbum (invalidar quando coladas/seções mudam — RN-AL20).

### Testes
- Vitest de integração: requisições concorrentes não excedem o limite; cache hit quando o estado não mudou.

---

## P5 — PDF/UA (tagged PDF) · Médio

### Contexto
RN-AL19 — acessibilidade do PDF gerado.

### Plano
- Validar/gerar PDF com tags (estrutura semântica, `lang="pt-BR"`), conforme guia WCAG do projeto ([`docs/legal/wcag-2_0-aa-guia-sistemas.md`](../legal/wcag-2_0-aa-guia-sistemas.md)).

### Testes
- Checagem automatizada de tags no PDF (ferramenta de validação PDF/UA) + revisão manual.

---

## Verificação end-to-end (bloco)

1. `npm run lint` e `npm run typecheck`.
2. `npm run build -w client` sem warning de chunk (#38).
3. `npm test` (Vitest — concorrência/cache do PDF).
4. E2E offline/virtualização: `npx kill-port 5173; npx kill-port 3000; npm run test:e2e`. Re-rodar specs sensíveis isolados antes de tratar como bug (regra de flakiness do CLAUDE.md).
5. **Manual:** DevTools → Application → Service Worker; testar offline (catálogo/álbuns) e reconexão (sync da pilha).

> Observação: P1–P5 são herdados do roadmap anterior e podem ser fatiados em sprints próprios se cada um crescer. #38 é o item de entrada deste bloco por ser pequeno e destravar o ruído de build.
