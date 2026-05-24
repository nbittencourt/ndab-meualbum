import { useState, useRef } from 'react';

interface IdentifierProps {
  value: string;
}

export function Identifier({ value }: IdentifierProps) {
  const [copied, setCopied] = useState(false);
  const liveRef = useRef<HTMLSpanElement>(null);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // best effort — fallback para ambientes sem clipboard API
    }
    setCopied(true);
    if (liveRef.current) liveRef.current.textContent = 'Identificador copiado!';
    setTimeout(() => {
      setCopied(false);
      if (liveRef.current) liveRef.current.textContent = '';
    }, 2500);
  }

  const ariaLabel = `Identificador: ${value.split('').join(' ')}`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span
          className="font-mono text-4xl font-black tracking-[0.25em] text-ink select-all"
          aria-label={ariaLabel}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copiar identificador"
          aria-pressed={copied}
          className={[
            'flex items-center gap-1 px-2 py-2 border-2 border-ink text-ink transition-all',
            'hover:bg-ink/5 focus:outline-none focus:ring-2 focus:ring-red focus:ring-offset-1',
            copied ? 'bg-green/10 border-green text-green' : '',
          ].join(' ')}
        >
          {copied ? (
            <>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M3 9l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs font-body font-semibold" aria-hidden="true">Copiado!</span>
            </>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <rect x="6" y="1" width="11" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="1" y="5" width="11" height="12" rx="1" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          )}
        </button>
      </div>
      <span ref={liveRef} aria-live="polite" aria-atomic="true" className="sr-only" />
    </div>
  );
}
