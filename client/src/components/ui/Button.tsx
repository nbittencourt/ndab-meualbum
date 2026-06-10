import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantClasses = {
  primary:
    'bg-red text-white border-2 border-ink [box-shadow:3px_3px_0_#0A0907] hover:brightness-90 active:translate-x-[2px] active:translate-y-[2px] active:[box-shadow:1px_1px_0_#0A0907]',
  secondary:
    'bg-paper text-ink border-2 border-ink [box-shadow:3px_3px_0_#0A0907] hover:brightness-90 active:translate-x-[2px] active:translate-y-[2px] active:[box-shadow:1px_1px_0_#0A0907]',
  ghost: 'bg-transparent text-ink border-2 border-ink hover:bg-ink/5',
  danger:
    'bg-red text-white border-2 border-red [box-shadow:3px_3px_0_#E5142A] hover:brightness-90 active:translate-x-[2px] active:translate-y-[2px] active:[box-shadow:1px_1px_0_#E5142A]',
};

const sizeClasses = {
  sm: 'px-4 py-2 text-sm min-h-[36px]',
  md: 'px-5 py-3 text-sm min-h-[44px]',
  lg: 'px-6 py-4 text-base min-h-[48px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, children, className = '', ...props }, ref) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled ? 'true' : undefined}
        aria-busy={loading ? 'true' : undefined}
        className={[
          'inline-flex items-center justify-center gap-2 font-body font-semibold uppercase tracking-wide transition-all duration-150',
          variantClasses[variant],
          sizeClasses[size],
          isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          className,
        ].join(' ')}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
