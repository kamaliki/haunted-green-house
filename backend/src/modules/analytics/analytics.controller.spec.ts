import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import {
  PredictionResult,
  OptimizationRecommendation,
  WeatherData,
} from './interfaces/analytics.interface';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  const mockPredictionResult: PredictionResult = {
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
  };

  const mockRecommendation: OptimizationRecommendation = {
    id: 'rec-123',
    category: 'temperature',
    title: 'Optimize Temperature Control',
    description: 'Adjust temperature settings for better plant growth',
    expectedImpact: 'Improved growth rate by 15%',
    priority: 'high',
    actionItems: ['Adjust thermostat', 'Monitor closely'],
    generatedAt: new Date('2024-01-15T12:00:00.000Z'),
  };

  const mockWeatherData: WeatherData[] = [
    {
      timestamp: new Date('2024-01-15T14:00:00.000Z'),
      temperature: 20.0,
      humidity: 65.0,
      precipitation: 0.0,
      solarRadiation: 800.0,
      source: 'OpenWeatherMap',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: {
            generatePredictions: jest.fn(),
            generateOptimizationRecommendations: jest.fn(),
            fetchWeatherData: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPredictions', () => {
    it('should return predictions for specified metrics', async () => {
      jest.spyOn(service, 'generatePredictions').mockResolvedValue([mockPredictionResult]);

      const result = await controller.getPredictions(['temperature_air'], 24);

      expect(result).toEqual([mockPredictionResult]);
      expect(service.generatePredictions).toHaveBeenCalledWith(['temperature_air'], 24);
    });

    it('should throw BadRequestException for invalid hours', async () => {
      await expect(controller.getPredictions(['temperature_air'], 0)).rejects.toThrow(BadRequestException);
      await expect(controller.getPredictions(['temperature_air'], 73)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for empty metrics array', async () => {
      await expect(controller.getPredictions([], 24)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getRecommendations', () => {
    it('should return optimization recommendations', async () => {
      jest.spyOn(service, 'generateOptimizationRecommendations').mockResolvedValue([mockRecommendation]);

      const result = await controller.getRecommendations();

      expect(result).toEqual([mockRecommendation]);
      expect(service.generateOptimizationRecommendations).toHaveBeenCalled();
    });
  });

  describe('getWeatherForecast', () => {
    it('should return weather forecast data', async () => {
      jest.spyOn(service, 'fetchWeatherData').mockResolvedValue(mockWeatherData);

      const result = await controller.getWeatherForecast();

      expect(result).toEqual(mockWeatherData);
      expect(service.fetchWeatherData).toHaveBeenCalled();
    });
  });
});
 