import { NavLink } from 'react-router-dom';

const links = [
  { to: '/albums', label: 'Álbum', icon: '📖' },
  { to: '/trocas', label: 'Trocas', icon: '🔄' },
  { to: '/perfil', label: 'Perfil', icon: '👤' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-album-gold border-t-2 border-album-gold-dark safe-bottom z-50">
      <ul className="flex">
        {links.map(({ to, label, icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-2 text-xs font-semibold min-h-[44px] transition-colors ${
                  isActive
                    ? 'text-album-brown'
                    : 'text-album-cream/80 hover:text-album-cream'
                }`
              }
            >
              <span className="text-xl leading-none">{icon}</span>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
