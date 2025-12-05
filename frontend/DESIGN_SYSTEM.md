# Haunted Greenhouse Design System

## Overview

This design system implements a spooky retro game aesthetic with haunted/Halloween themes for the Haunted Greenhouse web application. It combines pixel art elements, vibrant neon colors, and smooth modern animations.

## Color Palette

### Primary Colors - Spooky Theme
- **Ghost Green** (`#39ff14`) - Neon ghost green for primary actions and highlights
- **Toxic Purple** (`#9d4edd`) - Toxic/poison purple for secondary elements
- **Blood Red** (`#ff006e`) - Blood red accent for alerts and warnings
- **Pumpkin Orange** (`#fb5607`) - Halloween orange for special highlights
- **Bone White** (`#f8f9fa`) - Bone white for primary text
- **Slime Green** (`#06ffa5`) - Radioactive slime for hover states

### Background Colors - Dark and Moody
- **BG Darkest** (`#0a0a0f`) - Almost black for main background
- **BG Dark** (`#1a1a2e`) - Deep purple-black for cards
- **BG Medium** (`#2d1b4e`) - Dark purple for gradients
- **BG Fog** (`rgba(157, 78, 221, 0.1)`) - Foggy overlay

### Text Colors
- **Text Primary** (`#f8f9fa`) - Bone white for main text
- **Text Secondary** (`#adb5bd`) - Ghostly gray for secondary text
- **Text Glow** (`#39ff14`) - Glowing green for emphasized text

## Typography

### Font Families
- **Creepster** - Spooky headings and titles
- **VT323** - Retro game text for metrics and values
- **Press Start 2P** - Pixel-style text for labels
- **Courier Prime** - Readable body text

### Usage
```tsx
<h1 className="font-creepster">Haunted Title</h1>
<p className="font-vt323">Retro Value: 42</p>
<span className="font-press-start">LABEL</span>
<p className="font-courier">Body text content</p>
```

## Animations

### Float Animation
Creates a gentle floating/hovering effect (3s infinite)
```tsx
<div className="animate-float">👻</div>
```

### Fog Animation
Subtle fog/mist effect with opacity and movement (8s infinite)
```tsx
<div className="fog-overlay">Content</div>
```

### Pulse Glow Animation
Pulsing glow effect for emphasis (2s infinite)
```tsx
<div className="animate-pulse-glow">Glowing element</div>
```

### Flicker Animation
Flickering effect for critical warnings (0.5s infinite)
```tsx
<div className="animate-flicker">⚠️ Warning</div>
```

### Ghost Trail Animation
Brief ghost trail effect on hover (0.5s)
```tsx
<button className="hover:animate-ghost-trail">Button</button>
```

## Utility Classes

### Text Effects
- `text-glow` - Basic text glow effect
- `text-glow-intense` - Intense text glow with double shadow

### Border Effects
- `border-glow` - Basic border glow
- `border-glow-intense` - Intense border glow with multiple shadows

### Box Shadow Effects
- `glow-green` - Green glow shadow
- `glow-purple` - Purple glow shadow
- `glow-red` - Red glow shadow
- `shadow-glow-green` - Tailwind utility for green glow
- `shadow-glow-purple` - Tailwind utility for purple glow
- `shadow-glow-intense` - Intense multi-color glow

### Pixel Borders
- `pixel-border-sm` - 2px solid border
- `pixel-border-md` - 4px solid border
- `pixel-border-lg` - 6px solid border
- `pixel-border-glow` - 4px border with glow effect

### Special Effects
- `pixel-corners` - Pixelated corner clipping
- `ghost-cursor` - Custom ghost emoji cursor
- `scanlines` - CRT monitor scanline effect

## Component Classes

### Retro Button
Pre-styled button with spooky effects
```tsx
<button className="retro-button">
  Click Me
</button>
```

Features:
- Ghost green border with glow
- Hover scale and color change
- Active press effect
- Pixel corners

### Retro Card
Pre-styled card with gradient and effects
```tsx
<div className="retro-card">
  Card content
</div>
```

Features:
- Gradient background (dark to medium)
- Toxic purple border with glow
- Hover float animation
- Rounded corners

### Retro Input
Pre-styled input field
```tsx
<input className="retro-input" type="text" />
```

Features:
- Dark background
- Ghost green border
- Focus state with slime green
- Glow effect on focus

## Example Usage

### Sensor Card
```tsx
<div className="retro-card fog-overlay">
  <div className="text-3xl mb-2">🌡️</div>
  <h3 className="font-press-start text-xs text-ghost-green mb-2">
    Temperature
  </h3>
  <p className="font-vt323 text-2xl text-bone-white">
    24.5°C
  </p>
</div>
```

### Alert Button
```tsx
<button className="px-6 py-3 bg-bg-dark text-blood-red font-bold border-4 border-blood-red pixel-border-glow transition-all duration-200 hover:scale-105 hover:text-pumpkin-orange animate-flicker">
  ⚠️ Critical Alert
</button>
```

### Floating Icons
```tsx
<div className="flex gap-4">
  <div className="animate-float">👻</div>
  <div className="animate-float" style={{ animationDelay: '0.5s' }}>🎃</div>
  <div className="animate-float" style={{ animationDelay: '1s' }}>🦇</div>
</div>
```

### Glowing Text
```tsx
<h1 className="text-4xl font-creepster text-ghost-green text-glow-intense">
  Haunted Greenhouse
</h1>
```

## Responsive Design

All components are designed to be responsive:
- Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`)
- Cards stack on mobile, grid on desktop
- Text sizes adjust with viewport
- Padding and spacing scale appropriately

Example:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

## Accessibility

- Maintain sufficient color contrast
- Use semantic HTML elements
- Provide text alternatives for icons
- Ensure keyboard navigation works
- Test with screen readers

## Performance

- CSS animations use GPU-accelerated properties (transform, opacity)
- Animations can be disabled with `prefers-reduced-motion`
- Fonts are loaded with `display=swap` for better performance
- Use `will-change` sparingly for complex animations

## Custom Cursor (Optional)

Apply the ghost cursor to any element:
```tsx
<div className="ghost-cursor">
  Content with ghost cursor
</div>
```

## Background Effects

### Gradient Background
```tsx
<div className="bg-gradient-spooky">
  Content
</div>
```

### Scanlines
Applied to body in layout.tsx:
```tsx
<body className="scanlines">
  {children}
</body>
```

## CSS Variables

All colors are available as CSS variables:
```css
var(--ghost-green)
var(--toxic-purple)
var(--blood-red)
var(--pumpkin-orange)
var(--bone-white)
var(--slime-green)
var(--bg-darkest)
var(--bg-dark)
var(--bg-medium)
var(--text-primary)
var(--text-secondary)
var(--border-color)
var(--border-glow)
var(--shadow-spooky)
```

## Best Practices

1. **Consistency**: Use the pre-defined component classes when possible
2. **Hierarchy**: Use different font families to establish visual hierarchy
3. **Spacing**: Maintain consistent spacing using Tailwind's spacing scale
4. **Animation**: Don't overuse animations - use them for emphasis
5. **Colors**: Stick to the defined color palette for brand consistency
6. **Accessibility**: Always test with keyboard navigation and screen readers
7. **Performance**: Monitor animation performance on lower-end devices

## Future Enhancements

- Sound effects for interactions (optional)
- More pixel art icons
- Additional animation variants
- Dark/light mode toggle (keeping spooky theme)
- Custom loading spinners (spinning ghost, floating skull)
- Particle effects system
