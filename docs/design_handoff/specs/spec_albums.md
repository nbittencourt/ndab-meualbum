# Especificação Funcional — Álbuns (Gerenciamento)

> **Dependências:** Especificação de Cadastro de Usuários · Especificação de Login e Recuperação de Senha · Especificação da Home (Álbuns) · Especificação de Cadastro de Álbum · Especificação de Abrir Pacotinhos
> **Fluxos referenciados mas fora do escopo:** Colar Figurinhas

---

## Histórico de Revisões

| Versão | Data | Alterações |
|---|---|---|
| 1.0 | inicial | Versão original |
| 1.1 | red team | **A1** — RN-AL01 corrigido: acesso permitido também para `EMAIL_PENDENTE`. **A4** — RN-AL18 complementado com comportamento de UX para rejeição de colagem em álbum arquivado (RN-AL18a). **M4** — geração de PDF especificada como síncrona com spinner bloqueante; conteúdo do PDF compactado (RN-AL19). **M8** — política de desnormalização de `Secao.total_figurinhas` explicitada (RN-AL20) |

---

## 1. Visão Geral

Tela dedicada à gestão dos álbuns do usuário. Acessada a partir da Home via ação de navegação explícita. Oferece lista completa dos álbuns ativos, gerenciamento individual de cada álbum (estado por seção, download de PDF de figurinhas faltantes, arquivamento) e seção de álbuns arquivados.

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
[Home — ação "Ver álbuns"]
        │
        ▼
[Tela AL0 — Lista de Álbuns]
  Lista paginada de álbuns ativos + seção de arquivados (condicional)
        │
        ├── [Card ativo — "Gerenciar"] → Tela AL1
        └── [Card arquivado — "Desarquivar"] → executa direto
                │
                ▼
[Tela AL1 — Gerenciamento do Álbum]
        │
        ├── [Seção — expandir] → lista figurinhas faltantes
        ├── ["Baixar PDF"] → geração síncrona com spinner bloqueante
        ├── ["Colar figurinhas"] → fluxo Colar Figurinhas
        └── ["Arquivar"] → confirmação inline → executa → redireciona para AL0
