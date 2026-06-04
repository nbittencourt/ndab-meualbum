import { useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { albumsApi } from '@/lib/api';
import { AppHeader } from '@/components/AppHeader';

type Secao = { _id: string; nome: string; ordem: number; totalFigurinhas: number; figurinhasColadas: number };
type Faltante = { numero: string; nome: string; secaoId: string };

type VItem =
  | { type: 'header'; id: string; nome: string }
  | { type: 'faltante'; id: string; numero: string; nome: string }
  | { type: 'colada'; id: string };

export default function AlbumVisualizarPage() {
  const { id } = useParams<{ id: string }>();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: albumData, isLoading } = useQuery({
    queryKey: ['album', id],
    queryFn: () => albumsApi.get(id!),
    enabled: !!id,
  });

  const { data: faltantesData, isLoading: faltantesLoading } = useQuery({
    queryKey: ['album-faltantes', id],
    queryFn: () => albumsApi.faltantes(id!),
    enabled: !!id,
  });

  const allItems = useMemo<VItem[]>(() => {
    if (!albumData || !faltantesData) return [];
    const { secoes } = albumData as { album: unknown; secoes: Secao[] };
    const faltantes: Faltante[] = faltantesData.faltantes;

    return secoes.flatMap((s) => {
      const sf = faltantes.filter((f) => f.secaoId === s._id);
      return [
        { type: 'header' as const, id: `h-${s._id}`, nome: s.nome },
        ...sf.map((f) => ({ type: 'faltante' as const, id: `f-${f.numero}`, numero: f.numero, nome: f.nome })),
        ...Array.from({ length: s.figurinhasColadas }, (_, i) => ({
          type: 'colada' as const,
          id: `c-${s._id}-${i}`,
        })),
      ];
    });
  }, [albumData, faltantesData]);

  const virtualizer = useVirtualizer({
    count: allItems.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (i) => (allItems[i]?.type === 'header' ? 40 : 44),
    overscan: 12,
  });

  if (isLoading || faltantesLoading) {
    return (
      <div className="min-h-dvh bg-paper flex flex-col">
        <AppHeader back />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-ink border-t-red rounded-full animate-spin" aria-hidden="true" />
        </div>
      </div>
    );
  }

  if (!albumData) {
    return (
      <div className="min-h-dvh bg-paper flex flex-col">
        <AppHeader back />
        <div className="p-4">
          <p role="alert" className="text-sm text-red font-body">Álbum não encontrado.</p>
        </div>
      </div>
    );
  }

  const { album } = albumData as { album: { nomePersonalizado?: string; tipoAlbum: { nome: string }; percentualConclusao: number }; secoes: Secao[] };
  const nomeExibido = album.nomePersonalizado || album.tipoAlbum.nome;

  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <AppHeader back />
      <div className="sticky top-[60px] z-10 bg-paper border-b border-ink/10 px-4 py-3">
        <h1 className="font-display text-xl font-black text-ink uppercase tracking-wide">
          {nomeExibido}
        </h1>
        <p className="text-xs font-mono text-ink/50">{album.percentualConclusao}% completo</p>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-2"
      >
        {allItems.length === 0 ? (
          <p className="text-sm font-body text-ink/50 py-8 text-center">Nenhuma figurinha registrada neste álbum.</p>
        ) : (
          <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
            {virtualizer.getVirtualItems().map((vRow) => {
              const item = allItems[vRow.index];
              return (
                <div
                  key={item.id}
                  style={{
                    position: 'absolute',
                    top: vRow.start,
                    left: 0,
                    right: 0,
                    height: vRow.size,
                  }}
                >
                  {item.type === 'header' && (
                    <h2 className="font-display text-sm font-black uppercase tracking-wide text-ink flex items-end pb-1 h-full border-b border-ink/10">
                      {item.nome}
                    </h2>
                  )}
                  {item.type === 'faltante' && (
                    <div className="flex items-center justify-between bg-white border border-ink/20 px-3 h-[40px] mx-0 my-[2px]">
                      <span className="font-mono text-sm font-bold text-ink">{item.numero}</span>
                      {item.nome && (
                        <span className="text-xs font-body text-ink/60 flex-1 ml-2 truncate">{item.nome}</span>
                      )}
                      <span className="text-xs font-body text-ink/50 shrink-0 ml-2">Faltante</span>
                    </div>
                  )}
                  {item.type === 'colada' && (
                    <div className="flex items-center bg-green-50 border border-green-200 px-3 h-[40px] mx-0 my-[2px]">
                      <span className="text-xs font-body text-green-800 font-semibold">Colada</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
