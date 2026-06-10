# Especificação Funcional — Álbuns (Gerenciamento)

> **Dependências:** Especificação de Cadastro de Usuários · Especificação de Login e Recuperação de Senha · Especificação da Home (Álbuns) · Especificação de Cadastro de Álbum · Especificação de Abrir Pacotinhos
> **Fluxos referenciados mas fora do escopo:** Colar Figurinhas

---

## Histórico de Revisões

| Versão | Data | Alterações |
|---|---|---|
| 1.0 | inicial | Versão original |
| 1.1 | red team | **A1** — RN-AL01 corrigido: acesso permitido também para `EMAIL_PENDENTE`. **A4** — RN-AL18 complementado com comportamento de UX para rejeição de colagem em álbum arquivado (RN-AL18a). **M4** — geração de PDF especificada como síncrona com spinner bloqueante; conteúdo do PDF compactado (RN-AL19). **M8** — política de desnormalização de `Secao.total_figurinhas` explicitada (RN-AL20) |
| 1.2 | WCAG | RN-AL19 atualizado: PDF DEVE ser tagged (PDF/UA) para acessibilidade de leitores de tela. Requisitos de acessibilidade adicionados (RN-AL21 a RN-AL27). |
| 1.3 | ajustes UX | **RN-AL28** — acesso à AL1 formalizado via botão "Gerenciar" nos cards da AL0. **RN-AL29** — AL0 recarrega lista ao ser acessada. **RN-AL30** — botão "Baixar PDF" incluído na AL0 (card). **RN-AL31** — botão "Ver Álbum" incluído na AL1 (visualização de figurinhas faltantes por seção). **RN-AL32** — sombra do botão "Arquivar" no modal de confirmação é preta. **RN-AL33** — identidade visual do card reflete a variante (alinhamento com RN-H29). Header e footer globais explicitados em todas as telas. |

---

## 1. Visão Geral

Tela dedicada à gestão dos álbuns do usuário. Acessada a partir da Home via ação de navegação explícita. Oferece lista completa dos álbuns ativos, gerenciamento individual de cada álbum (visualização por seção, download de PDF de figurinhas faltantes, arquivamento) e seção de álbuns arquivados.

---

## 2. Impacto em Specs Existentes

### 2.1 Alteração de entidade — `Álbum` (spec_home_albums)

Campo adicionado:

| Campo | Tipo | Observações |
|---|---|---|
| `arquivado_em` | Timestamp \| null | Preenchido no arquivamento; `null` enquanto ativo |

> Álbum ativo = `arquivado_em IS NULL`. Álbum arquivado = `arquivado_em IS NOT NULL`.

### 2.2 Alteração de entidade — `Figurinha` (spec_home_albums)

Campo adicionado:

| Campo | Tipo | Observações |
|---|---|---|
| `secao_id` | FK → Secao | Seção do catálogo à qual esta figurinha pertence. Obrigatório |

### 2.3 Alterações comportamentais em specs dependentes

| Spec | Comportamento afetado |
|---|---|
| **spec_home_albums** | A lista de álbuns da Home filtra exclusivamente `arquivado_em IS NULL`. A Home recebe ação de navegação para a tela AL0 |
| **spec_abrir_pacotinhos** | Álbuns elegíveis no MCol filtrados por `arquivado_em IS NULL` |
| **spec_colar_figurinhas** | Álbuns arquivados não são exibidos nem selecionáveis |

---

## 3. Nova Entidade — `Secao`

| Campo | Tipo | Observações |
|---|---|---|
| `id` | Identificador único | Chave primária |
| `tipo_album_id` | FK → TipoAlbum | Álbum ao qual a seção pertence |
| `nome` | String | Ex.: "Brasil", "Cromos Especiais" |
| `ordem` | Integer | Ordem de exibição na tela AL1 |
| `total_figurinhas` | Integer | **Desnormalizado** — ver RN-AL20 |

---

## 4. Fluxo Geral

