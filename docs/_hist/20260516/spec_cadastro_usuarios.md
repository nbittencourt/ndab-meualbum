# Especificação Funcional — Cadastro de Usuários

---

## 1. Visão Geral

Fluxo de cadastro para aplicação web responsiva (PWA-ready) composto por três etapas sequenciais: **Registro → Confirmação de Email → Acesso à Aplicação**. Cada usuário recebe um identificador alfanumérico público de 6 caracteres gerado no momento do cadastro.

---

## 2. Entidades e Dados

### 2.1 Usuário

| Campo | Tipo | Observações |
|---|---|---|
| `identificador` | String (6 chars) | **Chave primária.** Alfanumérico maiúsculo, aleatório, único. Serve simultaneamente como identificador público e como token de confirmação de email |
| `nome` | String | Nome completo |
| `email` | String | Único no sistema |
| `senha` | String (hash) | Armazenada como hash via algoritmo moderno (bcrypt, Argon2id ou scrypt); salt gerenciado internamente pelo algoritmo |
| `status` | Enum | `PENDENTE` · `ATIVO` |
| `criado_em` | Timestamp | Data/hora do cadastro; base para controle do intervalo de reenvio |
| `confirmado_em` | Timestamp | Data/hora da confirmação do email |

> **Nota:** O `identificador` é gerado no cadastro, enviado por email (como código e como parâmetro do link mágico), e digitado pelo usuário na confirmação. Confirmar o email **é** informar o próprio identificador. Não há entidade separada de token.

---

## 3. Fluxo de Dados

```
[Tela 1: Cadastro]
  Usuário preenche: nome, email, senha
        │
        ▼
  Sistema valida campos (formato, unicidade do email)
        │
        ├── ERRO → Exibe mensagem inline, permanece na Tela 1
        │
        ▼
  Sistema gera identificador (6 chars alfanumérico maiúsculo, único)
  Persiste usuário com status = PENDENTE
        │
        ▼
  Sistema envia email com:
    - identificador do usuário (como código a digitar)
    - link mágico (URL com identificador como parâmetro)
        │
        ▼
[Tela 2: Confirmação de Email]
  Usuário aguarda — duas vias de confirmação:

  VIA A: digita o identificador manualmente
  VIA B: clica no link mágico (abre no browser com identificador como parâmetro)
        │
        ▼
  Sistema valida:
    - identificador existe no sistema
    - status do usuário vinculado = PENDENTE
        │
        ├── INVÁLIDO → Mensagem de erro, opção de reenvio disponível
        │
        ▼
  Atualiza usuário: status = ATIVO, confirmado_em = agora
        │
        ▼
[Tela 3: Sucesso / Acesso à Aplicação]
  Usuário autenticado e redirecionado para a aplicação
```

### 3.1 Regra de Reenvio

- O usuário pode solicitar reenvio a partir da Tela 2
- Intervalo mínimo entre envios: **5 minutos**, calculado a partir do `criado_em` do usuário
- Reenvio reenvia o mesmo identificador já gerado — nenhum dado novo é gerado
- O botão de reenvio exibe um contador regressivo enquanto o intervalo não se esgota

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
   - Validação inline: obrigatório
4. **Campo: Email**
   - Label acima do campo
   - Placeholder: "seuemail@exemplo.com"
   - Validação inline: formato de email, unicidade (retorno do servidor)
5. **Campo: Senha**
   - Label acima do campo
   - Input tipo password com toggle mostrar/ocultar
   - Indicador visual de força da senha (fraca / média / forte) — opcional mas recomendado
6. **Botão primário: "Criar conta"** — largura total do formulário
7. **Link secundário:** "Já tem conta? Entrar" — abaixo do botão, centralizado

**Estados do botão:**
- Default → hover → loading (spinner inline) → erro (shake + mensagem)

**Mensagens de erro inline:**
- Aparecem abaixo do campo correspondente
- Email já cadastrado: "Este email já está em uso"
- Campos vazios: "Campo obrigatório"

---

### Tela 2 — Confirmação de Email

**Layout:** coluna central, mesma largura da Tela 1.

**Elementos:**

1. **Ícone:** envelope (ilustração simples ou ícone outline)
2. **Título:** "Confirme seu email"
3. **Texto descritivo:** "Enviamos seu identificador para **[email mascarado]**. Insira-o abaixo ou clique no link que enviamos."
   - Email mascarado: ex. `n***@gmail.com`
4. **Campo de código:** 6 inputs individuais dispostos em linha (um por caractere), foco automático com avanço entre campos
   - Aceita letras e números; converte para maiúsculas automaticamente
   - Suporte a colar (paste) — distribui automaticamente pelos campos
5. **Botão primário: "Confirmar"**
6. **Área de reenvio:**
   - Enquanto em cooldown: "Reenviar em **MM:SS**" (texto, sem botão clicável)
   - Após cooldown: link/botão "Reenviar email"
7. **Mensagem de feedback de reenvio:** "Email reenviado" — aparece temporariamente após ação

**Estados de validação do código:**
- Campos em loading após submissão
- Erro: campos ficam em estado de erro com mensagem "Identificador inválido"
- Sucesso: transição para Tela 3

---

### Tela 3 — Cadastro Confirmado

**Layout:** coluna central, mesma estrutura.

**Elementos:**

1. **Ícone de sucesso** (checkmark ou similar)
2. **Título:** "Tudo certo!"
3. **Texto:** "Sua conta foi criada. Seu identificador é:"
4. **Identificador em destaque:** bloco tipográfico grande com o código de 6 caracteres (ex: `A3F9KX`) — com opção de copiar para área de transferência
5. **Texto auxiliar:** "Guarde este identificador — ele é público e pode ser usado para identificá-lo na plataforma."
6. **Botão primário: "Acessar a aplicação"** — redireciona para o interior da aplicação

---

## 5. Regras de Negócio Consolidadas

| # | Regra |
|---|---|
| RN-01 | O `identificador` é a chave primária do usuário — único no sistema, gerado no cadastro, imutável |
| RN-02 | O `identificador` serve simultaneamente como identificador público e como token de confirmação de email |
| RN-03 | O charset é restrito a letras maiúsculas e dígitos, excluindo caracteres ambíguos: `O`, `0`, `I`, `1`, `L` |
| RN-04 | Entradas do usuário são convertidas para maiúsculas antes da validação |
| RN-05 | Enquanto `status = PENDENTE`, o usuário não tem acesso à aplicação |
| RN-06 | O link mágico e a digitação manual do identificador são equivalentes |
| RN-07 | O link mágico abre no browser; não há suporte a deeplink para PWA instalado |
| RN-08 | A confirmação atualiza `status` para `ATIVO` e registra `confirmado_em` |
| RN-09 | Um `identificador` com `status = ATIVO` não pode ser usado novamente para confirmação |
| RN-10 | O intervalo mínimo de reenvio é de 5 minutos, calculado a partir de `criado_em` |
| RN-11 | O reenvio não altera nenhum dado — reenvia o mesmo email com o mesmo identificador |
| RN-12 | O email enviado contém obrigatoriamente: o identificador (como código) e o link mágico |
| RN-13 | O identificador é exibido ao usuário na Tela 3 e também enviado por email |
