import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { profileApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';

type State = 'loading' | 'success' | 'error';

export default function ConfirmEmailChangePage() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<State>('loading');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setState('error'); return; }

    profileApi.confirmarEmail(token)
      .then(() => setState('success'))
      .catch(() => setState('error'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-dvh bg-paper flex items-center justify-center p-6">
      <div className="bg-white border-2 border-ink [box-shadow:6px_6px_0_#0A0907] p-8 max-w-md w-full text-center">
        {state === 'loading' && (
          <>
            <div className="w-8 h-8 border-2 border-ink border-t-red rounded-full animate-spin mx-auto mb-4" aria-hidden="true" />
            <p className="font-body text-sm text-ink/60" aria-live="polite">Confirmando alteração de email...</p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="w-14 h-14 bg-green rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-black text-ink mb-2">Email atualizado!</h1>
            <p className="text-sm font-body text-ink/60 mb-6" aria-live="polite">
              Seu email foi alterado com sucesso.
            </p>
            <Link to="/home">
              <Button className="w-full">Ir para o início</Button>
            </Link>
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
              Este link não é mais válido. Acesse seu perfil para solicitar um novo.
            </p>
            <Link to="/perfil">
              <Button variant="secondary" className="w-full">Ir para o Perfil</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
