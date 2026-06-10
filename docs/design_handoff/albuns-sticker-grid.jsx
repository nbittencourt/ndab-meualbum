// albuns-sticker-grid.jsx
// Grid de cards para AL1 — Variante A (selos compactos) e B (fichas de jogador)

const SG = {
  bg:    "#F0EDE4", paper: "#FBF8EE", ink: "#0A0907",
  red:   "#E5142A", green: "#0A9145",
  line:  "rgba(10,9,7,0.18)", mute: "rgba(10,9,7,0.55)",
  fontD: "var(--font-display)", fontB: "var(--font-body)", fontM: "var(--font-mono)",
};

const SG_ALBUM = {
  tipo:   "Copa do Mundo 2026 — Panini",
  tag:    "Capa dura ouro", tagBg: "#C49A1A", tagFg: "#fff",
  cardBg: "#FEF3CC", border: "2px solid #8B6914", shadow: "3px 3px 0 #C49A1A",
  nome:   "Meu ouro", pct: 68.3,
};

const SG_FIGS = [
  { num: "BRA-01", nome: "Alisson",            status: "colada",   qty: 1 },
  { num: "BRA-02", nome: "Danilo",             status: "colada",   qty: 1 },
  { num: "BRA-03", nome: "Marquinhos",         status: "faltante", qty: 0 },
  { num: "BRA-04", nome: "Éder Militão",       status: "repetida", qty: 3 },
  { num: "BRA-05", nome: "Wendell",            status: "faltante", qty: 0 },
  { num: "BRA-06", nome: "Casemiro",           status: "colada",   qty: 1 },
  { num: "BRA-07", nome: "Raphinha",           status: "repetida", qty: 2 },
  { num: "BRA-08", nome: "Lucas Paquetá",      status: "colada",   qty: 1 },
  { num: "BRA-09", nome: "Pedro",              status: "faltante", qty: 0 },
  { num: "BRA-10", nome: "Rodrygo",            status: "colada",   qty: 1 },
  { num: "BRA-11", nome: "Endrick",            status: "faltante", qty: 0 },
  { num: "BRA-12", nome: "Weverton",           status: "faltante", qty: 0 },
  { num: "BRA-13", nome: "Renan Lodi",         status: "colada",   qty: 1 },
  { num: "BRA-14", nome: "Gabriel Magalhães",  status: "colada",   qty: 1 },
  { num: "BRA-15", nome: "Bremer",             status: "faltante", qty: 0 },
  { num: "BRA-16", nome: "Gerson",             status: "colada",   qty: 1 },
  { num: "BRA-17", nome: "Bruno Guimarães",    status: "repetida", qty: 4 },
  { num: "BRA-18", nome: "Andreas Pereira",    status: "faltante", qty: 0 },
  { num: "BRA-19", nome: "Gabriel Martinelli", status: "colada",   qty: 1 },
  { num: "BRA-20", nome: "Vini Jr.",           status: "colada",   qty: 1 },
];

const SG_SECOES = [
  { nome: "Brasil",               coladas: 42,  total: 80,  expanded: true,  figurinhas: SG_FIGS },
  { nome: "América do Norte",     coladas: 38,  total: 64,  expanded: false  },
  { nome: "Europa",               coladas: 112, total: 112, expanded: false, completa: true },
  { nome: "Figurinhas Especiais", coladas: 2,   total: 20,  expanded: false  },
  { nome: "América do Sul",       coladas: 28,  total: 48,  expanded: false  },
];

// ── helpers ────────────────────────────────────────────────────────────────
function SGProgressBar({ pct, height = 6 }) {
  return (
    <div style={{ height, background: SG.line, position: "relative" }}>
      <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: SG.ink }} />
    </div>
  );
}

