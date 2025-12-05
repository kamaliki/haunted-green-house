# Security Module

The Security Module provides physical security monitoring for the Haunted Greenhouse system, including motion detection, access point monitoring (doors and windows), and security event logging.

## Features

- **Motion Detection**: Monitors motion sensors and triggers alerts based on configurable off-hours schedules
- **Access Point Monitoring**: Tracks the status of doors and windows (open/closed)
- **Security Event Logging**: Stores all security events in InfluxDB with 180-day retention
- **Off-Hours Configuration**: Configurable monitoring periods for motion detection alerts
- **Alert Integration**: Sends security alerts through email and in-app channels

## Architecture

### Components

- **SecurityService**: Core business logic for security monitoring
- **SecurityController**: REST API endpoints for security operations
- **SecurityMqttService**: MQTT client for receiving sensor data
- **Interfaces**: TypeScript interfaces for security data models
- **DTOs**: Data transfer objects for API validation

### MQTT Topics

The module subscribes to the following MQTT topics:

- `greenhouse/security/motion/+` - Motion detection events
- `greenhouse/security/door/+` - Door status updates
- `greenhouse/security/window/+` - Window status updates

### MQTT Message Format

**Motion Detection:**
```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "location": "entrance",
  "confidence": 95,
  "sensorId": "motion_001"
}
```

**Door/Window Status:**
```json
{
  "id": "door_001",
  "location": "main_entrance",
  "status": "open",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## API Endpoints

### Get All Access Points
```
GET /security/access-points
```

Returns the current status of all monitored doors and windows.

**Response:**
```json
[
  {
    "id": "door_001",
    "type": "door",
    "location": "main_entrance",
    "status": "closed",
    "lastChanged": "2024-01-01T12:00:00Z"
  }
]
```

### Get Specific Access Point
```
GET /security/access-points/:id
```

Returns the status of a specific access point.

### Configure Off-Hours Monitoring
```
POST /security/off-hours-config
```

Configure when motion detection alerts should be triggered.

**Request Body:**
```json
{
  "enabled": true,
  "startHour": 18,
  "endHour": 6
}
```

- `enabled`: Whether off-hours monitoring is active
- `startHour`: Hour when monitoring starts (0-23)
- `endHour`: Hour when monitoring ends (0-23)

**Note:** The monitoring period can cross midnight (e.g., 18:00 to 6:00).

### Get Off-Hours Configuration
```
GET /security/off-hours-config
```

Returns the current off-hours monitoring configuration.

### Query Security Logs
```
GET /security/logs?eventType=motion_detected&startDate=2024-01-01&endDate=2024-01-02&location=entrance
```

Query security event logs with optional filters.

**Query Parameters:**
- `eventType` (optional): Filter by event type (motion_detected, door_opened, door_closed, window_opened, window_closed)
- `startDate` (optional): Start of time range
- `endDate` (optional): End of time range
- `location` (optional): Filter by location

**Response:**
```json
[
  {
    "id": "event_001",
    "type": "motion_detected",
    "timestamp": "2024-01-01T12:00:00Z",
    "location": "entrance",
    "details": {
      "confidence": 95,
      "sensorId": "motion_001"
    }
  }
]
```

Events are returned in reverse chronological order (newest first).

## Off-Hours Monitoring

The off-hours monitoring feature allows you to configure specific time periods when motion detection alerts should be triggered. This is useful for:

- Monitoring the greenhouse during closed hours
- Reducing false alerts during business hours
- Customizing security based on operational schedules

### Examples

**Monitor from 6 PM to 6 AM:**
```json
{
  "enabled": true,
  "startHour": 18,
  "endHour": 6
}
```

**Monitor from 10 PM to 7 AM:**
```json
{
  "enabled": true,
  "startHour": 22,
  "endHour": 7
}
```

**Always monitor (disable off-hours):**
```json
{
  "enabled": false,
  "startHour": 0,
  "endHour": 0
}
```

## Data Storage

### InfluxDB Schema

**Measurement:** `security_events`

**Tags:**
- `type`: Event type (motion_detected, door_opened, etc.)
- `location`: Physical location of the event

**Fields:**
- `id`: Unique event identifier
- `details`: JSON string with event-specific details

**Timestamp:** Event occurrence time

**Retention:** 180 days

## Alert Integration

Security alerts are sent through the AlertService with the following characteristics:

- **Type:** `security`
- **Severity:** `high`
- **Channels:** Email and in-app notifications
- **Content:** Includes location, event type, and relevant details (e.g., motion confidence)

## Testing

The module includes comprehensive unit tests:

```bash
npm test -- security.service.spec.ts
npm test -- security.controller.spec.ts
```

## Usage Example

### Simulating a Motion Detection Event

Publish to MQTT:
```bash
mosquitto_pub -h localhost -t greenhouse/security/motion/entrance -m '{
  "timestamp": "2024-01-01T22:00:00Z",
  "location": "entrance",
  "confidence": 95,
  "sensorId": "motion_001"
}'
```

### Simulating a Door Opening

Publish to MQTT:
```bash
mosquitto_pub -h localhost -t greenhouse/security/door/main -m '{
  "id": "door_001",
  "location": "main_entrance",
  "status": "open",
  "timestamp": "2024-01-01T12:00:00Z"
}'
```

### Querying Recent Security Events

```bash
curl http://localhost:3000/security/logs?startDate=2024-01-01&endDate=2024-01-02
```

## Requirements Validation

This module implements the following requirements from the specification:

- **Requirement 15:** Motion Detection and Security Alerts
  - 15.1: Motion detection triggers alerts within 1 second
  - 15.2: Alerts include timestamp, location, and confidence
  - 15.3: Off-hours monitoring configuration
  - 15.4: Alerts sent via email and in-app channels

- **Requirement 16:** Access Point Monitoring
  - 16.1: Monitor door and window status (open/closed)
  - 16.2: Status updates within 1 second
  - 16.3: Log state changes with timestamp and location
  - 16.4: Query current status of all access points

- **Requirement 17:** Security Event Logging
  - 17.1: Store events in InfluxDB with full details
  - 17.2: 180-day retention period
  - 17.3: Filter by event type, time range, and location
  - 17.4: Return events in reverse chronological order
