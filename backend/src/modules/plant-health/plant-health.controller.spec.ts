import { Test, TestingModule } from '@nestjs/testing';
import { PlantHealthController } from './plant-health.controller';
import { PlantHealthService } from './plant-health.service';
import { BadRequestException } from '@nestjs/common';

describe('PlantHealthController', () => {
  let controller: PlantHealthController;
  let service: PlantHealthService;

  const mockPlantHealthService = {
    uploadImage: jest.fn(),
    getAnalysis: jest.fn(),
    getPlantHistory: jest.fn(),
    getDashboard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlantHealthController],
      providers: [
        {
          provide: PlantHealthService,
          useValue: mockPlantHealthService,
        },
      ],
    }).compile();

    controller = module.get<PlantHealthController>(PlantHealthController);
    service = module.get<PlantHealthService>(PlantHealthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
        size: 1024,
        originalname: 'test.jpg',
      } as Express.Multer.File;

      const uploadDto = {
        plantId: 'plant-001',
        location: 'zone-a',
        notes: 'Test upload',
      };

      const mockResult = {
        analysisId: 'test-uuid',
        message: 'Image uploaded successfully, analysis in progress',
        estimatedCompletionTime: new Date(),
      };

      mockPlantHealthService.uploadImage.mockResolvedValue(mockResult);

      const result = await controller.uploadImage(mockFile, uploadDto);

      expect(result.success).toBe(true);
      expect(result.analysisId).toBe('test-uuid');
      expect(mockPlantHealthService.uploadImage).toHaveBeenCalledWith(
        mockFile,
        expect.objectContaining({
          plantId: 'plant-001',
          location: 'zone-a',
          notes: 'Test upload',
        }),
      );
    });

    it('should throw BadRequestException when no file provided', async () => {
      const uploadDto = {
        plantId: 'plant-001',
        location: 'zone-a',
      };

      await expect(
        controller.uploadImage(undefined, uploadDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAnalysis', () => {
    it('should return analysis result', async () => {
      const mockAnalysis = {
        analysisId: 'test-uuid',
        plantId: 'plant-001',
        timestamp: new Date(),
        status: 'completed' as const,
        imageUrl: '/uploads/test.jpg',
        results: {
          diseaseDetected: false,
          diseases: [],
          healthScore: 95,
          recommendations: [],
        },
      };

      mockPlantHealthService.getAnalysis.mockResolvedValue(mockAnalysis);

      const result = await controller.getAnalysis('test-uuid');

      expect(result).toEqual(mockAnalysis);
      expect(mockPlantHealthService.getAnalysis).toHaveBeenCalledWith(
        'test-uuid',
      );
    });
  });

  describe('getPlantHistory', () => {
    it('should return plant history', async () => {
      const mockHistory = {
        plantId: 'plant-001',
        analyses: [],
      };

      mockPlantHealthService.getPlantHistory.mockResolvedValue(mockHistory);

      const result = await controller.getPlantHistory('plant-001');

      expect(result).toEqual(mockHistory);
      expect(mockPlantHealthService.getPlantHistory).toHaveBeenCalledWith(
        'plant-001',
      );
    });
  });

  describe('getDashboard', () => {
    it('should return dashboard data', async () => {
      const mockDashboard = {
        summary: {
          totalPlants: 10,
          healthyPlants: 8,
          plantsWithIssues: 2,
          criticalIssues: 0,
          averageHealthScore: 85,
        },
        recentAlerts: [],
      };

      mockPlantHealthService.getDashboard.mockResolvedValue(mockDashboard);

      const result = await controller.getDashboard();

      expect(result).toEqual(mockDashboard);
      expect(mockPlantHealthService.getDashboard).toHaveBeenCalled();
    });
  });
});
