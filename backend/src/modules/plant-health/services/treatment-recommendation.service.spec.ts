import { Test, TestingModule } from '@nestjs/testing';
import { TreatmentRecommendationService } from './treatment-recommendation.service';
import { Disease } from '../interfaces/analysis.interface';

describe('TreatmentRecommendationService', () => {
  let service: TreatmentRecommendationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TreatmentRecommendationService],
    }).compile();

    service = module.get<TreatmentRecommendationService>(
      TreatmentRecommendationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateRecommendations', () => {
    it('should generate recommendations for Early Blight', () => {
      const disease: Disease = {
        name: 'Early Blight',
        confidence: 0.92,
        severity: 'moderate',
        affectedArea: 'lower leaves',
        description: 'Fungal disease',
      };

      const recommendations = service.generateRecommendations(disease);

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].priority).toBe('high');
      expect(recommendations.some((r) => r.action.includes('Remove'))).toBe(true);
    });

    it('should include environmental recommendations when humidity is high', () => {
      const disease: Disease = {
        name: 'Late Blight',
        confidence: 0.95,
        severity: 'critical',
        affectedArea: 'all leaves',
        description: 'Severe fungal disease',
      };

      const environmentalContext = {
        temperature: 25,
        humidity: 85,
      };

      const recommendations = service.generateRecommendations(
        disease,
        environmentalContext,
      );

      expect(recommendations).toBeDefined();
      expect(
        recommendations.some((r) => r.action.includes('humidity')),
      ).toBe(true);
    });

    it('should include temperature recommendations when temperature is too high', () => {
      const disease: Disease = {
        name: 'Powdery Mildew',
        confidence: 0.88,
        severity: 'moderate',
        affectedArea: 'upper leaves',
        description: 'Fungal disease',
      };

      const environmentalContext = {
        temperature: 32,
        humidity: 60,
      };

      const recommendations = service.generateRecommendations(
        disease,
        environmentalContext,
      );

      expect(recommendations).toBeDefined();
      expect(
        recommendations.some((r) => r.action.includes('temperature')),
      ).toBe(true);
    });

    it('should return generic recommendations for unknown diseases', () => {
      const disease: Disease = {
        name: 'Unknown Disease',
        confidence: 0.75,
        severity: 'moderate',
        affectedArea: 'leaves',
        description: 'Unknown issue',
      };

      const recommendations = service.generateRecommendations(disease);

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some((r) => r.action.includes('Isolate'))).toBe(
        true,
      );
    });

    it('should sort recommendations by priority', () => {
      const disease: Disease = {
        name: 'Early Blight',
        confidence: 0.92,
        severity: 'moderate',
        affectedArea: 'lower leaves',
        description: 'Fungal disease',
      };

      const recommendations = service.generateRecommendations(disease);

      // Check that critical/high priority items come first
      const priorities = recommendations.map((r) => r.priority);
      const firstPriority = priorities[0];
      expect(['critical', 'high']).toContain(firstPriority);
    });
  });

  describe('getTreatmentPlan', () => {
    it('should return treatment plan for known disease', () => {
      const plan = service.getTreatmentPlan('Early Blight');

      expect(plan).toBeDefined();
      expect(plan?.disease).toBe('Early Blight');
      expect(plan?.immediateActions).toBeDefined();
      expect(plan?.shortTermActions).toBeDefined();
      expect(plan?.preventiveMeasures).toBeDefined();
    });

    it('should return null for unknown disease', () => {
      const plan = service.getTreatmentPlan('Unknown Disease');

      expect(plan).toBeNull();
    });

    it('should include estimated recovery time', () => {
      const plan = service.getTreatmentPlan('Late Blight');

      expect(plan).toBeDefined();
      expect(plan?.estimatedRecoveryTime).toBeDefined();
    });
  });

  describe('getPreventiveMeasures', () => {
    it('should return preventive measures for known disease', () => {
      const measures = service.getPreventiveMeasures('Powdery Mildew');

      expect(measures).toBeDefined();
      expect(measures.length).toBeGreaterThan(0);
      expect(measures.some((m) => m.includes('air circulation'))).toBe(true);
    });

    it('should return empty array for unknown disease', () => {
      const measures = service.getPreventiveMeasures('Unknown Disease');

      expect(measures).toEqual([]);
    });
  });

  describe('getEstimatedRecoveryTime', () => {
    it('should return recovery time for known disease', () => {
      const time = service.getEstimatedRecoveryTime('Septoria Leaf Spot');

      expect(time).toBeDefined();
      expect(time).toContain('week');
    });

    it('should return undefined for unknown disease', () => {
      const time = service.getEstimatedRecoveryTime('Unknown Disease');

      expect(time).toBeUndefined();
    });
  });
});
