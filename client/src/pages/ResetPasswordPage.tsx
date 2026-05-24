import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { PasswordChecklist, allRulesMet } from '@/components/ui/PasswordChecklist';
import { Button } from '@/components/ui/Button';
import { authApi, ApiError } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

function InvalidToken() {
  const navigate = useNavigate();
  return (
    <div className="bg-white border-2 border-ink [box-shadow:6px_6px_0_#0A0907] p-8 max-w-md w-full">
      <div className="text-red mb-4" aria-hidden="true">
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h1 className="font-display text-2xl font-black text-ink mb-3">Link inválido ou expirado</h1>
      <p className="text-sm font-body text-ink/60 mb-6 leading-relaxed">
        Este link de recuperação não é mais válido. Links expiram em 2 horas e só podem ser usados uma vez.
      </p>
      <Button className="w-full" onClick={() => navigate('/forgot-password')}>
        Solicitar novo link
      </Button>
    </div>
  );
}

function ResetForm({ token }: { token: string }) {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenInvalid, setTokenInvalid] = useState(false);

  const canSubmit = allRulesMet(password, confirm);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    try {
      const result = await authApi.resetPassword(token, password);
      if (result.user) setUser(result.user);
      navigate('/home');
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setTokenInvalid(true);
      } else {
        setError('Erro ao redefinir senha. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (tokenInvalid) return <InvalidToken />;

  return (
    <div className="bg-white border-2 border-ink [box-shadow:6px_6px_0_#0A0907] p-8 max-w-md w-full">
      <h1 className="font-display text-2xl font-black text-ink mb-6">Criar nova senha</h1>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <PasswordInput
            label="Nova senha"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          {(password.length > 0 || confirm.length > 0) && (
            <PasswordChecklist password={password} confirm={confirm} showConfirm={confirm.length > 0} />
          )}
        </div>
        <PasswordInput
          label="Confirmar nova senha"
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
        />
        {error && (
          <p role="alert" aria-live="assertive" className="text-xs text-red font-body">⚠ {error}</p>
        )}
        <Button type="submit" loading={loading} disabled={!canSubmit} className="w-full mt-2">
          Redefinir senha
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }
    authApi.checkResetToken(token)
      .then(({ valid }) => setStatus(valid ? 'valid' : 'invalid'))
      .catch(() => setStatus('invalid'));
  }, [token]);

  return (
    <div className="min-h-dvh bg-paper flex items-center justify-center p-6">
      {status === 'loading' && (
        <div className="text-ink/50 font-body text-sm" aria-live="polite">Verificando link...</div>
      )}
      {status === 'invalid' && <InvalidToken />}
      {status === 'valid' && <ResetForm token={token!} />}
    </div>
  );
}
