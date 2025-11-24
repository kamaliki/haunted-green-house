import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EnvironmentService } from './environment.service';

@ApiTags('environment')
@Controller('api/environment')
export class EnvironmentController {
  private readonly logger = new Logger(EnvironmentController.name);

  constructor(private readonly environmentService: EnvironmentService) {}

  @Get('sensors/latest')
  @ApiOperation({ summary: 'Get latest sensor readings' })
  @ApiResponse({ status: 200, description: 'Returns latest readings for all sensor types' })
  async getLatestReadings() {
    return this.environmentService.getLatestReadings();
  }

  @Get('sensors/status')
  @ApiOperation({ summary: 'Get sensor health status' })
  @ApiResponse({ status: 200, description: 'Returns health status of all sensors' })
  async getSensorStatus() {
    return this.environmentService.getSensorStatus();
  }

  @Get('sensors/history')
  @ApiOperation({ summary: 'Get historical sensor data' })
  @ApiResponse({ status: 200, description: 'Returns historical sensor readings' })
  async getHistoricalData(
    @Query('sensorType') sensorType?: string,
    @Query('deviceId') deviceId?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    return this.environmentService.getHistoricalData({
      sensorType,
      deviceId,
      startTime: startTime || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      endTime: endTime || new Date().toISOString(),
    });
  }
}
