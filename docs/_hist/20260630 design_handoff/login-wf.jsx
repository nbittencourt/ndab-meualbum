// login-wf.jsx — Wireframe anotado · Login + Recuperação de Senha + Cadastro de Usuários
// Telas: L1 Login · L2 Esqueci senha · L3 Redefinição · L4 Link inválido
//        Tela 1 Cadastro · Tela 2 Confirmação de Email · Tela 3 Sucesso
// Specs: spec_login_recuperacao_senha.md · spec_cadastro_usuarios.md

const LG = {
  bg:    "#F0EDE4", paper: "#FBF8EE", ink:   "#0A0907",
  red:   "#E5142A", green: "#0A9145", cream: "#F0E9D6",
  line:  "rgba(10,9,7,0.18)", mute: "rgba(10,9,7,0.55)",
  fontD: "var(--font-display)", fontB: "var(--font-body)", fontM: "var(--font-mono)",
};

// ── helpers ───────────────────────────────────────────────────────────────
function lgMeasure() {
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

function LgAnn({ n, top, right, left, bottom }) {
  return (
    <div style={{
      position: "absolute", top, right, left, bottom,
      width: 22, height: 22, borderRadius: "50%",
      background: LG.red, color: "#fff", fontSize: 10, fontWeight: 700,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: LG.fontM, zIndex: 30, flexShrink: 0,
      border: `2px solid ${LG.paper}`, boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
    }}>{n}</div>
  );
}

function LgLegend({ items }) {
  return (
    <div style={{ margin: "20px 0 0", padding: 14, background: LG.paper, border: `1.5px solid ${LG.ink}` }}>
      <div style={{ fontFamily: LG.fontM, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: LG.mute, marginBottom: 10 }}>
        Anotações — regras de negócio
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {items.map(([n, code, txt]) => (
          <div key={n} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, background: LG.red, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: LG.fontM, marginTop: 1 }}>{n}</div>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: LG.fontM, fontSize: 9, letterSpacing: "0.14em", color: LG.red, textTransform: "uppercase", marginRight: 6 }}>{code}</span>
              <span style={{ fontSize: 11.5, color: LG.ink, lineHeight: 1.45, fontFamily: LG.fontB }}>{txt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Shared atoms ──────────────────────────────────────────────────────────
function LgLogo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
      <div style={{ width: 36, height: 36, background: LG.red, color: "#fff", border: `2.5px solid ${LG.ink}`, boxShadow: `3px 3px 0 ${LG.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: LG.fontD, fontSize: 16, transform: "rotate(-4deg)", marginBottom: 10 }}>MA</div>
      <span style={{ fontFamily: LG.fontD, fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase", color: LG.ink }}>Meu Album</span>
    </div>
  );
}

function LgCard({ children, shadow = LG.ink }) {
  return (
    <div style={{ background: LG.paper, border: `2.5px solid ${LG.ink}`, boxShadow: `6px 6px 0 ${shadow}`, padding: "28px 24px" }}>
      {children}
    </div>
  );
}

function LgField({ label, type = "text", value, placeholder, error, hint, rightLabel }) {
  return (
    <div style={{ marginBottom: 14, position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <label style={{ fontFamily: LG.fontM, fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(10,9,7,0.65)" }}>{label}</label>
        {rightLabel && <a style={{ fontFamily: LG.fontM, fontSize: 10, color: LG.red, cursor: "pointer", letterSpacing: "0.08em" }}>{rightLabel}</a>}
      </div>
      <div style={{ position: "relative" }}>
        <input readOnly value={value || ""} type={type} placeholder={placeholder}
          style={{ width: "100%", padding: "13px 14px", background: "#fff", color: LG.ink, border: `1.5px solid ${error ? LG.red : LG.ink}`, fontFamily: LG.fontB, fontSize: 14, outline: "none", borderRadius: 0, boxSizing: "border-box" }} />
        {type === "password" && (
          <button style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontFamily: LG.fontM, fontSize: 9, color: LG.mute, letterSpacing: "0.1em", textTransform: "uppercase" }}>Mostrar</button>
        )}
      </div>
      {error && <div style={{ marginTop: 5, fontFamily: LG.fontM, fontSize: 10, color: LG.red, letterSpacing: "0.08em" }}>{error}</div>}
      {hint && <div style={{ marginTop: 5, fontFamily: LG.fontM, fontSize: 10, color: LG.mute, letterSpacing: "0.08em", lineHeight: 1.4 }}>{hint}</div>}
    </div>
  );
}

function LgPrimaryBtn({ children, disabled }) {
  return (
    <button style={{ width: "100%", padding: "15px 0", background: LG.red, color: "#fff", border: `2px solid ${LG.ink}`, boxShadow: `3px 3px 0 ${LG.ink}`, fontFamily: LG.fontD, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.04em", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, borderRadius: 0 }}>
      {children}
    </button>
  );
}

function LgChecklist({ items }) {
  return (
    <div style={{ marginTop: 8, padding: "10px 12px", background: LG.cream, border: `1px solid ${LG.line}`, display: "flex", flexDirection: "column", gap: 5 }}>
      {items.map(([ok, label], i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: ok ? LG.green : "transparent", border: `1.5px solid ${ok ? LG.green : LG.mute}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {ok && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4.2 3 6.5 7 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </div>
          <span style={{ fontFamily: LG.fontM, fontSize: 10, color: ok ? LG.ink : LG.mute, letterSpacing: "0.08em" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Ticket header + perforation ───────────────────────────────────────────
function LgTicketHeader({ label, num }) {
  return (
    <>
      <div style={{ background: LG.ink, color: "#fff", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: LG.fontM, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase" }}>
        <span>● {label}</span>
        <span style={{ color: "rgba(255,255,255,0.5)" }}>{num}</span>
      </div>
      <div style={{ height: 12, background: LG.cream, borderBottom: `2px dashed ${LG.ink}`, position: "relative" }}>
        <div style={{ position: "absolute", left: -8, top: -4, width: 16, height: 16, borderRadius: "50%", background: LG.bg, border: `2px solid ${LG.ink}` }} />
        <div style={{ position: "absolute", right: -8, top: -4, width: 16, height: 16, borderRadius: "50%", background: LG.bg, border: `2px solid ${LG.ink}` }} />
      </div>
    </>
  );
}

// ── Wrapper (centered column) ─────────────────────────────────────────────
function LgPage({ children, annItems }) {
  const [ref] = lgMeasure();
  return (
    <div ref={ref} style={{ background: LG.bg, fontFamily: LG.fontB, color: LG.ink, minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px 32px" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {children}
        {annItems && <LgLegend items={annItems} />}
      </div>
    </div>
  );
}

// ── L1 — Login ────────────────────────────────────────────────────────────
const ANN_L1 = [
  [1, "RN-L01", "Mensagem de erro sempre genérica: 'Email ou senha incorretos' — nunca revelar qual campo falhou (segurança)"],
  [2, "RN-L02", "status PENDENTE com credenciais válidas → redireciona para Tela 2 de Confirmação sem reenvio automático"],
  [3, "RN-L03", "status ATIVO ou EMAIL_PENDENTE → emite JWT com token_versao atual + redireciona para Home"],
  [4, "RN-L16", "Rate limiting: 100 req/IP/min (global) · throttling adicional por email/IP no endpoint de login é decisão de implementação do backend"],
  [5, "RN-L17 / RN-L18", "Logout disponível no header global: incrementa token_versao +1, invalida todos os JWTs; redireciona para landing sem confirmação"],
];

function L1Screen() {
  return (
    <LgPage annItems={ANN_L1}>
      <LgLogo />
      <div style={{ background: "#fff", border: `2.5px solid ${LG.ink}`, boxShadow: `6px 6px 0 ${LG.ink}` }}>
        <LgTicketHeader label="Acesso à conta" num="L-001" />
        <div style={{ padding: "24px 22px 22px", position: "relative" }}>
          <LgAnn n="1" top={-8} right={-8} />
          <h2 style={{ margin: "0 0 20px", fontFamily: LG.fontD, fontSize: 28, textTransform: "uppercase" }}>Entrar</h2>
          <LgField label="Email" type="email" placeholder="voce@email.com.br" />
          <LgField label="Senha" type="password" placeholder="••••••••" rightLabel="Esqueci a senha" />
          <div style={{ height: 4 }} />
          <LgPrimaryBtn>Entrar →</LgPrimaryBtn>
          <div style={{ marginTop: 16, padding: "10px 12px", background: "rgba(229,20,42,0.08)", border: `1px solid ${LG.red}`, fontFamily: LG.fontM, fontSize: 11, color: LG.red, letterSpacing: "0.06em", textAlign: "center" }}>
            Email ou senha incorretos
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16, textAlign: "center", fontFamily: LG.fontB, fontSize: 13 }}>
        Não tem conta? <a style={{ color: LG.green, fontWeight: 700, cursor: "pointer" }}>Criar conta grátis</a>
      </div>
      <div style={{ marginTop: 8, padding: "8px 12px", background: LG.cream, border: `1px dashed ${LG.line}`, fontFamily: LG.fontM, fontSize: 9, color: LG.mute, letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center" }}>
        Tela de erro de credenciais exibida · estado normal não mostra esta mensagem
      </div>
    </LgPage>
  );
}

// ── L2 — Esqueci a Senha ─────────────────────────────────────────────────
const ANN_L2 = [
  [1, "RN-L04", "Resposta sempre igual independente de o email existir ou não — não revelar existência de contas"],
  [2, "RN-L05 / RN-L07", "Token UUID expira em 2 horas · novo token invalida logicamente o anterior do mesmo usuário e tipo"],
  [3, "RN-L13", "Email de recuperação contém: link com token + informação sobre prazo (2 horas)"],
];

function L2Screen({ postSubmit = false }) {
  return (
    <LgPage annItems={ANN_L2}>
      <LgLogo />
      <LgCard shadow={LG.red}>
        {!postSubmit ? (
          <>
            <div style={{ width: 44, height: 44, background: LG.red, color: "#fff", border: `2px solid ${LG.ink}`, boxShadow: `2px 2px 0 ${LG.ink}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, fontFamily: LG.fontD, fontSize: 22 }}>🔑</div>
            <h2 style={{ margin: "0 0 8px", fontFamily: LG.fontD, fontSize: 24, textTransform: "uppercase" }}>Recuperar senha</h2>
            <p style={{ margin: "0 0 18px", fontFamily: LG.fontB, fontSize: 13, color: "rgba(10,9,7,0.7)", lineHeight: 1.45 }}>
              Informe o email cadastrado. Se ele existir em nossa base, você receberá um link para redefinir sua senha.
            </p>
            <div style={{ position: "relative" }}>
              <LgAnn n="1" top={-8} right={-8} />
              <LgField label="Email" type="email" placeholder="voce@email.com.br" />
              <LgPrimaryBtn>Enviar link</LgPrimaryBtn>
            </div>
            <div style={{ marginTop: 14, textAlign: "center" }}>
              <a style={{ fontFamily: LG.fontM, fontSize: 11, color: LG.mute, cursor: "pointer", letterSpacing: "0.08em" }}>← Voltar ao login</a>
            </div>
          </>
        ) : (
          <>
            <div style={{ width: 44, height: 44, background: LG.ink, color: "#fff", border: `2px solid ${LG.ink}`, boxShadow: `2px 2px 0 ${LG.red}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, fontFamily: LG.fontD, fontSize: 22 }}>✉</div>
            <div style={{ fontFamily: LG.fontM, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: LG.green, marginBottom: 6 }}>Link enviado</div>
            <h2 style={{ margin: "0 0 12px", fontFamily: LG.fontD, fontSize: 24, textTransform: "uppercase" }}>Verifique seu email</h2>
            <p style={{ margin: "0 0 18px", fontFamily: LG.fontB, fontSize: 13, color: "rgba(10,9,7,0.7)", lineHeight: 1.45 }}>
              Se esse email estiver cadastrado, você receberá um link em instantes. Verifique também a pasta de spam.
            </p>
            <div style={{ padding: "8px 12px", background: LG.cream, border: `1px dashed ${LG.line}`, fontFamily: LG.fontM, fontSize: 9, color: LG.mute, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
              RN-L04: resposta idêntica mesmo se email não existir (segurança)
            </div>
            <a style={{ fontFamily: LG.fontM, fontSize: 11, color: LG.mute, cursor: "pointer", letterSpacing: "0.08em" }}>← Voltar ao login</a>
          </>
        )}
      </LgCard>
    </LgPage>
  );
}

// ── L3 — Redefinição de Senha ─────────────────────────────────────────────
const ANN_L3 = [
  [1, "RN-L08 / RN-L09", "Política: mín. 8 chars, 1 maiúscula, 1 minúscula, 1 número, 1 especial · checklist em tempo real; validação server-side replica as mesmas regras"],
  [2, "RN-L10", "Botão 'Redefinir senha' desabilitado enquanto qualquer item do checklist (incluindo 'Senhas idênticas') não estiver atendido"],
  [3, "RN-L15", "Sucesso: token_versao +1 invalida todas as sessões ativas; novo JWT emitido para a sessão corrente do fluxo"],
  [4, "RN-L11", "Após redefinição: redireciona para Home (ATIVO/EMAIL_PENDENTE) ou Tela 2 de Confirmação (PENDENTE)"],
];

function L3Screen() {
  const checklist = [
    [true,  "Mínimo de 8 caracteres"],
    [true,  "Ao menos uma letra maiúscula"],
    [true,  "Ao menos uma letra minúscula"],
    [false, "Ao menos um número"],
    [false, "Ao menos um caractere especial"],
    [false, "Senhas idênticas"],
  ];
  return (
    <LgPage annItems={ANN_L3}>
      <LgLogo />
      <LgCard shadow={LG.green}>
        <h2 style={{ margin: "0 0 20px", fontFamily: LG.fontD, fontSize: 24, textTransform: "uppercase" }}>Criar nova senha</h2>
        <div style={{ position: "relative" }}>
          <LgAnn n="1" top={-8} right={-8} />
          <LgField label="Nova senha" type="password" value="SenhaEx" />
          <LgChecklist items={checklist} />
        </div>
        <div style={{ marginTop: 14 }}>
          <LgField label="Confirmar nova senha" type="password" placeholder="Repita a nova senha" />
        </div>
        <div style={{ marginTop: 14, position: "relative" }}>
          <LgAnn n="2" top={-8} right={-8} />
          <LgPrimaryBtn disabled>Redefinir senha</LgPrimaryBtn>
        </div>
        <div style={{ marginTop: 10, padding: "7px 10px", background: LG.cream, border: `1px dashed ${LG.line}`, fontFamily: LG.fontM, fontSize: 9, color: LG.mute, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Botão desabilitado: senha não atende todos os requisitos
        </div>
      </LgCard>
    </LgPage>
  );
}

// ── L4 — Token Inválido / Expirado ────────────────────────────────────────
const ANN_L4 = [
  [1, "RN-L05 / RN-L06", "Token de recuperação: expira em 2h · uso único (usado_em preenchido); tokens anteriores do mesmo usuário e tipo são logicamente invalidados"],
  [2, "—", "Botão 'Solicitar novo link' redireciona para Tela L2 para nova solicitação"],
];

function L4Screen() {
  return (
    <LgPage annItems={ANN_L4}>
      <LgLogo />
      <LgCard shadow={LG.red}>
        <div style={{ width: 44, height: 44, background: LG.red, color: "#fff", border: `2px solid ${LG.ink}`, boxShadow: `2px 2px 0 ${LG.ink}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, fontFamily: LG.fontD, fontSize: 22 }}>!</div>
        <div style={{ fontFamily: LG.fontM, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: LG.red, marginBottom: 8 }}>Link inválido ou expirado</div>
        <h2 style={{ margin: "0 0 12px", fontFamily: LG.fontD, fontSize: 24, textTransform: "uppercase", lineHeight: 1.05 }}>Link de recuperação inválido</h2>
        <p style={{ margin: "0 0 20px", fontFamily: LG.fontB, fontSize: 13, color: "rgba(10,9,7,0.7)", lineHeight: 1.45 }}>
          Este link de recuperação não é mais válido. Links expiram em 2 horas e só podem ser usados uma vez.
        </p>
        <div style={{ position: "relative" }}>
          <LgAnn n="1" top={-8} right={-8} />
          <LgPrimaryBtn>Solicitar novo link →</LgPrimaryBtn>
        </div>
      </LgCard>
    </LgPage>
  );
}

// ── Tela 1 — Cadastro ────────────────────────────────────────────────────
const ANN_CAD1 = [
  [1, "RN-14 / RN-15", "Checklist de senha atualizado em tempo real durante digitação · botão 'Criar conta' pode ser acionado independente do checklist — validação real ocorre no servidor"],
  [2, "RN-01 / RN-03", "Identificador de 6 chars gerado no cadastro: alfanumérico maiúsculo, sem O/0/I/1/L · imutável após geração"],
  [3, "RN-18", "Rate limiting: 100 req/IP/min em todos os endpoints (global)"],
  [4, "RN-05", "Status inicial = PENDENTE; acesso bloqueado até confirmação do email via magic link"],
  [5, "RN-06 / RN-07", "Confirmação exclusivamente via magic link UUID recebido por email; não há campo de digitação de código; magic link abre no browser (sem deeplink PWA)"],
];

function Cad1Screen() {
  const checklist = [
    [false, "Mínimo de 8 caracteres"],
    [false, "Ao menos uma letra maiúscula"],
    [false, "Ao menos uma letra minúscula"],
    [false, "Ao menos um número"],
    [false, "Ao menos um caractere especial"],
  ];
  return (
    <LgPage annItems={ANN_CAD1}>
      <LgLogo />
      <div style={{ background: "#fff", border: `2.5px solid ${LG.ink}`, boxShadow: `6px 6px 0 ${LG.green}` }}>
        <LgTicketHeader label="Criar conta" num="C-001" />
        <div style={{ padding: "24px 22px 22px" }}>
          <h2 style={{ margin: "0 0 20px", fontFamily: LG.fontD, fontSize: 28, textTransform: "uppercase" }}>Criar conta</h2>
          <LgField label="Nome completo" placeholder="Seu nome" />
          <LgField label="Email" type="email" placeholder="seuemail@exemplo.com" />
          <div style={{ position: "relative" }}>
            <LgAnn n="1" top={-8} right={-8} />
            <LgField label="Senha" type="password" placeholder="Crie uma senha" />
            <LgChecklist items={checklist} />
          </div>
          <div style={{ marginTop: 16 }}>
            <LgPrimaryBtn>Criar conta →</LgPrimaryBtn>
          </div>
          <div style={{ marginTop: 14, textAlign: "center", fontFamily: LG.fontB, fontSize: 13 }}>
            Já tem conta? <a style={{ color: LG.red, fontWeight: 700, cursor: "pointer" }}>Entrar</a>
          </div>
        </div>
      </div>
    </LgPage>
  );
}

// ── Tela 2 — Confirmação de Email ─────────────────────────────────────────
const ANN_CAD2 = [
  [1, "RN-06 / RN-13", "Confirmação só via magic link UUID; identificador de 6 chars exibido para o usuário anotar — também enviado por email"],
  [2, "RN-10 / RN-11", "Cooldown mínimo de 5 min entre reenvios (baseado em ultimo_envio_em) · reenvio gera novo token UUID e invalida o anterior"],
  [3, "RN-17", "Link 'Corrigir email' redireciona para Perfil do Usuário (tela P1) sem alterar status · Perfil permite substituição direta do email para usuários PENDENTE"],
  [4, "RN-09", "Estado de erro: token com usado_em IS NOT NULL ou expira_em ≤ agora é rejeitado; exibe estado de erro com opção de solicitar novo link (sem aguardar cooldown neste caso)"],
];

function Cad2Screen({ tokenError = false }) {
  return (
    <LgPage annItems={ANN_CAD2}>
      <LgLogo />
      <LgCard shadow={tokenError ? LG.red : LG.ink}>
        {!tokenError ? (
          <>
            <div style={{ width: 44, height: 44, background: LG.ink, color: "#fff", border: `2px solid ${LG.ink}`, boxShadow: `2px 2px 0 ${LG.red}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, fontFamily: LG.fontD, fontSize: 22 }}>✉</div>
            <h2 style={{ margin: "0 0 10px", fontFamily: LG.fontD, fontSize: 24, textTransform: "uppercase" }}>Confirme seu email</h2>
            <p style={{ margin: "0 0 16px", fontFamily: LG.fontB, fontSize: 13, color: "rgba(10,9,7,0.7)", lineHeight: 1.45 }}>
              Enviamos um link de confirmação para <strong>j***@exemplo.com.br</strong>. Clique nele para ativar sua conta.
            </p>
            {/* Identificador em destaque */}
            <div style={{ padding: "14px 16px", background: LG.bg, border: `2px solid ${LG.ink}`, boxShadow: `3px 3px 0 ${LG.red}`, marginBottom: 16, position: "relative" }}>
              <LgAnn n="1" top={-8} right={-8} />
              <div style={{ fontFamily: LG.fontM, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: LG.mute, marginBottom: 6 }}>Seu identificador é:</div>
              <div style={{ fontFamily: LG.fontM, fontSize: 32, letterSpacing: "0.16em", color: LG.ink }}>XB3K29</div>
              <div style={{ fontFamily: LG.fontB, fontSize: 11, color: LG.mute, marginTop: 4 }}>Anote este código — ele é público e identifica você na plataforma.</div>
            </div>
            {/* Reenvio */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, position: "relative" }}>
              <LgAnn n="2" top={-8} left={-8} />
              <span style={{ fontFamily: LG.fontM, fontSize: 11, color: LG.mute, letterSpacing: "0.08em" }}>Reenviar em <strong>04:23</strong></span>
            </div>
            <div style={{ position: "relative" }}>
              <LgAnn n="3" top={-8} right={-8} />
              <a style={{ fontFamily: LG.fontM, fontSize: 11, color: LG.red, cursor: "pointer", letterSpacing: "0.08em" }}>Corrigir email →</a>
            </div>
          </>
        ) : (
          <>
            <div style={{ width: 44, height: 44, background: LG.red, color: "#fff", border: `2px solid ${LG.ink}`, boxShadow: `2px 2px 0 ${LG.ink}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, fontFamily: LG.fontD, fontSize: 22 }}>!</div>
            <div style={{ fontFamily: LG.fontM, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: LG.red, marginBottom: 8 }}>Link inválido ou expirado</div>
            <h2 style={{ margin: "0 0 10px", fontFamily: LG.fontD, fontSize: 22, textTransform: "uppercase" }}>Link inválido</h2>
            <p style={{ margin: "0 0 18px", fontFamily: LG.fontB, fontSize: 13, color: "rgba(10,9,7,0.7)", lineHeight: 1.45 }}>
              Este link de confirmação não é mais válido. Links expiram em 24 horas e só podem ser usados uma vez.
            </p>
            <div style={{ position: "relative" }}>
              <LgAnn n="4" top={-8} right={-8} />
              <LgPrimaryBtn>Solicitar novo link →</LgPrimaryBtn>
            </div>
          </>
        )}
      </LgCard>
    </LgPage>
  );
}

// ── Tela 3 — Cadastro Confirmado ─────────────────────────────────────────
const ANN_CAD3 = [
  [1, "RN-08", "Confirmação: status = ATIVO; confirmado_em = agora; token.usado_em = agora; JWT emitido com token_versao atual"],
  [2, "RN-13", "Identificador exibido com botão 'Copiar'; recomenda guardar o código"],
  [3, "RN-19", "Se havia sessão ativa de outro usuário no dispositivo ao confirmar: sessão do outro encerrada (token_versao +1); usuário recém-confirmado autenticado em seu lugar"],
];

function Cad3Screen() {
  return (
    <LgPage annItems={ANN_CAD3}>
      <LgLogo />
      <LgCard shadow={LG.green}>
        <div style={{ width: 44, height: 44, background: LG.green, color: "#fff", border: `2px solid ${LG.ink}`, boxShadow: `2px 2px 0 ${LG.ink}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, fontFamily: LG.fontD, fontSize: 22 }}>✓</div>
        <div style={{ fontFamily: LG.fontM, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: LG.green, marginBottom: 8 }}>Conta ativada</div>
        <h2 style={{ margin: "0 0 10px", fontFamily: LG.fontD, fontSize: 28, textTransform: "uppercase" }}>Tudo certo!</h2>
        <p style={{ margin: "0 0 16px", fontFamily: LG.fontB, fontSize: 13, color: "rgba(10,9,7,0.7)", lineHeight: 1.45 }}>
          Sua conta foi criada. Seu identificador é:
        </p>
        <div style={{ padding: "14px 16px", background: LG.bg, border: `2px solid ${LG.ink}`, boxShadow: `3px 3px 0 ${LG.green}`, marginBottom: 16, position: "relative" }}>
          <LgAnn n="2" top={-8} right={-8} />
          <div style={{ fontFamily: LG.fontM, fontSize: 36, letterSpacing: "0.16em", color: LG.ink, marginBottom: 8 }}>XB3K29</div>
          <button style={{ padding: "7px 14px", background: "transparent", border: `1.5px solid ${LG.ink}`, fontFamily: LG.fontM, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>Copiar</button>
        </div>
        <p style={{ margin: "0 0 20px", fontFamily: LG.fontM, fontSize: 10, color: LG.mute, letterSpacing: "0.08em", lineHeight: 1.5 }}>
          Guarde este identificador — ele é público e pode ser usado para identificá-lo na plataforma.
        </p>
        <LgPrimaryBtn>Acessar a aplicação →</LgPrimaryBtn>
      </LgCard>
    </LgPage>
  );
}

Object.assign(window, { L1Screen, L2Screen, L3Screen, L4Screen, Cad1Screen, Cad2Screen, Cad3Screen });
