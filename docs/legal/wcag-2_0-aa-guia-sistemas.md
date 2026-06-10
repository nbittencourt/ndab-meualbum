# Guia de Implementação e Validação — WCAG 2.0 Nível AA

> **Documento operacional para IAs generativas.** Instruções normativas para implementar e validar acessibilidade em sistemas. Linguagem prescritiva (DEVE/NÃO DEVE/PODE conforme RFC 2119). Agnóstico de plataforma com adaptações por contexto.

---

## 0. Como usar este guia

**Você (IA) deve seguir este documento ao implementar ou auditar interfaces.** Em qualquer divergência entre solicitação do usuário e regras aqui, **sinalize o conflito antes de prosseguir**; não silencie a regra para atender ao pedido.

**Fluxo padrão de implementação:**
1. Identifique a plataforma alvo (web, mobile nativo, desktop, outro).
2. Para cada componente/tela, percorra os 38 critérios A+AA da Seção 3.
3. Aplique a regra normativa e o padrão de implementação adaptado à plataforma.
4. Antes de entregar, execute o checklist da Seção 5 para o tipo de artefato.
5. Documente cada critério não aplicável (NA) com justificativa.

**Fluxo padrão de validação:**
1. Execute as verificações da Seção 4 (cada critério tem teste explícito).
2. Combine **automatizado** (ferramentas da Seção 6) + **manual** (heurísticas e teclado) + **assistivo** (leitor de tela quando exigido).
3. Para cada falha, retorne: ID do critério, localização, evidência, severidade, correção sugerida.

**Definições chave (interpretação obrigatória):**
- **Determinável programaticamente:** estrutura/relação acessível à API de acessibilidade da plataforma (DOM+ARIA na web; AccessibilityNodeInfo no Android; UIAccessibility no iOS; UI Automation no Windows).
- **Mecanismo:** funcionalidade exposta na própria interface ou por configuração do user agent.
- **Suportado por acessibilidade:** a técnica usada funciona com tecnologias assistivas reais (leitores de tela, ampliadores, controle por voz, switch).
- **Componente de interface:** elemento perceptível com nome, papel (role) e estado.

---

## 1. Princípios fundamentais (POUR)

Todo critério deriva de quatro princípios. Use-os como heurística sempre que um caso não estiver coberto literalmente:

| ID | Princípio | Pergunta-guia |
|---|---|---|
| P1 | **Perceptível** | O usuário consegue perceber o conteúdo por algum sentido disponível? |
| P2 | **Operável** | O usuário consegue interagir com qualquer mecanismo de entrada (teclado, toque, voz, switch)? |
| P3 | **Compreensível** | A informação e a operação são previsíveis e legíveis? |
| P4 | **Robusto** | O conteúdo é interpretável de forma confiável por agentes atuais e futuros, incluindo tecnologias assistivas? |

---

## 2. Conformância: requisitos globais

Para declarar conformidade **AA**, **todos** estes requisitos DEVEM ser satisfeitos:

1. **Nível AA pleno:** todos os 25 critérios de nível A e os 13 de nível AA são atendidos (ou existe alternativa conforme).
2. **Páginas completas:** conformidade NÃO PODE ser parcial; uma página/tela inteira atende ou não atende.
3. **Processos completos:** se uma página é parte de um processo (ex.: checkout), todas as páginas do processo DEVEM atender ao nível declarado.
4. **Uso somente de tecnologias suportadas por acessibilidade:** se uma funcionalidade depende de tecnologia sem suporte de TA, DEVE haver alternativa acessível.
5. **Não interferência:** mesmo conteúdo não usado para satisfazer critérios NÃO PODE violar 1.4.2 (controle de áudio), 2.1.2 (sem armadilha de teclado), 2.3.1 (flashes) e 2.2.2 (pausar/parar/ocultar).

**Alternativas conformes (conforming alternate version):** se uma versão não conforme existe, DEVE haver mecanismo acessível para alcançar a versão conforme com conteúdo equivalente, e a versão conforme NÃO PODE depender de URL específico que exija JS para chegar lá sem fallback.

---

## 3. Critérios de sucesso — regras normativas

Formato de cada item:

> **ID — Título (Nível)**
> **Regra:** o que DEVE ser verdadeiro.
> **Implementar:** padrão técnico agnóstico + adaptações.
> **Validar:** teste objetivo (passa/falha).

---

### Princípio 1 — Perceptível

#### Diretriz 1.1 Alternativas em texto

**1.1.1 — Conteúdo não textual (A)**

**Regra:** Todo conteúdo não textual apresentado ao usuário DEVE ter alternativa em texto com propósito equivalente, exceto: controles (têm nome acessível), mídia temporal (ver 1.2), testes que perderiam validade em texto (têm identificação descritiva), conteúdo sensorial (tem identificação descritiva), CAPTCHA (tem descrição do propósito + alternativa em modalidade sensorial distinta), decoração/formatação (DEVE ser ignorável por TA).

**Implementar:**
- **Web:** `<img alt="descrição funcional">` para imagens significativas; `<img alt="" role="presentation">` para decorativas; `aria-label` ou `aria-labelledby` para ícones interativos; `<svg role="img" aria-label="...">` em SVGs informativos; `<figure>` + `<figcaption>` para descrição associada.
- **Mobile (iOS):** `accessibilityLabel` em todo elemento interativo ou informativo; decoração com `isAccessibilityElement = false`.
- **Mobile (Android):** `contentDescription` em `ImageView`/`ImageButton`; decoração com `importantForAccessibility="no"`.
- **Texto da alternativa:** descreva a **função** (em controles) ou a **informação transmitida** (em conteúdo). NÃO inclua "imagem de", "ícone de" — TA já anuncia o papel.
- **CAPTCHA:** ofereça pelo menos duas modalidades (visual + auditiva) e um propósito textual.

**Validar:**
1. Para cada elemento não textual: existe `alt`/`accessibilityLabel`/`contentDescription` ou está marcado como decoração?
2. O texto alternativo transmite o mesmo propósito que o elemento visual? (revisão manual)
3. Imagens decorativas estão ocultas de TA?
4. Controles baseados em ícone têm nome acessível?

---

#### Diretriz 1.2 Mídia baseada em tempo

