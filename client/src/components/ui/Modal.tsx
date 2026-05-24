import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  titleId?: string;
  children: ReactNode;
  variant?: 'dialog' | 'alertdialog';
  className?: string;
}

export function Modal({ open, onClose, title, titleId, children, variant = 'dialog', className = '' }: ModalProps) {
  const id = titleId ?? `modal-title-${Math.random().toString(36).slice(2)}`;
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.[0]?.focus();
    } else {
      previousFocusRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const focusable = Array.from(
          dialogRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) ?? []
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="presentation"
    >
      <div
        className="fixed inset-0 bg-ink/60"
        aria-hidden="true"
        onClick={variant === 'dialog' ? onClose : undefined}
      />
      <div
        ref={dialogRef}
        role={variant}
        aria-modal="true"
        aria-labelledby={id}
        className={[
          'relative z-10 w-full max-w-md bg-paper border-2 border-ink [box-shadow:6px_6px_0_#0A0907]',
          className,
        ].join(' ')}
      >
        <div className="flex items-center justify-between border-b border-ink/20 px-5 py-4">
          <h2 id={id} className="font-display text-base font-black uppercase tracking-wide text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-1 text-ink/60 hover:text-ink focus:outline-none focus:ring-2 focus:ring-red rounded"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
