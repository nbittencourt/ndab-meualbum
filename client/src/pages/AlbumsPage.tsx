import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { albumsApi, ApiError } from '@/lib/api';
import { AppHeader } from '@/components/AppHeader';
import type { Album, AlbumVariante } from '@meualbum/shared';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

type VariantStyle = {
  background: string;
  border: string;
  shadow: string;
  tagBg: string;
  tagText: string;
  text: string;
};

const VARIANT_STYLES: Record<AlbumVariante, VariantStyle> = {
  BROCHURA: { background: '#ffffff', border: '1.5px solid #0A0907', shadow: 'none', tagBg: '#E0DDD5', tagText: '#0A0907', text: '#0A0907' },
  CAPA_DURA: { background: '#F5F0E4', border: '2px solid #0A0907', shadow: '3px 3px 0 #C8C4BC', tagBg: '#C8C4BC', tagText: '#0A0907', text: '#0A0907' },
  CAPA_DURA_PRATA: { background: 'repeating-linear-gradient(-45deg, #F0EDE4 0px, #F0EDE4 8px, #E0DDD5 8px, #E0DDD5 16px)', border: '2px solid #0A0907', shadow: '3px 3px 0 #9E9E9E', tagBg: '#9E9E9E', tagText: '#ffffff', text: '#0A0907' },
  CAPA_DURA_OURO: { background: '#FEF3CC', border: '2px solid #8B6914', shadow: '3px 3px 0 #C49A1A', tagBg: '#C49A1A', tagText: '#ffffff', text: '#0A0907' },
  BOX_PREMIUM: { background: '#0A0907', border: '2px solid #0A0907', shadow: '4px 4px 0 #E5142A', tagBg: '#E5142A', tagText: '#ffffff', text: '#ffffff' },
};

const VARIANT_LABELS: Record<AlbumVariante, string> = {
  BROCHURA: 'Brochura', CAPA_DURA: 'Capa Dura',
  CAPA_DURA_PRATA: 'Capa Dura Prata', CAPA_DURA_OURO: 'Capa Dura Ouro', BOX_PREMIUM: 'Box Premium',
};

function AlbumCard({ album, onDesarquivar }: { album: Album; onDesarquivar?: (id: string) => void }) {
  const navigate = useNavigate();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const arquivado = !!album.arquivadoEm;
  const variante = album.variante ?? 'BROCHURA';
  const s = VARIANT_STYLES[variante];
  const nomeExibido = album.nomePersonalizado || album.tipoAlbum.nome;

  async function handleBaixarPdf() {
    setPdfLoading(true);
    setPdfError('');
    try {
      await albumsApi.baixarPdf(album._id);
    } catch {
      setPdfError('Erro ao gerar PDF.');
    } finally {
      setPdfLoading(false);
    }
  }

  return (
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
          <span className="text-[10px] font-mono font-semibold uppercase bg-ink/10 text-ink/50 px-2 py-0.5 border border-ink/20 shrink-0">
            Arquivado
          </span>
        )}
      </div>

      <ProgressBar value={album.percentualConclusao} label="Progresso" className="mb-4" />

      {pdfError && <p role="alert" className="text-xs text-red font-body mb-2">⚠ {pdfError}</p>}

      <div className="flex gap-2 flex-wrap">
        {!arquivado && (
          <>
            <Button size="sm" variant="primary" disabled={pdfLoading} onClick={() => navigate(`/albums/${album._id}`)}>
              Gerenciar
            </Button>
            <Button size="sm" variant="secondary" disabled={pdfLoading} onClick={() => navigate(`/colar?albumId=${album._id}`)}>
              Colar figurinhas
            </Button>
            <Button size="sm" variant="secondary" loading={pdfLoading} onClick={handleBaixarPdf}>
              Baixar PDF
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

      <div className="flex-1 p-4 flex flex-col gap-6">
        {isLoading && (
          <div className="flex justify-center py-12" aria-busy="true" aria-label="Carregando álbuns">
            <div className="w-8 h-8 border-2 border-ink border-t-red rounded-full animate-spin" aria-hidden="true" />
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-red font-body">Erro ao carregar álbuns.</p>
        )}

        {actionError && (
          <p role="alert" className="text-sm text-red font-body">⚠ {actionError}</p>
        )}

        {data && (
          <>
            <section aria-labelledby="ativos-heading">
              <h2 id="ativos-heading" className="font-display text-sm font-black uppercase tracking-wide text-ink mb-3">
                Ativos ({data.ativos.length})
              </h2>
              {data.ativos.length === 0 ? (
                <div className="border-2 border-dashed border-ink/20 p-6 text-center">
                  <p className="text-sm font-body text-ink/50 mb-2">Nenhum álbum ativo.</p>
                  <Link to="/albums/novo" className="text-sm text-red underline hover:brightness-90">
                    + Novo álbum
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
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
                <div className="flex flex-col gap-3">
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
