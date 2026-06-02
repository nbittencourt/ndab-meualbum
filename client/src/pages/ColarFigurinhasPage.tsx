import { useState, useId, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colarFigurinhasApi, albumsApi, ApiError } from '@/lib/api';
import type { EstoqueItem } from '@meualbum/shared';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { StickerStatusBadge } from '@/components/StickerStatusBadge';

type ToastVariant = 'success' | 'error' | 'info';
type ToastState = { message: string; variant: ToastVariant } | null;

const VARIANT_LABELS: Record<string, string> = {
  BROCHURA: 'Brochura', CAPA_DURA: 'Capa Dura',
  CAPA_DURA_PRATA: 'Capa Dura Prata', CAPA_DURA_OURO: 'Capa Dura Ouro', BOX_PREMIUM: 'Box Premium',
};
function variantLabel(v: string) { return VARIANT_LABELS[v] ?? v; }

export default function ColarFigurinhasPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const albumIdFromUrl = searchParams.get('albumId');
  const [albumId, setAlbumId] = useState(albumIdFromUrl ?? '');
  const [busca, setBusca] = useState('');
  const [toast, setToast] = useState<ToastState>(null);
  const showToast = (message: string, variant: ToastVariant = 'info') => setToast({ message, variant });
  const [showMfnModal, setShowMfnModal] = useState(false);
  const [mfnNumero, setMfnNumero] = useState('');
  const [mfnError, setMfnError] = useState('');
  const mfnKeepOpenRef = useRef(false);

  const resultsId = useId();

  const { data: albumsData, isLoading: albumsLoading } = useQuery({
    queryKey: ['albums'],
    queryFn: albumsApi.list,
  });
  const ativos = albumsData?.ativos ?? [];

  const albumSelecionado = ativos.find((a) => a._id === albumId) ?? null;

  const { data: estoqueData, isLoading: estoqueLoading } = useQuery({
    queryKey: ['estoque', albumId],
    queryFn: () => colarFigurinhasApi.getEstoque(albumId || undefined),
    enabled: !!albumId,
  });

  const estoque = estoqueData?.itens ?? [];
  const filtrado = busca.trim()
    ? estoque.filter(
        (i) =>
          i.figurinha.number.toLowerCase().includes(busca.toLowerCase()) ||
          i.figurinha.subject?.toLowerCase().includes(busca.toLowerCase())
      )
    : estoque;

  const colarMut = useMutation({
    mutationFn: ({ estoqueId, albumIdTarget }: { estoqueId: string; albumIdTarget: string }) =>
      colarFigurinhasApi.colar(estoqueId, albumIdTarget),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque', albumId] });
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      showToast('Figurinha colada!', 'success');
    },
    onError: (err) => showToast(err instanceof ApiError ? err.message : 'Erro ao colar.', 'error'),
  });

  const mfnMut = useMutation({
    mutationFn: ({ numero, albumIdTarget }: { numero: string; albumIdTarget: string }) =>
      colarFigurinhasApi.colarDireta(numero, albumIdTarget),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque', albumId] });
      if (mfnKeepOpenRef.current) {
        setMfnNumero('');
        setMfnError('');
        mfnKeepOpenRef.current = false;
      } else {
        setShowMfnModal(false);
        setMfnNumero('');
        showToast('Figurinha colada diretamente!', 'success');
      }
    },
    onError: (err) => {
      mfnKeepOpenRef.current = false;
      setMfnError(err instanceof ApiError ? err.message : 'Erro ao colar.');
    },
  });

  if (!albumId || albumsLoading || !albumSelecionado) {
    return (
      <div className="min-h-dvh bg-paper flex flex-col">
        <AppHeader back />
        <div className="p-4 flex flex-col gap-4">
        <h1 className="font-display text-xl font-black text-ink uppercase tracking-wide">Colar Figurinhas</h1>
        {albumsLoading ? (
          <div className="flex justify-center py-12" aria-busy="true" aria-label="Carregando álbuns">
            <div className="w-8 h-8 border-2 border-ink border-t-red rounded-full animate-spin" aria-hidden="true" />
          </div>
        ) : (
          <>
            <p className="text-sm font-body text-ink/70">Escolha um álbum</p>
            {ativos.length === 0 ? (
              <div className="border-2 border-dashed border-ink/20 p-6 text-center">
                <p className="text-sm font-body text-ink/50 mb-3">Nenhum álbum ativo.</p>
                <Button size="sm" onClick={() => navigate('/albums/novo')}>Criar álbum</Button>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {ativos.map((album) => (
                  <li key={album._id}>
                    <button
                      className="w-full text-left p-4 bg-white border-2 border-ink [box-shadow:3px_3px_0_#0A0907] font-body text-sm text-ink hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                      onClick={() => setAlbumId(album._id)}
                    >
                      <span className="font-bold">{album.nomePersonalizado || album.tipoAlbum?.nome}</span>
                      {album.variante && (
                        <span className="block text-xs text-ink/60 mt-0.5">{variantLabel(album.variante)}</span>
                      )}
                      <span className="block text-xs text-ink/50 mt-0.5">{album.percentualConclusao}% completo</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <AppHeader back />
      <div className="p-4 flex flex-col gap-4 pb-24 flex-1">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-xl font-black text-ink uppercase tracking-wide">Colar Figurinhas</h1>
          <p className="text-xs font-body text-ink/50 mt-0.5">{albumSelecionado?.nomePersonalizado || albumSelecionado?.tipoAlbum.nome}</p>
          <p className="text-xs font-mono text-ink/60 mt-0.5">{albumSelecionado?.percentualConclusao ?? 0}% completo</p>
        </div>
        {ativos.length > 1 && (
          <Button size="sm" variant="secondary" onClick={() => setAlbumId('')}>Trocar álbum</Button>
        )}
      </div>

      <Input
        label="Buscar figurinha"
        type="search"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Número ou nome..."
        aria-controls={resultsId}
        autoComplete="off"
      />

      <div id={resultsId} aria-live="polite" aria-atomic="false">
        <p className="sr-only">
          {estoqueLoading ? 'Carregando estoque...' : `${filtrado.length} figurinha${filtrado.length !== 1 ? 's' : ''} encontrada${filtrado.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      <Button
        size="sm"
        variant="secondary"
        className="self-start"
        onClick={() => {
          setMfnNumero('');
          setMfnError('');
          setShowMfnModal(true);
        }}
      >
        Colar figurinha não registrada
      </Button>

      {estoqueLoading && (
        <div className="flex justify-center py-8" aria-busy="true" aria-label="Carregando estoque">
          <div className="w-6 h-6 border-2 border-ink border-t-red rounded-full animate-spin" aria-hidden="true" />
        </div>
      )}

      {!estoqueLoading && filtrado.length === 0 && (
        <div className="border-2 border-dashed border-ink/20 p-6 text-center">
          <p className="text-sm font-body text-ink/50">
            {busca ? 'Nenhuma figurinha encontrada para essa busca.' : 'Estoque vazio.'}
          </p>
        </div>
      )}

      {!estoqueLoading && filtrado.length > 0 && (
        <section aria-label="Estoque de figurinhas">
          <div className="flex flex-col gap-2">
            {filtrado.map((item) => (
              <StickerRow
                key={item._id as string}
                item={item}
                onColar={() => colarMut.mutate({ estoqueId: item._id as string, albumIdTarget: albumId })}
                loading={colarMut.isPending}
              />
            ))}
          </div>
        </section>
      )}

      <Modal
        open={showMfnModal}
        onClose={() => { setShowMfnModal(false); setMfnError(''); }}
        title="Colar figurinha não registrada"
      >
        <p className="text-sm font-body text-ink/70 mb-4">
          Digite o número da figurinha que deseja colar diretamente no álbum (sem passar pelo estoque).
        </p>
        <Input
          label="Número da figurinha"
          value={mfnNumero}
          onChange={(e) => { setMfnNumero(e.target.value.toUpperCase()); setMfnError(''); }}
          placeholder="Ex.: 42 ou BR01"
          autoComplete="off"
          error={mfnError || undefined}
          autoFocus
        />
        <div className="flex gap-2 mt-4 flex-wrap">
          <Button
            loading={mfnMut.isPending}
            disabled={!mfnNumero.trim()}
            onClick={() => mfnMut.mutate({ numero: mfnNumero.trim(), albumIdTarget: albumId })}
          >
            Colar
          </Button>
          <Button
            variant="secondary"
            loading={mfnMut.isPending}
            disabled={!mfnNumero.trim()}
            onClick={() => {
              mfnKeepOpenRef.current = true;
              mfnMut.mutate({ numero: mfnNumero.trim(), albumIdTarget: albumId });
            }}
          >
            Colar e Outra
          </Button>
          <Button variant="secondary" onClick={() => { setShowMfnModal(false); setMfnError(''); }}>Cancelar</Button>
        </div>
        <div className="mt-3 pt-3 border-t border-ink/10">
          <Button size="sm" variant="secondary" onClick={() => {}}>
            Abrir câmera
          </Button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />}
      </div>
    </div>
  );
}

function StickerRow({
  item,
  onColar,
  loading,
}: {
  item: EstoqueItem;
  onColar: () => void;
  loading: boolean;
}) {
  const [confirmar, setConfirmar] = useState(false);
  const canPaste = item.elegibilidade === 'PODE_COLAR' || item.elegibilidade === 'JA_COLADA';

  function handleColarClick() {
    if (item.elegibilidade === 'JA_COLADA') {
      setConfirmar(true);
    } else {
      onColar();
    }
  }

  return (
    <article
      className="bg-white border-2 border-ink p-3"
      aria-label={`Figurinha ${item.figurinha.number}${item.figurinha.subject ? `, ${item.figurinha.subject}` : ''}, ${item.quantidade} no estoque`}
    >
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold text-sm text-ink shrink-0">{item.figurinha.number}</span>
        {item.figurinha.subject && (
          <span className="text-xs font-body text-ink/60 flex-1 truncate">{item.figurinha.subject}</span>
        )}
        <StickerStatusBadge status={item.elegibilidade} />
        <span className="text-xs font-mono text-ink/50 shrink-0">{item.quantidade}</span>
        {canPaste && !confirmar && (
          <Button size="sm" variant="primary" loading={loading} onClick={handleColarClick}>
            Colar
          </Button>
        )}
      </div>
      {confirmar && (
        <div className="mt-2 pt-2 border-t border-ink/10">
          <p className="text-xs font-body text-ink/70 mb-2">
            Esta figurinha já está colada. Deseja substituí-la?
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="primary"
              loading={loading}
              onClick={() => { setConfirmar(false); onColar(); }}
            >
              Confirmar
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setConfirmar(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}