```
[Home — ação "Ver todos os álbuns"]
        │
        ▼
[Tela AL0 — Lista de Álbuns]
  Lista recarregada a cada acesso (ver RN-AL29)
  Lista paginada de álbuns ativos + seção de arquivados (condicional)
        │
        ├── [Card ativo — "Gerenciar"] → Tela AL1  (ver RN-AL28)
        ├── [Card ativo — "Colar figurinhas"] → fluxo Colar Figurinhas
        ├── [Card ativo — "Figurinhas que faltam"] → geração síncrona com spinner bloqueante (ver RN-AL30)
        └── [Card arquivado — "Desarquivar"] → executa direto
                │
                ▼
[Tela AL1 — Gerenciamento do Álbum]
        │
        ├── [Seção — expandir] → lista figurinhas faltantes
        ├── ["Ver Álbum"] → Tela AL2 — visualização completa por seção (ver RN-AL31)
        ├── ["Figurinhas que faltam"] → geração síncrona com spinner bloqueante
        ├── ["Colar figurinhas"] → fluxo Colar Figurinhas
        └── ["Arquivar"] → confirmação inline → executa → redireciona para AL0
```

---

## 5. Conteúdo das Telas

### 5.1 Ação de navegação na Home

A Home recebe, na seção "Meus Álbuns", ação secundária "Ver todos os álbuns" que redireciona para AL0. Exibida independente do estado da lista.

### 5.2 Tela AL0 — Lista de Álbuns

**Header global** — idêntico ao da Home: nome/logotipo da aplicação, identificação do usuário (nome e identificador público de 6 chars) e ação de logout.

**Footer global** — idêntico ao da Home.

**Seção: Álbuns Ativos**

Comportamento, ordenação e paginação idênticos à Home (5 por página, `criado_em DESC`). Cada card inclui identidade visual da variante (RN-AL33) e as seguintes ações:

- **"Colar figurinhas"** — redireciona para o fluxo Colar Figurinhas com este álbum como contexto.
- **"Figurinhas que faltam"** — gera PDF de figurinhas faltantes diretamente do card, com o mesmo comportamento síncrono da AL1 (spinner bloqueante no card; demais ações do card desabilitadas durante a geração). Ver RN-AL30.
- **"Gerenciar"** — redireciona para a Tela AL1 deste álbum. Ver RN-AL28.

Estado vazio: mensagem informativa e CTA para Cadastro de Álbum.

**Seção: Álbuns Arquivados**

Exibida somente quando há ao menos 1 álbum arquivado. Quando vazia, a seção inteira é omitida.

Cada card exibe: tipo, variante, nome personalizado, data de criação, data de arquivamento, percentual de conclusão (somente leitura). Única ação disponível: "Desarquivar".

Lista não paginada; ordenada por `arquivado_em DESC`.

---

### 5.3 Tela AL1 — Gerenciamento do Álbum

Acessada exclusivamente para álbuns ativos via botão "Gerenciar" na AL0.

**Header global** — idêntico ao da Home.

**Footer global** — idêntico ao da Home.

**Cabeçalho da tela:** tipo do álbum, variante por extenso, nome personalizado, data de criação, percentual de conclusão com barra de progresso. O cabeçalho aplica a identidade visual da variante (RN-AL33).

**Barra de ações:**
- **"Colar figurinhas"** — redireciona para Colar Figurinhas com este álbum como contexto
- **"Ver Álbum"** — abre a Tela AL2 (visualização completa por seção). Ver RN-AL31.
- **"Figurinhas que faltam"** — geração síncrona com spinner bloqueante (ver 5.4)
- **"Arquivar"** — confirmação inline (ver 5.5)

**Lista de seções**

Cada seção: nome, progresso (`coladas / total`), barra proporcional, indicador de seção completa.

Expandida: lista de figurinhas faltantes (número + nome). Seção completa: exibe mensagem de confirmação.

Ordenada por `Secao.ordem ASC`.

---

### 5.4 Tela AL2 — Ver Álbum (Visualização Completa)

Acessada exclusivamente via botão "Ver Álbum" na Tela AL1. Não possui ações de colagem — é somente leitura.

**Header global** — idêntico ao da Home.

