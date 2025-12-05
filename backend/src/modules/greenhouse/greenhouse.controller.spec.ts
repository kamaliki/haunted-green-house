import { Test, TestingModule } from '@nestjs/testing';
import { GreenhouseController } from './greenhouse.controller';
import { GreenhouseService } from './greenhouse.service';
import { CreateGreenhouseDto } from './dto';
import { HttpStatus } from '@nestjs/common';

describe('GreenhouseController', () => {
  let controller: GreenhouseController;
  let service: GreenhouseService;

  const mockGreenhouseService = {
    createGreenhouse: jest.fn(),
    getGreenhouseByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GreenhouseController],
      providers: [
        {
          provide: GreenhouseService,
          useValue: mockGreenhouseService,
        },
      ],
    }).compile();

    controller = module.get<GreenhouseController>(GreenhouseController);
    service = module.get<GreenhouseService>(GreenhouseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /greenhouse/setup', () => {
    it('should create greenhouse with valid data', async () => {
      const userId = 'test-user-id';
      const dto: CreateGreenhouseDto = {
        name: 'Test Greenhouse',
        location: 'Test Location',
        description: 'Test Description',
        zones: [
          { name: 'Zone 1', description: 'First zone' },
          { name: 'Zone 2' },
        ],
      };

      const expectedGreenhouse = {
        id: 'greenhouse-id',
        userId,
        ...dto,
        zones: [
          {
            id: 'zone-1',
            greenhouseId: 'greenhouse-id',
            name: 'Zone 1',
            description: 'First zone',
            orderIndex: 0,
            createdAt: new Date(),
          },
          {
            id: 'zone-2',
            greenhouseId: 'greenhouse-id',
            name: 'Zone 2',
            description: undefined,
            orderIndex: 1,
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGreenhouseService.createGreenhouse.mockResolvedValue(
        expectedGreenhouse,
      );

      const req = { user: { userId } };
      const result = await controller.setupGreenhouse(req, dto);

      expect(service.createGreenhouse).toHaveBeenCalledWith(userId, dto);
      expect(result).toEqual(expectedGreenhouse);
    });

    it('should extract userId from JWT token in request', async () => {
      const userId = 'authenticated-user-123';
      const dto: CreateGreenhouseDto = {
        name: 'My Greenhouse',
        location: 'Backyard',
        zones: [],
      };

      const req = { user: { userId } };
      await controller.setupGreenhouse(req, dto);

      expect(service.createGreenhouse).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('GET /greenhouse', () => {
    it('should return greenhouse for authenticated user', async () => {
      const userId = 'test-user-id';
      const expectedGreenhouse = {
        id: 'greenhouse-id',
        userId,
        name: 'Test Greenhouse',
        location: 'Test Location',
        zones: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGreenhouseService.getGreenhouseByUserId.mockResolvedValue(
        expectedGreenhouse,
      );

      const req = { user: { userId } };
      const result = await controller.getGreenhouse(req);

      expect(service.getGreenhouseByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedGreenhouse);
    });
  });
});
