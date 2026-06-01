// abrir-pacotinhos.jsx — Tela "Abrir Pacotinhos" (AP0, AP1, modais)
// Mobile-first 390px · DNA visual herdado da landing (tricolor anfitriões + ticket stub + flat shadows)

const AP = {
  bg: "#F0EDE4",
  paper: "#FBF8EE",
  cream: "#F0E9D6",
  ink: "#0A0907",
  red: "#E5142A",
  green: "#0A9145",
  blue: "#0B2A66",
  amber: "#E89B0C",
  line: "rgba(10,9,7,0.18)",
  mute: "rgba(10,9,7,0.55)",
  fontD: 'var(--font-display)',
  fontB: 'var(--font-body)',
  fontM: 'var(--font-mono)'
};

// ─── Atoms ───────────────────────────────────────────────────────────────────

function APLogo({ size = 26 }) {
  return (
    <div style={{
      width: size, height: size, background: AP.red, color: "#fff",
      border: "2px solid " + AP.ink, boxShadow: "2px 2px 0 " + AP.ink,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: AP.fontD, fontSize: size * 0.42, transform: "rotate(-4deg)",
      flexShrink: 0, letterSpacing: 0
    }}>MA</div>);

}

function APEyebrow({ children, color = AP.mute, style }) {
  return (
    <div style={{
      fontFamily: AP.fontM, fontSize: 10, letterSpacing: "0.16em",
      textTransform: "uppercase", color, fontWeight: 500,
      display: "inline-flex", alignItems: "center", gap: 6,
      ...style
    }}>{children}</div>);

}

function APBtn({ children, variant = "primary", size = "md", style, icon }) {
  const variants = {
    primary: { bg: AP.red, fg: "#fff", border: AP.ink, shadow: "3px 3px 0 " + AP.ink },
    ink: { bg: AP.ink, fg: "#fff", border: AP.ink, shadow: "3px 3px 0 " + AP.red },
    ghost: { bg: "transparent", fg: AP.ink, border: AP.ink, shadow: "none" },
    paper: { bg: AP.paper, fg: AP.ink, border: AP.ink, shadow: "2px 2px 0 " + AP.ink },
    danger: { bg: "#fff", fg: AP.red, border: AP.red, shadow: "2px 2px 0 " + AP.red }
  };
  const v = variants[variant] || variants.primary;
  const sizes = {
    sm: { pad: "8px 12px", fs: 11 },
    md: { pad: "12px 18px", fs: 13 },
    lg: { pad: "16px 22px", fs: 14 }
  };
  const s = sizes[size] || sizes.md;
  return (
    <button style={{
      padding: s.pad,
      background: v.bg, color: v.fg,
      border: "2px solid " + v.border,
      boxShadow: v.shadow,
      fontFamily: AP.fontD, fontSize: s.fs, letterSpacing: "0.04em", textTransform: "uppercase",
      cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      lineHeight: 1, borderRadius: 0,
      ...style
    }}>
      {icon}
      {children}
    </button>);

}

function APTag({ children, bg = AP.cream, fg = AP.ink, border = AP.ink, style }) {
  return (
    <span style={{
      padding: "3px 8px", background: bg, color: fg,
      border: "1.5px solid " + border,
      fontFamily: AP.fontM, fontSize: 9, letterSpacing: "0.14em",
      textTransform: "uppercase", fontWeight: 500, display: "inline-block",
      ...style
    }}>{children}</span>);

}

// Hatched placeholder (sticker image) — usado em todos os cards
function APStickerImage({ w = 56, h = 76, num, color = AP.blue, style }) {
  return (
    <div style={{
      width: w, height: h, background: color,
      border: "2px solid " + AP.ink,
      boxShadow: "2px 2px 0 " + AP.ink,
      position: "relative", flexShrink: 0,
      ...style
    }}>
      <div style={{
        position: "absolute", inset: 4,
        backgroundImage: "repeating-linear-gradient(45deg,rgba(255,255,255,0.12) 0 6px,transparent 6px 12px)",
        border: "1px solid rgba(255,255,255,0.25)"
      }} />
      <div style={{
        position: "absolute", bottom: 3, right: 3,
        background: "rgba(0,0,0,0.45)", color: "#fff",
        fontFamily: AP.fontD, fontSize: 9, padding: "1px 4px",
        letterSpacing: "0.04em"
      }}>{num}</div>
    </div>);

}

// ─── Top bar (compartilhada por AP0 e AP1) ───────────────────────────────────

function APTopBar({ title, subtitle, onClose, counter, danger }) {
  return (
    <div style={{
      padding: "12px 16px",
      background: AP.paper,
      borderBottom: "2px solid " + AP.ink,
      display: "flex", alignItems: "center", gap: 12,
      position: "sticky", top: 0, zIndex: 10
    }}>
      <button aria-label="Voltar" style={{
        width: 38, height: 38, flexShrink: 0,
        background: "#fff", border: "2px solid " + AP.ink, boxShadow: "2px 2px 0 " + AP.ink,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", padding: 0, borderRadius: 0
      }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M10 12 6 8l4-4" stroke={AP.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: AP.fontD, fontSize: 15, textTransform: "uppercase",
          color: AP.ink, letterSpacing: "0.02em", lineHeight: 1.05
        }}>{title}</div>
        {subtitle &&
        <div style={{
          fontFamily: AP.fontM, fontSize: 10, color: AP.mute,
          letterSpacing: "0.12em", textTransform: "uppercase",
          marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
        }}>{subtitle}</div>
        }
      </div>
      {counter != null &&
      <div style={{
        padding: "5px 10px",
        background: AP.ink, color: "#fff",
        fontFamily: AP.fontD, fontSize: 13, lineHeight: 1,
        display: "flex", alignItems: "baseline", gap: 4,
        boxShadow: "2px 2px 0 " + AP.red
      }}>
          {counter}<span style={{ fontFamily: AP.fontM, fontSize: 9, opacity: 0.7, letterSpacing: "0.1em" }}>fig.</span>
        </div>
      }
    </div>);

}

// ─── AP0 — Seleção de Tipo de Álbum ──────────────────────────────────────────

