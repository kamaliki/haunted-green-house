import { apiClient } from './client';
import type { Alert } from '@/types';

/**
 * Fetch all alerts
 */
export async function getAlerts(): Promise<Alert[]> {
  const response = await apiClient.get<Alert[]>('/api/alerts');
  return response.data.map((alert) => ({
    ...alert,
    timestamp: new Date(alert.timestamp),
  }));
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeAlert(alertId: string): Promise<Alert> {
  const response = await apiClient.patch<Alert>(`/api/alerts/${alertId}/acknowledge`);
  return {
    ...response.data,
    timestamp: new Date(response.data.timestamp),
  };
}

/**
 * Acknowledge all alerts
 */
export async function acknowledgeAllAlerts(): Promise<void> {
  await apiClient.patch('/api/alerts/acknowledge-all');
}

/**
 * Get alert by ID
 */
export async function getAlertById(alertId: string): Promise<Alert> {
  const response = await apiClient.get<Alert>(`/api/alerts/${alertId}`);
  return {
    ...response.data,
    timestamp: new Date(response.data.timestamp),
  };
}
