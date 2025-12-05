/**
 * Property-Based Tests for Zone-Specific Historical Data Visualization
 * Feature: nextjs-frontend, Property 7: Zone-specific chart data completeness
 * Validates: Requirements 3.1, 3.2
 * 
 * Property: For any historical chart for a specific zone, all data points returned 
 * from the API for that zone should be rendered on the chart
 */

import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as fc from 'fast-check';
import EnvironmentPage from '../page';
import * as environmentApi from '@/lib/api/environment';
import * as greenhouseApi from '@/lib/api/greenhouse';
import type { TimeSeriesData, TimeSeriesDataPoint, Zone } from '@/types';

// Mock next/navigation
const mockPush = jest.fn();
const mockParams = { zoneId: 'test-zone-id' };

jest.mock('next/navigation', () => ({
  useParams: () => mockParams,
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

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

// Mock API functions
jest.mock('@/lib/api/environment');
jest.mock('@/lib/api/greenhouse');

describe('Property Test: Zone-specific chart data completeness', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  /**
   * Arbitrary generator for zone IDs
   */
  const zoneIdArbitrary = fc.uuid();

  /**
   * Arbitrary generator for zone names
   */
  const zoneNameArbitrary = fc.string({ minLength: 3, maxLength: 30 });

  /**
   * Arbitrary generator for metric names
   */
  const metricArbitrary = fc.constantFrom(
    'temperature_air',
    'temperature_soil',
    'humidity_air',
    'humidity_soil',
    'light_intensity',
    'co2_level',
    'soil_moisture',
    'soil_ph',
    'air_quality'
  );

  /**
   * Arbitrary generator for time ranges
   */
  const timeRangeArbitrary = fc.constantFrom('1h', '6h', '24h', '7d', '30d');

  /**
   * Arbitrary generator for sensor values
   */
  const sensorValueArbitrary = fc.float({ min: 0, max: 100, noNaN: true });

  /**
   * Arbitrary generator for timestamps
   */
  const timestampArbitrary = fc.date({
    min: new Date('2024-01-01T00:00:00Z'),
    max: new Date('2024-12-31T23:59:59Z'),
  });

  /**
   * Property 7: Zone-specific chart data completeness
   * For any zone and selected metrics, all data points returned from the API 
   * for that zone should be rendered on the chart
   */
  test('Property 7: all API data points for a zone are rendered on the chart', async () => {
    await fc.assert(
      fc.asyncProperty(
        zoneIdArbitrary,
        zoneNameArbitrary,
        fc.array(metricArbitrary, { minLength: 1, maxLength: 5 }).map((arr) => [...new Set(arr)]),
        fc.integer({ min: 5, max: 50 }),
        timeRangeArbitrary,
        async (zoneId, zoneName, metrics, numPoints, timeRange) => {
          // Precondition: must have at least one metric
          fc.pre(metrics.length > 0);

          // Update mock params
          mockParams.zoneId = zoneId;

          // Mock zone data
          const mockZone: Zone = {
            id: zoneId,
            greenhouseId: 'test-greenhouse',
            name: zoneName,
            description: 'Test zone',
            orderIndex: 0,
            createdAt: new Date(),
          };

          // Generate time series data for each metric
          const baseTimestamp = new Date('2024-01-01T00:00:00Z').getTime();
          const timeIncrement = 60000; // 1 minute

          const mockTimeSeriesData: TimeSeriesData[] = metrics.map((metric) => {
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

          // Mock API responses
          (greenhouseApi.getZone as jest.Mock).mockResolvedValue(mockZone);
          (environmentApi.getZoneHistoricalData as jest.Mock).mockResolvedValue(mockTimeSeriesData);

          // Render the page
          const { container } = render(
            <QueryClientProvider client={queryClient}>
              <EnvironmentPage />
            </QueryClientProvider>
          );

          // Wait for zone to load
          await waitFor(() => {
            expect(screen.getByText(new RegExp(zoneName, 'i'))).toBeInTheDocument();
          });

          // Wait for chart to render
          await waitFor(() => {
            const chartElement = container.querySelector('[data-testid="area-chart"]');
            expect(chartElement).toBeInTheDocument();
          }, { timeout: 3000 });

          // Verify the API was called with the correct zone ID
          expect(environmentApi.getZoneHistoricalData).toHaveBeenCalledWith(
            zoneId,
            expect.objectContaining({
              metrics: expect.arrayContaining(metrics.slice(0, 2)), // Default selection
              timeRange: '24h', // Default time range
            })
          );

          // Verify chart received all data points
          const chartElement = container.querySelector('[data-testid="area-chart"]');
          const chartPoints = chartElement?.getAttribute('data-chart-points');
          const renderedPoints = chartPoints ? parseInt(chartPoints, 10) : 0;

          // All unique timestamps should be rendered
          expect(renderedPoints).toBe(numPoints);

          // Verify all selected metrics are rendered (default: first 2 metrics)
          const defaultMetrics = ['temperature_air', 'humidity_air'];
          defaultMetrics.forEach((metric) => {
            if (metrics.includes(metric)) {
              const areaElement = container.querySelector(`[data-testid="area-${metric}"]`);
              expect(areaElement).toBeInTheDocument();
            }
          });
        }
      ),
      { numRuns: 100, timeout: 10000 }
    );
  }, 30000);

  /**
   * Property: Zone-specific data isolation
   * For any zone, the chart should only display data for that specific zone,
   * not data from other zones
   */
  test('Property: chart displays only data for the specified zone', async () => {
    await fc.assert(
      fc.asyncProperty(
        zoneIdArbitrary,
        zoneNameArbitrary,
        fc.array(metricArbitrary, { minLength: 1, maxLength: 3 }).map((arr) => [...new Set(arr)]),
        fc.integer({ min: 10, max: 30 }),
        async (zoneId, zoneName, metrics, numPoints) => {
          fc.pre(metrics.length > 0);

          mockParams.zoneId = zoneId;

          const mockZone: Zone = {
            id: zoneId,
            greenhouseId: 'test-greenhouse',
            name: zoneName,
            description: 'Test zone',
            orderIndex: 0,
            createdAt: new Date(),
          };

          // Generate time series data
          const baseTimestamp = new Date('2024-01-01T00:00:00Z').getTime();
          const timeIncrement = 60000;

          const mockTimeSeriesData: TimeSeriesData[] = metrics.map((metric) => {
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

          (greenhouseApi.getZone as jest.Mock).mockResolvedValue(mockZone);
          (environmentApi.getZoneHistoricalData as jest.Mock).mockResolvedValue(mockTimeSeriesData);

          render(
            <QueryClientProvider client={queryClient}>
              <EnvironmentPage />
            </QueryClientProvider>
          );

          // Wait for data to load
          await waitFor(() => {
            expect(environmentApi.getZoneHistoricalData).toHaveBeenCalled();
          });

          // Verify the API was called with the correct zone ID
          const calls = (environmentApi.getZoneHistoricalData as jest.Mock).mock.calls;
          calls.forEach((call) => {
            expect(call[0]).toBe(zoneId);
          });

          // Verify zone name is displayed in the header
          await waitFor(() => {
            expect(screen.getByText(new RegExp(zoneName, 'i'))).toBeInTheDocument();
          });
        }
      ),
      { numRuns: 100, timeout: 10000 }
    );
  }, 30000);

  /**
   * Property: Empty data handling for zone
   * For any zone with no historical data, the chart should display an appropriate message
   */
  test('Property: chart handles empty data gracefully for any zone', async () => {
    await fc.assert(
      fc.asyncProperty(
        zoneIdArbitrary,
        zoneNameArbitrary,
        async (zoneId, zoneName) => {
          mockParams.zoneId = zoneId;

          const mockZone: Zone = {
            id: zoneId,
            greenhouseId: 'test-greenhouse',
            name: zoneName,
            description: 'Test zone',
            orderIndex: 0,
            createdAt: new Date(),
          };

          // Mock empty time series data
          const mockTimeSeriesData: TimeSeriesData[] = [];

          (greenhouseApi.getZone as jest.Mock).mockResolvedValue(mockZone);
          (environmentApi.getZoneHistoricalData as jest.Mock).mockResolvedValue(mockTimeSeriesData);

          const { container } = render(
            <QueryClientProvider client={queryClient}>
              <EnvironmentPage />
            </QueryClientProvider>
          );

          // Wait for zone to load
          await waitFor(() => {
            expect(screen.getByText(new RegExp(zoneName, 'i'))).toBeInTheDocument();
          });

          // Wait for empty state message
          await waitFor(() => {
            expect(screen.getByText(/no data available/i)).toBeInTheDocument();
          }, { timeout: 3000 });

          // Verify chart is not rendered
          const chartElement = container.querySelector('[data-testid="area-chart"]');
          expect(chartElement).not.toBeInTheDocument();
        }
      ),
      { numRuns: 100, timeout: 10000 }
    );
  }, 30000);

  /**
   * Property: Data point count consistency
   * For any zone and time range, the number of data points rendered should match
   * the number of data points returned by the API
   */
  test('Property: rendered data point count matches API response for zone', async () => {
    await fc.assert(
      fc.asyncProperty(
        zoneIdArbitrary,
        zoneNameArbitrary,
        fc.array(metricArbitrary, { minLength: 1, maxLength: 3 }).map((arr) => [...new Set(arr)]),
        fc.integer({ min: 1, max: 100 }),
        timeRangeArbitrary,
        async (zoneId, zoneName, metrics, numPoints, timeRange) => {
          fc.pre(metrics.length > 0);

          mockParams.zoneId = zoneId;

          const mockZone: Zone = {
            id: zoneId,
            greenhouseId: 'test-greenhouse',
            name: zoneName,
            description: 'Test zone',
            orderIndex: 0,
            createdAt: new Date(),
          };

          // Generate consistent timestamps for all metrics
          const baseTimestamp = new Date('2024-01-01T00:00:00Z').getTime();
          const timeIncrement = 60000;

          const mockTimeSeriesData: TimeSeriesData[] = metrics.map((metric) => {
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

          (greenhouseApi.getZone as jest.Mock).mockResolvedValue(mockZone);
          (environmentApi.getZoneHistoricalData as jest.Mock).mockResolvedValue(mockTimeSeriesData);

          const { container } = render(
            <QueryClientProvider client={queryClient}>
              <EnvironmentPage />
            </QueryClientProvider>
          );

          // Wait for chart to render
          await waitFor(() => {
            const chartElement = container.querySelector('[data-testid="area-chart"]');
            expect(chartElement).toBeInTheDocument();
          }, { timeout: 3000 });

          // Verify data point count
          const chartElement = container.querySelector('[data-testid="area-chart"]');
          const chartPoints = chartElement?.getAttribute('data-chart-points');
          const renderedPoints = chartPoints ? parseInt(chartPoints, 10) : 0;

          // The chart should render exactly the number of unique timestamps
          expect(renderedPoints).toBe(numPoints);
        }
      ),
      { numRuns: 100, timeout: 10000 }
    );
  }, 30000);

  /**
   * Property: Metric selection completeness
   * For any zone and any subset of selected metrics, all selected metrics
   * should be rendered on the chart
   */
  test('Property: all selected metrics are rendered for zone', async () => {
    await fc.assert(
      fc.asyncProperty(
        zoneIdArbitrary,
        zoneNameArbitrary,
        fc.array(metricArbitrary, { minLength: 1, maxLength: 5 }).map((arr) => [...new Set(arr)]),
        fc.integer({ min: 10, max: 30 }),
        async (zoneId, zoneName, metrics, numPoints) => {
          fc.pre(metrics.length > 0);

          mockParams.zoneId = zoneId;

          const mockZone: Zone = {
            id: zoneId,
            greenhouseId: 'test-greenhouse',
            name: zoneName,
            description: 'Test zone',
            orderIndex: 0,
            createdAt: new Date(),
          };

          const baseTimestamp = new Date('2024-01-01T00:00:00Z').getTime();
          const timeIncrement = 60000;

          const mockTimeSeriesData: TimeSeriesData[] = metrics.map((metric) => {
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

          (greenhouseApi.getZone as jest.Mock).mockResolvedValue(mockZone);
          (environmentApi.getZoneHistoricalData as jest.Mock).mockResolvedValue(mockTimeSeriesData);

          const { container } = render(
            <QueryClientProvider client={queryClient}>
              <EnvironmentPage />
            </QueryClientProvider>
          );

          // Wait for chart to render
          await waitFor(() => {
            const chartElement = container.querySelector('[data-testid="area-chart"]');
            expect(chartElement).toBeInTheDocument();
          }, { timeout: 3000 });

          // Verify default selected metrics are rendered
          const defaultMetrics = ['temperature_air', 'humidity_air'];
          defaultMetrics.forEach((metric) => {
            if (metrics.includes(metric)) {
              const areaElement = container.querySelector(`[data-testid="area-${metric}"]`);
              expect(areaElement).toBeInTheDocument();
            }
          });
        }
      ),
      { numRuns: 100, timeout: 10000 }
    );
  }, 30000);
});
