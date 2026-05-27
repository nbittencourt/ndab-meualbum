import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBlocker } from 'react-router-dom';
import { abrirPacotinhosApi, albumsApi, ApiError } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { PilhaDaSessao } from '@meualbum/shared';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';

const MAX_PENDENTE = 100;

type ToastVariant = 'success' | 'error' | 'info';
type ToastState = { message: string; variant: ToastVariant } | null;

function StatusLabel({ status }: { status: PilhaDaSessao['statusDestino'] }) {
  const map: Record<PilhaDaSessao['statusDestino'], { label: string; variant: 'success' | 'warning' | 'info' }> = {
    PENDENTE: { label: 'Pendente', variant: 'info' },
    COLADA: { label: 'Colada', variant: 'success' },
    REPETIDA: { label: 'Repetida', variant: 'warning' },
  };
  const { label, variant } = map[status];
  return <Badge label={label} variant={variant} />;
}

export default function AbrirPacotinhosPage() {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

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

  // Busca pilha sempre (sem filtro de tipoId) para detectar sessão pendente
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

  // Há retomada quando há itens pendentes e o usuário ainda não está em AP1
  const temRetomada = pendentes.length > 0 && !retomadaDescartada && tipoId === null;

  const [addError, setAddError] = useState('');
  const [descartarItemId, setDescartarItemId] = useState<string | null>(null);
  const [showCameraPanel, setShowCameraPanel] = useState(false);
  const [cameraAtiva, setCameraAtiva] = useState(false);

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilha'] });
      setColarItem(null);
      showToast('Figurinha colada!', 'success');
    },
    onError: (err) => showToast(err instanceof ApiError ? err.message : 'Erro ao colar.', 'error'),
  });

  const repetidaMut = useMutation({
    mutationFn: (itemId: string) => abrirPacotinhosApi.marcarRepetida(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilha'] });
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

  // Bloqueia navegação se há itens pendentes em AP1
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
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

  const isLoading = tiposLoading || pilhaLoading;

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-dvh bg-paper p-4 flex items-center justify-center" aria-busy="true" aria-label="Carregando">
        <div className="w-8 h-8 border-2 border-ink border-t-red rounded-full animate-spin" aria-hidden="true" />
      </div>
    );
  }

  // ── Retomada (sessão pendente) ────────────────────────────────────────────────
  if (temRetomada) {
    return (
      <div className="min-h-dvh bg-paper p-4 flex flex-col gap-6">
        <header>
          <h1 className="font-display text-xl font-black text-ink uppercase tracking-wide">Abrir Pacotinhos</h1>
        </header>
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
        {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />}
      </div>
    );
  }

  // ── AP0 – Seleção de tipo ─────────────────────────────────────────────────────
  if (tipoId === null) {
    return (
      <div className="min-h-dvh bg-paper p-4 flex flex-col gap-4">
        <header>
          <h1 className="font-display text-xl font-black text-ink uppercase tracking-wide">Abrir Pacotinhos</h1>
        </header>
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
        {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />}
      </div>
    );
  }

  // ── AP1 – Entrada de figurinhas ───────────────────────────────────────────────
  const tipoAtual = tipos.find((t) => t._id === tipoId);

  return (
    <div className="min-h-dvh bg-paper p-4 flex flex-col gap-4 pb-24">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-black text-ink uppercase tracking-wide">Abrir Pacotinhos</h1>
          {tipoAtual && (
            <p className="font-body text-sm text-ink/70 mt-0.5">{tipoAtual.nome}</p>
          )}
        </div>
        <div className="flex gap-2">
          {pendentes.length > 0 && (
            <Button size="sm" variant="secondary" onClick={() => setShowDescartar(true)}>
              Limpar pilha
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={async () => { await logout(); window.location.href = '/'; }}
          >
            Sair da conta
          </Button>
        </div>
      </header>

      <div
        ref={statusRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {showCameraPanel && (
        <div className="bg-white border-2 border-ink p-4 flex flex-col gap-3">
          {cameraAtiva ? (
            <>
              <video autoPlay playsInline className="w-full rounded" aria-label="Câmera ativa" />
              <Button size="sm" variant="secondary" onClick={() => { setCameraAtiva(false); setShowCameraPanel(false); }}>
                Fechar câmera
              </Button>
            </>
          ) : (
            <>
              <p className="text-xs font-body text-ink/60">A câmera não ativa automaticamente. Clique no botão abaixo para iniciar.</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setCameraAtiva(true)}>Abrir câmera</Button>
                <Button size="sm" variant="secondary" onClick={() => setShowCameraPanel(false)}>Cancelar</Button>
              </div>
            </>
          )}
        </div>
      )}

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
            inputMode="numeric"
            pattern="[0-9A-Za-z]+"
            value={numero}
            onChange={(e) => { setNumero(e.target.value.toUpperCase()); setAddError(''); }}
            placeholder="Ex.: 42 ou BR01"
            autoComplete="off"
            aria-label="Número da figurinha para adicionar à pilha"
            error={addError || undefined}
          />
        </div>
        <div className="flex items-end pb-0.5 gap-1">
          <Button type="submit" loading={addMut.isPending} disabled={!numero.trim()}>
            +
          </Button>
          <Button
            type="button"
            variant="secondary"
            aria-label="Fotografar"
            onClick={() => { setShowCameraPanel(true); setCameraAtiva(false); }}
          >
            Fotografar
          </Button>
        </div>
      </form>

      {pendentes.length >= MAX_PENDENTE && !addError && (
        <p role="alert" className="text-xs text-red font-body">
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
            {pilha.map((item) => (
              <article
                key={item._id as string}
                className="bg-white border-2 border-ink p-3 flex items-center justify-between gap-2"
                aria-label={`Figurinha ${item.figurinhaNumero}, status: ${item.statusDestino}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-ink text-sm">{item.figurinhaNumero}</span>
                  {item.figurinhaNome && (
                    <span className="text-xs font-body text-ink/60">{item.figurinhaNome}</span>
                  )}
                  <StatusLabel status={item.statusDestino} />
                </div>
                {item.statusDestino === 'PENDENTE' && descartarItemId === (item._id as string) ? (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="primary"
                      loading={descartarItemMut.isPending}
                      onClick={() => descartarItemMut.mutate(item._id as string)}
                    >
                      Confirmar
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setDescartarItemId(null)}>
                      Cancelar
                    </Button>
                  </div>
                ) : item.statusDestino === 'PENDENTE' ? (
                  <div className="flex gap-1">
                    {temAlbumsAtivos && (
                      <Button size="sm" variant="primary" onClick={() => setColarItem(item)}>
                        Colar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={repetidaMut.isPending}
                      onClick={() => repetidaMut.mutate(item._id as string)}
                    >
                      Repetida
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setDescartarItemId(item._id as string)}
                    >
                      Descartar
                    </Button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      )}

      {!pilhaLoading && pilha.length === 0 && (
        <div className="border-2 border-dashed border-ink/20 p-6 text-center">
          <p className="text-sm font-body text-ink/50">Digite os números das figurinhas para começar.</p>
        </div>
      )}

      {/* Modal de confirmação de descarte */}
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

      {/* Alerta de saída com figurinhas pendentes */}
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

  const varianteLabel: Record<string, string> = {
    BROCHURA: 'Brochura', CAPA_DURA: 'Capa Dura',
    CAPA_DURA_PRATA: 'Capa Dura Prata', CAPA_DURA_OURO: 'Capa Dura Ouro', BOX_PREMIUM: 'Box Premium',
  };

  return (
    <Modal open={!!item} onClose={onClose} title="Colar figurinha">
      {item && (
        <>
          <p className="text-sm font-body text-ink/70 mb-4">
            Colando figurinha <strong>{item.figurinhaNumero}</strong>. Selecione o álbum:
          </p>
          {ativos.length === 0 ? (
            <p className="text-sm font-body text-red">Nenhum álbum ativo. Crie um álbum primeiro.</p>
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
                    <span className="block text-xs opacity-70">{varianteLabel[album.variante] ?? album.variante}</span>
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
