import { NavLink } from 'react-router-dom';
import { BookOpen, ArrowRightLeft, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

const links = [
  { to: '/albums', label: 'Álbum',  Icon: BookOpen },
  { to: '/trocas', label: 'Trocas', Icon: ArrowRightLeft },
  { to: '/perfil', label: 'Perfil', Icon: User },
];

export default function SideNav() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav
      className="hidden lg:flex fixed left-0 top-0 h-full w-[220px] bg-paper border-r-2 border-ink/20 flex-col z-40"
      aria-label="Navegação lateral"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-ink/10">
        <div
          aria-hidden="true"
          style={{
            width: 28,
            height: 28,
            background: '#E5142A',
            transform: 'rotate(-4deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ color: '#fff', fontFamily: '"Archivo Black", sans-serif', fontSize: 11 }}>MA</span>
        </div>
        <span className="font-display text-sm font-black text-ink">Meu Álbum</span>
      </div>

      {/* Links */}
      <ul className="flex flex-col gap-1 p-3 flex-1">
        {links.map(({ to, label, Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-colors rounded-sm ${
                  isActive
                    ? 'bg-red/10 text-red'
                    : 'text-ink/60 hover:text-ink hover:bg-ink/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 1.75} aria-hidden="true" />
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* User info + logout */}
      {user && (
        <div className="border-t border-ink/10 px-4 py-4">
          <p className="text-xs font-semibold text-ink truncate">{user.name}</p>
          <p className="font-mono text-[10px] text-ink/40 mb-3">#{user.publicId}</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-body text-ink/50 hover:text-ink transition-colors"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair
          </button>
        </div>
      )}
    </nav>
  );
}
