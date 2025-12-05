import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GreenhouseService } from './greenhouse.service';
import { CreateGreenhouseDto } from './dto';

@Controller('greenhouse')
export class GreenhouseController {
  constructor(private readonly greenhouseService: GreenhouseService) {}

  @Post('setup')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async setupGreenhouse(
    @Request() req,
    @Body() createGreenhouseDto: CreateGreenhouseDto,
  ) {
    const userId = req.user.userId;
    const greenhouse = await this.greenhouseService.createGreenhouse(
      userId,
      createGreenhouseDto,
    );
    return greenhouse;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getGreenhouse(@Request() req) {
    const userId = req.user.userId;
    const greenhouse =
      await this.greenhouseService.getGreenhouseByUserId(userId);
    return greenhouse;
  }
}
