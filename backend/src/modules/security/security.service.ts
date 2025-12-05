import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfluxDbService } from '../../common/services/influxdb/influxdb.service';
import { AlertService } from '../alerts/alert.service';
import {
  MotionEvent,
  AccessPointStatus,
  SecurityEvent,
  OffHoursConfig,
  SecurityAlert,
} from './interfaces/security.interface';
import { AccessPoint } from './entities/access-point.entity';
import { CreateAccessPointDto } from './dto/create-access-point.dto';
import { UpdateAccessPointDto } from './dto/update-access-point.dto';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);
  private accessPointStates: Map<string, AccessPointStatus> = new Map();
  private offHoursConfig: OffHoursConfig = {
    enabled: false,
    startHour: 18, // 6 PM
    endHour: 6, // 6 AM
  };

  constructor(
    @InjectRepository(AccessPoint)
    private readonly accessPointRepository: Repository<AccessPoint>,
    private readonly influxDbService: InfluxDbService,
    private readonly alertService: AlertService,
  ) {}

  /**
   * Create a new access point
   */
  async createAccessPoint(createDto: CreateAccessPointDto): Promise<AccessPoint> {
    // Validate required fields
    if (!createDto.name || !createDto.type || !createDto.location) {
      throw new BadRequestException('Name, type, and location are required fields');
    }

    // Check for duplicate name in the same location
    const existing = await this.accessPointRepository.findOne({
      where: {
        name: createDto.name,
        location: createDto.location,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Access point with name "${createDto.name}" already exists at location "${createDto.location}"`,
      );
    }

    const accessPoint = this.accessPointRepository.create({
      ...createDto,
      status: createDto.status || 'closed',
      monitoringEnabled: createDto.monitoringEnabled ?? true,
      alertThreshold: createDto.alertThreshold ?? 300,
      lastStatusChange: new Date(),
    });

    const saved = await this.accessPointRepository.save(accessPoint);
    this.logger.log(`Created access point: ${saved.name} (${saved.id})`);
    
    return saved;
  }

  /**
   * Get all access points
   */
  async findAllAccessPoints(): Promise<AccessPoint[]> {
    return this.accessPointRepository.find({
      order: {
        type: 'ASC',
        name: 'ASC',
      },
    });
  }

  /**
   * Get a single access point by ID
   */
  async findAccessPointById(id: string): Promise<AccessPoint> {
    const accessPoint = await this.accessPointRepository.findOne({
      where: { id },
    });

    if (!accessPoint) {
      throw new NotFoundException(`Access point with ID "${id}" not found`);
    }

    return accessPoint;
  }

  /**
   * Update an access point
   */
  async updateAccessPoint(
    id: string,
    updateDto: UpdateAccessPointDto,
  ): Promise<AccessPoint> {
    const accessPoint = await this.findAccessPointById(id);

    // If name or location is being changed, check for duplicates
    if (
      (updateDto.name && updateDto.name !== accessPoint.name) ||
      (updateDto.location && updateDto.location !== accessPoint.location)
    ) {
      const newName = updateDto.name || accessPoint.name;
      const newLocation = updateDto.location || accessPoint.location;

      const existing = await this.accessPointRepository.findOne({
        where: {
          name: newName,
          location: newLocation,
        },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException(
          `Access point with name "${newName}" already exists at location "${newLocation}"`,
        );
      }
    }

    // Update status change timestamp if status is being changed
    if (updateDto.status && updateDto.status !== accessPoint.status) {
      updateDto['lastStatusChange'] = new Date();
    }

    Object.assign(accessPoint, updateDto);
    const updated = await this.accessPointRepository.save(accessPoint);
    
    this.logger.log(`Updated access point: ${updated.name} (${updated.id})`);
    return updated;
  }

  /**
   * Delete an access point
   */
  async deleteAccessPoint(id: string): Promise<void> {
    const accessPoint = await this.findAccessPointById(id);
    await this.accessPointRepository.remove(accessPoint);
    
    // Remove from in-memory state if present
    this.accessPointStates.delete(id);
    
    this.logger.log(`Deleted access point: ${accessPoint.name} (${id})`);
  }

  /**
   * Handle motion detection event
   */
  async handleMotionDetection(motionEvent: MotionEvent): Promise<void> {
    this.logger.log(
      `Motion detected at ${motionEvent.location} with confidence ${motionEvent.confidence}%`,
    );

    // Check if we should trigger alert based on off-hours configuration
    const shouldAlert = this.shouldTriggerMotionAlert(motionEvent.timestamp);

    // Log the security event
    await this.logSecurityEvent({
      id: `motion_${Date.now()}`,
      type: 'motion_detected',
      timestamp: motionEvent.timestamp,
      location: motionEvent.location,
      details: {
        confidence: motionEvent.confidence,
        sensorId: motionEvent.sensorId,
      },
    });

    // Trigger alert if needed
    if (shouldAlert) {
      await this.triggerSecurityAlert({
        id: `alert_motion_${Date.now()}`,
        type: 'motion',
        timestamp: motionEvent.timestamp,
        location: motionEvent.location,
        confidence: motionEvent.confidence,
        details: `Motion detected at ${motionEvent.location} with ${motionEvent.confidence}% confidence`,
      });
    }
  }

  /**
   * Update access point status (door or window)
   */
  async updateAccessPointStatus(
    accessPoint: AccessPointStatus,
  ): Promise<void> {
    this.logger.log(
      `Access point ${accessPoint.id} (${accessPoint.type}) at ${accessPoint.location} is now ${accessPoint.status}`,
    );

    // Store previous state
    const previousState = this.accessPointStates.get(accessPoint.id);

    // Update current state
    this.accessPointStates.set(accessPoint.id, accessPoint);

    // Determine event type
    const eventType =
      accessPoint.status === 'open'
        ? `${accessPoint.type}_opened`
        : `${accessPoint.type}_closed`;

    // Log the security event
    await this.logSecurityEvent({
      id: `access_${Date.now()}`,
      type: eventType as SecurityEvent['type'],
      timestamp: accessPoint.lastChanged,
      location: accessPoint.location,
      details: {
        accessPointId: accessPoint.id,
        type: accessPoint.type,
        status: accessPoint.status,
        previousStatus: previousState?.status,
      },
    });
  }

  /**
   * Get current status of all access points
   */
  getAllAccessPointStatus(): AccessPointStatus[] {
    return Array.from(this.accessPointStates.values());
  }

  /**
   * Get status of a specific access point
   */
  getAccessPointStatus(id: string): AccessPointStatus | undefined {
    return this.accessPointStates.get(id);
  }

  /**
   * Configure off-hours monitoring
   */
  setOffHoursConfig(config: OffHoursConfig): void {
    this.offHoursConfig = config;
    this.logger.log(
      `Off-hours monitoring ${config.enabled ? 'enabled' : 'disabled'}: ${config.startHour}:00 - ${config.endHour}:00`,
    );
  }

  /**
   * Get current off-hours configuration
   */
  getOffHoursConfig(): OffHoursConfig {
    return { ...this.offHoursConfig };
  }

  /**
   * Query security logs from InfluxDB
   */
  async querySecurityLogs(
    eventType?: string,
    startDate?: Date,
    endDate?: Date,
    location?: string,
  ): Promise<SecurityEvent[]> {
    try {
      const query = this.buildSecurityLogQuery(
        eventType,
        startDate,
        endDate,
        location,
      );
      const results = await this.influxDbService.query(query);

      const events: SecurityEvent[] = [];
      for (const row of results) {
        const timestamp = new Date(row._time as string);
        const details = JSON.parse((row.details as string) || '{}');
        const eventType = row.type as SecurityEvent['type'];
        
        // Check if this is an off-hours event
        const isOffHours = eventType === 'motion_detected' 
          ? !this.shouldTriggerMotionAlert(timestamp)
          : false;
        
        events.push({
          id: row.id as string,
          type: eventType,
          timestamp,
          location: row.location as string,
          details,
          // Extract confidence for motion events
          confidence: details.confidence,
          isOffHours,
        });
      }

      // Sort in reverse chronological order
      events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return events;
    } catch (error) {
      this.logger.error('Failed to query security logs', error);
      throw error;
    }
  }

  /**
   * Log security event to InfluxDB
   */
  private async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      await this.influxDbService.writeSensorData(
        'security_events',
        {
          type: event.type,
          location: event.location,
        },
        {
          id: event.id,
          details: JSON.stringify(event.details),
        },
        event.timestamp,
      );
      await this.influxDbService.flush();
    } catch (error) {
      this.logger.error('Failed to log security event', error);
      throw error;
    }
  }

  /**
   * Trigger security alert
   */
  private async triggerSecurityAlert(alert: SecurityAlert): Promise<void> {
    try {
      await this.alertService.sendSecurityAlert(
        alert.type,
        alert.location,
        alert.details,
        {
          confidence: alert.confidence,
        },
      );
    } catch (error) {
      this.logger.error('Failed to send security alert', error);
      throw error;
    }
  }

  /**
   * Determine if motion alert should be triggered based on off-hours config
   */
  private shouldTriggerMotionAlert(timestamp?: Date): boolean {
    if (!this.offHoursConfig.enabled) {
      return true; // Always trigger if off-hours monitoring is not configured
    }

    const checkTime = timestamp || new Date();
    const currentHour = checkTime.getHours();

    // Handle case where monitoring period crosses midnight
    if (this.offHoursConfig.startHour > this.offHoursConfig.endHour) {
      return (
        currentHour >= this.offHoursConfig.startHour ||
        currentHour < this.offHoursConfig.endHour
      );
    } else {
      return (
        currentHour >= this.offHoursConfig.startHour &&
        currentHour < this.offHoursConfig.endHour
      );
    }
  }

  /**
   * Build Flux query for security logs
   */
  private buildSecurityLogQuery(
    eventType?: string,
    startDate?: Date,
    endDate?: Date,
    location?: string,
  ): string {
    const start = startDate
      ? startDate.toISOString()
      : new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(); // 180 days ago
    const stop = endDate ? endDate.toISOString() : new Date().toISOString();

    let query = `
      from(bucket: "${this.influxDbService.getBucket()}")
        |> range(start: ${start}, stop: ${stop})
        |> filter(fn: (r) => r._measurement == "security_events")
    `;

    if (eventType) {
      query += `\n  |> filter(fn: (r) => r.type == "${eventType}")`;
    }

    if (location) {
      query += `\n  |> filter(fn: (r) => r.location == "${location}")`;
    }

    query += `\n  |> sort(columns: ["_time"], desc: true)`;

    return query;
  }
}
