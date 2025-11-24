---
inclusion: always
---

# Haunted Greenhouse - Project Standards

## Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: NestJS
- **Database**: InfluxDB2 (time-series data)
- **Real-time**: WebSocket (NestJS Gateway)
- **Testing**: Jest
- **Validation**: class-validator, class-transformer
- **ORM/Query**: TypeORM (if needed for relational data)

### Mobile
- **Platform**: Android (Kotlin)
- **Architecture**: MVVM with Clean Architecture
- **Networking**: Retrofit + OkHttp
- **Async**: Coroutines + Flow
- **DI**: Hilt
- **UI**: Jetpack Compose
- **Navigation**: Compose Navigation

### AI/ML
- **Image Analysis**: TensorFlow.js or Python-based service
- **Time-series Forecasting**: Prophet or LSTM models

## Code Standards

### TypeScript
- Strict mode enabled
- Explicit return types for functions
- Interface over type for object shapes
- Avoid `any` type

### Naming Conventions

#### Backend (TypeScript/NestJS)
- **Files**: kebab-case (e.g., `environment.module.ts`, `environment.service.ts`)
- **Classes**: PascalCase (e.g., `EnvironmentModule`, `EnvironmentService`)
- **Functions/Variables**: camelCase (e.g., `readSensorData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_TEMPERATURE`)
- **Interfaces**: PascalCase without prefix (e.g., `SensorData`)
- **DTOs**: PascalCase with suffix (e.g., `CreateSensorDataDto`)

#### Mobile (Kotlin)
- **Files**: PascalCase (e.g., `EnvironmentViewModel.kt`)
- **Classes**: PascalCase (e.g., `EnvironmentViewModel`)
- **Functions/Variables**: camelCase (e.g., `readSensorData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_TEMPERATURE`)
- **Packages**: lowercase (e.g., `com.hauntedgreenhouse.sensors`)

### Project Structure

#### Backend (NestJS)
```
backend/
  src/
    modules/
      environment/
        environment.module.ts
        environment.service.ts
        environment.controller.ts
        environment.gateway.ts
        dto/
        entities/
      irrigation/
      plant-health/
      analytics/
      security/
    common/
      services/
        influxdb/
        alerts/
        ai/
      guards/
      interceptors/
      filters/
      decorators/
    config/
      configuration.ts
      validation.ts
    main.ts
  test/

mobile/
  app/
    src/
      main/
        java/com/hauntedgreenhouse/
          data/
            repository/
            remote/
              api/
              dto/
            local/
          domain/
            model/
            repository/
            usecase/
          presentation/
            screens/
              environment/
              irrigation/
              dashboard/
            components/
            navigation/
            viewmodel/
          di/
          utils/
        res/
        AndroidManifest.xml
    build.gradle.kts
  build.gradle.kts
```

## IoT Best Practices
- Implement retry logic for sensor failures
- Use exponential backoff for reconnection
- Buffer sensor data during network outages
- Validate sensor readings before storage
- Implement circuit breaker pattern for external services

## Security
- Environment variables for sensitive config
- API key authentication for sensor endpoints
- Rate limiting on all public endpoints
- Input validation and sanitization
- HTTPS only in production

## Error Handling
- Structured error responses
- Proper HTTP status codes
- Detailed logging for debugging
- Graceful degradation for non-critical failures

## Documentation
- JSDoc comments for public APIs
- README in each module directory
- API documentation (OpenAPI/Swagger)
- Deployment and setup guides
