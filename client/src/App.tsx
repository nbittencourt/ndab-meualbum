import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SkipLink } from '@/components/ui/SkipLink';
import { CookieBanner } from '@/components/CookieBanner';
import { hasValidConsent, saveConsent } from '@/lib/cookieConsent';

import { DesktopSidebar } from '@/components/DesktopSidebar';
import LandingPage from '@/pages/LandingPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import EmailConfirmationPage from '@/pages/EmailConfirmationPage';
import ConfirmEmailChangePage from '@/pages/ConfirmEmailChangePage';
import HomePage from '@/pages/HomePage';
import AlbumsPage from '@/pages/AlbumsPage';
import AlbumManagePage from '@/pages/AlbumManagePage';
import AlbumVisualizarPage from '@/pages/AlbumVisualizarPage';
import CadastroAlbumPage from '@/pages/CadastroAlbumPage';
import AbrirPacotinhosPage from '@/pages/AbrirPacotinhosPage';
import ColarFigurinhasPage from '@/pages/ColarFigurinhasPage';
import SwapsPage from '@/pages/SwapsPage';
import ProfilePage from '@/pages/ProfilePage';
import PoliticaPrivacidadePage from '@/pages/PoliticaPrivacidadePage';

function GlobalLoader() {
  return (
    <div className="flex items-center justify-center min-h-dvh bg-paper" aria-busy="true" aria-label="Carregando">
      <div className="w-8 h-8 border-2 border-ink border-t-red rounded-full animate-spin" aria-hidden="true" />
    </div>
  );
}

function Footer() {
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
      </nav>
    </footer>
  );
}

export default function App() {
  const { checkAuth, setReady, user, isLoading } = useAuthStore();
  const location = useLocation();
  const [showCookieBanner, setShowCookieBanner] = useState(() => !hasValidConsent());

  useEffect(() => {
    const noAuthRoutes = ["/redefinir-senha", "/confirmar-cadastro", "/confirmar-email", "/register", "/forgot-password", "/politica-de-privacidade"];
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
      "/": "Início — Meu Álbum Copa 2026",
      "/register": "Cadastro — Meu Álbum Copa 2026",
      "/forgot-password": "Recuperar Senha — Meu Álbum Copa 2026",
      "/redefinir-senha": "Redefinir Senha — Meu Álbum Copa 2026",
      "/confirmar-cadastro": "Confirmar Cadastro — Meu Álbum Copa 2026",
      "/confirmar-email": "Confirmar Email — Meu Álbum Copa 2026",
      "/home": "Meus Álbuns — Meu Álbum Copa 2026",
      "/albums": "Álbuns — Meu Álbum Copa 2026",
      "/albums/novo": "Novo Álbum — Meu Álbum Copa 2026",
      "/abrir": "Abrir Pacotinhos — Meu Álbum Copa 2026",
      "/colar": "Colar Figurinhas — Meu Álbum Copa 2026",
      "/trocas": "Trocas — Meu Álbum Copa 2026",
      "/perfil": "Perfil — Meu Álbum Copa 2026",
      "/politica-de-privacidade": "Política de Privacidade — Meu Álbum Copa 2026",
    };
    const title = titleMap[location.pathname] ?? "Meu Álbum Copa 2026";
    document.title = title;
  }, [location.pathname]);

  if (isLoading) return <GlobalLoader />;

  return (
    <>
      <SkipLink />
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="route-announcer" />
      <div className="flex flex-col min-h-dvh">
        {user && <DesktopSidebar />}
        <main id="main" className={`flex-1 overflow-y-auto lg:pl-[228px] ${showCookieBanner ? 'pb-[140px]' : ''}`}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={user ? <Navigate to="/home" replace /> : <LandingPage />} />
            <Route path="/register" element={user ? <Navigate to="/home" replace /> : <RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
            <Route path="/confirmar-cadastro" element={<EmailConfirmationPage />} />
            <Route path="/confirmar-email" element={<ConfirmEmailChangePage />} />
            <Route path="/politica-de-privacidade" element={<PoliticaPrivacidadePage />} />

            {/* Protected routes */}
            <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/albums" element={<ProtectedRoute><AlbumsPage /></ProtectedRoute>} />
            <Route path="/albums/novo" element={<ProtectedRoute><CadastroAlbumPage /></ProtectedRoute>} />
            <Route path="/albums/:id/visualizar" element={<ProtectedRoute><AlbumVisualizarPage /></ProtectedRoute>} />
            <Route path="/albums/:id" element={<ProtectedRoute><AlbumManagePage /></ProtectedRoute>} />
            <Route path="/abrir" element={<ProtectedRoute><AbrirPacotinhosPage /></ProtectedRoute>} />
            <Route path="/colar" element={<ProtectedRoute><ColarFigurinhasPage /></ProtectedRoute>} />
            <Route path="/trocas" element={<ProtectedRoute><SwapsPage /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* Redirects para rotas em inglês / nomes antigos */}
            <Route path="/profile"         element={<Navigate to="/perfil"      replace />} />
            <Route path="/swaps"           element={<Navigate to="/trocas"      replace />} />
            <Route path="/albums/cadastro" element={<Navigate to="/albums/novo" replace />} />
            <Route path="/privacidade"     element={<Navigate to="/politica-de-privacidade" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        {showCookieBanner && (
          <CookieBanner
            onAccept={() => { saveConsent(true, true); setShowCookieBanner(false); }}
            onDecline={() => { saveConsent(false, false); setShowCookieBanner(false); }}
          />
        )}
      </div>
    </>
  );
}
