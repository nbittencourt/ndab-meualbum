# Especificação Funcional — Colar Figurinhas

> **Dependências:** Especificação de Cadastro de Usuários · Especificação de Login e Recuperação de Senha · Especificação da Home (Álbuns) · Especificação de Abrir Pacotinhos · Especificação de Cadastro de Álbum
> **Fluxos referenciados mas fora do escopo:** Abrir Pacotinhos · Cadastro de Álbum

---

## Histórico de Revisões

| Versão | Data | Alterações |
|---|---|---|
| 1.0 | inicial | Versão original |
| 1.1 | correções + WCAG/LGPD | **Conflito A corrigido:** RN-CF01 atualizado para incluir `EMAIL_PENDENTE` (alinhamento com demais specs). **Conflito B corrigido:** Seção 2.1 corrigida — `origem = DIRETA` para colagens via MCol de Abrir Pacotinhos (que não passam por EstoqueFigurinha). Requisitos de acessibilidade adicionados (RN-CF19 a RN-CF24). |
| 1.2 | ajustes UX | Header e footer globais tornados obrigatórios em todas as telas. Mensagem de erro para figurinha não encontrada no MFN substituída por texto amigável (RN-CF25). Botão "Colar e Outra" adicionado ao MFN (RN-CF26). Ativação do modo câmera no MFN explicitada (RN-CF27). |
| 1.3 | 2026-06-10 | **DEC-1** — Botões do MFN substituídos por 3 botões fixos: "Colar", "Colar e Fechar", "Fechar". Tecla Enter aciona "Colar". §6.1 e RN-CF26 e RN-CF28 atualizados. (Issues #14) |
| 1.4 | 2026-06-28 | Stepper +/− de repetidas na lista de estoque (Tela CF1): botão "+ Repetida" (incremento manual) e "Descartar" (decremento manual). §5.1 atualizado; RN-CF30 e RN-CF31 adicionados. Em telas estreitas os rótulos reduzem a "+"/"−". (Issue #46) |

---

## 1. Visão Geral

Fluxo de colagem de figurinhas em um álbum específico. Acessado a partir de três pontos de entrada distintos, podendo ou não receber um álbum como contexto pré-definido. Permite ao usuário:

- Visualizar todo o seu estoque (`EstoqueFigurinha`) e identificar quais figurinhas podem ser coladas no álbum ativo.
- Colar figurinhas do estoque, decrementando a quantidade correspondente.
- Colar figurinhas não presentes no estoque, informadas diretamente por digitação ou OCR.
- Trocar o álbum ativo sem abandonar o fluxo.
- Colar sobre uma figurinha já registrada no álbum, mediante confirmação explícita.

Ao contrário do fluxo Abrir Pacotinhos, **não há pilha de sessão**. Cada colagem é uma operação imediata e persistida individualmente no momento da confirmação.

---

## 2. Entidades e Dados

As entidades `Álbum`, `TipoAlbum`, `FigurinhaColada`, `EstoqueFigurinha` e `Figurinha` são definidas na Especificação da Home. Este fluxo introduz uma alteração na entidade `FigurinhaColada` e uma constraint adicional.

### 2.1 Alteração em `FigurinhaColada`

Campo adicionado:

| Campo | Tipo | Observações |
|---|---|---|
| `origem` | Enum | `ESTOQUE` — figurinha debitada do EstoqueFigurinha do usuário; `DIRETA` — figurinha informada sem passar pelo estoque (inclui colagens via MFN neste fluxo **e** colagens via MCol no fluxo Abrir Pacotinhos) |

**Semântica de `origem` por caminho de colagem:**

| Caminho | `origem` | `EstoqueFigurinha` alterado? |
|---|---|---|
| Colar Figurinhas — figurinha do estoque (sem "colar por cima") | `ESTOQUE` | Sim — decrementa `quantidade` em 1 |
| Colar Figurinhas — figurinha do estoque ("colar por cima") | `ESTOQUE` | Sim — decrementa `quantidade` em 1 |
| Colar Figurinhas — MFN (figurinha não registrada) | `DIRETA` | Não |
| Abrir Pacotinhos — MCol (colagem direta da pilha) | `DIRETA` | Não — a figurinha veio do pacote, nunca foi para o estoque |

> **Nota sobre compatibilidade com Abrir Pacotinhos:** a afirmação anterior de que registros criados pelo fluxo Abrir Pacotinhos sempre recebem `origem = ESTOQUE` estava incorreta. O valor correto para colagens via MCol em Abrir Pacotinhos é `DIRETA`, pois a figurinha transita diretamente da pilha para o álbum sem passar por `EstoqueFigurinha`.

### 2.2 Comportamento de "colar por cima"

Quando a figurinha já possui um registro `FigurinhaColada` para o par `(album_id, figurinha_id)`, a operação de colagem **atualiza o registro existente** — não cria um segundo registro. Os campos `colada_em` e `origem` são sobrescritos com os valores da nova operação. O campo `id` e a cardinalidade da tabela permanecem inalterados, preservando a integridade do cálculo de `percentual_conclusao`.

> **Divergência com RN-AP05 (Abrir Pacotinhos):** aquela regra define "álbum elegível" como o que ainda não possui a figurinha colada, impedindo a apresentação do botão "Colar" nesses casos. O presente fluxo relaxa essa restrição: qualquer álbum do `tipo_album_id` correto é elegível, mas a colagem sobre figurinha já registrada exige confirmação explícita (ver RN-CF09). As duas regras coexistem — RN-AP05 aplica-se exclusivamente ao fluxo Abrir Pacotinhos.

### 2.3 Constraint adicional — `FigurinhaColada`

> **RN-CF00 (registrada aqui, aplica-se ao modelo global):** o par `(album_id, figurinha_id)` é único em `FigurinhaColada`. Não há dois registros para a mesma figurinha no mesmo álbum; uma nova colagem sobre par existente atualiza o registro em vigor.

---

## 3. Fluxo Geral

```
Pontos de entrada:
  A. Home — botão "Colar figurinhas" em card de álbum  [contexto: album_id definido]
  B. Diálogo CA2 (Cadastro de Álbum) — botão "Colar figurinhas"  [contexto: album_id definido]
  C. Navegação direta (sem contexto de álbum)  [contexto: nenhum]
        │
        ▼
  Contexto de álbum definido (A ou B)?
        │
        ├── SIM → carrega álbum; abre Tela CF1 diretamente
        │
        └── NÃO → abre Tela CF0 (seleção de álbum) → após seleção, abre Tela CF1
        │
        ▼
[Tela CF1 — Colagem]
  Exibe estoque + indicadores de elegibilidade para o álbum ativo
        │
        ├── [Seleciona figurinha do estoque] → confirma → debita estoque; grava/atualiza FigurinhaColada
        │
        ├── [Figurinha não registrada] → abre Modal de Figurinha Não Registrada (MFN)
        │       ├── [Colar] → cola e fecha modal
        │       └── [Colar e Outra] → cola, mantém modal aberto e limpa campo (ver RN-CF26)
        │
        └── [Troca de álbum] → atualiza contexto; recarrega indicadores; permanece na Tela CF1
```

---

## 4. Tela CF0 — Seleção de Álbum

Exibida **somente** quando o fluxo é acessado sem contexto de álbum pré-definido (entrada C). Nos demais casos, é ignorada.

**Header global** — nome/logotipo da aplicação, identificação do usuário (nome e identificador público de 6 chars) e ação de logout.

**Footer global** — idêntico ao da Home.

**Elementos:**

1. **Título:** "Escolha um álbum"
2. **Lista de álbuns do usuário** — cada item exibe: `tipo_album.nome`, `variante` por extenso (quando preenchida), `nome_personalizado` (quando preenchido), percentual de conclusão.
3. **Estado vazio:** se o usuário não possui nenhum álbum, exibe mensagem informativa com CTA para o fluxo de Cadastro de Álbum. O fluxo de Colar Figurinhas encerra-se aqui neste caso.
4. **Botão "Cancelar"** — retorna à tela de origem.

Não há paginação nesta tela — todos os álbuns são listados.

---

## 5. Tela CF1 — Colagem

Tela principal do fluxo. O usuário permanece aqui durante toda a sessão de colagem. Modais são abertos sobre ela sem navegação.

**Header global** — nome/logotipo da aplicação, identificação do usuário (nome e identificador público de 6 chars) e ação de logout.

**Footer global** — idêntico ao da Home.

### 5.1 Estrutura da tela

**Zona superior — contexto:**
1. Seletor de álbum ativo: exibe o álbum atual (nome do tipo + variante + nome personalizado quando houver). Acionável para troca de álbum (ver 5.6). Percentual de conclusão do álbum ativo exibido em destaque.
2. Botão "Figurinha não registrada" — abre o Modal de Figurinha Não Registrada (MFN).

**Zona principal — estoque:**
3. Campo de busca/filtro: filtra a lista por número ou nome da figurinha em tempo real.
4. Lista do estoque do usuário, com todos os itens de `EstoqueFigurinha` com `quantidade ≥ 1`. Cada item exibe: número da figurinha, nome do jogador/item, quantidade disponível no estoque, indicador de elegibilidade (ver 5.2) e os controles de ajuste de quantidade (ver 5.7).
5. Estado vazio do estoque: exibido quando `EstoqueFigurinha` não possui nenhuma figurinha com `quantidade ≥ 1`. O botão "Figurinha não registrada" permanece disponível.

### 5.2 Indicadores de elegibilidade

Cada item do estoque exibe um dos três estados, comunicados por **rótulo textual + indicador visual** (nunca apenas por cor):

| Estado | Condição | Comunicação |
|---|---|---|
| **Pode colar** | Figurinha não possui registro em `FigurinhaColada` para o álbum ativo | Rótulo "Pode colar" + indicador visual positivo |
| **Já colada** | Figurinha já possui registro em `FigurinhaColada` para o álbum ativo | Rótulo "Já colada" + indicador visual de alerta |
| **Fora do catálogo** | `figurinha.tipo_album_id` ≠ `tipo_album_id` do álbum ativo | Item desabilitado + rótulo "Fora do catálogo"; ação de colar não disponível |

> O estado "Fora do catálogo" ocorre quando o estoque do usuário contém figurinhas de tipos de álbum diferentes do álbum ativo selecionado.

### 5.3 Colagem de figurinha do estoque

```
Usuário aciona "Colar" em um item do estoque
        │
        ▼
Figurinha já colada no álbum ativo?
        │
        ├── SIM → exibe alerta de confirmação (ver 5.4)
        │
        └── NÃO →
              Decrementa EstoqueFigurinha.quantidade em 1
              Grava FigurinhaColada (album_id, figurinha_id, colada_em = agora, origem = ESTOQUE)
              Atualiza indicador do item na lista
              Atualiza percentual de conclusão no seletor de álbum
```

### 5.4 Alerta de colagem sobre figurinha já existente

Exibido em linha no item (ou como modal leve) quando o usuário tenta colar uma figurinha com estado "Já colada":

> "Esta figurinha já está colada neste álbum. Colar novamente irá substituir o registro anterior. Confirmar?"

**Botões:** "Confirmar" · "Cancelar"

- "Confirmar": executa a operação — decrementa estoque (se origem for estoque), atualiza registro `FigurinhaColada` existente (`colada_em = agora`, `origem` atualizado).
- "Cancelar": fecha o alerta sem nenhuma ação.

### 5.5 Colagem de figurinha não registrada

Acionada pelo botão "Figurinha não registrada". Abre o **Modal de Figurinha Não Registrada (MFN)** (ver seção 6).

Após confirmação no modal:
```
Sistema valida: Figurinha existe no catálogo do tipo_album_id do álbum ativo?
        │
        ├── NÃO → mensagem de erro amigável (ver RN-CF25); modal permanece aberto
        │
        ▼
Figurinha já colada no álbum ativo?
        │
        ├── SIM → exibe alerta de confirmação (mesma lógica de 5.4) dentro do modal
        │
        └── NÃO →
              Grava FigurinhaColada (album_id, figurinha_id, colada_em = agora, origem = DIRETA)
              [Colar]: fecha modal; atualiza percentual de conclusão
              [Colar e Outra]: mantém modal aberto; limpa campo; autofoco restaurado
              EstoqueFigurinha NÃO é alterado
```

### 5.6 Troca de álbum

Acionada pelo seletor de álbum ativo na zona superior.

- Abre seletor inline ou modal com a lista de álbuns do usuário (mesma apresentação da Tela CF0).
- Após seleção: atualiza o contexto da Tela CF1 — recarrega os indicadores de elegibilidade de todos os itens do estoque para o novo álbum. Nenhum dado de colagem é perdido ou revertido.
- Não há confirmação de troca; a operação é imediata.

### 5.7 Ajuste manual de quantidade no estoque (stepper +/−)

Cada item da lista de estoque oferece dois controles para ajustar diretamente a `EstoqueFigurinha.quantidade`, independentemente da colagem:

- **"+ Repetida"** — incrementa a quantidade do item em 1. Operação imediata e persistida; o item permanece na lista com a quantidade atualizada. Não exige confirmação.
- **"Descartar"** — decrementa a quantidade do item em 1.
  - Quando `quantidade > 1`, o decremento é imediato, sem confirmação (o item permanece na lista).
  - Quando `quantidade == 1`, o decremento removeria o item do estoque; portanto exige confirmação explícita (alerta "O item será removido do estoque"). Confirmado, o item deixa de aparecer na lista.

**Rótulos responsivos:** em telas de resolução limitada (largura estreita), os rótulos "+ Repetida" e "Descartar" são reduzidos a **"+"** e **"−"**, respectivamente. O propósito acessível dos botões é preservado por `aria-label` fixo e descritivo, independentemente do rótulo visível (ver RN-CF32).

> Esses controles não substituem nem alteram a semântica da colagem: incrementar/decrementar manualmente atua apenas sobre `EstoqueFigurinha.quantidade` e não cria/atualiza registros `FigurinhaColada`.

---

## 6. Modal de Figurinha Não Registrada (MFN)

Reutiliza o comportamento e os elementos visuais do **Modal Câmera (MC)** e do modo de digitação definidos na Especificação de Abrir Pacotinhos, com as seguintes adaptações de contexto:

| Aspecto | Abrir Pacotinhos (MC) | Colar Figurinhas (MFN) |
|---|---|---|
| Destino após confirmação | Adiciona à Pilha da Sessão | Cola diretamente no álbum ativo |
| `tipo_album_id` de referência | Selecionado na Tela AP0 | Derivado do álbum ativo na Tela CF1 |
| Opção "Fotografar próxima" / câmera | Presente — ativada pelo botão "Abrir câmera" | Presente — ativada pelo botão "Abrir câmera" (ver RN-CF27) |
| Pilha persistida | Sim (backend) | Não se aplica — não há pilha |
| Botão após colagem bem-sucedida | "Fotografar próxima" / fechar | "Colar" (mantém modal, limpa campo, foca input) · "Colar e Fechar" · "Fechar" |

O número reconhecido (por OCR) ou digitado é validado contra o catálogo do `tipo_album_id` do álbum ativo antes de acionar a colagem.

### 6.1 Estrutura do modal

**Modo Digitar:**
1. Campo de texto para número da figurinha (autofoco ao abrir o modal); tecla **Enter** aciona "Colar" quando o campo não estiver vazio e não houver operação em andamento. Ver RN-CF26.
2. Botão **"Colar"** — cola a figurinha, mantém o modal aberto, limpa o campo e restaura o foco ao input para entrada da próxima figurinha. Ver RN-CF26.
3. Botão **"Colar e Fechar"** — cola a figurinha e fecha o modal.
4. Botão **"Fechar"** — fecha o modal sem colar nada.

**Modo Fotografar:**
5. Botão **"Abrir câmera"** — ativa o viewfinder para captura por OCR. A câmera não é ativada automaticamente ao abrir o modal; requer ação explícita do usuário. Ver RN-CF27.
6. Após reconhecimento: campo editável com número + botões "Colar", "Colar e Fechar" e "Fechar" (idênticos ao modo Digitar).

---

## 7. Regras de Negócio Consolidadas

| # | Regra |
|---|---|
| RN-CF00 | O par `(album_id, figurinha_id)` é único em `FigurinhaColada`; uma nova colagem sobre par existente atualiza o registro, não cria duplicata |
| RN-CF01 | Apenas usuários com `status = ATIVO` **ou `EMAIL_PENDENTE`** acessam o fluxo; `PENDENTE` é redirecionado para a Tela 2 de Confirmação de Email |
| RN-CF02 | Quando o fluxo é acessado com `album_id` pré-definido (entradas A e B), a Tela CF0 é ignorada |
| RN-CF03 | Quando acessado sem contexto de álbum (entrada C), a Tela CF0 é obrigatória antes da Tela CF1 |
| RN-CF04 | Se o usuário não possui nenhum álbum cadastrado e acessa o fluxo sem contexto, a Tela CF0 exibe estado vazio com CTA para Cadastro de Álbum; o fluxo não prossegue |
| RN-CF05 | O estoque exibido na Tela CF1 compreende todos os itens de `EstoqueFigurinha` com `quantidade ≥ 1`, independente do tipo de álbum |
| RN-CF06 | Itens do estoque cujo `figurinha.tipo_album_id` difere do `tipo_album_id` do álbum ativo são exibidos como desabilitados; a ação de colar não está disponível para eles |
| RN-CF07 | Itens do estoque compatíveis com o álbum ativo e ainda não colados recebem indicador "Pode colar" |
| RN-CF08 | Itens do estoque compatíveis com o álbum ativo e já colados recebem indicador "Já colada"; a ação de colar permanece disponível |
| RN-CF09 | Colar uma figurinha com estado "Já colada" exige confirmação explícita do usuário antes de qualquer alteração nos dados |
| RN-CF10 | Ao colar uma figurinha do estoque (com ou sem "colar por cima"), `EstoqueFigurinha.quantidade` é decrementado em 1; se atingir 0, o item deixa de aparecer na lista |
| RN-CF11 | Ao colar uma figurinha não registrada (MFN), `EstoqueFigurinha` não é alterado; apenas `FigurinhaColada` é gravado/atualizado com `origem = DIRETA` |
| RN-CF12 | Ao colar uma figurinha do estoque, `FigurinhaColada` recebe `origem = ESTOQUE` |
| RN-CF13 | Em operação de "colar por cima", os campos `colada_em` e `origem` do registro `FigurinhaColada` existente são sobrescritos com os valores da nova operação |
| RN-CF14 | A troca de álbum na Tela CF1 é imediata e não exige confirmação; recarrega os indicadores de elegibilidade sem desfazer colagens já realizadas |
| RN-CF15 | O percentual de conclusão exibido na Tela CF1 é atualizado após cada colagem bem-sucedida, sem recarregamento completo da tela |
| RN-CF16 | A validação de número de figurinha no MFN usa o `tipo_album_id` do álbum ativo no momento da abertura do modal; a troca de álbum não afeta um modal já aberto |
| RN-CF17 | Cada colagem é persistida individualmente no momento da confirmação; não há operação em lote neste fluxo |
| RN-CF18 | O fluxo não possui estado de sessão persistido no backend; não há retomada nem alerta de saída |
| RN-CF25 | Quando o número informado no MFN não for encontrado no catálogo do álbum ativo, a mensagem de erro exibida é: "Figurinha [número] não encontrada neste álbum. Verifique o número e tente novamente." O número digitado é mantido no campo para correção; o campo permanece editável; o modal permanece aberto |
| RN-CF26 | O MFN oferece sempre os botões fixos **"Colar"**, **"Colar e Fechar"** e **"Fechar"**, sem alternância de estado. "Colar": a colagem é persistida, o modal permanece aberto, o campo de número é limpo e o foco retorna ao input para a próxima entrada. "Colar e Fechar": a colagem é persistida e o modal é fechado. "Fechar": fecha o modal sem persistir colagem. A tecla **Enter**, quando o campo não estiver vazio e não houver operação em andamento, aciona "Colar". (Issue #14 · DEC-1) |
| RN-CF27 | No MFN, o modo câmera é ativado exclusivamente pelo toque/clique no botão "Abrir câmera". A câmera não é ativada automaticamente ao abrir o modal; requer ação explícita do usuário. Esse comportamento é consistente com RN-AP43 de spec_abrir_pacotinhos |
| RN-CF30 | Cada item da lista de estoque oferece a ação "+ Repetida", que incrementa `EstoqueFigurinha.quantidade` do item em 1 (operação de upsert no estoque do usuário). A operação é imediata, persistida e não exige confirmação; o item permanece na lista com a quantidade atualizada. Não cria nem altera registros `FigurinhaColada` |
| RN-CF31 | Cada item da lista de estoque oferece a ação "Descartar", que decrementa `EstoqueFigurinha.quantidade` do item em 1. Quando `quantidade > 1`, o decremento é imediato e sem confirmação; quando `quantidade == 1`, a ação removeria o item do estoque e DEVE exigir confirmação explícita antes de qualquer alteração. Ao atingir 0, o item deixa de aparecer na lista. Não cria nem altera registros `FigurinhaColada` |

---

## 8. Requisitos de Acessibilidade (WCAG 2.2 / 2.0 AA)

As regras globais constam em `spec_privacidade_lgpd` (Seção 9). As regras abaixo são específicas deste fluxo.

| # | Regra |
|---|---|
| RN-CF19 | Os indicadores de elegibilidade ("Pode colar", "Já colada", "Fora do catálogo") DEVEM ser comunicados por rótulo textual, nunca apenas por cor; o estado DEVE ser exposto programaticamente a cada item da lista |
| RN-CF20 | O alerta de colagem "colar por cima" (seção 5.4) DEVE ser implementado como `role="dialog"` com focus trap; foco vai para o título ou primeiro botão ao abrir; Esc ou "Cancelar" fecham e retornam foco ao botão "Colar" correspondente |
| RN-CF21 | A lista de estoque com filtro em tempo real DEVE anunciar a quantidade de resultados filtrados via `aria-live="polite"` (ex.: "12 figurinhas encontradas") após cada atualização |
| RN-CF22 | O percentual de conclusão atualizado após cada colagem DEVE ser anunciado via live region (ex.: "Álbum atualizado: 42,3% concluído") |
| RN-CF23 | O seletor de álbum ativo (zona superior) DEVE expor o álbum atual como texto acessível; ao abrir para troca, DEVE ser implementado como `role="listbox"` com `role="option"` e suporte a navegação por teclado |
| RN-CF24 | Itens desabilitados ("Fora do catálogo") DEVEM ser `aria-disabled="true"` (e não `disabled`) para permanecerem anunciáveis por leitores de tela com a indicação de que estão indisponíveis |
| RN-CF28 | O MFN DEVE ser implementado como `role="dialog"` com focus trap, `aria-modal="true"` e `aria-labelledby`; ao fechar (por "Fechar" ou cancelamento), o foco DEVE retornar ao botão "Figurinha não registrada" da Tela CF1; ao acionar "Colar", o foco DEVE ir para o campo de número |
| RN-CF29 | A mensagem de erro de figurinha não encontrada (RN-CF25) DEVE ser anunciada via `role="alert"` ao ser exibida, sem que o foco seja movido do campo de número |
| RN-CF32 | Os controles de stepper "+ Repetida" e "Descartar" (§5.7) DEVEM ter `aria-label` fixo e descritivo (ex.: "Adicionar repetida", "Descartar uma unidade"), preservado mesmo quando o rótulo visível é reduzido a "+"/"−" em telas estreitas; o glifo reduzido DEVE ser `aria-hidden`. Os alvos de toque DEVEM respeitar o mínimo de 24×24 CSS px (recomendado 44×44) conforme RN-WG11 |

---

## 9. Estados de Carregamento e Erro

| Situação | Comportamento |
|---|---|
| Carregamento do estoque | Lista exibe skeleton/placeholder enquanto os dados são buscados |
| Falha ao carregar estoque | Mensagem de erro inline com opção de tentar novamente |
| Falha ao persistir colagem | Mensagem de erro inline; nenhuma alteração aplicada (estoque e FigurinhaColada permanecem inalterados) |
| Sessão expirada (JWT inválido) | Redireciona automaticamente para a tela de Login |

---

## 10. Fluxos Relacionados (fora do escopo desta spec)

| Fluxo | Gatilho nesta spec |
|---|---|
| **Cadastro de Álbum** | CTA do estado vazio na Tela CF0 (usuário sem álbuns) |
| **Abrir Pacotinhos** | Alternativa para entrada de novas figurinhas no estoque antes de colar |
| **Home** | Destino natural após encerramento do fluxo; reflete percentual de conclusão atualizado nos cards de álbum |
