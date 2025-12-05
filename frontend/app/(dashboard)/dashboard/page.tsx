'use client';

import { useMemo } from 'react';
import { GhostIcon, PumpkinIcon, BatIcon } from '@/components/ui/Icons';
import { SensorCard, WeatherWidget } from '@/components/dashboard';
import { useSensorData, useSensorUpdates, useWeatherData } from '@/lib/hooks';
import { useQueryClient } from '@tanstack/react-query';
import type { EnvironmentData, SensorThreshold } from '@/types';

/**
 * Main dashboard page
 * Displays overview of greenhouse status with real-time sensor data
 */
export default function DashboardPage() {
  const queryClient = useQueryClient();
  
  // Fetch current sensor data
  const { data: sensorData, isLoading: sensorLoading, error: sensorError } = useSensorData();
  
  // Fetch weather data
  const { data: weatherData, isLoading: weatherLoading, error: weatherError } = useWeatherData();

  // Subscribe to real-time sensor updates
  useSensorUpdates((newData: EnvironmentData) => {
    // Update the sensor data in React Query cache
    queryClient.setQueryData(['environment', 'current'], {
      ...newData,
      timestamp: new Date(newData.timestamp),
    });
  });

  // Define sensor thresholds for visual indicators
  const sensorThresholds = useMemo(() => ({
    temperature_air: { min: 18, max: 28, unit: '°C' },
    temperature_soil: { min: 16, max: 25, unit: '°C' },
    humidity_air: { min: 40, max: 80, unit: '%' },
    humidity_soil: { min: 30, max: 70, unit: '%' },
    light_intensity: { min: 200, max: 1000, unit: ' lux' },
    co2_level: { min: 300, max: 600, unit: ' ppm' },
    soil_moisture: { min: 40, max: 80, unit: '%' },
    soil_ph: { min: 6.0, max: 7.5, unit: '' },
    air_quality: { min: 0, max: 100, unit: '' },
  }), []);

  // Calculate trends (simplified - in real app would compare with previous values)
  const getTrend = (metric: string, value: number): 'up' | 'down' | 'stable' => {
    // This is a placeholder - in a real app, you'd compare with historical data
    const hash = metric.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const trends: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable'];
    return trends[hash % 3];
  };

  // Show loading state
  if (sensorLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GhostIcon size="lg" animate />
            <h1 className="text-3xl md:text-4xl font-creepster text-ghost-green text-glow">
              Dashboard
            </h1>
          </div>
          <p className="font-vt323 text-lg text-text-secondary">
            Loading haunted greenhouse data...
          </p>
        </div>
        
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="retro-card fog-overlay animate-pulse">
              <div className="h-6 bg-bg-darkest rounded mb-4" />
              <div className="h-12 bg-bg-darkest rounded mb-2" />
              <div className="h-4 bg-bg-darkest rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (sensorError) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GhostIcon size="lg" animate />
            <h1 className="text-3xl md:text-4xl font-creepster text-ghost-green text-glow">
              Dashboard
            </h1>
          </div>
          <p className="font-vt323 text-lg text-blood-red">
            Error loading sensor data: {sensorError.message}
          </p>
        </div>
        
        <div className="retro-card fog-overlay border-blood-red">
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">💀</span>
            <p className="font-vt323 text-lg text-blood-red mb-4">
              The spirits have disrupted our connection!
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="retro-button"
            >
              Reconnect to the Beyond
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <GhostIcon size="lg" animate />
          <h1 className="text-3xl md:text-4xl font-creepster text-ghost-green text-glow">
            Dashboard
          </h1>
        </div>
        <p className="font-vt323 text-lg text-text-secondary">
          Welcome to the Haunted Greenhouse monitoring system
        </p>
        {sensorData && (
          <p className="font-vt323 text-sm text-ghost-green">
            Last updated: {sensorData.timestamp.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Sensor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {sensorData && (
          <>
            <SensorCard
              metric="temperature_air"
              value={sensorData.temperature_air}
              unit="°C"
              threshold={sensorThresholds.temperature_air}
              trend={getTrend('temperature_air', sensorData.temperature_air)}
              lastUpdate={sensorData.timestamp}
              icon="🌡️"
              label="Air Temperature"
            />
            
            <SensorCard
              metric="temperature_soil"
              value={sensorData.temperature_soil}
              unit="°C"
              threshold={sensorThresholds.temperature_soil}
              trend={getTrend('temperature_soil', sensorData.temperature_soil)}
              lastUpdate={sensorData.timestamp}
              icon="🌱"
              label="Soil Temperature"
            />
            
            <SensorCard
              metric="humidity_air"
              value={sensorData.humidity_air}
              unit="%"
              threshold={sensorThresholds.humidity_air}
              trend={getTrend('humidity_air', sensorData.humidity_air)}
              lastUpdate={sensorData.timestamp}
              icon="💧"
              label="Air Humidity"
            />
            
            <SensorCard
              metric="humidity_soil"
              value={sensorData.humidity_soil}
              unit="%"
              threshold={sensorThresholds.humidity_soil}
              trend={getTrend('humidity_soil', sensorData.humidity_soil)}
              lastUpdate={sensorData.timestamp}
              icon="🌿"
              label="Soil Humidity"
            />
            
            <SensorCard
              metric="light_intensity"
              value={sensorData.light_intensity}
              unit=" lux"
              threshold={sensorThresholds.light_intensity}
              trend={getTrend('light_intensity', sensorData.light_intensity)}
              lastUpdate={sensorData.timestamp}
              icon="💡"
              label="Light Intensity"
            />
            
            <SensorCard
              metric="co2_level"
              value={sensorData.co2_level}
              unit=" ppm"
              threshold={sensorThresholds.co2_level}
              trend={getTrend('co2_level', sensorData.co2_level)}
              lastUpdate={sensorData.timestamp}
              icon="🌫️"
              label="CO2 Level"
            />
            
            <SensorCard
              metric="soil_moisture"
              value={sensorData.soil_moisture}
              unit="%"
              threshold={sensorThresholds.soil_moisture}
              trend={getTrend('soil_moisture', sensorData.soil_moisture)}
              lastUpdate={sensorData.timestamp}
              icon="💦"
              label="Soil Moisture"
            />
            
            <SensorCard
              metric="soil_ph"
              value={sensorData.soil_ph}
              unit=""
              threshold={sensorThresholds.soil_ph}
              trend={getTrend('soil_ph', sensorData.soil_ph)}
              lastUpdate={sensorData.timestamp}
              icon="⚗️"
              label="Soil pH"
            />
            
            <SensorCard
              metric="air_quality"
              value={sensorData.air_quality}
              unit=""
              threshold={sensorThresholds.air_quality}
              trend={getTrend('air_quality', sensorData.air_quality)}
              lastUpdate={sensorData.timestamp}
              icon="🌬️"
              label="Air Quality"
            />
          </>
        )}
      </div>

      {/* Weather Widget */}
      <div className="mb-8">
        <h2 className="font-press-start text-sm text-ghost-green mb-4 flex items-center gap-2">
          <span className="text-lg">🌙</span>
          EXTERNAL CONDITIONS
        </h2>
        <div className="max-w-md">
          <WeatherWidget
            weatherData={weatherData}
            isLoading={weatherLoading}
            error={weatherError?.message}
          />
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="font-press-start text-sm text-ghost-green mb-4 flex items-center gap-2">
          <BatIcon size="sm" animate />
          QUICK ACTIONS
        </h2>
        <div className="flex flex-wrap gap-4">
          <button className="retro-button">
            Start Irrigation
          </button>
          <button className="px-6 py-3 bg-bg-dark text-toxic-purple font-bold border-4 border-toxic-purple pixel-border-glow transition-all duration-200 hover:scale-105 hover:text-slime-green">
            View Analytics
          </button>
          <button className="px-6 py-3 bg-bg-dark text-blood-red font-bold border-4 border-blood-red pixel-border-glow transition-all duration-200 hover:scale-105 hover:text-pumpkin-orange">
            Check Alerts
          </button>
        </div>
      </div>
    </div>
  );
}