**1.2.1 — Áudio-apenas e Vídeo-apenas (gravado) (A)**

**Regra:** Para mídia gravada apenas em áudio, DEVE haver alternativa textual equivalente. Para mídia gravada apenas em vídeo, DEVE haver alternativa textual OU faixa de áudio com informação equivalente. Exceção: a mídia é uma alternativa para texto e isso está rotulado claramente.

**Implementar:** Transcrição completa do áudio em página associada com link contíguo ao player. Para vídeo-apenas: descrição textual completa do conteúdo visual ou narração em áudio.

**Validar:** Existe transcrição linkada? A transcrição cobre **toda** a informação relevante (não só fala — sons relevantes também)?

---

**1.2.2 — Legendas (gravado) (A)**

**Regra:** Toda mídia sincronizada gravada com áudio DEVE ter legendas. Exceção: a mídia é alternativa para texto rotulada como tal.

**Implementar:**
- **Web:** `<track kind="captions" srclang="pt-BR" src="...vtt" default>` em `<video>`. Use WebVTT.
- Legendas DEVEM incluir: fala, identificação de quem fala (quando ambíguo), sons não verbais relevantes (`[risos]`, `[música tensa]`).
- **NÃO PODEM** ser legendas abertas (queimadas no vídeo) sem alternativa, pois impedem customização. Prefira legendas fechadas.

**Validar:** Legendas presentes? Sincronizadas? Cobrem áudio não verbal relevante? Idioma correto declarado?

---

**1.2.3 — Audiodescrição ou alternativa textual (gravado) (A)**

**Regra:** Para vídeo gravado em mídia sincronizada, DEVE haver audiodescrição OU alternativa textual com informação equivalente.

**Implementar:** Faixa de audiodescrição (`<track kind="descriptions">`) OU documento textual descrevendo cenas visuais não cobertas pelo áudio principal (ação, expressões, texto na tela).

**Validar:** Informação visual relevante está disponível a quem não vê o vídeo?

---

**1.2.4 — Legendas (ao vivo) (AA)**

**Regra:** Todo áudio ao vivo em mídia sincronizada DEVE ter legendas em tempo real.

**Implementar:** Integração com serviço de legendagem ao vivo (estenotipia ou ASR humano-assistido). ASR puro tipicamente não atinge a precisão necessária; valide qualidade.

**Validar:** Latência aceitável (<3s ideal)? Precisão >95%? Identificação de falantes?

---

**1.2.5 — Audiodescrição (gravado) (AA)**

**Regra:** Todo vídeo gravado em mídia sincronizada DEVE ter audiodescrição.

**Implementar:** Faixa de áudio adicional descrevendo elementos visuais nas pausas do áudio principal. Para vídeos sem pausas suficientes, considere versão estendida (que é AAA — 1.2.7).

**Validar:** Faixa de descrição presente e ativável? Cobre informação visual essencial?

---

#### Diretriz 1.3 Adaptável

**1.3.1 — Informação e relações (A)**

**Regra:** Informação, estrutura e relações transmitidas por apresentação DEVEM ser determináveis programaticamente OU disponíveis em texto.

**Implementar:**
- **Cabeçalhos:** `<h1>`–`<h6>` em ordem hierárquica (sem pular níveis para baixo). UM `<h1>` por documento.
- **Listas:** `<ul>`/`<ol>`/`<dl>` quando conteúdo é lista, NÃO use parágrafos com marcadores manuais.
- **Tabelas de dados:** `<table>` + `<caption>` + `<thead>`/`<tbody>` + `<th scope="col|row">`. Para tabelas complexas: `headers`+`id`.
- **Formulários:** `<label for="id">` ou `<label>` envolvendo o controle; agrupamentos com `<fieldset>`+`<legend>`.
- **Regiões:** `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>` ou landmarks ARIA (`role="banner|navigation|main|complementary|contentinfo"`).
- **Listas semânticas em ARIA quando necessário:** `role="list"`/`role="listitem"`.
- **Mobile:** declare hierarquia via `accessibilityRole` (iOS: `.header`, `.button`; Android: `Accessibility.Heading`).
- **NÃO PODE:** transmitir relações apenas por CSS (negrito = título, indentação = hierarquia) sem marcação semântica.

**Validar:**
1. A hierarquia de cabeçalhos faz sentido isolada (gere outline e revise)?
2. Toda tabela de dados tem `<th>` corretos com `scope`?
3. Todo input tem `<label>` associado programaticamente?
4. Landmarks cobrem áreas principais sem duplicação?
5. Inspeção via árvore de acessibilidade (DevTools/Accessibility Inspector) revela todas as relações visuais?

---

**1.3.2 — Sequência significativa (A)**

**Regra:** Quando a sequência de apresentação afeta o significado, a ordem correta de leitura DEVE ser determinável programaticamente.

**Implementar:**
- A ordem do DOM/árvore nativa DEVE corresponder à ordem de leitura visual.
- `tabindex` positivo (>0) NÃO PODE ser usado para reordenar — quebra previsibilidade.
- CSS `order`, `flex-direction: row-reverse`, `grid-area` NÃO PODEM alterar a sequência lógica.

**Validar:** Desabilite CSS e leia o conteúdo. A ordem permanece coerente?

---

**1.3.3 — Características sensoriais (A)**

**Regra:** Instruções NÃO PODEM depender exclusivamente de forma, tamanho, localização visual, orientação ou som.

**Implementar:**
- ❌ "Clique no botão verde à direita"
- ✅ "Clique em **Confirmar** (botão verde à direita)"
- Sempre combine referência sensorial com identificação textual (rótulo, nome ou ID lógico).

**Validar:** Procure instruções com termos: "acima", "abaixo", "à direita", "ícone redondo", "azul", "som de aviso". Cada uma DEVE ter complemento textual.

---

#### Diretriz 1.4 Distinguível

**1.4.1 — Uso de cor (A)**

**Regra:** Cor NÃO PODE ser o único meio visual de transmitir informação, indicar ação, solicitar resposta ou distinguir elemento.

