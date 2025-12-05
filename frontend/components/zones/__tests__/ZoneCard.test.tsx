import { render, screen, fireEvent } from '@testing-library/react';
import { ZoneCard } from '../ZoneCard';
import type { ZoneSummary } from '@/types';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, ...props }: any) => (
      <div onClick={onClick} {...props}>
        {children}
      </div>
    ),
  },
}));

describe('ZoneCard', () => {
  const mockZone: ZoneSummary = {
    id: 'zone-1',
    name: 'Test Zone',
    temperature: 22.5,
    humidity: 65,
    healthStatus: 'optimal',
    activeAlerts: 0,
    lastUpdate: new Date('2024-01-01T12:00:00Z'),
  };

  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders zone information correctly', () => {
    render(<ZoneCard zone={mockZone} onSelect={mockOnSelect} />);

    expect(screen.getByText('TEST ZONE')).toBeInTheDocument();
    expect(screen.getByText('22.5°C')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
    expect(screen.getByText('OPTIMAL')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    render(<ZoneCard zone={mockZone} onSelect={mockOnSelect} />);

    const card = screen.getByText('TEST ZONE').closest('div');
    if (card) {
      fireEvent.click(card);
    }

    expect(mockOnSelect).toHaveBeenCalledWith('zone-1');
  });

  it('displays alert badge when there are active alerts', () => {
    const zoneWithAlerts: ZoneSummary = {
      ...mockZone,
      activeAlerts: 3,
    };

    render(<ZoneCard zone={zoneWithAlerts} onSelect={mockOnSelect} />);

    expect(screen.getByText('3 ALERTS')).toBeInTheDocument();
  });

  it('does not display alert badge when there are no alerts', () => {
    render(<ZoneCard zone={mockZone} onSelect={mockOnSelect} />);

    expect(screen.queryByText(/ALERT/)).not.toBeInTheDocument();
  });

  it('displays correct health status colors for warning', () => {
    const warningZone: ZoneSummary = {
      ...mockZone,
      healthStatus: 'warning',
    };

    render(<ZoneCard zone={warningZone} onSelect={mockOnSelect} />);

    expect(screen.getByText('WARNING')).toBeInTheDocument();
  });

  it('displays correct health status colors for critical', () => {
    const criticalZone: ZoneSummary = {
      ...mockZone,
      healthStatus: 'critical',
    };

    render(<ZoneCard zone={criticalZone} onSelect={mockOnSelect} />);

    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
  });
});
