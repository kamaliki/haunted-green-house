'use client';

import { useEffect, useState } from 'react';

/**
 * Ghost Particle Effect
 * Floating ghost particles in the background
 */
export function GhostParticles({ count = 5 }: { count?: number }) {
  const [particles, setParticles] = useState<Array<{ id: number; left: string; delay: string; drift: string }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 8}s`,
      drift: `${(Math.random() - 0.5) * 100}px`,
    }));
    setParticles(newParticles);
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute text-4xl opacity-20 animate-ghost-particle"
          style={{
            left: particle.left,
            animationDelay: particle.delay,
            // @ts-ignore - CSS custom property
            '--drift': particle.drift,
          }}
        >
          👻
        </div>
      ))}
    </div>
  );
}

/**
 * Cobweb Decorations
 * Adds cobwebs to corners of containers
 */
interface CobwebDecorationsProps {
  corners?: ('top-left' | 'top-right' | 'bottom-left' | 'bottom-right')[];
  size?: 'sm' | 'md' | 'lg';
}

export function CobwebDecorations({ 
  corners = ['top-right'], 
  size = 'md' 
}: CobwebDecorationsProps) {
  const sizeMap = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const positionMap = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
  };

  return (
    <>
      {corners.map((corner) => (
        <div
          key={corner}
          className={`absolute ${positionMap[corner]} ${sizeMap[size]} opacity-30 pointer-events-none animate-cobweb-sway`}
        >
          🕸️
        </div>
      ))}
    </>
  );
}

/**
 * Fog Overlay
 * Animated fog effect for backgrounds
 */
export function FogOverlay({ opacity = 0.1 }: { opacity?: number }) {
  return (
    <div 
      className="absolute inset-0 bg-bg-fog animate-fog pointer-events-none"
      style={{ opacity }}
    />
  );
}

/**
 * Dripping Slime Effect
 * Animated dripping effect for progress bars or decorations
 */
interface DrippingSlimeProps {
  color?: 'green' | 'purple' | 'red';
  count?: number;
}

export function DrippingSlime({ color = 'green', count = 3 }: DrippingSlimeProps) {
  const colorMap = {
    green: 'text-slime-green',
    purple: 'text-toxic-purple',
    red: 'text-blood-red',
  };

  return (
    <div className="absolute top-0 left-0 right-0 flex justify-around pointer-events-none">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={`${colorMap[color]} text-2xl animate-drip`}
          style={{ animationDelay: `${i * 0.3}s` }}
        >
          💧
        </div>
      ))}
    </div>
  );
}

/**
 * Page Transition Wrapper
 * Adds slide animations to page transitions
 */
interface PageTransitionProps {
  children: React.ReactNode;
  direction?: 'in' | 'out';
}

export function PageTransition({ children, direction = 'in' }: PageTransitionProps) {
  return (
    <div className={direction === 'in' ? 'animate-slide-in-right' : 'animate-slide-out-left'}>
      {children}
    </div>
  );
}

/**
 * Hover Glow Effect Wrapper
 * Adds intense glow on hover
 */
interface HoverGlowProps {
  children: React.ReactNode;
  color?: 'green' | 'purple' | 'red' | 'orange';
  className?: string;
}

export function HoverGlow({ children, color = 'green', className = '' }: HoverGlowProps) {
  const glowMap = {
    green: 'hover:shadow-[0_0_30px_rgba(57,255,20,0.9),0_0_50px_rgba(157,78,221,0.5)]',
    purple: 'hover:shadow-[0_0_30px_rgba(157,78,221,0.9),0_0_50px_rgba(157,78,221,0.5)]',
    red: 'hover:shadow-[0_0_30px_rgba(255,0,110,0.9),0_0_50px_rgba(255,0,110,0.5)]',
    orange: 'hover:shadow-[0_0_30px_rgba(251,86,7,0.9),0_0_50px_rgba(251,86,7,0.5)]',
  };

  return (
    <div className={`transition-all duration-300 ${glowMap[color]} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Critical Warning Flicker
 * Intense flicker effect for critical alerts
 */
interface CriticalFlickerProps {
  children: React.ReactNode;
  active?: boolean;
}

export function CriticalFlicker({ children, active = true }: CriticalFlickerProps) {
  return (
    <div className={active ? 'animate-flicker-intense' : ''}>
      {children}
    </div>
  );
}

/**
 * Pulse Alert
 * Pulsing glow effect for alerts
 */
interface PulseAlertProps {
  children: React.ReactNode;
  severity?: 'info' | 'warning' | 'critical';
}

export function PulseAlert({ children, severity = 'info' }: PulseAlertProps) {
  const pulseClass = severity === 'critical' 
    ? 'animate-pulse-glow' 
    : severity === 'warning'
    ? 'animate-pulse'
    : '';

  return (
    <div className={pulseClass}>
      {children}
    </div>
  );
}
