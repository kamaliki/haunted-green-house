import { apiClient } from './client';
import type { AnalysisResult, GrowthMetrics, Plant } from '@/types';

/**
 * Upload plant image for disease analysis (zone-specific)
 */
export const uploadPlantImage = async (file: File, zoneId: string): Promise<AnalysisResult> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('zoneId', zoneId);

  const response = await apiClient.post<AnalysisResult>('/plant-health/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return {
    ...response.data,
    timestamp: new Date(response.data.timestamp),
  };
};

/**
 * Get list of tracked plants (zone-specific)
 */
export const getTrackedPlants = async (zoneId: string): Promise<Plant[]> => {
  const response = await apiClient.get<Plant[]>('/plant-health/plants', {
    params: { zoneId },
  });
  return response.data.map((plant) => ({
    ...plant,
    plantedDate: new Date(plant.plantedDate),
  }));
};

/**
 * Get growth metrics for a specific plant
 */
export const getPlantGrowthMetrics = async (plantId: string): Promise<GrowthMetrics[]> => {
  const response = await apiClient.get<GrowthMetrics[]>(`/plant-health/plants/${plantId}/growth`);
  return response.data.map((metric) => ({
    ...metric,
    timestamp: new Date(metric.timestamp),
  }));
};

/**
 * Get analysis history for a plant
 */
export const getPlantAnalysisHistory = async (plantId: string): Promise<AnalysisResult[]> => {
  const response = await apiClient.get<AnalysisResult[]>(
    `/plant-health/plants/${plantId}/analyses`
  );
  return response.data.map((result) => ({
    ...result,
    timestamp: new Date(result.timestamp),
  }));
};
