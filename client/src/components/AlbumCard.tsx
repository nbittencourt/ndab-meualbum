import { Link, useNavigate } from 'react-router-dom';
import type { Album } from '@meualbum/shared';
import { VARIANT_STYLES, VARIANT_LABELS } from '@/lib/albumVariant';

interface AlbumCardProps {
  album: Album;
}

export function AlbumCard({ album }: AlbumCardProps) {
  const navigate = useNavigate();
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
      role="link"
      tabIndex={0}
      aria-label={`Gerenciar álbum ${album.tipoAlbum?.nome ?? 'Álbum'} — ${VARIANT_LABELS[variante]}`}
      onClick={() => navigate(`/albums/${album._id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          navigate(`/albums/${album._id}`);
        }
      }}
      style={{
        background: style.background,
        border: style.border,
        boxShadow: style.shadow,
        padding: '20px',
        transition: 'transform 0.15s ease',
        cursor: 'pointer',
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
            color: isPremium ? 'rgba(255,255,255,0.7)' : 'rgba(10,9,7,0.62)',
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
            color: isPremium ? 'rgba(255,255,255,0.75)' : 'rgba(10,9,7,0.62)',
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
              color: isPremium ? 'rgba(255,255,255,0.7)' : 'rgba(10,9,7,0.62)',
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
        {/* Progress bar — RN-H21 */}
        <div
          role="progressbar"
          aria-valuenow={Math.round(pct * 10) / 10}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${pct.toFixed(1)}% concluído`}
          aria-label="Progresso de conclusão do álbum"
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
      <Link to={`/colar?albumId=${album._id}`} onClick={(e) => e.stopPropagation()}>
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
