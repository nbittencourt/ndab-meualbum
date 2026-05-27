# Especificação Funcional — Login e Recuperação de Senha

---

## Histórico de Revisões

| Versão | Data | Alterações |
|---|---|---|
| 1.0 | inicial | Versão original |
| 1.1 | revisão | `TokenRecuperacao.usuario_email` substituído por `usuario_identificador` (FK pela PK do usuário) |
| 1.2 | revisão | `TokenRecuperacao` renomeado para `TokenOperacao`; campos `tipo` e `email_novo` adicionados; `EMAIL_PENDENTE` incluído nos redirecionamentos pós-login (RN-L02, RN-L03) e pós-recuperação (RN-L11); requisito de número adicionado à política de senha (RN-L08); checklist da Tela L3 atualizado |
| 1.3 | red team | **C1** — troca de senha invalida todas as sessões ativas exceto a corrente, via incremento de `token_versao` (RN-L15). **C3** — rate limiting referenciado explicitamente nos endpoints sensíveis (RN-L16). **A3** — fluxo e regras de logout adicionados (seção 4, RN-L17, RN-L18) |
| 1.4 | LGPD + WCAG | Seção de banner de cookies adicionada (RN-L19) com referência a spec_privacidade_lgpd. Requisitos de acessibilidade adicionados (RN-L20 a RN-L26). |

---

## 1. Visão Geral

Dois fluxos complementares acessíveis pela landing page da aplicação:

- **Login** — autenticação via email e senha, com sessão persistente via JWT; redireciona o usuário conforme seu `status`.
- **Recuperação de Senha** — redefine a senha via link temporário enviado por email; ao concluir, redireciona conforme `status` do usuário.
- **Logout** — encerra a sessão ativa do usuário autenticado, invalidando todos os JWTs em circulação para aquele usuário.

Todos os fluxos reutilizam as entidades e regras de negócio da especificação de Cadastro de Usuários. Este documento é complementar a ela.

---

## 2. Entidades e Dados

### 2.1 Alterações na entidade Usuário

Nenhum campo novo é introduzido por este documento além dos já definidos em spec_cadastro_usuarios. O campo `token_versao` (definido em spec_cadastro_usuarios) é central para os mecanismos de logout e invalidação de sessão por troca de senha.

### 2.2 Entidade: TokenOperacao

Utilizada pelo fluxo de Recuperação de Senha e pelo fluxo de Alteração de Email (Perfil do Usuário).

| Campo | Tipo | Observações |
|---|---|---|
| `token` | String (UUID v4) | Chave primária; gerado a cada solicitação |
| `usuario_identificador` | String (FK → Usuário.identificador) | Referência ao identificador (PK) do usuário |
| `tipo` | Enum | `RECUPERACAO_SENHA` · `ALTERACAO_EMAIL` |
| `email_novo` | String \| null | Preenchido apenas quando `tipo = ALTERACAO_EMAIL`; `null` para `RECUPERACAO_SENHA` |
| `criado_em` | Timestamp | Base para cálculo de expiração |
| `expira_em` | Timestamp | `criado_em` + 2 horas |
| `usado_em` | Timestamp \| null | Preenchido no momento do uso; null = não utilizado |

**Regras de ciclo de vida do token:**
- Um novo token invalida logicamente todos os tokens anteriores do mesmo usuário e mesmo `tipo`.
- Após uso bem-sucedido, `usado_em` é preenchido; o token não pode ser reutilizado.
- Tokens expirados ou já usados não são deletados automaticamente.

---

## 3. Fluxo de Dados

### 3.1 Login

```
[Tela Login]
  Usuário preenche: email, senha
        │
        ▼
  Sistema valida campos (formato básico; campos obrigatórios)
        │
        ├── ERRO de validação local → mensagem inline, sem chamada ao servidor
        │
        ▼
  Sistema verifica credenciais:
    - email existe no cadastro?
    - hash da senha confere?
        │
        ├── INVÁLIDO (qualquer dos dois) → mensagem genérica "Email ou senha incorretos"
        │   (nunca indicar qual dos dois falhou — segurança)
        │
        ▼
  Credenciais válidas → verificar status do usuário
        │
        ├── status = PENDENTE → redireciona para Tela 2 de Confirmação de Email
        │   (sem reenvio automático; usuário usa o botão "Reenviar email" já existente)
        │
        └── status = ATIVO ou EMAIL_PENDENTE → emite JWT com token_versao atual,
                                               redireciona para Home da aplicação
```

