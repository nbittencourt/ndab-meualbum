# Especificação Funcional — Privacidade, Proteção de Dados e Acessibilidade Global

> **Escopo:** Aplicável a todos os fluxos da plataforma. Esta spec define o framework de conformidade com LGPD (Lei 13.709/2018) e WCAG 2.2 (mínimo 2.0 AA). Todas as outras specs herdam as regras aqui definidas.
> **Dependências:** Especificação de Cadastro de Usuários · Especificação de Login · Especificação de Perfil do Usuário

---

## Histórico de Revisões

| Versão | Data | Alterações |
|---|---|---|
| 1.0 | inicial | Versão original — framework de privacidade e acessibilidade |
| 1.1 | 2026-06-06 | Banner simplificado para modelo binário (Aceitar / Remover não essenciais); removido painel "Gerenciar preferências"; removido link "Gerenciar cookies" do rodapé e do Perfil; reescritas RN-PR05/06/07/12; RN-PR16 atualizada; §5.4/§5.5 atualizados; §8.1 / §8.4 revisados |

---

## 1. Visão Geral

Esta especificação governa:
- **Restrição de idade** — cadastro restrito a maiores de 18 anos
- **Consentimento de cookies** — banner de consentimento por categoria, com base legal por tratamento
- **Aviso de privacidade** — obrigações de transparência nos pontos de coleta
- **Política de privacidade** — conteúdo mínimo e acessibilidade do documento
- **Exercício de direitos dos titulares** — portabilidade, acesso e demais direitos do Art. 18 LGPD
- **Requisitos globais de acessibilidade** — regras WCAG 2.2 / 2.0 AA aplicáveis a todos os componentes

---

## 2. Classificação de Dados e Bases Legais

A LGPD aplica-se integralmente a este sistema (cenário B2C, titulares no Brasil, tratamento no território nacional).

### 2.1 Mapeamento de dados por finalidade e base legal

| Dado | Categoria LGPD | Finalidade | Base Legal | Observação |
|---|---|---|---|---|
| Nome completo | C1 — comum | Identificação na plataforma | BL-05 — execução de contrato | Obrigatório para uso do serviço |
| Endereço de email | C1 — comum | Autenticação, comunicações transacionais | BL-05 — execução de contrato | Obrigatório |
| Hash de senha | C1 — comum | Autenticação | BL-05 — execução de contrato | Nunca armazenado em claro |
| Identificador (6 chars) | C1 — comum | Identificação pública na plataforma | BL-05 — execução de contrato | Gerado internamente; imutável |
| Dados de álbum (tipo, variante, nome personalizado) | C1 — comum | Prestação do serviço principal | BL-05 — execução de contrato | |
| Figurinhas (estoque, colagens, pilha) | C1 — comum | Prestação do serviço principal | BL-05 — execução de contrato | |
| Tokens de operação (confirmação, recuperação, alteração) | C1 — comum | Segurança e autenticação | BL-05 — execução de contrato | |
| Timestamps de criação e ação | C1 — comum | Integridade e rastreabilidade do serviço | BL-05 — execução de contrato | |
| Logs de autenticação e operações | C1 — comum | Segurança, detecção de fraude, auditoria | BL-09 — legítimo interesse | Exige LIA documentado |
| Dados de uso e navegação (analytics) | C1 — comum | Melhoria da experiência, tratamento de erros | BL-09 — legítimo interesse | Exige LIA; opt-out disponível |
| Cookies de publicidade e perfil de interesse | C1 — comum | Publicidade direcionada | BL-01 — consentimento | Opt-in explícito obrigatório |
| Declaração de maioridade (timestamp) | C1 — comum | Conformidade com restrição de idade | BL-05 — execução de contrato | Registrado no ato do cadastro |
| Registro de consentimento de cookies | C1 — comum | Comprovação de consentimento (Art. 8º) | BL-02 — obrigação legal | Retido por 5 anos |

**Nota:** O sistema não coleta dados sensíveis (C2) nem dados de menores de 18 anos (C3). A declaração de maioridade é condição de acesso ao cadastro.

### 2.2 Avaliação de Legítimo Interesse (BL-09) — síntese obrigatória