**Implementar:**
- Erros em formulário: cor vermelha **+** ícone **+** texto.
- Links em texto corrido: cor diferente **+** sublinhado (ou outro indicador não cromático).
- Gráficos: cor **+** padrão de hachura, rótulo direto ou forma distinta.
- Estados (ativo/inativo): cor **+** texto, borda, ícone ou negrito.

**Validar:** Converta a tela para escala de cinza. Toda informação permanece distinguível?

---

**1.4.2 — Controle de áudio (A)**

**Regra:** Áudio que toca automaticamente por mais de 3 segundos DEVE ter mecanismo para pausar/parar OU controle de volume independente do volume do sistema.

**Implementar:**
- Padrão recomendado: **não reproduzir áudio automaticamente**.
- Se inevitável: botão de pausa/parar visível e operável por teclado nos primeiros segundos.
- Volume independente: slider próprio que NÃO PODE simplesmente mutar — DEVE controlar nível.

**Validar:** Há autoplay? Há controle? O controle é alcançável por teclado antes do áudio terminar?

---

**1.4.3 — Contraste (mínimo) (AA)**

**Regra:** Texto e imagens de texto DEVEM ter razão de contraste com fundo de pelo menos:
- **4.5:1** para texto normal.
- **3:1** para texto grande (≥18pt regular ou ≥14pt negrito; ≥24px regular ou ≥19px negrito).

**Exceções:** texto em componente desativado; decoração pura; texto invisível; texto parte de logotipo/marca; texto em imagem com conteúdo visual significativo (ex.: legenda em foto).

**Implementar:**
- Calcule contraste pela fórmula WCAG (luminância relativa). Use ferramentas (axe, WebAIM Contrast Checker).
- Defina tokens de design com pares texto/fundo pré-validados.
- Estados hover/focus/active DEVEM manter contraste (não apenas o estado padrão).
- Texto sobre imagem: use overlay sólido/gradiente garantindo contraste no pior pixel.

**Validar:** Para cada combinação texto+fundo, calcule contraste. Verifique placeholders, texto em botões, mensagens de erro, links, estados desabilitados informativos.

**Nota (WCAG 2.1):** Critério **1.4.11 Non-text Contrast** (AA, pós-2.0) exige 3:1 para componentes de interface (bordas de input, ícones de estado, indicador de foco). Considere atender — é exigência de mercado.

---

**1.4.4 — Redimensionar texto (AA)**

**Regra:** Texto DEVE poder ser redimensionado até 200% sem tecnologia assistiva e sem perda de conteúdo ou funcionalidade. Exceto legendas e imagens de texto.

**Implementar:**
- Use unidades relativas (`rem`, `em`, `%`) para `font-size`; NÃO use `px` fixo em texto principal.
- Layouts DEVEM reflow corretamente (sem cortar conteúdo, sem sobreposição, sem rolagem horizontal em texto).
- Containers com `overflow: hidden` em textos quebram este critério.
- **Mobile:** respeite o tamanho de fonte do sistema (`UIFontMetrics` no iOS; `sp` em vez de `dp` no Android).

**Validar:** Aplique zoom de 200% no navegador. Texto cortou? Sobrepôs? Sumiu? Houve rolagem horizontal indevida?

---

**1.4.5 — Imagens de texto (AA)**

**Regra:** Se a tecnologia disponível permite renderizar com texto real, NÃO PODE usar imagem de texto. Exceções: imagem é customizável visualmente conforme requisitos do usuário; ou a apresentação específica é essencial (ex.: logotipo, fac-símile).

**Implementar:**
- Use HTML+CSS para qualquer texto que poderia ser imagem (banners, headers decorativos, calls-to-action).
- Web fonts permitem alcançar 99% dos efeitos antes feitos com imagem.
- Se imagem de texto for inevitável, forneça em alta resolução e considere SVG com `<title>`+`<desc>`.

**Validar:** Há imagens contendo texto significativo? Esse texto poderia ser renderizado nativamente?

---

### Princípio 2 — Operável

#### Diretriz 2.1 Acessível por teclado

**2.1.1 — Teclado (A)**

**Regra:** Toda funcionalidade DEVE ser operável via interface de teclado, sem timing específico por tecla. Exceção: funções que requerem entrada dependente do caminho do movimento (ex.: desenho à mão livre).

**Implementar:**
- Use elementos nativamente focáveis (`<a href>`, `<button>`, `<input>`, `<select>`, `<textarea>`). Elementos genéricos (`<div>`, `<span>`) usados como interativos DEVEM ter `tabindex="0"`, `role` apropriado e handlers de teclado (`Enter`/`Space`).
- Atalhos customizados DEVEM ser documentados e não conflitar com TA.
- **Mobile:** equivalente é navegação por switch/external keyboard; teste com Bluetooth keyboard + VoiceOver/TalkBack.
- Drag-and-drop DEVE ter alternativa por teclado (botões mover acima/abaixo, atalhos, comandos).

**Validar:** Desconecte o mouse. Toda função é acessível? Cada controle responde a `Enter`/`Space` conforme convenção?

---

**2.1.2 — Sem armadilha de teclado (A)**

**Regra:** Se o foco do teclado pode ser movido para um componente, ele DEVE poder ser movido para fora usando apenas teclado. Se exige teclas além de Tab/setas, o usuário DEVE ser avisado.

**Implementar:**
- Modais DEVEM ter focus trap **e** mecanismo de saída (`Esc`, botão fechar).
- Componentes embarcados (iframes de terceiros, plugins) DEVEM permitir saída por Tab.
- Editores de texto rico que capturam Tab DEVEM oferecer atalho documentado para sair (ex.: `Esc` seguido de Tab).

**Validar:** Tabule por toda a tela e por todos os modais. Em algum ponto o foco fica preso sem rota de saída?

---

#### Diretriz 2.2 Tempo suficiente

**2.2.1 — Tempo ajustável (A)**

**Regra:** Para cada limite de tempo, pelo menos uma destas condições DEVE ser verdadeira: desabilitar; ajustar até 10× o padrão; estender ao menos 10× via aviso prévio com 20s+; exceção real-time; exceção essencial; ou >20h.

**Implementar:**
- Sessões com timeout: aviso 20s+ antes; botão "Estender" com foco programático.
- Carrosséis automáticos: pausa + controles (relacionado a 2.2.2).
- Preencimento de formulário: salve estado antes de invalidar sessão.

