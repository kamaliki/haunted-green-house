import { useEffect, useCallback } from 'react';
import { useSocket } from '@/components/providers/SocketProvider';

/**
 * Hook for subscribing to real-time WebSocket events
 * Provides a clean API for components to listen to specific events
 */
export function useRealtime<T = any>(
  event: string,
  callback: (data: T) => void,
  dependencies: any[] = []
) {
  const { socket, isConnected } = useSocket();

  // Memoize callback to prevent unnecessary re-subscriptions
  const memoizedCallback = useCallback(callback, dependencies);

  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }

    // Subscribe to event
    socket.on(event, memoizedCallback);

    // Cleanup subscription
    return () => {
      socket.off(event, memoizedCallback);
    };
  }, [socket, isConnected, event, memoizedCallback]);

  return { isConnected };
}

/**
 * Hook for subscribing to sensor data updates
 */
export function useSensorUpdates(callback: (data: any) => void) {
  return useRealtime('sensor:update', callback, [callback]);
}

/**
 * Hook for subscribing to security events
 */
export function useSecurityUpdates(callback: (event: any) => void) {
  return useRealtime('security:event', callback, [callback]);
}

/**
 * Hook for subscribing to irrigation status updates
 */
export function useIrrigationUpdates(callback: (status: any) => void) {
  return useRealtime('irrigation:status', callback, [callback]);
}

/**
 * Hook for subscribing to access point status updates
 */
export function useAccessPointUpdates(callback: (status: any) => void) {
  return useRealtime('security:access-point', callback, [callback]);
}

/**
 * Hook for emitting events to the server
 */
export function useSocketEmit() {
  const { socket, isConnected } = useSocket();

  const emit = useCallback(
    (event: string, data?: any) => {
      if (!socket || !isConnected) {
        console.warn('Cannot emit event: socket not connected');
        return false;
      }

      socket.emit(event, data);
      return true;
    },
    [socket, isConnected]
  );

  return { emit, isConnected };
}
