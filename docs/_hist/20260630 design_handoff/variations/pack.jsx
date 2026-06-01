// variations/pack.jsx — Variation C: "Pacote"
// Warm cream background, tilted "figurinha" cards, ticket-stub login,
// scoreboard stats, comic-panel steps. Playful, collector-y.

function PackLogo({ color = "var(--c-ink)" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, color }}>
      <div style={{
        width: 30, height: 30,
        background: "var(--c-red)",
        border: "2.5px solid var(--c-ink)",
        boxShadow: "2px 2px 0 var(--c-ink)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontFamily: "var(--font-display)", fontSize: 14,
        transform: "rotate(-4deg)",
      }}>MA</div>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        Meu Album
      </span>
    </div>
  );
}

function PackNav() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "20px 56px",
      background: "var(--c-cream)",
      borderBottom: "2px solid var(--c-ink)",
    }}>
      <PackLogo />
      <div style={{ display: "flex", alignItems: "center", gap: 28, fontSize: 13, fontWeight: 600 }}>
        <a style={{ color: "var(--c-ink)", textDecoration: "none" }}>Recursos</a>
        <a style={{ color: "var(--c-ink)", textDecoration: "none" }}>Trocas</a>
        <a style={{ color: "var(--c-ink)", textDecoration: "none" }}>Estatísticas</a>
        <a style={{ color: "var(--c-ink)", textDecoration: "none" }}>Suporte</a>
      </div>
    </div>
  );
}

// Repeating dotted/grid background for warm paper feel
const PACK_PAPER_BG = `
  radial-gradient(circle at 1px 1px, rgba(20,17,13,0.07) 1px, transparent 0)
`;

// A single fake "figurinha" card
function StickerCard({ color, label, num, country, rotate = 0, w = 140, h = 196 }) {
  return (
    <div style={{
      width: w, height: h,
      background: color,
      border: "3px solid var(--c-ink)",
      boxShadow: "5px 5px 0 var(--c-ink)",
      transform: `rotate(${rotate}deg)`,
      display: "flex", flexDirection: "column",
      padding: 10,
      position: "relative",
      flexShrink: 0,
    }}>
      <div style={{
        flex: 1,
        background: "rgba(0,0,0,0.18)",
        backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0 8px, transparent 8px 16px)",
        border: "1.5px solid rgba(0,0,0,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "rgba(255,255,255,0.85)",
        fontFamily: "var(--font-display)", fontSize: 32,
      }}>
        {country}
      </div>
      <div style={{
        marginTop: 8,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontFamily: "var(--font-display)", color: "#fff",
      }}>
        <div style={{ fontSize: 14, letterSpacing: "0.04em" }}>{label}</div>
        <div style={{
          fontSize: 14,
          background: "rgba(0,0,0,0.3)", padding: "2px 8px",
          borderRadius: 2,
        }}>{num}</div>
      </div>
    </div>
  );
}

function PackHero() {
  return (
    <div style={{
      padding: "72px 56px 96px",
      position: "relative",
      background: "var(--c-cream)",
      backgroundImage: PACK_PAPER_BG,
      backgroundSize: "16px 16px",
      display: "grid",
      gridTemplateColumns: "1.05fr 1fr",
      gap: 48,
      alignItems: "center",
      overflow: "hidden",
    }}>
      {/* LEFT */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 12px",
          background: "var(--c-ink)", color: "#fff",
          fontFamily: "var(--font-mono)", fontSize: 11,
          letterSpacing: "0.16em", textTransform: "uppercase",
          marginBottom: 28,
          transform: "rotate(-1.5deg)",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-red)" }} />
          Mundial 2026 · Beta aberto
        </div>

        <h1 className="ma-display" style={{
          fontSize: 100, margin: 0, color: "var(--c-ink)",
          letterSpacing: "-0.02em", lineHeight: 0.92,
        }}>
          Abre.<br />
          <span style={{ color: "var(--c-red)" }}>Marca.</span><br />
          <span style={{ color: "var(--c-green)" }}>Cole.</span>
        </h1>

        <p style={{
          marginTop: 28, marginBottom: 36,
          fontSize: 17, lineHeight: 1.55, maxWidth: 460,
          color: "rgba(20,17,13,0.88)",
        }}>
          Cada pacote é um pedaço de história. O Meu Album guarda a sua —
          marca o que você abriu, mostra o que falta e conecta com quem
          tem a figurinha que você precisa.
        </p>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <a className="ma-btn ma-btn-primary" style={{ boxShadow: "4px 4px 0 var(--c-ink)" }}>
            Criar conta grátis
          </a>
          <a style={{
            fontFamily: "var(--font-mono)", fontSize: 12,
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: "var(--c-ink)", textDecoration: "underline",
            textUnderlineOffset: 4,
          }}>
            ou ver demonstração ↗
          </a>
        </div>
      </div>

      {/* RIGHT — login as ticket stub */}
      <PackLogin />

      {/* Floating sticker cards */}
      <div style={{ position: "absolute", left: -48, bottom: -40, display: "flex", gap: 14, zIndex: 1 }}>
        <StickerCard color="var(--c-blue)"  country="USA" label="ANFITRIÃO" num="01" rotate={-12} w={130} h={180} />
        <StickerCard color="var(--c-green)" country="MEX" label="ANFITRIÃO" num="02" rotate={6}   w={130} h={180} />
        <StickerCard color="var(--c-red)"   country="CAN" label="ANFITRIÃO" num="03" rotate={-4}  w={130} h={180} />
      </div>
    </div>
  );
}

