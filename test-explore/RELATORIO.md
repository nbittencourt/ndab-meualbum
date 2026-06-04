# Exploração Manual — MeuAlbum
**Data:** 2026-06-03  
**Usuário de teste:** `explore_1780527207714@test.com`  
**Ambiente:** `http://localhost:5173` (dev local, Pixel 5 viewport 393×851)  
**Método:** Playwright headless, screenshots em `test-explore/screenshots/`

---

## Resumo Executivo

| Categoria | Total | Crítico | Médio | Baixo |
|---|---|---|---|---|
| Inconsistências de tela vs wireframe | 9 | 2 | 4 | 3 |
| Tempos de carregamento problemáticos | 2 | 1 | 1 | — |
| Erros / problemas funcionais | 5 | 2 | 2 | 1 |

---

## 1. Inconsistências vs Design Handoff

### 🔴 IC-01 — FAB "+ Abrir" sobrepõe a barra de navegação inferior
**Tela:** Home (`/home`)  
**Screenshot:** `04-after-login.png`  
**Wireframe ref:** `home-wf.jsx` → `WfBottomNav`

O botão flutuante "+ Abrir" (vermelho, canto inferior direito) invade a área da bottom nav, cortando o rótulo "Perfil" e reduzindo a área clicável dos itens de navegação. No wireframe o FAB está posicionado **acima** da barra.

**Impacto:** Quebra a usabilidade do nav; em dispositivos com barra de gesture do sistema (iPhone, Android recentes) pode causar conflito com gestos de navegação.

---

### 🔴 IC-02 — Texto "FIFA World Cup 2026™" exposto em múltiplas telas
**Telas:** Cadastro de Álbum (`07-cadastro-album.png`), Abrir Pacotinhos (`10b-pacotinhos-aberto.png`)  
**Wireframe ref:** `cadastro-album.jsx`, `abrir-pacotinhos.jsx`  
**CLAUDE.md:** "No Panini/FIFA trademarks."

A marca registrada "FIFA World Cup 2026™" (com símbolo ™) aparece como nome do TipoÁlbum visível ao usuário. O nome poderia ser "Copa do Mundo 2026" ou simplesmente "WC 2026" conforme orientação legal do projeto.

---

### 🟡 IC-03 — Cor da bottom nav diverge do wireframe
**Tela:** Todas as telas autenticadas  
**Screenshots:** `06-albums.png`, `10b-pacotinhos-aberto.png`, `15-nav-1--trocas.png`  
**Wireframe ref:** `shared-chrome.jsx` → `MAFooter`

A bottom nav usa fundo dourado/âmbar (`~#C49A1A`). O `shared-chrome.jsx` define os tons do chrome como `CHROME_PAPER = "#FBF8EE"` (creme) e `CHROME_INK = "#0A0907"` (preto). O dourado não está nos design tokens definidos; destoa do visual "álbum de figurinhas" pretendido.

---

### 🟡 IC-04 — Ícones da bottom nav são emoji, não ícones SVG
**Tela:** Todas as telas autenticadas  
**Screenshots:** `06-albums.png`

Os três itens do nav usam emoji (📖 Álbum, 🔄 Trocas, 👤 Perfil). O `shared-chrome.jsx` usa ícones SVG próprios (setas, silhuetas). Emoji: (a) não são controláveis em cor/tamanho CSS; (b) variam entre SO/versão; (c) são inacessíveis para leitores de tela sem `aria-label` adequado.

---

### 🟡 IC-05 — Botão "CRIAR ÁLBUM" sem estado desabilitado claro
**Tela:** Cadastro de Álbum (`/albums/cadastro`)  
**Screenshot:** `07b-cadastro-filled.png`  
**Wireframe ref:** `cadastro-album.jsx`

