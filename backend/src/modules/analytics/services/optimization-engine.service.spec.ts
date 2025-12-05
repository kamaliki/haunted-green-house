import { Test, TestingModule } from '@nestjs/testing';
import { OptimizationEngine } from './optimization-engine.service';
import {
  AnalysisContext,
  TimeSeriesPoint,
  OptimizationRecommendation,
} from '../interfaces/analytics.interface';

describe('OptimizationEngine', () => {
  let service: OptimizationEngine;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OptimizationEngine],
    }).compile();

    service = module.get<OptimizationEngine>(OptimizationEngine);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recommendation generation logic', () => {
    it('should generate temperature variance recommendation for high fluctuations', () => {
      // Arrange
      const context: AnalysisContext = {
        environmentalData: [
          { timestamp: new Date('2024-01-01T00:00:00Z'), value: 15 },
          { timestamp: new Date('2024-01-01T01:00:00Z'), value: 32 },
          { timestamp: new Date('2024-01-01T02:00:00Z'), value: 18 },
          { timestamp: new Date('2024-01-01T03:00:00Z'), value: 30 },
        ],
        plantHealthData: [],
        growthMetrics: [],
        weatherForecast: [],
      };

      // Act
      const recommendations = service.analyzeEnvironmentalConditions(context);

      // Assert
      expect(recommendations.length).toBeGreaterThan(0);
      const tempVarianceRec = recommendations.find((r) =>
        r.title.includes('Temperature Fluctuations'),
      );
      expect(tempVarianceRec).toBeDefined();
      expect(tempVarianceRec?.category).toBe('temperature');
      expect(tempVarianceRec?.priority).toBe('high');
    });

    it('should generate suboptimal temperature recommendation', () => {
      // Arrange: Average temperature too low
      const context: AnalysisContext = {
        environmentalData: Array.from({ length: 10 }, (_, i) => ({
          timestamp: new Date(`2024-01-01T${String(i).padStart(2, '0')}:00:00Z`),
          value: 12, // Below optimal range
        })),
        plantHealthData: [],
        growthMetrics: [],
        weatherForecast: [],
      };

      // Act
      const recommendations = service.analyzeEnvironmentalConditions(context);

      // Assert
      const tempRec = recommendations.find((r) =>
        r.title.includes('Temperature Range'),
      );
      expect(tempRec).toBeDefined();
      expect(tempRec?.category).toBe('temperature');
      expect(tempRec?.actionItems.length).toBeGreaterThan(0);
    });

    it('should generate humidity recommendation when weather data shows high humidity', () => {
      // Arrange
      const context: AnalysisContext = {
        environmentalData: [
          { timestamp: new Date('2024-01-01T00:00:00Z'), value: 22 },
        ],
        plantHealthData: [],
        growthMetrics: [],
        weatherForecast: [
          {
            timestamp: new Date('2024-01-01T00:00:00Z'),
            temperature: 22,
            humidity: 85,
            precipitation: 0,
            solarRadiation: 500,
            source: 'test',
          },
          {
            timestamp: new Date('2024-01-01T01:00:00Z'),
            temperature: 23,
            humidity: 88,
            precipitation: 0,
            solarRadiation: 600,
            source: 'test',
          },
        ],
      };

      // Act
      const recommendations = service.analyzeEnvironmentalConditions(context);

      // Assert
      const humidityRec = recommendations.find((r) =>
        r.title.includes('Humidity'),
      );
      expect(humidityRec).toBeDefined();
      expect(humidityRec?.category).toBe('humidity');
      expect(humidityRec?.priority).toBe('high');
    });

    it('should generate disease recommendation when disease incidence is high', () => {
      // Arrange
      const context: AnalysisContext = {
        environmentalData: [
          { timestamp: new Date('2024-01-01T00:00:00Z'), value: 22 },
        ],
        plantHealthData: [
          { diseaseDetected: true, plantId: '1' },
          { diseaseDetected: true, plantId: '2' },
          { diseaseDetected: false, plantId: '3' },
          { diseaseDetected: false, plantId: '4' },
        ],
        growthMetrics: [],
        weatherForecast: [],
      };

      // Act
      const recommendations = service.analyzeEnvironmentalConditions(context);

      // Assert
      const diseaseRec = recommendations.find((r) =>
        r.title.includes('Disease'),
      );
      expect(diseaseRec).toBeDefined();
      expect(diseaseRec?.category).toBe('general');
      expect(diseaseRec?.priority).toBe('high');
    });

    it('should generate growth rate recommendation when growth is slow', () => {
      // Arrange
      const context: AnalysisContext = {
        environmentalData: [
          { timestamp: new Date('2024-01-01T00:00:00Z'), value: 22 },
        ],
        plantHealthData: [],
        growthMetrics: [
          { growthRate: 0.3, plantId: '1' },
          { growthRate: 0.4, plantId: '2' },
          { growthRate: 0.2, plantId: '3' },
        ],
        weatherForecast: [],
      };

      // Act
      const recommendations = service.analyzeEnvironmentalConditions(context);

      // Assert
      const growthRec = recommendations.find((r) =>
        r.title.includes('Growth Rate'),
      );
      expect(growthRec).toBeDefined();
      expect(growthRec?.category).toBe('general');
      expect(growthRec?.priority).toBe('medium');
    });

    it('should generate irrigation recommendations for high moisture variance', () => {
      // Arrange
      const soilMoistureData: TimeSeriesPoint[] = [
        { timestamp: new Date('2024-01-01T00:00:00Z'), value: 30 },
        { timestamp: new Date('2024-01-01T01:00:00Z'), value: 70 },
        { timestamp: new Date('2024-01-01T02:00:00Z'), value: 35 },
        { timestamp: new Date('2024-01-01T03:00:00Z'), value: 65 },
      ];
      const waterUsage = [100, 120, 110];

      // Act
      const recommendations = service.identifyIrrigationOptimizations(
        soilMoistureData,
        waterUsage,
      );

      // Assert
      expect(recommendations.length).toBeGreaterThan(0);
      const varianceRec = recommendations.find((r) =>
        r.title.includes('Consistency'),
      );
      expect(varianceRec).toBeDefined();
      expect(varianceRec?.category).toBe('irrigation');
      expect(varianceRec?.priority).toBe('high');
    });

    it('should generate recommendation for low soil moisture', () => {
      // Arrange
      const soilMoistureData: TimeSeriesPoint[] = Array.from(
        { length: 10 },
        (_, i) => ({
          timestamp: new Date(`2024-01-01T${String(i).padStart(2, '0')}:00:00Z`),
          value: 35, // Below optimal
        }),
      );
      const waterUsage: number[] = [];

      // Act
      const recommendations = service.identifyIrrigationOptimizations(
        soilMoistureData,
        waterUsage,
      );

      // Assert
      const lowMoistureRec = recommendations.find((r) =>
        r.title.includes('Water Stress'),
      );
      expect(lowMoistureRec).toBeDefined();
      expect(lowMoistureRec?.category).toBe('irrigation');
      expect(lowMoistureRec?.priority).toBe('high');
    });

    it('should generate recommendation for high soil moisture', () => {
      // Arrange
      const soilMoistureData: TimeSeriesPoint[] = Array.from(
        { length: 10 },
        (_, i) => ({
          timestamp: new Date(`2024-01-01T${String(i).padStart(2, '0')}:00:00Z`),
          value: 75, // Above optimal
        }),
      );
      const waterUsage: number[] = [];

      // Act
      const recommendations = service.identifyIrrigationOptimizations(
        soilMoistureData,
        waterUsage,
      );

      // Assert
      const highMoistureRec = recommendations.find((r) =>
        r.title.includes('Root Issues'),
      );
      expect(highMoistureRec).toBeDefined();
      expect(highMoistureRec?.category).toBe('irrigation');
      expect(highMoistureRec?.priority).toBe('medium');
    });

    it('should generate energy efficiency recommendations for excessive lighting', () => {
      // Arrange
      const lightingData: TimeSeriesPoint[] = Array.from(
        { length: 10 },
        (_, i) => ({
          timestamp: new Date(`2024-01-01T${String(i).padStart(2, '0')}:00:00Z`),
          value: 85000, // Excessive
        }),
      );
      const temperatureData: TimeSeriesPoint[] = [];

      // Act
      const recommendations = service.assessEnergyEfficiency(
        lightingData,
        temperatureData,
      );

      // Assert
      const lightingRec = recommendations.find((r) =>
        r.title.includes('Lighting Intensity'),
      );
      expect(lightingRec).toBeDefined();
      expect(lightingRec?.category).toBe('light');
      expect(lightingRec?.priority).toBe('medium');
    });

    it('should generate recommendation for insufficient lighting', () => {
      // Arrange
      const lightingData: TimeSeriesPoint[] = Array.from(
        { length: 10 },
        (_, i) => ({
          timestamp: new Date(`2024-01-01T${String(i).padStart(2, '0')}:00:00Z`),
          value: 15000, // Too low
        }),
      );
      const temperatureData: TimeSeriesPoint[] = [];

      // Act
      const recommendations = service.assessEnergyEfficiency(
        lightingData,
        temperatureData,
      );

      // Assert
      const lightingRec = recommendations.find((r) =>
        r.title.includes('Light Levels'),
      );
      expect(lightingRec).toBeDefined();
      expect(lightingRec?.category).toBe('light');
      expect(lightingRec?.priority).toBe('high');
    });
  });

  describe('priority ordering', () => {
    it('should assign high priority to critical issues', () => {
      // Arrange
      const context: AnalysisContext = {
        environmentalData: [
          { timestamp: new Date('2024-01-01T00:00:00Z'), value: 10 }, // Very low temp
          { timestamp: new Date('2024-01-01T01:00:00Z'), value: 35 }, // Very high temp
        ],
        plantHealthData: [],
        growthMetrics: [],
        weatherForecast: [],
      };

      // Act
      const recommendations = service.analyzeEnvironmentalConditions(context);

      // Assert
      const highPriorityRecs = recommendations.filter((r) => r.priority === 'high');
      expect(highPriorityRecs.length).toBeGreaterThan(0);
    });

    it('should assign medium priority to moderate issues', () => {
      // Arrange
      const context: AnalysisContext = {
        environmentalData: Array.from({ length: 10 }, (_, i) => ({
          timestamp: new Date(`2024-01-01T${String(i).padStart(2, '0')}:00:00Z`),
          value: 17, // Slightly below optimal
        })),
        plantHealthData: [],
        growthMetrics: [],
        weatherForecast: [],
      };

      // Act
      const recommendations = service.analyzeEnvironmentalConditions(context);

      // Assert
      const mediumPriorityRecs = recommendations.filter(
        (r) => r.priority === 'medium',
      );
      expect(mediumPriorityRecs.length).toBeGreaterThan(0);
    });

    it('should include all required fields in recommendations', () => {
      // Arrange
      const context: AnalysisContext = {
        environmentalData: [
          { timestamp: new Date('2024-01-01T00:00:00Z'), value: 15 },
          { timestamp: new Date('2024-01-01T01:00:00Z'), value: 32 },
        ],
        plantHealthData: [],
        growthMetrics: [],
        weatherForecast: [],
      };

      // Act
      const recommendations = service.analyzeEnvironmentalConditions(context);

      // Assert
      recommendations.forEach((rec) => {
        expect(rec.id).toBeDefined();
        expect(rec.category).toBeDefined();
        expect(rec.title).toBeDefined();
        expect(rec.description).toBeDefined();
        expect(rec.expectedImpact).toBeDefined();
        expect(rec.priority).toBeDefined();
        expect(rec.actionItems).toBeDefined();
        expect(Array.isArray(rec.actionItems)).toBe(true);
        expect(rec.actionItems.length).toBeGreaterThan(0);
        expect(rec.generatedAt).toBeInstanceOf(Date);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty environmental data', () => {
      // Arrange
      const context: AnalysisContext = {
        environmentalData: [],
        plantHealthData: [],
        growthMetrics: [],
        weatherForecast: [],
      };

      // Act
      const recommendations = service.analyzeEnvironmentalConditions(context);

      // Assert
      expect(recommendations).toEqual([]);
    });

    it('should handle empty soil moisture data for irrigation', () => {
      // Arrange
      const soilMoistureData: TimeSeriesPoint[] = [];
      const waterUsage: number[] = [];

      // Act
      const recommendations = service.identifyIrrigationOptimizations(
        soilMoistureData,
        waterUsage,
      );

      // Assert
      expect(recommendations).toEqual([]);
    });

    it('should handle empty lighting data for energy assessment', () => {
      // Arrange
      const lightingData: TimeSeriesPoint[] = [];
      const temperatureData: TimeSeriesPoint[] = [];

      // Act
      const recommendations = service.assessEnergyEfficiency(
        lightingData,
        temperatureData,
      );

      // Assert
      expect(recommendations).toEqual([]);
    });

    it('should handle insufficient data gracefully', () => {
      // Arrange
      const context: AnalysisContext = {
        environmentalData: [
          { timestamp: new Date('2024-01-01T00:00:00Z'), value: 22 },
        ],
        plantHealthData: [],
        growthMetrics: [],
        weatherForecast: [],
      };

      // Act
      const recommendations = service.analyzeEnvironmentalConditions(context);

      // Assert: Should not throw and should return valid array
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should generate unique IDs for each recommendation', () => {
      // Arrange
      const context: AnalysisContext = {
        environmentalData: [
          { timestamp: new Date('2024-01-01T00:00:00Z'), value: 10 },
          { timestamp: new Date('2024-01-01T01:00:00Z'), value: 35 },
        ],
        plantHealthData: [
          { diseaseDetected: true, plantId: '1' },
          { diseaseDetected: true, plantId: '2' },
        ],
        growthMetrics: [{ growthRate: 0.2, plantId: '1' }],
        weatherForecast: [],
      };

      // Act
      const recommendations = service.analyzeEnvironmentalConditions(context);

      // Assert
      const ids = recommendations.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
