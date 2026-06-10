interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  className?: string;
}

export function ProgressBar({ value, max = 100, label, showPercent = true, className = '' }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const displayPercent = Math.round(percent * 10) / 10;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-xs font-mono text-ink/70 uppercase tracking-wide">{label}</span>}
          {showPercent && (
            <span className="text-xs font-mono font-semibold text-ink" aria-hidden="true">
              {displayPercent}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-ink/10 h-2 rounded-none overflow-hidden" aria-hidden="true">
        <div
          className="h-full bg-green transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div
        role="progressbar"
        aria-valuenow={displayPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `Progresso: ${displayPercent}%`}
        className="sr-only"
      />
    </div>
  );
}
