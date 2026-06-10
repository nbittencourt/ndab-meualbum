import { NavLink } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/home', label: 'Início' },
  { to: '/albums', label: 'Meus Álbuns' },
  { to: '/abrir', label: 'Abrir Pacotinhos' },
  { to: '/colar', label: 'Colar Figurinhas' },
  { to: '/trocas', label: 'Trocas' },
  { to: '/perfil', label: 'Perfil' },
];

export function DesktopSidebar() {
  return (
    <aside
      className="hidden lg:flex flex-col"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: 228,
        height: '100vh',
        background: '#FBF8EE',
        borderRight: '2px solid #0A0907',
        zIndex: 40,
      }}
      aria-label="Barra lateral"
    >
      {/* Logo area */}
      <div
        style={{
          height: 60,
          borderBottom: '2px solid #0A0907',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            background: '#E5142A',
            border: '2px solid #0A0907',
            boxShadow: '2px 2px 0 #0A0907',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"Archivo Black", sans-serif',
            fontSize: 11,
            color: '#fff',
            transform: 'rotate(-4deg)',
            flexShrink: 0,
          }}
        >
          MA
        </div>
        <span
          style={{
            fontFamily: '"Archivo Black", sans-serif',
            fontSize: 14,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: '#0A0907',
          }}
        >
          Meu Album
        </span>
      </div>

      {/* Navigation */}
      <nav aria-label="Navegação principal" style={{ flex: 1, paddingTop: 8 }}>
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: '11px 20px',
              fontFamily: '"Geist", "Geist Mono", sans-serif',
              fontSize: 13,
              fontWeight: 600,
              color: isActive ? '#E5142A' : '#0A0907',
              background: isActive ? '#F0EDE4' : 'transparent',
              borderLeft: isActive ? '3px solid #E5142A' : '3px solid transparent',
              textDecoration: 'none',
              transition: 'background 0.1s',
            })}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
