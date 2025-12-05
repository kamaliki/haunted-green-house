'use client';

import { motion } from 'framer-motion';
import { GhostIcon } from './Icons';
import { cn } from '@/lib/utils/cn';
import type { ApiError } from '@/types';

export interface ErrorDisplayProps {
  error: Error | ApiError | string;
  title?: string;
  onRetry?: () => void;
  onBack?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Error Display Component
 * Displays error messages with spooky styling and retry options
 */
export function ErrorDisplay({
  error,
  title,
  onRetry,
  onBack,
  className,
  size = 'md',
}: ErrorDisplayProps) {
  // Extract error message
  const errorMessage = typeof error === 'string'
    ? error
    : 'message' in error
    ? error.message
    : 'An unexpected error occurred';

  // Extract error code if available
  const errorCode = typeof error === 'object' && 'statusCode' in error
    ? error.statusCode
    : null;

  // Determine error type and styling
  const isNetworkError = errorCode === 0 || errorMessage.toLowerCase().includes('network');
  const isAuthError = errorCode === 401 || errorCode === 403;
  const isNotFoundError = errorCode === 404;
  const isServerError = errorCode && errorCode >= 500;

  const sizeConfig = {
    sm: {
      icon: 'text-4xl',
      title: 'text-xl',
      message: 'text-sm',
      padding: 'py-6 px-4',
    },
    md: {
      icon: 'text-6xl',
      title: 'text-2xl md:text-3xl',
      message: 'text-base',
      padding: 'py-8 px-6',
    },
    lg: {
      icon: 'text-8xl',
      title: 'text-3xl md:text-4xl',
      message: 'text-lg',
      padding: 'py-12 px-8',
    },
  };

  const config = sizeConfig[size];

  // Select appropriate icon and color
  let icon = '💀';
  let borderColor = 'border-blood-red';
  let titleColor = 'text-blood-red';
  let spookyMessage = 'The spirits have disrupted our connection!';

  if (isNetworkError) {
    icon = '🌫️';
    borderColor = 'border-toxic-purple';
    titleColor = 'text-toxic-purple';
    spookyMessage = 'Lost in the fog... No network connection!';
  } else if (isAuthError) {
    icon = '🔒';
    borderColor = 'border-pumpkin-orange';
    titleColor = 'text-pumpkin-orange';
    spookyMessage = 'The gates are locked... Authentication required!';
  } else if (isNotFoundError) {
    icon = '👻';
    borderColor = 'border-ghost-green';
    titleColor = 'text-ghost-green';
    spookyMessage = 'This page has vanished into the mist!';
  } else if (isServerError) {
    icon = '⚠️';
    borderColor = 'border-pumpkin-orange';
    titleColor = 'text-pumpkin-orange';
    spookyMessage = 'The server is haunted... Try again later!';
  }

  return (
    <div className={cn('retro-card fog-overlay', borderColor, className)}>
      <div className={cn('text-center', config.padding)}>
        {/* Error icon */}
        <div className={cn('mb-4', config.icon)}>
          {icon}
        </div>

        {/* Error title */}
        <h2 className={cn('font-creepster text-glow mb-4', config.title, titleColor)}>
          {title || 'Error'}
        </h2>

        {/* Spooky message */}
        <p className={cn('font-vt323 text-text-secondary mb-2', config.message)}>
          {spookyMessage}
        </p>

        {/* Actual error message */}
        <p className={cn('font-mono text-text-secondary mb-6', config.message)}>
          {errorMessage}
        </p>

        {/* Error code */}
        {errorCode && errorCode > 0 && (
          <p className="font-mono text-xs text-text-secondary mb-6">
            Error Code: {errorCode}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="retro-button bg-ghost-green text-bg-darkest hover:bg-slime-green"
            >
              Try Again
            </button>
          )}
          {onBack && (
            <button
              onClick={onBack}
              className="retro-button bg-toxic-purple text-bone-white hover:bg-pumpkin-orange"
            >
              Go Back
            </button>
          )}
          {!onRetry && !onBack && (
            <button
              onClick={() => window.location.reload()}
              className="retro-button bg-ghost-green text-bg-darkest hover:bg-slime-green"
            >
              Reload Page
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Inline Error Message
 * Smaller error display for inline use in forms or components
 */
export interface InlineErrorProps {
  message: string;
  className?: string;
}

export function InlineError({ message, className }: InlineErrorProps) {
  return (
    <div className={cn(
      'flex items-center gap-2 text-blood-red text-sm font-vt323 mt-1',
      className
    )}>
      <span>⚠️</span>
      <span>{message}</span>
    </div>
  );
}

/**
 * Form Field Error
 * Error display for form field validation
 */
export interface FieldErrorProps {
  error?: string;
  touched?: boolean;
  className?: string;
}

export function FieldError({ error, touched, className }: FieldErrorProps) {
  if (!error || !touched) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className={cn(
        'flex items-center gap-1 text-blood-red text-xs font-mono mt-1',
        className
      )}
    >
      <span>✕</span>
      <span>{error}</span>
    </motion.div>
  );
}

/**
 * Network Error Banner
 * Persistent banner for network connectivity issues
 */
export interface NetworkErrorBannerProps {
  isOnline: boolean;
  className?: string;
}

export function NetworkErrorBanner({ isOnline, className }: NetworkErrorBannerProps) {
  if (isOnline) return null;

  return (
    <div className={cn(
      'fixed top-0 left-0 right-0 z-50',
      'bg-blood-red text-bone-white',
      'py-2 px-4',
      'text-center font-vt323 text-sm',
      'shadow-[0_0_20px_rgba(255,0,110,0.8)]',
      'animate-pulse',
      className
    )}>
      <span className="mr-2">🌫️</span>
      No network connection - You are offline
      <span className="ml-2">🌫️</span>
    </div>
  );
}
