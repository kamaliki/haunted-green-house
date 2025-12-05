import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SecurityService } from './security.service';
import { AccessPointMonitoringService } from './services/access-point-monitoring.service';
import { OffHoursConfigDto } from './dto/off-hours-config.dto';
import { QuerySecurityLogsDto } from './dto/query-security-logs.dto';
import { CreateAccessPointDto } from './dto/create-access-point.dto';
import { UpdateAccessPointDto } from './dto/update-access-point.dto';
import { AccessPoint } from './entities/access-point.entity';
import type {
  AccessPointStatus,
  SecurityEvent,
  OffHoursConfig,
} from './interfaces/security.interface';

@Controller('security')
export class SecurityController {
  constructor(
    private readonly securityService: SecurityService,
    private readonly monitoringService: AccessPointMonitoringService,
  ) {}

  /**
   * Get all access points (configuration)
   */
  @Get('access-points')
  async getAllAccessPoints(): Promise<AccessPoint[]> {
    return this.securityService.findAllAccessPoints();
  }

  /**
   * Create a new access point
   */
  @Post('access-points')
  @HttpCode(HttpStatus.CREATED)
  async createAccessPoint(
    @Body() createDto: CreateAccessPointDto,
  ): Promise<AccessPoint> {
    return this.securityService.createAccessPoint(createDto);
  }

  /**
   * Get specific access point by ID
   */
  @Get('access-points/:id')
  async getAccessPoint(@Param('id') id: string): Promise<AccessPoint> {
    return this.securityService.findAccessPointById(id);
  }

  /**
   * Update an access point
   */
  @Patch('access-points/:id')
  async updateAccessPoint(
    @Param('id') id: string,
    @Body() updateDto: UpdateAccessPointDto,
  ): Promise<AccessPoint> {
    return this.securityService.updateAccessPoint(id, updateDto);
  }

  /**
   * Delete an access point
   */
  @Delete('access-points/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccessPoint(@Param('id') id: string): Promise<void> {
    return this.securityService.deleteAccessPoint(id);
  }

  /**
   * Get all access point statuses (real-time status)
   */
  @Get('access-points-status')
  getAllAccessPointStatus(): AccessPointStatus[] {
    return this.securityService.getAllAccessPointStatus();
  }

  /**
   * Get specific access point status (real-time status)
   */
  @Get('access-points-status/:id')
  getAccessPointStatus(@Param('id') id: string): AccessPointStatus | undefined {
    return this.securityService.getAccessPointStatus(id);
  }

  /**
   * Configure off-hours monitoring
   */
  @Post('off-hours-config')
  @HttpCode(HttpStatus.OK)
  setOffHoursConfig(@Body() config: OffHoursConfigDto): OffHoursConfig {
    this.securityService.setOffHoursConfig(config);
    return this.securityService.getOffHoursConfig();
  }

  /**
   * Get current off-hours configuration
   */
  @Get('off-hours-config')
  getOffHoursConfig(): OffHoursConfig {
    return this.securityService.getOffHoursConfig();
  }

  /**
   * Query security logs
   */
  @Get('logs')
  async getSecurityLogs(
    @Query() query: QuerySecurityLogsDto,
  ): Promise<SecurityEvent[]> {
    return this.securityService.querySecurityLogs(
      query.eventType,
      query.startDate,
      query.endDate,
      query.location,
    );
  }

  /**
   * Get access points that are currently exceeding their thresholds
   */
  @Get('access-points/exceeding-threshold')
  async getAccessPointsExceedingThreshold(): Promise<Array<{
    accessPoint: AccessPoint;
    durationSeconds: number;
  }>> {
    return this.monitoringService.getAccessPointsExceedingThreshold();
  }

  /**
   * Get the current open duration for a specific access point
   */
  @Get('access-points/:id/open-duration')
  async getOpenDuration(@Param('id') id: string): Promise<{ durationSeconds: number | null }> {
    const duration = await this.monitoringService.getOpenDuration(id);
    return { durationSeconds: duration };
  }
}
