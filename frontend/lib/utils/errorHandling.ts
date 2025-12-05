import type { ApiError } from '@/types';

/**
 * Format error message for display
 */
export function formatErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
  }

  return 'An unexpected error occurred';
}

/**
 * Get user-friendly error title based on error type
 */
export function getErrorTitle(error: unknown): string {
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const statusCode = (error as ApiError).statusCode;
    
    if (statusCode === 0) {
      const errorType = (error as ApiError).error;
      if (errorType === 'TIMEOUT_ERROR') {
        return 'Request Timeout';
      }
      return 'Network Error';
    }
    
    if (statusCode === 400) return 'Bad Request';
    if (statusCode === 401) return 'Unauthorized';
    if (statusCode === 403) return 'Forbidden';
    if (statusCode === 404) return 'Not Found';
    if (statusCode === 409) return 'Conflict';
    if (statusCode === 422) return 'Validation Error';
    if (statusCode >= 500) return 'Server Error';
  }

  return 'Error';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    if ('statusCode' in error && (error as ApiError).statusCode === 0) {
      return true;
    }
    if ('error' in error && (error as ApiError).error === 'NETWORK_ERROR') {
      return true;
    }
  }
  return false;
}

/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    if ('error' in error && (error as ApiError).error === 'TIMEOUT_ERROR') {
      return true;
    }
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    if ('statusCode' in error) {
      const statusCode = (error as ApiError).statusCode;
      return statusCode === 401 || statusCode === 403;
    }
  }
  return false;
}

/**
 * Get retry delay based on attempt number (exponential backoff)
 */
export function getRetryDelay(attempt: number, baseDelay: number = 1000): number {
  return Math.min(baseDelay * Math.pow(2, attempt), 30000); // Max 30 seconds
}

/**
 * Check if error should trigger a retry
 */
export function shouldRetry(error: unknown, attempt: number, maxAttempts: number = 3): boolean {
  if (attempt >= maxAttempts) {
    return false;
  }

  // Retry on network errors and timeouts
  if (isNetworkError(error) || isTimeoutError(error)) {
    return true;
  }

  // Retry on 5xx server errors
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const statusCode = (error as ApiError).statusCode;
    return statusCode >= 500 && statusCode < 600;
  }

  return false;
}