Para os tratamentos baseados em BL-09 (analytics e logs de segurança), o controlador DEVE elaborar e manter atualizado o LIA (Legitimate Interest Assessment) conforme R-BAS-004 do guia LGPD, contemplando:
1. Interesse legítimo concreto (melhoria do serviço, prevenção a fraude)
2. Necessidade e proporcionalidade (dados mínimos para a finalidade)
3. Balanceamento com expectativas razoáveis do titular
4. Salvaguardas: minimização de coleta, opt-out disponível, retenção limitada

---

## 3. Política de Retenção de Dados

| Categoria | Prazo de retenção | Critério de início | Destino ao fim |
|---|---|---|---|
| Dados de conta ativa (usuário, álbuns, figurinhas) | Enquanto a conta estiver ativa | — | Hard delete mediante exclusão de conta |
| Dados de conta excluída | 0 dias adicionais após exclusão | Data da exclusão | Purga imediata conforme RN-P26 (decisão consciente de risco) |
| Logs de autenticação e operações de segurança | 6 meses | Data do evento | Eliminação automatizada |
| Registros de consentimento de cookies | 5 anos | Data da revogação ou expiração | Eliminação automatizada |
| Tokens expirados não utilizados (TokenConfirmacaoCadastro, TokenOperacao) | 90 dias após expiração | Data de expiração do token | Eliminação por rotina de limpeza |
| Dados exportados pelo usuário (arquivo) | Responsabilidade do titular após download | — | Não gerenciado pelo sistema após entrega |

**RN-PR01 (DEVE):** O controlador DEVE implementar rotina automatizada de purga para tokens expirados (retidos por 90 dias) e logs de autenticação (retidos por 6 meses), com registro do que foi eliminado e quando.

---

## 4. Restrição de Idade

### 4.1 Contexto

O sistema é restrito a pessoas com **18 anos ou mais** (maiores de idade em todo o território brasileiro). Menores não podem criar conta.

### 4.2 Implementação — Tela de Cadastro

Na Tela 1 de Cadastro de Usuários, **abaixo do campo de senha e acima do botão "Criar conta"**, adicionar:

- **Checkbox declaratório obrigatório:** `[ ] Tenho 18 anos ou mais, li e concordo com os [Termos de Uso] e a [Política de Privacidade].`
  - "Termos de Uso" e "Política de Privacidade" são links que abrem o documento em nova aba ou modal
  - O checkbox inicia desmarcado
  - O botão "Criar conta" permanece desabilitado enquanto o checkbox estiver desmarcado

- **Registro no sistema:** no momento do cadastro, o sistema persiste o timestamp da declaração de maioridade junto ao registro do usuário (campo `declaracao_maioridade_em` — ver seção 4.3).

### 4.3 Alteração na entidade Usuário

Campo adicionado:

| Campo | Tipo | Observações |
|---|---|---|
| `declaracao_maioridade_em` | Timestamp | Preenchido no momento do cadastro com a data/hora da marcação do checkbox declaratório. Não pode ser nulo para usuários criados após a adoção desta spec |

### 4.4 Regras de Negócio

| # | Regra |
|---|---|
| RN-PR02 | O checkbox declaratório de maioridade e aceite dos Termos/Política é obrigatório; o botão "Criar conta" permanece desabilitado enquanto desmarcado |
| RN-PR03 | O sistema persiste `declaracao_maioridade_em` com o timestamp do cadastro; esse campo é imutável após a criação |
| RN-PR04 | O aceite dos Termos de Uso e Política de Privacidade é registrado implicitamente pela marcação do checkbox, que inclui os dois documentos no mesmo ato |

---

## 5. Banner de Consentimento de Cookies

### 5.1 Categorias de cookies

| Categoria | Base Legal | Padrão | Opt-in/Opt-out | Exemplos |
|---|---|---|---|---|
| **Essenciais** | BL-05 — contrato | Sempre ativo | Não configurável | JWT de sessão, CSRF token, preferência de cookies |
| **Analytics e Desempenho** | BL-09 — legítimo interesse | Ativo (opt-out disponível) | Opt-out | Rastreamento de erros, analytics de uso, métricas de desempenho |
| **Publicidade** | BL-01 — consentimento | Inativo | Opt-in explícito | Publicidade direcionada, perfil de interesse, remarketing |

### 5.2 Entidade: ConsentimentoCookie

Armazenada como cookie HttpOnly no navegador. Quando o usuário estiver autenticado, o sistema associa o consentimento à conta.

