# Especificação Funcional — Cadastro de Álbum

> **Dependências:** Especificação de Cadastro de Usuários · Especificação de Login e Recuperação de Senha · Especificação da Home (Álbuns)
> **Fluxos referenciados mas fora do escopo:** Colar Figurinhas

---

## Histórico de Revisões

| Versão | Data | Alterações |
|---|---|---|
| 1.0 | inicial | Versão original |
| 1.1 | revisão | Botões "Criar álbum" e "Cancelar" reorganizados em linha horizontal |
| 1.2 | revisão | RN-CA01 atualizado: acesso permitido também para `EMAIL_PENDENTE` |
| 1.3 | red team | **B2** — `variante` passa a ser obrigatório no modelo; campo `nome_personalizado` recebe constraint de sanitização (B5). RN-CA03 e RN-CA06 atualizados |

---

## 1. Visão Geral

Fluxo de criação de um novo álbum para o usuário autenticado. Acessado a partir da Home via botão "+ Novo álbum" ou via CTA do estado vazio.

O fluxo é composto por uma única tela de formulário (**Tela CA1**) seguida de um diálogo de ação pós-criação (**Diálogo CA2**), exibido condicionalmente quando o usuário possui figurinhas no estoque.

---

## 2. Entidades e Dados

As entidades `Álbum`, `TipoAlbum`, `EstoqueFigurinha` e `Figurinha` são definidas em spec_home_albums. Nenhuma entidade nova é introduzida neste fluxo.

Campos do registro `Álbum` preenchidos por este fluxo:

| Campo | Origem |
|---|---|
| `usuario_id` | Sessão autenticada (JWT) |
| `tipo_album_id` | Seleção do usuário na Tela CA1 |
| `variante` | Seleção do usuário na Tela CA1. **Obrigatório; não admite nulo** |
| `nome_personalizado` | Entrada opcional do usuário; `null` se não preenchido |
| `criado_em` | Gerado pelo sistema no momento da persistência |

---

## 3. Fluxo de Dados

```
[Home — botão "+ Novo álbum" ou CTA do estado vazio]
        │
        ▼
[Tela CA1 — Formulário de Cadastro]
  Campos: tipo de álbum (pré-selecionado), variante, nome personalizado (opcional)
        │
        ▼
  Sistema valida campos obrigatórios (tipo e variante)
        │
        ├── ERRO → mensagem inline; permanece na Tela CA1
        │
        ▼
  Sistema persiste o registro Álbum
        │
        ▼
  Sistema verifica: usuário possui ao menos 1 figurinha no estoque (quantidade ≥ 1)?
        │
        ├── NÃO → redireciona para a Home
        │
        ▼
[Diálogo CA2 — Proposta de Colagem]
  "Você tem figurinhas no seu acervo. Deseja colar agora no álbum recém-criado?"
        │
        ├── "Agora não" → redireciona para a Home
        └── "Colar figurinhas" → redireciona para Colar Figurinhas com álbum recém-criado
```

---

## 4. Tela CA1 — Formulário de Cadastro

### 4.1 Elementos (de cima para baixo)

1. **Título:** "Novo álbum"
2. **Campo: Tipo de álbum**
   - Pré-selecionado e desabilitado enquanto há apenas 1 tipo no catálogo
   - Ao selecionar, exibe o bloco de detalhes do tipo (4.2)
3. **Bloco de detalhes do tipo** — ver 4.2
4. **Campo: Variante**
   - Seleção entre: `BROCHURA`, `CAPA_DURA`, `CAPA_DURA_PRATA`, `CAPA_DURA_OURO`, `BOX_PREMIUM`
   - Exibe nome por extenso e preço de lançamento correspondente
   - **Obrigatório; sem pré-seleção no formulário** (o campo é obrigatório no modelo com default `BROCHURA`, mas o formulário exige seleção explícita do usuário antes de habilitar o botão "Criar álbum")
   - Ao selecionar: visual da tela atualizado conforme identidade da variante (RN-CA05)
5. **Campo: Nome personalizado** *(opcional)*
   - Label com indicação "(opcional)"
   - Placeholder: "Ex.: Meu álbum principal"
   - Campo de texto livre; sanitizado (RN-CA06)
