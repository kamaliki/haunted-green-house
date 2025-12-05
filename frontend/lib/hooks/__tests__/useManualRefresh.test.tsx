import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useManualRefresh } from '../useManualRefresh';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useManualRefresh', () => {
  it('should provide refresh function and loading state', () => {
    const { result } = renderHook(() => useManualRefresh('zone-1'), {
      wrapper: createWrapper(),
    });

    expect(result.current.refresh).toBeDefined();
    expect(typeof result.current.refresh).toBe('function');
    expect(result.current.isRefreshing).toBe(false);
  });

  it('should set isRefreshing to true during refresh', async () => {
    const { result } = renderHook(() => useManualRefresh('zone-1'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isRefreshing).toBe(false);

    act(() => {
      result.current.refresh();
    });

    // Should be refreshing immediately after calling refresh
    expect(result.current.isRefreshing).toBe(true);

    // Wait for refresh to complete
    await waitFor(() => expect(result.current.isRefreshing).toBe(false));
  });

  it('should invalidate zone-specific queries when zoneId is provided', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useManualRefresh('zone-1'), {
      wrapper,
    });

    await act(async () => {
      await result.current.refresh();
    });

    // Verify zone-specific queries were invalidated
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['environment', 'zone', 'zone-1'],
      })
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['irrigation', 'status', 'zone-1'],
      })
    );
  });

  it('should invalidate global queries when no zoneId is provided', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useManualRefresh(), {
      wrapper,
    });

    await act(async () => {
      await result.current.refresh();
    });

    // Verify global queries were invalidated
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['zones', 'summaries'],
      })
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['security'],
      })
    );
  });

  it('should reset isRefreshing after completion', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useManualRefresh('zone-1'), {
      wrapper,
    });

    // Initially not refreshing
    expect(result.current.isRefreshing).toBe(false);

    // Start refresh
    act(() => {
      result.current.refresh();
    });

    // Should be refreshing
    expect(result.current.isRefreshing).toBe(true);

    // Wait for completion
    await waitFor(() => expect(result.current.isRefreshing).toBe(false));

    // Should be back to not refreshing
    expect(result.current.isRefreshing).toBe(false);
  });
});