**Footer global** — idêntico ao da Home.

**Cabeçalho da tela:** tipo do álbum, variante por extenso, nome personalizado, percentual de conclusão geral.

**Conteúdo:** lista de todas as seções do álbum, ordenadas por `Secao.ordem ASC`. Cada seção é exibida expandida por padrão, listando **todas** as figurinhas da seção (coladas e faltantes) com indicação de estado por figurinha:

| Estado | Condição | Comunicação |
|---|---|---|
| **Colada** | Possui registro em `FigurinhaColada` para este álbum | Rótulo "Colada" + indicador visual positivo |
| **Faltante** | Não possui registro em `FigurinhaColada` para este álbum | Rótulo "Faltante" + indicador visual de pendência |

Cada figurinha exibe: número, nome, e indicador de estado. Seções completamente preenchidas exibem indicador de conclusão no cabeçalho da seção.

**Ação de retorno:** botão ou navegação de volta para a Tela AL1.

---

### 5.5 PDF de Figurinhas Faltantes

Gerado de forma **síncrona** ao acionar "Figurinhas que faltam" — disponível na AL0 (card) e na AL1 (barra de ações). Durante a geração:
- O botão "Figurinhas que faltam" é substituído por spinner bloqueante com rótulo "Gerando PDF..."
- As demais ações do escopo (barra de ações na AL1; ações do card na AL0) são desabilitadas durante a geração
- Ao concluir: download iniciado automaticamente; estado retorna ao normal

**Conteúdo — formato compacto:**
- Identificação do álbum (tipo, variante, nome personalizado quando preenchido) e data/hora da geração
- Totais: coladas, faltantes, percentual de conclusão
- Lista de figurinhas faltantes organizada por seção em **layout de múltiplas colunas por página** — apenas número e nome da figurinha, uma por linha, sem imagens ou elementos decorativos
- Seções completamente preenchidas são omitidas

O PDF reflete o estado atual no momento do acionamento; não há cache.

**Falha na geração:** mensagem de erro inline; botões retornam ao estado habilitado.

---

### 5.6 Arquivamento

Ao clicar em "Arquivar" na AL1, exibe confirmação inline:

> "Arquivar este álbum? Ele ficará oculto das listas principais e não poderá receber novas colagens enquanto arquivado."

**Botões:** "Confirmar arquivamento" · "Cancelar"

O botão "Confirmar arquivamento" é apresentado com sombra/destaque em **preto** (não vermelho). Ver RN-AL32.

Confirmado: `Álbum.arquivado_em = agora`; redireciona para AL0.

---

### 5.7 Desarquivamento

Acionado via "Desarquivar" no card arquivado de AL0. Executa diretamente, sem confirmação. `Álbum.arquivado_em = null`. Seção de arquivados atualizada imediatamente; se vazia, ocultada.

---

## 6. Regras de Negócio Consolidadas

