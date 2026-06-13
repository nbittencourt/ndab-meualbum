import type { AlbumVariante } from '@meualbum/shared';
import { VARIANT_STYLES, VARIANT_LABELS } from '@/lib/albumVariant';

interface AlbumVarianteCardProps {
  variante: AlbumVariante;
  selected?: boolean;
  onClick?: () => void;
}

export function AlbumVarianteCard({ variante, selected, onClick }: AlbumVarianteCardProps) {
  const s = VARIANT_STYLES[variante];

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      style={{
        background: s.background,
        border: selected ? s.selectedBorder : s.border,
        boxShadow: selected ? s.selectedShadow : s.shadow,
        color: s.text,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 8,
        padding: '12px',
        width: '100%',
        cursor: 'pointer',
        textAlign: 'left',
        outline: 'none',
        transition: 'box-shadow 0.1s ease, border-color 0.1s ease',
      }}
      onFocus={(e) => { e.currentTarget.style.outline = '2px solid #E5142A'; e.currentTarget.style.outlineOffset = '2px'; }}
      onBlur={(e) => { e.currentTarget.style.outline = 'none'; }}
    >
      {/* Variant tag */}
      <div
        style={{
          background: s.tagBg,
          color: s.tagText,
          fontFamily: '"Geist Mono", "Courier New", monospace',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '2px 6px',
        }}
      >
        {VARIANT_LABELS[variante]}
      </div>

      {/* Preview box */}
      <div
        style={{
          width: '100%',
          height: 48,
          background: s.background,
          border: s.border,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: '"Archivo Black", sans-serif',
            fontSize: 10,
            fontWeight: 900,
            textTransform: 'uppercase',
            color: s.text,
            opacity: 0.4,
          }}
        >
          Álbum
        </span>
      </div>

      {/* Selected checkmark */}
      {selected && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ alignSelf: 'flex-end' }}>
          <circle cx="8" cy="8" r="8" fill="#0A9145" />
          <path d="M4.5 8l2.5 2.5 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