```

---

## 5. Conteúdo das Telas

### 5.1 Ação de navegação na Home

A Home recebe, na seção "Meus Álbuns", ação secundária "Ver todos os álbuns" que redireciona para AL0. Exibida independente do estado da lista.

### 5.2 Tela AL0 — Lista de Álbuns

**Header global** — idêntico ao da Home.

**Seção: Álbuns Ativos**

Comportamento, ordenação e paginação idênticos à Home (5 por página, `criado_em DESC`). Cada card inclui ação "Gerenciar" adicional além do "Colar figurinhas".

Estado vazio: mensagem informativa e CTA para Cadastro de Álbum.

**Seção: Álbuns Arquivados**

Exibida somente quando há ao menos 1 álbum arquivado. Quando vazia, a seção inteira é omitida.

Cada card exibe: tipo, variante, nome personalizado, data de criação, data de arquivamento, percentual de conclusão (somente leitura). Única ação disponível: "Desarquivar".

Lista não paginada; ordenada por `arquivado_em DESC`.

---

### 5.3 Tela AL1 — Gerenciamento do Álbum

Acessada exclusivamente para álbuns ativos via AL0.

**Cabeçalho:** tipo do álbum, variante por extenso, nome personalizado, data de criação, percentual de conclusão com barra de progresso.

**Barra de ações:**
- **"Colar figurinhas"** — redireciona para Colar Figurinhas com este álbum como contexto
- **"Baixar PDF"** — geração síncrona com spinner bloqueante (ver 5.4)
- **"Arquivar"** — confirmação inline (ver 5.5)

**Lista de seções**

Cada seção: nome, progresso (`coladas / total`), barra proporcional, indicador de seção completa.

Expandida: lista de figurinhas faltantes (número + nome). Seção completa: exibe mensagem de confirmação.

Ordenada por `Secao.ordem ASC`.

---

### 5.4 PDF de Figurinhas Faltantes

Gerado de forma **síncrona** ao acionar "Baixar PDF". Durante a geração:
- O botão "Baixar PDF" é substituído por spinner bloqueante com rótulo "Gerando PDF..."
- As demais ações da barra ("Colar figurinhas", "Arquivar") são desabilitadas durante a geração
- Ao concluir: download iniciado automaticamente; barra de ações retorna ao estado normal

**Conteúdo — formato compacto:**
- Identificação do álbum (tipo, variante, nome personalizado quando preenchido) e data/hora da geração
- Totais: coladas, faltantes, percentual de conclusão
- Lista de figurinhas faltantes organizada por seção em **layout de múltiplas colunas por página** — apenas número e nome da figurinha, uma por linha, sem imagens ou elementos decorativos
- Seções completamente preenchidas são omitidas

O PDF reflete o estado atual no momento do acionamento; não há cache.

**Falha na geração:** mensagem de erro inline na barra de ações; botões retornam ao estado habilitado.

---

### 5.5 Arquivamento

Ao clicar em "Arquivar":

> "Arquivar este álbum? Ele ficará oculto das listas principais e não poderá receber novas colagens enquanto arquivado."

**Botões:** "Confirmar arquivamento" · "Cancelar"

Confirmado: `Álbum.arquivado_em = agora`; redireciona para AL0.

---

### 5.6 Desarquivamento

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
| RN-AL16 | A ordem das seções na Tela AL1 é determinada por `Secao.ordem ASC` |
| RN-AL17 | O PDF é gerado sob demanda e reflete o estado atual do álbum; não há cache |
| RN-AL18 | Um álbum arquivado não pode receber novas figurinhas coladas; tentativas direcionadas a ele pelo backend são rejeitadas com erro |
| RN-AL18a | Quando o backend rejeitar colagem por álbum arquivado (RN-AL18), o comportamento de UX varia por fluxo: **Abrir Pacotinhos (MCol)** — mensagem de erro exibida no modal; botão "Colar" desabilitado para aquele álbum; outros álbuns elegíveis permanecem disponíveis. **Colar Figurinhas** — mensagem de erro inline na tela; a tela permanece aberta; botões de colagem para aquele álbum são desabilitados |
| RN-AL19 | A geração do PDF é **síncrona**: ao acionar "Baixar PDF", spinner bloqueante substitui o botão e as demais ações da barra ficam desabilitadas até conclusão ou falha. Conteúdo do PDF restrito a: identificação do álbum, data de geração, totais e lista de faltantes em colunas (número + nome apenas, sem imagens) |
| RN-AL20 | `Secao.total_figurinhas` é um campo **desnormalizado**, equivalente a `COUNT(Figurinha WHERE secao_id = X)`. Deve ser recalculado e atualizado sempre que figurinhas forem adicionadas ou removidas da seção correspondente. Essa operação é administrativa, ocorre fora dos fluxos de usuário e deve ser executada atomicamente com a alteração do catálogo |

---

## 7. Estados de Carregamento e Erro

| Situação | Comportamento |
|---|---|
| Carregamento inicial de AL0 | Seções exibem skeleton/placeholder |
| Carregamento inicial de AL1 | Lista de seções exibe skeleton |
| Falha ao carregar álbuns ativos | Mensagem de erro inline com opção de tentar novamente |
| Falha ao carregar álbuns arquivados | Mensagem de erro inline na seção arquivados |
| Falha ao gerar PDF | Mensagem de erro inline na barra de ações; botão retorna ao estado habilitado |
| Falha ao arquivar ou desarquivar | Mensagem de erro inline; estado do álbum não alterado |
| Sessão expirada (JWT inválido ou `token_versao` divergente) | Redireciona automaticamente para a tela de Login |

---

## 8. Fluxos Relacionados (fora do escopo desta spec)

| Fluxo | Gatilho nesta spec |
|---|---|
| **Colar Figurinhas** | Botão "Colar figurinhas" na barra de ações de AL1 |
| **Cadastro de Álbum** | CTA do estado vazio da seção Álbuns Ativos em AL0 |
| **Home** | Ação "Ver álbuns" na Home navega para AL0 |
