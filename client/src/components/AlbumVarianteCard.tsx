import type { AlbumVariante } from '@meualbum/shared';

const varianteConfig: Record<AlbumVariante, { label: string; bg: string; border: string; tag: string }> = {
  BROCHURA: { label: 'Brochura', bg: 'bg-cream', border: 'border-ink', tag: 'bg-ink text-white' },
  CAPA_DURA: { label: 'Capa Dura', bg: 'bg-blue/10', border: 'border-blue', tag: 'bg-blue text-white' },
  CAPA_DURA_PRATA: { label: 'Capa Dura Prata', bg: 'bg-gray-100', border: 'border-gray-400', tag: 'bg-gray-500 text-white' },
  CAPA_DURA_OURO: { label: 'Capa Dura Ouro', bg: 'bg-yellow-50', border: 'border-yellow-500', tag: 'bg-yellow-500 text-white' },
  BOX_PREMIUM: { label: 'Box Premium', bg: 'bg-red/5', border: 'border-red', tag: 'bg-red text-white' },
};

interface AlbumVarianteCardProps {
  variante: AlbumVariante;
  selected?: boolean;
  onClick?: () => void;
}

export function AlbumVarianteCard({ variante, selected, onClick }: AlbumVarianteCardProps) {
  const cfg = varianteConfig[variante];

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={[
        'flex flex-col items-center gap-2 p-4 border-2 transition-all text-left w-full',
        'focus:outline-none focus:ring-2 focus:ring-red focus:ring-offset-2',
        cfg.bg,
        selected ? `${cfg.border} [box-shadow:3px_3px_0_currentColor]` : 'border-ink/30 hover:border-ink',
      ].join(' ')}
    >
      <div className={`px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wide ${cfg.tag}`}>
        {cfg.label}
      </div>
      <div className={[
        'w-full h-16 border',
        cfg.border,
        cfg.bg,
        'flex items-center justify-center',
      ].join(' ')}>
        <span className="font-display text-xs font-black uppercase text-ink/40">
          Álbum
        </span>
      </div>
      {selected && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="8" fill="#0A9145" />
          <path d="M4.5 8l2.5 2.5 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
