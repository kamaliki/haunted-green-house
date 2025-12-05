'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { GhostIcon } from '@/components/ui/Icons';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { RetroChart } from '@/components/ui/RetroChart';
import { useZone, useZonePredictions } from '@/lib/hooks';
import type { Prediction } from '@/types';

/**
 * Zone-specific predictive analytics page
 * Displays predictions for environmental metrics with confidence intervals
 */
export default function ZoneAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const zoneId = params.zoneId as string;

  // Fetch zone details
  const { data: zone, isLoading: zoneLoading, error: zoneError } = useZone(zoneId);

  // Fetch predictions for this zone (default to 24 hours)
  const [forecastHours] = useState(24);
  const {
    data: predictions,
    isLoading: predictionsLoading,
    error: predictionsError,
  } = useZonePredictions(zoneId, {
    metrics: ['temperature_air', 'humidity_air', 'light_intensity'],
    hours: forecastHours,
  });

  // Define metric configurations
  const metricConfigs = useMemo(
    () => [
      {
        key: 'temperature_air',
        label: 'Air Temperature',
        icon: '🌡️',
        unit: '°C',
        color: '#fb5607',
        threshold: { min: 18, max: 28 },
      },
      {
        key: 'humidity_air',
        label: 'Air Humidity',
        icon: '💧',
        unit: '%',
        color: '#06ffa5',
        threshold: { min: 50, max: 80 },
      },
      {
        key: 'light_intensity',
        label: 'Light Intensity',
        icon: '☀️',
        unit: ' lux',
        color: '#ffbe0b',
        threshold: { min: 10000, max: 50000 },
      },
    ],
    []
  );

  // Check for threshold exceedances in predictions
  const proactiveAlerts = useMemo(() => {
    if (!predictions) return [];

    const alerts: Array<{
      metric: string;
      label: string;
      icon: string;
      type: 'high' | 'low';
      value: number;
      timestamp: Date;
    }> = [];

    predictions.forEach((prediction) => {
      const config = metricConfigs.find((m) => m.key === prediction.metric);
      if (!config) return;

      prediction.predictions.forEach((point) => {
        if (point.value > config.threshold.max) {
          alerts.push({
            metric: prediction.metric,
            label: config.label,
            icon: config.icon,
            type: 'high',
            value: point.value,
            timestamp: point.timestamp,
          });
        } else if (point.value < config.threshold.min) {
          alerts.push({
            metric: prediction.metric,
            label: config.label,
            icon: config.icon,
            type: 'low',
            value: point.value,
            timestamp: point.timestamp,
          });
        }
      });
    });

    // Return only the first alert for each metric
    const uniqueAlerts = new Map();
    alerts.forEach((alert) => {
      if (!uniqueAlerts.has(alert.metric)) {
        uniqueAlerts.set(alert.metric, alert);
      }
    });

    return Array.from(uniqueAlerts.values());
  }, [predictions, metricConfigs]);

  // Transform predictions for chart display
  const chartData = useMemo(() => {
    if (!predictions) return [];

    return predictions.map((prediction) => {
      const config = metricConfigs.find((m) => m.key === prediction.metric);
      return {
        metric: prediction.metric,
        data: prediction.predictions.map((point) => ({
          timestamp: point.timestamp,
          value: point.value,
        })),
        confidenceInterval: prediction.confidenceInterval,
        config,
      };
    });
  }, [predictions, metricConfigs]);

  // Show loading state
  if (zoneLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GhostIcon size="lg" animate />
            <h1 className="text-3xl md:text-4xl font-creepster text-ghost-green text-glow">
              Loading Zone...
            </h1>
          </div>
        </div>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Show error state
  if (zoneError || !zone) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GhostIcon size="lg" animate />
            <h1 className="text-3xl md:text-4xl font-creepster text-ghost-green text-glow">
              Zone Not Found
            </h1>
          </div>
        </div>

        <div className="retro-card fog-overlay border-blood-red">
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">💀</span>
            <p className="font-vt323 text-lg text-blood-red mb-4">
              This zone has vanished into the mist!
            </p>
            <button onClick={() => router.push('/')} className="retro-button">
              Return to Zone Management
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
        <button
          onClick={() => router.push(`/zones/${zoneId}`)}
          className="mb-4 text-ghost-green hover:text-slime-green font-vt323 text-lg flex items-center gap-2 transition-colors"
        >
          ← Back to {zone.name} Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🔮</span>
            <h1 className="text-3xl md:text-4xl font-creepster text-ghost-green text-glow">
              {zone.name} - Predictive Analytics
            </h1>
          </div>

          {/* Last update timestamp */}
          {predictions && predictions.length > 0 && (
            <div className="font-vt323 text-sm text-text-secondary">
              Generated: {new Date(predictions[0].generatedAt).toLocaleString()}
            </div>
          )}
        </div>

        {/* Forecast period */}
        <div className="mt-4 font-vt323 text-text-secondary">
          Forecast Period: Next {forecastHours} hours
        </div>
      </div>

      {/* Proactive Alerts */}
      {proactiveAlerts.length > 0 && (
        <div className="mb-6">
          <Card className="border-blood-red">
            <CardHeader>
              <CardTitle className="text-blood-red flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                Proactive Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {proactiveAlerts.map((alert, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-bg-dark border-2 border-blood-red rounded pixel-corners"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{alert.icon}</span>
                      <div>
                        <p className="font-vt323 text-blood-red font-bold">
                          {alert.label} {alert.type === 'high' ? 'Too High' : 'Too Low'}
                        </p>
                        <p className="font-vt323 text-sm text-text-secondary">
                          Expected: {alert.value.toFixed(2)} at{' '}
                          {alert.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-blood-red font-vt323 text-xl animate-pulse">
                      ⚠️
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Prediction Cards */}
      {predictionsLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : predictionsError ? (
        <div className="retro-card fog-overlay border-pumpkin-orange">
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">⚠️</span>
            <p className="font-vt323 text-lg text-pumpkin-orange mb-4">
              Failed to load predictions
            </p>
            <p className="font-vt323 text-sm text-text-secondary mb-4">
              The crystal ball is cloudy...
            </p>
            <button onClick={() => window.location.reload()} className="retro-button">
              Try Again
            </button>
          </div>
        </div>
      ) : predictions && predictions.length > 0 ? (
        <div className="space-y-6">
          {/* Prediction Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {predictions.map((prediction) => {
              const config = metricConfigs.find((m) => m.key === prediction.metric);
              if (!config) return null;

              const latestPrediction =
                prediction.predictions[prediction.predictions.length - 1];
              const isAboveThreshold = latestPrediction.value > config.threshold.max;
              const isBelowThreshold = latestPrediction.value < config.threshold.min;
              const isOutOfRange = isAboveThreshold || isBelowThreshold;

              return (
                <Card
                  key={prediction.metric}
                  className={isOutOfRange ? 'border-pumpkin-orange' : ''}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">{config.icon}</span>
                      {config.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="font-vt323 text-text-secondary">
                          Current Prediction:
                        </span>
                        <span
                          className={`font-vt323 text-2xl ${
                            isOutOfRange ? 'text-pumpkin-orange' : 'text-ghost-green'
                          }`}
                        >
                          {latestPrediction.value.toFixed(1)}
                          {config.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="font-vt323 text-sm text-text-secondary">
                          Optimal Range:
                        </span>
                        <span className="font-vt323 text-sm text-text-secondary">
                          {config.threshold.min} - {config.threshold.max}
                          {config.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="font-vt323 text-sm text-text-secondary">
                          Data Points:
                        </span>
                        <span className="font-vt323 text-sm text-text-secondary">
                          {prediction.predictions.length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Prediction Charts with Confidence Intervals */}
          {chartData.map((data) => {
            if (!data.config) return null;

            // Transform data for chart with confidence intervals
            const chartPoints = data.data.map((point, index) => ({
              timestamp: point.timestamp,
              time: formatTime(point.timestamp),
              value: point.value,
              lower: data.confidenceInterval[index]?.lower,
              upper: data.confidenceInterval[index]?.upper,
            }));

            return (
              <Card key={data.metric}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{data.config.icon}</span>
                    {data.config.label} Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PredictionChart
                    data={chartPoints}
                    metric={data.config}
                    threshold={data.config.threshold}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="retro-card fog-overlay border-ghost-green">
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🔮</span>
            <p className="font-vt323 text-lg text-ghost-green mb-4">
              No predictions available
            </p>
            <p className="font-vt323 text-sm text-text-secondary">
              The spirits are gathering data...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Prediction Chart Component with Confidence Intervals
 */
interface PredictionChartProps {
  data: Array<{
    timestamp: Date;
    time: string;
    value: number;
    lower?: number;
    upper?: number;
  }>;
  metric: {
    key: string;
    label: string;
    unit: string;
    color: string;
  };
  threshold: {
    min: number;
    max: number;
  };
}

function PredictionChart({ data, metric, threshold }: PredictionChartProps) {
  const {
    LineChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
  } = require('recharts');

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="bg-bg-dark border-4 border-ghost-green p-4 pixel-corners shadow-glow-green">
        <p className="font-vt323 text-ghost-green mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="font-vt323 text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value?.toFixed(2)}
            {metric.unit}
          </p>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <defs>
          <linearGradient id={`gradient-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={metric.color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={metric.color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(57, 255, 20, 0.2)"
          strokeWidth={1}
        />
        <XAxis
          dataKey="time"
          stroke="#39ff14"
          style={{ fontFamily: 'VT323', fontSize: '14px' }}
          tick={{ fill: '#adb5bd' }}
        />
        <YAxis
          stroke="#39ff14"
          style={{ fontFamily: 'VT323', fontSize: '14px' }}
          tick={{ fill: '#adb5bd' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontFamily: 'VT323', fontSize: '14px' }}
          iconType="line"
        />

        {/* Threshold lines */}
        <ReferenceLine
          y={threshold.max}
          stroke="#ff006e"
          strokeDasharray="5 5"
          label={{
            value: `Max: ${threshold.max}`,
            fill: '#ff006e',
            fontFamily: 'VT323',
            fontSize: 12,
          }}
        />
        <ReferenceLine
          y={threshold.min}
          stroke="#ff006e"
          strokeDasharray="5 5"
          label={{
            value: `Min: ${threshold.min}`,
            fill: '#ff006e',
            fontFamily: 'VT323',
            fontSize: 12,
          }}
        />

        {/* Confidence interval (shaded area) */}
        <Area
          type="monotone"
          dataKey="upper"
          stroke="none"
          fill={`url(#gradient-${metric.key})`}
          fillOpacity={0.4}
          name="Upper Confidence"
        />
        <Area
          type="monotone"
          dataKey="lower"
          stroke="none"
          fill={`url(#gradient-${metric.key})`}
          fillOpacity={0.4}
          name="Lower Confidence"
        />

        {/* Prediction line */}
        <Line
          type="monotone"
          dataKey="value"
          stroke={metric.color}
          strokeWidth={3}
          dot={false}
          activeDot={{
            r: 6,
            stroke: metric.color,
            strokeWidth: 2,
            fill: '#0a0a0f',
          }}
          name="Predicted Value"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/**
 * Format timestamp for chart display
 */
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${month}/${day} ${hours}:${minutes}`;
}
