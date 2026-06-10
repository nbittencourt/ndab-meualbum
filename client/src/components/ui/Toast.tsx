import { useEffect, useState, type ReactNode } from 'react';

interface ToastProps {
  message: string | null;
  variant?: 'info' | 'error' | 'success';
  duration?: number;
  onDismiss?: () => void;
}

export function Toast({ message, variant = 'info', duration = 4000, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) { setVisible(false); return; }
    setVisible(true);
    const t = setTimeout(() => { setVisible(false); onDismiss?.(); }, duration);
    return () => clearTimeout(t);
  }, [message, duration, onDismiss]);

  if (!visible || !message) return null;

  const colorMap = {
    info: 'bg-blue text-white',
    error: 'bg-red text-white',
    success: 'bg-green text-white',
  };

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={[
        'fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] px-5 py-3',
        'border-2 border-ink [box-shadow:3px_3px_0_#0A0907]',
        'text-sm font-body font-semibold max-w-[90vw]',
        colorMap[variant],
      ].join(' ')}
    >
      {message}
    </div>
  );
}

interface ToastRegionProps {
  children?: ReactNode;
}

export function ToastRegion({ children }: ToastRegionProps) {
  return (
    <div aria-live="polite" aria-atomic="false" className="sr-only">
      {children}
    </div>
  );
}
