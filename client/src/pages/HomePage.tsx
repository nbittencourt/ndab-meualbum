import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { homeApi } from '@/lib/api';
import { AlbumCard } from '@/components/AlbumCard';
import { StickerRankItem } from '@/components/StickerRankItem';
import { AppHeader } from '@/components/AppHeader';
import type { StickerRankItem as StickerRankItemType } from '@meualbum/shared';

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

// ─── Desktop table for Figurinhas Repetidas ────────────────────────────────────
function RepetidasTabela({ items }: { items: StickerRankItemType[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #0A0907' }}>
          {['#', 'FIG.', 'JOGADOR', 'QTD'].map((col) => (
            <th
              key={col}
              style={{
                fontFamily: '"Geist Mono", monospace',
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'rgba(10,9,7,0.45)',
                padding: '8px 12px 8px 0',
                textAlign: col === 'QTD' ? 'right' : 'left',
              }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => {
          const isFirst = i === 0;
          return (
            <tr
              key={item.figurinhaId}
              style={{ borderBottom: '1px solid rgba(10,9,7,0.08)' }}
            >
              <td style={{
                fontFamily: '"Geist Mono", monospace',
                fontSize: 12,
                color: isFirst ? '#E5142A' : 'rgba(10,9,7,0.4)',
                fontWeight: isFirst ? 700 : 400,
                padding: '12px 12px 12px 0',
                width: 32,
              }}>
                {i + 1}
              </td>
              <td style={{
                fontFamily: '"Geist Mono", monospace',
                fontSize: 12,
                color: 'rgba(10,9,7,0.55)',
                padding: '12px 12px 12px 0',
                width: 72,
              }}>
                #{item.numero}
              </td>
              <td style={{
                fontFamily: '"Geist", sans-serif',
                fontSize: 13,
                fontWeight: 600,
                color: '#0A0907',
                padding: '12px 12px 12px 0',
              }}>
                {item.nome}
              </td>
              <td style={{
                textAlign: 'right',
                padding: '12px 0',
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  background: isFirst ? '#E5142A' : '#0A0907',
                  fontFamily: '"Archivo Black", sans-serif',
                  fontSize: 16,
                  color: '#fff',
                  lineHeight: 1,
                }}>
                  {item.quantidade}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
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

      {/* Wrapper: mobile centra em 480px; desktop preenche a coluna de conteúdo (lg:max-w-none) */}
      <div className="max-w-[480px] mx-auto lg:max-w-none">
        <AppHeader />
        <FAB />

        <div style={{ paddingBottom: 112 }}>

          {/* ── CTA Banner — RN-H14 ────────────────────────────────── */}
          <section className="px-4 pt-4 lg:px-8 lg:pt-6">
            <CTABanner />
          </section>

          {/* ── Seção Meus Álbuns ──────────────────────────────────── */}
          <section className="px-4 pt-6 lg:px-8 lg:pt-8">
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
              /* On desktop: show 2-column skeleton */
              <div className="flex flex-col gap-[14px] lg:grid lg:grid-cols-2 lg:gap-4">
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

            {/* Lista de álbuns — RN-H04.
                Mobile: coluna única (flex-col). Desktop: 2 colunas (lg:grid-cols-2). */}
            {!isLoading && !isError && data && data.totalAlbums > 0 && (
              <>
                <div className="flex flex-col gap-[14px] lg:grid lg:grid-cols-2 lg:gap-4">
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
          <section className="px-4 pt-8 pb-6 lg:px-8">
            {/* Header: título + badge total (RN-H10) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 20, color: '#0A0907', margin: 0 }}>
                Figurinhas Repetidas
              </h2>
              {/* Total badge — top-right per artboard */}
              {!isLoading && data && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#0A0907',
                  padding: '4px 10px',
                  border: '1.5px solid #0A0907',
                }}>
                  <span style={{
                    fontFamily: '"Archivo Black", sans-serif',
                    fontSize: 16,
                    color: '#E5142A',
                    lineHeight: 1,
                  }}>
                    {data.totalRepetidas}
                  </span>
                  <span style={{
                    fontFamily: '"Geist Mono", monospace',
                    fontSize: 9,
                    color: 'rgba(255,255,255,0.55)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                  }}>
                    no estoque
                  </span>
                </div>
              )}
            </div>

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

            {/* Lista top 5 — RN-H07/08/09
                Mobile: StickerRankItem (card com imagem).
                Desktop: tabela com colunas # / FIG. / JOGADOR / QTD. */}
            {!isLoading && !isError && data && data.figurinhasRepetidas.length > 0 && (
              <>
                {/* Mobile list */}
                <ul className="lg:hidden" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {data.figurinhasRepetidas.map((item, i) => (
                    <StickerRankItem key={item.figurinhaId} item={item} rank={i + 1} />
                  ))}
                </ul>

                {/* Desktop table */}
                <div className="hidden lg:block">
                  <RepetidasTabela items={data.figurinhasRepetidas} />
                </div>
              </>
            )}
          </section>

          {/* Footer */}
          <footer
            className="px-4 lg:px-8"
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
