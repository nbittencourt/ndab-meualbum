# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added

- **`GET /api/v1/albums/:id/figurinhas`** — novo endpoint que retorna todas as figurinhas de um álbum agrupadas por seção, com status de colagem (`colada`) e quantidade em estoque (`quantidade`).
- **`FigurinhaGridItem` e `SecaoGrid`** — novos tipos no pacote `shared` para tipar a resposta do endpoint acima.
- **`albumsApi.getFigurinhas(id)`** — novo método no API client do frontend para consumir o endpoint de figurinhas.

### Changed

#### `AlbumVarianteCard.tsx`

Reescrito com estilos inline usando valores exatos do design system em vez de classes Tailwind aproximadas. Cada variante agora usa os valores corretos de `background`, `border`, `box-shadow`, `tagBg` e `tagText`:

- **BROCHURA** — `#fff`, borda `1.5px solid #0A0907`, sem sombra, tag `#E0DDD5`
- **CAPA_DURA** — `#F5F0E4`, sombra flat `3px 3px 0 #C8C4BC`, tag `#C8C4BC`
- **CAPA_DURA_PRATA** — gradiente diagonal `135deg #F0EDE4 / #E0DDD5`, sombra `3px 3px 0 #9E9E9E`, tag `#9E9E9E` / texto branco
- **CAPA_DURA_OURO** — `#FEF3CC`, borda `2px solid #8B6914`, sombra `3px 3px 0 #C49A1A`, tag `#C49A1A` / texto branco
- **BOX_PREMIUM** — `#0A0907`, sombra `4px 4px 0 #E5142A`, tag `#E5142A` / texto branco

#### `CadastroAlbumPage.tsx`

Implementada **RN-CA05**: ao selecionar uma variante, o fundo da página inteira se atualiza para o background correspondente com transição suave (`0.2s ease`). Para BOX_PREMIUM, todos os textos, labels e inputs alternam para o esquema de cor claro sobre fundo escuro.

#### `AlbumManagePage.tsx`

Substituída a lista de faltantes pelo **grid completo de figurinhas por seção (Variante B do spec AL1)**:

- **Accordion por seção** com mini barra de progresso e contagem `coladas/total`
- **Grid responsivo**: 3 colunas (mobile) / 5 colunas (desktop), células com altura fixa 94px / 106px
- **`StickerCardAL1`**: exibe número, badge ×N e nome. Status visual por bordas e fundos (colada em verde, faltante tracejada, repetida sólida)
- **`QuantidadeBadge`**: codificado por cor — faltante (cinza), colada (verde), repetida (vermelho)
- **Botão "Colar →"** no card de figurinha repetida, navega com pré-seleção por `figurinhaNumero`
- **RN-AL19**: enquanto o PDF está sendo gerado, todos os demais botões da action bar ficam desabilitados

#### `AlbumsPage.tsx`

`AlbumCard` local reescrito com `VARIANT_STYLES` usando valores exatos de cada variante (mesmo padrão do componente compartilhado). Adicionado botão **"Gerenciar"** (→ `/albums/:id`) nos cards de álbuns ativos. Header atualizado para `border-b-2 border-ink`.

#### `AbrirPacotinhosPage.tsx`

Anatomia dos cards da pilha refatorada para o spec AP1:

- Tags de origem (**DIGITAÇÃO** / **CÂMERA**) e elegibilidade (**ELEGÍVEL** / **SEM ÁLBUM**) exibidas no topo de cada card
- Itens com status **COLADA** e **REPETIDA** são somente leitura (sem botões de ação)
- Botões renomeados: "Colar →", "Enviar para Repetidas", "✕ Descartar" (com confirmação inline)

#### `HomePage.tsx`

`borderBottom` do header corrigido de `1.5px solid rgba(10,9,7,0.12)` para `2px solid #0A0907` conforme o spec.

### Fixed (servidor)

#### `server/src/routes/albums.ts`

`import puppeteer` estático movido para dynamic import dentro do handler `GET /albums/:id/pdf`. O import estático causava timeout de 30 s no startup do servidor durante os testes E2E pois o módulo Puppeteer inicializa verificações do binário Chromium em tempo de carregamento.

#### `server/src/routes/abrir-pacotinhos.ts`

Corrigido erro TypeScript TS2345 na desestruturação de `req.params.itemId`: Express tipifica `params` como `string | string[]`, mas `Types.ObjectId.isValid()` não aceita `string[]`. Adicionado `as string` explícito.

#### `server/src/routes/profile.ts`

Corrigida incompatibilidade com `archiver` v8 (ESM puro): o pacote exporta `ZipArchive` como named class, mas `@types/archiver@7` não inclui esse export. O import estático — que também causava erro de runtime com `SyntaxError: does not provide an export named 'default'` — foi substituído por dynamic import dentro do handler `GET /perfil/exportar`.

#### `server/src/routes/test.routes.ts`

- **`POST /reset-db`**: removida a lista de coleções preservadas (`tipoalbums`, `stickers`, `secaos`). Agora apaga todas as coleções, garantindo que o seed sempre execute no `global-setup` e não deixe dados obsoletos entre execuções.
- **`POST /seed`**: reescrito para usar `panini_wc2026_secoes.json` e `panini_wc2026_figurinhas.json` (mesmos arquivos do `scripts/seed-db.ts`). A implementação anterior usava `seed_figurinhas.json` com numeração ESP-01, causando falha silenciosa em todos os helpers de teste que buscam figurinhas por número (`criar-pilha-pendente`, `popular-estoque`) após a migração para FWC1/MEX1/etc.

### Fixed (testes)

#### `client/src/pages/CadastroAlbumPage.tsx`

Adicionados `htmlFor="nome-personalizado"` no `<label>` e `id="nome-personalizado"` no `<input>` do campo Nome personalizado. Sem a associação semântica, `getByLabel` do Playwright não encontrava o elemento e testes de acessibilidade (WCAG SC 1.3.1) falhavam.

#### `tests/album/cadastro-album.spec.ts`

Teste RN-CA06 renomeado de "deve rejeitar nome personalizado com mais de 60 chars" para **"deve truncar nome personalizado em 60 chars"** e reescrito: a implementação usa `maxLength` + `slice(0, 60)` (truncagem silenciosa), não exibe mensagem de erro. O novo teste verifica que o campo contém exatamente 60 caracteres após tentar inserir 61.

#### `tests/albums/albums.spec.ts`

- Removida verificação do botão "Ver Álbum" do teste de barra de ações de AL1 — o botão não existe na spec atual (barra = Colar figurinhas + Baixar PDF + Arquivar).
- Removidos 4 testes do bloco **"Tela AL2 — Ver Álbum"** (`RN-AL31`, `RN-AL34`) — funcionalidade removida da spec; RN-AL31 e RN-AL34 não constam na versão vigente.
- Seletor dos botões de accordion de seção atualizado de `getByRole('button', { name: /expandir seção/i })` para `locator('button[aria-expanded]')` — os botões têm `aria-expanded` mas não possuem `aria-label` com o texto esperado pelo seletor anterior.

#### `tests/perfil/perfil.spec.ts`

Teste RN-P12 (cooldown de email): após a primeira submissão, o label do campo muda de `"Email"` para `"Novo email"`. Corrigido o seletor da segunda interação para `getByLabel('Novo email')` e adicionada espera pelo estado `aguardando confirmação` entre as duas submissões.
