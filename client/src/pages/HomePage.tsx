import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { homeApi } from '@/lib/api';
import { AlbumCard } from '@/components/AlbumCard';
import { StickerRankItem } from '@/components/StickerRankItem';
import { AppHeader } from '@/components/AppHeader';

// ─── FAB ──────────────────────────────────────────────────────────────────────
function FAB() {
  return (
    <Link to="/abrir">
      <button
        style={{
          position: 'fixed',
          bottom: 80,
          right: 'max(16px, calc((100vw - 430px) / 2 + 16px))',
          background: '#E5142A',
          border: '2px solid #0A0907',
          color: '#fff',
          fontFamily: '"Archivo Black", sans-serif',
          fontSize: 13,
          padding: '12px 18px',
          cursor: 'pointer',
          zIndex: 200,
          boxShadow: '3px 3px 0 #0A0907',
          transition: 'box-shadow 0.15s ease',
          letterSpacing: '0.02em',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
        aria-label="Abrir pacotinhos"
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '5px 5px 0 #0A0907'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '3px 3px 0 #0A0907'; }}
      >
        + Abrir
      </button>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ height = 120 }: { height?: number }) {
  return (
    <div
      style={{
        height,
        background: 'linear-gradient(90deg, #e8e2d4 25%, #f2ede4 50%, #e8e2d4 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s infinite',
        border: '1.5px solid rgba(10,9,7,0.1)',
      }}
    />
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section style={{ margin: '16px 16px 0' }}>
      <div
        style={{
          background: '#0A0907',
          border: '2.5px solid #0A0907',
          boxShadow: '5px 5px 0 #E5142A',
          padding: '22px 20px',
        }}
      >
        <p
          style={{
            fontFamily: '"Geist Mono", monospace',
            fontSize: 10,
            color: 'rgba(255,255,255,0.45)',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            margin: '0 0 8px',
          }}
        >
          Nova remessa disponível
        </p>
        <h2
          style={{
            fontFamily: '"Archivo Black", sans-serif',
            fontSize: 28,
            color: '#fff',
            margin: '0 0 8px',
            lineHeight: 1.1,
          }}
        >
          Abrir Pacotinhos
        </h2>
        <p style={{ fontFamily: '"Geist", sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '0 0 18px', lineHeight: 1.5 }}>
          Adicione novas figurinhas à sua coleção e veja o álbum evoluir.
        </p>
        <Link to="/abrir">
          <button
            style={{
              background: '#E5142A',
              border: '1.5px solid rgba(255,255,255,0.2)',
              color: '#fff',
              fontFamily: '"Geist", sans-serif',
              fontSize: 13,
              fontWeight: 600,
              padding: '10px 18px',
              cursor: 'pointer',
              transition: 'filter 0.15s ease',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(0.9)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = ''; }}
          >
            Abrir pacotinhos →
          </button>
        </Link>
      </div>
    </section>
  );
}

// ─── Paginação ────────────────────────────────────────────────────────────────
interface PaginacaoProps {
  pagina: number;
  total: number;
  onChange: (p: number) => void;
}

function Paginacao({ pagina, total, onChange }: PaginacaoProps) {
  if (total <= 1) return null;
  return (
    <nav aria-label="paginação" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, padding: '12px 0' }}>
      <button
        disabled={pagina <= 1}
        onClick={() => onChange(pagina - 1)}
        aria-label="Página anterior"
        style={{ background: 'none', border: '1.5px solid #0A0907', padding: '6px 12px', cursor: pagina > 1 ? 'pointer' : 'not-allowed', opacity: pagina <= 1 ? 0.3 : 1, fontFamily: '"Geist", sans-serif', fontSize: 13 }}
      >
        ← Anterior
      </button>
      <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: 12, color: 'rgba(10,9,7,0.5)' }}>
        {pagina} / {total}
      </span>
      <button
        disabled={pagina >= total}
        onClick={() => onChange(pagina + 1)}
        aria-label="Próxima página"
        style={{ background: 'none', border: '1.5px solid #0A0907', padding: '6px 12px', cursor: pagina < total ? 'pointer' : 'not-allowed', opacity: pagina >= total ? 0.3 : 1, fontFamily: '"Geist", sans-serif', fontSize: 13 }}
      >
        Próxima →
      </button>
    </nav>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [pagina, setPagina] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['home', pagina],
    queryFn: () => homeApi.getHome(pagina),
    staleTime: 0,
  });

  return (
    <>
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative' }}>
      <AppHeader />
      <FAB />

      <div style={{ paddingBottom: 80 }}>
        {/* CTA Banner — RN-H14 sempre visível */}
        <CTABanner />

        {/* ── Seção Meus Álbuns ──────────────────────────────────── */}
        <section style={{ padding: '24px 16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h2 style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 20, color: '#0A0907', margin: 0 }}>
                Meus Álbuns
              </h2>
              <Link to="/albums" style={{ fontFamily: '"Geist", sans-serif', fontSize: 12, color: 'rgba(10,9,7,0.5)', textDecoration: 'underline' }}>
                Ver todos os álbuns
              </Link>
            </div>
            <Link to="/albums/novo">
              <button
                style={{
                  background: '#E5142A',
                  border: '1.5px solid #0A0907',
                  boxShadow: '2px 2px 0 #0A0907',
                  color: '#fff',
                  fontFamily: '"Geist", sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '7px 12px',
                  cursor: 'pointer',
                  transition: 'filter 0.15s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(0.9)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = ''; }}
              >
                + Novo álbum
              </button>
            </Link>
          </div>

          {isLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Skeleton height={160} />
              <Skeleton height={160} />
            </div>
          )}

          {isError && (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <p style={{ fontFamily: '"Geist", sans-serif', fontSize: 14, color: 'rgba(10,9,7,0.6)', marginBottom: 12 }}>
                Erro ao carregar álbuns.
              </p>
              <button
                onClick={() => refetch()}
                style={{ background: 'none', border: '1.5px solid #0A0907', padding: '6px 14px', cursor: 'pointer', fontFamily: '"Geist", sans-serif', fontSize: 13 }}
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Estado vazio — RN-H03 */}
          {!isLoading && !isError && data?.totalAlbums === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                border: '1.5px dashed rgba(10,9,7,0.2)',
                background: '#F0E9D6',
              }}
            >
              <p style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 16, color: '#0A0907', marginBottom: 8 }}>
                Nenhum álbum ainda
              </p>
              <p style={{ fontFamily: '"Geist", sans-serif', fontSize: 13, color: 'rgba(10,9,7,0.55)', marginBottom: 18 }}>
                Crie seu primeiro álbum para começar a colar figurinhas.
              </p>
              <Link to="/albums/novo">
                <button
                  style={{
                    background: '#E5142A',
                    border: '2px solid #0A0907',
                    boxShadow: '3px 3px 0 #0A0907',
                    color: '#fff',
                    fontFamily: '"Geist", sans-serif',
                    fontSize: 13,
                    fontWeight: 600,
                    padding: '10px 20px',
                    cursor: 'pointer',
                  }}
                >
                  + Criar álbum
                </button>
              </Link>
            </div>
          )}

          {/* Lista de álbuns — RN-H04 */}
          {!isLoading && !isError && data && data.totalAlbums > 0 && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {data.albums.map((album) => (
                  <AlbumCard key={String(album._id)} album={album} />
                ))}
              </div>
              {/* Paginação — RN-H05 só se >5 álbuns */}
              {data.totalAlbums > 5 && (
                <Paginacao pagina={pagina} total={data.totalPaginas} onChange={setPagina} />
              )}
            </>
          )}
        </section>

        {/* ── Seção Figurinhas Repetidas ────────────────────────── */}
        <section style={{ padding: '32px 16px 24px' }}>
          <h2 style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 20, color: '#0A0907', margin: '0 0 4px' }}>
            Figurinhas Repetidas
          </h2>

          {/* Total — RN-H10 */}
          {!isLoading && data && (
            <p style={{ fontFamily: '"Geist Mono", monospace', fontSize: 11, color: 'rgba(10,9,7,0.45)', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Total:{' '}
              <span style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 24, color: '#E5142A', verticalAlign: 'middle' }}>
                {data.totalRepetidas}
              </span>
            </p>
          )}

          {isLoading && <Skeleton height={200} />}

          {/* Estado vazio — RN-H11 */}
          {!isLoading && !isError && data?.totalRepetidas === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '32px 20px',
                border: '1.5px dashed rgba(10,9,7,0.2)',
                background: '#F0E9D6',
              }}
            >
              <p style={{ fontFamily: '"Geist", sans-serif', fontSize: 13, color: 'rgba(10,9,7,0.55)' }}>
                Nenhuma figurinha repetida no seu estoque.
              </p>
            </div>
          )}

          {/* Lista top 5 — RN-H07/08/09 */}
          {!isLoading && !isError && data && data.figurinhasRepetidas.length > 0 && (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {data.figurinhasRepetidas.map((item, i) => (
                <StickerRankItem key={item.figurinhaId} item={item} rank={i + 1} />
              ))}
            </ul>
          )}
        </section>

        {/* Footer */}
        <footer
          style={{
            borderTop: '1px solid rgba(10,9,7,0.1)',
            padding: '16px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontFamily: '"Geist", sans-serif', fontSize: 12, color: 'rgba(10,9,7,0.4)', margin: 0 }}>
            Não-oficial · Feito por colecionadores · 2026
          </p>
        </footer>
      </div>
      </div>
    </>
  );
}
