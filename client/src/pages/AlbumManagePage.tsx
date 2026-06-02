import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { albumsApi, ApiError } from '@/lib/api';
import type { FigurinhaGridItem } from '@meualbum/shared';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

const VARIANTE_LABEL: Record<string, string> = {
  BROCHURA: 'Brochura', CAPA_DURA: 'Capa Dura',
  CAPA_DURA_PRATA: 'Capa Dura Prata', CAPA_DURA_OURO: 'Capa Dura Ouro', BOX_PREMIUM: 'Box Premium',
};

// ─── Badge ×N ─────────────────────────────────────────────────────────────────
function QuantidadeBadge({ quantidade }: { quantidade: number }) {
  let bg: string;
  let fg: string;
  if (quantidade === 0) {
    bg = 'rgba(10,9,7,0.06)';
    fg = 'rgba(10,9,7,0.55)';
  } else if (quantidade === 1) {
    bg = 'rgba(10,145,69,0.12)';
    fg = '#0A9145';
  } else {
    bg = '#E5142A';
    fg = '#ffffff';
  }
  return (
    <span
      style={{
        background: bg,
        color: fg,
        fontFamily: '"Geist Mono", "Courier New", monospace',
        fontSize: 9,
        fontWeight: 700,
        padding: '1px 4px',
        flexShrink: 0,
      }}
    >
      ×{quantidade}
    </span>
  );
}

