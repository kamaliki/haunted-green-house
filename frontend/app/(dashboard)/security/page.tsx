'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusIndicator';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { 
  useAccessPointStatuses, 
  useSecurityLogs, 
  useZones,
  useAccessPoints,
  useCreateAccessPoint,
  useUpdateAccessPoint,
  useDeleteAccessPoint,
} from '@/lib/hooks';
import { 
  AccessPointList,
  AccessPointForm,
  AccessPointDeleteDialog,
} from '@/components/security';
import type { 
  SecurityLogQuery, 
  SecurityEvent, 
  AccessPoint,
  CreateAccessPointDto,
  UpdateAccessPointDto,
} from '@/types';
import { cn } from '@/lib/utils/cn';
import { TableSkeleton } from '@/components/ui/LoadingSkeletons';

export default function SecurityPage() {
  const router = useRouter();
  const toast = useToast();
  
  // Fetch data
  const { data: accessPointStatuses, isLoading: loadingAccessPoints } = useAccessPointStatuses();
  const { data: accessPoints, isLoading: loadingAccessPointsConfig, error: accessPointsError } = useAccessPoints();
  const { data: zones } = useZones();
  
  // Access point management state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAccessPoint, setSelectedAccessPoint] = useState<AccessPoint | null>(null);
  
  // Mutations
  const createMutation = useCreateAccessPoint();
  const updateMutation = useUpdateAccessPoint();
  const deleteMutation = useDeleteAccessPoint();
  
  // Filter state
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  
  // Build query based on filters
  const query = useMemo<SecurityLogQuery | undefined>(() => {
    const q: SecurityLogQuery = {};
    
    if (eventTypeFilter !== 'all') {
      q.eventType = eventTypeFilter;
    }
    
    if (dateRangeFilter !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      switch (dateRangeFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      q.startDate = startDate;
      q.endDate = now;
    }
    
    if (locationFilter !== 'all') {
      q.location = locationFilter;
    }
    
    if (zoneFilter !== 'all') {
      q.zoneId = zoneFilter;
    }
    
    return Object.keys(q).length > 0 ? q : undefined;
  }, [eventTypeFilter, dateRangeFilter, locationFilter, zoneFilter]);
  
  const { data: securityLogs, isLoading: loadingLogs } = useSecurityLogs(query);
  
  // Get unique locations from logs for filter
  const uniqueLocations = useMemo(() => {
    if (!securityLogs) return [];
    const locations = new Set(securityLogs.map(log => log.location));
    return Array.from(locations).sort();
  }, [securityLogs]);
  
  // Filter off-hours motion events
  const offHoursMotionEvents = useMemo(() => {
    if (!securityLogs) return [];
    return securityLogs.filter(
      event => event.type === 'motion_detected' && event.isOffHours
    );
  }, [securityLogs]);
  
  // Merge access point configuration with real-time status
  const accessPointsWithStatus = useMemo(() => {
    if (!accessPoints || !accessPointStatuses) return accessPoints || [];
    
    return accessPoints.map((ap) => {
      const status = accessPointStatuses.find((s) => s.id === ap.id);
      if (status) {
        return {
          ...ap,
          status: status.status,
          lastStatusChange: status.lastChanged,
        };
      }
      return ap;
    });
  }, [accessPoints, accessPointStatuses]);
  
  // Handlers for access point management
  const handleAddAccessPoint = () => {
    setSelectedAccessPoint(null);
    setIsFormModalOpen(true);
  };
  
  const handleEditAccessPoint = (accessPoint: AccessPoint) => {
    setSelectedAccessPoint(accessPoint);
    setIsFormModalOpen(true);
  };
  
  const handleDeleteAccessPoint = (accessPoint: AccessPoint) => {
    setSelectedAccessPoint(accessPoint);
    setIsDeleteDialogOpen(true);
  };
  
  const handleFormSubmit = async (data: CreateAccessPointDto | UpdateAccessPointDto) => {
    try {
      if (selectedAccessPoint) {
        // Update existing access point
        await updateMutation.mutateAsync({ 
          id: selectedAccessPoint.id, 
          data: data as UpdateAccessPointDto 
        });
        toast.success('Access Point Updated', 'The access point has been updated successfully.');
      } else {
        // Create new access point
        await createMutation.mutateAsync(data as CreateAccessPointDto);
        toast.success('Access Point Created', 'The access point has been created successfully.');
      }
      setIsFormModalOpen(false);
      setSelectedAccessPoint(null);
    } catch (error) {
      toast.error(
        'Operation Failed', 
        error instanceof Error ? error.message : 'Failed to save access point.'
      );
    }
  };
  
  const handleFormCancel = () => {
    setIsFormModalOpen(false);
    setSelectedAccessPoint(null);
  };
  
  const handleDeleteConfirm = async () => {
    if (!selectedAccessPoint) return;
    
    try {
      await deleteMutation.mutateAsync(selectedAccessPoint.id);
      toast.success('Access Point Deleted', 'The access point has been removed successfully.');
      setIsDeleteDialogOpen(false);
      setSelectedAccessPoint(null);
    } catch (error) {
      toast.error(
        'Delete Failed', 
        error instanceof Error ? error.message : 'Failed to delete access point.'
      );
    }
  };
  
  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setSelectedAccessPoint(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-ghost-green font-creepster mb-2">
            🦇 Security Monitoring
          </h1>
          <p className="text-text-secondary font-vt323">
            Monitor access points and security events across all zones
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.push('/security/settings')}>
          ⚙️ Settings
        </Button>
      </div>

      {/* Off-Hours Motion Alerts */}
      {offHoursMotionEvents.length > 0 && (
        <Card className="border-blood-red shadow-glow-red animate-pulse-glow">
          <CardHeader>
            <CardTitle className="text-blood-red flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              OFF-HOURS MOTION DETECTED
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {offHoursMotionEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="bg-blood-red/10 border-2 border-blood-red p-4 rounded pixel-corners"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blood-red font-bold font-vt323">
                        {event.location}
                        {event.zoneName && ` - ${event.zoneName}`}
                      </p>
                      <p className="text-text-secondary text-sm">
                        {event.timestamp.toLocaleString()}
                      </p>
                    </div>
                    {event.confidence && (
                      <StatusBadge status="danger">
                        Confidence: {(event.confidence * 100).toFixed(0)}%
                      </StatusBadge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Access Points Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-2">
              <span className="animate-float">🚪</span>
              Access Points
            </CardTitle>
            <Button
              variant="primary"
              onClick={handleAddAccessPoint}
              className="flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <span>➕</span>
              <span className="hidden sm:inline">Add Access Point</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AccessPointList
            accessPoints={accessPointsWithStatus}
            onEdit={handleEditAccessPoint}
            onDelete={handleDeleteAccessPoint}
            isLoading={loadingAccessPointsConfig || loadingAccessPoints}
            error={accessPointsError}
            highlightThreshold={300}
          />
        </CardContent>
      </Card>

      {/* Security Event Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📜</span>
            Security Event Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Event Type Filter */}
              <div>
                <label className="block text-sm font-bold text-ghost-green mb-2 font-vt323">
                  Event Type
                </label>
                <select
                  value={eventTypeFilter}
                  onChange={(e) => setEventTypeFilter(e.target.value)}
                  className="w-full retro-input"
                >
                  <option value="all">All Events</option>
                  <option value="motion_detected">Motion</option>
                  <option value="door_opened">Door Opened</option>
                  <option value="door_closed">Door Closed</option>
                  <option value="window_opened">Window Opened</option>
                  <option value="window_closed">Window Closed</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-bold text-ghost-green mb-2 font-vt323">
                  Date Range
                </label>
                <select
                  value={dateRangeFilter}
                  onChange={(e) => setDateRangeFilter(e.target.value as any)}
                  className="w-full retro-input"
                >
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-bold text-ghost-green mb-2 font-vt323">
                  Location
                </label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full retro-input"
                >
                  <option value="all">All Locations</option>
                  {uniqueLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Zone Filter */}
              <div>
                <label className="block text-sm font-bold text-ghost-green mb-2 font-vt323">
                  Zone
                </label>
                <select
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  className="w-full retro-input"
                >
                  <option value="all">All Zones</option>
                  {zones?.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEventTypeFilter('all');
                  setDateRangeFilter('today');
                  setLocationFilter('all');
                  setZoneFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Event Table */}
          {loadingLogs ? (
            <TableSkeleton rows={5} columns={5} />
          ) : securityLogs && securityLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-2 border-ghost-green">
                <thead className="bg-bg-medium">
                  <tr>
                    <th className="px-4 py-3 text-left text-ghost-green font-vt323 border-b-2 border-ghost-green">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-left text-ghost-green font-vt323 border-b-2 border-ghost-green">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-ghost-green font-vt323 border-b-2 border-ghost-green">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-ghost-green font-vt323 border-b-2 border-ghost-green">
                      Zone
                    </th>
                    <th className="px-4 py-3 text-left text-ghost-green font-vt323 border-b-2 border-ghost-green">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {securityLogs.map((event, index) => (
                    <SecurityEventRow key={event.id} event={event} index={index} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 space-y-4 animate-fade-in">
              <div className="text-5xl sm:text-6xl animate-float">👻</div>
              <h3 className="text-lg sm:text-xl font-bold text-ghost-green font-vt323 text-glow">
                No Security Events Found
              </h3>
              <p className="text-sm sm:text-base text-text-secondary font-vt323 px-4 max-w-md mx-auto">
                {eventTypeFilter === 'all' && dateRangeFilter === 'today' && locationFilter === 'all' && zoneFilter === 'all'
                  ? 'No security events have been recorded yet. Events will appear here when motion is detected or access points change status.'
                  : 'No events match the selected filters. Try adjusting your filter criteria or clearing all filters.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Access Point Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleFormCancel}
        title={selectedAccessPoint ? 'Edit Access Point' : 'Add Access Point'}
        tombstone={true}
      >
        {(createMutation.isPending || updateMutation.isPending) ? (
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-ghost-green/20 rounded pixel-corners" />
            <div className="h-12 bg-ghost-green/20 rounded pixel-corners" />
            <div className="h-12 bg-ghost-green/20 rounded pixel-corners" />
          </div>
        ) : (
          <AccessPointForm
            accessPoint={selectedAccessPoint || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AccessPointDeleteDialog
        isOpen={isDeleteDialogOpen}
        accessPoint={selectedAccessPoint}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

// Security Event Row Component
interface SecurityEventRowProps {
  event: SecurityEvent;
  index: number;
}

function SecurityEventRow({ event, index }: SecurityEventRowProps) {
  const eventTypeLabels: Record<string, string> = {
    motion_detected: '👻 Motion',
    door_opened: '🚪 Door Opened',
    door_closed: '🚪 Door Closed',
    window_opened: '🪟 Window Opened',
    window_closed: '🪟 Window Closed',
  };
  
  const isMotion = event.type === 'motion_detected';
  const isOffHours = event.isOffHours;
  
  return (
    <tr
      className={cn(
        'border-b border-ghost-green/30 hover:bg-bg-medium transition-colors',
        isOffHours && 'bg-blood-red/5',
        index % 2 === 0 && 'bg-bg-dark/50'
      )}
    >
      <td className="px-4 py-3 text-sm text-text-primary">
        {event.timestamp.toLocaleString()}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-primary font-vt323">
            {eventTypeLabels[event.type] || event.type}
          </span>
          {isOffHours && (
            <StatusBadge status="danger">OFF-HOURS</StatusBadge>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-text-primary">
        {event.location}
      </td>
      <td className="px-4 py-3 text-sm text-text-primary">
        {event.zoneName || '-'}
      </td>
      <td className="px-4 py-3 text-sm text-text-primary">
        {isMotion && event.confidence && (
          <span className="text-toxic-purple">
            Confidence: {(event.confidence * 100).toFixed(0)}%
          </span>
        )}
        {!isMotion && '-'}
      </td>
    </tr>
  );
}
