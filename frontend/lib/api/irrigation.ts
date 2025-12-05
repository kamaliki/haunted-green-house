import { apiClient } from './client';
import type { IrrigationStatus, StartIrrigationRequest } from '@/types';

/**
 * Get current irrigation status for a specific zone
 */
export const getIrrigationStatus = async (zoneId: string): Promise<IrrigationStatus> => {
  const response = await apiClient.get<IrrigationStatus>(`/api/irrigation/status`, {
    params: { zone: zoneId }
  });
  return {
    ...response.data,
    zoneId,
    lastStarted: response.data.lastStarted ? new Date(response.data.lastStarted) : undefined,
  };
};

/**
 * Start irrigation for a specific zone
 */
export const startIrrigation = async (
  zoneId: string,
  request?: StartIrrigationRequest
): Promise<IrrigationStatus> => {
  const response = await apiClient.post<IrrigationStatus>('/api/irrigation/start', {
    zone: zoneId,
    durationSeconds: request?.duration || 300,
  });
  return {
    ...response.data,
    zoneId,
    lastStarted: response.data.lastStarted ? new Date(response.data.lastStarted) : undefined,
  };
};

/**
 * Stop irrigation for a specific zone
 */
export const stopIrrigation = async (zoneId: string): Promise<IrrigationStatus> => {
  const response = await apiClient.post<IrrigationStatus>('/api/irrigation/stop', { 
    zone: zoneId 
  });
  return {
    ...response.data,
    zoneId,
    lastStarted: response.data.lastStarted ? new Date(response.data.lastStarted) : undefined,
  };
};

/**
 * Get reservoir level for a specific zone
 */
export const getReservoirLevel = async (zoneId: string): Promise<number> => {
  const status = await getIrrigationStatus(zoneId);
  return status.reservoirLevel || 0;
};
