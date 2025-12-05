# Design Document

## Overview

The Security Access Point Configuration feature provides a comprehensive interface for managing physical entry points (doors and windows) in the Haunted Greenhouse system. This feature enables users to add, edit, delete, and monitor access points with real-time status updates and configurable alert thresholds.

## Architecture

The feature follows a client-server architecture with real-time updates:

**Frontend (Next.js/React)**:
- Security configuration page with CRUD interface
- Real-time status display using WebSocket or polling
- Form validation and user feedback
- Responsive design for mobile and desktop

**Backend (NestJS)**:
- RESTful API for access point CRUD operations
- Access point status monitoring service
- Alert generation based on configured thresholds
- Integration with existing security monitoring system

**Data Storage**:
- Access point configuration stored in database (PostgreSQL or similar)
- Real-time status updates via MQTT or WebSocket
- Alert history stored for audit purposes

## Components and Interfaces

### Frontend Components

1. **AccessPointList**: Displays all configured access points grouped by type
2. **AccessPointCard**: Shows individual access point with status indicator
3. **AccessPointForm**: Form for adding/editing access points
4. **AccessPointDeleteDialog**: Confirmation dialog for deletion
5. **AccessPointStatusIndicator**: Visual indicator for access point status

### Backend Services

1. **AccessPointService**: Business logic for CRUD operations
2. **AccessPointMonitoringService**: Monitors access point status and generates alerts
3. **AccessPointController**: REST API endpoints

### API Endpoints

- `GET /api/security/access-points` - List all access points
- `POST /api/security/access-points` - Create new access point
- `GET /api/security/access-points/:id` - Get access point by ID
- `PATCH /api/security/access-points/:id` - Update access point
- `DELETE /api/security/access-points/:id` - Delete access point
- `GET /api/security/access-points/:id/status` - Get current status

## Data Models

### AccessPoint

```typescript
interface AccessPoint {
  id: string;
  name: string;
  type: 'door' | 'window';
  location: string;
  status: 'open' | 'closed' | 'locked' | 'unlocked';
  monitoringEnabled: boolean;
  alertThreshold: number; // seconds
  lastStatusChange: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### AccessPointConfig

```typescript
interface AccessPointConfig {
  monitoringEnabled: boolean;
  alertThreshold: number;
  alertOnOpen: boolean;
  alertOnUnlocked: boolean;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Input validation rejects invalid data
*For any* access point data with missing required fields (name, type, or location), the validation function should reject the input and return appropriate error messages.
**Validates: Requirements 1.2, 1.4**

### Property 2: Create operation adds access point
*For any* valid access point data, creating the access point should result in it being retrievable from the system with the same data.
**Validates: Requirements 1.3**

### Property 3: List operation returns all access points
*For any* collection of created access points, the list operation should return exactly those access points with no duplicates or omissions.
**Validates: Requirements 2.1**

### Property 4: Display includes all required fields
*For any* access point, the rendered display should include name, type, location, and current status fields.
**Validates: Requirements 2.2**

### Property 5: Grouping by type is correct
*For any* collection of access points, grouping by type should result in all doors in one group and all windows in another, with no access points missing or misplaced.
**Validates: Requirements 2.5**

### Property 6: Get by ID returns correct access point
*For any* access point ID, retrieving by that ID should return the access point with matching ID and correct data.
**Validates: Requirements 3.1**

### Property 7: Update operation modifies access point
*For any* valid access point update, applying the update should result in the access point having the new values while preserving unchanged fields.
**Validates: Requirements 3.3**

### Property 8: Cancel preserves original data
*For any* access point, initiating an edit and then canceling should leave the access point data unchanged.
**Validates: Requirements 3.4**

### Property 9: Delete operation removes access point
*For any* access point, deleting it should result in it no longer appearing in the list of access points.
**Validates: Requirements 4.3**

### Property 10: Cancel deletion preserves access point
*For any* access point, initiating deletion and then canceling should leave the access point in the system unchanged.
**Validates: Requirements 4.4**

### Property 11: Status indicator matches status
*For any* access point with status "open", the rendered display should include an open status indicator (specific color or icon).
**Validates: Requirements 5.2**

### Property 12: Extended open duration triggers highlight
*For any* access point that has been open longer than a configured threshold, the display should highlight it as a security concern.
**Validates: Requirements 5.3**

### Property 13: Status display includes timestamp
*For any* access point, the rendered status display should include the timestamp of the last status change.
**Validates: Requirements 5.5**

### Property 14: Monitoring toggle persists
*For any* access point, setting monitoring enabled to true or false should persist that value and be retrievable.
**Validates: Requirements 6.1**

### Property 15: Alert threshold persists
*For any* valid alert threshold value, setting it on an access point should persist that value and be retrievable.
**Validates: Requirements 6.2**

### Property 16: Threshold breach generates alert
*For any* access point with monitoring enabled, when the access point exceeds its configured threshold, an alert should be generated.
**Validates: Requirements 6.3**

### Property 17: Disabled monitoring prevents alerts
*For any* access point with monitoring disabled, no alerts should be generated regardless of status or duration.
**Validates: Requirements 6.4**

### Property 18: Settings changes apply immediately
*For any* access point, after changing monitoring settings, the new settings should be used for subsequent alert generation logic.
**Validates: Requirements 6.5**

## Error Handling

- **Validation Errors**: Return 400 Bad Request with detailed error messages
- **Not Found**: Return 404 when access point ID doesn't exist
- **Duplicate Names**: Prevent duplicate access point names in the same location
- **Database Errors**: Log errors and return 500 Internal Server Error
- **Network Errors**: Implement retry logic with exponential backoff
- **Real-time Connection Loss**: Display connection status and attempt reconnection

## Testing Strategy

### Unit Tests
- Test validation logic with various invalid inputs
- Test CRUD operations with mock data
- Test grouping and filtering logic
- Test alert generation conditions

### Property-Based Tests
- Use fast-check (TypeScript) for property-based testing
- Configure each property test to run minimum 100 iterations
- Tag each property test with: `**Feature: security-access-points, Property {number}: {property_text}**`
- Each correctness property should be implemented by a SINGLE property-based test
- Generate random access point data for comprehensive testing
- Test edge cases like empty lists, maximum field lengths, boundary values

### Integration Tests
- Test API endpoints with real database
- Test real-time status updates
- Test alert generation end-to-end
