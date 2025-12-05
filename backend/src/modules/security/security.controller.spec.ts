import { Test, TestingModule } from '@nestjs/testing';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';
import { AccessPointStatus, OffHoursConfig } from './interfaces/security.interface';

describe('SecurityController', () => {
  let controller: SecurityController;
  let service: SecurityService;

  const mockSecurityService = {
    getAllAccessPointStatus: jest.fn(),
    getAccessPointStatus: jest.fn(),
    setOffHoursConfig: jest.fn(),
    getOffHoursConfig: jest.fn(),
    querySecurityLogs: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecurityController],
      providers: [
        {
          provide: SecurityService,
          useValue: mockSecurityService,
        },
      ],
    }).compile();

    controller = module.get<SecurityController>(SecurityController);
    service = module.get<SecurityService>(SecurityService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /security/access-points', () => {
    it('should return all access points', () => {
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
      const result = controller.getAllAccessPoints();

      // Assert
      expect(result).toEqual(mockAccessPoints);
      expect(mockSecurityService.getAllAccessPointStatus).toHaveBeenCalled();
    });
  });

  describe('GET /security/access-points/:id', () => {
    it('should return specific access point', () => {
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
      const result = controller.getAccessPoint('door_001');

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
