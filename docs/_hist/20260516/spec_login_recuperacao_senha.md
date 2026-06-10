# Especificação Funcional — Login e Recuperação de Senha

---

## 1. Visão Geral

Dois fluxos complementares acessíveis pela landing page da aplicação:

- **Login** — autenticação via email e senha, com sessão persistente via JWT; redireciona o usuário conforme seu `status` (`PENDENTE` → Tela de Confirmação de Email; `ATIVO` → Home da aplicação).
- **Recuperação de Senha** — redefine a senha via link temporário enviado por email; ao concluir, redireciona conforme `status` do usuário.

Ambos os fluxos reutilizam as entidades e regras de negócio da especificação de Cadastro de Usuários. Este documento é complementar a ela.

---

## 2. Entidades e Dados

### 2.1 Alterações na entidade Usuário

Nenhum campo novo é necessário na tabela de usuários.

### 2.2 Nova entidade: Token de Recuperação de Senha

| Campo | Tipo | Observações |
|---|---|---|
| `token` | String (UUID v4 ou equivalente seguro) | Chave primária; gerado a cada solicitação |
| `usuario_email` | String (FK) | Referência ao email do usuário |
| `criado_em` | Timestamp | Base para cálculo de expiração |
| `expira_em` | Timestamp | `criado_em` + 2 horas |
| `usado_em` | Timestamp \| null | Preenchido no momento do uso; null = não utilizado |

**Regras de ciclo de vida do token:**
- Um novo token invalida logicamente todos os tokens anteriores do mesmo usuário (verificar `usado_em IS NULL AND expira_em > agora` — só o token mais recente válido é aceito).
- Após uso bem-sucedido, `usado_em` é preenchido; o token não pode ser reutilizado.
- Tokens expirados ou já usados não são deletados automaticamente — podem ser mantidos para auditoria.

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
        │   (sem reenvio automático do identificador; usuário usa o botão "Reenviar email" já existente)
        │
        └── status = ATIVO → emite JWT (sessão persistente), redireciona para Home da aplicação
```

**Emissão do JWT:**
- Payload mínimo: `sub` (identificador do usuário), `email`, `iat`, `exp`.
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
  Email encontrado → gera token UUID, persiste com expira_em = agora + 2h
  Envia email com link: https://<domínio>/redefinir-senha?token=<UUID>
        │
        ▼
[Email recebido pelo usuário]
  Usuário clica no link
        │
        ▼
  Sistema valida o token:
    - token existe?
    - usado_em IS NULL?
    - expira_em > agora?
        │
        ├── INVÁLIDO ou EXPIRADO → exibe tela de erro com link para solicitar novo email
        │
        ▼
[Tela Redefinição de Senha]
  Usuário preenche: Nova senha + Confirmação de senha
  Checklist de requisitos validado em tempo real
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
  Marca token: usado_em = agora
        │
        ▼
  Verifica status do usuário
        │
        ├── PENDENTE → redireciona para Tela 2 de Confirmação de Email
        └── ATIVO    → redireciona para Home da aplicação (emite JWT)
```

---

## 4. Política de Senha

Aplicada nos dois contextos: **campo Senha do Cadastro** e **Tela de Redefinição de Senha**.

| Requisito | Regra |
|---|---|
| Comprimento mínimo | 8 caracteres |
| Letra maiúscula | Ao menos 1 (A–Z) |
| Letra minúscula | Ao menos 1 (a–z) |
| Caractere especial | Ao menos 1 (`!@#$%^&*()_+-=[]{}|;':",.<>?/~`) |

**Checklist de requisitos** — exibido abaixo do campo de senha, atualizado em tempo real conforme o usuário digita:

```
[ ] Mínimo de 8 caracteres
[ ] Ao menos uma letra maiúscula
[ ] Ao menos uma letra minúscula
[ ] Ao menos um caractere especial
```

Cada item muda de estado visual conforme o critério é atendido (ícone neutro → ícone de check com cor de sucesso). Na tela de redefinição, um item adicional é exibido ao preencher o segundo campo:

```
[ ] Senhas idênticas
```

A validação no servidor **replica exatamente** as mesmas regras — a validação client-side é apenas UX, não substitui a validação de backend.

---

## 5. Detalhamento Visual — Wireframe

### Tela L1 — Login

**Layout:** coluna central, largura máxima ~480px, verticalizado, responsivo. Acessível via link "Já tem conta? Entrar" do Cadastro ou diretamente pela landing page.

**Elementos (de cima para baixo):**

1. **Logotipo / nome da aplicação** — topo, centralizado
2. **Título:** "Entrar"
3. **Campo: Email**
   - Label acima
   - Placeholder: `seuemail@exemplo.com`
   - Validação inline: obrigatório, formato de email
4. **Campo: Senha**
   - Label acima
   - Input tipo `password` com toggle mostrar/ocultar
   - Sem checklist (checklist é exclusivo das telas de definição de senha)
5. **Link secundário:** "Esqueci a senha" — alinhado à direita, abaixo do campo de senha
6. **Botão primário:** "Entrar" — largura total do formulário
7. **Link secundário:** "Não tem conta? Criar conta" — abaixo do botão, centralizado

