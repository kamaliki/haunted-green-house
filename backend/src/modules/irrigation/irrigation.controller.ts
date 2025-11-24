import { Controller, Get, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IrrigationService } from './irrigation.service';
import { StartIrrigationDto, StopIrrigationDto } from './dto/start-irrigation.dto';

@ApiTags('irrigation')
@Controller('api/irrigation')
export class IrrigationController {
  private readonly logger = new Logger(IrrigationController.name);

  constructor(private readonly irrigationService: IrrigationService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start irrigation manually' })
  @ApiResponse({ status: 200, description: 'Irrigation started successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed or zone already active' })
  async startIrrigation(@Body() dto: StartIrrigationDto) {
    const session = await this.irrigationService.startIrrigation(
      dto.zone,
      dto.durationSeconds,
      dto.flowRatePercent,
      'manual',
      dto.operatorId || 'manual-user',
    );

    return {
      success: true,
      message: `Irrigation started for ${dto.zone}`,
      sessionId: session.sessionId,
      estimatedEndTime: new Date(session.startTime.getTime() + dto.durationSeconds * 1000),
    };
  }

  @Post('stop')
  @ApiOperation({ summary: 'Stop irrigation manually' })
  @ApiResponse({ status: 200, description: 'Irrigation stopped successfully' })
  @ApiResponse({ status: 400, description: 'No active irrigation session for zone' })
  async stopIrrigation(@Body() dto: StopIrrigationDto) {
    await this.irrigationService.stopIrrigation(
      dto.zone,
      dto.operatorId || 'manual-user',
    );

    return {
      success: true,
      message: `Irrigation stopped for ${dto.zone}`,
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Get current irrigation status' })
  @ApiResponse({ status: 200, description: 'Returns status of all zones and reservoir' })
  getStatus() {
    return this.irrigationService.getStatus();
  }
}
