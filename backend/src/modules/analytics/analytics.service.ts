import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InfluxDbService } from '../../common/services/influxdb/influxdb.service';
import { AlertService } from '../alerts/alert.service';
import { PredictionEngine } from './services/prediction-engine.service';
import { OptimizationEngine } from './services/optimization-engine.service';
import { WeatherIntegrationService } from './services/weather-integration.service';
import { CacheService } from './services/cache.service';
import {
  PredictionResult,
  OptimizationRecommendation,
  WeatherData,
  TimeSeriesPoint,
  ForecastConfig,
  ThresholdConfig,
} from './interfaces/analytics.interface';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private thresholds: ThresholdConfig[] = [
    { metric: 'temperature_air', upperThreshold: 35, lowerThreshold: 10 },
    { metric: 'humidity_air', upperThreshold: 90, lowerThreshold: 30 },
    { metric: 'light_intensity', upperThreshold: 100000, lowerThreshold: 5000 },
  ];
  private readonly defaultMetrics = ['temperature_air', 'humidity_air', 'light_intensity'];
  private readonly defaultForecastHours = 24;

  // Cache TTL constants (in milliseconds)
  private readonly PREDICTIONS_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
  private readonly RECOMMENDATIONS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly WEATHER_CACHE_TTL = 60 * 60 * 1000; // 1 hour

  constructor(
    private influxDbService: InfluxDbService,
    private alertService: AlertService,
    private predictionEngine: PredictionEngine,
    private optimizationEngine: OptimizationEngine,
    private weatherIntegrationService: WeatherIntegrationService,
    private cacheService: CacheService,
  ) {}

  /**
   * Generate predictions for specified metrics
   * @param metrics Array of metric names to predict
   * @param hoursAhead Number of hours to forecast
   * @returns Array of prediction results
   */
  async generatePredictions(
    metrics: string[],
    hoursAhead: number,
  ): Promise<PredictionResult[]> {
    this.logger.log(
      `Generating predictions for ${metrics.join(', ')} for ${hoursAhead} hours ahead`,
    );

    try {
      // Generate cache key based on metrics and hours
      const cacheKey = `predictions:${metrics.sort().join(',')}:${hoursAhead}`;

      // Check cache first
      const cachedResults = this.cacheService.get<PredictionResult[]>(cacheKey);
      if (cachedResults) {
        this.logger.log('Returning cached predictions');
        return cachedResults;
      }

      const results: PredictionResult[] = [];

      // Calculate date range for last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      // Fetch weather data for integration
      let weatherData: WeatherData[] = [];
      try {
        weatherData = await this.weatherIntegrationService.getCachedWeather();
        this.logger.debug(`Retrieved ${weatherData.length} weather data points`);
      } catch (error) {
        this.logger.warn(
          `Failed to fetch weather data: ${error.message}. Proceeding with internal data only.`,
        );
      }

    // Generate predictions for each metric
    for (const metric of metrics) {
      try {
        // Fetch historical data for the metric
        const historicalData = await this.getHistoricalData(
          metric,
          startDate,
          endDate,
        );

        if (historicalData.length === 0) {
          this.logger.warn(
            `No historical data available for metric: ${metric}. Skipping prediction.`,
          );
          continue;
        }

        // Adjust predictions based on weather data if available
        let adjustedHistoricalData = historicalData;
        if (weatherData.length > 0) {
          adjustedHistoricalData = this.integrateWeatherData(
            historicalData,
            weatherData,
            metric,
          );
        }

        // Configure forecast method
        const config: ForecastConfig = {
          method: 'exponential_smoothing',
          confidenceLevel: 0.95,
        };

        // Generate forecast using prediction engine
        const predictionResult = this.predictionEngine.forecast(
          adjustedHistoricalData,
          hoursAhead,
          config,
        );

        // Update metric name in result
        predictionResult.metric = metric;

        // Store predictions to InfluxDB
        await this.storePredictions(predictionResult);

        // Check predictions against thresholds and trigger alerts
        await this.checkPredictionsAgainstThresholds(
          predictionResult,
          historicalData,
        );

        results.push(predictionResult);

        this.logger.log(
          `Generated ${predictionResult.predictions.length} predictions for ${metric}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to generate predictions for ${metric}: ${error.message}`,
          error.stack,
        );
      }
    }

      // Cache the results
      if (results.length > 0) {
        this.cacheService.set(cacheKey, results, this.PREDICTIONS_CACHE_TTL);
        this.logger.log(`Cached predictions with TTL of ${this.PREDICTIONS_CACHE_TTL / 1000 / 60 / 60} hours`);
      } else {
        this.logger.warn('No predictions generated - insufficient historical data');
      }

      return results;
    } catch (error) {
      this.logger.error(
        `Error in generatePredictions: ${error.message}`,
        error.stack,
      );
      throw new Error(
        'Failed to generate predictions. Please ensure sufficient historical data is available.',
      );
    }
  }

  /**
   * Integrate weather data into historical data for improved predictions
   * @param historicalData Historical sensor data
   * @param weatherData External weather forecast data
   * @param metric The metric being predicted
   * @returns Adjusted historical data
   */
  private integrateWeatherData(
    historicalData: TimeSeriesPoint[],
    weatherData: WeatherData[],
    metric: string,
  ): TimeSeriesPoint[] {
    // If no weather data available, return original data
    if (weatherData.length === 0) {
      return historicalData;
    }

    // Create a copy of historical data
    const adjustedData = [...historicalData];

    // Map metric names to weather data fields
    const weatherFieldMap: Record<string, keyof WeatherData> = {
      temperature_air: 'temperature',
      humidity_air: 'humidity',
    };

    const weatherField = weatherFieldMap[metric];

    // If metric doesn't map to weather data, return original data
    if (!weatherField) {
      return historicalData;
    }

    // Calculate average difference between recent historical data and weather forecast
    // This helps adjust predictions based on external conditions
    const recentData = historicalData.slice(-24); // Last 24 hours
    if (recentData.length > 0) {
      const recentAvg =
        recentData.reduce((sum, point) => sum + point.value, 0) /
        recentData.length;

      // Get corresponding weather data average
      const weatherAvg =
        weatherData.reduce(
          (sum, point) => sum + (point[weatherField] as number),
          0,
        ) / weatherData.length;

      // Calculate adjustment factor
      const adjustmentFactor = weatherAvg / recentAvg;

      // Apply subtle adjustment to recent data points (last 10%)
      const adjustmentStartIndex = Math.floor(adjustedData.length * 0.9);
      for (let i = adjustmentStartIndex; i < adjustedData.length; i++) {
        const weight = (i - adjustmentStartIndex) / (adjustedData.length - adjustmentStartIndex);
        adjustedData[i] = {
          ...adjustedData[i],
          value: adjustedData[i].value * (1 + (adjustmentFactor - 1) * weight * 0.1),
        };
      }
    }

    return adjustedData;
  }

  /**
   * Store predictions to InfluxDB
   * @param predictionResult Prediction result to store
   */
  private async storePredictions(
    predictionResult: PredictionResult,
  ): Promise<void> {
    try {
      this.logger.debug(
        `Storing ${predictionResult.predictions.length} predictions for ${predictionResult.metric}`,
      );

      for (const prediction of predictionResult.predictions) {
        await this.influxDbService.writeSensorData(
          'predictions',
          {
            metric: predictionResult.metric,
            model_version: 'v1.0',
          },
          {
            predicted_value: prediction.value,
            confidence_lower: prediction.confidenceInterval.lower,
            confidence_upper: prediction.confidenceInterval.upper,
            data_points_used: predictionResult.dataPointsUsed,
          },
          prediction.timestamp,
        );
      }

      await this.influxDbService.flush();
      this.logger.log(
        `Successfully stored ${predictionResult.predictions.length} predictions for ${predictionResult.metric}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to store predictions for ${predictionResult.metric}: ${error.message}`,
        error.stack,
      );
      // Don't throw - allow prediction generation to continue even if storage fails
      // The predictions are still returned to the caller
    }
  }

  /**
   * Generate optimization recommendations based on current data
   * @returns Array of optimization recommendations
   */
  async generateOptimizationRecommendations(): Promise<
    OptimizationRecommendation[]
  > {
    this.logger.log('Generating optimization recommendations');

    // Check cache first
    const cacheKey = 'recommendations:latest';
    const cachedRecommendations = this.cacheService.get<OptimizationRecommendation[]>(cacheKey);
    if (cachedRecommendations) {
      this.logger.log('Returning cached recommendations');
      return cachedRecommendations;
    }

    try {
      // Calculate date range for analysis (last 7 days for comprehensive analysis)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      // Fetch environmental data
      const environmentalData = await this.fetchEnvironmentalDataForAnalysis(
        startDate,
        endDate,
      );

      // Fetch plant health data
      const plantHealthData = await this.fetchPlantHealthData(startDate, endDate);

      // Fetch growth metrics
      const growthMetrics = await this.fetchGrowthMetrics(startDate, endDate);

      // Fetch weather forecast
      let weatherForecast: WeatherData[] = [];
      try {
        weatherForecast = await this.weatherIntegrationService.getCachedWeather();
      } catch (error) {
        this.logger.warn(
          `Failed to fetch weather data for recommendations: ${error.message}`,
        );
      }

      // Build analysis context
      const context: {
        environmentalData: TimeSeriesPoint[];
        plantHealthData: any[];
        growthMetrics: any[];
        weatherForecast: WeatherData[];
      } = {
        environmentalData,
        plantHealthData,
        growthMetrics,
        weatherForecast,
      };

      // Generate recommendations using OptimizationEngine
      const recommendations: OptimizationRecommendation[] = [];

      // Get environmental condition recommendations
      const envRecommendations =
        this.optimizationEngine.analyzeEnvironmentalConditions(context);
      recommendations.push(...envRecommendations);

      // Get irrigation optimization recommendations
      const soilMoistureData = await this.getHistoricalData(
        'soil_moisture',
        startDate,
        endDate,
      );
      const waterUsage = await this.fetchWaterUsageData(startDate, endDate);
      const irrigationRecommendations =
        this.optimizationEngine.identifyIrrigationOptimizations(
          soilMoistureData,
          waterUsage,
        );
      recommendations.push(...irrigationRecommendations);

      // Get energy efficiency recommendations
      const lightingData = await this.getHistoricalData(
        'light_intensity',
        startDate,
        endDate,
      );
      const temperatureData = await this.getHistoricalData(
        'temperature_air',
        startDate,
        endDate,
      );
      const energyRecommendations =
        this.optimizationEngine.assessEnergyEfficiency(
          lightingData,
          temperatureData,
        );
      recommendations.push(...energyRecommendations);

      // Store recommendations to InfluxDB
      await this.storeRecommendations(recommendations);

      // Cache the recommendations
      this.cacheService.set(cacheKey, recommendations, this.RECOMMENDATIONS_CACHE_TTL);
      this.logger.log(
        `Generated ${recommendations.length} optimization recommendations and cached with TTL of ${this.RECOMMENDATIONS_CACHE_TTL / 1000 / 60 / 60} hours`,
      );

      return recommendations;
    } catch (error) {
      this.logger.error(
        `Failed to generate optimization recommendations: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Fetch environmental data for analysis
   * @param startDate Start of time range
   * @param endDate End of time range
   * @returns Array of time-series data points
   */
  private async fetchEnvironmentalDataForAnalysis(
    startDate: Date,
    endDate: Date,
  ): Promise<TimeSeriesPoint[]> {
    try {
      const bucket = this.influxDbService.getBucket();

      // Fetch temperature data as primary environmental metric
      const fluxQuery = `
        from(bucket: "${bucket}")
          |> range(start: ${startDate.toISOString()}, stop: ${endDate.toISOString()})
          |> filter(fn: (r) => r["_measurement"] == "environment")
          |> filter(fn: (r) => r["sensor_type"] == "temperature_air")
          |> filter(fn: (r) => r["_field"] == "value")
          |> sort(columns: ["_time"])
      `;

      const results = await this.influxDbService.query(fluxQuery);

      const timeSeriesData: TimeSeriesPoint[] = results.map((record) => ({
        timestamp: new Date(record._time),
        value: parseFloat(record._value),
      }));

      this.logger.debug(
        `Retrieved ${timeSeriesData.length} environmental data points for analysis`,
      );

      return timeSeriesData;
    } catch (error) {
      this.logger.error(
        `Failed to fetch environmental data for analysis: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /**
   * Fetch plant health data from InfluxDB
   * @param startDate Start of time range
   * @param endDate End of time range
   * @returns Array of plant health data
   */
  private async fetchPlantHealthData(
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    try {
      const bucket = this.influxDbService.getBucket();

      const fluxQuery = `
        from(bucket: "${bucket}")
          |> range(start: ${startDate.toISOString()}, stop: ${endDate.toISOString()})
          |> filter(fn: (r) => r["_measurement"] == "plant_analyses")
          |> filter(fn: (r) => r["_field"] == "health_score" or r["_field"] == "disease_name")
          |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
          |> sort(columns: ["_time"])
      `;

      const results = await this.influxDbService.query(fluxQuery);

      const plantHealthData = results.map((record) => ({
        timestamp: new Date(record._time),
        plantId: record.plant_id,
        healthScore: record.health_score ? parseFloat(record.health_score) : undefined,
        diseaseDetected: record.disease_detected === 'true',
        diseaseName: record.disease_name,
      }));

      this.logger.debug(
        `Retrieved ${plantHealthData.length} plant health data points`,
      );

      return plantHealthData;
    } catch (error) {
      this.logger.error(
        `Failed to fetch plant health data: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /**
   * Fetch growth metrics from InfluxDB
   * @param startDate Start of time range
   * @param endDate End of time range
   * @returns Array of growth metrics
   */
  private async fetchGrowthMetrics(
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    try {
      const bucket = this.influxDbService.getBucket();

      const fluxQuery = `
        from(bucket: "${bucket}")
          |> range(start: ${startDate.toISOString()}, stop: ${endDate.toISOString()})
          |> filter(fn: (r) => r["_measurement"] == "growth_metrics")
          |> filter(fn: (r) => r["_field"] == "height_cm" or r["_field"] == "growth_rate")
          |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
          |> sort(columns: ["_time"])
      `;

      const results = await this.influxDbService.query(fluxQuery);

      const growthMetrics = results.map((record) => ({
        timestamp: new Date(record._time),
        plantId: record.plant_id,
        heightCm: record.height_cm ? parseFloat(record.height_cm) : undefined,
        growthRate: record.growth_rate ? parseFloat(record.growth_rate) : undefined,
      }));

      this.logger.debug(`Retrieved ${growthMetrics.length} growth metric points`);

      return growthMetrics;
    } catch (error) {
      this.logger.error(
        `Failed to fetch growth metrics: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /**
   * Fetch water usage data from InfluxDB
   * @param startDate Start of time range
   * @param endDate End of time range
   * @returns Array of daily water usage values
   */
  private async fetchWaterUsageData(
    startDate: Date,
    endDate: Date,
  ): Promise<number[]> {
    try {
      const bucket = this.influxDbService.getBucket();

      const fluxQuery = `
        from(bucket: "${bucket}")
          |> range(start: ${startDate.toISOString()}, stop: ${endDate.toISOString()})
          |> filter(fn: (r) => r["_measurement"] == "irrigation_events")
          |> filter(fn: (r) => r["_field"] == "water_used")
          |> aggregateWindow(every: 1d, fn: sum, createEmpty: false)
          |> sort(columns: ["_time"])
      `;

      const results = await this.influxDbService.query(fluxQuery);

      const waterUsage = results.map((record) => parseFloat(record._value));

      this.logger.debug(`Retrieved ${waterUsage.length} water usage data points`);

      return waterUsage;
    } catch (error) {
      this.logger.error(
        `Failed to fetch water usage data: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /**
   * Store recommendations to InfluxDB
   * @param recommendations Array of recommendations to store
   */
  private async storeRecommendations(
    recommendations: OptimizationRecommendation[],
  ): Promise<void> {
    if (recommendations.length === 0) {
      this.logger.debug('No recommendations to store');
      return;
    }

    try {
      this.logger.debug(`Storing ${recommendations.length} recommendations to InfluxDB`);

      for (const recommendation of recommendations) {
        await this.influxDbService.writeSensorData(
          'recommendations',
          {
            category: recommendation.category,
            priority: recommendation.priority,
            status: 'active',
          },
          {
            recommendation_id: recommendation.id,
            title: recommendation.title,
            description: recommendation.description,
            expected_impact: recommendation.expectedImpact,
            action_items: recommendation.actionItems.join(' | '),
          },
          recommendation.generatedAt,
        );
      }

      await this.influxDbService.flush();
      this.logger.log(`Successfully stored ${recommendations.length} recommendations to InfluxDB`);
    } catch (error) {
      this.logger.error(
        `Failed to store recommendations: ${error.message}`,
        error.stack,
      );
      // Don't throw - allow recommendation generation to continue even if storage fails
      // The recommendations are still returned to the caller
    }
  }

  /**
   * Fetch current weather data
   * @returns Array of weather data points
   */
  async fetchWeatherData(): Promise<WeatherData[]> {
    this.logger.log('Fetching weather data');

    try {
      // Check cache first
      const cacheKey = 'weather:latest';
      const cachedWeather = this.cacheService.get<WeatherData[]>(cacheKey);
      if (cachedWeather) {
        this.logger.log(`Returning cached weather data (${cachedWeather.length} points)`);
        return cachedWeather;
      }

      // Fetch from weather integration service
      const weatherData = await this.weatherIntegrationService.getCachedWeather();

      // Cache the weather data
      if (weatherData.length > 0) {
        this.cacheService.set(cacheKey, weatherData, this.WEATHER_CACHE_TTL);
        this.logger.log(`Cached ${weatherData.length} weather data points with TTL of ${this.WEATHER_CACHE_TTL / 1000 / 60} minutes`);
      } else {
        this.logger.warn('No weather data available from external service');
      }

      return weatherData;
    } catch (error) {
      this.logger.error(
        `Error fetching weather data: ${error.message}`,
        error.stack,
      );
      // Return empty array to allow system to continue
      return [];
    }
  }

  /**
   * Get historical data for a specific metric
   * @param metric Metric name
   * @param startDate Start of time range
   * @param endDate End of time range
   * @returns Array of time-series data points
   */
  async getHistoricalData(
    metric: string,
    startDate: Date,
    endDate: Date,
  ): Promise<TimeSeriesPoint[]> {
    this.logger.debug(
      `Fetching historical data for ${metric} from ${startDate.toISOString()} to ${endDate.toISOString()}`,
    );

    try {
      const bucket = this.influxDbService.getBucket();

      // Build Flux query to fetch environmental data
      const fluxQuery = `
        from(bucket: "${bucket}")
          |> range(start: ${startDate.toISOString()}, stop: ${endDate.toISOString()})
          |> filter(fn: (r) => r["_measurement"] == "environment")
          |> filter(fn: (r) => r["sensor_type"] == "${metric}")
          |> filter(fn: (r) => r["_field"] == "value")
          |> sort(columns: ["_time"])
      `;

      const results = await this.influxDbService.query(fluxQuery);

      // Transform results to TimeSeriesPoint format
      const timeSeriesData: TimeSeriesPoint[] = results.map((record) => ({
        timestamp: new Date(record._time),
        value: parseFloat(record._value),
      }));

      this.logger.debug(
        `Retrieved ${timeSeriesData.length} data points for ${metric}`,
      );

      return timeSeriesData;
    } catch (error) {
      this.logger.error(
        `Failed to fetch historical data for ${metric}: ${error.message}`,
        error.stack,
      );
      // Return empty array to allow system to continue with other metrics
      return [];
    }
  }

  /**
   * Check predictions against configured thresholds and trigger alerts
   * @param predictionResult Prediction result to check
   * @param historicalData Historical data for current value context
   */
  private async checkPredictionsAgainstThresholds(
    predictionResult: PredictionResult,
    historicalData: TimeSeriesPoint[],
  ): Promise<void> {
    const thresholdConfig = this.thresholds.find(
      (t) => t.metric === predictionResult.metric,
    );

    if (!thresholdConfig) {
      this.logger.debug(
        `No threshold configuration found for metric: ${predictionResult.metric}`,
      );
      return;
    }

    // Get current value from most recent historical data
    const currentValue =
      historicalData.length > 0
        ? historicalData[historicalData.length - 1].value
        : undefined;

    // Check each prediction against thresholds
    for (const prediction of predictionResult.predictions) {
      let thresholdBreached = false;
      let threshold: number | undefined;

      // Check upper threshold
      if (
        thresholdConfig.upperThreshold !== undefined &&
        prediction.value > thresholdConfig.upperThreshold
      ) {
        thresholdBreached = true;
        threshold = thresholdConfig.upperThreshold;
      }

      // Check lower threshold
      if (
        thresholdConfig.lowerThreshold !== undefined &&
        prediction.value < thresholdConfig.lowerThreshold
      ) {
        thresholdBreached = true;
        threshold = thresholdConfig.lowerThreshold;
      }

      // Trigger alert if threshold is breached
      if (thresholdBreached && threshold !== undefined) {
        try {
          await this.alertService.sendPredictiveAlert(
            predictionResult.metric,
            prediction.value,
            prediction.timestamp,
            threshold,
            currentValue,
          );

          this.logger.log(
            `Predictive alert triggered for ${predictionResult.metric}: predicted ${prediction.value} at ${prediction.timestamp.toISOString()} exceeds threshold ${threshold}`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to send predictive alert: ${error.message}`,
            error.stack,
          );
        }
      }
    }
  }

  /**
   * Set custom threshold configurations
   * @param thresholds Array of threshold configurations
   */
  setThresholds(thresholds: ThresholdConfig[]): void {
    this.thresholds = thresholds;
    this.logger.log(
      `Updated threshold configurations for ${thresholds.length} metrics`,
    );
  }

  /**
   * Get current threshold configurations
   * @returns Array of threshold configurations
   */
  getThresholds(): ThresholdConfig[] {
    return [...this.thresholds];
  }

  /**
   * Scheduled task to generate predictions every 6 hours
   * Runs at 00:00, 06:00, 12:00, and 18:00 daily
   */
  @Cron('0 0,6,12,18 * * *', {
    name: 'generate-predictions',
    timeZone: 'UTC',
  })
  async handleScheduledPredictionUpdate(): Promise<void> {
    this.logger.log('Starting scheduled prediction update');

    try {
      // Invalidate prediction cache before generating new predictions
      this.cacheService.invalidatePattern('predictions:');
      this.logger.debug('Invalidated prediction cache');

      // Generate predictions for default metrics
      const predictions = await this.generatePredictions(
        this.defaultMetrics,
        this.defaultForecastHours,
      );

      this.logger.log(
        `Scheduled prediction update completed successfully. Generated ${predictions.length} prediction sets.`,
      );
    } catch (error) {
      this.logger.error(
        `Scheduled prediction update failed: ${error.message}`,
        error.stack,
      );
      // Don't throw - we want the scheduler to continue running
    }
  }

  /**
   * Scheduled task to fetch weather data every hour
   * Runs at the top of every hour
   */
  @Cron('0 * * * *', {
    name: 'fetch-weather-data',
    timeZone: 'UTC',
  })
  async handleScheduledWeatherFetch(): Promise<void> {
    this.logger.log('Starting scheduled weather data fetch');

    try {
      // Invalidate weather cache before fetching new data
      this.cacheService.invalidate('weather:latest');
      this.logger.debug('Invalidated weather cache');

      // Fetch fresh weather data from external API
      const weatherData = await this.weatherIntegrationService.fetchForecast();

      this.logger.log(
        `Scheduled weather fetch completed successfully. Retrieved ${weatherData.length} weather data points.`,
      );
    } catch (error) {
      this.logger.error(
        `Scheduled weather fetch failed: ${error.message}`,
        error.stack,
      );
      // Don't throw - we want the scheduler to continue running
      // The WeatherIntegrationService already implements retry logic with exponential backoff
    }
  }
}