**Emissão do JWT:**
- Payload mínimo: `sub` (identificador do usuário), `email`, `token_versao`, `iat`, `exp`.
- Sessão persistente: `exp` configurado para prazo longo (ex.: 30 dias); renovação automática via refresh token ou re-emissão transparente — decisão de implementação a ser definida no backend.
- Armazenamento: `HttpOnly cookie` (preferencial) ou `localStorage` — decisão de implementação.

### 3.2 Recuperação de Senha

```
[Tela Esqueci a Senha]
  Usuário informa o email cadastrado
        │
        ▼
  Sistema verifica se email existe
        │
        ├── Email não encontrado → exibe a MESMA mensagem de sucesso (não revelar existência de contas)
        │
        ▼
  Email encontrado → resolve usuario_identificador pelo email
  Gera token UUID, persiste com usuario_identificador, tipo = RECUPERACAO_SENHA, expira_em = agora + 2h
  Envia email com link: https://<domínio>/redefinir-senha?token=<UUID>
        │
        ▼
[Email recebido pelo usuário]
  Usuário clica no link
        │
        ▼
  Sistema valida o token:
    - token existe?
    - tipo = RECUPERACAO_SENHA?
    - usado_em IS NULL?
    - expira_em > agora?
        │
        ├── INVÁLIDO ou EXPIRADO → exibe tela de erro com link para solicitar novo email
        │
        ▼
[Tela Redefinição de Senha]
  Usuário preenche: Nova senha + Confirmação de senha
        │
        ▼
  Sistema valida:
    - as duas senhas são idênticas?
    - política de senha atendida?
        │
        ├── INVÁLIDO → mensagem inline; token ainda não consumido
        │
        ▼
  Atualiza hash da senha no cadastro do usuário
  Incrementa token_versao do usuário em +1 (invalida todas as sessões exceto a corrente)
  Marca token: usado_em = agora
  Emite novo JWT com token_versao atualizado para a sessão corrente
        │
        ▼
  Verifica status do usuário
        │
        ├── PENDENTE → redireciona para Tela 2 de Confirmação de Email
        └── ATIVO ou EMAIL_PENDENTE → redireciona para Home da aplicação
```

---

## 4. Logout

### 4.1 Fluxo

```
[Usuário aciona logout — disponível no header global da aplicação]
        │
        ▼
  Sistema incrementa Usuário.token_versao em +1
  Sistema encerra a sessão corrente (remove cookie HttpOnly / invalida token client-side)
        │
        ▼
  Redireciona para a página inicial (landing page / tela de Login)
```

> O incremento de `token_versao` invalida **todos** os JWTs previamente emitidos para o usuário, incluindo sessões abertas em outros dispositivos. Não há logout seletivo por dispositivo.

### 4.2 Contexto de uso do token_versao

| Evento | Ação sobre token_versao | Efeito |
|---|---|---|
| Cadastro | Inicializado em `1` | — |
| Login | Não alterado | Sessão emitida com versão atual |
| Logout | Incrementado em +1 | Todos os JWTs anteriores tornam-se inválidos |
| Troca de senha (Perfil) | Incrementado em +1 | Todas as sessões exceto a corrente tornam-se inválidas; novo JWT emitido para a sessão corrente |
| Troca de senha (Recuperação) | Incrementado em +1 | Todas as sessões tornam-se inválidas; novo JWT emitido ao final do fluxo |

---

## 5. Política de Senha

Aplicada nos dois contextos: **campo Senha do Cadastro** e **Tela de Redefinição de Senha**.

| Requisito | Regra |
|---|---|
| Comprimento mínimo | 8 caracteres |
| Letra maiúscula | Ao menos 1 (A–Z) |
| Letra minúscula | Ao menos 1 (a–z) |
| Número | Ao menos 1 (0–9) |
| Caractere especial | Ao menos 1 (`!@#$%^&*()_+-=[]{}|;':",.<>?/~`) |

**Checklist de requisitos** — exibido abaixo do campo de senha, atualizado em tempo real:

```
[ ] Mínimo de 8 caracteres
[ ] Ao menos uma letra maiúscula
[ ] Ao menos uma letra minúscula
[ ] Ao menos um número
[ ] Ao menos um caractere especial
```

Na tela de redefinição, item adicional exibido ao preencher o segundo campo:

```
[ ] Senhas idênticas
```

A validação no servidor **replica exatamente** as mesmas regras — a validação client-side é apenas UX.

---

## 6. Detalhamento Visual — Wireframe

### Tela L1 — Login

