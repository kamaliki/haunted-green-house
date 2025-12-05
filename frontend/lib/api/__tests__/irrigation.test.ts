import { apiClient } from '../client';
import {
  getIrrigationStatus,
  startIrrigation,
  stopIrrigation,
  getReservoirLevel,
} from '../irrigation';
import type { IrrigationStatus } from '@/types';

jest.mock('../client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Irrigation API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getIrrigationStatus', () => {
    it('should fetch irrigation status and convert dates', async () => {
      const mockStatus: IrrigationStatus = {
        active: true,
        waterFlow: 5.5,
        reservoirLevel: 85,
        lastStarted: new Date('2024-01-01T12:00:00Z'),
        duration: 300,
      };

      mockedApiClient.get.mockResolvedValue({ data: mockStatus });

      const result = await getIrrigationStatus();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/irrigation/status');
      expect(result.active).toBe(true);
      expect(result.lastStarted).toBeInstanceOf(Date);
    });

    it('should handle status without lastStarted date', async () => {
      const mockStatus: IrrigationStatus = {
        active: false,
        waterFlow: 0,
        reservoirLevel: 85,
      };

      mockedApiClient.get.mockResolvedValue({ data: mockStatus });

      const result = await getIrrigationStatus();

      expect(result.lastStarted).toBeUndefined();
    });
  });

  describe('startIrrigation', () => {
    it('should start irrigation without parameters', async () => {
      const mockStatus: IrrigationStatus = {
        active: true,
        waterFlow: 5.5,
        reservoirLevel: 85,
        lastStarted: new Date('2024-01-01T12:00:00Z'),
      };

      mockedApiClient.post.mockResolvedValue({ data: mockStatus });

      const result = await startIrrigation();

      expect(mockedApiClient.post).toHaveBeenCalledWith('/irrigation/start', {});
      expect(result.active).toBe(true);
    });

    it('should start irrigation with parameters', async () => {
      const request = { duration: 600, zoneId: 'zone-1' };
      const mockStatus: IrrigationStatus = {
        active: true,
        waterFlow: 5.5,
        reservoirLevel: 85,
        lastStarted: new Date('2024-01-01T12:00:00Z'),
        duration: 600,
      };

      mockedApiClient.post.mockResolvedValue({ data: mockStatus });

      const result = await startIrrigation(request);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/irrigation/start', request);
      expect(result.duration).toBe(600);
    });
  });

  describe('stopIrrigation', () => {
    it('should stop irrigation', async () => {
      const mockStatus: IrrigationStatus = {
        active: false,
        waterFlow: 0,
        reservoirLevel: 85,
      };

      mockedApiClient.post.mockResolvedValue({ data: mockStatus });

      const result = await stopIrrigation();

      expect(mockedApiClient.post).toHaveBeenCalledWith('/irrigation/stop');
      expect(result.active).toBe(false);
    });
  });

  describe('getReservoirLevel', () => {
    it('should fetch reservoir level', async () => {
      const mockLevel = 75.5;
      mockedApiClient.get.mockResolvedValue({ data: { level: mockLevel } });

      const result = await getReservoirLevel();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/irrigation/reservoir');
      expect(result).toBe(mockLevel);
    });
  });
});
