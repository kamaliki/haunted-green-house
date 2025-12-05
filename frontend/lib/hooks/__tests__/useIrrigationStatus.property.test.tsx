/**
 * Property-Based Tests for Irrigation Status Hooks
 * Feature: nextjs-frontend, Property 4: Zone-specific irrigation command acknowledgment
 * Validates: Requirements 4.1, 4.3
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as fc from 'fast-check';
import {
  useIrrigationStatus,
  useStartIrrigation,
  useStopIrrigation,
} from '../useIrrigationStatus';
import * as irrigationApi from '@/lib/api/irrigation';
import type { IrrigationStatus } from '@/types';

// Mock the irrigation API
jest.mock('@/lib/api/irrigation');
const mockedIrrigationApi = irrigationApi as jest.Mocked<typeof irrigationApi>;

// Helper to create a wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Property-Based Tests: Irrigation Command Acknowledgment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 4: Zone-specific irrigation command acknowledgment
   * 
   * For any irrigation start or stop command for a specific zone,
   * when the command is sent to the backend, the UI should display
   * a loading state until receiving confirmation for that zone.
   */
  describe('Property 4: Zone-specific irrigation command acknowledgment', () => {
    it('should show loading state during start irrigation command for any zone', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary zone IDs
          fc.string({ minLength: 1, maxLength: 50 }),
          // Generate arbitrary irrigation status
          fc.record({
            active: fc.boolean(),
            waterFlow: fc.float({ min: 0, max: 20 }),
            reservoirLevel: fc.float({ min: 0, max: 100 }),
            duration: fc.option(fc.integer({ min: 0, max: 3600 })),
          }),
          async (zoneId, statusData) => {
            // Create a promise that we can control
            let resolvePromise: (value: IrrigationStatus) => void;
            const commandPromise = new Promise<IrrigationStatus>((resolve) => {
              resolvePromise = resolve;
            });

            // Mock the API to return our controlled promise
            const mockStatus: IrrigationStatus = {
              zoneId,
              ...statusData,
              lastStarted: new Date(),
            };
            mockedIrrigationApi.startIrrigation.mockReturnValue(commandPromise);

            // Render the hook
            const wrapper = createWrapper();
            const { result } = renderHook(() => useStartIrrigation(zoneId), { wrapper });

            // Initially, mutation should not be pending
            expect(result.current.isPending).toBe(false);

            // Trigger the mutation
            let mutationPromise: Promise<IrrigationStatus>;
            await act(async () => {
              mutationPromise = result.current.mutateAsync();
            });

            // Immediately after triggering, isPending should be true (loading state)
            await waitFor(() => {
              expect(result.current.isPending).toBe(true);
            });

            // Resolve the API call
            await act(async () => {
              resolvePromise!(mockStatus);
              await mutationPromise!;
            });

            // After completion, isPending should be false
            await waitFor(() => {
              expect(result.current.isPending).toBe(false);
            });

            // Verify the API was called with correct zone
            expect(mockedIrrigationApi.startIrrigation).toHaveBeenCalledWith(
              zoneId,
              undefined
            );
          }
        ),
        { numRuns: 20 }
      );
    }, 60000);

    it('should show loading state during stop irrigation command for any zone', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary zone IDs
          fc.string({ minLength: 1, maxLength: 50 }),
          // Generate arbitrary irrigation status
          fc.record({
            active: fc.boolean(),
            waterFlow: fc.float({ min: 0, max: 20 }),
            reservoirLevel: fc.float({ min: 0, max: 100 }),
          }),
          async (zoneId, statusData) => {
            // Create a promise that we can control
            let resolvePromise: (value: IrrigationStatus) => void;
            const commandPromise = new Promise<IrrigationStatus>((resolve) => {
              resolvePromise = resolve;
            });

            // Mock the API to return our controlled promise
            const mockStatus: IrrigationStatus = {
              zoneId,
              ...statusData,
            };
            mockedIrrigationApi.stopIrrigation.mockReturnValue(commandPromise);

            // Render the hook
            const wrapper = createWrapper();
            const { result } = renderHook(() => useStopIrrigation(zoneId), { wrapper });

            // Initially, mutation should not be pending
            expect(result.current.isPending).toBe(false);

            // Trigger the mutation
            let mutationPromise: Promise<IrrigationStatus>;
            await act(async () => {
              mutationPromise = result.current.mutateAsync();
            });

            // Immediately after triggering, isPending should be true (loading state)
            await waitFor(() => {
              expect(result.current.isPending).toBe(true);
            });

            // Resolve the API call
            await act(async () => {
              resolvePromise!(mockStatus);
              await mutationPromise!;
            });

            // After completion, isPending should be false
            await waitFor(() => {
              expect(result.current.isPending).toBe(false);
            });

            // Verify the API was called with correct zone
            expect(mockedIrrigationApi.stopIrrigation).toHaveBeenCalledWith(zoneId);
          }
        ),
        { numRuns: 20 }
      );
    }, 60000);

    it('should maintain loading state until confirmation even with errors for any zone', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary zone IDs
          fc.string({ minLength: 1, maxLength: 50 }),
          // Generate arbitrary error messages
          fc.string({ minLength: 1, maxLength: 100 }),
          async (zoneId, errorMessage) => {
            // Create a promise that we can control
            let rejectPromise: (error: Error) => void;
            const commandPromise = new Promise<IrrigationStatus>((_, reject) => {
              rejectPromise = reject;
            });

            // Mock the API to return our controlled promise
            mockedIrrigationApi.startIrrigation.mockReturnValue(commandPromise);

            // Render the hook
            const wrapper = createWrapper();
            const { result } = renderHook(() => useStartIrrigation(zoneId), { wrapper });

            // Initially, mutation should not be pending
            expect(result.current.isPending).toBe(false);

            // Trigger the mutation (don't await yet)
            let mutationPromise: Promise<void>;
            await act(async () => {
              mutationPromise = result.current.mutateAsync().catch(() => {
                // Catch the error to prevent unhandled rejection
              });
            });

            // Immediately after triggering, isPending should be true (loading state)
            await waitFor(() => {
              expect(result.current.isPending).toBe(true);
            });

            // Reject the API call with an error
            await act(async () => {
              rejectPromise!(new Error(errorMessage));
              await mutationPromise!;
            });

            // After error, isPending should be false
            await waitFor(() => {
              expect(result.current.isPending).toBe(false);
            });

            // Verify error state is set
            expect(result.current.isError).toBe(true);
          }
        ),
        { numRuns: 20 }
      );
    }, 60000);

    it('should show loading state for start command with optional duration parameter', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary zone IDs
          fc.string({ minLength: 1, maxLength: 50 }),
          // Generate optional duration
          fc.option(fc.integer({ min: 60, max: 3600 })),
          // Generate arbitrary irrigation status
          fc.record({
            active: fc.constant(true),
            waterFlow: fc.float({ min: 0, max: 20 }),
            reservoirLevel: fc.float({ min: 10, max: 100 }),
          }),
          async (zoneId, duration, statusData) => {
            // Create a promise that we can control
            let resolvePromise: (value: IrrigationStatus) => void;
            const commandPromise = new Promise<IrrigationStatus>((resolve) => {
              resolvePromise = resolve;
            });

            // Mock the API to return our controlled promise
            const mockStatus: IrrigationStatus = {
              zoneId,
              ...statusData,
              duration: duration ?? undefined,
              lastStarted: new Date(),
            };
            mockedIrrigationApi.startIrrigation.mockReturnValue(commandPromise);

            // Render the hook
            const wrapper = createWrapper();
            const { result } = renderHook(() => useStartIrrigation(zoneId), { wrapper });

            // Trigger the mutation with optional duration
            const request = duration !== null ? { duration } : undefined;
            let mutationPromise: Promise<IrrigationStatus>;
            await act(async () => {
              mutationPromise = result.current.mutateAsync(request);
            });

            // Verify loading state is shown
            await waitFor(() => {
              expect(result.current.isPending).toBe(true);
            });

            // Resolve the API call
            await act(async () => {
              resolvePromise!(mockStatus);
              await mutationPromise!;
            });

            // After completion, isPending should be false
            await waitFor(() => {
              expect(result.current.isPending).toBe(false);
            });

            // Verify the API was called correctly
            expect(mockedIrrigationApi.startIrrigation).toHaveBeenCalledWith(
              zoneId,
              request
            );
          }
        ),
        { numRuns: 20 }
      );
    }, 60000);
  });
});
