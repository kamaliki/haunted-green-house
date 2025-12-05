import { apiClient } from './client';
import type { WeatherData } from '@/types';

/**
 * Get current weather data and forecast
 */
export const getWeatherData = async (): Promise<WeatherData> => {
  const response = await apiClient.get<WeatherData>('/weather/current');
  return {
    ...response.data,
    lastUpdate: new Date(response.data.lastUpdate),
    forecast: response.data.forecast.map(day => ({
      ...day,
      date: new Date(day.date),
    })),
  };
};

/**
 * Get weather forecast only
 */
export const getWeatherForecast = async (days: number = 5) => {
  const response = await apiClient.get(`/weather/forecast?days=${days}`);
  return response.data.map((day: any) => ({
    ...day,
    date: new Date(day.date),
  }));
};