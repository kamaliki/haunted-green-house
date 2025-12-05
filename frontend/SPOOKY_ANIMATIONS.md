# Spooky Visual Effects and Animations

This document describes all the spooky visual effects and animations implemented in the Haunted Greenhouse frontend.

## Overview

The application features a comprehensive set of spooky, retro-game-inspired animations and visual effects that enhance the "Haunted Greenhouse" theme while maintaining excellent usability.

## Core Animations

### 1. Fog Overlay Animation
**Location**: `globals.css` - `@keyframes fog`
**Usage**: Applied to card backgrounds
**Effect**: Subtle animated fog that drifts across backgrounds
```css
animation: fog 8s ease-in-out infinite;
```

### 2. Floating Animation
**Location**: `globals.css` - `@keyframes float`
**Usage**: Cards, zone cards, sensor cards
**Effect**: Gentle up-and-down floating motion (ghostly hover effect)
```css
animation: float 3s ease-in-out infinite;
```

### 3. Pulse Glow Animation
**Location**: `globals.css` - `@keyframes pulse-glow`
**Usage**: Alert badges, critical warnings
**Effect**: Pulsing glow effect that intensifies and fades
```css
animation: pulse-glow 2s ease-in-out infinite;
```

### 4. Flicker Animation
**Location**: `globals.css` - `@keyframes flicker`
**Usage**: Standard warnings
**Effect**: Subtle flickering opacity effect
```css
animation: flicker 0.5s ease-in-out infinite;
```

### 5. Intense Flicker Animation
**Location**: `globals.css` - `@keyframes flicker-intense`
**Usage**: Critical warnings, critical sensor readings
**Effect**: Dramatic flickering with brightness changes
```css
animation: flicker-intense 0.3s ease-in-out infinite;
```

## Loading Animations

### 6. Spinning Ghost
**Location**: `globals.css` - `@keyframes spin-ghost`
**Component**: `LoadingSpinner` (type="ghost")
**Effect**: Ghost emoji spins and scales
```tsx
<LoadingSpinner type="ghost" size="lg" />
```

### 7. Floating Skull
**Location**: `globals.css` - `@keyframes float-skull`
**Component**: `LoadingSpinner` (type="skull")
**Effect**: Skull floats and rotates gently
```tsx
<LoadingSpinner type="skull" size="md" />
```

## Background Effects

### 8. Ghost Particles
**Location**: `components/ui/SpookyEffects.tsx`
**Component**: `GhostParticles`
**Effect**: Floating ghost emojis drift up from bottom to top
**Usage**:
```tsx
<GhostParticles count={5} />
```
**Implementation**: Added to root layout for global effect

### 9. Cobweb Decorations
**Location**: `components/ui/SpookyEffects.tsx`
**Component**: `CobwebDecorations`
**Effect**: Swaying cobwebs in corners
**Usage**:
```tsx
<CobwebDecorations corners={['top-right', 'top-left']} size="md" />
```
**Animation**: `animate-cobweb-sway` - gentle swaying motion

## Page Transitions

### 10. Slide In/Out Transitions
**Location**: `components/ui/PageTransitionWrapper.tsx`
**Components**: 
- `PageTransitionWrapper` - Slide from right
- `FadeTransitionWrapper` - Simple fade
- `ZoneTransitionWrapper` - Scale + slide for zone pages

**Effect**: Smooth page transitions when navigating
**Usage**:
```tsx
<PageTransitionWrapper>
  {children}
</PageTransitionWrapper>
```

### 11. Dashboard Layout Transitions
**Location**: `app/(dashboard)/layout.tsx`
**Effect**: Fade and slide animations using Framer Motion
**Implementation**: Automatic for all dashboard pages

## Interactive Effects

### 12. Hover Glow Effects
**Location**: Multiple components
**Effect**: Intense glow on hover for cards and buttons
**Classes**:
- `hover:shadow-glow-intense` - Maximum glow
- `hover:shadow-glow-green` - Green glow
- `hover:shadow-glow-purple` - Purple glow
- `hover:shadow-glow-red` - Red glow

**Applied to**:
- Zone cards
- Sensor cards
- Buttons
- Interactive elements

### 13. Scale on Hover
**Effect**: Cards scale up slightly on hover
**Implementation**: Framer Motion `whileHover={{ scale: 1.05 }}`
**Applied to**:
- Zone cards
- Sensor cards

### 14. Tap Animation
**Effect**: Cards scale down slightly on click
**Implementation**: Framer Motion `whileTap={{ scale: 0.98 }}`
**Applied to**:
- Zone cards (clickable)

