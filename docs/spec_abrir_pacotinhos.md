# Especificação Funcional — Abrir Pacotinhos

> **Dependências:** Especificação de Cadastro de Usuários · Especificação de Login e Recuperação de Senha · Especificação da Home (Álbuns)
> **Fluxos referenciados mas fora do escopo:** Colar Figurinhas · Cadastro de Álbum

---

## Histórico de Revisões

| Versão | Data | Alterações |
|---|---|---|
| 1.0 | inicial | Versão original |
| 1.1 | revisão | Pilha da Sessão migrada para persistência no backend; seção 6 recebeu header ausente; alerta de saída revisado |
| 1.2 | revisão | RN-AP00a adicionado: acesso permitido também para `EMAIL_PENDENTE` |
| 1.3 | red team | **A2** — colagem via MCol usa upsert `(album_id, figurinha_id)`; sem duplicatas em `FigurinhaColada` (RN-AP26). **A4** — comportamento definido quando álbum é arquivado durante colagem (RN-AP27). **M2** — pilha limitada a 100 itens PENDENTES (RN-AP28). **M3** — descarte exige confirmação com exibição do número e nome da figurinha (RN-AP24 atualizado). **M6** — modo offline: fila local com sincronização ao reconectar (seção 9, RN-AP29 a RN-AP31). **B1** — navegação via header global enquanto há itens PENDENTES na pilha aciona o alerta de saída (RN-AP32) |
| 1.4 | Correção de conflito + WCAG | **Conflito B corrigido:** `FigurinhaColada.origem = DIRETA` para colagens via MCol (figurinha da pilha cola diretamente no álbum sem passar por EstoqueFigurinha). RN-AP14 atualizado; Seção 7.1 atualizada. Requisitos de acessibilidade adicionados (RN-AP33 a RN-AP40). |
| 1.5 | ajustes UX | Header e footer globais tornados obrigatórios em todas as telas. Botão "Sair" removido da Tela AP1 (redundante com logout do header — RN-AP41). Nome e tipo do álbum da sessão exibidos em destaque no topo da AP1 (RN-AP42). Validação explícita de figurinha fora do catálogo do álbum selecionado (RN-AP04 detalhado). Ativação do modo câmera explicitada na estrutura da tela. |
| 1.6 | ajuste AP0 | **RN-AP43 adicionado:** quando há exatamente 1 `TipoAlbum` no catálogo, a tela AP0 é pulada automaticamente e o fluxo inicia diretamente na AP1 com o tipo pré-selecionado. |

---

## 1. Visão Geral

Fluxo de entrada de figurinhas no sistema. O usuário registra figurinhas obtidas fisicamente — sem limite de quantidade por sessão além do limite de itens PENDENTES na pilha e sem controle de recurso interno. Antes de iniciar, o usuário seleciona o tipo de álbum; todas as figurinhas da sessão são validadas contra o catálogo desse tipo.

As figurinhas registradas formam uma **Pilha da Sessão** persistida no backend, vinculada à conta do usuário, retomável em qualquer dispositivo.

O fluxo oferece dois modos de entrada, alternáveis livremente: **Digitação** e **Câmera (OCR local)**. Ambos compartilham a Tela AP1. O destino de cada figurinha é definido via **Modal de Colagem (MCol)** ou ação direta "Enviar para Repetidas".

---

## 2. Entidades e Dados

### 2.1 Constraint — `figurinha.numero`

> **RN-AP00:** `figurinha.numero` é único dentro de um `tipo_album_id`. A busca e validação usam o par `(tipo_album_id, numero)` como chave de lookup.

### 2.2 Pilha da Sessão (persistida no backend)

| Campo | Tipo | Observações |
|---|---|---|
| `entrada_id` | Identificador único | Chave primária gerada pelo backend |
| `usuario_id` | FK → Usuário | Dono da sessão |
| `tipo_album_id` | FK → TipoAlbum | Fixo para toda a sessão |
| `figurinha_id` | FK → Figurinha | Referência ao catálogo |
| `figurinha_numero` | String | Número exibido na pilha |
| `figurinha_nome` | String | Nome do jogador/item |
| `origem` | Enum | `DIGITACAO` · `CAMERA` |
| `status_destino` | Enum | `PENDENTE` · `COLADA` · `REPETIDA` |
| `criado_em` | Timestamp | Momento da adição à pilha |

