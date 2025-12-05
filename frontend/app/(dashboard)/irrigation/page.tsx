'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { apiClient } from '@/lib/api/client';

interface IrrigationZoneStatus {
  zone: string;
  status: 'active' | 'idle';
  startTime?: string;
  estimatedEndTime?: string;
  flowRate?: number;
  lastIrrigation?: string;
}

interface IrrigationStatusResponse {
  zones: IrrigationZoneStatus[];
  reservoir: {
    level: number;
    status: string;
  };
}

interface UsageStatistics {
  period: {
    start: string;
    end: string;
  };
  totalSessions: number;
  totalDurationSeconds: number;
  averageDurationSeconds: number;
  byZone: Record<string, { sessions: number; totalDuration: number }>;
}

interface IrrigationSession {
  timestamp: string;
  zone: string;
  reason: string;
  initiatedBy: string;
  durationSeconds: number;
  flowRatePercent: number;
  status: string;
}

const ZONES = ['zone-a', 'zone-b'];

/**
 * Irrigation control and monitoring page
 * Allows manual control of irrigation zones and displays status
 */
export default function IrrigationPage() {
  const queryClient = useQueryClient();
  const [selectedZone, setSelectedZone] = useState<string>(ZONES[0]);
  const [duration, setDuration] = useState<number>(300); // 5 minutes default
  const [flowRate, setFlowRate] = useState<number>(80);

  // Fetch irrigation status
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['irrigation', 'status'],
    queryFn: async () => {
      const response = await apiClient.get<IrrigationStatusResponse>('/api/irrigation/status');
      return response.data;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch usage statistics
  const { data: usage } = useQuery({
    queryKey: ['irrigation', 'usage'],
    queryFn: async () => {
      const response = await apiClient.get<UsageStatistics>('/api/irrigation/usage');
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch irrigation history
  const { data: history } = useQuery({
    queryKey: ['irrigation', 'history'],
    queryFn: async () => {
      const response = await apiClient.get<IrrigationSession[]>('/api/irrigation/history');
      return response.data;
    },
  });

  // Start irrigation mutation
  const startMutation = useMutation({
    mutationFn: async (data: { zone: string; durationSeconds: number; flowRatePercent: number }) => {
      const response = await apiClient.post('/api/irrigation/start', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['irrigation'] });
    },
  });

  // Stop irrigation mutation
  const stopMutation = useMutation({
    mutationFn: async (zone: string) => {
      const response = await apiClient.post('/api/irrigation/stop', { zone });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['irrigation'] });
    },
  });

  // Adjust flow rate mutation
  const adjustFlowMutation = useMutation({
    mutationFn: async (data: { zone: string; flowRatePercent: number }) => {
      const response = await apiClient.post('/api/irrigation/adjust-flow', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['irrigation'] });
    },
  });

  const handleStartIrrigation = () => {
    startMutation.mutate({
      zone: selectedZone,
      durationSeconds: duration,
      flowRatePercent: flowRate,
    });
  };

  const handleStopIrrigation = (zone: string) => {
    stopMutation.mutate(zone);
  };

  const handleAdjustFlow = (zone: string, newFlowRate: number) => {
    adjustFlowMutation.mutate({ zone, flowRatePercent: newFlowRate });
  };

  const getZoneStatus = (zone: string): IrrigationZoneStatus | undefined => {
    return status?.zones.find((z) => z.zone === zone);
  };

  const isZoneActive = (zone: string): boolean => {
    const zoneStatus = getZoneStatus(zone);
    return zoneStatus?.status === 'active';
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString();
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">💧</span>
          <h1 className="text-3xl md:text-4xl font-creepster text-ghost-green text-glow">
            Irrigation Control
          </h1>
        </div>
        <p className="font-vt323 text-lg text-text-secondary">
          Manage water distribution across greenhouse zones
        </p>
      </div>

      {/* Reservoir Status */}
      {status?.reservoir && status.reservoir.level !== undefined && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🪣 Water Reservoir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-vt323 text-lg">Current Level:</span>
                <span className={`font-vt323 text-2xl ${
                  status.reservoir.status === 'low' ? 'text-blood-red' : 'text-ghost-green'
                }`}>
                  {status.reservoir.level.toFixed(1)}%
                </span>
              </div>
              <div className="h-8 bg-bg-darkest rounded-lg overflow-hidden border-2 border-ghost-green">
                <div
                  className={`h-full transition-all duration-500 ${
                    status.reservoir.status === 'low' 
                      ? 'bg-gradient-to-r from-blood-red to-pumpkin-orange' 
                      : 'bg-gradient-to-r from-ghost-green to-slime-green'
                  }`}
                  style={{ width: `${Math.min(100, status.reservoir.level)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm text-text-secondary font-vt323">
                <span>Empty</span>
                <span className={status.reservoir.status === 'low' ? 'text-blood-red' : ''}>
                  {status.reservoir.status.toUpperCase()}
                </span>
                <span>Full</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Manual Control */}
        <Card>
          <CardHeader>
            <CardTitle>🎮 Manual Control</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Zone Selection */}
              <div>
                <label className="block font-vt323 text-sm mb-2 text-text-secondary">
                  Select Zone:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ZONES.map((zone) => {
                    const active = isZoneActive(zone);
                    return (
                      <Button
                        key={zone}
                        variant={selectedZone === zone ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setSelectedZone(zone)}
                        className={`font-vt323 ${active ? 'border-pumpkin-orange' : ''}`}
                        disabled={active}
                      >
                        {zone.toUpperCase()}
                        {active && ' 🌊'}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block font-vt323 text-sm mb-2 text-text-secondary">
                  Duration: {formatDuration(duration)}
                </label>
                <input
                  type="range"
                  min="60"
                  max="1800"
                  step="60"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-ghost-green"
                />
                <div className="flex justify-between text-xs text-text-secondary font-vt323 mt-1">
                  <span>1 min</span>
                  <span>30 min</span>
                </div>
              </div>

              {/* Flow Rate */}
              <div>
                <label className="block font-vt323 text-sm mb-2 text-text-secondary">
                  Flow Rate: {flowRate}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={flowRate}
                  onChange={(e) => setFlowRate(Number(e.target.value))}
                  className="w-full accent-ghost-green"
                />
                <div className="flex justify-between text-xs text-text-secondary font-vt323 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Start Button */}
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartIrrigation}
                disabled={startMutation.isPending || isZoneActive(selectedZone)}
                className="w-full font-vt323"
              >
                {startMutation.isPending ? '⏳ Starting...' : '💧 Start Irrigation'}
              </Button>

              {startMutation.isError && (
                <p className="text-blood-red font-vt323 text-sm animate-flicker">
                  ⚠️ Error: {(startMutation.error as Error).message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Usage Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {usage ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-bg-darkest p-4 rounded-lg border-2 border-ghost-green">
                    <p className="text-xs text-text-secondary font-vt323 mb-1">Total Duration</p>
                    <p className="text-2xl font-vt323 text-ghost-green">
                      {Math.floor((usage.totalDurationSeconds || 0) / 60)}m
                    </p>
                  </div>
                  <div className="bg-bg-darkest p-4 rounded-lg border-2 border-toxic-purple">
                    <p className="text-xs text-text-secondary font-vt323 mb-1">Sessions</p>
                    <p className="text-2xl font-vt323 text-toxic-purple">
                      {usage.totalSessions || 0}
                    </p>
                  </div>
                </div>

                {usage.byZone && Object.keys(usage.byZone).length > 0 && (
                  <div>
                    <p className="text-sm text-text-secondary font-vt323 mb-2">Sessions by Zone:</p>
                    <div className="space-y-2">
                      {Object.entries(usage.byZone).map(([zone, data]) => (
                        <div key={zone} className="flex items-center justify-between">
                          <span className="font-vt323 text-sm">{zone.toUpperCase()}</span>
                          <span className="font-vt323 text-ghost-green">
                            {data.sessions} ({Math.floor(data.totalDuration / 60)}m)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" type="ghost" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Zones */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🌊 Active Irrigation Zones</CardTitle>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" type="ghost" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {status?.zones.map((zone) => {
                const active = zone.status === 'active';
                return (
                  <div
                    key={zone.zone}
                    className={`p-4 rounded-lg border-4 transition-all ${
                      active
                        ? 'border-pumpkin-orange bg-pumpkin-orange/10 animate-pulse-glow'
                        : 'border-bg-medium bg-bg-darkest'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-press-start text-xs text-ghost-green">
                        {zone.zone.toUpperCase()}
                      </h3>
                      <span className={`font-vt323 ${active ? 'text-pumpkin-orange' : 'text-text-secondary'}`}>
                        {active ? '● ACTIVE' : '○ IDLE'}
                      </span>
                    </div>

                    {active && (
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm font-vt323">
                          <span className="text-text-secondary">Flow Rate:</span>
                          <span className="text-ghost-green">{zone.flowRate || 0}%</span>
                        </div>
                        {zone.startTime && (
                          <div className="flex justify-between text-sm font-vt323">
                            <span className="text-text-secondary">Started:</span>
                            <span className="text-ghost-green">{formatTime(zone.startTime)}</span>
                          </div>
                        )}
                        {zone.estimatedEndTime && (
                          <div className="flex justify-between text-sm font-vt323">
                            <span className="text-text-secondary">Ends:</span>
                            <span className="text-ghost-green">{formatTime(zone.estimatedEndTime)}</span>
                          </div>
                        )}

                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleStopIrrigation(zone.zone)}
                            disabled={stopMutation.isPending}
                            className="flex-1 font-vt323"
                          >
                            ⏹️ Stop
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAdjustFlow(zone.zone, Math.max(0, (zone.flowRate || 0) - 10))}
                            disabled={adjustFlowMutation.isPending}
                            className="font-vt323"
                          >
                            -10%
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAdjustFlow(zone.zone, Math.min(100, (zone.flowRate || 0) + 10))}
                            disabled={adjustFlowMutation.isPending}
                            className="font-vt323"
                          >
                            +10%
                          </Button>
                        </div>
                      </div>
                    )}

                    {!active && zone.lastIrrigation && (
                      <p className="text-sm text-text-secondary font-vt323">
                        Last: {formatTime(zone.lastIrrigation)}
                      </p>
                    )}

                    {!active && !zone.lastIrrigation && (
                      <p className="text-sm text-text-secondary font-vt323">
                        No irrigation history
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Irrigation History */}
      <Card>
        <CardHeader>
          <CardTitle>📜 Recent History</CardTitle>
        </CardHeader>
        <CardContent>
          {history && history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full font-vt323">
                <thead>
                  <tr className="border-b-2 border-ghost-green">
                    <th className="text-left py-2 px-2 text-ghost-green">Zone</th>
                    <th className="text-left py-2 px-2 text-ghost-green">Time</th>
                    <th className="text-left py-2 px-2 text-ghost-green">Duration</th>
                    <th className="text-left py-2 px-2 text-ghost-green">Flow Rate</th>
                    <th className="text-left py-2 px-2 text-ghost-green">Status</th>
                    <th className="text-left py-2 px-2 text-ghost-green">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 10).map((session, index) => (
                    <tr key={`${session.zone}-${session.timestamp}-${index}`} className="border-b border-bg-medium hover:bg-bg-medium transition-colors">
                      <td className="py-2 px-2">{session.zone?.toUpperCase() || 'N/A'}</td>
                      <td className="py-2 px-2">{session.timestamp ? formatTime(session.timestamp) : 'N/A'}</td>
                      <td className="py-2 px-2">{formatDuration(session.durationSeconds || 0)}</td>
                      <td className="py-2 px-2">{session.flowRatePercent || 0}%</td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          session.status === 'completed' ? 'bg-ghost-green/20 text-ghost-green' : 'bg-pumpkin-orange/20 text-pumpkin-orange'
                        }`}>
                          {session.status || 'unknown'}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-text-secondary text-sm">
                        {session.reason || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl mb-2 block">🌫️</span>
              <p className="font-vt323 text-text-secondary">No irrigation history available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
