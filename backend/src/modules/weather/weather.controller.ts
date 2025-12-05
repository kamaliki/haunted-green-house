import { Controller, Get, Query, Logger, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { WeatherService } from './weather.service';

@ApiTags('weather')
@Controller('api/weather')
export class WeatherController {
  private readonly logger = new Logger(WeatherController.name);

  constructor(private readonly weatherService: WeatherService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current weather data' })
  @ApiQuery({ name: 'lat', description: 'Latitude', example: -1.30431 })
  @ApiQuery({ name: 'lon', description: 'Longitude', example: 36.83120 })
  @ApiResponse({ status: 200, description: 'Returns current weather data' })
  @ApiResponse({ status: 400, description: 'Invalid coordinates' })
  @ApiResponse({ status: 503, description: 'Weather API unavailable' })
  async getCurrentWeather(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
  ) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new BadRequestException('Invalid latitude or longitude');
    }

    if (latitude < -90 || latitude > 90) {
      throw new BadRequestException('Latitude must be between -90 and 90');
    }

    if (longitude < -180 || longitude > 180) {
      throw new BadRequestException('Longitude must be between -180 and 180');
    }

    return this.weatherService.getCurrentWeather(latitude, longitude);
  }

  @Get('forecast')
  @ApiOperation({ summary: 'Get weather forecast (5 days)' })
  @ApiQuery({ name: 'lat', description: 'Latitude', example: -1.30431 })
  @ApiQuery({ name: 'lon', description: 'Longitude', example: 36.83120 })
  @ApiResponse({ status: 200, description: 'Returns 5-day weather forecast' })
  @ApiResponse({ status: 400, description: 'Invalid coordinates' })
  @ApiResponse({ status: 503, description: 'Weather API unavailable' })
  async getForecast(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
  ) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new BadRequestException('Invalid latitude or longitude');
    }

    if (latitude < -90 || latitude > 90) {
      throw new BadRequestException('Latitude must be between -90 and 90');
    }

    if (longitude < -180 || longitude > 180) {
      throw new BadRequestException('Longitude must be between -180 and 180');
    }

    return this.weatherService.getForecast(latitude, longitude);
  }
}