A pilha é limpa após todas as entradas terem destino definido, ou após descarte explícito pelo usuário.

---

## 3. Fluxo Geral

```
[Home — CTA "Abrir Pacotinhos"]
        │
        ▼
  Sistema verifica: existe Pilha da Sessão com itens PENDENTES?
        │
        ├── SIM → exibe modal de retomada (ver seção 4.1)
        │
        ▼ (nova sessão ou após retomada)
[Tela AP0 — Seleção de Tipo de Álbum]  ← obrigatório apenas em nova sessão
        │
        ▼
[Tela AP1 — Entrada e Pilha]
  Nome e tipo do álbum exibidos no topo (ver RN-AP42)
        │
        ├── [Seletor de modo "Fotografar" → botão "Abrir câmera"] → abre Modal Câmera (MC)
        ├── [Seletor de modo "Digitar" → campo de texto + confirmação] → valida e adiciona à pilha
        ├── [Colar — no card] → abre Modal de Colagem (MCol)
        └── [Enviar para Repetidas — no card ou em lote] → executa direto
```

---

## 4. Retomada de Pilha e Tela AP0

### 4.1 Retomada de pilha pendente

Ao acessar "Abrir Pacotinhos" com Pilha da Sessão existente com itens `PENDENTE`:

> "Você tem [N] figurinha(s) de uma sessão anterior ainda sem destino definido. Deseja continuar de onde parou?"

**Botões:** "Continuar sessão anterior" · "Descartar e começar do zero"

- "Continuar": carrega a pilha salva, restaura o `tipo_album_id` e abre a Tela AP1.
- "Descartar": remove a pilha do backend; inicia nova sessão pela Tela AP0.

### 4.2 Tela AP0 — Seleção de Tipo de Álbum

Exibida apenas em nova sessão.

**Header global** — nome/logotipo da aplicação, identificação do usuário (nome e identificador público de 6 chars) e ação de logout.

**Footer global** — idêntico ao da Home.

**Elementos:**
1. Título: "Que álbum você está abrindo?"
2. Lista de tipos disponíveis no catálogo
3. Botão "Confirmar" — habilitado após seleção

**Regra de skip:** quando há exatamente 1 `TipoAlbum` ativo no catálogo, esta tela é pulada automaticamente — o sistema pré-seleciona o único tipo disponível e abre diretamente a Tela AP1 (RN-AP43). A tela AP0 é exibida apenas quando existem 2 ou mais tipos.

---

## 5. Tela AP1 — Entrada e Pilha

### 5.1 Estrutura da tela

**Header global** — nome/logotipo da aplicação, identificação do usuário (nome e identificador público de 6 chars) e ação de logout. Navegação via header enquanto há itens PENDENTES aciona o alerta de saída (RN-AP32).

**Footer global** — idêntico ao da Home.

**Zona superior — identificação da sessão:**
1. **Nome e tipo do álbum da sessão** — exibidos em destaque no topo da tela, antes da zona de entrada, para referência permanente do usuário durante toda a sessão. Formato: `[TipoAlbum.nome]` (ex.: "Copa do Mundo 2026"). Ver RN-AP42.

**Zona de entrada:**
2. Seletor de modo: "Digitar" / "Fotografar"
3. **Modo Digitar:** campo de texto com autofoco; converte para maiúsculas; botão de confirmação
4. **Modo Fotografar:** ao selecionar este modo, exibe o botão **"Abrir câmera"**. O toque/clique neste botão abre o Modal Câmera (MC). A câmera não é ativada automaticamente ao trocar de modo — requer ação explícita do usuário no botão "Abrir câmera". Ver RN-AP43.

**Zona inferior — pilha:**
5. Lista de cards, ordenada do mais recente (topo) ao mais antigo (base)
6. Contador: "X figurinha(s) nesta sessão"
7. Botão "Enviar todas para Repetidas" — visível somente com ao menos 1 entrada `PENDENTE`

> **Ausência do botão "Sair":** a saída do fluxo é realizada exclusivamente via ações do header global (logout, navegação para Home ou perfil). Não há botão "Sair" dedicado nesta tela. Ver RN-AP41.

