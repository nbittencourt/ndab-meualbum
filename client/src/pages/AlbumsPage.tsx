import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { albumsApi, ApiError } from '@/lib/api';
import { AppHeader } from '@/components/AppHeader';
import type { Album } from '@meualbum/shared';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { VARIANT_STYLES, VARIANT_LABELS } from '@/lib/albumVariant';
import { ListaFigurinhasModal } from '@/components/ListaFigurinhasModal';

function AlbumCard({ album, onDesarquivar }: { album: Album; onDesarquivar?: (id: string) => void }) {
  const navigate = useNavigate();
  const [showListaModal, setShowListaModal] = useState(false);
  const arquivado = !!album.arquivadoEm;
  const variante = album.variante ?? 'BROCHURA';
  const s = VARIANT_STYLES[variante];
  const nomeExibido = album.nomePersonalizado || album.tipoAlbum.nome;

  return (
    <>
      <article
        style={{ background: s.background, border: s.border, boxShadow: s.shadow, padding: 16 }}
        aria-label={`Álbum ${nomeExibido}, ${album.percentualConclusao}% completo${arquivado ? ', arquivado' : ''}`}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
          <div>
            <span
              style={{
                display: 'inline-block',
                background: s.tagBg,
                color: s.tagText,
                fontFamily: '"Geist Mono", monospace',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                padding: '2px 6px',
                marginBottom: 6,
              }}
            >
              {VARIANT_LABELS[variante]}
            </span>
            <h2
              style={{
                fontFamily: '"Archivo Black", sans-serif',
                fontSize: 15,
                color: s.text,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {nomeExibido}
            </h2>
          </div>
          {arquivado && (
            <span className="text-[10px] font-mono font-semibold uppercase bg-ink/10 text-ink/70 px-2 py-0.5 border border-ink/20 shrink-0">
              Arquivado
            </span>
          )}
        </div>

        <ProgressBar value={album.percentualConclusao} label="Progresso" className="mb-4" />

        <div className="flex gap-2 flex-wrap">
          {!arquivado && (
            <>
              <Button size="sm" variant="primary" onClick={() => navigate(`/albums/${album._id}`)}>
                Gerenciar
              </Button>
              <Button size="sm" variant="secondary" onClick={() => navigate(`/figurinhas?albumId=${album._id}`)}>
                Colar figurinhas
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setShowListaModal(true)}>
                Figurinhas que faltam
              </Button>
            </>
          )}
          {arquivado && (
            <Button size="sm" variant="secondary" onClick={() => onDesarquivar?.(album._id)}>
              Desarquivar
            </Button>
          )}
        </div>
      </article>

      <ListaFigurinhasModal
        open={showListaModal}
        onClose={() => setShowListaModal(false)}
        albumId={album._id}
        albumNome={nomeExibido}
      />
    </>
  );
}

export default function AlbumsPage() {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['albums'],
    queryFn: albumsApi.list,
    staleTime: 0,
  });

  const desarquivarMut = useMutation({
    mutationFn: albumsApi.desarquivar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
    onError: (err) => {
      setActionError(err instanceof ApiError ? err.message : 'Erro ao desarquivar álbum.');
    },
  });

  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <AppHeader />
      <div className="px-4 py-3 border-b-2 border-ink flex items-center justify-between gap-2">
        <h1 className="font-display text-xl font-black text-ink uppercase tracking-wide">Meus Álbuns</h1>
        <Link to="/albums/novo">
          <Button size="sm" variant="primary" aria-label="Criar novo álbum">+ Novo</Button>
        </Link>
      </div>

      <div className="flex-1 p-4 xl:p-8 flex flex-col gap-6">
        {isLoading && (
          <div className="flex justify-center py-12" aria-busy="true" aria-label="Carregando álbuns">
            <div className="w-8 h-8 border-2 border-ink border-t-red rounded-full animate-spin" aria-hidden="true" />
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-dark font-body">Erro ao carregar álbuns.</p>
        )}

        {actionError && (
          <p role="alert" className="text-sm text-red-dark font-body">⚠ {actionError}</p>
        )}

        {data && (
          <>
            <section aria-labelledby="ativos-heading">
              <h2 id="ativos-heading" className="font-display text-sm font-black uppercase tracking-wide text-ink mb-3">
                Ativos ({data.ativos.length})
              </h2>
              {data.ativos.length === 0 ? (
                <div className="border-2 border-dashed border-ink/20 p-6 text-center">
                  <p className="text-sm font-body text-ink/70 mb-2">Nenhum álbum ativo.</p>
                  <Link to="/albums/novo" className="text-sm text-red-dark underline hover:brightness-90">
                    + Novo álbum
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  {data.ativos.map((album) => (
                    <AlbumCard key={album._id} album={album} />
                  ))}
                </div>
              )}
            </section>

            {data.arquivados.length > 0 && (
              <section aria-labelledby="arquivados-heading">
                <h2 id="arquivados-heading" className="font-display text-sm font-black uppercase tracking-wide text-ink mb-3">
                  Álbuns arquivados ({data.arquivados.length})
                </h2>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  {data.arquivados.map((album) => (
                    <AlbumCard key={album._id} album={album} onDesarquivar={(id) => desarquivarMut.mutate(id)} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
