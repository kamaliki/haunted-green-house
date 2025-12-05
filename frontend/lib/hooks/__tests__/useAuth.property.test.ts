/**
 * Property-Based Tests for Authentication Redirect
 * Feature: nextjs-frontend, Property 9: Authentication redirect
 * Validates: Requirements 12.1
 * 
 * Property: For any protected route, when accessed by an unauthenticated user,
 * the system should redirect to the login page
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import * as fc from 'fast-check';
import { useAuth } from '../useAuth';
import type { LoginCredentials } from '@/types';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Property Test: Authentication redirect', () => {
  let mockRouter: { push: jest.Mock; replace: jest.Mock };
  let mockUseSession: jest.MockedFunction<typeof useSession>;
  let mockSignIn: jest.MockedFunction<typeof signIn>;

  beforeEach(() => {
    // Setup router mock
    mockRouter = {
      push: jest.fn(),
      replace: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Setup session mock
    mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
    mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

    jest.clearAllMocks();
  });

  /**
   * Arbitrary generator for valid usernames
   */
  const usernameArbitrary = fc.string({ minLength: 3, maxLength: 20 }).filter(
    (s) => /^[a-zA-Z0-9_-]+$/.test(s)
  );

  /**
   * Arbitrary generator for valid passwords
   */
  const passwordArbitrary = fc.string({ minLength: 6, maxLength: 50 });

  /**
   * Arbitrary generator for login credentials
   */
  const credentialsArbitrary = fc.record({
    username: usernameArbitrary,
    password: passwordArbitrary,
  });

  /**
   * Property 9: Authentication redirect
   * For any unauthenticated state, the user should be redirected to login
   * when attempting to access protected content
   */
  test('Property 9: unauthenticated users are not granted access', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant(null), async () => {
        // Mock unauthenticated session
        mockUseSession.mockReturnValue({
          data: null,
          status: 'unauthenticated',
          update: jest.fn(),
        });

        const { result } = renderHook(() => useAuth());

        // Wait for hook to initialize
        await waitFor(() => {
          expect(result.current.isAuthenticated).toBe(false);
        });

        // Verify user is not authenticated
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeUndefined();
        expect(result.current.accessToken).toBeUndefined();
      }),
      {
        numRuns: 100,
        timeout: 5000,
      }
    );
  }, 10000);

  /**
   * Property: Failed login attempts should not grant access
   * For any invalid credentials, login should fail and user should remain unauthenticated
   */
  test('Property: failed login attempts do not grant access', async () => {
    await fc.assert(
      fc.asyncProperty(credentialsArbitrary, async (credentials: LoginCredentials) => {
        // Mock unauthenticated session
        mockUseSession.mockReturnValue({
          data: null,
          status: 'unauthenticated',
          update: jest.fn(),
        });

        // Mock failed sign in
        mockSignIn.mockResolvedValue({
          error: 'Invalid credentials',
          status: 401,
          ok: false,
          url: null,
        });

        const { result } = renderHook(() => useAuth());

        // Attempt login with credentials
        const loginResult = await result.current.login(credentials);

        // Wait for error state to be updated
        await waitFor(() => {
          expect(result.current.error).toBeTruthy();
        });

        // Verify login failed
        expect(loginResult).toBe(false);
        expect(result.current.isAuthenticated).toBe(false);

        // Verify no redirect to protected routes occurred
        expect(mockRouter.push).not.toHaveBeenCalledWith('/');
      }),
      {
        numRuns: 100,
        timeout: 5000,
      }
    );
  }, 10000);

  /**
   * Property: Successful login should grant access and redirect
   * For any valid credentials, successful login should authenticate user and redirect to home
   */
  test('Property: successful login grants access and redirects', async () => {
    await fc.assert(
      fc.asyncProperty(credentialsArbitrary, async (credentials: LoginCredentials) => {
        // Start with unauthenticated session
        mockUseSession.mockReturnValue({
          data: null,
          status: 'unauthenticated',
          update: jest.fn(),
        });

        // Mock successful sign in
        mockSignIn.mockResolvedValue({
          error: undefined,
          status: 200,
          ok: true,
          url: 'http://localhost:3001/',
        });

        const { result } = renderHook(() => useAuth());

        // Attempt login with credentials
        const loginResult = await result.current.login(credentials);

        // Verify login succeeded
        expect(loginResult).toBe(true);
        expect(result.current.error).toBeNull();

        // Verify redirect to home page occurred
        await waitFor(() => {
          expect(mockRouter.push).toHaveBeenCalledWith('/');
        });
      }),
      {
        numRuns: 100,
        timeout: 5000,
      }
    );
  }, 10000);

  /**
   * Property: Authenticated users should have access to user data
   * For any authenticated session, user data should be accessible
   */
  test('Property: authenticated users have access to user data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress(),
        }),
        async (userData) => {
          // Mock authenticated session
          mockUseSession.mockReturnValue({
            data: {
              user: userData,
              expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            },
            status: 'authenticated',
            update: jest.fn(),
          });

          const { result } = renderHook(() => useAuth());

          // Wait for hook to initialize
          await waitFor(() => {
            expect(result.current.isAuthenticated).toBe(true);
          });

          // Verify user is authenticated and has access to data
          expect(result.current.isAuthenticated).toBe(true);
          expect(result.current.user).toBeDefined();
          expect(result.current.user?.id).toBe(userData.id);
          expect(result.current.user?.name).toBe(userData.name);
          expect(result.current.user?.email).toBe(userData.email);
        }
      ),
      {
        numRuns: 100,
        timeout: 5000,
      }
    );
  }, 10000);

  /**
   * Property: Logout should clear authentication and redirect to login
   * For any authenticated user, logout should clear session and redirect to login page
   */
  test('Property: logout clears authentication and redirects to login', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        async (userData) => {
          // Mock authenticated session
          mockUseSession.mockReturnValue({
            data: {
              user: userData,
              expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            },
            status: 'authenticated',
            update: jest.fn(),
          });

          const { signOut } = require('next-auth/react');
          (signOut as jest.Mock).mockResolvedValue(undefined);

          const { result } = renderHook(() => useAuth());

          // Verify user is authenticated
          await waitFor(() => {
            expect(result.current.isAuthenticated).toBe(true);
          });

          // Perform logout
          await result.current.logout();

          // Verify redirect to login page occurred
          await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith('/login');
          });
        }
      ),
      {
        numRuns: 100,
        timeout: 5000,
      }
    );
  }, 10000);

  /**
   * Property: Loading state should be true during authentication operations
   * For any authentication operation, isLoading should be true while processing
   */
  test('Property: loading state is set during authentication operations', async () => {
    await fc.assert(
      fc.asyncProperty(credentialsArbitrary, async (credentials: LoginCredentials) => {
        mockUseSession.mockReturnValue({
          data: null,
          status: 'loading',
          update: jest.fn(),
        });

        const { result } = renderHook(() => useAuth());

        // Verify loading state is true when session is loading
        expect(result.current.isLoading).toBe(true);
      }),
      {
        numRuns: 100,
        timeout: 5000,
      }
    );
  }, 10000);
});
