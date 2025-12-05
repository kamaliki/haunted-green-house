/**
 * Property-based tests for SensorCard component
 * Feature: nextjs-frontend, Property 2: Threshold visual indication
 * Validates: Requirements 1.3
 */

import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import { SensorCard, type SensorCardProps, type SensorThreshold } from '../SensorCard';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, whileHover, initial, animate, transition, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('SensorCard Property Tests', () => {
  /**
   * Property 2: Threshold visual indication
   * For any sensor metric with defined thresholds, when the current value exceeds the threshold,
   * the UI should display a visual warning indicator
   */
  test('Property 2: Threshold visual indication - critical values show red styling', () => {
    fc.assert(
      fc.property(
        // Generate threshold configuration
        fc.record({
          min: fc.float({ min: 0, max: 50, noNaN: true }),
          max: fc.float({ min: 51, max: 100, noNaN: true }),
          unit: fc.constantFrom('°C', '%', ' ppm', ' lux', ''),
        }),
        // Generate sensor values that exceed thresholds (critical)
        fc.oneof(
          fc.float({ min: Math.fround(-50), max: Math.fround(-0.1), noNaN: true }), // Below minimum
          fc.float({ min: Math.fround(100.1), max: Math.fround(200), noNaN: true })  // Above maximum
        ),
        // Generate other props
        fc.record({
          metric: fc.constantFrom('temperature', 'humidity', 'co2', 'light'),
          unit: fc.constantFrom('°C', '%', ' ppm', ' lux'),
          label: fc.string({ minLength: 1, maxLength: 20 }),
          lastUpdate: fc.constant(new Date()),
        }),
        (threshold: SensorThreshold, criticalValue: number, otherProps) => {
          // Ensure the value is actually critical
          const isCritical = criticalValue < threshold.min || criticalValue > threshold.max;
          fc.pre(isCritical); // Only test with critical values

          const props: SensorCardProps = {
            ...otherProps,
            zoneId: 'test-zone-id',
            value: criticalValue,
            threshold,
          };

          const { container } = render(<SensorCard {...props} />);

          // Check for critical styling indicators
          const cardElement = container.querySelector('.retro-card');
          expect(cardElement).toBeTruthy();

          // Should have blood-red border for critical values
          const hasCriticalBorder = cardElement?.classList.contains('border-blood-red');
          
          // Should have blood-red text color
          const criticalTextElements = container.querySelectorAll('.text-blood-red');
          const hasCriticalText = criticalTextElements.length > 0;

          // Should have critical glow effect
          const hasGlowEffect = cardElement?.classList.toString().includes('shadow-') || 
                               cardElement?.classList.toString().includes('rgba(255,0,110');

          // At least one critical visual indicator should be present
          const hasCriticalIndicator = hasCriticalBorder || hasCriticalText || hasGlowEffect;
          
          expect(hasCriticalIndicator).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 2: Threshold visual indication - warning values show orange styling', () => {
    fc.assert(
      fc.property(
        // Generate threshold configuration with sufficient range
        fc.float({ min: 20, max: 40, noNaN: true }),
        fc.float({ min: 60, max: 80, noNaN: true }),
        fc.constantFrom('°C', '%', ' ppm', ' lux', ''),
        // Generate a percentage for where in the warning zone the value should be (0-1)
        fc.float({ min: 0, max: 1, noNaN: true }),
        // Generate whether to test low or high warning zone
        fc.boolean(),
        // Generate other props
        fc.constantFrom('temperature', 'humidity', 'co2', 'light'),
        fc.constantFrom('°C', '%', ' ppm', ' lux'),
        fc.string({ minLength: 1, maxLength: 20 }),
        (min, max, thresholdUnit, warningPosition, isLowWarning, metric, unit, label) => {
          // Skip if we got invalid values
          fc.pre(!isNaN(min) && !isNaN(max) && !isNaN(warningPosition));
          fc.pre(min < max); // Ensure min is less than max
          
          const threshold: SensorThreshold = { min, max, unit: thresholdUnit };
          
          // Calculate warning zone (within 10% of threshold)
          const range = max - min;
          const warningMargin = 0.1;
          const minWarning = min + range * warningMargin;
          const maxWarning = max - range * warningMargin;

          // Generate a value in the warning zone based on the position
          const warningValue = isLowWarning
            ? min + (minWarning - min) * warningPosition  // Low warning zone
            : maxWarning + (max - maxWarning) * warningPosition;  // High warning zone

          const props: SensorCardProps = {
            zoneId: 'test-zone-id',
            metric,
            unit,
            label,
            value: warningValue,
            threshold,
            lastUpdate: new Date(),
          };

          const { container } = render(<SensorCard {...props} />);

          // Check for warning styling indicators
          const cardElement = container.querySelector('.retro-card');
          expect(cardElement).toBeTruthy();

          // Should have orange border for warning values
          const hasWarningBorder = cardElement?.classList.contains('border-pumpkin-orange');
          
          // Should have orange text color
          const warningTextElements = container.querySelectorAll('.text-pumpkin-orange');
          const hasWarningText = warningTextElements.length > 0;

          // Should have orange glow effect
          const hasOrangeGlow = cardElement?.classList.toString().includes('251,86,7');

          // At least one warning visual indicator should be present
          const hasWarningIndicator = hasWarningBorder || hasWarningText || hasOrangeGlow;
          
          expect(hasWarningIndicator).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 2: Threshold visual indication - normal values show green styling', () => {
    fc.assert(
      fc.property(
        // Generate threshold configuration with sufficient range
        fc.float({ min: 20, max: 40, noNaN: true }),
        fc.float({ min: 60, max: 80, noNaN: true }),
        fc.constantFrom('°C', '%', ' ppm', ' lux', ''),
        // Generate a percentage for where in the safe zone the value should be (0-1)
        fc.float({ min: 0, max: 1, noNaN: true }),
        // Generate other props
        fc.constantFrom('temperature', 'humidity', 'co2', 'light'),
        fc.constantFrom('°C', '%', ' ppm', ' lux'),
        fc.string({ minLength: 1, maxLength: 20 }),
        (min, max, thresholdUnit, safePosition, metric, unit, label) => {
          // Skip if we got invalid values
          fc.pre(!isNaN(min) && !isNaN(max) && !isNaN(safePosition));
          fc.pre(min < max); // Ensure min is less than max
          
          const threshold: SensorThreshold = { min, max, unit: thresholdUnit };
          
          // Calculate safe zone (middle 80% of range, avoiding warning zones)
          const range = max - min;
          const safeMargin = 0.15; // Use 15% margin to ensure we're well within safe zone
          const safeMin = min + range * safeMargin;
          const safeMax = max - range * safeMargin;

          // Generate a value in the safe zone based on the position
          const safeValue = safeMin + (safeMax - safeMin) * safePosition;

          const props: SensorCardProps = {
            zoneId: 'test-zone-id',
            metric,
            unit,
            label,
            value: safeValue,
            threshold,
            lastUpdate: new Date(),
          };

          const { container } = render(<SensorCard {...props} />);

          // Check for normal/safe styling indicators
          const cardElement = container.querySelector('.retro-card');
          expect(cardElement).toBeTruthy();

          // Should have green border for normal values
          const hasNormalBorder = cardElement?.classList.contains('border-ghost-green');
          
          // Should have green text color
          const normalTextElements = container.querySelectorAll('.text-ghost-green');
          const hasNormalText = normalTextElements.length > 0;

          // Should have green glow effect
          const hasGreenGlow = cardElement?.classList.toString().includes('57,255,20');

          // At least one normal visual indicator should be present
          const hasNormalIndicator = hasNormalBorder || hasNormalText || hasGreenGlow;
          
          expect(hasNormalIndicator).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 2: Threshold visual indication - sensors without thresholds show default styling', () => {
    fc.assert(
      fc.property(
        // Generate sensor props without threshold
        fc.record({
          metric: fc.constantFrom('temperature', 'humidity', 'co2', 'light'),
          value: fc.float({ min: 0, max: 100, noNaN: true }),
          unit: fc.constantFrom('°C', '%', ' ppm', ' lux'),
          label: fc.string({ minLength: 1, maxLength: 20 }),
          lastUpdate: fc.constant(new Date()),
        }),
        (props) => {
          // Explicitly set threshold to undefined
          const propsWithoutThreshold: SensorCardProps = {
            ...props,
            zoneId: 'test-zone-id',
            threshold: undefined,
          };

          const { container } = render(<SensorCard {...propsWithoutThreshold} />);

          // Check that it renders without errors
          const cardElement = container.querySelector('.retro-card');
          expect(cardElement).toBeTruthy();

          // Should show default green styling when no threshold is defined
          const hasDefaultStyling = 
            cardElement?.classList.contains('border-ghost-green') ||
            container.querySelectorAll('.text-ghost-green').length > 0;

          expect(hasDefaultStyling).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});