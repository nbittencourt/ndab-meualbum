import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { albumsApi } from '@/lib/api';
import type { SecaoGrid } from '@meualbum/shared';
import { agruparSecoesParaImpressao } from '@/lib/agruparSecoesParaImpressao';
import { statusFigurinha, isRepetida, type StatusFigurinha } from '@/lib/figurinhaStatus';
import './listaFigurinhasPrint.css';

interface Props {
  open: boolean;
  onClose: () => void;
  albumId: string;
  albumNome?: string;
}

type Status = StatusFigurinha;

const statusCell = statusFigurinha;

// ── Screen Cell ──────────────────────────────────────────────────────────────

function Cell({ numero, status }: { numero: string; status: Status }) {
  const styles: Record<Status, React.CSSProperties> = {
    c: { background: 'rgba(10,145,69,0.15)', border: '1px solid rgba(10,145,69,0.48)', color: '#0A9145' },
    f: { background: 'transparent', border: '1.5px dashed rgba(10,9,7,0.5)', color: 'rgba(10,9,7,0.8)' },
    r: { background: 'rgba(229,20,42,0.1)', border: '1.5px solid #E5142A', color: '#E5142A', borderRadius: 4 },
  };
  return (
    <div
      title={`${numero} — ${status === 'c' ? 'colada' : status === 'r' ? 'repetida' : 'faltante'}`}
      aria-label={`${numero} ${status === 'c' ? 'colada' : status === 'r' ? 'repetida' : 'faltante'}`}
      style={{
        height: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Geist Mono", monospace',
        fontSize: 8,
        ...styles[status],
      }}
    >
      {numero}
    </div>
  );
}

function SecaoBlock({ secao }: { secao: SecaoGrid }) {
  const coladas = secao.figurinhas.filter((f) => f.colada).length;
  const total = secao.figurinhas.length;
  return (
    <section data-popup-section aria-label={secao.nome}>
      <div style={{
        padding: '4px 8px',
        background: '#fafafa',
        borderLeft: '3px solid #E5142A',
        borderBottom: '1px solid rgba(10,9,7,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h3 style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0A0907' }}>
          {secao.nome}
        </h3>
        <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: 9, color: 'rgba(10,9,7,0.45)' }}>
          {coladas}/{total}
        </span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(36px, 1fr))',
        gap: 2,
        padding: '6px 8px',
        background: '#fff',
      }}>
        {secao.figurinhas.map((f) => (
          <Cell key={f._id} numero={f.numero} status={statusCell(f)} />
        ))}
      </div>
    </section>
  );
}

// ── Print Cell (monochromatic — styled via CSS class) ────────────────────────

function PrintCell({ numero, status }: { numero: string; status: Status }) {
  return (
    <div className={`lista-print-cell lista-print-cell--${status}`}>
      {numero}
    </div>
  );
}

function PrintSecaoBlock({ secao, colunas }: { secao: SecaoGrid; colunas?: number }) {
  const coladas = secao.figurinhas.filter((f) => f.colada).length;
  const total = secao.figurinhas.length;
  return (
    <div
      className="lista-print-secao"
      data-print-section={colunas ? 'pais' : 'special'}
      style={{ border: '0.8px solid rgba(10,9,7,0.13)', background: '#fff', marginBottom: 2 }}
    >
      <div style={{
        padding: '2px 6px',
        background: '#fafafa',
        borderLeft: '3px solid #E5142A',
        borderBottom: '0.8px solid rgba(10,9,7,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 7, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0A0907' }}>
          {secao.nome}
        </span>
        <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: 6, color: 'rgba(10,9,7,0.4)' }}>
          {coladas}/{total}
        </span>
      </div>
      <div
        data-print-cells
        style={{
          display: 'grid',
          gridTemplateColumns: colunas ? `repeat(${colunas}, 1fr)` : 'repeat(auto-fill, minmax(20px, 1fr))',
          gap: 1,
          padding: '3px 4px',
        }}
      >
        {secao.figurinhas.map((f) => (
          <PrintCell key={f._id} numero={f.numero} status={statusCell(f)} />
        ))}
      </div>
    </div>
  );
}