6. **Linha de ações** (lado a lado, largura total do formulário):
   - Botão secundário "Cancelar" (metade esquerda)
   - Botão primário "Criar álbum" (metade direita)

### 4.2 Bloco de detalhes do tipo

Somente leitura. Exibido quando um tipo está selecionado:
- Nome completo da edição (ex.: "Copa do Mundo 2026 — Panini")
- Total de figurinhas (`TipoAlbum.total_figurinhas`, ex.: "980 figurinhas")

### 4.3 Estados do botão "Criar álbum"

- **Desabilitado:** enquanto o campo `variante` não estiver selecionado
- **Habilitado:** após seleção de variante
- **Loading:** spinner inline durante a requisição; botão "Cancelar" desabilitado durante loading
- **Erro:** mensagem genérica abaixo da linha de ações em caso de falha no servidor

---

## 5. Diálogo CA2 — Proposta de Colagem

Exibido após persistência bem-sucedida, condicionado à existência de figurinhas no estoque.

**Elementos:**

1. Título: "Álbum criado!"
2. Texto: "Você tem figurinhas no seu acervo. Deseja colar agora no álbum recém-criado?"
3. Botão primário: "Colar figurinhas"
4. Botão secundário: "Agora não"

Modal bloqueante.

---

## 6. Regras de Negócio Consolidadas

| # | Regra |
|---|---|
| RN-CA01 | Apenas usuários com `status = ATIVO` ou `EMAIL_PENDENTE` acessam o fluxo; `PENDENTE` é redirecionado para a Tela 2 de Confirmação de Email |
| RN-CA02 | O campo `tipo_album_id` é obrigatório; com apenas 1 tipo no catálogo, é pré-selecionado e desabilitado |
| RN-CA03 | O campo `variante` é obrigatório no modelo de dados (sem nulo; default `BROCHURA`). O formulário não pré-seleciona nenhuma opção — o botão "Criar álbum" permanece desabilitado até que o usuário selecione explicitamente uma variante |
| RN-CA04 | O preço exibido por variante é informacional e reflete o valor de lançamento; não é armazenado no registro `Álbum` |
| RN-CA05 | Ao selecionar uma variante, o visual da tela é atualizado para refletir a identidade visual daquela variante, conforme especificado no protótipo da solução |
| RN-CA06 | O campo `nome_personalizado` é opcional; quando preenchido: comprimento máximo de 60 caracteres e conteúdo restrito a caracteres visíveis textuais livres (sem caracteres de controle, tags HTML ou sequências de escape); o sistema sanitiza a entrada antes de persistir |
| RN-CA07 | Um usuário pode possuir múltiplos álbuns do mesmo `tipo_album_id` e da mesma `variante`; não há restrição de unicidade por essas dimensões |
| RN-CA08 | Após persistência bem-sucedida, o sistema verifica se o usuário possui ao menos 1 figurinha no estoque; se não houver, redireciona para a Home sem exibir o Diálogo CA2 |
| RN-CA09 | O Diálogo CA2 é exibido apenas uma vez, imediatamente após a criação; não é reapresentado em acessos posteriores |
| RN-CA10 | "Agora não" no Diálogo CA2 → redireciona para a Home; o álbum já foi criado |
| RN-CA11 | "Colar figurinhas" no Diálogo CA2 → redireciona para Colar Figurinhas com o álbum recém-criado pré-selecionado |
| RN-CA12 | "Cancelar" no formulário → nenhum dado é persistido; retorna à Home |
| RN-CA13 | O bloco de detalhes do tipo é somente leitura e preenchido automaticamente pelo sistema |

---

## 7. Estados de Erro

| Situação | Comportamento |
|---|---|
| Falha de servidor ao persistir o álbum | Mensagem de erro genérica abaixo da linha de ações; formulário permanece preenchido |
| Sessão expirada (JWT inválido ou `token_versao` divergente) | Redireciona automaticamente para a tela de Login |

---

## 8. Fluxos Relacionados (fora do escopo desta spec)

| Fluxo | Gatilho nesta spec |
|---|---|
| **Colar Figurinhas** | Botão "Colar figurinhas" no Diálogo CA2 |
| **Home** | Botão "Cancelar" na Tela CA1 · "Agora não" no Diálogo CA2 · Redirecionamento após criação sem estoque |