function AP0Screen() {
  const tipos = [
  { id: 1, nome: "Copa do Mundo 2026 — Panini", figs: 732, selecionado: true, ano: 2026 },
  { id: 2, nome: "Eurocopa 2024 — Topps", figs: 678, selecionado: false, ano: 2024, soon: true },
  { id: 3, nome: "Libertadores 2025 — Panini", figs: 580, selecionado: false, ano: 2025, soon: true }];

  return (
    <div style={{ background: AP.bg, fontFamily: AP.fontB, minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <APTopBar title="Abrir Pacotinhos" subtitle="Passo 01 de 02 · Tipo de álbum" />

      <div style={{ padding: "24px 16px 16px" }}>
        <APEyebrow color={AP.red} style={{ marginBottom: 12 }}>
          <span style={{ width: 6, height: 6, background: AP.red, borderRadius: "50%" }} />
          Antes de começar
        </APEyebrow>
        <h1 style={{
          margin: 0, fontFamily: AP.fontD, fontSize: 36,
          letterSpacing: "-0.01em", lineHeight: 0.95, textTransform: "uppercase"
        }}>
          Que álbum<br />você está<br /><span style={{ color: AP.red }}>abrindo?</span>
        </h1>
        <p style={{
          margin: "18px 0 0", fontSize: 13, lineHeight: 1.5,
          color: "rgba(10,9,7,0.72)", maxWidth: 320
        }}>
          Todas as figurinhas desta sessão serão validadas contra o catálogo do tipo escolhido.
        </p>
      </div>

      <div style={{ padding: "8px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        {tipos.map((t) =>
        <label key={t.id} style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "16px 14px",
          background: t.selecionado ? AP.ink : t.soon ? "rgba(10,9,7,0.03)" : "#fff",
          color: t.selecionado ? "#fff" : t.soon ? AP.mute : AP.ink,
          border: "2px solid " + AP.ink,
          boxShadow: t.selecionado ? "4px 4px 0 " + AP.red : t.soon ? "none" : "3px 3px 0 " + AP.ink,
          cursor: t.soon ? "not-allowed" : "pointer",
          opacity: t.soon ? 0.55 : 1,
          position: "relative"
        }}>
            {/* radio */}
            <div style={{
            width: 22, height: 22, flexShrink: 0,
            background: t.selecionado ? AP.red : "#fff",
            border: "2px solid " + (t.selecionado ? "#fff" : AP.ink),
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
              {t.selecionado &&
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="m2 6 3 3 5-6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            }
            </div>
            {/* badge tipo */}
            <div style={{
            width: 44, height: 56, flexShrink: 0,
            background: t.selecionado ? "#fff" : AP.cream,
            border: "2px solid " + (t.selecionado ? "#fff" : AP.ink),
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            fontFamily: AP.fontD,
            boxShadow: t.selecionado ? "none" : "2px 2px 0 " + AP.ink
          }}>
              <div style={{ fontSize: 9, opacity: 0.6, color: AP.ink, letterSpacing: "0.1em" }}>ANO</div>
              <div style={{ fontSize: 16, color: AP.ink, lineHeight: 1, marginTop: 2 }}>{t.ano}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: AP.fontD, fontSize: 14, textTransform: "uppercase", lineHeight: 1.1 }}>
                {t.nome}
              </div>
              <div style={{
              fontFamily: AP.fontM, fontSize: 10, marginTop: 4,
              color: t.selecionado ? "rgba(255,255,255,0.6)" : AP.mute,
              letterSpacing: "0.1em", textTransform: "uppercase"
            }}>
                {t.figs} figurinhas {t.soon && "· em breve"}
              </div>
            </div>
          </label>
        )}
        <div style={{
          fontFamily: AP.fontM, fontSize: 10, color: AP.mute,
          letterSpacing: "0.1em", textTransform: "uppercase",
          padding: "6px 4px"
        }}>
          Hoje apenas 1 tipo no catálogo. Mais álbuns chegando.
        </div>
      </div>

      <div style={{
        padding: 16, background: AP.paper, borderTop: "2px solid " + AP.ink,
        display: "flex", gap: 10, position: "sticky", bottom: 0
      }}>
        <APBtn variant="ghost" style={{ flex: "0 0 auto" }}>Cancelar</APBtn>
        <APBtn variant="primary" style={{ flex: 1 }}>
          Continuar →
        </APBtn>
      </div>
    </div>);

}

// ─── AP1 — Tela principal (entrada + pilha) ──────────────────────────────────

function APModeToggle({ mode = "digitar" }) {
  const opts = [
  { id: "digitar", label: "Digitar", icon:
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="4" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4 7h.5M6 7h.5M8 7h.5M10 7h.5M12 7h.5M5 10h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
  },
  { id: "fotografar", label: "Fotografar", icon:
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M2 5h2.5l1-1.5h5L11.5 5H14a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="8" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      </svg>
  }];

  return (
    <div style={{
      display: "inline-flex",
      padding: 3, gap: 0, background: AP.cream, border: "2px solid " + AP.ink,
      boxShadow: "2px 2px 0 " + AP.ink
    }}>
      {opts.map((o) => {
        const active = o.id === mode;
        return (
          <div key={o.id} style={{
            padding: "7px 12px",
            background: active ? AP.ink : "transparent",
            color: active ? "#fff" : AP.ink,
            fontFamily: AP.fontD, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em",
            display: "inline-flex", alignItems: "center", gap: 6,
            cursor: "pointer"
          }}>
            {o.icon}
            {o.label}
          </div>);

      })}
    </div>);

}

function APInputZone({ mode = "digitar", value = "", error, limitReached }) {
  return (
    <div style={{
      background: AP.ink, padding: "18px 16px 16px",
      borderBottom: "2px solid " + AP.ink,
      position: "relative", overflow: "hidden"
    }}>
      {/* decorative ticket pattern */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.07,
        backgroundImage: "repeating-linear-gradient(135deg,#fff 0 14px,transparent 14px 28px)"
      }} />
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <APEyebrow color="rgba(255,255,255,0.55)">◉ Modo de entrada</APEyebrow>
        <APModeToggle mode={mode} />
      </div>

      {mode === "digitar" ?
      <div style={{ position: "relative" }}>
          <label style={{
          display: "block", fontFamily: AP.fontM, fontSize: 10,
          letterSpacing: "0.14em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.6)", marginBottom: 8
        }}>
            Número da figurinha
          </label>
          <div style={{ display: "flex", gap: 8, minWidth: 0 }}>
            <div style={{ flex: "1 1 0", minWidth: 0, position: "relative" }}>
              <input
              readOnly
              value={value}
              placeholder="Ex: BRA-07"
              style={{
                width: "100%", padding: "14px 14px",
                background: "#fff", color: AP.ink,
                border: "2.5px solid " + (error ? AP.red : "#fff"),
                fontFamily: AP.fontD, fontSize: 18,
                letterSpacing: "0.04em", textTransform: "uppercase",
                outline: "none", borderRadius: 0, minWidth: 0, boxSizing: "border-box",
                boxShadow: error ? "0 0 0 3px rgba(229,20,42,0.35)" : "inset 0 0 0 0 transparent"
              }} />
            
              {value &&
            <span style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              width: 6, height: 16, background: AP.red, animation: "apBlink 1s steps(1) infinite"
            }} />
            }
            </div>
            <APBtn variant="primary" size="lg" style={{ padding: "0 14px", boxShadow: "3px 3px 0 " + AP.red, flexShrink: 0, fontSize: 12 }}>
              Confirma
            </APBtn>
          </div>
          {error &&
        <div style={{
          marginTop: 10, padding: "8px 10px",
          background: "rgba(229,20,42,0.12)",
          border: "1.5px solid " + AP.red,
          fontFamily: AP.fontM, fontSize: 11, color: "#fff",
          display: "flex", alignItems: "center", gap: 8
        }}>
              <span style={{
            width: 16, height: 16, background: AP.red, color: "#fff",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontFamily: AP.fontD, fontSize: 11, flexShrink: 0
          }}>!</span>
              <span><b style={{ letterSpacing: "0.1em" }}>"{value}"</b> não está no catálogo deste álbum.</span>
            </div>
        }
          <div style={{
          marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center",
          fontFamily: AP.fontM, fontSize: 10, color: "rgba(255,255,255,0.45)",
          letterSpacing: "0.12em", textTransform: "uppercase"
        }}>
            <span>↩ Confirma · maiúsculas auto</span>
            <span>Catálogo · 732 fig.</span>
          </div>
        </div> :

      <div style={{ position: "relative" }}>
          <APBtn variant="primary" size="lg" style={{ width: "100%", padding: "22px", boxShadow: "4px 4px 0 " + AP.red }}>
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
              <path d="M2 5h2.5l1-1.5h5L11.5 5H14a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
              <circle cx="8" cy="9.5" r="2.5" stroke="#fff" strokeWidth="1.6" />
            </svg>
            Abrir câmera
          </APBtn>
          <div style={{
          marginTop: 10, fontFamily: AP.fontM, fontSize: 10,
          color: "rgba(255,255,255,0.55)", letterSpacing: "0.12em",
          textTransform: "uppercase", textAlign: "center"
        }}>
            OCR roda no dispositivo · nenhuma imagem sai do seu celular
          </div>
        </div>
      }
            {limitReached &&
      <div style={{
        marginTop: 10, padding: "9px 12px",
        background: "rgba(229,20,42,0.15)",
        border: "1.5px solid " + AP.red,
        fontFamily: AP.fontM, fontSize: 11, color: "#fff",
        display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.4
      }}>
        <span style={{
          width: 18, height: 18, background: AP.red, color: "#fff", flexShrink: 0,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontFamily: AP.fontD, fontSize: 11,
        }}>!</span>
        <span>Limite de 100 figurinhas pendentes atingido. Defina o destino de algumas antes de continuar. (RN-AP28)</span>
      </div>
      }
    </div>);

}

