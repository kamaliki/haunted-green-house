import React from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  floating?: boolean;
  fogOverlay?: boolean;
  glow?: boolean;
  cobweb?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  floating = true,
  fogOverlay = true,
  glow = true,
  cobweb = true,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'retro-card',
        floating && 'hover:animate-float transition-all duration-300',
        glow && 'shadow-glow-purple hover:shadow-glow-intense',
        className
      )}
    >
      {fogOverlay && (
        <div className="absolute inset-0 bg-bg-fog animate-fog pointer-events-none" />
      )}
      {cobweb && (
        <div className="absolute top-0 right-0 text-2xl opacity-30 pointer-events-none animate-cobweb-sway">
          🕸️
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div className={cn('mb-4 pb-2 border-b-2 border-ghost-green', className)}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => {
  return (
    <h3 className={cn('text-xl font-bold text-ghost-green font-vt323', className)}>
      {children}
    </h3>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return <div className={cn('text-text-primary', className)}>{children}</div>;
};
