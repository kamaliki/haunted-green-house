'use client';

import { useRouter } from 'next/navigation';
import { GhostIcon } from '@/components/ui/Icons';
import { ZoneGrid } from '@/components/zones';
import { useZoneSummaries } from '@/lib/hooks';
import { ConnectionStatus } from '@/components/ui/ConnectionStatus';
import { ZoneGridSkeleton } from '@/components/ui/LoadingSkeletons';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';

/**
 * Zone Management Landing Page
 * Main landing page after login - displays all zones with summary status
 */
export default function ZoneManagementPage() {
  const router = useRouter();
  
  // Fetch zone summaries with real-time updates
  const { data: zones, isLoading, error } = useZoneSummaries();

  // Handle zone selection - navigate to zone-specific dashboard
  const handleZoneSelect = (zoneId: string) => {
    router.push(`/zones/${zoneId}`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GhostIcon size="lg" animate />
            <h1 className="text-3xl md:text-4xl font-creepster text-ghost-green text-glow">
              Zone Management
            </h1>
          </div>
          <p className="font-vt323 text-lg text-text-secondary">
            Loading your haunted zones...
          </p>
        </div>
        
        {/* Loading skeleton */}
        <ZoneGridSkeleton count={6} />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GhostIcon size="lg" animate />
            <h1 className="text-3xl md:text-4xl font-creepster text-ghost-green text-glow">
              Zone Management
            </h1>
          </div>
        </div>
        
        <ErrorDisplay
          error={error}
          title="Failed to Load Zones"
          onRetry={() => window.location.reload()}
          onBack={() => router.push('/login')}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 md:p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <GhostIcon size="lg" animate />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-creepster text-ghost-green text-glow">
                Zone Management
              </h1>
            </div>
            <p className="font-vt323 text-base sm:text-lg text-text-secondary">
              Select a zone to monitor and control
            </p>
          </div>
          
          {/* Connection Status */}
          <div className="self-start sm:self-auto">
            <ConnectionStatus />
          </div>
        </div>

        {/* Stats Summary */}
        {zones && zones.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="retro-card fog-overlay border-ghost-green p-3 sm:p-4 md:p-6">
              <p className="text-xs text-text-secondary font-vt323 mb-1">TOTAL ZONES</p>
              <p className="text-xl sm:text-2xl font-vt323 text-ghost-green">{zones.length}</p>
            </div>
            
            <div className="retro-card fog-overlay border-ghost-green p-3 sm:p-4 md:p-6">
              <p className="text-xs text-text-secondary font-vt323 mb-1">OPTIMAL</p>
              <p className="text-xl sm:text-2xl font-vt323 text-ghost-green">
                {zones.filter(z => z.healthStatus === 'optimal').length}
              </p>
            </div>
            
            <div className="retro-card fog-overlay border-pumpkin-orange p-3 sm:p-4 md:p-6">
              <p className="text-xs text-text-secondary font-vt323 mb-1">WARNING</p>
              <p className="text-xl sm:text-2xl font-vt323 text-pumpkin-orange">
                {zones.filter(z => z.healthStatus === 'warning').length}
              </p>
            </div>
            
            <div className="retro-card fog-overlay border-blood-red p-3 sm:p-4 md:p-6">
              <p className="text-xs text-text-secondary font-vt323 mb-1">CRITICAL</p>
              <p className="text-xl sm:text-2xl font-vt323 text-blood-red">
                {zones.filter(z => z.healthStatus === 'critical').length}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Zone Grid */}
      <ZoneGrid zones={zones || []} onZoneSelect={handleZoneSelect} />

      {/* Help Text */}
      {zones && zones.length > 0 && (
        <div className="mt-8 text-center">
          <p className="font-vt323 text-sm text-text-secondary">
            💀 Click on any zone card to view detailed monitoring and controls 💀
          </p>
        </div>
      )}
    </div>
  );
}