Com nenhuma variante selecionada, o botão "CRIAR ÁLBUM" exibe uma cor salmão-claro (#D97B7B aproximadamente) que não comunica claramente "desabilitado". O wireframe mostra o botão primário vermelho com sombra offset-3px. A ausência de `cursor:not-allowed` e de um `aria-disabled` adequado também prejudica a acessibilidade.

---

### 🟡 IC-06 — Tela "Abrir Pacotinhos" mostra apenas seletor de álbum, sem fluxo completo
**Tela:** Abrir Pacotinhos (`/albums/[id]/pacotinhos`)  
**Screenshot:** `10b-pacotinhos-aberto.png`  
**Wireframe ref:** `abrir-pacotinhos.jsx` (AP0 → AP1 → modais)

A tela atual exibe somente: título "ABRIR PACOTINHOS", pergunta "Que álbum você está abrindo?", um dropdown com "FIFA World Cup 2026™" e botão "CONFIRMAR" desabilitado. O wireframe especifica o fluxo completo com a etapa de abertura visual do pacote e revelação das figurinhas. O que está implementado parece ser apenas a etapa AP0 (seleção de álbum) sem contexto do álbum já selecionado.

---

### 🟠 IC-07 — Rodapé da Home mostra links "FIFA 2026 →" e "Panini Comics →"
**Tela:** Home  
**Screenshot:** `04-after-login.png` (parte inferior)  
**Wireframe ref:** `shared-chrome.jsx` → `MAFooter`

O `MAFooter` do wireframe exibe apenas "Não-oficial · Feito por colecionadores · 2026". A implementação adiciona links para FIFA e Panini que não constam no design e conflitam com a diretriz legal do projeto ("No Panini/FIFA trademarks").

---

### 🟠 IC-08 — Tela de Trocas é placeholder vazio
**Tela:** Trocas (`/trocas`)  
**Screenshot:** `15-nav-1--trocas.png`  
**Wireframe ref:** `perfil-wf.jsx` (não abre aqui, mas a tela de trocas tem spec em `/docs`)

Conteúdo: apenas "Em breve: gerencie suas trocas aqui." Sem estrutura de tela, sem empty state ilustrado, sem call-to-action. Qualquer usuário que navegar ao segundo item do menu terá uma experiência degradada.

---

### 🟢 IC-09 — Header na Landing mostra "CRIAR CONTA GRÁTIS" em vez de logo/contexto
**Tela:** Landing / Login (`/`)  
**Screenshot:** `03-login-filled.png`

O cabeçalho da landing exibe "MA | Meu Álbum" à esquerda e "CRIAR CONTA GRÁTIS" (botão vermelho) à direita. O wireframe `shared-chrome.jsx` define o header com o bloco de usuário (nome + id + sair) à direita quando autenticado, e para não-autenticado apenas o logo. Um botão de CTA primário no header compete com o formulário de login abaixo.

---

## 2. Tempos de Carregamento

| Rota | Tempo | Status |
|---|---|---|
| `/` (Landing — primeira carga) | **3 688 ms** | 🔴 Crítico (>2s) |
| Login submit (POST + redirect) | **1 557 ms** | 🟡 Lento (>1s) |
| `/register` | 565 ms | ✅ OK |
| `/albums` | 571 ms | ✅ OK |
| `/albums/cadastro` | 553 ms | ✅ OK |
| `/albums/[id]/pacotinhos` | 580 ms | ✅ OK |
| `/albums/[id]/colar` | 587 ms | ✅ OK |
| `/albums/[id]` | 555 ms | ✅ OK |
| `/perfil` | 581 ms | ✅ OK |
| `/trocas` | 581 ms | ✅ OK |

### PT-01 — Landing 3.7s (waitUntil: networkidle)
O tempo de 3.7s é medido até `networkidle` (sem requests pendentes por 500ms). Causas prováveis:
- Bundle JS não dividido (sem code-splitting por rota)
- Fontes do Google Fonts bloqueando render (Preconnect declarado mas requests de fonte ainda bloqueiam)
- Countdown timer animado sendo inicializado no carregamento inicial

**Recomendação:** Analisar com Lighthouse/DevTools. Verificar se as fontes têm `font-display: swap`. Separar o bundle da landing (React.lazy para rotas autenticadas).

### PT-02 — Login submit 1.5s
O POST `/api/v1/auth/login` + redirect para `/home` leva ~1.5s. Para a primeira requisição autenticada pode incluir cold start do servidor Express. Medição isolada da API necessária para confirmar.

---

## 3. Erros e Problemas Funcionais

### 🔴 FN-01 — Cookie banner bloqueia fisicamente o botão de submit do cadastro
**Tela:** Cadastro (`/register`)  
**Screenshot:** `02-register.png`

Na primeira visita ao `/register`, o banner de cookies aparece na base da tela e tem `z-index: 200`. O botão "Criar conta grátis" fica atrás do banner e **não pode ser clicado** — o evento é interceptado pela div do banner. O usuário precisa primeiro aceitar/rejeitar cookies para então conseguir submeter o formulário. Isso também viola WCAG 2.1 SC 2.1.1 (teclado): o fluxo de cadastro fica bloqueado.

**Evidência direta:** Playwright registrou o erro: `<div class="flex flex-col gap-4">…</div> from <div role="dialog" aria-modal="false" aria-label="Preferências de cookies"…> subtree intercepts pointer events`.

---

### 🔴 FN-02 — Navegação pelo item "Perfil" fecha o browser (possível abertura em nova aba)
**Tela:** Bottom nav → Perfil (`/perfil`)

Ao clicar no item "Perfil" do bottom nav, o contexto do browser Playwright foi encerrado (`Target page, context or browser has been closed`). Indica que o link abre em `target="_blank"` (nova aba) ou aciona algum comportamento que destrói o contexto da página. A tela de perfil não pôde ser capturada. Confirmar manualmente.

---

### 🟡 FN-03 — Rotas em inglês não existem, redirecionam silenciosamente para Home
**Rotas:** `/profile`, `/swaps`

Navegar para `/profile` ou `/swaps` redireciona para `/home` sem mensagem de erro 404 ou explicação. As rotas corretas são `/perfil` e `/trocas`. Pode confundir desenvolvedores e quebrar links externos/deep-links se alguém usar os nomes em inglês.

---

### 🟡 FN-04 — Cadastro de álbum não confirma criação com feedback visual
**Tela:** `/albums/cadastro`  
**Screenshots:** `07-cadastro-album.png`, `07b-cadastro-filled.png`, `08-after-cadastro.png`

O botão "CRIAR ÁLBUM" aparece desabilitado mesmo após o input de nome ser preenchido (nenhuma variante foi selecionada pelo script). Ao tentar submeter sem variante, a URL permanece em `/albums/cadastro`. Não há toast, snackbar ou mensagem de validação visível para guiar o usuário. O estado de carregamento da página (`07`) exibe apenas um spinner centralizado sem qualquer esqueleto/placeholder.

---

### 🟢 FN-05 — Cadastro exige confirmação de email mas não informa isso na tela de registro
**Tela:** `/register`  
**Screenshot:** `05-register-result.png`

Após o cadastro bem-sucedido, o usuário é levado para uma tela "Verifique seu email" (`EmailConfirmationPage`). O formulário de registro em si não tem nenhum aviso prévio de que será necessária confirmação de email. Em modo dev (sem `RESEND_API_KEY`), o email não é enviado — o token fica apenas no banco. Usuários de desenvolvimento ficam presos nessa tela sem instrução de como prosseguir.

---

## Anexos

| Arquivo | Descrição |
|---|---|
| `screenshots/01-landing.png` | Landing page — unauthenticated |
| `screenshots/02-register.png` | Tela de cadastro (cookie banner visível) |
| `screenshots/03-login-filled.png` | Formulário de login preenchido |
| `screenshots/04-after-login.png` | Home após login — estado vazio |
| `screenshots/05-home.png` | Home (idêntica ao estado pós-login) |
| `screenshots/06-albums.png` | Lista de álbuns — estado vazio |
| `screenshots/07-cadastro-album.png` | Cadastro carregando (spinner) |
| `screenshots/07b-cadastro-filled.png` | Cadastro com nome preenchido, sem variante |
| `screenshots/08-after-cadastro.png` | Estado pós-tentativa de salvar sem variante |
| `screenshots/09-album-detail.png` | Formulário NOVO ÁLBUM (`/albums/novo`) |
| `screenshots/10-abrir-pacotinhos.png` | Home (sem albumId válido, redirecionou) |
| `screenshots/10b-pacotinhos-aberto.png` | Abrir Pacotinhos — step 1 |
| `screenshots/11-colar-figurinhas.png` | Home (sem albumId válido, redirecionou) |
| `screenshots/12-album-visualizar.png` | Formulário NOVO ÁLBUM novamente |
| `screenshots/13-profile.png` | Home (`/profile` → redirecionou) |
| `screenshots/14-swaps.png` | Home (`/swaps` → redirecionou) |
| `screenshots/15-nav-0--lbum.png` | Lista de álbuns via nav |
| `screenshots/15-nav-1--trocas.png` | Tela Trocas — placeholder |

---

*Gerado em 2026-06-03 por exploração automatizada (Playwright) + análise manual.*