**Layout:** coluna central, largura máxima ~480px, verticalizado, responsivo.

**Elementos (de cima para baixo):**

1. Logotipo / nome da aplicação
2. Título: "Entrar"
3. Campo: Email (label acima, placeholder `seuemail@exemplo.com`, validação inline)
4. Campo: Senha (label acima, password com toggle mostrar/ocultar)
5. Link secundário: "Esqueci a senha" — alinhado à direita, abaixo do campo de senha
6. Botão primário: "Entrar" — largura total do formulário
7. Link secundário: "Não tem conta? Criar conta"

**Mensagem de erro de credenciais:** exibida abaixo do botão: *"Email ou senha incorretos"*

---

### Tela L2 — Esqueci a Senha

**Elementos:**

1. Ícone: cadeado ou chave (outline)
2. Título: "Recuperar senha"
3. Texto: "Informe o email cadastrado. Se ele existir em nossa base, você receberá um link para redefinir sua senha."
4. Campo: Email
5. Botão primário: "Enviar link"
6. Link: "← Voltar ao login"

**Após submissão (sucesso ou email não encontrado — mesma resposta):**

- Ícone de envelope
- Texto: *"Se esse email estiver cadastrado, você receberá um link em instantes. Verifique também a pasta de spam."*
- Link: "← Voltar ao login"

---

### Tela L3 — Redefinição de Senha

**Elementos:**

1. Título: "Criar nova senha"
2. Campo: Nova senha (password com toggle)
3. Checklist de requisitos (tempo real)
4. Campo: Confirmar nova senha (password com toggle)
5. Item adicional do checklist: `[ ]` Senhas idênticas (aparece ao interagir com o segundo campo)
6. Botão primário: "Redefinir senha" — habilitado somente quando todos os itens do checklist estão atendidos

---

### Tela L4 — Token Inválido ou Expirado

**Elementos:**

1. Ícone: alerta ou relógio (outline)
2. Título: "Link inválido ou expirado"
3. Texto: "Este link de recuperação não é mais válido. Links expiram em 2 horas e só podem ser usados uma vez."
4. Botão primário: "Solicitar novo link" — redireciona para Tela L2

---

## 7. Regras de Negócio Consolidadas

| # | Regra |
|---|---|
| RN-L01 | A mensagem de erro de credenciais é sempre genérica: nunca revelar se o email existe ou se a senha está errada |
| RN-L02 | Usuário `PENDENTE` que faz login com credenciais válidas é redirecionado para a Tela 2 de Confirmação de Email; nenhum email é reenviado automaticamente |
| RN-L03 | Usuário `ATIVO` ou `EMAIL_PENDENTE` autenticado recebe JWT com `token_versao` atual e é redirecionado para a Home |
| RN-L04 | A resposta ao formulário "Esqueci a senha" é sempre a mesma, independente de o email existir ou não |
| RN-L05 | O token de recuperação expira em 2 horas a partir de `criado_em` |
| RN-L06 | O token de recuperação é de uso único; após `usado_em` preenchido, não pode ser reutilizado |
| RN-L07 | Um novo token de recuperação gerado invalida logicamente os anteriores do mesmo usuário e mesmo `tipo` |
| RN-L08 | A política de senha exige: mínimo 8 caracteres, ao menos 1 maiúscula, ao menos 1 minúscula, ao menos 1 número (0–9), ao menos 1 caractere especial |
| RN-L09 | O checklist de requisitos de senha é validado em tempo real no cliente; a validação de backend replica as mesmas regras |
| RN-L10 | O botão "Redefinir senha" permanece desabilitado enquanto qualquer item do checklist (incluindo senhas idênticas) não estiver atendido |
| RN-L11 | Após redefinição bem-sucedida, o usuário é redirecionado conforme seu `status`: `PENDENTE` → Tela 2 de Confirmação; `ATIVO` ou `EMAIL_PENDENTE` → Home |
| RN-L12 | O link de redefinição de senha abre no browser; sem suporte a deeplink para PWA instalado |
| RN-L13 | O email de recuperação contém obrigatoriamente o link com o token e informação sobre prazo de expiração (2 horas) |
| RN-L14 | O token de recuperação referencia o usuário via `usuario_identificador` (FK → `Usuário.identificador`), não pelo email |
| RN-L15 | **Invalidação de sessões na troca de senha por recuperação:** após redefinição bem-sucedida, `Usuário.token_versao` é incrementado em +1. Todos os JWTs previamente emitidos tornam-se inválidos. Um novo JWT com o `token_versao` atualizado é emitido para a sessão corrente do fluxo de recuperação |
| RN-L16 | **Rate limiting:** todos os endpoints aplicam o limite global de 100 requisições por IP por minuto definido em RN-18 de spec_cadastro_usuarios. Os endpoints de login e "esqueci a senha" são particularmente sensíveis a abuso; parâmetros adicionais de throttling (ex.: bloqueio por email após N tentativas falhas) são decisão de implementação do backend |
| RN-L17 | **Logout:** ao acionar logout, `Usuário.token_versao` é incrementado em +1, invalidando todos os JWTs emitidos anteriormente para aquele usuário em qualquer dispositivo. A sessão corrente é encerrada (cookie removido / token descartado client-side) |
| RN-L18 | **Redirecionamento pós-logout:** após o logout, o usuário é redirecionado para a página inicial da aplicação (landing page / tela de Login). Não há confirmação prévia de logout |