function PackLogin() {
  return (
    <div style={{ position: "relative", zIndex: 2, transform: "rotate(1.5deg)" }}>
      <div style={{
        background: "#fff",
        border: "2.5px solid var(--c-ink)",
        boxShadow: "8px 8px 0 var(--c-ink)",
        position: "relative",
      }}>
        {/* Ticket stub header */}
        <div style={{
          padding: "14px 24px",
          background: "var(--c-ink)", color: "#fff",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontFamily: "var(--font-mono)", fontSize: 11,
          letterSpacing: "0.16em", textTransform: "uppercase",
        }}>
          <span>● ABRIR ÁLBUM</span>
          <span style={{ color: "rgba(255,255,255,0.5)" }}>N° 0001</span>
        </div>

        {/* Perforation */}
        <div style={{
          height: 14,
          background: "var(--c-cream)",
          position: "relative",
          borderBottom: "2.5px dashed var(--c-ink)",
        }}>
          <div style={{ position: "absolute", left: -10, top: -4, width: 20, height: 20, borderRadius: "50%", background: "var(--c-cream)", border: "2.5px solid var(--c-ink)" }} />
          <div style={{ position: "absolute", right: -10, top: -4, width: 20, height: 20, borderRadius: "50%", background: "var(--c-cream)", border: "2.5px solid var(--c-ink)" }} />
        </div>

        <div style={{ padding: "32px 28px" }}>
          <h3 className="ma-display" style={{ fontSize: 30, margin: "0 0 22px", color: "var(--c-ink)" }}>
            Entrar
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="ma-label">Email</label>
              <input className="ma-input" type="email" placeholder="voce@email.com.br" />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <label className="ma-label">Senha</label>
                <a style={{ fontSize: 11, color: "var(--c-red)", fontWeight: 600, textDecoration: "none" }}>
                  Esqueci
                </a>
              </div>
              <input className="ma-input" type="password" placeholder="sua senha" />
            </div>
            <button className="ma-btn ma-btn-primary" style={{
              width: "100%", padding: "16px",
              boxShadow: "3px 3px 0 var(--c-ink)",
              marginTop: 6,
            }}>
              Entrar →
            </button>
            <div style={{
              textAlign: "center", fontSize: 12,
              color: "var(--c-ink)", marginTop: 6, fontWeight: 500,
            }}>
              Sem conta? <a style={{ color: "var(--c-green)", fontWeight: 700 }}>Cadastrar grátis</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PackCountdown() {
  const items = [
    { n: "37", l: "DIAS" },
    { n: "14", l: "HORAS" },
    { n: "52", l: "MIN" },
    { n: "08", l: "SEG" },
  ];
  return (
    <div style={{
      padding: "56px 56px",
      background: "var(--c-ink)",
      color: "#fff",
      borderTop: "4px solid var(--c-red)",
      borderBottom: "4px solid var(--c-green)",
    }}>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr auto", gap: 48, alignItems: "center",
      }}>
        <div>
          <div className="ma-eyebrow" style={{ color: "var(--c-red)", marginBottom: 12 }}>
            ◉ 11 jun · Cidade do México
          </div>
          <h2 className="ma-display" style={{ fontSize: 48, margin: 0 }}>
            Faltam pra<br />o pontapé inicial.
          </h2>
        </div>
        <div style={{
          display: "flex", gap: 10, alignItems: "stretch",
          background: "var(--c-cream)", padding: 12,
          border: "2px solid #fff",
        }}>
          {items.map((it, i) => (
            <div key={i} style={{
              minWidth: 110, textAlign: "center",
              padding: "14px 12px",
              background: "var(--c-ink)", color: "#fff",
              border: "2px solid var(--c-cream)",
            }}>
              <div className="ma-display" style={{
                fontSize: 56, lineHeight: 1, color: i % 2 === 0 ? "var(--c-red)" : "var(--c-green)",
                fontVariantNumeric: "tabular-nums",
              }}>
                {it.n}
              </div>
              <div style={{
                fontSize: 10, letterSpacing: "0.18em", marginTop: 8,
                fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.6)",
              }}>
                {it.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PackStats() {
  const stats = [
    { n: "732", l: "figurinhas no álbum oficial", c: "var(--c-red)" },
    { n: "48",  l: "seleções classificadas",      c: "var(--c-green)" },
    { n: "16",  l: "cidades-sede",                c: "var(--c-blue)" },
    { n: "3",   l: "países anfitriões",           c: "var(--c-ink)" },
  ];
  return (
    <div style={{
      padding: "96px 56px",
      background: "var(--c-cream)",
      backgroundImage: PACK_PAPER_BG,
      backgroundSize: "16px 16px",
    }}>
      <div style={{ marginBottom: 56, maxWidth: 720 }}>
        <div className="ma-eyebrow" style={{ color: "var(--c-red)", marginBottom: 14 }}>
          <span style={{ width: 28, height: 1.5, background: "var(--c-red)" }} />
          02 · Placar da coleção
        </div>
        <h2 className="ma-display" style={{ fontSize: 56, margin: 0, color: "var(--c-ink)", letterSpacing: "-0.02em" }}>
          O maior álbum<br />da história do Mundial.
        </h2>
      </div>

      {/* Scoreboard */}
      <div style={{
        background: "var(--c-ink)",
        border: "3px solid var(--c-ink)",
        boxShadow: "8px 8px 0 var(--c-red)",
        padding: 4,
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4,
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: "var(--c-cream)",
            padding: "36px 28px 28px",
            position: "relative",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            minHeight: 240,
          }}>
            <div style={{
              position: "absolute", top: 12, right: 16,
              fontFamily: "var(--font-mono)", fontSize: 11,
              letterSpacing: "0.18em", color: "rgba(20,17,13,0.4)",
            }}>
              0{i + 1}
            </div>
            <div className="ma-display" style={{
              fontSize: 120, lineHeight: 0.9, color: s.c,
              fontVariantNumeric: "tabular-nums", letterSpacing: "-0.03em",
            }}>
              {s.n}
            </div>
            <div style={{
              marginTop: 16, fontSize: 13,
              color: "var(--c-ink)", lineHeight: 1.4,
              textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600,
            }}>
              {s.l}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PackSteps() {
  const steps = [
    { n: "01", t: "Crie sua conta", d: "30 segundos. Sem cartão. Só nome, email e bora.", c: "var(--c-red)", icon: "+" },
    { n: "02", t: "Marque cada figurinha", d: "Toque na que você abriu. Repetidas viram lista de troca na hora.", c: "var(--c-green)", icon: "✓" },
    { n: "03", t: "Troque com a galera", d: "Encontre colecionadores próximos e complete o álbum em conjunto.", c: "var(--c-blue)", icon: "↔" },
  ];
  return (
    <div style={{
      padding: "96px 56px",
      background: "var(--c-paper)",
    }}>
      <div style={{ marginBottom: 48, display: "flex", justifyContent: "space-between", alignItems: "end", flexWrap: "wrap", gap: 24 }}>
        <div>
          <div className="ma-eyebrow" style={{ color: "var(--c-red)", marginBottom: 14 }}>
            <span style={{ width: 28, height: 1.5, background: "var(--c-red)" }} />
            03 · Como funciona
          </div>
          <h2 className="ma-display" style={{ fontSize: 56, margin: 0, color: "var(--c-ink)", letterSpacing: "-0.02em" }}>
            Três passos,<br />um álbum cheio.
          </h2>
        </div>
        <a className="ma-btn ma-btn-primary" style={{ boxShadow: "4px 4px 0 var(--c-ink)" }}>
          Começar agora →
        </a>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {steps.map((s, i) => (
          <div key={i} style={{
            background: "#fff",
            border: "2.5px solid var(--c-ink)",
            boxShadow: `6px 6px 0 ${s.c}`,
            padding: "32px 28px",
            transform: `rotate(${i === 1 ? -1 : i === 2 ? 0.8 : -0.4}deg)`,
            position: "relative",
          }}>
            <div style={{
              position: "absolute", top: -18, left: 24,
              width: 44, height: 44,
              background: s.c, color: "#fff",
              border: "2.5px solid var(--c-ink)",
              boxShadow: "2px 2px 0 var(--c-ink)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display)", fontSize: 22,
            }}>
              {s.icon}
            </div>
            <div className="ma-display" style={{
              marginTop: 18,
              fontSize: 56, color: s.c,
              fontVariantNumeric: "tabular-nums", lineHeight: 1,
            }}>
              {s.n}
            </div>
            <h3 className="ma-display" style={{ fontSize: 24, margin: "20px 0 12px", color: "var(--c-ink)" }}>
              {s.t}
            </h3>
            <p style={{ fontSize: 14, color: "rgba(20,17,13,0.88)", lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
              {s.d}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PackFooter() {
  return (
    <div style={{
      padding: "32px 56px",
      background: "var(--c-ink)",
      color: "rgba(255,255,255,0.55)",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      fontSize: 12,
      borderTop: "6px solid var(--c-red)",
    }}>
      <PackLogo color="rgba(255,255,255,0.85)" />
      <div style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
        Não-oficial · Feito por colecionadores · 2026
      </div>
    </div>
  );
}

function VariationPack() {
  return (
    <div className="ma-root" style={{ background: "var(--c-cream)", color: "var(--c-ink)", width: "100%", height: "100%" }}>
      <PackNav />
      <PackHero />
      <PackCountdown />
      <PackStats />
      <PackSteps />
      <PackFooter />
    </div>
  );
}

window.VariationPack = VariationPack;
