interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'muted' | 'info' | 'danger';
  className?: string;
}

const variantClasses = {
  success: 'bg-green/10 text-green border-green/30',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-300',
  muted: 'bg-ink/8 text-ink/70 border-ink/20',
  info: 'bg-blue/10 text-blue border-blue/30',
  danger: 'bg-red/10 text-red-dark border-red/30',
};

export function Badge({ label, variant = 'info', className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 text-[11px] font-mono font-semibold uppercase tracking-wide border rounded-none',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {label}
    </span>
  );
}