**Validar:** Há timeouts? Há aviso? Há controle?

---

**2.2.2 — Pausar, parar, ocultar (A)**

**Regra:** Para informação em movimento, piscante, com rolagem ou autoatualizada que (1) inicia automaticamente, (2) dura mais de 5s, (3) é apresentada em paralelo a outro conteúdo, DEVE haver mecanismo para pausar/parar/ocultar — exceto se essencial à atividade.

**Implementar:**
- Carrosséis: botão pausa visível, focável, com `aria-label="Pausar carrossel"`.
- Animações decorativas (>5s): respeite `prefers-reduced-motion`.
- Conteúdo autoatualizado (feeds, tickers): controle de pausa e frequência.

**Validar:** Há movimento contínuo por >5s? Há controle? Funciona por teclado?

---

#### Diretriz 2.3 Convulsões

**2.3.1 — Três flashes ou abaixo do limiar (A)**

**Regra:** Páginas NÃO PODEM conter nada que pisque mais de 3 vezes em 1 segundo, OU o flash DEVE estar abaixo dos limiares de flash geral e flash vermelho.

**Implementar:**
- Evite animações com mudanças bruscas de luminância em alta frequência.
- Em vídeo gerado dinamicamente, pré-processe para detectar PEAT (Photosensitive Epilepsy Analysis Tool).

**Validar:** Conteúdo piscante? Frequência ≤3 Hz? Área de flash >25% da viewport?

---

#### Diretriz 2.4 Navegável

**2.4.1 — Bypass de blocos (A)**

**Regra:** DEVE haver mecanismo para pular blocos de conteúdo repetidos em múltiplas páginas.

**Implementar:**
- **Web:** "Skip link" no topo do documento, visível ao receber foco:
  ```html
  <a href="#main" class="skip-link">Pular para o conteúdo</a>
  ```
  Estilo: oculto fora do foco (NÃO use `display:none` — quebra foco), revelado ao focar.
- Alternativa: landmarks ARIA bem definidas permitem navegação direta via TA.
- **Mobile:** rotor (iOS) ou navegação por landmarks (TalkBack) cumpre se a estrutura semântica estiver correta.

**Validar:** Existe skip link funcional? Aparece ao focar? Move o foco efetivamente?

---

**2.4.2 — Página com título (A)**

**Regra:** Páginas DEVEM ter títulos que descrevam tópico ou propósito.

**Implementar:**
- **Web:** `<title>` único, descritivo, com padrão `[Página] - [Site]`.
- **SPAs:** atualize `document.title` em cada navegação; anuncie via `aria-live` em região de status.
- **Mobile:** título da tela visível e definido em `navigationItem.title`/`Toolbar.title`.

**Validar:** Cada rota tem título único? Reflete o conteúdo?

---

**2.4.3 — Ordem do foco (A)**

**Regra:** Se a navegação sequencial afeta significado/operação, componentes focáveis DEVEM receber foco em ordem que preserve significado.

**Implementar:**
- Ordem do DOM = ordem visual = ordem de foco. Evite `tabindex` positivo.
- Em modais, foco DEVE ir para dentro ao abrir e voltar ao elemento disparador ao fechar.
- Conteúdo adicionado dinamicamente DEVE entrar no fluxo natural ou receber foco programaticamente quando aplicável.

**Validar:** Tabule pela tela. A ordem segue a leitura visual? Modais retornam foco ao fechar?

---

**2.4.4 — Propósito do link (no contexto) (A)**

**Regra:** O propósito de cada link DEVE ser determinável pelo texto do link sozinho OU pelo texto + contexto programaticamente determinado (mesma frase, parágrafo, item de lista, célula da tabela ou cabeçalho).

**Implementar:**
- ❌ "Clique aqui", "Leia mais", "Saiba mais" sem contexto.
- ✅ "Leia o relatório anual 2025".
- Se o texto curto for inevitável: contexto da mesma sentença ou `aria-label`/`aria-labelledby` complementando.
- Links com mesmo texto DEVEM apontar para mesmo destino ou ter contexto que os distinga.

**Validar:** Liste todos os links da página (a maioria das TA faz isso). Cada um é compreensível isolado?

---

**2.4.5 — Múltiplas formas (AA)**

**Regra:** DEVE haver mais de uma forma de localizar uma página dentro de um conjunto, exceto quando a página é resultado de um processo.

**Implementar:** Forneça ≥2 destes: navegação principal, busca, mapa do site, índice, breadcrumb, links relacionados.

**Validar:** Há ≥2 mecanismos? Excluiu corretamente páginas que são etapas de processo?

---

**2.4.6 — Cabeçalhos e rótulos (AA)**

**Regra:** Cabeçalhos e rótulos DEVEM descrever tópico ou propósito.

**Implementar:**
- Cabeçalhos: sintéticos, específicos, únicos quando possível dentro da página.
- Rótulos de formulário: específicos ("E-mail corporativo" > "E-mail" quando há ambiguidade).
- Evite cabeçalhos genéricos: "Informações", "Detalhes", "Outras coisas".

**Validar:** Leia apenas os cabeçalhos da página em sequência. Funcionam como sumário?

---

**2.4.7 — Foco visível (AA)**

**Regra:** Toda interface operável por teclado DEVE ter modo de operação em que o indicador de foco é visível.

**Implementar:**
- NUNCA remova `:focus` sem substituto: `outline: none` desacompanhado de outro indicador viola este critério.
- Indicador DEVE ter contraste suficiente (3:1 recomendado, alinhado com 2.1 1.4.11) com fundos adjacentes e estado padrão.
- Customização aceitável: borda, sombra, mudança de cor, sublinhado — desde que perceptível.
- Considere `:focus-visible` para mostrar foco apenas em navegação por teclado.

**Validar:** Tabule pela tela. Em **todo** componente focável o foco é visualmente óbvio?

---

### Princípio 3 — Compreensível

#### Diretriz 3.1 Legível

**3.1.1 — Idioma da página (A)**

**Regra:** O idioma humano padrão da página DEVE ser determinável programaticamente.

