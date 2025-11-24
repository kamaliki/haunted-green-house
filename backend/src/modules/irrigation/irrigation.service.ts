import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MqttClientService } from '../../common/services/mqtt/mqtt-client.service';
import { InfluxDbService } from '../../common/services/influxdb/influxdb.service';
import { IrrigationSession, IrrigationCommand, ZoneStatus } from './interfaces/irrigation.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class IrrigationService {
  private readonly logger = new Logger(IrrigationService.name);
  private activeSessions: Map<string, IrrigationSession> = new Map();
  private lastIrrigationTimes: Map<string, Date> = new Map();
  private reservoirLevel: number = 75; // Simulated reservoir level

  private readonly MAX_DURATION_SECONDS: number;
  private readonly MIN_INTERVAL_SECONDS: number;
  private readonly DEFAULT_FLOW_RATE: number;
  private readonly RESERVOIR_LOW_THRESHOLD: number;
  private readonly RESERVOIR_CRITICAL_THRESHOLD: number;

  constructor(
    private mqttClientService: MqttClientService,
    private influxDbService: InfluxDbService,
    private configService: ConfigService,
  ) {
    this.MAX_DURATION_SECONDS = this.configService.get<number>('IRRIGATION_MAX_DURATION_SECONDS', 1800);
    this.MIN_INTERVAL_SECONDS = this.configService.get<number>('IRRIGATION_MIN_INTERVAL_SECONDS', 7200);
    this.DEFAULT_FLOW_RATE = this.configService.get<number>('IRRIGATION_DEFAULT_FLOW_RATE', 80);
    this.RESERVOIR_LOW_THRESHOLD = this.configService.get<number>('RESERVOIR_LOW_THRESHOLD', 20);
    this.RESERVOIR_CRITICAL_THRESHOLD = this.configService.get<number>('RESERVOIR_CRITICAL_THRESHOLD', 10);
  }

  async handleLowMoistureAlert(alert: any): Promise<void> {
    this.logger.log(`Received low moisture alert for ${alert.deviceId}: ${alert.value}%`);

    // Determine zone from device ID
    const zone = this.getZoneFromDeviceId(alert.deviceId);
    
    // Evaluate if irrigation should start
    const canIrrigate = await this.evaluateIrrigationTrigger(zone, alert);
    
    if (canIrrigate) {
      const duration = this.calculateDuration(alert.value);
      await this.startIrrigation(zone, duration, this.DEFAULT_FLOW_RATE, 'automatic', 'low_moisture_alert');
    } else {
      this.logger.warn(`Cannot start irrigation for ${zone} - conditions not met`);
    }
  }

  async startIrrigation(
    zone: string,
    durationSeconds: number,
    flowRatePercent: number,
    reason: 'automatic' | 'manual',
    initiatedBy: string,
  ): Promise<IrrigationSession> {
    // Validate duration
    if (durationSeconds > this.MAX_DURATION_SECONDS) {
      throw new BadRequestException(`Duration exceeds maximum of ${this.MAX_DURATION_SECONDS} seconds`);
    }

    // Check if zone is already active
    if (this.isZoneActive(zone)) {
      throw new BadRequestException(`Zone ${zone} is already irrigating`);
    }

    // Check reservoir level
    if (this.reservoirLevel < this.RESERVOIR_CRITICAL_THRESHOLD) {
      throw new BadRequestException(`Reservoir level too low: ${this.reservoirLevel}%`);
    }

    // Create session
    const session: IrrigationSession = {
      sessionId: uuidv4(),
      zone,
      startTime: new Date(),
      durationSeconds,
      flowRatePercent,
      reason,
      initiatedBy,
      status: 'active',
    };

    this.activeSessions.set(zone, session);
    this.lastIrrigationTimes.set(zone, new Date());

    // Publish MQTT command to actuator
    const command: IrrigationCommand = {
      command: 'start',
      zone,
      durationSeconds,
      flowRatePercent,
      reason: initiatedBy,
      initiatedBy,
      timestamp: new Date(),
    };

    await this.mqttClientService.publish(
      `greenhouse/irrigation/${zone}/command`,
      JSON.stringify(command),
    );

    // Store to InfluxDB
    await this.influxDbService.writeSensorData(
      'irrigation_sessions',
      {
        zone,
        reason,
        initiated_by: initiatedBy,
      },
      {
        duration_seconds: durationSeconds,
        flow_rate_percent: flowRatePercent,
        status: 'active',
      },
      session.startTime,
    );

    await this.influxDbService.flush();

    this.logger.log(`Started irrigation for ${zone}: ${durationSeconds}s at ${flowRatePercent}% flow`);

    // Schedule auto-stop
    setTimeout(() => {
      this.stopIrrigation(zone, 'automatic_timeout').catch(err => {
        this.logger.error(`Failed to auto-stop irrigation for ${zone}: ${err.message}`);
      });
    }, durationSeconds * 1000);

    return session;
  }

  async stopIrrigation(zone: string, initiatedBy: string): Promise<void> {
    const session = this.activeSessions.get(zone);
    
    if (!session) {
      throw new BadRequestException(`No active irrigation session for zone ${zone}`);
    }

    session.status = 'completed';
    session.endTime = new Date();

    // Publish stop command
    const command: IrrigationCommand = {
      command: 'stop',
      zone,
      reason: 'manual_stop',
      initiatedBy,
      timestamp: new Date(),
    };

    await this.mqttClientService.publish(
      `greenhouse/irrigation/${zone}/command`,
      JSON.stringify(command),
    );

    // Update InfluxDB
    await this.influxDbService.writeSensorData(
      'irrigation_sessions',
      {
        zone,
        session_id: session.sessionId,
      },
      {
        status: 'completed',
        actual_duration: Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000),
      },
      session.endTime,
    );

    await this.influxDbService.flush();

    this.activeSessions.delete(zone);
    this.logger.log(`Stopped irrigation for ${zone}`);
  }

  getStatus(): { zones: ZoneStatus[]; reservoir: { level: number; status: string } } {
    const zones: ZoneStatus[] = ['zone-a', 'zone-b'].map(zone => {
      const session = this.activeSessions.get(zone);
      const lastIrrigation = this.lastIrrigationTimes.get(zone);

      if (session) {
        return {
          zone,
          status: 'active',
          startTime: session.startTime,
          estimatedEndTime: new Date(session.startTime.getTime() + session.durationSeconds * 1000),
          flowRate: session.flowRatePercent,
          lastIrrigation,
        };
      }

      return {
        zone,
        status: 'idle',
        lastIrrigation,
      };
    });

    return {
      zones,
      reservoir: {
        level: this.reservoirLevel,
        status: this.reservoirLevel < this.RESERVOIR_LOW_THRESHOLD ? 'low' : 'normal',
      },
    };
  }

  private async evaluateIrrigationTrigger(zone: string, alert: any): Promise<boolean> {
    // Check reservoir level
    if (this.reservoirLevel < this.RESERVOIR_CRITICAL_THRESHOLD) {
      this.logger.warn(`Reservoir level too low: ${this.reservoirLevel}%`);
      return false;
    }

    // Check if zone is already active
    if (this.isZoneActive(zone)) {
      this.logger.debug(`Zone ${zone} is already irrigating`);
      return false;
    }

    // Check minimum interval
    const lastIrrigation = this.lastIrrigationTimes.get(zone);
    if (lastIrrigation) {
      const timeSinceLastIrrigation = Date.now() - lastIrrigation.getTime();
      if (timeSinceLastIrrigation < this.MIN_INTERVAL_SECONDS * 1000) {
        this.logger.debug(`Zone ${zone} irrigated too recently`);
        return false;
      }
    }

    // Check time restrictions (avoid midday irrigation)
    const hour = new Date().getHours();
    if (hour >= 11 && hour <= 15) {
      this.logger.debug('Avoiding midday irrigation');
      return false;
    }

    return true;
  }

  private calculateDuration(currentMoisture: number, targetMoisture: number = 60): number {
    const deficit = targetMoisture - currentMoisture;
    const baseSeconds = 300; // 5 minutes base
    const multiplier = deficit / 10; // 1 minute per 10% deficit
    
    const duration = baseSeconds + (multiplier * 60);
    return Math.min(duration, this.MAX_DURATION_SECONDS);
  }

  private getZoneFromDeviceId(deviceId: string): string {
    // Map device IDs to zones
    if (deviceId.includes('01')) return 'zone-a';
    if (deviceId.includes('02')) return 'zone-b';
    return 'zone-a'; // default
  }

  private isZoneActive(zone: string): boolean {
    return this.activeSessions.has(zone);
  }
}
