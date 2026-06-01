// shared-chrome.jsx — Cabeçalho e rodapé padrão (alta fidelidade)
// Compartilhados entre as telas do app Meu Album.
//   • Cabeçalho canônico: Home (mobile) → adaptado para desktop.
//   • Rodapé canônico: landing "Meu Album" (PackFooter) → adaptado para mobile.
// Usa as CSS vars de styles.css (var(--c-red), var(--font-display)…) para
// renderizar de forma consistente em qualquer página.

const CHROME_INK   = "#0A0907";
const CHROME_PAPER = "#FBF8EE";
const CHROME_LINE  = "rgba(10,9,7,0.18)";
const CHROME_MUTE  = "rgba(10,9,7,0.55)";

// ── Marca ───────────────────────────────────────────────────────────────────
function MALogo({ size = 28, label = true, color = CHROME_INK }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        width: size, height: size, background: "var(--c-red)", color: "#fff",
        border: "2px solid " + CHROME_INK, boxShadow: "2px 2px 0 " + CHROME_INK,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-display)", fontSize: Math.round(size * 0.43),
        transform: "rotate(-4deg)", flexShrink: 0,
      }}>MA</div>
      {label && (
        <span style={{
          fontFamily: "var(--font-display)", fontSize: size >= 30 ? 16 : 14,
          letterSpacing: "0.04em", textTransform: "uppercase", color,
        }}>Meu Album</span>
      )}
    </div>
  );
}

// ── Bloco de usuário + logout (lado direito do cabeçalho) ────────────────────
function MAUserBlock({ user = { name: "João S.", id: "#XB3K29" }, desktop = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: desktop ? 14 : 10 }}>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: desktop ? 13 : 12, textTransform: "uppercase", lineHeight: 1.05 }}>
          {user.name}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: CHROME_MUTE, letterSpacing: "0.12em" }}>
          {user.id}
        </div>
      </div>
      <button aria-label="Sair" style={{
        width: desktop ? 34 : 32, height: desktop ? 34 : 32, flexShrink: 0,
        background: "transparent", border: "1.5px solid " + CHROME_INK,
        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
      }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M10 8H2m5-4 4 4-4 4" stroke={CHROME_INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

function MABackBtn() {
  return (
    <button aria-label="Voltar" style={{
      width: 36, height: 36, flexShrink: 0,
      background: "transparent", border: "1.5px solid " + CHROME_INK,
      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
    }}>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M10 3 5 8l5 5" stroke={CHROME_INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// ── Cabeçalho padrão — MOBILE (standalone, sem sidebar) ──────────────────────
// Canônico da Home mobile: marca à esquerda · usuário + logout à direita.
// `back` adiciona um botão voltar para sub-fluxos (Abrir Pacotinhos, Colar…).
function MAHeader({ back = false, user, sticky = true, desktop = false }) {
  return (
    <header style={{
      padding: desktop ? "0 32px" : "0 16px", height: desktop ? 64 : 60,
      background: CHROME_PAPER, borderBottom: "2px solid " + CHROME_INK,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: sticky ? "sticky" : "relative", top: 0, zIndex: 50,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: desktop ? 12 : 10 }}>
        {back && <MABackBtn />}
        <MALogo size={desktop ? 30 : 28} />
      </div>
      <MAUserBlock user={user} desktop={desktop} />
    </header>
  );
}

// ── Cabeçalho padrão — DESKTOP (top bar para páginas com sidebar) ────────────
// A marca vive na sidebar; a top bar traz contexto (título/breadcrumb) à
// esquerda e a identidade do usuário + logout à direita (igual ao mobile).
function MATopBar({ title, breadcrumb }) {
  return (
    <div style={{
      height: 60, padding: "0 32px",
      background: CHROME_PAPER, borderBottom: "2px solid " + CHROME_INK,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, zIndex: 40,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        {breadcrumb && (
          <>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: CHROME_MUTE, letterSpacing: "0.16em", textTransform: "uppercase" }}>
              {breadcrumb}
            </span>
            <span style={{ color: CHROME_LINE, margin: "0 2px" }}>/</span>
          </>
        )}
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 18, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {title}
        </h1>
      </div>
      <MAUserBlock user={undefined} desktop />
    </div>
  );
}

// ── Rodapé padrão (canônico da landing Meu Album) ────────────────────────────
function MAFooter({ desktop = false }) {
  return (
    <footer style={{
      padding: desktop ? "32px 32px" : "26px 20px",
      background: CHROME_INK, color: "rgba(255,255,255,0.55)",
      display: "flex",
      flexDirection: desktop ? "row" : "column",
      justifyContent: "space-between", alignItems: "center",
      gap: desktop ? 0 : 16, fontSize: 12,
      borderTop: "6px solid var(--c-red)",
    }}>
      <MALogo color="rgba(255,255,255,0.9)" />
      <div style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.14em", textTransform: "uppercase", textAlign: "center" }}>
        Não-oficial · Feito por colecionadores · 2026
      </div>
    </footer>
  );
}

Object.assign(window, { MALogo, MAUserBlock, MAHeader, MATopBar, MAFooter });
