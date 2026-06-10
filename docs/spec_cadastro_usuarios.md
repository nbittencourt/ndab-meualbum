# Especificação Funcional — Cadastro de Usuários

---

## Histórico de Revisões

| Versão | Data | Alterações |
|---|---|---|
| 1.0 | inicial | Versão original |
| 1.1 | revisão | `confirmado_em` corrigido para `Timestamp \| null`; campo `ultimo_envio_em` adicionado; cooldown de reenvio rebaseado em `ultimo_envio_em`; checklist de política de senha adicionado à Tela 1; indicador de força de senha removido |
| 1.2 | revisão | Enum `status` ampliado com `EMAIL_PENDENTE`; requisito de número adicionado à política de senha (RN-14); checklist da Tela 1 atualizado; link "Corrigir email" adicionado à Tela 2 |
| 1.3 | red team | **C2** — `TokenConfirmacaoCadastro` (UUID) introduzido; `identificador` deixa de funcionar como token de confirmação; Tela 2 passa a confirmar exclusivamente via magic link; VIA A (digitação manual) removida. **C3** — rate limiting formalizado como RN-18. **B4** — comportamento definido para magic link acessado com sessão ativa de outro usuário (RN-19). **M7** — campo de cooldown para usuário `PENDENTE` que altera email explicitado (RN-20). Adicionado campo `token_versao` à entidade `Usuário` (RN-21) |
| 1.4 | LGPD + WCAG | Campo `declaracao_maioridade_em` adicionado à entidade `Usuário` (RN-22). Checkbox declaratório de maioridade e aceite de Termos/Política adicionado à Tela 1 (RN-22, RN-23). Aviso de privacidade no ponto de coleta adicionado (RN-23). Seção de Requisitos de Acessibilidade adicionada (RN-24 a RN-32). |
| 1.5 | revisão de RNs implícitas | **RN-33** — limite máximo de 100 caracteres para o campo nome. **RN-34** — email convertido para minúsculas antes de persistir. **RN-35** — comportamento do botão "Criar conta" durante requisição. **RN-36** — o campo de email na Tela 2 é mascarado. **RN-37** — o link "Corrigir email" da Tela 2 não está disponível para usuários já `ATIVO`. **RN-38** — a Tela 3 não é acessível diretamente por URL; exige transição do fluxo. |

---

## 1. Visão Geral

Fluxo de cadastro para aplicação web responsiva (PWA-ready) composto por três etapas sequenciais: **Registro → Confirmação de Email → Acesso à Aplicação**. Cada usuário recebe um identificador alfanumérico público de 6 caracteres gerado no momento do cadastro. A confirmação de email ocorre exclusivamente via magic link UUID enviado por email.

---

## 2. Entidades e Dados

### 2.1 Usuário

| Campo | Tipo | Observações |
|---|---|---|
| `identificador` | String (6 chars) | **Chave primária.** Alfanumérico maiúsculo, aleatório, único. Identificador público do usuário. Não é mais utilizado como token de confirmação de email |
| `nome` | String | Nome completo. Máximo 100 caracteres (RN-33) |
| `email` | String | Único no sistema. Armazenado em minúsculas (RN-34) |
| `senha` | String (hash) | Armazenada como hash via algoritmo moderno (bcrypt, Argon2id ou scrypt); salt gerenciado internamente pelo algoritmo |
| `status` | Enum | `PENDENTE` · `ATIVO` · `EMAIL_PENDENTE` |
| `token_versao` | Integer | Inicia em `1` no cadastro. Incrementado em +1 no logout e na troca de senha. JWTs carregam `token_versao` no payload; servidor rejeita JWTs com versão inferior à registrada |
| `criado_em` | Timestamp | Data/hora do cadastro |
| `ultimo_envio_em` | Timestamp | Data/hora do último envio de email de confirmação de cadastro. Preenchido no cadastro e atualizado a cada reenvio. Base para cooldown de confirmação de cadastro e para reenvio de usuário `PENDENTE` que altera email |
| `confirmado_em` | Timestamp \| null | Data/hora da confirmação do email de cadastro; `null` enquanto `status = PENDENTE` |
| `email_pendente` | String \| null | Novo endereço aguardando confirmação de alteração; gerenciado pelo fluxo de Perfil do Usuário |
| `ultimo_envio_email_pendente_em` | Timestamp \| null | Data/hora do último envio do email de confirmação de **alteração** de endereço. Exclusivo para usuários `ATIVO`/`EMAIL_PENDENTE`. Não utilizado no fluxo de cadastro nem para usuários `PENDENTE` |
| `declaracao_maioridade_em` | Timestamp | Data/hora em que o usuário marcou o checkbox declaratório de maioridade no cadastro. Preenchido uma única vez no cadastro; imutável. Obrigatório em todos os cadastros realizados após adoção desta versão |

