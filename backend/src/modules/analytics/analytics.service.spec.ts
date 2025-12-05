import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { InfluxDbService } from '../../common/services/influxdb/influxdb.service';
import { AlertService } from '../../common/services/alerts/alert.service';
import { PredictionEngine } from './services/prediction-engine.service';
import { OptimizationEngine } from './services/optimization-engine.service';
import { WeatherIntegrationService } from './services/weather-integration.service';
import { CacheService } from './services/cache.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let influxDbService: InfluxDbService;
  let alertService: AlertService;
  let predictionEngine: PredictionEngine;
  let optimizationEngine: OptimizationEngine;
  let weatherIntegrationService: WeatherIntegrationService;
  let cacheService: CacheService;

  const mockInfluxDbService = {
    getBucket: jest.fn().mockReturnValue('test-bucket'),
    query: jest.fn(),
    writeSensorData: jest.fn(),
    flush: jest.fn(),
  };

  const mockAlertService = {
    sendPredictiveAlert: jest.fn(),
  };

  const mockPredictionEngine = {
    forecast: jest.fn(),
    calculateConfidenceInterval: jest.fn(),
  };

  const mockOptimizationEngine = {
    analyzeEnvironmentalConditions: jest.fn(),
    identifyIrrigationOptimizations: jest.fn(),
    assessEnergyEfficiency: jest.fn(),
  };

  const mockWeatherIntegrationService = {
    getCachedWeather: jest.fn(),
    fetchForecast: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    invalidate: jest.fn(),
    invalidatePattern: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: InfluxDbService,
          useValue: mockInfluxDbService,
        },
        {
          provide: AlertService,
          useValue: mockAlertService,
        },
        {
          provide: PredictionEngine,
          useValue: mockPredictionEngine,
        },
        {
          provide: OptimizationEngine,
          useValue: mockOptimizationEngine,
        },
        {
          provide: WeatherIntegrationService,
          useValue: mockWeatherIntegrationService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    influxDbService = module.get<InfluxDbService>(InfluxDbService);
    alertService = module.get<AlertService>(AlertService);
    predictionEngine = module.get<PredictionEngine>(PredictionEngine);
    optimizationEngine = module.get<OptimizationEngine>(OptimizationEngine);
    weatherIntegrationService = module.get<WeatherIntegrationService>(
      WeatherIntegrationService,
    );
    cacheService = module.get<CacheService>(CacheService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('prediction generation workflow', () => {
    it('should generate predictions for specified metrics', async () => {
      // Arrange
      const metrics = ['temperature_air', 'humidity_air'];
      const hoursAhead = 24;

      mockCacheService.get.mockReturnValue(null); // No cache
      mockInfluxDbService.query.mockResolvedValue([
        { _time: '2024-01-01T00:00:00Z', _value: 20 },
        { _time: '2024-01-01T01:00:00Z', _value: 21 },
      ]);

      mockWeatherIntegrationService.getCachedWeather.mockResolvedValue([]);

      mockPredictionEngine.forecast.mockReturnValue({
        metric: 'temperature_air',
        predictions: [
          {
            timestamp: new Date('2024-01-02T00:00:00Z'),
            value: 22,
            confidenceInterval: { lower: 20, upper: 24 },
          },
        ],
        generatedAt: new Date(),
        dataPointsUsed: 2,
      });

      // Act
      const result = await service.generatePredictions(metrics, hoursAhead);

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(mockInfluxDbService.query).toHaveBeenCalled();
      expect(mockPredictionEngine.forecast).toHaveBeenCalled();
    });

    it('should use cached predictions when available', async () => {
      // Arrange
      const metrics = ['temperature_air'];
      const hoursAhead = 24;
      const cachedPredictions = [
        {
          metric: 'temperature_air',
          predictions: [],
          generatedAt: new Date(),
          dataPointsUsed: 10,
        },
      ];

      mockCacheService.get.mockReturnValue(cachedPredictions);

      // Act
      const result = await service.generatePredictions(metrics, hoursAhead);

      // Assert
      expect(result).toEqual(cachedPredictions);
      expect(mockInfluxDbService.query).not.toHaveBeenCalled();
      expect(mockPredictionEngine.forecast).not.toHaveBeenCalled();
    });

    it('should skip metrics with no historical data', async () => {
      // Arrange
      const metrics = ['temperature_air', 'humidity_air'];
      const hoursAhead = 24;

      mockCacheService.get.mockReturnValue(null);
      mockInfluxDbService.query.mockResolvedValue([]); // No data
      mockWeatherIntegrationService.getCachedWeather.mockResolvedValue([]);

      // Act
      const result = await service.generatePredictions(metrics, hoursAhead);

      // Assert
      expect(result).toEqual([]);
      expect(mockPredictionEngine.forecast).not.toHaveBeenCalled();
    });

    it('should integrate weather data into predictions', async () => {
      // Arrange
      const metrics = ['temperature_air'];
      const hoursAhead = 24;

      mockCacheService.get.mockReturnValue(null);
      mockInfluxDbService.query.mockResolvedValue([
        { _time: '2024-01-01T00:00:00Z', _value: 20 },
      ]);

      mockWeatherIntegrationService.getCachedWeather.mockResolvedValue([
        {
          timestamp: new Date('2024-01-02T00:00:00Z'),
          temperature: 22,
          humidity: 65,
          precipitation: 0,
          solarRadiation: 500,
          source: 'test',
        },
      ]);

      mockPredictionEngine.forecast.mockReturnValue({
        metric: 'temperature_air',
        predictions: [],
        generatedAt: new Date(),
        dataPointsUsed: 1,
      });

      // Act
      await service.generatePredictions(metrics, hoursAhead);

      // Assert
      expect(mockWeatherIntegrationService.getCachedWeather).toHaveBeenCalled();
      expect(mockPredictionEngine.forecast).toHaveBeenCalled();
    });
  });

  describe('recommendation generation workflow', () => {
    it('should generate optimization recommendations', async () => {
      // Arrange
      mockCacheService.get.mockReturnValue(null);
      mockInfluxDbService.query.mockResolvedValue([
        { _time: '2024-01-01T00:00:00Z', _value: 20 },
      ]);

      mockWeatherIntegrationService.getCachedWeather.mockResolvedValue([]);

      mockOptimizationEngine.analyzeEnvironmentalConditions.mockReturnValue([
        {
          id: 'rec_1',
          category: 'temperature',
          title: 'Test Recommendation',
          description: 'Test description',
          expectedImpact: 'Test impact',
          priority: 'high',
          actionItems: ['Action 1'],
          generatedAt: new Date(),
        },
      ]);

      mockOptimizationEngine.identifyIrrigationOptimizations.mockReturnValue([]);
      mockOptimizationEngine.assessEnergyEfficiency.mockReturnValue([]);

      // Act
      const result = await service.generateOptimizationRecommendations();

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(mockOptimizationEngine.analyzeEnvironmentalConditions).toHaveBeenCalled();
    });

    it('should use cached recommendations when available', async () => {
      // Arrange
      const cachedRecommendations = [
        {
          id: 'rec_1',
          category: 'temperature',
          title: 'Cached Recommendation',
          description: 'Cached description',
          expectedImpact: 'Cached impact',
          priority: 'high',
          actionItems: ['Action 1'],
          generatedAt: new Date(),
        },
      ];

      mockCacheService.get.mockReturnValue(cachedRecommendations);

      // Act
      const result = await service.generateOptimizationRecommendations();

      // Assert
      expect(result).toEqual(cachedRecommendations);
      expect(mockInfluxDbService.query).not.toHaveBeenCalled();
      expect(mockOptimizationEngine.analyzeEnvironmentalConditions).not.toHaveBeenCalled();
    });

    it('should combine recommendations from all engines', async () => {
      // Arrange
      mockCacheService.get.mockReturnValue(null);
      mockInfluxDbService.query.mockResolvedValue([
        { _time: '2024-01-01T00:00:00Z', _value: 20 },
      ]);

      mockWeatherIntegrationService.getCachedWeather.mockResolvedValue([]);

      mockOptimizationEngine.analyzeEnvironmentalConditions.mockReturnValue([
        {
          id: 'rec_1',
          category: 'temperature',
          title: 'Environmental Rec',
          description: 'Test',
          expectedImpact: 'Test',
          priority: 'high',
          actionItems: [],
          generatedAt: new Date(),
        },
      ]);

      mockOptimizationEngine.identifyIrrigationOptimizations.mockReturnValue([
        {
          id: 'rec_2',
          category: 'irrigation',
          title: 'Irrigation Rec',
          description: 'Test',
          expectedImpact: 'Test',
          priority: 'medium',
          actionItems: [],
          generatedAt: new Date(),
        },
      ]);

      mockOptimizationEngine.assessEnergyEfficiency.mockReturnValue([
        {
          id: 'rec_3',
          category: 'light',
          title: 'Energy Rec',
          description: 'Test',
          expectedImpact: 'Test',
          priority: 'low',
          actionItems: [],
          generatedAt: new Date(),
        },
      ]);

      // Act
      const result = await service.generateOptimizationRecommendations();

      // Assert
      expect(result.length).toBe(3);
      expect(result.some((r) => r.category === 'temperature')).toBe(true);
      expect(result.some((r) => r.category === 'irrigation')).toBe(true);
      expect(result.some((r) => r.category === 'light')).toBe(true);
    });
  });

  describe('integration with InfluxDbService', () => {
    it('should fetch historical data from InfluxDB', async () => {
      // Arrange
      const metric = 'temperature_air';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      mockInfluxDbService.query.mockResolvedValue([
        { _time: '2024-01-01T00:00:00Z', _value: 20 },
        { _time: '2024-01-01T01:00:00Z', _value: 21 },
      ]);

      // Act
      const result = await service.getHistoricalData(metric, startDate, endDate);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].value).toBe(20);
      expect(result[1].value).toBe(21);
      expect(mockInfluxDbService.query).toHaveBeenCalled();
    });

    it('should handle empty result sets gracefully', async () => {
      // Arrange
      const metric = 'temperature_air';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      mockInfluxDbService.query.mockResolvedValue([]);

      // Act
      const result = await service.getHistoricalData(metric, startDate, endDate);

      // Assert
      expect(result).toEqual([]);
    });

    it('should store predictions to InfluxDB', async () => {
      // Arrange
      const metrics = ['temperature_air'];
      const hoursAhead = 24;

      mockCacheService.get.mockReturnValue(null);
      mockInfluxDbService.query.mockResolvedValue([
        { _time: '2024-01-01T00:00:00Z', _value: 20 },
      ]);

      mockWeatherIntegrationService.getCachedWeather.mockResolvedValue([]);

      mockPredictionEngine.forecast.mockReturnValue({
        metric: 'temperature_air',
        predictions: [
          {
            timestamp: new Date('2024-01-02T00:00:00Z'),
            value: 22,
            confidenceInterval: { lower: 20, upper: 24 },
          },
        ],
        generatedAt: new Date(),
        dataPointsUsed: 1,
      });

      // Act
      await service.generatePredictions(metrics, hoursAhead);

      // Assert
      expect(mockInfluxDbService.writeSensorData).toHaveBeenCalled();
      expect(mockInfluxDbService.flush).toHaveBeenCalled();
    });
  });

  describe('integration with AlertService for predictive alerts', () => {
    it('should trigger predictive alert when prediction exceeds threshold', async () => {
      // Arrange
      const metrics = ['temperature_air'];
      const hoursAhead = 24;

      mockCacheService.get.mockReturnValue(null);
      mockInfluxDbService.query.mockResolvedValue([
        { _time: '2024-01-01T00:00:00Z', _value: 20 },
      ]);

      mockWeatherIntegrationService.getCachedWeather.mockResolvedValue([]);

      // Prediction that exceeds upper threshold (35)
      mockPredictionEngine.forecast.mockReturnValue({
        metric: 'temperature_air',
        predictions: [
          {
            timestamp: new Date('2024-01-02T00:00:00Z'),
            value: 40, // Exceeds threshold
            confidenceInterval: { lower: 38, upper: 42 },
          },
        ],
        generatedAt: new Date(),
        dataPointsUsed: 1,
      });

      // Act
      await service.generatePredictions(metrics, hoursAhead);

      // Assert
      expect(mockAlertService.sendPredictiveAlert).toHaveBeenCalled();
    });

    it('should not trigger alert when prediction is within thresholds', async () => {
      // Arrange
      const metrics = ['temperature_air'];
      const hoursAhead = 24;

      mockCacheService.get.mockReturnValue(null);
      mockInfluxDbService.query.mockResolvedValue([
        { _time: '2024-01-01T00:00:00Z', _value: 20 },
      ]);

      mockWeatherIntegrationService.getCachedWeather.mockResolvedValue([]);

      // Prediction within thresholds (10-35)
      mockPredictionEngine.forecast.mockReturnValue({
        metric: 'temperature_air',
        predictions: [
          {
            timestamp: new Date('2024-01-02T00:00:00Z'),
            value: 25, // Within thresholds
            confidenceInterval: { lower: 23, upper: 27 },
          },
        ],
        generatedAt: new Date(),
        dataPointsUsed: 1,
      });

      // Act
      await service.generatePredictions(metrics, hoursAhead);

      // Assert
      expect(mockAlertService.sendPredictiveAlert).not.toHaveBeenCalled();
    });
  });
});
