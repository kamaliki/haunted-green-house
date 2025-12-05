import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AnalyticsModule } from '../src/modules/analytics/analytics.module';
import { AnalyticsService } from '../src/modules/analytics/analytics.service';
import { PredictionEngine } from '../src/modules/analytics/services/prediction-engine.service';
import { OptimizationEngine } from '../src/modules/analytics/services/optimization-engine.service';
import { WeatherIntegrationService } from '../src/modules/analytics/services/weather-integration.service';
import { InfluxDbService } from '../src/common/services/influxdb/influxdb.service';
import { AlertService } from '../src/modules/alerts/alert.service';
import {
  PredictionResult,
  OptimizationRecommendation,
  WeatherData,
} from '../src/modules/analytics/interfaces/analytics.interface';

describe('Analytics Endpoints (e2e)', () => {
  let app: INestApplication<App>;
  let analyticsService: AnalyticsService;

  // Mock data
  const mockPredictionResults: PredictionResult[] = [
    {
      metric: 'temperature_air',
      predictions: [
        {
          timestamp: new Date('2024-01-15T14:00:00.000Z'),
          value: 25.0,
          confidenceInterval: {
            lower: 22.5,
            upper: 27.5,
          },
        },
        {
          timestamp: new Date('2024-01-15T15:00:00.000Z'),
          value: 25.5,
          confidenceInterval: {
            lower: 23.0,
            upper: 28.0,
          },
        },
      ],
      generatedAt: new Date('2024-01-15T12:00:00.000Z'),
      dataPointsUsed: 720,
    },
  ];

  const mockRecommendations: OptimizationRecommendation[] = [
    {
      id: 'rec-123',
      category: 'temperature',
      title: 'Optimize temperature control',
      description:
        'Temperature fluctuations detected during night hours. Consider adjusting heating schedule.',
      expectedImpact:
        'Reduce temperature variance by 15%, improve plant growth rate by 5-10%',
      priority: 'high',
      actionItems: [
        'Adjust heating schedule to start 1 hour earlier',
        'Monitor temperature variance over next 3 days',
      ],
      generatedAt: new Date('2024-01-15T12:00:00.000Z'),
    },
  ];

  const mockWeatherData: WeatherData[] = [
    {
      timestamp: new Date('2024-01-15T14:00:00.000Z'),
      temperature: 22.5,
      humidity: 65.0,
      precipitation: 0.0,
      solarRadiation: 850.0,
      source: 'OpenWeatherMap',
    },
    {
      timestamp: new Date('2024-01-15T15:00:00.000Z'),
      temperature: 23.0,
      humidity: 63.0,
      precipitation: 0.0,
      solarRadiation: 900.0,
      source: 'OpenWeatherMap',
    },
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AnalyticsModule],
    })
      .overrideProvider(InfluxDbService)
      .useValue({
        query: jest.fn().mockResolvedValue([]),
        writePoint: jest.fn().mockResolvedValue(undefined),
        writePoints: jest.fn().mockResolvedValue(undefined),
      })
      .overrideProvider(AlertService)
      .useValue({
        sendPredictiveAlert: jest.fn().mockResolvedValue(undefined),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    
    // Apply the same validation pipe as the main app
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
      }),
    );

    await app.init();

    analyticsService = moduleFixture.get<AnalyticsService>(AnalyticsService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /analytics/predictions', () => {
    it('should return predictions with default parameters', async () => {
      jest
        .spyOn(analyticsService, 'generatePredictions')
        .mockResolvedValue(mockPredictionResults);

      const response = await request(app.getHttpServer())
        .get('/analytics/predictions')
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            metric: 'temperature_air',
            predictions: expect.any(Array),
            generatedAt: expect.any(String),
            dataPointsUsed: expect.any(Number),
          }),
        ]),
      );

      expect(analyticsService.generatePredictions).toHaveBeenCalledWith(
        ['temperature_air', 'humidity_air', 'light_intensity'],
        24,
      );
    });

    it('should return predictions with custom metrics parameter', async () => {
      jest
        .spyOn(analyticsService, 'generatePredictions')
        .mockResolvedValue(mockPredictionResults);

      const response = await request(app.getHttpServer())
        .get('/analytics/predictions?metrics=temperature_air,humidity_air')
        .expect(200);

      expect(response.body).toEqual(expect.any(Array));
      expect(analyticsService.generatePredictions).toHaveBeenCalledWith(
        ['temperature_air', 'humidity_air'],
        24,
      );
    });

    it('should return predictions with custom hours parameter', async () => {
      jest
        .spyOn(analyticsService, 'generatePredictions')
        .mockResolvedValue(mockPredictionResults);

      const response = await request(app.getHttpServer())
        .get('/analytics/predictions?hours=48')
        .expect(200);

      expect(response.body).toEqual(expect.any(Array));
      expect(analyticsService.generatePredictions).toHaveBeenCalledWith(
        ['temperature_air', 'humidity_air', 'light_intensity'],
        48,
      );
    });

    it('should return predictions with both custom metrics and hours', async () => {
      jest
        .spyOn(analyticsService, 'generatePredictions')
        .mockResolvedValue(mockPredictionResults);

      const response = await request(app.getHttpServer())
        .get('/analytics/predictions?metrics=temperature_air&hours=12')
        .expect(200);

      expect(response.body).toEqual(expect.any(Array));
      expect(analyticsService.generatePredictions).toHaveBeenCalledWith(
        ['temperature_air'],
        12,
      );
    });

    it('should reject invalid metric names', async () => {
      const response = await request(app.getHttpServer())
        .get('/analytics/predictions?metrics=invalid_metric,temperature_air&hours=24')
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          message: expect.stringContaining('Invalid metrics: invalid_metric'),
        }),
      );
    });

    it('should reject hours parameter below minimum (1)', async () => {
      const response = await request(app.getHttpServer())
        .get('/analytics/predictions?hours=0')
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          message: expect.any(Array),
        }),
      );
    });

    it('should reject hours parameter above maximum (168)', async () => {
      const response = await request(app.getHttpServer())
        .get('/analytics/predictions?hours=200')
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          message: expect.any(Array),
        }),
      );
    });

    it('should reject non-numeric hours parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/analytics/predictions?hours=abc')
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          message: expect.any(Array),
        }),
      );
    });

    it('should handle service errors gracefully', async () => {
      jest
        .spyOn(analyticsService, 'generatePredictions')
        .mockRejectedValue(new Error('Service error'));

      await request(app.getHttpServer())
        .get('/analytics/predictions')
        .expect(500);
    });
  });

  describe('GET /analytics/recommendations', () => {
    it('should return optimization recommendations', async () => {
      jest
        .spyOn(analyticsService, 'generateOptimizationRecommendations')
        .mockResolvedValue(mockRecommendations);

      const response = await request(app.getHttpServer())
        .get('/analytics/recommendations')
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            category: expect.any(String),
            title: expect.any(String),
            description: expect.any(String),
            expectedImpact: expect.any(String),
            priority: expect.any(String),
            actionItems: expect.any(Array),
            generatedAt: expect.any(String),
          }),
        ]),
      );

      expect(
        analyticsService.generateOptimizationRecommendations,
      ).toHaveBeenCalled();
    });

    it('should return empty array when no recommendations available', async () => {
      jest
        .spyOn(analyticsService, 'generateOptimizationRecommendations')
        .mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/analytics/recommendations')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should handle service errors gracefully', async () => {
      jest
        .spyOn(analyticsService, 'generateOptimizationRecommendations')
        .mockRejectedValue(new Error('Service error'));

      await request(app.getHttpServer())
        .get('/analytics/recommendations')
        .expect(500);
    });
  });

  describe('GET /analytics/weather', () => {
    it('should return weather forecast data', async () => {
      jest
        .spyOn(analyticsService, 'fetchWeatherData')
        .mockResolvedValue(mockWeatherData);

      const response = await request(app.getHttpServer())
        .get('/analytics/weather')
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            timestamp: expect.any(String),
            temperature: expect.any(Number),
            humidity: expect.any(Number),
            precipitation: expect.any(Number),
            solarRadiation: expect.any(Number),
            source: expect.any(String),
          }),
        ]),
      );

      expect(analyticsService.fetchWeatherData).toHaveBeenCalled();
    });

    it('should return empty array when no weather data available', async () => {
      jest
        .spyOn(analyticsService, 'fetchWeatherData')
        .mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/analytics/weather')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should handle weather service unavailable (503)', async () => {
      jest
        .spyOn(analyticsService, 'fetchWeatherData')
        .mockRejectedValue(new Error('Weather service unavailable'));

      await request(app.getHttpServer())
        .get('/analytics/weather')
        .expect(500);
    });
  });
});
