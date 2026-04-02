import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
    
    const variants = {
      primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 hover:shadow hover:-translate-y-px focus:ring-brand-500',
      secondary: 'bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 focus:ring-slate-500',
      danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow hover:-translate-y-px focus:ring-red-500',
      ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