// Sticker card (multiple states)
function APCard({ entry }) {
  // status_destino: PENDENTE | COLADA | REPETIDA
  // elegivel: boolean (apenas relevante quando PENDENTE)
  // origem: DIGITACAO | CAMERA
  const isPending = entry.status === "PENDENTE";
  const isColada = entry.status === "COLADA";
  const isRepetida = entry.status === "REPETIDA";
  const isInelig = isPending && !entry.elegivel;

  // background by state
  const bg = isColada ? "rgba(10,145,69,0.06)" :
  isRepetida ? "rgba(232,155,12,0.06)" :
  "#fff";
  const border = isColada ? AP.green :
  isRepetida ? AP.amber :
  AP.ink;
  const shadow = isPending && !isInelig ? "3px 3px 0 " + AP.ink : "none";

  return (
    <div style={{
      background: bg,
      border: "2px solid " + border,
      boxShadow: shadow,
      padding: 12,
      position: "relative",
      display: "flex", flexDirection: "column", gap: 12
    }}>
      {/* status ribbon (only for resolved) */}
      {(isColada || isRepetida) &&
      <div style={{
        position: "absolute", top: -2, right: -2,
        padding: "4px 8px",
        background: isColada ? AP.green : AP.amber,
        color: "#fff",
        fontFamily: AP.fontD, fontSize: 10, letterSpacing: "0.1em",
        textTransform: "uppercase", borderRadius: 0
      }}>
          {isColada ? "✓ Colada" : "↪ Repetida"}
        </div>
      }

      {/* main row: image + info */}
      <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
        <APStickerImage w={56} h={76} num={entry.numero} color={entry.color || AP.blue} />

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{
              fontFamily: AP.fontM, fontSize: 10, color: AP.mute,
              letterSpacing: "0.12em", textTransform: "uppercase"
            }}>
              {entry.numero}
            </span>
            <span style={{ color: AP.line }}>·</span>
            <span style={{
              fontFamily: AP.fontM, fontSize: 9, letterSpacing: "0.14em",
              textTransform: "uppercase", color: AP.mute
            }}>
              {entry.origem === "CAMERA" ? "📷 câmera" : "⌨ digitada"}
            </span>
          </div>

          <div style={{
            fontFamily: AP.fontD, fontSize: 16, textTransform: "uppercase",
            color: AP.ink, lineHeight: 1.05, letterSpacing: "0.01em"
          }}>
            {entry.nome}
          </div>

          {/* elegibility indicator (only pending) */}
          {isPending &&
          <div style={{
            marginTop: 2,
            display: "inline-flex", alignItems: "center", gap: 6
          }}>
              {isInelig ?
            <>
                  <span style={{
                width: 14, height: 14, borderRadius: "50%",
                background: AP.mute, color: "#fff",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontFamily: AP.fontD
              }}>—</span>
                  <span style={{
                fontFamily: AP.fontM, fontSize: 10, color: AP.mute,
                letterSpacing: "0.1em", textTransform: "uppercase"
              }}>
                    Já está em todos os álbuns
                  </span>
                </> :

            <>
                  <span style={{
                width: 14, height: 14, borderRadius: "50%",
                background: AP.green, color: "#fff",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontFamily: AP.fontD
              }}>✓</span>
                  <span style={{
                fontFamily: AP.fontM, fontSize: 10, color: AP.green,
                letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600
              }}>
                    Pode colar em {entry.elegiveis} álbum{entry.elegiveis > 1 ? "s" : ""}
                  </span>
                </>
            }
            </div>
          }

          {/* resolved destination */}
          {isColada &&
          <div style={{
            fontFamily: AP.fontM, fontSize: 10, color: AP.green,
            letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600,
            marginTop: 2
          }}>
              Colada em {entry.albumDestino}
            </div>
          }
          {isRepetida &&
          <div style={{
            fontFamily: AP.fontM, fontSize: 10, color: AP.amber,
            letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600,
            marginTop: 2
          }}>
              Enviada para o estoque de repetidas
            </div>
          }
        </div>

        {/* discard control (only pending) */}
        {isPending &&
        <button aria-label="Descartar" style={{
          width: 28, height: 28, alignSelf: "flex-start", flexShrink: 0,
          background: "transparent", color: AP.mute,
          border: "1.5px solid " + AP.line,
          cursor: "pointer", padding: 0, borderRadius: 0,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2.5h8M4 2.5V2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v.5M3.5 2.5l.5 7.5h4l.5-7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        }
      </div>

      {/* actions (only pending) */}
      {isPending &&
      <div style={{ display: "flex", gap: 8, paddingTop: 2 }}>
          {!isInelig &&
        <APBtn variant="ink" size="sm" style={{ flex: 1, padding: "10px 8px", boxShadow: "2px 2px 0 " + AP.red }}>
              Colar
            </APBtn>
        }
          <APBtn
          variant={isInelig ? "primary" : "paper"}
          size="sm"
          style={{ flex: 1, padding: "10px 8px" }}>
          
            ↪ Repetidas
          </APBtn>
        </div>
      }
      
      {/* discard confirmation (RN-AP24) */}
      {isPending && entry.discardConfirm &&
      <div style={{
        marginTop: 2, padding: "10px 12px",
        background: "rgba(229,20,42,0.06)",
        border: "1.5px solid " + AP.red,
      }}>
        <div style={{
          fontFamily: AP.fontB, fontSize: 12.5, color: AP.ink,
          marginBottom: 10, lineHeight: 1.4,
        }}>
          Remover <strong style={{ fontFamily: AP.fontD, letterSpacing: "0.02em" }}>
            {entry.numero} — {entry.nome}
          </strong> da pilha?
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <APBtn variant="primary" size="sm"
            style={{ flex: 1, background: AP.red, borderColor: AP.red, boxShadow: "2px 2px 0 " + AP.ink }}>
            Sim, remover
          </APBtn>
          <APBtn variant="ghost" size="sm" style={{ flex: 1 }}>Cancelar</APBtn>
        </div>
      </div>
      }
    </div>);

}

// Empty state for the stack
function APEmptyStack() {
  return (
    <div style={{
      margin: "16px",
      padding: "32px 16px",
      border: "2px dashed " + AP.line,
      background: "rgba(10,9,7,0.02)",
      display: "flex", flexDirection: "column", alignItems: "center",
      textAlign: "center", gap: 10
    }}>
      <div style={{
        width: 64, height: 64,
        background: AP.cream, border: "2px solid " + AP.ink,
        boxShadow: "3px 3px 0 " + AP.ink,
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: "rotate(-6deg)"
      }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="4" y="6" width="20" height="16" rx="1" stroke={AP.ink} strokeWidth="2" />
          <path d="M4 11h20" stroke={AP.ink} strokeWidth="2" />
          <path d="M10 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke={AP.ink} strokeWidth="2" />
        </svg>
      </div>
      <div style={{ fontFamily: AP.fontD, fontSize: 16, textTransform: "uppercase", marginTop: 4 }}>
        Pilha vazia
      </div>
      <p style={{ margin: 0, fontSize: 12, color: AP.mute, maxWidth: 240, lineHeight: 1.45 }}>
        Digite o número da primeira figurinha ou use a câmera para começar.
      </p>
      <div style={{
        marginTop: 6,
        fontFamily: AP.fontM, fontSize: 9, letterSpacing: "0.14em",
        textTransform: "uppercase", color: AP.mute
      }}>
        Tente: BRA-07 · ARG-10 · FRA-11
      </div>
    </div>);

}

// Stack list
function APStack({ entries, showHeader = true }) {
  const pendentes = entries.filter((e) => e.status === "PENDENTE").length;

  return (
    <div style={{ padding: "16px 16px 24px" }}>
      {showHeader &&
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        padding: "4px 0 12px",
        borderBottom: "2px solid " + AP.ink,
        marginBottom: 14
      }}>
          <div>
            <APEyebrow color={AP.mute}>Pilha da sessão</APEyebrow>
            <div style={{
            fontFamily: AP.fontD, fontSize: 20, textTransform: "uppercase",
            marginTop: 4, lineHeight: 1
          }}>
              {entries.length} figurinha{entries.length !== 1 ? "s" : ""}
            </div>
          </div>
          {pendentes > 0 &&
        <APBtn variant="paper" size="sm" style={{ boxShadow: "2px 2px 0 " + AP.amber, borderColor: AP.ink }}>
              ↪ Todas p/ repetidas
            </APBtn>
        }
        </div>
      }

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {entries.map((e, i) => <APCard key={i} entry={e} />)}
      </div>
    </div>);

}

