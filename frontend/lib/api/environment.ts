import { apiClient } from './client';
import type { EnvironmentData, HistoricalDataQuery, TimeSeriesData } from '@/types';

/**
 * Get current environmental sensor data
 */
export const getCurrentEnvironmentData = async (): Promise<EnvironmentData> => {
  const response = await apiClient.get<Record<string, any>>('/api/environment/sensors/latest');
  
  // Transform the backend response format to match EnvironmentData interface
  // Backend returns: { "sensor-001_temperature_air": { deviceId, sensorType, value, timestamp }, ... }
  const data = response.data;
  
  // Helper to find value by sensor type
  const getValue = (sensorType: string): number => {
    const key = Object.keys(data).find(k => k.includes(sensorType));
    return key ? data[key].value : 0;
  };
  
  // Helper to get latest timestamp
  const getLatestTimestamp = (): Date => {
    const timestamps = Object.values(data).map((d: any) => new Date(d.timestamp));
    return timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => t.getTime()))) : new Date();
  };
  
  return {
    temperature_air: getValue('temperature_air'),
    temperature_soil: getValue('temperature_soil'),
    humidity_air: getValue('humidity_air'),
    humidity_soil: getValue('humidity_soil'),
    light_intensity: getValue('light_intensity'),
    co2_level: getValue('co2_level'),
    soil_moisture: getValue('soil_moisture'),
    soil_ph: getValue('soil_ph'),
    air_quality: getValue('air_quality'),
    timestamp: getLatestTimestamp(),
  };
};

/**
 * Get current environmental sensor data for a specific zone
 */
export const getZoneEnvironmentData = async (zoneId: string): Promise<EnvironmentData> => {
  const response = await apiClient.get<Record<string, any>>(`/api/environment/sensors/latest`, {
    params: { deviceId: zoneId }
  });
  
  // Transform the backend response format to match EnvironmentData interface
  const data = response.data;
  
  // Helper to find value by sensor type
  const getValue = (sensorType: string): number => {
    const key = Object.keys(data).find(k => k.includes(sensorType));
    return key ? data[key].value : 0;
  };
  
  // Helper to get latest timestamp
  const getLatestTimestamp = (): Date => {
    const timestamps = Object.values(data).map((d: any) => new Date(d.timestamp));
    return timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => t.getTime()))) : new Date();
  };
  
  return {
    temperature_air: getValue('temperature_air'),
    temperature_soil: getValue('temperature_soil'),
    humidity_air: getValue('humidity_air'),
    humidity_soil: getValue('humidity_soil'),
    light_intensity: getValue('light_intensity'),
    co2_level: getValue('co2_level'),
    soil_moisture: getValue('soil_moisture'),
    soil_ph: getValue('soil_ph'),
    air_quality: getValue('air_quality'),
    timestamp: getLatestTimestamp(),
  };
};

/**
 * Get historical environmental data
 */
export const getHistoricalData = async (
  query: HistoricalDataQuery
): Promise<TimeSeriesData[]> => {
  const params = {
    sensorType: query.metrics.join(','),
    ...(query.startTime && { startTime: query.startTime.toISOString() }),
    ...(query.endTime && { endTime: query.endTime.toISOString() }),
  };

  const response = await apiClient.get<TimeSeriesData[]>('/api/environment/sensors/history', {
    params,
  });

  // Convert timestamp strings to Date objects
  return response.data.map((series) => ({
    ...series,
    data: series.data.map((point) => ({
      ...point,
      timestamp: new Date(point.timestamp),
    })),
  }));
};

/**
 * Get historical environmental data for a specific zone
 */
export const getZoneHistoricalData = async (
  zoneId: string,
  query: HistoricalDataQuery
): Promise<TimeSeriesData[]> => {
  const params = {
    deviceId: zoneId,
    sensorType: query.metrics.join(','),
    ...(query.startTime && { startTime: query.startTime.toISOString() }),
    ...(query.endTime && { endTime: query.endTime.toISOString() }),
  };

  const response = await apiClient.get<TimeSeriesData[]>('/api/environment/sensors/history', {
    params,
  });

  // Convert timestamp strings to Date objects
  return response.data.map((series) => ({
    ...series,
    data: series.data.map((point) => ({
      ...point,
      timestamp: new Date(point.timestamp),
    })),
  }));
};

/**
 * Get specific sensor reading
 */
export const getSensorReading = async (metric: string): Promise<number> => {
  const response = await apiClient.get<{ value: number }>(`/api/environment/sensors/latest`, {
    params: { sensorType: metric }
  });
  return response.data.value;
};
