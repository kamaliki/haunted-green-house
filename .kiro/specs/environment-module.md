x---
title: EnvironmentModule - Sensor Data Collection & Monitoring
status: ready-for-implementation
created: 2025-11-24
parent: haunted-greenhouse-requirements.md
---

# EnvironmentModule Specification

## Overview
The EnvironmentModule is responsible for collecting, validating, storing, and monitoring environmental sensor data from the greenhouse. It subscribes to MQTT topics where IoT devices publish sensor readings, processes the data, stores it in InfluxDB2, and triggers alerts when thresholds are breached.

## Architecture
```
IoT Devices (Simulated) 
    ↓ (publish)
MQTT Broker (Mosquitto/EMQX)
    ↓ (subscribe)
EnvironmentModule
    ├→ Validate & Process
    ├→ Store to InfluxDB2
    ├→ Trigger Alerts → IrrigationModule (via MQTT)
    └→ Broadcast via WebSocket → Dashboard
```

## Module Responsibilities
1. Subscribe to MQTT topics for sensor data from IoT devices
2. Validate and sanitize incoming sensor readings
3. Store time-series data in InfluxDB2
4. Stream real-time data to connected clients via WebSocket
5. Evaluate alert conditions and trigger notifications
6. Publish control commands and alerts to MQTT topics
7. Provide REST API for historical data queries

## Sensors

### Air Sensors
- **temperature_air**: Air temperature in Celsius (-10 to 50°C)
- **humidity_air**: Air humidity percentage (0-100%)
- **co2_level**: CO2 concentration in ppm (300-5000 ppm)
- **light_intensity**: Light intensity in lux (0-100000 lux)
- **air_quality**: Air quality index (0-500)

### Soil Sensors
- **temperature_soil**: Soil temperature in Celsius (0-40°C)
- **humidity_soil**: Soil humidity percentage (0-100%)
- **soil_moisture**: Soil moisture percentage (0-100%)
- **soil_ph**: Soil pH level (0-14)

## User Stories

### US-ENV-001: Receive Sensor Data via MQTT
**As a** IoT sensor device  
**I want to** publish sensor readings to MQTT broker  
**So that** environmental conditions are monitored in real-time

**Acceptance Criteria**:
- Module subscribes to `greenhouse/sensors/+/+` wildcard topic
- Data is validated against sensor type constraints
- Invalid data is logged and discarded (no crash)
- Valid data is persisted to InfluxDB2 within 100ms
- MQTT QoS level 1 (at least once delivery)

### US-ENV-002: Real-time Data Streaming
**As a** greenhouse operator  
**I want to** view live sensor data on my dashboard  
**So that** I can monitor conditions in real-time

**Acceptance Criteria**:
- WebSocket gateway broadcasts new sensor readings
- Clients can subscribe to specific sensor types
- Updates are sent within 500ms of data receipt
- Connection handles reconnection gracefully
- Maximum 100 concurrent connections supported

### US-ENV-003: Query Historical Data
**As a** greenhouse operator  
**I want to** query historical sensor data  
**So that** I can analyze trends and patterns

**Acceptance Criteria**:
- GET endpoint supports time range queries
- Supports filtering by sensor type
- Supports aggregation (avg, min, max) over time windows
- Returns data in JSON format
- Response time < 500ms for 24-hour queries

### US-ENV-004: Temperature Alerts
**As a** greenhouse operator  
**I want to** receive alerts when temperature exceeds safe limits  
**So that** I can take corrective action immediately

**Acceptance Criteria**:
- Alert triggers when temperature_air > 35°C or < 10°C
- Alert includes timestamp, sensor ID, and current value
- Alert is published to MQTT topic `greenhouse/alerts/temperature_high` or `temperature_low`
- Alert is sent via email and WebSocket to dashboard
- No duplicate alerts within 5-minute window
- Alert clears when temperature returns to normal range

### US-ENV-006: Trigger Irrigation via Low Moisture Alert
**As a** EnvironmentModule  
**I want to** publish alerts when soil moisture is low  
**So that** IrrigationModule can automatically start watering

**Acceptance Criteria**:
- Alert triggers when soil_moisture < 20%
- Alert is published to `greenhouse/alerts/low_soil_moisture`
- Alert payload includes device location and severity
- IrrigationModule receives and processes the alert
- Alert cooldown prevents spam (30 minutes)

### US-ENV-005: Sensor Health Monitoring
**As a** greenhouse operator  
**I want to** know when sensors stop reporting  
**So that** I can fix or replace faulty sensors

**Acceptance Criteria**:
- System tracks last reading time for each sensor
- Alert triggers if no data received for 5 minutes
- Dashboard shows sensor status (active/inactive)
- Sensor automatically reactivates when data resumes

## MQTT Topics

### Subscribed Topics (Incoming from Devices)

#### greenhouse/sensors/{deviceId}/{sensorType}
Individual sensor readings