| Campo | Tipo | Observações |
|---|---|---|
| `id` | UUID | Gerado na primeira visita; armazenado como cookie `consent_id` |
| `usuario_id` | FK → Usuário \| null | Preenchido após login; null para sessão pré-autenticação |
| `analytics` | Boolean | `true` = usuário não optou por sair |
| `publicidade` | Boolean | `true` = usuário consentiu explicitamente |
| `versao_politica` | String | Versão da política de privacidade vigente no ato |
| `concedido_em` | Timestamp | Data/hora da escolha |
| `expira_em` | Timestamp | `concedido_em` + 12 meses |

### 5.3 Condições de exibição do banner

O banner DEVE ser exibido quando **qualquer** das condições abaixo for verdadeira:
1. Não existe cookie `consent_id` válido no navegador
2. O `consent_id` existe mas `expira_em ≤ agora`
3. A versão da política registrada no consentimento difere da versão atual em produção

**Telas onde o banner pode ser ativado:**
- **Tela L1 (Login):** banner exibido sobreposto à tela, antes de qualquer interação
- **Acesso via link autenticado** (confirmar-cadastro, redefinir-senha, confirmar-email): banner exibido ao carregar a página, antes de processar o token

### 5.4 Fluxo de dados

```
[Usuário acessa Tela L1 ou link autenticado]
        │
        ▼
  Sistema verifica: existe ConsentimentoCookie válido e não expirado?
        │
        ├── SIM → não exibe banner; prossegue normalmente
        │
        ▼
[Banner de Cookies exibido]
  Usuário escolhe uma das duas opções:
        │
        ├── "Aceitar" → analytics = true; publicidade = true
        └── "Remover não essenciais" → analytics = false; publicidade = false
        │
        ▼
  Sistema persiste ConsentimentoCookie
  Cookie `consent_id` gravado no navegador (12 meses)
        │
        ▼
  Prossegue com a navegação normal (login ou processamento do link)
```

### 5.5 Conteúdo do banner

**Texto principal:** "Usamos cookies essenciais para o funcionamento do serviço e, com sua autorização, cookies de analytics e publicidade. Saiba mais na nossa [Política de Privacidade]."

**Botões (dois, com destaque visual equivalente — sem dark pattern de hierarquia):**
1. "Aceitar" — ativa analytics e publicidade; persiste consentimento
2. "Remover não essenciais" — mantém apenas essenciais; analytics=false, publicidade=false

**Link obrigatório no banner:** "Saiba mais na nossa [Política de Privacidade]."

> **Removido (v1.1):** painel "Gerenciar preferências" com toggles por categoria. O modelo binário é suficiente para conformidade e reduz complexidade de interface.

### 5.6 Regras de Negócio

| # | Regra |
|---|---|
| RN-PR05 | O banner é exibido nas condições definidas em 5.3; nenhuma categoria não-essencial é ativada antes da escolha do usuário. O modelo binário (Aceitar / Remover não essenciais) é suficiente para cumprir este requisito |
| RN-PR06 | O cookie de publicidade (BL-01) é opt-in: ativado somente quando o usuário clica "Aceitar"; a opção "Remover não essenciais" mantém publicidade inativa |
| RN-PR07 | O cookie de analytics (BL-09): ativado apenas via "Aceitar"; "Remover não essenciais" mantém analytics inativo. *Nota: a base legal BL-09 (legítimo interesse) permite tratamento sem consentimento, mas o modelo binário opta por exigir consentimento também para analytics, simplificando o compliance e alinhando ao padrão de menor surpresa ao titular* |
| RN-PR08 | A escolha é armazenada por 12 meses; após expiração, o banner é reapresentado |
| RN-PR09 | Quando a versão da política de privacidade muda de forma material, o registro `versao_politica` é atualizado no sistema e todos os consentimentos registrados com versão anterior são invalidados; o banner é reapresentado |
| RN-PR10 | O banner deve ser operável exclusivamente por teclado e compatível com leitores de tela (ver Seção 9) |
| RN-PR11 | O registro de consentimento (incluindo revogações) é retido por 5 anos conforme R-BAS-002 do guia LGPD |
| RN-PR12 | Os dois botões do banner devem ter destaque visual equivalente; nenhum pode ser suprimido ou ter contraste menor que o outro (vedação a dark patterns — R-PBD-007) |
| RN-PR13 | Ao fazer login após ter dado consentimento pré-login, o sistema associa o `ConsentimentoCookie` existente ao `usuario_id`, atualizando o registro |

---

## 6. Aviso de Privacidade nos Pontos de Coleta

