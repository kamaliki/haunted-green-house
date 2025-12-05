import { create } from 'zustand';
import type { AccessPoint, CreateAccessPointDto, UpdateAccessPointDto } from '@/types';

interface AccessPointState {
  accessPoints: AccessPoint[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setAccessPoints: (accessPoints: AccessPoint[]) => void;
  addAccessPoint: (accessPoint: AccessPoint) => void;
  updateAccessPoint: (id: string, updates: Partial<AccessPoint>) => void;
  removeAccessPoint: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Computed
  getAccessPointById: (id: string) => AccessPoint | undefined;
  getAccessPointsByType: (type: 'door' | 'window') => AccessPoint[];
  getGroupedAccessPoints: () => { doors: AccessPoint[]; windows: AccessPoint[] };
  getMonitoredAccessPoints: () => AccessPoint[];
}

export const useAccessPointStore = create<AccessPointState>((set, get) => ({
  accessPoints: [],
  loading: false,
  error: null,

  setAccessPoints: (accessPoints: AccessPoint[]) => {
    set({ accessPoints, error: null });
  },

  addAccessPoint: (accessPoint: AccessPoint) => {
    set((state) => {
      // Check if access point already exists
      const exists = state.accessPoints.some((ap) => ap.id === accessPoint.id);
      if (exists) {
        return state;
      }

      return {
        accessPoints: [...state.accessPoints, accessPoint],
        error: null,
      };
    });
  },

  updateAccessPoint: (id: string, updates: Partial<AccessPoint>) => {
    set((state) => {
      const accessPoints = state.accessPoints.map((ap) =>
        ap.id === id ? { ...ap, ...updates, updatedAt: new Date() } : ap
      );

      return {
        accessPoints,
        error: null,
      };
    });
  },

  removeAccessPoint: (id: string) => {
    set((state) => ({
      accessPoints: state.accessPoints.filter((ap) => ap.id !== id),
      error: null,
    }));
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error, loading: false });
  },

  clearError: () => {
    set({ error: null });
  },

  getAccessPointById: (id: string) => {
    return get().accessPoints.find((ap) => ap.id === id);
  },

  getAccessPointsByType: (type: 'door' | 'window') => {
    return get().accessPoints.filter((ap) => ap.type === type);
  },

  getGroupedAccessPoints: () => {
    const accessPoints = get().accessPoints;
    return {
      doors: accessPoints.filter((ap) => ap.type === 'door'),
      windows: accessPoints.filter((ap) => ap.type === 'window'),
    };
  },

  getMonitoredAccessPoints: () => {
    return get().accessPoints.filter((ap) => ap.monitoringEnabled);
  },
}));
