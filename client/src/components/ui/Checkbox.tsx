import { forwardRef, type InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string | React.ReactNode;
  error?: string;
  id: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const errorId = `${id}-error`;
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="flex items-start gap-3 cursor-pointer group">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            role="checkbox"
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? errorId : undefined}
            className={[
              'mt-0.5 w-5 h-5 min-w-[20px] border-2 border-ink rounded-none',
              'accent-red cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-red focus:ring-offset-1',
              className,
            ].join(' ')}
            {...props}
          />
          <span className="text-sm font-body text-ink leading-snug">{label}</span>
        </label>
        {error && (
          <p id={errorId} role="alert" className="text-xs text-red font-body ml-8">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