**Semântica dos status:**

| Status | Significado | Acesso à aplicação |
|---|---|---|
| `PENDENTE` | Cadastro realizado; email de cadastro nunca confirmado | Bloqueado — redireciona para Tela 2 de Confirmação |
| `ATIVO` | Email confirmado; conta plena | Irrestrito |
| `EMAIL_PENDENTE` | Conta ativa; nova alteração de email aguardando confirmação | Irrestrito — tratado como `ATIVO` para fins de acesso |

### 2.2 Entidade: TokenConfirmacaoCadastro

Utilizada exclusivamente pelo fluxo de confirmação de email de cadastro.

| Campo | Tipo | Observações |
|---|---|---|
| `token` | String (UUID v4) | Chave primária; gerado a cada cadastro ou reenvio |
| `usuario_identificador` | String (FK → Usuário.identificador) | Referência ao usuário |
| `criado_em` | Timestamp | Base para cálculo de expiração |
| `expira_em` | Timestamp | `criado_em` + 24 horas |
| `usado_em` | Timestamp \| null | Preenchido no momento do uso; `null` = não utilizado |

**Regras de ciclo de vida:**
- Um novo token gerado invalida logicamente todos os tokens anteriores do mesmo usuário — apenas o token mais recente não expirado e não utilizado é aceito.
- Após uso bem-sucedido, `usado_em` é preenchido; o token não pode ser reutilizado.
- Tokens expirados ou já usados não são deletados automaticamente.

> Os fluxos de recuperação de senha e alteração de email utilizam `TokenOperacao` (definido em spec_login_recuperacao_senha), entidade distinta de `TokenConfirmacaoCadastro`.

---

## 3. Fluxo de Dados

```
[Tela 1: Cadastro]
  Usuário preenche: nome, email, senha
        │
        ▼
  Sistema valida campos (formato, unicidade do email, política de senha, limite de nome)
        │
        ├── ERRO → Exibe mensagem inline, permanece na Tela 1
        │
        ▼
  Sistema gera identificador (6 chars, alfanumérico maiúsculo, único)
  Sistema normaliza email para minúsculas
  Sistema persiste usuário: status = PENDENTE, token_versao = 1, ultimo_envio_em = agora
  Sistema gera TokenConfirmacaoCadastro (UUID, expira_em = agora + 24h)
  Botão "Criar conta" entra em estado de carregamento (desabilitado) durante a requisição
        │
        ▼
  Sistema envia email com:
    - identificador do usuário (exibido como código para anotar)
    - magic link: https://<domínio>/confirmar-cadastro?token=<UUID>
        │
        ▼
[Tela 2: Confirmação de Email]
  Usuário aguarda email e clica no magic link
        │
        ▼
  Sistema valida o token:
    - token existe em TokenConfirmacaoCadastro?
    - usado_em IS NULL?
    - expira_em > agora?
        │
        ├── INVÁLIDO ou EXPIRADO → exibe estado de erro (ver Tela 2 — estado de erro)
        │
        ▼
  Sistema verifica sessão ativa no dispositivo (ver RN-19)
        │
        ▼
  Sistema persiste:
    - status = ATIVO
    - confirmado_em = agora
    - token.usado_em = agora
  Emite JWT com token_versao atual
        │
        ▼
[Tela 3: Sucesso / Acesso à Aplicação]
  Usuário autenticado e redirecionado para a aplicação
  (Tela 3 não é acessível diretamente por URL — ver RN-38)
```

### 3.1 Regra de Reenvio

