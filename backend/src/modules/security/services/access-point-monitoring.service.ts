import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AccessPoint } from '../entities/access-point.entity';
import { AlertService } from '../../alerts/alert.service';

/**
 * Service responsible for monitoring access points and generating alerts
 * based on configured thresholds and monitoring settings.
 * 
 * Requirements: 5.1, 5.3, 6.3, 6.4
 */
@Injectable()
export class AccessPointMonitoringService {
  private readonly logger = new Logger(AccessPointMonitoringService.name);
  
  // Track when access points were opened to calculate duration
  private openDurations: Map<string, Date> = new Map();

  constructor(
    @InjectRepository(AccessPoint)
    private readonly accessPointRepository: Repository<AccessPoint>,
    private readonly alertService: AlertService,
  ) {}

  /**
   * Initialize monitoring by loading current access point states
   */
  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing access point monitoring service');
    await this.syncAccessPointStates();
  }

  /**
   * Sync access point states from database
   * This ensures we have the latest status for all access points
   */
  private async syncAccessPointStates(): Promise<void> {
    const accessPoints = await this.accessPointRepository.find();
    
    for (const ap of accessPoints) {
      if (ap.status === 'open') {
        // Track open access points with their last status change time
        this.openDurations.set(ap.id, ap.lastStatusChange);
      }
    }
    
    this.logger.log(`Synced ${accessPoints.length} access points, ${this.openDurations.size} currently open`);
  }

  /**
   * Check all access points for threshold breaches
   * Runs periodically to monitor open durations
   * 
   * Requirements: 5.3, 6.3
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkThresholds(): Promise<void> {
    const accessPoints = await this.accessPointRepository.find({
      where: { monitoringEnabled: true },
    });

    for (const accessPoint of accessPoints) {
      await this.checkAccessPointThreshold(accessPoint);
    }
  }

  /**
   * Check if a specific access point has exceeded its threshold
   * 
   * Requirements: 5.3, 6.3, 6.4
   */
  private async checkAccessPointThreshold(accessPoint: AccessPoint): Promise<void> {
    // Skip if monitoring is disabled (Requirement 6.4)
    if (!accessPoint.monitoringEnabled) {
      return;
    }

    // Only check if access point is open
    if (accessPoint.status !== 'open') {
      // Remove from tracking if it was previously open
      this.openDurations.delete(accessPoint.id);
      return;
    }

    // Calculate how long the access point has been open
    const openSince = this.openDurations.get(accessPoint.id) || accessPoint.lastStatusChange;
    const now = new Date();
    const durationSeconds = Math.floor((now.getTime() - openSince.getTime()) / 1000);

    // Check if threshold is exceeded (Requirement 6.3)
    if (durationSeconds >= accessPoint.alertThreshold) {
      await this.generateThresholdAlert(accessPoint, durationSeconds);
      
      // Update the tracking time to avoid duplicate alerts
      // We'll alert again if it remains open for another threshold period
      this.openDurations.set(accessPoint.id, now);
    }
  }

  /**
   * Generate an alert when an access point exceeds its threshold
   * 
   * Requirements: 6.3
   */
  private async generateThresholdAlert(
    accessPoint: AccessPoint,
    durationSeconds: number,
  ): Promise<void> {
    const durationMinutes = Math.floor(durationSeconds / 60);
    
    this.logger.warn(
      `Access point "${accessPoint.name}" at ${accessPoint.location} has been open for ${durationMinutes} minutes (threshold: ${Math.floor(accessPoint.alertThreshold / 60)} minutes)`,
    );

    await this.alertService.sendSecurityAlert(
      'access_point',
      accessPoint.location,
      `${accessPoint.type.charAt(0).toUpperCase() + accessPoint.type.slice(1)} "${accessPoint.name}" has been open for ${durationMinutes} minutes, exceeding the configured threshold of ${Math.floor(accessPoint.alertThreshold / 60)} minutes.`,
      {
        accessPointId: accessPoint.id,
        accessPointName: accessPoint.name,
        accessPointType: accessPoint.type,
        durationSeconds,
        thresholdSeconds: accessPoint.alertThreshold,
      },
    );
  }

  /**
   * Update the status of an access point and track open duration
   * This should be called when an access point status changes
   * 
   * Requirements: 5.1
   */
  async updateAccessPointStatus(
    accessPointId: string,
    newStatus: 'open' | 'closed' | 'locked' | 'unlocked',
  ): Promise<void> {
    const accessPoint = await this.accessPointRepository.findOne({
      where: { id: accessPointId },
    });

    if (!accessPoint) {
      this.logger.warn(`Access point ${accessPointId} not found`);
      return;
    }

    const previousStatus = accessPoint.status;
    
    // Update the access point status
    accessPoint.status = newStatus;
    accessPoint.lastStatusChange = new Date();
    await this.accessPointRepository.save(accessPoint);

    this.logger.log(
      `Access point "${accessPoint.name}" status changed from ${previousStatus} to ${newStatus}`,
    );

    // Track open duration
    if (newStatus === 'open') {
      this.openDurations.set(accessPointId, accessPoint.lastStatusChange);
    } else {
      this.openDurations.delete(accessPointId);
    }

    // Immediately check threshold if monitoring is enabled and status is open
    if (accessPoint.monitoringEnabled && newStatus === 'open') {
      await this.checkAccessPointThreshold(accessPoint);
    }
  }

  /**
   * Get access points that are currently exceeding their thresholds
   * 
   * Requirements: 5.3
   */
  async getAccessPointsExceedingThreshold(): Promise<Array<{
    accessPoint: AccessPoint;
    durationSeconds: number;
  }>> {
    const accessPoints = await this.accessPointRepository.find({
      where: { monitoringEnabled: true, status: 'open' },
    });

    const exceeding: Array<{ accessPoint: AccessPoint; durationSeconds: number }> = [];
    const now = new Date();

    for (const accessPoint of accessPoints) {
      const openSince = this.openDurations.get(accessPoint.id) || accessPoint.lastStatusChange;
      const durationSeconds = Math.floor((now.getTime() - openSince.getTime()) / 1000);

      if (durationSeconds >= accessPoint.alertThreshold) {
        exceeding.push({ accessPoint, durationSeconds });
      }
    }

    return exceeding;
  }

  /**
   * Get the current open duration for an access point
   * 
   * Requirements: 5.1
   */
  async getOpenDuration(accessPointId: string): Promise<number | null> {
    const accessPoint = await this.accessPointRepository.findOne({
      where: { id: accessPointId },
    });

    if (!accessPoint || accessPoint.status !== 'open') {
      return null;
    }

    const openSince = this.openDurations.get(accessPointId) || accessPoint.lastStatusChange;
    const now = new Date();
    return Math.floor((now.getTime() - openSince.getTime()) / 1000);
  }
}
