import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/api';

const INK  = '#0A0907';
const RED  = '#E5142A';
const GREEN = '#0A9145';
const LINE = 'rgba(10,9,7,0.18)';
const MUTE = 'rgba(10,9,7,0.55)';
const FONT_D = '"Archivo Black", sans-serif';
const FONT_M = '"Geist Mono", "Courier New", monospace';

function Cell({ numero, colada }: { numero: string; colada: boolean }) {
  const style: React.CSSProperties = colada
    ? { background: 'rgba(10,145,69,0.15)', border: '1px solid rgba(10,145,69,0.48)', color: GREEN }
    : { background: 'transparent', border: '1.5px dashed rgba(10,9,7,0.5)', color: 'rgba(10,9,7,0.8)' };
  return (
    <div
      title={`${numero} — ${colada ? 'colada' : 'faltante'}`}
      aria-label={`${numero} ${colada ? 'colada' : 'faltante'}`}
      style={{
        height: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT_M,
        fontSize: 8,
        ...style,
      }}
    >
      {numero}
    </div>
  );
}

function SecaoBlock({ secao }: { secao: { _id: string; nome: string; figurinhas: Array<{ _id: string; numero: string; colada: boolean }> } }) {
  const coladas = secao.figurinhas.filter((f) => f.colada).length;
  const total = secao.figurinhas.length;
  return (
    <section aria-label={secao.nome}>
      <div style={{
        padding: '4px 8px',
        background: '#fafafa',
        borderLeft: `3px solid ${RED}`,
        borderBottom: `1px solid ${LINE}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h3 style={{ fontFamily: FONT_D, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: INK }}>
          {secao.nome}
        </h3>
        <span style={{ fontFamily: FONT_M, fontSize: 9, color: MUTE }}>
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
          <Cell key={f._id} numero={f.numero} colada={f.colada} />
        ))}
      </div>
    </section>
  );
}

export default function FaltantesPublicaPage() {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-faltantes', token],
    queryFn: () => publicApi.getFaltantes(token!),
    enabled: !!token,
    retry: false,
  });

  if (isLoading) {
    return (
      <div style={{ minHeight: '100dvh', background: '#FBF8EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="w-8 h-8 border-2 border-ink border-t-red rounded-full animate-spin" aria-hidden="true" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100dvh', background: '#FBF8EE', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <p role="alert" style={{ fontFamily: FONT_D, fontSize: 14, color: RED, textTransform: 'uppercase', textAlign: 'center' }}>
          Link não encontrado ou revogado
        </p>
        <p style={{ fontFamily: FONT_M, fontSize: 11, color: MUTE, marginTop: 8, textAlign: 'center' }}>
          Este link de compartilhamento não existe ou foi desativado pelo dono do álbum.
        </p>
      </div>
    );
  }

  const { albumNome, secoes } = data;
  const todas = secoes.flatMap((s) => s.figurinhas);
  const totalColadas = todas.filter((f) => f.colada).length;
  const totalFaltantes = todas.length - totalColadas;
  const pct = todas.length > 0 ? Math.round((totalColadas / todas.length) * 1000) / 10 : 0;

  return (
    <div style={{ minHeight: '100dvh', background: '#FBF8EE' }}>
      {/* Header */}
      <div style={{ background: INK, borderBottom: `4px solid ${RED}`, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, background: RED, border: '1.5px solid rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_D, fontSize: 9, color: '#fff', transform: 'rotate(-4deg)', flexShrink: 0 }}>MA</div>
          <div>
            <div style={{ fontFamily: FONT_D, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#fff', lineHeight: 1 }}>Meu Album</div>
            <div style={{ fontFamily: FONT_M, fontSize: 9, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{albumNome}</div>
          </div>
        </div>
        <div style={{ fontFamily: FONT_D, fontSize: 20, color: '#fff' }}>
          {pct.toFixed(1)}<span style={{ fontFamily: FONT_M, fontSize: 11 }}>%</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: '#111', padding: '5px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: FONT_M, fontSize: 10, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: GREEN, fontSize: 11 }}>■</span>
          <strong style={{ color: '#fff' }}>{totalColadas}</strong> coladas
        </span>
        <span style={{ fontFamily: FONT_M, fontSize: 10, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11 }}>□</span>
          <strong style={{ color: '#fff' }}>{totalFaltantes}</strong> faltantes
        </span>
      </div>

      {/* Notice */}
      <div style={{ padding: '8px 16px', background: 'rgba(10,9,7,0.04)', borderBottom: `1px solid ${LINE}` }}>
        <p style={{ fontFamily: FONT_M, fontSize: 9, color: MUTE, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Lista compartilhada · somente leitura
        </p>
      </div>

      {/* Sections */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 720, margin: '0 auto' }}>
        {secoes.map((secao) => (
          <SecaoBlock key={secao._id} secao={secao} />
        ))}
      </div>
    </div>
  );
}
