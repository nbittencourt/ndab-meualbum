# Plano de Correção — Issues #3, #14 e #20

> **Data:** 2026-06-10
> **Autor:** análise técnica (Claude Code)
> **Escopo:** Issues #3 (Câmera preta — Abrir Pacotinhos), #14 (Botões MFN + foco — Colar Figurinhas), #20 (Card clicável — Home)

---

## Fontes e ordem de prioridade

| Nível | Fonte | Papel |
|---|---|---|
| **Design** (maior prioridade) | `docs/design_handoff/*.html` · `*.jsx` · `README.md` | Fidelidade visual e de interação das telas que cobre |
| **Spec** (canônica) | `docs/spec_*.md` — versão da raiz | Regras de negócio, LGPD e WCAG |
| **Implementação** | `client/src/**`, `server/src/**` | Estado atual do código |
| **Issues do owner** | GitHub Issues | Regra mais recente — posterior à spec; prevalece quando confirmada |

> ⚠️ **Nota:** as issues abertas pelo owner em 2026-06 são tratadas como **regras de produto mais recentes** e prevalecem sobre especificações anteriores nas situações em que divergem. Ver Decisões de Alinhamento abaixo.

---

## 1. Decisões de Alinhamento

| # | Tema | Divergência | **Decisão** |
|---|---|---|---|
| DEC-1 | **Botões do MFN (issue #14)** | Issue pede 3 botões fixos ("Colar" / "Colar e Fechar" / "Fechar") + Enter; `spec_colar_figurinhas.md` v1.2 (RN-CF26/CF28 + §6.1) descreve toggle "Confirmar"↔"Colar e Outra". | **Adotar modelo da issue.** Atualizar `spec_colar_figurinhas.md` → v1.3 com novos botões, Enter e foco. |
| DEC-2 | **Clique no card da Home (issue #20)** | `spec_home_albums.md` é silenciosa sobre clique no card; issue pede navegação para página do álbum. | **Navegar para `/albums/:id`** (AlbumManagePage — mesmo alvo do botão "Gerenciar" em AlbumsPage). Adicionar RN-H31 e atualizar RN-H20 na spec. |

---

## 2. Legenda

| Símbolo | Significado |
|---|---|
| ✅ | Implementado e aderente |
| ⚠️ | Parcial (existe, incompleto) |
| ❌ | Não implementado / bugado |
| 🔀 | Implementado divergente do design/spec |

| Nível | Critério |
|---|---|
| **P0** | Bloqueia funcionalidade central / quebra de RN |
| **P1** | Degradação ou inconsistência de UX relevante |
| **P2** | Refinamento / nova funcionalidade |

---

## 3. Sumário Executivo

| # | Issue | Tipo | Fluxo | Sev. |
|---|---|---|---|---|
| **G1** | **#3 — Câmera preta + OCR falso** | Bug | Abrir Pacotinhos / Colar Figurinhas | **P0** |
| **G2** | **#14 — Foco perdido + modelo de botões MFN** | Bug + Enhancement | Colar Figurinhas | **P1** |
| **G3** | **#20 — Card da Home não navega ao clicar** | Enhancement | Home | **P2** |

---

## 4. Detalhamento por issue

---

### G1 — Issue #3 · Câmera preta + OCR falso  `P0`

**Componente afetado:** `client/src/components/CameraModal.tsx`

**Sintomas relatados:**
- Ao abrir o modal câmera ("Fotografar"), o viewfinder fica **preto** — apenas a moldura-guia aparece.
- Ao clicar "Fotografar", o OCR retorna um número falso (ex.: "2") sem referência a qualquer figurinha real.

#### Causa-raiz (confirmada)

O `useEffect` que chama `getUserMedia` (linhas 55–88) chega no `.then()` e tenta:

```ts
if (videoRef.current) {
  videoRef.current.srcObject = stream;   // linha 73-75
}
setCameraState('viewfinder');
```

**Problema:** o `<video>` só é montado nos estados `'viewfinder'`/`'processing'` (linha 175). No momento em que `.then()` executa, o estado ainda é `'loading'` — portanto `videoRef.current === null`. O guard `if (videoRef.current)` falha silenciosamente, o stream nunca é vinculado ao elemento de vídeo → tela preta.

A moldura-guia é `position: absolute` e está sempre visível (linhas 187–195), por isso aparece mesmo com vídeo preto. O OCR roda sobre um canvas em branco (`video.videoWidth` = 0 → fallback 640×480, linhas 95–96), gerando lixo de reconhecimento (o "2" espúrio).

#### Estado atual vs. esperado

| Aspecto | Atual | Esperado |
|---|---|---|
| `srcObject` atribuído | Dentro do `.then()`, quando `<video>` ainda não existe | Após o `<video>` montar (quando `cameraState === 'viewfinder'`) |
| Stream sem video-tracks | Passa silenciosamente → câmera preta | Transição para `camera_error` |
| Captura com `videoWidth === 0` | OCR roda em canvas preto → número falso | Captura bloqueada até `loadedmetadata` |

#### Passos de correção — código

**Arquivo:** `client/src/components/CameraModal.tsx`

1. **Remover** a atribuição `videoRef.current.srcObject = stream` de dentro do `.then()` do `getUserMedia` (linha 73–75). O `.then()` apenas grava o stream em `streamRef.current` e chama `setCameraState('viewfinder')`.

2. **Adicionar validação de video-tracks** no `.then()`, antes de gravar o stream:
   ```ts
   if (!stream.getVideoTracks().length) {
     setCameraState('camera_error');
     return;
   }
   ```

3. **Adicionar segundo `useEffect`** que reage à mudança de `cameraState` para `'viewfinder'` e vincula o stream ao `<video>` (que agora já está montado):
   ```ts
   useEffect(() => {
     if (cameraState !== 'viewfinder' || !videoRef.current || !streamRef.current) return;
     videoRef.current.srcObject = streamRef.current;
   }, [cameraState]);
   ```

4. **Bloquear captura** se `video.videoWidth === 0` no início de `handleCapture`:
   ```ts
   const handleCapture = useCallback(async () => {
     if (!videoRef.current || !canvasRef.current) return;
     const video = videoRef.current;
     if (video.videoWidth === 0) return; // vídeo não inicializou — evita OCR em canvas preto
     // ...restante inalterado
   ```

#### Checklist de RN (issues #3)

- [ ] ✅ **RN-AP21** — OCR local (Tesseract.js via dynamic import) — lógica já correta; apenas o bind do stream está bugado
- [ ] ✅ **RN-AP22** — "Pular" quando não reconhecido — já implementado; fix não afeta
- [ ] ✅ **RN-AP23** — Número editável após OCR — já implementado; fix não afeta
- [ ] ✅ **RN-AP43** — Ativação em 2 passos — já implementado corretamente em `AbrirPacotinhosPage.tsx:347-361`
- [ ] ✅ **RN-AP13** — Modal sobrepõe AP1 — não afetado
- [ ] ❌ **BUG** — `srcObject` vinculado antes do `<video>` montar → **corrigir conforme acima**
- [ ] ❌ **BUG** — stream sem video-tracks não gera `camera_error` → **corrigir conforme acima**
- [ ] ❌ **BUG** — captura roda OCR em canvas preto (`videoWidth === 0`) → **bloquear conforme acima**

**Sem mudança de spec** — esta é uma correção de implementação pura.

---

### G2 — Issue #14 · Foco perdido + modelo de botões MFN  `P1`

**Componente afetado:** `client/src/pages/ColarFigurinhasPage.tsx`

**Sintomas relatados:**
- Após acionar "Confirmar", o foco **não retorna** ao campo de número da figurinha.
- Ao acionar "Colar e Outro" (botão pós-colagem), o foco funciona corretamente.
- Owner pede: trocar para **3 botões fixos** + Enter para confirmar.

#### Causa-raiz (confirmada)

O componente usa o flag `mfnPasted` (linha 33) para alternar os botões:
- `!mfnPasted` → botões "Confirmar" / "Cancelar"
- `mfnPasted` → botões "Colar e Outra" / "Fechar"

Ao clicar "Confirmar":
1. `onClick` chama `mfnMut.mutate(...)` — o botão recebe foco ativo
2. `onSuccess` (linha 85–89) chama `setMfnPasted(true)` → re-render
3. O botão "Confirmar" **desmonta**; "Colar e Outra" **monta**
4. O foco fica no elemento desmontado → browser perde o foco (cai no `<body>`)
5. Input aparece sem foco; usuário precisa clicar antes de digitar o próximo número

"Colar e Outra" funciona porque o próprio handler chama `mfnInputRef.current?.focus()` (linha 253).

#### Estado atual vs. esperado (DEC-1)

| Aspecto | Atual | Esperado (DEC-1) |
|---|---|---|
| Botões | Toggle "Confirmar"/"Cancelar" ↔ "Colar e Outra"/"Fechar" | 3 fixos: "Colar" / "Colar e Fechar" / "Fechar" |
| "Colar" (cola + mantém modal) | Inexistente como botão fixo | Sempre visível; cola, limpa campo, devolve foco ao input |
| "Colar e Fechar" | Inexistente | Sempre visível; cola e fecha o modal |
| "Fechar" | "Cancelar" (só antes de colar) | Sempre visível; fecha sem colar |
| Enter | Não implementado | Aciona "Colar" quando campo não vazio e sem operação em andamento |
| Foco após "Confirmar" | Perdido | Retorna ao input (RN-CF28) |

#### Passos de correção — código

**Arquivo:** `client/src/pages/ColarFigurinhasPage.tsx`

1. **Remover** as declarações `mfnPasted`/`setMfnPasted` (linha 33) e `mfnKeepOpenRef` (linha 34) — o novo modelo não precisa de flag de estado.

2. **Atualizar `mfnMut.onSuccess`** — remover `mfnKeepOpenRef.current = false` e `setMfnPasted(true)`; adicionar `mfnInputRef.current?.focus()` ao final:
   ```ts
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ['estoque', albumId] });
     queryClient.invalidateQueries({ queryKey: ['albums'] });
     queryClient.invalidateQueries({ queryKey: ['album', albumId] });
     queryClient.invalidateQueries({ queryKey: ['album-figurinhas', albumId] });
     setMfnNumero('');
     setMfnError('');
     showToast('Figurinha colada diretamente!', 'success');
     mfnInputRef.current?.focus();
   },
   onError: (err) => {
     setMfnError(err instanceof ApiError ? err.message : 'Erro ao colar.');
   },
   ```

3. **Atualizar `onClose` do `<Modal>`** (linha 216) — remover `setMfnPasted(false)`:
   ```ts
   onClose={() => { setShowMfnModal(false); setMfnNumero(''); setMfnError(''); }}
   ```

4. **Adicionar `onKeyDown` ao `<Input>`** do MFN (linha 222–230):
   ```tsx
   onKeyDown={(e) => {
     if (e.key === 'Enter' && mfnNumero.trim() && !mfnMut.isPending) {
       mfnMut.mutate({ numero: mfnNumero.trim(), albumIdTarget: albumId });
     }
   }}
   ```

5. **Substituir o bloco de botões condicionais** (linhas 232–264) por 3 botões fixos:
   ```tsx
   <div className="flex gap-2 mt-4 flex-wrap">
     <Button
       loading={mfnMut.isPending}
       disabled={!mfnNumero.trim() || mfnMut.isPending}
       onClick={() => mfnMut.mutate({ numero: mfnNumero.trim(), albumIdTarget: albumId })}
     >
       Colar
     </Button>
     <Button
       variant="secondary"
       loading={mfnMut.isPending}
       disabled={!mfnNumero.trim() || mfnMut.isPending}
       onClick={async () => {
         try {
           await mfnMut.mutateAsync({ numero: mfnNumero.trim(), albumIdTarget: albumId });
           setShowMfnModal(false);
         } catch {
           // erro já tratado em onError
         }
       }}
     >
       Colar e Fechar
     </Button>
     <Button
       variant="secondary"
       disabled={mfnMut.isPending}
       onClick={() => { setShowMfnModal(false); setMfnNumero(''); setMfnError(''); }}
     >
       Fechar
     </Button>
   </div>
   ```

6. **Atualizar `<CameraModal>` no MFN** (linhas 279–289) — remover `setMfnPasted(true)` e fechar câmera após confirmação:
   ```tsx
   <CameraModal
     open={showMfnCamera}
     onClose={() => setShowMfnCamera(false)}
     onConfirm={async (numero) => {
       await mfnMut.mutateAsync({ numero, albumIdTarget: albumId });
       setShowMfnCamera(false); // fecha câmera; onSuccess foca o input do MFN
     }}
     confirmLoading={mfnMut.isPending}
   />
   ```

#### Passos de correção — spec

**Arquivo:** `docs/spec_colar_figurinhas.md` → bump para **v1.3**

- **Changelog (tabela de versões):** adicionar linha `| 1.3 | 2026-06-10 | **DEC-1** — Botões do MFN substituídos por 3 botões fixos: "Colar", "Colar e Fechar", "Fechar". Enter aciona "Colar". RN-CF26 e RN-CF28 atualizados. |`

- **Tabela comparativa MC vs MFN** (linha ~217): atualizar coluna "Colar Figurinhas (MFN)" na linha "Botão após colagem bem-sucedida" para `"Colar" (mantém modal, foca input) · "Colar e Fechar" · "Fechar"`.

- **§6.1 Estrutura do modal** (linhas 221–236): substituir por:
  ```
  **Modo Digitar:**
  1. Campo de texto para número da figurinha (autofoco ao abrir o modal);
     tecla **Enter** aciona "Colar" (ver RN-CF26).
  2. Botão **"Colar"** — cola a figurinha, mantém o modal aberto,
     limpa o campo e restaura o foco ao input. Ver RN-CF26.
  3. Botão **"Colar e Fechar"** — cola a figurinha e fecha o modal.
  4. Botão **"Fechar"** — fecha o modal sem colar nada.

  **Modo Fotografar:**
  5. Botão **"Abrir câmera"** — ativa o viewfinder. Ver RN-CF27.
  6. Após reconhecimento: campo editável com número + botões "Colar",
     "Colar e Fechar" e "Fechar" (idênticos ao modo Digitar).
  ```

- **RN-CF26** (linha 264): substituir por:
  ```
  | RN-CF26 | O MFN oferece sempre os botões fixos **"Colar"**, **"Colar e Fechar"** e
  **"Fechar"**, sem alternância de estado. "Colar": a colagem é persistida, o modal
  permanece aberto, o campo de número é limpo e o foco retorna ao input para a
  próxima entrada. "Colar e Fechar": a colagem é persistida e o modal é fechado.
  "Fechar": fecha o modal sem persistir colagem. A tecla Enter, quando o campo não
  estiver vazio e não houver operação em andamento, aciona "Colar". |
  ```

- **RN-CF28** (linha 281): substituir referência a "Colar e Outra" por "Colar":
  ```
  | RN-CF28 | O MFN DEVE ser implementado como `role="dialog"` com focus trap,
  `aria-modal="true"` e `aria-labelledby`; ao fechar (por "Fechar" ou cancelamento),
  o foco DEVE retornar ao botão "Figurinha não registrada" da Tela CF1; ao acionar
  "Colar", o foco DEVE ir para o campo de número |
  ```

#### Checklist de RN (issue #14)

- [ ] ✅ **RN-CF11** — `origem = DIRETA` no MFN — não afetado
- [ ] ✅ **RN-CF25** — mensagem de erro inline — não afetado; `role="alert"` via `Input.tsx:57`
- [ ] ❌ **RN-CF26 (DEC-1)** — 3 botões fixos + Enter → **corrigir conforme acima**
- [ ] ❌ **RN-CF28** — foco retorna ao input após "Colar" → **corrigir conforme acima** (foco perdido no modelo antigo)
- [ ] ✅ **RN-CF27** — câmera no MFN via botão "Abrir câmera" — já funcionando; apenas atualizar `onConfirm`
- [ ] ✅ **RN-CF29** — erro anunciado via `role="alert"` sem mover foco — não afetado

---

### G3 — Issue #20 · Card da Home não navega ao clicar  `P2`

**Componente afetado:** `client/src/components/AlbumCard.tsx` + `docs/spec_home_albums.md`

**Sintomas relatados:** ao clicar em um card de álbum na Home, nada acontece (apenas o botão "Colar figurinhas" dentro do card é interativo).

#### Causa-raiz (confirmada)

`AlbumCard.tsx` é um `<article>` estático sem `onClick`/`tabIndex`/`role` interativo (linhas 22–32). Somente o `<Link>` interno "Colar figurinhas" (linhas 138–158) navega. A `spec_home_albums.md` não define clique no card — logo a implementação atual é consistente com a spec anterior, mas está aquém da expectativa do owner (DEC-2).

#### Estado atual vs. esperado (DEC-2)

| Aspecto | Atual | Esperado (DEC-2) |
|---|---|---|
| Card clicável | Não — só botão interno | Sim — card inteiro navega para `/albums/:id` |
| Destino | N/A | `/albums/:id` (AlbumManagePage) |
| Acessibilidade | `<article>` sem papel interativo | `role="link"`, `tabIndex={0}`, `aria-label` descritivo, Enter ativa navegação |
| Botão interno | `<Link>` → `/colar?albumId=...` | Inalterado — deve usar `e.stopPropagation()` para não propagar ao card |

**Padrão de referência:** `AlbumsPage.tsx:80` — `onClick={() => navigate(`/albums/${album._id}`)}`

#### Passos de correção — código

**Arquivo:** `client/src/components/AlbumCard.tsx`

1. **Adicionar `useNavigate`** ao import de `react-router-dom`:
   ```ts
   import { Link, useNavigate } from 'react-router-dom';
   ```

2. **Instanciar `navigate`** dentro do componente:
   ```ts
   const navigate = useNavigate();
   ```

3. **Atualizar o `<article>`** com props de navegação (RN-H31):
   ```tsx
   <article
     role="link"
     tabIndex={0}
     aria-label={`Gerenciar álbum ${album.tipoAlbum?.nome ?? 'Álbum'} — ${VARIANT_LABELS[variante]}`}
     onClick={() => navigate(`/albums/${album._id}`)}
     onKeyDown={(e) => {
       if (e.key === 'Enter') {
         e.preventDefault();
         navigate(`/albums/${album._id}`);
       }
     }}
     style={{
       cursor: 'pointer',
       // ...demais estilos inalterados
     }}
   >
   ```

4. **Adicionar `stopPropagation`** ao `<Link>` do botão "Colar figurinhas" (linha 138) para não propagar clique ao card:
   ```tsx
   <Link
     to={`/colar?albumId=${album._id}`}
     onClick={(e) => e.stopPropagation()}
   >
   ```

#### Passos de correção — spec

**Arquivo:** `docs/spec_home_albums.md` → bump para **v1.7**

- **Changelog (tabela de versões):** adicionar linha `| 1.7 | 2026-06-10 | **DEC-2** — Clique no card de álbum da Home navega para `/albums/:id`. RN-H31 adicionado. RN-H20 complementado com acessibilidade do card como alvo navegável. |`

- **RN-H20** (linha 212): complementar com:
  ```
  | RN-H20 | Cada card de álbum DEVE ter hierarquia de heading adequada; o botão "Colar
  figurinhas" DEVE ter `aria-label` que inclua o nome do álbum (ex.: "Colar figurinhas em
  Copa do Mundo 2026 — Brochura") para distinguir entre múltiplos cards. O card como alvo
  navegável (RN-H31) DEVE ter `aria-label` descritivo (ex.: "Gerenciar álbum Copa do Mundo
  2026 — Brochura") que comunique o destino da navegação a leitores de tela. |
  ```

- **RN-H31** — adicionar após RN-H30 (linha 219):
  ```
  | RN-H31 | Clicar ou acionar por teclado (tecla Enter) o card de álbum na Home navega para
  a página de gerenciamento do álbum (`/albums/:id`); o card DEVE ter `role="link"`,
  `tabIndex="0"` e `aria-label` descritivo (ex.: "Gerenciar álbum Copa do Mundo 2026 —
  Brochura"). O botão "Colar figurinhas" dentro do card DEVE impedir a propagação do evento
  de clique (`stopPropagation`) para preservar sua navegação independente. |
  ```

#### Checklist de RN (issue #20)

- [ ] ✅ **RN-H12** — botão "Colar figurinhas" disponível — não afetado; `stopPropagation` mantém comportamento
- [ ] ✅ **RN-H13** — título/subtítulo do card — não afetado
- [ ] ✅ **RN-H21** — `role="progressbar"` — não afetado
- [ ] ✅ **RN-H29** — identidade visual por variante — não afetado
- [ ] ❌ **RN-H31 (novo — DEC-2)** — card clicável → `/albums/:id` → **implementar conforme acima**
- [ ] ❌ **RN-H20 (complemento)** — `aria-label` do card como alvo navegável → **adicionar conforme acima**

---

## 5. Backlog Priorizado

| Ordem | Item | Sev. | Bloqueios | Spec a atualizar |
|---|---|---|---|---|
| 1 | **G1 — #3** Corrigir bind do `srcObject` + track validation + guard OCR (`CameraModal.tsx`) | P0 | — | Nenhuma |
| 2 | **G2 — #14** 3 botões fixos + Enter + foco (`ColarFigurinhasPage.tsx`) | P1 | — | `spec_colar_figurinhas.md` → v1.3 |
| 3 | **G3 — #20** Card clicável na Home (`AlbumCard.tsx`) | P2 | — | `spec_home_albums.md` → v1.7 |

---

## 6. Mudanças Documentais Necessárias

### 6.1 `docs/spec_colar_figurinhas.md` → v1.3

| Ponto | Alteração |
|---|---|
| Tabela de versões | Adicionar linha v1.3 com referência a DEC-1 |
| Tabela comparativa MC vs MFN (linha ~217) | Linha "Botão após colagem": coluna MFN → `"Colar" · "Colar e Fechar" · "Fechar"` |
| §6.1 Estrutura do modal (linhas 221–236) | Substituir estrutura de botões alternados por 3 fixos + Enter (ver §G2 acima) |
| RN-CF26 (linha 264) | Substituir pela nova regra de 3 botões fixos + Enter (ver §G2 acima) |
| RN-CF28 (linha 281) | Substituir "Colar e Outra" por "Colar" na regra de foco (ver §G2 acima) |

### 6.2 `docs/spec_home_albums.md` → v1.7

| Ponto | Alteração |
|---|---|
| Tabela de versões | Adicionar linha v1.7 com referência a DEC-2 |
| RN-H20 (linha 212) | Complementar com `aria-label` do card como alvo navegável |
| Após RN-H30 (linha 219) | Adicionar **RN-H31** — card clicável navega para `/albums/:id` com `role="link"` + acessibilidade |

---

## 7. Checklist de Aceite por Issue (template §9 do handoff)

### G1 — Issue #3 (CameraModal)   ·   Fluxo: Abrir Pacotinhos + Colar Figurinhas   ·   Spec: `spec_abrir_pacotinhos.md` v1.6 / `spec_colar_figurinhas.md` v1.3

#### Comportamento
- [ ] `<video>` fica preto ao abrir câmera no iOS Safari e Chrome Android → **deve exibir feed real**
- [ ] Clicar "Fotografar" retorna número espúrio → **deve retornar número reconhecido por OCR**
- [ ] `getUserMedia` com stream sem video-tracks → **deve mostrar mensagem "Câmera indisponível"**

#### Regras de Negócio
- [ ] RN-AP21 — OCR local via Tesseract.js, nenhuma imagem enviada ao backend ✅ (lógica já correta)
- [ ] RN-AP22 — "Pular" disponível quando não reconhecido ✅ (não afetado)
- [ ] RN-AP23 — número reconhecido é editável ✅ (não afetado)
- [ ] RN-AP43 — ativação em 2 passos (modo → botão) ✅ (não afetado)
- [ ] RN-CF27 — comportamento idêntico no MFN ✅ (depende do fix G1)

#### Acessibilidade
- [ ] Estados de câmera anunciados via `aria-busy` / `role="alert"` (já presentes; não afetado)
- [ ] Focus trap do `<Modal>` base inalterado (não afetado)

#### Aceite
- [ ] Testado em dispositivo iOS/Android (câmera traseira real)
- [ ] Sem OCR com número falso em câmera real
- [ ] Revisor: ____   Data: ____

---

### G2 — Issue #14 (MFN — Colar Figurinhas)   ·   Fluxo: Colar Figurinhas   ·   Spec: `spec_colar_figurinhas.md` v1.3

#### Comportamento
- [ ] Após clicar "Colar": campo limpo, foco retorna ao input, modal continua aberto
- [ ] Após clicar "Colar e Fechar": colagem persistida, modal fecha
- [ ] Após clicar "Fechar": modal fecha sem colar
- [ ] Pressionar Enter com campo preenchido: equivalente a "Colar"
- [ ] Pressionar Enter com campo vazio: nenhuma ação
- [ ] Erro de figurinha não encontrada: mensagem inline, foco permanece no input
- [ ] Colar via câmera (CameraModal no MFN): câmera fecha após confirmação, foco retorna ao input do MFN

#### Regras de Negócio
- [ ] RN-CF26 — 3 botões fixos + Enter acionam "Colar" → implementado
- [ ] RN-CF28 — foco ao input após "Colar" → implementado
- [ ] RN-CF29 — erro anunciado via `role="alert"` sem mover foco → inalterado
- [ ] RN-CF11 — `origem = DIRETA` → inalterado
- [ ] RN-CF27 — câmera no MFN por botão explícito → inalterado

#### Acessibilidade
- [ ] Botões com rótulo textual claro (sem ambiguidade)
- [ ] `loading` nos botões "Colar" e "Colar e Fechar" durante operação pendente
- [ ] `disabled` quando campo vazio ou operação pendente
- [ ] Focus trap do `<Modal>` inalterado (RN-CF28)

#### Aceite
- [ ] Testado fluxo completo: digitar → Colar → digitar próximo (sem clicar no input)
- [ ] Testado: Colar e Fechar → modal fecha
- [ ] Testado: Enter confirma colagem
- [ ] Testado: câmera → confirmar → volta ao MFN com input focado
- [ ] Revisor: ____   Data: ____

---

### G3 — Issue #20 (AlbumCard — Home)   ·   Fluxo: Home   ·   Spec: `spec_home_albums.md` v1.7

#### Comportamento
- [ ] Clicar no card (fora do botão "Colar figurinhas") navega para `/albums/:id`
- [ ] Clicar no botão "Colar figurinhas" navega para `/colar?albumId=...` (comportamento anterior preservado)
- [ ] Tab até o card + Enter → navega para `/albums/:id`
- [ ] Tab até o botão interno + Enter → navega para `/colar?albumId=...`

#### Regras de Negócio
- [ ] RN-H31 — card clicável navega para `/albums/:id` → implementado
- [ ] RN-H12 — botão "Colar figurinhas" preservado → inalterado com `stopPropagation`
- [ ] RN-H13 — título/subtítulo no card → inalterado
- [ ] RN-H29 — identidade visual por variante → inalterado

#### Acessibilidade
- [ ] `role="link"` no `<article>`
- [ ] `tabIndex={0}` para navegação por teclado
- [ ] `aria-label` descritivo com nome do álbum e variante (RN-H20/H31)
- [ ] Cursor `pointer` no hover
- [ ] Teclado: tab → Enter → navega (verifica em browser)

#### Aceite
- [ ] Testado clique direto no card → abre AlbumManagePage
- [ ] Testado clique no botão "Colar figurinhas" → abre ColarFigurinhasPage (sem interferência)
- [ ] Testado navegação por teclado (tab + Enter)
- [ ] Lido com leitor de tela (VoiceOver/TalkBack): card anunciado como link com destino legível
- [ ] Revisor: ____   Data: ____

---

## Anexo — Evidências

| Achado | Evidência |
|---|---|
| `srcObject` atribuído antes do `<video>` montar | `CameraModal.tsx:55-88` — `.then()` executa com `cameraState='loading'`; `<video>` só existe em `viewfinder` (`:175`) |
| `videoRef.current` é `null` no `.then()` | `CameraModal.tsx:73-75` — guard `if (videoRef.current)` falha silenciosamente |
| OCR em canvas preto → número falso | `CameraModal.tsx:95-96` — `video.videoWidth || 640` → 640×480 preto quando vídeo não vinculado |
| Moldura-guia visível mesmo com câmera preta | `CameraModal.tsx:187-195` — `position: absolute`, sempre renderizada |
| Flag `mfnPasted` causa perda de foco | `ColarFigurinhasPage.tsx:33,85` — `setMfnPasted(true)` desmonta "Confirmar" sem reposicionar foco |
| "Colar e Outra" funciona | `ColarFigurinhasPage.tsx:253` — `mfnInputRef.current?.focus()` chamado explicitamente |
| Câmera no MFN já funciona (não é stub) | `ColarFigurinhasPage.tsx:268-275` — `onClick={() => setShowMfnCamera(true)}`; `CameraModal` em `:280-289` |
| AlbumCard não é clicável | `client/src/components/AlbumCard.tsx:22-31` — `<article>` estático, sem `onClick`/`tabIndex`/role interativo |
| Padrão de navegação para `/albums/:id` | `client/src/pages/AlbumsPage.tsx:80` — `onClick={() => navigate('/albums/${album._id}')` |
| `spec_home_albums.md` silenciosa sobre clique no card | spec v1.6 — nenhuma RN sobre clique no card; fluxo de dados (`:123`) só menciona "Colar figurinhas" e "Novo álbum" |
