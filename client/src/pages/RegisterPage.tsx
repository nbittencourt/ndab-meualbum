import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi, ApiError } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { PasswordChecklist } from '@/components/ui/PasswordChecklist';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';

function LogoMA() {
  return (
    <div aria-hidden="true" style={{ width: 36, height: 36, background: '#E5142A', transform: 'rotate(-4deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#fff', fontFamily: '"Archivo Black", sans-serif', fontSize: 14 }}>MA</span>
    </div>
  );
}

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [maioridade, setMaioridade] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const canSubmit = name.trim().length >= 2 && !!email && maioridade;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setEmailError('');

    if (!emailRegex.test(email)) {
      setEmailError('Email inválido. Verifique o formato.');
      return;
    }

    setLoading(true);
    try {
      await authApi.register(name.trim(), email, password, true);
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('Este email já está em uso.');
      } else if (err instanceof ApiError && err.status === 400) {
        const body = err.body as any;
        setError(typeof body?.error === 'string' ? body.error : 'Senha não atende aos requisitos mínimos de segurança.');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-dvh bg-paper flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border-2 border-ink [box-shadow:6px_6px_0_#0A0907] p-8 text-center">
          <div className="text-4xl mb-4" aria-hidden="true">✉️</div>
          <h1 className="font-display text-2xl font-black text-ink mb-3">Verifique seu email</h1>
          <p className="text-sm font-body text-ink/70">
            Enviamos um link de confirmação para <strong>{email}</strong>.
            Clique no link para ativar sua conta.
          </p>
          <Link to="/" className="inline-block mt-6 text-sm font-body text-red-dark underline hover:brightness-90">
            Ir para o início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-paper flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[440px]">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" aria-label="Ir para a página inicial">
            <LogoMA />
          </Link>
          <span className="font-display text-lg font-black text-ink">Meu Álbum</span>
        </div>

        <div className="bg-white border-2 border-ink [box-shadow:6px_6px_0_#0A0907] p-8">
          <h1 className="font-display text-2xl font-black text-ink mb-6">Criar conta</h1>

          {/* Aviso de privacidade — LGPD */}
          <div className="bg-ink/5 border border-ink/15 p-3 mb-5 text-xs font-body text-ink/70">
            Coletamos seu nome, email e senha para criar e gerenciar sua conta (base legal: execução de contrato).
            Saiba mais na nossa{' '}
            <a href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer" className="underline text-ink hover:text-red">
              Política de Privacidade <span className="sr-only">(abre em nova aba)</span>
            </a>.
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              label="Nome completo"
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
              minLength={2}
            />
            <Input
              label="Email"
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
              autoComplete="email"
              required
              error={emailError || undefined}
            />
            <div className="flex flex-col gap-1">
              <PasswordInput
                label="Senha"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              {password.length > 0 && (
                <PasswordChecklist password={password} confirm={confirm} showConfirm={confirm.length > 0} />
              )}
            </div>
            <PasswordInput
              label="Confirmar senha"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />

            <Checkbox
              id="maioridade"
              checked={maioridade}
              onChange={(e) => setMaioridade(e.target.checked)}
              required
              aria-required="true"
              label={
                <span>
                  Declaro que tenho 18 anos ou mais e li a{' '}
                  <a href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer" className="underline text-ink hover:text-red">
                    Política de Privacidade <span className="sr-only">(abre em nova aba)</span>
                  </a>
                  .
                  {' '}<span className="text-red-dark text-xs">(obrigatório)</span>
                </span>
              }
            />

            {error && (
              <p role="alert" aria-live="assertive" className="text-xs text-red-dark font-body">
                ⚠ {error}
              </p>
            )}

            <p className="text-xs font-body text-ink/60">
              Após criar a conta, enviaremos um link de confirmação para o seu email.
            </p>

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2"
              aria-label={loading ? 'Criando conta...' : 'Criar conta grátis'}
            >
              Criar conta grátis
            </Button>
          </form>

          <p className="mt-4 text-sm font-body text-ink text-center">
            Já tem conta?{' '}
            <Link to="/" aria-label="Já tem conta? Entrar" className="text-red-dark font-semibold hover:brightness-90">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
