import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { albumsApi, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

const VARIANTE_LABEL: Record<string, string> = {
  BROCHURA: 'Brochura', CAPA_DURA: 'Capa Dura',
  CAPA_DURA_PRATA: 'Capa Dura Prata', CAPA_DURA_OURO: 'Capa Dura Ouro', BOX_PREMIUM: 'Box Premium',
};

export default function AlbumManagePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [confirmarArquivar, setConfirmarArquivar] = useState(false);
  const [arquivarError, setArquivarError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['album', id],
    queryFn: () => albumsApi.get(id!),
    enabled: !!id,
  });

  const { data: faltantesData } = useQuery({
    queryKey: ['album-faltantes', id],
    queryFn: () => albumsApi.faltantes(id!),
    enabled: !!id,
  });

  const arquivarMut = useMutation({
    mutationFn: () => albumsApi.arquivar(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      navigate('/albums');
    },
    onError: (err) => {
      setArquivarError(err instanceof ApiError ? err.message : 'Erro ao arquivar álbum.');
    },
  });

  function toggleSection(secaoId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(secaoId)) next.delete(secaoId);
      else next.add(secaoId);
      return next;
    });
  }

  async function handleBaixarPdf() {
    setPdfLoading(true);
    setPdfError('');
    try {
      await albumsApi.baixarPdf(id!);
    } catch {
      setPdfError('Erro ao gerar PDF.');
    } finally {
      setPdfLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-paper flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ink border-t-red rounded-full animate-spin" aria-hidden="true" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-dvh bg-paper p-4">
        <p role="alert" className="text-sm text-red font-body">Álbum não encontrado.</p>
        <Button size="sm" variant="secondary" className="mt-3" onClick={() => navigate('/albums')}>
          ← Voltar
        </Button>
      </div>
    );
  }

  const { album, secoes } = data;
  const nomeExibido = album.nomePersonalizado || album.tipoAlbum.nome;
  const faltantesPorSecao = new Map<string, Array<{ numero: string; nome: string }>>();
  faltantesData?.faltantes.forEach((f) => {
    const arr = faltantesPorSecao.get(f.secaoId) ?? [];
    arr.push({ numero: f.numero, nome: f.nome });
    faltantesPorSecao.set(f.secaoId, arr);
  });

  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <header className="sticky top-0 z-10 bg-paper border-b border-ink/10 px-4 py-3">
        <button
          onClick={() => navigate('/albums')}
          className="text-sm font-body text-ink/60 hover:text-ink mb-2"
          aria-label="Voltar para lista de álbuns"
        >
          ← Álbuns
        </button>
        <h1 className="font-display text-xl font-black text-ink uppercase tracking-wide leading-tight">
          {nomeExibido}
        </h1>
        <p className="text-xs font-mono text-ink/50 mt-0.5">
          {album.tipoAlbum.nome} · {VARIANTE_LABEL[album.variante] ?? album.variante}
        </p>
        <div className="mt-2">
          <ProgressBar value={album.percentualConclusao} label="Progresso" />
        </div>
      </header>

      {/* Action bar */}
      <div className="px-4 py-3 border-b border-ink/10 flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant="primary"
          disabled={pdfLoading || arquivarMut.isPending}
          onClick={() => navigate(`/colar?albumId=${album._id}`)}
        >
          Colar figurinhas
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={pdfLoading || arquivarMut.isPending}
          onClick={() => navigate(`/albums/${album._id}/visualizar`)}
        >
          Ver Álbum
        </Button>
        <Button
          size="sm"
          variant="secondary"
          loading={pdfLoading}
          disabled={arquivarMut.isPending}
          onClick={handleBaixarPdf}
        >
          Baixar PDF
        </Button>
        {!confirmarArquivar && (
          <Button
            size="sm"
            variant="secondary"
            disabled={pdfLoading || arquivarMut.isPending}
            onClick={() => { setConfirmarArquivar(true); setArquivarError(''); }}
          >
            Arquivar
          </Button>
        )}
        {confirmarArquivar && (
          <>
            <Button
              size="sm"
              loading={arquivarMut.isPending}
              disabled={pdfLoading}
              style={{ backgroundColor: '#0A0907', color: '#fff', borderColor: '#0A0907' }}
              onClick={() => arquivarMut.mutate()}
            >
              Confirmar arquivamento
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={pdfLoading || arquivarMut.isPending}
              onClick={() => { setConfirmarArquivar(false); setArquivarError(''); }}
            >
              Cancelar
            </Button>
          </>
        )}
      </div>

      {pdfError && <p role="alert" className="px-4 pt-2 text-xs text-red font-body">⚠ {pdfError}</p>}
      {arquivarError && <p role="alert" className="px-4 pt-2 text-xs text-red font-body">⚠ {arquivarError}</p>}

      {/* Sections */}
      <div className="flex-1 p-4 flex flex-col gap-2">
        {secoes.map((secao) => {
          const isExpanded = expanded.has(secao._id);
          const faltantes = faltantesPorSecao.get(secao._id) ?? [];
          const completed = secao.figurinhasColadas >= secao.totalFigurinhas;
          return (
            <div key={secao._id} className="bg-white border-2 border-ink [box-shadow:2px_2px_0_#0A0907]">
              <button
                className="w-full flex items-center justify-between p-3 text-left"
                aria-expanded={isExpanded}
                aria-label={`Expandir seção ${secao.nome}`}
                onClick={() => toggleSection(secao._id)}
              >
                <span className="font-display text-sm font-black text-ink">{secao.nome}</span>
                <span className="flex items-center gap-2">
                  <span className="text-xs font-mono text-ink/50">
                    {secao.figurinhasColadas}/{secao.totalFigurinhas}
                  </span>
                  <span className="text-ink/50 text-xs">{isExpanded ? '▲' : '▼'}</span>
                </span>
              </button>
              {isExpanded && (
                <div className="border-t border-ink/10 p-3">
                  {completed ? (
                    <p className="text-sm font-body text-green-700 font-semibold">✓ Seção completa!</p>
                  ) : faltantes.length === 0 && !faltantesData ? (
                    <div className="flex justify-center py-4">
                      <div className="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                    </div>
                  ) : (
                    <ul className="flex flex-col gap-1">
                      {faltantes.map((f) => (
                        <li
                          key={f.numero}
                          data-testid="figurinha-faltante"
                          aria-label={`Faltante: ${f.numero} ${f.nome}`}
                          className="text-xs font-body text-ink/70 py-0.5"
                        >
                          <span className="font-mono font-bold text-ink">{f.numero}</span>
                          {f.nome && <span className="ml-2">{f.nome}</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