- O usuário pode solicitar reenvio a partir da Tela 2.
- Intervalo mínimo entre envios: **5 minutos**, calculado a partir de `ultimo_envio_em`.
- Cada reenvio gera novo `TokenConfirmacaoCadastro`, invalidando o anterior.
- O botão de reenvio exibe contador regressivo enquanto em cooldown; torna-se clicável após expiração.

---

## 4. Detalhamento Visual — Wireframe

### Tela 1 — Cadastro

**Layout:** coluna central, largura máxima ~480px, verticalizado, responsivo.

**Elementos (de cima para baixo):**

1. **Logotipo / nome da aplicação** — topo, centralizado
2. **Título:** "Criar conta"
3. **Campo: Nome completo**
   - Label acima do campo
   - Placeholder: "Seu nome"
   - Validação inline: obrigatório; máximo 100 caracteres
4. **Campo: Email**
   - Label acima do campo
   - Placeholder: "seuemail@exemplo.com"
   - Validação inline: formato de email, unicidade (retorno do servidor)
5. **Campo: Senha**
   - Label acima do campo
   - Input tipo password com toggle mostrar/ocultar
   - **Checklist de requisitos** exibido abaixo do campo, atualizado em tempo real:
     - `[ ]` Mínimo de 8 caracteres
     - `[ ]` Ao menos uma letra maiúscula
     - `[ ]` Ao menos uma letra minúscula
     - `[ ]` Ao menos um número
     - `[ ]` Ao menos um caractere especial
6. **Aviso de privacidade:** texto informativo abaixo do checklist de senha — "Seus dados (nome e email) são usados para criar e gerenciar sua conta. Consulte nossa [Política de Privacidade]." — link abre em nova aba com indicação textual "(abre em nova aba)"
7. **Checkbox declaratório (obrigatório):** `[ ] Tenho 18 anos ou mais, li e concordo com os [Termos de Uso] e a [Política de Privacidade].` — inicia desmarcado; "Termos de Uso" e "Política de Privacidade" são links independentes
8. **Botão primário: "Criar conta"** — largura total do formulário; **desabilitado** enquanto o checkbox declaratório estiver desmarcado; entra em estado de carregamento durante o processamento da requisição (RN-35)
9. **Link secundário:** "Já tem conta? Entrar" — abaixo do botão, centralizado

---

### Tela 2 — Confirmação de Email

**Layout:** coluna central, mesma largura da Tela 1.

A confirmação ocorre exclusivamente via magic link enviado por email. Não há campo de digitação de código.

**Estado padrão (aguardando confirmação):**

1. **Ícone:** envelope (outline)
2. **Título:** "Confirme seu email"
3. **Texto descritivo:** "Enviamos um link de confirmação para **[email mascarado]**. Clique nele para ativar sua conta." O endereço é exibido mascarado (ex.: `j***@exemplo.com`) — ver RN-36.
4. **Identificador em destaque:** bloco tipográfico com o código de 6 caracteres precedido do texto "Seu identificador é:" — exibido para que o usuário anote
5. **Área de reenvio:**
   - Enquanto em cooldown: "Reenviar em **MM:SS**" (não clicável)
   - Após cooldown: link/botão "Reenviar email"
6. **Mensagem de feedback de reenvio:** "Email reenviado" — aparece temporariamente
7. **Link "Corrigir email"** — disponível somente enquanto `status = PENDENTE`; redireciona para a tela de Perfil do Usuário (ver RN-37)

**Estado de erro (token inválido ou expirado):**

Exibido quando o magic link falha na validação.

1. Ícone de alerta
2. Título: "Link inválido ou expirado"
3. Texto: "Este link de confirmação não é mais válido. Links expiram em 24 horas e só podem ser usados uma vez."
4. Botão primário: "Solicitar novo link" — aciona reenvio imediato (sem aguardar cooldown neste estado de erro)

---

### Tela 3 — Cadastro Confirmado

**Layout:** coluna central, mesma estrutura.

Acessível apenas após transição bem-sucedida do fluxo de confirmação; não pode ser acessada diretamente por URL (RN-38).

