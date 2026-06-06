import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { albumsApi, ApiError } from '@/lib/api';
import type { FigurinhaGridItem } from '@meualbum/shared';
import { VARIANT_STYLES, VARIANT_LABELS } from '@/lib/albumVariant';

const INK   = '#0A0907';
const GREEN  = '#0A9145';
const RED    = '#E5142A';
const LINE   = 'rgba(10,9,7,0.18)';
const MUTE   = 'rgba(10,9,7,0.55)';
const FONT_D = '"Archivo Black", sans-serif';
const FONT_B = '"Geist", sans-serif';
const FONT_M = '"Geist Mono", "Courier New", monospace';

// ─── Barra de progresso simples ───────────────────────────────────────────────
function SGProgressBar({ pct, height = 6, color = INK }: { pct: number; height?: number; color?: string }) {
  return (
    <div style={{ height, background: LINE, position: 'relative', width: '100%' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${Math.min(100, pct)}%`, background: color }} />
    </div>
  );
}

// ─── Card-Herói do álbum ──────────────────────────────────────────────────────
interface AlbumHeroProps {
  tipoNome: string;
  variante: string;
  nomePersonalizado?: string;
  pct: number;
  coladas: number;
  total: number;
}

function AlbumHero({ tipoNome, variante, nomePersonalizado, pct, coladas, total }: AlbumHeroProps) {
  const style = VARIANT_STYLES[variante as keyof typeof VARIANT_STYLES] ?? VARIANT_STYLES.BROCHURA;
  const label = VARIANT_LABELS[variante as keyof typeof VARIANT_LABELS] ?? variante;
  const pctFormatted = pct.toFixed(1);

  return (
    <div style={{ background: style.background, border: style.border, boxShadow: style.shadow }}>
      {/* Desktop layout: 1fr auto */}
      <div className="hidden lg:grid" style={{ gridTemplateColumns: '1fr auto', gap: 24, padding: '20px 24px', alignItems: 'center' }}>
        <div>
          <span style={{
            display: 'inline-block',
            padding: '3px 8px',
            background: style.tagBg,
            color: style.tagText,
            fontFamily: FONT_M,
            fontSize: 9,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            border: `1px solid ${style.tagBg}`,
            marginBottom: 8,
          }}>
            {label}
          </span>
          <div style={{ fontFamily: FONT_D, fontSize: 22, textTransform: 'uppercase', lineHeight: 1.05, color: style.text }}>
            {tipoNome}
          </div>
          {nomePersonalizado && (
            <div style={{ fontFamily: FONT_B, fontSize: 13, color: MUTE, marginTop: 3 }}>
              "{nomePersonalizado}"
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            role="progressbar"
            aria-valuenow={Math.round(pct * 10) / 10}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={`${pctFormatted}% concluído`}
            aria-label="Progresso de conclusão do álbum"
          >
            <div style={{ fontFamily: FONT_D, fontSize: 48, lineHeight: 1, color: style.text }}>
              {pctFormatted}<span style={{ fontFamily: FONT_M, fontSize: 16 }}>%</span>
            </div>
            <div style={{ width: 200, marginTop: 8 }}>
              <SGProgressBar pct={pct} height={8} />
            </div>
            <div style={{ fontFamily: FONT_M, fontSize: 9, color: MUTE, marginTop: 4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {coladas} / {total} figurinhas
            </div>
          </div>
        </div>
      </div>

      {/* Mobile layout: empilhado */}
      <div className="lg:hidden" style={{ padding: '16px 16px 14px', borderTop: 'none' }}>
        <span style={{
          display: 'inline-block',
          padding: '3px 8px',
          background: style.tagBg,
          color: style.tagText,
          fontFamily: FONT_M,
          fontSize: 9,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>
          {label}
        </span>
        <div style={{ fontFamily: FONT_D, fontSize: 18, textTransform: 'uppercase', lineHeight: 1.1, color: style.text }}>
          {tipoNome}
        </div>
        {nomePersonalizado && (
          <div style={{ fontFamily: FONT_B, fontSize: 12, color: MUTE, marginTop: 2 }}>
            "{nomePersonalizado}"
          </div>
        )}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <span style={{ fontFamily: FONT_M, fontSize: 10, color: MUTE, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Progresso
            </span>
            <span
              role="progressbar"
              aria-valuenow={Math.round(pct * 10) / 10}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuetext={`${pctFormatted}% concluído`}
              aria-label="Progresso de conclusão do álbum"
              style={{ fontFamily: FONT_D, fontSize: 26, color: style.text }}
            >
              {pctFormatted}<span style={{ fontFamily: FONT_M, fontSize: 11 }}>%</span>
            </span>
          </div>
          <SGProgressBar pct={pct} height={10} />
          <div style={{ fontFamily: FONT_M, fontSize: 9, color: MUTE, marginTop: 5, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {coladas} de {total} figurinhas coladas
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Badge ×N ─────────────────────────────────────────────────────────────────
function QuantidadeBadge({ quantidade }: { quantidade: number }) {
  const bg = quantidade >= 2 ? RED : quantidade === 1 ? 'rgba(10,145,69,0.12)' : 'rgba(10,9,7,0.06)';
  const fg = quantidade >= 2 ? '#fff' : quantidade === 1 ? GREEN : MUTE;
  return (
    <span style={{
      background: bg, color: fg,
      fontFamily: FONT_M, fontWeight: 700,
      fontSize: 9, padding: '1px 5px',
      letterSpacing: '0.04em', flexShrink: 0,
    }}>
      ×{quantidade}
    </span>
  );
}

// ─── Card individual (Variante B) ─────────────────────────────────────────────
function StickerCardAL1({
  item,
  albumId,
  disabled,
  isDesktop,
}: {
  item: FigurinhaGridItem;
  albumId: string;
  disabled: boolean;
  isDesktop: boolean;
}) {
  const navigate = useNavigate();
  const isColada   = item.colada;
  const isRepetida = !item.colada && item.quantidade >= 2;
  const CARD_H = isDesktop ? 106 : 94;
  const BTN_H  = isDesktop ? 28 : 25;

  let cardBg: string;
  let cardBorder: string;
  if (isColada) {
    cardBg     = 'rgba(10,145,69,0.04)';
    cardBorder = `1.5px solid rgba(10,145,69,0.3)`;
  } else if (isRepetida) {
    cardBg     = '#fff';
    cardBorder = `1.5px solid ${INK}`;
  } else {
    cardBg     = '#fff';
    cardBorder = `1.5px solid ${LINE}`;
  }

  const statusLabel = isColada ? 'colada' : isRepetida ? 'repetida' : 'faltante';

  return (
    <article
      style={{
        background: cardBg,
        border: cardBorder,
        padding: isDesktop ? '10px 10px 9px' : '8px 7px 7px',
        display: 'flex',
        flexDirection: 'column',
        height: CARD_H,
        boxSizing: 'border-box',
        minWidth: 0,
      }}
      aria-label={`Figurinha ${item.numero}${item.nome ? `, ${item.nome}` : ''}, ${statusLabel}`}
    >
      {/* Topo: número + badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{
          fontFamily: FONT_M,
          fontSize: isDesktop ? 10 : 8.5,
          color: isColada ? GREEN : MUTE,
          letterSpacing: '0.08em',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {item.numero}
        </span>
        <QuantidadeBadge quantidade={item.quantidade} />
      </div>

      {/* Nome — ocupa espaço disponível */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', padding: '4px 0' }}>
        <span style={{
          fontFamily: FONT_D,
          fontSize: isDesktop ? 12 : 10,
          color: isColada ? MUTE : INK,
          textTransform: 'uppercase',
          lineHeight: 1.15,
          textDecoration: isColada ? 'line-through' : 'none',
          textDecorationColor: 'rgba(10,9,7,0.28)',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        } as React.CSSProperties}>
          {item.nome}
        </span>
      </div>

      {/* Área do botão — altura sempre reservada */}
      <div style={{ flexShrink: 0, height: BTN_H }}>
        {isRepetida && (
          <button
            type="button"
            onClick={() => navigate(`/colar?albumId=${albumId}&figurinhaNumero=${encodeURIComponent(item.numero)}`)}
            disabled={disabled}
            style={{
              width: '100%',
              height: '100%',
              background: disabled ? 'rgba(10,9,7,0.4)' : INK,
              color: '#fff',
              border: `1.5px solid ${INK}`,
              boxShadow: disabled ? 'none' : `1px 1px 0 ${RED}`,
              fontFamily: FONT_D,
              fontSize: isDesktop ? 9 : 8,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              cursor: disabled ? 'not-allowed' : 'pointer',
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

// ─── Seção com grid (Variante B) ──────────────────────────────────────────────
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
  const total     = secao.figurinhas.length;
  const coladas   = secao.figurinhas.filter((f) => f.colada).length;
  const repetidas = secao.figurinhas.filter((f) => !f.colada && f.quantidade >= 2).length;
  const faltantes = total - coladas - repetidas;
  const pct       = total > 0 ? Math.round((coladas / total) * 100) : 0;
  const completa  = coladas === total && total > 0;

  return (
    <div style={{ border: `1.5px solid ${expanded ? INK : LINE}`, background: expanded ? '#FBF8EE' : '#fff' }}>
      {/* Cabeçalho clicável */}
      <button
        type="button"
        data-testid="section-toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        style={{
          width: '100%',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ flex: 1 }}>
          {/* 1ª linha: nome + coladas/total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <span style={{ fontFamily: FONT_D, fontSize: 14, textTransform: 'uppercase', color: INK }}>
              {secao.nome}
            </span>
            <span style={{ fontFamily: FONT_M, fontSize: 11, color: MUTE }}>
              {coladas}<span style={{ opacity: 0.35 }}>/</span>{total}
            </span>
          </div>
          {/* 2ª linha: barra + pct ou ✓ Completa */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <SGProgressBar pct={pct} height={6} color={completa ? GREEN : INK} />
            </div>
            {completa ? (
              <span style={{ fontFamily: FONT_M, fontSize: 9, color: GREEN, letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0 }}>
                ✓ Completa
              </span>
            ) : (
              <span style={{ fontFamily: FONT_D, fontSize: 14, flexShrink: 0, color: INK }}>
                {pct}%
              </span>
            )}
          </div>
        </div>
        {/* Chevron */}
        <span style={{
          fontFamily: FONT_M,
          fontSize: 18,
          color: expanded ? RED : MUTE,
          display: 'inline-block',
          transform: expanded ? 'rotate(90deg)' : 'none',
          transition: 'transform 0.2s ease',
          flexShrink: 0,
        }}>›</span>
      </button>

      {/* Conteúdo expandido */}
      {expanded && (
        <div style={{ borderTop: `1.5px solid ${INK}` }}>
          {/* Legenda */}
          <div style={{ padding: '6px 14px', background: 'rgba(10,9,7,0.03)', borderBottom: `1px solid ${LINE}`, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            {([
              { symbol: '━', label: 'Colada',   color: GREEN },
              { symbol: '○', label: 'Faltante', color: MUTE  },
              { symbol: '×2', label: 'Repetida', color: RED  },
            ] as const).map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontFamily: FONT_M, fontSize: 9, color: item.color, fontWeight: 600 }}>{item.symbol}</span>
                <span style={{ fontFamily: FONT_M, fontSize: 8, color: MUTE, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Grid de figurinhas — 3 col mobile / 5 col desktop */}
          <div style={{ padding: '10px 14px' }}>
            <div
              className="lg:[grid-template-columns:repeat(5,1fr)] lg:gap-[10px]"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}
            >
              {secao.figurinhas.map((f) => (
                <StickerCardAL1
                  key={f._id}
                  item={f}
                  albumId={albumId}
                  disabled={pdfLoading}
                  isDesktop={false}
                />
              ))}
            </div>
          </div>

          {/* Resumo de rodapé */}
          <div style={{
            padding: '7px 14px',
            display: 'flex',
            gap: 14,
            flexWrap: 'wrap',
            fontFamily: FONT_M,
            fontSize: 9,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            borderTop: `1px solid ${LINE}`,
          }}>
            <span style={{ color: GREEN }}>✓ {coladas} coladas</span>
            <span style={{ color: RED }}>⇄ {repetidas} repetidas</span>
            <span style={{ color: MUTE }}>{faltantes} faltantes</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Painel de Confirmação de Arquivamento ────────────────────────────────────
function PainelArquivar({
  loading,
  error,
  onConfirmar,
  onCancelar,
}: {
  loading: boolean;
  error: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <div style={{
      border: `1.5px solid ${RED}`,
      background: '#fff',
      padding: '14px 16px',
    }}>
      <p style={{ fontFamily: FONT_M, fontSize: 10, color: RED, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
        ⚠ Confirmar arquivamento
      </p>
      <p style={{ fontFamily: FONT_B, fontSize: 13, color: MUTE, lineHeight: 1.5, marginBottom: 12 }}>
        Arquivar este álbum? Ele ficará oculto das listas principais e não poderá receber novas colagens enquanto arquivado.
      </p>
      {error && (
        <p role="alert" style={{ fontFamily: FONT_B, fontSize: 12, color: RED, marginBottom: 8 }}>⚠ {error}</p>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onCancelar}
          disabled={loading}
          style={{
            padding: '10px 16px',
            background: '#fff',
            color: INK,
            border: `1.5px solid ${INK}`,
            fontFamily: FONT_D,
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirmar}
          disabled={loading}
          style={{
            padding: '10px 16px',
            background: loading ? 'rgba(229,20,42,0.6)' : RED,
            color: '#fff',
            border: `1.5px solid ${RED}`,
            fontFamily: FONT_D,
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Arquivando…' : 'Confirmar arquivamento'}
        </button>
      </div>
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

  useEffect(() => {
    if (!data?.album) return;
    const nome = (data.album as any).nomePersonalizado || (data.album as any).tipoAlbum?.nome;
    if (!nome) return;
    document.title = `${nome} — Meu Álbum Copa 2026`;
    return () => { document.title = 'Meu Álbum Copa 2026'; };
  }, [data]);

  // Contagem de coladas derivada das figurinhas carregadas
  const { coladasCount, totalFigurinhas } = useMemo(() => {
    if (!figurinhasData?.secoes) {
      return {
        coladasCount: 0,
        totalFigurinhas: data?.album?.tipoAlbum?.totalFigurinhas ?? 0,
      };
    }
    const coladas = figurinhasData.secoes.reduce(
      (acc, s) => acc + s.figurinhas.filter((f) => f.colada).length, 0
    );
    const total = figurinhasData.secoes.reduce(
      (acc, s) => acc + s.figurinhas.length, 0
    );
    return { coladasCount: coladas, totalFigurinhas: total };
  }, [figurinhasData, data]);

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
  const actionsDisabled = pdfLoading || arquivarMut.isPending;

  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <AppHeader back breadcrumb="Meus Álbuns" title="Gerenciar álbum" />

      {/* Card-Herói */}
      <AlbumHero
        tipoNome={album.tipoAlbum?.nome ?? 'Álbum'}
        variante={album.variante}
        nomePersonalizado={album.nomePersonalizado}
        pct={album.percentualConclusao}
        coladas={coladasCount}
        total={totalFigurinhas}
      />

      {/* Barra de Ações — RN-AL19 */}
      <div
        className="px-4 lg:px-6"
        style={{
          background: '#FBF8EE',
          border: `1.5px solid ${INK}`,
          borderLeft: 'none',
          borderRight: 'none',
          padding: '10px 16px',
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* Colar figurinhas → */}
        <button
          type="button"
          disabled={actionsDisabled}
          onClick={() => navigate(`/colar?albumId=${album._id}`)}
          style={{
            padding: '10px 20px',
            background: actionsDisabled ? 'rgba(10,9,7,0.4)' : INK,
            color: '#fff',
            border: `2px solid ${INK}`,
            boxShadow: actionsDisabled ? 'none' : `2px 2px 0 ${RED}`,
            fontFamily: FONT_D,
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            cursor: actionsDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          Colar figurinhas →
        </button>

        {/* Ver Álbum (mantido por D2) */}
        <button
          type="button"
          disabled={actionsDisabled}
          onClick={() => navigate(`/albums/${album._id}/visualizar`)}
          style={{
            padding: '10px 20px',
            background: '#fff',
            color: INK,
            border: `1.5px solid ${INK}`,
            fontFamily: FONT_D,
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            cursor: actionsDisabled ? 'not-allowed' : 'pointer',
            opacity: actionsDisabled ? 0.5 : 1,
          }}
        >
          Ver álbum
        </button>

        {/* Baixar PDF / Figurinhas que faltam */}
        <button
          type="button"
          disabled={actionsDisabled}
          onClick={handleBaixarPdf}
          style={{
            padding: '10px 20px',
            background: '#fff',
            color: INK,
            border: `1.5px solid ${INK}`,
            fontFamily: FONT_D,
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            cursor: actionsDisabled ? 'not-allowed' : 'pointer',
            opacity: actionsDisabled ? 0.5 : 1,
          }}
        >
          {pdfLoading ? (
            'Gerando…'
          ) : (
            <>
              <span className="hidden lg:inline">Baixar PDF</span>
              <span className="lg:hidden">Figurinhas que faltam</span>
            </>
          )}
        </button>

        {/* Arquivar — empurrado à direita no desktop */}
        {!confirmarArquivar && (
          <button
            type="button"
            disabled={actionsDisabled}
            onClick={() => { setConfirmarArquivar(true); setArquivarError(''); }}
            style={{
              padding: '10px 20px',
              background: '#fff',
              color: INK,
              border: `1.5px solid ${INK}`,
              fontFamily: FONT_D,
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              cursor: actionsDisabled ? 'not-allowed' : 'pointer',
              opacity: actionsDisabled ? 0.5 : 1,
              marginLeft: 'auto',
            }}
          >
            Arquivar
          </button>
        )}

        {/* Quando arquivamento pendente: manter botão "Arquivar" visual mas sem ação */}
        {confirmarArquivar && (
          <button
            type="button"
            disabled
            style={{
              padding: '10px 20px',
              background: '#fff',
              color: RED,
              border: `1.5px solid ${RED}`,
              fontFamily: FONT_D,
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              cursor: 'default',
              marginLeft: 'auto',
            }}
          >
            Arquivar
          </button>
        )}
      </div>

      {/* Painel de confirmação de arquivamento (separado da barra) */}
      {confirmarArquivar && (
        <div className="px-4 lg:px-6 pt-3">
          <PainelArquivar
            loading={arquivarMut.isPending}
            error={arquivarError}
            onConfirmar={() => arquivarMut.mutate()}
            onCancelar={() => { setConfirmarArquivar(false); setArquivarError(''); }}
          />
        </div>
      )}

      {pdfError && (
        <p role="alert" className="px-4 lg:px-6 pt-2 text-xs font-body" style={{ color: RED }}>
          ⚠ {pdfError}
        </p>
      )}

      {/* Lista de seções */}
      <div className="flex-1 px-4 lg:px-6 pt-4 pb-8 flex flex-col gap-2">
        {/* Rótulo "Seções do álbum" */}
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontFamily: FONT_M, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTE }}>
            Seções do álbum
            {figurinhasData?.secoes && (
              <span className="hidden lg:inline"> · {figurinhasData.secoes.length} seções</span>
            )}
          </span>
        </div>

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
