'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, LoadingSkeleton } from '@/components/ui/LoadingSpinner';
import { RetroChart } from '@/components/ui/RetroChart';
import { getHistoricalData } from '@/lib/api/environment';
import type { HistoricalDataQuery, TimeSeriesData } from '@/types';

const TIME_RANGES: Array<{ value: HistoricalDataQuery['timeRange']; label: string }> = [
  { value: '1h', label: '1 Hour' },
  { value: '6h', label: '6 Hours' },
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
];

const AVAILABLE_METRICS = [
  { key: 'temperature_air', label: 'Air Temperature', color: '#ff006e', unit: '°C' },
  { key: 'temperature_soil', label: 'Soil Temperature', color: '#fb5607', unit: '°C' },
  { key: 'humidity_air', label: 'Air Humidity', color: '#39ff14', unit: '%' },
  { key: 'humidity_soil', label: 'Soil Humidity', color: '#06ffa5', unit: '%' },
  { key: 'light_intensity', label: 'Light Intensity', color: '#ffbe0b', unit: ' lux' },
  { key: 'co2_level', label: 'CO2 Level', color: '#9d4edd', unit: ' ppm' },
  { key: 'soil_moisture', label: 'Soil Moisture', color: '#06ffa5', unit: '%' },
  { key: 'soil_ph', label: 'Soil pH', color: '#8338ec', unit: '' },
  { key: 'air_quality', label: 'Air Quality', color: '#3a86ff', unit: '' },
];

/**
 * Historical data visualization page
 * Displays time-series charts for environmental metrics
 */
export default function EnvironmentPage() {
  const [timeRange, setTimeRange] = useState<HistoricalDataQuery['timeRange']>('24h');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['temperature_air', 'humidity_air']);

  // Fetch historical data
  const { data: historicalData, isLoading, error, refetch } = useQuery({
    queryKey: ['environment', 'historical', timeRange, selectedMetrics],
    queryFn: () => getHistoricalData({ metrics: selectedMetrics, timeRange }),
    enabled: selectedMetrics.length > 0,
    staleTime: 60000, // Cache for 60 seconds
  });

  // Toggle metric selection
  const toggleMetric = (metricKey: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metricKey)
        ? prev.filter((m) => m !== metricKey)
        : [...prev, metricKey]
    );
  };

  // Get metric configuration
  const getMetricConfig = (metricKey: string) => {
    return AVAILABLE_METRICS.find((m) => m.key === metricKey);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📊</span>
          <h1 className="text-3xl md:text-4xl font-creepster text-ghost-green text-glow">
            Historical Data
          </h1>
        </div>
        <p className="font-vt323 text-lg text-text-secondary">
          View environmental trends over time
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Time Range Selector */}
        <Card>
          <CardHeader>
            <CardTitle>⏰ Time Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {TIME_RANGES.map((range) => (
                <Button
                  key={range.value}
                  variant={timeRange === range.value ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange(range.value)}
                  className="font-vt323"
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Metric Selector */}
        <Card>
          <CardHeader>
            <CardTitle>📈 Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {AVAILABLE_METRICS.map((metric) => (
                <label
                  key={metric.key}
                  className="flex items-center gap-2 cursor-pointer hover:text-ghost-green transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedMetrics.includes(metric.key)}
                    onChange={() => toggleMetric(metric.key)}
                    className="w-4 h-4 accent-ghost-green"
                  />
                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: metric.color }}
                  />
                  <span className="font-vt323 text-sm">{metric.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="min-h-[500px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>📉 Environmental Trends</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="font-vt323"
            >
              🔄 Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <LoadingSpinner size="lg" type="ghost" />
              <p className="mt-4 font-vt323 text-ghost-green">
                Summoning historical data...
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-20">
              <span className="text-6xl mb-4 block">💀</span>
              <p className="font-vt323 text-lg text-blood-red mb-4">
                Error loading historical data: {error.message}
              </p>
              <Button onClick={() => refetch()} variant="danger">
                Try Again
              </Button>
            </div>
          )}

          {/* No metrics selected */}
          {!isLoading && !error && selectedMetrics.length === 0 && (
            <div className="text-center py-20">
              <span className="text-6xl mb-4 block">👻</span>
              <p className="font-vt323 text-lg text-text-secondary">
                Select at least one metric to view historical data
              </p>
            </div>
          )}

          {/* No data available */}
          {!isLoading && !error && selectedMetrics.length > 0 && (!historicalData || historicalData.length === 0) && (
            <div className="text-center py-20">
              <span className="text-6xl mb-4 block">🌫️</span>
              <p className="font-vt323 text-lg text-text-secondary">
                No historical data available for the selected time range
              </p>
            </div>
          )}

          {/* Chart display */}
          {!isLoading && !error && historicalData && historicalData.length > 0 && (
            <RetroChart
              data={historicalData}
              metrics={selectedMetrics.map((key) => {
                const config = getMetricConfig(key);
                return {
                  key,
                  label: config?.label || key,
                  color: config?.color || '#39ff14',
                  unit: config?.unit || '',
                };
              })}
              timeRange={timeRange}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
