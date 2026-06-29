import { useState, useRef, useEffect, useId } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBlocker, useSearchParams } from 'react-router-dom';
import { abrirPacotinhosApi, albumsApi, colarFigurinhasApi, ApiError } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { AppHeader } from '@/components/AppHeader';
import type { PilhaDaSessao, EstoqueItem } from '@meualbum/shared';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { StickerStatusBadge } from '@/components/StickerStatusBadge';
import { VARIANT_LABELS } from '@/lib/albumVariant';

const MAX_PENDENTE = 100;

type ToastVariant = 'success' | 'error' | 'info';
type ToastState = { message: string; variant: ToastVariant } | null;

function PilhaTag({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) {
  return (
    <span
      style={{
        background: bg,
        color,
        fontFamily: '"Geist Mono", "Courier New", monospace',
        fontSize: 9,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        padding: '1px 5px',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

// ── Repetidas da coleção ──────────────────────────────────────────────────────

function RepetidaRow({
  item,
  preAlbumId,
  onColar,
  colarLoading,
  onDescartar,
  descartarLoading,
  onAdicionar,
  adicionarLoading,
}: {
  item: EstoqueItem;
  preAlbumId: string;
  onColar: (estoqueId: string, targetAlbumId: string) => void;
  colarLoading: boolean;
  onDescartar: (estoqueId: string) => void;
  descartarLoading: boolean;
  onAdicionar: (figurinhaNumero: string) => void;
  adicionarLoading: boolean;
}) {
  const [showColarModal, setShowColarModal] = useState(false);
  const [showDescartarModal, setShowDescartarModal] = useState(false);
  const [albumId, setAlbumId] = useState(preAlbumId);
  const canPaste = item.elegibilidade === 'PODE_COLAR' || item.elegibilidade === 'JA_COLADA';

  const { data: albumsData } = useQuery({
    queryKey: ['albums'],
    queryFn: albumsApi.list,
    enabled: showColarModal,
  });
  const ativos = albumsData?.ativos ?? [];

  function handleColar() {
    if (preAlbumId) {
      onColar(item._id as string, preAlbumId);
    } else {
      setAlbumId('');
      setShowColarModal(true);
    }
  }

  // RN-CF31: decremento direto quando há mais de uma unidade; a confirmação só
  // é exigida na última unidade, pois a ação removeria o item do estoque.
  function handleDescartar() {
    if (item.quantidade > 1) {
      onDescartar(item._id as string);
    } else {
      setShowDescartarModal(true);
    }
  }

  return (
    <article
      className="bg-white border-2 border-ink p-3"
      aria-label={`Figurinha ${item.figurinha.number}${item.figurinha.subject ? `, ${item.figurinha.subject}` : ''}, ${item.quantidade} no estoque`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-mono font-bold text-sm text-ink shrink-0">{item.figurinha.number}</span>
        {item.figurinha.subject && (
          <span className="text-xs font-body text-ink/60 flex-1 min-w-0 truncate">{item.figurinha.subject}</span>
        )}
        <StickerStatusBadge status={item.elegibilidade} />
        <span className="text-xs font-mono text-ink/70 shrink-0">×{item.quantidade}</span>
        {canPaste && (
          <Button size="sm" variant="primary" loading={colarLoading} onClick={handleColar}>
            Colar
          </Button>
        )}
        {/* RN-CF30 — incrementa a quantidade (estoque) reutilizando /estoque/adicionar.
            RN-WG18: aria-label fixo e descritivo; o rótulo textual reduz a "+" em telas estreitas. */}
        <Button
          size="sm"
          variant="secondary"
          loading={adicionarLoading}
          onClick={() => onAdicionar(item.figurinha.number)}
          aria-label="Adicionar repetida"
        >
          <span className="hidden sm:inline">+ Repetida</span>
          <span className="sm:hidden" aria-hidden="true">+</span>
        </Button>
        <Button
          size="sm"
          variant="secondary"
          loading={descartarLoading}
          onClick={handleDescartar}
          aria-label="Descartar uma unidade"
        >
          <span className="hidden sm:inline">Descartar</span>
          <span className="sm:hidden" aria-hidden="true">−</span>
        </Button>
      </div>

      {/* Modal de seleção de álbum */}
      <Modal open={showColarModal} onClose={() => setShowColarModal(false)} title="Selecionar álbum">
        <p className="text-sm font-body text-ink/70 mb-4">
          Colando figurinha <strong>{item.figurinha.number}</strong>. Selecione o álbum:
        </p>
        {ativos.length === 0 ? (
          <p className="text-sm font-body text-red-dark">Nenhum álbum ativo.</p>
        ) : (
          <div className="flex flex-col gap-2 mb-4" role="radiogroup" aria-label="Selecionar álbum">
            {ativos.map((a) => {
              const jaColada = item.coladaEm?.includes(a._id);
              return (
                <button
                  key={a._id}
                  role="radio"
                  aria-checked={albumId === a._id}
                  className={`text-left p-3 border-2 font-body text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                    albumId === a._id ? 'border-ink bg-ink text-white' : 'border-ink/30 bg-white text-ink hover:border-ink'
                  }`}
                  onClick={() => setAlbumId(a._id)}
                >
                  <span className="flex items-center gap-2">
                    <span>{a.nomePersonalizado || a.tipoAlbum.nome}</span>
                    {jaColada && (
                      <PilhaTag bg="rgba(232,155,12,0.15)" color="#E89B0C">colada</PilhaTag>
                    )}
                  </span>
                  {a.variante && (
                    <span className="block text-xs opacity-70">
                      {VARIANT_LABELS[a.variante as keyof typeof VARIANT_LABELS] ?? a.variante}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
        <div className="flex gap-2">
          <Button
            loading={colarLoading}
            disabled={!albumId}
            onClick={() => { setShowColarModal(false); onColar(item._id as string, albumId); }}
          >
            Confirmar colagem
          </Button>
          <Button variant="secondary" onClick={() => setShowColarModal(false)}>Cancelar</Button>
        </div>
      </Modal>

      {/* Modal de confirmação de descarte */}
      <Modal open={showDescartarModal} onClose={() => setShowDescartarModal(false)} title="Descartar figurinha">
        <p className="text-sm font-body text-ink/70 mb-4">
          Descartar uma unidade de <strong>{item.figurinha.number}</strong>?
          {item.quantidade === 1 && ' O item será removido do estoque.'}
        </p>
        <div className="flex gap-2">
          <Button
            variant="danger"
            loading={descartarLoading}
            onClick={() => { setShowDescartarModal(false); onDescartar(item._id as string); }}
          >
            Descartar
          </Button>
          <Button variant="secondary" onClick={() => setShowDescartarModal(false)}>Cancelar</Button>
        </div>
      </Modal>
    </article>
  );
}

function SecaoRepetidas({ albumIdCtx }: { albumIdCtx: string }) {
  const queryClient = useQueryClient();
  const resultsId = useId();
  const [busca, setBusca] = useState('');
  const [toast, setToast] = useState<ToastState>(null);
  const [showMfnModal, setShowMfnModal] = useState(false);
  const [mfnNumero, setMfnNumero] = useState('');
  const [mfnError, setMfnError] = useState('');
  const mfnInputRef = useRef<HTMLInputElement>(null);

  const { data: estoqueData, isLoading: estoqueLoading } = useQuery({
    queryKey: ['estoque', albumIdCtx || 'todos'],
    queryFn: () => colarFigurinhasApi.getEstoque(albumIdCtx || undefined),
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
    mutationFn: ({ estoqueId, target }: { estoqueId: string; target: string }) =>
      colarFigurinhasApi.colar(estoqueId, target),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      queryClient.invalidateQueries({ queryKey: ['album'] });
      queryClient.invalidateQueries({ queryKey: ['album-figurinhas'] });
      setToast({ message: 'Figurinha colada!', variant: 'success' });
    },
    onError: (err) => setToast({ message: err instanceof ApiError ? err.message : 'Erro ao colar.', variant: 'error' }),
  });

  const descartarMut = useMutation({
    mutationFn: (estoqueId: string) => colarFigurinhasApi.descartarRepetida(estoqueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
      setToast({ message: 'Figurinha descartada.', variant: 'info' });
    },
    onError: (err) => setToast({ message: err instanceof ApiError ? err.message : 'Erro ao descartar.', variant: 'error' }),
  });

  const adicionarMut = useMutation({
    mutationFn: (numero: string) => colarFigurinhasApi.adicionarRepetida(numero),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
      setToast({ message: '+1 repetida adicionada.', variant: 'success' });
    },
    onError: (err) => setToast({ message: err instanceof ApiError ? err.message : 'Erro ao adicionar.', variant: 'error' }),
  });

  const mfnMut = useMutation({
    mutationFn: ({ numero, target }: { numero: string; target: string }) =>
      colarFigurinhasApi.colarDireta(numero, target),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      queryClient.invalidateQueries({ queryKey: ['album-figurinhas', albumIdCtx] });
      setMfnNumero('');
      setMfnError('');
      setToast({ message: 'Figurinha colada diretamente!', variant: 'success' });
      mfnInputRef.current?.focus();
    },
    onError: (err) => setMfnError(err instanceof ApiError ? err.message : 'Erro ao colar.'),
  });

  return (
    <section aria-label="Repetidas da coleção" className="flex flex-col gap-4">
      <h2 className="font-display text-base font-black uppercase tracking-wide text-ink border-t-2 border-ink pt-4">
        Repetidas da coleção
      </h2>

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
          {estoqueLoading ? 'Carregando...' : `${filtrado.length} figurinha${filtrado.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {albumIdCtx && (
        <Button
          size="sm"
          variant="secondary"
          className="self-start"
          onClick={() => { setMfnNumero(''); setMfnError(''); setShowMfnModal(true); }}
        >
          Colar figurinha não registrada
        </Button>
      )}

      {estoqueLoading && (
        <div className="flex justify-center py-8" aria-busy="true" aria-label="Carregando estoque">
          <div className="w-6 h-6 border-2 border-ink border-t-red rounded-full animate-spin" aria-hidden="true" />
        </div>
      )}

      {!estoqueLoading && filtrado.length === 0 && (
        <div className="border-2 border-dashed border-ink/20 p-6 text-center">
          <p className="text-sm font-body text-ink/70">
            {busca ? 'Nenhuma figurinha encontrada para essa busca.' : 'Estoque vazio.'}
          </p>
        </div>
      )}

      {!estoqueLoading && filtrado.length > 0 && (
        <div className="flex flex-col gap-2">
          {filtrado.map((item) => (
            <RepetidaRow
              key={item._id as string}
              item={item}
              preAlbumId={albumIdCtx}
              onColar={(estoqueId, target) => colarMut.mutate({ estoqueId, target })}
              colarLoading={colarMut.isPending}
              onDescartar={(estoqueId) => descartarMut.mutate(estoqueId)}
              descartarLoading={descartarMut.isPending}
              onAdicionar={(numero) => adicionarMut.mutate(numero)}
              adicionarLoading={adicionarMut.isPending}
            />
          ))}
        </div>
      )}

      {/* MFN — Colar figurinha não registrada */}
      <Modal
        open={showMfnModal}
        onClose={() => { setShowMfnModal(false); setMfnNumero(''); setMfnError(''); }}
        title="Colar figurinha não registrada"
      >
        <p className="text-sm font-body text-ink/70 mb-4">
          Digite o número da figurinha que deseja colar diretamente no álbum (sem passar pelo estoque).
        </p>
        <Input
          ref={mfnInputRef}
          label="Número da figurinha"
          value={mfnNumero}
          onChange={(e) => { setMfnNumero(e.target.value.toUpperCase()); setMfnError(''); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && mfnNumero.trim() && albumIdCtx && !mfnMut.isPending) {
              mfnMut.mutate({ numero: mfnNumero.trim(), target: albumIdCtx });
            }
          }}
          placeholder="Ex.: 42 ou BR01"
          autoComplete="off"
          error={mfnError || undefined}
          autoFocus
        />
        <div className="flex gap-2 mt-4 flex-wrap">
          <Button
            loading={mfnMut.isPending}
            disabled={!mfnNumero.trim() || !albumIdCtx || mfnMut.isPending}
            onClick={() => mfnMut.mutate({ numero: mfnNumero.trim(), target: albumIdCtx })}
          >
            Colar
          </Button>
          <Button
            variant="secondary"
            loading={mfnMut.isPending}
            disabled={!mfnNumero.trim() || !albumIdCtx || mfnMut.isPending}
            onClick={async () => {
              try {
                await mfnMut.mutateAsync({ numero: mfnNumero.trim(), target: albumIdCtx });
                setShowMfnModal(false);
              } catch {
                // erro já tratado em onError
              }
            }}
          >
            Colar e Fechar
          </Button>
          <Button
            variant="secondary"
            disabled={mfnMut.isPending}
            onClick={() => { setShowMfnModal(false); setMfnNumero(''); setMfnError(''); }}
          >
            Fechar
          </Button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />}
    </section>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function FigurinhasPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const albumIdFromUrl = searchParams.get('albumId') ?? '';

  // tipoId=null → AP0 (ou retomada); tipoId=string → AP1
  const [tipoId, setTipoId] = useState<string | null>(null);
  const [tipoSelecionadoAP0, setTipoSelecionadoAP0] = useState<string | null>(null);
  const [retomadaDescartada, setRetomadaDescartada] = useState(false);

  const [numero, setNumero] = useState('');
  const [toast, setToast] = useState<ToastState>(null);
  const showToast = (message: string, variant: ToastVariant = 'info') => setToast({ message, variant });
  const [showDescartar, setShowDescartar] = useState(false);
  const [showSairAlerta, setShowSairAlerta] = useState(false);
  const [colarItem, setColarItem] = useState<PilhaDaSessao | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const { data: tiposData, isLoading: tiposLoading } = useQuery({
    queryKey: ['tiposAlbum'],
    queryFn: albumsApi.getTipos,
  });
  const tipos = tiposData?.tipos ?? [];

  const { data: pilhaData, isLoading: pilhaLoading } = useQuery({
    queryKey: ['pilha'],
    queryFn: abrirPacotinhosApi.getPilha,
    refetchInterval: false,
  });

  const pilha = pilhaData?.itens ?? [];
  const pendentes = pilha.filter((i) => i.statusDestino === 'PENDENTE');

  const { data: albumsData } = useQuery({
    queryKey: ['albums'],
    queryFn: albumsApi.list,
    enabled: tipoId !== null,
    staleTime: 0,
  });
  const temAlbumsAtivos = (albumsData?.ativos?.length ?? 0) > 0;

  const temRetomada = pendentes.length > 0 && !retomadaDescartada && tipoId === null;

  const limpezaAvaliada = useRef(false);
  useEffect(() => {
    if (pilhaLoading || limpezaAvaliada.current) return;
    limpezaAvaliada.current = true;
    if (pilha.length > 0 && pendentes.length === 0) {
      abrirPacotinhosApi.descartarPilha().then(() => {
        queryClient.invalidateQueries({ queryKey: ['pilha'] });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pilhaLoading]);

  const [addError, setAddError] = useState('');
  const [descartarItemId, setDescartarItemId] = useState<string | null>(null);

  const addMut = useMutation({
    mutationFn: (figurinhaNumero: string) =>
      abrirPacotinhosApi.adicionarItem({ tipoAlbumId: tipoId!, figurinhaNumero, origem: 'DIGITACAO' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilha'] });
      setNumero('');
      setAddError('');
      inputRef.current?.focus();
    },
    onError: (err) => {
      setAddError(err instanceof ApiError ? err.message : 'Erro ao adicionar.');
    },
  });

  const colarMut = useMutation({
    mutationFn: ({ itemId, albumId }: { itemId: string; albumId: string }) =>
      abrirPacotinhosApi.colarItem(itemId, albumId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pilha'] });
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      queryClient.invalidateQueries({ queryKey: ['album', variables.albumId] });
      queryClient.invalidateQueries({ queryKey: ['album-figurinhas', variables.albumId] });
      setColarItem(null);
      showToast('Figurinha colada!', 'success');
    },
    onError: (err) => showToast(err instanceof ApiError ? err.message : 'Erro ao colar.', 'error'),
  });

  const repetidaMut = useMutation({
    mutationFn: (itemId: string) => abrirPacotinhosApi.marcarRepetida(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilha'] });
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
      showToast('Figurinha marcada como repetida.', 'info');
    },
    onError: (err) => showToast(err instanceof ApiError ? err.message : 'Erro.', 'error'),
  });

  const descartarItemMut = useMutation({
    mutationFn: (itemId: string) => abrirPacotinhosApi.descartarItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilha'] });
      setDescartarItemId(null);
      showToast('Figurinha descartada.', 'info');
    },
    onError: (err) => showToast(err instanceof ApiError ? err.message : 'Erro ao descartar.', 'error'),
  });

  const descartarMut = useMutation({
    mutationFn: () => abrirPacotinhosApi.descartarPilha(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilha'] });
      setRetomadaDescartada(true);
      setTipoId(null);
      setTipoSelecionadoAP0(null);
      setShowDescartar(false);
      showToast('Pilha descartada.', 'info');
    },
    onError: (err) => showToast(err instanceof ApiError ? err.message : 'Erro.', 'error'),
  });

  const todasRepetidasMut = useMutation({
    mutationFn: () =>
      Promise.all(pendentes.map((item) => abrirPacotinhosApi.marcarRepetida(item._id as string))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilha'] });
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
      showToast('Todas marcadas como repetidas.', 'info');
    },
    onError: (err) => showToast(err instanceof ApiError ? err.message : 'Erro.', 'error'),
  });

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !!user &&
      tipoId !== null &&
      pendentes.length > 0 &&
      currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowSairAlerta(true);
    }
  }, [blocker.state]);

  useEffect(() => {
    if (tipoId && !pilhaLoading && inputRef.current) inputRef.current.focus();
  }, [pilhaLoading, tipoId]);

  useEffect(() => {
    if (!tiposLoading && !pilhaLoading && tipos.length === 1 && !temRetomada && tipoId === null) {
      setTipoId(tipos[0]._id);
    }
  }, [tipos, tiposLoading, pilhaLoading, tipoId, temRetomada]);

  const isLoading = tiposLoading || pilhaLoading;

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-dvh bg-paper flex flex-col">
        <AppHeader back />
        <div className="flex-1 flex items-center justify-center" aria-busy="true" aria-label="Carregando">
          <div className="w-8 h-8 border-2 border-ink border-t-red rounded-full animate-spin" aria-hidden="true" />
        </div>
      </div>
    );
  }

  // ── Retomada ─────────────────────────────────────────────────────────────────
  if (temRetomada) {
    return (
      <div className="min-h-dvh bg-paper flex flex-col">
        <AppHeader back />
        <div className="p-4 xl:px-8 flex flex-col gap-6 pb-24">
          <h1 className="font-display text-xl font-black text-ink uppercase tracking-wide">Figurinhas</h1>
          <div className="bg-white border-2 border-ink [box-shadow:3px_3px_0_#0A0907] p-4 flex flex-col gap-4">
            <p className="font-body text-sm text-ink font-semibold">Você tem uma sessão anterior</p>
            <p className="font-body text-sm text-ink/70">
              Há {pendentes.length} figurinha{pendentes.length !== 1 ? 's' : ''} pendente{pendentes.length !== 1 ? 's' : ''} da última sessão. Deseja continuar ou começar do zero?
            </p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => {
                  const tipoIdRetomada = pendentes[0]?.tipoAlbumId ?? '';
                  setTipoId(tipoIdRetomada);
                }}
              >
                Continuar sessão anterior
              </Button>
              <Button
                variant="secondary"
                loading={descartarMut.isPending}
                onClick={() => descartarMut.mutate()}
              >
                Descartar e começar do zero
              </Button>
            </div>
          </div>
          <SecaoRepetidas albumIdCtx={albumIdFromUrl} />
          {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />}
        </div>
      </div>
    );
  }

  // ── AP0 – Seleção de tipo ─────────────────────────────────────────────────────
  if (tipoId === null) {
    return (
      <div className="min-h-dvh bg-paper flex flex-col">
        <AppHeader back />
        <div className="p-4 xl:px-8 flex flex-col gap-4 pb-24">
          <h1 className="font-display text-xl font-black text-ink uppercase tracking-wide">Figurinhas</h1>
          <p className="font-body text-sm text-ink/70">Que álbum você está abrindo?</p>
          <div className="flex flex-col gap-2">
            {tipos.map((t) => (
              <button
                key={t._id}
                aria-pressed={tipoSelecionadoAP0 === t._id}
                className={[
                  'text-left p-4 border-2 font-body text-sm text-ink transition-colors',
                  'hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
                  tipoSelecionadoAP0 === t._id
                    ? 'bg-ink text-white border-ink [box-shadow:3px_3px_0_#0A0907]'
                    : 'bg-white border-ink [box-shadow:3px_3px_0_#0A0907]',
                ].join(' ')}
                onClick={() => setTipoSelecionadoAP0(t._id)}
              >
                {t.nome}
              </button>
            ))}
          </div>
          <Button
            disabled={!tipoSelecionadoAP0}
            onClick={() => tipoSelecionadoAP0 && setTipoId(tipoSelecionadoAP0)}
          >
            Confirmar
          </Button>
          <SecaoRepetidas albumIdCtx={albumIdFromUrl} />
          {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />}
        </div>
      </div>
    );
  }

  // ── AP1 – Entrada de figurinhas ───────────────────────────────────────────────
  const tipoAtual = tipos.find((t) => t._id === tipoId);

  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <AppHeader back />
      <div className="p-4 xl:px-8 flex flex-col gap-4 pb-24 flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-black text-ink uppercase tracking-wide">Figurinhas</h1>
            {tipoAtual && (
              <p className="font-body text-sm text-ink/70 mt-0.5">{tipoAtual.nome}</p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {pendentes.length > 0 && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  className="hidden lg:inline-flex"
                  loading={todasRepetidasMut.isPending}
                  onClick={() => todasRepetidasMut.mutate()}
                >
                  Todas P/ Repetidas
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setShowDescartar(true)}>
                  Limpar pilha
                </Button>
              </>
            )}
          </div>
        </div>

        <div ref={statusRef} aria-live="polite" aria-atomic="true" className="sr-only" />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!numero.trim()) return;
            setAddError('');
            if (pendentes.length >= MAX_PENDENTE) {
              setAddError(`Limite de ${MAX_PENDENTE} figurinhas pendentes atingido. Cole ou descarte antes de continuar.`);
              return;
            }
            addMut.mutate(numero.trim());
          }}
          className="flex gap-2"
          noValidate
        >
          <div className="flex-1">
            <Input
              ref={inputRef}
              label="Número da figurinha"
              type="text"
              inputMode="text"
              pattern="[0-9A-Za-z]+"
              value={numero}
              onChange={(e) => { setNumero(e.target.value.toUpperCase()); setAddError(''); }}
              placeholder="Ex.: 42 ou BR01"
              autoComplete="off"
              aria-label="Número da figurinha para adicionar à pilha"
              error={addError || undefined}
            />
          </div>
          <div className="flex items-end pb-0.5">
            <Button type="submit" loading={addMut.isPending} disabled={!numero.trim()}>
              +
            </Button>
          </div>
        </form>

        {pendentes.length >= MAX_PENDENTE && !addError && (
          <p role="alert" className="text-xs text-red-dark font-body">
            ⚠ Limite de {MAX_PENDENTE} itens pendentes atingido. Cole ou descarte antes de continuar.
          </p>
        )}

        {pilhaLoading && (
          <div className="flex justify-center py-8" aria-busy="true" aria-label="Carregando pilha">
            <div className="w-6 h-6 border-2 border-ink border-t-red rounded-full animate-spin" aria-hidden="true" />
          </div>
        )}

        {!pilhaLoading && pilha.length > 0 && (
          <section aria-label="Pilha da sessão">
            <h2 className="font-display text-sm font-black uppercase tracking-wide text-ink mb-3">
              Pilha ({pilha.length})
            </h2>
            <div className="flex flex-col gap-2">
              {pilha.map((item) => {
                const isColada = item.statusDestino === 'COLADA';
                const isRepetida = item.statusDestino === 'REPETIDA';
                const isPendente = item.statusDestino === 'PENDENTE';
                const confirmandoDescartar = descartarItemId === (item._id as string);

                return (
                  <article
                    key={item._id as string}
                    className="bg-white border-2 border-ink p-3 flex flex-col gap-2"
                    aria-label={`Figurinha ${item.figurinhaNumero}, status: ${item.statusDestino}`}
                  >
                    <div className="flex gap-1 flex-wrap">
                      <PilhaTag bg="rgba(10,9,7,0.08)" color="rgba(10,9,7,0.55)">
                        {item.origem === 'CAMERA' ? 'Câmera' : 'Digitação'}
                      </PilhaTag>
                      {isPendente && (
                        temAlbumsAtivos
                          ? <PilhaTag bg="rgba(10,145,69,0.12)" color="#0A9145">Elegível</PilhaTag>
                          : <PilhaTag bg="rgba(232,155,12,0.15)" color="#E89B0C">Sem álbum</PilhaTag>
                      )}
                      {isColada && <PilhaTag bg="rgba(10,145,69,0.12)" color="#0A9145">Colada</PilhaTag>}
                      {isRepetida && <PilhaTag bg="rgba(232,155,12,0.15)" color="#E89B0C">Repetida</PilhaTag>}
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="font-mono font-bold text-ink text-sm">{item.figurinhaNumero}</span>
                      {item.figurinhaNome && (
                        <span className="text-xs font-body text-ink/60 truncate">{item.figurinhaNome}</span>
                      )}
                    </div>

                    {isPendente && (
                      confirmandoDescartar ? (
                        <div className="flex flex-col gap-2">
                          <p className="text-xs font-body text-ink/70">
                            Descartar <strong>{item.figurinhaNumero}</strong>{item.figurinhaNome && ` — ${item.figurinhaNome}`}?
                          </p>
                          <div className="flex gap-1 flex-wrap">
                            <Button
                              size="sm"
                              variant="primary"
                              loading={descartarItemMut.isPending}
                              onClick={() => descartarItemMut.mutate(item._id as string)}
                            >
                              Confirmar descarte
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => setDescartarItemId(null)}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-1 flex-wrap">
                          {temAlbumsAtivos && (
                            <Button size="sm" variant="primary" onClick={() => setColarItem(item)}>
                              Colar →
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={repetidaMut.isPending}
                            onClick={() => repetidaMut.mutate(item._id as string)}
                          >
                            Enviar para Repetidas
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setDescartarItemId(item._id as string)}
                          >
                            ✕ Descartar
                          </Button>
                        </div>
                      )
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {!pilhaLoading && pilha.length === 0 && (
          <div className="border-2 border-dashed border-ink/20 p-6 text-center">
            <p className="text-sm font-body text-ink/70">Digite os números das figurinhas para começar.</p>
          </div>
        )}

        <SecaoRepetidas albumIdCtx={albumIdFromUrl} />

        {/* Modal de confirmação de descarte da pilha */}
        <Modal
          open={showDescartar}
          onClose={() => setShowDescartar(false)}
          title="Limpar pilha"
          variant="alertdialog"
        >
          <p className="text-sm font-body text-ink/70 mb-6">
            Todos os itens PENDENTES serão descartados. Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-2">
            <Button variant="danger" loading={descartarMut.isPending} onClick={() => descartarMut.mutate()}>
              Descartar
            </Button>
            <Button variant="secondary" onClick={() => setShowDescartar(false)}>Cancelar</Button>
          </div>
        </Modal>

        <Modal
          open={showSairAlerta}
          onClose={() => {
            setShowSairAlerta(false);
            blocker.reset?.();
          }}
          title="Figurinhas sem destino"
          variant="alertdialog"
        >
          <p className="text-sm font-body text-ink/70 mb-6">
            Você tem {pendentes.length} figurinha{pendentes.length !== 1 ? 's' : ''} pendente{pendentes.length !== 1 ? 's' : ''} sem destino. Se sair, elas continuarão na pilha para a próxima sessão.
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowSairAlerta(false);
                blocker.reset?.();
              }}
            >
              Ficar
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setShowSairAlerta(false);
                blocker.proceed?.();
              }}
            >
              Sair assim mesmo
            </Button>
          </div>
        </Modal>

        <ColarModal
          item={colarItem}
          onClose={() => setColarItem(null)}
          onColar={(albumId) => colarItem && colarMut.mutate({ itemId: colarItem._id as string, albumId })}
          loading={colarMut.isPending}
        />

        {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />}
      </div>
    </div>
  );
}

function ColarModal({
  item,
  onClose,
  onColar,
  loading,
}: {
  item: PilhaDaSessao | null;
  onClose: () => void;
  onColar: (albumId: string) => void;
  loading: boolean;
}) {
  const [albumId, setAlbumId] = useState('');
  const { data } = useQuery({
    queryKey: ['albums'],
    queryFn: albumsApi.list,
    enabled: !!item,
  });
  const ativos = data?.ativos ?? [];

  useEffect(() => {
    if (ativos.length === 1) setAlbumId(ativos[0]._id);
    else setAlbumId('');
  }, [item]);

  return (
    <Modal open={!!item} onClose={onClose} title="Colar figurinha">
      {item && (
        <>
          <p className="text-sm font-body text-ink/70 mb-4">
            Colando figurinha <strong>{item.figurinhaNumero}</strong>. Selecione o álbum:
          </p>
          {ativos.length === 0 ? (
            <p className="text-sm font-body text-red-dark">Nenhum álbum ativo. Crie um álbum primeiro.</p>
          ) : (
            <div className="flex flex-col gap-2 mb-4" role="radiogroup" aria-label="Selecionar álbum">
              {ativos.map((album) => (
                <button
                  key={album._id}
                  role="radio"
                  aria-checked={albumId === album._id}
                  className={`text-left p-3 border-2 font-body text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                    albumId === album._id ? 'border-ink bg-ink text-white' : 'border-ink/30 bg-white text-ink hover:border-ink'
                  }`}
                  onClick={() => setAlbumId(album._id)}
                >
                  <span>{album.nomePersonalizado || album.tipoAlbum.nome}</span>
                  {!album.nomePersonalizado && album.variante && (
                    <span className="block text-xs opacity-70">{VARIANT_LABELS[album.variante as keyof typeof VARIANT_LABELS] ?? album.variante}</span>
                  )}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Button loading={loading} disabled={!albumId} onClick={() => onColar(albumId)}>
              Confirmar colagem
            </Button>
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          </div>
        </>
      )}
    </Modal>
  );
}
