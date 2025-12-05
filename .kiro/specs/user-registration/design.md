# User Registration with Greenhouse Setup - Design Document

## Overview

The user registration system enables new users to create accounts and configure their greenhouse setup in a multi-step process. The system consists of backend authentication services built with NestJS and a frontend registration flow built with Next.js. The design follows the existing project architecture patterns, using NestJS modules for backend services and Next.js App Router for frontend pages.

The registration flow is divided into two main steps:
1. **Account Creation**: User provides credentials (username, email, password)
2. **Greenhouse Setup**: User configures greenhouse profile and defines zones

## Architecture

### Database Layer

The system will use **PostgreSQL** as the relational database for storing user accounts, greenhouse profiles, and zones. TypeORM will be used as the ORM layer, providing:
- Entity-based data modeling
- Automatic migrations
- Query builder and repository pattern
- Transaction support
- Connection pooling

### Backend Architecture

The backend will introduce two new modules following NestJS conventions:

1. **Auth Module** (`backend/src/modules/auth/`)
   - Handles user registration, login, and JWT token management
   - Provides password hashing and validation
   - Manages user sessions

2. **Greenhouse Module** (`backend/src/modules/greenhouse/`)
   - Manages greenhouse profiles and zones
   - Associates greenhouses with user accounts
   - Provides CRUD operations for greenhouse configuration

### Frontend Architecture

The frontend will add new pages and components:

1. **Registration Page** (`frontend/app/(auth)/register/page.tsx`)
   - Multi-step form for account creation and greenhouse setup
   - Client-side validation with real-time feedback
   - Integration with NextAuth for automatic authentication

2. **Registration Components**
   - `AccountCreationForm`: Collects user credentials
   - `GreenhouseSetupForm`: Collects greenhouse information and zones
   - `ZoneManager`: Dynamic zone creation and management

### Data Flow

```
User → Registration Page → Auth API → Database
                         ↓
                    JWT Token
                         ↓
                  Greenhouse Setup → Greenhouse API → Database
                         ↓
                    Main Dashboard
```

## Components and Interfaces

### Backend Components

#### Auth Module

**AuthController**
- `POST /auth/register` - Create new user account
- `POST /auth/login` - Authenticate user (existing functionality to be added)
- `GET /auth/profile` - Get current user profile

**AuthService**
- `registerUser(dto: RegisterUserDto): Promise<UserResponse>`
- `validateUser(username: string, password: string): Promise<User | null>`
- `hashPassword(password: string): Promise<string>`
- `comparePasswords(plain: string, hashed: string): Promise<boolean>`
- `generateJwtToken(user: User): string`

**User Entity**
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Greenhouse Module

**GreenhouseController**
- `POST /greenhouse/setup` - Create greenhouse profile with zones
- `GET /greenhouse` - Get user's greenhouse profile
- `PUT /greenhouse/:id` - Update greenhouse profile
- `POST /greenhouse/:id/zones` - Add zone to greenhouse
- `DELETE /greenhouse/:id/zones/:zoneId` - Remove zone

**GreenhouseService**
- `createGreenhouse(userId: string, dto: CreateGreenhouseDto): Promise<Greenhouse>`
- `getGreenhouseByUserId(userId: string): Promise<Greenhouse | null>`
- `updateGreenhouse(id: string, dto: UpdateGreenhouseDto): Promise<Greenhouse>`
- `addZone(greenhouseId: string, dto: CreateZoneDto): Promise<Zone>`
- `removeZone(greenhouseId: string, zoneId: string): Promise<void>`

**Greenhouse Entity**
```typescript
interface Greenhouse {
  id: string;
  userId: string;
  name: string;
  location: string;
  description?: string;
  zones: Zone[];
  createdAt: Date;
  updatedAt: Date;
}
```

**Zone Entity**
```typescript
interface Zone {
  id: string;
  greenhouseId: string;
  name: string;
  description?: string;
  order: number;
  createdAt: Date;
}
```

### Frontend Components

#### Registration Page

The registration page will follow the **Spooky/Haunted Theme** established in the nextjs-frontend design:
- Dark purple-black backgrounds with ghost green accents
- Pixel borders with eerie glow effects
- Spooky fonts (Creepster for headings, VT323 for retro text)
- Floating ghost decorations and fog overlay animations
- Tombstone-shaped cards with cobweb decorations
- Glowing validation feedback in ghost green/blood red

**Multi-Step Form State**
```typescript
interface RegistrationState {
  step: 'account' | 'greenhouse';
  accountData: {
    username: string;
    email: string;
    password: string;
  };
  greenhouseData: {
    name: string;
    location: string;
    description: string;
    zones: ZoneInput[];
  };
}
```

**AccountCreationForm Props**
```typescript
interface AccountCreationFormProps {
  onSubmit: (data: AccountData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
```

**GreenhouseSetupForm Props**
```typescript
interface GreenhouseSetupFormProps {
  onSubmit: (data: GreenhouseData) => Promise<void>;
  onSkip: () => void;
  isLoading: boolean;
  error: string | null;
}
```

