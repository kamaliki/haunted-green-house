'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ZoneSummary } from '@/types';

export interface ZoneCardProps {
  zone: ZoneSummary;
  onSelect: (zoneId: string) => void;
}

/**
 * Zone card component displaying zone summary
 * Shows zone name, key metrics, health status, and alert indicators
 */
export function ZoneCard({ zone, onSelect }: ZoneCardProps) {
  // Get colors based on health status
  const colors = useMemo(() => {
    switch (zone.healthStatus) {
      case 'critical':
        return {
          text: 'text-blood-red',
          border: 'border-blood-red',
          glow: 'shadow-[0_0_20px_rgba(255,0,110,0.6)]',
          badge: 'bg-blood-red',
        };
      case 'warning':
        return {
          text: 'text-pumpkin-orange',
          border: 'border-pumpkin-orange',
          glow: 'shadow-[0_0_20px_rgba(251,86,7,0.6)]',
          badge: 'bg-pumpkin-orange',
        };
      default:
        return {
          text: 'text-ghost-green',
          border: 'border-ghost-green',
          glow: 'shadow-[0_0_20px_rgba(57,255,20,0.6)]',
          badge: 'bg-ghost-green',
        };
    }
  }, [zone.healthStatus]);

  // Format timestamp
  const timeAgo = useMemo(() => {
    const now = new Date();
    const diffMs = now.getTime() - zone.lastUpdate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return `${Math.floor(diffSeconds / 3600)}h ago`;
  }, [zone.lastUpdate]);

  // Get health status icon
  const healthIcon = useMemo(() => {
    switch (zone.healthStatus) {
      case 'critical':
        return '💀';
      case 'warning':
        return '⚠️';
      default:
        return '✨';
    }
  }, [zone.healthStatus]);

  return (
    <motion.div
      className={`
        retro-card fog-overlay
        ${colors.border}
        ${colors.glow}
        cursor-pointer
        transition-all duration-300
        hover:scale-105
        hover:animate-float
        hover:shadow-glow-intense
        relative
        touch-manipulation
        p-4 sm:p-5 md:p-6
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(zone.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(zone.id);
        }
      }}
      aria-label={`Select ${zone.name} zone`}
    >
      {/* Alert Badge */}
      {zone.activeAlerts > 0 && (
        <div className="absolute -top-2 -right-2 z-10">
          <motion.div
            className={`
              ${colors.badge}
              text-bone-white
              font-vt323
              text-sm
              px-3 py-1
              rounded-full
              border-2 border-bone-white
              shadow-[0_0_15px_rgba(255,0,110,0.8)]
              animate-pulse-glow
            `}
            animate={{
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {zone.activeAlerts} ALERT{zone.activeAlerts > 1 ? 'S' : ''}
          </motion.div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className={`font-press-start text-xs sm:text-sm ${colors.text} break-words`}>
          {zone.name.toUpperCase()}
        </h3>
        <span className="text-xl sm:text-2xl flex-shrink-0">{healthIcon}</span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
        {/* Temperature */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-base sm:text-lg">🌡️</span>
            <span className="text-xs text-text-secondary font-vt323">TEMP</span>
          </div>
          <p className={`font-vt323 text-xl sm:text-2xl ${colors.text}`}>
            {zone.temperature.toFixed(1)}°C
          </p>
        </div>

        {/* Humidity */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-base sm:text-lg">💧</span>
            <span className="text-xs text-text-secondary font-vt323">HUMID</span>
          </div>
          <p className={`font-vt323 text-xl sm:text-2xl ${colors.text}`}>
            {zone.humidity.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Status Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary font-vt323">STATUS:</span>
          <span className={`font-vt323 ${colors.text}`}>
            {zone.healthStatus.toUpperCase()}
          </span>
        </div>

        {/* Health Status Bar */}
        <div className="h-2 bg-bg-darkest rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${colors.badge} ${colors.glow}`}
            initial={{ width: 0 }}
            animate={{ 
              width: zone.healthStatus === 'optimal' ? '100%' 
                : zone.healthStatus === 'warning' ? '60%' 
                : '30%' 
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Last Update */}
      <div className="mt-3 text-xs text-text-secondary font-vt323">
        Updated: {timeAgo}
      </div>

      {/* Click indicator */}
      <div className="mt-4 text-center">
        <span className={`text-xs font-vt323 ${colors.text} opacity-70`}>
          CLICK TO ENTER →
        </span>
      </div>

      {/* Cobweb decoration */}
      <div className="absolute top-0 right-0 text-lg opacity-20 pointer-events-none animate-cobweb-sway">
        🕸️
      </div>
    </motion.div>
  );
}