| # | Regra |
|---|---|
| RN-AL01 | Apenas usuários com `status = ATIVO` ou `EMAIL_PENDENTE` acessam a funcionalidade Álbuns; `PENDENTE` é redirecionado para a Tela 2 de Confirmação de Email |
| RN-AL02 | Álbum ativo = `arquivado_em IS NULL`; álbum arquivado = `arquivado_em IS NOT NULL` |
| RN-AL03 | Álbuns arquivados não aparecem na Home, no MCol de Abrir Pacotinhos nem em nenhum fluxo de colagem |
| RN-AL04 | A Tela AL1 é acessível apenas para álbuns ativos |
| RN-AL05 | Percentual de conclusão de seção: `COUNT(FigurinhaColada WHERE album_id = X AND figurinha.secao_id = Y) / Secao.total_figurinhas × 100`, arredondado para 1 casa decimal |
| RN-AL06 | Percentual de conclusão geral do álbum: conforme RN-H02 de spec_home_albums |
| RN-AL07 | O PDF lista apenas figurinhas ainda não presentes em `FigurinhaColada` para o álbum no momento da geração |
| RN-AL08 | Seções completamente preenchidas são omitidas do PDF |
| RN-AL09 | O arquivamento requer confirmação explícita do usuário; o desarquivamento é executado diretamente sem confirmação |
| RN-AL10 | Arquivamento: `arquivado_em = agora`; desarquivamento: `arquivado_em = null` |
| RN-AL11 | Após arquivamento, redireciona para AL0; posição na seção de arquivados segue `arquivado_em DESC` |
| RN-AL12 | Após desarquivamento, o álbum retorna à lista ativa em posição determinada por `criado_em DESC` |
| RN-AL13 | A seção de álbuns arquivados em AL0 é ocultada quando vazia; não exibe estado vazio |
| RN-AL14 | A lista de álbuns arquivados não é paginada |
| RN-AL15 | `figurinha.secao_id` é obrigatório para todas as figurinhas do catálogo; não admite `null` |
| RN-AL16 | A ordem das seções na Tela AL1 e na Tela AL2 é determinada por `Secao.ordem ASC` |
| RN-AL17 | O PDF é gerado sob demanda e reflete o estado atual do álbum; não há cache |
| RN-AL18 | Um álbum arquivado não pode receber novas figurinhas coladas; tentativas direcionadas a ele pelo backend são rejeitadas com erro |
| RN-AL18a | Quando o backend rejeitar colagem por álbum arquivado (RN-AL18), o comportamento de UX varia por fluxo: **Abrir Pacotinhos (MCol)** — mensagem de erro exibida no modal; botão "Colar" desabilitado para aquele álbum; outros álbuns elegíveis permanecem disponíveis. **Colar Figurinhas** — mensagem de erro inline na tela; a tela permanece aberta; botões de colagem para aquele álbum são desabilitados |
| RN-AL19 | A geração do PDF é **síncrona**: ao acionar "Figurinhas que faltam", spinner bloqueante substitui o botão e as demais ações do escopo ficam desabilitadas até conclusão ou falha. Conteúdo do PDF restrito a: identificação do álbum, data de geração, totais e lista de faltantes em colunas (número + nome apenas, sem imagens). O PDF **DEVE ser gerado como PDF tagged** (conforme padrão PDF/UA), com estrutura de headings, listas e metadados de idioma declarados, de modo que leitores de tela possam percorrer o conteúdo de forma estruturada |
| RN-AL20 | `Secao.total_figurinhas` é um campo **desnormalizado**, equivalente a `COUNT(Figurinha WHERE secao_id = X)`. Deve ser recalculado e atualizado sempre que figurinhas forem adicionadas ou removidas da seção correspondente. Essa operação é administrativa, ocorre fora dos fluxos de usuário e deve ser executada atomicamente com a alteração do catálogo |
| RN-AL28 | Cada card de álbum ativo na Tela AL0 DEVE exibir o botão "Gerenciar", que redireciona para a Tela AL1 daquele álbum. O botão é exclusivo para álbuns ativos; cards de álbuns arquivados não exibem esta ação |
| RN-AL29 | A lista de álbuns da Tela AL0 DEVE ser sempre recarregada do backend ao acessar a tela, independente da origem da navegação. Cache local da listagem não é permitido entre navegações |
| RN-AL30 | O botão "Figurinhas que faltam" está disponível tanto na Tela AL0 (card de álbum ativo) quanto na Tela AL1 (barra de ações). Em ambos os contextos, o comportamento é idêntico: geração síncrona com spinner bloqueante, desabilitação das demais ações do escopo e download automático ao concluir. A geração acionada pelo card da AL0 não requer navegação para a AL1 |
| RN-AL31 | O botão "Ver Álbum" na barra de ações da Tela AL1 redireciona para a Tela AL2, que exibe todas as figurinhas do álbum (coladas e faltantes), organizadas por seção. A Tela AL2 é somente leitura — não expõe ações de colagem, arquivamento ou geração de PDF |
| RN-AL32 | O botão de confirmação no modal de arquivamento ("Confirmar arquivamento") DEVE ser apresentado com sombra/destaque em **preto**. O uso de vermelho neste elemento é incorreto e não deve ocorrer |
| RN-AL33 | O card de cada álbum na AL0, o cabeçalho da AL1 e o cabeçalho da AL2 DEVEM aplicar identidade visual correspondente à `variante` do álbum, em alinhamento com RN-H29 de spec_home_albums. Cada variante possui tratamento visual distinto; cards ou cabeçalhos de variantes diferentes não podem ter aparência idêntica |

