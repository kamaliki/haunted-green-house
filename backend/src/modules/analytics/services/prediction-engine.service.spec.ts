import { Test, TestingModule } from '@nestjs/testing';
import { PredictionEngine } from './prediction-engine.service';
import { TimeSeriesPoint, ForecastConfig } from '../interfaces/analytics.interface';

describe('PredictionEngine', () => {
  let service: PredictionEngine;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PredictionEngine],
    }).compile();

    service = module.get<PredictionEngine>(PredictionEngine);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('exponential smoothing algorithm', () => {
    it('should generate predictions using exponential smoothing with known data', () => {
      // Arrange: Create known historical data with upward trend
      const historicalData: TimeSeriesPoint[] = [
        { timestamp: new Date('2024-01-01T00:00:00Z'), value: 20 },
        { timestamp: new Date('2024-01-01T01:00:00Z'), value: 21 },
        { timestamp: new Date('2024-01-01T02:00:00Z'), value: 22 },
        { timestamp: new Date('2024-01-01T03:00:00Z'), value: 23 },
        { timestamp: new Date('2024-01-01T04:00:00Z'), value: 24 },
      ];

      const config: ForecastConfig = {
        method: 'exponential_smoothing',
        confidenceLevel: 0.95,
      };

      // Act
      const result = service.forecast(historicalData, 3, config);

      // Assert
      expect(result).toBeDefined();
      expect(result.predictions).toHaveLength(3);
      expect(result.dataPointsUsed).toBe(5);
      expect(result.generatedAt).toBeInstanceOf(Date);

      // Exponential smoothing should produce values close to recent data
      result.predictions.forEach((prediction) => {
        expect(prediction.value).toBeGreaterThan(20);
        expect(prediction.value).toBeLessThan(30);
        expect(prediction.timestamp).toBeInstanceOf(Date);
      });
    });

    it('should produce stable predictions for stable data', () => {
      // Arrange: Create stable historical data
      const historicalData: TimeSeriesPoint[] = Array.from({ length: 10 }, (_, i) => ({
        timestamp: new Date(`2024-01-01T${String(i).padStart(2, '0')}:00:00Z`),
        value: 25,
      }));

      const config: ForecastConfig = {
        method: 'exponential_smoothing',
        confidenceLevel: 0.95,
      };

      // Act
      const result = service.forecast(historicalData, 5, config);

      // Assert
      result.predictions.forEach((prediction) => {
        // Predictions should be very close to 25 for stable data
        expect(prediction.value).toBeCloseTo(25, 0);
      });
    });
  });

  describe('confidence interval calculation', () => {
    it('should calculate confidence intervals for predictions', () => {
      // Arrange
      const historicalData: TimeSeriesPoint[] = [
        { timestamp: new Date('2024-01-01T00:00:00Z'), value: 20 },
        { timestamp: new Date('2024-01-01T01:00:00Z'), value: 22 },
        { timestamp: new Date('2024-01-01T02:00:00Z'), value: 21 },
        { timestamp: new Date('2024-01-01T03:00:00Z'), value: 23 },
        { timestamp: new Date('2024-01-01T04:00:00Z'), value: 22 },
      ];

      const predictions = [21, 22, 23];
      const confidenceLevel = 0.95;

      // Act
      const intervals = service.calculateConfidenceInterval(
        predictions,
        historicalData,
        confidenceLevel,
      );

      // Assert
      expect(intervals).toHaveLength(3);
      intervals.forEach((interval, index) => {
        expect(interval.lower).toBeLessThan(predictions[index]);
        expect(interval.upper).toBeGreaterThan(predictions[index]);
        expect(interval.upper).toBeGreaterThan(interval.lower);
      });
    });

    it('should have wider intervals for higher confidence levels', () => {
      // Arrange
      const historicalData: TimeSeriesPoint[] = [
        { timestamp: new Date('2024-01-01T00:00:00Z'), value: 20 },
        { timestamp: new Date('2024-01-01T01:00:00Z'), value: 25 },
        { timestamp: new Date('2024-01-01T02:00:00Z'), value: 22 },
        { timestamp: new Date('2024-01-01T03:00:00Z'), value: 28 },
      ];

      const predictions = [24];

      // Act
      const intervals95 = service.calculateConfidenceInterval(predictions, historicalData, 0.95);
      const intervals90 = service.calculateConfidenceInterval(predictions, historicalData, 0.90);

      // Assert
      const width95 = intervals95[0].upper - intervals95[0].lower;
      const width90 = intervals90[0].upper - intervals90[0].lower;
      expect(width95).toBeGreaterThan(width90);
    });

    it('should throw error for invalid confidence level', () => {
      // Arrange
      const historicalData: TimeSeriesPoint[] = [
        { timestamp: new Date('2024-01-01T00:00:00Z'), value: 20 },
      ];
      const predictions = [20];

      // Act & Assert
      expect(() => {
        service.calculateConfidenceInterval(predictions, historicalData, 1.5);
      }).toThrow('Confidence level must be between 0 and 1');

      expect(() => {
        service.calculateConfidenceInterval(predictions, historicalData, -0.1);
      }).toThrow('Confidence level must be between 0 and 1');
    });
  });

  describe('edge cases', () => {
    it('should throw error for empty historical data', () => {
      // Arrange
      const historicalData: TimeSeriesPoint[] = [];
      const config: ForecastConfig = {
        method: 'exponential_smoothing',
        confidenceLevel: 0.95,
      };

      // Act & Assert
      expect(() => {
        service.forecast(historicalData, 5, config);
      }).toThrow('Historical data is required for forecasting');
    });

    it('should handle single data point', () => {
      // Arrange
      const historicalData: TimeSeriesPoint[] = [
        { timestamp: new Date('2024-01-01T00:00:00Z'), value: 25 },
      ];

      const config: ForecastConfig = {
        method: 'exponential_smoothing',
        confidenceLevel: 0.95,
      };

      // Act
      const result = service.forecast(historicalData, 3, config);

      // Assert
      expect(result.predictions).toHaveLength(3);
      expect(result.dataPointsUsed).toBe(1);
      // With single data point, all predictions should be that value
      result.predictions.forEach((prediction) => {
        expect(prediction.value).toBe(25);
      });
    });

    it('should throw error for invalid hours ahead', () => {
      // Arrange
      const historicalData: TimeSeriesPoint[] = [
        { timestamp: new Date('2024-01-01T00:00:00Z'), value: 20 },
      ];

      const config: ForecastConfig = {
        method: 'exponential_smoothing',
        confidenceLevel: 0.95,
      };

      // Act & Assert
      expect(() => {
        service.forecast(historicalData, 0, config);
      }).toThrow('Hours ahead must be greater than 0');

      expect(() => {
        service.forecast(historicalData, -5, config);
      }).toThrow('Hours ahead must be greater than 0');
    });

    it('should handle unsorted historical data', () => {
      // Arrange: Create unsorted data
      const historicalData: TimeSeriesPoint[] = [
        { timestamp: new Date('2024-01-01T03:00:00Z'), value: 23 },
        { timestamp: new Date('2024-01-01T01:00:00Z'), value: 21 },
        { timestamp: new Date('2024-01-01T02:00:00Z'), value: 22 },
        { timestamp: new Date('2024-01-01T00:00:00Z'), value: 20 },
      ];

      const config: ForecastConfig = {
        method: 'exponential_smoothing',
        confidenceLevel: 0.95,
      };

      // Act
      const result = service.forecast(historicalData, 2, config);

      // Assert: Should not throw and should produce valid predictions
      expect(result.predictions).toHaveLength(2);
      expect(result.dataPointsUsed).toBe(4);
    });

    it('should throw error for unsupported forecast method', () => {
      // Arrange
      const historicalData: TimeSeriesPoint[] = [
        { timestamp: new Date('2024-01-01T00:00:00Z'), value: 20 },
      ];

      const config: ForecastConfig = {
        method: 'unsupported_method' as any,
        confidenceLevel: 0.95,
      };

      // Act & Assert
      expect(() => {
        service.forecast(historicalData, 5, config);
      }).toThrow('Unsupported forecast method');
    });
  });

  describe('moving average method', () => {
    it('should generate predictions using moving average', () => {
      // Arrange
      const historicalData: TimeSeriesPoint[] = [
        { timestamp: new Date('2024-01-01T00:00:00Z'), value: 20 },
        { timestamp: new Date('2024-01-01T01:00:00Z'), value: 22 },
        { timestamp: new Date('2024-01-01T02:00:00Z'), value: 24 },
        { timestamp: new Date('2024-01-01T03:00:00Z'), value: 26 },
        { timestamp: new Date('2024-01-01T04:00:00Z'), value: 28 },
      ];

      const config: ForecastConfig = {
        method: 'moving_average',
        confidenceLevel: 0.95,
      };

      // Act
      const result = service.forecast(historicalData, 3, config);

      // Assert
      expect(result.predictions).toHaveLength(3);
      // All predictions should be the same (average of recent values)
      const firstValue = result.predictions[0].value;
      result.predictions.forEach((prediction) => {
        expect(prediction.value).toBe(firstValue);
      });
    });
  });

  describe('linear regression method', () => {
    it('should generate predictions using linear regression', () => {
      // Arrange: Create data with clear linear trend
      const historicalData: TimeSeriesPoint[] = [
        { timestamp: new Date('2024-01-01T00:00:00Z'), value: 10 },
        { timestamp: new Date('2024-01-01T01:00:00Z'), value: 12 },
        { timestamp: new Date('2024-01-01T02:00:00Z'), value: 14 },
        { timestamp: new Date('2024-01-01T03:00:00Z'), value: 16 },
        { timestamp: new Date('2024-01-01T04:00:00Z'), value: 18 },
      ];

      const config: ForecastConfig = {
        method: 'linear_regression',
        confidenceLevel: 0.95,
      };

      // Act
      const result = service.forecast(historicalData, 3, config);

      // Assert
      expect(result.predictions).toHaveLength(3);
      // Linear regression should continue the trend
      expect(result.predictions[0].value).toBeGreaterThan(18);
      expect(result.predictions[1].value).toBeGreaterThan(result.predictions[0].value);
      expect(result.predictions[2].value).toBeGreaterThan(result.predictions[1].value);
    });
  });
});
