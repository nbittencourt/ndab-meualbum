// albuns-wf.jsx — Wireframe anotado · Álbuns (Gerenciamento)
// Telas: AL0 (Lista) · AL1 (Gerenciamento) · Mobile 390px + Desktop 1280px
// Spec: spec_albums.md

// ── tokens ─────────────────────────────────────────────────────────────────
const AL = {
  bg:    "#F0EDE4", paper: "#FBF8EE", ink:   "#0A0907",
  red:   "#E5142A", green: "#0A9145", amber: "#E89B0C",
  cream: "#F0E9D6", line:  "rgba(10,9,7,0.18)", mute: "rgba(10,9,7,0.55)",
  fontD: "var(--font-display)", fontB: "var(--font-body)", fontM: "var(--font-mono)",
};

const AL_VARIANT = {
  BROCHURA:        { tag: "Brochura",       bg: "#fff",    border: `1.5px solid ${AL.ink}`, shadow: "none",              tagBg: "#E0DDD5", tagFg: AL.ink,  dark: false },
  CAPA_DURA:       { tag: "Capa dura",      bg: "#F5F0E4", border: `2px solid ${AL.ink}`,   shadow: "3px 3px 0 #C8C4BC", tagBg: "#C8C4BC", tagFg: AL.ink,  dark: false },
  CAPA_DURA_OURO:  { tag: "Capa dura ouro", bg: "#FEF3CC", border: `2px solid #8B6914`,     shadow: "3px 3px 0 #C49A1A", tagBg: "#C49A1A", tagFg: "#fff",  dark: false },
  BOX_PREMIUM:     { tag: "Box Premium",    bg: AL.ink,    border: `2px solid ${AL.ink}`,   shadow: `4px 4px 0 ${AL.red}`, tagBg: AL.red,  tagFg: "#fff",  dark: true  },
};

const SIDEBAR_W = 228;