---

## 7. Estados de Carregamento e Erro

| Situação | Comportamento |
|---|---|
| Carregamento inicial de AL0 | Seções exibem skeleton/placeholder |
| Carregamento inicial de AL1 | Lista de seções exibe skeleton |
| Carregamento inicial de AL2 | Lista de figurinhas por seção exibe skeleton |
| Falha ao carregar álbuns ativos | Mensagem de erro inline com opção de tentar novamente |
| Falha ao carregar álbuns arquivados | Mensagem de erro inline na seção arquivados |
| Falha ao gerar PDF (AL0 ou AL1) | Mensagem de erro inline no escopo do acionamento; botão retorna ao estado habilitado |
| Falha ao carregar figurinhas em AL2 | Mensagem de erro inline com opção de tentar novamente |
| Falha ao arquivar ou desarquivar | Mensagem de erro inline; estado do álbum não alterado |
| Sessão expirada (JWT inválido ou `token_versao` divergente) | Redireciona automaticamente para a tela de Login |

---

## 8. Requisitos de Acessibilidade (WCAG 2.2 / 2.0 AA)

As regras globais constam em `spec_privacidade_lgpd` (Seção 9). As regras abaixo são específicas deste fluxo.

| # | Regra |
|---|---|
| RN-AL21 | As barras de progresso por seção (coladas/total) DEVEM usar `role="progressbar"` com `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax` e `aria-valuetext` descrevendo o progresso em linguagem natural (ex.: "12 de 30 figurinhas, 40%") |
| RN-AL22 | O botão "Figurinhas que faltam" em estado de loading DEVE ter seu rótulo atualizado para "Gerando PDF..." e `aria-busy="true"` enquanto em processamento; ao concluir, o foco DEVE retornar ao botão com rótulo restaurado |
| RN-AL23 | Seções das Telas AL1 e AL2 DEVEM ser implementadas como regiões expandíveis (`aria-expanded`, `aria-controls`) com botão de controle que descreva o conteúdo (ex.: "Expandir seção Brasil — 12 de 30 figurinhas") |
| RN-AL24 | A mensagem de confirmação de seção completa DEVE ser anunciada via live region ao tornar-se visível |
| RN-AL25 | O diálogo de confirmação de arquivamento (seção 5.6) DEVE seguir padrão de modal acessível: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap, retorno de foco ao fechar |
| RN-AL26 | Os cards de álbum arquivado na Tela AL0 DEVEM indicar o estado de forma programática (ex.: `aria-label="[nome do álbum] — arquivado em [data]"`) |
| RN-AL27 | O PDF gerado (tagged) DEVE declarar `lang="pt-BR"` nos metadados, ter título do documento identificando o álbum, e usar marcação de tabela ou lista estruturada para as figurinhas faltantes |
| RN-AL34 | Na Tela AL2, os indicadores de estado por figurinha ("Colada", "Faltante") DEVEM ser comunicados por rótulo textual, nunca apenas por cor; o estado DEVE ser exposto programaticamente a cada item da lista |
| RN-AL35 | O botão "Gerenciar" no card da AL0 DEVE ter `aria-label` que inclua o nome do álbum (ex.: "Gerenciar Copa do Mundo 2026 — Brochura") para distinguir entre múltiplos cards |

---

## 9. Fluxos Relacionados (fora do escopo desta spec)

| Fluxo | Gatilho nesta spec |
|---|---|
| **Colar Figurinhas** | Botão "Colar figurinhas" na barra de ações de AL1 e no card da AL0 |
| **Cadastro de Álbum** | CTA do estado vazio da seção Álbuns Ativos em AL0 |
| **Home** | Ação "Ver álbuns" na Home navega para AL0 |
