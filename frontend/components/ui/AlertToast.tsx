'use client';

import { useEffect, useState } from 'react';
import { useAlertStore } from '@/lib/store/alertStore';
import type { Alert } from '@/types';

interface AlertToastProps {
  alert: Alert;
  onDismiss: () => void;
  duration?: number;
}

function AlertToastItem({ alert, onDismiss, duration = 5000 }: AlertToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Fade in
    setTimeout(() => setIsVisible(true), 10);

    // Auto dismiss
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  const severityColors = {
    critical: 'border-blood-red shadow-[0_0_20px_rgba(255,0,110,0.6)]',
    warning: 'border-pumpkin-orange shadow-[0_0_20px_rgba(251,86,7,0.6)]',
    info: 'border-ghost-green shadow-[0_0_20px_rgba(57,255,20,0.6)]',
  };

  const severityIcons = {
    critical: '💀',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div
      className={`
        relative
        bg-bg-dark
        border-4 ${severityColors[alert.severity]}
        rounded-lg
        p-4
        min-w-[320px]
        max-w-[400px]
        transition-all duration-300
        ${isVisible && !isExiting ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
        ${alert.severity === 'critical' ? 'animate-pulse-glow animate-flicker-intense' : ''}
      `}
      role="alert"
    >
      {/* Severity indicator */}
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{severityIcons[alert.severity]}</span>
        
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-bold text-bone-white text-sm uppercase tracking-wide">
              {alert.title}
            </h4>
            <button
              onClick={handleDismiss}
              className="text-text-secondary hover:text-bone-white transition-colors flex-shrink-0"
              aria-label="Dismiss alert"
            >
              ✕
            </button>
          </div>

          {/* Message */}
          <p className="text-text-secondary text-sm mt-1">
            {alert.message}
          </p>

          {/* Zone info */}
          {alert.zoneName && (
            <div className="mt-2 text-xs text-ghost-green">
              📍 Zone: {alert.zoneName}
            </div>
          )}

          {/* Timestamp */}
          <div className="mt-2 text-xs text-text-secondary">
            {new Date(alert.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Pixel corners */}
      <div className="absolute top-0 left-0 w-2 h-2 bg-bg-darkest"></div>
      <div className="absolute top-0 right-0 w-2 h-2 bg-bg-darkest"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 bg-bg-darkest"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-bg-darkest"></div>
    </div>
  );
}

/**
 * Alert Toast Container
 * Displays real-time alert notifications
 */
export function AlertToastContainer({ testMode = false }: { testMode?: boolean } = {}) {
  const alerts = useAlertStore((state) => state.alerts);
  const removeAlert = useAlertStore((state) => state.removeAlert);
  const [displayedAlerts, setDisplayedAlerts] = useState<Set<string>>(new Set());

  // Get unacknowledged alerts that haven't been displayed yet
  const newAlerts = alerts
    .filter((alert) => !alert.acknowledged && (testMode || !displayedAlerts.has(alert.id)))
    .slice(0, 3); // Show max 3 at a time

  useEffect(() => {
    if (newAlerts.length > 0 && !testMode) {
      setDisplayedAlerts((prev) => {
        const next = new Set(prev);
        newAlerts.forEach((alert) => next.add(alert.id));
        return next;
      });
    }
  }, [newAlerts.length, testMode]);

  const handleDismiss = (alertId: string) => {
    // Don't remove from store, just stop displaying the toast
    if (!testMode) {
      setDisplayedAlerts((prev) => {
        const next = new Set(prev);
        next.delete(alertId);
        return next;
      });
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      <div className="pointer-events-auto flex flex-col gap-3">
        {newAlerts.map((alert) => (
          <AlertToastItem
            key={alert.id}
            alert={alert}
            onDismiss={() => handleDismiss(alert.id)}
            duration={alert.severity === 'critical' ? 10000 : 5000}
          />
        ))}
      </div>
    </div>
  );
}
