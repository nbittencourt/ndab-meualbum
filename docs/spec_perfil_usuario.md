# Especificação Funcional — Perfil do Usuário / Configurações de Conta

> **Dependências:** Especificação de Cadastro de Usuários · Especificação de Login e Recuperação de Senha · Especificação da Home (Álbuns)
> **Fluxos referenciados mas fora do escopo:** Confirmação de Email (Tela 2 do Cadastro) · Recuperação de Senha (Tela L2)

---

## Histórico de Revisões

| Versão | Data | Alterações |
|---|---|---|
| 1.0 | inicial | Versão original |
| 1.1 | red team | **C1** — troca de senha invalida todas as sessões ativas exceto a corrente via `token_versao`; RN-P22 atualizado; RN-P22a adicionado. **C4** — cooldown de 5 minutos estendido para cobrir também novas solicitações de alteração de email, não apenas reenvio (RN-P12 atualizado). **M7** — cooldown de usuário `PENDENTE` explicitado como uso de `ultimo_envio_em`, não `ultimo_envio_email_pendente_em` (RN-P16 atualizado). **B3** — seção de exclusão de conta adicionada (seção 8, RN-P24 a RN-P28) |
| 1.2 | LGPD + WCAG | Seção 8 (Exportar Dados) adicionada; Seção de Excluir Conta renumerada para 9. Link "Exercer direitos de privacidade" adicionado (RN-P29, RN-P30). Requisitos de acessibilidade adicionados (RN-P31 a RN-P38). |

---

## 1. Visão Geral

Tela de gerenciamento de conta do usuário autenticado. Acessível a partir do header global da aplicação. Permite visualizar o identificador público, alterar nome, alterar email, alterar senha e excluir a conta.

A tela é composta por uma única página (**Tela P1**) com cinco seções empilhadas. Cada seção opera de forma independente. A confirmação de alteração de email ocorre em tela separada (**Tela P2**), acessada via link enviado por email.

**Acesso:** permitido a usuários com `status = ATIVO`, `EMAIL_PENDENTE` ou `PENDENTE`. O comportamento da seção de email varia conforme o status (ver seção 6).

> **Nota sobre usuários `PENDENTE`:** como o fluxo de login redireciona esses usuários para a Tela 2 de Confirmação de Email, o acesso ao perfil por usuários `PENDENTE` deve ser disponibilizado a partir dessa tela (ex.: link "Corrigir meu email"), possibilitando a correção de erros de digitação. Essa navegação é responsabilidade da spec de Cadastro de Usuários.

---

## 2. Entidades e Dados

### 2.1 Alterações na entidade Usuário

O enum `status` é ampliado e dois campos são adicionados:

| Campo | Tipo | Observações |
|---|---|---|
| `status` | Enum | **Ampliado:** `PENDENTE` · `ATIVO` · `EMAIL_PENDENTE` |
| `email_pendente` | String \| null | Novo endereço aguardando confirmação; `null` quando não há alteração em curso |
| `ultimo_envio_email_pendente_em` | Timestamp \| null | Data/hora do último envio do email de confirmação de **alteração** de endereço. Base para o cooldown de alteração de email para usuários `ATIVO`/`EMAIL_PENDENTE`. **Não utilizado** para usuários `PENDENTE` |

**Semântica dos status:** ver spec_cadastro_usuarios.

### 2.2 Extensão de `TokenOperacao`

A entidade `TokenOperacao` (definida em spec_login_recuperacao_senha) é utilizada neste fluxo com `tipo = ALTERACAO_EMAIL`. Sem alterações de estrutura nesta revisão.

---

## 3. Fluxo Geral