### 5.2 Fluxo de entrada por digitação

```
Usuário digita número + confirma
        │
        ▼
Sistema verifica limite: itens PENDENTES na pilha < 100?
        │
        ├── LIMITE ATINGIDO → mensagem de erro "Limite de 100 figurinhas pendentes atingido.
        │                     Defina o destino de algumas antes de continuar."
        │
        ▼
Sistema valida: Figurinha existe em (tipo_album_id, numero)?
        │
        ├── NÃO → mensagem de erro amigável inline:
        │         "Figurinha [número] não encontrada no álbum [TipoAlbum.nome].
        │          Verifique o número e tente novamente."
        │         Campo permanece editável; número digitado mantido para correção.
        │
        ▼
  Adiciona à pilha com status_destino = PENDENTE; persiste no backend (ou fila local se offline)
  Campo limpo; autofoco restaurado
```

### 5.3 Cards da pilha

Cada card exibe: número da figurinha, nome, indicador de elegibilidade para álbum (quando aplicável) e ações disponíveis conforme `status_destino`:

- **PENDENTE:** botão "Colar" (quando há álbum elegível), botão "Enviar para Repetidas", controle de descarte.
- **COLADA / REPETIDA:** somente leitura — exibe status e destino definido.

---

## 6. Modal Câmera (MC)

Sobrepõe a Tela AP1. A pilha permanece visível abaixo do modal. Ativado exclusivamente pelo botão "Abrir câmera" no Modo Fotografar da zona de entrada.

### 6.1 Fluxo de dados

```
[Usuário aciona "Abrir câmera" no Modo Fotografar]
        │
        ▼
[MC aberto]
  Viewfinder ativo com guia de alinhamento
        │
        ▼
  Usuário fotografa o verso da figurinha
        │
        ▼
  OCR local processa a imagem
        │
        ├── RECONHECIDO → exibe número em campo editável
        │         │
        │         ▼
        │   Usuário pode corrigir antes de confirmar
        │         │
        │         ▼
        │   Sistema verifica limite de 100 itens PENDENTES
        │         │
        │         ▼
        │   Sistema valida no catálogo do tipo_album_id da sessão
        │         │
        │         ├── NÃO EXISTE → mensagem de erro amigável:
        │         │               "Figurinha [número] não encontrada no álbum [TipoAlbum.nome].
        │         │                Verifique o número e tente novamente."
        │         │               Campo permanece editável
        │         │
        │         ▼
        │   Adiciona à pilha; persiste no backend (ou fila local se offline)
        │   Botões: "Fotografar próxima" | "Fechar câmera"
        │
        └── NÃO RECONHECIDO → alerta inline:
                  "Não foi possível reconhecer o número. Tentar novamente ou pular?"
                  Botões: "Tentar novamente" | "Pular"
```

### 6.2 Elementos visuais

1. Viewfinder com retângulo-guia de alinhamento
2. Área de resultado: miniatura + campo editável + botão "Confirmar"
3. Contador da sessão (discreto)
4. Botão fechar (×): fecha o modal a qualquer momento sem adicionar figurinha

---

## 7. Modal de Colagem (MCol)

Sobrepõe a Tela AP1. Acionado pelo botão "Colar" em um card `PENDENTE`.

### 7.1 Fluxo de dados

```
[MCol aberto para uma figurinha]
  Sistema carrega lista de álbuns elegíveis (ativos e do tipo_album_id da sessão)
        │
        ▼
  Conta álbuns elegíveis:
        │
        ├── EXATAMENTE 1 → pré-seleciona; exibe confirmação
        └── MAIS DE 1 → exibe seletor; botão "Colar" habilitado após seleção
        │
        ▼ (usuário clica "Colar")
  Sistema tenta gravar FigurinhaColada via UPSERT em (album_id, figurinha_id):
    - Se não existe: insere novo registro (colada_em = agora, origem = DIRETA)
    - Se já existe: atualiza colada_em = agora, origem = DIRETA
  (ver RN-AP26)

  **Nota sobre `origem`:** a figurinha provém da pilha da sessão (pacote físico), nunca do EstoqueFigurinha.
  Por isso `origem = DIRETA` em todos os casos de colagem via MCol neste fluxo.
  Nenhum incremento/decremento ocorre em EstoqueFigurinha.
        │
        ├── ÁLBUM ARQUIVADO (backend rejeita) → ver RN-AP27
        │
        ▼
  status_destino da entrada → COLADA
  Fecha MCol; card na pilha atualizado para somente leitura
```

