import React from 'react';
import { cn } from '@/lib/utils/cn';

interface PixelBorderProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  cornerDecorations?: boolean;
  decorationType?: 'skull' | 'ghost' | 'bat' | 'spider';
}

export const PixelBorder: React.FC<PixelBorderProps> = ({
  children,
  className,
  glow = false,
  cornerDecorations = true,
  decorationType = 'skull',
}) => {
  const decorationMap = {
    skull: '💀',
    ghost: '👻',
    bat: '🦇',
    spider: '🕷️',
  };

  const decoration = decorationMap[decorationType];

  return (
    <div
      className={cn(
        'relative pixel-corners',
        glow ? 'pixel-border-glow' : 'pixel-border-md',
        className
      )}
    >
      {cornerDecorations && (
        <>
          <span className="absolute -top-1 -left-1 text-xs opacity-70">
            {decoration}
          </span>
          <span className="absolute -top-1 -right-1 text-xs opacity-70">
            {decoration}
          </span>
          <span className="absolute -bottom-1 -left-1 text-xs opacity-70">
            {decoration}
          </span>
          <span className="absolute -bottom-1 -right-1 text-xs opacity-70">
            {decoration}
          </span>
        </>
      )}
      {children}
    </div>
  );
};
