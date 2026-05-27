import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, rightElement, className = '', id, required, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    const describedBy = [error ? errorId : '', hint ? hintId : ''].filter(Boolean).join(' ') || undefined;

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <label
            htmlFor={inputId}
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink font-medium"
          >
            {label}
          </label>
          {required && <span aria-hidden="true" className="font-mono text-[11px] text-red font-medium">*</span>}
        </div>
        {hint && (
          <p id={hintId} className="text-xs text-ink/60 font-body">
            {hint}
          </p>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy}
            aria-required={required ? 'true' : undefined}
            required={required}
            className={[
              'w-full border border-ink rounded-[4px] px-3 py-3 text-sm font-body text-ink bg-white outline-none',
              'focus:border-red focus:ring-[3px] focus:ring-red/[0.18]',
              'placeholder:text-ink/40',
              'transition-all duration-150',
              error ? 'border-red' : '',
              rightElement ? 'pr-10' : '',
              className,
            ].join(' ')}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
          )}
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-xs text-red font-body flex items-center gap-1">
            <span aria-hidden="true">⚠</span><span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
