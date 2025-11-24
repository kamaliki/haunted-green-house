import { Controller, Get, Logger } from '@nestjs/common';
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
}
