# Especificação Funcional — Página Principal (Home)

> **Dependências:** Especificação de Cadastro de Usuários · Especificação de Login e Recuperação de Senha  
> **Fluxos referenciados mas fora do escopo:** Cadastro de Álbum · Colar Figurinhas (tela dedicada por álbum) · Abrir Pacotinhos

---

## 1. Visão Geral

Página principal da aplicação, acessada após login bem-sucedido de usuário com `status = ATIVO`. Apresenta três elementos principais de conteúdo:

- **CTA "Abrir Pacotinhos"** — destaque visual permanente que direciona o usuário ao fluxo de abertura de pacotes.
- **Álbuns** — lista paginada dos álbuns do usuário, com ação de entrada no fluxo de colagem.
- **Figurinhas Repetidas** — ranking das 5 figurinhas com maior estoque e total consolidado do acervo solto do usuário.

A página também contém header global (navegação de perfil e logout) e rodapé com links externos.

---

## 2. Entidades e Dados

### 2.1 Álbum

| Campo | Tipo | Observações |
|---|---|---|
| `id` | Identificador único | Chave primária |
| `usuario_id` | FK → Usuário | Proprietário do álbum |
| `tipo_album_id` | FK → TipoAlbum | Referência ao catálogo de tipos (ex.: "Copa do Mundo 2026") |
| `nome_personalizado` | String \| null | Apelido livre definido pelo usuário; exibido no card |
| `criado_em` | Timestamp | Data de criação do álbum |

> Um usuário pode ter múltiplos álbuns do mesmo `tipo_album_id`.

### 2.2 TipoAlbum

| Campo | Tipo | Observações |
|---|---|---|
| `id` | Identificador único | Chave primária |
| `nome` | String | Nome da edição — ex.: "Copa do Mundo 2026 — Panini" |
| `variante` | Enum | Versão física do álbum — ver tabela abaixo |
| `total_figurinhas` | Integer | Total de posições coláveis no álbum |

**Variantes disponíveis — Copa do Mundo 2026 (Panini):**

| Valor do Enum | Descrição | Preço de lançamento (BRL) | Observações |
|---|---|---|---|
| `BROCHURA` | Capa cartão | R$ 24,90 | Formato clássico de entrada |
| `CAPA_DURA` | Capa dura padrão | R$ 74,90 | Maior durabilidade |
| `CAPA_DURA_PRATA` | Capa dura prata | R$ 79,90 | Acabamento especial prateado |
| `CAPA_DURA_OURO` | Capa dura ouro | R$ 79,90 | Acabamento especial dourado |
| `BOX_PREMIUM` | Box Premium | R$ 359,90 | Capa dura metalizada + 40 envelopes; exclusivo no site oficial |

> Todas as variantes compartilham o mesmo conteúdo de 980 figurinhas e 112 páginas. A diferença é exclusivamente de acabamento físico e canal de venda. O campo `variante` permite que o sistema exiba a versão correta no card do álbum e viabilize filtros futuros por tipo de acabamento.

### 2.3 FigurinhaColada

| Campo | Tipo | Observações |
|---|---|---|
| `id` | Identificador único | Chave primária |
| `album_id` | FK → Álbum | Álbum ao qual pertence |
| `figurinha_id` | FK → Figurinha | Figurinha do catálogo |
| `colada_em` | Timestamp | Data/hora da colagem |

> O percentual de conclusão de um álbum é `COUNT(FigurinhaColada WHERE album_id = X) / TipoAlbum.total_figurinhas`.

### 2.4 EstoqueFigurinha (figurinhas soltas do usuário)

| Campo | Tipo | Observações |
|---|---|---|
| `id` | Identificador único | Chave primária |
| `usuario_id` | FK → Usuário | Proprietário do estoque |
| `figurinha_id` | FK → Figurinha | Figurinha do catálogo |
| `quantidade` | Integer ≥ 0 | Cópias disponíveis no estoque; decrementado ao colar como "repetida" |

> Figurinhas no estoque **não estão associadas a um álbum**. A associação ocorre apenas no ato de colar (fluxo "Colar Figurinhas"). Alimentar o estoque é responsabilidade do fluxo "Abrir Pacotinhos" (fora do escopo desta spec).

### 2.5 Figurinha (catálogo)

| Campo | Tipo | Observações |
|---|---|---|
| `id` | Identificador único | Chave primária |
| `numero` | String | Número/código da figurinha conforme o álbum (ex.: "BRA-7") |
| `nome` | String | Nome do jogador ou item representado |
| `tipo_album_id` | FK → TipoAlbum | Álbum ao qual pertence a figurinha no catálogo |

---

## 3. Fluxo de Dados

```
[Usuário autenticado — status = ATIVO]
        │
        ▼
[GET /home]
  Sistema carrega, para o usuário autenticado:
    A. Lista de álbuns (paginada, 5 por página)
       - Para cada álbum: nome_personalizado, tipo_album.nome,
         criado_em, percentual_conclusao
    B. Top 5 figurinhas do estoque com maior quantidade
       - Para cada figurinha: figurinha.numero, figurinha.nome, quantidade
    C. Total de figurinhas no estoque (SUM de EstoqueFigurinha.quantidade)
        │
        ▼
  Renderiza Home com CTA, seções A e B/C
        │
        ├── [Clique em "Abrir Pacotinhos"] → redireciona para fluxo de Abrir Pacotinhos
        ├── [Clique em "Colar figurinhas"] → redireciona para Tela de Colagem do álbum
        ├── [Clique em "Novo álbum"] → redireciona para fluxo de Cadastro de Álbum
        └── [Troca de página] → GET /home?pagina=N — recarrega seção de álbuns
```