**Implementar:**
- **Web:** `<html lang="pt-BR">` (ou outro código BCP 47).
- **Mobile:** declarado no manifesto/Info.plist; localização ativa.
- NÃO use apenas `lang="pt"` se conteúdo é pt-BR.

**Validar:** `<html>` tem `lang` válido? Corresponde ao idioma real?

---

**3.1.2 — Idioma de partes (AA)**

**Regra:** O idioma humano de cada passagem/frase no conteúdo DEVE ser determinável programaticamente. Exceções: nomes próprios, termos técnicos, palavras de idioma indeterminado, palavras incorporadas ao vernáculo do entorno.

**Implementar:**
- Trechos em idioma diferente: `<span lang="en">deadline</span>` quando relevante.
- Não marque cada anglicismo cotidiano (ex.: "site", "email") — só quando a pronúncia correta importa para compreensão.

**Validar:** Há trechos significativos em outro idioma sem `lang`?

---

#### Diretriz 3.2 Previsível

**3.2.1 — Em foco (A)**

**Regra:** Quando um componente recebe foco, NÃO PODE iniciar mudança de contexto.

**Definição de "mudança de contexto":** mudança importante de janela, ponto de foco, conteúdo que altera significativamente o significado da página, ou agente de usuário.

**Implementar:**
- NÃO submeta formulário ao focar campo.
- NÃO abra novo popup/janela ao focar.
- NÃO navegue para outra URL ao receber foco.

**Validar:** Tabule por todos os controles. Algum dispara navegação/submissão/popup só por receber foco?

---

**3.2.2 — Em entrada (A)**

**Regra:** Mudar a configuração de um componente NÃO PODE causar mudança de contexto automática, exceto se o usuário foi avisado antes.

**Implementar:**
- `<select>` NÃO PODE submeter ou navegar `onchange` — adicione botão "Aplicar".
- Checkbox/radio NÃO PODE recarregar a página automaticamente sem aviso prévio explícito.
- Se o comportamento for desejado, documente: "Selecionar uma opção atualizará a lista abaixo automaticamente".

**Validar:** Alterar qualquer controle causa navegação/submissão/abertura inesperada?

---

**3.2.3 — Navegação consistente (AA)**

**Regra:** Mecanismos de navegação repetidos em múltiplas páginas DEVEM ocorrer na mesma ordem relativa cada vez, exceto se a mudança for iniciada pelo usuário.

**Implementar:**
- Menu principal, rodapé, busca: posição e ordem **idênticas** entre páginas do mesmo conjunto.
- Personalização ativada pelo usuário (ex.: drag-and-drop de widgets) é exceção permitida.

**Validar:** Compare a posição/ordem de header, menu, footer entre 3+ páginas. Consistente?

---

**3.2.4 — Identificação consistente (AA)**

**Regra:** Componentes com mesma funcionalidade dentro de um conjunto de páginas DEVEM ser identificados consistentemente.

**Implementar:**
- Botão "Salvar" não pode ser "Salvar" em uma tela e "Guardar" em outra para mesma ação.
- Ícone de busca DEVE ter mesmo `aria-label` em todas as ocorrências.
- Mantenha glossário de termos e nomes acessíveis.

**Validar:** Funções idênticas têm rótulo idêntico em todas as ocorrências?

---

#### Diretriz 3.3 Assistência de entrada

**3.3.1 — Identificação de erro (A)**

**Regra:** Se erro de entrada é detectado automaticamente, o item em erro DEVE ser identificado e o erro descrito ao usuário em texto.

**Implementar:**
- Identifique o campo: borda colorida + ícone + associação programática (`aria-invalid="true"`).
- Descreva em texto: mensagem específica ("E-mail deve conter @").
- Vincule mensagem ao campo: `aria-describedby="erro-email"`.
- Anuncie em TA: `role="alert"` ou região `aria-live="assertive"` para sumário de erros.
- NÃO confie apenas em cor para sinalizar erro (combina com 1.4.1).

**Validar:** Envie formulário inválido. O campo errado é identificado? A mensagem é específica? TA anuncia?

---

**3.3.2 — Rótulos ou instruções (A)**

**Regra:** Rótulos ou instruções DEVEM ser fornecidos quando o conteúdo requer entrada do usuário.

**Implementar:**
- Todo `<input>`/`<select>`/`<textarea>` tem `<label>` visível.
- Placeholder NÃO substitui label — desaparece ao digitar e tem baixo contraste por padrão.
- Instruções de formato (ex.: "DD/MM/AAAA"), obrigatoriedade, restrições: visíveis e associadas programaticamente (`aria-describedby`).
- Asterisco para obrigatório DEVE ter explicação ("* campos obrigatórios") **e** `required`/`aria-required="true"`.

**Validar:** Cada campo tem label visível? Restrições estão claras antes do erro?

---

**3.3.3 — Sugestão de erro (AA)**

**Regra:** Se erro é detectado e sugestões de correção são conhecidas, elas DEVEM ser oferecidas, exceto se comprometer segurança ou propósito.

**Implementar:**
- Email mal formado: "Você quis dizer usuario@exemplo.com?"
- Data inválida: mostre formato esperado e exemplo válido.
- CPF inválido: indique qual dígito está incorreto, se possível, sem expor dado sensível.
- Senha (exceção parcial): NÃO sugira valor, mas indique requisitos não atendidos.

**Validar:** Em cada erro detectável, há sugestão útil quando aplicável?

---

**3.3.4 — Prevenção de erro (legal, financeiro, dados) (AA)**

**Regra:** Para páginas que causam compromissos legais, transações financeiras, modificam/excluem dados ou submetem respostas de teste, ao menos uma DEVE ser verdadeira: (1) Reversível; (2) Verificada (erros detectados, oportunidade de correção); (3) Confirmada (revisão antes de finalizar).

**Implementar:**
- Tela de confirmação antes de finalizar pagamento, contrato, exclusão.
- Operações destrutivas com confirmação dupla **e** reversão (lixeira/undo).
- Validação completa antes do envio + tela de revisão.

**Validar:** Operações sensíveis têm um dos três mecanismos? A confirmação é genuína (não apenas botão duplo)?

---

### Princípio 4 — Robusto

#### Diretriz 4.1 Compatível

**4.1.1 — Parsing (A)**

