import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useIrrigationStatus,
  useReservoirLevel,
  useStartIrrigation,
  useStopIrrigation,
} from '../useIrrigationStatus';
import * as api from '@/lib/api';
import type { IrrigationStatus } from '@/types';

jest.mock('@/lib/api');
const mockedApi = api as jest.Mocked<typeof api>;

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

describe('useIrrigationStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch irrigation status', async () => {
    const mockStatus: IrrigationStatus = {
      active: true,
      waterFlow: 5.5,
      reservoirLevel: 85,
      lastStarted: new Date(),
    };

    mockedApi.getIrrigationStatus.mockResolvedValue(mockStatus);

    const { result } = renderHook(() => useIrrigationStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockStatus);
  });
});

describe('useReservoirLevel', () => {
  it('should fetch reservoir level', async () => {
    const mockLevel = 75.5;
    mockedApi.getReservoirLevel.mockResolvedValue(mockLevel);

    const { result } = renderHook(() => useReservoirLevel(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBe(mockLevel);
  });
});

describe('useStartIrrigation', () => {
  it('should start irrigation successfully', async () => {
    const mockStatus: IrrigationStatus = {
      active: true,
      waterFlow: 5.5,
      reservoirLevel: 85,
      lastStarted: new Date(),
    };

    mockedApi.startIrrigation.mockResolvedValue(mockStatus);

    const { result } = renderHook(() => useStartIrrigation(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApi.startIrrigation).toHaveBeenCalled();
  });

  it('should handle start irrigation errors', async () => {
    const mockError = new Error('Failed to start irrigation');
    mockedApi.startIrrigation.mockRejectedValue(mockError);

    const { result } = renderHook(() => useStartIrrigation(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(mockError);
  });
});

describe('useStopIrrigation', () => {
  it('should stop irrigation successfully', async () => {
    const mockStatus: IrrigationStatus = {
      active: false,
      waterFlow: 0,
      reservoirLevel: 85,
    };

    mockedApi.stopIrrigation.mockResolvedValue(mockStatus);

    const { result } = renderHook(() => useStopIrrigation(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApi.stopIrrigation).toHaveBeenCalled();
  });

  it('should handle stop irrigation errors', async () => {
    const mockError = new Error('Failed to stop irrigation');
    mockedApi.stopIrrigation.mockRejectedValue(mockError);

    const { result } = renderHook(() => useStopIrrigation(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(mockError);
  });
});
