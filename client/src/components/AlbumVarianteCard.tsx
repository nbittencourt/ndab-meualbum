import type { AlbumVariante } from '@meualbum/shared';

type VariantStyle = {
  label: string;
  background: string;
  border: string;
  shadow: string;
  selectedBorder: string;
  selectedShadow: string;
  tagBg: string;
  tagText: string;
  text: string;
};

const VARIANT_STYLES: Record<AlbumVariante, VariantStyle> = {
  BROCHURA: {
    label: 'Brochura',
    background: '#ffffff',
    border: '1.5px solid #0A0907',
    shadow: 'none',
    selectedBorder: '2px solid #0A0907',
    selectedShadow: '3px 3px 0 #0A0907',
    tagBg: '#E0DDD5',
    tagText: '#0A0907',
    text: '#0A0907',
  },
  CAPA_DURA: {
    label: 'Capa Dura',
    background: '#F5F0E4',
    border: '2px solid #0A0907',
    shadow: '3px 3px 0 #C8C4BC',
    selectedBorder: '2px solid #0A0907',
    selectedShadow: '3px 3px 0 #C8C4BC',
    tagBg: '#C8C4BC',
    tagText: '#0A0907',
    text: '#0A0907',
  },
  CAPA_DURA_PRATA: {
    label: 'Capa Dura Prata',
    background: 'repeating-linear-gradient(135deg, #F0EDE4 0px, #F0EDE4 6px, #E0DDD5 6px, #E0DDD5 14px)',
    border: '2px solid #0A0907',
    shadow: '3px 3px 0 #9E9E9E',
    selectedBorder: '2px solid #9E9E9E',
    selectedShadow: '3px 3px 0 #9E9E9E',
    tagBg: '#9E9E9E',
    tagText: '#ffffff',
    text: '#0A0907',
  },
  CAPA_DURA_OURO: {
    label: 'Capa Dura Ouro',
    background: '#FEF3CC',
    border: '2px solid #8B6914',
    shadow: '3px 3px 0 #C49A1A',
    selectedBorder: '2px solid #8B6914',
    selectedShadow: '3px 3px 0 #C49A1A',
    tagBg: '#C49A1A',
    tagText: '#ffffff',
    text: '#0A0907',
  },
  BOX_PREMIUM: {
    label: 'Box Premium',
    background: '#0A0907',
    border: '2px solid #0A0907',
    shadow: '4px 4px 0 #E5142A',
    selectedBorder: '2px solid #E5142A',
    selectedShadow: '4px 4px 0 #E5142A',
    tagBg: '#E5142A',
    tagText: '#ffffff',
    text: '#ffffff',
  },
};

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
        {s.label}
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
