# Access Point Monitoring Service

## Overview

The `AccessPointMonitoringService` provides automated monitoring of access points (doors and windows) in the Haunted Greenhouse system. It tracks how long access points remain open and generates security alerts when configured thresholds are exceeded.

## Features

### Status Tracking (Requirement 5.1)
- Tracks the open/closed status of all access points
- Maintains in-memory state of when each access point was opened
- Syncs with database on service initialization

### Threshold Checking (Requirements 5.3, 6.3)
- Runs periodic checks every 30 seconds via cron job
- Calculates duration for open access points
- Generates alerts when duration exceeds configured threshold
- Only monitors access points with `monitoringEnabled: true`

### Alert Integration (Requirement 6.3)
- Integrates with the existing `AlertService`
- Sends security alerts with detailed information:
  - Access point name, type, and location
  - Duration in minutes
  - Threshold that was exceeded
  - Metadata for tracking and analysis

### Monitoring Control (Requirement 6.4)
- Respects the `monitoringEnabled` flag on each access point
- Disabled access points do not generate alerts
- Settings can be changed per access point

## API Methods

### `updateAccessPointStatus(accessPointId, newStatus)`
Updates the status of an access point and tracks open duration. Should be called when access point status changes via MQTT or other means.

### `checkThresholds()`
Automated cron job that runs every 30 seconds to check all monitored access points for threshold breaches.

### `getAccessPointsExceedingThreshold()`
Returns a list of access points currently exceeding their configured thresholds with duration information.

### `getOpenDuration(accessPointId)`
Returns the current open duration in seconds for a specific access point, or null if closed.

## Integration

The service is:
- Registered in `SecurityModule`
- Exported for use by other modules
- Injected into `SecurityController` for API endpoints
- Uses `@nestjs/schedule` for automated monitoring

## Controller Endpoints

Two new endpoints were added to expose monitoring functionality:

- `GET /security/access-points/exceeding-threshold` - Get all access points currently exceeding thresholds
- `GET /security/access-points/:id/open-duration` - Get current open duration for a specific access point

## Usage Example

```typescript
// Update access point status (typically called from MQTT handler)
await monitoringService.updateAccessPointStatus('door-123', 'open');

// Get access points exceeding thresholds
const exceeding = await monitoringService.getAccessPointsExceedingThreshold();

// Get open duration for specific access point
const duration = await monitoringService.getOpenDuration('door-123');
```

## Configuration

Each access point has two monitoring settings:
- `monitoringEnabled` (boolean) - Enable/disable monitoring
- `alertThreshold` (number) - Duration in seconds before alert is generated

Default threshold is 300 seconds (5 minutes).

## Testing

The service includes:
- Unit tests for core logic
- Integration with existing security controller tests
- Mock implementations for testing

All tests pass successfully.
