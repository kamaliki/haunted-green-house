/**
 * Unit tests for SensorCard component
 */

import { render, screen } from '@testing-library/react';
import { SensorCard, type SensorCardProps } from '../SensorCard';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

describe('SensorCard', () => {
  const defaultProps: SensorCardProps = {
    zoneId: 'zone-1',
    metric: 'temperature_air',
    label: 'Air Temperature',
    value: 22.5,
    unit: '°C',
    lastUpdate: new Date('2024-01-01T12:00:00Z'),
  };

  it('renders sensor label and value', () => {
    render(<SensorCard {...defaultProps} />);
    
    expect(screen.getByText(/AIR TEMPERATURE/i)).toBeInTheDocument();
    expect(screen.getByText(/22.5°C/i)).toBeInTheDocument();
  });

  it('displays critical styling when value exceeds threshold', () => {
    const props: SensorCardProps = {
      ...defaultProps,
      value: 35,
      threshold: { min: 18, max: 28, unit: '°C' },
    };

    const { container } = render(<SensorCard {...props} />);
    
    // Should have critical styling
    const cardElement = container.querySelector('.retro-card');
    expect(cardElement?.classList.contains('border-blood-red')).toBe(true);
  });

  it('displays warning styling when value is near threshold', () => {
    const props: SensorCardProps = {
      ...defaultProps,
      value: 27,
      threshold: { min: 18, max: 28, unit: '°C' },
    };

    const { container } = render(<SensorCard {...props} />);
    
    // Should have warning styling
    const cardElement = container.querySelector('.retro-card');
    expect(cardElement?.classList.contains('border-pumpkin-orange')).toBe(true);
  });

  it('displays normal styling when value is within safe range', () => {
    const props: SensorCardProps = {
      ...defaultProps,
      value: 22,
      threshold: { min: 18, max: 28, unit: '°C' },
    };

    const { container } = render(<SensorCard {...props} />);
    
    // Should have normal styling
    const cardElement = container.querySelector('.retro-card');
    expect(cardElement?.classList.contains('border-ghost-green')).toBe(true);
  });

  it('displays trend indicator when provided', () => {
    const props: SensorCardProps = {
      ...defaultProps,
      trend: 'up',
    };

    const { container } = render(<SensorCard {...props} />);
    
    // Check for trend section
    const trendElements = container.querySelectorAll('.text-text-secondary.font-vt323');
    const hasTrendText = Array.from(trendElements).some(el => el.textContent?.includes('UP'));
    expect(hasTrendText).toBe(true);
  });

  it('renders without threshold', () => {
    render(<SensorCard {...defaultProps} />);
    
    // Should render without errors
    expect(screen.getByText(/AIR TEMPERATURE/i)).toBeInTheDocument();
  });

  it('displays custom icon when provided', () => {
    const props: SensorCardProps = {
      ...defaultProps,
      icon: '🌡️',
    };

    const { container } = render(<SensorCard {...props} />);
    
    expect(container.textContent).toContain('🌡️');
  });
});