### 7.2 Elementos visuais

1. Cabeçalho: número e nome da figurinha
2. Álbum pré-selecionado (quando 1 elegível) ou seletor (quando 2+)
3. Botão "Colar": sempre requer clique ativo do usuário
4. Botão "Cancelar"

---

## 8. Alerta de Saída

Exibido quando o usuário tenta sair do fluxo com ao menos 1 figurinha `PENDENTE` na pilha.

Disparado por:
- Botão voltar (hardware ou navegador)
- Navegação para outra seção do app (incluindo links do **header global**: perfil, logout, home)
- Fechamento da aba/app

**Texto:**
> "Você tem [N] figurinha(s) sem destino definido. Elas ficam salvas e você pode continuar depois, neste ou em outro dispositivo. Deseja sair agora?"

**Botões:** "Continuar depois..." · "Ficar"

- "Continuar depois...": encerra o fluxo; pilha salva no backend.
- "Ficar": fecha o alerta; mantém o usuário na Tela AP1.

> **Exceção:** a ação de **logout** dentro do alerta de saída encerra o fluxo e a sessão imediatamente, sem aguardar definição de destino para as figurinhas pendentes. A pilha permanece salva no backend e pode ser retomada no próximo login.

---

## 9. Modo Offline

### 9.1 Comportamento

Quando o dispositivo perde conectividade durante o fluxo (Tela AP1 ou Modal Câmera):

- O OCR continua funcionando localmente (RN-AP21).
- Novas entradas na pilha são enfileiradas **localmente** no dispositivo.
- Um indicador de status de conectividade é exibido de forma não-intrusiva na tela ("Sem conexão — salvando localmente").
- O usuário pode continuar adicionando figurinhas normalmente durante a ausência de conexão.

### 9.2 Sincronização

Ao reconectar:

- O sistema sincroniza automaticamente a fila local com o backend.
- Durante a sincronização: indicador de status atualizado ("Sincronizando...").
- Após sincronização bem-sucedida: indicador removido; pilha exibida reflete o estado consolidado.
- Se houver conflito (ex.: entrada com `figurinha_id` + `tipo_album_id` já na pilha do backend via outro dispositivo): a entrada duplicada é ignorada silenciosamente na sincronização.

### 9.3 Falha na sincronização

Se a sincronização falhar após reconexão (ex.: erro de servidor):

- Indicador de status: "Erro ao sincronizar. Toque para tentar novamente."
- O usuário pode acionar manualmente a sincronização.
- Enquanto não sincronizada, a fila local é preservada; o usuário não perde dados.

---

## 10. Regras de Negócio Consolidadas

