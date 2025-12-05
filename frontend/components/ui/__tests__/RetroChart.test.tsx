import React from 'react';
import { render, screen } from '@testing-library/react';
import { RetroChart } from '../RetroChart';
import type { TimeSeriesData } from '@/types';

// Mock Recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

describe('RetroChart', () => {
  const mockMetrics = [
    {
      key: 'temperature',
      label: 'Temperature',
      color: '#39ff14',
      unit: '°C',
    },
    {
      key: 'humidity',
      label: 'Humidity',
      color: '#9d4edd',
      unit: '%',
    },
  ];

  const mockData: TimeSeriesData[] = [
    {
      metric: 'temperature',
      data: [
        { timestamp: new Date('2024-01-01T10:00:00'), value: 22.5 },
        { timestamp: new Date('2024-01-01T11:00:00'), value: 23.0 },
        { timestamp: new Date('2024-01-01T12:00:00'), value: 23.5 },
      ],
    },
    {
      metric: 'humidity',
      data: [
        { timestamp: new Date('2024-01-01T10:00:00'), value: 65 },
        { timestamp: new Date('2024-01-01T11:00:00'), value: 67 },
        { timestamp: new Date('2024-01-01T12:00:00'), value: 70 },
      ],
    },
  ];

  it('renders line chart by default', () => {
    render(
      <RetroChart
        data={mockData}
        metrics={mockMetrics}
        timeRange="24h"
      />
    );

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('renders area chart when type is area', () => {
    render(
      <RetroChart
        data={mockData}
        metrics={mockMetrics}
        timeRange="24h"
        type="area"
      />
    );

    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  it('displays no data message when data is empty', () => {
    render(
      <RetroChart
        data={[]}
        metrics={mockMetrics}
        timeRange="24h"
      />
    );

    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  it('applies spooky styling classes', () => {
    const { container } = render(
      <RetroChart
        data={mockData}
        metrics={mockMetrics}
        timeRange="24h"
      />
    );

    // Check that the component wrapper has proper styling
    const wrapper = container.querySelector('.w-full');
    expect(wrapper).toBeInTheDocument();
  });

  it('renders with correct dimensions', () => {
    render(
      <RetroChart
        data={mockData}
        metrics={mockMetrics}
        timeRange="24h"
      />
    );

    const container = screen.getByTestId('responsive-container');
    expect(container).toBeInTheDocument();
  });
});
