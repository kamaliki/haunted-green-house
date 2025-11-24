---
title: IrrigationModule - Automated Water Management
status: ready-for-implementation
created: 2025-11-24
parent: haunted-greenhouse-requirements.md
dependencies: [environment-module.md]
---

# IrrigationModule Specification

## Overview
The IrrigationModule manages automated and manual irrigation control. It subscribes to MQTT alerts from the EnvironmentModule (low soil moisture) and can trigger irrigation automatically or via manual commands. It monitors water flow, temperature, and reservoir levels.

## Architecture
```
EnvironmentModule
    ↓ (publishes alert)
MQTT: greenhouse/alerts/low_soil_moisture
    ↓ (subscribes)
IrrigationModule
    ├→ Evaluate conditions (reservoir level, schedule)
    ├→ Publish command to irrigation actuators
    ├→ Monitor water flow sensors
    ├→ Store metrics to InfluxDB2
    └→ Broadcast status via WebSocket

Irrigation Actuators (Simulated)
    ↓ (publish status)
MQTT: greenhouse/irrigation/{zone}/status
```

## Module Responsibilities
1. Subscribe to low soil moisture alerts from EnvironmentModule
2. Evaluate irrigation conditions (reservoir level, time restrictions)
3. Publish irrigation commands to actuator devices via MQTT
4. Monitor water flow, temperature, and reservoir level sensors
5. Implement safety checks (prevent over-watering, reservoir empty)
6. Store irrigation events and metrics to InfluxDB2
7. Provide manual control via REST API
8. Stream real-time irrigation status via WebSocket

## Sensors

### Water Flow Sensors
- **water_flow**: Flow rate in liters per minute (0-100 L/min)
- **water_temperature**: Water temperature in Celsius (5-35°C)

### Reservoir Sensor
- **reservoir_level**: Water level percentage (0-100%)

## Actuators

### Irrigation Valves
- **zone_a_valve**: Controls water flow to Zone A (tomatoes)
- **zone_b_valve**: Controls water flow to Zone B (lettuce)
- **main_valve**: Master control valve

### Flow Control
- **flow_rate_adjustment**: Adjust flow rate (0-100%)

## User Stories

### US-IRR-001: Automatic Irrigation Trigger
**As a** IrrigationModule  
**I want to** automatically start irrigation when soil moisture is low  
**So that** plants receive water without manual intervention

**Acceptance Criteria**:
- Module subscribes to `greenhouse/alerts/low_soil_moisture`
- Irrigation starts only if reservoir_level > 10%
- Correct zone valve opens based on alert device location
- Irrigation runs for calculated duration based on soil moisture deficit
- Status is published to MQTT and WebSocket
- Event is logged to InfluxDB2

### US-IRR-002: Manual Irrigation Control
**As a** greenhouse operator  
**I want to** manually start/stop irrigation for specific zones  
**So that** I can override automatic control when needed

**Acceptance Criteria**:
- POST endpoint accepts zone ID and duration
- Irrigation starts within 2 seconds
- Manual control overrides automatic triggers
- Operator receives confirmation via API and WebSocket
- Manual events are logged with operator ID

### US-IRR-003: Reservoir Level Monitoring
**As a** greenhouse operator  
**I want to** be alerted when water reservoir is low  
**So that** I can refill before irrigation fails

**Acceptance Criteria**:
- Alert triggers when reservoir_level < 20%
- Critical alert at reservoir_level < 10%
- Irrigation is blocked when reservoir_level < 10%
- Alert is sent via email, MQTT, and WebSocket
- Dashboard shows current reservoir level

### US-IRR-004: Water Usage Tracking
**As a** greenhouse operator  
**I want to** track water usage per zone  
**So that** I can optimize irrigation schedules

**Acceptance Criteria**:
- Water flow is measured during irrigation
- Total volume calculated (flow_rate × duration)
- Usage stored in InfluxDB2 per zone
- Daily/weekly/monthly reports available via API
- Dashboard shows usage trends

### US-IRR-005: Safety Interlocks
**As a** IrrigationModule  
**I want to** prevent over-watering and system damage  
**So that** plants and equipment are protected

**Acceptance Criteria**:
- Maximum irrigation duration: 30 minutes per session
- Minimum interval between irrigations: 2 hours
- Irrigation stops if water_flow = 0 (pipe break detection)
- Irrigation stops if soil_moisture > 80%
- All safety events are logged and alerted

## MQTT Topics

### Subscribed Topics (Incoming)