```
[Header global — ação de acesso ao perfil]
        │
        ▼
[Tela P1 — Perfil / Configurações de Conta]
  Seção: Identificador (somente leitura)
  Seção: Nome
  Seção: Email
  Seção: Senha
  Seção: Excluir conta
        │
        ├── [Link no email de confirmação de alteração de email]
        │         │
        │         ▼
        │   [Tela P2 — Confirmação de Alteração de Email]
        │
        └── [Link "Esqueci minha senha" na seção Senha]
                  │
                  ▼
            [Tela L2 — Recuperação de Senha] ← spec Login e Recuperação
```

---

## 4. Seção: Identificador

Exibida no topo da Tela P1, antes de todas as seções editáveis.

**Elementos:**
- Rótulo: "Seu identificador"
- Código de 6 caracteres em destaque tipográfico (ex.: `A3F9KX`)
- Botão "Copiar" — copia o identificador para a área de transferência; exibe confirmação visual temporária ("Copiado!") que desaparece após alguns segundos
- Texto auxiliar: "Este código é público e identifica você na plataforma."

O campo é somente leitura. O identificador é imutável conforme RN-01 de spec_cadastro_usuarios.

---

## 5. Seção: Nome

**Elementos:**
- Campo de texto "Nome completo", pré-preenchido com o valor atual
- Botão "Salvar"
- Área de feedback inline (sucesso ou erro)

**Comportamento:**
- O botão "Salvar" fica habilitado somente quando o valor do campo difere do nome armazenado e não está vazio
- Ao salvar com sucesso: atualiza o nome exibido no header global da sessão atual e exibe confirmação inline

---

## 6. Seção: Email

O comportamento desta seção varia conforme o `status` do usuário.

### 6.1 Fluxo de alteração — usuário `ATIVO` ou `EMAIL_PENDENTE`

```
[Seção Email]
  Campo exibe email atual (confirmado)
  Se status = EMAIL_PENDENTE: aviso de pendência exibido (ver 6.3)
        │
        ▼
  Usuário insere novo email e clica "Salvar"
        │
        ▼
  Sistema verifica cooldown: agora - ultimo_envio_email_pendente_em < 5 min?
        │
        ├── EM COOLDOWN → mensagem de erro inline "Aguarde MM:SS para solicitar nova alteração"
        │
        ▼
  Sistema valida:
    - formato de email válido?
    - email diferente do email atual?
    - email não está em uso por outro usuário?
        │
        ├── INVÁLIDO ou DUPLICADO → mensagem de erro inline; sem alteração de estado
        │
        ▼
  Sistema persiste:
    - email_pendente = novo_email
    - status = EMAIL_PENDENTE
    - Gera TokenOperacao (tipo=ALTERACAO_EMAIL, email_novo=novo_email, expira_em=agora+2h)
    - ultimo_envio_email_pendente_em = agora
    - Envia email de confirmação para o novo endereço com link:
      https://<domínio>/confirmar-email?token=<UUID>
        │
        ▼
  Campo volta a exibir o email atual (não o pendente)
  Aviso de pendência exibido abaixo do campo (ver 6.3)
```

> O cooldown de 5 minutos se aplica tanto ao botão "Reenviar email" (6.3) quanto a novas solicitações de alteração de email via campo + "Salvar". O campo `ultimo_envio_email_pendente_em` controla ambos os casos.

> Se já havia `EMAIL_PENDENTE` anterior: o token anterior é logicamente invalidado. O novo `email_pendente` substitui o anterior; novo token é gerado; novo email de confirmação é enviado; `ultimo_envio_email_pendente_em` é atualizado.

### 6.2 Confirmação via link — Tela P2

```
[Usuário clica no link recebido no novo endereço]
        │
        ▼
[Tela P2 — Confirmação de Alteração de Email]
  Sistema valida o token:
    - token existe?
    - tipo = ALTERACAO_EMAIL?
    - usado_em IS NULL?
    - expira_em > agora?
        │
        ├── INVÁLIDO ou EXPIRADO → estado de erro (ver 9, Tela P2)
        │
        ▼
  Sistema persiste:
    - email = email_novo (do token)
    - email_pendente = null
    - ultimo_envio_email_pendente_em = null
    - status = ATIVO
    - token.usado_em = agora
        │
        ▼
  Estado de sucesso exibido (ver 9, Tela P2)
```