**Payload**:
```json
{
  "deviceId": "sensor-001",
  "sensorType": "temperature_air",
  "value": 24.5,
  "unit": "celsius",
  "timestamp": "2025-11-24T10:30:00Z"
}
```

**Examples**:
- `greenhouse/sensors/sensor-001/temperature_air`
- `greenhouse/sensors/sensor-001/humidity_air`
- `greenhouse/sensors/soil-sensor-01/soil_moisture`

#### greenhouse/sensors/{deviceId}/batch
Multiple readings from one device

**Payload**:
```json
{
  "deviceId": "sensor-001",
  "readings": [
    {
      "sensorType": "temperature_air",
      "value": 24.5,
      "unit": "celsius"
    },
    {
      "sensorType": "humidity_air",
      "value": 65.2,
      "unit": "percent"
    }
  ],
  "timestamp": "2025-11-24T10:30:00Z"
}
```

### Published Topics (Outgoing to Other Modules)

#### greenhouse/alerts/{alertType}
Alert notifications

**Payload**:
```json
{
  "alertType": "low_soil_moisture",
  "sensorType": "soil_moisture",
  "deviceId": "soil-sensor-01",
  "value": 15.2,
  "threshold": 20,
  "severity": "high",
  "message": "Soil moisture below threshold - irrigation recommended",
  "timestamp": "2025-11-24T10:30:00Z",
  "targetModule": "irrigation"
}
```

**Examples**:
- `greenhouse/alerts/temperature_high`
- `greenhouse/alerts/low_soil_moisture` → triggers IrrigationModule
- `greenhouse/alerts/high_humidity`

#### greenhouse/status/sensors
Sensor health status updates

**Payload**:
```json
{
  "deviceId": "sensor-001",
  "sensorType": "temperature_air",
  "status": "active",
  "lastReading": "2025-11-24T10:30:00Z"
}
```

## API Endpoints

### GET /api/environment/sensors/data
Query historical sensor data

**Query Parameters**:
- `sensorType`: Filter by sensor type (optional)
- `deviceId`: Filter by device ID (optional)
- `startTime`: ISO 8601 timestamp (required)
- `endTime`: ISO 8601 timestamp (required)
- `aggregation`: none|avg|min|max (default: none)
- `interval`: Aggregation window (e.g., "1m", "5m", "1h")

**Response**: 200 OK
```json
{
  "data": [
    {
      "timestamp": "2025-11-24T10:30:00Z",
      "sensorType": "temperature_air",
      "value": 24.5,
      "deviceId": "sensor-001"
    }
  ],
  "count": 1,
  "aggregation": "none"
}
```

### GET /api/environment/sensors/latest
Get latest reading for each sensor type

**Response**: 200 OK
```json
{
  "temperature_air": {
    "value": 24.5,
    "timestamp": "2025-11-24T10:30:00Z",
    "deviceId": "sensor-001"
  },
  "humidity_air": {
    "value": 65.2,
    "timestamp": "2025-11-24T10:30:15Z",
    "deviceId": "sensor-001"
  }
}
```

### GET /api/environment/sensors/status
Get health status of all sensors

**Response**: 200 OK
```json
{
  "sensors": [
    {
      "deviceId": "sensor-001",
      "sensorType": "temperature_air",
      "status": "active",
      "lastReading": "2025-11-24T10:30:00Z"
    },
    {
      "deviceId": "sensor-002",
      "sensorType": "soil_moisture",
      "status": "inactive",
      "lastReading": "2025-11-24T09:15:00Z"
    }
  ]
}
```

## WebSocket Events

### Client -> Server

#### subscribe
Subscribe to sensor updates
```json
{
  "event": "subscribe",
  "data": {
    "sensorTypes": ["temperature_air", "humidity_air"],
    "deviceIds": ["sensor-001"]
  }
}
```

#### unsubscribe
Unsubscribe from sensor updates
```json
{
  "event": "unsubscribe",
  "data": {
    "sensorTypes": ["temperature_air"]
  }
}
```

### Server -> Client

#### sensor-data
New sensor reading
```json
{
  "event": "sensor-data",
  "data": {
    "deviceId": "sensor-001",
    "sensorType": "temperature_air",
    "value": 24.5,
    "unit": "celsius",
    "timestamp": "2025-11-24T10:30:00Z"
  }
}
```

#### alert
Alert triggered
```json
{
  "event": "alert",
  "data": {
    "alertType": "temperature_high",
    "sensorType": "temperature_air",
    "deviceId": "sensor-001",
    "value": 36.2,
    "threshold": 35,
    "message": "Temperature exceeds safe limit",
    "timestamp": "2025-11-24T10:30:00Z"
  }
}
```

#### sensor-status
Sensor health status change
```json
{
  "event": "sensor-status",
  "data": {
    "deviceId": "sensor-002",
    "sensorType": "soil_moisture",
    "status": "inactive",
    "lastReading": "2025-11-24T09:15:00Z"
  }
}
```

