'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { GhostIcon } from '@/components/ui/Icons';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useZone, useIrrigationStatus, useStartIrrigation, useStopIrrigation } from '@/lib/hooks';
import { cn } from '@/lib/utils/cn';
import { useToast } from '@/components/ui/Toast';
import { FormSkeleton } from '@/components/ui/LoadingSkeletons';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';

/**
 * Zone-specific irrigation control page
 * Allows operators to start/stop irrigation and monitor status for a specific zone
 */
export default function IrrigationPage() {
  const params = useParams();
  const router = useRouter();
  const zoneId = params.zoneId as string;
  
  const [showStartModal, setShowStartModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const toast = useToast();
  
  // Fetch zone details
  const { data: zone, isLoading: zoneLoading, error: zoneError } = useZone(zoneId);
  
  // Fetch irrigation status for this zone
  const { data: irrigationStatus, isLoading: statusLoading, error: statusError } = useIrrigationStatus(zoneId);
  
  // Mutations
  const startMutation = useStartIrrigation(zoneId);
  const stopMutation = useStopIrrigation(zoneId);

  // Handle start irrigation
  const handleStartIrrigation = async () => {
    try {
      await startMutation.mutateAsync();
      setShowStartModal(false);
      toast.success('Irrigation Started', 'Water is now flowing in this zone');
    } catch (error) {
      toast.error(
        'Failed to Start Irrigation',
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    }
  };

  // Handle stop irrigation
  const handleStopIrrigation = async () => {
    try {
      await stopMutation.mutateAsync();
      setShowStopModal(false);
      toast.success('Irrigation Stopped', 'Water flow has been halted');
    } catch (error) {
      toast.error(
        'Failed to Stop Irrigation',
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    }
  };

  // Show loading state
  if (zoneLoading || statusLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">💧</span>
            <h1 className="text-3xl md:text-4xl font-creepster text-ghost-green text-glow">
              Loading Irrigation Control...
            </h1>
          </div>
        </div>
        <FormSkeleton fields={3} />
      </div>
    );
  }

  // Show error state
  if (zoneError || !zone) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <button
          onClick={() => router.push('/')}
          className="mb-4 text-ghost-green hover:text-slime-green font-vt323 text-lg flex items-center gap-2 transition-colors"
        >
          ← Back to Zones
        </button>
        
        <ErrorDisplay
          error={zoneError || new Error('Zone not found')}
          title="Zone Not Found"
          onRetry={() => window.location.reload()}
          onBack={() => router.push('/')}
        />
      </div>
    );
  }

  const isLowReservoir = irrigationStatus && irrigationStatus.reservoirLevel < 10;
  const isActive = irrigationStatus?.active || false;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8">
        <button
          onClick={() => router.push(`/zones/${zoneId}`)}
          className="mb-4 text-ghost-green hover:text-slime-green font-vt323 text-lg flex items-center gap-2 transition-colors"
        >
          ← Back to {zone.name} Dashboard
        </button>
        
        <div className="flex items-center gap-3">
          <span className="text-4xl">💧</span>
          <h1 className="text-3xl md:text-4xl font-creepster text-ghost-green text-glow">
            Irrigation Control - {zone.name}
          </h1>
        </div>
      </div>

      {/* Error loading status */}
      {statusError && (
        <div className="mb-6">
          <ErrorDisplay
            error={statusError}
            title="Failed to Load Irrigation Status"
            onRetry={() => window.location.reload()}
            size="md"
          />
        </div>
      )}

      {/* Irrigation Control Panel */}
      {irrigationStatus && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Card */}
          <div className="retro-card fog-overlay">
            <div className="relative z-10">
              <h2 className="text-2xl font-creepster text-toxic-purple mb-6 flex items-center gap-2">
                <span>🎃</span>
                Current Status
              </h2>
              
              {/* Active/Inactive Indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-vt323 text-lg text-bone-white">System Status:</span>
                  <div className={cn(
                    'px-4 py-2 border-4 rounded pixel-corners font-bold',
                    isActive 
                      ? 'bg-ghost-green/20 border-ghost-green text-ghost-green animate-pulse-glow' 
                      : 'bg-text-secondary/20 border-text-secondary text-text-secondary'
                  )}>
                    {isActive ? 'ACTIVE' : 'INACTIVE'}
                  </div>
                </div>
                
                {/* Animated indicator */}
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-6 h-6 rounded-full border-4',
                    isActive 
                      ? 'bg-ghost-green border-ghost-green animate-pulse-glow' 
                      : 'bg-text-secondary border-text-secondary'
                  )} />
                  <span className="font-vt323 text-sm text-text-secondary">
                    {isActive ? 'Water is flowing...' : 'System is idle'}
                  </span>
                </div>
              </div>

              {/* Water Flow Rate */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-vt323 text-lg text-bone-white">Water Flow:</span>
                  <span className="font-vt323 text-xl text-slime-green">
                    {irrigationStatus.waterFlow.toFixed(1)} L/min
                  </span>
                </div>
                
                {/* Animated gauge */}
                <div className="relative h-8 bg-bg-darkest border-4 border-ghost-green rounded pixel-corners overflow-hidden">
                  <div 
                    className={cn(
                      'absolute inset-y-0 left-0 transition-all duration-500',
                      isActive ? 'bg-gradient-to-r from-slime-green to-ghost-green animate-pulse' : 'bg-text-secondary'
                    )}
                    style={{ width: `${Math.min((irrigationStatus.waterFlow / 10) * 100, 100)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-vt323 text-sm text-bone-white drop-shadow-lg">
                      {isActive ? '💧💧💧' : '---'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Last Started */}
              {irrigationStatus.lastStarted && (
                <div className="mb-4">
                  <span className="font-vt323 text-sm text-text-secondary">
                    Last Started: {new Date(irrigationStatus.lastStarted).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Duration */}
              {irrigationStatus.duration && isActive && (
                <div>
                  <span className="font-vt323 text-sm text-text-secondary">
                    Duration: {Math.floor(irrigationStatus.duration / 60)}m {irrigationStatus.duration % 60}s
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Reservoir & Controls Card */}
          <div className="retro-card fog-overlay">
            <div className="relative z-10">
              <h2 className="text-2xl font-creepster text-toxic-purple mb-6 flex items-center gap-2">
                <span>🧪</span>
                Reservoir & Controls
              </h2>
              
              {/* Reservoir Level */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-vt323 text-lg text-bone-white">Reservoir Level:</span>
                  <span className={cn(
                    'font-vt323 text-xl font-bold',
                    isLowReservoir ? 'text-blood-red animate-flicker' : 'text-ghost-green'
                  )}>
                    {irrigationStatus.reservoirLevel.toFixed(0)}%
                  </span>
                </div>
                
                {/* Slime-style progress bar */}
                <div className="relative h-12 bg-bg-darkest border-4 border-toxic-purple rounded-lg overflow-hidden">
                  <div 
                    className={cn(
                      'absolute inset-y-0 left-0 transition-all duration-500',
                      isLowReservoir 
                        ? 'bg-gradient-to-r from-blood-red to-pumpkin-orange animate-flicker' 
                        : 'bg-gradient-to-r from-slime-green via-ghost-green to-toxic-purple'
                    )}
                    style={{ width: `${irrigationStatus.reservoirLevel}%` }}
                  >
                    {/* Dripping slime effect */}
                    <div className="absolute inset-0 opacity-50">
                      <div className="absolute bottom-0 left-1/4 w-2 h-4 bg-white rounded-full animate-pulse" />
                      <div className="absolute bottom-0 left-1/2 w-2 h-3 bg-white rounded-full animate-pulse delay-100" />
                      <div className="absolute bottom-0 left-3/4 w-2 h-5 bg-white rounded-full animate-pulse delay-200" />
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-vt323 text-lg text-bone-white drop-shadow-lg font-bold">
                      {irrigationStatus.reservoirLevel.toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                {/* Low reservoir warning */}
                {isLowReservoir && (
                  <div className="mt-3 p-3 bg-blood-red/20 border-2 border-blood-red rounded pixel-corners">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl animate-flicker">⚠️</span>
                      <p className="font-vt323 text-sm text-blood-red">
                        WARNING: Reservoir level critically low! Refill before starting irrigation.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div className="space-y-4">
                {/* Start Button */}
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isActive || isLowReservoir || startMutation.isPending}
                  loading={startMutation.isPending}
                  onClick={() => setShowStartModal(true)}
                  icon={<span className="text-2xl">💧</span>}
                >
                  {startMutation.isPending ? 'STARTING...' : 'START IRRIGATION'}
                </Button>

                {/* Stop Button */}
                <Button
                  variant="danger"
                  size="lg"
                  className="w-full"
                  disabled={!isActive || stopMutation.isPending}
                  loading={stopMutation.isPending}
                  onClick={() => setShowStopModal(true)}
                  icon={<span className="text-2xl">🛑</span>}
                >
                  {stopMutation.isPending ? 'STOPPING...' : 'STOP IRRIGATION'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Start Confirmation Modal */}
      <Modal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        title="Start Irrigation?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowStartModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleStartIrrigation}
              loading={startMutation.isPending}
            >
              Confirm Start
            </Button>
          </>
        }
      >
        <div className="text-center py-4">
          <span className="text-6xl mb-4 block">💧</span>
          <p className="font-vt323 text-lg text-bone-white mb-4">
            Are you sure you want to start irrigation for <span className="text-ghost-green">{zone.name}</span>?
          </p>
          <p className="font-vt323 text-sm text-text-secondary">
            The system will begin watering immediately.
          </p>
        </div>
      </Modal>

      {/* Stop Confirmation Modal */}
      <Modal
        isOpen={showStopModal}
        onClose={() => setShowStopModal(false)}
        title="Stop Irrigation?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowStopModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleStopIrrigation}
              loading={stopMutation.isPending}
            >
              Confirm Stop
            </Button>
          </>
        }
      >
        <div className="text-center py-4">
          <span className="text-6xl mb-4 block">🛑</span>
          <p className="font-vt323 text-lg text-bone-white mb-4">
            Are you sure you want to stop irrigation for <span className="text-ghost-green">{zone.name}</span>?
          </p>
          <p className="font-vt323 text-sm text-text-secondary">
            The water flow will cease immediately.
          </p>
        </div>
      </Modal>
    </div>
  );
}
