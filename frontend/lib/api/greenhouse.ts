import { apiClient } from './client';
import type { 
  CreateGreenhouseDto, 
  Greenhouse,
  Zone,
  ZoneSummary
} from '@/types';

/**
 * Create a new greenhouse with zones
 */
export const createGreenhouse = async (greenhouseData: CreateGreenhouseDto): Promise<Greenhouse> => {
  const response = await apiClient.post<Greenhouse>('/greenhouse/setup', greenhouseData);
  return response.data;
};

/**
 * Get user's greenhouse profile
 */
export const getUserGreenhouse = async (): Promise<Greenhouse | null> => {
  try {
    const response = await apiClient.get<Greenhouse>('/greenhouse');
    return response.data;
  } catch (error: any) {
    // Return null if no greenhouse found (404)
    if (error.statusCode === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Update greenhouse profile
 */
export const updateGreenhouse = async (id: string, updates: Partial<CreateGreenhouseDto>): Promise<Greenhouse> => {
  const response = await apiClient.put<Greenhouse>(`/greenhouse/${id}`, updates);
  return response.data;
};

/**
 * Get all zones for the user's greenhouse
 */
export const getZones = async (): Promise<Zone[]> => {
  const greenhouse = await getUserGreenhouse();
  if (!greenhouse) {
    return [];
  }
  return greenhouse.zones || [];
};

/**
 * Get zone summaries with current status
 * This fetches zones and enriches them with current sensor data
 */
export const getZoneSummaries = async (): Promise<ZoneSummary[]> => {
  const zones = await getZones();
  
  // For now, return zones with mock current data
  // In a real implementation, this would fetch current sensor data for each zone
  return zones.map(zone => ({
    id: zone.id,
    name: zone.name,
    temperature: 22.5, // Mock data - would come from sensor API
    humidity: 65, // Mock data
    healthStatus: 'optimal' as const,
    activeAlerts: 0,
    lastUpdate: new Date(),
  }));
};

/**
 * Get a specific zone by ID
 */
export const getZone = async (zoneId: string): Promise<Zone | null> => {
  const zones = await getZones();
  return zones.find(z => z.id === zoneId) || null;
};