---

## 9. Banner de Consentimento de Cookies

O banner de consentimento de cookies é exibido na **Tela L1 (Login)** quando o visitante não possui consentimento válido registrado (cookie `consent_id` ausente, expirado ou de versão anterior da política). O comportamento completo, as categorias de cookies, as regras de negócio e as entidades de dados são definidos em `spec_privacidade_lgpd`, Seção 5.

O banner é exibido sobreposto ou imediatamente acima da tela de Login, **antes** de qualquer interação com o formulário. O formulário de login permanece visível mas o usuário pode optar por interagir com o banner ou com o formulário — a escolha de cookies não bloqueia o login.

O mesmo comportamento se aplica ao acesso direto às telas L2, L3 e L4 via URL, caso o usuário as acesse sem consentimento registrado.

---

## 10. Requisitos de LGPD

| # | Regra |
|---|---|
| RN-L19 | A Tela L1 exibe o banner de consentimento de cookies conforme spec_privacidade_lgpd RN-PR05 quando não há consentimento válido. O banner não bloqueia o login, mas deve ser resolvido para que cookies não-essenciais sejam ativados |

---

## 11. Requisitos de Acessibilidade (WCAG 2.2 / 2.0 AA)

As regras globais constam em `spec_privacidade_lgpd` (Seção 9). As regras abaixo são específicas deste fluxo.

| # | Regra |
|---|---|
| RN-L20 | Os campos Email e Senha da Tela L1 DEVEM ter `autocomplete="email"` e `autocomplete="current-password"`, respectivamente; campo Nova Senha em L3 usa `autocomplete="new-password"` |
| RN-L21 | A mensagem de erro "Email ou senha incorretos" DEVE ser anunciada via `role="alert"` ou `aria-live="assertive"` ao ser injetada na página após submissão, para ser lida imediatamente por leitores de tela |
| RN-L22 | O link "Esqueci a senha" DEVE ter texto ou `aria-label` que descreva seu propósito fora do contexto do botão de login (ex.: "Recuperar senha esquecida") |
| RN-L23 | O botão "Redefinir senha" da Tela L3 — que é habilitado condicionalmente — DEVE comunicar seu estado `disabled`/`enabled` programaticamente; quando desabilitado, DEVE permanecer focável com explicação via `aria-describedby` de por que está inativo |
| RN-L24 | O checklist da Tela L3 segue a mesma regra RN-26 de spec_cadastro_usuarios (aria-live no contêiner do checklist) |
| RN-L25 | A Tela L4 (link expirado) DEVE ter o ícone de alerta ocultado de TA (`aria-hidden="true"`) e o estado comunicado pelo título da tela |
| RN-L26 | O link "← Voltar ao login" DEVE ter texto descritivo do destino; o caractere "←" DEVE ser ocultado de leitores de tela (`aria-hidden="true"`) para evitar leitura desnecessária do símbolo |

---

## 8. Observações de Segurança para Implementação

- **Rate limiting** no endpoint de login (ex.: bloqueio temporário após N tentativas falhas por IP/email) — evita brute force; parâmetros a definir no backend.
- **Rate limiting** no endpoint "Esqueci a senha" — evita abuso de envio de emails por IP.
- O token UUID deve ser gerado com fonte de entropia criptograficamente segura (`crypto.randomUUID()`, `secrets.token_urlsafe()` ou equivalente da stack adotada).
- O link de redefinição deve ser transmitido exclusivamente por HTTPS.
- O mecanismo de `token_versao` requer que **toda** requisição autenticada valide esse campo contra o banco de dados; o overhead de uma leitura adicional por requisição é inerente ao design.