### 6.3 Aviso de pendência

Exibido quando `status = EMAIL_PENDENTE`. Localizado abaixo do campo de email.

**Conteúdo:**
- Endereço pendente em destaque (mascarado, ex.: `n***@novodominio.com`)
- Informação sobre expiração: "O link expira em 2 horas a partir do envio."
- Botão ou link "Reenviar email":
  - Enquanto em cooldown: exibe contador regressivo "Reenviar em MM:SS" (não clicável)
  - Após cooldown: link clicável "Reenviar email" — gera novo token, atualiza `ultimo_envio_email_pendente_em`, envia novo email
- Botão "Cancelar alteração"

### 6.4 Cancelamento da alteração

Ao acionar "Cancelar alteração":
- `email_pendente` = `null`
- `ultimo_envio_email_pendente_em` = `null`
- `status` = `ATIVO`
- Token de tipo `ALTERACAO_EMAIL` é logicamente invalidado
- Nenhum email é enviado
- Aviso de pendência removido; campo exibe email atual

### 6.5 Fluxo de alteração — usuário `PENDENTE`

Usuário `PENDENTE` ainda não confirmou nenhum email; a alteração não requer o mecanismo de `EMAIL_PENDENTE`.

```
  Usuário insere novo email e clica "Salvar"
        │
        ▼
  Sistema verifica cooldown: agora - ultimo_envio_em < 5 min?
        │
        ├── EM COOLDOWN → mensagem de erro inline "Aguarde MM:SS"
        │
        ▼
  Sistema valida: formato + unicidade
        │
        ├── INVÁLIDO ou DUPLICADO → mensagem de erro inline
        │
        ▼
  Sistema persiste:
    - email = novo_email (substituição direta)
    - ultimo_envio_em = agora
    - Reenvia email de confirmação de cadastro (com magic link UUID e identificador) para o novo endereço
    - status permanece PENDENTE
```

> O cooldown de usuário `PENDENTE` usa `ultimo_envio_em` (campo de cadastro), não `ultimo_envio_email_pendente_em` — conforme RN-20 de spec_cadastro_usuarios.

---

## 7. Seção: Senha

### 7.1 Estrutura da seção

Campos em sequência:

1. **Senha atual** — obrigatório; input password com toggle; sem checklist de requisitos
2. Link "Esqueci minha senha" — alinhado abaixo do campo; redireciona para Tela L2 sem encerrar a sessão atual
3. **Nova senha** — obrigatório; input password com toggle; exibe checklist de requisitos em tempo real
4. **Confirmar nova senha** — obrigatório; input password com toggle; o item "Senhas idênticas" aparece ao interagir com este campo

Botão "Alterar senha" — habilitado somente quando: campo de senha atual está preenchido e todos os itens do checklist (incluindo "Senhas idênticas") estão atendidos.

### 7.2 Checklist de requisitos de senha

```
[ ] Mínimo de 8 caracteres
[ ] Ao menos uma letra maiúscula
[ ] Ao menos uma letra minúscula
[ ] Ao menos um número
[ ] Ao menos um caractere especial
[ ] Senhas idênticas            ← aparece ao interagir com o campo de confirmação
```

### 7.3 Fluxo

```
  Usuário preenche os três campos e clica "Alterar senha"
        │
        ▼
  Sistema valida no servidor:
    - senha atual confere com o hash armazenado?
    - nova senha atende à política completa?
    - nova senha = confirmação?
        │
        ├── senha atual incorreta → erro inline no campo "Senha atual"
        ├── política não atendida → refletido no checklist
        ├── senhas não coincidem → erro no campo de confirmação
        │
        ▼
  Sistema persiste: atualiza hash da senha
  Sistema incrementa Usuário.token_versao em +1
  Sistema emite novo JWT com token_versao atualizado para a sessão corrente
        │
        ▼
  Campos limpos; confirmação de sucesso exibida inline
```

