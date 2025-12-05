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
  // Calculate start and end times based on timeRange if not provided
  let startTime = query.startTime;
  let endTime = query.endTime || new Date();
  
  if (!startTime && query.timeRange) {
    const now = new Date();
    const ranges: Record<string, number> = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };
    
    const milliseconds = ranges[query.timeRange] || ranges['24h'];
    startTime = new Date(now.getTime() - milliseconds);
  }

  const params = {
    sensorType: query.metrics.join(','),
    ...(startTime && { startTime: startTime.toISOString() }),
    ...(endTime && { endTime: endTime.toISOString() }),
  };

  // Backend returns flat array: [{ timestamp, deviceId, sensorType, value }, ...]
  const response = await apiClient.get<Array<{
    timestamp: string;
    deviceId: string;
    sensorType: string;
    value: number;
  }>>('/api/environment/sensors/history', { params });

  // Group by sensorType and transform to TimeSeriesData format
  const groupedData: Record<string, TimeSeriesData> = {};
  
  response.data.forEach((point) => {
    if (!groupedData[point.sensorType]) {
      groupedData[point.sensorType] = {
        metric: point.sensorType,
        data: [],
      };
    }
    
    groupedData[point.sensorType].data.push({
      timestamp: new Date(point.timestamp),
      value: point.value,
    });
  });

  // Return as array and sort data points by timestamp
  return Object.values(groupedData).map((series) => ({
    ...series,
    data: series.data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
  }));
};

/**
 * Get historical environmental data for a specific zone
 */
export const getZoneHistoricalData = async (
  zoneId: string,
  query: HistoricalDataQuery
): Promise<TimeSeriesData[]> => {
  // Calculate start and end times based on timeRange if not provided
  let startTime = query.startTime;
  let endTime = query.endTime || new Date();
  
  if (!startTime && query.timeRange) {
    const now = new Date();
    const ranges: Record<string, number> = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };
    
    const milliseconds = ranges[query.timeRange] || ranges['24h'];
    startTime = new Date(now.getTime() - milliseconds);
  }

  const params = {
    deviceId: zoneId,
    sensorType: query.metrics.join(','),
    ...(startTime && { startTime: startTime.toISOString() }),
    ...(endTime && { endTime: endTime.toISOString() }),
  };

  // Backend returns flat array: [{ timestamp, deviceId, sensorType, value }, ...]
  const response = await apiClient.get<Array<{
    timestamp: string;
    deviceId: string;
    sensorType: string;
    value: number;
  }>>('/api/environment/sensors/history', { params });

  // Group by sensorType and transform to TimeSeriesData format
  const groupedData: Record<string, TimeSeriesData> = {};
  
  response.data.forEach((point) => {
    if (!groupedData[point.sensorType]) {
      groupedData[point.sensorType] = {
        metric: point.sensorType,
        data: [],
      };
    }
    
    groupedData[point.sensorType].data.push({
      timestamp: new Date(point.timestamp),
      value: point.value,
    });
  });

  // Return as array and sort data points by timestamp
  return Object.values(groupedData).map((series) => ({
    ...series,
    data: series.data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
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
