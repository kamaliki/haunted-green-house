import { apiClient } from '../client';
import {
  getCurrentEnvironmentData,
  getHistoricalData,
  getSensorReading,
  getZoneEnvironmentData,
  getZoneHistoricalData,
} from '../environment';
import type { EnvironmentData, TimeSeriesData } from '@/types';

jest.mock('../client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Environment API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentEnvironmentData', () => {
    it('should fetch current environment data and convert timestamp', async () => {
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
        timestamp: new Date('2024-01-01T12:00:00Z'),
      };

      mockedApiClient.get.mockResolvedValue({ data: mockData });

      const result = await getCurrentEnvironmentData();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/environment/current');
      expect(result).toEqual(mockData);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should handle API errors', async () => {
      const mockError = {
        message: 'Network error',
        statusCode: 0,
      };

      mockedApiClient.get.mockRejectedValue(mockError);

      await expect(getCurrentEnvironmentData()).rejects.toEqual(mockError);
    });
  });

  describe('getHistoricalData', () => {
    it('should fetch historical data with correct parameters', async () => {
      const query = {
        metrics: ['temperature_air', 'humidity_air'],
        timeRange: '24h' as const,
      };

      const mockData: TimeSeriesData[] = [
        {
          metric: 'temperature_air',
          data: [
            { timestamp: new Date('2024-01-01T12:00:00Z'), value: 22.5 },
            { timestamp: new Date('2024-01-01T13:00:00Z'), value: 23.0 },
          ],
        },
      ];

      mockedApiClient.get.mockResolvedValue({ data: mockData });

      const result = await getHistoricalData(query);

      expect(mockedApiClient.get).toHaveBeenCalledWith('/environment/historical', {
        params: {
          metrics: 'temperature_air,humidity_air',
          timeRange: '24h',
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0].data[0].timestamp).toBeInstanceOf(Date);
    });

    it('should include optional date parameters when provided', async () => {
      const query = {
        metrics: ['temperature_air'],
        timeRange: '24h' as const,
        startTime: new Date('2024-01-01T00:00:00Z'),
        endTime: new Date('2024-01-02T00:00:00Z'),
      };

      mockedApiClient.get.mockResolvedValue({ data: [] });

      await getHistoricalData(query);

      expect(mockedApiClient.get).toHaveBeenCalledWith('/environment/historical', {
        params: expect.objectContaining({
          startTime: query.startTime.toISOString(),
          endTime: query.endTime.toISOString(),
        }),
      });
    });
  });

  describe('getSensorReading', () => {
    it('should fetch specific sensor reading', async () => {
      const mockValue = 22.5;
      mockedApiClient.get.mockResolvedValue({ data: { value: mockValue } });

      const result = await getSensorReading('temperature_air');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/environment/sensor/temperature_air');
      expect(result).toBe(mockValue);
    });
  });

  describe('getZoneEnvironmentData', () => {
    it('should fetch current environment data for a specific zone', async () => {
      const zoneId = 'zone-123';
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
        timestamp: new Date('2024-01-01T12:00:00Z'),
      };

      mockedApiClient.get.mockResolvedValue({ data: mockData });

      const result = await getZoneEnvironmentData(zoneId);

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/environment/sensors/latest', {
        params: { zoneId },
      });
      expect(result).toEqual(mockData);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should handle API errors for zone data', async () => {
      const mockError = {
        message: 'Zone not found',
        statusCode: 404,
      };

      mockedApiClient.get.mockRejectedValue(mockError);

      await expect(getZoneEnvironmentData('invalid-zone')).rejects.toEqual(mockError);
    });
  });

  describe('getZoneHistoricalData', () => {
    it('should fetch historical data for a specific zone with correct parameters', async () => {
      const zoneId = 'zone-123';
      const query = {
        metrics: ['temperature_air', 'humidity_air'],
        timeRange: '24h' as const,
      };

      const mockData: TimeSeriesData[] = [
        {
          metric: 'temperature_air',
          data: [
            { timestamp: new Date('2024-01-01T12:00:00Z'), value: 22.5 },
            { timestamp: new Date('2024-01-01T13:00:00Z'), value: 23.0 },
          ],
        },
        {
          metric: 'humidity_air',
          data: [
            { timestamp: new Date('2024-01-01T12:00:00Z'), value: 65 },
            { timestamp: new Date('2024-01-01T13:00:00Z'), value: 66 },
          ],
        },
      ];

      mockedApiClient.get.mockResolvedValue({ data: mockData });

      const result = await getZoneHistoricalData(zoneId, query);

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/environment/sensors/historical', {
        params: {
          zoneId,
          metrics: 'temperature_air,humidity_air',
          timeRange: '24h',
        },
      });
      expect(result).toHaveLength(2);
      expect(result[0].data[0].timestamp).toBeInstanceOf(Date);
      expect(result[1].data[0].timestamp).toBeInstanceOf(Date);
    });

    it('should include optional date parameters for zone historical data', async () => {
      const zoneId = 'zone-123';
      const query = {
        metrics: ['temperature_air'],
        timeRange: '24h' as const,
        startTime: new Date('2024-01-01T00:00:00Z'),
        endTime: new Date('2024-01-02T00:00:00Z'),
      };

      mockedApiClient.get.mockResolvedValue({ data: [] });

      await getZoneHistoricalData(zoneId, query);

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/environment/sensors/historical', {
        params: expect.objectContaining({
          zoneId,
          startTime: query.startTime.toISOString(),
          endTime: query.endTime.toISOString(),
        }),
      });
    });

    it('should handle errors when fetching zone historical data', async () => {
      const mockError = {
        message: 'Failed to fetch historical data',
        statusCode: 500,
      };

      mockedApiClient.get.mockRejectedValue(mockError);

      await expect(
        getZoneHistoricalData('zone-123', {
          metrics: ['temperature_air'],
          timeRange: '24h',
        })
      ).rejects.toEqual(mockError);
    });

    it('should handle empty data response for zone', async () => {
      const zoneId = 'zone-123';
      const query = {
        metrics: ['temperature_air'],
        timeRange: '24h' as const,
      };

      mockedApiClient.get.mockResolvedValue({ data: [] });

      const result = await getZoneHistoricalData(zoneId, query);

      expect(result).toEqual([]);
    });
  });
});
