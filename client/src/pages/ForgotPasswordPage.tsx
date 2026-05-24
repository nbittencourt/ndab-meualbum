import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', background: '#FBF8EE', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ background: '#fff', border: '2px solid #0A0907', boxShadow: '6px 6px 0 #0A0907', padding: '36px 28px' }}>
          {!submitted ? (
            <>
              {/* Icon */}
              <div style={{ marginBottom: 20, color: '#0A0907' }}>
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h1 style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 26, color: '#0A0907', margin: '0 0 12px' }}>
                Recuperar senha
              </h1>
              <p style={{ fontFamily: '"Geist", sans-serif', fontSize: 14, color: 'rgba(10,9,7,0.6)', lineHeight: 1.6, marginBottom: 24 }}>
                Informe o email cadastrado. Se ele existir em nossa base, você receberá um link para redefinir sua senha.
              </p>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Input
                  label="Email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" loading={loading} style={{ width: '100%' }}>
                  Enviar link
                </Button>
              </form>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 20, color: '#0A9145' }}>
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h1 style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 26, color: '#0A0907', margin: '0 0 12px' }}>
                Email enviado
              </h1>
              <p style={{ fontFamily: '"Geist", sans-serif', fontSize: 14, color: 'rgba(10,9,7,0.6)', lineHeight: 1.6 }}>
                Se esse email estiver cadastrado, você receberá um link em instantes. Verifique também a pasta de spam.
              </p>
            </>
          )}

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(10,9,7,0.12)' }}>
            <Link
              to="/"
              style={{ fontFamily: '"Geist", sans-serif', fontSize: 13, color: '#0A0907', fontWeight: 600, textDecoration: 'none' }}
            >
              ← Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