**Regra:** Em conteúdo com linguagens de marcação, elementos DEVEM ter tags de início e fim completas, aninhamento conforme spec, sem atributos duplicados, IDs únicos — exceto onde a spec permite.

**Implementar:**
- HTML válido segundo W3C Validator.
- IDs únicos no documento (problema clássico: componentes reutilizados duplicando IDs).
- Tags fechadas adequadamente; aninhamento respeitando modelo de conteúdo (ex.: `<p>` não pode conter `<div>`).

**Validar:** W3C Validator + verificação de IDs duplicados via `document.querySelectorAll('[id]')` agrupado.

**Nota:** Em WCAG 2.2 este critério foi **removido** (parsers modernos toleram erros). Para conformância 2.0 declarada, **permanece obrigatório**.

---

**4.1.2 — Nome, papel, valor (A)**

**Regra:** Para todos os componentes de interface (incluindo formulários, links, scripts), nome e papel DEVEM ser programaticamente determináveis; estados, propriedades e valores que podem ser ajustados pelo usuário DEVEM ser programaticamente ajustáveis; e notificação de mudanças nesses itens DEVE ser disponível para TA.

**Este é o critério mais violado em interfaces customizadas (React/Vue/Angular com componentes próprios).**

**Implementar:**
- Prefira elementos HTML nativos (`<button>`, `<input type="checkbox">`) — nome/papel/valor vêm grátis.
- Para componentes customizados (`<div>` como botão, dropdowns custom, modais, tabs, accordions):
  - **Papel (role):** ARIA role apropriado (`role="button|tab|menu|dialog|switch|...`).
  - **Nome:** texto interno, `aria-label`, ou `aria-labelledby`.
  - **Estado/valor:** `aria-expanded`, `aria-selected`, `aria-checked`, `aria-pressed`, `aria-current`, `aria-disabled`, `aria-hidden`, `aria-valuenow|min|max`.
- Siga **ARIA Authoring Practices Guide** para padrões de widgets (não invente teclado).
- Mudanças dinâmicas: `aria-live="polite|assertive"` em região apropriada para anúncios.
- **Mobile:** APIs nativas de acessibilidade (UIAccessibility, AccessibilityNodeInfo) — NÃO use apenas mudanças visuais para representar estado.

**Validar:**
1. Inspecione a árvore de acessibilidade (Chrome DevTools, Accessibility Insights, Xcode Accessibility Inspector, Android Accessibility Scanner).
2. Cada controle expõe **nome + papel + estado + valor**?
3. Mudança de estado é refletida na árvore?
4. Teste com leitor de tela real (NVDA, JAWS, VoiceOver, TalkBack): o leitor anuncia corretamente?

---

## 4. Checklists de validação por critério

Estes checklists DEVEM ser executados sequencialmente. Cada item retorna `PASS`/`FAIL`/`NA` com evidência.

### 4.1 Checklist automatizável (executar primeiro)

> Ferramentas: axe-core, Lighthouse, Pa11y, WAVE, Accessibility Insights, ANDI. Cobrem ~30-40% dos critérios.

- [ ] **1.1.1** Todo `<img>` tem `alt` (vazio para decoração, descritivo para conteúdo)
- [ ] **1.1.1** Todo controle baseado em ícone tem nome acessível
- [ ] **1.3.1** Hierarquia de cabeçalhos sem pulos (h1→h3 sem h2)
- [ ] **1.3.1** Inputs com `<label>` associado
- [ ] **1.3.1** Tabelas de dados com `<th>` e `scope`
- [ ] **1.3.1** Landmarks presentes (`<main>`, `<nav>`, etc.)
- [ ] **1.4.3** Todo texto atinge razão 4.5:1 (3:1 para texto grande)
- [ ] **2.4.2** `<title>` presente e descritivo
- [ ] **3.1.1** `<html lang>` válido
- [ ] **4.1.1** HTML válido, IDs únicos
- [ ] **4.1.2** Componentes ARIA com `role`+`aria-*` válidos para o padrão

### 4.2 Checklist manual de teclado

- [ ] **2.1.1** Toda função executável sem mouse
- [ ] **2.1.2** Nenhum ponto da interface prende foco
- [ ] **2.4.1** Skip link presente, visível ao focar, funcional
- [ ] **2.4.3** Ordem de Tab segue ordem visual
- [ ] **2.4.7** Foco visível em todo elemento focável
- [ ] **3.2.1** Focar componente não causa mudança de contexto
- [ ] **3.2.2** Alterar valor não causa mudança de contexto sem aviso

### 4.3 Checklist manual visual/cognitivo

- [ ] **1.3.3** Instruções não dependem só de localização/forma/cor
- [ ] **1.4.1** Cor não é único meio de transmitir informação
- [ ] **1.4.4** Zoom 200% não quebra layout, não corta texto
- [ ] **1.4.5** Texto significativo não é imagem (exceto exceções)
- [ ] **2.4.4** Texto dos links faz sentido isolado
- [ ] **2.4.6** Cabeçalhos e rótulos descritivos
- [ ] **3.2.3** Navegação na mesma posição/ordem em todas as páginas
- [ ] **3.2.4** Mesma função tem mesmo nome em toda a aplicação
- [ ] **3.3.2** Todo campo tem label visível e instruções claras

### 4.4 Checklist de mídia

- [ ] **1.2.1** Áudio/vídeo-apenas têm transcrição
- [ ] **1.2.2** Vídeo gravado tem legendas
- [ ] **1.2.3** Vídeo gravado tem audiodescrição OU transcrição estendida
- [ ] **1.2.4** Áudio ao vivo tem legendas
- [ ] **1.2.5** Vídeo gravado tem audiodescrição
- [ ] **1.4.2** Sem autoplay >3s sem controle

### 4.5 Checklist de formulários e erros

- [ ] **2.2.1** Timeouts ajustáveis/desabilitáveis/estendíveis
- [ ] **3.3.1** Erros identificados visualmente E programaticamente E em texto
- [ ] **3.3.2** Labels e instruções presentes antes do erro
- [ ] **3.3.3** Sugestões de correção quando conhecidas
- [ ] **3.3.4** Operações legais/financeiras/destrutivas têm reversão, verificação OU confirmação

### 4.6 Checklist com leitor de tela (manual)