## Data Models

### SensorReading (InfluxDB2)
```
measurement: sensor_readings
tags:
  - device_id
  - sensor_type
  - location (optional)
fields:
  - value (float)
  - unit (string)
timestamp: nanosecond precision
```

### Alert Thresholds (Configuration)
```typescript
interface AlertThreshold {
  sensorType: string;
  minValue?: number;
  maxValue?: number;
  cooldownMinutes: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  notificationChannels: ('email' | 'websocket' | 'sms')[];
}
```

## Alert Rules

### Temperature Alerts
- **High Temperature**: temperature_air > 35°C (critical)
- **Low Temperature**: temperature_air < 10°C (critical)
- **Cooldown**: 5 minutes

### Humidity Alerts
- **High Humidity**: humidity_air > 85% (medium)
- **Low Humidity**: humidity_air < 30% (medium)
- **Cooldown**: 10 minutes

### CO2 Alerts
- **High CO2**: co2_level > 1500 ppm (high)
- **Cooldown**: 15 minutes

### Soil Moisture Alerts
- **Low Moisture**: soil_moisture < 20% (high)
- **High Moisture**: soil_moisture > 80% (medium)
- **Cooldown**: 30 minutes

### Soil pH Alerts
- **Acidic**: soil_ph < 5.5 (medium)
- **Alkaline**: soil_ph > 7.5 (medium)
- **Cooldown**: 60 minutes

## Technical Implementation

### NestJS Module Structure
```
src/modules/environment/
  ├── environment.module.ts          # Module definition
  ├── environment.controller.ts      # REST API endpoints
  ├── environment.service.ts         # Business logic
  ├── environment.gateway.ts         # WebSocket gateway
  ├── mqtt/
  │   ├── mqtt.service.ts            # MQTT client wrapper
  │   └── environment-mqtt.service.ts # MQTT message handlers
  ├── dto/
  │   ├── sensor-reading.dto.ts      # Input validation
  │   ├── batch-reading.dto.ts
  │   ├── query-params.dto.ts
  │   ├── alert.dto.ts
  │   └── sensor-status.dto.ts
  ├── entities/
  │   └── alert-threshold.entity.ts
  ├── interfaces/
  │   ├── sensor-reading.interface.ts
  │   └── alert.interface.ts
  └── tests/
      ├── environment.service.spec.ts
      ├── environment.controller.spec.ts
      ├── environment.gateway.spec.ts
      └── environment-mqtt.service.spec.ts

src/common/services/mqtt/
  ├── mqtt-client.service.ts         # Shared MQTT client
  └── mqtt.module.ts                 # Global MQTT module
```

### Dependencies
- `mqtt` or `async-mqtt` - MQTT client
- `@nestjs/websockets` - WebSocket support
- `@nestjs/platform-socket.io` - Socket.io adapter
- `@influxdata/influxdb-client` - InfluxDB2 client
- `class-validator` - DTO validation
- `class-transformer` - DTO transformation
- `@nestjs/schedule` - Cron jobs for sensor health checks

### Configuration (environment variables)
```
# MQTT Broker
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=greenhouse
MQTT_PASSWORD=your-password
MQTT_CLIENT_ID=haunted-greenhouse-backend

# InfluxDB
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=your-token
INFLUXDB_ORG=haunted-greenhouse
INFLUXDB_BUCKET=sensor-data

# Module Settings
SENSOR_HEALTH_CHECK_INTERVAL=300000  # 5 minutes in ms
ALERT_COOLDOWN_MINUTES=5
```

## Testing Requirements

### Unit Tests
- DTO validation for all sensor types
- Service methods for data storage and retrieval
- Alert threshold evaluation logic
- Sensor health check logic

### Integration Tests
- InfluxDB2 write and query operations
- WebSocket connection and message broadcasting
- REST API endpoints with real database

### E2E Tests
- Complete sensor data flow (POST -> Store -> WebSocket broadcast)
- Alert triggering and notification
- Historical data queries with various filters

## Performance Requirements
- Handle 100 sensor readings per second
- WebSocket broadcast latency < 500ms
- Historical query response time < 500ms for 24h data
- Support 100 concurrent WebSocket connections
- InfluxDB write latency < 100ms

## Security Requirements
- API key authentication for sensor endpoints
- Rate limiting: 1000 requests per minute per device
- Input validation for all sensor values
- Sanitize device IDs to prevent injection
- WebSocket authentication via JWT

## Monitoring & Logging
- Log all sensor data submissions
- Log alert triggers with context
- Monitor InfluxDB connection health
- Track WebSocket connection count
- Alert on sensor inactivity

## Future Enhancements
- Machine learning for anomaly detection
- Predictive alerts based on trends
- Multi-location support
- Sensor calibration API
- Data export functionality