// ─── AP1 — Composed screens ──────────────────────────────────────────────────

const MOCK_FULL = [
{ numero: "BRA-07", nome: "Raphinha", origem: "DIGITACAO", status: "PENDENTE", elegivel: true, elegiveis: 2, color: AP.green },
{ numero: "FRA-11", nome: "K. Mbappé", origem: "CAMERA", status: "PENDENTE", elegivel: true, elegiveis: 1, color: AP.blue },
{ numero: "ARG-10", nome: "L. Messi", origem: "DIGITACAO", status: "COLADA", albumDestino: "Meu ouro", color: AP.blue },
{ numero: "ENG-09", nome: "H. Kane", origem: "DIGITACAO", status: "PENDENTE", elegivel: false, color: AP.red },
{ numero: "GER-08", nome: "T. Kroos", origem: "CAMERA", status: "REPETIDA", color: AP.ink },
{ numero: "POR-07", nome: "C. Ronaldo", origem: "DIGITACAO", status: "PENDENTE", elegivel: true, elegiveis: 3, color: AP.red }];



const MOCK_FULL_WITH_DISCARD = [
{ numero: "BRA-07", nome: "Raphinha", origem: "DIGITACAO", status: "PENDENTE", elegivel: true, elegiveis: 2, color: AP.green, discardConfirm: true },
{ numero: "FRA-11", nome: "K. Mbappé", origem: "CAMERA",    status: "PENDENTE", elegivel: true, elegiveis: 1, color: AP.blue },
{ numero: "ARG-10", nome: "L. Messi",  origem: "DIGITACAO", status: "COLADA",   albumDestino: "Meu ouro",  color: AP.blue },
{ numero: "ENG-09", nome: "H. Kane",   origem: "DIGITACAO", status: "PENDENTE", elegivel: false,            color: AP.red },
{ numero: "GER-08", nome: "T. Kroos",  origem: "CAMERA",    status: "REPETIDA",                             color: AP.ink },
{ numero: "POR-07", nome: "C. Ronaldo",origem: "DIGITACAO", status: "PENDENTE", elegivel: true, elegiveis: 3, color: AP.red }];

