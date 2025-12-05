import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { TimeSeriesData } from '@/types';
import { useDeviceType, getResponsiveChartHeight } from '@/lib/utils/responsive';

interface MetricConfig {
  key: string;
  label: string;
  color: string;
  unit: string;
}

interface RetroChartProps {
  data: TimeSeriesData[];
  metrics: MetricConfig[];
  timeRange: string;
  type?: 'line' | 'area';
}

/**
 * RetroChart component - Wrapper for Recharts with spooky styling
 * Displays time-series data with retro game aesthetic
 * Responsive: adapts height and styling based on device type
 */
export const RetroChart: React.FC<RetroChartProps> = ({
  data,
  metrics,
  timeRange,
  type = 'line',
}) => {
  const deviceType = useDeviceType();
  const chartHeight = getResponsiveChartHeight(deviceType);
  const isMobile = deviceType === 'mobile';

  // Transform data for Recharts format
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Get all unique timestamps across all metrics
    const timestampMap = new Map<number, any>();

    data.forEach((series) => {
      // Add null safety check for series.data
      if (!series || !series.data || !Array.isArray(series.data)) {
        return;
      }
      
      series.data.forEach((point) => {
        if (!point || !point.timestamp) {
          return;
        }
        
        const timestamp = point.timestamp.getTime();
        if (!timestampMap.has(timestamp)) {
          timestampMap.set(timestamp, {
            timestamp: point.timestamp,
            time: formatTime(point.timestamp, timeRange),
          });
        }
        timestampMap.get(timestamp)![series.metric] = point.value;
      });
    });

    // Convert to array and sort by timestamp
    return Array.from(timestampMap.values()).sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
  }, [data, timeRange]);

  // Custom tooltip with pixel border
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="bg-bg-dark border-4 border-ghost-green p-4 pixel-corners shadow-glow-green">
        <p className="font-vt323 text-ghost-green mb-2">{label}</p>
        {payload.map((entry: any, index: number) => {
          const metric = metrics.find((m) => m.key === entry.dataKey);
          return (
            <p
              key={index}
              className="font-vt323 text-sm"
              style={{ color: entry.color }}
            >
              {metric?.label || entry.dataKey}: {entry.value.toFixed(2)}
              {metric?.unit || ''}
            </p>
          );
        })}
      </div>
    );
  };

  // Custom legend with color coding
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mt-4">
        {payload.map((entry: any, index: number) => {
          const metric = metrics.find((m) => m.key === entry.dataKey);
          return (
            <div key={index} className="flex items-center gap-1 sm:gap-2">
              <div
                className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-ghost-green"
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-vt323 text-xs sm:text-sm text-text-primary">
                {metric?.label || entry.dataKey}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="font-vt323 text-text-secondary">No data to display</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={chartHeight}>
        {type === 'area' ? (
          <AreaChart data={chartData}>
            <defs>
              {metrics.map((metric) => (
                <linearGradient
                  key={metric.key}
                  id={`gradient-${metric.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={metric.color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={metric.color} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(57, 255, 20, 0.2)"
              strokeWidth={1}
            />
            <XAxis
              dataKey="time"
              stroke="#39ff14"
              style={{ fontFamily: 'VT323', fontSize: isMobile ? '10px' : '14px' }}
              tick={{ fill: '#adb5bd' }}
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? 'end' : 'middle'}
              height={isMobile ? 60 : 30}
            />
            <YAxis
              stroke="#39ff14"
              style={{ fontFamily: 'VT323', fontSize: isMobile ? '10px' : '14px' }}
              tick={{ fill: '#adb5bd' }}
              width={isMobile ? 40 : 60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            {metrics.map((metric) => (
              <Area
                key={metric.key}
                type="monotone"
                dataKey={metric.key}
                stroke={metric.color}
                strokeWidth={isMobile ? 2 : 3}
                fill={`url(#gradient-${metric.key})`}
                dot={false}
                activeDot={{
                  r: isMobile ? 4 : 6,
                  stroke: metric.color,
                  strokeWidth: 2,
                  fill: '#0a0a0f',
                }}
              />
            ))}
          </AreaChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(57, 255, 20, 0.2)"
              strokeWidth={1}
            />
            <XAxis
              dataKey="time"
              stroke="#39ff14"
              style={{ fontFamily: 'VT323', fontSize: isMobile ? '10px' : '14px' }}
              tick={{ fill: '#adb5bd' }}
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? 'end' : 'middle'}
              height={isMobile ? 60 : 30}
            />
            <YAxis
              stroke="#39ff14"
              style={{ fontFamily: 'VT323', fontSize: isMobile ? '10px' : '14px' }}
              tick={{ fill: '#adb5bd' }}
              width={isMobile ? 40 : 60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            {metrics.map((metric) => (
              <Line
                key={metric.key}
                type="monotone"
                dataKey={metric.key}
                stroke={metric.color}
                strokeWidth={isMobile ? 2 : 3}
                dot={false}
                activeDot={{
                  r: isMobile ? 4 : 6,
                  stroke: metric.color,
                  strokeWidth: 2,
                  fill: '#0a0a0f',
                }}
              />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Format timestamp based on time range
 */
function formatTime(date: Date, timeRange: string): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  switch (timeRange) {
    case '1h':
    case '6h':
      return `${hours}:${minutes}`;
    case '24h':
      return `${hours}:${minutes}`;
    case '7d':
    case '30d':
      return `${month}/${day}`;
    default:
      return `${hours}:${minutes}`;
  }
}
