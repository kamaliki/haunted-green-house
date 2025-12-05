'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAlertStore } from '@/lib/store/alertStore';
import type { EnvironmentData, SecurityEvent, Alert } from '@/types';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  connectionError: null,
});

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
}

interface SocketProviderProps {
  children: ReactNode;
}

/**
 * WebSocket Provider using Socket.io client
 * Manages connection lifecycle, reconnection logic, and real-time event handling
 */
export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { addAlert } = useAlertStore();

  useEffect(() => {
    // Check if WebSocket is disabled via environment variable
    const wsDisabled = process.env.NEXT_PUBLIC_DISABLE_WEBSOCKET === 'true';
    
    if (wsDisabled) {
      console.log('WebSocket is disabled via environment variable');
      setConnectionError('WebSocket disabled - using polling only');
      return;
    }
    
    // Get WebSocket URL from environment
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

    // Create socket connection with configuration
    const socketInstance = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5, // Limit attempts to avoid infinite retries
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
      autoConnect: true,
    });

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setConnectionError(null);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    // Exponential backoff for reconnection
    let reconnectAttempt = 0;
    socketInstance.io.on('reconnect_attempt', () => {
      reconnectAttempt++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempt), 30000);
      console.log(`Reconnection attempt ${reconnectAttempt}, next delay: ${delay}ms`);
    });

    socketInstance.io.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      reconnectAttempt = 0;
      setConnectionError(null);
    });

    socketInstance.io.on('reconnect_failed', () => {
      console.error('Reconnection failed');
      setConnectionError('Failed to reconnect to server');
    });

    // Handle sensor data updates
    socketInstance.on('sensor:update', (data: EnvironmentData) => {
      console.log('Received sensor update:', data);
      
      // Update React Query cache with new sensor data
      queryClient.setQueryData(['environment', 'current'], (oldData: EnvironmentData | undefined) => {
        return {
          ...oldData,
          ...data,
          timestamp: new Date(data.timestamp),
        };
      });

      // Invalidate related queries to trigger refetch if needed
      queryClient.invalidateQueries({ queryKey: ['environment'] });
      
      // Invalidate zone summaries to update zone cards
      queryClient.invalidateQueries({ queryKey: ['zones', 'summaries'] });
    });

    // Handle security events
    socketInstance.on('security:event', (event: SecurityEvent) => {
      console.log('Received security event:', event);
      
      // Update security events cache
      queryClient.setQueryData(['security', 'events'], (oldData: SecurityEvent[] | undefined) => {
        const events = oldData || [];
        return [
          {
            ...event,
            timestamp: new Date(event.timestamp),
          },
          ...events,
        ].slice(0, 100); // Keep last 100 events
      });

      // Invalidate security queries
      queryClient.invalidateQueries({ queryKey: ['security'] });

      // Trigger notification for off-hours motion events
      if (event.type === 'motion_detected' && event.details?.offHours) {
        // This will be handled by the alert system
        console.warn('Off-hours motion detected:', event);
      }
    });

    // Handle access point status updates
    socketInstance.on('security:access-point', (status: any) => {
      console.log('Received access point update:', status);
      
      // Update access point status cache
      queryClient.invalidateQueries({ queryKey: ['security', 'access-points'] });
    });

    // Handle irrigation status updates
    socketInstance.on('irrigation:status', (status: any) => {
      console.log('Received irrigation status update:', status);
      
      // Update irrigation status cache
      queryClient.setQueryData(['irrigation', 'status'], status);
      queryClient.invalidateQueries({ queryKey: ['irrigation'] });
    });

    // Handle alert events
    socketInstance.on('alert:new', (alert: Alert) => {
      console.log('Received new alert:', alert);
      
      // Add alert to store
      addAlert({
        ...alert,
        timestamp: new Date(alert.timestamp),
      });
      
      // Invalidate alerts query
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up WebSocket connection');
      socketInstance.removeAllListeners();
      socketInstance.close();
    };
  }, [queryClient]);

  const value: SocketContextValue = {
    socket,
    isConnected,
    connectionError,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
