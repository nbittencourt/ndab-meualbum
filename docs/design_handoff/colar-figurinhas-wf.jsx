// colar-figurinhas-wf.jsx — Wireframe anotado · Colar Figurinhas
// Telas: CF0 Seleção de Álbum · CF1 Colagem (principal) · Modal MFN
// Mobile 390px + Desktop 1280px · Spec: spec_colar_figurinhas.md

const CF = {
  bg:    "#F0EDE4", paper: "#FBF8EE", ink:   "#0A0907",
  red:   "#E5142A", green: "#0A9145", amber: "#E89B0C",
  cream: "#F0E9D6", line:  "rgba(10,9,7,0.18)", mute: "rgba(10,9,7,0.55)",
  fontD: "var(--font-display)", fontB: "var(--font-body)", fontM: "var(--font-mono)",
};

const SIDEBAR_W = 228;

const CF_VARIANT = {
  BROCHURA:        { tag: "Brochura",       tagBg: "#E0DDD5", tagFg: CF.ink  },
  CAPA_DURA_OURO:  { tag: "Capa dura ouro", tagBg: "#C49A1A", tagFg: "#fff"  },
  BOX_PREMIUM:     { tag: "Box Premium",    tagBg: CF.red,    tagFg: "#fff"  },
};

// ── helpers ───────────────────────────────────────────────────────────────
function cfMeasure() {
  const ref = React.useRef(null);
  const [w, setW] = React.useState(390);
  React.useEffect(() => {
    if (!ref.current) return;
    const init = ref.current.offsetWidth; if (init > 0) setW(init);
    const ro = new ResizeObserver(e => setW(e[0].contentRect.width));
    ro.observe(ref.current); return () => ro.disconnect();
  }, []);
  return [ref, w];
}

const CfVP = React.createContext({ isDesktop: false });
const useCfVP = () => React.useContext(CfVP);

function CfAnn({ n, top, right, left, bottom }) {
  return (
    <div style={{
      position: "absolute", top, right, left, bottom,
      width: 22, height: 22, borderRadius: "50%",
      background: CF.red, color: "#fff", fontSize: 10, fontWeight: 700,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: CF.fontM, zIndex: 30, flexShrink: 0,
      border: `2px solid ${CF.paper}`, boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
    }}>{n}</div>
  );
}

