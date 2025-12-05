# Implementation Plan

- [x] 1. Set up PostgreSQL database and TypeORM configuration





  - Install required dependencies (@nestjs/typeorm, typeorm, pg, bcrypt, @nestjs/jwt, @nestjs/passport, passport-jwt)
  - Configure TypeORM module in app.module.ts with PostgreSQL connection
  - Create database configuration service
  - Set up environment variables for database connection
  - _Requirements: 4.1, 4.3_

- [x] 2. Create User entity and Auth module structure


  - Create User entity with TypeORM decorators
  - Generate Auth module, controller, and service
  - Create DTOs for registration (RegisterUserDto)
  - Set up validation pipes for DTOs
  - _Requirements: 1.1, 1.4, 5.1, 5.3_

- [x] 3. Implement user registration service





  - Implement password hashing with bcrypt (cost factor 10)
  - Implement user creation logic with duplicate checking
  - Add username uniqueness validation
  - Add email uniqueness validation
  - Generate unique user IDs
  - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.3_

- [x] 3.1 Write property test for user creation with encrypted credentials


  - **Property 1: User creation with encrypted credentials**
  - **Validates: Requirements 1.1, 4.1**

- [x] 3.2 Write property test for duplicate user rejection


  - **Property 2: Duplicate user rejection**
  - **Validates: Requirements 1.2, 1.3, 6.5**

- [x] 3.3 Write property test for password validation


  - **Property 3: Password validation**
  - **Validates: Requirements 1.4, 5.2**

- [x] 3.4 Write property test for unique user identifiers


  - **Property 9: Unique user identifiers**
  - **Validates: Requirements 4.3**

- [x] 4. Implement JWT authentication





  - Configure JWT module with secret and expiration
  - Implement JWT token generation
  - Create JWT strategy for passport
  - Implement login endpoint for existing users
  - Add JWT guard for protected routes
  - _Requirements: 1.5, 4.5_

- [x] 4.1 Write property test for post-registration authentication


  - **Property 4: Post-registration authentication**
  - **Validates: Requirements 1.5, 4.5**

- [x] 4.2 Write property test for password verification


  - **Property 10: Password verification**
  - **Validates: Requirements 4.4**

- [x] 5. Create Auth controller with registration endpoint

  - Implement POST /auth/register endpoint
  - Add validation error handling (HTTP 400)
  - Add duplicate user error handling (HTTP 409)
  - Return HTTP 201 on successful registration
  - Return JWT token in response
  - _Requirements: 6.1, 6.3, 6.4, 6.5_

- [x] 5.1 Write property test for email format validation


  - **Property 11: Email format validation**
  - **Validates: Requirements 5.1**

- [x] 5.2 Write property test for required field validation

  - **Property 12: Required field validation**
  - **Validates: Requirements 5.3**

- [x] 5.3 Write property test for HTTP status code correctness

  - **Property 13: HTTP status code correctness**
  - **Validates: Requirements 6.3, 6.4, 6.5**

- [x] 6. Checkpoint - Ensure all auth tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Create Greenhouse and Zone entities




  - Create Greenhouse entity with TypeORM decorators
  - Create Zone entity with TypeORM decorators
  - Set up relationships (User -> Greenhouse, Greenhouse -> Zones)
  - Add cascade delete for zones when greenhouse is deleted
  - _Requirements: 2.2, 2.3, 2.4_

- [x] 8. Create Greenhouse module and service





  - Generate Greenhouse module, controller, and service
  - Create DTOs (CreateGreenhouseDto, CreateZoneDto)
  - Implement greenhouse creation logic
  - Implement zone creation with order preservation
  - Associate greenhouse with authenticated user
  - _Requirements: 2.2, 2.3, 2.4, 3.4_

- [x] 8.1 Write property test for greenhouse data persistence


  - **Property 5: Greenhouse data persistence**
  - **Validates: Requirements 2.2**

- [x] 8.2 Write property test for zone creation and association


  - **Property 6: Zone creation and association**
  - **Validates: Requirements 2.3, 2.4**

- [x] 8.3 Write property test for zone name validation

  - **Property 7: Zone name validation**
  - **Validates: Requirements 3.3**

- [x] 8.4 Write property test for zone order preservation

  - **Property 8: Zone order preservation**
  - **Validates: Requirements 3.4**

- [x] 9. Create Greenhouse controller with setup endpoint




  - Implement POST /greenhouse/setup endpoint
  - Add JWT authentication guard
  - Validate greenhouse and zone data
  - Return HTTP 201 on successful creation
  - Handle validation errors (HTTP 400)
  - _Requirements: 6.2, 6.3, 6.4_

- [x] 10. Checkpoint - Ensure all greenhouse tests pass




  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Create registration page frontend structure

  - Create app/(auth)/register/page.tsx
  - Set up multi-step form state management
  - Create AccountCreationForm component
  - Create GreenhouseSetupForm component
  - Apply spooky theme styling (dark backgrounds, ghost green accents, pixel borders)
  - _Requirements: 1.1, 2.1_

- [x] 12. Implement AccountCreationForm component


  - Create form with username, email, password fields
  - Add real-time validation with error messages
  - Style inputs with retro/spooky theme (glowing borders, eerie colors)
  - Add spooky decorations (floating ghosts, fog overlay)
  - Implement form submission handler
  - Display API errors in blood-red tombstone-shaped alerts
  - _Requirements: 1.1, 1.4, 5.1, 5.2, 5.3_

- [x] 13. Implement GreenhouseSetupForm component

  - Create form with greenhouse name, location, description fields
  - Create ZoneManager component for dynamic zone management
  - Add zone add/remove functionality
  - Style with spooky theme (toxic purple borders, cobweb decorations)
  - Implement form submission handler
  - Add skip option for greenhouse setup
  - _Requirements: 2.2, 2.3, 3.1, 3.2, 3.3_

- [x] 14. Implement ZoneManager component

  - Create UI for adding zones with name and description
  - Implement zone removal functionality
  - Display zones in order with drag-to-reorder (optional)
  - Validate zone names (required field)
  - Style zone cards with pixel borders and glow effects
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 15. Integrate registration flow with API





  - Create API client functions for registration and greenhouse setup
  - Implement account creation API call
  - Implement greenhouse setup API call
  - Handle loading states with spooky animations (spinning ghost)
  - Handle error responses and display user-friendly messages
  - Store JWT token on successful registration
  - _Requirements: 1.1, 1.5, 2.2, 2.3_

- [x] 16. Implement post-registration navigation




  - Redirect to greenhouse setup after successful account creation
  - Redirect to dashboard after greenhouse setup completion
  - Handle skip greenhouse setup option (redirect to dashboard)
  - Integrate with NextAuth session management
  - _Requirements: 1.5, 2.5_

- [x] 17. Add registration link to login page





  - Add "Create Account" link on login page
  - Style link with spooky theme
  - Ensure navigation works correctly
  - _Requirements: 1.1_

- [x] 18. Update NextAuth configuration for registration





  - Update NextAuth to handle registration tokens
  - Ensure JWT tokens work with both login and registration
  - Test session persistence after registration
  - _Requirements: 1.5, 4.5_

- [x] 19. Final Checkpoint - End-to-end registration testing





  - Test complete registration flow from start to dashboard
  - Test validation errors display correctly
  - Test duplicate user handling
  - Test greenhouse setup with multiple zones
  - Test skip greenhouse setup option
  - Verify spooky theme consistency across all pages
  - Ensure all tests pass, ask the user if questions arise.
