import {
  Controller,
  Get,
  Query,
  Logger,
  ValidationPipe,
  BadRequestException,
  ServiceUnavailableException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import {
  PredictionResult,
  OptimizationRecommendation,
  WeatherData,
} from './interfaces/analytics.interface';
import { GetPredictionsDto } from './dto/get-predictions.dto';
import { PredictionResultDto } from './dto/prediction-result.dto';
import { OptimizationRecommendationDto } from './dto/optimization-recommendation.dto';
import { WeatherDataDto } from './dto/weather-data.dto';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Get predictions for specified metrics
   * @param query Query parameters for predictions
   * @returns Array of prediction results
   */
  @Get('predictions')
  @ApiOperation({
    summary: 'Get environmental predictions',
    description:
      'Generate predictions for specified environmental metrics for the next N hours based on historical data and weather forecasts.',
  })
  @ApiQuery({
    name: 'metrics',
    required: false,
    description: 'Comma-separated list of metrics to predict',
    example: 'temperature_air,humidity_air,light_intensity',
  })
  @ApiQuery({
    name: 'hours',
    required: false,
    description: 'Number of hours to forecast ahead (1-168)',
    example: 24,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Predictions generated successfully',
    type: [PredictionResultDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getPredictions(
    @Query('metrics') metrics?: string | string[],
    @Query('hours') hours?: number,
  ): Promise<PredictionResult[]> {
    try {
      const metricArray = Array.isArray(metrics)
        ? metrics
        : metrics
        ? metrics.split(',').map((m) => m.trim())
        : ['temperature_air', 'humidity_air', 'light_intensity'];
      const hoursAhead = hours ?? 24;

      // Validate metric names
      const validMetrics = [
        'temperature_air',
        'temperature_soil',
        'humidity_air',
        'humidity_soil',
        'light_intensity',
        'co2_level',
        'soil_moisture',
        'soil_ph',
        'air_quality',
      ];

      const invalidMetrics = metricArray.filter(
        (m) => !validMetrics.includes(m),
      );
      if (invalidMetrics.length > 0) {
        this.logger.warn(
          `Invalid metrics requested: ${invalidMetrics.join(', ')}`,
        );
        throw new BadRequestException(
          `Invalid metrics: ${invalidMetrics.join(', ')}. Valid metrics are: ${validMetrics.join(', ')}`,
        );
      }

      // Validate hours ahead
      if (hoursAhead < 1 || hoursAhead > 168) {
        this.logger.warn(`Invalid hours ahead requested: ${hoursAhead}`);
        throw new BadRequestException(
          'Hours ahead must be between 1 and 168 (1 week)',
        );
      }

      this.logger.log(
        `GET /analytics/predictions - metrics: ${metricArray.join(', ')}, hours: ${hoursAhead}`,
      );

      const predictions = await this.analyticsService.generatePredictions(
        metricArray,
        hoursAhead,
      );

      this.logger.log(
        `Successfully generated ${predictions.length} prediction sets`,
      );

      return predictions;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `Error generating predictions: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        'Unable to generate predictions. Please check your request parameters and try again.',
      );
    }
  }

  /**
   * Get optimization recommendations
   * @returns Array of optimization recommendations
   */
  @Get('recommendations')
  @ApiOperation({
    summary: 'Get optimization recommendations',
    description:
      'Generate optimization recommendations based on environmental data, plant health metrics, and growth patterns to improve greenhouse operations.',
  })
  @ApiResponse({
    status: 200,
    description: 'Recommendations generated successfully',
    type: [OptimizationRecommendationDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getRecommendations(): Promise<OptimizationRecommendation[]> {
    try {
      this.logger.log('GET /analytics/recommendations');

      const recommendations =
        await this.analyticsService.generateOptimizationRecommendations();

      this.logger.log(
        `Successfully generated ${recommendations.length} recommendations`,
      );

      return recommendations;
    } catch (error) {
      this.logger.error(
        `Error generating recommendations: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        'Unable to generate recommendations at this time. Please try again later.',
      );
    }
  }

  /**
   * Get weather forecast data
   * @returns Array of weather data points
   */
  @Get('weather')
  @ApiOperation({
    summary: 'Get weather forecast',
    description:
      'Retrieve external weather forecast data that is used to enhance environmental predictions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Weather data retrieved successfully',
    type: [WeatherDataDto],
  })
  @ApiResponse({
    status: 503,
    description: 'Weather service unavailable',
  })
  async getWeatherForecast(): Promise<WeatherData[]> {
    try {
      this.logger.log('GET /analytics/weather');

      const weatherData = await this.analyticsService.fetchWeatherData();

      this.logger.log(
        `Successfully retrieved ${weatherData.length} weather data points`,
      );

      return weatherData;
    } catch (error) {
      this.logger.error(
        `Error fetching weather data: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        'Unable to retrieve weather data at this time. The system will continue to operate using historical data only.',
      );
    }
  }
}
