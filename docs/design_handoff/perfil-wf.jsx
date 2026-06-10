// perfil-wf.jsx — Wireframe anotado · Perfil do Usuário / Configurações de Conta
// Telas: P1 (Perfil) · P2 (Confirmação alteração de e-mail) · Mobile 390px + Desktop 1280px
// Spec: spec_perfil_usuario.md

const PF = {
  bg:    "#F0EDE4", paper: "#FBF8EE", ink:   "#0A0907",
  red:   "#E5142A", green: "#0A9145", amber: "#E89B0C",
  cream: "#F0E9D6", line:  "rgba(10,9,7,0.18)", mute: "rgba(10,9,7,0.55)",
  fontD: "var(--font-display)", fontB: "var(--font-body)", fontM: "var(--font-mono)",
};

const SIDEBAR_W = 228;

function pfMeasure() {
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

const PfVP = React.createContext({ isDesktop: false });
const usePfVP = () => React.useContext(PfVP);

function PfAnn({ n, top, right, left, bottom }) {
  return (
    <div style={{
      position: "absolute", top, right, left, bottom,
      width: 22, height: 22, borderRadius: "50%",
      background: PF.red, color: "#fff", fontSize: 10, fontWeight: 700,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: PF.fontM, zIndex: 30, flexShrink: 0,
      border: `2px solid ${PF.paper}`, boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
    }}>{n}</div>
  );
}

function PfLegend({ items }) {
  return (
    <div style={{ margin: "20px 0 0", padding: 16, background: PF.paper, border: `1.5px solid ${PF.ink}` }}>
      <div style={{ fontFamily: PF.fontM, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: PF.mute, marginBottom: 10 }}>
        Anotações — regras de negócio
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {items.map(([n, code, txt]) => (
          <div key={n} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, background: PF.red, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: PF.fontM, marginTop: 1 }}>{n}</div>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: PF.fontM, fontSize: 9, letterSpacing: "0.14em", color: PF.red, textTransform: "uppercase", marginRight: 6 }}>{code}</span>
              <span style={{ fontSize: 11.5, color: PF.ink, lineHeight: 1.45, fontFamily: PF.fontB }}>{txt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────
function PfField({ label, children, optional, feedback, feedbackType = "success", style }) {
  return (
    <div style={{ position: "relative", ...style }}>
      <label style={{ display: "flex", alignItems: "baseline", gap: 8, fontFamily: PF.fontM, fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(10,9,7,0.65)", marginBottom: 8 }}>
        {label}
        {optional && <span style={{ fontFamily: PF.fontM, fontSize: 9, color: "rgba(10,9,7,0.4)" }}>(opcional)</span>}
      </label>
      {children}
      {feedback && (
        <div style={{ marginTop: 6, fontFamily: PF.fontM, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: feedbackType === "success" ? PF.green : PF.red }}>
          {feedbackType === "success" ? "✓ " : "✕ "}{feedback}
        </div>
      )}
    </div>
  );
}

function PfInput({ value, type = "text", placeholder, disabled, error }) {
  return (
    <div style={{ position: "relative" }}>
      <input readOnly value={value || ""} type={type} placeholder={placeholder}
        style={{ width: "100%", padding: "13px 14px", background: disabled ? "rgba(10,9,7,0.04)" : "#fff", color: PF.ink, border: `1.5px solid ${error ? PF.red : PF.ink}`, fontFamily: PF.fontB, fontSize: 14, outline: "none", borderRadius: 0, boxSizing: "border-box", cursor: disabled ? "not-allowed" : "text" }} />
    </div>
  );
}

function PfBtn({ children, variant = "primary", size = "md", style: s, disabled }) {
  const vs = {
    primary: { bg: PF.red, fg: "#fff", border: PF.ink, shadow: `3px 3px 0 ${PF.ink}` },
    secondary: { bg: "transparent", fg: PF.ink, border: PF.ink, shadow: "none" },
    danger: { bg: "#fff", fg: PF.red, border: PF.red, shadow: `2px 2px 0 ${PF.red}` },
    ghost: { bg: "transparent", fg: PF.mute, border: PF.line, shadow: "none" },
  }[variant];
  return (
    <button style={{ padding: size === "sm" ? "8px 14px" : "13px 20px", background: vs.bg, color: vs.fg, border: `1.5px solid ${vs.border}`, boxShadow: vs.shadow, fontFamily: PF.fontD, fontSize: size === "sm" ? 11 : 13, letterSpacing: "0.04em", textTransform: "uppercase", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1, borderRadius: 0, ...s }}>
      {children}
    </button>
  );
}

function PfSaveRow({ label, disabled }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
      <PfBtn variant="primary" size="sm" disabled={disabled}>{label || "Salvar"}</PfBtn>
    </div>
  );
}

function PfSectionDivider() {
  return <div style={{ height: 1, background: PF.line, margin: "4px 0" }} />;
}

// ── Password checklist ────────────────────────────────────────────────────
function PfChecklist({ items }) {
  return (
    <div style={{ marginTop: 8, padding: "10px 12px", background: PF.cream, border: `1px solid ${PF.line}`, display: "flex", flexDirection: "column", gap: 5 }}>
      {items.map(([ok, label], i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: ok ? PF.green : "transparent", border: `1.5px solid ${ok ? PF.green : PF.mute}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {ok && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4.2 3 6.5 7 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </div>
          <span style={{ fontFamily: PF.fontM, fontSize: 10, color: ok ? PF.ink : PF.mute, letterSpacing: "0.08em" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────
function PfSidebar() {
  const NAV = [
    { id: "home",    icon: "⊞", label: "Início"      },
    { id: "albums",  icon: "◻", label: "Meus Álbuns"  },
    { id: "profile", icon: "○", label: "Perfil",  active: true },
  ];
  return (
    <aside style={{ width: SIDEBAR_W, flexShrink: 0, position: "absolute", top: 0, left: 0, bottom: 0, background: PF.paper, borderRight: `2px solid ${PF.ink}`, display: "flex", flexDirection: "column", zIndex: 5 }}>
      <div style={{ padding: "20px 20px 18px", borderBottom: `2px solid ${PF.ink}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: PF.red, color: "#fff", border: `2px solid ${PF.ink}`, boxShadow: `2px 2px 0 ${PF.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: PF.fontD, fontSize: 12, transform: "rotate(-4deg)", flexShrink: 0 }}>MA</div>
          <span style={{ fontFamily: PF.fontD, fontSize: 14, letterSpacing: "0.04em", textTransform: "uppercase" }}>Meu Album</span>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "10px 0" }}>
        {NAV.map(item => (
          <div key={item.id} style={{ padding: "11px 20px", display: "flex", alignItems: "center", gap: 12, background: item.active ? PF.bg : "transparent", borderLeft: item.active ? `3px solid ${PF.red}` : "3px solid transparent" }}>
            <span style={{ fontFamily: PF.fontM, fontSize: 15, width: 18, textAlign: "center", color: item.active ? PF.red : PF.mute }}>{item.icon}</span>
            <span style={{ fontFamily: PF.fontB, fontSize: 13, fontWeight: 600, color: item.active ? PF.red : PF.ink }}>{item.label}</span>
          </div>
        ))}
      </nav>
      <div style={{ padding: "14px 16px", borderTop: `2px solid ${PF.ink}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, background: PF.ink, color: "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: PF.fontD, fontSize: 13 }}>J</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: PF.fontD, fontSize: 12, textTransform: "uppercase" }}>João S.</div>
          <div style={{ fontFamily: PF.fontM, fontSize: 9, color: PF.mute, letterSpacing: "0.12em" }}>#XB3K29</div>
        </div>
      </div>
    </aside>
  );
}

// ── P1 Sections ───────────────────────────────────────────────────────────
function SecIdentificador({ withAnn }) {
  return (
    <div style={{ background: PF.paper, border: `1.5px solid ${PF.ink}`, padding: "16px 18px", position: "relative" }}>
      {withAnn && <PfAnn n="1" top={-8} right={-8} />}
      <div style={{ fontFamily: PF.fontM, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: PF.mute, marginBottom: 10 }}>Seu identificador</div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ fontFamily: PF.fontM, fontSize: 36, letterSpacing: "0.12em", color: PF.ink, background: PF.bg, padding: "8px 16px", border: `2px solid ${PF.ink}`, boxShadow: `3px 3px 0 ${PF.red}` }}>
          XB3K29
        </div>
        <div>
          <PfBtn variant="secondary" size="sm">Copiar</PfBtn>
          <div style={{ fontFamily: PF.fontB, fontSize: 11, color: PF.mute, marginTop: 6, maxWidth: 220, lineHeight: 1.4 }}>Este código é público e identifica você na plataforma.</div>
        </div>
      </div>
    </div>
  );
}

function SecNome({ withAnn }) {
  return (
    <div style={{ position: "relative" }}>
      {withAnn && <PfAnn n="2" top={-8} right={-8} />}
      <PfField label="Nome completo">
        <PfInput value="João da Silva" />
      </PfField>
      <PfSaveRow disabled />
    </div>
  );
}

function SecEmail({ emailPendente, withAnn }) {
  const { isDesktop } = usePfVP();
  return (
    <div style={{ position: "relative" }}>
      {withAnn && <PfAnn n="3" top={-8} right={-8} />}
      <PfField label="Email">
        <PfInput value="joao@exemplo.com.br" />
      </PfField>
      <PfSaveRow label="Salvar" />

      {emailPendente && (
        <div style={{ marginTop: 12, padding: "12px 14px", background: "rgba(232,155,12,0.08)", border: `1.5px solid ${PF.amber}`, position: "relative" }}>
          {withAnn && <PfAnn n="4" top={-8} right={-8} />}
          <div style={{ fontFamily: PF.fontM, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: PF.amber, marginBottom: 6 }}>⚠ Alteração pendente</div>
          <div style={{ fontFamily: PF.fontB, fontSize: 12.5, color: PF.ink, marginBottom: 8 }}>
            Confirmação aguardada em <strong>n***@novodominio.com</strong>
          </div>
          <div style={{ fontFamily: PF.fontM, fontSize: 10, color: PF.mute, marginBottom: 10 }}>O link expira em 2 horas a partir do envio.</div>
          <div style={{ display: "flex", gap: 8, flexWrap: isDesktop ? "nowrap" : "wrap" }}>
            <PfBtn variant="secondary" size="sm" style={{ flex: isDesktop ? "1 1 0" : undefined }}>Reenviar em 03:42</PfBtn>
            <PfBtn variant="ghost" size="sm" style={{ flex: isDesktop ? "1 1 0" : undefined }}>Cancelar alteração</PfBtn>
          </div>
        </div>
      )}
    </div>
  );
}

function SecSenha({ withAnn }) {
  const checklist = [
    [true,  "Mínimo de 8 caracteres"],
    [true,  "Ao menos uma letra maiúscula"],
    [true,  "Ao menos uma letra minúscula"],
    [false, "Ao menos um número"],
    [false, "Ao menos um caractere especial"],
    [false, "Senhas idênticas"],
  ];
  return (
    <div style={{ position: "relative" }}>
      {withAnn && <PfAnn n="5" top={-8} right={-8} />}
      <PfField label="Senha atual">
        <PfInput type="password" value="••••••••" />
      </PfField>
      <div style={{ marginTop: 6, marginBottom: 14 }}>
        <a style={{ fontFamily: PF.fontM, fontSize: 11, color: PF.red, cursor: "pointer", letterSpacing: "0.08em" }}>Esqueci minha senha →</a>
      </div>
      <PfField label="Nova senha">
        <PfInput type="password" value="SenhaEx" />
      </PfField>
      <div style={{ marginTop: 12 }}>
        <PfField label="Confirmar nova senha">
          <PfInput type="password" value="" placeholder="Repita a nova senha" />
        </PfField>
      </div>
      <PfChecklist items={checklist} />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
        <PfBtn variant="primary" disabled>Alterar senha</PfBtn>
      </div>
    </div>
  );
}

function SecExcluirConta({ expanded, withAnn }) {
  return (
    <div style={{ position: "relative" }}>
      <div style={{ height: 2, background: PF.line, margin: "4px 0 16px" }} />
      {withAnn && <PfAnn n="6" top={-8} right={-8} />}
      <PfBtn variant="danger" style={{ width: "100%" }}>Excluir minha conta</PfBtn>
      {expanded && (
        <div style={{ marginTop: 12, padding: "14px", background: "rgba(229,20,42,0.05)", border: `1.5px solid ${PF.red}` }}>
          <p style={{ margin: "0 0 12px", fontFamily: PF.fontB, fontSize: 12.5, color: PF.ink, lineHeight: 1.45 }}>
            Esta ação é permanente e não pode ser desfeita. Todos os seus dados serão removidos: álbuns, figurinhas, estoque e histórico. Para confirmar, digite seu identificador abaixo.
          </p>
          <PfField label="Identificador">
            <PfInput value="XB3K29" placeholder="Digite seu identificador" />
          </PfField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
            <PfBtn variant="secondary">Cancelar</PfBtn>
            <PfBtn variant="danger">Confirmar exclusão</PfBtn>
          </div>
        </div>
      )}
    </div>
  );
}

// ── P1 Mobile ─────────────────────────────────────────────────────────────
function P1Mobile({ emailPendente = false, deleteExpanded = false, showAnnotations = true }) {
  const [ref] = pfMeasure();
  const ANN = showAnnotations;

  const ANN_P1 = [
    [1, "RN-P02 / RN-P03", "Identificador: somente leitura, imutável · botão 'Copiar' grava na área de transferência e exibe feedback visual temporário 'Copiado!'"],
    [2, "RN-P04 / RN-P05", "Campo Nome: botão 'Salvar' habilitado somente se valor diferir do atual e não estiver vazio · máx. 100 chars"],
    [3, "RN-P06 / RN-P12", "Campo Email: salvar envia confirmação ao novo endereço + define status = EMAIL_PENDENTE · cooldown 5 min (ultimo_envio_email_pendente_em)"],
    [4, "RN-P08 / RN-P14", "Aviso de pendência EMAIL_PENDENTE: exibe endereço mascarado, prazo de expiração (2h), botão Reenviar (com countdown) e opção 'Cancelar alteração'"],
    [5, "RN-P18 / RN-P21", "Troca de senha: requer senha atual + nova + confirmação · checklist em tempo real · botão 'Alterar' desabilitado enquanto qualquer item não atendido"],
    [6, "RN-P24 / RN-P25", "Exclusão de conta: operação irreversível · botão de confirmação habilitado somente após digitar o identificador exato (case-insensitive)"],
    [7, "RN-P22 / RN-P22a", "Troca de senha bem-sucedida: token_versao +1 invalida outras sessões; sessão corrente permanece ativa com novo JWT"],
    [8, "RN-P26 / RN-P27", "Exclusão: hard delete em cascata de Usuário, EstoqueFigurinha, FigurinhaColada, Álbum, Pilha da Sessão, TokenOperacao, TokenConfirmacaoCadastro"],
    [9, "RN-P01", "Tela acessível para status ATIVO, EMAIL_PENDENTE ou PENDENTE (PENDENTE acessa via link 'Corrigir email' na Tela 2 do cadastro)"],
  ];

  return (
    <PfVP.Provider value={{ isDesktop: false }}>
      <div ref={ref} style={{ background: PF.bg, fontFamily: PF.fontB, color: PF.ink, minHeight: "100%" }}>
        {/* Header */}
        <div style={{ padding: "0 16px", height: 56, background: PF.paper, borderBottom: `2px solid ${PF.ink}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, background: PF.red, color: "#fff", border: `2px solid ${PF.ink}`, boxShadow: `2px 2px 0 ${PF.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: PF.fontD, fontSize: 11, transform: "rotate(-4deg)" }}>MA</div>
            <span style={{ fontFamily: PF.fontD, fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase" }}>Meu Album</span>
          </div>
          <button style={{ padding: "6px 14px", background: "transparent", border: `1.5px solid ${PF.line}`, fontFamily: PF.fontM, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: PF.mute, cursor: "pointer" }}>Logout</button>
        </div>

        <div style={{ padding: "20px 16px 32px" }}>
          <h1 style={{ margin: "0 0 20px", fontFamily: PF.fontD, fontSize: 36, textTransform: "uppercase", lineHeight: 0.92, letterSpacing: "0.01em" }}>Minha<br />conta</h1>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <SecIdentificador withAnn={ANN} />
            <PfSectionDivider />
            <SecNome withAnn={ANN} />
            <PfSectionDivider />
            <SecEmail emailPendente={emailPendente} withAnn={ANN} />
            <PfSectionDivider />
            <SecSenha withAnn={ANN} />
            <SecExcluirConta expanded={deleteExpanded} withAnn={ANN} />
          </div>

          {ANN && <PfLegend items={ANN_P1} />}
        </div>
      </div>
    </PfVP.Provider>
  );
}

// ── P1 Desktop ────────────────────────────────────────────────────────────
function P1Desktop({ emailPendente = false, showAnnotations = true }) {
  const [ref] = pfMeasure();
  const ANN = showAnnotations;

  return (
    <PfVP.Provider value={{ isDesktop: true }}>
      <div ref={ref} style={{ background: PF.bg, fontFamily: PF.fontB, color: PF.ink, minHeight: "100%", position: "relative", paddingLeft: SIDEBAR_W }}>
        <PfSidebar />
        {/* Top bar */}
        <div style={{ height: 60, padding: "0 32px", background: PF.paper, borderBottom: `2px solid ${PF.ink}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ margin: 0, fontFamily: PF.fontD, fontSize: 18, textTransform: "uppercase", letterSpacing: "0.04em" }}>Minha conta</h1>
          <div style={{ fontFamily: PF.fontM, fontSize: 10, letterSpacing: "0.14em", color: PF.mute, textTransform: "uppercase" }}>16 mai 2026</div>
        </div>

        <div style={{ padding: "32px 40px 40px", maxWidth: 680 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <SecIdentificador withAnn={ANN} />
            <PfSectionDivider />

            {emailPendente ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ width: "calc(50% - 16px)" }}>
                  <SecNome withAnn={ANN} />
                </div>
                <SecEmail emailPendente={emailPendente} withAnn={ANN} />
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                <SecNome withAnn={ANN} />
                <SecEmail emailPendente={emailPendente} withAnn={ANN} />
              </div>
            )}
            <PfSectionDivider />
            <SecSenha withAnn={ANN} />
            <SecExcluirConta expanded={false} withAnn={ANN} />
          </div>
        </div>
      </div>
    </PfVP.Provider>
  );
}

// ── P2 — Confirmação de Alteração de Email ────────────────────────────────
function P2Screen({ state = "success", isDesktop = false }) {
  const success = state === "success";
  return (
    <div style={{ background: PF.bg, fontFamily: PF.fontB, minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 480, background: PF.paper, border: `2.5px solid ${PF.ink}`, boxShadow: `6px 6px 0 ${success ? PF.green : PF.red}`, padding: "32px 28px" }}>
        {/* Icon */}
        <div style={{ width: 56, height: 56, background: success ? PF.green : PF.red, color: "#fff", border: `2px solid ${PF.ink}`, boxShadow: `3px 3px 0 ${PF.ink}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, fontFamily: PF.fontD, fontSize: 26 }}>
          {success ? "✓" : "!"}
        </div>
        <div style={{ fontFamily: PF.fontM, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: success ? PF.green : PF.red, marginBottom: 8 }}>
          {success ? "Alteração confirmada" : "Link inválido ou expirado"}
        </div>
        <h2 style={{ margin: "0 0 12px", fontFamily: PF.fontD, fontSize: 28, textTransform: "uppercase", lineHeight: 0.95 }}>
          {success ? "Email\natualizado" : "Link inválido\nou expirado"}
        </h2>
        <p style={{ margin: "0 0 24px", fontFamily: PF.fontB, fontSize: 13.5, color: "rgba(10,9,7,0.72)", lineHeight: 1.5 }}>
          {success
            ? "Seu novo email foi confirmado e já está ativo na sua conta."
            : "Este link de confirmação não é mais válido. Links expiram em 2 horas e só podem ser usados uma vez. Acesse seu perfil para solicitar um novo envio."}
        </p>
        {/* Annotations */}
        <div style={{ padding: "10px 12px", background: PF.bg, border: `1px dashed ${PF.line}`, fontFamily: PF.fontM, fontSize: 9, color: PF.mute, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
          {success ? "RN-P15: email ← email_novo; email_pendente = null; ultimo_envio_email_pendente_em = null; status = ATIVO; token.usado_em = agora"
                   : "RN-P11: token ALTERACAO_EMAIL expira em 2h · RN-P13: usuário deve ir ao perfil para nova solicitação"}
        </div>
        <button style={{ width: "100%", padding: "14px 0", background: success ? PF.ink : PF.red, color: "#fff", border: `2px solid ${PF.ink}`, boxShadow: `3px 3px 0 ${success ? PF.red : PF.ink}`, fontFamily: PF.fontD, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer" }}>
          {success ? "Acessar a aplicação →" : "Ir para o perfil →"}
        </button>
      </div>
    </div>
  );
}

const ANN_P2 = [
  [1, "RN-P15", "Sucesso: email ← email_novo; email_pendente = null; ultimo_envio_email_pendente_em = null; status = ATIVO; token.usado_em = agora"],
  [2, "RN-P11 / RN-P13", "Erro: token ALTERACAO_EMAIL expirado (2h) ou já usado · usuário deve retornar ao perfil para solicitar novo envio"],
  [3, "—",     "Tela acessada exclusivamente via link enviado ao novo endereço de email; não é navegável pelo app diretamente"],
];

function P2Mobile() {
  const [ref] = pfMeasure();
  return (
    <PfVP.Provider value={{ isDesktop: false }}>
      <div ref={ref} style={{ background: PF.bg, minHeight: "100%" }}>
        <P2Screen state="success" />
        <div style={{ padding: "0 16px 32px" }}><PfLegend items={ANN_P2} /></div>
      </div>
    </PfVP.Provider>
  );
}

function P2MobileError() {
  const [ref] = pfMeasure();
  return (
    <PfVP.Provider value={{ isDesktop: false }}>
      <div ref={ref} style={{ background: PF.bg, minHeight: "100%" }}>
        <P2Screen state="error" />
      </div>
    </PfVP.Provider>
  );
}

Object.assign(window, { P1Mobile, P1Desktop, P2Mobile, P2MobileError });
