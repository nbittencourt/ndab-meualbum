import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { albumsApi, ApiError } from '@/lib/api';
import type { Album } from '@meualbum/shared';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';

function AlbumCard({ album, onArquivar }: { album: Album; onArquivar?: (id: string) => void }) {
  const navigate = useNavigate();
  const arquivado = !!album.arquivadoEm;
  const varianteLabel: Record<string, string> = {
    BROCHURA: 'Brochura', CAPA_DURA: 'Capa Dura',
    CAPA_DURA_PRATA: 'Capa Dura Prata', CAPA_DURA_OURO: 'Capa Dura Ouro', BOX_PREMIUM: 'Box Premium',
  };

  const nomeExibido = album.nomePersonalizado || album.tipoAlbum.nome;

  return (
    <article
      className="bg-white border-2 border-ink [box-shadow:3px_3px_0_#0A0907] p-4"
      aria-label={`Álbum ${nomeExibido}, ${album.percentualConclusao}% completo${arquivado ? ', arquivado' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h2 className="font-display text-base font-black text-ink leading-tight">{nomeExibido}</h2>
          <p className="text-xs font-mono text-ink/50 mt-0.5">{varianteLabel[album.variante] ?? album.variante}</p>
        </div>
        {arquivado && (
          <span className="text-[10px] font-mono font-semibold uppercase bg-ink/10 text-ink/50 px-2 py-0.5 border border-ink/20">
            Arquivado
          </span>
        )}
      </div>
      <ProgressBar value={album.percentualConclusao} label="Progresso" className="mb-4" />
      <div className="flex gap-2 flex-wrap">
        {!arquivado && (
          <>
            <Button size="sm" variant="primary" onClick={() => navigate(`/colar?albumId=${album._id}`)}>
              Colar figurinhas
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onArquivar?.(album._id)}>
              Arquivar
            </Button>
          </>
        )}
        {arquivado && (
          <Button size="sm" variant="secondary" onClick={() => onArquivar?.(album._id)}>
            Desarquivar
          </Button>
        )}
      </div>
    </article>
  );
}

export default function AlbumsPage() {
  const queryClient = useQueryClient();
  const [arquivarId, setArquivarId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['albums'],
    queryFn: albumsApi.list,
  });

  const arquivarMut = useMutation({
    mutationFn: (id: string) => {
      const album = [...(data?.ativos ?? []), ...(data?.arquivados ?? [])].find((a) => a._id === id);
      return album?.arquivadoEm ? albumsApi.desarquivar(id) : albumsApi.arquivar(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      setArquivarId(null);
    },
    onError: (err) => {
      setActionError(err instanceof ApiError ? err.message : 'Erro ao arquivar álbum.');
    },
  });

  function handleArquivarClick(id: string) {
    const album = [...(data?.ativos ?? []), ...(data?.arquivados ?? [])].find((a) => a._id === id);
    if (!album?.arquivadoEm) {
      setArquivarId(id);
    } else {
      arquivarMut.mutate(id);
    }
  }

  return (
    <div className="min-h-dvh bg-paper p-4 flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-xl font-black text-ink uppercase tracking-wide">Meus Álbuns</h1>
        <Link to="/albums/novo">
          <Button size="sm" variant="primary" aria-label="Criar novo álbum">+ Novo</Button>
        </Link>
      </header>

      {isLoading && (
        <div className="flex justify-center py-12" aria-busy="true" aria-label="Carregando álbuns">
          <div className="w-8 h-8 border-2 border-ink border-t-red rounded-full animate-spin" aria-hidden="true" />
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red font-body">Erro ao carregar álbuns.</p>
      )}

      {data && (
        <>
          <section aria-labelledby="ativos-heading">
            <h2 id="ativos-heading" className="font-display text-sm font-black uppercase tracking-wide text-ink mb-3">
              Ativos ({data.ativos.length})
            </h2>
            {data.ativos.length === 0 ? (
              <div className="border-2 border-dashed border-ink/20 p-6 text-center">
                <p className="text-sm font-body text-ink/50">Nenhum álbum ativo.</p>
                <Link to="/albums/novo" className="mt-2 inline-block text-sm text-red underline hover:brightness-90">
                  Criar primeiro álbum
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {data.ativos.map((album) => (
                  <AlbumCard key={album._id} album={album} onArquivar={handleArquivarClick} />
                ))}
              </div>
            )}
          </section>

          {data.arquivados.length > 0 && (
            <section aria-labelledby="arquivados-heading">
              <h2 id="arquivados-heading" className="font-display text-sm font-black uppercase tracking-wide text-ink mb-3">
                Arquivados ({data.arquivados.length})
              </h2>
              <div className="flex flex-col gap-3">
                {data.arquivados.map((album) => (
                  <AlbumCard key={album._id} album={album} onArquivar={handleArquivarClick} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <Modal
        open={!!arquivarId}
        onClose={() => setArquivarId(null)}
        title="Arquivar álbum"
        variant="alertdialog"
      >
        <p className="text-sm font-body text-ink/70 mb-6">
          Álbuns arquivados não aparecem na home e não recebem novas colagens. Você pode desarquivar a qualquer momento.
        </p>
        {actionError && <p role="alert" className="text-xs text-red mb-3">⚠ {actionError}</p>}
        <div className="flex gap-2">
          <Button
            variant="danger"
            loading={arquivarMut.isPending}
            onClick={() => arquivarId && arquivarMut.mutate(arquivarId)}
          >
            Arquivar
          </Button>
          <Button variant="secondary" onClick={() => setArquivarId(null)}>Cancelar</Button>
        </div>
      </Modal>
    </div>
  );
}
