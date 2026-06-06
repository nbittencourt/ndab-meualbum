# Relatório de Navegação QA — MeuAlbum Copa 2026

**Data:** 2026-06-05  
**Usuário:** test@user.com  
**Ferramenta:** Playwright MCP (headless)  
**Viewports testados:** Mobile 390×844 · Desktop 1280×800  
**Referência:** specs funcionais em `/docs/` (versões mais recentes)

---

## Resumo Executivo

| Severidade | Quantidade |
|---|---|
| 🔴 Crítico | 2 |
| 🟠 Alto | 5 |
| 🟡 Médio | 4 |
| 🔵 Baixo / Desvio de spec | 3 |
| ✅ Correto / Conforme | 12 |

---

## 🔴 Bugs Críticos

### BUG-01 — API `/api/v1/pilha` retorna 404

**Tela:** Abrir Pacotinhos (AP1)  
**Viewport:** Mobile e Desktop  
**Reprodução:** Adicionar qualquer figurinha à pilha  
**Comportamento:** `POST /api/v1/pilha` retorna HTTP 404. A pilha funciona apenas como estado local do React sem persistência no backend.  
**Spec violada:** RN-AP01 — "A Pilha da Sessão é persistida no backend, vinculada à conta do usuário; retomável em qualquer dispositivo."  
**Impacto:** Sessão perdida ao recarregar a página; impossível retomar em outro dispositivo; modal de retomada (seção 4.1 da spec) nunca aparece.

---

### BUG-02 — Layout desktop: sidebar sobrepõe conteúdo em sub-páginas

**Telas afetadas:** `/albums`, `/abrir`, `/colar`, `/albums/{id}`, `/perfil`  
**Viewport:** Desktop (1280px)  
**Comportamento:** A sidebar de navegação (~230px) é sobreposta ao conteúdo das páginas. O conteúdo inicia em `x=0` (largura total) mas a sidebar cobre a porção esquerda, tornando títulos de seção, identificador, nome e controles ilegíveis ou inacessíveis.  
**Não afeta:** `/home` (renderiza corretamente no desktop).  
**Impacto:** Todas as sub-páginas são inutilizáveis em desktop — conteúdo crítico oculto atrás da navegação.

**Screenshots de referência:** `desktop_albums_page.png`, `desktop_abrir.png`, `desktop_colar.png`, `desktop_perfil.png`

---

## 🟠 Bugs Altos

### BUG-03 — Cards da pilha desaparecem após definir destino

**Tela:** Abrir Pacotinhos (AP1)  
**Viewport:** Mobile  
**Reprodução:** Adicionar figurinha → clicar "Colar" e confirmar, ou clicar "Enviar para Repetidas"  
**Comportamento:** O card da figurinha é removido completamente da pilha após receber destino.  
**Spec violada:** RN-AP15 — "Cards com destino já definido permanecem visíveis na pilha em estado somente leitura como histórico."  
**Impacto:** Usuário perde rastreabilidade do que foi colado/repetido na sessão.

---

### BUG-04 — Botão "Ver Álbum" ausente na tela AL1

**Tela:** Gerenciamento do Álbum (AL1) — `/albums/{id}`  
**Viewport:** Mobile e Desktop  
**Comportamento:** A barra de ações exibe apenas "Colar figurinhas", "Baixar PDF" e "Arquivar". O botão "Ver Álbum" está completamente ausente.  
**Spec violada:** RN-AL31 — "O botão 'Ver Álbum' na barra de ações da Tela AL1 redireciona para a Tela AL2, que exibe todas as figurinhas do álbum (coladas e faltantes), organizadas por seção."  
**Impacto:** A Tela AL2 (visualização completa do álbum) é inacessível por completo.

---

### BUG-05 — "Gerenciar cookies" no footer não abre o painel de cookies

**Telas afetadas:** Footer global (todas as páginas)  
**Viewport:** Mobile e Desktop  
**Comportamento:** O link "Gerenciar cookies" navega para `/perfil#cookies` em vez de reabrir o painel de preferências de cookies. O painel não é exibido ao chegar nessa URL.  
**Spec violada:** spec_privacidade_lgpd RN-PR16 — "link 'Gerenciar cookies' (reabre painel de preferências de cookies)"  
**Observação:** A página `/perfil` possui um botão "Gerenciar cookies" dentro da seção "Privacidade e Dados" que funciona corretamente — apenas o link do footer está errado.

---

### BUG-06 — Botão "+ Abrir" flutuante cobre conteúdo da página

**Telas afetadas:** `/home`  
**Viewport:** Mobile e Desktop  
**Comportamento:** O botão sticky "Abrir pacotinhos" (posicionado no canto superior direito ou flutuante) sobrepõe o conteúdo da seção "Figurinhas Repetidas".  
- Mobile: cobre o texto "Nenhuma figurinha repetida no seu estoque" e parte do nome da figurinha na linha do ranking.  
- Desktop: cobre o indicador de quantidade na primeira linha do ranking de repetidas.  
**Impacto:** Conteúdo de leitura parcialmente inacessível; possível target de toque inadvertido.

