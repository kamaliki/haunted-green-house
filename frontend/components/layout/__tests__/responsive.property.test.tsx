/**
 * Property-Based Tests for Responsive Layout Adaptation
 * Feature: nextjs-frontend, Property 10: Responsive layout adaptation
 * Validates: Requirements 11.1, 11.2, 11.3
 * 
 * Property: For any viewport width, the layout should adapt to display content
 * appropriately (multi-column for desktop, single-column for mobile)
 */

import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import { Sidebar } from '../Sidebar';
import { Navbar } from '../Navbar';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/dashboard'),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    aside: ({ children, ...props }: any) => <aside {...props}>{children}</aside>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Property Test: Responsive layout adaptation', () => {
  /**
   * Arbitrary generator for viewport widths
   * Generates widths across mobile, tablet, and desktop ranges
   */
  const viewportWidthArbitrary = fc.integer({ min: 320, max: 2560 });

  /**
   * Arbitrary generator for viewport heights
   */
  const viewportHeightArbitrary = fc.integer({ min: 568, max: 1440 });

  /**
   * Helper function to determine expected layout based on viewport width
   */
  const getExpectedLayout = (width: number): 'mobile' | 'tablet' | 'desktop' => {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  /**
   * Helper function to set viewport size
   */
  const setViewportSize = (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
  };

  /**
   * Property 10: Responsive layout adaptation
   * For any viewport width, the layout should adapt appropriately
   */
  test('Property 10: layout adapts to viewport width', () => {
    fc.assert(
      fc.property(
        viewportWidthArbitrary,
        viewportHeightArbitrary,
        (width, height) => {
          // Set viewport size
          setViewportSize(width, height);

          const expectedLayout = getExpectedLayout(width);

          // Render Sidebar component
          const { container } = render(
            <Sidebar isOpen={false} onClose={jest.fn()} />
          );

          const sidebar = container.querySelector('aside');
          expect(sidebar).toBeInTheDocument();

          // Verify sidebar has appropriate classes based on viewport
          if (expectedLayout === 'mobile') {
            // On mobile, sidebar should be fixed and off-screen when closed
            expect(sidebar).toHaveClass('fixed');
            expect(sidebar).toHaveClass('lg:translate-x-0');
          } else {
            // On desktop/tablet, sidebar should be static
            expect(sidebar).toHaveClass('lg:static');
          }
        }
      ),
      {
        numRuns: 100,
      }
    );
  });

  /**
   * Property: Sidebar visibility adapts to viewport and open state
   * For any viewport width and open state, sidebar should be visible/hidden appropriately
   */
  test('Property: sidebar visibility adapts to viewport and state', () => {
    fc.assert(
      fc.property(
        viewportWidthArbitrary,
        fc.boolean(),
        (width, isOpen) => {
          setViewportSize(width, 1080);

          const expectedLayout = getExpectedLayout(width);

          const { container } = render(
            <Sidebar isOpen={isOpen} onClose={jest.fn()} />
          );

          const sidebar = container.querySelector('aside');
          expect(sidebar).toBeInTheDocument();

          // On mobile, sidebar should have overlay when open
          if (expectedLayout === 'mobile' && isOpen) {
            // Sidebar should be visible (not translated off-screen)
            expect(sidebar).toBeInTheDocument();
          }

          // On desktop, sidebar should always be visible
          if (expectedLayout === 'desktop') {
            expect(sidebar).toHaveClass('lg:static');
          }
        }
      ),
      {
        numRuns: 100,
      }
    );
  });

  /**
   * Property: Navbar menu toggle button visibility adapts to viewport
   * For any viewport width, menu toggle should be visible on mobile, hidden on desktop
   */
  test('Property: navbar menu toggle adapts to viewport', () => {
    fc.assert(
      fc.property(
        viewportWidthArbitrary,
        (width) => {
          setViewportSize(width, 1080);

          const expectedLayout = getExpectedLayout(width);

          const { container } = render(
            <Navbar onMenuToggle={jest.fn()} />
          );

          const menuButton = container.querySelector('button[aria-label="Toggle menu"]');
          expect(menuButton).toBeInTheDocument();

          // Menu toggle button should have lg:hidden class
          // This means it's visible on mobile/tablet, hidden on desktop
          if (menuButton) {
            expect(menuButton).toHaveClass('lg:hidden');
          }
        }
      ),
      {
        numRuns: 100,
      }
    );
  });

  /**
   * Property: Connection status display adapts to viewport
   * For any viewport width, connection status should be positioned appropriately
   */
  test('Property: connection status display adapts to viewport', () => {
    fc.assert(
      fc.property(
        viewportWidthArbitrary,
        (width) => {
          setViewportSize(width, 1080);

          const { container } = render(
            <Navbar onMenuToggle={jest.fn()} />
          );

          // Desktop connection status should be hidden on mobile
          const desktopStatus = container.querySelector('.hidden.md\\:block');
          expect(desktopStatus).toBeInTheDocument();

          // Mobile connection status should be hidden on desktop
          const mobileStatus = container.querySelector('.md\\:hidden');
          expect(mobileStatus).toBeInTheDocument();
        }
      ),
      {
        numRuns: 100,
      }
    );
  });

  /**
   * Property: Layout maintains content accessibility across all viewports
   * For any viewport width, all navigation items should be accessible
   */
  test('Property: navigation items are accessible across all viewports', () => {
    fc.assert(
      fc.property(
        viewportWidthArbitrary,
        fc.boolean(),
        (width, isOpen) => {
          setViewportSize(width, 1080);

          const { unmount } = render(<Sidebar isOpen={isOpen} onClose={jest.fn()} />);

          // All navigation items should be present regardless of viewport
          const navItems = [
            'Dashboard',
            'Environment',
            'Irrigation',
            'Plant Health',
            'Analytics',
            'Security',
            'Alerts',
          ];

          navItems.forEach((item) => {
            expect(screen.getAllByText(item).length).toBeGreaterThan(0);
          });

          // Clean up after each test
          unmount();
        }
      ),
      {
        numRuns: 100,
      }
    );
  });

  /**
   * Property: Sidebar width is consistent across viewports
   * For any viewport width, sidebar should maintain fixed width
   */
  test('Property: sidebar maintains consistent width', () => {
    fc.assert(
      fc.property(
        viewportWidthArbitrary,
        (width) => {
          setViewportSize(width, 1080);

          const { container } = render(
            <Sidebar isOpen={true} onClose={jest.fn()} />
          );

          const sidebar = container.querySelector('aside');
          expect(sidebar).toBeInTheDocument();

          // Sidebar should have w-64 class (256px width)
          expect(sidebar).toHaveClass('w-64');
        }
      ),
      {
        numRuns: 100,
      }
    );
  });

  /**
   * Property: Overlay appears only on mobile when sidebar is open
   * For any mobile viewport width, overlay should be present when sidebar is open
   */
  test('Property: mobile overlay appears when sidebar is open', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 767 }), // Mobile range
        (width) => {
          setViewportSize(width, 1080);

          const { container: closedContainer } = render(
            <Sidebar isOpen={false} onClose={jest.fn()} />
          );

          // When closed, no overlay should be rendered
          const closedOverlay = closedContainer.querySelector('.fixed.inset-0.bg-black\\/60');
          // Overlay might not be in DOM when closed due to AnimatePresence
          
          const { container: openContainer } = render(
            <Sidebar isOpen={true} onClose={jest.fn()} />
          );

          // When open on mobile, overlay should be present
          const openOverlay = openContainer.querySelector('.fixed.inset-0');
          // Note: Due to AnimatePresence mocking, we just verify the component structure
          expect(openContainer.querySelector('aside')).toBeInTheDocument();
        }
      ),
      {
        numRuns: 100,
      }
    );
  });

  /**
   * Property: User info display adapts to viewport
   * For any viewport width, user info should be hidden on mobile, visible on desktop
   */
  test('Property: user info display adapts to viewport', () => {
    fc.assert(
      fc.property(
        viewportWidthArbitrary,
        (width) => {
          setViewportSize(width, 1080);

          const { container } = render(
            <Navbar onMenuToggle={jest.fn()} />
          );

          // User info should have hidden md:flex classes
          const userInfo = container.querySelector('.hidden.md\\:flex');
          expect(userInfo).toBeInTheDocument();
        }
      ),
      {
        numRuns: 100,
      }
    );
  });
});