---

## 8. Seção: Exportar Dados

### 8.1 Visão geral

Mecanismo de portabilidade de dados do usuário (Art. 18, V da LGPD). Disponível na Tela P1 como seção independente, antes da seção de Excluir Conta. Gera um arquivo ZIP contendo os dados pessoais e de uso do usuário em formato CSV, organizados por entidade.

### 8.2 Conteúdo do arquivo exportado

O arquivo gerado é um ZIP com os seguintes arquivos CSV:

| Arquivo | Entidade | Campos incluídos |
|---|---|---|
| `usuario.csv` | Usuário | `identificador`, `nome`, `email`, `status`, `criado_em`, `confirmado_em`, `declaracao_maioridade_em` |
| `albums.csv` | Álbum | `id`, `tipo_album_nome`, `variante`, `nome_personalizado`, `criado_em`, `arquivado_em`, `percentual_conclusao` |
| `figurinhas_coladas.csv` | FigurinhaColada | `album_id`, `figurinha_numero`, `figurinha_nome`, `secao_nome`, `colada_em`, `origem` |
| `estoque_figurinhas.csv` | EstoqueFigurinha | `figurinha_numero`, `figurinha_nome`, `tipo_album_nome`, `quantidade` |
| `pilha_sessao.csv` | PilhaDaSessão | `figurinha_numero`, `figurinha_nome`, `tipo_album_nome`, `origem`, `status_destino`, `criado_em` |

Campos de chave interna (IDs de banco) são omitidos sempre que o dado puder ser identificado por chave natural legível. O arquivo ZIP inclui um arquivo `README.txt` com o dicionário de colunas de cada CSV e a data/hora de geração.

### 8.3 Fluxo

```
[Seção Exportar dados — Tela P1]
  Botão "Exportar meus dados"
        │
        ▼
  Sistema gera o arquivo ZIP com todos os CSVs sincronamente
  (spinner inline no botão durante geração; demais seções da tela permanecem interativas)
        │
        ├── SUCESSO → download iniciado automaticamente pelo navegador
        │             botão retorna ao estado normal
        │
        └── FALHA → mensagem de erro inline; botão retorna ao estado normal
```

### 8.4 Elementos da seção

1. Texto descritivo: "Baixe uma cópia de todos os seus dados armazenados na plataforma em formato CSV."
2. Link "Saiba mais sobre seus direitos de privacidade" — redireciona para a Política de Privacidade (nova aba)
3. Botão "Exportar meus dados" — estado loading com spinner durante geração

---

## 9. Seção: Excluir Conta

> **Atenção:** Esta seção era anteriormente numerada como **8** (versão 1.1). Renumerada para 9 nesta versão.

### 9.1 Visão geral

Exclusão permanente e irreversível da conta e de todos os dados associados ao usuário. Disponível na Tela P1 como última seção, visualmente separada das demais.

### 9.2 Fluxo

```
[Seção Excluir conta]
  Botão "Excluir minha conta" (estilo destrutivo — vermelho ou equivalente de alerta)
        │
        ▼
[Diálogo/expansão de confirmação]
  Texto: "Esta ação é permanente e não pode ser desfeita. Todos os seus dados serão
          removidos: álbuns, figurinhas, estoque e histórico. Para confirmar, digite
          seu identificador abaixo."
  Campo: identificador (6 chars, texto simples)
  Botão "Confirmar exclusão" — desabilitado até que o identificador digitado coincida
                               exatamente com o identificador do usuário autenticado
  Botão "Cancelar"
        │
        ▼
  Usuário digita identificador + clica "Confirmar exclusão"
        │
        ▼
  Sistema valida: identificador digitado == Usuário.identificador?
        │
        ├── NÃO → mensagem de erro inline "Identificador incorreto"; sem ação
        │
        ▼
  Sistema executa hard delete em cascata (ver RN-P26)
  Sistema encerra a sessão corrente
        │
        ▼
  Redireciona para a landing page com mensagem: "Sua conta foi excluída."
```

