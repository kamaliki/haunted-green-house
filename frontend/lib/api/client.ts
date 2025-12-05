import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getSession } from 'next-auth/react';
import { getToken } from '@/lib/utils';
import type { ApiError } from '@/types';

/**
 * Create Axios instance with base configuration
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Add authentication token from stored JWT or NextAuth session
      if (typeof window !== 'undefined' && config.headers) {
        // First try to get token from localStorage (for registration flow)
        const storedToken = getToken();
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        } else {
          // Fallback to NextAuth session
          const session = await getSession();
          if (session && (session as any).accessToken) {
            config.headers.Authorization = `Bearer ${(session as any).accessToken}`;
          }
        }
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError<ApiError>) => {
      // Handle common error scenarios
      if (error.response) {
        // Server responded with error status
        const apiError: ApiError = {
          message: error.response.data?.message || 'An error occurred',
          statusCode: error.response.status,
          error: error.response.data?.error,
          details: error.response.data?.details,
        };

        // Handle authentication errors
        if (error.response.status === 401) {
          // Redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }

        return Promise.reject(apiError);
      } else if (error.request) {
        // Request made but no response received
        const isTimeout = error.code === 'ECONNABORTED';
        const networkError: ApiError = {
          message: isTimeout 
            ? 'Request timeout. The server took too long to respond.'
            : 'Network error. Please check your connection.',
          statusCode: 0,
          error: isTimeout ? 'TIMEOUT_ERROR' : 'NETWORK_ERROR',
        };
        return Promise.reject(networkError);
      } else {
        // Something else happened
        const unknownError: ApiError = {
          message: error.message || 'An unexpected error occurred',
          statusCode: 0,
          error: 'UNKNOWN_ERROR',
        };
        return Promise.reject(unknownError);
      }
    }
  );

  return client;
};

export const apiClient = createApiClient();
