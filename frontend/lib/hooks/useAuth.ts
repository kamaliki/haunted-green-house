'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { LoginCredentials } from '@/types';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        username: credentials.username,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid username or password');
        return false;
      }

      if (result?.ok) {
        router.push('/');
        return true;
      }

      return false;
    } catch (err) {
      setError('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut({ redirect: false });
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user: session?.user,
    accessToken: (session as any)?.accessToken,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading' || isLoading,
    error,
    login,
    logout,
  };
}
