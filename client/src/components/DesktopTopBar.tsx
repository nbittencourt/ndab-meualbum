import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

type RouteInfo = { title: string; breadcrumb?: string };

function getRouteInfo(pathname: string): RouteInfo {
  if (pathname === '/home') return { title: 'Início' };
  if (pathname === '/albums/novo') return { title: 'Novo Álbum', breadcrumb: 'Álbuns' };
  if (pathname === '/albums') return { title: 'Meus Álbuns' };
  if (/^\/albums\/[^/]+\/visualizar/.test(pathname)) return { title: 'Visualizar Álbum', breadcrumb: 'Álbuns' };
  if (/^\/albums\/[^/]+/.test(pathname)) return { title: 'Gerenciar Álbum', breadcrumb: 'Álbuns' };
  if (pathname.startsWith('/abrir')) return { title: 'Abrir Pacotinhos' };
  if (pathname.startsWith('/colar')) return { title: 'Colar Figurinhas' };
  if (pathname.startsWith('/trocas')) return { title: 'Trocas' };
  if (pathname.startsWith('/perfil')) return { title: 'Perfil' };
  return { title: '' };
}

export function DesktopTopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { title, breadcrumb } = getRouteInfo(location.pathname);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!title) return null;

  return (
    <div
      className="hidden xl:flex items-center justify-between"
      style={{
        height: 60,
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        background: '#FBF8EE',
        borderBottom: '2px solid #0A0907',
        zIndex: 40,
        flexShrink: 0,
      }}
    >
      {/* Left: breadcrumb + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {breadcrumb && (
          <>
            <span
              style={{
                fontFamily: '"Geist Mono", "Courier New", monospace',
                fontSize: 10,
                textTransform: 'uppercase',
                color: 'rgba(10,9,7,0.45)',
                letterSpacing: '0.08em',
              }}
            >
              {breadcrumb}
            </span>
            <span
              style={{
                fontFamily: '"Geist Mono", monospace',
                fontSize: 10,
                color: 'rgba(10,9,7,0.45)',
                margin: '0 8px',
              }}
            >
              /
            </span>
          </>
        )}
        <h1
          style={{
            fontFamily: '"Archivo Black", sans-serif',
            fontSize: 18,
            textTransform: 'uppercase',
            color: '#0A0907',
            margin: 0,
            lineHeight: 1,
          }}
        >
          {title}
        </h1>
      </div>

      {/* Right: user block + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontFamily: '"Archivo Black", sans-serif',
              fontSize: 13,
              textTransform: 'uppercase',
              lineHeight: 1.05,
              color: '#0A0907',
            }}
          >
            {user?.name}
          </div>
          <div
            style={{
              fontFamily: '"Geist Mono", monospace',
              fontSize: 10,
              color: 'rgba(10,9,7,0.55)',
              letterSpacing: '0.12em',
            }}
          >
            #{user?.publicId}
          </div>
        </div>
        <button
          onClick={handleLogout}
          aria-label="Sair"
          style={{
            width: 34,
            height: 34,
            flexShrink: 0,
            background: 'transparent',
            border: '1.5px solid #0A0907',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 8H2m5-4 4 4-4 4" stroke="#0A0907" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
