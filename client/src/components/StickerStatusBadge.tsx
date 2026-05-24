import type { ElegibilidadeStatus } from '@meualbum/shared';

const config: Record<ElegibilidadeStatus, { label: string; className: string }> = {
  PODE_COLAR: {
    label: 'Pode colar',
    className: 'bg-green/10 text-green border-green/30',
  },
  JA_COLADA: {
    label: 'Já colada',
    className: 'bg-yellow-50 text-yellow-800 border-yellow-300',
  },
  FORA_CATALOGO: {
    label: 'Fora do catálogo',
    className: 'bg-ink/8 text-ink/50 border-ink/20',
  },
};

interface StickerStatusBadgeProps {
  status: ElegibilidadeStatus;
  className?: string;
}

export function StickerStatusBadge({ status, className = '' }: StickerStatusBadgeProps) {
  const { label, className: colorClass } = config[status];
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 text-[11px] font-mono font-semibold uppercase tracking-wide border',
        colorClass,
        className,
      ].join(' ')}
    >
      {label}
    </span>
  );
}