#### greenhouse/alerts/low_soil_moisture
Trigger from EnvironmentModule

**Payload**:
```json
{
  "alertType": "low_soil_moisture",
  "sensorType": "soil_moisture",
  "deviceId": "soil-sensor-01",
  "value": 15.2,
  "threshold": 20,
  "severity": "high",
  "location": "zone-a",
  "timestamp": "2025-11-24T10:30:00Z"
}
```

#### greenhouse/irrigation/{zone}/flow
Water flow sensor readings

**Payload**:
```json
{
  "deviceId": "flow-sensor-zone-a",
  "zone": "zone-a",
  "flow_rate": 25.5,
  "unit": "liters_per_minute",
  "timestamp": "2025-11-24T10:30:00Z"
}
```

#### greenhouse/irrigation/reservoir/level
Reservoir level sensor

**Payload**:
```json
{
  "deviceId": "reservoir-sensor",
  "level": 75.5,
  "unit": "percent",
  "timestamp": "2025-11-24T10:30:00Z"
}
```

#### greenhouse/irrigation/{zone}/status
Actuator status feedback

**Payload**:
```json
{
  "deviceId": "valve-zone-a",
  "zone": "zone-a",
  "status": "open",
  "flow_rate_percent": 80,
  "timestamp": "2025-11-24T10:30:00Z"
}
```

### Published Topics (Outgoing)

#### greenhouse/irrigation/{zone}/command
Control commands to actuators

**Payload**:
```json
{
  "command": "start",
  "zone": "zone-a",
  "duration_seconds": 600,
  "flow_rate_percent": 80,
  "reason": "low_soil_moisture",
  "initiated_by": "automatic",
  "timestamp": "2025-11-24T10:30:00Z"
}
```

**Commands**:
- `start` - Open valve and start irrigation
- `stop` - Close valve and stop irrigation
- `adjust_flow` - Change flow rate percentage

#### greenhouse/alerts/low_reservoir
Alert when reservoir is low

**Payload**:
```json
{
  "alertType": "low_reservoir",
  "level": 15.5,
  "threshold": 20,
  "severity": "high",
  "message": "Water reservoir below 20% - refill required",
  "timestamp": "2025-11-24T10:30:00Z"
}
```

## API Endpoints

### POST /api/irrigation/start
Start irrigation manually

**Request Body**:
```json
{
  "zone": "zone-a",
  "durationSeconds": 600,
  "flowRatePercent": 80,
  "operatorId": "user-123"
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Irrigation started for zone-a",
  "sessionId": "irr-session-uuid",
  "estimatedEndTime": "2025-11-24T10:40:00Z"
}
```

### POST /api/irrigation/stop
Stop irrigation manually

**Request Body**:
```json
{
  "zone": "zone-a",
  "operatorId": "user-123"
}
```

### GET /api/irrigation/status
Get current irrigation status

**Response**: 200 OK
```json
{
  "zones": [
    {
      "zone": "zone-a",
      "status": "active",
      "startTime": "2025-11-24T10:30:00Z",
      "estimatedEndTime": "2025-11-24T10:40:00Z",
      "flowRate": 25.5,
      "totalVolume": 127.5
    },
    {
      "zone": "zone-b",
      "status": "idle",
      "lastIrrigation": "2025-11-24T08:15:00Z"
    }
  ],
  "reservoir": {
    "level": 75.5,
    "status": "normal"
  }
}
```

### GET /api/irrigation/history
Get irrigation history

**Query Parameters**:
- `zone`: Filter by zone (optional)
- `startTime`: ISO 8601 timestamp
- `endTime`: ISO 8601 timestamp

**Response**: 200 OK
```json
{
  "sessions": [
    {
      "sessionId": "irr-session-uuid",
      "zone": "zone-a",
      "startTime": "2025-11-24T10:30:00Z",
      "endTime": "2025-11-24T10:40:00Z",
      "duration": 600,
      "totalVolume": 255.0,
      "reason": "low_soil_moisture",
      "initiatedBy": "automatic"
    }
  ]
}
```

### GET /api/irrigation/usage
Get water usage statistics

**Query Parameters**:
- `period`: day|week|month
- `zone`: Filter by zone (optional)

**Response**: 200 OK
```json
{
  "period": "week",
  "totalVolume": 1250.5,
  "zones": {
    "zone-a": 750.2,
    "zone-b": 500.3
  },
  "sessions": 15,
  "averagePerSession": 83.4
}
```

## WebSocket Events

### Server -> Client

#### irrigation-status
Real-time irrigation status updates

