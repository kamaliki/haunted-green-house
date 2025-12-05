import { create } from 'zustand';
import type { Alert } from '@/types';

interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  filterZoneId: string | null;
  filterSeverity: Alert['severity'] | null;
  filterType: Alert['type'] | null;
  
  // Actions
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  acknowledgeAlert: (id: string) => void;
  acknowledgeAll: () => void;
  removeAlert: (id: string) => void;
  setAlerts: (alerts: Alert[]) => void;
  setFilterZoneId: (zoneId: string | null) => void;
  setFilterSeverity: (severity: Alert['severity'] | null) => void;
  setFilterType: (type: Alert['type'] | null) => void;
  clearFilters: () => void;
  
  // Computed
  getFilteredAlerts: () => Alert[];
  getSortedAlerts: () => Alert[];
}

const severityOrder: Record<Alert['severity'], number> = {
  critical: 3,
  warning: 2,
  info: 1,
};

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  unreadCount: 0,
  filterZoneId: null,
  filterSeverity: null,
  filterType: null,

  addAlert: (alert: Alert) => {
    set((state) => {
      // Check if alert already exists
      const exists = state.alerts.some((a) => a.id === alert.id);
      if (exists) {
        return state;
      }

      const newAlerts = [alert, ...state.alerts];
      const unreadCount = newAlerts.filter((a) => !a.acknowledged).length;

      return {
        alerts: newAlerts,
        unreadCount,
      };
    });
  },

  updateAlert: (id: string, updates: Partial<Alert>) => {
    set((state) => {
      const alerts = state.alerts.map((alert) =>
        alert.id === id ? { ...alert, ...updates } : alert
      );
      const unreadCount = alerts.filter((a) => !a.acknowledged).length;

      return {
        alerts,
        unreadCount,
      };
    });
  },

  acknowledgeAlert: (id: string) => {
    get().updateAlert(id, { acknowledged: true });
  },

  acknowledgeAll: () => {
    set((state) => ({
      alerts: state.alerts.map((alert) => ({ ...alert, acknowledged: true })),
      unreadCount: 0,
    }));
  },

  removeAlert: (id: string) => {
    set((state) => {
      const alerts = state.alerts.filter((alert) => alert.id !== id);
      const unreadCount = alerts.filter((a) => !a.acknowledged).length;

      return {
        alerts,
        unreadCount,
      };
    });
  },

  setAlerts: (alerts: Alert[]) => {
    const unreadCount = alerts.filter((a) => !a.acknowledged).length;
    set({ alerts, unreadCount });
  },

  setFilterZoneId: (zoneId: string | null) => {
    set({ filterZoneId: zoneId });
  },

  setFilterSeverity: (severity: Alert['severity'] | null) => {
    set({ filterSeverity: severity });
  },

  setFilterType: (type: Alert['type'] | null) => {
    set({ filterType: type });
  },

  clearFilters: () => {
    set({
      filterZoneId: null,
      filterSeverity: null,
      filterType: null,
    });
  },

  getFilteredAlerts: () => {
    const state = get();
    let filtered = state.alerts;

    if (state.filterZoneId) {
      filtered = filtered.filter((alert) => alert.zoneId === state.filterZoneId);
    }

    if (state.filterSeverity) {
      filtered = filtered.filter((alert) => alert.severity === state.filterSeverity);
    }

    if (state.filterType) {
      filtered = filtered.filter((alert) => alert.type === state.filterType);
    }

    return filtered;
  },

  getSortedAlerts: () => {
    const filtered = get().getFilteredAlerts();

    // Sort by severity (descending) then timestamp (descending)
    return [...filtered].sort((a, b) => {
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) {
        return severityDiff;
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  },
}));
