import type { StickerRankItem as StickerRankItemType } from '@meualbum/shared';

interface StickerRankItemProps {
  item: StickerRankItemType;
  rank: number;
}

export function StickerRankItem({ item, rank }: StickerRankItemProps) {
  const isFirst = rank === 1;

  return (
    <li
      data-testid="ranking-item"
      style={{
        display: 'grid',
        gridTemplateColumns: '24px 56px 1fr auto',
        gap: 12,
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid rgba(10,9,7,0.08)',
        listStyle: 'none',
      }}
    >
      {/* Rank */}
      <span
        style={{
          fontFamily: '"Geist Mono", monospace',
          fontSize: 12,
          color: isFirst ? '#E5142A' : 'rgba(10,9,7,0.4)',
          fontWeight: isFirst ? 700 : 400,
          textAlign: 'center',
        }}
      >
        {rank}
      </span>

      {/* Sticker image placeholder */}
      <div
        style={{
          width: 56,
          height: 72,
          background: '#E0DDD5',
          border: '1px solid rgba(10,9,7,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: 10, color: 'rgba(10,9,7,0.3)', textAlign: 'center', lineHeight: 1.3 }}>
          {item.numero}
        </span>
      </div>

      {/* Name */}
      <div>
        <p
          style={{
            fontFamily: '"Geist", sans-serif',
            fontSize: 13,
            fontWeight: 600,
            color: '#0A0907',
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {item.nome}
        </p>
        <p
          style={{
            fontFamily: '"Geist Mono", monospace',
            fontSize: 11,
            color: 'rgba(10,9,7,0.4)',
            margin: '2px 0 0',
          }}
        >
          #{item.numero}
        </p>
      </div>

      {/* Quantity badge */}
      <div
        style={{
          width: 40,
          height: 40,
          background: isFirst ? '#E5142A' : '#0A0907',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: '"Archivo Black", sans-serif',
            fontSize: 18,
            color: '#ffffff',
            lineHeight: 1,
          }}
        >
          {item.quantidade}
        </span>
      </div>
    </li>
  );
}
