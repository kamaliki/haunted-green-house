/**
 * Property-Based Tests for Zone Management Display
 * Feature: nextjs-frontend, Property 1: Zone management display
 * Validates: Requirements 1.1, 1.2
 * 
 * Property: For any configured zone in the system, the zone management interface
 * should display a zone card with current status
 */

import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import { ZoneGrid } from '../ZoneGrid';
import type { ZoneSummary } from '@/types';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, className, ...props }: any) => (
      <div onClick={onClick} className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

describe('Property Test: Zone Management Display', () => {
  /**
   * Arbitrary generator for valid zone IDs
   */
  const zoneIdArbitrary = fc.uuid();

  /**
   * Arbitrary generator for zone names
   * Ensures names have at least one alphanumeric character
   */
  const zoneNameArbitrary = fc.string({ minLength: 1, maxLength: 50 }).filter(
    (s) => {
      const trimmed = s.trim();
      return trimmed.length > 0 && /[a-zA-Z0-9]/.test(trimmed);
    }
  );

  /**
   * Arbitrary generator for temperature values (realistic range)
   */
  const temperatureArbitrary = fc.float({ 
    min: -10, 
    max: 50, 
    noNaN: true,
    noDefaultInfinity: true 
  });

  /**
   * Arbitrary generator for humidity values (0-100%)
   */
  const humidityArbitrary = fc.float({ 
    min: 0, 
    max: 100, 
    noNaN: true,
    noDefaultInfinity: true 
  });

  /**
   * Arbitrary generator for health status
   */
  const healthStatusArbitrary = fc.constantFrom(
    'optimal' as const,
    'warning' as const,
    'critical' as const
  );

  /**
   * Arbitrary generator for alert counts
   */
  const alertCountArbitrary = fc.integer({ min: 0, max: 10 });

  /**
   * Arbitrary generator for timestamps (recent dates)
   */
  const timestampArbitrary = fc.date({
    min: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    max: new Date(),
  });

  /**
   * Arbitrary generator for a single ZoneSummary
   */
  const zoneSummaryArbitrary: fc.Arbitrary<ZoneSummary> = fc.record({
    id: zoneIdArbitrary,
    name: zoneNameArbitrary,
    temperature: temperatureArbitrary,
    humidity: humidityArbitrary,
    healthStatus: healthStatusArbitrary,
    activeAlerts: alertCountArbitrary,
    lastUpdate: timestampArbitrary,
  });

  /**
   * Arbitrary generator for an array of ZoneSummary objects with unique IDs
   */
  const zonesArrayArbitrary = fc.array(zoneSummaryArbitrary, { 
    minLength: 1, 
    maxLength: 20 
  }).map(zones => {
    // Ensure unique IDs by appending index
    return zones.map((zone, index) => ({
      ...zone,
      id: `${zone.id}-${index}`
    }));
  });

  /**
   * Property 1: Zone management display
   * For any configured zone in the system, the zone management interface
   * should display a zone card with current status
   */
  test('Property 1: all configured zones are displayed with zone cards', () => {
    fc.assert(
      fc.property(zonesArrayArbitrary, (zones: ZoneSummary[]) => {
        const mockOnZoneSelect = jest.fn();

        const { container, unmount } = render(
          <ZoneGrid zones={zones} onZoneSelect={mockOnZoneSelect} />
        );

        // Verify the correct number of zone cards are rendered
        const zoneCards = container.querySelectorAll('.retro-card');
        expect(zoneCards.length).toBe(zones.length);

        // Verify that each zone's data is present in the rendered output
        zones.forEach((zone) => {
          // Check that zone name is displayed (converted to uppercase in component)
          // Use trim() to handle whitespace differences
          const zoneName = zone.name.trim().toUpperCase();
          const zoneNameElements = screen.queryAllByText(zoneName);
          expect(zoneNameElements.length).toBeGreaterThan(0);

          // Check that temperature is displayed
          const tempText = `${zone.temperature.toFixed(1)}°C`;
          const tempElements = screen.queryAllByText(tempText);
          expect(tempElements.length).toBeGreaterThan(0);

          // Check that humidity is displayed
          const humidityText = `${zone.humidity.toFixed(0)}%`;
          const humidityElements = screen.queryAllByText(humidityText);
          expect(humidityElements.length).toBeGreaterThan(0);

          // Check that health status is displayed
          const statusText = zone.healthStatus.toUpperCase();
          const statusElements = screen.queryAllByText(statusText);
          expect(statusElements.length).toBeGreaterThan(0);
        });

        // Clean up after each property test iteration
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Zone cards display alert indicators when alerts are present
   * For any zone with active alerts, the zone card should display an alert badge
   */
  test('Property: zones with active alerts display alert indicators', () => {
    fc.assert(
      fc.property(zonesArrayArbitrary, (zones: ZoneSummary[]) => {
        const mockOnZoneSelect = jest.fn();

        const { container, unmount } = render(<ZoneGrid zones={zones} onZoneSelect={mockOnZoneSelect} />);

        // Count zones with alerts
        const zonesWithAlerts = zones.filter(z => z.activeAlerts > 0);
        const zonesWithoutAlerts = zones.filter(z => z.activeAlerts === 0);

        // Check that alert badges are present for zones with alerts
        if (zonesWithAlerts.length > 0) {
          const alertBadges = container.querySelectorAll('.absolute.-top-2.-right-2');
          expect(alertBadges.length).toBe(zonesWithAlerts.length);
        }

        // Verify no alert badges for zones without alerts
        if (zonesWithoutAlerts.length === zones.length) {
          const alertBadges = container.querySelectorAll('.absolute.-top-2.-right-2');
          expect(alertBadges.length).toBe(0);
        }

        // Clean up
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Zone cards display appropriate health status colors
   * For any zone, the visual styling should match the health status
   */
  test('Property: zone cards display health status with appropriate visual styling', () => {
    fc.assert(
      fc.property(zoneSummaryArbitrary, (zone: ZoneSummary) => {
        const mockOnZoneSelect = jest.fn();

        const { container } = render(
          <ZoneGrid zones={[zone]} onZoneSelect={mockOnZoneSelect} />
        );

        const zoneCard = container.querySelector('.retro-card');
        expect(zoneCard).toBeTruthy();

        // Check for appropriate color classes based on health status
        const classList = zoneCard?.classList.toString() || '';

        switch (zone.healthStatus) {
          case 'critical':
            // Should have blood-red styling
            expect(
              classList.includes('border-blood-red') ||
              container.querySelector('.text-blood-red')
            ).toBeTruthy();
            break;
          case 'warning':
            // Should have pumpkin-orange styling
            expect(
              classList.includes('border-pumpkin-orange') ||
              container.querySelector('.text-pumpkin-orange')
            ).toBeTruthy();
            break;
          case 'optimal':
            // Should have ghost-green styling
            expect(
              classList.includes('border-ghost-green') ||
              container.querySelector('.text-ghost-green')
            ).toBeTruthy();
            break;
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty zone list displays appropriate message
   * When no zones are configured, the interface should display an empty state message
   */
  test('Property: empty zone list displays appropriate empty state', () => {
    const mockOnZoneSelect = jest.fn();
    const emptyZones: ZoneSummary[] = [];

    const { unmount } = render(<ZoneGrid zones={emptyZones} onZoneSelect={mockOnZoneSelect} />);

    // Should display empty state message
    const emptyMessages = screen.queryAllByText(/No zones found/i);
    expect(emptyMessages.length).toBeGreaterThan(0);

    // Should display ghost emoji
    const ghostEmojis = screen.queryAllByText('👻');
    expect(ghostEmojis.length).toBeGreaterThan(0);

    // Clean up
    unmount();
  });

  /**
   * Property: Zone cards are clickable and trigger selection callback
   * For any zone, clicking the zone card should call the onZoneSelect callback with the zone ID
   */
  test('Property: clicking zone cards triggers selection with correct zone ID', () => {
    fc.assert(
      fc.property(zoneSummaryArbitrary, (zone: ZoneSummary) => {
        const mockOnZoneSelect = jest.fn();

        const { container } = render(
          <ZoneGrid zones={[zone]} onZoneSelect={mockOnZoneSelect} />
        );

        // Find and click the zone card
        const zoneCard = container.querySelector('.retro-card');
        expect(zoneCard).toBeTruthy();

        if (zoneCard) {
          zoneCard.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }

        // Verify the callback was called with the correct zone ID
        expect(mockOnZoneSelect).toHaveBeenCalledWith(zone.id);
        expect(mockOnZoneSelect).toHaveBeenCalledTimes(1);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Zone grid maintains consistent structure regardless of zone count
   * For any number of zones, the grid should render without errors and maintain structure
   */
  test('Property: zone grid renders consistently for any number of zones', () => {
    fc.assert(
      fc.property(
        fc.array(zoneSummaryArbitrary, { minLength: 0, maxLength: 50 }),
        (zones: ZoneSummary[]) => {
          const mockOnZoneSelect = jest.fn();

          const { container, unmount } = render(
            <ZoneGrid zones={zones} onZoneSelect={mockOnZoneSelect} />
          );

          // Should render without errors
          expect(container).toBeTruthy();

          if (zones.length === 0) {
            // Empty state should be displayed
            const emptyMessages = screen.queryAllByText(/No zones found/i);
            expect(emptyMessages.length).toBeGreaterThan(0);
          } else {
            // Grid should contain the correct number of cards
            const zoneCards = container.querySelectorAll('.retro-card');
            expect(zoneCards.length).toBe(zones.length);

            // Grid should have responsive classes
            const gridElement = container.querySelector('.grid');
            expect(gridElement).toBeTruthy();
            expect(gridElement?.classList.toString()).toMatch(/grid-cols/);
          }

          // Clean up
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Zone data integrity - all required fields are displayed
   * For any zone, all required fields (name, temperature, humidity, status) must be present
   */
  test('Property: all required zone fields are displayed for every zone', () => {
    fc.assert(
      fc.property(zoneSummaryArbitrary, (zone: ZoneSummary) => {
        const mockOnZoneSelect = jest.fn();

        const { unmount } = render(<ZoneGrid zones={[zone]} onZoneSelect={mockOnZoneSelect} />);

        // Verify all required fields are present
        // Use trim() to handle whitespace differences
        const zoneName = zone.name.trim().toUpperCase();
        const zoneNames = screen.queryAllByText(zoneName);
        expect(zoneNames.length).toBeGreaterThan(0);

        const temps = screen.queryAllByText(`${zone.temperature.toFixed(1)}°C`);
        expect(temps.length).toBeGreaterThan(0);

        const humidities = screen.queryAllByText(`${zone.humidity.toFixed(0)}%`);
        expect(humidities.length).toBeGreaterThan(0);

        const statuses = screen.queryAllByText(zone.healthStatus.toUpperCase());
        expect(statuses.length).toBeGreaterThan(0);

        // Verify timestamp is displayed (checking for "ago" text)
        const timeElements = screen.queryAllByText(/ago/i);
        expect(timeElements.length).toBeGreaterThan(0);

        // Clean up
        unmount();
      }),
      { numRuns: 100 }
    );
  });
});
