import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { IrrigationService } from './irrigation.service';
import { MqttClientService } from '../../common/services/mqtt/mqtt-client.service';
import { InfluxDbService } from '../../common/services/influxdb/influxdb.service';

describe('IrrigationService', () => {
  let service: IrrigationService;
  let mqttClientService: jest.Mocked<MqttClientService>;
  let influxDbService: jest.Mocked<InfluxDbService>;

  beforeEach(async () => {
    const mockMqttClientService = {
      publish: jest.fn().mockResolvedValue(undefined),
      subscribe: jest.fn().mockResolvedValue(undefined),
    };

    const mockInfluxDbService = {
      writeSensorData: jest.fn().mockResolvedValue(undefined),
      flush: jest.fn().mockResolvedValue(undefined),
      query: jest.fn().mockResolvedValue([]),
    };

    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          IRRIGATION_MAX_DURATION_SECONDS: 1800,
          IRRIGATION_MIN_INTERVAL_SECONDS: 7200,
          IRRIGATION_DEFAULT_FLOW_RATE: 80,
          RESERVOIR_LOW_THRESHOLD: 20,
          RESERVOIR_CRITICAL_THRESHOLD: 10,
        };
        return config[key] ?? defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IrrigationService,
        { provide: MqttClientService, useValue: mockMqttClientService },
        { provide: InfluxDbService, useValue: mockInfluxDbService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<IrrigationService>(IrrigationService);
    mqttClientService = module.get(MqttClientService);
    influxDbService = module.get(InfluxDbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleLowMoistureAlert', () => {
    it('should start irrigation when conditions are met', async () => {
      const alert = {
        alertType: 'low_soil_moisture',
        sensorType: 'soil_moisture',
        deviceId: 'soil-sensor-01',
        value: 15.2,
        threshold: 20,
        severity: 'high',
        location: 'zone-a',
        timestamp: new Date().toISOString(),
      };

      await service.handleLowMoistureAlert(alert);

      // Verify MQTT command was published
      expect(mqttClientService.publish).toHaveBeenCalledWith(
        'greenhouse/irrigation/zone-a/command',
        expect.stringContaining('"command":"start"'),
      );

      // Verify data was stored to InfluxDB
      expect(influxDbService.writeSensorData).toHaveBeenCalledWith(
        'irrigation_sessions',
        expect.objectContaining({
          zone: 'zone-a',
          reason: 'automatic',
        }),
        expect.any(Object),
        expect.any(Date),
      );
    });

    it('should not start irrigation when reservoir is below critical threshold', async () => {
      // Set reservoir level to critical
      (service as any).reservoirLevel = 5;

      const alert = {
        alertType: 'low_soil_moisture',
        sensorType: 'soil_moisture',
        deviceId: 'soil-sensor-01',
        value: 15.2,
        threshold: 20,
        severity: 'high',
        location: 'zone-a',
        timestamp: new Date().toISOString(),
      };

      await service.handleLowMoistureAlert(alert);

      // Verify no MQTT command was published
      expect(mqttClientService.publish).not.toHaveBeenCalled();
    });

    it('should not start irrigation when zone is already active', async () => {
      const alert = {
        alertType: 'low_soil_moisture',
        sensorType: 'soil_moisture',
        deviceId: 'soil-sensor-01',
        value: 15.2,
        threshold: 20,
        severity: 'high',
        location: 'zone-a',
        timestamp: new Date().toISOString(),
      };

      // Start irrigation first
      await service.startIrrigation('zone-a', 600, 80, 'manual', 'test-user');

      // Clear previous calls
      mqttClientService.publish.mockClear();
      influxDbService.writeSensorData.mockClear();

      // Try to start again via alert
      await service.handleLowMoistureAlert(alert);

      // Should only have the stop command, not a new start
      const publishCalls = mqttClientService.publish.mock.calls;
      const startCommands = publishCalls.filter(call => 
        call[1].includes('"command":"start"')
      );
      expect(startCommands.length).toBe(0);
    });

    it('should not start irrigation during midday hours (11-15)', async () => {
      // Mock Date to return midday hour
      const mockDate = new Date('2025-11-24T12:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const alert = {
        alertType: 'low_soil_moisture',
        sensorType: 'soil_moisture',
        deviceId: 'soil-sensor-01',
        value: 15.2,
        threshold: 20,
        severity: 'high',
        location: 'zone-a',
        timestamp: mockDate.toISOString(),
      };

      await service.handleLowMoistureAlert(alert);

      // Verify no MQTT command was published
      expect(mqttClientService.publish).not.toHaveBeenCalled();

      jest.restoreAllMocks();
    });
  });

  describe('startIrrigation', () => {
    it('should successfully start irrigation with valid parameters', async () => {
      const session = await service.startIrrigation('zone-a', 600, 80, 'manual', 'test-user');

      expect(session).toBeDefined();
      expect(session.zone).toBe('zone-a');
      expect(session.status).toBe('active');
      expect(mqttClientService.publish).toHaveBeenCalled();
      expect(influxDbService.writeSensorData).toHaveBeenCalled();
    });

    it('should throw error when duration exceeds maximum', async () => {
      await expect(
        service.startIrrigation('zone-a', 2000, 80, 'manual', 'test-user')
      ).rejects.toThrow('Duration exceeds maximum');
    });

    it('should throw error when reservoir is below critical threshold', async () => {
      (service as any).reservoirLevel = 5;

      await expect(
        service.startIrrigation('zone-a', 600, 80, 'manual', 'test-user')
      ).rejects.toThrow('Reservoir level too low');
    });

    it('should throw error when zone is already active', async () => {
      await service.startIrrigation('zone-a', 600, 80, 'manual', 'test-user');

      await expect(
        service.startIrrigation('zone-a', 600, 80, 'manual', 'test-user')
      ).rejects.toThrow('Zone zone-a is already irrigating');
    });
  });

  describe('getStatus', () => {
    it('should return status for all zones', () => {
      const status = service.getStatus();

      expect(status.zones).toHaveLength(2);
      expect(status.zones[0].zone).toBe('zone-a');
      expect(status.zones[1].zone).toBe('zone-b');
      expect(status.reservoir).toBeDefined();
      expect(status.reservoir.level).toBe(75);
    });

    it('should show active status for irrigating zone', async () => {
      await service.startIrrigation('zone-a', 600, 80, 'manual', 'test-user');

      const status = service.getStatus();
      const zoneA = status.zones.find(z => z.zone === 'zone-a');

      expect(zoneA?.status).toBe('active');
      expect(zoneA?.startTime).toBeDefined();
      expect(zoneA?.estimatedEndTime).toBeDefined();
    });
  });
});