function AP1Screen({ state = "active" }) {
  // state: "empty" | "active" | "error" | "camera-mode" | "limit-reached" | "discard-confirm"
  const entries = state === "empty" ? [] : (state === "discard-confirm" ? MOCK_FULL_WITH_DISCARD : MOCK_FULL);
  const isError = state === "error";
  const isLimit = state === "limit-reached";
  const mode = state === "camera-mode" ? "fotografar" : "digitar";

  return (
    <div style={{ background: AP.bg, fontFamily: AP.fontB, minHeight: "100%" }}>
      <APTopBar
        title="Abrir Pacotinhos"
        subtitle="Copa do Mundo 2026 — Panini"
        counter={entries.length} />
      
      <APInputZone
        mode={mode}
        value={isError ? "BRA-99" : isLimit ? "BRA-07" : ""}
        error={isError}
        limitReached={isLimit} />
      
      {entries.length === 0 ? <APEmptyStack /> : <APStack entries={entries} />}
    </div>);

}

// ─── Modal Câmera (MC) ───────────────────────────────────────────────────────

function APModalShell({ children, width = 358, stackBehind }) {
  return (
    <div style={{
      position: "relative", background: AP.bg, minHeight: "100%",
      fontFamily: AP.fontB
    }}>
      {/* underlying AP1 visible (parcial) */}
      <div style={{ filter: "blur(0.4px)", opacity: 0.7 }}>
        <APTopBar title="Abrir Pacotinhos" subtitle="Copa do Mundo 2026 — Panini" counter={stackBehind?.length || 0} />
        <APInputZone mode="digitar" value="" />
        {stackBehind && <APStack entries={stackBehind.slice(0, 2)} />}
      </div>
      {/* scrim */}
      <div style={{
        position: "absolute", inset: 0,
        background: "rgba(10,9,7,0.72)",
        backdropFilter: "blur(2px)"
      }} />
      {/* modal */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        width, maxWidth: "calc(100% - 24px)"
      }}>
        {children}
      </div>
    </div>);

}

function APCameraModal() {
  return (
    <APModalShell stackBehind={MOCK_FULL}>
      <div style={{
        background: AP.paper, border: "2.5px solid " + AP.ink,
        boxShadow: "6px 6px 0 " + AP.red
      }}>
        {/* header */}
        <div style={{
          background: AP.ink, color: "#fff",
          padding: "12px 14px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontFamily: AP.fontM, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase",
          borderBottom: "2.5px dashed " + AP.cream
        }}>
          <span>● Câmera · OCR local</span>
          <span style={{ color: "rgba(255,255,255,0.45)" }}>03 fig.</span>
        </div>
        {/* viewfinder */}
        <div style={{
          margin: 12, height: 220,
          background: "#0d0d0a", position: "relative", overflow: "hidden",
          border: "1.5px solid " + AP.ink
        }}>
          {/* simulated camera noise */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.06), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(229,20,42,0.08), transparent 50%)"
          }} />
          {/* mock sticker back */}
          <div style={{
            position: "absolute", left: "50%", top: "50%",
            transform: "translate(-50%,-50%) rotate(-3deg)",
            width: 180, height: 130, background: "#e9e3d2",
            border: "2px solid #888", padding: "10px 14px",
            fontFamily: AP.fontM, color: "#222",
            display: "flex", flexDirection: "column", gap: 6,
            opacity: 0.92
          }}>
            <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "#666" }}>OFICIAL · COPA 2026</div>
            <div style={{ fontFamily: AP.fontD, fontSize: 36, letterSpacing: "0.04em" }}>POR-07</div>
            <div style={{ fontSize: 9, color: "#666", marginTop: "auto" }}>POR-07 · Portugal</div>
          </div>
          {/* alignment guide */}
          <div style={{
            position: "absolute", inset: 24,
            border: "2px dashed rgba(255,255,255,0.7)"
          }} />
          {/* corners */}
          {[[0, 0], [0, 1], [1, 0], [1, 1]].map(([y, x], i) =>
          <div key={i} style={{
            position: "absolute",
            top: y ? "auto" : 16, bottom: y ? 16 : "auto",
            left: x ? "auto" : 16, right: x ? 16 : "auto",
            width: 18, height: 18,
            borderTop: y ? "none" : "3px solid " + AP.red,
            borderBottom: y ? "3px solid " + AP.red : "none",
            borderLeft: x ? "none" : "3px solid " + AP.red,
            borderRight: x ? "3px solid " + AP.red : "none"
          }} />
          )}
          <div style={{
            position: "absolute", bottom: 8, left: 8,
            fontFamily: AP.fontM, fontSize: 9, color: "rgba(255,255,255,0.8)",
            letterSpacing: "0.14em", textTransform: "uppercase",
            background: "rgba(0,0,0,0.5)", padding: "3px 6px"
          }}>● Reconhecendo…</div>
        </div>
        {/* result row */}
        <div style={{ padding: "8px 14px 14px" }}>
          <APEyebrow style={{ marginBottom: 8 }}>Número reconhecido (editável)</APEyebrow>
          <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
            <input
              readOnly
              value="POR-07"
              style={{
                flex: 1, padding: "14px",
                background: "#fff", color: AP.ink,
                border: "2.5px solid " + AP.ink,
                fontFamily: AP.fontD, fontSize: 20, letterSpacing: "0.06em", textTransform: "uppercase",
                outline: "none", borderRadius: 0
              }} />
            
            <APBtn variant="primary" style={{ boxShadow: "2px 2px 0 " + AP.ink }}>Confirmar</APBtn>
          </div>
          <div style={{
            marginTop: 8, fontFamily: AP.fontM, fontSize: 10,
            color: AP.green, letterSpacing: "0.1em", textTransform: "uppercase"
          }}>✓ Encontrada · Portugal · C. Ronaldo</div>
        </div>
        {/* footer actions */}
        <div style={{
          padding: "12px 14px", background: AP.cream,
          borderTop: "1.5px solid " + AP.ink,
          display: "flex", gap: 8
        }}>
          <APBtn variant="ghost" size="sm" style={{ flex: 1 }}>Fechar câmera</APBtn>
          <APBtn variant="ink" size="sm" style={{ flex: 1 }}>Fotografar próxima →</APBtn>
        </div>
      </div>
    </APModalShell>);

}

// ─── Modal Câmera — estado "não reconhecido" ────────────────────────────────