---

## 9. Detalhamento Visual

### Tela P1 — Perfil / Configurações de Conta

**Layout:** coluna central, largura máxima ~600 px, verticalizada, responsiva.

**Estrutura (de cima para baixo):**

1. Título: "Minha conta"
2. **Bloco: Identificador** — rótulo, código em destaque monospace, botão "Copiar", texto auxiliar
3. **Seção: Nome** — label, campo pré-preenchido, botão "Salvar", área de feedback inline
4. **Seção: Email** — label, campo pré-preenchido, botão "Salvar"; aviso de pendência condicional; área de feedback inline
5. **Seção: Senha** — campo "Senha atual", link "Esqueci minha senha", campo "Nova senha", checklist, campo "Confirmar nova senha", botão "Alterar senha", área de feedback inline
6. **Seção: Exportar Dados** — texto descritivo, link "Saiba mais sobre seus direitos de privacidade", botão "Exportar meus dados"
7. **Link: "Exercer direitos de privacidade"** — link de texto, abaixo da seção de exportação, que redireciona para o canal de contato da Política de Privacidade
8. **Seção: Excluir conta** — separador visual, botão destrutivo "Excluir minha conta", expansão de confirmação (condicional)

---

### Tela P2 — Confirmação de Alteração de Email

Acessada exclusivamente via link recebido no novo endereço.

**Estado de sucesso:**
1. Ícone de confirmação
2. Título: "Email atualizado"
3. Texto: "Seu novo email foi confirmado e já está ativo na sua conta."
4. Botão primário: "Acessar a aplicação"

**Estado de erro (token inválido ou expirado):**
1. Ícone de alerta
2. Título: "Link inválido ou expirado"
3. Texto: "Este link de confirmação não é mais válido. Links expiram em 2 horas e só podem ser usados uma vez. Acesse seu perfil para solicitar um novo envio."
4. Botão primário: "Ir para o perfil"

---

## 10. Regras de Negócio Consolidadas