| # | Regra |
|---|---|
| RN-AP00 | `figurinha.numero` é único dentro de um `tipo_album_id`; a validação usa o par `(tipo_album_id, numero)` como chave de lookup |
| RN-AP00a | Apenas usuários com `status = ATIVO` ou `EMAIL_PENDENTE` acessam o fluxo; `PENDENTE` é redirecionado para a Tela 2 de Confirmação de Email |
| RN-AP01 | A Pilha da Sessão é persistida no backend, vinculada à conta do usuário; retomável em qualquer dispositivo |
| RN-AP02 | O fluxo não controla nem debita recursos; o usuário pode registrar qualquer quantidade de figurinhas por sessão, respeitado o limite de itens PENDENTES (RN-AP28) |
| RN-AP03 | Entradas com o mesmo `figurinha_id` são permitidas na mesma pilha — cada cópia é uma entrada independente |
| RN-AP04 | Figurinha com número não encontrado no catálogo do `tipo_album_id` da sessão não é adicionada à pilha. A mensagem de erro exibida é: "Figurinha [número] não encontrada no álbum [TipoAlbum.nome]. Verifique o número e tente novamente." O número digitado é mantido no campo para correção; o campo permanece editável |
| RN-AP05 | Álbuns elegíveis para receber uma figurinha no MCol são aqueles que: (a) são do `tipo_album_id` da sessão, (b) estão ativos (`arquivado_em IS NULL`) |
| RN-AP06 | Se o usuário não possui nenhum álbum cadastrado, o botão "Colar" não é exibido em nenhum card |
| RN-AP07 | Se não existir nenhum álbum elegível para uma figurinha específica, o botão "Colar" não é exibido para aquele card |
| RN-AP08 | Cada card exibe indicador visual de elegibilidade: presente quando há ao menos 1 álbum elegível; ausente caso contrário |
| RN-AP09 | O Modal de Colagem pré-seleciona o álbum automaticamente somente quando há exatamente 1 álbum elegível; com 2 ou mais, o usuário seleciona manualmente |
| RN-AP10 | O botão "Colar" no MCol sempre requer clique ativo do usuário, mesmo com álbum pré-selecionado |
| RN-AP11 | O usuário pode adicionar novas figurinhas à pilha a qualquer momento, inclusive após já ter definido o destino de outras |
| RN-AP12 | A alternância entre modos Digitar e Fotografar é livre a qualquer momento, sem perda do estado da pilha |
| RN-AP13 | O Modal Câmera é aberto sobre a Tela AP1; a pilha permanece visível abaixo do modal |
| RN-AP14 | Uma figurinha colada via MCol gera registro em `FigurinhaColada` com `origem = DIRETA` — a figurinha transita da pilha diretamente para o álbum sem passar por `EstoqueFigurinha`. Uma figurinha enviada para Repetidas incrementa `EstoqueFigurinha.quantidade` em 1 unidade |
| RN-AP15 | Cards com destino já definido permanecem visíveis na pilha em estado somente leitura como histórico |
| RN-AP16 | Ao tentar sair com itens PENDENTES, o sistema exibe alerta de saída (seção 8) |
| RN-AP17 | A pilha é removida do backend apenas após: (a) todas as entradas receberem destino, ou (b) descarte explícito via "Descartar e começar do zero" |
| RN-AP18 | O `tipo_album_id` selecionado na Tela AP0 é fixo para toda a sessão; não pode ser alterado sem descartar a pilha |
| RN-AP19 | Ao retornar com pilha pendente salva, o sistema exibe modal de retomada antes de qualquer outra ação |
| RN-AP20 | A Tela AP0 é exibida apenas em nova sessão; na retomada, o tipo é restaurado da sessão salva |
| RN-AP21 | O OCR é executado localmente no dispositivo; nenhuma imagem é enviada ao backend |
| RN-AP22 | Se o OCR não reconhecer o número, o usuário pode pular sem adicionar à pilha |
| RN-AP23 | O número reconhecido pelo OCR é editável antes de ser validado e adicionado |
| RN-AP24 | O descarte de uma figurinha `PENDENTE` exige confirmação explícita com exibição do número e nome da figurinha a ser removida ("Remover **[numero] — [nome]** da pilha?") |
| RN-AP25 | "Enviar todas para Repetidas" aplica-se exclusivamente às entradas `PENDENTES`; entradas `COLADAS` ou `REPETIDAS` não são afetadas |
| RN-AP26 | A colagem via MCol usa operação de **upsert** em `FigurinhaColada` pelo par `(album_id, figurinha_id)`: insere se não existe; atualiza `colada_em` se já existe. Não são criados registros duplicados |
| RN-AP27 | Se o backend rejeitar a colagem porque o álbum foi arquivado entre a abertura do MCol e a confirmação: exibir mensagem de erro "Este álbum foi arquivado e não pode mais receber figurinhas." O modal permanece aberto; o botão "Colar" é desabilitado para aquele álbum; demais álbuns elegíveis permanecem disponíveis. Se não houver outros álbuns elegíveis, o modal pode ser fechado |
| RN-AP28 | A pilha é limitada a **100 itens com `status_destino = PENDENTE`**. Ao atingir o limite, novas entradas são recusadas com mensagem "Limite de 100 figurinhas pendentes atingido. Defina o destino de algumas antes de continuar." Entradas com destino já definido (`COLADA` ou `REPETIDA`) não contam para o limite |
| RN-AP29 | Em modo offline, novas entradas são enfileiradas localmente no dispositivo. O OCR e a visualização da pilha continuam funcionando normalmente |
| RN-AP30 | Ao reconectar, o sistema sincroniza automaticamente a fila local com o backend. Entradas duplicadas (já presentes no backend via outro dispositivo) são ignoradas silenciosamente |
| RN-AP31 | Falha na sincronização: o sistema exibe indicador de erro com opção de nova tentativa manual. A fila local é preservada até sincronização bem-sucedida |
| RN-AP32 | Ações de navegação do header global (perfil, logout, home) que ocorram enquanto há itens `PENDENTES` na pilha disparam o alerta de saída (seção 8), com a exceção do logout, que encerra o fluxo e a sessão imediatamente |
| RN-AP41 | A Tela AP1 **não possui** botão "Sair" dedicado. A saída do fluxo é realizada exclusivamente pelas ações do header global (logout, home, perfil), sujeitas ao alerta de saída quando há itens PENDENTES (RN-AP32) |
| RN-AP42 | O nome e o tipo do álbum da sessão (`TipoAlbum.nome`) DEVEM ser exibidos em destaque no topo da Tela AP1, em posição fixa acima da zona de entrada, durante toda a duração do fluxo. Esse elemento serve como referência permanente para o usuário e não pode ser ocultado ou colapsado |
| RN-AP43 | No Modo Fotografar, a câmera é ativada exclusivamente pelo toque/clique no botão "Abrir câmera". A troca do seletor de modo para "Fotografar" apenas exibe o botão — não abre a câmera automaticamente. Essa exigência evita ativação acidental da câmera |