**ZoneManager Props**
```typescript
interface ZoneManagerProps {
  zones: ZoneInput[];
  onAdd: (zone: ZoneInput) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, zone: ZoneInput) => void;
}
```

## Data Models

### DTOs (Data Transfer Objects)

**RegisterUserDto**
```typescript
class RegisterUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}
```

**CreateGreenhouseDto**
```typescript
class CreateGreenhouseDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  location: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateZoneDto)
  zones: CreateZoneDto[];
}
```

**CreateZoneDto**
```typescript
class CreateZoneDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}
```

### Database Schema

Since the project uses InfluxDB for time-series data, we'll add PostgreSQL for relational data (users, greenhouses, zones). We'll use TypeORM as the ORM for database interactions.

**Users Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

**Greenhouses Table**
```sql
CREATE TABLE greenhouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(200) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_greenhouses_user_id ON greenhouses(user_id);
```

**Zones Table**
```sql
CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  greenhouse_id UUID NOT NULL REFERENCES greenhouses(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_zones_greenhouse_id ON zones(greenhouse_id);
```

**TypeORM Entities**

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Greenhouse, greenhouse => greenhouse.user)
  greenhouse: Greenhouse;
}

@Entity('greenhouses')
export class Greenhouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 200 })
  location: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.greenhouse)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Zone, zone => zone.greenhouse, { cascade: true })
  zones: Zone[];
}

@Entity('zones')
export class Zone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'greenhouse_id', type: 'uuid' })
  greenhouseId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'order_index', type: 'integer' })
  orderIndex: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Greenhouse, greenhouse => greenhouse.zones)
  @JoinColumn({ name: 'greenhouse_id' })
  greenhouse: Greenhouse;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: User creation with encrypted credentials

*For any* valid username, email, and password combination, when a user registers, the system should create a user account where the stored password is a bcrypt hash (not plaintext) and the account contains the provided username and email.

**Validates: Requirements 1.1, 4.1**

### Property 2: Duplicate user rejection

*For any* existing user account, attempting to register with either the same username or same email (regardless of other fields) should be rejected with an appropriate error indicating the conflict.

**Validates: Requirements 1.2, 1.3, 6.5**

### Property 3: Password validation

*For any* password string with length less than 8 characters, the registration system should reject it with a validation error indicating the minimum length requirement.

**Validates: Requirements 1.4, 5.2**

### Property 4: Post-registration authentication

*For any* successful user registration, the response should include a valid JWT authentication token that can be used for subsequent requests.

**Validates: Requirements 1.5, 4.5**

### Property 5: Greenhouse data persistence

*For any* valid greenhouse configuration (name, location, description), when submitted by an authenticated user, the system should create a greenhouse record with exactly those values associated with that user.

**Validates: Requirements 2.2**

### Property 6: Zone creation and association

*For any* list of zone definitions submitted with a greenhouse configuration, the system should create zone records for each definition and associate all zones with the greenhouse.

**Validates: Requirements 2.3, 2.4**

### Property 7: Zone name validation

*For any* zone definition with an empty or missing name, the system should reject the zone creation with a validation error.

**Validates: Requirements 3.3**

### Property 8: Zone order preservation

*For any* ordered list of zones submitted during greenhouse setup, retrieving the greenhouse should return zones in the same order they were submitted.

**Validates: Requirements 3.4**

### Property 9: Unique user identifiers

*For any* set of created user accounts, all user IDs should be unique (no two users share the same ID).

**Validates: Requirements 4.3**

### Property 10: Password verification

*For any* registered user, authentication with the correct password should succeed, and authentication with any incorrect password should fail.

**Validates: Requirements 4.4**

### Property 11: Email format validation

*For any* string that does not match valid email format (missing @, invalid domain, etc.), the registration system should reject it with an email format error.

**Validates: Requirements 5.1**

### Property 12: Required field validation

*For any* registration or greenhouse setup request with missing required fields, the system should reject the request with errors indicating which specific fields are required.

**Validates: Requirements 5.3**

### Property 13: HTTP status code correctness

*For any* registration request, the HTTP status code should be: 201 for success, 400 for validation errors, and 409 for duplicate username/email conflicts.

**Validates: Requirements 6.3, 6.4, 6.5**

## Error Handling

### Backend Error Handling

**Validation Errors**
- Use class-validator decorators for DTO validation
- Return structured error responses with field-specific messages
- HTTP 400 status for validation failures

**Duplicate User Errors**
- Check for existing username/email before creating user
- Return HTTP 409 with specific conflict information
- Include which field (username or email) caused the conflict

**Authentication Errors**
- Return HTTP 401 for invalid credentials
- Return HTTP 403 for unauthorized access to resources
- Never expose whether username or email exists in error messages (security)

**Database Errors**
- Wrap database operations in try-catch blocks
- Handle connection errors gracefully
- Return HTTP 500 for unexpected errors
- Log detailed error information server-side
- Return generic error messages to client

