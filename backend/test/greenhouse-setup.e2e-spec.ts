import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/modules/auth/entities/user.entity';
import { Greenhouse } from '../src/modules/greenhouse/entities/greenhouse.entity';
import { Zone } from '../src/modules/greenhouse/entities/zone.entity';
import { AuthService } from '../src/modules/auth/auth.service';

describe('Greenhouse Setup (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let jwtToken: string;
  let userId: string;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockGreenhouseRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockZoneRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUserRepository)
      .overrideProvider(getRepositoryToken(Greenhouse))
      .useValue(mockGreenhouseRepository)
      .overrideProvider(getRepositoryToken(Zone))
      .useValue(mockZoneRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);

    // Create a test user and get JWT token
    userId = 'test-user-id-123';
    const testUser = {
      id: userId,
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jwtToken = authService.generateJwtToken(testUser as User);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /greenhouse/setup', () => {
    it('should return 201 on successful greenhouse creation', async () => {
      const greenhouseData = {
        name: 'My Greenhouse',
        location: 'Backyard',
        description: 'A spooky greenhouse',
        zones: [
          { name: 'Zone 1', description: 'First zone' },
          { name: 'Zone 2' },
        ],
      };

      const savedGreenhouse = {
        id: 'greenhouse-id',
        userId,
        ...greenhouseData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const savedZones = greenhouseData.zones.map((zone, index) => ({
        id: `zone-${index}`,
        greenhouseId: savedGreenhouse.id,
        name: zone.name,
        description: zone.description,
        orderIndex: index,
        createdAt: new Date(),
      }));

      mockGreenhouseRepository.create.mockReturnValue(savedGreenhouse);
      mockGreenhouseRepository.save.mockResolvedValue(savedGreenhouse);
      mockZoneRepository.create.mockImplementation((data) => data);
      mockZoneRepository.save.mockResolvedValue(savedZones);

      const response = await request(app.getHttpServer())
        .post('/greenhouse/setup')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(greenhouseData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(greenhouseData.name);
      expect(response.body.location).toBe(greenhouseData.location);
    });

    it('should return 400 for missing required fields', async () => {
      const invalidData = {
        // Missing name
        location: 'Backyard',
        zones: [],
      };

      const response = await request(app.getHttpServer())
        .post('/greenhouse/setup')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(Array.isArray(response.body.message)).toBe(true);
    });

    it('should return 400 for invalid zone data (missing name)', async () => {
      const invalidData = {
        name: 'My Greenhouse',
        location: 'Backyard',
        zones: [
          { description: 'Zone without name' }, // Missing name
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/greenhouse/setup')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for name exceeding max length', async () => {
      const invalidData = {
        name: 'A'.repeat(101), // Exceeds 100 character limit
        location: 'Backyard',
        zones: [],
      };

      const response = await request(app.getHttpServer())
        .post('/greenhouse/setup')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 without authentication token', async () => {
      const greenhouseData = {
        name: 'My Greenhouse',
        location: 'Backyard',
        zones: [],
      };

      await request(app.getHttpServer())
        .post('/greenhouse/setup')
        .send(greenhouseData)
        .expect(401);
    });

    it('should accept greenhouse without zones', async () => {
      const greenhouseData = {
        name: 'Empty Greenhouse',
        location: 'Basement',
        zones: [],
      };

      const savedGreenhouse = {
        id: 'greenhouse-id',
        userId,
        ...greenhouseData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGreenhouseRepository.create.mockReturnValue(savedGreenhouse);
      mockGreenhouseRepository.save.mockResolvedValue(savedGreenhouse);

      const response = await request(app.getHttpServer())
        .post('/greenhouse/setup')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(greenhouseData)
        .expect(201);

      expect(response.body.zones).toEqual([]);
    });
  });
});
