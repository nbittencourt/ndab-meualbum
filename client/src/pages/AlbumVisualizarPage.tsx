import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { albumsApi } from '@/lib/api';
import { AppHeader } from '@/components/AppHeader';

export default function AlbumVisualizarPage() {
  const { id } = useParams<{ id: string }>();

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

  const { album, secoes } = albumData;
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

      <div className="flex-1 p-4 flex flex-col gap-4">
        {secoes.map((secao) => {
          const faltantesDaSecao = faltantesData?.faltantes.filter((f) => f.secaoId === secao._id) ?? [];
          return (
            <section key={secao._id} aria-labelledby={`secao-${secao._id}`}>
              <h2
                id={`secao-${secao._id}`}
                className="font-display text-sm font-black uppercase tracking-wide text-ink mb-2"
              >
                {secao.nome}
              </h2>
              <ul className="flex flex-col gap-1">
                {/* Faltantes */}
                {faltantesDaSecao.map((f) => (
                  <li
                    key={f.numero}
                    className="flex items-center justify-between bg-white border border-ink/20 px-3 py-2"
                  >
                    <span className="font-mono text-sm font-bold text-ink">{f.numero}</span>
                    {f.nome && <span className="text-xs font-body text-ink/60 flex-1 ml-2 truncate">{f.nome}</span>}
                    <span className="text-xs font-body text-ink/50 shrink-0 ml-2">Faltante</span>
                  </li>
                ))}
                {/* Coladas: total - faltantes na seção */}
                {Array.from({ length: secao.figurinhasColadas }).map((_, i) => (
                  <li
                    key={`colada-${secao._id}-${i}`}
                    className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2"
                  >
                    <span className="text-xs font-body text-green-800 font-semibold">Colada</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
