// home-wf.jsx — Wireframe anotado da Home do Meu Album
// Mobile-first 390px · dois estados: Normal e Vazio

// ── tokens ──────────────────────────────────────────────────────────────────
const WF = {
  bg:       "#F0EDE4",
  paper:    "#FBF8EE",
  ink:      "#0A0907",
  red:      "#E5142A",
  green:    "#0A9145",
  placeholder: "#D4D0C8",
  line:     "rgba(10,9,7,0.18)",
  fontD:    "var(--font-display)",
  fontB:    "var(--font-body)",
  fontM:    "var(--font-mono)",
};

// Variant visual tokens
const VARIANT_STYLE = {
  BROCHURA:       { bg: "#FFFFFF", border: `1.5px solid ${WF.ink}`,    shadow: "none",                 tag: "Brochura",        tagBg: "#E0DDD5", tagColor: WF.ink },
  CAPA_DURA:      { bg: "#F5F0E4", border: `2px solid ${WF.ink}`,      shadow: "3px 3px 0 #C8C4BC",    tag: "Capa dura",       tagBg: "#C8C4BC", tagColor: WF.ink },
  CAPA_DURA_PRATA:{ bg: "repeating-linear-gradient(135deg,#F0EDE4 0 6px,#E0DDD5 6px 8px)", border: `2px solid ${WF.ink}`, shadow: "3px 3px 0 #9E9E9E", tag: "Capa dura prata", tagBg: "#9E9E9E", tagColor: "#fff" },
  CAPA_DURA_OURO: { bg: "#FEF3CC", border: `2px solid #8B6914`,        shadow: "3px 3px 0 #C49A1A",    tag: "Capa dura ouro",  tagBg: "#C49A1A", tagColor: "#fff" },
  BOX_PREMIUM:    { bg: WF.ink,    border: `2px solid ${WF.ink}`,      shadow: `4px 4px 0 ${WF.red}`, tag: "Box Premium",     tagBg: WF.red,    tagColor: "#fff", dark: true },
};

// ── helpers ──────────────────────────────────────────────────────────────────

function Ann({ n, top, right, left, bottom }) {
  return (
    <div style={{
      position: "absolute",
      top, right, left, bottom,
      width: 20, height: 20,
      borderRadius: "50%",
      background: WF.red, color: "#fff",
      fontSize: 10, fontWeight: 700,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: WF.fontM, zIndex: 20, flexShrink: 0,
      border: `1.5px solid ${WF.paper}`,
      boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
    }}>{n}</div>
  );
}

function WfStub({ w, h, label, style: s }) {
  return (
    <div style={{
      width: w || "100%", height: h || 72,
      background: WF.placeholder,
      backgroundImage: "repeating-linear-gradient(135deg,rgba(0,0,0,0.06) 0 4px,transparent 4px 8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: WF.fontM, fontSize: 10, color: "rgba(10,9,7,0.55)",
      letterSpacing: "0.12em", textTransform: "uppercase",
      border: `1px dashed ${WF.ink}`,
      flexShrink: 0,
      ...s,
    }}>{label || "imagem"}</div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: WF.line, margin: "0 16px" }} />;
}

function ProgressBar({ pct, dark }) {
  const textColor = dark ? "#fff" : WF.ink;
  const trackBg   = dark ? "rgba(255,255,255,0.15)" : WF.placeholder;
  const fillBg    = dark ? "#fff" : WF.ink;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontFamily: WF.fontM, fontSize: 10, color: dark ? "rgba(255,255,255,0.6)" : "rgba(10,9,7,0.5)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          PROGRESSO
        </span>
        <span style={{ fontFamily: WF.fontD, fontSize: 22, color: dark ? "#fff" : WF.ink, lineHeight: 1 }}>
          {pct}<span style={{ fontSize: 13, fontFamily: WF.fontM }}>%</span>
        </span>
      </div>
      <div style={{ height: 8, background: trackBg, position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: fillBg }} />
      </div>
    </div>
  );
}

// ── legend ───────────────────────────────────────────────────────────────────

