'use client';

import { ZoneCard } from './ZoneCard';
import type { ZoneSummary } from '@/types';

export interface ZoneGridProps {
  zones: ZoneSummary[];
  onZoneSelect: (zoneId: string) => void;
}

/**
 * Grid component to display all zones
 * Responsive layout that adapts to screen size
 */
export function ZoneGrid({ zones, onZoneSelect }: ZoneGridProps) {
  if (zones.length === 0) {
    return (
      <div className="retro-card fog-overlay border-toxic-purple text-center py-12">
        <span className="text-6xl mb-4 block">👻</span>
        <p className="font-vt323 text-lg text-text-secondary mb-4">
          No zones found in your haunted greenhouse
        </p>
        <p className="font-vt323 text-sm text-text-secondary">
          Create zones to start monitoring your plants
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
      {zones.map((zone) => (
        <ZoneCard
          key={zone.id}
          zone={zone}
          onSelect={onZoneSelect}
        />
      ))}
    </div>
  );
}
