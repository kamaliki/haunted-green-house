'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { GhostIcon } from './Icons';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component with Spooky Styling
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default spooky error page
      return (
        <div className="min-h-screen bg-bg-darkest flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="retro-card fog-overlay border-blood-red">
              <div className="text-center py-12 px-6">
                {/* Spooky error icon */}
                <div className="mb-6">
                  <GhostIcon size="xl" animate className="mx-auto" />
                </div>

                {/* Error title */}
                <h1 className="text-4xl md:text-5xl font-creepster text-blood-red text-glow mb-4">
                  Something Went Wrong!
                </h1>

                {/* Error message */}
                <p className="font-vt323 text-lg text-text-secondary mb-6">
                  The spirits have disrupted the application...
                </p>

                {/* Error details in development */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="mb-6 text-left">
                    <div className="bg-bg-darkest border-2 border-toxic-purple rounded p-4 overflow-auto max-h-48">
                      <p className="font-mono text-xs text-blood-red mb-2">
                        {this.state.error.toString()}
                      </p>
                      {this.state.errorInfo && (
                        <pre className="font-mono text-xs text-text-secondary whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={this.handleReset}
                    className="retro-button bg-ghost-green text-bg-darkest hover:bg-slime-green"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="retro-button bg-toxic-purple text-bone-white hover:bg-pumpkin-orange"
                  >
                    Return Home
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="retro-button bg-bg-medium text-ghost-green hover:bg-bg-dark"
                  >
                    Reload Page
                  </button>
                </div>

                {/* Help text */}
                <p className="font-vt323 text-sm text-text-secondary mt-8">
                  💀 If the problem persists, contact the graveyard keeper 💀
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary wrapper for functional components
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
