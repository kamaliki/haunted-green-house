import { apiClient } from './client';
import type { 
  SecurityEvent, 
  AccessPointStatus, 
  OffHoursConfig, 
  SecurityLogQuery,
  AccessPoint,
  CreateAccessPointDto,
  UpdateAccessPointDto
} from '@/types';

/**
 * Get all access points (configuration)
 */
export const getAccessPoints = async (): Promise<AccessPoint[]> => {
  const response = await apiClient.get<AccessPoint[]>('/security/access-points');
  return response.data.map((accessPoint) => ({
    ...accessPoint,
    lastStatusChange: new Date(accessPoint.lastStatusChange),
    createdAt: new Date(accessPoint.createdAt),
    updatedAt: new Date(accessPoint.updatedAt),
  }));
};

/**
 * Create a new access point
 */
export const createAccessPoint = async (data: CreateAccessPointDto): Promise<AccessPoint> => {
  const response = await apiClient.post<AccessPoint>('/security/access-points', data);
  return {
    ...response.data,
    lastStatusChange: new Date(response.data.lastStatusChange),
    createdAt: new Date(response.data.createdAt),
    updatedAt: new Date(response.data.updatedAt),
  };
};

/**
 * Get a specific access point by ID
 */
export const getAccessPointById = async (id: string): Promise<AccessPoint> => {
  const response = await apiClient.get<AccessPoint>(`/security/access-points/${id}`);
  return {
    ...response.data,
    lastStatusChange: new Date(response.data.lastStatusChange),
    createdAt: new Date(response.data.createdAt),
    updatedAt: new Date(response.data.updatedAt),
  };
};

/**
 * Update an access point
 */
export const updateAccessPoint = async (id: string, data: UpdateAccessPointDto): Promise<AccessPoint> => {
  const response = await apiClient.patch<AccessPoint>(`/security/access-points/${id}`, data);
  return {
    ...response.data,
    lastStatusChange: new Date(response.data.lastStatusChange),
    createdAt: new Date(response.data.createdAt),
    updatedAt: new Date(response.data.updatedAt),
  };
};

/**
 * Delete an access point
 */
export const deleteAccessPoint = async (id: string): Promise<void> => {
  await apiClient.delete(`/security/access-points/${id}`);
};

/**
 * Get all access point statuses (real-time status)
 */
export const getAccessPointStatuses = async (): Promise<AccessPointStatus[]> => {
  const response = await apiClient.get<AccessPointStatus[]>('/security/access-points-status');
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
  const response = await apiClient.get<OffHoursConfig>('/security/off-hours-config');
  return response.data;
};

/**
 * Update off-hours configuration
 */
export const updateOffHoursConfig = async (config: OffHoursConfig): Promise<OffHoursConfig> => {
  const response = await apiClient.post<OffHoursConfig>('/security/off-hours-config', config);
  return response.data;
};

/**
 * Get recent motion events
 */
export const getRecentMotionEvents = async (limit?: number): Promise<SecurityEvent[]> => {
  // Query security logs filtered by motion_detected type
  const query: SecurityLogQuery = {
    eventType: 'motion_detected',
  };
  
  const events = await getSecurityLogs(query);
  
  // Return limited results if specified
  return limit ? events.slice(0, limit) : events;
};
