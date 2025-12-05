import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WeatherData, WeatherApiConfig } from '../interfaces/analytics.interface';
import { CircuitBreakerService, CircuitBreakerOpenError } from '../../../common/services/circuit-breaker/circuit-breaker.service';

interface OpenWeatherMapResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      humidity: number;
    };
    rain?: {
      '3h': number;
    };
    snow?: {
      '3h': number;
    };
    clouds?: {
      all: number;
    };
  }>;
}

@Injectable()
export class WeatherIntegrationService {
  private readonly logger = new Logger(WeatherIntegrationService.name);
  private readonly config: WeatherApiConfig;
  private cachedWeather: WeatherData[] = [];
  private lastFetchTime: Date | null = null;
  private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_RETRY_DELAY_MS = 1000;
  private readonly CIRCUIT_BREAKER_NAME = 'weather-api';

  constructor(
    private configService: ConfigService,
    private circuitBreakerService: CircuitBreakerService,
  ) {
    this.config = {
      apiUrl: this.configService.get<string>(
        'WEATHER_API_URL',
        'https://api.openweathermap.org/data/2.5/forecast',
      ),
      apiKey: this.configService.get<string>('WEATHER_API_KEY', ''),
      location: {
        latitude: this.configService.get<number>('LOCATION_LAT', 0),
        longitude: this.configService.get<number>('LOCATION_LON', 0),
      },
    };
  }

  /**
   * Fetch weather forecast from external API with retry logic and circuit breaker
   * @returns Array of weather data points
   */
  async fetchForecast(): Promise<WeatherData[]> {
    this.logger.log('Fetching weather forecast from external API');

    // Validate configuration
    if (!this.config.apiKey) {
      const errorMsg = 'Weather API key not configured';
      this.logger.warn(`${errorMsg}, returning empty forecast`);
      return [];
    }

    if (this.config.location.latitude === 0 && this.config.location.longitude === 0) {
      const errorMsg = 'Location coordinates not configured';
      this.logger.warn(`${errorMsg}, returning empty forecast`);
      return [];
    }

    try {
      // Use circuit breaker to protect against repeated failures
      const weatherData = await this.circuitBreakerService.execute(
        this.CIRCUIT_BREAKER_NAME,
        async () => await this.fetchWithRetry(),
        {
          failureThreshold: 5,
          successThreshold: 2,
          timeout: 300000, // 5 minutes
        },
      );

      // Update cache on success
      this.cachedWeather = weatherData;
      this.lastFetchTime = new Date();

      this.logger.log(`Successfully fetched ${weatherData.length} weather data points`);
      return weatherData;
    } catch (error) {
      if (error instanceof CircuitBreakerOpenError) {
        this.logger.warn(
          `Circuit breaker is OPEN for weather API. Using cached data if available.`,
        );
      } else {
        this.logger.error(
          `Failed to fetch weather data: ${error.message}`,
          error.stack,
        );
      }

      // Return cached data if available, otherwise empty array
      if (this.cachedWeather.length > 0) {
        this.logger.warn('Returning stale cached weather data as fallback');
        return this.cachedWeather;
      }

      this.logger.warn('No cached weather data available, returning empty array');
      return [];
    }
  }

  /**
   * Fetch weather data with retry logic
   * @private
   */
  private async fetchWithRetry(): Promise<WeatherData[]> {
    let lastError: Error | null = null;

    // Retry logic with exponential backoff
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        this.logger.debug(`Weather API fetch attempt ${attempt + 1}/${this.MAX_RETRIES}`);
        const weatherData = await this.fetchFromApi();
        return weatherData;
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(
          `Weather API fetch attempt ${attempt + 1}/${this.MAX_RETRIES} failed: ${error.message}`,
        );

        // Don't wait after the last attempt
        if (attempt < this.MAX_RETRIES - 1) {
          const delayMs = this.INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
          this.logger.debug(`Retrying in ${delayMs}ms...`);
          await this.sleep(delayMs);
        }
      }
    }

    // All retries failed
    const errorMsg = `Failed to fetch weather data after ${this.MAX_RETRIES} attempts: ${lastError?.message}`;
    this.logger.error(errorMsg);
    throw new ServiceUnavailableException(
      'Weather service is temporarily unavailable. Please try again later.',
    );
  }

  /**
   * Fetch weather data from OpenWeatherMap API
   * @private
   */
  private async fetchFromApi(): Promise<WeatherData[]> {
    try {
      const url = new URL(this.config.apiUrl);
      url.searchParams.append('lat', this.config.location.latitude.toString());
      url.searchParams.append('lon', this.config.location.longitude.toString());
      url.searchParams.append('appid', this.config.apiKey);
      url.searchParams.append('units', 'metric');

      this.logger.debug(`Fetching weather from: ${url.origin}${url.pathname}`);

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorMsg = `Weather API returned status ${response.status}: ${response.statusText}`;
        this.logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      const data: OpenWeatherMapResponse = await response.json();

      if (!data.list || !Array.isArray(data.list)) {
        throw new Error('Invalid response format from weather API');
      }

      // Transform OpenWeatherMap response to our WeatherData format
      const weatherData = data.list.map((item) => {
        // Calculate solar radiation estimate from cloud cover
        // Clear sky solar radiation ~1000 W/m², reduced by cloud cover
        const cloudCover = item.clouds?.all ?? 0;
        const solarRadiation = 1000 * (1 - cloudCover / 100);

        // Calculate precipitation (rain + snow), handling NaN values
        const rain = item.rain?.['3h'] ?? 0;
        const snow = item.snow?.['3h'] ?? 0;
        const rainValue = isFinite(rain) ? rain : 0;
        const snowValue = isFinite(snow) ? snow : 0;
        const precipitation = rainValue + snowValue;

        // Ensure temperature and humidity are valid numbers
        const temperature = isFinite(item.main.temp) ? item.main.temp : 0;
        const humidity = isFinite(item.main.humidity) ? item.main.humidity : 0;

        return {
          timestamp: new Date(item.dt * 1000),
          temperature,
          humidity,
          precipitation,
          solarRadiation,
          source: 'OpenWeatherMap',
        };
      });

      this.logger.debug(`Transformed ${weatherData.length} weather data points`);
      return weatherData;
    } catch (error) {
      this.logger.error(
        `Error fetching from weather API: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get cached weather data if available and not stale
   * @returns Cached weather data or fetches fresh data
   */
  async getCachedWeather(): Promise<WeatherData[]> {
    try {
      if (this.isWeatherDataStale()) {
        this.logger.debug('Weather data is stale, fetching fresh data');
        return await this.fetchForecast();
      }

      this.logger.debug(`Returning cached weather data (${this.cachedWeather.length} points)`);
      return this.cachedWeather;
    } catch (error) {
      this.logger.error(
        `Error getting cached weather: ${error.message}`,
        error.stack,
      );
      // Return empty array on error to allow system to continue
      return [];
    }
  }

  /**
   * Check if cached weather data is stale
   * @returns True if data should be refreshed
   */
  isWeatherDataStale(): boolean {
    if (!this.lastFetchTime) {
      return true;
    }

    const timeSinceLastFetch = Date.now() - this.lastFetchTime.getTime();
    return timeSinceLastFetch > this.CACHE_TTL_MS;
  }

  /**
   * Sleep for specified milliseconds
   * @private
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