function WfLegend({ items }) {
  return (
    <div style={{
      margin: "24px 0 0",
      padding: "16px",
      background: WF.paper,
      border: `1.5px solid ${WF.ink}`,
    }}>
      <div style={{ fontFamily: WF.fontM, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(10,9,7,0.5)", marginBottom: 10 }}>
        Anotações
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map(([n, txt]) => (
          <div key={n} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div style={{
              width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
              background: WF.red, color: "#fff",
              fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: WF.fontM, marginTop: 1,
            }}>{n}</div>
            <span style={{ fontSize: 11, color: WF.ink, lineHeight: 1.45, fontFamily: WF.fontB }}>{txt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── components ───────────────────────────────────────────────────────────────

function WfHeader() {
  return (
    <div style={{
      padding: "0 16px",
      height: 60,
      background: WF.paper,
      borderBottom: `2px solid ${WF.ink}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "relative",
    }}>
      <Ann n="1" top={6} left={6} />
      {/* logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 28, height: 28,
          background: WF.red, color: "#fff",
          border: `2px solid ${WF.ink}`,
          boxShadow: `2px 2px 0 ${WF.ink}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: WF.fontD, fontSize: 12, transform: "rotate(-4deg)",
        }}>MA</div>
        <span style={{ fontFamily: WF.fontD, fontSize: 14, letterSpacing: "0.04em", textTransform: "uppercase" }}>Meu Album</span>
      </div>
      {/* user chip */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: WF.fontD, fontSize: 12, textTransform: "uppercase" }}>João S.</div>
          <div style={{ fontFamily: WF.fontM, fontSize: 10, color: "rgba(10,9,7,0.55)", letterSpacing: "0.12em" }}>#XB3K29</div>
        </div>
        <button style={{
          width: 32, height: 32,
          background: "transparent", border: `1.5px solid ${WF.ink}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 8H2m5-4 4 4-4 4" stroke={WF.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

function WfPackBanner() {
  return (
    <div style={{
      margin: 16, position: "relative",
      background: WF.ink,
      border: `2.5px solid ${WF.ink}`,
      boxShadow: `5px 5px 0 ${WF.red}`,
      padding: "22px 20px 20px",
      overflow: "hidden",
    }}>
      <Ann n="2" top={-8} right={-8} />
      {/* pattern bg */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.08,
        backgroundImage: "repeating-linear-gradient(135deg, #fff 0 12px, transparent 12px 24px)",
      }} />
      <div style={{ position: "relative" }}>
        <div style={{ fontFamily: WF.fontM, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
          ◉ A jornada começa aqui
        </div>
        <h2 style={{ fontFamily: WF.fontD, fontSize: 28, margin: "0 0 6px", color: "#fff", lineHeight: 0.95, textTransform: "uppercase" }}>
          Abrir<br /><span style={{ color: WF.red }}>Pacotinhos</span>
        </h2>
        <p style={{ fontFamily: WF.fontB, fontSize: 13, color: "rgba(255,255,255,0.75)", margin: "10px 0 18px", lineHeight: 1.4, maxWidth: 240 }}>
          Registre cada figurinha que você abriu e veja seu álbum crescer.
        </p>
        <button style={{
          padding: "12px 20px",
          background: WF.red, color: "#fff",
          border: `2px solid ${WF.ink}`,
          boxShadow: `3px 3px 0 ${WF.ink}`,
          fontFamily: WF.fontD, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.04em",
          cursor: "pointer",
        }}>
          Abrir pacotinhos →
        </button>
      </div>
    </div>
  );
}

function WfFABNote() {
  return (
    <div style={{
      position: "relative",
      margin: "0 16px 8px",
      padding: "10px 14px",
      border: `1.5px dashed ${WF.red}`,
      display: "flex", alignItems: "center", gap: 10,
      background: "rgba(229,20,42,0.04)",
    }}>
      <Ann n="3" top={-8} left={-8} />
      <div style={{
        padding: "10px 16px",
        background: WF.red, color: "#fff",
        fontFamily: WF.fontD, fontSize: 13, textTransform: "uppercase",
        border: `2px solid ${WF.ink}`,
        boxShadow: `2px 2px 0 ${WF.ink}`,
        flexShrink: 0,
      }}>
        + Abrir
      </div>
      <div>
        <div style={{ fontFamily: WF.fontM, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(10,9,7,0.5)", marginBottom: 2 }}>
          FAB STICKY — posição fixa
        </div>
        <div style={{ fontFamily: WF.fontB, fontSize: 11, color: WF.ink, lineHeight: 1.35 }}>
          Flutua sobre todo o conteúdo,<br />sempre visível ao rolar.
        </div>
      </div>
    </div>
  );
}

function WfAlbumCard({ album }) {
  const vs = VARIANT_STYLE[album.variante] || VARIANT_STYLE.BROCHURA;
  const dark = !!vs.dark;
  const textColor = dark ? "#fff" : WF.ink;
  const subColor  = dark ? "rgba(255,255,255,0.65)" : "rgba(10,9,7,0.6)";

  return (
    <div style={{
      background: vs.bg,
      border: vs.border,
      boxShadow: vs.shadow,
      padding: "16px",
      position: "relative",
    }}>
      {/* variant tag */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{
          padding: "3px 8px",
          background: vs.tagBg, color: vs.tagColor,
          fontFamily: WF.fontM, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase",
          border: `1px solid ${dark ? WF.red : WF.ink}`,
        }}>
          {vs.tag}
        </span>
        <span style={{ fontFamily: WF.fontM, fontSize: 9, color: subColor, letterSpacing: "0.1em" }}>
          {album.criado_em}
        </span>
      </div>

      {/* title block */}
      <div style={{ marginBottom: 12, position: "relative" }}>
        <Ann n="6" top={-6} right={-6} />
        <div style={{ fontFamily: WF.fontD, fontSize: 16, color: textColor, textTransform: "uppercase", lineHeight: 1.1 }}>
          {album.tipo_nome}
        </div>
        {album.nome_personalizado && (
          <div style={{ fontFamily: WF.fontB, fontSize: 12, color: subColor, marginTop: 3 }}>
            "{album.nome_personalizado}"
          </div>
        )}
      </div>

      <div style={{ position: "relative" }}>
        <Ann n="8" top={-6} right={-6} />
        <ProgressBar pct={album.pct} dark={dark} />
      </div>

      <div style={{
        marginTop: 14,
        paddingTop: 12,
        borderTop: dark ? "1px solid rgba(255,255,255,0.15)" : `1px solid ${WF.line}`,
        position: "relative",
      }}>
        <Ann n="9" top={-6} right={-6} />
        <button style={{
          width: "100%",
          padding: "11px 0",
          background: dark ? "rgba(255,255,255,0.12)" : WF.paper,
          border: dark ? "1.5px solid rgba(255,255,255,0.3)" : `1.5px solid ${WF.ink}`,
          fontFamily: WF.fontD, fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase",
          color: textColor,
          cursor: "pointer",
        }}>
          Colar figurinhas →
        </button>
      </div>
    </div>
  );
}

function WfAlbumSection({ albums }) {
  return (
    <div style={{ padding: "0 16px" }}>
      {/* section header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 0 14px",
        borderBottom: `2px solid ${WF.ink}`,
        marginBottom: 14,
        position: "relative",
      }}>
        <Ann n="4" top={6} left={-16} />
        <h2 style={{ margin: 0, fontFamily: WF.fontD, fontSize: 20, textTransform: "uppercase" }}>Meus Álbuns</h2>
        <button style={{
          padding: "8px 14px",
          background: WF.red, color: "#fff",
          border: `2px solid ${WF.ink}`,
          boxShadow: `2px 2px 0 ${WF.ink}`,
          fontFamily: WF.fontD, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em",
          cursor: "pointer", position: "relative",
        }}>
          <Ann n="5" top={-8} right={-8} />
          + Novo álbum
        </button>
      </div>

      {/* cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {albums.map((a) => <WfAlbumCard key={a.id} album={a} />)}
      </div>

      {/* pagination note (only shown when >5, here: inactive) */}
      <div style={{
        margin: "14px 0 0",
        padding: "10px 14px",
        border: `1px dashed ${WF.line}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "rgba(10,9,7,0.03)",
        position: "relative",
      }}>
        <Ann n="10" top={-8} right={-8} />
        <span style={{ fontFamily: WF.fontM, fontSize: 9, letterSpacing: "0.12em", color: "rgba(10,9,7,0.4)", textTransform: "uppercase" }}>
          Paginação — inativa (≤ 5 álbuns)
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          {["←", "1 / 1", "→"].map((t, i) => (
            <div key={i} style={{
              padding: "6px 10px",
              border: `1px solid ${WF.line}`,
              fontFamily: WF.fontM, fontSize: 11,
              color: "rgba(10,9,7,0.3)",
              background: "#fff",
            }}>{t}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WfRepeatedItem({ rank, item }) {
  return (
    <div style={{
      padding: "12px 16px",
      display: "grid",
      gridTemplateColumns: "24px 56px 1fr auto",
      gap: 12, alignItems: "center",
      borderBottom: `1px solid ${WF.line}`,
      position: "relative",
    }}>
      {rank === 1 && <Ann n="12" top={-8} right={-8} />}
      {rank === 1 && <Ann n="14" top={-8} left={72} />}
      {/* rank */}
      <div style={{ fontFamily: WF.fontD, fontSize: 20, color: rank <= 3 ? WF.red : "rgba(10,9,7,0.35)", textAlign: "center" }}>
        {String(rank).padStart(2, "0")}
      </div>
      {/* image stub */}
      <WfStub w={56} h={72} label="fig." />
      {/* info */}
      <div>
        <div style={{ fontFamily: WF.fontM, fontSize: 11, letterSpacing: "0.12em", color: "rgba(10,9,7,0.55)", marginBottom: 3 }}>
          {item.numero}
        </div>
        <div style={{ fontFamily: WF.fontD, fontSize: 14, textTransform: "uppercase", lineHeight: 1.1 }}>{item.nome}</div>
      </div>
      {/* qty */}
      <div style={{
        width: 40, height: 40, flexShrink: 0,
        background: rank === 1 ? WF.red : WF.ink, color: "#fff",
        border: `2px solid ${WF.ink}`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: WF.fontD,
      }}>
        <div style={{ fontSize: 18, lineHeight: 1 }}>{item.qty}</div>
        <div style={{ fontSize: 8, letterSpacing: "0.1em", opacity: 0.75 }}>×</div>
      </div>
    </div>
  );
}

function WfRepeatedSection({ stickers, total }) {
  return (
    <div style={{ margin: "20px 0 0" }}>
      <Divider />
      <div style={{ padding: "20px 16px 0", position: "relative" }}>
        <Ann n="11" top={6} left={0} />
        <Ann n="13" top={6} right={0} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontFamily: WF.fontD, fontSize: 20, textTransform: "uppercase" }}>Figurinhas Repetidas</h2>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: WF.fontD, fontSize: 28, color: WF.red, lineHeight: 1 }}>{total}</div>
            <div style={{ fontFamily: WF.fontM, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(10,9,7,0.5)" }}>no estoque</div>
          </div>
        </div>
        <div style={{ borderTop: `2px solid ${WF.ink}` }}>
          {stickers.map((s, i) => <WfRepeatedItem key={i} rank={i + 1} item={s} />)}
        </div>
      </div>
    </div>
  );
}

function WfFooter() {
  return (
    <div style={{
      margin: "20px 16px 16px",
      padding: "16px",
      borderTop: `2px solid ${WF.ink}`,
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ fontFamily: WF.fontM, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(10,9,7,0.5)", marginBottom: 4 }}>
        Links externos — abrem em nova aba
      </div>
      {[
        ["↗ FIFA World Cup 2026", "fifa.com/worldcup/2026"],
        ["↗ Álbum Panini Copa 2026", "panini.com.br/copa2026"],
      ].map(([label, url], i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: WF.fontB, fontSize: 12, fontWeight: 600, color: WF.ink }}>{label}</span>
          <span style={{ fontFamily: WF.fontM, fontSize: 9, color: "rgba(10,9,7,0.45)" }}>{url}</span>
        </div>
      ))}
      <div style={{ marginTop: 8, fontFamily: WF.fontM, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(10,9,7,0.4)", textAlign: "center" }}>
        Meu Album · não-oficial · 2026
      </div>
    </div>
  );
}

// ── empty-state helpers ──────────────────────────────────────────────────────

function WfEmptyAlbums() {
  return (
    <div style={{ padding: "0 16px" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 0 14px",
        borderBottom: `2px solid ${WF.ink}`,
        marginBottom: 14,
        position: "relative",
      }}>
        <h2 style={{ margin: 0, fontFamily: WF.fontD, fontSize: 20, textTransform: "uppercase" }}>Meus Álbuns</h2>
        <button style={{ padding: "8px 14px", background: WF.red, color: "#fff", border: `2px solid ${WF.ink}`, boxShadow: `2px 2px 0 ${WF.ink}`, fontFamily: WF.fontD, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer" }}>
          + Novo álbum
        </button>
      </div>
      <div style={{
        padding: "40px 16px",
        border: `2px dashed ${WF.line}`,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
        background: "rgba(10,9,7,0.02)",
        position: "relative",
        textAlign: "center",
      }}>
        <Ann n="E1" top={-8} right={-8} />
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="6" y="10" width="36" height="28" rx="2" stroke={WF.ink} strokeWidth="2" strokeDasharray="4 3" />
          <path d="M24 20V28M20 24h8" stroke={WF.ink} strokeWidth="2" strokeLinecap="round" />
        </svg>
        <div style={{ fontFamily: WF.fontD, fontSize: 16, textTransform: "uppercase", lineHeight: 1.1 }}>
          Nenhum álbum ainda
        </div>
        <p style={{ fontFamily: WF.fontB, fontSize: 13, color: "rgba(10,9,7,0.6)", margin: 0, maxWidth: 260, lineHeight: 1.4 }}>
          Crie seu primeiro álbum pra começar a colar suas figurinhas.
        </p>
        <button style={{ padding: "12px 20px", background: WF.ink, color: "#fff", border: `2px solid ${WF.ink}`, boxShadow: `3px 3px 0 ${WF.red}`, fontFamily: WF.fontD, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer" }}>
          Criar primeiro álbum →
        </button>
      </div>
    </div>
  );
}

function WfEmptyRepeated() {
  return (
    <div style={{ margin: "20px 0 0" }}>
      <Divider />
      <div style={{ padding: "20px 16px 0", position: "relative" }}>
        <h2 style={{ margin: "0 0 14px", fontFamily: WF.fontD, fontSize: 20, textTransform: "uppercase" }}>Figurinhas Repetidas</h2>
        <div style={{
          padding: "32px 16px",
          border: `2px dashed ${WF.line}`,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          background: "rgba(10,9,7,0.02)",
          position: "relative",
          textAlign: "center",
        }}>
          <Ann n="E2" top={-8} right={-8} />
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect x="4" y="8" width="24" height="30" rx="2" stroke={WF.ink} strokeWidth="2" strokeDasharray="4 3" />
            <rect x="12" y="4" width="24" height="30" rx="2" stroke={WF.ink} strokeWidth="2" strokeDasharray="4 3" />
          </svg>
          <div style={{ fontFamily: WF.fontD, fontSize: 15, textTransform: "uppercase" }}>Estoque vazio</div>
          <p style={{ fontFamily: WF.fontB, fontSize: 12, color: "rgba(10,9,7,0.6)", margin: 0, maxWidth: 220, lineHeight: 1.4 }}>
            Abra pacotinhos pra começar a acumular figurinhas repetidas.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── mock data ────────────────────────────────────────────────────────────────

const MOCK_ALBUMS = [
  { id: 1, tipo_nome: "Copa do Mundo 2026 — Panini", variante: "BOX_PREMIUM",    nome_personalizado: null,             pct: 5.1,  criado_em: "01/04/2026" },
  { id: 2, tipo_nome: "Copa do Mundo 2026 — Panini", variante: "CAPA_DURA_OURO", nome_personalizado: "Meu ouro",       pct: 68.3, criado_em: "12/03/2026" },
  { id: 3, tipo_nome: "Copa do Mundo 2026 — Panini", variante: "BROCHURA",       nome_personalizado: "Do trabalho",    pct: 22.7, criado_em: "15/03/2026" },
];

const MOCK_STICKERS = [
  { numero: "BRA-7",  nome: "Raphinha",  qty: 8 },
  { numero: "ARG-10", nome: "L. Messi",  qty: 6 },
  { numero: "FRA-11", nome: "K. Mbappé", qty: 5 },
  { numero: "ENG-9",  nome: "H. Kane",   qty: 5 },
  { numero: "GER-8",  nome: "T. Kroos",  qty: 4 },
];
const MOCK_TOTAL = 47;

// ── annotation legends ───────────────────────────────────────────────────────

const NORMAL_ANNOTATIONS = [
  [1,  "Header: nome do usuário + identificador público de 6 chars (#XB3K29) · ação de logout"],
  [2,  "CTA 'Abrir Pacotinhos': visível em TODAS as situações, independente de álbuns ou estoque (RN-H14)"],
  [3,  "FAB sticky: flutua sobre o conteúdo em posição fixa — z-index acima de todo o scroll"],
  [4,  "Álbuns ordenados por criado_em DESC — mais recente primeiro (RN-H04)"],
  [5,  "Botão '+ Novo álbum' → redireciona para fluxo de Cadastro de Álbum"],
  [6,  "Título do card = tipo_album.nome; nome_personalizado (quando preenchido) exibido como subtítulo (RN-H13)"],
  [7,  "Variante exibida por extenso no tag: Brochura / Capa dura / Capa dura prata / Capa dura ouro / Box Premium"],
  [8,  "Progresso = figurinhas_coladas / total_figurinhas × 100, arredondado para 1 casa decimal (RN-H02)"],
  [9,  "Botão 'Colar figurinhas' disponível para todos os álbuns, independente do percentual (RN-H12)"],
  [10, "Paginação: controles visíveis somente se usuário tiver > 5 álbuns (RN-H05 / RN-H06). Inativo aqui."],
  [11, "Seção de repetidas: estoque global do usuário — não associado a álbum específico (RN-H07 / RN-H08)"],
  [12, "Ranking: TOP 5 por quantidade DESC; empate desfeito por figurinha.numero ASC (RN-H09)"],
  [13, "Total = SUM(EstoqueFigurinha.quantidade) para todas as figurinhas com qtd ≥ 1 (RN-H10)"],
  [14, "Placeholder da imagem da figurinha — imagem real a ser produzida posteriormente"],
];

const EMPTY_ANNOTATIONS = [
  ["E1", "Estado vazio de álbuns: exibe placeholder + CTA para criação (RN-H03). Sem cards, sem paginação."],
  ["E2", "Estado vazio de estoque: mensagem informativa — seção somente leitura (RN-H11)"],
  ["E3", "CTA 'Abrir Pacotinhos' permanece visível mesmo no estado completamente vazio (RN-H14)"],
];

// ── page exports ─────────────────────────────────────────────────────────────

function HomeNormal() {
  return (
    <div style={{ background: WF.bg, fontFamily: WF.fontB, minHeight: "100%" }}>
      <WfHeader />
      <WfFABNote />
      <WfPackBanner />
      <WfAlbumSection albums={MOCK_ALBUMS} />
      <WfRepeatedSection stickers={MOCK_STICKERS} total={MOCK_TOTAL} />
      <WfFooter />
      <WfLegend items={NORMAL_ANNOTATIONS} />
    </div>
  );
}

function HomeEmpty() {
  return (
    <div style={{ background: WF.bg, fontFamily: WF.fontB, minHeight: "100%" }}>
      <WfHeader />
      <WfFABNote />
      <WfPackBanner />
      <WfEmptyAlbums />
      <WfEmptyRepeated />
      <WfFooter />
      <WfLegend items={EMPTY_ANNOTATIONS} />
    </div>
  );
}

Object.assign(window, { HomeNormal, HomeEmpty });
