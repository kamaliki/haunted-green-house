'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { GhostIcon } from '@/components/ui/Icons';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { RetroChart } from '@/components/ui/RetroChart';
import { TimeRangeSelector, MetricSelector } from '@/components/dashboard';
import { useZone, useHistoricalData } from '@/lib/hooks';
import type { HistoricalDataQuery } from '@/types';
import type { TimeRange, MetricOption } from '@/components/dashboard';
import { ChartSkeleton, PageHeaderSkeleton } from '@/components/ui/LoadingSkeletons';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';

// Available metrics for selection
const AVAILABLE_METRICS: MetricOption[] = [
  { key: 'temperature_air', label: 'Air Temperature', color: '#ff006e', unit: '°C' },
  { key: 'temperature_soil', label: 'Soil Temperature', color: '#fb5607', unit: '°C' },
  { key: 'humidity_air', label: 'Air Humidity', color: '#39ff14', unit: '%' },
  { key: 'humidity_soil', label: 'Soil Humidity', color: '#06ffa5', unit: '%' },
  { key: 'light_intensity', label: 'Light Intensity', color: '#ffbe0b', unit: 'lux' },
  { key: 'co2_level', label: 'CO2 Level', color: '#9d4edd', unit: 'ppm' },
  { key: 'soil_moisture', label: 'Soil Moisture', color: '#3a86ff', unit: '%' },
  { key: 'soil_ph', label: 'Soil pH', color: '#8338ec', unit: '' },
  { key: 'air_quality', label: 'Air Quality', color: '#06ffa5', unit: 'AQI' },
];



/**
 * Zone-specific historical data visualization page
 * Displays time-series charts for environmental metrics
 */
export default function EnvironmentPage() {
  const params = useParams();
  const router = useRouter();
  const zoneId = params.zoneId as string;

  // State for user selections
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['temperature_air', 'humidity_air']);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

  // Fetch zone details
  const { data: zone, isLoading: zoneLoading, error: zoneError } = useZone(zoneId);

  // Build query for historical data
  const query: HistoricalDataQuery = useMemo(() => ({
    metrics: selectedMetrics,
    timeRange,
  }), [selectedMetrics, timeRange]);

  // Fetch historical data for this zone
  const { data: historicalData, isLoading: dataLoading, error: dataError } = useHistoricalData(query, zoneId);

  // Get selected metric configs
  const selectedMetricConfigs = useMemo(() => {
    return AVAILABLE_METRICS.filter(m => selectedMetrics.includes(m.key));
  }, [selectedMetrics]);



  // Show loading state for zone
  if (zoneLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <PageHeaderSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  // Show error state for zone
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
    <div className="p-4 md:p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8">
        <button
          onClick={() => router.push(`/zones/${zoneId}`)}
          className="mb-4 text-ghost-green hover:text-slime-green font-vt323 text-lg flex items-center gap-2 transition-colors"
        >
          ← Back to {zone.name} Dashboard
        </button>
        
        <div className="flex items-center gap-3">
          <GhostIcon size="lg" animate />
          <h1 className="text-3xl md:text-4xl font-creepster text-ghost-green text-glow">
            {zone.name} - Historical Data
          </h1>
        </div>
      </div>

      {/* Controls Section */}
      <div className="retro-card fog-overlay mb-6">
        {/* Time Range Selector */}
        <div className="mb-6">
          <h2 className="font-creepster text-xl text-ghost-green mb-3">
            Time Range
          </h2>
          <TimeRangeSelector
            value={timeRange}
            onChange={setTimeRange}
          />
        </div>

        {/* Metric Selector */}
        <div>
          <h2 className="font-creepster text-xl text-ghost-green mb-3">
            Metrics
          </h2>
          <MetricSelector
            metrics={AVAILABLE_METRICS}
            selectedMetrics={selectedMetrics}
            onChange={setSelectedMetrics}
          />
        </div>
      </div>

      {/* Chart Section */}
      <div className="retro-card fog-overlay">
        {selectedMetrics.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">👻</span>
            <p className="font-vt323 text-lg text-ghost-green mb-2">
              Select metrics to visualize
            </p>
            <p className="font-vt323 text-sm text-text-secondary">
              Choose at least one metric from above
            </p>
          </div>
        ) : dataLoading ? (
          <div className="p-4">
            <div className="text-center mb-4">
              <LoadingSpinner size="lg" />
              <p className="font-vt323 text-ghost-green mt-4">
                Summoning data from the void...
              </p>
            </div>
          </div>
        ) : dataError ? (
          <div className="p-4">
            <ErrorDisplay
              error={dataError}
              title="Failed to Load Historical Data"
              onRetry={() => window.location.reload()}
              size="sm"
            />
          </div>
        ) : !historicalData || historicalData.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🕸️</span>
            <p className="font-vt323 text-lg text-ghost-green mb-2">
              No data available
            </p>
            <p className="font-vt323 text-sm text-text-secondary">
              No historical data found for the selected time range
            </p>
          </div>
        ) : (
          <RetroChart
            data={historicalData}
            metrics={selectedMetricConfigs}
            timeRange={timeRange}
            type="area"
          />
        )}
      </div>
    </div>
  );
}
