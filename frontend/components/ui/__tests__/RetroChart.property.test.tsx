/**
 * Property-based tests for RetroChart component
 * Feature: nextjs-frontend, Property 6: Chart data completeness
 * Validates: Requirements 2.1, 2.2
 */

import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import { RetroChart } from '../RetroChart';
import type { TimeSeriesData, TimeSeriesDataPoint } from '@/types';

// Mock Recharts to avoid rendering issues in tests
jest.mock('recharts', () => {
  const React = require('react');
  return {
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
    LineChart: ({ data, children }: any) => (
      <div data-testid="line-chart" data-chart-points={data?.length || 0}>
        {children}
      </div>
    ),
    AreaChart: ({ data, children }: any) => (
      <div data-testid="area-chart" data-chart-points={data?.length || 0}>
        {children}
      </div>
    ),
    Line: ({ dataKey }: any) => <div data-testid={`line-${dataKey}`} />,
    Area: ({ dataKey }: any) => <div data-testid={`area-${dataKey}`} />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
  };
});

describe('RetroChart Property Tests', () => {
  /**
   * Property 6: Chart data completeness
   * For any historical chart, all data points returned from the API should be rendered on the chart
   */
  test('Property 6: Chart data completeness - all API data points are rendered', () => {
    fc.assert(
      fc.property(
        // Generate a list of metrics (1-5 metrics)
        fc.array(
          fc.constantFrom(
            'temperature_air',
            'temperature_soil',
            'humidity_air',
            'humidity_soil',
            'light_intensity',
            'co2_level',
            'soil_moisture',
            'soil_ph',
            'air_quality'
          ),
          { minLength: 1, maxLength: 5 }
        ).map((arr) => [...new Set(arr)]), // Remove duplicates
        // Generate number of data points (5-50 points)
        fc.integer({ min: 5, max: 50 }),
        // Generate time range
        fc.constantFrom('1h', '6h', '24h', '7d', '30d'),
        (metrics, numPoints, timeRange) => {
          // Skip if no metrics
          fc.pre(metrics.length > 0);

          // Generate time series data for each metric
          const baseTimestamp = new Date('2024-01-01T00:00:00Z').getTime();
          const timeIncrement = 60000; // 1 minute

          const timeSeriesData: TimeSeriesData[] = metrics.map((metric) => {
            const dataPoints: TimeSeriesDataPoint[] = [];
            for (let i = 0; i < numPoints; i++) {
              dataPoints.push({
                timestamp: new Date(baseTimestamp + i * timeIncrement),
                value: Math.random() * 100,
              });
            }
            return {
              metric,
              data: dataPoints,
            };
          });

          // Create metric configs
          const metricConfigs = metrics.map((metric, index) => ({
            key: metric,
            label: metric.replace(/_/g, ' ').toUpperCase(),
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            unit: index % 2 === 0 ? '°C' : '%',
          }));

          // Render the chart
          const { container } = render(
            <RetroChart
              data={timeSeriesData}
              metrics={metricConfigs}
              timeRange={timeRange}
              type="line"
            />
          );

          // Verify chart is rendered
          const chartElement = container.querySelector('[data-testid="line-chart"]');
          expect(chartElement).toBeTruthy();

          // Get the number of data points the chart received
          const chartPoints = chartElement?.getAttribute('data-chart-points');
          const renderedPoints = chartPoints ? parseInt(chartPoints, 10) : 0;

          // All unique timestamps should be rendered
          // Since all metrics share the same timestamps, we expect numPoints unique timestamps
          expect(renderedPoints).toBe(numPoints);

          // Verify all metrics are rendered as lines
          metrics.forEach((metric) => {
            const lineElement = container.querySelector(`[data-testid="line-${metric}"]`);
            expect(lineElement).toBeTruthy();
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 6: Chart data completeness - area chart renders all data points', () => {
    fc.assert(
      fc.property(
        // Generate a list of metrics (1-3 metrics for area charts)
        fc.array(
          fc.constantFrom(
            'temperature_air',
            'humidity_air',
            'light_intensity'
          ),
          { minLength: 1, maxLength: 3 }
        ).map((arr) => [...new Set(arr)]),
        // Generate number of data points (5-30 points)
        fc.integer({ min: 5, max: 30 }),
        // Generate time range
        fc.constantFrom('1h', '6h', '24h', '7d', '30d'),
        (metrics, numPoints, timeRange) => {
          fc.pre(metrics.length > 0);

          // Generate time series data
          const baseTimestamp = new Date('2024-01-01T00:00:00Z').getTime();
          const timeIncrement = 60000;

          const timeSeriesData: TimeSeriesData[] = metrics.map((metric) => {
            const dataPoints: TimeSeriesDataPoint[] = [];
            for (let i = 0; i < numPoints; i++) {
              dataPoints.push({
                timestamp: new Date(baseTimestamp + i * timeIncrement),
                value: Math.random() * 100,
              });
            }
            return {
              metric,
              data: dataPoints,
            };
          });

          const metricConfigs = metrics.map((metric) => ({
            key: metric,
            label: metric.replace(/_/g, ' ').toUpperCase(),
            color: '#39ff14',
            unit: '°C',
          }));

          // Render as area chart
          const { container } = render(
            <RetroChart
              data={timeSeriesData}
              metrics={metricConfigs}
              timeRange={timeRange}
              type="area"
            />
          );

          // Verify area chart is rendered
          const chartElement = container.querySelector('[data-testid="area-chart"]');
          expect(chartElement).toBeTruthy();

          // Get the number of data points
          const chartPoints = chartElement?.getAttribute('data-chart-points');
          const renderedPoints = chartPoints ? parseInt(chartPoints, 10) : 0;

          // All data points should be rendered
          expect(renderedPoints).toBe(numPoints);

          // Verify all metrics are rendered as areas
          metrics.forEach((metric) => {
            const areaElement = container.querySelector(`[data-testid="area-${metric}"]`);
            expect(areaElement).toBeTruthy();
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 6: Chart data completeness - handles metrics with different data point counts', () => {
    fc.assert(
      fc.property(
        // Generate 2-4 metrics
        fc.array(
          fc.constantFrom(
            'temperature_air',
            'humidity_air',
            'light_intensity',
            'co2_level'
          ),
          { minLength: 2, maxLength: 4 }
        ).map((arr) => [...new Set(arr)]),
        // Generate different point counts for each metric
        fc.array(fc.integer({ min: 5, max: 30 }), { minLength: 2, maxLength: 4 }),
        fc.constantFrom('1h', '6h', '24h'),
        (metrics, pointCounts, timeRange) => {
          fc.pre(metrics.length > 0);
          fc.pre(pointCounts.length >= metrics.length);

          // Generate time series data with different point counts
          const baseTimestamp = new Date('2024-01-01T00:00:00Z').getTime();
          const timeIncrement = 60000;

          const timeSeriesData: TimeSeriesData[] = metrics.map((metric, index) => {
            const numPoints = pointCounts[index];
            const dataPoints: TimeSeriesDataPoint[] = [];
            for (let i = 0; i < numPoints; i++) {
              dataPoints.push({
                timestamp: new Date(baseTimestamp + i * timeIncrement),
                value: Math.random() * 100,
              });
            }
            return {
              metric,
              data: dataPoints,
            };
          });

          const metricConfigs = metrics.map((metric) => ({
            key: metric,
            label: metric.replace(/_/g, ' ').toUpperCase(),
            color: '#39ff14',
            unit: '%',
          }));

          const { container } = render(
            <RetroChart
              data={timeSeriesData}
              metrics={metricConfigs}
              timeRange={timeRange}
              type="line"
            />
          );

          // Chart should render
          const chartElement = container.querySelector('[data-testid="line-chart"]');
          expect(chartElement).toBeTruthy();

          // Should render at least as many points as the maximum count
          const chartPoints = chartElement?.getAttribute('data-chart-points');
          const renderedPoints = chartPoints ? parseInt(chartPoints, 10) : 0;
          const maxPoints = Math.max(...pointCounts.slice(0, metrics.length));
          
          expect(renderedPoints).toBeGreaterThanOrEqual(maxPoints);

          // All metrics should be rendered
          metrics.forEach((metric) => {
            const lineElement = container.querySelector(`[data-testid="line-${metric}"]`);
            expect(lineElement).toBeTruthy();
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 6: Chart data completeness - empty data shows appropriate message', () => {
    fc.assert(
      fc.property(
        // Generate metric configs but with empty data
        fc.array(
          fc.constantFrom('temperature_air', 'humidity_air'),
          { minLength: 1, maxLength: 3 }
        ).map((arr) => [...new Set(arr)]),
        fc.constantFrom('1h', '6h', '24h'),
        (metrics, timeRange) => {
          fc.pre(metrics.length > 0);

          // Empty time series data
          const timeSeriesData: TimeSeriesData[] = [];

          const metricConfigs = metrics.map((metric) => ({
            key: metric,
            label: metric.replace(/_/g, ' ').toUpperCase(),
            color: '#39ff14',
            unit: '°C',
          }));

          const { container, getByText } = render(
            <RetroChart
              data={timeSeriesData}
              metrics={metricConfigs}
              timeRange={timeRange}
              type="line"
            />
          );

          // Should show "No data to display" message
          const noDataMessage = getByText(/no data to display/i);
          expect(noDataMessage).toBeTruthy();

          // Should not render chart elements
          const chartElement = container.querySelector('[data-testid="line-chart"]');
          expect(chartElement).toBeFalsy();
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 6: Chart data completeness - single data point is rendered', () => {
    fc.assert(
      fc.property(
        // Generate 1-2 metrics
        fc.array(
          fc.constantFrom('temperature_air', 'humidity_air'),
          { minLength: 1, maxLength: 2 }
        ).map((arr) => [...new Set(arr)]),
        // Single timestamp
        fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
        // Random value
        fc.float({ min: 0, max: 100, noNaN: true }),
        fc.constantFrom('1h', '6h', '24h'),
        (metrics, timestamp, value, timeRange) => {
          fc.pre(metrics.length > 0);

          // Create single data point for each metric
          const timeSeriesData: TimeSeriesData[] = metrics.map((metric) => ({
            metric,
            data: [{ timestamp, value }],
          }));

          const metricConfigs = metrics.map((metric) => ({
            key: metric,
            label: metric.replace(/_/g, ' ').toUpperCase(),
            color: '#39ff14',
            unit: '°C',
          }));

          const { container } = render(
            <RetroChart
              data={timeSeriesData}
              metrics={metricConfigs}
              timeRange={timeRange}
              type="line"
            />
          );

          // Chart should render with 1 data point
          const chartElement = container.querySelector('[data-testid="line-chart"]');
          expect(chartElement).toBeTruthy();

          const chartPoints = chartElement?.getAttribute('data-chart-points');
          const renderedPoints = chartPoints ? parseInt(chartPoints, 10) : 0;
          
          expect(renderedPoints).toBe(1);

          // All metrics should be rendered
          metrics.forEach((metric) => {
            const lineElement = container.querySelector(`[data-testid="line-${metric}"]`);
            expect(lineElement).toBeTruthy();
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
