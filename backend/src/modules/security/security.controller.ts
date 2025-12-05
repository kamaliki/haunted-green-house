import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SecurityService } from './security.service';
import { OffHoursConfigDto } from './dto/off-hours-config.dto';
import { QuerySecurityLogsDto } from './dto/query-security-logs.dto';
import type {
  AccessPointStatus,
  SecurityEvent,
  OffHoursConfig,
} from './interfaces/security.interface';

@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  /**
   * Get all access point statuses
   */
  @Get('access-points')
  getAllAccessPoints(): AccessPointStatus[] {
    return this.securityService.getAllAccessPointStatus();
  }

  /**
   * Get specific access point status
   */
  @Get('access-points/:id')
  getAccessPoint(@Query('id') id: string): AccessPointStatus | undefined {
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
}
