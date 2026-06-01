import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';

type State = 'loading' | 'success' | 'error' | 'pending';

function Countdown({ until }: { until: Date }) {
  const calc = () => Math.max(0, Math.round((until.getTime() - Date.now()) / 1000));
  const [secs, setSecs] = useState(calc);

  useEffect(() => {
    if (secs <= 0) return;
    const id = setInterval(() => setSecs(calc), 1000);
    return () => clearInterval(id);
  });

  if (secs <= 0) return null;
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return (
    <p className="text-sm font-body text-ink/60" aria-live="polite">
      Reenviar em {m}:{s}
    </p>
  );
}

export default function EmailConfirmationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const routerState = location.state as { publicId?: string; ultimoEnvioEm?: string } | null;
  const { setUser, user } = useAuthStore();
  const [state, setState] = useState<State>('loading');
  const didRun = useRef(false);
  const [reenviando, setReenviando] = useState(false);
  const [ultimoEnvioOverride, setUltimoEnvioOverride] = useState<string | null>(null);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const token = searchParams.get('token');

    if (!token) {
      // Tela 2 — usuário PENDENTE sem link de confirmação
      setState('pending');
      return;
    }

    authApi.confirmarCadastro(token)
      .then(({ user: confirmedUser }) => {
        setUser(confirmedUser);
        setState('success');
      })
      .catch(() => setState('error'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rawUltimoEnvio = ultimoEnvioOverride ?? (user as any)?.ultimoEnvioEm ?? routerState?.ultimoEnvioEm ?? null;
  const ultimoEnvio = rawUltimoEnvio ? new Date(rawUltimoEnvio) : null;
  const cooldownUntil = ultimoEnvio ? new Date(ultimoEnvio.getTime() + 5 * 60 * 1000) : null;
  const displayPublicId = user?.publicId ?? routerState?.publicId;

  const handleReenviar = useCallback(async () => {
    if (!displayPublicId || reenviando) return;
    setReenviando(true);
    try {
      await authApi.reenviarConfirmacaoCadastro(displayPublicId);
      setUltimoEnvioOverride(new Date().toISOString());
    } catch {
      // silencia — usuário pode tentar novamente
    } finally {
      setReenviando(false);
    }
  }, [displayPublicId, reenviando]);

  return (
    <div className="min-h-dvh bg-paper flex items-center justify-center p-6">
      <div className="bg-white border-2 border-ink [box-shadow:6px_6px_0_#0A0907] p-8 max-w-md w-full text-center">

        {state === 'loading' && (
          <>
            <div className="w-8 h-8 border-2 border-ink border-t-red rounded-full animate-spin mx-auto mb-4" aria-hidden="true" />
            <p className="font-body text-sm text-ink/60" aria-live="polite">Confirmando seu email...</p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="w-14 h-14 bg-green rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-black text-ink mb-2">Tudo certo!</h1>
            <p className="text-sm font-body text-ink/60 mb-6">
              Sua conta está ativa. Clique abaixo para começar.
            </p>
            <Button className="w-full" onClick={() => navigate('/home')}>
              Acessar a aplicação
            </Button>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="text-red mb-4" aria-hidden="true">
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="mx-auto">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-black text-ink mb-3">Link inválido ou expirado</h1>
            <p className="text-sm font-body text-ink/60 mb-6">
              Este link de confirmação não é mais válido. Links expiram em 24 horas.
            </p>
            <Button className="w-full" onClick={() => navigate('/')}>
              Solicitar novo link
            </Button>
          </>
        )}

        {state === 'pending' && (
          <>
            <div className="text-4xl mb-4" aria-hidden="true">✉️</div>
            <h1 className="font-display text-2xl font-black text-ink mb-3">Confirme seu email</h1>
            {displayPublicId && (
              <p className="text-xs font-mono text-ink/50 mb-2">
                Seu identificador: <strong>{displayPublicId}</strong>
              </p>
            )}
            <p className="text-sm font-body text-ink/70 mb-6">
              Enviamos um link de confirmação para o seu email. Verifique a caixa de entrada e clique no link para ativar sua conta.
            </p>
            {cooldownUntil && cooldownUntil > new Date() ? (
              <Countdown until={cooldownUntil} />
            ) : displayPublicId ? (
              <Button onClick={handleReenviar} loading={reenviando} className="w-full">
                Reenviar email
              </Button>
            ) : null}
            <Link to="/perfil" className="mt-4 inline-block text-sm font-body text-red underline hover:brightness-90">
              Corrigir email
            </Link>
          </>
        )}

      </div>
    </div>
  );
}