1. **Ícone de sucesso**
2. **Título:** "Tudo certo!"
3. **Texto:** "Sua conta foi criada. Seu identificador é:"
4. **Identificador em destaque:** bloco tipográfico grande (ex: `A3F9KX`) — com botão "Copiar"
5. **Texto auxiliar:** "Guarde este identificador — ele é público e pode ser usado para identificá-lo na plataforma."
6. **Botão primário: "Acessar a aplicação"**

---

## 5. Regras de Negócio Consolidadas

| # | Regra |
|---|---|
| RN-01 | O `identificador` é a chave primária do usuário — único no sistema, gerado no cadastro, imutável |
| RN-02 | O `identificador` é exclusivamente o código público do usuário; não serve como token de confirmação de email |
| RN-03 | O charset do `identificador` é restrito a letras maiúsculas e dígitos, excluindo caracteres ambíguos: `O`, `0`, `I`, `1`, `L` |
| RN-04 | Entradas do usuário que envolvam o identificador são convertidas para maiúsculas antes da validação |
| RN-05 | Enquanto `status = PENDENTE`, o usuário não tem acesso à aplicação; é redirecionado para a Tela 2 |
| RN-06 | A confirmação de cadastro ocorre exclusivamente via magic link (UUID) recebido por email |
| RN-07 | O magic link abre no browser; não há suporte a deeplink para PWA instalado |
| RN-08 | A confirmação de cadastro atualiza `status` para `ATIVO`, registra `confirmado_em` e preenche `token.usado_em = agora` |
| RN-09 | Token com `usado_em IS NOT NULL` ou `expira_em ≤ agora` é rejeitado; exibe estado de erro da Tela 2 |
| RN-10 | O intervalo mínimo de reenvio do email de confirmação de cadastro é de 5 minutos, calculado a partir de `ultimo_envio_em` |
| RN-11 | O reenvio gera novo `TokenConfirmacaoCadastro` (UUID), invalidando o anterior; atualiza `ultimo_envio_em`; nenhum outro dado é alterado |
| RN-12 | O email enviado no cadastro contém obrigatoriamente: o identificador (código para anotar) e o magic link com UUID |
| RN-13 | O identificador é exibido ao usuário na Tela 2 (para anotação) e na Tela 3 (com opção de copiar); também enviado por email |
| RN-14 | A política de senha exige: mínimo 8 caracteres, ao menos 1 maiúscula, ao menos 1 minúscula, ao menos 1 número (0–9), ao menos 1 caractere especial |
| RN-15 | O checklist de política de senha é exibido na Tela 1 abaixo do campo de senha e atualizado em tempo real conforme o usuário digita |
| RN-16 | O botão "Criar conta" pode ser acionado independentemente do estado do checklist; a validação da política é realizada no servidor |
| RN-17 | O link "Corrigir email" na Tela 2 redireciona para a tela de Perfil do Usuário; o status permanece `PENDENTE` e o novo email recebe reenvio do magic link |
| RN-18 | **Rate limiting:** todos os endpoints da API aplicam limite de **100 requisições por IP por minuto**. Ao ultrapassar o limite, o servidor retorna HTTP 429 com cabeçalho `Retry-After` indicando o tempo restante até renovação da janela |
| RN-19 | **Magic link com sessão ativa:** ao processar um magic link de confirmação, se houver sessão ativa de **outro usuário** no dispositivo, essa sessão é encerrada (via incremento de `token_versao` do outro usuário) e o usuário recém-confirmado é autenticado em seu lugar. Se a sessão ativa pertencer ao próprio usuário `PENDENTE`, a confirmação prossegue normalmente sem interrupção |
| RN-20 | **Cooldown para usuário `PENDENTE` que altera email:** o cooldown é controlado por `ultimo_envio_em` (campo de cadastro). O campo `ultimo_envio_email_pendente_em` **não é utilizado** para usuários `PENDENTE` — é reservado para usuários `ATIVO`/`EMAIL_PENDENTE` no fluxo de alteração de email confirmada |
| RN-21 | `token_versao` é inicializado em `1` no cadastro. Todo JWT emitido inclui `token_versao` no payload. O servidor rejeita requisições autenticadas cujo `token_versao` do JWT seja inferior ao valor atual em `Usuário.token_versao`, tratando-as como sessão inválida |
| RN-33 | O campo `nome` aceita no máximo **100 caracteres**. Valores acima do limite são rejeitados com mensagem de erro inline; o cadastro não é processado |
| RN-34 | O endereço de email é normalizado para **minúsculas** antes de ser persistido e antes de qualquer comparação de unicidade. Entradas mistas (ex.: `Usuario@EXEMPLO.com`) são tratadas como equivalentes ao email em minúsculas |
| RN-35 | O botão "Criar conta" entra em **estado de carregamento** (desabilitado, com indicador visual) imediatamente após o clique, enquanto a requisição ao servidor estiver em andamento. O botão retorna ao estado habilitado em caso de erro de validação do servidor |
| RN-36 | O endereço de email exibido na Tela 2 é **mascarado** (ex.: `j***@exemplo.com`), expondo apenas o primeiro caractere do nome local e o domínio completo. O mascaramento protege o endereço contra exposição em telas compartilhadas |
| RN-37 | O link "Corrigir email" é exibido na Tela 2 **somente para usuários com `status = PENDENTE`**. Usuários que chegam à Tela 2 por erro de token após já serem `ATIVO` não veem este link |
| RN-38 | A Tela 3 (Cadastro Confirmado) **não é acessível diretamente por URL**. Ela só pode ser exibida como resultado da confirmação bem-sucedida do magic link no mesmo fluxo. Tentativa de acesso direto à rota redireciona para a Tela de Login |