| # | Regra |
|---|---|
| RN-P01 | A Tela P1 é acessível a usuários com `status = ATIVO`, `EMAIL_PENDENTE` ou `PENDENTE`; o acesso por usuários `PENDENTE` deve ser disponibilizado a partir da Tela 2 de Confirmação de Email |
| RN-P02 | O `identificador` é exibido em destaque no topo da Tela P1 em modo somente leitura; é imutável |
| RN-P03 | O botão de copiar o `identificador` copia o valor para a área de transferência e exibe confirmação visual temporária |
| RN-P04 | O campo `nome` é obrigatório; comprimento máximo de 100 caracteres |
| RN-P05 | O botão "Salvar" do nome é habilitado somente quando o valor difere do nome atual e é não vazio |
| RN-P06 | A alteração de email exige: formato de email válido, endereço diferente do atual e endereço não em uso por outro usuário |
| RN-P07 | Conflito de email com outro usuário: mensagem de erro inline "Este email já está em uso"; nenhum dado é alterado |
| RN-P08 | A transição para `EMAIL_PENDENTE` ocorre apenas em usuários `ATIVO` (ou que já eram `EMAIL_PENDENTE`); usuários `PENDENTE` têm o `email` atualizado diretamente |
| RN-P09 | O email de confirmação de alteração é enviado para `email_pendente` (novo endereço); o `email` atual permanece funcional até a confirmação |
| RN-P10 | O token de confirmação de alteração de email é do tipo `ALTERACAO_EMAIL` na entidade `TokenOperacao`; `email_novo` armazena o endereço a ser ativado |
| RN-P11 | O prazo de validade do token de confirmação de alteração de email é de 2 horas |
| RN-P12 | O cooldown de 5 minutos, calculado a partir de `ultimo_envio_email_pendente_em`, aplica-se tanto ao botão "Reenviar email" quanto a novas solicitações de alteração de email (campo + "Salvar") para usuários `ATIVO`/`EMAIL_PENDENTE`. Enquanto em cooldown, o campo "Salvar" retorna erro informando o tempo restante |
| RN-P13 | Se uma nova solicitação de alteração de email substitui uma pendente anterior (e o cooldown foi respeitado), o token anterior é logicamente invalidado; `email_pendente` e o token são substituídos; novo email de confirmação é enviado |
| RN-P14 | O cancelamento da alteração de email: define `status = ATIVO`, limpa `email_pendente` e `ultimo_envio_email_pendente_em`; token pendente é logicamente invalidado; nenhum email é enviado |
| RN-P15 | Ao confirmar via link (Tela P2): `email` recebe o valor de `email_novo`; `email_pendente` e `ultimo_envio_email_pendente_em` são limpos; `status` = `ATIVO`; `token.usado_em` = agora |
| RN-P16 | Usuário `PENDENTE` que altera email: `email` é substituído diretamente; magic link de confirmação de cadastro (com identificador e UUID) é reenviado ao novo endereço; `ultimo_envio_em` é atualizado; `status` permanece `PENDENTE`. O cooldown usa `ultimo_envio_em`, não `ultimo_envio_email_pendente_em` |
| RN-P17 | O email de confirmação de alteração contém obrigatoriamente: o novo endereço que será ativado e informação sobre o prazo de expiração (2 horas) |
| RN-P18 | Para alterar a senha, o usuário deve informar a senha atual; a validação ocorre no servidor |
| RN-P19 | Senha atual incorreta: mensagem de erro inline no campo "Senha atual"; campos de nova senha não são afetados |
| RN-P20 | A política de senha é idêntica à definida nas especificações de Cadastro e Login: mínimo 8 caracteres, ao menos 1 maiúscula, ao menos 1 minúscula, ao menos 1 número, ao menos 1 caractere especial |
| RN-P21 | O botão "Alterar senha" permanece desabilitado enquanto: o campo de senha atual estiver vazio, ou qualquer item do checklist (incluindo "Senhas idênticas") não estiver atendido |
| RN-P22 | Após alteração bem-sucedida de senha, `Usuário.token_versao` é incrementado em +1, invalidando todas as sessões ativas em outros dispositivos. Um novo JWT com `token_versao` atualizado é emitido para a sessão corrente, que permanece ativa |
| RN-P22a | O usuário não é deslogado da sessão corrente ao alterar a senha; apenas sessões em outros dispositivos são invalidadas pelo incremento de `token_versao` |
| RN-P23 | O link "Esqueci minha senha" redireciona para a Tela L2 (Recuperação de Senha) sem encerrar a sessão atual |
| RN-P24 | A exclusão de conta é uma operação irreversível; exige confirmação explícita via digitação do `identificador` do usuário |
| RN-P25 | O botão "Confirmar exclusão" permanece desabilitado até que o valor digitado coincida exatamente com `Usuário.identificador` (comparação case-insensitive após conversão para maiúsculas) |
| RN-P26 | A exclusão de conta executa **hard delete** em cascata dos seguintes dados: `Usuário`, `EstoqueFigurinha`, `FigurinhaColada`, `Álbum`, entradas da Pilha da Sessão (Abrir Pacotinhos), `TokenOperacao` e `TokenConfirmacaoCadastro` associados ao usuário |
| RN-P27 | Após exclusão bem-sucedida, a sessão é encerrada e o usuário é redirecionado para a landing page com mensagem de confirmação |
| RN-P28 | Usuários com `status = PENDENTE` podem excluir a conta normalmente, desde que acessem a Tela P1 via link disponível na Tela 2 de Confirmação de Email |

---