function APCameraModalUnrecognized() {
  return (
    <APModalShell stackBehind={MOCK_FULL}>
      <div style={{
        background: AP.paper, border: "2.5px solid " + AP.ink,
        boxShadow: "6px 6px 0 " + AP.red
      }}>
        <div style={{
          background: AP.ink, color: "#fff",
          padding: "12px 14px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontFamily: AP.fontM, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase"
        }}>
          <span>● Câmera · OCR local</span>
          <span style={{ color: "rgba(255,255,255,0.45)" }}>03 fig.</span>
        </div>
        <div style={{
          margin: 12, padding: "32px 20px",
          background: "rgba(229,20,42,0.06)",
          border: "1.5px dashed " + AP.red,
          textAlign: "center"
        }}>
          <div style={{
            width: 56, height: 56, margin: "0 auto 14px",
            background: AP.red, color: "#fff",
            border: "2px solid " + AP.ink, boxShadow: "3px 3px 0 " + AP.ink,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: AP.fontD, fontSize: 28
          }}>?</div>
          <div style={{
            fontFamily: AP.fontD, fontSize: 18, textTransform: "uppercase",
            color: AP.ink, lineHeight: 1.1
          }}>
            Não foi possível<br />reconhecer o número
          </div>
          <p style={{
            margin: "10px 0 0", fontSize: 12, color: AP.mute,
            lineHeight: 1.4, maxWidth: 240, marginInline: "auto"
          }}>
            Tente alinhar melhor o verso da figurinha na guia. Se preferir, pule e digite manualmente depois.
          </p>
        </div>
        <div style={{
          padding: "12px 14px", background: AP.cream,
          borderTop: "1.5px solid " + AP.ink,
          display: "flex", gap: 8
        }}>
          <APBtn variant="paper" size="sm" style={{ flex: 1 }}>Pular esta</APBtn>
          <APBtn variant="primary" size="sm" style={{ flex: 1 }}>Tentar novamente</APBtn>
        </div>
      </div>
    </APModalShell>);

}

// ─── Modal de Colagem (MCol) ─────────────────────────────────────────────────

// Estilos por variante de álbum (espelha o Album da Home — RN-H07)
const AP_VARIANT_STYLE = {
  BROCHURA: { bg: "#FFFFFF", borderColor: AP.ink, borderWidth: 1.5, shadow: "none", tagBg: "#E0DDD5", tagColor: AP.ink, dark: false },
  CAPA_DURA: { bg: "#F5F0E4", borderColor: AP.ink, borderWidth: 2, shadow: "3px 3px 0 #C8C4BC", tagBg: "#C8C4BC", tagColor: AP.ink, dark: false },
  CAPA_DURA_PRATA: { bg: "repeating-linear-gradient(135deg,#F0EDE4 0 6px,#E0DDD5 6px 8px)", borderColor: AP.ink, borderWidth: 2, shadow: "3px 3px 0 #9E9E9E", tagBg: "#9E9E9E", tagColor: "#fff", dark: false },
  CAPA_DURA_OURO: { bg: "#FEF3CC", borderColor: "#8B6914", borderWidth: 2, shadow: "3px 3px 0 #C49A1A", tagBg: "#C49A1A", tagColor: "#fff", dark: false },
  BOX_PREMIUM: { bg: AP.ink, borderColor: AP.ink, borderWidth: 2, shadow: "4px 4px 0 " + AP.red, tagBg: AP.red, tagColor: "#fff", dark: true }
};

