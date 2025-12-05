/**
 * Property-Based Tests for Zone-Aware Alert Notification Display
 * Feature: nextjs-frontend, Property 15: Zone-aware alert notification display
 * Validates: Requirements 11.1
 * 
 * Property: For any alert triggered by the backend, the system should display
 * a notification in the UI with zone information if the alert is zone-specific
 */

import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import { AlertToastContainer } from '../AlertToast';
import { useAlertStore } from '@/lib/store/alertStore';
import type { Alert } from '@/types';

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

describe('Property Test: Zone-Aware Alert Notification Display', () => {
  beforeEach(() => {
    // Clear the alert store before each test
    useAlertStore.setState({ alerts: [], unreadCount: 0 });
  });

  /**
   * Arbitrary generator for valid alert IDs
   */
  const alertIdArbitrary = fc.uuid();

  /**
   * Arbitrary generator for zone IDs (optional)
   */
  const optionalZoneIdArbitrary = fc.option(fc.uuid(), { nil: undefined });

  /**
   * Arbitrary generator for zone names (optional)
   */
  const optionalZoneNameArbitrary = fc.option(
    fc.string({ minLength: 3, maxLength: 50 }).filter(
      (s) => {
        const trimmed = s.trim();
        return trimmed.length >= 3 && /[a-zA-Z0-9]/.test(trimmed);
      }
    ),
    { nil: undefined }
  );

  /**
   * Arbitrary generator for alert types
   */
  const alertTypeArbitrary = fc.constantFrom(
    'environmental' as const,
    'security' as const,
    'predictive' as const,
    'system' as const
  );

  /**
   * Arbitrary generator for alert severity
   */
  const alertSeverityArbitrary = fc.constantFrom(
    'info' as const,
    'warning' as const,
    'critical' as const
  );

  /**
   * Arbitrary generator for alert titles
   */
  const alertTitleArbitrary = fc.string({ minLength: 10, maxLength: 100 }).filter(
    (s) => {
      const trimmed = s.trim();
      return trimmed.length >= 10 && /[a-zA-Z]/.test(trimmed);
    }
  );

  /**
   * Arbitrary generator for alert messages
   */
  const alertMessageArbitrary = fc.string({ minLength: 15, maxLength: 200 }).filter(
    (s) => {
      const trimmed = s.trim();
      return trimmed.length >= 15 && /[a-zA-Z]/.test(trimmed);
    }
  );

  /**
   * Arbitrary generator for timestamps (recent dates)
   */
  const timestampArbitrary = fc.date({
    min: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    max: new Date(),
  });

  /**
   * Arbitrary generator for a single Alert
   */
  const alertArbitrary: fc.Arbitrary<Alert> = fc.record({
    id: alertIdArbitrary,
    zoneId: optionalZoneIdArbitrary,
    zoneName: optionalZoneNameArbitrary,
    type: alertTypeArbitrary,
    severity: alertSeverityArbitrary,
    title: alertTitleArbitrary,
    message: alertMessageArbitrary,
    timestamp: timestampArbitrary,
    acknowledged: fc.constant(false), // Only unacknowledged alerts show as toasts
    metadata: fc.option(fc.dictionary(fc.string(), fc.anything()), { nil: undefined }),
  });

  /**
   * Property 15: Zone-aware alert notification display
   * For any alert triggered by the backend, the system should display
   * a notification in the UI with zone information if the alert is zone-specific
   */
  test('Property 15: all unacknowledged alerts are displayed with zone information when applicable', () => {
    fc.assert(
      fc.property(alertArbitrary, (alert: Alert) => {
        // Add alert to store
        useAlertStore.getState().addAlert(alert);

        const { container, unmount } = render(<AlertToastContainer testMode={true} />);

        try {
          // Verify the alert is displayed by checking for alert role
          const alertElements = container.querySelectorAll('[role="alert"]');
          expect(alertElements.length).toBeGreaterThan(0);

          // Verify the alert title is displayed (use getAllByText to handle multiple matches)
          const titleText = alert.title.trim();
          const titleElements = screen.getAllByText((content, element) => {
            return element?.textContent?.includes(titleText) || false;
          });
          expect(titleElements.length).toBeGreaterThan(0);

          // Verify the alert message is displayed by checking container text content
          expect(container.textContent).toContain(alert.message.trim());

          // Verify zone information is displayed if the alert is zone-specific
          if (alert.zoneName) {
            // Escape special regex characters in zone name
            const escapedZoneName = alert.zoneName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const zoneElements = screen.queryAllByText(new RegExp(escapedZoneName, 'i'));
            expect(zoneElements.length).toBeGreaterThan(0);

            // Verify the zone label is present
            const zoneLabelElements = screen.queryAllByText(/Zone:/i);
            expect(zoneLabelElements.length).toBeGreaterThan(0);
          }

          // Verify severity indicator is present
          const severityIcons = {
            critical: '💀',
            warning: '⚠️',
            info: 'ℹ️',
          };
          const severityIcon = severityIcons[alert.severity];
          const iconElements = screen.queryAllByText(severityIcon);
          expect(iconElements.length).toBeGreaterThan(0);

          return true;
        } finally {
          // Clean up
          unmount();
          // Clear store for next iteration
          useAlertStore.setState({ alerts: [], unreadCount: 0 });
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Zone-specific alerts always display zone information
   * For any alert with a zoneName, the zone information must be visible
   */
  test('Property: zone-specific alerts always display zone name', () => {
    fc.assert(
      fc.property(
        alertArbitrary.filter((alert) => alert.zoneName !== undefined),
        (alert: Alert) => {
          // Add alert to store
          useAlertStore.getState().addAlert(alert);

          const { unmount } = render(<AlertToastContainer testMode={true} />);

          try {
            // Verify zone name is displayed
            if (alert.zoneName) {
              // Escape special regex characters in zone name
              const escapedZoneName = alert.zoneName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const zoneElements = screen.queryAllByText(new RegExp(escapedZoneName, 'i'));
              expect(zoneElements.length).toBeGreaterThan(0);

              // Verify the zone label is present
              const zoneLabelElements = screen.queryAllByText(/Zone:/i);
              expect(zoneLabelElements.length).toBeGreaterThan(0);
            }

            return true;
          } finally {
            // Clean up
            unmount();
            useAlertStore.setState({ alerts: [], unreadCount: 0 });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Non-zone-specific alerts do not display zone information
   * For any alert without a zoneName, no zone information should be displayed
   */
  test('Property: non-zone-specific alerts do not display zone information', () => {
    fc.assert(
      fc.property(
        alertArbitrary.filter((alert) => !alert.zoneName),
        (alert: Alert) => {
          // Add alert to store
          useAlertStore.getState().addAlert(alert);

          const { container, unmount } = render(<AlertToastContainer testMode={true} />);

          try {
            // Verify the alert is displayed by checking for alert role
            const alertElements = container.querySelectorAll('[role="alert"]');
            expect(alertElements.length).toBeGreaterThan(0);

            // Verify no zone label is present
            const zoneLabelElements = screen.queryAllByText(/Zone:/i);
            expect(zoneLabelElements.length).toBe(0);

            return true;
          } finally {
            // Clean up
            unmount();
            useAlertStore.setState({ alerts: [], unreadCount: 0 });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Critical alerts have appropriate visual styling
   * For any critical alert, the toast should have pulse animation and blood-red styling
   */
  test('Property: critical alerts display with appropriate visual emphasis', () => {
    fc.assert(
      fc.property(
        alertArbitrary.filter((alert) => alert.severity === 'critical'),
        (alert: Alert) => {
          // Add alert to store
          useAlertStore.getState().addAlert(alert);

          const { container, unmount } = render(<AlertToastContainer testMode={true} />);

          try {
            // Verify the alert is displayed by checking for alert role
            const alertElements = container.querySelectorAll('[role="alert"]');
            expect(alertElements.length).toBeGreaterThan(0);

            // Verify critical styling is present
            const toastElement = container.querySelector('.border-blood-red');
            expect(toastElement).toBeTruthy();

            // Verify pulse animation is present for critical alerts
            const pulseElement = container.querySelector('.animate-pulse');
            expect(pulseElement).toBeTruthy();

            return true;
          } finally {
            // Clean up
            unmount();
            useAlertStore.setState({ alerts: [], unreadCount: 0 });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Multiple alerts are displayed simultaneously
   * For any set of unacknowledged alerts (up to 3), all should be displayed
   */
  test('Property: multiple unacknowledged alerts are displayed simultaneously', () => {
    fc.assert(
      fc.property(
        fc.array(alertArbitrary, { minLength: 1, maxLength: 5 }),
        (alerts: Alert[]) => {
          // Ensure unique IDs
          const uniqueAlerts = alerts.map((alert, index) => ({
            ...alert,
            id: `${alert.id}-${index}`,
          }));

          // Add all alerts to store
          uniqueAlerts.forEach((alert) => {
            useAlertStore.getState().addAlert(alert);
          });

          const { container, unmount } = render(<AlertToastContainer testMode={true} />);

          try {
            // The component shows max 3 alerts at a time
            const expectedCount = Math.min(uniqueAlerts.length, 3);
            
            // Count how many alert containers are rendered (more reliable than searching for titles)
            const alertContainers = container.querySelectorAll('[role="alert"]');
            expect(alertContainers.length).toBe(expectedCount);

            return true;
          } finally {
            // Clean up
            unmount();
            useAlertStore.setState({ alerts: [], unreadCount: 0 });
          }
        }
      ),
      { numRuns: 50 } // Fewer runs for this more complex test
    );
  });

  /**
   * Property: Alert severity determines visual styling
   * For any alert, the border color and shadow should match the severity level
   */
  test('Property: alert severity determines appropriate visual styling', () => {
    fc.assert(
      fc.property(alertArbitrary, (alert: Alert) => {
        // Add alert to store
        useAlertStore.getState().addAlert(alert);

        const { container, unmount } = render(<AlertToastContainer testMode={true} />);

        try {
          // Verify the alert is displayed by checking for alert role
          const alertElements = container.querySelectorAll('[role="alert"]');
          expect(alertElements.length).toBeGreaterThan(0);

          // Verify appropriate styling based on severity
          const severityClasses = {
            critical: 'border-blood-red',
            warning: 'border-pumpkin-orange',
            info: 'border-ghost-green',
          };

          const expectedClass = severityClasses[alert.severity];
          const styledElement = container.querySelector(`.${expectedClass}`);
          expect(styledElement).toBeTruthy();

          return true;
        } finally {
          // Clean up
          unmount();
          useAlertStore.setState({ alerts: [], unreadCount: 0 });
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Alert toast container renders without errors for any alert
   * For any valid alert, the toast container should render successfully
   */
  test('Property: toast container renders successfully for any valid alert', () => {
    fc.assert(
      fc.property(alertArbitrary, (alert: Alert) => {
        // Add alert to store
        useAlertStore.getState().addAlert(alert);

        const { container, unmount } = render(<AlertToastContainer testMode={true} />);

        try {
          // Verify the alert is displayed by checking for alert role
          const alertElements = container.querySelectorAll('[role="alert"]');
          expect(alertElements.length).toBeGreaterThan(0);

          // Verify container exists and has content
          expect(container).toBeTruthy();
          expect(container.textContent).toBeTruthy();

          return true;
        } finally {
          // Clean up
          unmount();
          useAlertStore.setState({ alerts: [], unreadCount: 0 });
        }
      }),
      { numRuns: 100 }
    );
  });
});