Em todo ponto de coleta de dado pessoal, o sistema DEVE exibir, de forma clara e acessível, informação sobre a finalidade do dado e o link para a Política de Privacidade.

### 6.1 Tela de Cadastro (Tela 1 — spec_cadastro_usuarios)

Abaixo dos campos e acima do botão "Criar conta" (junto ao checkbox de maioridade):

> "Seus dados pessoais (nome, email e senha) são tratados para criar e gerenciar sua conta na plataforma, com base na execução do contrato de uso. Consulte nossa [Política de Privacidade] para mais informações."

### 6.2 Demais pontos de coleta

Qualquer tela que colete dado pessoal não coberto pelo cadastro inicial DEVE exibir aviso equivalente, identificando a finalidade específica.

---

## 7. Política de Privacidade

### 7.1 Documento obrigatório

A Política de Privacidade é um documento externo à plataforma (página web ou PDF) que DEVE estar publicado, versionado e acessível por link em todas as telas de coleta de dados e no rodapé da aplicação.

### 7.2 Conteúdo mínimo obrigatório

1. **Identificação do controlador:** razão social, CNPJ e canal de contato designado para exercício de direitos
2. **Dados coletados:** lista de campos, categorias e finalidades (conforme seção 2.1 desta spec)
3. **Bases legais:** por categoria de tratamento
4. **Compartilhamento com terceiros:** identificação de operadores (plataformas de analytics, publicidade, hospedagem, email transacional) e a finalidade
5. **Transferência internacional:** identificação de países e mecanismos (SCC quando aplicável)
6. **Retenção:** prazos por categoria (conforme seção 3 desta spec)
7. **Direitos dos titulares:** como exercer os direitos do Art. 18 LGPD (canal de contato)
8. **Cookies:** explicação das categorias e como gerenciar preferências
9. **Restrição de idade:** declaração de que o serviço é exclusivo para maiores de 18 anos
10. **Versão e data:** versionamento do documento; data da última atualização

### 7.3 Canal de exercício de direitos

Na ausência de DPO formalmente designado, o controlador DEVE identificar na Política de Privacidade um canal de contato (email dedicado ou formulário) para atendimento de solicitações de direitos dos titulares, com prazo de resposta de até 15 dias (Art. 19, §3º LGPD).

**RN-PR14:** O link "Política de Privacidade" DEVE estar presente no rodapé de todas as telas autenticadas e nas telas de cadastro e login, e no banner de cookies.

---

## 8. Exercício de Direitos dos Titulares (Art. 18 LGPD)

### 8.1 Direitos atendidos pela própria interface

| Direito | Como é atendido |
|---|---|
| D-02 — Acesso aos dados | Botão "Exportar meus dados" na Tela P1 (spec_perfil_usuario) |
| D-03 — Correção | Seções Nome e Email na Tela P1 (spec_perfil_usuario) |
| D-05 — Portabilidade | Botão "Exportar meus dados" na Tela P1 — CSV estruturado por entidade |
| D-06 — Eliminação | Seção "Excluir conta" na Tela P1 (spec_perfil_usuario) |
| D-09 — Revogação de consentimento (publicidade/analytics) | Reapresentação automática do banner após expiração (12 meses) ou mudança material de política; canal de contato declarado na Política de Privacidade para solicitação antecipada |

### 8.2 Direitos atendidos via canal de contato (Política de Privacidade)

| Direito | Canal |
|---|---|
| D-01 — Confirmação de existência de tratamento | Email/formulário de contato |
| D-04 — Bloqueio/anonimização de dados desnecessários | Email/formulário |
| D-07 — Informação sobre compartilhamento | Disponível na Política de Privacidade; detalhamento via email/formulário |
| D-08 — Consequências de não consentir | Disponível na Política de Privacidade |
| D-10 — Revisão de decisão automatizada | Email/formulário (quando aplicável) |

### 8.3 Link de acesso ao canal

**RN-PR15:** A tela de Perfil (P1) DEVE incluir um link de texto "Exercer direitos de privacidade" ou equivalente, que redireciona para o canal de contato declarado na Política de Privacidade. Este link DEVE estar visível sem necessidade de rolagem excessiva.

### 8.4 Reabertura das preferências de cookies

