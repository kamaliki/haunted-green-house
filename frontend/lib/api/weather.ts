import { apiClient } from './client';
import type { WeatherData } from '@/types';

/**
 * Get user's current location
 */
async function getUserLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      // Fallback to default location (Nairobi, Kenya)
      resolve({ lat: -1.30431, lon: 36.83120 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        console.warn('Geolocation error:', error);
        // Fallback to default location
        resolve({ lat: -1.30431, lon: 36.83120 });
      },
      {
        timeout: 5000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  });
}

/**
 * Get current weather data
 */
export const getWeatherData = async (): Promise<WeatherData> => {
  try {
    // Get user's location
    const { lat, lon } = await getUserLocation();
    
    // Fetch weather from backend
    const response = await apiClient.get(`/weather/current?lat=${lat}&lon=${lon}`);
    const data = response.data;
    
    // Transform to match WeatherData interface
    return {
      temperature: data.current.temperature,
      humidity: data.current.humidity,
      conditions: data.current.description,
      location: data.location.name,
      icon: data.current.icon,
      windSpeed: data.current.windSpeed,
      feelsLike: data.current.feelsLike,
      lastUpdate: new Date(data.timestamp),
      forecast: [], // Forecast is separate endpoint
    } as WeatherData;
  } catch (error) {
    console.error('Error fetching weather:', error);
    // Return fallback data
    return {
      temperature: 24,
      humidity: 65,
      conditions: 'Partly Cloudy',
      location: 'Unknown',
      lastUpdate: new Date(),
      forecast: [],
    } as WeatherData;
  }
};

/**
 * Get weather forecast
 */
export const getWeatherForecast = async (days: number = 5) => {
  try {
    const { lat, lon } = await getUserLocation();
    const response = await apiClient.get(`/weather/forecast?lat=${lat}&lon=${lon}`);
    
    return response.data.forecast.slice(0, days * 8).map((item: any) => ({
      ...item,
      date: new Date(item.timestamp),
    }));
  } catch (error) {
    console.error('Error fetching forecast:', error);
    return [];
  }
};