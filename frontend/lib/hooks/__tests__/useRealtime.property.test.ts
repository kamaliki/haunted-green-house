/**
 * Property-Based Tests for Real-time Data Updates
 * Feature: nextjs-frontend, Property 1: Real-time data freshness
 * Validates: Requirements 1.2
 * 
 * Property: For any sensor reading displayed on the dashboard, if the backend sends an update,
 * then the UI should reflect the new value within 2 seconds
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import * as fc from 'fast-check';
import { useRealtime } from '../useRealtime';
import type { EnvironmentData } from '@/types';

// Create a mock socket that we can control
const createMockSocket = () => ({
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  removeAllListeners: jest.fn(),
  close: jest.fn(),
  io: {
    on: jest.fn(),
  },
});

// Mock Socket.io client
let mockSocketInstance: ReturnType<typeof createMockSocket>;

jest.mock('socket.io-client', () => {
  return {
    io: jest.fn(() => {
      mockSocketInstance = createMockSocket();
      // Simulate immediate connection
      setTimeout(() => {
        const connectHandler = mockSocketInstance.on.mock.calls.find(
          (call: any[]) => call[0] === 'connect'
        )?.[1];
        if (connectHandler) connectHandler();
      }, 0);
      return mockSocketInstance;
    }),
  };
});

// Mock the SocketProvider to provide a controlled socket
jest.mock('@/components/providers/SocketProvider', () => {
  const React = require('react');
  const { createContext, useContext } = React;
  
  const SocketContext = createContext({
    socket: null,
    isConnected: true,
    connectionError: null,
  });

  return {
    SocketProvider: ({ children }: { children: ReactNode }) => {
      const value = {
        socket: mockSocketInstance,
        isConnected: true,
        connectionError: null,
      };
      return React.createElement(
        SocketContext.Provider,
        { value },
        children
      );
    },
    useSocket: () => useContext(SocketContext),
  };
});

describe('Property Test: Real-time data freshness', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Initialize socket.io mock
    const { io } = require('socket.io-client');
    io();
  });

  afterEach(() => {
    queryClient.clear();
  });

  // Wrapper component for testing hooks
  const createWrapper = () => {
    const React = require('react');
    const { SocketProvider } = require('@/components/providers/SocketProvider');
    return ({ children }: { children: ReactNode }) =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(SocketProvider, null, children)
      );
  };

  /**
   * Arbitrary generator for valid sensor values
   */
  const sensorValueArbitrary = fc.record({
    temperature_air: fc.double({ min: -10, max: 50, noNaN: true }),
    temperature_soil: fc.double({ min: 0, max: 40, noNaN: true }),
    humidity_air: fc.double({ min: 0, max: 100, noNaN: true }),
    humidity_soil: fc.double({ min: 0, max: 100, noNaN: true }),
    light_intensity: fc.double({ min: 0, max: 100000, noNaN: true }),
    co2_level: fc.double({ min: 300, max: 5000, noNaN: true }),
    soil_moisture: fc.double({ min: 0, max: 100, noNaN: true }),
    soil_ph: fc.double({ min: 0, max: 14, noNaN: true }),
    air_quality: fc.double({ min: 0, max: 500, noNaN: true }),
    timestamp: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
  });

  /**
   * Property 1: Real-time data freshness
   * For any sensor reading, if the backend sends an update via WebSocket,
   * then the UI should reflect the new value within 2 seconds
   */
  test('Property 1: sensor updates are reflected within 2 seconds', async () => {
    await fc.assert(
      fc.asyncProperty(sensorValueArbitrary, async (sensorData: EnvironmentData) => {
        // Track if callback was invoked
        let callbackInvoked = false;
        let receivedData: EnvironmentData | null = null;
        const startTime = Date.now();

        // Create a callback that tracks when it's called
        const callback = (data: EnvironmentData) => {
          callbackInvoked = true;
          receivedData = data;
        };

        // Render the hook with the event name and callback
        renderHook(() => useRealtime('sensor:update', callback, []), {
          wrapper: createWrapper(),
        });

        // Wait for socket to be set up
        await waitFor(() => {
          expect(mockSocketInstance.on).toHaveBeenCalled();
        }, { timeout: 1000 });

        // Find the 'sensor:update' event handler that was registered
        const sensorUpdateCalls = mockSocketInstance.on.mock.calls.filter(
          (call: any[]) => call[0] === 'sensor:update'
        );
        expect(sensorUpdateCalls.length).toBeGreaterThan(0);

        // Get the event handler
        const eventHandler = sensorUpdateCalls[sensorUpdateCalls.length - 1][1];

        // Simulate the backend sending a sensor update
        eventHandler(sensorData);

        // Wait for the callback to be invoked (should happen within 2 seconds)
        await waitFor(
          () => {
            expect(callbackInvoked).toBe(true);
          },
          { timeout: 2000 }
        );

        const endTime = Date.now();
        const elapsedTime = endTime - startTime;

        // Verify the update was received within 2 seconds
        expect(elapsedTime).toBeLessThan(2000);

        // Verify the data matches what was sent
        expect(receivedData).toEqual(sensorData);
        expect(receivedData?.temperature_air).toBe(sensorData.temperature_air);
        expect(receivedData?.humidity_air).toBe(sensorData.humidity_air);
        expect(receivedData?.light_intensity).toBe(sensorData.light_intensity);
      }),
      {
        numRuns: 100, // Run 100 iterations as specified in the design
        timeout: 10000, // Overall timeout for the entire property test
      }
    );
  }, 15000); // Jest test timeout

  /**
   * Additional property: Updates should preserve all sensor fields
   * For any sensor update, all fields should be present in the received data
   */
  test('Property: sensor updates preserve all fields', async () => {
    await fc.assert(
      fc.asyncProperty(sensorValueArbitrary, async (sensorData: EnvironmentData) => {
        let receivedData: EnvironmentData | null = null;

        const callback = (data: EnvironmentData) => {
          receivedData = data;
        };

        renderHook(() => useRealtime('sensor:update', callback, []), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(mockSocketInstance.on).toHaveBeenCalled();
        }, { timeout: 1000 });

        const sensorUpdateCalls = mockSocketInstance.on.mock.calls.filter(
          (call: any[]) => call[0] === 'sensor:update'
        );
        const eventHandler = sensorUpdateCalls[sensorUpdateCalls.length - 1][1];

        eventHandler(sensorData);

        await waitFor(() => {
          expect(receivedData).not.toBeNull();
        }, { timeout: 2000 });

        // Verify all fields are present
        expect(receivedData).toHaveProperty('temperature_air');
        expect(receivedData).toHaveProperty('temperature_soil');
        expect(receivedData).toHaveProperty('humidity_air');
        expect(receivedData).toHaveProperty('humidity_soil');
        expect(receivedData).toHaveProperty('light_intensity');
        expect(receivedData).toHaveProperty('co2_level');
        expect(receivedData).toHaveProperty('soil_moisture');
        expect(receivedData).toHaveProperty('soil_ph');
        expect(receivedData).toHaveProperty('air_quality');
        expect(receivedData).toHaveProperty('timestamp');
      }),
      {
        numRuns: 100,
        timeout: 10000,
      }
    );
  }, 15000);

  /**
   * Property: Multiple updates should all be received
   * For any sequence of sensor updates, all updates should be received in order
   */
  test('Property: multiple sensor updates are all received', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(sensorValueArbitrary, { minLength: 2, maxLength: 5 }),
        async (sensorDataArray: EnvironmentData[]) => {
          const receivedUpdates: EnvironmentData[] = [];

          const callback = jest.fn((data: EnvironmentData) => {
            receivedUpdates.push(data);
          });

          const { useSensorUpdates } = require('../useRealtime');
          
          renderHook(() => useSensorUpdates(callback), {
            wrapper: createWrapper(),
          });

          await waitFor(() => {
            expect(mockSocketInstance.on).toHaveBeenCalled();
          }, { timeout: 1000 });

          const sensorUpdateCalls = mockSocketInstance.on.mock.calls.filter(
            (call: any[]) => call[0] === 'sensor:update'
          );
          const eventHandler = sensorUpdateCalls[sensorUpdateCalls.length - 1][1];

          // Send all updates
          for (const sensorData of sensorDataArray) {
            eventHandler(sensorData);
          }

          // Wait for all updates to be received
          await waitFor(
            () => {
              expect(receivedUpdates.length).toBe(sensorDataArray.length);
            },
            { timeout: 2000 }
          );

          // Verify all updates were received
          expect(receivedUpdates.length).toBe(sensorDataArray.length);

          // Verify updates were received in order
          for (let i = 0; i < sensorDataArray.length; i++) {
            expect(receivedUpdates[i]).toEqual(sensorDataArray[i]);
          }
        }
      ),
      {
        numRuns: 50, // Fewer runs since this tests multiple updates per run
        timeout: 5000,
      }
    );
  }, 15000);
});