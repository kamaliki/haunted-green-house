import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSensorData, useHistoricalData, useSpecificSensor } from '../useSensorData';
import * as api from '@/lib/api';
import type { EnvironmentData, TimeSeriesData } from '@/types';

jest.mock('@/lib/api');
const mockedApi = api as jest.Mocked<typeof api>;

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

describe('useSensorData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch current sensor data', async () => {
    const mockData: EnvironmentData = {
      temperature_air: 22.5,
      temperature_soil: 20.0,
      humidity_air: 65,
      humidity_soil: 70,
      light_intensity: 800,
      co2_level: 400,
      soil_moisture: 75,
      soil_ph: 6.5,
      air_quality: 85,
      timestamp: new Date(),
    };

    mockedApi.getCurrentEnvironmentData.mockResolvedValue(mockData);

    const { result } = renderHook(() => useSensorData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(mockedApi.getCurrentEnvironmentData).toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const mockError = new Error('Network error');
    mockedApi.getCurrentEnvironmentData.mockRejectedValue(mockError);

    const { result } = renderHook(() => useSensorData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(mockError);
  });
});

describe('useHistoricalData', () => {
  it('should fetch historical data with query parameters', async () => {
    const query = {
      metrics: ['temperature_air'],
      timeRange: '24h' as const,
    };

    const mockData: TimeSeriesData[] = [
      {
        metric: 'temperature_air',
        data: [{ timestamp: new Date(), value: 22.5 }],
      },
    ];

    mockedApi.getHistoricalData.mockResolvedValue(mockData);

    const { result } = renderHook(() => useHistoricalData(query), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(mockedApi.getHistoricalData).toHaveBeenCalledWith(query);
  });

  it('should not fetch when metrics array is empty', async () => {
    // Clear mocks before this specific test
    jest.clearAllMocks();
    
    const query = {
      metrics: [],
      timeRange: '24h' as const,
    };

    const { result } = renderHook(() => useHistoricalData(query), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isFetching).toBe(false));

    expect(mockedApi.getHistoricalData).not.toHaveBeenCalled();
  });
});

describe('useSpecificSensor', () => {
  it('should fetch specific sensor reading', async () => {
    const mockValue = 22.5;
    mockedApi.getSensorReading.mockResolvedValue(mockValue);

    const { result } = renderHook(() => useSpecificSensor('temperature_air'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBe(mockValue);
    expect(mockedApi.getSensorReading).toHaveBeenCalledWith('temperature_air');
  });

  it('should not fetch when metric is empty', async () => {
    // Clear mocks before this specific test
    jest.clearAllMocks();
    
    const { result } = renderHook(() => useSpecificSensor(''), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isFetching).toBe(false));

    expect(mockedApi.getSensorReading).not.toHaveBeenCalled();
  });
});