function APPasteModal({ variant = "multi" }) {
  // variant: "single" (1 elegível, pré-selecionado) | "multi" (vários)
  const albums = [
  { id: 1, nome: "Meu ouro", tipo: "Capa dura ouro", variant: "CAPA_DURA_OURO", pct: 68.3, missing: 232, sel: variant === "single" || variant === "multi", chosen: variant === "multi" },
  { id: 2, nome: "Box completo", tipo: "Box Premium", variant: "BOX_PREMIUM", pct: 5.1, missing: 695, sel: false },
  { id: 3, nome: "Do trabalho", tipo: "Brochura", variant: "BROCHURA", pct: 22.7, missing: 565, sel: variant === "multi" && false }];

  const list = variant === "single" ? albums.slice(0, 1) : albums;

  return (
    <APModalShell stackBehind={MOCK_FULL}>
      <div style={{
        background: "#fff", border: "2.5px solid " + AP.ink,
        boxShadow: "6px 6px 0 " + AP.green
      }}>
        {/* ticket-style header */}
        <div style={{
          background: AP.green, color: "#fff",
          padding: "10px 14px",
          fontFamily: AP.fontM, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <span>● Colar figurinha</span>
          <span style={{ opacity: 0.75 }}>N° {variant === "single" ? "0247" : "0248"}</span>
        </div>
        {/* perforation */}
        <div style={{ height: 12, background: AP.paper, borderBottom: "2px dashed " + AP.ink, position: "relative" }}>
          <div style={{ position: "absolute", left: -8, top: -4, width: 16, height: 16, borderRadius: "50%", background: AP.bg, border: "2px solid " + AP.ink }} />
          <div style={{ position: "absolute", right: -8, top: -4, width: 16, height: 16, borderRadius: "50%", background: AP.bg, border: "2px solid " + AP.ink }} />
        </div>

        {/* sticker info */}
        <div style={{ padding: "16px 16px 8px", display: "flex", gap: 14, alignItems: "center" }}>
          <APStickerImage w={56} h={76} num="BRA-07" color={AP.green} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: AP.fontM, fontSize: 10, color: AP.mute, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              BRA-07
            </div>
            <div style={{ fontFamily: AP.fontD, fontSize: 20, textTransform: "uppercase", lineHeight: 1.05, marginTop: 4 }}>
              Raphinha
            </div>
            <div style={{
              marginTop: 6, display: "inline-flex", alignItems: "center", gap: 6,
              padding: "3px 8px", background: "rgba(10,145,69,0.12)",
              border: "1.5px solid " + AP.green,
              fontFamily: AP.fontM, fontSize: 10, color: AP.green,
              letterSpacing: "0.1em", textTransform: "uppercase"
            }}>
              {variant === "single" ? "1 álbum elegível" : `${albums.length} álbuns elegíveis`}
            </div>
          </div>
        </div>

        {/* heading */}
        <div style={{ padding: "10px 16px 6px" }}>
          <APEyebrow color={AP.mute}>
            {variant === "single" ? "Destino sugerido" : "Escolha um álbum"}
          </APEyebrow>
        </div>

        {/* album list — estilo herdado da Home (variante por tipo de álbum) */}
        <div style={{ padding: "0 12px 14px", display: "flex", flexDirection: "column", gap: 10, maxHeight: 280, overflow: "hidden" }}>
          {list.map((a, i) => {
            const vs = AP_VARIANT_STYLE[a.variant];
            const fg = vs.dark ? "#fff" : AP.ink;
            const mute = vs.dark ? "rgba(255,255,255,0.55)" : AP.mute;
            const track = vs.dark ? "rgba(255,255,255,0.18)" : AP.line;
            const fill = vs.dark ? "#fff" : AP.ink;
            return (
              <label key={a.id} style={{
                display: "flex", gap: 10, alignItems: "center",
                padding: "12px 12px",
                background: vs.bg, color: fg,
                border: vs.borderWidth + "px solid " + vs.borderColor,
                boxShadow: a.sel ? "3px 3px 0 " + AP.green : vs.shadow,
                outline: a.sel ? "2px solid " + AP.green : "none",
                outlineOffset: a.sel ? "-4px" : 0,
                cursor: "pointer", position: "relative"
              }}>
                <div style={{
                  width: 18, height: 18, flexShrink: 0,
                  background: a.sel ? AP.green : (vs.dark ? "rgba(255,255,255,0.15)" : "#fff"),
                  border: "2px solid " + (a.sel ? AP.green : (vs.dark ? "#fff" : AP.ink)),
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {a.sel && <div style={{ width: 7, height: 7, background: "#fff", borderRadius: "50%" }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: "inline-block",
                    padding: "2px 6px", marginBottom: 4,
                    background: vs.tagBg, color: vs.tagColor,
                    fontFamily: AP.fontM, fontSize: 8, letterSpacing: "0.16em",
                    textTransform: "uppercase", fontWeight: 600
                  }}>{a.tipo}</div>
                  <div style={{ fontFamily: AP.fontD, fontSize: 14, textTransform: "uppercase", lineHeight: 1.05, color: fg }}>
                    {a.nome}
                  </div>
                  <div style={{
                    fontFamily: AP.fontM, fontSize: 9, marginTop: 4,
                    color: mute, letterSpacing: "0.1em", textTransform: "uppercase"
                  }}>
                    {a.missing} faltam
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: AP.fontD, fontSize: 18, color: fg, lineHeight: 1 }}>
                    {a.pct}<span style={{ fontFamily: AP.fontM, fontSize: 9 }}>%</span>
                  </div>
                  <div style={{
                    width: 56, height: 4, background: track, marginTop: 5, position: "relative"
                  }}>
                    <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${a.pct}%`, background: fill }} />
                  </div>
                </div>
              </label>);
          })}
        </div>

        {/* actions */}
        <div style={{
          padding: "12px 14px", background: AP.cream,
          borderTop: "1.5px solid " + AP.ink,
          display: "flex", gap: 8
        }}>
          <APBtn variant="ghost" size="sm" style={{ flex: "0 0 auto" }}>Cancelar</APBtn>
          <APBtn variant="primary" size="sm" style={{ flex: 1, background: AP.green, boxShadow: "3px 3px 0 " + AP.ink }}>
            Colar
          </APBtn>
        </div>
      </div>
    </APModalShell>);

}

// ─── Modal de Retomada ───────────────────────────────────────────────────────

function APResumeModal() {
  return (
    <APModalShell stackBehind={[]}>
      <div style={{
        background: "#fff", border: "2.5px solid " + AP.ink,
        boxShadow: "6px 6px 0 " + AP.red
      }}>
        <div style={{
          background: AP.red, color: "#fff",
          padding: "12px 14px",
          fontFamily: AP.fontM, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <span>◉ Sessão pendente · RN-AP01 / RN-AP19</span>
          <span style={{ opacity: 0.75 }}>backend</span>
        </div>
        <div style={{ padding: "20px 18px 8px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
            <div style={{ fontFamily: AP.fontD, fontSize: 56, color: AP.red, lineHeight: 0.9 }}>04</div>
            <div style={{
              fontFamily: AP.fontM, fontSize: 11, letterSpacing: "0.12em",
              textTransform: "uppercase", color: AP.mute
            }}>figurinhas<br />sem destino</div>
          </div>
          <h2 style={{
            margin: "12px 0 8px", fontFamily: AP.fontD, fontSize: 22,
            textTransform: "uppercase", lineHeight: 1.05
          }}>
            Continuar de<br />onde parou?
          </h2>
          <p style={{ margin: "0 0 10px", fontSize: 13, color: "rgba(10,9,7,0.72)", lineHeight: 1.45 }}>
            Sua pilha está salva no servidor. Você pode retomar em qualquer dispositivo ou começar uma sessão nova.
          </p>
          <div style={{
            margin: "10px 0 0", padding: 10,
            background: AP.cream, border: "1.5px solid " + AP.line,
            fontFamily: AP.fontM, fontSize: 10, color: AP.mute,
            letterSpacing: "0.1em", textTransform: "uppercase",
            display: "flex", justifyContent: "space-between"
          }}>
            <span>Tipo: Copa 2026 — Panini</span>
            <span>2h atrás</span>
          </div>
        </div>
        <div style={{
          padding: 14, background: AP.paper,
          borderTop: "1.5px solid " + AP.ink,
          display: "flex", flexDirection: "column", gap: 8
        }}>
          <APBtn variant="primary" style={{ width: "100%", boxShadow: "3px 3px 0 " + AP.ink }}>
            Continuar sessão anterior →
          </APBtn>
          <APBtn variant="ghost" size="sm" style={{ width: "100%", color: AP.mute, borderColor: AP.line }}>
            Descartar e começar do zero
          </APBtn>
        </div>
      </div>
    </APModalShell>);

}

// ─── Alerta de saída ─────────────────────────────────────────────────────────

function APExitAlert() {
  return (
    <APModalShell stackBehind={MOCK_FULL} width={320}>
      <div style={{
        background: "#fff", border: "2.5px solid " + AP.ink,
        boxShadow: "5px 5px 0 " + AP.amber
      }}>
        <div style={{
          background: AP.amber, color: AP.ink,
          padding: "10px 14px",
          fontFamily: AP.fontM, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase",
          fontWeight: 700
        }}>
          ⚠ Sair do fluxo · RN-AP16 / RN-AP32
        </div>
        <div style={{ padding: "18px 18px 6px" }}>
          <h3 style={{
            margin: "0 0 8px", fontFamily: AP.fontD, fontSize: 18,
            textTransform: "uppercase", lineHeight: 1.1
          }}>
            Você tem<br /><span style={{ color: AP.amber }}>4 figurinhas</span> sem destino
          </h3>
          <p style={{ margin: 0, fontSize: 12.5, color: "rgba(10,9,7,0.72)", lineHeight: 1.45 }}>
            Elas ficam salvas e você pode continuar depois, neste ou em outro dispositivo.
          </p>
        </div>
        <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          <APBtn variant="primary" style={{ width: "100%", boxShadow: "3px 3px 0 " + AP.ink }}>
            Ficar
          </APBtn>
          <APBtn variant="ghost" size="sm" style={{ width: "100%", color: AP.mute, borderColor: AP.line }}>
            Continuar depois...
          </APBtn>
        </div>
      </div>
    </APModalShell>);

}

// ─── Desktop Layout (≥ 1024px) ───────────────────────────────────────────────

function AP1Desktop() {
  const entries = MOCK_FULL;
  return (
    <div style={{ background: AP.bg, fontFamily: AP.fontB, minHeight: "100%" }}>
      {/* Top app bar */}
      <div style={{
        background: AP.paper, borderBottom: "2px solid " + AP.ink,
        padding: "14px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <APLogo size={30} />
          <div>
            <div style={{ fontFamily: AP.fontD, fontSize: 16, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Meu Album
            </div>
            <div style={{ fontFamily: AP.fontM, fontSize: 9, color: AP.mute, letterSpacing: "0.16em", textTransform: "uppercase" }}>
              Abrir Pacotinhos
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <APTag bg={AP.cream}>Copa 2026 · Panini</APTag>
          <div style={{
            padding: "6px 12px", background: AP.ink, color: "#fff",
            fontFamily: AP.fontD, fontSize: 14, boxShadow: "2px 2px 0 " + AP.red,
            display: "flex", alignItems: "baseline", gap: 6
          }}>
            06<span style={{ fontFamily: AP.fontM, fontSize: 10, opacity: 0.7, letterSpacing: "0.1em" }}>FIGURINHAS</span>
          </div>
          <APBtn variant="ghost" size="sm">Sair do fluxo</APBtn>
        </div>
      </div>

      {/* Body: two-column */}
      <div style={{
        display: "grid", gridTemplateColumns: "440px 1fr",
        gap: 24, padding: 24, alignItems: "start"
      }}>
        {/* Left: input (sticky) */}
        <div style={{ position: "sticky", top: 24 }}>
          <div style={{ background: AP.ink, border: "2.5px solid " + AP.ink, boxShadow: "5px 5px 0 " + AP.red }}>
            <div style={{
              padding: "10px 16px", background: AP.ink, color: "#fff",
              borderBottom: "2.5px dashed " + AP.cream,
              fontFamily: AP.fontM, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase",
              display: "flex", justifyContent: "space-between"
            }}>
              <span>● Registrar figurinha</span>
              <APModeToggle mode="digitar" />
            </div>
            <div style={{ padding: "22px 22px 18px", position: "relative" }}>
              <div style={{
                position: "absolute", inset: 0, opacity: 0.05,
                backgroundImage: "repeating-linear-gradient(135deg,#fff 0 14px,transparent 14px 28px)",
                pointerEvents: "none"
              }} />
              <label style={{
                display: "block", fontFamily: AP.fontM, fontSize: 11,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.6)", marginBottom: 10
              }}>
                Número da figurinha
              </label>
              <div style={{ display: "flex", gap: 10, position: "relative", minWidth: 0 }}>
                <div style={{ flex: "1 1 0", minWidth: 0, position: "relative" }}>
                  <input
                    readOnly
                    value="POR-07"
                    style={{
                      width: "100%", padding: "16px 16px",
                      background: "#fff", color: AP.ink,
                      border: "3px solid #fff",
                      fontFamily: AP.fontD, fontSize: 22,
                      letterSpacing: "0.04em", textTransform: "uppercase",
                      outline: "none", borderRadius: 0, minWidth: 0, boxSizing: "border-box"
                    }} />
                  
                </div>
                <APBtn variant="primary" size="lg" style={{ padding: "0 18px", boxShadow: "3px 3px 0 " + AP.red, fontSize: 13, flexShrink: 0 }}>
                  Confirma
                </APBtn>
              </div>
              <div style={{
                marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center",
                fontFamily: AP.fontM, fontSize: 10, color: "rgba(255,255,255,0.45)",
                letterSpacing: "0.12em", textTransform: "uppercase"
              }}>
                <span>↩ Confirma · maiúsculas auto</span>
                <span>Catálogo · 732 fig.</span>
              </div>
            </div>
          </div>

          {/* Helper card */}
          <div style={{
            marginTop: 16, padding: 14,
            background: AP.paper, border: "2px solid " + AP.ink,
            display: "flex", gap: 14, alignItems: "center"
          }}>
            <div style={{
              width: 44, height: 44, flexShrink: 0,
              background: AP.cream, border: "2px solid " + AP.ink, boxShadow: "2px 2px 0 " + AP.ink,
              display: "flex", alignItems: "center", justifyContent: "center",
              transform: "rotate(-4deg)"
            }}>
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                <path d="M2 5h2.5l1-1.5h5L11.5 5H14a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" stroke={AP.ink} strokeWidth="1.6" strokeLinejoin="round" />
                <circle cx="8" cy="9.5" r="2.5" stroke={AP.ink} strokeWidth="1.6" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: AP.fontD, fontSize: 13, textTransform: "uppercase", lineHeight: 1.1 }}>
                Muitas pra digitar?
              </div>
              <div style={{ fontSize: 12, color: AP.mute, marginTop: 3, lineHeight: 1.4 }}>
                Use a câmera com OCR local. Mais rápido em sequência.
              </div>
            </div>
          </div>

          {/* Session info */}
          <div style={{
            marginTop: 14, padding: "10px 14px",
            background: "rgba(10,9,7,0.04)",
            border: "1.5px dashed " + AP.line,
            fontFamily: AP.fontM, fontSize: 10, color: AP.mute,
            letterSpacing: "0.12em", textTransform: "uppercase",
            display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6
          }}>
            <span>● Salvo localmente</span>
            <span>Sessão iniciada às 14:32</span>
          </div>
        </div>

        {/* Right: stack */}
        <div style={{
          background: AP.paper,
          border: "2px solid " + AP.ink
        }}>
          <div style={{
            padding: "18px 22px",
            borderBottom: "2px solid " + AP.ink,
            display: "flex", justifyContent: "space-between", alignItems: "baseline"
          }}>
            <div>
              <APEyebrow color={AP.mute}>Pilha da sessão · ordenada do mais recente</APEyebrow>
              <div style={{
                fontFamily: AP.fontD, fontSize: 26, textTransform: "uppercase",
                marginTop: 6, lineHeight: 1
              }}>
                {entries.length} figurinha{entries.length !== 1 ? "s" : ""} registrada{entries.length !== 1 ? "s" : ""}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <APTag bg="#fff">{entries.filter((e) => e.status === "PENDENTE").length} pendentes</APTag>
              <APTag bg="rgba(10,145,69,0.12)" border={AP.green} fg={AP.green}>{entries.filter((e) => e.status === "COLADA").length} coladas</APTag>
              <APTag bg="rgba(232,155,12,0.12)" border={AP.amber} fg={AP.amber}>{entries.filter((e) => e.status === "REPETIDA").length} repetida</APTag>
              <div style={{ width: 1, height: 28, background: AP.line, margin: "0 6px" }} />
              <APBtn variant="paper" size="sm" style={{ boxShadow: "2px 2px 0 " + AP.amber }}>
                ↪ Todas p/ repetidas
              </APBtn>
            </div>
          </div>

          <div style={{
            padding: 18,
            display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14
          }}>
            {entries.map((e, i) => <APCard key={i} entry={e} />)}
          </div>
        </div>
      </div>
    </div>);

}

Object.assign(window, {
  AP0Screen,
  AP1Screen,
  APCameraModal,
  APCameraModalUnrecognized,
  APPasteModal,
  APResumeModal,
  APExitAlert,
  AP1Desktop
});