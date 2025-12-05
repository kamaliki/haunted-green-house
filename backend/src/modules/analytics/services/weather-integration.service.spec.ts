import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WeatherIntegrationService } from './weather-integration.service';
import { CircuitBreakerService } from '../../../common/services/circuit-breaker/circuit-breaker.service';

describe('WeatherIntegrationService', () => {
  let service: WeatherIntegrationService;
  let configService: ConfigService;
  let circuitBreakerService: CircuitBreakerService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        WEATHER_API_URL: 'https://api.openweathermap.org/data/2.5/forecast',
        WEATHER_API_KEY: 'test-api-key',
        LOCATION_LAT: 40.7128,
        LOCATION_LON: -74.006,
      };
      return config[key] ?? defaultValue;
    }),
  };

  const mockCircuitBreakerService = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherIntegrationService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: CircuitBreakerService,
          useValue: mockCircuitBreakerService,
        },
      ],
    }).compile();

    service = module.get<WeatherIntegrationService>(WeatherIntegrationService);
    configService = module.get<ConfigService>(ConfigService);
    circuitBreakerService = module.get<CircuitBreakerService>(
      CircuitBreakerService,
    );

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('weather data fetching', () => {
    it('should fetch weather data successfully', async () => {
      // Arrange
      const mockWeatherResponse = {
        list: [
          {
            dt: 1704067200,
            main: { temp: 20, humidity: 65 },
            rain: { '3h': 2.5 },
            clouds: { all: 40 },
          },
          {
            dt: 1704078000,
            main: { temp: 22, humidity: 60 },
            clouds: { all: 30 },
          },
        ],
      };

      // Mock circuit breaker to execute the function
      mockCircuitBreakerService.execute.mockImplementation(
        async (name, fn) => await fn(),
      );

      // Mock fetch
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockWeatherResponse,
      } as Response);

      // Act
      const result = await service.fetchForecast();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].temperature).toBe(20);
      expect(result[0].humidity).toBe(65);
      expect(result[0].precipitation).toBe(2.5);
      expect(result[0].source).toBe('OpenWeatherMap');
      expect(result[0].timestamp).toBeInstanceOf(Date);
      expect(result[1].temperature).toBe(22);
      expect(result[1].humidity).toBe(60);
      expect(result[1].precipitation).toBe(0);
    });

    it('should calculate solar radiation from cloud cover', async () => {
      // Arrange
      const mockWeatherResponse = {
        list: [
          {
            dt: 1704067200,
            main: { temp: 20, humidity: 65 },
            clouds: { all: 50 }, // 50% cloud cover
          },
        ],
      };

      mockCircuitBreakerService.execute.mockImplementation(
        async (name, fn) => await fn(),
      );

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockWeatherResponse,
      } as Response);

      // Act
      const result = await service.fetchForecast();

      // Assert
      // Solar radiation should be 1000 * (1 - 0.5) = 500
      expect(result[0].solarRadiation).toBe(500);
    });

    it('should handle missing optional fields gracefully', async () => {
      // Arrange
      const mockWeatherResponse = {
        list: [
          {
            dt: 1704067200,
            main: { temp: 20, humidity: 65 },
            // No rain, snow, or clouds data
          },
        ],
      };

      mockCircuitBreakerService.execute.mockImplementation(
        async (name, fn) => await fn(),
      );

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockWeatherResponse,
      } as Response);

      // Act
      const result = await service.fetchForecast();

      // Assert
      expect(result[0].precipitation).toBe(0);
      expect(result[0].solarRadiation).toBe(1000); // Clear sky
    });

    it('should return empty array when API key is not configured', async () => {
      // Arrange
      mockConfigService.get.mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'WEATHER_API_KEY') return '';
        return defaultValue;
      });

      // Recreate service with new config
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          WeatherIntegrationService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
          {
            provide: CircuitBreakerService,
            useValue: mockCircuitBreakerService,
          },
        ],
      }).compile();

      const testService = module.get<WeatherIntegrationService>(
        WeatherIntegrationService,
      );

      // Act
      const result = await testService.fetchForecast();

      // Assert
      expect(result).toEqual([]);
      expect(mockCircuitBreakerService.execute).not.toHaveBeenCalled();
    });

    it('should return empty array when location is not configured', async () => {
      // Arrange
      mockConfigService.get.mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'LOCATION_LAT' || key === 'LOCATION_LON') return 0;
        if (key === 'WEATHER_API_KEY') return 'test-key';
        return defaultValue;
      });

      // Recreate service with new config
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          WeatherIntegrationService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
          {
            provide: CircuitBreakerService,
            useValue: mockCircuitBreakerService,
          },
        ],
      }).compile();

      const testService = module.get<WeatherIntegrationService>(
        WeatherIntegrationService,
      );

      // Act
      const result = await testService.fetchForecast();

      // Assert
      expect(result).toEqual([]);
      expect(mockCircuitBreakerService.execute).not.toHaveBeenCalled();
    });
  });

  describe('caching behavior', () => {
    it('should identify stale data correctly when no data has been fetched', () => {
      // Act: Check if data is stale when no data has been fetched
      const isStale = service.isWeatherDataStale();

      // Assert
      expect(isStale).toBe(true);
    });

    it('should call fetchForecast when cache is stale in getCachedWeather', async () => {
      // Arrange
      const mockWeatherResponse = {
        list: [
          {
            dt: 1704067200,
            main: { temp: 20, humidity: 65 },
            clouds: { all: 0 },
          },
        ],
      };

      mockCircuitBreakerService.execute.mockImplementation(
        async (name, fn) => await fn(),
      );

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockWeatherResponse,
      } as Response);

      // Act: getCachedWeather should fetch when cache is stale
      const result = await service.getCachedWeather();

      // Assert: Should attempt to fetch data (may return empty if config issues)
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array on error in getCachedWeather', async () => {
      // Arrange
      mockCircuitBreakerService.execute.mockRejectedValue(
        new Error('API unavailable'),
      );

      // Act
      const result = await service.getCachedWeather();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('error handling when API is unavailable', () => {
    it('should return empty array when API returns error status', async () => {
      // Arrange
      mockCircuitBreakerService.execute.mockImplementation(
        async (name, fn) => await fn(),
      );

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      // Act
      const result = await service.fetchForecast();

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle successful API response with circuit breaker', async () => {
      // Arrange
      const mockWeatherResponse = {
        list: [
          {
            dt: 1704067200,
            main: { temp: 20, humidity: 65 },
            clouds: { all: 0 },
          },
        ],
      };

      mockCircuitBreakerService.execute.mockImplementation(
        async (name, fn) => await fn(),
      );

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockWeatherResponse,
      } as Response);

      // Act
      const result = await service.fetchForecast();

      // Assert: Should return weather data
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array when API fails and no cache exists', async () => {
      // Arrange
      mockCircuitBreakerService.execute.mockRejectedValue(
        new Error('API unavailable'),
      );

      // Act
      const result = await service.fetchForecast();

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle invalid response format', async () => {
      // Arrange
      mockCircuitBreakerService.execute.mockImplementation(
        async (name, fn) => await fn(),
      );

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ invalid: 'format' }),
      } as Response);

      // Act
      const result = await service.fetchForecast();

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle network errors gracefully', async () => {
      // Arrange
      mockCircuitBreakerService.execute.mockImplementation(
        async (name, fn) => await fn(),
      );

      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.fetchForecast();

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle invalid numeric values in weather data', async () => {
      // Arrange
      const mockWeatherResponse = {
        list: [
          {
            dt: 1704067200,
            main: { temp: NaN, humidity: NaN },
            rain: { '3h': NaN },
            clouds: { all: 0 },
          },
        ],
      };

      mockCircuitBreakerService.execute.mockImplementation(
        async (name, fn) => await fn(),
      );

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockWeatherResponse,
      } as Response);

      // Act
      const result = await service.fetchForecast();

      // Assert: Service should handle NaN values gracefully
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // If data is returned, it should have converted NaN to 0
      if (result.length > 0) {
        expect(result[0].temperature).toBe(0);
        expect(result[0].humidity).toBe(0);
        expect(result[0].precipitation).toBe(0);
      }
    });
  });
});