---

## 11. Requisitos de Acessibilidade (WCAG 2.2 / 2.0 AA)

As regras globais constam em `spec_privacidade_lgpd` (Seção 9). As regras abaixo são específicas deste fluxo.

| # | Regra |
|---|---|
| RN-AP33 | O campo de digitação da Tela AP1 DEVE ter `aria-label` descrevendo seu propósito (ex.: "Número da figurinha") e autofoco declarado acessivelmente; ao limpar o campo e retornar o foco após adição de figurinha, o evento DEVE ser anunciado (ex.: live region "Figurinha [número] adicionada") |
| RN-AP34 | O Modal Câmera DEVE implementar focus trap e usar `role="dialog"`, `aria-modal="true"`, `aria-labelledby`; ao fechar, o foco DEVE retornar ao botão "Abrir câmera" |
| RN-AP35 | O indicador de status de conectividade offline ("Sem conexão — salvando localmente") DEVE ser anunciado via `role="status"` ao aparecer; o indicador de sincronização ("Sincronizando...") idem; o indicador de erro de sincronização DEVE usar `role="alert"` |
| RN-AP36 | O alerta de saída (seção 8) DEVE ser implementado como `role="dialog"` com focus trap; ao abrir, foco vai para o título ou primeiro botão de ação |
| RN-AP37 | O diálogo de retomada de pilha pendente (seção 4.1) DEVE seguir as mesmas regras de modal (role, focus trap, aria-labelledby) |
| RN-AP38 | O modal de confirmação de descarte de figurinha (RN-AP24) DEVE ser `role="dialog"` com focus trap; ao cancelar, o foco retorna ao botão de descarte do card correspondente |
| RN-AP39 | Os cards da pilha DEVEM expor o estado de cada figurinha programaticamente (ex.: `aria-label="Figurinha [número] — [nome] — [status]"`); o botão "Colar" e o botão "Enviar para Repetidas" DEVEM ter labels que incluam o identificador da figurinha (ex.: "Colar figurinha 347 — Vinicius Jr.") |
| RN-AP40 | O contador de figurinhas na sessão DEVE ser atualizado via `aria-live="polite"` a cada adição |
| RN-AP44 | O nome e tipo do álbum exibidos no topo da AP1 (RN-AP42) DEVEM ser marcados como região com rótulo acessível, de modo que leitores de tela anunciem o contexto da sessão ao usuário |

---

## 12. Fluxos Relacionados (fora do escopo desta spec)

| Fluxo | Gatilho nesta spec |
|---|---|
| **Colar Figurinhas** | Alternativa ao MCol para fluxo gerenciado por álbum |
| **Cadastro de Álbum** | Aviso contextual quando o usuário não possui álbum cadastrado |
| **Home — Figurinhas Repetidas** | Destino final das entradas com `status_destino = REPETIDA` |