- [ ] **1.1.1** Imagens informativas têm descrição compreensível anunciada
- [ ] **1.3.1** Estrutura (cabeçalhos, listas, tabelas) navegável e coerente
- [ ] **3.1.1/3.1.2** Idioma correto na pronúncia
- [ ] **3.3.1** Erros são anunciados ao serem disparados
- [ ] **4.1.2** Componentes customizados anunciam nome + papel + estado correto
- [ ] **4.1.2** Mudanças dinâmicas (modais, toasts, validação) são anunciadas

### 4.7 Checklist de animação e flashes

- [ ] **2.2.2** Conteúdo em movimento >5s pode ser pausado
- [ ] **2.3.1** Nada pisca >3×/segundo
- [ ] **(2.1, recomendado) prefers-reduced-motion** respeitado

---

## 5. Checklists por tipo de artefato

### 5.1 Página/tela genérica
1. Idioma declarado (3.1.1) e título único (2.4.2).
2. Estrutura semântica: h1 único, hierarquia sem pulos, landmarks (1.3.1).
3. Skip link funcional (2.4.1).
4. Todo texto com contraste ≥4.5:1 (1.4.3).
5. Zoom 200% sem perda (1.4.4).
6. Ordem de Tab lógica (2.4.3) com foco visível (2.4.7).
7. Navegação consistente com outras páginas (3.2.3/3.2.4).

### 5.2 Formulário
1. Cada campo tem `<label>` visível (3.3.2).
2. Agrupamentos via `<fieldset>`/`<legend>` (1.3.1).
3. Campos obrigatórios indicados textualmente + `required` (3.3.2).
4. Validação: identifica campo (3.3.1) + descreve erro em texto (3.3.1) + sugere correção (3.3.3) + associa via `aria-describedby`.
5. Erros anunciados (4.1.2) em `role="alert"` ou live region.
6. Operações sensíveis: confirmação/reversão/verificação (3.3.4).
7. Inputs com `autocomplete` apropriado (boa prática; **2.1 1.3.5** torna AA).

### 5.3 Componente interativo customizado (dropdown, modal, tab, accordion, menu)
1. Use padrão da **ARIA APG** correspondente.
2. Role correto (`role="dialog|menu|tablist|...`).
3. Nome acessível (`aria-label`/`aria-labelledby`).
4. Estado refletido (`aria-expanded`, `aria-selected`, etc.) e atualizado dinamicamente.
5. Teclado conforme padrão APG (setas, Home/End, Esc).
6. Foco gerenciado (modais: trap + retorno; menus: setas dentro, Tab fora).
7. Anúncio de mudanças relevantes via live region quando aplicável.

### 5.4 Mídia (vídeo/áudio)
1. Player nativo ou customizado com controles teclado-acessíveis.
2. Legendas (1.2.2) e audiodescrição (1.2.5).
3. Transcrição linkada (1.2.1).
4. Sem autoplay com áudio >3s sem controle (1.4.2).
5. Controles com nome, papel e estado (4.1.2).

### 5.5 Tabela de dados
1. `<table>` semântico (não `<div>` com display:table).
2. `<caption>` descritivo.
3. `<th scope="col|row">` em cabeçalhos.
4. Tabelas complexas: `id`+`headers`.
5. Não use tabela para layout.

### 5.6 Navegação principal
1. `<nav>` com `aria-label` se houver múltiplas (3.2.3).
2. Item atual marcado: `aria-current="page"`.
3. Submenus com teclado e ARIA conforme APG.
4. Mesma estrutura/ordem entre páginas (3.2.3).

### 5.7 Imagem/ícone
1. Decorativa: `alt=""` ou `aria-hidden="true"`; nunca anunciada.
2. Informativa: `alt` descreve conteúdo/função (1.1.1).
3. Funcional (botão-ícone): `aria-label` descreve ação.
4. SVG informativo: `role="img"` + `<title>` ou `aria-label`.
5. Imagem com texto: evite (1.4.5); se inevitável, `alt` contendo o texto.

---

## 6. Ferramentas de validação automatizada

Use combinação; nenhuma cobre tudo. Conforme estudos (axe, Deque), automação detecta ~30–40% dos problemas WCAG.

| Ferramenta | Tipo | Plataforma |
|---|---|---|
| **axe-core** / axe DevTools | Lib JS, extensão | Web (engine base de várias outras) |
| **Lighthouse** | Auditoria embutida | Chrome DevTools |
| **WAVE** | Extensão visual | Web |
| **Pa11y** | CLI/CI | Web (CI/CD) |
| **Accessibility Insights** | App + extensão | Web + Windows |
| **NVDA** (Win), **JAWS** (Win), **VoiceOver** (mac/iOS), **TalkBack** (Android) | Leitores de tela | Validação manual obrigatória |
| **Accessibility Inspector** | Inspeção de árvore | macOS/Xcode |
| **Accessibility Scanner** | App | Android |
| **PEAT** | Análise de flashes | Mídia |

**Pipeline recomendado (CI/CD):**
1. Lint estático (eslint-plugin-jsx-a11y para React, vue-a11y para Vue) — bloqueia merge.
2. Pa11y/axe-core em testes E2E — bloqueia build em violações críticas.
3. Auditoria manual periódica com leitor de tela em rotas críticas.
4. Validação com usuários reais em milestones.

---

## 7. Regras operacionais para a IA implementadora

Ao gerar código ou revisar interfaces, **siga esta ordem de prioridade**:

1. **Use semântica nativa antes de ARIA.** `<button>` > `<div role="button">`. ARIA é correção, não substituição.
2. **Não invente padrões de teclado.** Consulte ARIA APG para qualquer widget composto.
3. **Não remova foco sem substituto.** `outline:none` exige outro indicador visual.
4. **Não use cor isolada.** Sempre combine com texto, ícone, padrão ou posição contextualizada.
5. **Não dependa de placeholder como label.**
6. **Não use `<div>` clicável sem `role`, `tabindex`, e handlers de teclado.**
7. **Não use texto como imagem** quando texto real serve.
8. **Não force unidades absolutas em texto.** Use `rem`/`em`.
9. **Não use `aria-hidden="true"` em elemento focável** — quebra navegação.
10. **Não duplique IDs.**
11. **Anuncie mudanças dinâmicas** via live region quando o usuário não é a causa direta da mudança.
12. **Em qualquer dúvida**, prefira a opção que mantém mais semântica e exposição programática.