## Alert Animations

### 15. Alert Badge Pulse
**Location**: `components/zones/ZoneCard.tsx`
**Effect**: Alert badges pulse and scale
**Animation**: Combined `animate-pulse-glow` + Framer Motion scale
**Usage**: Automatically applied when `activeAlerts > 0`

### 16. Critical Alert Flicker
**Location**: `components/ui/AlertToast.tsx`
**Effect**: Critical alerts flicker intensely
**Classes**: `animate-pulse-glow animate-flicker-intense`
**Usage**: Automatically applied for severity="critical"

### 17. Alert Toast Slide
**Location**: `components/ui/AlertToast.tsx`
**Effect**: Toasts slide in from right, slide out to right
**Implementation**: CSS transitions with translate-x

## Decorative Effects

### 18. Dripping Slime
**Location**: `components/ui/SpookyEffects.tsx`
**Component**: `DrippingSlime`
**Effect**: Animated dripping effect
**Usage**:
```tsx
<DrippingSlime color="green" count={3} />
```

### 19. Scanlines
**Location**: `globals.css`
**Effect**: CRT monitor scanline effect
**Usage**: Applied to body with class `scanlines`
**Implementation**: Repeating linear gradient overlay

## Component-Specific Animations

### Zone Cards
- Fog overlay (animated)
- Floating on hover
- Intense glow on hover
- Cobweb sway decoration
- Alert badge pulse (when alerts present)
- Health status bar animation
- Scale on hover/tap

### Sensor Cards
- Fog overlay (animated)
- Floating on hover
- Intense glow on hover
- Cobweb sway decoration
- Critical flicker (when threshold exceeded)
- Value change animation
- Progress bar animation

### Loading States
- Spinning ghost
- Floating skull
- Skeleton pulse animations

### Alerts
- Pulse glow (warnings)
- Intense flicker (critical)
- Slide in/out transitions

## Utility Classes

### Animation Classes
```css
.animate-float          /* Floating motion */
.animate-fog            /* Fog drift */
.animate-pulse-glow     /* Pulsing glow */
.animate-flicker        /* Subtle flicker */
.animate-flicker-intense /* Intense flicker */
.animate-spin-ghost     /* Spinning ghost */
.animate-float-skull    /* Floating skull */
.animate-ghost-particle /* Ghost particle float */
.animate-drip           /* Dripping effect */
.animate-cobweb-sway    /* Cobweb sway */
.animate-slide-in-right /* Slide from right */
.animate-slide-out-left /* Slide to left */
```

### Glow Classes
```css
.shadow-glow-green      /* Green glow */
.shadow-glow-purple     /* Purple glow */
.shadow-glow-red        /* Red glow */
.shadow-glow-intense    /* Maximum glow */
```

### Delay Classes
```css
.delay-100  /* 100ms delay */
.delay-200  /* 200ms delay */
.delay-300  /* 300ms delay */
.delay-500  /* 500ms delay */
```

## Performance Considerations

1. **GPU Acceleration**: All animations use transform and opacity for optimal performance
2. **Reduced Motion**: Consider adding `prefers-reduced-motion` media queries for accessibility
3. **Particle Count**: Ghost particles limited to 5 by default to avoid performance issues
4. **Animation Timing**: Animations use reasonable durations (2-8s) to avoid being distracting

## Customization

### Adjusting Animation Speed
Edit the animation duration in `globals.css`:
```css
@keyframes float {
  /* Change 3s to desired duration */
  animation: float 3s ease-in-out infinite;
}
```

### Changing Colors
Edit CSS variables in `globals.css`:
```css
:root {
  --ghost-green: #39ff14;
  --toxic-purple: #9d4edd;
  --blood-red: #ff006e;
  /* etc. */
}
```

### Disabling Effects
Remove or comment out specific animations:
```tsx
// Disable ghost particles
// <GhostParticles count={5} />

// Disable fog overlay
<Card fogOverlay={false}>
```

## Browser Compatibility

All animations use standard CSS and are compatible with:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Fallbacks are provided for older browsers (animations simply won't play).

## Accessibility

- Animations don't interfere with screen readers
- All interactive elements maintain proper focus states
- Consider adding `prefers-reduced-motion` support for users sensitive to motion

## Future Enhancements

Potential additions:
- Sound effects (optional)
- More particle types (bats, spiders)
- Seasonal variations (different themes)
- Custom cursor animations
- More complex particle systems
