---
inclusion: always
---

# Haunted Greenhouse - Project Standards

## Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Nestjs
- **Database**: InfluxDB2 (time-series data)
- **Real-time**: WebSocket (Socket.io or native)
- **Testing**: Jest

### Mobile
- **Framework**: React Native
- **State Management**: Redux or Zustand
- **Navigation**: React Navigation
- **UI Components**: React Native Paper or Native Base

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
- **Files**: kebab-case (e.g., `environment-module.ts`)
- **Classes**: PascalCase (e.g., `EnvironmentModule`)
- **Functions/Variables**: camelCase (e.g., `readSensorData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_TEMPERATURE`)
- **Interfaces**: PascalCase with `I` prefix (e.g., `ISensorData`)

### Project Structure
```
backend/
  src/
    modules/
      environment/
      irrigation/
      plant-health/
      analytics/
      security/
    services/
      influxdb/
      alerts/
      ai/
    api/
      routes/
      controllers/
      middleware/
    types/
    utils/
    config/

mobile/
  src/
    screens/
    components/
    services/
    store/
    navigation/
    types/
    utils/
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