**Padrões anti-recomendados detectados frequentemente em código gerado por IA — EVITAR:**
- `<div onClick={...}>` sem role/tabindex/keyboard handler.
- `<a href="javascript:void(0)">` ou `<a href="#">` com `onClick` — use `<button>`.
- `<button type="button">Submit</button>` em formulário — use `type="submit"`.
- Modais sem focus trap e sem retorno de foco.
- Toasts/snackbars sem `role="status"` ou `role="alert"`.
- Tooltips só com `:hover` (inacessível por teclado e toque) — exija foco + suporte a Esc.
- Carrosséis sem pausa, sem teclado, sem indicação de progresso programática.
- Custom selects que não replicam comportamento de `<select>` (setas, Home/End, type-ahead).
- Inputs sem `autocomplete` semântico.
- Ícones decorativos lidos por TA (esquecimento de `aria-hidden`).

---

## 8. Saída esperada de uma auditoria

Para cada violação encontrada, retorne em formato estruturado:

```yaml
- id_criterio: "1.4.3"
  nivel: "AA"
  titulo: "Contraste (mínimo)"
  localizacao: "componente/seletor/linha"
  descricao: "Texto do botão primário com razão 3.2:1 (esperado 4.5:1)."
  evidencia: "cor texto #888 sobre fundo #FFF"
  severidade: "ALTA"  # CRITICA|ALTA|MEDIA|BAIXA
  impacto_usuario: "Usuários com baixa visão ou baixo contraste de tela não conseguem ler."
  correcao_sugerida: "Alterar cor do texto para #595959 (4.5:1) ou cor de fundo para azul mais escuro."
  referencia: "https://www.w3.org/TR/WCAG20/#visual-audio-contrast-contrast"
```

---

## 9. Critérios de aceite final (gate de entrega)

Antes de declarar conformidade AA, **todos** abaixo DEVEM ser `PASS`:

1. ✅ Auditoria automatizada sem erros críticos (axe-core / Lighthouse).
2. ✅ Navegação completa por teclado funcional em todas as rotas.
3. ✅ Leitor de tela (NVDA ou VoiceOver) anuncia corretamente estrutura, controles, estados, erros.
4. ✅ Zoom 200% sem perda de conteúdo ou rolagem horizontal indevida.
5. ✅ Contraste validado em todas as combinações texto/fundo, incluindo estados.
6. ✅ Formulários: validação anuncia erros e oferece correções.
7. ✅ Mídia: legendas e (quando exigido) audiodescrição presentes.
8. ✅ Sem armadilhas de teclado, sem mudanças de contexto inesperadas.
9. ✅ Estrutura semântica e ARIA validados na árvore de acessibilidade.
10. ✅ Documentação de critérios não aplicáveis (NA) justificada.

---

## 10. Tabela-resumo de criticidade

Quando precisar priorizar correções (ex.: backlog limitado), use esta ordem por impacto e frequência:

| Prioridade | Critérios | Razão |
|---|---|---|
| **P0 — Bloqueante** | 2.1.1, 2.1.2, 4.1.2, 1.3.1, 1.1.1 | Falha = funcionalidade inacessível para classes inteiras de usuário |
| **P1 — Alto** | 1.4.3, 2.4.7, 3.3.1, 3.3.2, 2.4.4 | Afeta uso diário de muitos perfis |
| **P2 — Médio** | 1.4.4, 1.4.1, 2.4.6, 3.2.3, 3.2.4, 3.3.3 | Degrada experiência, geralmente contornável |
| **P3 — Contextual** | 1.2.*, 2.4.5, 3.1.2 | Aplicável a conteúdos específicos |

---

## 11. Notas sobre WCAG 2.1/2.2 (fora do escopo 2.0, mas relevantes)

Para projetos que pretendem evoluir, considere adotar voluntariamente:

- **1.3.4 Orientation (AA, 2.1):** não restringir a uma única orientação.
- **1.3.5 Identify Input Purpose (AA, 2.1):** `autocomplete` em inputs de dados pessoais.
- **1.4.10 Reflow (AA, 2.1):** sem rolagem em duas direções com viewport 320px.
- **1.4.11 Non-text Contrast (AA, 2.1):** 3:1 em componentes e indicadores de estado/foco.
- **1.4.12 Text Spacing (AA, 2.1):** ajustes de espaçamento sem perda de conteúdo.
- **1.4.13 Content on Hover or Focus (AA, 2.1):** tooltips dispensáveis, persistentes e hovereáveis.
- **2.5.7 Dragging Movements (AA, 2.2):** alternativa sem arrastar.
- **2.5.8 Target Size Minimum (AA, 2.2):** alvo ≥24×24px.
- **3.3.7 Redundant Entry (A, 2.2):** não reexigir dados na mesma sessão.
- **3.3.8 Accessible Authentication (AA, 2.2):** sem CAPTCHA cognitivo sem alternativa.

---

## 12. Glossário operacional

- **TA (Tecnologia Assistiva):** leitor de tela, ampliador, controle por voz, switch, teclado adaptado.
- **Nome acessível:** texto que identifica o componente para TA (vem de conteúdo, `aria-label`, `aria-labelledby`, `<label>`, `alt`, `title` em última instância).
- **Papel (role):** tipo do componente (botão, link, caixa de diálogo). Implícito por elemento HTML ou explícito via `role`.
- **Estado:** condição dinâmica (expandido, selecionado, marcado, desabilitado, atual).
- **Live region:** elemento que anuncia mudanças dinâmicas (`aria-live="polite|assertive"`, `role="status|alert|log"`).
- **Focus trap:** mecanismo que mantém foco dentro de um container (modal) e o libera ao fechar.
- **Reflow:** capacidade do conteúdo se reorganizar sem rolagem em duas direções.
- **Texto grande:** ≥18pt regular ou ≥14pt negrito (≈24px / 19px).

---

**Fim do guia.** Em conflito entre este documento e WCAG 2.0 normativo do W3C, a norma do W3C prevalece.
