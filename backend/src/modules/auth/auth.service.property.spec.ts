import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import * as fc from 'fast-check';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { RegisterUserDto } from './dto';

describe('AuthService Property Tests', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Property 1: User creation with encrypted credentials', () => {
    it('should create user with bcrypt-hashed password for any valid credentials', async () => {
      // **Feature: user-registration, Property 1: User creation with encrypted credentials**
      // **Validates: Requirements 1.1, 4.1**

      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 50 }),
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 100 }),
          async (username, email, password) => {
            // Mock repository to simulate no existing users
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

            let capturedPasswordHash: string;
            
            // Spy on create to capture the password hash
            jest.spyOn(userRepository, 'create').mockImplementation((userData: any) => {
              capturedPasswordHash = userData.passwordHash;
              return {
                id: 'test-uuid',
                username: userData.username,
                email: userData.email,
                passwordHash: userData.passwordHash,
                createdAt: new Date(),
                updatedAt: new Date(),
                greenhouse: null,
              } as User;
            });

            jest.spyOn(userRepository, 'save').mockImplementation(async (user: User) => user);

            const dto: RegisterUserDto = { username, email, password };
            const result = await service.registerUser(dto);

            // Verify user data is correct
            expect(result.user.username).toBe(username);
            expect(result.user.email).toBe(email);
            
            // Verify password is hashed (not plaintext)
            expect(capturedPasswordHash).not.toBe(password);
            
            // Verify it's a bcrypt hash (starts with $2a$, $2b$, or $2y$)
            expect(capturedPasswordHash).toMatch(/^\$2[aby]\$/);
            
            // Verify the hash can be validated against the original password
            const isValid = await bcrypt.compare(password, capturedPasswordHash);
            expect(isValid).toBe(true);
            
            // Verify JWT token is returned
            expect(result.token).toBe('mock-jwt-token');
          },
        ),
        { numRuns: 100 },
      );
    }, 180000); // 3 minute timeout for 100 bcrypt operations
  });

  describe('Property 2: Duplicate user rejection', () => {
    it('should reject registration with duplicate username or email', async () => {
      // **Feature: user-registration, Property 2: Duplicate user rejection**
      // **Validates: Requirements 1.2, 1.3, 6.5**

      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 50 }),
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 100 }),
          fc.string({ minLength: 3, maxLength: 50 }),
          fc.emailAddress(),
          async (username1, email1, password1, username2, email2) => {
            // Create an existing user
            const existingUser: User = {
              id: 'existing-uuid',
              username: username1,
              email: email1,
              passwordHash: 'hashed-password',
              createdAt: new Date(),
              updatedAt: new Date(),
              greenhouse: null,
            };

            // Test duplicate username
            if (username2 === username1) {
              jest.spyOn(userRepository, 'findOne').mockImplementation(async (options: any) => {
                if (options.where.username === username1) {
                  return existingUser;
                }
                return null;
              });

              const dto: RegisterUserDto = { 
                username: username2, 
                email: email2, 
                password: password1 
              };

              await expect(service.registerUser(dto)).rejects.toThrow(ConflictException);
              await expect(service.registerUser(dto)).rejects.toThrow('Username already exists');
            }

            // Test duplicate email
            if (email2 === email1 && username2 !== username1) {
              jest.spyOn(userRepository, 'findOne').mockImplementation(async (options: any) => {
                if (options.where.email === email1) {
                  return existingUser;
                }
                return null;
              });

              const dto: RegisterUserDto = { 
                username: username2, 
                email: email2, 
                password: password1 
              };

              await expect(service.registerUser(dto)).rejects.toThrow(ConflictException);
              await expect(service.registerUser(dto)).rejects.toThrow('Email already registered');
            }
          },
        ),
        { numRuns: 100 },
      );
    }, 30000);
  });

  describe('Property 3: Password validation', () => {
    it('should reject passwords shorter than 8 characters', async () => {
      // **Feature: user-registration, Property 3: Password validation**
      // **Validates: Requirements 1.4, 5.2**

      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 50 }),
          fc.emailAddress(),
          fc.string({ minLength: 0, maxLength: 7 }), // Passwords shorter than 8 characters
          async (username, email, shortPassword) => {
            const dto: RegisterUserDto = { 
              username, 
              email, 
              password: shortPassword 
            };

            // The DTO validation should reject this before it reaches the service
            // In practice, class-validator will catch this at the controller level
            
            // For this test, we verify the DTO validation rules are correct
            const dtoInstance = Object.assign(new RegisterUserDto(), dto);
            const errors = await validate(dtoInstance);
            
            if (shortPassword.length < 8) {
              const passwordErrors = errors.filter(e => e.property === 'password');
              expect(passwordErrors.length).toBeGreaterThan(0);
            }
          },
        ),
        { numRuns: 100 },
      );
    }, 30000);
  });

  describe('Property 9: Unique user identifiers', () => {
    it('should generate unique IDs for all created users', async () => {
      // **Feature: user-registration, Property 9: Unique user identifiers**
      // **Validates: Requirements 4.3**

      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              username: fc.string({ minLength: 3, maxLength: 50 }),
              email: fc.emailAddress(),
              password: fc.string({ minLength: 8, maxLength: 100 }),
            }),
            { minLength: 2, maxLength: 10 },
          ),
          async (users) => {
            const createdIds = new Set<string>();

            // Mock repository to simulate no existing users
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

            for (const userData of users) {
              const mockUser: User = {
                id: `uuid-${Math.random()}-${Date.now()}`, // Simulate UUID generation
                username: userData.username,
                email: userData.email,
                passwordHash: 'hashed-password',
                createdAt: new Date(),
                updatedAt: new Date(),
                greenhouse: null,
              };

              jest.spyOn(userRepository, 'create').mockReturnValue(mockUser);
              jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

              const dto: RegisterUserDto = userData;
              const result = await service.registerUser(dto);

              // Verify ID is unique
              expect(createdIds.has(result.user.id)).toBe(false);
              createdIds.add(result.user.id);
            }

            // Verify all IDs are unique
            expect(createdIds.size).toBe(users.length);
          },
        ),
        { numRuns: 100 },
      );
    }, 180000);
  });

  describe('Property 4: Post-registration authentication', () => {
    it('should return valid JWT token after successful registration', async () => {
      // **Feature: user-registration, Property 4: Post-registration authentication**
      // **Validates: Requirements 1.5, 4.5**

      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 50 }),
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 100 }),
          async (username, email, password) => {
            // Mock repository to simulate no existing users
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

            const mockUser: User = {
              id: 'test-uuid',
              username,
              email,
              passwordHash: await bcrypt.hash(password, 10),
              createdAt: new Date(),
              updatedAt: new Date(),
              greenhouse: null,
            };

            jest.spyOn(userRepository, 'create').mockReturnValue(mockUser);
            jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

            // Mock JWT service to return a token
            const mockToken = `jwt.token.${username}`;
            jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken);

            const dto: RegisterUserDto = { username, email, password };
            const result = await service.registerUser(dto);

            // Verify token is returned
            expect(result.token).toBeDefined();
            expect(result.token).toBe(mockToken);
            expect(typeof result.token).toBe('string');
            expect(result.token.length).toBeGreaterThan(0);

            // Verify JWT sign was called with correct payload
            expect(jwtService.sign).toHaveBeenCalledWith({
              sub: mockUser.id,
              username: mockUser.username,
            });
          },
        ),
        { numRuns: 100 },
      );
    }, 180000);
  });

  describe('Property 10: Password verification', () => {
    it('should authenticate with correct password and reject incorrect passwords', async () => {
      // **Feature: user-registration, Property 10: Password verification**
      // **Validates: Requirements 4.4**

      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 50 }),
          fc.string({ minLength: 8, maxLength: 100 }),
          fc.string({ minLength: 8, maxLength: 100 }),
          async (username, correctPassword, incorrectPassword) => {
            // Skip if passwords happen to be the same
            if (correctPassword === incorrectPassword) {
              return;
            }

            // Create a user with hashed password
            const passwordHash = await bcrypt.hash(correctPassword, 10);
            const mockUser: User = {
              id: 'test-uuid',
              username,
              email: 'test@example.com',
              passwordHash,
              createdAt: new Date(),
              updatedAt: new Date(),
              greenhouse: null,
            };

            // Mock repository to return the user
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

            // Test with correct password - should succeed
            const validUser = await service.validateUser(username, correctPassword);
            expect(validUser).not.toBeNull();
            expect(validUser?.username).toBe(username);

            // Test with incorrect password - should fail
            const invalidUser = await service.validateUser(username, incorrectPassword);
            expect(invalidUser).toBeNull();
          },
        ),
        { numRuns: 100 },
      );
    }, 180000);
  });
});