### Frontend Error Handling

**Form Validation**
- Real-time validation as user types
- Display field-specific error messages below inputs
- Prevent submission when validation errors exist
- Clear errors when user corrects the field

**API Error Handling**
- Display user-friendly error messages from API responses
- Handle network errors gracefully
- Show loading states during API calls
- Provide retry mechanisms for failed requests

**Navigation Errors**
- Handle authentication failures during registration
- Redirect to login if session expires
- Preserve form data on navigation errors when possible

## Testing Strategy

### Unit Testing

The system will use Jest for unit testing on both backend and frontend.

**Backend Unit Tests**
- Test individual service methods (password hashing, user creation, etc.)
- Test DTO validation rules
- Test error handling paths
- Mock file system operations for database tests
- Test JWT token generation and validation

**Frontend Unit Tests**
- Test form validation logic
- Test component rendering with different props
- Test error message display
- Test zone management (add/remove/update)
- Mock API calls using MSW (Mock Service Worker)

### Property-Based Testing

The system will use fast-check for property-based testing in TypeScript.

**Configuration**
- Each property test should run a minimum of 100 iterations
- Use appropriate generators for usernames, emails, passwords, and greenhouse data
- Tag each test with the property number and requirement it validates

**Test Organization**
- Property tests for Auth Service: `auth.service.property.spec.ts`
- Property tests for Greenhouse Service: `greenhouse.service.property.spec.ts`
- Property tests for API endpoints: `auth.controller.property.spec.ts`, `greenhouse.controller.property.spec.ts`

**Example Property Test Structure**
```typescript
describe('AuthService Property Tests', () => {
  it('Property 1: User creation with encrypted credentials', async () => {
    // **Feature: user-registration, Property 1: User creation with encrypted credentials**
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 3, maxLength: 50 }),
        fc.emailAddress(),
        fc.string({ minLength: 8, maxLength: 100 }),
        async (username, email, password) => {
          const user = await authService.registerUser({ username, email, password });
          expect(user.passwordHash).not.toBe(password);
          expect(user.passwordHash).toMatch(/^\$2[aby]\$/); // bcrypt format
          expect(user.username).toBe(username);
          expect(user.email).toBe(email);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**API Integration Tests**
- Test complete registration flow (account + greenhouse setup)
- Test authentication flow with registered users
- Test error scenarios end-to-end
- Use supertest for HTTP testing

**Frontend Integration Tests**
- Test multi-step registration form flow
- Test form submission and API integration
- Test error handling and display
- Use React Testing Library

### End-to-End Testing

**Registration Flow E2E**
- Complete registration from start to dashboard
- Test with various valid and invalid inputs
- Verify data persistence across page reloads
- Test authentication state management

## Security Considerations

### Password Security
- Use bcrypt with cost factor of 10 (configurable)
- Never log or store plaintext passwords
- Implement rate limiting on registration endpoint
- Consider password strength requirements beyond length

### JWT Security
- Use strong secret key (environment variable)
- Set appropriate token expiration (e.g., 24 hours)
- Include minimal necessary claims in token
- Implement token refresh mechanism

### Input Validation
- Validate all inputs on both client and server
- Sanitize inputs to prevent injection attacks
- Use parameterized queries if upgrading to SQL database
- Implement CSRF protection for forms

### API Security
- Implement rate limiting on all endpoints
- Use HTTPS in production
- Validate JWT tokens on protected endpoints
- Implement proper CORS configuration

## Performance Considerations

### Backend Performance
- Index username and email fields for fast lookups
- Cache user sessions to reduce database queries
- Implement connection pooling if upgrading to SQL database
- Use async/await properly to avoid blocking

### Frontend Performance
- Debounce validation checks during typing
- Lazy load greenhouse setup form
- Optimize bundle size with code splitting
- Use React.memo for expensive components

### Scalability
- Design database schema for horizontal scaling
- Consider moving to PostgreSQL for production
- Implement caching layer (Redis) for sessions
- Use CDN for static assets

## Deployment Considerations

### Environment Variables
```
# Backend
JWT_SECRET=<strong-random-secret>
JWT_EXPIRATION=24h
BCRYPT_ROUNDS=10
DATABASE_URL=postgresql://user:password@localhost:5432/haunted_greenhouse
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=greenhouse_user
DATABASE_PASSWORD=<secure-password>
DATABASE_NAME=haunted_greenhouse

# Frontend
NEXT_PUBLIC_API_URL=<backend-url>
NEXTAUTH_URL=<frontend-url>
NEXTAUTH_SECRET=<strong-random-secret>
```

### Database Initialization
- Run TypeORM migrations to create tables
- Set up PostgreSQL connection pool
- Implement database migration strategy for schema changes
- Backup strategy for PostgreSQL database

### Monitoring
- Log all registration attempts (success and failure)
- Monitor registration success rate
- Track authentication failures
- Alert on unusual patterns (mass registrations, etc.)