// ── Print Container (portal to body) ────────────────────────────────────────

function PrintContainer({ secoes, albumNome, totalColadas, totalFaltantes, totalRepetidas, pct }: {
  secoes: SecaoGrid[];
  albumNome?: string;
  totalColadas: number;
  totalFaltantes: number;
  totalRepetidas: number;
  pct: number;
}) {
  const { primeira, paises, ultimas } = agruparSecoesParaImpressao(secoes);
  const dataBR = new Date().toLocaleDateString('pt-BR');

  return createPortal(
    <div className="lista-print" aria-hidden="true">
      {/* Header */}
      <div className="lista-print-header" style={{ background: '#0A0907', padding: '7px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #E5142A' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 20, height: 20, background: '#E5142A', border: '1.5px solid rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Archivo Black", sans-serif', fontSize: 9, color: '#fff', transform: 'rotate(-4deg)', flexShrink: 0 }}>MA</div>
          <div>
            <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#fff', lineHeight: 1 }}>Meu Album</div>
            <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: 6.5, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginTop: 2, textTransform: 'uppercase' }}>Lista de Figurinhas</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {albumNome && (
            <span style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.8)', display: 'block', lineHeight: 1.3 }}>{albumNome}</span>
          )}
          <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: 6.5, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', display: 'block', marginTop: 2 }}>gerado em {dataBR}</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: '#111', padding: '3.5px 10px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0 }}>
        {[
          { icon: '■', color: '#0A9145', count: totalColadas, label: 'coladas' },
          { icon: '□', color: 'rgba(255,255,255,0.35)', count: totalFaltantes, label: 'faltantes' },
          { icon: '⬤', color: '#E5142A', count: totalRepetidas, label: 'repetidas' },
        ].map(({ icon, color, count, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: '"Geist Mono", monospace', fontSize: 7, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.45)', marginRight: 10 }}>
            <span style={{ fontSize: 9, color }}>{icon}</span>
            <strong style={{ fontWeight: 500, color: '#fff' }}>{count}</strong>&nbsp;{label}
          </div>
        ))}
        <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.15)', position: 'relative', margin: '0 8px' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min(100, pct)}%`, background: '#0A9145' }} />
        </div>
        <span style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 14, color: '#fff', marginRight: 3, lineHeight: 1 }}>{pct.toFixed(1)}%</span>
      </div>

      {/* Content */}
      <div style={{ padding: '4px 8px 2px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {primeira.map((s) => <PrintSecaoBlock key={s._id} secao={s} />)}
        {paises.length > 0 && (
          <div className="lista-print-paises">
            {paises.map((s) => <PrintSecaoBlock key={s._id} secao={s} colunas={10} />)}
          </div>
        )}
        {ultimas.map((s) => <PrintSecaoBlock key={s._id} secao={s} />)}
      </div>

      {/* Legend */}
      <div style={{ padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 10, borderTop: '0.8px solid rgba(10,9,7,0.08)', background: '#fff', flexWrap: 'wrap' }}>
        {[
          { cls: 'lista-print-cell--c', label: 'Colada (preenchida)', desc: 'sólido' },
          { cls: 'lista-print-cell--f', label: 'Faltante', desc: 'borda tracejada' },
          { cls: 'lista-print-cell--r', label: 'Repetida (bolo de repetidas)', desc: 'hachurado' },
        ].map(({ cls, label }) => (
          <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div className={`lista-print-cell ${cls}`} style={{ width: 9, height: 9, fontSize: 0 }} aria-hidden="true" />
            <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: 6.5, letterSpacing: '0.07em', color: 'rgba(10,9,7,0.5)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
}

// ── Main Modal ───────────────────────────────────────────────────────────────

export function ListaFigurinhasModal({ open, onClose, albumId, albumNome }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['album-figurinhas', albumId],
    queryFn: () => albumsApi.getFigurinhas(albumId),
    enabled: open && !!albumId,
  });

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const secoes: SecaoGrid[] = data?.secoes ?? [];
  const todas = secoes.flatMap((s) => s.figurinhas);
  const totalFigs = todas.length;
  // Coladas: todas as figurinhas no álbum — base do percentual de conclusão.
  const totalColadas = todas.filter((f) => f.colada).length;
  // Repetidas: há sobras no bolo (inclui coladas com cópias extras) — espelha as células.
  const totalRepetidas = todas.filter((f) => isRepetida(f)).length;
  // Faltantes: não colada e sem sobras.
  const totalFaltantes = todas.filter((f) => !f.colada && !isRepetida(f)).length;
  const pct = totalFigs > 0 ? Math.round((totalColadas / totalFigs) * 1000) / 10 : 0;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" role="presentation">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-ink/60" aria-hidden="true" onClick={onClose} />

        {/* Dialog */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Figurinhas — ${albumNome ?? 'Álbum'}`}
          lang="pt-BR"
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: 720,
            maxHeight: '90dvh',
            display: 'flex',
            flexDirection: 'column',
            background: '#fff',
            border: '2px solid #0A0907',
            boxShadow: '6px 6px 0 #0A0907',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ background: '#0A0907', borderBottom: '3px solid #E5142A', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 22, height: 22, background: '#E5142A', border: '1.5px solid rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Archivo Black", sans-serif', fontSize: 9, color: '#fff', transform: 'rotate(-4deg)', flexShrink: 0 }}>MA</div>
              <div>
                <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#fff' }}>Meu Album</div>
                {albumNome && (
                  <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>{albumNome}</div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                className="no-print"
                onClick={() => window.print()}
                aria-label="Imprimir lista de figurinhas"
                style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontFamily: '"Geist Mono", monospace', fontSize: 10, letterSpacing: '0.04em', flexShrink: 0 }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M4 6V2h8v4M4 12H2V7h12v5h-2M4 9h8M6 12v2h4v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Imprimir
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ background: '#111', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#0A9145', fontSize: 11 }}>■</span>
              <strong style={{ color: '#fff' }}>{totalColadas}</strong> coladas
            </span>
            <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 11 }}>□</span>
              <strong style={{ color: '#fff' }}>{totalFaltantes}</strong> faltantes
            </span>
            <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#E5142A', fontSize: 11 }}>⬤</span>
              <strong style={{ color: '#fff' }}>{totalRepetidas}</strong> repetidas
            </span>
            <div style={{ flex: 1, minWidth: 60, height: 3, background: 'rgba(255,255,255,0.15)', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min(100, pct)}%`, background: '#0A9145' }} />
            </div>
            <span style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 16, color: '#fff', flexShrink: 0 }}>{pct.toFixed(1)}%</span>
          </div>

          {/* Legend */}
          <div style={{ padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgba(10,9,7,0.1)', background: '#fafafa', flexShrink: 0, flexWrap: 'wrap' }}>
            {[
              { status: 'c' as Status, label: 'Colada', bg: 'rgba(10,145,69,0.15)', border: '1px solid rgba(10,145,69,0.48)' },
              { status: 'f' as Status, label: 'Faltante', bg: 'transparent', border: '1.5px dashed rgba(10,9,7,0.22)' },
              { status: 'r' as Status, label: 'Repetida', bg: 'rgba(229,20,42,0.1)', border: '1.5px solid #E5142A' },
            ].map(({ status, label, bg, border }) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 12, height: 12, background: bg, border, flexShrink: 0 }} aria-hidden="true" />
                <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: 9, color: 'rgba(10,9,7,0.5)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Sections — scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 4px' }}>
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 32 }} aria-busy="true" aria-label="Carregando figurinhas">
                <div className="w-6 h-6 border-2 border-ink border-t-red rounded-full animate-spin" aria-hidden="true" />
              </div>
            )}
            {!isLoading && secoes.map((secao) => (
              <SecaoBlock key={secao._id} secao={secao} />
            ))}
          </div>
        </div>
      </div>

      {/* Print container rendered as portal (sibling of #root) */}
      {!isLoading && secoes.length > 0 && (
        <PrintContainer
          secoes={secoes}
          albumNome={albumNome}
          totalColadas={totalColadas}
          totalFaltantes={totalFaltantes}
          totalRepetidas={totalRepetidas}
          pct={pct}
        />
      )}
    </>
  );
}
