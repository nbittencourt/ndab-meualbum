import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
}

const NAV_LINKS = [
  { to: '/home',   label: 'Início' },
  { to: '/albums', label: 'Meus Álbuns' },
  { to: '/abrir',  label: 'Abrir Pacotinhos' },
  { to: '/colar',  label: 'Colar Figurinhas' },
  { to: '/trocas', label: 'Trocas' },
  { to: '/perfil', label: 'Perfil' },
];

export function SideMenu({ open, onClose }: SideMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a, button, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200 }}
      aria-hidden="false"
    >
      {/* Backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(10,9,7,0.6)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
          maxWidth: 320,
          background: '#FBF8EE',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '2px solid #0A0907',
        }}
      >
        {/* Panel header */}
        <div style={{
          height: 60,
          borderBottom: '2px solid #0A0907',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, background: '#E5142A',
              border: '2px solid #0A0907', boxShadow: '2px 2px 0 #0A0907',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Archivo Black", sans-serif', fontSize: 11, color: '#fff',
              transform: 'rotate(-4deg)', flexShrink: 0,
            }}>MA</div>
            <span style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 14, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#0A0907' }}>
              Meu Album
            </span>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Fechar menu"
            style={{
              width: 32, height: 32, flexShrink: 0,
              background: 'transparent', border: '1.5px solid #0A0907',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="#0A0907" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav aria-label="Navegação principal" style={{ flex: 1, overflowY: 'auto' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={onClose}
                  style={({ isActive }) => ({
                    display: 'block',
                    padding: '16px 20px',
                    fontFamily: '"Archivo Black", sans-serif',
                    fontSize: 14,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase' as const,
                    textDecoration: 'none',
                    color: '#0A0907',
                    borderBottom: '1px solid rgba(10,9,7,0.18)',
                    borderLeft: isActive ? '3px solid #E5142A' : '3px solid transparent',
                    background: isActive ? 'rgba(229,20,42,0.06)' : 'transparent',
                  })}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
