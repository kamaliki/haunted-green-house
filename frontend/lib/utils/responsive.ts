/**
 * Responsive utility functions and hooks
 * Provides utilities for handling responsive design across different screen sizes
 */

import { useEffect, useState } from 'react';

/**
 * Breakpoint definitions matching Tailwind's default breakpoints
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Device type based on screen width
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Hook to detect current breakpoint
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('lg');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      if (width >= BREAKPOINTS['2xl']) {
        setBreakpoint('2xl');
      } else if (width >= BREAKPOINTS.xl) {
        setBreakpoint('xl');
      } else if (width >= BREAKPOINTS.lg) {
        setBreakpoint('lg');
      } else if (width >= BREAKPOINTS.md) {
        setBreakpoint('md');
      } else if (width >= BREAKPOINTS.sm) {
        setBreakpoint('sm');
      } else {
        setBreakpoint('sm');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}

/**
 * Hook to detect device type
 */
export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      if (width < BREAKPOINTS.md) {
        setDeviceType('mobile');
      } else if (width < BREAKPOINTS.lg) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceType;
}

/**
 * Hook to detect if device is mobile
 */
export function useIsMobile(): boolean {
  const deviceType = useDeviceType();
  return deviceType === 'mobile';
}

/**
 * Hook to detect if device is tablet
 */
export function useIsTablet(): boolean {
  const deviceType = useDeviceType();
  return deviceType === 'tablet';
}

/**
 * Hook to detect if device is desktop
 */
export function useIsDesktop(): boolean {
  const deviceType = useDeviceType();
  return deviceType === 'desktop';
}

/**
 * Hook to detect screen orientation
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };

    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return orientation;
}

/**
 * Hook to detect touch support
 */
export function useHasTouch(): boolean {
  const [hasTouch, setHasTouch] = useState(false);

  useEffect(() => {
    setHasTouch(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    );
  }, []);

  return hasTouch;
}

/**
 * Get responsive grid columns based on device type
 */
export function getResponsiveColumns(deviceType: DeviceType): number {
  switch (deviceType) {
    case 'mobile':
      return 1;
    case 'tablet':
      return 2;
    case 'desktop':
      return 3;
    default:
      return 3;
  }
}

/**
 * Get responsive chart height based on device type
 */
export function getResponsiveChartHeight(deviceType: DeviceType): number {
  switch (deviceType) {
    case 'mobile':
      return 250;
    case 'tablet':
      return 350;
    case 'desktop':
      return 400;
    default:
      return 400;
  }
}

/**
 * Get responsive padding based on device type
 */
export function getResponsivePadding(deviceType: DeviceType): string {
  switch (deviceType) {
    case 'mobile':
      return 'p-4';
    case 'tablet':
      return 'p-6';
    case 'desktop':
      return 'p-8';
    default:
      return 'p-6';
  }
}

/**
 * Get responsive gap based on device type
 */
export function getResponsiveGap(deviceType: DeviceType): string {
  switch (deviceType) {
    case 'mobile':
      return 'gap-4';
    case 'tablet':
      return 'gap-5';
    case 'desktop':
      return 'gap-6';
    default:
      return 'gap-6';
  }
}
