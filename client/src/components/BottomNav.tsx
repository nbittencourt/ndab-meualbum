import { NavLink } from 'react-router-dom';
import { BookOpen, ArrowRightLeft, User } from 'lucide-react';

const links = [
  { to: '/albums', label: 'Álbum',  Icon: BookOpen },
  { to: '/trocas', label: 'Trocas', Icon: ArrowRightLeft },
  { to: '/perfil', label: 'Perfil', Icon: User },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-paper border-t-2 border-ink/20 safe-bottom z-50 lg:hidden"
      aria-label="Navegação principal"
    >
      <ul className="flex">
        {links.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold min-h-[44px] transition-colors ${
                  isActive ? 'text-red' : 'text-ink/50 hover:text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} aria-hidden="true" />
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
