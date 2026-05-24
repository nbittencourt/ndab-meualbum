import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import { SkipLink } from '@/components/ui/SkipLink';

import LandingPage from '@/pages/LandingPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import EmailConfirmationPage from '@/pages/EmailConfirmationPage';
import ConfirmEmailChangePage from '@/pages/ConfirmEmailChangePage';
import HomePage from '@/pages/HomePage';
import AlbumsPage from '@/pages/AlbumsPage';
import CadastroAlbumPage from '@/pages/CadastroAlbumPage';
import AbrirPacotinhosPage from '@/pages/AbrirPacotinhosPage';
import ColarFigurinhasPage from '@/pages/ColarFigurinhasPage';
import SwapsPage from '@/pages/SwapsPage';
import ProfilePage from '@/pages/ProfilePage';

const BOTTOM_NAV_ROUTES = ['/home', '/albums', '/abrir', '/colar', '/trocas', '/perfil'];

function GlobalLoader() {
  return (
    <div className="flex items-center justify-center min-h-dvh bg-paper" aria-busy="true" aria-label="Carregando">
      <div className="w-8 h-8 border-2 border-ink border-t-red rounded-full animate-spin" aria-hidden="true" />
    </div>
  );
}

function Footer({ authenticated }: { authenticated: boolean }) {
  return (
    <footer className="border-t border-ink/10 bg-paper py-4 px-5">
      <nav aria-label="Links de rodapé" className="flex flex-wrap gap-4 justify-center text-xs font-body text-ink/60">
        <a
          href="/politica-de-privacidade"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-ink underline focus:outline-none focus:ring-2 focus:ring-red rounded"
        >
          Política de Privacidade
          <span className="sr-only"> (abre em nova aba)</span>
        </a>
        {authenticated && (
          <a
            href="/perfil#cookies"
            className="hover:text-ink underline focus:outline-none focus:ring-2 focus:ring-red rounded"
          >
            Gerenciar cookies
          </a>
        )}
      </nav>
    </footer>
  );
}

export default function App() {
  const { checkAuth, setReady, user, isLoading } = useAuthStore();
  const location = useLocation();
  const showBottomNav = BOTTOM_NAV_ROUTES.some((r) => location.pathname.startsWith(r));

  useEffect(() => {
    const noAuthRoutes = ['/redefinir-senha', '/confirmar-cadastro', '/confirmar-email'];
    if (noAuthRoutes.some((r) => location.pathname.startsWith(r))) {
      setReady();
    } else {
      checkAuth();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkAuth, setReady]);

  // Announce page title changes for screen readers (SPA navigation)
  useEffect(() => {
    const titleMap: Record<string, string> = {
      '/': 'Início — Meu Álbum Copa 2026',
      '/register': 'Cadastro — Meu Álbum Copa 2026',
      '/forgot-password': 'Recuperar Senha — Meu Álbum Copa 2026',
      '/redefinir-senha': 'Redefinir Senha — Meu Álbum Copa 2026',
      '/confirmar-cadastro': 'Confirmar Cadastro — Meu Álbum Copa 2026',
      '/confirmar-email': 'Confirmar Email — Meu Álbum Copa 2026',
      '/home': 'Início — Meu Álbum Copa 2026',
      '/albums': 'Álbuns — Meu Álbum Copa 2026',
      '/albums/novo': 'Novo Álbum — Meu Álbum Copa 2026',
      '/abrir': 'Abrir Pacotinhos — Meu Álbum Copa 2026',
      '/colar': 'Colar Figurinhas — Meu Álbum Copa 2026',
      '/trocas': 'Trocas — Meu Álbum Copa 2026',
      '/perfil': 'Perfil — Meu Álbum Copa 2026',
    };
    const title = titleMap[location.pathname] ?? 'Meu Álbum Copa 2026';
    document.title = title;
  }, [location.pathname]);

  if (isLoading) return <GlobalLoader />;

  return (
    <>
      <SkipLink />
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="route-announcer" />
      <div className={['flex flex-col min-h-dvh', showBottomNav ? 'max-w-[430px] mx-auto' : ''].join(' ')}>
        <main id="main" className={['flex-1 overflow-y-auto', showBottomNav ? 'pb-16' : ''].join(' ')}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={user ? <Navigate to="/home" replace /> : <LandingPage />} />
            <Route path="/register" element={user ? <Navigate to="/home" replace /> : <RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
            <Route path="/confirmar-cadastro" element={<EmailConfirmationPage />} />
            <Route path="/confirmar-email" element={<ConfirmEmailChangePage />} />

            {/* Protected routes */}
            <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/albums" element={<ProtectedRoute><AlbumsPage /></ProtectedRoute>} />
            <Route path="/albums/novo" element={<ProtectedRoute><CadastroAlbumPage /></ProtectedRoute>} />
            <Route path="/abrir" element={<ProtectedRoute><AbrirPacotinhosPage /></ProtectedRoute>} />
            <Route path="/colar" element={<ProtectedRoute><ColarFigurinhasPage /></ProtectedRoute>} />
            <Route path="/trocas" element={<ProtectedRoute><SwapsPage /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {showBottomNav && <BottomNav />}
        {!showBottomNav && <Footer authenticated={!!user} />}
      </div>
    </>
  );
}