**Estados do botão:** Default → hover → loading (spinner inline) → erro (mensagem inline genérica)

**Mensagem de erro de credenciais:** exibida abaixo do botão (não inline por campo), texto: *"Email ou senha incorretos"*

---

### Tela L2 — Esqueci a Senha

**Layout:** coluna central, mesma largura.

**Elementos:**

1. **Ícone:** cadeado ou chave (outline)
2. **Título:** "Recuperar senha"
3. **Texto descritivo:** "Informe o email cadastrado. Se ele existir em nossa base, você receberá um link para redefinir sua senha."
4. **Campo: Email**
   - Label acima
   - Placeholder: `seuemail@exemplo.com`
   - Validação inline: obrigatório, formato
5. **Botão primário:** "Enviar link"
6. **Link:** "← Voltar ao login"

**Após submissão (sucesso ou email não encontrado — mesma resposta):**

Substitui o formulário por mensagem de confirmação:
- Ícone de envelope
- Texto: *"Se esse email estiver cadastrado, você receberá um link em instantes. Verifique também a pasta de spam."*
- Link: "← Voltar ao login"

---

### Tela L3 — Redefinição de Senha (acesso via link do email)

**Layout:** coluna central, mesma largura.

**Elementos:**

1. **Título:** "Criar nova senha"
2. **Campo: Nova senha**
   - Label acima
   - Input tipo `password` com toggle mostrar/ocultar
3. **Checklist de requisitos** — logo abaixo do campo, atualizado em tempo real:
   - `[ ]` Mínimo de 8 caracteres
   - `[ ]` Ao menos uma letra maiúscula
   - `[ ]` Ao menos uma letra minúscula
   - `[ ]` Ao menos um caractere especial
4. **Campo: Confirmar nova senha**
   - Label acima
   - Input tipo `password` com toggle mostrar/ocultar
5. **Item adicional do checklist** — aparece ao interagir com o segundo campo:
   - `[ ]` Senhas idênticas
6. **Botão primário:** "Redefinir senha" — habilitado somente quando todos os itens do checklist estão atendidos

**Estados de erro do botão (tentativa de submissão com validação backend falhando):**
- Mensagem genérica abaixo do botão

---

### Tela L4 — Token Inválido ou Expirado

**Layout:** coluna central, mesma largura. Exibida quando o link do email falha na validação.

**Elementos:**

1. **Ícone:** alerta ou relógio (outline)
2. **Título:** "Link inválido ou expirado"
3. **Texto:** "Este link de recuperação não é mais válido. Links expiram em 2 horas e só podem ser usados uma vez."
4. **Botão primário:** "Solicitar novo link" — redireciona para Tela L2

---

## 6. Regras de Negócio Consolidadas

| # | Regra |
|---|---|
| RN-L01 | A mensagem de erro de credenciais é sempre genérica: nunca revelar se o email existe ou se a senha está errada |
| RN-L02 | Usuário `PENDENTE` que faz login com credenciais válidas é redirecionado para a Tela 2 de Confirmação de Email; nenhum email é reenviado automaticamente |
| RN-L03 | Usuário `ATIVO` autenticado recebe JWT com sessão persistente |
| RN-L04 | A resposta ao formulário "Esqueci a senha" é sempre a mesma, independente de o email existir ou não |
| RN-L05 | O token de recuperação expira em 2 horas a partir de `criado_em` |
| RN-L06 | O token de recuperação é de uso único; após `usado_em` preenchido, não pode ser reutilizado |
| RN-L07 | Um novo token de recuperação gerado invalida logicamente os anteriores do mesmo usuário (apenas o mais recente não expirado e não usado é aceito) |
| RN-L08 | A política de senha exige: mínimo 8 caracteres, ao menos 1 maiúscula, ao menos 1 minúscula, ao menos 1 caractere especial |
| RN-L09 | O checklist de requisitos de senha é validado em tempo real no cliente; a validação de backend replica as mesmas regras |
| RN-L10 | O botão "Redefinir senha" permanece desabilitado enquanto qualquer item do checklist (incluindo senhas idênticas) não estiver atendido |
| RN-L11 | Após redefinição bem-sucedida, o usuário é redirecionado conforme seu `status`: `PENDENTE` → Tela 2 de Confirmação; `ATIVO` → Home da aplicação |
| RN-L12 | O link de redefinição de senha abre no browser; sem suporte a deeplink para PWA instalado |
| RN-L13 | O email de recuperação contém obrigatoriamente o link com o token e informação sobre prazo de expiração (2 horas) |

---

## 7. Observações de Segurança para Implementação

- **Rate limiting** no endpoint de login (ex.: bloqueio temporário após N tentativas falhas por IP/email) — evita brute force; parâmetros a definir no backend.
- **Rate limiting** no endpoint "Esqueci a senha" — evita abuso de envio de emails por IP.
- O token UUID deve ser gerado com fonte de entropia criptograficamente segura (`crypto.randomUUID()`, `secrets.token_urlsafe()` ou equivalente da stack adotada).
- O link de redefinição deve ser transmitido exclusivamente por HTTPS.
- Considerar invalidar todas as sessões JWT ativas do usuário após redefinição de senha bem-sucedida (decisão de implementação).
