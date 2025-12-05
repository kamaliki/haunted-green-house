import { Test, TestingModule } from '@nestjs/testing';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';
import { AccessPointMonitoringService } from './services/access-point-monitoring.service';
import { AccessPoint } from './entities/access-point.entity';
import { AccessPointStatus, OffHoursConfig } from './interfaces/security.interface';

describe('SecurityController', () => {
  let controller: SecurityController;
  let service: SecurityService;
  let monitoringService: AccessPointMonitoringService;

  const mockSecurityService = {
    createAccessPoint: jest.fn(),
    findAllAccessPoints: jest.fn(),
    findAccessPointById: jest.fn(),
    updateAccessPoint: jest.fn(),
    deleteAccessPoint: jest.fn(),
    getAllAccessPointStatus: jest.fn(),
    getAccessPointStatus: jest.fn(),
    setOffHoursConfig: jest.fn(),
    getOffHoursConfig: jest.fn(),
    querySecurityLogs: jest.fn(),
  };

  const mockMonitoringService = {
    getAccessPointsExceedingThreshold: jest.fn(),
    getOpenDuration: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecurityController],
      providers: [
        {
          provide: SecurityService,
          useValue: mockSecurityService,
        },
        {
          provide: AccessPointMonitoringService,
          useValue: mockMonitoringService,
        },
      ],
    }).compile();

    controller = module.get<SecurityController>(SecurityController);
    service = module.get<SecurityService>(SecurityService);
    monitoringService = module.get<AccessPointMonitoringService>(AccessPointMonitoringService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /security/access-points', () => {
    it('should return all access points', async () => {
      // Arrange
      const mockAccessPoints: AccessPoint[] = [
        {
          id: 'uuid-1',
          name: 'Main Door',
          type: 'door',
          location: 'entrance',
          status: 'closed',
          monitoringEnabled: true,
          alertThreshold: 300,
          lastStatusChange: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'uuid-2',
          name: 'North Window',
          type: 'window',
          location: 'north_wall',
          status: 'open',
          monitoringEnabled: true,
          alertThreshold: 300,
          lastStatusChange: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockSecurityService.findAllAccessPoints.mockResolvedValue(mockAccessPoints);

      // Act
      const result = await controller.getAllAccessPoints();

      // Assert
      expect(result).toEqual(mockAccessPoints);
      expect(mockSecurityService.findAllAccessPoints).toHaveBeenCalled();
    });
  });

  describe('POST /security/access-points', () => {
    it('should create a new access point', async () => {
      // Arrange
      const createDto = {
        name: 'Main Door',
        type: 'door' as const,
        location: 'entrance',
      };

      const createdAccessPoint: AccessPoint = {
        id: 'uuid-123',
        ...createDto,
        status: 'closed',
        monitoringEnabled: true,
        alertThreshold: 300,
        lastStatusChange: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSecurityService.createAccessPoint.mockResolvedValue(createdAccessPoint);

      // Act
      const result = await controller.createAccessPoint(createDto);

      // Assert
      expect(result).toEqual(createdAccessPoint);
      expect(mockSecurityService.createAccessPoint).toHaveBeenCalledWith(createDto);
    });
  });

  describe('GET /security/access-points/:id', () => {
    it('should return specific access point by ID', async () => {
      // Arrange
      const mockAccessPoint: AccessPoint = {
        id: 'uuid-123',
        name: 'Main Door',
        type: 'door',
        location: 'entrance',
        status: 'closed',
        monitoringEnabled: true,
        alertThreshold: 300,
        lastStatusChange: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSecurityService.findAccessPointById.mockResolvedValue(mockAccessPoint);

      // Act
      const result = await controller.getAccessPoint('uuid-123');

      // Assert
      expect(result).toEqual(mockAccessPoint);
      expect(mockSecurityService.findAccessPointById).toHaveBeenCalledWith('uuid-123');
    });
  });

  describe('PATCH /security/access-points/:id', () => {
    it('should update an access point', async () => {
      // Arrange
      const updateDto = {
        name: 'Updated Door',
        alertThreshold: 600,
      };

      const updatedAccessPoint: AccessPoint = {
        id: 'uuid-123',
        name: 'Updated Door',
        type: 'door',
        location: 'entrance',
        status: 'closed',
        monitoringEnabled: true,
        alertThreshold: 600,
        lastStatusChange: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSecurityService.updateAccessPoint.mockResolvedValue(updatedAccessPoint);

      // Act
      const result = await controller.updateAccessPoint('uuid-123', updateDto);

      // Assert
      expect(result).toEqual(updatedAccessPoint);
      expect(mockSecurityService.updateAccessPoint).toHaveBeenCalledWith(
        'uuid-123',
        updateDto,
      );
    });
  });

  describe('DELETE /security/access-points/:id', () => {
    it('should delete an access point', async () => {
      // Arrange
      mockSecurityService.deleteAccessPoint.mockResolvedValue(undefined);

      // Act
      await controller.deleteAccessPoint('uuid-123');

      // Assert
      expect(mockSecurityService.deleteAccessPoint).toHaveBeenCalledWith('uuid-123');
    });
  });

  describe('GET /security/access-points-status', () => {
    it('should return all access point statuses', () => {
      // Arrange
      const mockAccessPoints: AccessPointStatus[] = [
        {
          id: 'door_001',
          type: 'door',
          location: 'entrance',
          status: 'closed',
          lastChanged: new Date(),
        },
        {
          id: 'window_001',
          type: 'window',
          location: 'north_wall',
          status: 'open',
          lastChanged: new Date(),
        },
      ];

      mockSecurityService.getAllAccessPointStatus.mockReturnValue(mockAccessPoints);

      // Act
      const result = controller.getAllAccessPointStatus();

      // Assert
      expect(result).toEqual(mockAccessPoints);
      expect(mockSecurityService.getAllAccessPointStatus).toHaveBeenCalled();
    });
  });

  describe('GET /security/access-points-status/:id', () => {
    it('should return specific access point status', () => {
      // Arrange
      const mockAccessPoint: AccessPointStatus = {
        id: 'door_001',
        type: 'door',
        location: 'entrance',
        status: 'closed',
        lastChanged: new Date(),
      };

      mockSecurityService.getAccessPointStatus.mockReturnValue(mockAccessPoint);

      // Act
      const result = controller.getAccessPointStatus('door_001');

      // Assert
      expect(result).toEqual(mockAccessPoint);
      expect(mockSecurityService.getAccessPointStatus).toHaveBeenCalledWith('door_001');
    });
  });

  describe('POST /security/off-hours-config', () => {
    it('should set off-hours configuration', () => {
      // Arrange
      const config: OffHoursConfig = {
        enabled: true,
        startHour: 18,
        endHour: 6,
      };

      mockSecurityService.getOffHoursConfig.mockReturnValue(config);

      // Act
      const result = controller.setOffHoursConfig(config);

      // Assert
      expect(result).toEqual(config);
      expect(mockSecurityService.setOffHoursConfig).toHaveBeenCalledWith(config);
      expect(mockSecurityService.getOffHoursConfig).toHaveBeenCalled();
    });
  });

  describe('GET /security/off-hours-config', () => {
    it('should return current off-hours configuration', () => {
      // Arrange
      const config: OffHoursConfig = {
        enabled: false,
        startHour: 18,
        endHour: 6,
      };

      mockSecurityService.getOffHoursConfig.mockReturnValue(config);

      // Act
      const result = controller.getOffHoursConfig();

      // Assert
      expect(result).toEqual(config);
      expect(mockSecurityService.getOffHoursConfig).toHaveBeenCalled();
    });
  });

  describe('GET /security/logs', () => {
    it('should query security logs with filters', async () => {
      // Arrange
      const mockLogs = [
        {
          id: 'event_001',
          type: 'motion_detected' as const,
          timestamp: new Date(),
          location: 'entrance',
          details: { confidence: 95 },
        },
      ];

      mockSecurityService.querySecurityLogs.mockResolvedValue(mockLogs);

      const query = {
        eventType: 'motion_detected',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-02'),
        location: 'entrance',
      };

      // Act
      const result = await controller.getSecurityLogs(query);

      // Assert
      expect(result).toEqual(mockLogs);
      expect(mockSecurityService.querySecurityLogs).toHaveBeenCalledWith(
        query.eventType,
        query.startDate,
        query.endDate,
        query.location,
      );
    });
  });
});
