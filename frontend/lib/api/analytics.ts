import { apiClient } from './client';
import type { Prediction, Recommendation, GetPredictionsQuery, WeatherData } from '@/types';

/**
 * Get predictive analytics for environmental metrics
 */
export const getPredictions = async (query?: GetPredictionsQuery): Promise<Prediction[]> => {
  const params = {
    ...(query?.metrics && { metrics: query.metrics.join(',') }),
    ...(query?.hours && { hours: query.hours }),
  };

  const response = await apiClient.get<Prediction[]>('/analytics/predictions', { params });

  return response.data.map((prediction) => ({
    ...prediction,
    predictions: prediction.predictions.map((point) => ({
      ...point,
      timestamp: new Date(point.timestamp),
    })),
    generatedAt: new Date(prediction.generatedAt),
  }));
};

/**
 * Get zone-specific predictive analytics for environmental metrics
 */
export const getZonePredictions = async (zoneId: string, query?: GetPredictionsQuery): Promise<Prediction[]> => {
  const params = {
    ...(query?.metrics && { metrics: query.metrics.join(',') }),
    ...(query?.hours && { hours: query.hours }),
  };

  const response = await apiClient.get<Prediction[]>(`/analytics/zones/${zoneId}/predictions`, { params });

  return response.data.map((prediction) => ({
    ...prediction,
    predictions: prediction.predictions.map((point) => ({
      ...point,
      timestamp: new Date(point.timestamp),
    })),
    generatedAt: new Date(prediction.generatedAt),
  }));
};

/**
 * Get optimization recommendations
 */
export const getRecommendations = async (): Promise<Recommendation[]> => {
  const response = await apiClient.get<Recommendation[]>('/analytics/recommendations');
  return response.data.map((rec) => ({
    ...rec,
    timestamp: new Date(rec.timestamp),
  }));
};

/**
 * Get zone-specific optimization recommendations
 */
export const getZoneRecommendations = async (zoneId: string): Promise<Recommendation[]> => {
  const response = await apiClient.get<Recommendation[]>(`/analytics/zones/${zoneId}/recommendations`);
  return response.data.map((rec) => ({
    ...rec,
    timestamp: new Date(rec.timestamp),
  }));
};

/**
 * Get weather data from analytics service
 */
export const getAnalyticsWeatherData = async (): Promise<WeatherData> => {
  const response = await apiClient.get<WeatherData>('/analytics/weather');
  return {
    ...response.data,
    lastUpdate: new Date(response.data.lastUpdate),
    forecast: response.data.forecast.map((day) => ({
      ...day,
      date: new Date(day.date),
    })),
  };
};

/**
 * Trigger manual prediction generation
 */
export const generatePredictions = async (): Promise<void> => {
  await apiClient.post('/analytics/predictions/generate');
};
