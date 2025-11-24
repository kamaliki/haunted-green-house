import { Controller, Get, Post, Body, Logger, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IrrigationService } from './irrigation.service';
import { StartIrrigationDto, StopIrrigationDto, AdjustFlowRateDto } from './dto/start-irrigation.dto';

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

  @Post('adjust-flow')
  @ApiOperation({ summary: 'Adjust flow rate for active irrigation' })
  @ApiResponse({ status: 200, description: 'Flow rate adjusted successfully' })
  @ApiResponse({ status: 400, description: 'No active irrigation session for zone' })
  async adjustFlowRate(@Body() dto: AdjustFlowRateDto) {
    await this.irrigationService.adjustFlowRate(
      dto.zone,
      dto.flowRatePercent,
      dto.operatorId || 'manual-user',
    );

    return {
      success: true,
      message: `Flow rate adjusted to ${dto.flowRatePercent}% for ${dto.zone}`,
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Get current irrigation status' })
  @ApiResponse({ status: 200, description: 'Returns status of all zones and reservoir' })
  getStatus() {
    return this.irrigationService.getStatus();
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get water usage statistics' })
  @ApiResponse({ status: 200, description: 'Returns water usage data' })
  async getUsage(
    @Query('zone') zone?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    return this.irrigationService.getUsageStatistics({
      zone,
      startTime: startTime || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: endTime || new Date().toISOString(),
    });
  }

  @Get('history')
  @ApiOperation({ summary: 'Get irrigation history' })
  @ApiResponse({ status: 200, description: 'Returns irrigation session history' })
  async getHistory(
    @Query('zone') zone?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    return this.irrigationService.getIrrigationHistory({
      zone,
      startTime: startTime || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: endTime || new Date().toISOString(),
    });
  }
}