---

## 6. Requisitos de LGPD

| # | Regra |
|---|---|
| RN-22 | O campo `declaracao_maioridade_em` é preenchido com o timestamp do momento do cadastro, quando o usuário marca o checkbox declaratório. O cadastro não é processado sem a marcação do checkbox |
| RN-23 | O aviso de privacidade (texto + link para a Política de Privacidade) é exibido na Tela 1, antes do checkbox declaratório, identificando os dados coletados e a finalidade — conforme RN-PR14 de spec_privacidade_lgpd |

---

## 7. Requisitos de Acessibilidade (WCAG 2.2 / 2.0 AA)

As regras globais constam em `spec_privacidade_lgpd` (Seção 9). As regras abaixo são específicas deste fluxo.

| # | Regra |
|---|---|
| RN-24 | Os campos Nome, Email e Senha DEVEM ter labels associadas programaticamente (`for`/`id` ou equivalente nativo); placeholder não substitui label |
| RN-25 | O campo Nome DEVE declarar `autocomplete="name"`; o campo Email DEVE declarar `autocomplete="email"`; o campo Senha DEVE declarar `autocomplete="new-password"` |
| RN-26 | O checklist de requisitos de senha DEVE ser implementado como lista (`ul`/`li` ou equivalente) com cada item expondo seu estado de satisfação programaticamente. A região que contém o checklist DEVE usar `aria-live="polite"` para que atualizações em tempo real sejam anunciadas por leitores de tela sem interromper o usuário |
| RN-27 | Mensagens de erro inline (email duplicado, campo inválido) DEVEM usar `aria-invalid="true"` no campo correspondente e `aria-describedby` apontando para a mensagem de erro |
| RN-28 | O checkbox declaratório DEVE ser um elemento nativo `<input type="checkbox">` ou equivalente com `role="checkbox"` e `aria-checked`; deve ser operável por teclado (Espaço para marcar/desmarcar) |
| RN-29 | O ícone de envelope, ícone de alerta e ícone de sucesso nas Telas 2 e 3 são decorativos; DEVEM ser ocultados de tecnologias assistivas (`aria-hidden="true"`) — o estado é comunicado pelo texto do título adjacente |
| RN-30 | O código de identificador de 6 caracteres exibido na Tela 2 e Tela 3 DEVE ter `aria-label` com os caracteres separados por espaço (ex.: `aria-label="A 3 F 9 K X"`) para pronúncia correta por leitores de tela |
| RN-31 | O botão "Copiar" da Tela 3 DEVE anunciar o resultado da operação via live region ("Identificador copiado") imediatamente após a ação |
| RN-32 | O contador regressivo do cooldown de reenvio (MM:SS) DEVE atualizar a região via `aria-live="polite"`; a frequência de anúncio DEVE ser limitada (ex.: a cada 30 segundos ou apenas nos marcos de 60s, 30s, 10s), não a cada segundo |
