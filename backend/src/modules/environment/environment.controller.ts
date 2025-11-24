import { Controller, Get, Logger } from '@nestjs/common';
import { EnvironmentService } from './environment.service';

@Controller('api/environment')
export class EnvironmentController {
  private readonly logger = new Logger(EnvironmentController.name);

  constructor(private readonly environmentService: EnvironmentService) {}

  @Get('sensors/latest')
  async getLatestReadings() {
    return this.environmentService.getLatestReadings();
  }

  @Get('sensors/status')
  async getSensorStatus() {
    return this.environmentService.getSensorStatus();
  }
}
