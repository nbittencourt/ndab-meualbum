# Especificação Funcional — Página Principal (Home)

> **Dependências:** Especificação de Cadastro de Usuários · Especificação de Login e Recuperação de Senha
> **Fluxos referenciados mas fora do escopo:** Cadastro de Álbum · Colar Figurinhas · Abrir Pacotinhos

---

## Histórico de Revisões

| Versão | Data | Alterações |
|---|---|---|
| 1.0 | inicial | Versão original |
| 1.1 | revisão | Campo `variante` movido de `TipoAlbum` para `Álbum`; `TipoAlbum` passa a representar uma edição única |
| 1.2 | revisão | RN-H01 atualizado: acesso permitido também para `EMAIL_PENDENTE` |
| 1.3 | red team | **B2** — `variante` passa a ser obrigatório (não nulo), com valor padrão `BROCHURA`; RN-H16 atualizado. **M8** — `TipoAlbum.total_figurinhas` e `Secao.total_figurinhas` definidos como desnormalizados com regra de invalidação de cache (RN-H17, RN-H18) |
| 1.4 | WCAG | Links externos do footer atualizados com indicador de nova aba. Requisitos de acessibilidade adicionados (RN-H19 a RN-H26). |
| 1.6 | ajuste conteúdo | **Total de figurinhas corrigido:** 980 → 994 (alinhado com catálogo real do seed). Links para FIFA e Panini Comics removidos do footer por questões de direitos autorais — RN-H25 descontinuado. Footer contém apenas "Política de Privacidade" e "Gerenciar cookies". |
| 1.7 | 2026-06-10 | **DEC-2** — Clique no card de álbum da Home navega para `/albums/:id`. RN-H31 adicionado. RN-H20 complementado com acessibilidade do card como alvo navegável. (Issue #20) |
| 1.5 | ajustes UX | **RN-H27** — recarga obrigatória da seção "Meus Álbuns" ao acessar a Home. **RN-H28** — recarga obrigatória ao retornar do fluxo de Cadastro de Álbum. **RN-H29** — identidade visual do card reflete a variante do álbum. Header e footer globais tornados obrigatórios em todas as telas da aplicação (alinhamento com demais specs). |

---

## 1. Visão Geral

Página principal da aplicação, acessada após login bem-sucedido de usuário com `status = ATIVO` ou `EMAIL_PENDENTE`. Apresenta três elementos principais de conteúdo:

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
| `tipo_album_id` | FK → TipoAlbum | Referência ao catálogo de tipos |
| `variante` | Enum | Versão física do álbum adquirida pelo usuário — ver tabela abaixo. **Obrigatório; valor padrão `BROCHURA`** |
| `nome_personalizado` | String \| null | Apelido livre definido pelo usuário; exibido no card |
| `criado_em` | Timestamp | Data de criação do álbum |
| `arquivado_em` | Timestamp \| null | Preenchido no arquivamento; `null` enquanto ativo. Definido em spec_albums |

> Um usuário pode ter múltiplos álbuns do mesmo `tipo_album_id`. A `variante` descreve o acabamento físico e não altera o catálogo de figurinhas — todos os álbuns do mesmo `tipo_album_id` compartilham as mesmas 994 posições coláveis (sendo 993 que contam para fechamento do álbum).

**Variantes disponíveis — Copa do Mundo 2026 (Panini):**

| Valor do Enum | Descrição | Preço de lançamento (BRL) |
|---|---|---|
| `BROCHURA` | Capa cartão | R$ 24,90 |
| `CAPA_DURA` | Capa dura padrão | R$ 74,90 |
| `CAPA_DURA_PRATA` | Capa dura prata | R$ 79,90 |
| `CAPA_DURA_OURO` | Capa dura ouro | R$ 79,90 |
| `BOX_PREMIUM` | Box Premium | R$ 359,90 |

### 2.2 TipoAlbum

| Campo | Tipo | Observações |
|---|---|---|
| `id` | Identificador único | Chave primária |
| `nome` | String | Nome da edição |
| `total_figurinhas` | Integer | Total de posições coláveis. **Desnormalizado** — ver RN-H17 |

> `TipoAlbum` representa uma edição do álbum (conteúdo). Há exatamente 1 registro por edição.

### 2.3 FigurinhaColada

| Campo | Tipo | Observações |
|---|---|---|
| `id` | Identificador único | Chave primária |
| `album_id` | FK → Álbum | Álbum ao qual pertence |
| `figurinha_id` | FK → Figurinha | Figurinha do catálogo |
| `colada_em` | Timestamp | Data/hora da colagem |

> O par `(album_id, figurinha_id)` é único em `FigurinhaColada` — ver RN-CF00 em spec_colar_figurinhas.
> O percentual de conclusão de um álbum é `COUNT(FigurinhaColada WHERE album_id = X) / TipoAlbum.total_figurinhas`.

### 2.4 EstoqueFigurinha

| Campo | Tipo | Observações |
|---|---|---|
| `id` | Identificador único | Chave primária |
| `usuario_id` | FK → Usuário | Proprietário do estoque |
| `figurinha_id` | FK → Figurinha | Figurinha do catálogo |
| `quantidade` | Integer ≥ 0 | Cópias disponíveis. O decremento é operação atômica com verificação prévia de `quantidade > 0` |

> Figurinhas no estoque **não estão associadas a um álbum**. A associação ocorre apenas no ato de colar.

### 2.5 Figurinha (catálogo)

| Campo | Tipo | Observações |
|---|---|---|
| `id` | Identificador único | Chave primária |
| `numero` | String | Número/código da figurinha conforme o álbum |
| `nome` | String | Nome do jogador ou item representado |
| `tipo_album_id` | FK → TipoAlbum | Álbum ao qual pertence a figurinha no catálogo |
| `secao_id` | FK → Secao | Seção do catálogo à qual pertence. Definido em spec_albums |

---

## 3. Fluxo de Dados

```
[Usuário autenticado — status = ATIVO ou EMAIL_PENDENTE]
        │
        ▼
[Acesso à Home — qualquer origem: login, retorno de fluxo, navegação direta]
  Sistema SEMPRE recarrega os dados da seção "Meus Álbuns" (ver RN-H27, RN-H28):
    A. Lista de álbuns ativos (arquivado_em IS NULL), paginada, 5 por página
       - Para cada álbum: nome_personalizado, tipo_album.nome, variante,
         criado_em, percentual_conclusao
    B. Top 5 figurinhas do estoque com maior quantidade
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
| RN-H01 | Apenas usuários com `status = ATIVO` ou `EMAIL_PENDENTE` acessam a Home; `PENDENTE` é redirecionado para a Tela 2 de Confirmação de Email |
| RN-H02 | O percentual de conclusão é calculado como `figurinhas_coladas / total_figurinhas_do_tipo × 100`, arredondado para 1 casa decimal |
| RN-H03 | Se o usuário não possui nenhum álbum, a seção de álbuns exibe exclusivamente o estado vazio |
| RN-H04 | A listagem de álbuns é ordenada por `criado_em DESC` (mais recente primeiro) |
| RN-H05 | A paginação é ativada somente quando o usuário possui mais de 5 álbuns ativos |
| RN-H06 | Cada página exibe exatamente 5 álbuns, exceto a última |
| RN-H07 | O ranking de repetidas considera o estoque global do usuário (`EstoqueFigurinha`), independente de álbum |
| RN-H08 | Somente figurinhas com `quantidade ≥ 1` são consideradas no ranking e no total |
| RN-H09 | Em caso de empate de quantidade no ranking, o desempate é por `figurinha.numero` ASC |
| RN-H10 | O total de repetidas é a soma de `EstoqueFigurinha.quantidade` para todas as figurinhas do usuário |
| RN-H11 | Se o estoque estiver vazio, a seção de repetidas exibe estado vazio próprio |
| RN-H12 | O botão "Colar figurinhas" está disponível para todos os álbuns ativos, independentemente do percentual de conclusão |
| RN-H13 | O título principal do card é sempre `tipo_album.nome`; o `nome_personalizado`, quando preenchido, é exibido como subtítulo |
| RN-H14 | O CTA "Abrir Pacotinhos" é exibido em todas as situações da Home |
| RN-H15 | Álbuns de diferentes variantes do mesmo `tipo_album_id` compartilham o mesmo catálogo de figurinhas |
| RN-H16 | A `variante` é obrigatória e sempre preenchida (valor padrão `BROCHURA`); é exibida por extenso no card para identificação do álbum físico |
| RN-H17 | `TipoAlbum.total_figurinhas` é um campo **desnormalizado** mantido em sincronia com `COUNT(Figurinha WHERE tipo_album_id = X)`. Deve ser recalculado e atualizado sempre que figurinhas forem adicionadas ou removidas do catálogo desse `TipoAlbum`. Operações de catálogo são administrativas e ocorrem fora dos fluxos de usuário |
| RN-H18 | `Secao.total_figurinhas` (definido em spec_albums) segue a mesma política de desnormalização de RN-H17: recalculado sempre que figurinhas forem adicionadas ou removidas da seção correspondente |
| RN-H27 | Ao acessar a Home — seja por login, navegação direta ou retorno de qualquer fluxo — a seção "Meus Álbuns" e a seção "Figurinhas Repetidas" DEVEM ser sempre recarregadas do backend. Cache local dessas seções não é permitido entre navegações |
| RN-H28 | Ao retornar do fluxo de Cadastro de Álbum para a Home, o sistema DEVE recarregar a seção "Meus Álbuns" antes de renderizar o conteúdo, garantindo que o álbum recém-criado apareça no topo da lista (`criado_em DESC`) |
| RN-H29 | O card de cada álbum DEVE aplicar identidade visual correspondente à sua `variante`: cada valor do enum possui tratamento visual distinto (ex.: paleta de cores, borda, selo ou elemento gráfico característico). A definição dos atributos visuais por variante é responsabilidade do processo de design, mas a **associação entre `variante` e tratamento visual é obrigatória** — cards de variantes diferentes não podem ter aparência idêntica |

---

## 5. Conteúdo da Página

**Header global**
Nome/logotipo da aplicação, identificação do usuário (nome e identificador público de 6 chars) e ação de logout. Presente em todas as telas da aplicação (ver RN-GL01 em spec_privacidade_lgpd ou definição global de layout).

**CTA: Abrir Pacotinhos**
Bloco de destaque permanente. Hierarquia visual superior às demais seções.

**Seção: Meus Álbuns**
Título da seção, ação "Novo álbum" e ação secundária "Ver todos os álbuns" (navega para tela AL0 de spec_albums).

- **Estado vazio:** mensagem informativa e CTA para criação do primeiro álbum.
- **Estado com álbuns:** grade de cards. Cada card expõe: tipo do álbum, variante por extenso, nome personalizado quando preenchido, data de criação, percentual de conclusão com representação visual de progresso, botão "Colar figurinhas", e identidade visual da variante (RN-H29).
- **Paginação:** exibida somente quando há mais de 5 álbuns ativos.

**Seção: Figurinhas Repetidas**
Total consolidado de figurinhas no estoque e ranking das 5 com maior quantidade. Cada item exibe: posição, número da figurinha, nome do jogador/item e quantidade de cópias. Seção somente leitura.

- **Estado vazio:** mensagem informativa quando o estoque não possui nenhuma figurinha.

**Footer**
Link "Política de Privacidade" (abre em nova aba) e link "Gerenciar cookies" (reabre painel de preferências de cookies — spec_privacidade_lgpd RN-PR16). Links externos para FIFA e Panini Comics foram removidos por questões de direitos autorais.

---

## 6. Estados de Carregamento e Erro

| Situação | Comportamento |
|---|---|
| Carregamento inicial da página | Seções exibem skeleton/placeholder de loading |
| Falha ao carregar álbuns | Mensagem de erro inline na seção com opção de tentar novamente |
| Falha ao carregar estoque | Mensagem de erro inline na seção de repetidas com opção de tentar novamente |
| Sessão expirada (JWT inválido ou `token_versao` divergente) | Redireciona automaticamente para a tela de Login |

---

## 7. Fluxos Relacionados (fora do escopo desta spec)

| Fluxo | Gatilho nesta tela |
|---|---|
| **Cadastro de Álbum** | Botão "+ Novo álbum" ou CTA do estado vazio |
| **Colar Figurinhas** | Botão "Colar figurinhas" em qualquer card de álbum |
| **Abrir Pacotinhos** | CTA em destaque no topo da página |
| **Álbuns (AL0)** | Ação "Ver todos os álbuns" na seção Meus Álbuns |

---

## 8. Requisitos de Acessibilidade (WCAG 2.2 / 2.0 AA)

As regras globais constam em `spec_privacidade_lgpd` (Seção 9). As regras abaixo são específicas deste fluxo.

| # | Regra |
|---|---|
| RN-H19 | O CTA "Abrir Pacotinhos" DEVE ter rótulo descritivo que comunique a ação ao ser lido isoladamente por leitor de tela; ícone decorativo associado DEVE ser `aria-hidden="true"` |
| RN-H20 | Cada card de álbum DEVE ter hierarquia de heading adequada; o botão "Colar figurinhas" DEVE ter `aria-label` que inclua o nome do álbum (ex.: "Colar figurinhas em Copa do Mundo 2026 — Brochura") para distinguir entre múltiplos cards. O card como alvo navegável (RN-H31) DEVE ter `aria-label` descritivo (ex.: "Gerenciar álbum Copa do Mundo 2026 — Brochura") que comunique o destino da navegação a leitores de tela. |
| RN-H21 | A barra de progresso de conclusão de cada card DEVE usar `role="progressbar"` com `aria-valuenow`, `aria-valuemin`, `aria-valuemax` e `aria-valuetext` com o percentual em linguagem natural |
| RN-H22 | O skeleton/placeholder de carregamento DEVE marcar o contêiner com `aria-busy="true"`; ao concluir, o conteúdo real DEVE ser disponibilizado sem anúncio intrusivo |
| RN-H23 | O controle de paginação DEVE expor a página atual com `aria-current="page"`; botões de navegação DEVEM ter `aria-label` descritivo (ex.: "Ir para página 2 de 5") |
| RN-H24 | O ranking de figurinhas repetidas DEVE ser lista ordenada com cada item descrevendo posição, número da figurinha, nome e quantidade em texto legível por TA |
| ~~RN-H25~~ | ~~Links externos do footer (FIFA, Panini)~~ — **descontinuado** (v1.6): links removidos por direitos autorais. |
| RN-H26 | O header global DEVE conter um link "Pular para o conteúdo principal" como primeiro elemento focável da página, para que usuários de teclado possam pular a navegação repetida a cada tela |
| RN-H30 | A identidade visual da variante (RN-H29) DEVE ser comunicada também por texto acessível no card — não apenas por cor ou elemento gráfico — garantindo leitura por tecnologias assistivas |
| RN-H31 | Clicar ou acionar por teclado (tecla Enter) o card de álbum na Home navega para a página de gerenciamento do álbum (`/albums/:id`); o card DEVE ter `role="link"`, `tabIndex="0"` e `aria-label` descritivo (ex.: "Gerenciar álbum Copa do Mundo 2026 — Brochura"). O botão "Colar figurinhas" dentro do card DEVE impedir a propagação do evento de clique (`stopPropagation`) para preservar sua navegação independente. (Issue #20 · DEC-2) |