**RN-PR16 (v1.1 — revisada):** O rodapé das telas autenticadas **não precisa** conter link "Gerenciar cookies". A revogação do consentimento é atendida pela reapresentação automática do banner (expiração em 12 meses — RN-PR08 — ou mudança material de política — RN-PR09) e pelo canal de contato declarado na Política de Privacidade (RN-PR15). A supressão do link "Gerenciar cookies" não configura violação do Art. 9º ou Art. 18 LGPD, pois o canal alternativo é acessível.

---

## 9. Requisitos Globais de Acessibilidade (WCAG 2.2 / 2.0 AA)

Estas regras se aplicam a **todos** os componentes e telas da plataforma. Cada spec de funcionalidade complementa com regras específicas de componente.

### 9.1 Percepção (Princípio P1)

| # | Regra |
|---|---|
| RN-WG01 | Todo conteúdo não textual informativo (ícone, ilustração, imagem de estado) DEVE ter alternativa em texto equivalente via `alt`, `aria-label` ou `aria-labelledby`. Conteúdo puramente decorativo DEVE ser ocultado de tecnologias assistivas (`alt=""` ou `aria-hidden="true"`) |
| RN-WG02 | Cor nunca pode ser o único meio de transmitir informação, indicar estado ou distinguir elementos; sempre combinada com rótulo textual, ícone ou padrão adicional |
| RN-WG03 | Contraste mínimo de **4,5:1** para texto regular (abaixo de 18pt ou 14pt negrito); **3:1** para texto grande (18pt+ ou 14pt+ negrito) e para componentes de interface e indicadores de estado/foco (WCAG 2.1 1.4.11) |
| RN-WG04 | O conteúdo DEVE ser legível e funcional com zoom de texto até 200% sem perda de funcionalidade ou rolagem horizontal inesperada |
| RN-WG05 | O layout DEVE adaptar-se a viewport de 320px de largura sem rolagem horizontal (reflow — WCAG 2.1 1.4.10) |
| RN-WG06 | Texto não deve ser renderizado como imagem quando texto real serve ao mesmo propósito |

### 9.2 Operabilidade (Princípio P2)

| # | Regra |
|---|---|
| RN-WG07 | Toda funcionalidade DEVE ser operável exclusivamente por teclado, sem exigir temporização específica de tecla |
| RN-WG08 | Nenhum componente pode prender o foco de teclado de forma irrecuperável; modais e diálogos DEVEM implementar focus trap e retornar o foco ao elemento de origem ao fechar |
| RN-WG09 | O indicador de foco de teclado DEVE ser visível em todos os elementos interativos; `outline: none` sem substituto equivalente é proibido |
| RN-WG10 | Nenhum conteúdo pode piscar mais de 3 vezes por segundo |
| RN-WG11 | Alvos de toque DEVEM ter área mínima de 24×24 CSS pixels; recomendado 44×44 CSS pixels (WCAG 2.2 2.5.8) |
| RN-WG12 | Funcionalidades que dependem de arrastar devem ter alternativa por toque simples ou teclado (WCAG 2.2 2.5.7) |

### 9.3 Compreensibilidade (Princípio P3)

| # | Regra |
|---|---|
| RN-WG13 | O idioma padrão da interface DEVE ser declarado programaticamente (`lang="pt-BR"` ou equivalente na plataforma) |
| RN-WG14 | Mudanças de contexto (navegação, abertura de modal, redirect) NÃO DEVEM ocorrer automaticamente ao receber foco ou ao alterar o valor de um componente sem ação explícita do usuário |
| RN-WG15 | Toda mensagem de erro DEVE: (a) identificar o campo com problema de forma programática (`aria-invalid="true"` + `aria-describedby` apontando para a mensagem); (b) descrever o erro em linguagem compreensível; (c) sugerir correção quando possível |
| RN-WG16 | Campos de formulário DEVEM ter rótulo (`label`) associado programaticamente; placeholder não é substituto de label |
| RN-WG17 | Campos de dados pessoais DEVEM declarar `autocomplete` semântico: `name` para nome completo, `email` para email, `current-password` para senha atual, `new-password` para nova senha |
| RN-WG18 | Links e botões DEVEM ter propósito compreensível pelo seu texto ou contexto imediato; evitar "clique aqui", "saiba mais" sem contexto adicional |

### 9.4 Robustez (Princípio P4)