function SGSidebar() {
  const nav = [
    { id: "home",     icon: "⊞", label: "Início"       },
    { id: "albums",   icon: "◻", label: "Meus Álbuns", active: true },
    { id: "stickers", icon: "◈", label: "Figurinhas"   },
    { id: "trades",   icon: "⇄", label: "Trocas"       },
    { id: "profile",  icon: "○", label: "Perfil"        },
  ];
  return (
    <aside style={{ width: 228, flexShrink: 0, background: SG.paper, borderRight: `2px solid ${SG.ink}` }}>
      <div style={{ padding: "20px", borderBottom: `2px solid ${SG.ink}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: SG.red, color: "#fff", border: `2px solid ${SG.ink}`, boxShadow: `2px 2px 0 ${SG.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SG.fontD, fontSize: 12, transform: "rotate(-4deg)" }}>MA</div>
          <span style={{ fontFamily: SG.fontD, fontSize: 14, letterSpacing: "0.04em", textTransform: "uppercase" }}>Meu Album</span>
        </div>
      </div>
      <nav style={{ padding: "10px 0" }}>
        {nav.map(item => (
          <div key={item.id} style={{ padding: "11px 20px", display: "flex", alignItems: "center", gap: 12, background: item.active ? SG.bg : "transparent", borderLeft: item.active ? `3px solid ${SG.red}` : "3px solid transparent" }}>
            <span style={{ fontFamily: SG.fontM, fontSize: 15, width: 18, textAlign: "center", color: item.active ? SG.red : SG.mute }}>{item.icon}</span>
            <span style={{ fontFamily: SG.fontB, fontSize: 13, fontWeight: 600, color: item.active ? SG.red : SG.ink }}>{item.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function SGAlbumHero({ isDesktop }) {
  const a = SG_ALBUM;
  if (isDesktop) {
    return (
      <div style={{ background: a.cardBg, border: a.border, boxShadow: a.shadow, padding: "20px 24px", marginBottom: 20, display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center" }}>
        <div>
          <span style={{ padding: "3px 8px", background: a.tagBg, color: a.tagFg, fontFamily: SG.fontM, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", border: "1px solid #8B6914", display: "inline-block", marginBottom: 8 }}>{a.tag}</span>
          <div style={{ fontFamily: SG.fontD, fontSize: 22, textTransform: "uppercase", lineHeight: 1.05 }}>{a.tipo}</div>
          <div style={{ fontFamily: SG.fontB, fontSize: 13, color: SG.mute, marginTop: 3 }}>"{a.nome}"</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: SG.fontD, fontSize: 48, lineHeight: 1 }}>{a.pct}<span style={{ fontFamily: SG.fontM, fontSize: 16 }}>%</span></div>
          <div style={{ width: 200, marginTop: 8 }}><SGProgressBar pct={a.pct} height={8} /></div>
          <div style={{ fontFamily: SG.fontM, fontSize: 9, color: SG.mute, marginTop: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>669 / 980 figurinhas</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ background: a.cardBg, border: `2px solid ${SG.ink}`, borderTop: "none", padding: "16px 16px 14px" }}>
      <span style={{ padding: "3px 8px", background: a.tagBg, color: a.tagFg, fontFamily: SG.fontM, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", border: "1px solid #8B6914", display: "inline-block", marginBottom: 8 }}>{a.tag}</span>
      <div style={{ fontFamily: SG.fontD, fontSize: 18, textTransform: "uppercase", lineHeight: 1.1 }}>{a.tipo}</div>
      <div style={{ fontFamily: SG.fontB, fontSize: 12, color: SG.mute, marginTop: 2 }}>"{a.nome}"</div>
      <div style={{ marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span style={{ fontFamily: SG.fontM, fontSize: 10, color: SG.mute, letterSpacing: "0.12em", textTransform: "uppercase" }}>Progresso</span>
          <span style={{ fontFamily: SG.fontD, fontSize: 26 }}>{a.pct}<span style={{ fontFamily: SG.fontM, fontSize: 11 }}>%</span></span>
        </div>
        <SGProgressBar pct={a.pct} height={10} />
        <div style={{ fontFamily: SG.fontM, fontSize: 9, color: SG.mute, marginTop: 5, letterSpacing: "0.1em", textTransform: "uppercase" }}>669 de 980 figurinhas coladas</div>
      </div>
    </div>
  );
}

function SGActionBar({ isDesktop }) {
  if (isDesktop) {
    return (
      <div style={{ background: SG.paper, border: `1.5px solid ${SG.ink}`, padding: "10px 14px", display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}>
        <button style={{ padding: "10px 20px", background: SG.ink, color: "#fff", border: `2px solid ${SG.ink}`, boxShadow: `2px 2px 0 ${SG.red}`, fontFamily: SG.fontD, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer" }}>Colar figurinhas →</button>
        <button style={{ padding: "10px 20px", background: "#fff", color: SG.ink, border: `1.5px solid ${SG.ink}`, fontFamily: SG.fontD, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer" }}>Baixar PDF</button>
        <button style={{ padding: "10px 20px", background: "#fff", color: SG.ink, border: `1.5px solid ${SG.ink}`, fontFamily: SG.fontD, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer", marginLeft: "auto" }}>Arquivar</button>
      </div>
    );
  }
  return (
    <div style={{ background: SG.paper, borderBottom: `2px solid ${SG.ink}`, padding: "10px 12px", display: "flex", gap: 8 }}>
      <button style={{ flex: 1, padding: "10px 0", background: SG.ink, color: "#fff", border: `2px solid ${SG.ink}`, fontFamily: SG.fontD, fontSize: 11, textTransform: "uppercase", cursor: "pointer" }}>Colar fig.</button>
      <button style={{ flex: 1, padding: "8px 4px", background: "#fff", color: SG.ink, border: `1.5px solid ${SG.ink}`, fontFamily: SG.fontD, fontSize: 9, textTransform: "uppercase", cursor: "pointer", lineHeight: 1.2 }}>Figurinhas que faltam</button>
      <button style={{ flex: 1, padding: "10px 0", background: "#fff", color: SG.ink, border: `1.5px solid ${SG.ink}`, fontFamily: SG.fontD, fontSize: 11, textTransform: "uppercase", cursor: "pointer" }}>Arquivar</button>
    </div>
  );
}

function SGSectionHeader({ s, isDesktop }) {
  const pct = Math.round(s.coladas / s.total * 100);
  return (
    <div style={{ padding: isDesktop ? "14px 20px" : "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span style={{ fontFamily: SG.fontD, fontSize: isDesktop ? 16 : 14, textTransform: "uppercase" }}>{s.nome}</span>
          <span style={{ fontFamily: SG.fontM, fontSize: 11, color: SG.mute }}>
            {s.coladas}<span style={{ opacity: 0.35 }}>/</span>{s.total}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1 }}><SGProgressBar pct={pct} /></div>
          {s.completa
            ? <span style={{ fontFamily: SG.fontM, fontSize: 9, color: SG.green, letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>✓ Completa</span>
            : <span style={{ fontFamily: SG.fontD, fontSize: 14, flexShrink: 0 }}>{pct}%</span>
          }
        </div>
      </div>
      <span style={{ fontFamily: SG.fontM, fontSize: 14, color: s.expanded ? SG.red : SG.mute, display: "inline-block", transform: s.expanded ? "rotate(90deg)" : "none" }}>›</span>
    </div>
  );
}

// ── Variante A: Grade de Selos ─────────────────────────────────────────────
// Grid compacto 5 col (mob) / 8 col (desk) · codificação por cor · filtros
function StickerCardA({ fig, isDesktop }) {
  const colada   = fig.status === "colada";
  const repetida = fig.status === "repetida";
  const num = fig.num.replace(/^[A-Z]+-/, ""); // "01"

  return (
    <div style={{
      background: colada ? "rgba(10,145,69,0.07)" : repetida ? SG.ink : "#fff",
      border: colada
        ? "1.5px solid rgba(10,145,69,0.38)"
        : repetida
        ? `1.5px solid ${SG.ink}`
        : `1.5px dashed ${SG.line}`,
      padding: isDesktop ? "10px 5px 9px" : "8px 3px 6px",
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 3, position: "relative", minWidth: 0,
    }}>
      {colada && (
        <span style={{ position: "absolute", top: 3, right: 4, fontFamily: SG.fontM, fontSize: 7, color: SG.green, lineHeight: 1 }}>✓</span>
      )}
      <span style={{
        fontFamily: SG.fontM,
        fontSize: isDesktop ? 13 : 10,
        fontWeight: 600, letterSpacing: "0.04em",
        color: colada ? SG.green : repetida ? "rgba(255,255,255,0.45)" : SG.mute,
      }}>{num}</span>
      <span style={{
        fontFamily: SG.fontB,
        fontSize: isDesktop ? 9 : 7.5,
        color: colada ? SG.mute : repetida ? "rgba(255,255,255,0.88)" : SG.ink,
        textAlign: "center", lineHeight: 1.25,
        overflow: "hidden", display: "-webkit-box",
        WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        textDecoration: colada ? "line-through" : "none",
        textDecorationColor: "rgba(10,9,7,0.28)",
      }}>{fig.nome}</span>
      {repetida && (
        <div style={{ marginTop: 3, background: SG.red, color: "#fff", fontFamily: SG.fontD, fontSize: isDesktop ? 7.5 : 7, padding: "2px 5px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Colar</div>
      )}
    </div>
  );
}

function SectionRowA({ s, isDesktop }) {
  const COLS = isDesktop ? 8 : 5;
  const coladas   = s.figurinhas ? s.figurinhas.filter(f => f.status === "colada").length   : 0;
  const repetidas = s.figurinhas ? s.figurinhas.filter(f => f.status === "repetida").length : 0;
  const faltantes = s.figurinhas ? s.figurinhas.filter(f => f.status === "faltante").length : 0;
  return (
    <div style={{ border: `1.5px solid ${s.expanded ? SG.ink : SG.line}`, background: s.expanded ? SG.paper : "#fff" }}>
      <SGSectionHeader s={s} isDesktop={isDesktop} />
      {s.expanded && s.figurinhas && (
        <div style={{ borderTop: `1.5px solid ${SG.ink}` }}>
          {/* filter bar */}
          <div style={{ padding: isDesktop ? "7px 20px" : "6px 12px", background: SG.ink, display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontFamily: SG.fontM, fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginRight: 6 }}>Filtrar:</span>
            {["Todas", "Faltantes", "Coladas", "Repetidas"].map((f, i) => (
              <span key={f} style={{
                fontFamily: SG.fontM, fontSize: 8, letterSpacing: "0.08em", textTransform: "uppercase",
                padding: "3px 8px", cursor: "pointer",
                background: i === 0 ? "rgba(255,255,255,0.92)" : "transparent",
                color: i === 0 ? SG.ink : "rgba(255,255,255,0.45)",
                border: i === 0 ? "none" : "1px solid rgba(255,255,255,0.15)",
              }}>{f}</span>
            ))}
          </div>
          {/* grid */}
          <div style={{ padding: isDesktop ? "14px 20px" : "10px 12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: isDesktop ? 6 : 4 }}>
              {s.figurinhas.map(fig => <StickerCardA key={fig.num} fig={fig} isDesktop={isDesktop} />)}
            </div>
          </div>
          {/* summary */}
          <div style={{ padding: isDesktop ? "8px 20px" : "7px 12px", display: "flex", gap: 14, flexWrap: "wrap", fontFamily: SG.fontM, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", borderTop: `1px solid ${SG.line}` }}>
            <span style={{ color: SG.green }}>✓ {coladas} coladas</span>
            <span style={{ color: SG.red }}>⇄ {repetidas} repetidas</span>
            <span style={{ color: SG.mute }}>{faltantes} faltantes</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Variante B: Fichas de Jogador ─────────────────────────────────────────
// Cards altura fixa · qty badge em todos · botão reservado mesmo quando ausente
function StickerCardB({ fig, isDesktop }) {
  const colada   = fig.status === "colada";
  const repetida = fig.status === "repetida";
  const qty = fig.qty !== undefined ? fig.qty : colada ? 1 : repetida ? 2 : 0;

  const CARD_H = isDesktop ? 106 : 94;
  const BTN_H  = isDesktop ? 28 : 25;

  // quantidade: verde (1×), vermelho (2×+), cinza (0×)
  const qtyBg = qty >= 2 ? SG.red : qty === 1 ? "rgba(10,145,69,0.12)" : "rgba(10,9,7,0.06)";
  const qtyFg = qty >= 2 ? "#fff" : qty === 1 ? SG.green : SG.mute;

  return (
    <div style={{
      background: colada ? "rgba(10,145,69,0.04)" : "#fff",
      border: colada
        ? "1.5px solid rgba(10,145,69,0.3)"
        : repetida
        ? `1.5px solid ${SG.ink}`
        : `1.5px solid ${SG.line}`,
      padding: isDesktop ? "10px 10px 9px" : "8px 7px 7px",
      display: "flex", flexDirection: "column",
      height: CARD_H, boxSizing: "border-box", minWidth: 0,
    }}>
      {/* topo: número + quantidade */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span style={{
          fontFamily: SG.fontM, fontSize: isDesktop ? 10 : 8.5,
          color: colada ? SG.green : SG.mute, letterSpacing: "0.08em",
        }}>{fig.num}</span>
        <span style={{
          background: qtyBg, color: qtyFg,
          fontFamily: SG.fontM, fontWeight: 600,
          fontSize: isDesktop ? 9 : 7.5,
          padding: "1px 5px", letterSpacing: "0.04em",
        }}>×{qty}</span>
      </div>
      {/* nome — ocupa o espaço disponível */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", alignItems: "center", padding: "4px 0" }}>
        <span style={{
          fontFamily: SG.fontD, fontSize: isDesktop ? 12 : 10,
          color: colada ? SG.mute : SG.ink,
          textTransform: "uppercase", lineHeight: 1.15,
          textDecoration: colada ? "line-through" : "none",
          textDecorationColor: "rgba(10,9,7,0.28)",
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>{fig.nome}</span>
      </div>
      {/* área do botão — altura sempre reservada */}
      <div style={{ flexShrink: 0, height: BTN_H }}>
        {repetida && (
          <button style={{
            width: "100%", height: "100%",
            background: SG.ink, color: "#fff",
            border: `1.5px solid ${SG.ink}`, boxShadow: `1px 1px 0 ${SG.red}`,
            fontFamily: SG.fontD, fontSize: isDesktop ? 9 : 8,
            textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer",
          }}>Colar →</button>
        )}
      </div>
    </div>
  );
}

function SectionRowB({ s, isDesktop }) {
  const COLS = isDesktop ? 5 : 3;
  const coladas   = s.figurinhas ? s.figurinhas.filter(f => f.status === "colada").length   : 0;
  const repetidas = s.figurinhas ? s.figurinhas.filter(f => f.status === "repetida").length : 0;
  const faltantes = s.figurinhas ? s.figurinhas.filter(f => f.status === "faltante").length : 0;
  return (
    <div style={{ border: `1.5px solid ${s.expanded ? SG.ink : SG.line}`, background: s.expanded ? SG.paper : "#fff" }}>
      <SGSectionHeader s={s} isDesktop={isDesktop} />
      {s.expanded && s.figurinhas && (
        <div style={{ borderTop: `1.5px solid ${SG.ink}` }}>
          {/* legenda */}
          <div style={{ padding: isDesktop ? "7px 20px" : "6px 12px", background: "rgba(10,9,7,0.03)", borderBottom: `1px solid ${SG.line}`, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            {[
              { symbol: "━", label: "Colada",   color: SG.green },
              { symbol: "○", label: "Faltante", color: SG.mute  },
              { symbol: "×2",label: "Repetida", color: SG.red   },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontFamily: SG.fontM, fontSize: 9, color: item.color, fontWeight: 600 }}>{item.symbol}</span>
                <span style={{ fontFamily: SG.fontM, fontSize: 8, color: SG.mute, letterSpacing: "0.08em", textTransform: "uppercase" }}>{item.label}</span>
              </div>
            ))}
          </div>
          {/* grid */}
          <div style={{ padding: isDesktop ? "14px 20px" : "10px 12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: isDesktop ? 10 : 8 }}>
              {s.figurinhas.map(fig => <StickerCardB key={fig.num} fig={fig} isDesktop={isDesktop} />)}
            </div>
          </div>
          {/* summary */}
          <div style={{ padding: isDesktop ? "8px 20px" : "7px 12px", display: "flex", gap: 14, flexWrap: "wrap", fontFamily: SG.fontM, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", borderTop: `1px solid ${SG.line}` }}>
            <span style={{ color: SG.green }}>✓ {coladas} coladas</span>
            <span style={{ color: SG.red }}>⇄ {repetidas} repetidas</span>
            <span style={{ color: SG.mute }}>{faltantes} faltantes</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Telas completas ────────────────────────────────────────────────────────
function AL1MobileA() {
  return (
    <div data-screen-label="AL1 · Variante A · Mobile" style={{ background: SG.bg, fontFamily: SG.fontB, minHeight: "100%" }}>
      <MAHeader back={true} />
      <SGAlbumHero isDesktop={false} />
      <SGActionBar isDesktop={false} />
      <div style={{ padding: "12px 16px 32px" }}>
        <div style={{ marginBottom: 10 }}>
          <span style={{ fontFamily: SG.fontM, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: SG.mute }}>Seções do álbum</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {SG_SECOES.map((s, i) => <SectionRowA key={i} s={s} isDesktop={false} />)}
        </div>
      </div>
      <MAFooter />
    </div>
  );
}

function AL1MobileB() {
  return (
    <div data-screen-label="AL1 · Variante B · Mobile" style={{ background: SG.bg, fontFamily: SG.fontB, minHeight: "100%" }}>
      <MAHeader back={true} />
      <SGAlbumHero isDesktop={false} />
      <SGActionBar isDesktop={false} />
      <div style={{ padding: "12px 16px 32px" }}>
        <div style={{ marginBottom: 10 }}>
          <span style={{ fontFamily: SG.fontM, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: SG.mute }}>Seções do álbum</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {SG_SECOES.map((s, i) => <SectionRowB key={i} s={s} isDesktop={false} />)}
        </div>
      </div>
      <MAFooter />
    </div>
  );
}

function AL1DesktopA() {
  return (
    <div data-screen-label="AL1 · Variante A · Desktop" style={{ background: SG.bg, fontFamily: SG.fontB, minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", flex: 1 }}>
        <SGSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>
          <MATopBar breadcrumb="Meus Álbuns" title="Gerenciar álbum" />
          <div style={{ padding: "24px 32px 40px" }}>
            <SGAlbumHero isDesktop={true} />
            <SGActionBar isDesktop={true} />
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontFamily: SG.fontM, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: SG.mute }}>
                Seções do álbum · {SG_SECOES.length} seções
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SG_SECOES.map((s, i) => <SectionRowA key={i} s={s} isDesktop={true} />)}
            </div>
          </div>
        </div>
      </div>
      <MAFooter desktop={true} />
    </div>
  );
}

function AL1DesktopB() {
  return (
    <div data-screen-label="AL1 · Variante B · Desktop" style={{ background: SG.bg, fontFamily: SG.fontB, minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", flex: 1 }}>
        <SGSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>
          <MATopBar breadcrumb="Meus Álbuns" title="Gerenciar álbum" />
          <div style={{ padding: "24px 32px 40px" }}>
            <SGAlbumHero isDesktop={true} />
            <SGActionBar isDesktop={true} />
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontFamily: SG.fontM, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: SG.mute }}>
                Seções do álbum · {SG_SECOES.length} seções
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SG_SECOES.map((s, i) => <SectionRowB key={i} s={s} isDesktop={true} />)}
            </div>
          </div>
        </div>
      </div>
      <MAFooter desktop={true} />
    </div>
  );
}

Object.assign(window, { AL1MobileA, AL1MobileB, AL1DesktopA, AL1DesktopB });
