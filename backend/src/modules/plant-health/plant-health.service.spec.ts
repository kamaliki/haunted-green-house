import { Test, TestingModule } from '@nestjs/testing';
import { PlantHealthService } from './plant-health.service';
import { InfluxDbService } from '../../common/services/influxdb/influxdb.service';
import { ImageProcessingService } from './services/image-processing.service';
import { AlertService } from '../../common/services/alerts/alert.service';
import { GrowthAnalysisService } from './services/growth-analysis.service';
import { TreatmentRecommendationService } from './services/treatment-recommendation.service';
import { NotFoundException } from '@nestjs/common';

describe('PlantHealthService', () => {
  let service: PlantHealthService;
  let imageProcessingService: ImageProcessingService;
  let influxDbService: InfluxDbService;
  let alertService: AlertService;
  let growthAnalysisService: GrowthAnalysisService;
  let treatmentRecommendationService: TreatmentRecommendationService;

  const mockImageProcessingService = {
    validateFile: jest.fn(),
    saveImage: jest.fn(),
    ensureUploadDirectory: jest.fn(),
    deleteImage: jest.fn(),
  };

  const mockInfluxDbService = {
    writePoint: jest.fn(),
    writeSensorData: jest.fn(),
    query: jest.fn(),
    getBucket: jest.fn().mockReturnValue('test-bucket'),
  };

  const mockAlertService = {
    sendDiseaseAlert: jest.fn(),
    getAlerts: jest.fn(),
    getAlert: jest.fn(),
    acknowledgeAlert: jest.fn(),
    getUnacknowledgedCount: jest.fn(),
  };

  const mockGrowthAnalysisService = {
    extractGrowthMetrics: jest.fn(),
    compareGrowth: jest.fn(),
    storeGrowthMetrics: jest.fn(),
    sendGrowthAnomalyAlert: jest.fn(),
    getGrowthHistory: jest.fn(),
    getAverageGrowthRate: jest.fn(),
  };

  const mockTreatmentRecommendationService = {
    generateRecommendations: jest.fn(),
    getTreatmentPlan: jest.fn(),
    getPreventiveMeasures: jest.fn(),
    getEstimatedRecoveryTime: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlantHealthService,
        {
          provide: ImageProcessingService,
          useValue: mockImageProcessingService,
        },
        {
          provide: InfluxDbService,
          useValue: mockInfluxDbService,
        },
        {
          provide: AlertService,
          useValue: mockAlertService,
        },
        {
          provide: GrowthAnalysisService,
          useValue: mockGrowthAnalysisService,
        },
        {
          provide: TreatmentRecommendationService,
          useValue: mockTreatmentRecommendationService,
        },
      ],
    }).compile();

    service = module.get<PlantHealthService>(PlantHealthService);
    imageProcessingService = module.get<ImageProcessingService>(
      ImageProcessingService,
    );
    influxDbService = module.get<InfluxDbService>(InfluxDbService);
    alertService = module.get<AlertService>(AlertService);
    growthAnalysisService = module.get<GrowthAnalysisService>(GrowthAnalysisService);
    treatmentRecommendationService = module.get<TreatmentRecommendationService>(
      TreatmentRecommendationService,
    );

    // Setup default mock returns
    mockGrowthAnalysisService.extractGrowthMetrics.mockResolvedValue({
      heightCm: 45.5,
      leafCount: 12,
      colorHealth: 85,
    });
    mockGrowthAnalysisService.compareGrowth.mockResolvedValue({
      currentMetrics: {
        heightCm: 45.5,
        leafCount: 12,
        colorHealth: 85,
      },
      isAbnormal: false,
    });
    mockGrowthAnalysisService.getGrowthHistory.mockResolvedValue([]);
    mockGrowthAnalysisService.getAverageGrowthRate.mockResolvedValue(0);
    mockInfluxDbService.query.mockResolvedValue([]);
    mockTreatmentRecommendationService.generateRecommendations.mockReturnValue([
      {
        action: 'Test recommendation',
        priority: 'high',
        timing: 'immediately',
      },
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('should upload image and return analysis ID', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
        size: 1024,
      } as Express.Multer.File;

      const metadata = {
        plantId: 'plant-001',
        location: 'zone-a',
        notes: 'Test upload',
        timestamp: new Date(),
      };

      mockImageProcessingService.validateFile.mockReturnValue({
        valid: true,
      });
      mockImageProcessingService.saveImage.mockResolvedValue(
        '/uploads/plant-images/plant-001-test.jpg',
      );
      mockInfluxDbService.writePoint.mockResolvedValue(undefined);

      const result = await service.uploadImage(mockFile, metadata);

      expect(result).toHaveProperty('analysisId');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('estimatedCompletionTime');
      expect(result.message).toBe(
        'Image uploaded successfully, analysis in progress',
      );
      expect(mockImageProcessingService.validateFile).toHaveBeenCalledWith(
        mockFile,
      );
      expect(mockImageProcessingService.saveImage).toHaveBeenCalled();
      expect(mockInfluxDbService.writeSensorData).toHaveBeenCalled();
    });

    it('should throw error for invalid file', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
        size: 1024,
      } as Express.Multer.File;

      const metadata = {
        plantId: 'plant-001',
        location: 'zone-a',
        timestamp: new Date(),
      };

      mockImageProcessingService.validateFile.mockReturnValue({
        valid: false,
        error: 'File too large',
      });

      await expect(service.uploadImage(mockFile, metadata)).rejects.toThrow(
        'File too large',
      );
    });
  });

  describe('getAnalysis', () => {
    it('should return analysis result', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
        size: 1024,
      } as Express.Multer.File;

      const metadata = {
        plantId: 'plant-001',
        location: 'zone-a',
        timestamp: new Date(),
      };

      mockImageProcessingService.validateFile.mockReturnValue({
        valid: true,
      });
      mockImageProcessingService.saveImage.mockResolvedValue(
        '/uploads/plant-images/plant-001-test.jpg',
      );
      mockInfluxDbService.writePoint.mockResolvedValue(undefined);

      const uploadResult = await service.uploadImage(mockFile, metadata);
      const analysis = await service.getAnalysis(uploadResult.analysisId);

      expect(analysis).toHaveProperty('analysisId');
      expect(analysis.plantId).toBe('plant-001');
      expect(['pending', 'processing', 'completed']).toContain(analysis.status);
    });

    it('should throw NotFoundException for non-existent analysis', async () => {
      await expect(service.getAnalysis('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPlantHistory', () => {
    it('should return empty history for plant with no analyses', async () => {
      const result = await service.getPlantHistory('plant-999');

      expect(result.plantId).toBe('plant-999');
      expect(result.analyses).toEqual([]);
    });
  });

  describe('getDashboard', () => {
    it('should return dashboard summary', async () => {
      const result = await service.getDashboard();

      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('recentAlerts');
      expect(result.summary).toHaveProperty('totalPlants');
      expect(result.summary).toHaveProperty('healthyPlants');
      expect(result.summary).toHaveProperty('plantsWithIssues');
      expect(result.summary).toHaveProperty('criticalIssues');
      expect(result.summary).toHaveProperty('averageHealthScore');
    });
  });

  describe('simulateDiseaseDetection', () => {
    it('should simulate disease detection with treatment recommendations', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
        size: 1024,
      } as Express.Multer.File;

      const metadata = {
        plantId: 'plant-001',
        location: 'zone-a',
        timestamp: new Date(),
      };

      mockImageProcessingService.validateFile.mockReturnValue({
        valid: true,
      });
      mockImageProcessingService.saveImage.mockResolvedValue(
        '/uploads/plant-images/plant-001-test.jpg',
      );
      mockInfluxDbService.writePoint.mockResolvedValue(undefined);

      const uploadResult = await service.uploadImage(mockFile, metadata);

      // Wait for async processing to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = await service.simulateDiseaseDetection(
        uploadResult.analysisId,
        'Early Blight',
      );

      expect(result.status).toBe('completed');
      expect(result.results?.diseaseDetected).toBe(true);
      expect(result.results?.diseases).toHaveLength(1);
      expect(result.results?.diseases[0].name).toBe('Early Blight');
      expect(result.results?.recommendations).toBeDefined();
      expect(mockTreatmentRecommendationService.generateRecommendations).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent analysis', async () => {
      await expect(
        service.simulateDiseaseDetection('non-existent-id', 'Early Blight'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
