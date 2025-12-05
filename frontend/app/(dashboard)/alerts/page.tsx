'use client';

import { useState } from 'react';
import { useAlertStore } from '@/lib/store/alertStore';
import { useAlerts } from '@/lib/hooks/useAlerts';
import { useZones } from '@/lib/hooks/useZones';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Alert } from '@/types';

/**
 * Alert Management Page
 * Displays all alerts with filtering and acknowledgment capabilities
 */
export default function AlertsPage() {
  const { isLoading, acknowledgeAlert, acknowledgeAll, isAcknowledging } = useAlerts();
  const { data: zones = [] } = useZones();
  const {
    getSortedAlerts,
    filterZoneId,
    filterSeverity,
    filterType,
    setFilterZoneId,
    setFilterSeverity,
    setFilterType,
    clearFilters,
    unreadCount,
  } = useAlertStore();

  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // Filter out acknowledged alerts and get sorted list
  const sortedAlerts = getSortedAlerts().filter(alert => !alert.acknowledged);
  const hasFilters = filterZoneId || filterSeverity || filterType;

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert);
  };

  const handleAcknowledge = (alertId: string) => {
    acknowledgeAlert(alertId);
    if (selectedAlert?.id === alertId) {
      setSelectedAlert(null);
    }
  };

  const handleAcknowledgeAll = () => {
    acknowledgeAll();
    setSelectedAlert(null);
  };

  const severityColors = {
    critical: 'border-blood-red text-blood-red',
    warning: 'border-pumpkin-orange text-pumpkin-orange',
    info: 'border-ghost-green text-ghost-green',
  };

  const severityIcons = {
    critical: '💀',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const typeIcons = {
    environmental: '🌡️',
    security: '🔒',
    predictive: '🔮',
    system: '⚙️',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-ghost-green mb-2 font-creepster">
          👻 Alert Management
        </h1>
        <p className="text-text-secondary">
          Monitor and manage alerts across all zones
        </p>
      </div>

      {/* Stats and Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-bg-dark border-ghost-green">
          <div className="text-center">
            <div className="text-3xl font-bold text-ghost-green">{sortedAlerts.length}</div>
            <div className="text-sm text-text-secondary">Total Alerts</div>
          </div>
        </Card>
        <Card className="bg-bg-dark border-pumpkin-orange">
          <div className="text-center">
            <div className="text-3xl font-bold text-pumpkin-orange">{unreadCount}</div>
            <div className="text-sm text-text-secondary">Unacknowledged</div>
          </div>
        </Card>
        <Card className="bg-bg-dark border-toxic-purple">
          <div className="flex items-center justify-center">
            <Button
              onClick={handleAcknowledgeAll}
              disabled={unreadCount === 0 || isAcknowledging}
              variant="primary"
            >
              ✓ Acknowledge All
            </Button>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 bg-bg-dark border-ghost-green">
        <h2 className="text-xl font-bold text-bone-white mb-4">🔍 Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Zone Filter */}
          <div>
            <label className="block text-sm text-text-secondary mb-2">Zone</label>
            <select
              value={filterZoneId || ''}
              onChange={(e) => setFilterZoneId(e.target.value || null)}
              className="w-full bg-bg-medium border-2 border-ghost-green text-bone-white px-3 py-2 rounded focus:outline-none focus:border-slime-green"
            >
              <option value="">All Zones</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-sm text-text-secondary mb-2">Severity</label>
            <select
              value={filterSeverity || ''}
              onChange={(e) => setFilterSeverity((e.target.value as Alert['severity']) || null)}
              className="w-full bg-bg-medium border-2 border-ghost-green text-bone-white px-3 py-2 rounded focus:outline-none focus:border-slime-green"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm text-text-secondary mb-2">Type</label>
            <select
              value={filterType || ''}
              onChange={(e) => setFilterType((e.target.value as Alert['type']) || null)}
              className="w-full bg-bg-medium border-2 border-ghost-green text-bone-white px-3 py-2 rounded focus:outline-none focus:border-slime-green"
            >
              <option value="">All Types</option>
              <option value="environmental">Environmental</option>
              <option value="security">Security</option>
              <option value="predictive">Predictive</option>
              <option value="system">System</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <Button
              onClick={clearFilters}
              disabled={!hasFilters}
              variant="secondary"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Alert List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Cards - Hide on mobile when alert is selected */}
        <div className={`space-y-4 ${selectedAlert ? 'hidden lg:block' : ''}`}>
          {sortedAlerts.length === 0 ? (
            <Card className="bg-bg-dark border-ghost-green text-center py-12">
              <div className="text-6xl mb-4">👻</div>
              <p className="text-text-secondary">
                {hasFilters ? 'No alerts match your filters' : 'No alerts to display'}
              </p>
            </Card>
          ) : (
            sortedAlerts.map((alert) => (
              <Card
                key={alert.id}
                className={`
                  bg-bg-dark cursor-pointer transition-all
                  ${severityColors[alert.severity]}
                  ${selectedAlert?.id === alert.id ? 'ring-4 ring-ghost-green' : ''}
                  ${alert.acknowledged ? 'opacity-60' : ''}
                  hover:scale-[1.02]
                `}
                onClick={() => handleAlertClick(alert)}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="text-3xl flex-shrink-0">
                    {severityIcons[alert.severity]}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-bone-white uppercase tracking-wide">
                        {alert.title}
                      </h3>
                      {!alert.acknowledged && (
                        <span className="px-2 py-1 bg-blood-red text-bone-white text-xs rounded">
                          NEW
                        </span>
                      )}
                    </div>

                    <p className="text-text-secondary text-sm mb-2">
                      {alert.message}
                    </p>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 bg-bg-medium rounded">
                        {typeIcons[alert.type]} {alert.type}
                      </span>
                      {alert.zoneName && (
                        <span className="px-2 py-1 bg-bg-medium rounded text-ghost-green">
                          📍 {alert.zoneName}
                        </span>
                      )}
                      <span className="px-2 py-1 bg-bg-medium rounded text-text-secondary">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Alert Details */}
        <div className={`lg:sticky lg:top-4 lg:self-start ${!selectedAlert ? 'hidden lg:block' : ''}`}>
          {selectedAlert ? (
            <Card className={`bg-bg-dark ${severityColors[selectedAlert.severity]}`}>
              {/* Back button for mobile */}
              <button
                onClick={() => setSelectedAlert(null)}
                className="lg:hidden mb-4 flex items-center gap-2 text-ghost-green hover:text-slime-green transition-colors"
              >
                <span>←</span>
                <span>Back to Alerts</span>
              </button>
              
              <h2 className="text-2xl font-bold text-bone-white mb-4">
                {severityIcons[selectedAlert.severity]} Alert Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-text-secondary">Title</label>
                  <p className="text-bone-white font-bold">{selectedAlert.title}</p>
                </div>

                <div>
                  <label className="text-sm text-text-secondary">Message</label>
                  <p className="text-bone-white">{selectedAlert.message}</p>
                </div>

                <div>
                  <label className="text-sm text-text-secondary">Type</label>
                  <p className="text-bone-white">
                    {typeIcons[selectedAlert.type]} {selectedAlert.type}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-text-secondary">Severity</label>
                  <p className="text-bone-white">
                    {severityIcons[selectedAlert.severity]} {selectedAlert.severity}
                  </p>
                </div>

                {selectedAlert.zoneName && (
                  <div>
                    <label className="text-sm text-text-secondary">Zone</label>
                    <p className="text-ghost-green">📍 {selectedAlert.zoneName}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm text-text-secondary">Timestamp</label>
                  <p className="text-bone-white">
                    {new Date(selectedAlert.timestamp).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-text-secondary">Status</label>
                  <p className="text-bone-white">
                    {selectedAlert.acknowledged ? '✓ Acknowledged' : '⚠ Unacknowledged'}
                  </p>
                </div>

                {selectedAlert.metadata && Object.keys(selectedAlert.metadata).length > 0 && (
                  <div>
                    <label className="text-sm text-text-secondary">Additional Info</label>
                    <pre className="text-xs text-bone-white bg-bg-medium p-2 rounded mt-1 overflow-auto">
                      {JSON.stringify(selectedAlert.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                {!selectedAlert.acknowledged && (
                  <Button
                    onClick={() => handleAcknowledge(selectedAlert.id)}
                    disabled={isAcknowledging}
                    variant="primary"
                    className="w-full"
                  >
                    ✓ Acknowledge Alert
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <Card className="bg-bg-dark border-ghost-green text-center py-12">
              <div className="text-6xl mb-4">👆</div>
              <p className="text-text-secondary">
                Select an alert to view details
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
