import { apiClient } from './client';
import type { SecurityEvent, AccessPointStatus, OffHoursConfig, SecurityLogQuery } from '@/types';

/**
 * Get all access point statuses
 */
export const getAccessPointStatuses = async (): Promise<AccessPointStatus[]> => {
  const response = await apiClient.get<AccessPointStatus[]>('/security/access-points');
  return response.data.map((status) => ({
    ...status,
    lastChanged: new Date(status.lastChanged),
  }));
};

/**
 * Get security event logs
 */
export const getSecurityLogs = async (query?: SecurityLogQuery): Promise<SecurityEvent[]> => {
  const params = {
    ...(query?.eventType && { eventType: query.eventType }),
    ...(query?.startDate && { startDate: query.startDate.toISOString() }),
    ...(query?.endDate && { endDate: query.endDate.toISOString() }),
    ...(query?.location && { location: query.location }),
    ...(query?.zoneId && { zoneId: query.zoneId }),
  };

  const response = await apiClient.get<SecurityEvent[]>('/security/logs', { params });
  return response.data.map((event) => ({
    ...event,
    timestamp: new Date(event.timestamp),
  }));
};

/**
 * Get off-hours configuration
 */
export const getOffHoursConfig = async (): Promise<OffHoursConfig> => {
  const response = await apiClient.get<OffHoursConfig>('/security/off-hours');
  return response.data;
};

/**
 * Update off-hours configuration
 */
export const updateOffHoursConfig = async (config: OffHoursConfig): Promise<OffHoursConfig> => {
  const response = await apiClient.put<OffHoursConfig>('/security/off-hours', config);
  return response.data;
};

/**
 * Get recent motion events
 */
export const getRecentMotionEvents = async (limit?: number): Promise<SecurityEvent[]> => {
  const params = limit ? { limit } : {};
  const response = await apiClient.get<SecurityEvent[]>('/security/motion', { params });
  return response.data.map((event) => ({
    ...event,
    timestamp: new Date(event.timestamp),
  }));
};
