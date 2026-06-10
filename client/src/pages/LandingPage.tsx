import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/lib/api';

// ─── Logo ────────────────────────────────────────────────────────────────────
function LogoMA({ size = 36 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: '#E5142A',
        transform: 'rotate(-4deg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          color: '#fff',
          fontFamily: '"Archivo Black", sans-serif',
          fontSize: size * 0.38,
          fontWeight: 400,
          letterSpacing: '-0.02em',
        }}
      >
        MA
      </span>
    </div>
  );
}

// ─── Nav ─────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 68,
        borderBottom: '2px solid #0A0907',
        background: '#FBF8EE',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(20px, 4vw, 56px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <LogoMA />
        <span
          style={{
            fontFamily: '"Archivo Black", sans-serif',
            fontSize: 18,
            color: '#0A0907',
            letterSpacing: '-0.01em',
          }}
        >
          Meu Album
        </span>
      </div>
    </nav>
  );
}

// ─── Login Card (ticket-stub) ─────────────────────────────────────────────────
function LoginCard() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/home');
    } catch (err) {
      if (err instanceof ApiError && err.message === 'EMAIL_NAO_CONFIRMADO') {
        const body = err.body as { publicId?: string; ultimoEnvioEm?: string } | undefined;
        navigate('/confirmar-cadastro', { state: { publicId: body?.publicId, ultimoEnvioEm: body?.ultimoEnvioEm } });
      } else if (err instanceof ApiError) {
        setError('Email ou senha incorretos');
      } else {
        setError('Erro inesperado. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: '#fff',
        border: '2.5px solid #0A0907',
        boxShadow: '8px 8px 0 #0A0907',
        transform: 'rotate(1.5deg)',
        maxWidth: 380,
        width: '100%',
        alignSelf: 'flex-start',
      }}
    >
      {/* Ticket header */}
      <div
        style={{
          background: '#0A0907',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: '"Geist Mono", monospace',
            fontSize: 11,
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
          }}
        >
          ● ABRIR ÁLBUM
        </span>
        <span
          style={{
            fontFamily: '"Geist Mono", monospace',
            fontSize: 11,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.12em',
          }}
        >
          N° 0001
        </span>
      </div>

      {/* Perforation */}
      <div style={{ position: 'relative', height: 14, background: '#F0E9D6', borderBottom: '2.5px dashed #0A0907' }}>
        <div
          style={{
            position: 'absolute',
            left: -10,
            top: -10,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#FBF8EE',
            border: '2px solid #0A0907',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: -10,
            top: -10,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#FBF8EE',
            border: '2px solid #0A0907',
          }}
        />
      </div>

      {/* Body */}
      <div style={{ padding: '28px 28px 32px' }}>
        <h3
          style={{
            fontFamily: '"Archivo Black", sans-serif',
            fontSize: 30,
            color: '#0A0907',
            margin: '0 0 20px',
          }}
        >
          Entrar
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Email"
            type="email"
            placeholder="seuemail@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PasswordInput
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <div style={{ textAlign: 'right' }}>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: 12,
                  color: '#E5142A',
                  fontWeight: 600,
                  fontFamily: '"Geist", sans-serif',
                  textDecoration: 'none',
                }}
              >
                Esqueci a senha
              </Link>
            </div>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: '#E5142A', fontFamily: '"Geist", sans-serif', margin: 0 }}>
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} style={{ width: '100%' }}>
            Entrar
          </Button>
        </form>

        <p
          style={{
            marginTop: 18,
            fontSize: 13,
            fontFamily: '"Geist", sans-serif',
            color: '#0A0907',
            textAlign: 'center',
          }}
        >
          Sem conta?{' '}
          <Link
            to="/register"
            style={{ color: '#0A9145', fontWeight: 700, textDecoration: 'none' }}
          >
            Cadastrar grátis
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── Countdown Band ───────────────────────────────────────────────────────────
function CountdownBand() {
  const target = new Date('2026-06-11T12:00:00Z');

  const [diff, setDiff] = useState(() => target.getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => setDiff(target.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const total = Math.max(0, diff);
  const days = Math.floor(total / 86400000);
  const hours = Math.floor((total % 86400000) / 3600000);
  const minutes = Math.floor((total % 3600000) / 60000);
  const seconds = Math.floor((total % 60000) / 1000);

  const pad = (n: number) => String(n).padStart(2, '0');

  const unitStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  };
  const numStyle: React.CSSProperties = {
    fontFamily: '"Archivo Black", sans-serif',
    fontSize: 'clamp(32px, 5vw, 56px)',
    color: '#fff',
    lineHeight: 1,
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: '"Geist Mono", monospace',
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  };
  const sepStyle: React.CSSProperties = {
    fontFamily: '"Archivo Black", sans-serif',
    fontSize: 'clamp(28px, 4vw, 48px)',
    color: 'rgba(255,255,255,0.4)',
    alignSelf: 'flex-start',
    paddingTop: 4,
  };

  return (
    <section
      style={{
        background: '#0A0907',
        borderTop: '4px solid #E5142A',
        borderBottom: '4px solid #0A9145',
        padding: 'clamp(32px, 5vw, 56px) clamp(20px, 4vw, 56px)',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: '"Geist Mono", monospace',
          fontSize: 11,
          color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          marginBottom: 24,
        }}
      >
        Copa do Mundo 2026 começa em
      </p>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={unitStyle}>
          <span style={numStyle}>{days}</span>
          <span style={labelStyle}>Dias</span>
        </div>
        <span style={sepStyle}>:</span>
        <div style={unitStyle}>
          <span style={numStyle}>{pad(hours)}</span>
          <span style={labelStyle}>Horas</span>
        </div>
        <span style={sepStyle}>:</span>
        <div style={unitStyle}>
          <span style={numStyle}>{pad(minutes)}</span>
          <span style={labelStyle}>Min</span>
        </div>
        <span style={sepStyle}>:</span>
        <div style={unitStyle}>
          <span style={numStyle}>{pad(seconds)}</span>
          <span style={labelStyle}>Seg</span>
        </div>
      </div>
    </section>
  );
}

// ─── Stats Scoreboard ─────────────────────────────────────────────────────────
function StatsScoreboard() {
  const stats = [
    { value: '994', label: 'Figurinhas' },
    { value: '112', label: 'Páginas' },
    { value: '48', label: 'Seleções' },
    { value: '2026', label: 'Copa' },
  ];

  return (
    <section
      style={{
        padding: 'clamp(40px, 5vw, 64px) clamp(20px, 4vw, 56px)',
        background: '#FBF8EE',
      }}
    >
      <p
        style={{
          fontFamily: '"Geist Mono", monospace',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          color: 'rgba(10,9,7,0.45)',
          textAlign: 'center',
          marginBottom: 24,
        }}
      >
        Álbum Copa do Mundo 2026
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4 }}>
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: '#F0E9D6',
              border: '1.5px solid #0A0907',
              boxShadow: '8px 8px 0 #E5142A',
              padding: 'clamp(16px, 2.5vw, 28px) 8px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: '"Archivo Black", sans-serif',
                fontSize: 'clamp(22px, 3.5vw, 40px)',
                color: '#0A0907',
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontFamily: '"Geist Mono", monospace',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'rgba(10,9,7,0.55)',
                marginTop: 6,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Steps Section ────────────────────────────────────────────────────────────
function StepsSection() {
  const steps = [
    {
      num: '01',
      title: 'Crie sua conta',
      body: 'Cadastro gratuito em menos de um minuto. Nenhum cartão necessário.',
      color: '#E5142A',
      rotate: '-0.4deg',
    },
    {
      num: '02',
      title: 'Abra pacotinhos',
      body: 'Registre cada figurinha que você tem e veja seu álbum ganhar vida.',
      color: '#0A9145',
      rotate: '-1deg',
    },
    {
      num: '03',
      title: 'Complete o álbum',
      body: 'Acompanhe seu progresso e gerencie suas repetidas facilmente.',
      color: '#0B2A66',
      rotate: '0.8deg',
    },
  ];

  return (
    <section
      style={{
        padding: 'clamp(40px, 5vw, 72px) clamp(20px, 4vw, 56px)',
        background: '#F0E9D6',
      }}
    >
      <p
        style={{
          fontFamily: '"Geist Mono", monospace',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          color: 'rgba(10,9,7,0.45)',
          marginBottom: 8,
        }}
      >
        Como funciona
      </p>
      <h2
        style={{
          fontFamily: '"Archivo Black", sans-serif',
          fontSize: 'clamp(24px, 3.5vw, 40px)',
          color: '#0A0907',
          marginBottom: 40,
          lineHeight: 1.1,
        }}
      >
        Simples como abrir um pacotinho
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 24,
        }}
      >
        {steps.map((s) => (
          <div
            key={s.num}
            style={{
              background: '#FBF8EE',
              border: '2px solid #0A0907',
              boxShadow: `6px 6px 0 ${s.color}`,
              padding: '28px 24px',
              transform: `rotate(${s.rotate})`,
            }}
          >
            <div
              style={{
                fontFamily: '"Archivo Black", sans-serif',
                fontSize: 40,
                color: s.color,
                lineHeight: 1,
                marginBottom: 12,
              }}
            >
              {s.num}
            </div>
            <h3
              style={{
                fontFamily: '"Archivo Black", sans-serif',
                fontSize: 18,
                color: '#0A0907',
                marginBottom: 8,
              }}
            >
              {s.title}
            </h3>
            <p style={{ fontFamily: '"Geist", sans-serif', fontSize: 14, color: 'rgba(10,9,7,0.65)', lineHeight: 1.5 }}>
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      style={{
        background: '#0A0907',
        borderTop: '6px solid #E5142A',
        padding: 'clamp(24px, 3vw, 40px) clamp(20px, 4vw, 56px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <LogoMA size={28} />
        <span
          style={{
            fontFamily: '"Archivo Black", sans-serif',
            fontSize: 14,
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          Meu Album
        </span>
      </div>
      <p
        style={{
          fontFamily: '"Geist Mono", monospace',
          fontSize: 10,
          color: 'rgba(255,255,255,0.25)',
          width: '100%',
          textAlign: 'center',
          marginTop: 8,
        }}
      >
        Projeto independente. Não afiliado à FIFA ou Panini.
      </p>
    </footer>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="landing-hero"
      style={{
        padding: 'clamp(40px, 6vw, 96px) clamp(20px, 4vw, 56px)',
        display: 'grid',
        gridTemplateColumns: '1.05fr 1fr',
        gap: 'clamp(24px, 4vw, 48px)',
        alignItems: 'start',
        background: '#FBF8EE',
      }}
    >
      {/* Left column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            display: 'inline-flex',
            alignSelf: 'flex-start',
            background: '#E5142A',
            color: '#fff',
            fontFamily: '"Geist Mono", monospace',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            padding: '6px 14px',
            transform: 'rotate(-1.5deg)',
          }}
        >
          Copa do Mundo 2026
        </div>

        <h1
          style={{
            fontFamily: '"Archivo Black", sans-serif',
            fontSize: 'clamp(40px, 7vw, 100px)',
            lineHeight: 0.95,
            color: '#0A0907',
            margin: 0,
          }}
        >
          Seu álbum,{' '}
          <span style={{ color: '#E5142A' }}>do seu jeito</span>
        </h1>

        <p
          style={{
            fontFamily: '"Geist", sans-serif',
            fontSize: 'clamp(15px, 1.2vw, 17px)',
            color: 'rgba(10,9,7,0.65)',
            lineHeight: 1.6,
            maxWidth: 440,
          }}
        >
          Acompanhe sua coleção de figurinhas da Copa do Mundo 2026. Saiba quais você tem,
          quais faltam e gerencie suas repetidas — tudo em um lugar só.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/register">
            <Button size="lg">Criar conta grátis</Button>
          </Link>
        </div>

        {/* Social proof */}
        <p
          style={{
            fontFamily: '"Geist Mono", monospace',
            fontSize: 11,
            color: 'rgba(10,9,7,0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}
        >
          ✓ Gratuito &nbsp;·&nbsp; ✓ Sem anúncios &nbsp;·&nbsp; ✓ Mobile-first
        </p>
      </div>

      {/* Right column */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <LoginCard />
      </div>
    </section>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [contaExcluida] = useState(() => {
    if (sessionStorage.getItem('contaExcluida') === '1') {
      sessionStorage.removeItem('contaExcluida');
      return true;
    }
    return false;
  });

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @media (max-width: 768px) {
          .landing-hero { grid-template-columns: 1fr !important; }
          .landing-hero > div:last-child { justify-content: flex-start !important; }
          .landing-hero > div:last-child > div { transform: none !important; }
        }
      `}</style>
      <Nav />
      <div style={{ marginTop: 68, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {contaExcluida && (
          <div
            role="alert"
            style={{
              background: '#0A9145',
              color: '#fff',
              padding: '12px clamp(20px, 4vw, 56px)',
              fontFamily: '"Geist", sans-serif',
              fontSize: 14,
              textAlign: 'center',
            }}
          >
            Sua conta foi excluída com sucesso.
          </div>
        )}
        <HeroSection />
        <CountdownBand />
        <StatsScoreboard />
        <StepsSection />
        <Footer />
      </div>
    </div>
  );
}
