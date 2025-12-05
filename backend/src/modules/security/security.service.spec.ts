import { Test, TestingModule } from '@nestjs/testing';
import { SecurityService } from './security.service';
import { InfluxDbService } from '../../common/services/influxdb/influxdb.service';
import { AlertService } from '../../common/services/alerts/alert.service';
import { MotionEvent, AccessPointStatus } from './interfaces/security.interface';
import * as fc from 'fast-check';

describe('SecurityService', () => {
  let service: SecurityService;
  let influxDbService: InfluxDbService;
  let alertService: AlertService;

  const mockInfluxDbService = {
    getBucket: jest.fn().mockReturnValue('test-bucket'),
    query: jest.fn(),
    writeSensorData: jest.fn(),
    flush: jest.fn(),
  };

  const mockAlertService = {
    sendSecurityAlert: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityService,
        {
          provide: InfluxDbService,
          useValue: mockInfluxDbService,
        },
        {
          provide: AlertService,
          useValue: mockAlertService,
        },
      ],
    }).compile();

    service = module.get<SecurityService>(SecurityService);
    influxDbService = module.get<InfluxDbService>(InfluxDbService);
    alertService = module.get<AlertService>(AlertService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('motion detection', () => {
    it('should handle motion detection and trigger alert when off-hours monitoring is disabled', async () => {
      // Arrange
      const motionEvent: MotionEvent = {
        timestamp: new Date(),
        location: 'entrance',
        confidence: 95,
        sensorId: 'motion_001',
      };

      // Act
      await service.handleMotionDetection(motionEvent);

      // Assert
      expect(mockInfluxDbService.writeSensorData).toHaveBeenCalledWith(
        'security_events',
        expect.objectContaining({
          type: 'motion_detected',
          location: 'entrance',
        }),
        expect.any(Object),
        motionEvent.timestamp,
      );
      expect(mockInfluxDbService.flush).toHaveBeenCalled();
      expect(mockAlertService.sendSecurityAlert).toHaveBeenCalledWith(
        'motion',
        'entrance',
        expect.stringContaining('Motion detected'),
        expect.objectContaining({ confidence: 95 }),
      );
    });

    it('should trigger alert during off-hours when monitoring is enabled', async () => {
      // Arrange
      service.setOffHoursConfig({
        enabled: true,
        startHour: 18,
        endHour: 6,
      });

      // Create a date at 22:00 (10 PM) - within off-hours
      const offHoursDate = new Date();
      offHoursDate.setHours(22, 0, 0, 0);

      const motionEvent: MotionEvent = {
        timestamp: offHoursDate,
        location: 'greenhouse_main',
        confidence: 90,
        sensorId: 'motion_002',
      };

      // Act
      await service.handleMotionDetection(motionEvent);

      // Assert
      expect(mockAlertService.sendSecurityAlert).toHaveBeenCalled();
    });

    it('should not trigger alert outside off-hours when monitoring is enabled', async () => {
      // Arrange
      service.setOffHoursConfig({
        enabled: true,
        startHour: 18,
        endHour: 6,
      });

      // Create a date at 12:00 (noon) - outside off-hours
      const businessHoursDate = new Date();
      businessHoursDate.setHours(12, 0, 0, 0);

      const motionEvent: MotionEvent = {
        timestamp: businessHoursDate,
        location: 'greenhouse_main',
        confidence: 90,
        sensorId: 'motion_002',
      };

      // Act
      await service.handleMotionDetection(motionEvent);

      // Assert
      expect(mockInfluxDbService.writeSensorData).toHaveBeenCalled();
      expect(mockAlertService.sendSecurityAlert).not.toHaveBeenCalled();
    });

    it('should log motion event even when alert is not triggered', async () => {
      // Arrange
      service.setOffHoursConfig({
        enabled: true,
        startHour: 18,
        endHour: 6,
      });

      const businessHoursDate = new Date();
      businessHoursDate.setHours(12, 0, 0, 0);

      const motionEvent: MotionEvent = {
        timestamp: businessHoursDate,
        location: 'greenhouse_main',
        confidence: 85,
        sensorId: 'motion_003',
      };

      // Act
      await service.handleMotionDetection(motionEvent);

      // Assert
      expect(mockInfluxDbService.writeSensorData).toHaveBeenCalled();
      expect(mockInfluxDbService.flush).toHaveBeenCalled();
    });
  });

  describe('access point monitoring', () => {
    it('should update access point status and log event', async () => {
      // Arrange
      const accessPoint: AccessPointStatus = {
        id: 'door_001',
        type: 'door',
        location: 'main_entrance',
        status: 'open',
        lastChanged: new Date(),
      };

      // Act
      await service.updateAccessPointStatus(accessPoint);

      // Assert
      expect(mockInfluxDbService.writeSensorData).toHaveBeenCalledWith(
        'security_events',
        expect.objectContaining({
          type: 'door_opened',
          location: 'main_entrance',
        }),
        expect.any(Object),
        accessPoint.lastChanged,
      );
      expect(mockInfluxDbService.flush).toHaveBeenCalled();
    });

    it('should track state changes for access points', async () => {
      // Arrange
      const accessPoint1: AccessPointStatus = {
        id: 'window_001',
        type: 'window',
        location: 'north_wall',
        status: 'closed',
        lastChanged: new Date(),
      };

      const accessPoint2: AccessPointStatus = {
        id: 'window_001',
        type: 'window',
        location: 'north_wall',
        status: 'open',
        lastChanged: new Date(),
      };

      // Act
      await service.updateAccessPointStatus(accessPoint1);
      await service.updateAccessPointStatus(accessPoint2);

      // Assert
      const currentStatus = service.getAccessPointStatus('window_001');
      expect(currentStatus?.status).toBe('open');
    });

    it('should return all access point statuses', async () => {
      // Arrange
      const door: AccessPointStatus = {
        id: 'door_001',
        type: 'door',
        location: 'entrance',
        status: 'closed',
        lastChanged: new Date(),
      };

      const window: AccessPointStatus = {
        id: 'window_001',
        type: 'window',
        location: 'north_wall',
        status: 'open',
        lastChanged: new Date(),
      };

      // Act
      await service.updateAccessPointStatus(door);
      await service.updateAccessPointStatus(window);
      const allStatuses = service.getAllAccessPointStatus();

      // Assert
      expect(allStatuses).toHaveLength(2);
      expect(allStatuses.some((s) => s.id === 'door_001')).toBe(true);
      expect(allStatuses.some((s) => s.id === 'window_001')).toBe(true);
    });
  });

  describe('off-hours configuration', () => {
    it('should set and get off-hours configuration', () => {
      // Arrange
      const config = {
        enabled: true,
        startHour: 20,
        endHour: 7,
      };

      // Act
      service.setOffHoursConfig(config);
      const retrievedConfig = service.getOffHoursConfig();

      // Assert
      expect(retrievedConfig).toEqual(config);
    });

    it('should handle off-hours period that crosses midnight', async () => {
      // Arrange
      service.setOffHoursConfig({
        enabled: true,
        startHour: 22, // 10 PM
        endHour: 6, // 6 AM
      });

      // Test at 23:00 (11 PM) - should be in off-hours
      const lateNight = new Date();
      lateNight.setHours(23, 0, 0, 0);

      const motionEvent1: MotionEvent = {
        timestamp: lateNight,
        location: 'test',
        confidence: 90,
        sensorId: 'test_001',
      };

      // Test at 3:00 AM - should be in off-hours
      const earlyMorning = new Date();
      earlyMorning.setHours(3, 0, 0, 0);

      const motionEvent2: MotionEvent = {
        timestamp: earlyMorning,
        location: 'test',
        confidence: 90,
        sensorId: 'test_002',
      };

      // Test at 12:00 PM - should NOT be in off-hours
      const noon = new Date();
      noon.setHours(12, 0, 0, 0);

      const motionEvent3: MotionEvent = {
        timestamp: noon,
        location: 'test',
        confidence: 90,
        sensorId: 'test_003',
      };

      // Act & Assert
      await service.handleMotionDetection(motionEvent1);
      expect(mockAlertService.sendSecurityAlert).toHaveBeenCalledTimes(1);

      jest.clearAllMocks();
      await service.handleMotionDetection(motionEvent2);
      expect(mockAlertService.sendSecurityAlert).toHaveBeenCalledTimes(1);

      jest.clearAllMocks();
      await service.handleMotionDetection(motionEvent3);
      expect(mockAlertService.sendSecurityAlert).not.toHaveBeenCalled();
    });
  });

  describe('security log queries', () => {
    it('should query security logs with filters', async () => {
      // Arrange
      const mockResults = [
        {
          id: 'event_001',
          type: 'motion_detected',
          _time: '2024-01-01T12:00:00Z',
          location: 'entrance',
          details: JSON.stringify({ confidence: 95 }),
        },
        {
          id: 'event_002',
          type: 'door_opened',
          _time: '2024-01-01T13:00:00Z',
          location: 'main_door',
          details: JSON.stringify({ accessPointId: 'door_001' }),
        },
      ];

      mockInfluxDbService.query.mockResolvedValue(mockResults);

      // Act
      const result = await service.querySecurityLogs(
        'motion_detected',
        new Date('2024-01-01'),
        new Date('2024-01-02'),
        'entrance',
      );

      // Assert
      expect(result).toHaveLength(2);
      expect(mockInfluxDbService.query).toHaveBeenCalled();
    });

    it('should return logs in reverse chronological order', async () => {
      // Arrange
      const mockResults = [
        {
          id: 'event_001',
          type: 'motion_detected',
          _time: '2024-01-01T12:00:00Z',
          location: 'entrance',
          details: '{}',
        },
        {
          id: 'event_002',
          type: 'motion_detected',
          _time: '2024-01-01T14:00:00Z',
          location: 'entrance',
          details: '{}',
        },
      ];

      mockInfluxDbService.query.mockResolvedValue(mockResults);

      // Act
      const result = await service.querySecurityLogs();

      // Assert
      expect(result[0].timestamp.getTime()).toBeGreaterThan(
        result[1].timestamp.getTime(),
      );
    });

    it('should handle empty query results', async () => {
      // Arrange
      mockInfluxDbService.query.mockResolvedValue([]);

      // Act
      const result = await service.querySecurityLogs();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('Property-Based Tests', () => {
    // Feature: haunted-greenhouse, Property 33: Access point state monitoring
    // Validates: Requirements 16.1, 16.3
    it('Property 33: For any door or window sensor, the System SHALL report the current state as either "open" or "closed", and when the state changes, the System SHALL log the event with timestamp and location', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 50 }),
            type: fc.constantFrom('door' as const, 'window' as const),
            location: fc.string({ minLength: 1, maxLength: 100 }),
            status: fc.constantFrom('open' as const, 'closed' as const),
            lastChanged: fc.date(),
          }),
          async (accessPoint: AccessPointStatus) => {
            // Reset mocks for each iteration
            jest.clearAllMocks();

            // Act: Update access point status
            await service.updateAccessPointStatus(accessPoint);

            // Assert 1: State is reported as either "open" or "closed"
            const retrievedStatus = service.getAccessPointStatus(accessPoint.id);
            expect(retrievedStatus).toBeDefined();
            expect(retrievedStatus?.status).toMatch(/^(open|closed)$/);
            expect(retrievedStatus?.status).toBe(accessPoint.status);

            // Assert 2: Event is logged with timestamp and location
            expect(mockInfluxDbService.writeSensorData).toHaveBeenCalledWith(
              'security_events',
              expect.objectContaining({
                type: expect.stringMatching(/^(door|window)_(opened|closed)$/),
                location: accessPoint.location,
              }),
              expect.objectContaining({
                id: expect.any(String),
                details: expect.any(String),
              }),
              accessPoint.lastChanged,
            );
            expect(mockInfluxDbService.flush).toHaveBeenCalled();
          },
        ),
        { numRuns: 100 },
      );
    });

    // Feature: haunted-greenhouse, Property 34: Access point status query completeness
    // Validates: Requirements 16.4
    it('Property 34: For any request for access point status, the System SHALL return the current state of all monitored doors and windows', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 50 }),
              type: fc.constantFrom('door' as const, 'window' as const),
              location: fc.string({ minLength: 1, maxLength: 100 }),
              status: fc.constantFrom('open' as const, 'closed' as const),
              lastChanged: fc.date(),
            }),
            { minLength: 1, maxLength: 20 },
          ),
          async (accessPoints: AccessPointStatus[]) => {
            // Reset service state by creating a new instance
            const module: TestingModule = await Test.createTestingModule({
              providers: [
                SecurityService,
                {
                  provide: InfluxDbService,
                  useValue: mockInfluxDbService,
                },
                {
                  provide: AlertService,
                  useValue: mockAlertService,
                },
              ],
            }).compile();

            const freshService = module.get<SecurityService>(SecurityService);
            jest.clearAllMocks();

            // Create a map to track unique access points (by id)
            const uniqueAccessPoints = new Map<string, AccessPointStatus>();
            for (const ap of accessPoints) {
              uniqueAccessPoints.set(ap.id, ap);
            }

            // Act: Update all access point statuses
            for (const ap of accessPoints) {
              await freshService.updateAccessPointStatus(ap);
            }

            // Act: Request all access point statuses
            const allStatuses = freshService.getAllAccessPointStatus();

            // Assert: All monitored access points are returned
            expect(allStatuses.length).toBe(uniqueAccessPoints.size);

            // Assert: Each unique access point is present in the result
            for (const [id, expectedAp] of uniqueAccessPoints.entries()) {
              const foundStatus = allStatuses.find((s) => s.id === id);
              expect(foundStatus).toBeDefined();
              expect(foundStatus?.type).toBe(expectedAp.type);
              expect(foundStatus?.location).toBe(expectedAp.location);
              expect(foundStatus?.status).toBe(expectedAp.status);
            }

            // Assert: All returned statuses have valid state values
            for (const status of allStatuses) {
              expect(status.status).toMatch(/^(open|closed)$/);
              expect(status.type).toMatch(/^(door|window)$/);
            }
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
