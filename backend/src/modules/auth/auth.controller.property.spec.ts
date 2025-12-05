import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import * as fc from 'fast-check';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';

describe('AuthController Property Tests', () => {
  let app: INestApplication;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Property 11: Email format validation', () => {
    it('should reject invalid email formats with validation error', async () => {
      // **Feature: user-registration, Property 11: Email format validation**
      // **Validates: Requirements 5.1**

      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('@')), // Invalid email (no @)
          fc.string({ minLength: 8, maxLength: 100 }),
          async (username, invalidEmail, password) => {
            const response = await request(app.getHttpServer())
              .post('/auth/register')
              .send({
                username,
                email: invalidEmail,
                password,
              });

            // Should return 400 for validation error
            expect(response.status).toBe(400);
            expect(response.body.message).toBeDefined();
          },
        ),
        { numRuns: 100 },
      );
    }, 30000);
  });

  describe('Property 12: Required field validation', () => {
    it('should reject requests with missing required fields', async () => {
      // **Feature: user-registration, Property 12: Required field validation**
      // **Validates: Requirements 5.3**

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('username', 'email', 'password'), // Which field to omit
          fc.string({ minLength: 3, maxLength: 50 }),
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 100 }),
          async (fieldToOmit, username, email, password) => {
            const payload: any = {
              username,
              email,
              password,
            };

            // Remove the field to test
            delete payload[fieldToOmit];

            const response = await request(app.getHttpServer())
              .post('/auth/register')
              .send(payload);

            // Should return 400 for validation error
            expect(response.status).toBe(400);
            expect(response.body.message).toBeDefined();
            
            // The error message should indicate which field is missing/invalid
            const errorMessage = JSON.stringify(response.body.message);
            expect(errorMessage.toLowerCase()).toContain(fieldToOmit);
          },
        ),
        { numRuns: 100 },
      );
    }, 30000);
  });

  describe('Property 13: HTTP status code correctness', () => {
    it('should return correct HTTP status codes for different scenarios', async () => {
      // **Feature: user-registration, Property 13: HTTP status code correctness**
      // **Validates: Requirements 6.3, 6.4, 6.5**

      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 50 }).filter(s => s.trim().length >= 3),
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 100 }).filter(s => s.trim().length >= 8),
          fc.constantFrom('success', 'duplicate', 'validation'),
          async (username, email, password, scenario) => {
            if (scenario === 'success') {
              // Mock successful registration
              jest.spyOn(authService, 'registerUser').mockResolvedValue({
                user: {
                  id: 'test-id',
                  username,
                  email,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
                token: 'mock-jwt-token',
              });

              const response = await request(app.getHttpServer())
                .post('/auth/register')
                .send({ username, email, password });

              // Should return 201 for successful registration
              expect(response.status).toBe(201);
              expect(response.body.accessToken).toBeDefined();
            } else if (scenario === 'duplicate') {
              // Mock duplicate user error
              const { ConflictException } = require('@nestjs/common');
              jest.spyOn(authService, 'registerUser').mockRejectedValue(
                new ConflictException('Username already exists'),
              );

              const response = await request(app.getHttpServer())
                .post('/auth/register')
                .send({ username, email, password });

              // Should return 409 for conflict
              expect(response.status).toBe(409);
            } else if (scenario === 'validation') {
              // Send invalid data (password too short)
              const response = await request(app.getHttpServer())
                .post('/auth/register')
                .send({ username, email, password: 'short' });

              // Should return 400 for validation error
              expect(response.status).toBe(400);
            }
          },
        ),
        { numRuns: 100 },
      );
    }, 30000);
  });
});
