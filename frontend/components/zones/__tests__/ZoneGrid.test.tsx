import { render, screen } from '@testing-library/react';
import { ZoneGrid } from '../ZoneGrid';
import type { ZoneSummary } from '@/types';

// Mock ZoneCard component
jest.mock('../ZoneCard', () => ({
  ZoneCard: ({ zone, onSelect }: any) => (
    <div data-testid={`zone-card-${zone.id}`} onClick={() => onSelect(zone.id)}>
      {zone.name}
    </div>
  ),
}));

describe('ZoneGrid', () => {
  const mockZones: ZoneSummary[] = [
    {
      id: 'zone-1',
      name: 'Zone 1',
      temperature: 22.5,
      humidity: 65,
      healthStatus: 'optimal',
      activeAlerts: 0,
      lastUpdate: new Date(),
    },
    {
      id: 'zone-2',
      name: 'Zone 2',
      temperature: 24.0,
      humidity: 70,
      healthStatus: 'warning',
      activeAlerts: 1,
      lastUpdate: new Date(),
    },
  ];

  const mockOnZoneSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all zones', () => {
    render(<ZoneGrid zones={mockZones} onZoneSelect={mockOnZoneSelect} />);

    expect(screen.getByTestId('zone-card-zone-1')).toBeInTheDocument();
    expect(screen.getByTestId('zone-card-zone-2')).toBeInTheDocument();
  });

  it('displays empty state when no zones', () => {
    render(<ZoneGrid zones={[]} onZoneSelect={mockOnZoneSelect} />);

    expect(screen.getByText(/No zones found/i)).toBeInTheDocument();
  });

  it('renders zones in a grid layout', () => {
    const { container } = render(<ZoneGrid zones={mockZones} onZoneSelect={mockOnZoneSelect} />);

    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
  });
});
