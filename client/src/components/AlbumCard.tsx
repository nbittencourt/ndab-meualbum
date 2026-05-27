import { Link } from 'react-router-dom';
import type { Album, AlbumVariante } from '@meualbum/shared';

interface VariantStyle {
  background: string;
  border: string;
  shadow: string;
  tagBg: string;
  tagText: string;
  text: string;
}

const VARIANT_STYLES: Record<AlbumVariante, VariantStyle> = {
  BROCHURA: {
    background: '#ffffff',
    border: '1.5px solid #0A0907',
    shadow: 'none',
    tagBg: '#E0DDD5',
    tagText: '#0A0907',
    text: '#0A0907',
  },
  CAPA_DURA: {
    background: '#F5F0E4',
    border: '2px solid #0A0907',
    shadow: '3px 3px 0 #C8C4BC',
    tagBg: '#C8C4BC',
    tagText: '#0A0907',
    text: '#0A0907',
  },
  CAPA_DURA_PRATA: {
    background: 'repeating-linear-gradient(-45deg, #F0EDE4 0px, #F0EDE4 8px, #E0DDD5 8px, #E0DDD5 16px)',
    border: '2px solid #0A0907',
    shadow: '3px 3px 0 #9E9E9E',
    tagBg: '#9E9E9E',
    tagText: '#ffffff',
    text: '#0A0907',
  },
  CAPA_DURA_OURO: {
    background: '#FEF3CC',
    border: '2px solid #8B6914',
    shadow: '3px 3px 0 #C49A1A',
    tagBg: '#C49A1A',
    tagText: '#ffffff',
    text: '#0A0907',
  },
  BOX_PREMIUM: {
    background: '#0A0907',
    border: '2px solid #0A0907',
    shadow: '4px 4px 0 #E5142A',
    tagBg: '#E5142A',
    tagText: '#ffffff',
    text: '#ffffff',
  },
};

const VARIANT_LABELS: Record<AlbumVariante, string> = {
  BROCHURA: 'Brochura',
  CAPA_DURA: 'Capa dura',
  CAPA_DURA_PRATA: 'Capa dura prata',
  CAPA_DURA_OURO: 'Capa dura ouro',
  BOX_PREMIUM: 'Box premium',
};

interface AlbumCardProps {
  album: Album;
}

export function AlbumCard({ album }: AlbumCardProps) {
  const variante = album.variante ?? 'BROCHURA';
  const style = VARIANT_STYLES[variante];
  const pct = album.percentualConclusao;
  const isPremium = variante === 'BOX_PREMIUM';

  const formattedDate = new Date(album.criadoEm).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });

  return (
    <article
      style={{
        background: style.background,
        border: style.border,
        boxShadow: style.shadow,
        padding: '20px',
        transition: 'transform 0.15s ease',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}
    >
      {/* Header row: tag + date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span
          style={{
            background: style.tagBg,
            color: style.tagText,
            fontFamily: '"Geist Mono", monospace',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            padding: '3px 8px',
          }}
        >
          {VARIANT_LABELS[variante]}
        </span>
        <span
          style={{
            fontFamily: '"Geist Mono", monospace',
            fontSize: 10,
            color: isPremium ? 'rgba(255,255,255,0.45)' : 'rgba(10,9,7,0.4)',
            letterSpacing: '0.08em',
          }}
        >
          {formattedDate}
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: '"Archivo Black", sans-serif',
          fontSize: 16,
          color: style.text,
          margin: '0 0 4px',
          lineHeight: 1.2,
        }}
      >
        {album.tipoAlbum?.nome ?? 'Álbum'}
      </h3>

      {/* Subtitle (nome personalizado) — RN-H13 */}
      {album.nomePersonalizado && (
        <p
          style={{
            fontFamily: '"Geist", sans-serif',
            fontSize: 12,
            color: isPremium ? 'rgba(255,255,255,0.6)' : 'rgba(10,9,7,0.6)',
            margin: '0 0 16px',
          }}
        >
          {album.nomePersonalizado}
        </p>
      )}

      {/* Progress — RN-H02 */}
      <div style={{ margin: album.nomePersonalizado ? '0 0 14px' : '16px 0 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span
            style={{
              fontFamily: '"Geist Mono", monospace',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: isPremium ? 'rgba(255,255,255,0.45)' : 'rgba(10,9,7,0.45)',
            }}
          >
            Progresso
          </span>
          <span
            style={{
              fontFamily: '"Archivo Black", sans-serif',
              fontSize: 22,
              color: isPremium ? '#E5142A' : '#0A0907',
              lineHeight: 1,
            }}
          >
            {pct.toFixed(1)}%
          </span>
        </div>
        {/* Progress bar */}
        <div
          style={{
            height: 8,
            background: isPremium ? 'rgba(255,255,255,0.12)' : 'rgba(10,9,7,0.1)',
            border: `1px solid ${isPremium ? 'rgba(255,255,255,0.2)' : 'rgba(10,9,7,0.15)'}`,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, pct)}%`,
              background: '#E5142A',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* CTA — RN-H12 */}
      <Link to={`/colar?albumId=${album._id}`}>
        <button
          style={{
            width: '100%',
            padding: '10px 0',
            border: `1.5px solid ${isPremium ? 'rgba(255,255,255,0.3)' : '#0A0907'}`,
            background: 'transparent',
            color: style.text,
            fontFamily: '"Geist", sans-serif',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.02em',
            transition: 'filter 0.15s ease',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(0.9)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = ''; }}
        >
          Colar figurinhas →
        </button>
      </Link>
    </article>
  );
}