function CfLegend({ items }) {
  return (
    <div style={{ margin: "20px 0 0", padding: 14, background: CF.paper, border: `1.5px solid ${CF.ink}` }}>
      <div style={{ fontFamily: CF.fontM, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: CF.mute, marginBottom: 10 }}>
        Anotações — regras de negócio
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {items.map(([n, code, txt]) => (
          <div key={n} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, background: CF.red, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: CF.fontM, marginTop: 1 }}>{n}</div>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: CF.fontM, fontSize: 9, letterSpacing: "0.14em", color: CF.red, textTransform: "uppercase", marginRight: 6 }}>{code}</span>
              <span style={{ fontSize: 11.5, color: CF.ink, lineHeight: 1.45, fontFamily: CF.fontB }}>{txt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressBar({ pct, height = 6 }) {
  return (
    <div style={{ height, background: CF.line, position: "relative", flex: 1 }}>
      <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: CF.ink }} />
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────
function CfSidebar() {
  return (
    <aside style={{ width: SIDEBAR_W, flexShrink: 0, position: "absolute", top: 0, left: 0, bottom: 0, background: CF.paper, borderRight: `2px solid ${CF.ink}`, display: "flex", flexDirection: "column", zIndex: 5 }}>
      <div style={{ padding: "20px 20px 18px", borderBottom: `2px solid ${CF.ink}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: CF.red, color: "#fff", border: `2px solid ${CF.ink}`, boxShadow: `2px 2px 0 ${CF.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: CF.fontD, fontSize: 12, transform: "rotate(-4deg)", flexShrink: 0 }}>MA</div>
          <span style={{ fontFamily: CF.fontD, fontSize: 14, letterSpacing: "0.04em", textTransform: "uppercase" }}>Meu Album</span>
        </div>
      </div>
      {[
        { icon: "⊞", label: "Início" }, { icon: "◻", label: "Meus Álbuns" },
        { icon: "◈", label: "Figurinhas", active: true }, { icon: "○", label: "Perfil" },
      ].map((item, i) => (
        <div key={i} style={{ padding: "11px 20px", display: "flex", alignItems: "center", gap: 12, background: item.active ? CF.bg : "transparent", borderLeft: item.active ? `3px solid ${CF.red}` : "3px solid transparent" }}>
          <span style={{ fontFamily: CF.fontM, fontSize: 15, width: 18, textAlign: "center", color: item.active ? CF.red : CF.mute }}>{item.icon}</span>
          <span style={{ fontFamily: CF.fontB, fontSize: 13, fontWeight: 600, color: item.active ? CF.red : CF.ink }}>{item.label}</span>
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{ padding: "14px 16px", borderTop: `2px solid ${CF.ink}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, background: CF.ink, color: "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: CF.fontD, fontSize: 13 }}>J</div>
        <div>
          <div style={{ fontFamily: CF.fontD, fontSize: 12, textTransform: "uppercase" }}>João S.</div>
          <div style={{ fontFamily: CF.fontM, fontSize: 9, color: CF.mute, letterSpacing: "0.12em" }}>#XB3K29</div>
        </div>
      </div>
    </aside>
  );
}

function CfMobileHeader({ title, back = true }) {
  return (
    <div style={{ padding: "0 16px", height: 56, background: CF.paper, borderBottom: `2px solid ${CF.ink}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
      {back
        ? <button style={{ width: 36, height: 36, background: "transparent", border: `1.5px solid ${CF.ink}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3 5 8l5 5" stroke={CF.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        : <div style={{ width: 36 }} />
      }
      <span style={{ fontFamily: CF.fontD, fontSize: 15, textTransform: "uppercase", letterSpacing: "0.02em" }}>{title}</span>
      <div style={{ width: 36 }} />
    </div>
  );
}

// ── Mock data ─────────────────────────────────────────────────────────────
const MOCK_ALBUM_ATIVO = { tipo: "Copa do Mundo 2026 — Panini", variante: "CAPA_DURA_OURO", nome: "Meu ouro", pct: 68.3 };

const MOCK_ESTOQUE = [
  { numero: "BRA-07", nome: "Raphinha",     qty: 3, estado: "pode-colar"    },
  { numero: "BRA-12", nome: "Vini Jr.",     qty: 2, estado: "ja-colada"     },
  { numero: "ARG-10", nome: "L. Messi",    qty: 1, estado: "pode-colar"    },
  { numero: "EUR-15", nome: "J. Bellingham",qty: 4, estado: "fora-catalogo" },
  { numero: "POR-07", nome: "C. Ronaldo",  qty: 1, estado: "ja-colada"     },
  { numero: "FRA-11", nome: "K. Mbappé",   qty: 2, estado: "pode-colar"    },
];

const MOCK_ALBUMS_LISTA = [
  { id: 1, tipo: "Copa do Mundo 2026 — Panini", variante: "BOX_PREMIUM",   nome: null,       pct: 5.1  },
  { id: 2, tipo: "Copa do Mundo 2026 — Panini", variante: "CAPA_DURA_OURO",nome: "Meu ouro", pct: 68.3 },
  { id: 3, tipo: "Copa do Mundo 2026 — Panini", variante: "BROCHURA",      nome: "Trabalho", pct: 22.7 },
];

// ── CF0 — Seleção de álbum ────────────────────────────────────────────────
function CF0AlbumRow({ album, selected }) {
  const vt = CF_VARIANT[album.variante] || CF_VARIANT.BROCHURA;
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 14px", background: selected ? CF.ink : "#fff", border: `1.5px solid ${selected ? CF.ink : CF.line}`, boxShadow: selected ? `3px 3px 0 ${CF.red}` : "none", cursor: "pointer", position: "relative" }}>
      <div style={{ width: 20, height: 20, flexShrink: 0, background: selected ? CF.red : "#fff", border: `2px solid ${selected ? "#fff" : CF.ink}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {selected && <div style={{ width: 7, height: 7, background: "#fff", borderRadius: "50%" }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ padding: "2px 7px", background: vt.tagBg, color: vt.tagFg, fontFamily: CF.fontM, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase" }}>{vt.tag}</span>
          {album.nome && <span style={{ fontFamily: CF.fontB, fontSize: 11, color: selected ? "rgba(255,255,255,0.65)" : CF.mute }}>"{album.nome}"</span>}
        </div>
        <div style={{ fontFamily: CF.fontD, fontSize: 14, textTransform: "uppercase", color: selected ? "#fff" : CF.ink, lineHeight: 1.05 }}>{album.tipo}</div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: CF.fontD, fontSize: 22, color: selected ? "#fff" : CF.ink, lineHeight: 1 }}>{album.pct}<span style={{ fontFamily: CF.fontM, fontSize: 9 }}>%</span></div>
        <div style={{ width: 60, marginTop: 5 }}><ProgressBar pct={album.pct} /></div>
      </div>
    </label>
  );
}

const ANN_CF0 = [
  [1, "RN-CF02 / RN-CF03", "CF0 exibida SOMENTE quando o fluxo é acessado sem contexto de álbum (entrada C: navegação direta). Entradas A (Home) e B (Diálogo CA2) ignoram esta tela e abrem CF1 diretamente"],
  [2, "RN-CF04", "Estado vazio: se usuário não possui nenhum álbum, exibe mensagem + CTA para Cadastro de Álbum; o fluxo encerra-se aqui"],
  [3, "—",       "Lista não paginada — todos os álbuns do usuário exibidos. Cada item mostra: variante, nome_personalizado, tipo e percentual de conclusão"],
  [4, "RN-CF14", "Troca de álbum na CF1 reutiliza esta mesma lista de seleção inline, sem navegação"],
];

function CF0Mobile({ showAnnotations = true }) {
  const [ref] = cfMeasure();
  const ANN = showAnnotations;
  return (
    <CfVP.Provider value={{ isDesktop: false }}>
      <div ref={ref} style={{ background: CF.bg, fontFamily: CF.fontB, minHeight: "100%" }}>
        <CfMobileHeader title="Colar figurinhas" />
        <div style={{ padding: "20px 16px 32px", position: "relative" }}>
          {ANN && <CfAnn n="1" top={-8} right={-8} />}
          <div style={{ fontFamily: CF.fontM, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: CF.mute, marginBottom: 8 }}>CF0 · Seleção de álbum</div>
          <h1 style={{ margin: "0 0 20px", fontFamily: CF.fontD, fontSize: 32, textTransform: "uppercase", lineHeight: 0.92 }}>Escolha<br />um álbum</h1>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
            {ANN && <CfAnn n="3" top={-8} right={-8} />}
            {MOCK_ALBUMS_LISTA.map((a, i) => <CF0AlbumRow key={a.id} album={a} selected={i === 1} />)}
          </div>
          <div style={{ marginTop: 16, padding: "10px 14px", background: CF.cream, border: `1px dashed ${CF.line}`, fontFamily: CF.fontM, fontSize: 9, color: CF.mute, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Seleção não exige botão "Confirmar" — toque no álbum avança para CF1
          </div>
          <div style={{ marginTop: 16 }}>
            <button style={{ width: "100%", padding: "13px 0", background: "transparent", border: `1.5px solid ${CF.ink}`, fontFamily: CF.fontD, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em", color: CF.ink, cursor: "pointer" }}>
              Cancelar
            </button>
          </div>
          {ANN && <CfLegend items={ANN_CF0} />}
        </div>
      </div>
    </CfVP.Provider>
  );
}

// ── CF0 Empty ─────────────────────────────────────────────────────────────
function CF0EmptyMobile({ showAnnotations = true }) {
  const [ref] = cfMeasure();
  const ANN = showAnnotations;
  return (
    <CfVP.Provider value={{ isDesktop: false }}>
      <div ref={ref} style={{ background: CF.bg, fontFamily: CF.fontB, minHeight: "100%" }}>
        <CfMobileHeader title="Colar figurinhas" />
        <div style={{ padding: "20px 16px 32px" }}>
          <div style={{ fontFamily: CF.fontM, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: CF.mute, marginBottom: 8 }}>CF0 · Seleção de álbum</div>
          <h1 style={{ margin: "0 0 24px", fontFamily: CF.fontD, fontSize: 32, textTransform: "uppercase", lineHeight: 0.92 }}>Escolha<br />um álbum</h1>
          <div style={{ padding: "36px 16px", border: `2px dashed ${CF.line}`, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12, background: "rgba(10,9,7,0.02)", position: "relative" }}>
            {ANN && <CfAnn n="2" top={-8} right={-8} />}
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none"><rect x="6" y="8" width="32" height="28" rx="2" stroke={CF.ink} strokeWidth="2" strokeDasharray="4 3" /><path d="M22 17v10M17 22h10" stroke={CF.ink} strokeWidth="2" strokeLinecap="round" /></svg>
            <div style={{ fontFamily: CF.fontD, fontSize: 16, textTransform: "uppercase" }}>Nenhum álbum cadastrado</div>
            <p style={{ margin: 0, fontFamily: CF.fontB, fontSize: 13, color: CF.mute, maxWidth: 240, lineHeight: 1.4 }}>
              Crie seu primeiro álbum para começar a colar figurinhas.
            </p>
            <button style={{ marginTop: 4, padding: "12px 20px", background: CF.ink, color: "#fff", border: `2px solid ${CF.ink}`, boxShadow: `3px 3px 0 ${CF.red}`, fontFamily: CF.fontD, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer" }}>
              Criar álbum →
            </button>
          </div>
        </div>
      </div>
    </CfVP.Provider>
  );
}

// ── CF1 — Seletor de álbum ativo ──────────────────────────────────────────
function AlbumSelector({ album, withAnn, compact = true, showTrocar = false }) {
  const vt = CF_VARIANT[album.variante] || CF_VARIANT.BROCHURA;
  return (
    <div style={{ padding: compact ? "12px 14px" : "16px 20px", background: CF.ink, border: `2px solid ${CF.ink}`, boxShadow: `3px 3px 0 ${CF.red}`, position: "relative" }}>
      {withAnn && <CfAnn n="1" top={-8} right={-8} />}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ padding: "2px 7px", background: vt.tagBg, color: vt.tagFg, fontFamily: CF.fontM, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase" }}>{vt.tag}</span>
            {album.nome && <span style={{ fontFamily: CF.fontB, fontSize: 11, color: "rgba(255,255,255,0.6)" }}>"{album.nome}"</span>}
          </div>
          <div style={{ fontFamily: CF.fontD, fontSize: compact ? 14 : 17, color: "#fff", textTransform: "uppercase", lineHeight: 1.05, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{album.tipo}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: CF.fontD, fontSize: compact ? 26 : 36, color: "#fff", lineHeight: 1 }}>{album.pct}<span style={{ fontFamily: CF.fontM, fontSize: 10, color: "rgba(255,255,255,0.6)" }}>%</span></div>
          <div style={{ width: compact ? 56 : 80, marginTop: 4 }}>
            <div style={{ height: 4, background: "rgba(255,255,255,0.2)", position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${album.pct}%`, background: "#fff" }} />
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
        <button style={{ padding: "5px 12px", background: "transparent", border: "1.5px solid rgba(255,255,255,0.35)", fontFamily: CF.fontM, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", cursor: "pointer" }}>
          Trocar álbum ↓
        </button>
      </div>
    </div>
  );
}

// ── CF1 — Stock item ──────────────────────────────────────────────────────
function StockItem({ item, withAnn, confirming = false }) {
  const estadoBadge = {
    "pode-colar":    { bg: CF.green,             fg: "#fff",  label: "Pode colar"      },
    "ja-colada":     { bg: CF.amber,             fg: CF.ink,  label: "Já colada"       },
    "fora-catalogo": { bg: "rgba(10,9,7,0.15)",  fg: CF.mute, label: "Fora do catálogo"},
  }[item.estado];

  const disabled = item.estado === "fora-catalogo";
  const canColar  = !disabled;

  return (
    <div style={{ background: disabled ? "rgba(10,9,7,0.03)" : "#fff", border: `1.5px solid ${item.estado === "ja-colada" ? CF.amber : disabled ? CF.line : CF.ink}`, padding: "11px 12px", opacity: disabled ? 0.6 : 1, position: "relative" }}>
      {withAnn && <CfAnn n="3" top={-8} right={-8} />}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Figurinha placeholder */}
        <div style={{ width: 40, height: 56, background: CF.cream, border: `1.5px solid ${CF.line}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: CF.fontD, fontSize: 9, color: CF.mute }}>fig.</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
            <span style={{ fontFamily: CF.fontM, fontSize: 10, color: CF.mute, letterSpacing: "0.12em", textTransform: "uppercase" }}>{item.numero}</span>
            <span style={{ padding: "2px 6px", background: estadoBadge.bg, color: estadoBadge.fg, fontFamily: CF.fontM, fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase" }}>{estadoBadge.label}</span>
          </div>
          <div style={{ fontFamily: CF.fontD, fontSize: 14, textTransform: "uppercase", color: CF.ink, lineHeight: 1.05 }}>{item.nome}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* Quantidade */}
          <div style={{ width: 34, height: 34, background: CF.ink, color: "#fff", border: `2px solid ${CF.ink}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: CF.fontD }}>
            <div style={{ fontSize: 16, lineHeight: 1 }}>{item.qty}</div>
            <div style={{ fontSize: 7, opacity: 0.6, letterSpacing: "0.05em" }}>qtd</div>
          </div>
          {/* Botão Colar */}
          <button style={{ padding: "10px 12px", background: canColar ? CF.ink : CF.line, color: canColar ? "#fff" : CF.mute, border: `2px solid ${canColar ? CF.ink : CF.line}`, boxShadow: canColar ? `2px 2px 0 ${CF.red}` : "none", fontFamily: CF.fontD, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", cursor: disabled ? "not-allowed" : "pointer" }}>
            Colar
          </button>
          {/* Stepper +/− de quantidade (§5.7 · RN-CF30/CF31). Em telas estreitas
              os rótulos reduzem a "+"/"−"; aria-label fixo preserva o propósito (RN-CF32). */}
          <button aria-label="Adicionar repetida" style={{ padding: "10px 12px", background: "#fff", color: CF.ink, border: `2px solid ${CF.ink}`, boxShadow: `2px 2px 0 ${CF.ink}`, fontFamily: CF.fontD, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer" }}>
            + Repetida
          </button>
          <button aria-label="Descartar uma unidade" style={{ padding: "10px 12px", background: "#fff", color: CF.ink, border: `2px solid ${CF.ink}`, boxShadow: `2px 2px 0 ${CF.ink}`, fontFamily: CF.fontD, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer" }}>
            Descartar
          </button>
        </div>
      </div>
      {/* Confirmação inline "colar por cima" */}
      {confirming && (
        <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(232,155,12,0.08)", border: `1.5px solid ${CF.amber}` }}>
          {withAnn && <CfAnn n="5" top={-8} right={-8} />}
          <div style={{ fontFamily: CF.fontB, fontSize: 12.5, color: CF.ink, marginBottom: 10, lineHeight: 1.45 }}>
            Esta figurinha já está colada neste álbum. Colar novamente irá substituir a figurinha anterior. Confirmar?
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ flex: 1, padding: "9px 0", background: CF.amber, color: CF.ink, border: `2px solid ${CF.ink}`, boxShadow: `2px 2px 0 ${CF.ink}`, fontFamily: CF.fontD, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer" }}>Confirmar</button>
            <button style={{ flex: 1, padding: "9px 0", background: "transparent", color: CF.ink, border: `1.5px solid ${CF.ink}`, fontFamily: CF.fontD, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer" }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CF1 Mobile ────────────────────────────────────────────────────────────
const ANN_CF1 = [
  [1, "RN-CF15",  "Seletor de álbum ativo: exibe tipo, variante, nome_personalizado e percentual de conclusão · atualizado após cada colagem bem-sucedida sem recarregar a tela"],
  [2, "—",        "'Figurinha não registrada' abre o Modal MFN (seção 6 da spec) · disponível mesmo com estoque vazio"],
  [3, "RN-CF05 a CF08", "Três estados de elegibilidade por item: 'Pode colar' (verde), 'Já colada' (amarelo — colagem permitida com confirmação), 'Fora do catálogo' (desabilitado)"],
  [4, "RN-CF06",  "'Fora do catálogo': figurinha.tipo_album_id ≠ tipo_album_id do álbum ativo · desabilitada; ocorre quando o estoque contém figurinhas de outros tipos"],
  [5, "RN-CF09 / RN-CF13", "Confirmação inline 'colar por cima': exibida quando item está 'Já colada' · confirmar sobrescreve colada_em e origem do registro existente · não cria duplicata (RN-CF00)"],
  [6, "RN-CF10",  "Ao colar do estoque: EstoqueFigurinha.quantidade -1 · se atingir 0, item desaparece da lista"],
  [7, "RN-CF11 / RN-CF12", "Colar do estoque: FigurinhaColada.origem = ESTOQUE · colar via MFN: origem = DIRETA · estoque não alterado no caso DIRETA"],
  [8, "RN-CF17",  "Sem operação em lote; sem pilha de sessão (RN-CF18) · cada colagem é individual e persistida imediatamente"],
  [9, "RN-CF14",  "Trocar álbum: imediato, sem confirmação · recarrega indicadores de elegibilidade para o novo álbum · colagens já realizadas não são afetadas"],
  [10, "RN-CF30 / RN-CF31", "Stepper de quantidade (§5.7): '+ Repetida' incrementa EstoqueFigurinha.quantidade +1 (imediato, sem confirmação); 'Descartar' decrementa -1, com confirmação apenas na última unidade (quantidade == 1, removeria o item)"],
  [11, "RN-CF32",  "Rótulos responsivos: '+ Repetida' e 'Descartar' reduzem a '+' e '−' em telas estreitas; aria-label fixo preserva o propósito; glifo reduzido é aria-hidden; alvo de toque ≥ 24×24 (rec. 44×44) por RN-WG11"],
];

function CF1Mobile({ state = "normal", showAnnotations = true }) {
  const [ref] = cfMeasure();
  const ANN = showAnnotations;
  const isConfirming = state === "colar-cima";
  const isEmpty = state === "estoque-vazio";

  // Separar: só mostrar não-coladas por padrão; já-coladas ficam atrás do botão
  const naoColadas = MOCK_ESTOQUE.filter(item => item.estado !== "ja-colada");
  const jaColadas  = MOCK_ESTOQUE.filter(item => item.estado === "ja-colada");
  // Quando em modo "colar-cima", expandir já-coladas automaticamente pois é
  // exatamente nessa lista que a confirmação inline aparece
  const [showJaColadas, setShowJaColadas] = React.useState(isConfirming);

  return (
    <CfVP.Provider value={{ isDesktop: false }}>
      <div ref={ref} style={{ background: CF.bg, fontFamily: CF.fontB, minHeight: "100%" }}>
        <CfMobileHeader title="Colar figurinhas" />

        {/* Álbum ativo selector */}
        <div style={{ padding: "12px 16px 0" }}>
          <AlbumSelector album={MOCK_ALBUM_ATIVO} withAnn={ANN} />
        </div>

        {/* "Figurinha não registrada" CTA */}
        <div style={{ padding: "10px 16px 0", position: "relative" }}>
          {ANN && <CfAnn n="2" top={-2} right={8} />}
          <button style={{ width: "100%", padding: "11px 0", background: CF.paper, color: CF.ink, border: `1.5px solid ${CF.ink}`, fontFamily: CF.fontD, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer" }}>
            + Figurinha não registrada
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "12px 16px 0" }}>
          <input readOnly placeholder="Buscar por número ou nome…" style={{ width: "100%", padding: "11px 14px", background: "#fff", border: `1.5px solid ${CF.ink}`, fontFamily: CF.fontB, fontSize: 13, color: CF.ink, outline: "none", borderRadius: 0, boxSizing: "border-box" }} />
        </div>

        {/* Stock list */}
        <div style={{ padding: "12px 16px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
          {isEmpty
            ? <div style={{ padding: "36px 16px", border: `2px dashed ${CF.line}`, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10, background: "rgba(10,9,7,0.02)", position: "relative" }}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="4" y="8" width="24" height="28" rx="2" stroke={CF.ink} strokeWidth="2" strokeDasharray="3 3" /><rect x="12" y="4" width="24" height="28" rx="2" stroke={CF.ink} strokeWidth="2" strokeDasharray="3 3" /></svg>
                <div style={{ fontFamily: CF.fontD, fontSize: 15, textTransform: "uppercase" }}>Estoque vazio</div>
                <p style={{ margin: 0, fontFamily: CF.fontB, fontSize: 12, color: CF.mute, maxWidth: 220, lineHeight: 1.4 }}>Abra pacotinhos para acumular figurinhas. Use "Figurinha não registrada" para colar diretamente.</p>
              </div>
            : <>
                {/* Apenas figurinhas NÃO coladas */}
                {naoColadas.map((item, i) => (
                  <StockItem key={i} item={item} withAnn={i === 0 && ANN} confirming={false} />
                ))}

                {/* Botão para revelar já-coladas */}
                {jaColadas.length > 0 && (
                  <button
                    onClick={() => setShowJaColadas(v => !v)}
                    style={{
                      marginTop: 4,
                      width: "100%", padding: "11px 14px",
                      background: showJaColadas ? CF.ink : CF.paper,
                      color: showJaColadas ? "#fff" : CF.ink,
                      border: `1.5px solid ${CF.ink}`,
                      fontFamily: CF.fontD, fontSize: 12,
                      textTransform: "uppercase", letterSpacing: "0.04em",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}
                  >
                    <span>Figurinhas já coladas</span>
                    <span style={{ fontFamily: CF.fontM, fontSize: 10, opacity: 0.7 }}>
                      {jaColadas.length} {showJaColadas ? "▲" : "▼"}
                    </span>
                  </button>
                )}

                {/* Lista de já-coladas (revelada ao clicar) */}
                {showJaColadas && jaColadas.map((item, i) => (
                  <StockItem key={`jc-${i}`} item={item} withAnn={false} confirming={isConfirming && item.estado === "ja-colada"} />
                ))}
              </>
          }
          {ANN && <CfLegend items={ANN_CF1} />}
        </div>
      </div>
    </CfVP.Provider>
  );
}

// ── CF1 Desktop ───────────────────────────────────────────────────────────
function CF1Desktop({ showAnnotations = true }) {
  const [ref] = cfMeasure();
  const ANN = showAnnotations;

  return (
    <CfVP.Provider value={{ isDesktop: true }}>
      <div ref={ref} style={{ background: CF.bg, fontFamily: CF.fontB, minHeight: "100%", position: "relative", paddingLeft: SIDEBAR_W }}>
        <CfSidebar />
        {/* Top bar */}
        <div style={{ height: 60, padding: "0 32px", background: CF.paper, borderBottom: `2px solid ${CF.ink}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: CF.fontM, fontSize: 10, color: CF.mute, letterSpacing: "0.16em", textTransform: "uppercase" }}>Meus Álbuns</span>
            <span style={{ color: CF.line, margin: "0 4px" }}>/</span>
            <h1 style={{ margin: 0, fontFamily: CF.fontD, fontSize: 18, textTransform: "uppercase", letterSpacing: "0.04em" }}>Colar Figurinhas</h1>
          </div>
          <div style={{ fontFamily: CF.fontM, fontSize: 10, letterSpacing: "0.14em", color: CF.mute, textTransform: "uppercase" }}>16 mai 2026</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, padding: "24px 32px", alignItems: "start" }}>
          {/* Left: stock list */}
          <div>
            {/* Search + CTA */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <input readOnly placeholder="Buscar figurinha por número ou nome…" style={{ flex: 1, padding: "11px 14px", background: "#fff", border: `1.5px solid ${CF.ink}`, fontFamily: CF.fontB, fontSize: 13, color: CF.ink, outline: "none", borderRadius: 0 }} />
              <button style={{ padding: "11px 18px", background: CF.paper, border: `1.5px solid ${CF.ink}`, fontFamily: CF.fontD, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer", whiteSpace: "nowrap", position: "relative" }}>
                {ANN && <CfAnn n="2" top={-10} right={-10} />}
                + Figurinha não registrada
              </button>
            </div>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 80px 70px 80px", gap: 10, padding: "8px 12px", background: CF.ink, color: "rgba(255,255,255,0.7)", fontFamily: CF.fontM, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 4 }}>
              <div>Fig.</div><div>Nome</div><div>Estado</div><div>Qtd</div><div></div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {MOCK_ESTOQUE.map((item, i) => {
                const estadoBadge = {
                  "pode-colar":    { bg: CF.green, fg: "#fff", label: "Pode colar" },
                  "ja-colada":     { bg: CF.amber, fg: CF.ink, label: "Já colada"  },
                  "fora-catalogo": { bg: CF.line,  fg: CF.mute,label: "Fora cat."  },
                }[item.estado];
                const disabled = item.estado === "fora-catalogo";
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "48px 1fr 80px 70px 80px", gap: 10, alignItems: "center", padding: "10px 12px", background: disabled ? "rgba(10,9,7,0.03)" : "#fff", border: `1.5px solid ${item.estado === "ja-colada" ? CF.amber : disabled ? CF.line : CF.line}`, opacity: disabled ? 0.6 : 1, position: "relative" }}>
                    {i === 0 && ANN && <CfAnn n="3" top={-8} right={-8} />}
                    <div style={{ width: 40, height: 54, background: CF.cream, border: `1px solid ${CF.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: CF.fontD, fontSize: 8, color: CF.mute }}>fig.</div>
                    <div>
                      <div style={{ fontFamily: CF.fontM, fontSize: 9, color: CF.mute, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>{item.numero}</div>
                      <div style={{ fontFamily: CF.fontD, fontSize: 13, textTransform: "uppercase", color: CF.ink }}>{item.nome}</div>
                    </div>
                    <span style={{ padding: "3px 7px", background: estadoBadge.bg, color: estadoBadge.fg, fontFamily: CF.fontM, fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", alignSelf: "center" }}>{estadoBadge.label}</span>
                    <div style={{ textAlign: "center" }}>
                      <span style={{ fontFamily: CF.fontD, fontSize: 22, color: CF.ink }}>{item.qty}</span>
                      <div style={{ fontFamily: CF.fontM, fontSize: 8, color: CF.mute, letterSpacing: "0.08em" }}>no estoque</div>
                    </div>
                    <button style={{ padding: "9px 0", background: disabled ? CF.line : CF.ink, color: disabled ? CF.mute : "#fff", border: `1.5px solid ${disabled ? CF.line : CF.ink}`, boxShadow: disabled ? "none" : `2px 2px 0 ${CF.red}`, fontFamily: CF.fontD, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", cursor: disabled ? "not-allowed" : "pointer", width: "100%" }}>
                      Colar
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: album panel (sticky) */}
          <div style={{ position: "sticky", top: 84 }}>
            <AlbumSelector album={MOCK_ALBUM_ATIVO} withAnn={ANN} compact={false} />
            {/* Legend */}
            <div style={{ marginTop: 12, padding: "10px 12px", background: CF.paper, border: `1px solid ${CF.line}` }}>
              <div style={{ fontFamily: CF.fontM, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: CF.mute, marginBottom: 8 }}>Legenda de elegibilidade</div>
              {[
                [CF.green, "#fff", "Pode colar"],
                [CF.amber, CF.ink, "Já colada — requer confirmação"],
                ["rgba(10,9,7,0.15)", CF.mute, "Fora do catálogo — desabilitado"],
              ].map(([bg, fg, label], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ padding: "2px 7px", background: bg, color: fg, fontFamily: CF.fontM, fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CfVP.Provider>
  );
}

// ── Modal MFN ─────────────────────────────────────────────────────────────
const ANN_MFN = [
  [1, "§6 spec",  "MFN reutiliza os elementos visuais do Modal Câmera (MC) de Abrir Pacotinhos · modos Digitar e Fotografar disponíveis"],
  [2, "RN-CF16",  "Validação usa tipo_album_id do álbum ativo no momento da abertura do modal; troca de álbum na CF1 não afeta modal já aberto"],
  [3, "RN-CF11",  "Figurinha confirmada no MFN: FigurinhaColada.origem = DIRETA · EstoqueFigurinha NÃO é alterado"],
  [4, "RN-CF09",  "Se figurinha já colada no álbum: exibe alerta de confirmação 'colar por cima' dentro do próprio modal antes de gravar"],
  [5, "§6 spec",  "Opção 'Fotografar próxima' presente — permite registrar múltiplas figurinhas sequencialmente sem fechar o modal"],
];

function MFNModal({ mode = "digitar", showAnnotations = true }) {
  const [ref] = cfMeasure();
  const ANN = showAnnotations;
  return (
    <CfVP.Provider value={{ isDesktop: false }}>
      <div ref={ref} style={{ background: CF.bg, fontFamily: CF.fontB, minHeight: "100%", position: "relative" }}>
        {/* Blurred background (CF1) */}
        <div style={{ filter: "blur(0.5px)", opacity: 0.55, pointerEvents: "none" }}>
          <CfMobileHeader title="Colar figurinhas" />
          <div style={{ padding: "12px 16px 0" }}>
            <AlbumSelector album={MOCK_ALBUM_ATIVO} compact />
          </div>
          <div style={{ padding: "10px 16px 0" }}>
            <input readOnly placeholder="Buscar figurinha…" style={{ width: "100%", padding: "11px 14px", background: "#fff", border: `1.5px solid ${CF.ink}`, fontFamily: CF.fontB, fontSize: 13, color: CF.ink, outline: "none", borderRadius: 0, boxSizing: "border-box" }} />
          </div>
        </div>
        {/* Scrim */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,9,7,0.72)" }} />
        {/* Modal */}
        <div style={{ position: "absolute", left: 16, right: 16, top: "50%", transform: "translateY(-50%)" }}>
          <div style={{ background: CF.paper, border: `2.5px solid ${CF.ink}`, boxShadow: `6px 6px 0 ${CF.green}`, position: "relative" }}>
            {ANN && <CfAnn n="1" top={-10} left={-10} />}
            {/* Header */}
            <div style={{ background: CF.green, color: "#fff", padding: "10px 14px", fontFamily: CF.fontM, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", display: "flex", justifyContent: "space-between" }}>
              <span>● Figurinha não registrada</span>
              <button style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontFamily: CF.fontM, fontSize: 11, letterSpacing: "0.1em" }}>✕</button>
            </div>
            {/* Perforation */}
            <div style={{ height: 12, background: CF.cream, borderBottom: `2px dashed ${CF.ink}`, position: "relative" }}>
              <div style={{ position: "absolute", left: -8, top: -4, width: 16, height: 16, borderRadius: "50%", background: CF.bg, border: `2px solid ${CF.ink}` }} />
              <div style={{ position: "absolute", right: -8, top: -4, width: 16, height: 16, borderRadius: "50%", background: CF.bg, border: `2px solid ${CF.ink}` }} />
            </div>
            {/* Mode toggle */}
            <div style={{ padding: "12px 14px 8px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "inline-flex", padding: 2, background: CF.cream, border: `2px solid ${CF.ink}`, boxShadow: `2px 2px 0 ${CF.ink}` }}>
                {["Digitar", "Fotografar"].map((m, i) => (
                  <div key={i} style={{ padding: "6px 12px", background: (i === 0 && mode === "digitar") || (i === 1 && mode !== "digitar") ? CF.ink : "transparent", color: (i === 0 && mode === "digitar") || (i === 1 && mode !== "digitar") ? "#fff" : CF.ink, fontFamily: CF.fontD, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}>{m}</div>
                ))}
              </div>
            </div>

            {mode === "digitar" ? (
              <div style={{ padding: "0 14px 14px" }}>
                <label style={{ fontFamily: CF.fontM, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: CF.mute, display: "block", marginBottom: 6 }}>Número da figurinha</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input readOnly value="BRA-07" style={{ flex: 1, padding: "13px 12px", background: "#fff", color: CF.ink, border: `2px solid ${CF.ink}`, fontFamily: CF.fontD, fontSize: 20, letterSpacing: "0.04em", textTransform: "uppercase", outline: "none", borderRadius: 0 }} />
                  <button style={{ padding: "0 14px", background: CF.green, color: "#fff", border: `2px solid ${CF.ink}`, boxShadow: `2px 2px 0 ${CF.ink}`, fontFamily: CF.fontD, fontSize: 11, textTransform: "uppercase", cursor: "pointer" }}>Validar</button>
                </div>
                {/* Resultado positivo */}
                <div style={{ marginTop: 10, padding: "8px 10px", background: "rgba(10,145,69,0.08)", border: `1.5px solid ${CF.green}`, fontFamily: CF.fontM, fontSize: 10, color: CF.green, letterSpacing: "0.1em", textTransform: "uppercase", position: "relative" }}>
                  {ANN && <CfAnn n="2" top={-8} right={-8} />}
                  ✓ Encontrada · Copa 2026 · Raphinha · BRA-07
                </div>
              </div>
            ) : (
              <div style={{ margin: "0 14px 14px", height: 180, background: "#0d0d0a", position: "relative", border: `1.5px solid ${CF.ink}`, overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.06), transparent 60%)" }} />
                <div style={{ position: "absolute", inset: 20, border: "2px dashed rgba(255,255,255,0.65)" }} />
                {[[0,0],[0,1],[1,0],[1,1]].map(([y,x],i) => (
                  <div key={i} style={{ position: "absolute", top: y ? "auto" : 12, bottom: y ? 12 : "auto", left: x ? "auto" : 12, right: x ? 12 : "auto", width: 16, height: 16, borderTop: y ? "none" : `3px solid ${CF.red}`, borderBottom: y ? `3px solid ${CF.red}` : "none", borderLeft: x ? "none" : `3px solid ${CF.red}`, borderRight: x ? `3px solid ${CF.red}` : "none" }} />
                ))}
                <div style={{ position: "absolute", bottom: 8, left: 8, fontFamily: CF.fontM, fontSize: 9, color: "rgba(255,255,255,0.8)", letterSpacing: "0.14em", textTransform: "uppercase", background: "rgba(0,0,0,0.5)", padding: "2px 6px" }}>● OCR local (RN-AP21)</div>
              </div>
            )}

            {/* Actions */}
            <div style={{ padding: "10px 14px", background: CF.cream, borderTop: `1.5px solid ${CF.ink}`, display: "flex", gap: 8 }}>
              <button style={{ flex: 1, padding: "11px 0", background: "transparent", border: `1.5px solid ${CF.ink}`, fontFamily: CF.fontD, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer" }}>Cancelar</button>
              <button style={{ flex: 2, padding: "11px 0", background: CF.green, color: "#fff", border: `2px solid ${CF.ink}`, boxShadow: `2px 2px 0 ${CF.ink}`, fontFamily: CF.fontD, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer", position: "relative" }}>
                {ANN && <CfAnn n="3" top={-10} right={-10} />}
                Colar neste álbum →
              </button>
            </div>
          </div>
          {ANN && <CfLegend items={ANN_MFN} />}
        </div>
      </div>
    </CfVP.Provider>
  );
}

Object.assign(window, { CF0Mobile, CF0EmptyMobile, CF1Mobile, CF1Desktop, MFNModal });
