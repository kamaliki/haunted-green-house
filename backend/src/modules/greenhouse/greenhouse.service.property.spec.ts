import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import * as fc from 'fast-check';
import { GreenhouseService } from './greenhouse.service';
import { Greenhouse } from './entities/greenhouse.entity';
import { Zone } from './entities/zone.entity';
import { CreateGreenhouseDto, CreateZoneDto } from './dto';

describe('GreenhouseService Property Tests', () => {
  let service: GreenhouseService;
  let greenhouseRepository: Repository<Greenhouse>;
  let zoneRepository: Repository<Zone>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GreenhouseService,
        {
          provide: getRepositoryToken(Greenhouse),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Zone),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GreenhouseService>(GreenhouseService);
    greenhouseRepository = module.get<Repository<Greenhouse>>(
      getRepositoryToken(Greenhouse),
    );
    zoneRepository = module.get<Repository<Zone>>(getRepositoryToken(Zone));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Property 5: Greenhouse data persistence', () => {
    it('should persist greenhouse with exact values provided', async () => {
      // **Feature: user-registration, Property 5: Greenhouse data persistence**
      // **Validates: Requirements 2.2**

      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.string({ minLength: 1, maxLength: 200 }),
          fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: undefined }),
          async (userId, name, location, description) => {
            const dto: CreateGreenhouseDto = {
              name,
              location,
              description,
              zones: [],
            };

            const mockGreenhouse: Greenhouse = {
              id: 'greenhouse-uuid',
              userId,
              name,
              location,
              description: description || null,
              createdAt: new Date(),
              updatedAt: new Date(),
              user: null,
              zones: [],
            };

            jest
              .spyOn(greenhouseRepository, 'create')
              .mockReturnValue(mockGreenhouse);
            jest
              .spyOn(greenhouseRepository, 'save')
              .mockResolvedValue(mockGreenhouse);

            const result = await service.createGreenhouse(userId, dto);

            // Verify greenhouse data matches exactly
            expect(result.name).toBe(name);
            expect(result.location).toBe(location);
            expect(result.description).toBe(description || null);
            expect(result.userId).toBe(userId);
          },
        ),
        { numRuns: 100 },
      );
    }, 30000);
  });

  describe('Property 6: Zone creation and association', () => {
    it('should create and associate all zones with greenhouse', async () => {
      // **Feature: user-registration, Property 6: Zone creation and association**
      // **Validates: Requirements 2.3, 2.4**

      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.string({ minLength: 1, maxLength: 200 }),
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 100 }),
              description: fc.option(fc.string({ minLength: 0, maxLength: 300 }), {
                nil: undefined,
              }),
            }),
            { minLength: 1, maxLength: 10 },
          ),
          async (userId, greenhouseName, location, zoneDtos) => {
            // Clear mocks before each property test iteration
            jest.clearAllMocks();

            const dto: CreateGreenhouseDto = {
              name: greenhouseName,
              location,
              zones: zoneDtos,
            };

            const mockGreenhouse: Greenhouse = {
              id: 'greenhouse-uuid',
              userId,
              name: greenhouseName,
              location,
              description: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              user: null,
              zones: [],
            };

            jest
              .spyOn(greenhouseRepository, 'create')
              .mockReturnValue(mockGreenhouse);
            jest
              .spyOn(greenhouseRepository, 'save')
              .mockResolvedValue(mockGreenhouse);

            const mockZones: Zone[] = zoneDtos.map((zoneDto, index) => ({
              id: `zone-uuid-${index}`,
              greenhouseId: mockGreenhouse.id,
              name: zoneDto.name,
              // Mimic database behavior: undefined becomes null, preserve actual string values as-is
              description: zoneDto.description === undefined ? null : zoneDto.description,
              orderIndex: index,
              createdAt: new Date(),
              greenhouse: mockGreenhouse,
            }));

            jest.spyOn(zoneRepository, 'create').mockImplementation((zoneData: any) => {
              const index = mockZones.findIndex(z => z.name === zoneData.name);
              return mockZones[index];
            });

            jest.spyOn(zoneRepository, 'save').mockResolvedValue(mockZones);

            const result = await service.createGreenhouse(userId, dto);

            // Verify all zones were created
            expect(zoneRepository.create).toHaveBeenCalledTimes(zoneDtos.length);
            expect(zoneRepository.save).toHaveBeenCalledTimes(1);

            // Verify zones are associated with greenhouse
            expect(result.zones).toBeDefined();
            expect(result.zones.length).toBe(zoneDtos.length);

            // Verify each zone has correct data
            result.zones.forEach((zone, index) => {
              expect(zone.name).toBe(zoneDtos[index].name);
              // undefined becomes null, but preserve actual string values
              const expectedDescription = zoneDtos[index].description === undefined ? null : zoneDtos[index].description;
              expect(zone.description).toBe(expectedDescription);
              expect(zone.greenhouseId).toBe(mockGreenhouse.id);
            });
          },
        ),
        { numRuns: 100 },
      );
    }, 30000);
  });

  describe('Property 7: Zone name validation', () => {
    it('should reject zones with empty or missing names', async () => {
      // **Feature: user-registration, Property 7: Zone name validation**
      // **Validates: Requirements 3.3**

      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant(''),
            fc.constant(null),
            fc.constant(undefined),
          ),
          fc.option(fc.string({ minLength: 0, maxLength: 300 }), { nil: undefined }),
          async (invalidName, description) => {
            const zoneDto: any = {
              name: invalidName,
              description,
            };

            // The DTO validation should reject this
            const dtoInstance = Object.assign(new CreateZoneDto(), zoneDto);
            const errors = await validate(dtoInstance);

            // Should have validation errors for the name field
            const nameErrors = errors.filter((e) => e.property === 'name');
            expect(nameErrors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    }, 30000);
  });

  describe('Property 8: Zone order preservation', () => {
    it('should preserve zone order when retrieving greenhouse', async () => {
      // **Feature: user-registration, Property 8: Zone order preservation**
      // **Validates: Requirements 3.4**

      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.string({ minLength: 1, maxLength: 200 }),
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 100 }),
              description: fc.option(fc.string({ minLength: 0, maxLength: 300 }), {
                nil: undefined,
              }),
            }),
            { minLength: 2, maxLength: 10 },
          ),
          async (userId, greenhouseName, location, zoneDtos) => {
            const dto: CreateGreenhouseDto = {
              name: greenhouseName,
              location,
              zones: zoneDtos,
            };

            const mockGreenhouse: Greenhouse = {
              id: 'greenhouse-uuid',
              userId,
              name: greenhouseName,
              location,
              description: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              user: null,
              zones: [],
            };

            jest
              .spyOn(greenhouseRepository, 'create')
              .mockReturnValue(mockGreenhouse);
            jest
              .spyOn(greenhouseRepository, 'save')
              .mockResolvedValue(mockGreenhouse);

            const mockZones: Zone[] = zoneDtos.map((zoneDto, index) => ({
              id: `zone-uuid-${index}`,
              greenhouseId: mockGreenhouse.id,
              name: zoneDto.name,
              description: zoneDto.description || null,
              orderIndex: index,
              createdAt: new Date(),
              greenhouse: mockGreenhouse,
            }));

            jest.spyOn(zoneRepository, 'create').mockImplementation((zoneData: any) => {
              return mockZones[zoneData.orderIndex];
            });

            jest.spyOn(zoneRepository, 'save').mockResolvedValue(mockZones);

            // Create greenhouse
            await service.createGreenhouse(userId, dto);

            // Mock retrieval with zones
            const retrievedGreenhouse: Greenhouse = {
              ...mockGreenhouse,
              zones: mockZones,
            };

            jest
              .spyOn(greenhouseRepository, 'findOne')
              .mockResolvedValue(retrievedGreenhouse);

            // Retrieve greenhouse
            const result = await service.getGreenhouseByUserId(userId);

            // Verify zones are in the same order
            expect(result.zones.length).toBe(zoneDtos.length);
            
            result.zones.forEach((zone, index) => {
              expect(zone.orderIndex).toBe(index);
              expect(zone.name).toBe(zoneDtos[index].name);
            });

            // Verify order indices are sequential
            const orderIndices = result.zones.map(z => z.orderIndex);
            const expectedIndices = Array.from({ length: zoneDtos.length }, (_, i) => i);
            expect(orderIndices).toEqual(expectedIndices);
          },
        ),
        { numRuns: 100 },
      );
    }, 30000);
  });
});
