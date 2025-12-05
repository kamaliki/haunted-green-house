'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { GhostIcon } from '@/components/ui/Icons';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SensorCard } from '@/components/dashboard/SensorCard';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { useZone, useZoneSensorData, useSensorUpdates, useWeatherData } from '@/lib/hooks';
import { PageHeaderSkeleton, SensorGridSkeleton } from '@/components/ui/LoadingSkeletons';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';

/**
 * Zone-specific dashboard page
 * Displays detailed monitoring and controls for a specific zone
 */
export default function ZoneDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const zoneId = params.zoneId as string;
  const queryClient = useQueryClient();
  
  // Fetch zone details
  const { data: zone, isLoading: zoneLoading, error: zoneError } = useZone(zoneId);
  
  // Fetch zone-specific sensor data
  const { data: sensorData, isLoading: sensorLoading, error: sensorError } = useZoneSensorData(zoneId);
  
  // Fetch weather data
  const { data: weatherData, isLoading: weatherLoading, error: weatherError } = useWeatherData();
  
  // Subscribe to real-time sensor updates for this zone
  useSensorUpdates((data: any) => {
    // Only update if the data is for this zone
    if (data.zoneId === zoneId) {
      // Invalidate and refetch the sensor data for this zone
      queryClient.invalidateQueries({ queryKey: ['environment', 'zone', zoneId] });
    }
  });

  // Define sensor thresholds
  const sensorConfigs = useMemo(() => [
    {
      metric: 'temperature_air',
      label: 'Air Temperature',
      icon: '🌡️',
      unit: '°C',
      threshold: { min: 18, max: 28, unit: '°C' },
    },
    {
      metric: 'temperature_soil',
      label: 'Soil Temperature',
      icon: '🌱',
      unit: '°C',
      threshold: { min: 15, max: 25, unit: '°C' },
    },
    {
      metric: 'humidity_air',
      label: 'Air Humidity',
      icon: '💧',
      unit: '%',
      threshold: { min: 50, max: 80, unit: '%' },
    },
    {
      metric: 'humidity_soil',
      label: 'Soil Humidity',
      icon: '🌿',
      unit: '%',
      threshold: { min: 40, max: 70, unit: '%' },
    },
    {
      metric: 'light_intensity',
      label: 'Light Intensity',
      icon: '☀️',
      unit: ' lux',
      threshold: { min: 10000, max: 50000, unit: ' lux' },
    },
    {
      metric: 'co2_level',
      label: 'CO2 Level',
      icon: '🌫️',
      unit: ' ppm',
      threshold: { min: 400, max: 1000, unit: ' ppm' },
    },
    {
      metric: 'soil_moisture',
      label: 'Soil Moisture',
      icon: '💦',
      unit: '%',
      threshold: { min: 30, max: 60, unit: '%' },
    },
    {
      metric: 'soil_ph',
      label: 'Soil pH',
      icon: '⚗️',
      unit: '',
      threshold: { min: 6.0, max: 7.5, unit: '' },
    },
    {
      metric: 'air_quality',
      label: 'Air Quality',
      icon: '🌬️',
      unit: ' AQI',
      threshold: { min: 0, max: 100, unit: ' AQI' },
    },
  ], []);

  // Show loading state
  if (zoneLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <PageHeaderSkeleton />
        <SensorGridSkeleton count={9} />
      </div>
    );
  }

  // Show error state
  if (zoneError || !zone) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <button
          onClick={() => router.push('/')}
          className="mb-4 text-ghost-green hover:text-slime-green font-vt323 text-lg flex items-center gap-2 transition-colors"
        >
          ← Back to Zones
        </button>
        
        <ErrorDisplay
          error={zoneError || new Error('Zone not found')}
          title="Zone Not Found"
          onRetry={() => window.location.reload()}
          onBack={() => router.push('/')}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 md:p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-6 md:mb-8">
        <button
          onClick={() => router.push('/')}
          className="mb-4 text-ghost-green hover:text-slime-green font-vt323 text-base sm:text-lg flex items-center gap-2 transition-colors touch-manipulation"
          aria-label="Back to zones"
        >
          ← Back to Zones
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <GhostIcon size="lg" animate />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-creepster text-ghost-green text-glow break-words">
              {zone.name}
            </h1>
          </div>
          
          {/* Last update timestamp */}
          {sensorData && (
            <div className="font-vt323 text-xs sm:text-sm text-text-secondary">
              Last Update: {new Date(sensorData.timestamp).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Weather Widget */}
      <div className="mb-4 sm:mb-5 md:mb-6">
        <WeatherWidget 
          weatherData={weatherData}
          isLoading={weatherLoading}
          error={weatherError?.message}
        />
      </div>

      {/* Sensor Cards Grid */}
      {sensorLoading ? (
        <SensorGridSkeleton count={9} />
      ) : sensorError ? (
        <ErrorDisplay
          error={sensorError}
          title="Failed to Load Sensor Data"
          onRetry={() => window.location.reload()}
          size="md"
        />
      ) : sensorData ? (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {sensorConfigs.map((config) => (
            <SensorCard
              key={config.metric}
              zoneId={zoneId}
              metric={config.metric}
              label={config.label}
              icon={config.icon}
              value={sensorData[config.metric as keyof typeof sensorData] as number}
              unit={config.unit}
              threshold={config.threshold}
              lastUpdate={sensorData.timestamp}
            />
          ))}
        </div>
      ) : (
        <div className="retro-card fog-overlay border-ghost-green">
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">👻</span>
            <p className="font-vt323 text-lg text-ghost-green mb-4">
              No sensor data available
            </p>
            <p className="font-vt323 text-sm text-text-secondary">
              Waiting for sensors to report...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