| # | Regra |
|---|---|
| RN-WG19 | Toda mudança dinâmica de conteúdo **não causada diretamente pelo usuário** DEVE ser anunciada por tecnologias assistivas via live region (`aria-live="polite"` para atualizações não urgentes; `role="alert"` para erros críticos e urgentes) |
| RN-WG20 | Todo componente interativo DEVE ter nome acessível, papel (`role`) e estado expostos programaticamente à API de acessibilidade da plataforma |
| RN-WG21 | Modais e diálogos DEVEM usar `role="dialog"`, `aria-modal="true"` e `aria-labelledby` apontando para o título do modal |
| RN-WG22 | Barras de progresso DEVEM usar `role="progressbar"` com `aria-valuenow`, `aria-valuemin` e `aria-valuemax` |
| RN-WG23 | Componentes de carregamento (skeleton, spinner) DEVEM marcar o contêiner pai com `aria-busy="true"` durante o carregamento e remover o atributo ao concluir |
| RN-WG24 | Links externos (que abrem em nova aba/janela) DEVEM indicar esse comportamento textualmente (ex.: "(abre em nova aba)") e com `target="_blank"` + `rel="noopener noreferrer"` |
| RN-WG25 | Identificadores alfanuméricos exibidos isoladamente (ex.: código de 6 chars do usuário) DEVEM ter `aria-label` com os caracteres separados por espaço para pronúncia correta por leitores de tela (ex.: `aria-label="A 3 F 9 K X"`) |

### 9.5 Padrões específicos de componente

| Componente | Requisito |
|---|---|
| Checkbox | `role="checkbox"` + `aria-checked`; label associada; incluído na navegação por teclado |
| Toggle/switch | `role="switch"` + `aria-checked`; label descrevendo o que é ativado/desativado |
| Contador regressivo (MM:SS) | Atualização via `aria-live="polite"`; frequência máxima de anúncio: a cada 30 segundos (não a cada segundo, para não sobrecarregar TA) |
| Toast / snackbar | `role="status"` para informativo; `role="alert"` para erro/urgente |
| Botão "Copiar" | Após cópia: anunciar resultado via live region ("Identificador copiado") |
| Barra de busca/filtro | Resultados atualizados via `aria-live="polite"`; contagem de resultados anunciada |
| Seletor de álbum / select customizado | Replicar comportamento de `<select>` nativo: setas, Home/End, type-ahead; `role="listbox"` + `role="option"` |
| Card de álbum | Estrutura semântica com heading de nível adequado; botões com labels descritivos (ex.: "Colar figurinhas em Copa do Mundo 2026 — Brochura") |

---

## 10. Regras de Negócio Consolidadas

| # | Regra |
|---|---|
| RN-PR01 | Rotina automatizada de purga para tokens expirados (90 dias) e logs de autenticação (6 meses), com registro de eliminação |
| RN-PR02 | Checkbox declaratório de maioridade e aceite de Termos/Política obrigatório no cadastro; "Criar conta" desabilitado enquanto desmarcado |
| RN-PR03 | `declaracao_maioridade_em` registrado no ato do cadastro; campo imutável |
| RN-PR04 | Termos de Uso e Política de Privacidade incluídos no mesmo ato de aceite do checkbox |
| RN-PR05 | Banner de cookies exibido nas condições de 5.3; cookies não-essenciais inativos antes da escolha |
| RN-PR06 | Cookie de publicidade: opt-in explícito; nunca pré-marcado |
| RN-PR07 | Cookie de analytics: opt-out (pré-ativo por BL-09); desativável sem prejuízo ao serviço |
| RN-PR08 | Consentimento de cookies válido por 12 meses; reapresentação ao expirar |
| RN-PR09 | Mudança material na política invalida consentimentos anteriores; banner reapresentado |
| RN-PR10 | Banner de cookies operável por teclado e compatível com leitores de tela |
| RN-PR11 | Registro de consentimento retido por 5 anos |
| RN-PR12 | Botões do banner com destaque visual equivalente; dark patterns proibidos |
| RN-PR13 | Consentimento pré-login associado ao `usuario_id` após autenticação |
| RN-PR14 | Link "Política de Privacidade" no rodapé de todas as telas e no banner de cookies |
| RN-PR15 | Link "Exercer direitos de privacidade" visível na Tela P1 de perfil |
| RN-PR16 | Link "Gerenciar cookies" no rodapé de telas autenticadas reabre painel de preferências |
| RN-WG01–WG25 | Requisitos globais de acessibilidade conforme Seção 9; aplicáveis a todos os componentes da plataforma |