## 11. Requisitos de LGPD

| # | Regra |
|---|---|
| RN-P29 | A Tela P1 expõe botão "Exportar meus dados" que gera e faz download de um arquivo ZIP com CSVs de todas as entidades do usuário conforme conteúdo definido na Seção 8.2 |
| RN-P30 | O arquivo ZIP inclui `README.txt` com dicionário de colunas e data/hora de geração; os arquivos CSV usam encoding UTF-8 e separador vírgula (`,`) com aspas duplas para campos com vírgulas |
| RN-P31 | A Tela P1 exibe link "Exercer direitos de privacidade" que redireciona para o canal de contato da Política de Privacidade (nova aba, com indicação textual); este link atende ao requisito RN-PR15 de spec_privacidade_lgpd |

---

## 12. Requisitos de Acessibilidade (WCAG 2.2 / 2.0 AA)

As regras globais constam em `spec_privacidade_lgpd` (Seção 9). As regras abaixo são específicas deste fluxo.

| # | Regra |
|---|---|
| RN-P32 | O identificador exibido no bloco somente leitura DEVE ter `aria-label` com os caracteres separados por espaço (ex.: `aria-label="A 3 F 9 K X"`) — conforme RN-WG25 de spec_privacidade_lgpd |
| RN-P33 | O botão "Copiar" DEVE anunciar o resultado "Identificador copiado" via live region após a ação |
| RN-P34 | O diálogo de confirmação de exclusão de conta DEVE implementar focus trap: ao ser aberto, o foco DEVE ir para o título ou primeiro elemento interativo do diálogo; Esc ou "Cancelar" fecham o diálogo e retornam o foco ao botão "Excluir minha conta" |
| RN-P35 | O diálogo de confirmação DEVE usar `role="dialog"`, `aria-modal="true"` e `aria-labelledby` apontando para seu título |
| RN-P36 | O botão "Confirmar exclusão" DEVE permanecer programaticamente disponível (`aria-disabled="true"` em vez de `disabled`) enquanto o identificador não confere, para que leitores de tela possam informar ao usuário que ele está inativo, com o motivo via `aria-describedby` |
| RN-P37 | O aviso de pendência de email (seção 6.3) — quando exibido — DEVE ser anunciado via live region ao aparecer na tela pela primeira vez após uma ação do usuário |
| RN-P38 | O contador regressivo de cooldown exibido no aviso de pendência de email DEVE seguir a regra RN-32 de spec_cadastro_usuarios (anúncio limitado a marcos, não a cada segundo) |

---

## 11. Estados de Carregamento e Erro

| Situação | Comportamento |
|---|---|
| Carregamento inicial da Tela P1 | Seções exibem skeleton/placeholder enquanto os dados do usuário são buscados |
| Falha ao carregar dados do usuário | Mensagem de erro com opção de tentar novamente |
| Falha no servidor ao salvar nome | Mensagem de erro inline na seção; campo permanece preenchido |
| Falha no servidor ao salvar email | Mensagem de erro inline na seção; nenhum estado é alterado |
| Falha no servidor ao alterar senha | Mensagem de erro genérica abaixo do botão; campos não são limpos |
| Falha no servidor ao excluir conta | Mensagem de erro inline na seção de exclusão; nenhum dado é alterado |
| Sessão expirada (JWT inválido) | Redireciona automaticamente para a tela de Login |

---

## 12. Fluxos Relacionados (fora do escopo desta spec)

| Fluxo | Gatilho nesta spec |
|---|---|
| **Confirmação de Email — Tela 2 (Cadastro)** | Usuário `PENDENTE` que altera email recebe novo magic link; link "Corrigir email" na Tela 2 acessa esta tela |
| **Recuperação de Senha — Tela L2 (Login)** | Link "Esqueci minha senha" na seção Senha |
| **Home** | Botão "Acessar a aplicação" na Tela P2 após confirmação bem-sucedida |
