// cadastro-album.jsx — Tela CA1 (Cadastro de Álbum) + Diálogo CA2
// Hi-fi anotado · mobile (390) + desktop (1280) · estado: variante selecionada
// Referência visual: styles.css + Home.html · regras: spec_cadastro_album.md

// ── tokens locais ─────────────────────────────────────────────────────────

const CA = {
  bg:         "#F0EDE4",
  paper:      "#FBF8EE",
  ink:        "#0A0907",
  red:        "#E5142A",
  green:      "#0A9145",
  blue:       "#0B2A66",
  cream:      "#F0E9D6",
  placeholder:"#D4D0C8",
  line:       "rgba(10,9,7,0.18)",
  lineSoft:   "rgba(10,9,7,0.10)",
  fontD: "var(--font-display)",
  fontB: "var(--font-body)",
  fontM: "var(--font-mono)",
};

// catálogo de variantes — preço de lançamento informacional (RN-CA04)
const VARIANTES = [
  {
    id: "BROCHURA",
    nome: "Brochura",
    legenda: "Capa flexível, papel comum",
    preco: "R$ 24,90",
    bg: "#FFFFFF",
    border: `1.5px solid ${CA.ink}`,
    shadow: "none",
    accent: "#8C887F",
    tagBg: "#E0DDD5", tagColor: CA.ink,
    dark: false,
  },
  {
    id: "CAPA_DURA",
    nome: "Capa dura",
    legenda: "Capa rígida cartonada",
    preco: "R$ 74,90",
    bg: "#F5F0E4",
    border: `2px solid ${CA.ink}`,
    shadow: `3px 3px 0 #C8C4BC`,
    accent: "#7A6F58",
    tagBg: "#C8C4BC", tagColor: CA.ink,
    dark: false,
  },
  {
    id: "CAPA_DURA_PRATA",
    nome: "Capa dura prata",
    legenda: "Acabamento metalizado prata",
    preco: "R$ 79,90",
    bg: "repeating-linear-gradient(135deg,#F0EDE4 0 6px,#E0DDD5 6px 8px)",
    border: `2px solid ${CA.ink}`,
    shadow: `3px 3px 0 #9E9E9E`,
    accent: "#7C7C7C",
    tagBg: "#9E9E9E", tagColor: "#fff",
    dark: false,
  },
  {
    id: "CAPA_DURA_OURO",
    nome: "Capa dura ouro",
    legenda: "Acabamento metalizado ouro",
    preco: "R$ 79,90",
    bg: "#FEF3CC",
    border: `2px solid #8B6914`,
    shadow: `3px 3px 0 #C49A1A`,
    accent: "#A0791A",
    tagBg: "#C49A1A", tagColor: "#fff",
    dark: false,
  },
  {
    id: "BOX_PREMIUM",
    nome: "Box Premium",
    legenda: "Estojo com cards exclusivos",
    preco: "R$ 359,90",
    bg: CA.ink,
    border: `2px solid ${CA.ink}`,
    shadow: `4px 4px 0 ${CA.red}`,
    accent: CA.red,
    tagBg: CA.red, tagColor: "#fff",
    dark: true,
  },
];

const getVariante = (id) => VARIANTES.find(v => v.id === id) || VARIANTES[0];

// estado mock pré-resolvido para os artboards
const TIPO_ALBUM = {
  id: "wc-2026-panini",
  nome: "Copa do Mundo 2026 — Panini",
  edicao: "Edição oficial 2026",
  total: 980,
  pais: "BRASIL · ARGENTINA · MÉXICO",
};

const SELECTED_VARIANTE = "CAPA_DURA_OURO"; // visual da tela atualizado (RN-CA05)
const NOME_PERSONALIZADO = "Meu álbum principal";

// ── viewport context ──────────────────────────────────────────────────────

