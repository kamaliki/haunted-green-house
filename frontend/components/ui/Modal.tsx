import React, { useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  tombstone?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className,
  tombstone = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn(
          'relative bg-gradient-card border-4 border-ghost-green shadow-glow-intense max-w-2xl w-full max-h-[90vh] overflow-y-auto',
          tombstone ? 'rounded-t-3xl rounded-b-lg' : 'rounded-lg',
          'pixel-corners',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombstone top decoration */}
        {tombstone && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl">
            🪦
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ghost-green hover:text-blood-red transition-colors text-2xl z-10"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Header */}
        {title && (
          <div className="border-b-4 border-toxic-purple p-6 bg-bg-dark">
            <h2 className="text-2xl font-bold text-ghost-green font-creepster text-center">
              {title}
            </h2>
          </div>
        )}

        {/* Content */}
        <div className="p-6 relative">
          {/* Fog overlay */}
          <div className="absolute inset-0 bg-bg-fog animate-fog pointer-events-none" />
          
          {/* Cobweb decorations */}
          <div className="absolute top-0 left-0 text-2xl opacity-20">🕸️</div>
          <div className="absolute top-0 right-0 text-2xl opacity-20">🕸️</div>
          
          <div className="relative z-10">{children}</div>
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t-4 border-toxic-purple p-6 bg-bg-dark flex justify-end gap-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className }) => {
  return <div className={cn('flex justify-end gap-4', className)}>{children}</div>;
};