// ─── Card individual ──────────────────────────────────────────────────────────
function StickerCardAL1({
  item,
  albumId,
  disabled,
}: {
  item: FigurinhaGridItem;
  albumId: string;
  disabled: boolean;
}) {
  const navigate = useNavigate();
  const isRepetida = item.quantidade >= 2;
  const isFaltante = !item.colada && item.quantidade === 0;

  let cardBg: string;
  let cardBorder: string;
  if (item.colada) {
    cardBg = 'rgba(10,145,69,0.04)';
    cardBorder = '1.5px solid rgba(10,145,69,0.3)';
  } else if (isRepetida) {
    cardBg = '#ffffff';
    cardBorder = '1.5px solid #0A0907';
  } else {
    cardBg = '#ffffff';
    cardBorder = isFaltante ? '1.5px dashed rgba(10,9,7,0.18)' : '1.5px solid rgba(10,9,7,0.18)';
  }

  return (
    <article
      style={{
        background: cardBg,
        border: cardBorder,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        padding: '5px 6px 0',
        overflow: 'hidden',
      }}
      aria-label={`Figurinha ${item.numero}${item.nome ? `, ${item.nome}` : ''}, ${item.colada ? 'colada' : item.quantidade >= 2 ? 'repetida' : 'faltante'}`}
    >
      {/* Topo: número + badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexShrink: 0 }}>
        <span
          style={{
            fontFamily: '"Geist Mono", "Courier New", monospace',
            fontSize: 10,
            fontWeight: 700,
            color: item.colada ? 'rgba(10,9,7,0.28)' : '#0A0907',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.numero}
        </span>
        <QuantidadeBadge quantidade={item.quantidade} />
      </div>

      {/* Meio: nome */}
      <div style={{ flex: 1, overflow: 'hidden', marginTop: 3 }}>
        {item.nome && (
          <p
            style={{
              fontFamily: '"Archivo Black", sans-serif',
              fontSize: 8,
              fontWeight: 900,
              textTransform: 'uppercase',
              lineHeight: 1.2,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              textDecoration: item.colada ? 'line-through' : 'none',
              color: item.colada ? 'rgba(10,9,7,0.28)' : '#0A0907',
              margin: 0,
            } as React.CSSProperties}
          >
            {item.nome}
          </p>
        )}
      </div>

      {/* Rodapé: botão "Colar →" quando repetida */}
      <div
        style={{
          height: 25,
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        {isRepetida && !disabled && (
          <button
            type="button"
            onClick={() => navigate(`/colar?albumId=${albumId}&figurinhaNumero=${encodeURIComponent(item.numero)}`)}
            style={{
              fontFamily: '"Geist Mono", "Courier New", monospace',
              fontSize: 8,
              fontWeight: 700,
              color: '#E5142A',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
            aria-label={`Colar figurinha ${item.numero}`}
          >
            Colar →
          </button>
        )}
      </div>
    </article>
  );
}

// ─── Seção com grid ───────────────────────────────────────────────────────────
function SecaoGrid({
  secao,
  albumId,
  pdfLoading,
}: {
  secao: { _id: string; nome: string; figurinhas: FigurinhaGridItem[] };
  albumId: string;
  pdfLoading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const total = secao.figurinhas.length;
  const coladas = secao.figurinhas.filter((f) => f.colada).length;
  const pct = total > 0 ? Math.round((coladas / total) * 100) : 0;

  return (
    <div style={{ background: '#ffffff', border: '2px solid #0A0907', boxShadow: '2px 2px 0 #0A0907' }}>
      <button
        type="button"
        className="w-full flex items-center justify-between p-3 text-left"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="font-display text-sm font-black text-ink">{secao.nome}</span>
        <span className="flex items-center gap-2">
          <span
            style={{
              width: 48,
              height: 3,
              background: 'rgba(10,9,7,0.1)',
              position: 'relative',
              display: 'inline-block',
              verticalAlign: 'middle',
            }}
          >
            <span
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${pct}%`,
                background: '#0A9145',
              }}
            />
          </span>
          <span className="text-xs font-mono text-ink/50">{coladas}/{total}</span>
          <span className="text-ink/50 text-xs">{expanded ? '▲' : '▼'}</span>
        </span>
      </button>

      {expanded && (
        <div className="border-t border-ink/10 p-3">
          {/* Legenda */}
          <p className="text-[10px] font-mono text-ink/50 mb-3">
            <span style={{ color: '#0A9145' }}>━</span> Colada
            {' · '}
            <span>○</span> Faltante
            {' · '}
            <span style={{ color: '#E5142A' }}>×2</span> Repetida
          </p>

          {/* Grid de figurinhas */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
            }}
            className="xl:[grid-template-columns:repeat(5,1fr)] xl:[gap:10px]"
          >
            {secao.figurinhas.map((f) => (
              <div
                key={f._id}
                style={{ height: 94 }}
                className="xl:h-[106px]"
              >
                <StickerCardAL1
                  item={f}
                  albumId={albumId}
                  disabled={pdfLoading}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function AlbumManagePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmarArquivar, setConfirmarArquivar] = useState(false);
  const [arquivarError, setArquivarError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['album', id],
    queryFn: () => albumsApi.get(id!),
    enabled: !!id,
  });

  const { data: figurinhasData, isLoading: figurinhasLoading } = useQuery({
    queryKey: ['album-figurinhas', id],
    queryFn: () => albumsApi.getFigurinhas(id!),
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
      <div className="min-h-dvh bg-paper flex flex-col">
        <AppHeader back />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-ink border-t-red rounded-full animate-spin" aria-hidden="true" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-dvh bg-paper flex flex-col">
        <AppHeader back />
        <div className="p-4">
          <p role="alert" className="text-sm text-red font-body">Álbum não encontrado.</p>
        </div>
      </div>
    );
  }

  const { album } = data;
  const nomeExibido = album.nomePersonalizado || album.tipoAlbum.nome;
  const actionsDisabled = pdfLoading || arquivarMut.isPending;

  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <AppHeader back />
      <div className="sticky top-[60px] z-10 bg-paper border-b border-ink/10 px-4 py-3">
        <h1 className="font-display text-xl font-black text-ink uppercase tracking-wide leading-tight">
          {nomeExibido}
        </h1>
        <p className="text-xs font-mono text-ink/50 mt-0.5">
          {album.tipoAlbum.nome} · {VARIANTE_LABEL[album.variante] ?? album.variante}
        </p>
        <div className="mt-2">
          <ProgressBar value={album.percentualConclusao} label="Progresso" />
        </div>
      </div>

      {/* Action bar — RN-AL19: PDF loading desabilita todos */}
      <div className="px-4 py-3 border-b border-ink/10 flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant="primary"
          disabled={actionsDisabled}
          onClick={() => navigate(`/colar?albumId=${album._id}`)}
        >
          Colar figurinhas
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
            disabled={actionsDisabled}
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
              disabled={actionsDisabled}
              onClick={() => { setConfirmarArquivar(false); setArquivarError(''); }}
            >
              Cancelar
            </Button>
          </>
        )}
      </div>

      {pdfError && <p role="alert" className="px-4 pt-2 text-xs text-red font-body">⚠ {pdfError}</p>}
      {arquivarError && <p role="alert" className="px-4 pt-2 text-xs text-red font-body">⚠ {arquivarError}</p>}

      {/* Grid de figurinhas por seção */}
      <div className="flex-1 p-4 xl:px-8 flex flex-col gap-3">
        {figurinhasLoading && (
          <div className="flex justify-center py-8" aria-busy="true" aria-label="Carregando figurinhas">
            <div className="w-6 h-6 border-2 border-ink border-t-red rounded-full animate-spin" aria-hidden="true" />
          </div>
        )}

        {figurinhasData?.secoes.map((secao) => (
          <SecaoGrid
            key={secao._id}
            secao={secao}
            albumId={album._id}
            pdfLoading={pdfLoading}
          />
        ))}
      </div>
    </div>
  );
}
