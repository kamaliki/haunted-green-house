import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AlertService } from './alert.service';
import { Alert } from './alert.interface';

@ApiTags('Alerts')
@Controller('api/alerts')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all alerts',
    description: 'Retrieve alerts with optional filtering by type, severity, acknowledgment status, and limit',
  })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by alert type (e.g., disease_detected)' })
  @ApiQuery({ name: 'severity', required: false, description: 'Filter by severity (low, moderate, high, critical)' })
  @ApiQuery({ name: 'acknowledged', required: false, description: 'Filter by acknowledgment status (true/false)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of results' })
  @ApiResponse({ status: 200, description: 'Alerts retrieved successfully' })
  async getAlerts(
    @Query('type') type?: string,
    @Query('severity') severity?: string,
    @Query('acknowledged') acknowledged?: string,
    @Query('limit') limit?: string,
  ): Promise<Alert[]> {
    const filters: any = {};

    if (type) filters.type = type;
    if (severity) filters.severity = severity;
    if (acknowledged !== undefined) {
      filters.acknowledged = acknowledged === 'true';
    }
    if (limit) filters.limit = parseInt(limit, 10);

    return this.alertService.getAlerts(filters);
  }

  @Get('unacknowledged/count')
  @ApiOperation({
    summary: 'Get unacknowledged alert count',
    description: 'Retrieve the count of alerts that have not been acknowledged',
  })
  @ApiResponse({ status: 200, description: 'Count retrieved successfully' })
  async getUnacknowledgedCount(): Promise<{ count: number }> {
    const count = await this.alertService.getUnacknowledgedCount();
    return { count };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get alert by ID',
    description: 'Retrieve a specific alert by its unique identifier',
  })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiResponse({ status: 200, description: 'Alert retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  async getAlert(@Param('id') id: string): Promise<Alert> {
    const alert = await this.alertService.getAlert(id);
    if (!alert) {
      throw new NotFoundException(`Alert ${id} not found`);
    }
    return alert;
  }

  @Patch(':id/acknowledge')
  @ApiOperation({
    summary: 'Acknowledge alert',
    description: 'Mark an alert as acknowledged/read',
  })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiResponse({ status: 200, description: 'Alert acknowledged successfully' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  async acknowledgeAlert(@Param('id') id: string): Promise<Alert> {
    const alert = await this.alertService.acknowledgeAlert(id);
    if (!alert) {
      throw new NotFoundException(`Alert ${id} not found`);
    }
    return alert;
  }
}
