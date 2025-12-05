/**
 * Tests for responsive utility functions
 */

import { renderHook, act } from '@testing-library/react';
import {
  useBreakpoint,
  useDeviceType,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useOrientation,
  getResponsiveColumns,
  getResponsiveChartHeight,
  getResponsivePadding,
  getResponsiveGap,
  BREAKPOINTS,
} from '../responsive';

// Mock window.innerWidth and window.innerHeight
const mockWindowSize = (width: number, height: number) => {
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
};

describe('Responsive Utilities', () => {
  describe('BREAKPOINTS', () => {
    it('should have correct breakpoint values', () => {
      expect(BREAKPOINTS.sm).toBe(640);
      expect(BREAKPOINTS.md).toBe(768);
      expect(BREAKPOINTS.lg).toBe(1024);
      expect(BREAKPOINTS.xl).toBe(1280);
      expect(BREAKPOINTS['2xl']).toBe(1536);
    });
  });

  describe('useBreakpoint', () => {
    it('should return sm for small screens', () => {
      mockWindowSize(500, 800);
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current).toBe('sm');
    });

    it('should return md for medium screens', () => {
      mockWindowSize(768, 1024);
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current).toBe('md');
    });

    it('should return lg for large screens', () => {
      mockWindowSize(1024, 768);
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current).toBe('lg');
    });
  });

  describe('useDeviceType', () => {
    it('should return mobile for screens < 768px', () => {
      mockWindowSize(500, 800);
      const { result } = renderHook(() => useDeviceType());
      expect(result.current).toBe('mobile');
    });

    it('should return tablet for screens 768px - 1023px', () => {
      mockWindowSize(800, 1024);
      const { result } = renderHook(() => useDeviceType());
      expect(result.current).toBe('tablet');
    });

    it('should return desktop for screens >= 1024px', () => {
      mockWindowSize(1280, 800);
      const { result } = renderHook(() => useDeviceType());
      expect(result.current).toBe('desktop');
    });
  });

  describe('useIsMobile', () => {
    it('should return true for mobile devices', () => {
      mockWindowSize(500, 800);
      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);
    });

    it('should return false for non-mobile devices', () => {
      mockWindowSize(1024, 768);
      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);
    });
  });

  describe('useIsTablet', () => {
    it('should return true for tablet devices', () => {
      mockWindowSize(800, 1024);
      const { result } = renderHook(() => useIsTablet());
      expect(result.current).toBe(true);
    });

    it('should return false for non-tablet devices', () => {
      mockWindowSize(500, 800);
      const { result } = renderHook(() => useIsTablet());
      expect(result.current).toBe(false);
    });
  });

  describe('useIsDesktop', () => {
    it('should return true for desktop devices', () => {
      mockWindowSize(1280, 800);
      const { result } = renderHook(() => useIsDesktop());
      expect(result.current).toBe(true);
    });

    it('should return false for non-desktop devices', () => {
      mockWindowSize(500, 800);
      const { result } = renderHook(() => useIsDesktop());
      expect(result.current).toBe(false);
    });
  });

  describe('useOrientation', () => {
    it('should return portrait when height > width', () => {
      mockWindowSize(500, 800);
      const { result } = renderHook(() => useOrientation());
      expect(result.current).toBe('portrait');
    });

    it('should return landscape when width > height', () => {
      mockWindowSize(800, 500);
      const { result } = renderHook(() => useOrientation());
      expect(result.current).toBe('landscape');
    });
  });

  describe('getResponsiveColumns', () => {
    it('should return 1 column for mobile', () => {
      expect(getResponsiveColumns('mobile')).toBe(1);
    });

    it('should return 2 columns for tablet', () => {
      expect(getResponsiveColumns('tablet')).toBe(2);
    });

    it('should return 3 columns for desktop', () => {
      expect(getResponsiveColumns('desktop')).toBe(3);
    });
  });

  describe('getResponsiveChartHeight', () => {
    it('should return 250 for mobile', () => {
      expect(getResponsiveChartHeight('mobile')).toBe(250);
    });

    it('should return 350 for tablet', () => {
      expect(getResponsiveChartHeight('tablet')).toBe(350);
    });

    it('should return 400 for desktop', () => {
      expect(getResponsiveChartHeight('desktop')).toBe(400);
    });
  });

  describe('getResponsivePadding', () => {
    it('should return p-4 for mobile', () => {
      expect(getResponsivePadding('mobile')).toBe('p-4');
    });

    it('should return p-6 for tablet', () => {
      expect(getResponsivePadding('tablet')).toBe('p-6');
    });

    it('should return p-8 for desktop', () => {
      expect(getResponsivePadding('desktop')).toBe('p-8');
    });
  });

  describe('getResponsiveGap', () => {
    it('should return gap-4 for mobile', () => {
      expect(getResponsiveGap('mobile')).toBe('gap-4');
    });

    it('should return gap-5 for tablet', () => {
      expect(getResponsiveGap('tablet')).toBe('gap-5');
    });

    it('should return gap-6 for desktop', () => {
      expect(getResponsiveGap('desktop')).toBe('gap-6');
    });
  });
});
