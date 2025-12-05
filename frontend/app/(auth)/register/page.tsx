'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { AccountCreationForm } from '@/components/auth/AccountCreationForm';
import { GreenhouseSetupForm } from '@/components/auth/GreenhouseSetupForm';
import { registerUser, createGreenhouse } from '@/lib/api';
import { storeToken } from '@/lib/utils';
import type { ApiError } from '@/types';

export interface AccountData {
  username: string;
  email: string;
  password: string;
}

export interface ZoneInput {
  name: string;
  description?: string;
}

export interface GreenhouseData {
  name: string;
  location: string;
  description?: string;
  zones: ZoneInput[];
}

export interface RegistrationState {
  step: 'account' | 'greenhouse';
  accountData: AccountData | null;
  greenhouseData: GreenhouseData | null;
}

export default function RegisterPage() {
  const router = useRouter();
  const [registrationState, setRegistrationState] = useState<RegistrationState>({
    step: 'account',
    accountData: null,
    greenhouseData: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccountCreation = async (accountData: AccountData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call registration API
      const response = await registerUser({
        username: accountData.username,
        email: accountData.email,
        password: accountData.password,
      });

      // Store JWT token for authenticated requests
      storeToken(response.accessToken);
      
      // Create NextAuth session using the registration token
      const signInResult = await signIn('credentials', {
        accessToken: response.accessToken,
        isRegistration: 'true',
        redirect: false,
      });

      if (signInResult?.error) {
        // If session creation fails, still proceed to greenhouse setup
        // The token is already stored for API calls
        console.warn('Failed to create NextAuth session, but proceeding with stored token');
      }
      
      // Store account data and move to greenhouse setup
      setRegistrationState({
        step: 'greenhouse',
        accountData,
        greenhouseData: null,
      });
    } catch (err) {
      const apiError = err as ApiError;
      let errorMessage = 'Failed to create account';
      
      if (apiError.statusCode === 409) {
        errorMessage = apiError.message || 'Username or email already exists';
      } else if (apiError.statusCode === 400) {
        errorMessage = apiError.message || 'Invalid registration data';
      } else if (apiError.statusCode === 0) {
        errorMessage = apiError.message || 'Network error. Please check your connection.';
      } else {
        errorMessage = apiError.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGreenhouseSetup = async (greenhouseData: GreenhouseData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call greenhouse setup API
      await createGreenhouse({
        name: greenhouseData.name,
        location: greenhouseData.location,
        description: greenhouseData.description,
        zones: greenhouseData.zones.map(zone => ({
          name: zone.name,
          description: zone.description,
        })),
      });
      
      // Complete registration and redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      const apiError = err as ApiError;
      let errorMessage = 'Failed to setup greenhouse';
      
      if (apiError.statusCode === 400) {
        errorMessage = apiError.message || 'Invalid greenhouse data';
      } else if (apiError.statusCode === 401) {
        errorMessage = 'Authentication failed. Please try registering again.';
      } else if (apiError.statusCode === 0) {
        errorMessage = apiError.message || 'Network error. Please check your connection.';
      } else {
        errorMessage = apiError.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipGreenhouseSetup = () => {
    // Navigate to dashboard without greenhouse setup
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-bg-darkest to-bg-dark relative overflow-hidden">
      {/* Fog overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-toxic-purple/10 to-transparent animate-fog pointer-events-none" />
      
      {/* Floating ghosts decoration */}
      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-float">
        👻
      </div>
      <div className="absolute bottom-20 right-20 text-6xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>
        👻
      </div>
      <div className="absolute top-1/3 right-10 text-4xl opacity-15 animate-float" style={{ animationDelay: '2s' }}>
        💀
      </div>
      <div className="absolute bottom-1/3 left-20 text-3xl opacity-10 animate-float" style={{ animationDelay: '3s' }}>
        🕸️
      </div>

      <div className="relative z-10 w-full max-w-2xl px-4">
        {/* Progress indicator */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className={`flex items-center space-x-2 ${registrationState.step === 'account' ? 'text-ghost-green' : 'text-text-secondary'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                registrationState.step === 'account' 
                  ? 'border-ghost-green bg-ghost-green text-bg-dark' 
                  : registrationState.accountData 
                    ? 'border-ghost-green bg-ghost-green text-bg-dark'
                    : 'border-text-secondary'
              }`}>
                {registrationState.accountData ? '✓' : '1'}
              </div>
              <span className="font-retro text-sm">CREATE ACCOUNT</span>
            </div>
            
            <div className="flex-1 h-0.5 bg-text-secondary relative">
              <div className={`absolute inset-0 bg-ghost-green transition-all duration-500 ${
                registrationState.accountData ? 'w-full' : 'w-0'
              }`} />
            </div>
            
            <div className={`flex items-center space-x-2 ${registrationState.step === 'greenhouse' ? 'text-ghost-green' : 'text-text-secondary'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                registrationState.step === 'greenhouse' 
                  ? 'border-ghost-green bg-ghost-green text-bg-dark' 
                  : 'border-text-secondary'
              }`}>
                2
              </div>
              <span className="font-retro text-sm">SETUP GREENHOUSE</span>
            </div>
          </div>
        </div>

        {/* Step content */}
        {registrationState.step === 'account' && (
          <AccountCreationForm
            onSubmit={handleAccountCreation}
            isLoading={isLoading}
            error={error}
          />
        )}

        {registrationState.step === 'greenhouse' && (
          <GreenhouseSetupForm
            onSubmit={handleGreenhouseSetup}
            onSkip={handleSkipGreenhouseSetup}
            isLoading={isLoading}
            error={error}
          />
        )}
      </div>
    </div>
  );
}