**Screenshot de referência:** `mobile_home_empty.png`, `desktop_home.png`

---

### BUG-07 — Links "FIFA 2026 →" e "Panini Comics →" presentes na landing page

**Tela:** Landing page não autenticada (`/`)  
**Viewport:** Mobile e Desktop  
**Comportamento:** O rodapé da landing page exibe links externos para `fifaworld.cup` e `paninicomics.com.br`.  
**Spec violada:** spec_home_albums v1.6 — "Links externos para FIFA e Panini Comics foram removidos do footer por questões de direitos autorais — RN-H25 descontinuado. Footer contém apenas 'Política de Privacidade' e 'Gerenciar cookies'."  
**Impacto:** Risco jurídico e de direitos autorais.

---

## 🟡 Bugs Médios

### BUG-08 — Texto de confirmação ausente no modal de arquivamento

**Tela:** AL1 — `/albums/{id}`  
**Viewport:** Mobile  
**Reprodução:** Clicar em "Arquivar"  
**Comportamento:** Os botões "Confirmar arquivamento" e "Cancelar" aparecem inline na barra de ações, sem nenhum texto explicativo sobre o que acontece.  
**Spec esperada (seção 5.6):** "Arquivar este álbum? Ele ficará oculto das listas principais e não poderá receber novas colagens enquanto arquivado."  
**Observação positiva:** O botão "Confirmar arquivamento" usa fundo preto (✓ RN-AL32 — correto, não vermelho).

---

### BUG-09 — AL1: seção expandida exibe todos os stickers, não apenas os faltantes

**Tela:** AL1 — `/albums/{id}`  
**Viewport:** Mobile  
**Comportamento:** Ao expandir uma seção, a implementação exibe um grid visual com **todas** as figurinhas da seção (coladas e faltantes), uma legenda de estados e indicadores de estoque (`×0`).  
**Spec esperada (seção 5.3):** "Expandida: lista de figurinhas faltantes (número + nome). Seção completa: exibe mensagem de confirmação."  
**Impacto:** Comportamento diverge da spec — mais próximo da AL2 do que da AL1. Pode gerar confusão com a distinção entre as duas telas.

---

### BUG-10 — Link "Esqueci minha senha" ausente na seção Senha do Perfil

**Tela:** Perfil (P1) — `/perfil`  
**Viewport:** Mobile e Desktop  
**Comportamento:** O campo "Senha atual" não possui o link "Esqueci minha senha" abaixo dele.  
**Spec esperada (seção 7.1):** "Link 'Esqueci minha senha' — alinhado abaixo do campo [Senha atual]; redireciona para Tela L2 sem encerrar a sessão atual."  
**Impacto:** Usuário que esquece a senha atual não tem caminho de recuperação visível dentro do perfil.

---

### BUG-11 — MFN exibe botões "Colar" e "Colar e Fechar" antes do primeiro paste

**Tela:** Colar Figurinhas — Modal de Figurinha Não Registrada (MFN)  
**Viewport:** Mobile  
**Comportamento:** Ao abrir o modal, já são exibidos dois botões de ação: "COLAR" e "COLAR E FECHAR".  
**Spec esperada (seção 6.1):**
- Estado inicial: apenas "Confirmar" (valida e aciona a colagem).
- Após colagem bem-sucedida: exibe "Colar e Outra" e "Fechar".  
**Impacto:** Fluxo de confirmação diverge da spec; o botão "COLAR E FECHAR" antes de qualquer paste não tem semântica clara.

---

## 🔵 Desvios Menores / Observações

### OBS-01 — Texto do identificador no Perfil difere da spec

**Tela:** Perfil (P1) — seção Identificador  
**Spec (spec_perfil_usuario seção 4):** "Este código é público e identifica você na plataforma."  
**Implementação:** "Seu código único para trocas e suporte. Não compartilhe com desconhecidos."  
**Observação:** A spec define o identificador como **público**, mas o texto da implementação instrui o usuário a **não compartilhar**. Os textos transmitem mensagens contraditórias.

---

### OBS-02 — Barra de progresso na Home sem `role="progressbar"`

**Tela:** Home — card de álbum  
**Viewport:** Mobile  
**Comportamento:** O indicador de progresso no card da Home usa elementos genéricos (`div`) sem `role="progressbar"`.  
**Spec violada:** RN-H21 — "A barra de progresso de conclusão de cada card DEVE usar `role='progressbar'` com `aria-valuenow`, `aria-valuemin`, `aria-valuemax` e `aria-valuetext`"  
**Observação:** Na Tela AL0 (`/albums`) a barra de progresso já usa `role="progressbar"` corretamente — inconsistência entre as telas.

---

### OBS-03 — Tela AL1 expandida exibe "×2 Repetida" na legenda mesmo com estoque zerado

