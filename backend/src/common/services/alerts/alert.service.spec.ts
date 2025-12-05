import { Test, TestingModule } from '@nestjs/testing';
import { AlertService } from './alert.service';

describe('AlertService', () => {
  let service: AlertService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlertService],
    }).compile();

    service = module.get<AlertService>(AlertService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendDiseaseAlert', () => {
    it('should create and store a disease alert', async () => {
      const plantId = 'plant-001';
      const analysisId = 'analysis-123';
      const disease = {
        name: 'Powdery Mildew',
        confidence: 0.92,
        severity: 'high' as const,
        affectedArea: 'leaves',
        description: 'White powdery spots on leaf surfaces',
      };
      const recommendations = [
        { action: 'Apply fungicide', priority: 'high', timing: 'immediate' },
        { action: 'Improve air circulation', priority: 'medium', timing: 'within 24 hours' },
      ];

      const alert = await service.sendDiseaseAlert(
        plantId,
        analysisId,
        disease,
        recommendations,
      );

      expect(alert).toBeDefined();
      expect(alert.type).toBe('disease_detected');
      expect(alert.severity).toBe('high');
      expect(alert.title).toContain('Powdery Mildew');
      expect(alert.metadata.plantId).toBe(plantId);
      expect(alert.metadata.analysisId).toBe(analysisId);
      expect(alert.metadata.diseaseName).toBe('Powdery Mildew');
      expect(alert.metadata.confidence).toBe(0.92);
      expect(alert.acknowledged).toBe(false);
    });
  });

  describe('getAlerts', () => {
    it('should return all alerts when no filters applied', async () => {
      const plantId = 'plant-001';
      const analysisId = 'analysis-123';
      const disease = {
        name: 'Leaf Spot',
        confidence: 0.85,
        severity: 'moderate' as const,
        affectedArea: 'leaves',
        description: 'Brown spots on leaves',
      };

      await service.sendDiseaseAlert(plantId, analysisId, disease, []);

      const alerts = await service.getAlerts();
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('should filter alerts by type', async () => {
      const plantId = 'plant-001';
      const analysisId = 'analysis-123';
      const disease = {
        name: 'Root Rot',
        confidence: 0.88,
        severity: 'critical' as const,
        affectedArea: 'roots',
        description: 'Rotting roots',
      };

      await service.sendDiseaseAlert(plantId, analysisId, disease, []);

      const alerts = await service.getAlerts({ type: 'disease_detected' });
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.every((a) => a.type === 'disease_detected')).toBe(true);
    });

    it('should filter alerts by severity', async () => {
      const plantId = 'plant-001';
      const analysisId = 'analysis-123';
      const disease = {
        name: 'Blight',
        confidence: 0.95,
        severity: 'critical' as const,
        affectedArea: 'entire plant',
        description: 'Severe blight infection',
      };

      await service.sendDiseaseAlert(plantId, analysisId, disease, []);

      const alerts = await service.getAlerts({ severity: 'critical' });
      expect(alerts.every((a) => a.severity === 'critical')).toBe(true);
    });
  });

  describe('acknowledgeAlert', () => {
    it('should mark alert as acknowledged', async () => {
      const plantId = 'plant-001';
      const analysisId = 'analysis-123';
      const disease = {
        name: 'Aphid Infestation',
        confidence: 0.90,
        severity: 'moderate' as const,
        affectedArea: 'stems',
        description: 'Aphids on stems',
      };

      const alert = await service.sendDiseaseAlert(plantId, analysisId, disease, []);
      expect(alert.acknowledged).toBe(false);

      const acknowledgedAlert = await service.acknowledgeAlert(alert.id);
      expect(acknowledgedAlert).toBeDefined();
      expect(acknowledgedAlert?.acknowledged).toBe(true);
    });
  });

  describe('getUnacknowledgedCount', () => {
    it('should return count of unacknowledged alerts', async () => {
      const initialCount = await service.getUnacknowledgedCount();

      const plantId = 'plant-001';
      const analysisId = 'analysis-123';
      const disease = {
        name: 'Fungal Infection',
        confidence: 0.87,
        severity: 'high' as const,
        affectedArea: 'leaves',
        description: 'Fungal growth on leaves',
      };

      await service.sendDiseaseAlert(plantId, analysisId, disease, []);

      const newCount = await service.getUnacknowledgedCount();
      expect(newCount).toBe(initialCount + 1);
    });
  });
});
