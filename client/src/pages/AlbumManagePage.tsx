import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { albumsApi, colarFigurinhasApi, ApiError } from '@/lib/api';
import type { FigurinhaGridItem } from '@meualbum/shared';
import { VARIANT_STYLES, VARIANT_LABELS } from '@/lib/albumVariant';
import { ListaFigurinhasModal } from '@/components/ListaFigurinhasModal';

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
  modoColagem,
  estoqueId,
  menuAberto,
  onColar,
  onAbrirMenu,
  onFecharMenu,
  onRemover,
}: {
  item: FigurinhaGridItem;
  albumId: string;
  disabled: boolean;
  isDesktop: boolean;
  modoColagem: boolean;
  estoqueId?: string;
  menuAberto?: boolean;
  onColar?: () => void;
  onAbrirMenu?: () => void;
  onFecharMenu?: () => void;
  onRemover?: () => void;
}) {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!menuAberto) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onFecharMenu?.();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuAberto, onFecharMenu]);

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
      <div style={{ flexShrink: 0, height: BTN_H, position: 'relative' }}>
        {/* Modo OFF: navegar para /figurinhas (só repetidas) */}
        {isRepetida && !modoColagem && (
          <button
            type="button"
            onClick={() => navigate(`/figurinhas?albumId=${albumId}&figurinhaNumero=${encodeURIComponent(item.numero)}`)}
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

        {/* Modo ON: colar inline (faltante e repetida) */}
        {modoColagem && !isColada && (
          <button
            type="button"
            onClick={onColar}
            disabled={disabled}
            aria-label={`Colar figurinha ${item.numero}`}
            style={{
              width: '100%',
              height: '100%',
              background: disabled ? 'rgba(10,9,7,0.4)' : (estoqueId ? INK : 'rgba(10,9,7,0.85)'),
              color: '#fff',
              border: `1.5px solid ${INK}`,
              boxShadow: disabled ? 'none' : `1px 1px 0 ${GREEN}`,
              fontFamily: FONT_D,
              fontSize: isDesktop ? 9 : 8,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            {estoqueId ? 'Colar ✓' : 'Colar'}
          </button>
        )}

        {/* Modo ON: menu de contexto para figurinha colada */}
        {modoColagem && isColada && (
          <div ref={menuRef} style={{ position: 'relative', height: '100%' }}>
            <button
              type="button"
              onClick={menuAberto ? onFecharMenu : onAbrirMenu}
              aria-label={`Opções para figurinha ${item.numero}`}
              aria-haspopup="menu"
              aria-expanded={menuAberto}
              style={{
                width: '100%',
                height: '100%',
                background: menuAberto ? 'rgba(10,9,7,0.08)' : 'transparent',
                border: `1px solid ${LINE}`,
                fontFamily: FONT_M,
                fontSize: 14,
                color: MUTE,
                cursor: 'pointer',
                letterSpacing: '0.05em',
              }}
            >
              ⋮
            </button>
            {menuAberto && (
              <div
                role="menu"
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  right: 0,
                  zIndex: 30,
                  background: '#fff',
                  border: `1.5px solid ${INK}`,
                  boxShadow: `2px 2px 0 ${INK}`,
                  minWidth: 110,
                }}
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { onFecharMenu?.(); onRemover?.(); }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    fontFamily: FONT_D,
                    fontSize: 11,
                    color: RED,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                  }}
                >
                  Remover
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

// ─── Seção com grid (Variante B) ──────────────────────────────────────────────
function SecaoGrid({
  secao,
  albumId,
  actionsDisabled,
  modoColagem,
  estoqueMap,
  menuAbertoNumero,
  onColar,
  onAbrirMenu,
  onFecharMenu,
  onRemover,
}: {
  secao: { _id: string; nome: string; figurinhas: FigurinhaGridItem[] };
  albumId: string;
  actionsDisabled: boolean;
  modoColagem: boolean;
  estoqueMap: Map<string, string>;
  menuAbertoNumero: string | null;
  onColar: (numero: string, estoqueId?: string) => void;
  onAbrirMenu: (numero: string) => void;
  onFecharMenu: () => void;
  onRemover: (numero: string) => void;
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
                  disabled={actionsDisabled}
                  isDesktop={false}
                  modoColagem={modoColagem}
                  estoqueId={estoqueMap.get(f.numero)}
                  menuAberto={menuAbertoNumero === f.numero}
                  onColar={() => onColar(f.numero, estoqueMap.get(f.numero))}
                  onAbrirMenu={() => onAbrirMenu(f.numero)}
                  onFecharMenu={onFecharMenu}
                  onRemover={() => onRemover(f.numero)}
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
  const [showListaModal, setShowListaModal] = useState(false);
  const [modoColagem, setModoColagem] = useState(false);
  const [menuAbertoNumero, setMenuAbertoNumero] = useState<string | null>(null);
  const [removerNumero, setRemoverNumero] = useState<string | null>(null);
  const [codigoDigitado, setCodigoDigitado] = useState('');
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(''), 3500);
  }

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

  const { data: estoqueData } = useQuery({
    queryKey: ['estoque', id],
    queryFn: () => colarFigurinhasApi.getEstoque(id),
    enabled: !!id && modoColagem,
  });

  const estoqueMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of estoqueData?.itens ?? []) {
      map.set(item.figurinha.number, item._id);
    }
    return map;
  }, [estoqueData]);

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

  const colarMut = useMutation({
    mutationFn: ({ numero, estoqueId }: { numero: string; estoqueId?: string }) =>
      estoqueId
        ? colarFigurinhasApi.colar(estoqueId, id!)
        : colarFigurinhasApi.colarDireta(numero, id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['album-figurinhas', id] });
      queryClient.invalidateQueries({ queryKey: ['album', id] });
      queryClient.invalidateQueries({ queryKey: ['estoque', id] });
      showToast('Figurinha colada!');
    },
  });

  const removerMut = useMutation({
    mutationFn: ({ numero }: { numero: string }) => albumsApi.removerColada(id!, numero),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['album-figurinhas', id] });
      queryClient.invalidateQueries({ queryKey: ['album', id] });
      setRemoverNumero(null);
      setCodigoDigitado('');
      showToast('Colagem removida.');
    },
  });

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
  const actionsDisabled = arquivarMut.isPending;

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
          onClick={() => navigate(`/figurinhas?albumId=${album._id}`)}
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

        {/* Ativar colagem rápida — toggle */}
        <button
          type="button"
          aria-pressed={modoColagem}
          onClick={() => { setModoColagem((v) => !v); setMenuAbertoNumero(null); }}
          style={{
            padding: '10px 20px',
            background: modoColagem ? INK : '#fff',
            color: modoColagem ? '#fff' : INK,
            border: `1.5px solid ${INK}`,
            boxShadow: modoColagem ? `2px 2px 0 ${GREEN}` : 'none',
            fontFamily: FONT_D,
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            cursor: 'pointer',
          }}
        >
          Ativar colagem rápida
        </button>

        {/* Lista de Figurinhas — popup */}
        <button
          type="button"
          disabled={actionsDisabled}
          onClick={() => setShowListaModal(true)}
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
          Figurinhas que faltam
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
            actionsDisabled={actionsDisabled}
            modoColagem={modoColagem}
            estoqueMap={estoqueMap}
            menuAbertoNumero={menuAbertoNumero}
            onColar={(numero, estoqueId) => colarMut.mutate({ numero, estoqueId })}
            onAbrirMenu={(numero) => setMenuAbertoNumero(numero)}
            onFecharMenu={() => setMenuAbertoNumero(null)}
            onRemover={(numero) => { setRemoverNumero(numero); setCodigoDigitado(''); }}
          />
        ))}
      </div>

      <ListaFigurinhasModal
        open={showListaModal}
        onClose={() => setShowListaModal(false)}
        albumId={album._id}
        albumNome={album.nomePersonalizado ?? album.tipoAlbum?.nome}
      />

      {/* Alertdialog de confirmação de remoção — #24 */}
      {removerNumero && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
          <div className="fixed inset-0 bg-ink/50" aria-hidden="true" onClick={() => { setRemoverNumero(null); setCodigoDigitado(''); }} />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-label={`Remover colagem da figurinha ${removerNumero}`}
            style={{
              position: 'relative',
              zIndex: 10,
              background: '#fff',
              border: `2px solid ${RED}`,
              boxShadow: `4px 4px 0 ${RED}`,
              padding: '20px 24px',
              maxWidth: 360,
              width: '100%',
            }}
          >
            <p style={{ fontFamily: FONT_M, fontSize: 10, color: RED, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              ⚠ Confirmar remoção
            </p>
            <p style={{ fontFamily: FONT_B, fontSize: 13, color: MUTE, lineHeight: 1.5, marginBottom: 14 }}>
              Digite o código <strong style={{ color: INK, fontFamily: FONT_M }}>{removerNumero}</strong> para confirmar a remoção desta colagem.
            </p>
            <input
              type="text"
              value={codigoDigitado}
              onChange={(e) => setCodigoDigitado(e.target.value.toUpperCase())}
              placeholder={removerNumero}
              autoFocus
              style={{
                width: '100%',
                padding: '9px 12px',
                border: `1.5px solid ${LINE}`,
                fontFamily: FONT_M,
                fontSize: 14,
                letterSpacing: '0.08em',
                marginBottom: 12,
                outline: 'none',
                boxSizing: 'border-box',
                borderColor: codigoDigitado === removerNumero ? GREEN : LINE,
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => { setRemoverNumero(null); setCodigoDigitado(''); }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: '#fff',
                  color: INK,
                  border: `1.5px solid ${INK}`,
                  fontFamily: FONT_D,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={codigoDigitado !== removerNumero || removerMut.isPending}
                onClick={() => removerMut.mutate({ numero: removerNumero })}
                aria-label="Confirmar remoção"
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: codigoDigitado === removerNumero ? RED : 'rgba(229,20,42,0.3)',
                  color: '#fff',
                  border: `1.5px solid ${RED}`,
                  fontFamily: FONT_D,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  cursor: codigoDigitado === removerNumero ? 'pointer' : 'not-allowed',
                }}
              >
                {removerMut.isPending ? 'Removendo…' : 'Confirmar remoção'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast — feedback inline */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 60,
            background: INK,
            color: '#fff',
            fontFamily: FONT_D,
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '10px 20px',
            boxShadow: `3px 3px 0 ${RED}`,
            whiteSpace: 'nowrap',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
