import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'retro-button font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-bg-dark text-ghost-green border-ghost-green hover:text-slime-green',
    secondary: 'bg-bg-dark text-toxic-purple border-toxic-purple hover:text-pumpkin-orange',
    danger: 'bg-bg-dark text-blood-red border-blood-red hover:text-pumpkin-orange',
    ghost: 'bg-transparent text-bone-white border-bone-white hover:text-ghost-green hover:border-ghost-green',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      <span className="flex items-center justify-center gap-2">
        {loading && (
          <span className="inline-block animate-spin">👻</span>
        )}
        {!loading && icon && <span>{icon}</span>}
        {children}
      </span>
    </button>
  );
};