---

## 4. Regras de Negócio

| # | Regra |
|---|---|
| RN-H01 | Apenas usuários com `status = ATIVO` acessam a Home; `PENDENTE` é redirecionado para a Tela 2 de Confirmação de Email |
| RN-H02 | O percentual de conclusão é calculado como `figurinhas_coladas / total_figurinhas_do_tipo × 100`, arredondado para 1 casa decimal |
| RN-H03 | Se o usuário não possui nenhum álbum, a seção de álbuns exibe exclusivamente o estado vazio (placeholder) |
| RN-H04 | A listagem de álbuns é ordenada por `criado_em DESC` (mais recente primeiro) por padrão |
| RN-H05 | A paginação é ativada somente quando o usuário possui mais de 5 álbuns; com até 5 álbuns, não há controles de paginação |
| RN-H06 | Cada página exibe exatamente 5 álbuns, exceto a última, que pode conter de 1 a 5 |
| RN-H07 | O ranking de repetidas considera o estoque global do usuário (`EstoqueFigurinha`), independente de álbum |
| RN-H08 | Somente figurinhas com `quantidade ≥ 1` no estoque são consideradas no ranking e no total |
| RN-H09 | Em caso de empate de quantidade no ranking, o desempate é por `figurinha.numero` ASC |
| RN-H10 | O total de repetidas é a soma de `EstoqueFigurinha.quantidade` para todas as figurinhas do usuário |
| RN-H11 | Se o estoque estiver vazio (nenhuma figurinha solta), a seção de repetidas exibe estado vazio próprio |
| RN-H12 | O botão "Colar figurinhas" está disponível para todos os álbuns, independentemente do percentual de conclusão |
| RN-H13 | O título principal do card é sempre `tipo_album.nome`; o `nome_personalizado`, quando preenchido, é exibido como subtítulo abaixo do título |
| RN-H14 | O CTA "Abrir Pacotinhos" é exibido em todas as situações da Home, independente do estado dos álbuns ou do estoque |

---

## 5. Conteúdo da Página

A página é composta pelos seguintes blocos de conteúdo, apresentados nesta ordem. Layout, estilos e componentes visuais são definidos externamente pelo design.

**Header global**
Nome/logotipo da aplicação, identificação do usuário (nome e identificador público de 6 chars) e ação de logout.

**CTA: Abrir Pacotinhos**
Bloco de destaque permanente — visível em todas as situações da página, independente do estado dos álbuns ou do estoque. Direciona para o fluxo de Abrir Pacotinhos. Deve receber hierarquia visual superior às demais seções por ser o ponto de entrada da jornada de uso recorrente.

**Seção: Meus Álbuns**
Título da seção e ação "Novo álbum" (redireciona para Cadastro de Álbum).

- **Estado vazio:** mensagem informativa e CTA para criação do primeiro álbum.
- **Estado com álbuns:** grade de cards, um por álbum. Cada card expõe: tipo do álbum (`tipo_album.nome`), variante por extenso (ex.: "Capa dura ouro"), nome personalizado quando preenchido, data de criação, percentual de conclusão com representação visual de progresso, e botão "Colar figurinhas" (redireciona para a Tela de Colagem do álbum).
- **Paginação:** exibida somente quando o usuário possui mais de 5 álbuns; controles de página anterior/próxima com indicador de posição atual.

**Seção: Figurinhas Repetidas**
Total consolidado de figurinhas no estoque e ranking das 5 com maior quantidade. Cada item do ranking exibe: posição, número da figurinha, nome do jogador/item e quantidade de cópias. Seção somente leitura.

- **Estado vazio:** mensagem informativa quando o estoque não possui nenhuma figurinha.

**Footer**
Links externos para a página oficial da Copa do Mundo 2026 (FIFA) e para a página do álbum na Panini Comics. Ambos abrem em nova aba.

## 6. Estados de Carregamento e Erro

| Situação | Comportamento |
|---|---|
| Carregamento inicial da página | Seções exibem skeleton/placeholder de loading enquanto os dados são buscados |
| Falha ao carregar álbuns | Mensagem de erro inline na seção com opção de tentar novamente |
| Falha ao carregar estoque | Mensagem de erro inline na seção de repetidas com opção de tentar novamente |
| Sessão expirada (JWT inválido) | Redireciona automaticamente para a tela de Login |

---

## 7. Fluxos Relacionados (fora do escopo desta spec)

| Fluxo | Gatilho nesta tela |
|---|---|
| **Cadastro de Álbum** | Botão "+ Novo álbum" (header da seção) ou CTA do estado vazio |
| **Colar Figurinhas** | Botão "Colar figurinhas" em qualquer card de álbum |
| **Abrir Pacotinhos** | CTA em destaque no topo da página |
