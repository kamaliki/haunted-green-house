'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GhostIcon } from '@/components/ui/Icons';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { RetroChart } from '@/components/ui/RetroChart';
import { useZone } from '@/lib/hooks';
import { getTrackedPlants, getPlantGrowthMetrics } from '@/lib/api/plant-health';
import { cn } from '@/lib/utils/cn';
import type { Plant, GrowthMetrics, TimeSeriesData } from '@/types';

/**
 * Zone-specific plant growth tracking page
 * Displays growth metrics over time for plants in a specific zone
 */
export default function PlantGrowthPage() {
  const params = useParams();
  const router = useRouter();
  const zoneId = params.zoneId as string;
  
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  
  // Fetch zone details
  const { data: zone, isLoading: zoneLoading, error: zoneError } = useZone(zoneId);

  // Fetch tracked plants for this zone
  const {
    data: plants,
    isLoading: plantsLoading,
    error: plantsError,
  } = useQuery({
    queryKey: ['plants', zoneId],
    queryFn: () => getTrackedPlants(zoneId),
    enabled: !!zoneId,
  });

  // Fetch growth metrics for selected plant
  const {
    data: growthMetrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = useQuery({
    queryKey: ['growth-metrics', selectedPlantId],
    queryFn: () => getPlantGrowthMetrics(selectedPlantId!),
    enabled: !!selectedPlantId,
  });

  // Get selected plant
  const selectedPlant = useMemo(() => {
    if (!plants || !selectedPlantId) return null;
    return plants.find((p) => p.id === selectedPlantId) || null;
  }, [plants, selectedPlantId]);

  // Auto-select first plant if available
  useMemo(() => {
    if (plants && plants.length > 0 && !selectedPlantId) {
      setSelectedPlantId(plants[0].id);
    }
  }, [plants, selectedPlantId]);

  // Transform growth metrics to chart data
  const chartData = useMemo((): TimeSeriesData[] => {
    if (!growthMetrics || growthMetrics.length === 0) return [];

    return [
      {
        metric: 'height',
        data: growthMetrics.map((m) => ({
          timestamp: m.timestamp,
          value: m.height,
        })),
      },
      {
        metric: 'leafCount',
        data: growthMetrics.map((m) => ({
          timestamp: m.timestamp,
          value: m.leafCount,
        })),
      },
      {
        metric: 'healthScore',
        data: growthMetrics.map((m) => ({
          timestamp: m.timestamp,
          value: m.healthScore,
        })),
      },
    ];
  }, [growthMetrics]);

  // Calculate growth rate comparison
  const growthComparison = useMemo(() => {
    if (!growthMetrics || growthMetrics.length < 2 || !selectedPlant?.expectedGrowthRate) {
      return null;
    }

    const sortedMetrics = [...growthMetrics].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    const first = sortedMetrics[0];
    const last = sortedMetrics[sortedMetrics.length - 1];
    
    const timeDiffMs = last.timestamp.getTime() - first.timestamp.getTime();
    const weeks = timeDiffMs / (1000 * 60 * 60 * 24 * 7);

    const actualHeightGrowth = (last.height - first.height) / weeks;
    const actualLeafGrowth = (last.leafCount - first.leafCount) / weeks;

    const heightDiff = actualHeightGrowth - selectedPlant.expectedGrowthRate.height;
    const leafDiff = actualLeafGrowth - selectedPlant.expectedGrowthRate.leafCount;

    return {
      height: {
        actual: actualHeightGrowth,
        expected: selectedPlant.expectedGrowthRate.height,
        diff: heightDiff,
        percentage: (heightDiff / selectedPlant.expectedGrowthRate.height) * 100,
      },
      leafCount: {
        actual: actualLeafGrowth,
        expected: selectedPlant.expectedGrowthRate.leafCount,
        diff: leafDiff,
        percentage: (leafDiff / selectedPlant.expectedGrowthRate.leafCount) * 100,
      },
    };
  }, [growthMetrics, selectedPlant]);

  // Show loading state
  if (zoneLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GhostIcon size="lg" animate />
            <h1 className="text-3xl md:text-4xl font-creepster text-ghost-green text-glow">
              Loading Growth Tracking...
            </h1>
          </div>
        </div>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Show error state
  if (zoneError || !zone) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GhostIcon size="lg" animate />
            <h1 className="text-3xl md:text-4xl font-creepster text-ghost-green text-glow">
              Zone Not Found
            </h1>
          </div>
        </div>
        
        <div className="retro-card fog-overlay border-blood-red">
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">💀</span>
            <p className="font-vt323 text-lg text-blood-red mb-4">
              This zone has vanished into the mist!
            </p>
            <Button onClick={() => router.push('/')}>
              Return to Zone Management
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8">
        <button
          onClick={() => router.push(`/zones/${zoneId}/plant-health`)}
          className="mb-4 text-ghost-green hover:text-slime-green font-vt323 text-lg flex items-center gap-2 transition-colors"
        >
          ← Back to Plant Health
        </button>
        
        <div className="flex items-center gap-3">
          <span className="text-4xl">📈</span>
          <h1 className="text-3xl md:text-4xl font-creepster text-ghost-green text-glow">
            Growth Tracking - {zone.name}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Plant List Sidebar */}
        <div className="lg:col-span-1">
          <div className="retro-card fog-overlay">
            <div className="relative z-10">
              <h2 className="text-2xl font-creepster text-toxic-purple mb-4 flex items-center gap-2">
                <span>🌱</span>
                Tracked Plants
              </h2>

              {plantsLoading && (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              )}

              {plantsError && (
                <div className="text-center py-4">
                  <span className="text-3xl mb-2 block">⚠️</span>
                  <p className="font-vt323 text-sm text-blood-red">
                    Failed to load plants
                  </p>
                </div>
              )}

              {!plantsLoading && !plantsError && (!plants || plants.length === 0) && (
                <div className="text-center py-8">
                  <span className="text-5xl mb-4 block opacity-50">🌿</span>
                  <p className="font-vt323 text-sm text-text-secondary mb-4">
                    No tracked plants in this zone yet
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/zones/${zoneId}/plant-health`)}
                  >
                    Upload Plant Image
                  </Button>
                </div>
              )}

              {plants && plants.length > 0 && (
                <div className="space-y-3">
                  {plants.map((plant) => (
                    <button
                      key={plant.id}
                      onClick={() => setSelectedPlantId(plant.id)}
                      className={cn(
                        'w-full p-3 border-4 rounded-lg pixel-corners transition-all duration-200 text-left',
                        selectedPlantId === plant.id
                          ? 'border-ghost-green bg-ghost-green/20 shadow-glow-green'
                          : 'border-toxic-purple hover:border-ghost-green hover:bg-ghost-green/10'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {plant.thumbnailUrl ? (
                          <img
                            src={plant.thumbnailUrl}
                            alt={plant.name}
                            className="w-12 h-12 rounded border-2 border-ghost-green object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded border-2 border-ghost-green bg-bg-darkest flex items-center justify-center">
                            <span className="text-2xl">🌿</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-vt323 text-base text-bone-white truncate">
                            {plant.name}
                          </h3>
                          <p className="font-vt323 text-xs text-text-secondary truncate">
                            {plant.species}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Growth Metrics and Chart */}
        <div className="lg:col-span-3 space-y-6">
          {!selectedPlant && (
            <div className="retro-card fog-overlay">
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block opacity-50">🌱</span>
                <p className="font-vt323 text-lg text-text-secondary">
                  Select a plant to view growth metrics
                </p>
              </div>
            </div>
          )}

          {selectedPlant && (
            <>
              {/* Current Metrics */}
              <div className="retro-card fog-overlay">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-creepster text-toxic-purple flex items-center gap-2">
                      <span>📊</span>
                      Current Metrics
                    </h2>
                    <div className="text-right">
                      <p className="font-vt323 text-sm text-text-secondary">
                        Planted: {selectedPlant.plantedDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {metricsLoading && (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  )}

                  {metricsError && (
                    <div className="text-center py-4">
                      <span className="text-3xl mb-2 block">⚠️</span>
                      <p className="font-vt323 text-sm text-blood-red">
                        Failed to load growth metrics
                      </p>
                    </div>
                  )}

                  {!metricsLoading && !metricsError && (!growthMetrics || growthMetrics.length === 0) && (
                    <div className="text-center py-8">
                      <span className="text-5xl mb-4 block opacity-50">📉</span>
                      <p className="font-vt323 text-base text-text-secondary mb-2">
                        No growth data available yet
                      </p>
                      <p className="font-vt323 text-sm text-text-secondary mb-4">
                        Upload plant images to start tracking growth
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/zones/${zoneId}/plant-health`)}
                      >
                        Upload Image
                      </Button>
                    </div>
                  )}

                  {growthMetrics && growthMetrics.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Height */}
                      <div className="p-4 border-4 border-ghost-green rounded-lg pixel-corners bg-ghost-green/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-vt323 text-sm text-text-secondary">Height</span>
                          <span className="text-2xl">📏</span>
                        </div>
                        <p className="font-vt323 text-3xl text-ghost-green font-bold">
                          {growthMetrics[growthMetrics.length - 1].height.toFixed(1)}
                          <span className="text-lg ml-1">cm</span>
                        </p>
                      </div>

                      {/* Leaf Count */}
                      <div className="p-4 border-4 border-slime-green rounded-lg pixel-corners bg-slime-green/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-vt323 text-sm text-text-secondary">Leaves</span>
                          <span className="text-2xl">🍃</span>
                        </div>
                        <p className="font-vt323 text-3xl text-slime-green font-bold">
                          {growthMetrics[growthMetrics.length - 1].leafCount}
                        </p>
                      </div>

                      {/* Health Score */}
                      <div className={cn(
                        'p-4 border-4 rounded-lg pixel-corners',
                        growthMetrics[growthMetrics.length - 1].healthScore >= 80
                          ? 'border-ghost-green bg-ghost-green/10'
                          : growthMetrics[growthMetrics.length - 1].healthScore >= 50
                          ? 'border-pumpkin-orange bg-pumpkin-orange/10'
                          : 'border-blood-red bg-blood-red/10'
                      )}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-vt323 text-sm text-text-secondary">Health</span>
                          <span className="text-2xl">❤️</span>
                        </div>
                        <p className={cn(
                          'font-vt323 text-3xl font-bold',
                          growthMetrics[growthMetrics.length - 1].healthScore >= 80
                            ? 'text-ghost-green'
                            : growthMetrics[growthMetrics.length - 1].healthScore >= 50
                            ? 'text-pumpkin-orange'
                            : 'text-blood-red'
                        )}>
                          {growthMetrics[growthMetrics.length - 1].healthScore}
                          <span className="text-lg ml-1">%</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Growth Comparison */}
              {growthComparison && (
                <div className="retro-card fog-overlay">
                  <div className="relative z-10">
                    <h2 className="text-2xl font-creepster text-toxic-purple mb-6 flex items-center gap-2">
                      <span>📊</span>
                      Growth Rate Comparison
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Height Growth */}
                      <div className="p-4 border-4 border-ghost-green rounded-lg pixel-corners">
                        <h3 className="font-vt323 text-lg text-bone-white mb-3 flex items-center gap-2">
                          <span>📏</span>
                          Height Growth Rate
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-vt323 text-sm text-text-secondary">Actual:</span>
                            <span className="font-vt323 text-sm text-ghost-green">
                              {growthComparison.height.actual.toFixed(2)} cm/week
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-vt323 text-sm text-text-secondary">Expected:</span>
                            <span className="font-vt323 text-sm text-text-secondary">
                              {growthComparison.height.expected.toFixed(2)} cm/week
                            </span>
                          </div>
                          <div className="pt-2 border-t-2 border-toxic-purple">
                            <div className="flex justify-between items-center">
                              <span className="font-vt323 text-sm text-text-secondary">Difference:</span>
                              <span className={cn(
                                'font-vt323 text-base font-bold',
                                growthComparison.height.diff >= 0 ? 'text-ghost-green' : 'text-blood-red'
                              )}>
                                {growthComparison.height.diff >= 0 ? '+' : ''}
                                {growthComparison.height.percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Leaf Growth */}
                      <div className="p-4 border-4 border-slime-green rounded-lg pixel-corners">
                        <h3 className="font-vt323 text-lg text-bone-white mb-3 flex items-center gap-2">
                          <span>🍃</span>
                          Leaf Growth Rate
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-vt323 text-sm text-text-secondary">Actual:</span>
                            <span className="font-vt323 text-sm text-slime-green">
                              {growthComparison.leafCount.actual.toFixed(2)} leaves/week
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-vt323 text-sm text-text-secondary">Expected:</span>
                            <span className="font-vt323 text-sm text-text-secondary">
                              {growthComparison.leafCount.expected.toFixed(2)} leaves/week
                            </span>
                          </div>
                          <div className="pt-2 border-t-2 border-toxic-purple">
                            <div className="flex justify-between items-center">
                              <span className="font-vt323 text-sm text-text-secondary">Difference:</span>
                              <span className={cn(
                                'font-vt323 text-base font-bold',
                                growthComparison.leafCount.diff >= 0 ? 'text-slime-green' : 'text-blood-red'
                              )}>
                                {growthComparison.leafCount.diff >= 0 ? '+' : ''}
                                {growthComparison.leafCount.percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Growth Chart */}
              {growthMetrics && growthMetrics.length > 0 && (
                <div className="retro-card fog-overlay">
                  <div className="relative z-10">
                    <h2 className="text-2xl font-creepster text-toxic-purple mb-6 flex items-center gap-2">
                      <span>📈</span>
                      Growth Over Time
                    </h2>

                    <RetroChart
                      data={chartData}
                      metrics={[
                        {
                          key: 'height',
                          label: 'Height',
                          color: '#39ff14',
                          unit: ' cm',
                        },
                        {
                          key: 'leafCount',
                          label: 'Leaf Count',
                          color: '#06ffa5',
                          unit: '',
                        },
                        {
                          key: 'healthScore',
                          label: 'Health Score',
                          color: '#9d4edd',
                          unit: '%',
                        },
                      ]}
                      timeRange="30d"
                      type="line"
                    />

                    <div className="mt-4 pt-4 border-t-2 border-toxic-purple">
                      <p className="font-vt323 text-xs text-text-secondary text-center">
                        Last updated: {growthMetrics[growthMetrics.length - 1].timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
