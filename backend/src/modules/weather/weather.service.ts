import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENWEATHER_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.warn('OPENWEATHER_API_KEY not configured');
    }
  }

  async getCurrentWeather(lat: number, lon: number): Promise<any> {
    if (!this.apiKey) {
      throw new HttpException(
        'Weather API key not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const url = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
      
      this.logger.log(`Fetching weather for coordinates: ${lat}, ${lon}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new HttpException(
          `Weather API error: ${response.statusText}`,
          response.status,
        );
      }

      const data = await response.json();

      // Transform to a cleaner format
      return {
        location: {
          name: data.name,
          country: data.sys.country,
          coordinates: {
            lat: data.coord.lat,
            lon: data.coord.lon,
          },
        },
        current: {
          temperature: data.main.temp,
          feelsLike: data.main.feels_like,
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          windSpeed: data.wind.speed,
          windDirection: data.wind.deg,
          cloudiness: data.clouds.all,
          visibility: data.visibility,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          main: data.weather[0].main,
        },
        timestamp: new Date(data.dt * 1000).toISOString(),
        sunrise: new Date(data.sys.sunrise * 1000).toISOString(),
        sunset: new Date(data.sys.sunset * 1000).toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch weather data: ${error.message}`, error.stack);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to fetch weather data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getForecast(lat: number, lon: number): Promise<any> {
    if (!this.apiKey) {
      throw new HttpException(
        'Weather API key not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const url = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new HttpException(
          `Weather API error: ${response.statusText}`,
          response.status,
        );
      }

      const data = await response.json();

      // Transform forecast data
      return {
        location: {
          name: data.city.name,
          country: data.city.country,
          coordinates: {
            lat: data.city.coord.lat,
            lon: data.city.coord.lon,
          },
        },
        forecast: data.list.map((item: any) => ({
          timestamp: new Date(item.dt * 1000).toISOString(),
          temperature: item.main.temp,
          feelsLike: item.main.feels_like,
          humidity: item.main.humidity,
          pressure: item.main.pressure,
          windSpeed: item.wind.speed,
          cloudiness: item.clouds.all,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          main: item.weather[0].main,
          precipitation: item.pop * 100, // Probability of precipitation
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch forecast data: ${error.message}`, error.stack);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to fetch forecast data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