**Tela:** AL1 — seção expandida  
**Comportamento:** A legenda exibe "━ Colada · ○ Faltante · ×2 Repetida" mas o símbolo "×2" sugere um contador que não é exibido individualmente por figurinha. Com estoque zerado, o indicador "×0" em cada figurinha é tecnicamente correto mas a legenda fixa "×2" não reflete o estado real.  
**Impacto:** Baixo — pode confundir o usuário sobre o significado dos indicadores.

---

## ✅ Comportamentos Corretos / Em Conformidade

| # | Comportamento | Regra |
|---|---|---|
| 1 | Login e autenticação funcionam corretamente | — |
| 2 | Redirecionamento pós-login para `/home` | — |
| 3 | Criação de álbum retorna para Home com álbum listado | RN-H28 |
| 4 | Variantes de álbum têm identidade visual distinta (cores, bordas, padrões) | RN-H29, RN-AL33 |
| 5 | Botão "Confirmar arquivamento" com fundo preto (não vermelho) | RN-AL32 |
| 6 | Validação de figurinha inválida (BR01) com mensagem correta | RN-AP04 |
| 7 | MCol pré-seleciona o único álbum elegível | RN-AP09 |
| 8 | Câmera não ativada automaticamente no MFN / AP1 | RN-CF27, RN-AP43 |
| 9 | Tela AP0 pulada por existir único TipoAlbum | RN-AP43 |
| 10 | Link "Pular para o conteúdo" presente em todas as páginas | RN-H26 |
| 11 | Footer logado: apenas "Política de Privacidade" e "Gerenciar cookies" (sem FIFA/Panini) | spec v1.6 |
| 12 | Indicadores de elegibilidade no CF1 com rótulo textual "PODE COLAR" | RN-CF19 |
| 13 | FWC1 colada via MCol refletida no progresso do álbum (0.1%) | RN-AP14 |
| 14 | FWC2 enviada para Repetidas aparece na seção da Home | RN-AP14 |
| 15 | AL0: botões "Gerenciar", "Colar figurinhas" e "Baixar PDF" presentes no card | RN-AL28, RN-AL30 |
| 16 | Navegação desktop com sidebar lateral | — |
| 17 | Header global consistente em todas as telas (nome + identificador + sair) | spec |

---

## Erros de Console Observados

| URL | Erro | Tipo |
|---|---|---|
| `/` (landing) | `GET /favicon.ico` → 404 | Recurso faltando |
| `/` (landing, pré-login) | `GET /api/v1/auth/me` → 401 (×2) | Esperado (não autenticado) |
| `/abrir` | `POST /api/v1/pilha` → 404 | **Endpoint inexistente** (ver BUG-01) |

---

## Acessibilidade — Pontos de Atenção (WCAG 2.0 AA)

| # | Problema | Regra violada |
|---|---|---|
| A1 | Barra de progresso na Home sem `role="progressbar"` | RN-H21 |
| A2 | Modal de arquivamento sem texto descritivo acessível | RN-AL25 |
| A3 | BUG-02 (layout desktop) torna toda navegação inacessível em tela larga | WCAG 1.3.1, 1.4.4 |

---

## Screenshots Gerados

| Arquivo | Descrição |
|---|---|
| `mobile_home_empty.png` | Home mobile — estado vazio de álbuns |
| `mobile_home_com_album.png` | Home mobile — com álbum Brochura |
| `mobile_novo_album.png` | Tela de criação de álbum |
| `mobile_albums.png` | AL0 — lista de álbuns (mobile) |
| `mobile_album_manage.png` | AL1 — gerenciamento (mobile) |
| `mobile_al1_expanded.png` | AL1 — seção "Página Inicial" expandida |
| `mobile_arquivar_modal.png` | Modal de arquivamento (mobile) |
| `mobile_abrir_pacotinhos.png` | AP1 vazia (mobile) |
| `mobile_pacotinho_fwc1.png` | AP1 com FWC1 na pilha |
| `mobile_mcol.png` | Modal de Colagem (MCol) |
| `mobile_after_colar.png` | AP1 após colar — card desaparecido (BUG-03) |
| `mobile_repetidas.png` | AP1 após enviar para Repetidas — card desaparecido (BUG-03) |
| `mobile_colar.png` | CF0 — seleção de álbum |
| `mobile_cf1.png` | CF1 — colagem com estoque |
| `mobile_mfn.png` | Modal de Figurinha Não Registrada (MFN) |
| `mobile_gerenciar_cookies.png` | Resultado de clicar "Gerenciar cookies" no footer |
| `desktop_home.png` | Home desktop |
| `desktop_albums_page.png` | AL0 desktop — layout quebrado (BUG-02) |
| `desktop_abrir.png` | AP1 desktop — layout quebrado (BUG-02) |
| `desktop_colar.png` | CF0 desktop — layout quebrado (BUG-02) |
| `desktop_perfil.png` | Perfil desktop — layout quebrado (BUG-02) |