function caMeasure() {
  const ref = React.useRef(null);
  const [w, setW] = React.useState(typeof window !== "undefined" ? 390 : 390);
  React.useEffect(() => {
    if (!ref.current) return;
    const init = ref.current.offsetWidth;
    if (init > 0) setW(init);
    const ro = new ResizeObserver(e => setW(e[0].contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}
const CaVP = React.createContext({ isDesktop: false });
const useCVP = () => React.useContext(CaVP);

// ── helpers ───────────────────────────────────────────────────────────────

function Ann({ n, top, right, left, bottom }) {
  return (
    <div style={{
      position: "absolute", top, right, left, bottom,
      width: 22, height: 22, borderRadius: "50%",
      background: CA.red, color: "#fff",
      fontSize: 10, fontWeight: 700,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: CA.fontM, zIndex: 30, flexShrink: 0,
      border: `2px solid ${CA.paper}`,
      boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
      letterSpacing: 0,
    }}>{n}</div>
  );
}

function CaLegend({ items }) {
  return (
    <div style={{
      marginTop: 32, padding: 18,
      background: CA.paper, border: `1.5px solid ${CA.ink}`,
    }}>
      <div style={{ fontFamily: CA.fontM, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(10,9,7,0.5)", marginBottom: 12 }}>
        Anotações — regras de negócio
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 24, rowGap: 8 }}>
        {items.map(([n, code, txt]) => (
          <div key={n} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
              background: CA.red, color: "#fff",
              fontSize: 10, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: CA.fontM, marginTop: 1,
            }}>{n}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: CA.fontM, fontSize: 9, letterSpacing: "0.14em", color: CA.red, textTransform: "uppercase", marginBottom: 2 }}>
                {code}
              </div>
              <div style={{ fontSize: 12, color: CA.ink, lineHeight: 1.45, fontFamily: CA.fontB }}>
                {txt}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// emblema fictício (não recria marcas oficiais)
function EmblemaCopa({ size = 64, color = CA.ink }) {
  return (
    <div style={{
      width: size, height: size, border: `2px solid ${color}`,
      borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", flexShrink: 0,
      fontFamily: CA.fontD, color: color,
      lineHeight: 0.9,
    }}>
      <span style={{ fontSize: size * 0.28, letterSpacing: "0.04em" }}>COPA</span>
      <span style={{ fontSize: size * 0.36, marginTop: 2 }}>26</span>
    </div>
  );
}

// ── álbum preview (mockup) ────────────────────────────────────────────────

function AlbumPreview({ varId, nome, size = "md" }) {
  const v = getVariante(varId);
  const W = size === "lg" ? 280 : size === "sm" ? 180 : 240;
  const H = Math.round(W * 1.34);
  const dark = !!v.dark;
  const textColor = dark ? "#fff" : CA.ink;
  const subColor  = dark ? "rgba(255,255,255,0.7)" : "rgba(10,9,7,0.6)";
  const edgeColor = dark ? "rgba(255,255,255,0.2)" : "rgba(10,9,7,0.18)";

  return (
    <div style={{ width: W, position: "relative", flexShrink: 0 }}>
      {/* cover */}
      <div style={{
        width: W, height: H,
        background: v.bg,
        border: v.border,
        boxShadow: v.shadow,
        padding: "20px 18px",
        display: "flex", flexDirection: "column",
        position: "relative",
      }}>
        {/* tag variante */}
        <div style={{
          alignSelf: "flex-start",
          padding: "4px 9px",
          background: v.tagBg, color: v.tagColor,
          fontFamily: CA.fontM, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
          border: `1px solid ${dark ? v.tagBg : CA.ink}`,
        }}>{v.nome}</div>

        {/* gold/silver foil shine line para variantes metalizadas */}
        {(varId === "CAPA_DURA_OURO" || varId === "CAPA_DURA_PRATA") && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "100%",
            backgroundImage: `linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.45) 50%, transparent 60%)`,
            pointerEvents: "none",
          }} />
        )}

        {/* emblema */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <EmblemaCopa size={size === "lg" ? 92 : 76} color={textColor} />
        </div>

        {/* título */}
        <div style={{ position: "relative" }}>
          <div style={{
            fontFamily: CA.fontD, fontSize: size === "lg" ? 22 : 18,
            color: textColor, textTransform: "uppercase", lineHeight: 0.95,
            marginBottom: 4,
          }}>
            Copa do<br />Mundo<br />
            <span style={{ color: dark ? CA.red : v.accent }}>2026</span>
          </div>
          <div style={{
            fontFamily: CA.fontM, fontSize: 8, letterSpacing: "0.18em",
            color: subColor, textTransform: "uppercase",
            paddingTop: 6, borderTop: `1px solid ${edgeColor}`,
          }}>
            {TIPO_ALBUM.total} figurinhas · ed. oficial
          </div>
        </div>
      </div>

      {/* card label (nome personalizado abaixo da capa) */}
      {nome && (
        <div style={{ marginTop: 14, padding: "0 4px", overflow: "hidden" }}>
          <div style={{ fontFamily: CA.fontM, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(10,9,7,0.45)", marginBottom: 4 }}>
            Apelido
          </div>
          <div style={{ fontFamily: CA.fontD, fontSize: 14, textTransform: "uppercase", color: CA.ink, letterSpacing: "0.01em", lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            "{nome}"
          </div>
        </div>
      )}
    </div>
  );
}

// ── sidebar (desktop) ─────────────────────────────────────────────────────

const SIDEBAR_W = 228;

function CaSidebar() {
  const NAV = [
    { icon: "⊞", label: "Início",       active: false },
    { icon: "◻", label: "Meus Álbuns",  active: true  },
    { icon: "◈", label: "Figurinhas",   active: false },
    { icon: "⇄", label: "Trocas",       active: false },
    { icon: "○", label: "Perfil",       active: false },
  ];
  return (
    <aside style={{
      width: SIDEBAR_W, flexShrink: 0,
      position: "absolute", top: 0, left: 0, bottom: 0,
      background: CA.paper, borderRight: `2px solid ${CA.ink}`,
      display: "flex", flexDirection: "column", zIndex: 5,
    }}>
      <div style={{ padding: "20px 20px 18px", borderBottom: `2px solid ${CA.ink}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, background: CA.red, color: "#fff",
            border: `2px solid ${CA.ink}`, boxShadow: `2px 2px 0 ${CA.ink}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: CA.fontD, fontSize: 12, transform: "rotate(-4deg)", flexShrink: 0,
          }}>MA</div>
          <span style={{ fontFamily: CA.fontD, fontSize: 14, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Meu Album
          </span>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "10px 0" }}>
        {NAV.map((item, i) => (
          <div key={i} style={{
            padding: "11px 20px",
            display: "flex", alignItems: "center", gap: 12,
            background: item.active ? CA.bg : "transparent",
            borderLeft: item.active ? `3px solid ${CA.red}` : "3px solid transparent",
            cursor: "pointer",
          }}>
            <span style={{
              fontFamily: CA.fontM, fontSize: 15, width: 18, textAlign: "center",
              color: item.active ? CA.red : "rgba(10,9,7,0.45)",
            }}>{item.icon}</span>
            <span style={{
              fontFamily: CA.fontB, fontSize: 13, fontWeight: 600,
              color: item.active ? CA.red : CA.ink,
            }}>{item.label}</span>
          </div>
        ))}
      </nav>
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${CA.line}` }}>
        <button style={{
          width: "100%", padding: "12px 14px",
          background: CA.red, color: "#fff",
          border: `2px solid ${CA.ink}`, boxShadow: `2px 2px 0 ${CA.ink}`,
          fontFamily: CA.fontD, fontSize: 13, textTransform: "uppercase",
          letterSpacing: "0.04em", cursor: "pointer",
        }}>
          + Abrir pacotinhos
        </button>
      </div>
      <div style={{
        padding: "14px 16px", borderTop: `2px solid ${CA.ink}`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, background: CA.ink, color: "#fff", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: CA.fontD, fontSize: 13,
        }}>J</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: CA.fontD, fontSize: 12, textTransform: "uppercase" }}>João S.</div>
          <div style={{ fontFamily: CA.fontM, fontSize: 9, color: "rgba(10,9,7,0.55)", letterSpacing: "0.12em" }}>#XB3K29</div>
        </div>
      </div>
    </aside>
  );
}

// ── inputs / fields ───────────────────────────────────────────────────────

function FieldLabel({ children, optional }) {
  return (
    <label style={{
      display: "flex", alignItems: "baseline", gap: 8,
      fontFamily: CA.fontM, fontSize: 10, fontWeight: 600,
      letterSpacing: "0.14em", textTransform: "uppercase",
      color: "rgba(10,9,7,0.65)", marginBottom: 8,
    }}>
      <span>{children}</span>
      {optional && (
        <span style={{ fontFamily: CA.fontM, fontSize: 9, color: "rgba(10,9,7,0.4)", letterSpacing: "0.1em" }}>
          (opcional)
        </span>
      )}
    </label>
  );
}

function TipoField() {
  return (
    <div style={{ position: "relative" }}>
      <div style={{
        width: "100%",
        padding: "14px 16px",
        background: "rgba(10,9,7,0.04)",
        border: `1.5px solid ${CA.line}`,
        borderRadius: 4,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        cursor: "not-allowed",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 28, height: 28, background: CA.ink, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: CA.fontD, fontSize: 10, flexShrink: 0,
          }}>26</div>
          <div>
            <div style={{ fontFamily: CA.fontB, fontSize: 14, fontWeight: 600, color: CA.ink }}>
              {TIPO_ALBUM.nome}
            </div>
            <div style={{ fontFamily: CA.fontM, fontSize: 10, letterSpacing: "0.12em", color: "rgba(10,9,7,0.5)", textTransform: "uppercase", marginTop: 2 }}>
              Único tipo disponível no catálogo
            </div>
          </div>
        </div>
        <div style={{
          padding: "4px 8px", background: CA.ink, color: "#fff",
          fontFamily: CA.fontM, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase",
        }}>
          Pré-selecionado
        </div>
      </div>
    </div>
  );
}

function BlocoDetalhes() {
  return (
    <div style={{
      marginTop: 12,
      padding: "16px 18px",
      background: CA.paper,
      border: `1.5px solid ${CA.ink}`,
      borderLeft: `4px solid ${CA.red}`,
      position: "relative",
    }}>
      <div style={{
        position: "absolute", top: -9, left: 14,
        padding: "1px 8px", background: CA.ink, color: "#fff",
        fontFamily: CA.fontM, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
      }}>
        Detalhes do tipo
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center", marginTop: 4 }}>
        <div>
          <div style={{ fontFamily: CA.fontD, fontSize: 16, textTransform: "uppercase", letterSpacing: "0.01em", lineHeight: 1.1, color: CA.ink }}>
            {TIPO_ALBUM.nome}
          </div>
          <div style={{ fontFamily: CA.fontM, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(10,9,7,0.55)", marginTop: 6 }}>
            {TIPO_ALBUM.edicao} · {TIPO_ALBUM.pais}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: CA.fontD, fontSize: 28, color: CA.red, lineHeight: 1 }}>
            {TIPO_ALBUM.total}
          </div>
          <div style={{ fontFamily: CA.fontM, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(10,9,7,0.5)", marginTop: 2 }}>
            figurinhas
          </div>
        </div>
      </div>
    </div>
  );
}

function VarianteCard({ v, selected, compact }) {
  const dark = !!v.dark;
  const textColor = dark ? "#fff" : CA.ink;
  const subColor  = dark ? "rgba(255,255,255,0.65)" : "rgba(10,9,7,0.55)";
  const dashedColor = dark ? "rgba(255,255,255,0.25)" : CA.lineSoft;

  if (compact) {
    // mobile: card SEM miniatura — efeitos da variante aplicados ao fundo do próprio card
    return (
      <div style={{
        width: 168, flexShrink: 0,
        position: "relative",
      }}>
        {selected && (
          <div style={{
            position: "absolute", top: -10, right: -10,
            width: 22, height: 22, borderRadius: "50%",
            background: CA.red, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `2px solid ${CA.paper}`, zIndex: 2,
          }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2 6.2 4.8 9 10 3.4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
        <div style={{
          minHeight: 196,
          padding: "14px 14px 12px",
          background: v.bg,
          border: selected ? `2px solid ${CA.red}` : v.border,
          boxShadow: selected ? `3px 3px 0 ${CA.ink}` : (v.shadow !== "none" ? v.shadow : "none"),
          position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column",
          cursor: "pointer",
        }}>
          {/* foil shine para metalizadas */}
          {(v.id === "CAPA_DURA_OURO" || v.id === "CAPA_DURA_PRATA") && (
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.45) 50%, transparent 60%)`,
              pointerEvents: "none",
            }} />
          )}
          {/* emblema decorativo no topo direito */}
          <div style={{ position: "absolute", top: 12, right: 12, opacity: 0.55 }}>
            <EmblemaCopa size={30} color={textColor} />
          </div>
          <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{
              fontFamily: CA.fontD, fontSize: 14, textTransform: "uppercase",
              letterSpacing: "0.01em", color: textColor, lineHeight: 1.05,
            }}>
              {v.nome}
            </div>
            <div style={{
              fontFamily: CA.fontB, fontSize: 11, color: subColor,
              marginTop: 4, lineHeight: 1.35,
            }}>
              {v.legenda}
            </div>
            {/* preço — discreto, como rodapé do card (RN-CA04) */}
            <div style={{
              marginTop: 10, paddingTop: 6,
              borderTop: `1px dashed ${dashedColor}`,
              display: "flex", justifyContent: "space-between", alignItems: "baseline",
            }}>
              <span style={{ fontFamily: CA.fontM, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: subColor }}>
                Lançamento
              </span>
              <span style={{ fontFamily: CA.fontM, fontSize: 11, fontWeight: 500, color: textColor }}>
                {v.preco}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // desktop: card branco com mini preview no topo
  return (
    <div style={{
      width: 168,
      padding: 12,
      background: selected ? CA.paper : "#fff",
      border: selected ? `2px solid ${CA.red}` : `1.5px solid ${CA.line}`,
      boxShadow: selected ? `3px 3px 0 ${CA.ink}` : "none",
      cursor: "pointer", position: "relative",
      transition: "all .12s ease",
      display: "flex", flexDirection: "column",
    }}>
      {selected && (
        <div style={{
          position: "absolute", top: -10, right: -10,
          width: 22, height: 22, borderRadius: "50%",
          background: CA.red, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `2px solid ${CA.paper}`,
        }}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2 6.2 4.8 9 10 3.4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      <div style={{
        width: "100%", height: 120,
        background: v.bg, border: v.border, boxShadow: v.shadow,
        flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 4, position: "relative", overflow: "hidden",
      }}>
        {(v.id === "CAPA_DURA_OURO" || v.id === "CAPA_DURA_PRATA") && (
          <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(115deg, transparent 45%, rgba(255,255,255,0.45) 52%, transparent 60%)` }} />
        )}
        <EmblemaCopa size={52} color={dark ? "#fff" : CA.ink} />
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={{ fontFamily: CA.fontD, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.01em", color: CA.ink, lineHeight: 1.1 }}>
          {v.nome}
        </div>
        <div style={{ fontFamily: CA.fontB, fontSize: 11, color: "rgba(10,9,7,0.55)", marginTop: 3, lineHeight: 1.35 }}>
          {v.legenda}
        </div>
        <div style={{
          marginTop: 8, paddingTop: 6,
          borderTop: `1px dashed ${CA.lineSoft}`,
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
        }}>
          <span style={{ fontFamily: CA.fontM, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(10,9,7,0.4)" }}>
            Lançamento
          </span>
          <span style={{ fontFamily: CA.fontM, fontSize: 11, fontWeight: 500, color: "rgba(10,9,7,0.75)" }}>
            {v.preco}
          </span>
        </div>
      </div>
    </div>
  );
}

function NomeInput({ value }) {
  const len = (value || "").length;
  return (
    <div style={{ position: "relative" }}>
      <div style={{
        width: "100%", padding: "14px 16px",
        background: "#fff",
        border: `1.5px solid ${CA.ink}`,
        borderRadius: 4,
        fontFamily: CA.fontB, fontSize: 14, color: CA.ink,
        boxShadow: `inset 0 0 0 3px rgba(229,20,42,0.06)`,
      }}>
        {value || <span style={{ color: "rgba(10,9,7,0.35)" }}>Ex.: Meu álbum principal</span>}
      </div>
      <div style={{
        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
        fontFamily: CA.fontM, fontSize: 10, color: "rgba(10,9,7,0.45)", letterSpacing: "0.08em",
        background: "#fff", padding: "0 4px",
      }}>
        {len}/60
      </div>
    </div>
  );
}

function ActionRow({ accent }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <button style={{
        padding: "14px 0",
        background: "transparent", color: CA.ink,
        border: `1.5px solid ${CA.ink}`, borderRadius: 4,
        fontFamily: CA.fontD, fontSize: 13, textTransform: "uppercase",
        letterSpacing: "0.04em", cursor: "pointer",
      }}>
        Cancelar
      </button>
      <button style={{
        padding: "14px 0",
        background: CA.red, color: "#fff",
        border: `2px solid ${CA.ink}`, borderRadius: 4,
        boxShadow: `3px 3px 0 ${CA.ink}`,
        fontFamily: CA.fontD, fontSize: 13, textTransform: "uppercase",
        letterSpacing: "0.04em", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        Criar álbum
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10m-4-4 4 4-4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

// ── seletor de variantes ──────────────────────────────────────────────────

function VarianteSelector({ selectedId, compact }) {
  if (compact) {
    // mobile: linha horizontal com scroll quando necessário
    return (
      <div style={{ position: "relative", margin: "0 -16px" }}>
        <div style={{
          display: "flex", gap: 12,
          overflowX: "auto", overflowY: "visible",
          padding: "10px 16px 14px",
          scrollSnapType: "x mandatory",
        }}>
          {VARIANTES.map(v => (
            <div key={v.id} style={{ scrollSnapAlign: "start" }}>
              <VarianteCard v={v} selected={v.id === selectedId} compact />
            </div>
          ))}
        </div>
        {/* hint visual: fade na borda direita pra indicar scroll */}
        <div style={{
          position: "absolute", top: 0, right: 0, bottom: 0, width: 32,
          background: `linear-gradient(90deg, transparent, ${CA.bg})`,
          pointerEvents: "none",
        }} />
      </div>
    );
  }
  // desktop: scroll horizontal — cards lado a lado, com scroll quando exceder a largura
  return (
    <div style={{ position: "relative", margin: "0 -4px" }}>
      <div style={{
        display: "flex", gap: 12,
        overflowX: "auto", overflowY: "visible",
        padding: "10px 4px 14px",
        scrollSnapType: "x mandatory",
      }}>
        {VARIANTES.map(v => (
          <div key={v.id} style={{ scrollSnapAlign: "start", flexShrink: 0 }}>
            <VarianteCard v={v} selected={v.id === selectedId} />
          </div>
        ))}
      </div>
      {/* fade na borda direita indicando scroll */}
      <div style={{
        position: "absolute", top: 0, right: 0, bottom: 0, width: 32,
        background: `linear-gradient(90deg, transparent, ${CA.bg})`,
        pointerEvents: "none",
      }} />
    </div>
  );
}

// ── form completo ─────────────────────────────────────────────────────────

function FormCA1({ withAnnotations, compact }) {
  const v = getVariante(SELECTED_VARIANTE);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* TIPO */}
      <div style={{ position: "relative" }}>
        {withAnnotations && <Ann n="3" top={-6} left={-32} />}
        <FieldLabel>Tipo de álbum</FieldLabel>
        <TipoField />
        <div style={{ position: "relative" }}>
          {withAnnotations && <Ann n="4" top={6} left={-32} />}
          <BlocoDetalhes />
        </div>
      </div>

      {/* VARIANTE */}
      <div style={{ position: "relative" }}>
        {withAnnotations && <Ann n="5" top={-6} left={-32} />}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
          <FieldLabel>Variante</FieldLabel>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{
              width: 10, height: 10, background: v.accent, border: `1px solid ${CA.ink}`,
            }} />
            <span style={{ fontFamily: CA.fontM, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: CA.ink, fontWeight: 600 }}>
              {v.nome} selecionada
            </span>
          </div>
        </div>
        <VarianteSelector selectedId={SELECTED_VARIANTE} compact={compact} />
        {withAnnotations && (
          <Ann n="6" bottom={compact ? -8 : -8} right={compact ? -8 : -8} />
        )}
      </div>

      {/* NOME PERSONALIZADO (acima do preview no mobile) */}
      <div style={{ position: "relative" }}>
        {withAnnotations && <Ann n="8" top={-6} left={-32} />}
        <FieldLabel optional>Nome personalizado</FieldLabel>
        <NomeInput value={NOME_PERSONALIZADO} />
      </div>

      {/* PREVIEW MOBILE — só compact */}
      {compact && (
        <div style={{ position: "relative" }}>
          {withAnnotations && <Ann n="7" top={-6} left={-32} />}
          <FieldLabel>Pré-visualização</FieldLabel>
          <div style={{
            padding: "20px 16px",
            background: `linear-gradient(180deg, ${CA.cream}cc, ${CA.paper})`,
            border: `1.5px solid ${CA.ink}`,
            display: "flex", justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: 0, opacity: 0.04,
              backgroundImage: `radial-gradient(${CA.ink} 1px, transparent 1px)`,
              backgroundSize: "16px 16px",
            }} />
            <AlbumPreview varId={SELECTED_VARIANTE} nome={NOME_PERSONALIZADO} size="sm" />
          </div>
        </div>
      )}

      {/* AÇÕES */}
      <div style={{ position: "relative", marginTop: 4 }}>
        {withAnnotations && <Ann n="9" top={-6} left={-32} />}
        <ActionRow accent={v.accent} />
        {withAnnotations && <Ann n="10" top={20} right={-32} />}
      </div>
    </div>
  );
}

// ── header mobile / topbar desktop ────────────────────────────────────────

function MobileHeader({ withAnnotations }) {
  return (
    <div style={{
      padding: "0 16px", height: 56,
      background: CA.paper, borderBottom: `2px solid ${CA.ink}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "relative",
    }}>
      {withAnnotations && <Ann n="1" top={6} left={6} />}
      <button style={{
        width: 36, height: 36, background: "transparent",
        border: `1.5px solid ${CA.ink}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
      }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M10 3 5 8l5 5" stroke={CA.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <span style={{ fontFamily: CA.fontD, fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        Novo álbum
      </span>
      <div style={{ width: 36 }} />
    </div>
  );
}

function DesktopTopBar({ withAnnotations }) {
  return (
    <div style={{
      height: 60, padding: "0 32px",
      background: CA.paper, borderBottom: `2px solid ${CA.ink}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "relative",
    }}>
      {withAnnotations && <Ann n="1" top={6} left={6} />}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button style={{
          width: 32, height: 32, background: "transparent",
          border: `1.5px solid ${CA.line}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M10 3 5 8l5 5" stroke={CA.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span style={{ fontFamily: CA.fontM, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(10,9,7,0.5)" }}>
          Meus Álbuns
        </span>
        <span style={{ fontFamily: CA.fontM, fontSize: 10, color: "rgba(10,9,7,0.35)" }}>/</span>
        <h1 style={{ margin: 0, fontFamily: CA.fontD, fontSize: 18, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Novo álbum
        </h1>
      </div>
      <div style={{ fontFamily: CA.fontM, fontSize: 10, letterSpacing: "0.14em", color: "rgba(10,9,7,0.45)", textTransform: "uppercase" }}>
        12 mai 2026
      </div>
    </div>
  );
}

// ── diálogo CA2 ───────────────────────────────────────────────────────────

function DialogCA2({ withAnnotations, width = 460, compact }) {
  return (
    <div style={{
      width, padding: "0",
      background: "#fff",
      border: `2.5px solid ${CA.ink}`,
      boxShadow: `8px 8px 0 ${CA.ink}`,
      position: "relative",
    }}>
      {/* ticket-stub header */}
      <div style={{
        background: CA.ink, color: "#fff",
        padding: "10px 20px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontFamily: CA.fontM, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>
          ● Álbum registrado
        </span>
        <span style={{ fontFamily: CA.fontM, fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.55)" }}>
          N° 0042
        </span>
      </div>

      {/* perfuração */}
      <div style={{
        height: 12, background: CA.cream,
        borderBottom: `2px dashed ${CA.ink}`,
        position: "relative",
      }}>
        <div style={{ position: "absolute", left: -10, top: -2, width: 18, height: 18, background: CA.bg, borderRadius: "50%", border: `2px solid ${CA.ink}` }} />
        <div style={{ position: "absolute", right: -10, top: -2, width: 18, height: 18, background: CA.bg, borderRadius: "50%", border: `2px solid ${CA.ink}` }} />
      </div>

      {/* corpo */}
      <div style={{ padding: compact ? "22px 20px 20px" : "28px 28px 24px" }}>
        <div style={{
          display: "flex", gap: compact ? 18 : 22,
          flexDirection: compact ? "column" : "row",
          alignItems: compact ? "stretch" : "flex-start",
        }}>
          {/* mensagem à esquerda */}
          <div style={{ flex: 1, paddingTop: 4, order: 1 }}>
            <div style={{ fontFamily: CA.fontM, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: CA.green, fontWeight: 600, marginBottom: 6 }}>
              ✓ Tudo certo
            </div>
            <h3 style={{
              margin: "0 0 8px", fontFamily: CA.fontD, fontSize: compact ? 24 : 28,
              textTransform: "uppercase", letterSpacing: "0.01em", lineHeight: 0.95,
            }}>
              Álbum criado!
            </h3>
            <p style={{
              margin: "10px 0 0",
              fontFamily: CA.fontB, fontSize: compact ? 13 : 14, lineHeight: 1.45,
              color: "rgba(10,9,7,0.7)",
            }}>
              Você tem <strong style={{ color: CA.ink }}>47 figurinhas</strong> no seu acervo. Deseja colar agora no álbum recém-criado?
            </p>
          </div>
          {/* preview à direita (inclui o nome personalizado quando preenchido) */}
          <div style={{ flexShrink: 0, alignSelf: compact ? "center" : "auto", order: 2 }}>
            <AlbumPreview varId={SELECTED_VARIANTE} nome={NOME_PERSONALIZADO} size="sm" />
          </div>
        </div>

        <div style={{
          marginTop: 24,
          display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 12,
          position: "relative",
        }}>
          {withAnnotations && <Ann n="13" top={-12} left={-14} />}
          <button style={{
            padding: "14px 0", background: "transparent", color: CA.ink,
            border: `1.5px solid ${CA.ink}`, borderRadius: 4,
            fontFamily: CA.fontD, fontSize: 13, textTransform: "uppercase",
            letterSpacing: "0.04em", cursor: "pointer",
          }}>
            Agora não
          </button>
          <button style={{
            padding: "14px 0", background: CA.red, color: "#fff",
            border: `2px solid ${CA.ink}`, borderRadius: 4,
            boxShadow: `3px 3px 0 ${CA.ink}`,
            fontFamily: CA.fontD, fontSize: 13, textTransform: "uppercase",
            letterSpacing: "0.04em", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            position: "relative",
          }}>
            Colar figurinhas
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10m-4-4 4 4-4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {withAnnotations && <Ann n="14" top={-12} right={-14} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── annotations dataset ───────────────────────────────────────────────────

const ANN_CA1 = [
  [1,  "—",        "Header do fluxo · ação de voltar/cancelar leva para a Home sem persistir (RN-CA12)"],
  [2,  "Título",    "'Novo álbum' — única tela do fluxo, formulário em coluna central"],
  [3,  "RN-CA02",  "Campo Tipo de álbum pré-selecionado e desabilitado enquanto há apenas 1 tipo no catálogo"],
  [4,  "RN-CA13",  "Bloco de detalhes do tipo: nome completo + total_figurinhas, somente leitura"],
  [5,  "RN-CA03",  "Variante obrigatória no modelo (default BROCHURA, sem nulo) · formulário NÃO pré-seleciona: 'Criar álbum' fica desabilitado até seleção explícita do usuário · 5 opções com mini-preview"],
  [6,  "RN-CA04",  "Preço de lançamento é informacional, exibido discreto como rodapé do card (não persistido no álbum)"],
  [7,  "RN-CA05",  "Ao selecionar uma variante, a tela atualiza sutilmente: tag 'selecionada', preview ao lado e tons de acento refletem a identidade da variante"],
  [8,  "RN-CA06",  "Nome personalizado é opcional · máximo 60 chars · sanitizado antes de persistir: sem caracteres de controle, tags HTML nem sequências de escape · contador inline à direita"],
  [9,  "Estado",   "Botão 'Criar álbum' habilitado após seleção de variante (independente do nome) · loading mostra spinner inline"],
  [10, "RN-CA12",  "Cancelar → redireciona para Home sem persistir dados · desabilitado durante o loading do submit"],
];

const ANN_CA2 = [
  [12, "RN-CA08",  "Diálogo CA2 exibido imediatamente após a persistência bem-sucedida, condicionado a EstoqueFigurinha.quantidade ≥ 1"],
  [13, "RN-CA10",  "'Agora não' fecha o diálogo e redireciona para a Home · o álbum já foi criado e aparece na listagem"],
  [14, "RN-CA11",  "'Colar figurinhas' redireciona para o fluxo Colar Figurinhas com o álbum recém-criado como contexto inicial"],
  [15, "RN-CA09",  "Comportamento modal: bloqueia interação com a tela ao fundo · exibido uma única vez após criação"],
];

// ── page roots ────────────────────────────────────────────────────────────

function CadastroMobile() {
  const [ref, w] = caMeasure();

  return (
    <CaVP.Provider value={{ isDesktop: false }}>
      <div ref={ref} style={{
        background: CA.bg, fontFamily: CA.fontB, color: CA.ink,
        minHeight: "100%",
      }}>
        <MobileHeader withAnnotations />

        <div style={{ padding: "20px 16px 32px" }}>
          {/* título grande */}
          <div style={{ marginBottom: 22, position: "relative" }}>
            <Ann n="2" top={-6} left={-32} />
            <div style={{ fontFamily: CA.fontM, fontSize: 10, letterSpacing: "0.18em", color: "rgba(10,9,7,0.5)", textTransform: "uppercase", marginBottom: 6 }}>
              Cadastro · CA1
            </div>
            <h1 style={{
              margin: 0, fontFamily: CA.fontD, fontSize: 40,
              textTransform: "uppercase", letterSpacing: "0.01em", lineHeight: 0.92,
            }}>
              Novo<br />álbum
            </h1>
          </div>

          <FormCA1 withAnnotations compact />

          <CaLegend items={ANN_CA1} />
        </div>
      </div>
    </CaVP.Provider>
  );
}

function CadastroMobileDialog() {
  return (
    <CaVP.Provider value={{ isDesktop: false }}>
      <div style={{ background: CA.bg, position: "relative", minHeight: "100%" }}>
        {/* tela de fundo (esmaecida) */}
        <div style={{ filter: "blur(1.5px)", opacity: 0.45, pointerEvents: "none" }}>
          <MobileHeader />
          <div style={{ padding: "20px 16px" }}>
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontFamily: CA.fontM, fontSize: 10, letterSpacing: "0.18em", color: "rgba(10,9,7,0.5)", textTransform: "uppercase", marginBottom: 6 }}>
                Cadastro · CA1
              </div>
              <h1 style={{ margin: 0, fontFamily: CA.fontD, fontSize: 40, textTransform: "uppercase", lineHeight: 0.92 }}>
                Novo<br />álbum
              </h1>
            </div>
            <FieldLabel>Variante</FieldLabel>
            <VarianteSelector selectedId={SELECTED_VARIANTE} compact />
          </div>
        </div>

        {/* overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(10,9,7,0.55)",
        }} />

        {/* diálogo centralizado */}
        <div style={{
          position: "absolute", top: 90, left: 16, right: 16,
        }}>
          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <Ann n="12" top={-12} left={-12} />
            <Ann n="15" top={-12} right={-12} />
            <DialogCA2 withAnnotations width={358} compact />
          </div>
        </div>

        {/* legenda — fora do overlay (ao fim) */}
        <div style={{
          position: "absolute", left: 16, right: 16, top: 700,
        }}>
          <CaLegend items={ANN_CA2} />
        </div>
      </div>
    </CaVP.Provider>
  );
}

function CadastroDesktop() {
  return (
    <CaVP.Provider value={{ isDesktop: true }}>
      <div style={{
        background: CA.bg, fontFamily: CA.fontB, color: CA.ink,
        minHeight: "100%", position: "relative",
        paddingLeft: SIDEBAR_W,
      }}>
        <CaSidebar />
        <DesktopTopBar withAnnotations />

        <div style={{
          padding: "32px 40px 40px",
          display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 40,
        }}>
          {/* coluna formulário */}
          <div>
            <div style={{ marginBottom: 28, position: "relative" }}>
              <Ann n="2" top={-6} left={-32} />
              <div style={{ fontFamily: CA.fontM, fontSize: 10, letterSpacing: "0.18em", color: "rgba(10,9,7,0.5)", textTransform: "uppercase", marginBottom: 8 }}>
                Cadastro · Tela CA1
              </div>
              <h1 style={{
                margin: 0, fontFamily: CA.fontD, fontSize: 56,
                textTransform: "uppercase", letterSpacing: "0.01em", lineHeight: 0.9,
              }}>
                Novo álbum
              </h1>
              <p style={{ margin: "12px 0 0", fontFamily: CA.fontB, fontSize: 14, color: "rgba(10,9,7,0.65)", maxWidth: 420, lineHeight: 1.45 }}>
                Escolha a variante da edição e (opcionalmente) dê um apelido para encontrar o álbum mais fácil na sua lista.
              </p>
            </div>

            <FormCA1 withAnnotations />
          </div>

          {/* coluna preview */}
          <div style={{ position: "relative" }}>
            <Ann n="7" top={-6} left={-24} />
            <div style={{ position: "sticky", top: 80 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
                <FieldLabel>Pré-visualização</FieldLabel>
                <span style={{ fontFamily: CA.fontM, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(10,9,7,0.45)" }}>
                  Atualiza com a variante
                </span>
              </div>
              <div style={{
                padding: "40px 28px 28px",
                background: `linear-gradient(180deg, ${CA.cream}, ${CA.paper})`,
                border: `1.5px solid ${CA.ink}`,
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", inset: 0, opacity: 0.05,
                  backgroundImage: `radial-gradient(${CA.ink} 1px, transparent 1px)`,
                  backgroundSize: "20px 20px",
                }} />
                <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                  <AlbumPreview varId={SELECTED_VARIANTE} nome={NOME_PERSONALIZADO} size="md" />
                </div>
              </div>

              <div style={{ marginTop: 16, padding: "12px 14px", border: `1px dashed ${CA.line}`, background: "rgba(10,9,7,0.02)" }}>
                <div style={{ fontFamily: CA.fontM, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(10,9,7,0.5)", marginBottom: 6 }}>
                  Resumo
                </div>
                <div style={{ fontFamily: CA.fontB, fontSize: 13, color: CA.ink, lineHeight: 1.5 }}>
                  <strong>{getVariante(SELECTED_VARIANTE).nome}</strong> · {TIPO_ALBUM.nome}
                  <br />
                  <span style={{ color: "rgba(10,9,7,0.55)" }}>
                    {TIPO_ALBUM.total} figurinhas para completar · lançamento {getVariante(SELECTED_VARIANTE).preco}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "0 40px 40px" }}>
          <CaLegend items={ANN_CA1} />
        </div>
      </div>
    </CaVP.Provider>
  );
}

function CadastroDesktopDialog() {
  return (
    <CaVP.Provider value={{ isDesktop: true }}>
      <div style={{
        background: CA.bg, fontFamily: CA.fontB, color: CA.ink,
        minHeight: "100%", position: "relative",
        paddingLeft: SIDEBAR_W,
      }}>
        {/* fundo (CA1 esmaecido) */}
        <div style={{ filter: "blur(2px)", opacity: 0.45, pointerEvents: "none" }}>
          <CaSidebar />
          <DesktopTopBar />
          <div style={{
            padding: "32px 40px 40px",
            display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 40,
          }}>
            <div>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ margin: 0, fontFamily: CA.fontD, fontSize: 56, textTransform: "uppercase", lineHeight: 0.9 }}>
                  Novo álbum
                </h1>
              </div>
              <FieldLabel>Variante</FieldLabel>
              <VarianteSelector selectedId={SELECTED_VARIANTE} />
            </div>
            <div>
              <FieldLabel>Pré-visualização</FieldLabel>
              <div style={{ padding: 28, background: CA.paper, border: `1.5px solid ${CA.ink}`, display: "flex", justifyContent: "center" }}>
                <AlbumPreview varId={SELECTED_VARIANTE} size="md" />
              </div>
            </div>
          </div>
        </div>

        {/* overlay modal */}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(10,9,7,0.6)",
          backgroundImage: "repeating-linear-gradient(135deg, rgba(0,0,0,0.04) 0 12px, transparent 12px 24px)",
        }} />

        {/* diálogo centrado */}
        <div style={{
          position: "absolute", top: 0, left: SIDEBAR_W, right: 0, bottom: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 40,
        }}>
          <div style={{ position: "relative" }}>
            <Ann n="12" top={-14} left={-14} />
            <Ann n="15" top={-14} right={-14} />
            <DialogCA2 withAnnotations width={580} />
          </div>
        </div>

        {/* legenda no fim (abaixo do overlay) */}
        <div style={{ position: "absolute", left: SIDEBAR_W + 40, right: 40, bottom: 32, zIndex: 5 }}>
          <CaLegend items={ANN_CA2} />
        </div>
      </div>
    </CaVP.Provider>
  );
}

Object.assign(window, { CadastroMobile, CadastroMobileDialog, CadastroDesktop, CadastroDesktopDialog });
