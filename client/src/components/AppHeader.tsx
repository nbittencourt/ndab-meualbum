import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { SideMenu } from './SideMenu';

interface AppHeaderProps {
  back?: boolean;
}

const PAGE_TITLES: Record<string, string> = {
  '/home': 'Início',
  '/albums': 'Meus Álbuns',
  '/albums/novo': 'Novo Álbum',
  '/abrir': 'Abrir Pacotinhos',
  '/colar': 'Colar Figurinhas',
  '/trocas': 'Trocas',
  '/perfil': 'Perfil',
};

export function AppHeader({ back = false }: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleBack = () => navigate(-1);

  // Resolve page title: match exact path, or strip dynamic segment for base match
  const pageTitle =
    PAGE_TITLES[location.pathname] ??
    PAGE_TITLES[location.pathname.replace(/\/[^/]+$/, '')] ??
    'Meu Álbum';

  return (
    <>
      <header className="flex items-center justify-between px-4 lg:px-8" style={{
        height: 60,
        borderBottom: '2px solid #0A0907',
        background: '#FBF8EE',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {back ? (
            <button
              onClick={handleBack}
              aria-label="Voltar"
              style={{
                width: 36, height: 36, flexShrink: 0,
                background: 'transparent', border: '1.5px solid #0A0907',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M10 3 5 8l5 5" stroke="#0A0907" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : null}

          {/* Hamburger brand — mobile only (<lg). No desktop: marca vive na sidebar. */}
          <button
            className="lg:hidden flex items-center gap-2"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu de navegação"
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: 0,
            }}
          >
            <div style={{
              width: 28, height: 28, background: '#E5142A',
              border: '2px solid #0A0907', boxShadow: '2px 2px 0 #0A0907',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Archivo Black", sans-serif', fontSize: 11, color: '#fff',
              transform: 'rotate(-4deg)', flexShrink: 0,
            }}>MA</div>
            <span style={{
              fontFamily: '"Archivo Black", sans-serif', fontSize: 14,
              letterSpacing: '0.04em', textTransform: 'uppercase', color: '#0A0907',
            }}>
              Meu Album
            </span>
          </button>

          {/* Page title — desktop only (≥lg). Modelo MATopBar: marca na sidebar, header mostra contexto. */}
          <div
            className="hidden lg:flex items-center"
            aria-hidden="true"
          >
            <span style={{
              fontFamily: '"Archivo Black", sans-serif',
              fontSize: 14,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#0A0907',
            }}>
              {pageTitle}
            </span>
          </div>
        </div>

        {/* User block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: '"Archivo Black", sans-serif', fontSize: 12,
              textTransform: 'uppercase', lineHeight: 1.05, color: '#0A0907',
            }}>
              {user?.name}
            </div>
            <div style={{
              fontFamily: '"Geist Mono", monospace', fontSize: 10,
              color: 'rgba(10,9,7,0.55)', letterSpacing: '0.12em',
            }}>
              #{user?.publicId}
            </div>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Sair"
            style={{
              width: 32, height: 32, flexShrink: 0,
              background: 'transparent', border: '1.5px solid #0A0907',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 8H2m5-4 4 4-4 4" stroke="#0A0907" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