```json
{
  "event": "irrigation-status",
  "data": {
    "zone": "zone-a",
    "status": "active",
    "flowRate": 25.5,
    "elapsedSeconds": 120,
    "remainingSeconds": 480
  }
}
```

#### reservoir-alert
Reservoir level alerts

```json
{
  "event": "reservoir-alert",
  "data": {
    "level": 15.5,
    "severity": "high",
    "message": "Water reservoir below 20%"
  }
}
```

## Data Models

### IrrigationSession (InfluxDB2)
```
measurement: irrigation_sessions
tags:
  - zone
  - reason (automatic|manual)
  - initiated_by
fields:
  - duration_seconds (int)
  - total_volume_liters (float)
  - avg_flow_rate (float)
  - status (string: active|completed|stopped|failed)
timestamp: session start time
```

### WaterFlow (InfluxDB2)
```
measurement: water_flow
tags:
  - zone
  - device_id
fields:
  - flow_rate (float)
  - water_temperature (float)
timestamp: reading time
```

## Business Logic

### Automatic Irrigation Decision
```typescript
async evaluateIrrigationTrigger(alert: LowMoistureAlert): Promise<boolean> {
  // Check reservoir level
  if (reservoirLevel < 10) {
    return false; // Block irrigation
  }

  // Check if zone is already irrigating
  if (isZoneActive(alert.location)) {
    return false;
  }

  // Check minimum interval (2 hours)
  const lastIrrigation = await getLastIrrigation(alert.location);
  if (lastIrrigation && Date.now() - lastIrrigation < 2 * 60 * 60 * 1000) {
    return false;
  }

  // Check time restrictions (e.g., no irrigation during peak sun)
  const hour = new Date().getHours();
  if (hour >= 11 && hour <= 15) {
    return false; // Avoid midday irrigation
  }

  return true;
}
```

### Calculate Irrigation Duration
```typescript
calculateDuration(currentMoisture: number, targetMoisture: number = 60): number {
  const deficit = targetMoisture - currentMoisture;
  const baseSeconds = 300; // 5 minutes base
  const multiplier = deficit / 10; // 1 minute per 10% deficit
  
  const duration = baseSeconds + (multiplier * 60);
  return Math.min(duration, 1800); // Max 30 minutes
}
```

## NestJS Module Structure
```
src/modules/irrigation/
  ├── irrigation.module.ts
  ├── irrigation.controller.ts
  ├── irrigation.service.ts
  ├── irrigation.gateway.ts
  ├── mqtt/
  │   └── irrigation-mqtt.service.ts
  ├── dto/
  │   ├── start-irrigation.dto.ts
  │   ├── stop-irrigation.dto.ts
  │   └── irrigation-status.dto.ts
  ├── entities/
  │   └── irrigation-session.entity.ts
  ├── interfaces/
  │   ├── irrigation-command.interface.ts
  │   └── water-flow.interface.ts
  └── tests/
      ├── irrigation.service.spec.ts
      └── irrigation-mqtt.service.spec.ts
```

## Configuration
```
# Irrigation Settings
IRRIGATION_MAX_DURATION_SECONDS=1800
IRRIGATION_MIN_INTERVAL_SECONDS=7200
IRRIGATION_DEFAULT_FLOW_RATE=80
RESERVOIR_LOW_THRESHOLD=20
RESERVOIR_CRITICAL_THRESHOLD=10

# Time Restrictions
IRRIGATION_AVOID_START_HOUR=11
IRRIGATION_AVOID_END_HOUR=15
```

## Testing Requirements

### Unit Tests
- Irrigation trigger evaluation logic
- Duration calculation
- Safety interlock checks
- MQTT message parsing

### Integration Tests
- MQTT subscription and command publishing
- InfluxDB session storage
- WebSocket broadcasting
- Alert handling from EnvironmentModule

### E2E Tests
- Complete flow: low moisture alert → irrigation start → monitoring → stop
- Manual override scenarios
- Reservoir low blocking
- Safety interlock triggers

## Performance Requirements
- Command execution latency < 2 seconds
- MQTT message processing < 100ms
- Support 10 concurrent irrigation zones
- Historical query response < 500ms

## Security
- API authentication for manual control
- Operator ID logging for audit trail
- Rate limiting on manual commands
- MQTT authentication for actuator commands

## Future Enhancements
- Weather-based irrigation scheduling
- Machine learning for optimal duration
- Fertilizer injection control
- Drip vs sprinkler mode selection
- Multi-greenhouse coordination