// ── helpers ───────────────────────────────────────────────────────────────
function alMeasure() {
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

const AlVP = React.createContext({ isDesktop: false });
const useAlVP = () => React.useContext(AlVP);

function AlAnn({ n, top, right, left, bottom }) {
  return (
    <div style={{
      position: "absolute", top, right, left, bottom,
      width: 22, height: 22, borderRadius: "50%",
      background: AL.red, color: "#fff", fontSize: 10, fontWeight: 700,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: AL.fontM, zIndex: 30, flexShrink: 0,
      border: `2px solid ${AL.paper}`, boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
    }}>{n}</div>
  );
}

function AlLegend({ items }) {
  return (
    <div style={{ margin: "24px 0 0", padding: 16, background: AL.paper, border: `1.5px solid ${AL.ink}` }}>
      <div style={{ fontFamily: AL.fontM, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: AL.mute, marginBottom: 10 }}>
        Anotações — regras de negócio
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {items.map(([n, code, txt]) => (
          <div key={n} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, background: AL.red, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: AL.fontM, marginTop: 1 }}>{n}</div>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: AL.fontM, fontSize: 9, letterSpacing: "0.14em", color: AL.red, textTransform: "uppercase", marginRight: 6 }}>{code}</span>
              <span style={{ fontSize: 11.5, color: AL.ink, lineHeight: 1.45, fontFamily: AL.fontB }}>{txt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressBar({ pct, dark, height = 8 }) {
  return (
    <div style={{ height, background: dark ? "rgba(255,255,255,0.18)" : AL.line, position: "relative" }}>
      <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: dark ? "#fff" : AL.ink }} />
    </div>
  );
}

// ── sidebar ───────────────────────────────────────────────────────────────
function AlSidebar({ activeItem = "albums" }) {
  const NAV = [
    { id: "home",    icon: "⊞", label: "Início"      },
    { id: "albums",  icon: "◻", label: "Meus Álbuns"  },
    { id: "stickers",icon: "◈", label: "Figurinhas"   },
    { id: "trades",  icon: "⇄", label: "Trocas"       },
    { id: "profile", icon: "○", label: "Perfil"        },
  ];
  return (
    <aside style={{ width: SIDEBAR_W, flexShrink: 0, background: AL.paper, borderRight: `2px solid ${AL.ink}`, display: "flex", flexDirection: "column", zIndex: 5 }}>
      <div style={{ padding: "20px 20px 18px", borderBottom: `2px solid ${AL.ink}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: AL.red, color: "#fff", border: `2px solid ${AL.ink}`, boxShadow: `2px 2px 0 ${AL.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: AL.fontD, fontSize: 12, transform: "rotate(-4deg)", flexShrink: 0 }}>MA</div>
          <span style={{ fontFamily: AL.fontD, fontSize: 14, letterSpacing: "0.04em", textTransform: "uppercase" }}>Meu Album</span>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "10px 0" }}>
        {NAV.map(item => (
          <div key={item.id} style={{ padding: "11px 20px", display: "flex", alignItems: "center", gap: 12, background: item.id === activeItem ? AL.bg : "transparent", borderLeft: item.id === activeItem ? `3px solid ${AL.red}` : "3px solid transparent", cursor: "pointer" }}>
            <span style={{ fontFamily: AL.fontM, fontSize: 15, width: 18, textAlign: "center", color: item.id === activeItem ? AL.red : AL.mute }}>{item.icon}</span>
            <span style={{ fontFamily: AL.fontB, fontSize: 13, fontWeight: 600, color: item.id === activeItem ? AL.red : AL.ink }}>{item.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function AlMobileHeader({ title, back = false }) {
  return (
    <div style={{ padding: "0 16px", height: 60, background: AL.paper, borderBottom: `2px solid ${AL.ink}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
      {back
        ? <button style={{ width: 36, height: 36, background: "transparent", border: `1.5px solid ${AL.ink}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3 5 8l5 5" stroke={AL.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        : <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, background: AL.red, color: "#fff", border: `2px solid ${AL.ink}`, boxShadow: `2px 2px 0 ${AL.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: AL.fontD, fontSize: 12, transform: "rotate(-4deg)" }}>MA</div>
            <span style={{ fontFamily: AL.fontD, fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase" }}>Meu Album</span>
          </div>
      }
      <span style={{ fontFamily: AL.fontD, fontSize: 15, textTransform: "uppercase", letterSpacing: "0.02em" }}>{title}</span>
      {back
        ? <div style={{ width: 36 }} />
        : <MAUserBlock />
      }
    </div>
  );
}

function AlDesktopTopBar({ title, breadcrumb }) {
  return (
    <div style={{ height: 60, padding: "0 32px", background: AL.paper, borderBottom: `2px solid ${AL.ink}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {breadcrumb && <><span style={{ fontFamily: AL.fontM, fontSize: 10, color: AL.mute, letterSpacing: "0.16em", textTransform: "uppercase" }}>{breadcrumb}</span><span style={{ color: AL.mute, margin: "0 6px" }}>/</span></>}
        <h1 style={{ margin: 0, fontFamily: AL.fontD, fontSize: 18, textTransform: "uppercase", letterSpacing: "0.04em" }}>{title}</h1>
      </div>
      <MAUserBlock desktop />
    </div>
  );
}

// ── AL0 — album card (ativo) ──────────────────────────────────────────────
function AlbumActiveCard({ album, withAnn }) {
  const vs = AL_VARIANT[album.variante] || AL_VARIANT.BROCHURA;
  const dark = !!vs.dark;
  const fg = dark ? "#fff" : AL.ink;
  const sub = dark ? "rgba(255,255,255,0.65)" : AL.mute;
  return (
    <div style={{ background: vs.bg, border: vs.border, boxShadow: vs.shadow, padding: 14, position: "relative" }}>
      {withAnn && <AlAnn n="4" top={-8} right={-8} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ padding: "3px 8px", background: vs.tagBg, color: vs.tagFg, fontFamily: AL.fontM, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", border: `1px solid ${dark ? AL.red : AL.ink}` }}>{vs.tag}</span>
        <span style={{ fontFamily: AL.fontM, fontSize: 9, color: sub }}>{album.criado_em}</span>
      </div>
      <div style={{ fontFamily: AL.fontD, fontSize: 15, color: fg, textTransform: "uppercase", lineHeight: 1.1, marginBottom: 3 }}>{album.tipo}</div>
      {album.nome && <div style={{ fontFamily: AL.fontB, fontSize: 12, color: sub, marginBottom: 10 }}>"{album.nome}"</div>}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
          <span style={{ fontFamily: AL.fontM, fontSize: 9, color: sub, letterSpacing: "0.12em", textTransform: "uppercase" }}>Progresso</span>
          <span style={{ fontFamily: AL.fontD, fontSize: 20, color: dark ? "#fff" : AL.ink }}>{album.pct}<span style={{ fontFamily: AL.fontM, fontSize: 10 }}>%</span></span>
        </div>
        <ProgressBar pct={album.pct} dark={dark} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, paddingTop: 10, borderTop: dark ? "1px solid rgba(255,255,255,0.15)" : `1px solid ${AL.line}` }}>
        <button style={{ padding: "10px 0", background: "transparent", border: dark ? "1.5px solid rgba(255,255,255,0.35)" : `1.5px solid ${AL.ink}`, fontFamily: AL.fontD, fontSize: 12, textTransform: "uppercase", color: fg, cursor: "pointer", letterSpacing: "0.04em" }}>
          Colar
        </button>
        <button style={{ padding: "10px 0", background: dark ? "rgba(255,255,255,0.12)" : AL.red, border: dark ? "1.5px solid rgba(255,255,255,0.35)" : `2px solid ${AL.ink}`, boxShadow: dark ? "none" : `2px 2px 0 ${AL.ink}`, fontFamily: AL.fontD, fontSize: 12, textTransform: "uppercase", color: dark ? fg : "#fff", cursor: "pointer", letterSpacing: "0.04em" }}>
          Gerenciar →
        </button>
      </div>
    </div>
  );
}

// ── AL0 — album card (arquivado) ──────────────────────────────────────────
function AlbumArchivedCard({ album, withAnn }) {
  return (
    <div style={{ background: AL.paper, border: `1.5px solid ${AL.line}`, padding: 14, position: "relative", opacity: 0.82 }}>
      {withAnn && <AlAnn n="9" top={-8} right={-8} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <span style={{ padding: "3px 8px", background: "#E0DDD5", color: AL.ink, fontFamily: AL.fontM, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", border: `1px solid ${AL.line}` }}>{album.variante_label}</span>
          <span style={{ marginLeft: 8, fontFamily: AL.fontM, fontSize: 9, color: AL.mute, letterSpacing: "0.1em", textTransform: "uppercase" }}>Arquivado {album.arquivado_em}</span>
        </div>
      </div>
      <div style={{ fontFamily: AL.fontD, fontSize: 14, color: AL.ink, textTransform: "uppercase", lineHeight: 1.1, marginBottom: 6 }}>{album.tipo}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontFamily: AL.fontM, fontSize: 10, color: AL.mute }}>{album.pct}% concluído</span>
        <ProgressBar pct={album.pct} />
      </div>
      <button style={{ width: "100%", padding: "10px 0", background: "transparent", border: `1.5px solid ${AL.ink}`, fontFamily: AL.fontD, fontSize: 12, textTransform: "uppercase", color: AL.ink, cursor: "pointer", letterSpacing: "0.04em" }}>
        Desarquivar
      </button>
    </div>
  );
}

// ── Mock data ─────────────────────────────────────────────────────────────
const MOCK_ACTIVE = [
  { id: 1, tipo: "Copa do Mundo 2026 — Panini", variante: "BOX_PREMIUM",   nome: null,          pct: 5.1,  criado_em: "01/04/2026" },
  { id: 2, tipo: "Copa do Mundo 2026 — Panini", variante: "CAPA_DURA_OURO",nome: "Meu ouro",    pct: 68.3, criado_em: "12/03/2026" },
  { id: 3, tipo: "Copa do Mundo 2026 — Panini", variante: "BROCHURA",      nome: "Do trabalho", pct: 22.7, criado_em: "15/03/2026" },
];
const MOCK_ARCHIVED = [
  { id: 4, tipo: "Copa do Mundo 2026 — Panini", variante_label: "Capa dura", pct: 14.2, arquivado_em: "20/02/2026" },
];
const MOCK_ALBUM = MOCK_ACTIVE[1]; // Capa dura ouro – usado em AL1

const MOCK_SECOES = [
  { nome: "Brasil", coladas: 42, total: 80, ordem: 1, expanded: true,
    figurinhas: [
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
    ]
  },
  { nome: "América do Norte",    coladas: 38, total: 64,  ordem: 2, expanded: false },
  { nome: "Europa",              coladas: 112, total: 112, ordem: 3, expanded: false, completa: true },
  { nome: "Figurinhas Especiais",coladas: 2,  total: 20,  ordem: 4, expanded: false },
  { nome: "América do Sul",      coladas: 28, total: 48,  ordem: 5, expanded: false },
  { nome: "África",              coladas: 15, total: 36,  ordem: 6, expanded: false },
];

// ── AL0 Mobile ────────────────────────────────────────────────────────────
function AL0Mobile({ archived = true, showAnnotations = false }) {
  const [ref, w] = alMeasure();
  const ANN = showAnnotations;

  const ANN_AL0 = [
    [1,  "RN-AL01",  "Acesso permitido para status ATIVO ou EMAIL_PENDENTE; PENDENTE → redirecionado para Tela 2 de Confirmação de Email"],
    [2,  "RN-AL02",  "Lista exibe SOMENTE álbuns ativos (arquivado_em IS NULL) · ordenados por criado_em DESC · paginação idêntica à Home (5 por página)"],
    [3,  "—",        "Estado vazio de álbuns ativos: exibe CTA para Cadastro de Álbum"],
    [4,  "—",        "Cada card ativo exibe: variante, tipo, nome_personalizado, data, progresso, botões 'Colar' e 'Gerenciar'"],
    [5,  "—",        "Botão 'Gerenciar' → Tela AL1 (exclusiva para álbuns ativos · RN-AL04)"],
    [6,  "—",        "Botão '+ Novo álbum' → Cadastro de Álbum (spec_cadastro_album)"],
    [7,  "spec_albums §5.1", "'Ver todos os álbuns' na Home navega para esta tela AL0"],
    [8,  "RN-AL13",  "Seção de arquivados: exibida somente quando há ≥ 1 álbum arquivado; ocultada quando vazia — sem estado vazio próprio"],
    [9,  "RN-AL09 / RN-AL14", "Ação 'Desarquivar' é executada diretamente, sem confirmação · lista de arquivados não é paginada · ordenada por arquivado_em DESC"],
    [10, "RN-AL02",  "Álbum arquivado: exibe data de arquivamento + percentual de conclusão (somente leitura) · nenhuma ação de colagem disponível"],
  ];

  return (
    <AlVP.Provider value={{ isDesktop: false }}>
      <div ref={ref} style={{ background: AL.bg, fontFamily: AL.fontB, minHeight: "100%" }}>
        <MAHeader />
        <div style={{ padding: "0 16px 32px" }}>

          {/* Álbuns Ativos */}
          <div style={{ padding: "20px 0 12px", borderBottom: `2px solid ${AL.ink}`, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
            {ANN && <AlAnn n="2" top={6} left={-16} />}
            <h2 style={{ margin: 0, fontFamily: AL.fontD, fontSize: 20, textTransform: "uppercase" }}>Álbuns Ativos</h2>
            <button style={{ padding: "8px 14px", background: AL.red, color: "#fff", border: `2px solid ${AL.ink}`, boxShadow: `2px 2px 0 ${AL.ink}`, fontFamily: AL.fontD, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer", position: "relative" }}>
              {ANN && <AlAnn n="6" top={-8} right={-8} />}
              + Novo álbum
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {MOCK_ACTIVE.map((a, i) => <AlbumActiveCard key={a.id} album={a} withAnn={i === 1 && ANN} />)}
          </div>

          {/* Álbuns Arquivados */}
          {archived && (
            <div style={{ marginTop: 28 }}>
              <div style={{ padding: "16px 0 12px", borderBottom: `2px solid ${AL.ink}`, marginBottom: 12, position: "relative" }}>
                {ANN && <AlAnn n="8" top={6} left={-16} />}
                <h2 style={{ margin: 0, fontFamily: AL.fontD, fontSize: 18, textTransform: "uppercase", color: AL.mute }}>
                  Álbuns Arquivados
                </h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {MOCK_ARCHIVED.map(a => <AlbumArchivedCard key={a.id} album={a} withAnn={ANN} />)}
              </div>
            </div>
          )}

          {ANN && <AlLegend items={ANN_AL0} />}
        </div>
        <MAFooter />
      </div>
    </AlVP.Provider>
  );
}

// ── AL0 Desktop ───────────────────────────────────────────────────────────
function AL0Desktop({ showAnnotations = false }) {
  const [ref, w] = alMeasure();
  const ANN = showAnnotations;
  return (
    <AlVP.Provider value={{ isDesktop: true }}>
      <div ref={ref} style={{ background: AL.bg, fontFamily: AL.fontB, minHeight: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", flex: 1 }}>
          <AlSidebar activeItem="albums" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <MATopBar title="Meus Álbuns" />
            <div style={{ padding: "28px 32px 40px" }}>
          {/* active section */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, position: "relative" }}>
            {ANN && <AlAnn n="2" top={-6} left={-16} />}
            <h2 style={{ margin: 0, fontFamily: AL.fontD, fontSize: 22, textTransform: "uppercase" }}>Álbuns Ativos</h2>
            <button style={{ padding: "10px 18px", background: AL.red, color: "#fff", border: `2px solid ${AL.ink}`, boxShadow: `2px 2px 0 ${AL.ink}`, fontFamily: AL.fontD, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer" }}>
              + Novo álbum
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 32 }}>
            {MOCK_ACTIVE.map((a, i) => <AlbumActiveCard key={a.id} album={a} withAnn={i === 1 && ANN} />)}
          </div>
          {/* archived section */}
          <div style={{ borderTop: `2px solid ${AL.ink}`, paddingTop: 20, position: "relative" }}>
            {ANN && <AlAnn n="8" top={-10} left={-16} />}
            <h2 style={{ margin: "0 0 14px", fontFamily: AL.fontD, fontSize: 18, textTransform: "uppercase", color: AL.mute }}>Álbuns Arquivados</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {MOCK_ARCHIVED.map(a => <AlbumArchivedCard key={a.id} album={a} withAnn={ANN} />)}
            </div>
          </div>
            </div>
          </div>
        </div>
        <MAFooter desktop={true} />
      </div>
    </AlVP.Provider>
  );
}

// ── AL1 — Figurinha card (Variante B: fichas com altura fixa + qty) ─────────
function StickerCardAL1({ fig, isDesktop }) {
  const colada   = fig.status === "colada";
  const repetida = fig.status === "repetida";
  const qty = fig.qty !== undefined ? fig.qty : colada ? 1 : repetida ? 2 : 0;

  const CARD_H = isDesktop ? 106 : 94;
  const BTN_H  = isDesktop ? 28 : 25;

  const qtyBg = qty >= 2 ? AL.red : qty === 1 ? "rgba(10,145,69,0.12)" : "rgba(10,9,7,0.06)";
  const qtyFg = qty >= 2 ? "#fff" : qty === 1 ? AL.green : AL.mute;

  return (
    <div style={{
      background: colada ? "rgba(10,145,69,0.04)" : "#fff",
      border: colada
        ? "1.5px solid rgba(10,145,69,0.3)"
        : repetida
        ? `1.5px solid ${AL.ink}`
        : `1.5px solid ${AL.line}`,
      padding: isDesktop ? "10px 10px 9px" : "8px 7px 7px",
      display: "flex", flexDirection: "column",
      height: CARD_H, boxSizing: "border-box", minWidth: 0,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontFamily: AL.fontM, fontSize: isDesktop ? 10 : 8.5, color: colada ? AL.green : AL.mute, letterSpacing: "0.08em" }}>{fig.num}</span>
        <span style={{ background: qtyBg, color: qtyFg, fontFamily: AL.fontM, fontWeight: 600, fontSize: isDesktop ? 9 : 7.5, padding: "1px 5px", letterSpacing: "0.04em" }}>×{qty}</span>
      </div>
      <div style={{ flex: 1, overflow: "hidden", display: "flex", alignItems: "center", padding: "4px 0" }}>
        <span style={{
          fontFamily: AL.fontD, fontSize: isDesktop ? 12 : 10,
          color: colada ? AL.mute : AL.ink,
          textTransform: "uppercase", lineHeight: 1.15,
          textDecoration: colada ? "line-through" : "none",
          textDecorationColor: "rgba(10,9,7,0.28)",
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>{fig.nome}</span>
      </div>
      <div style={{ flexShrink: 0, height: BTN_H }}>
        {repetida && (
          <button style={{
            width: "100%", height: "100%",
            background: AL.ink, color: "#fff",
            border: `1.5px solid ${AL.ink}`, boxShadow: `1px 1px 0 ${AL.red}`,
            fontFamily: AL.fontD, fontSize: isDesktop ? 9 : 8,
            textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer",
          }}>Colar →</button>
        )}
      </div>
    </div>
  );
}

// ── AL1 — Seção row ───────────────────────────────────────────────────────
function SectionRow({ s, withAnn, isDesktop }) {
  const pct = Math.round(s.coladas / s.total * 100);
  return (
    <div style={{ border: `1.5px solid ${s.expanded ? AL.ink : AL.line}`, background: s.expanded ? AL.paper : "#fff", position: "relative" }}>
      {withAnn && s.expanded && <AlAnn n="8" top={-8} right={-8} />}
      <div style={{ padding: isDesktop ? "14px 20px" : "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <span style={{ fontFamily: AL.fontD, fontSize: isDesktop ? 16 : 14, textTransform: "uppercase", color: AL.ink }}>{s.nome}</span>
            <span style={{ fontFamily: AL.fontM, fontSize: 11, color: AL.mute }}>{s.coladas}<span style={{ color: AL.line }}>/</span>{s.total}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 6, background: AL.line, position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: s.completa ? AL.green : AL.ink }} />
            </div>
            {s.completa
              ? <span style={{ fontFamily: AL.fontM, fontSize: 9, color: AL.green, letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>✓ Completa</span>
              : <span style={{ fontFamily: AL.fontD, fontSize: 14, color: AL.ink }}>{pct}%</span>
            }
          </div>
        </div>
        <span style={{ fontFamily: AL.fontM, fontSize: 12, color: s.expanded ? AL.red : AL.mute, transform: s.expanded ? "rotate(90deg)" : "none" }}>›</span>
      </div>
      {s.expanded && s.figurinhas && (
        <div style={{ borderTop: `1.5px solid ${AL.ink}` }}>
          {/* legenda */}
          <div style={{
            padding: isDesktop ? "7px 20px" : "6px 12px",
            background: "rgba(10,9,7,0.03)",
            borderBottom: `1px solid ${AL.line}`,
            display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap",
          }}>
            {[
              { symbol: "━", label: "Colada",   color: AL.green },
              { symbol: "○", label: "Faltante", color: AL.mute  },
              { symbol: "×2",label: "Repetida", color: AL.red   },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontFamily: AL.fontM, fontSize: 9, color: item.color, fontWeight: 600 }}>{item.symbol}</span>
                <span style={{ fontFamily: AL.fontM, fontSize: 8, color: AL.mute, letterSpacing: "0.08em", textTransform: "uppercase" }}>{item.label}</span>
              </div>
            ))}
          </div>
          {/* grid de cards */}
          <div style={{ padding: isDesktop ? "14px 20px" : "10px 12px" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: `repeat(${isDesktop ? 5 : 3}, 1fr)`,
              gap: isDesktop ? 10 : 8,
            }}>
              {s.figurinhas.map(fig => (
                <StickerCardAL1 key={fig.num} fig={fig} isDesktop={isDesktop} />
              ))}
            </div>
          </div>
          {/* rodapé */}
          <div style={{
            padding: isDesktop ? "8px 20px" : "8px 14px",
            display: "flex", gap: 16, flexWrap: "wrap",
            fontFamily: AL.fontM, fontSize: 9,
            letterSpacing: "0.1em", textTransform: "uppercase",
            borderTop: `1px solid ${AL.line}`,
          }}>
            <span style={{ color: AL.green }}>✓ {s.figurinhas.filter(f => f.status === "colada").length} coladas</span>
            <span style={{ color: AL.red }}>⇄ {s.figurinhas.filter(f => f.status === "repetida").length} repetidas</span>
            <span style={{ color: AL.mute }}>{s.figurinhas.filter(f => f.status === "faltante").length} faltantes</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── AL1 Mobile ────────────────────────────────────────────────────────────
function AL1Mobile({ archiving = false, pdfSpinner = false, showAnnotations = false }) {
  const [ref] = alMeasure();
  const ANN = showAnnotations;
  const vs = AL_VARIANT[MOCK_ALBUM.variante];
  const dark = vs.dark;
  const fg = dark ? "#fff" : AL.ink;

  const ANN_AL1 = [
    [1,  "RN-AL04",  "Tela AL1 acessível somente para álbuns ativos (arquivado_em IS NULL) · chegou via AL0 → 'Gerenciar'"],
    [2,  "—",        "Cabeçalho: tipo do álbum, variante por extenso, nome_personalizado (quando preenchido), data de criação"],
    [3,  "RN-AL05/06","Percentual de conclusão geral: COUNT(FigurinhaColada) / total_figurinhas × 100, arredondado a 1 casa decimal"],
    [4,  "—",        "'Colar figurinhas' → fluxo Colar Figurinhas com este álbum como contexto"],
    [5,  "RN-AL19",  "'Baixar PDF' é geração síncrona: spinner bloqueante substitui o botão; demais ações desabilitadas. Conteúdo: identificação + totais + lista de faltantes por seção em colunas (número + nome). Sem imagens"],
    [6,  "RN-AL09",  "'Arquivar' exige confirmação inline; confirmado: arquivado_em = agora; redireciona para AL0"],
    [7,  "RN-AL16",  "Seções ordenadas por Secao.ordem ASC"],
    [8,  "RN-AL15 / RN-AL07", "Seção expandida: lista somente figurinhas ainda não coladas (faltantes) · seções 100% preenchidas exibem mensagem de confirmação (RN-AL08: omitidas do PDF)"],
    [9,  "RN-AL20",  "Secao.total_figurinhas é campo desnormalizado; recalculado atomicamente a cada mudança administrativa no catálogo"],
  ];

  return (
    <AlVP.Provider value={{ isDesktop: false }}>
      <div ref={ref} style={{ background: AL.bg, fontFamily: AL.fontB, minHeight: "100%" }}>
        <MAHeader back={true} />

        {/* Album header card */}
        <div style={{ background: vs.bg, border: `2px solid ${vs.dark ? AL.ink : AL.ink}`, borderTop: "none", padding: "16px 16px 14px", position: "relative" }}>
          {ANN && <AlAnn n="2" top={-8} right={-8} />}
          <span style={{ padding: "3px 8px", background: vs.tagBg, color: vs.tagFg, fontFamily: AL.fontM, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", border: `1px solid ${dark ? AL.red : AL.ink}`, display: "inline-block", marginBottom: 8 }}>{vs.tag}</span>
          <div style={{ fontFamily: AL.fontD, fontSize: 18, color: fg, textTransform: "uppercase", lineHeight: 1.1 }}>{MOCK_ALBUM.tipo}</div>
          {MOCK_ALBUM.nome && <div style={{ fontFamily: AL.fontB, fontSize: 12, color: dark ? "rgba(255,255,255,0.6)" : AL.mute, marginTop: 2 }}>"{MOCK_ALBUM.nome}"</div>}
          <div style={{ marginTop: 14, position: "relative" }}>
            {ANN && <AlAnn n="3" top={-8} right={-8} />}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontFamily: AL.fontM, fontSize: 10, color: dark ? "rgba(255,255,255,0.55)" : AL.mute, letterSpacing: "0.12em", textTransform: "uppercase" }}>Progresso</span>
              <span style={{ fontFamily: AL.fontD, fontSize: 26, color: dark ? "#fff" : AL.ink }}>{MOCK_ALBUM.pct}<span style={{ fontFamily: AL.fontM, fontSize: 11 }}>%</span></span>
            </div>
            <ProgressBar pct={MOCK_ALBUM.pct} dark={dark} height={10} />
            <div style={{ fontFamily: AL.fontM, fontSize: 9, color: dark ? "rgba(255,255,255,0.45)" : AL.mute, marginTop: 5, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {Math.round(MOCK_ALBUM.pct * 9.8)} de 980 figurinhas coladas
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div style={{ background: AL.paper, borderBottom: `2px solid ${AL.ink}`, padding: "10px 12px", display: "flex", gap: 8, position: "sticky", top: 60, zIndex: 5 }}>
          <button style={{ flex: 1, padding: "10px 0", background: AL.ink, color: "#fff", border: `2px solid ${AL.ink}`, fontFamily: AL.fontD, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.03em", cursor: "pointer", position: "relative" }}>
            {ANN && <AlAnn n="4" top={-10} left={-10} />}
            Colar fig.
          </button>
          <button style={{ flex: 1, padding: "8px 4px", background: pdfSpinner ? AL.bg : "#fff", color: AL.ink, border: `1.5px solid ${AL.ink}`, fontFamily: AL.fontD, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.02em", cursor: "pointer", position: "relative", opacity: pdfSpinner ? 0.6 : 1, lineHeight: 1.2, whiteSpace: "normal" }}>
            {ANN && <AlAnn n="5" top={-10} left={-10} />}
            {pdfSpinner ? "Gerando…" : "Figurinhas que faltam"}
          </button>
          <button style={{ flex: 1, padding: "10px 0", background: "#fff", color: archiving ? AL.red : AL.ink, border: `1.5px solid ${archiving ? AL.red : AL.ink}`, fontFamily: AL.fontD, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.03em", cursor: "pointer", position: "relative" }}>
            {ANN && <AlAnn n="6" top={-10} right={-10} />}
            Arquivar
          </button>
        </div>

        {/* Archiving confirmation */}
        {archiving && (
          <div style={{ margin: "12px 16px 0", padding: "14px 14px", background: AL.paper, border: `2px solid ${AL.red}`, position: "relative" }}>
            <div style={{ fontFamily: AL.fontM, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: AL.red, marginBottom: 6 }}>⚠ Confirmar arquivamento</div>
            <p style={{ margin: "0 0 12px", fontFamily: AL.fontB, fontSize: 12.5, color: AL.ink, lineHeight: 1.45 }}>
              Arquivar este álbum? Ele ficará oculto das listas principais e não poderá receber novas colagens enquanto arquivado.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ flex: 1, padding: "10px 0", background: "transparent", border: `1.5px solid ${AL.ink}`, fontFamily: AL.fontD, fontSize: 12, textTransform: "uppercase", color: AL.ink, cursor: "pointer" }}>Cancelar</button>
              <button style={{ flex: 1, padding: "10px 0", background: AL.red, border: `2px solid ${AL.ink}`, boxShadow: `2px 2px 0 ${AL.ink}`, fontFamily: AL.fontD, fontSize: 12, textTransform: "uppercase", color: "#fff", cursor: "pointer" }}>Confirmar arquivamento</button>
            </div>
          </div>
        )}

        {/* Sections list */}
        <div style={{ padding: "12px 16px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, position: "relative" }}>
            {ANN && <AlAnn n="7" top={-4} left={-8} />}
            <span style={{ fontFamily: AL.fontM, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: AL.mute }}>Seções do álbum</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MOCK_SECOES.map((s, i) => <SectionRow key={i} s={s} withAnn={i === 0 && ANN} isDesktop={false} />)}
          </div>
          {ANN && <AlLegend items={ANN_AL1} />}
        </div>
        <MAFooter />
      </div>
    </AlVP.Provider>
  );
}

// ── AL1 Desktop ───────────────────────────────────────────────────────────
function AL1Desktop({ showAnnotations = false }) {
  const [ref] = alMeasure();
  const ANN = showAnnotations;
  const vs = AL_VARIANT[MOCK_ALBUM.variante];
  const dark = vs.dark;
  const fg = dark ? "#fff" : AL.ink;

  return (
    <AlVP.Provider value={{ isDesktop: true }}>
      <div ref={ref} style={{ background: AL.bg, fontFamily: AL.fontB, minHeight: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", flex: 1 }}>
          <AlSidebar activeItem="albums" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <MATopBar breadcrumb="Meus Álbuns" title="Gerenciar álbum" />

            <div style={{ padding: "24px 32px" }}>
          {/* Album hero */}
          <div style={{ background: vs.bg, border: vs.border, boxShadow: vs.shadow, padding: "20px 24px", marginBottom: 20, display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center", position: "relative" }}>
            {ANN && <AlAnn n="2" top={-8} right={-8} />}
            <div>
              <span style={{ padding: "3px 8px", background: vs.tagBg, color: vs.tagFg, fontFamily: AL.fontM, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", border: `1px solid ${dark ? AL.red : AL.ink}`, display: "inline-block", marginBottom: 8 }}>{vs.tag}</span>
              <div style={{ fontFamily: AL.fontD, fontSize: 22, color: fg, textTransform: "uppercase", lineHeight: 1.05 }}>{MOCK_ALBUM.tipo}</div>
              {MOCK_ALBUM.nome && <div style={{ fontFamily: AL.fontB, fontSize: 13, color: dark ? "rgba(255,255,255,0.6)" : AL.mute, marginTop: 3 }}>"{MOCK_ALBUM.nome}"</div>}
            </div>
            <div style={{ textAlign: "right", position: "relative" }}>
              {ANN && <AlAnn n="3" top={-8} right={-8} />}
              <div style={{ fontFamily: AL.fontD, fontSize: 48, color: dark ? "#fff" : AL.ink, lineHeight: 1 }}>{MOCK_ALBUM.pct}<span style={{ fontFamily: AL.fontM, fontSize: 16 }}>%</span></div>
              <div style={{ width: 200, marginTop: 8 }}><ProgressBar pct={MOCK_ALBUM.pct} dark={dark} height={8} /></div>
              <div style={{ fontFamily: AL.fontM, fontSize: 9, color: dark ? "rgba(255,255,255,0.45)" : AL.mute, marginTop: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {Math.round(MOCK_ALBUM.pct * 9.8)} / 980 figurinhas
              </div>
            </div>
          </div>

          {/* Action bar */}
          <div style={{ background: AL.paper, border: `1.5px solid ${AL.ink}`, padding: "10px 14px", display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}>
            <button style={{ padding: "10px 20px", background: AL.ink, color: "#fff", border: `2px solid ${AL.ink}`, boxShadow: `2px 2px 0 ${AL.red}`, fontFamily: AL.fontD, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer", position: "relative" }}>
              {ANN && <AlAnn n="4" top={-10} left={-10} />}
              Colar figurinhas →
            </button>
            <button style={{ padding: "10px 20px", background: "#fff", color: AL.ink, border: `1.5px solid ${AL.ink}`, fontFamily: AL.fontD, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer", position: "relative" }}>
              {ANN && <AlAnn n="5" top={-10} left={-10} />}
              Baixar PDF
            </button>
            <button style={{ padding: "10px 20px", background: "#fff", color: AL.ink, border: `1.5px solid ${AL.ink}`, fontFamily: AL.fontD, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer", position: "relative", marginLeft: "auto" }}>
              {ANN && <AlAnn n="6" top={-10} right={-10} />}
              Arquivar
            </button>
          </div>

          {/* Sections grid */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, position: "relative" }}>
            {ANN && <AlAnn n="7" top={-4} left={-8} />}
            <span style={{ fontFamily: AL.fontM, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: AL.mute }}>Seções do álbum · {MOCK_SECOES.length} seções</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MOCK_SECOES.map((s, i) => <SectionRow key={i} s={s} withAnn={i === 0 && ANN} isDesktop />)}
          </div>
            </div>
          </div>
        </div>
        <MAFooter desktop={true} />
      </div>
    </AlVP.Provider>
  );
}

Object.assign(window, { AL0Mobile, AL0Desktop, AL1Mobile, AL1Desktop });
