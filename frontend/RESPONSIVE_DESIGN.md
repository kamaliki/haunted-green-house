# Responsive Design Implementation

## Overview
This document describes the responsive design optimizations implemented for the Haunted Greenhouse frontend application.

## Breakpoints
The application uses Tailwind CSS default breakpoints with an additional `xs` breakpoint:

- **xs**: 475px (extra small devices)
- **sm**: 640px (small devices, phones in landscape)
- **md**: 768px (tablets)
- **lg**: 1024px (laptops, small desktops)
- **xl**: 1280px (desktops)
- **2xl**: 1536px (large desktops)

## Device Types
The application categorizes devices into three types:
- **Mobile**: < 768px (md breakpoint)
- **Tablet**: 768px - 1023px (md to lg)
- **Desktop**: >= 1024px (lg and above)

## Responsive Features

### 1. Layout Adaptations

#### Mobile (< 768px)
- **Single column layout** for all grids (zones, sensors)
- **Collapsible sidebar** with overlay
- **Bottom navigation bar** for quick access to main sections
- **Reduced padding**: p-4
- **Smaller gaps**: gap-4
- **Stacked header elements**
- **Hidden desktop footer** (replaced with mobile nav)

#### Tablet (768px - 1023px)
- **Two column layout** for grids
- **Collapsible sidebar** with overlay
- **Medium padding**: p-6
- **Medium gaps**: gap-5
- **Flexible header layout**

#### Desktop (>= 1024px)
- **Multi-column layout** (3-4 columns for grids)
- **Always visible sidebar**
- **Maximum padding**: p-8
- **Larger gaps**: gap-6
- **Horizontal header layout**
- **Visible footer**

### 2. Touch Gesture Support

#### Swipe Gestures
- **Swipe right**: Open sidebar (mobile only)
- **Swipe left**: Close sidebar (mobile only)
- **Minimum swipe distance**: 75px

#### Touch-Friendly Elements
- All interactive elements have `touch-manipulation` class
- Tap highlight color removed for cleaner UX
- Larger touch targets on mobile
- `whileTap` animations for tactile feedback

### 3. Chart Optimizations

#### Responsive Chart Heights
- **Mobile**: 250px
- **Tablet**: 350px
- **Desktop**: 400px

#### Chart Adaptations
- **Mobile**: 
  - Smaller font sizes (10px)
  - Angled X-axis labels (-45°)
  - Reduced stroke width (2px)
  - Smaller active dots (4px radius)
  - Narrower Y-axis (40px)
- **Desktop**:
  - Standard font sizes (14px)
  - Horizontal X-axis labels
  - Standard stroke width (3px)
  - Standard active dots (6px radius)
  - Standard Y-axis (60px)

### 4. Typography Scaling

#### Headings
- Mobile: text-2xl (1.5rem)
- Tablet: text-3xl (1.875rem)
- Desktop: text-4xl (2.25rem)

#### Body Text
- Mobile: text-base (1rem)
- Tablet: text-lg (1.125rem)
- Desktop: text-lg (1.125rem)

#### Small Text
- Mobile: text-xs (0.75rem)
- Desktop: text-sm (0.875rem)

### 5. Component-Specific Optimizations

#### Sidebar
- **Mobile/Tablet**: Fixed overlay, full height, swipe to open/close
- **Desktop**: Static, always visible
- **Width**: 
  - Mobile: 256px (w-64)
  - Tablet: 288px (w-72) to 320px (w-80)
  - Desktop: 256px (w-64)

#### Navigation
- **Mobile**: Bottom navigation bar with 4 main sections
- **Desktop**: Full sidebar with all navigation items

#### Cards (Zone & Sensor)
- Responsive padding: p-4 (mobile) → p-5 (tablet) → p-6 (desktop)
- Responsive gaps: gap-3 (mobile) → gap-4 (tablet) → gap-6 (desktop)
- Responsive text sizes
- Touch-friendly tap targets

#### Grids
- **Zone Grid**:
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3 columns
  - Large Desktop: 4 columns
- **Sensor Grid**:
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3 columns

### 6. Orientation Handling

The application detects and adapts to device orientation changes:
- Portrait vs. Landscape detection
- Automatic layout adjustments on rotation
- Maintained state across orientation changes

### 7. Performance Optimizations

#### Mobile-Specific
- Smooth scrolling with `-webkit-overflow-scrolling: touch`
- Reduced animation complexity on mobile
- Optimized chart rendering
- Lazy loading for below-the-fold content

#### Touch Performance
- `touch-action: manipulation` to prevent double-tap zoom
- Removed tap highlight colors
- Optimized touch event handlers

## Utility Hooks

### useDeviceType()
Returns current device type: 'mobile' | 'tablet' | 'desktop'

### useBreakpoint()
Returns current breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl'

### useIsMobile()
Returns boolean indicating if device is mobile

### useIsTablet()
Returns boolean indicating if device is tablet

### useIsDesktop()
Returns boolean indicating if device is desktop

### useOrientation()
Returns current orientation: 'portrait' | 'landscape'

### useHasTouch()
Returns boolean indicating if device supports touch

### useSwipeGesture(options)
Provides swipe gesture detection with callbacks for all directions

## Testing Recommendations

### Manual Testing
1. Test on actual devices (phone, tablet, desktop)
2. Test in Chrome DevTools device emulation
3. Test orientation changes
4. Test touch gestures on touch-enabled devices
5. Test with different screen sizes

### Breakpoint Testing
- Test at each breakpoint boundary (640px, 768px, 1024px, 1280px)
- Test slightly above and below each breakpoint
- Verify layout transitions are smooth

### Touch Testing
- Verify swipe gestures work correctly
- Ensure all buttons are easily tappable
- Check that touch targets are at least 44x44px
- Test multi-touch scenarios

### Performance Testing
- Check scroll performance on mobile
- Verify animations are smooth
- Test with throttled CPU (mobile simulation)
- Monitor memory usage on mobile devices

## Browser Support

### Desktop
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile
- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+
- Firefox Mobile 88+

## Accessibility

### Touch Accessibility
- All interactive elements are keyboard accessible
- Touch targets meet WCAG 2.1 AA standards (44x44px minimum)
- Focus indicators visible on all interactive elements
- ARIA labels on navigation elements

### Screen Reader Support
- Proper semantic HTML
- ARIA labels for icon-only buttons
- Role attributes for interactive elements
- Descriptive alt text for images

## Future Enhancements

1. **Pinch-to-zoom** for charts on mobile
2. **Pull-to-refresh** for data updates
3. **Haptic feedback** for touch interactions
4. **Progressive Web App** features
5. **Offline mode** with service workers
6. **Adaptive loading** based on network speed
7. **Dark mode** toggle (already dark, but could add light mode)
8. **Font size preferences** for accessibility
