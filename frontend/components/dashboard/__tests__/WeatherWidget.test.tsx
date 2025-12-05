/**
 * Unit tests for WeatherWidget component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { WeatherWidget, type WeatherWidgetProps } from '../WeatherWidget';
import type { WeatherData } from '@/types';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick, whileHover, ...props }: any) => (
      <div className={className} onClick={onClick} {...props}>
        {children}
      </div>
    ),
    span: ({ children, className, animate, ...props }: any) => (
      <span className={className} {...props}>
        {children}
      </span>
    ),
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('WeatherWidget', () => {
  const mockWeatherData: WeatherData = {
    temperature: 22.5,
    humidity: 65,
    conditions: 'Partly Cloudy',
    lastUpdate: new Date('2024-01-01T12:00:00Z'),
    forecast: [
      {
        date: new Date('2024-01-02'),
        tempHigh: 25,
        tempLow: 18,
        conditions: 'Sunny',
        precipitation: 0,
      },
      {
        date: new Date('2024-01-03'),
        tempHigh: 23,
        tempLow: 16,
        conditions: 'Rainy',
        precipitation: 80,
      },
    ],
  };

  it('renders loading state', () => {
    render(<WeatherWidget isLoading={true} />);
    
    expect(screen.getByText('WEATHER')).toBeInTheDocument();
    // Loading spinner should be present
    const spinningElement = document.querySelector('.animate-spin');
    expect(spinningElement).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(<WeatherWidget error="Failed to fetch weather data" />);
    
    expect(screen.getByText('WEATHER')).toBeInTheDocument();
    expect(screen.getByText(/Failed to fetch weather data/i)).toBeInTheDocument();
  });

  it('renders current weather conditions', () => {
    render(<WeatherWidget weatherData={mockWeatherData} />);
    
    expect(screen.getByText('WEATHER')).toBeInTheDocument();
    expect(screen.getByText(/23°C/i)).toBeInTheDocument();
    expect(screen.getByText(/Partly Cloudy/i)).toBeInTheDocument();
    expect(screen.getByText(/65%/i)).toBeInTheDocument();
  });

  it('expands to show forecast when clicked', () => {
    const { container } = render(<WeatherWidget weatherData={mockWeatherData} />);
    
    // Initially forecast should not be visible
    expect(screen.queryByText('5-DAY FORECAST')).not.toBeInTheDocument();
    
    // Click to expand
    const widget = container.querySelector('.retro-card');
    if (widget) {
      fireEvent.click(widget);
    }
    
    // Forecast should now be visible
    expect(screen.getByText('5-DAY FORECAST')).toBeInTheDocument();
  });

  it('displays forecast data when expanded', () => {
    const { container } = render(<WeatherWidget weatherData={mockWeatherData} />);
    
    // Click to expand
    const widget = container.querySelector('.retro-card');
    if (widget) {
      fireEvent.click(widget);
    }
    
    // Check forecast data
    expect(screen.getByText(/25°C/i)).toBeInTheDocument();
    expect(screen.getByText(/18°C/i)).toBeInTheDocument();
    expect(screen.getByText(/80%/i)).toBeInTheDocument(); // Precipitation
  });

  it('shows stale data warning when data is old', () => {
    const staleData: WeatherData = {
      ...mockWeatherData,
      lastUpdate: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    };

    const { container } = render(<WeatherWidget weatherData={staleData} />);
    
    // Should have orange border for stale data
    const widget = container.querySelector('.retro-card');
    expect(widget?.classList.contains('border-pumpkin-orange')).toBe(true);
  });

  it('handles missing forecast data gracefully', () => {
    const dataWithoutForecast: WeatherData = {
      ...mockWeatherData,
      forecast: [],
    };

    const { container } = render(<WeatherWidget weatherData={dataWithoutForecast} />);
    
    // Should render current conditions
    expect(screen.getByText(/23°C/i)).toBeInTheDocument();
    
    // Click to expand
    const widget = container.querySelector('.retro-card');
    if (widget) {
      fireEvent.click(widget);
    }
    
    // Forecast section should not appear
    expect(screen.queryByText('5-DAY FORECAST')).not.toBeInTheDocument();
  });
});
