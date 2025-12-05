# Alert Service

The Alert Service provides a centralized system for managing and delivering alerts across the Haunted Greenhouse application.

## Features

- **Disease Detection Alerts**: Automatically triggered when plant diseases are detected
- **Multiple Alert Channels**: Support for in-app, email, push notifications, and webhooks
- **Alert Management**: Query, filter, and acknowledge alerts
- **Severity Levels**: Low, moderate, high, and critical severity classifications

## API Endpoints

### Get All Alerts
```
GET /api/alerts
Query Parameters:
  - type: Filter by alert type (e.g., 'disease_detected')
  - severity: Filter by severity level (e.g., 'high', 'critical')
  - acknowledged: Filter by acknowledgment status (true/false)
  - limit: Limit number of results
```

### Get Single Alert
```
GET /api/alerts/:id
```

### Get Unacknowledged Count
```
GET /api/alerts/unacknowledged/count
```

### Acknowledge Alert
```
PATCH /api/alerts/:id/acknowledge
```

## Usage Example

### Automatic Disease Alerts

When a plant image analysis detects a disease, an alert is automatically created and sent:

```typescript
// This happens automatically in PlantHealthService
if (analysis.results.diseaseDetected && analysis.results.diseases.length > 0) {
  await this.sendDiseaseAlerts(analysis);
}
```

### Querying Alerts

```typescript
// Get all unacknowledged critical alerts
const criticalAlerts = await alertService.getAlerts({
  severity: 'critical',
  acknowledged: false,
});

// Get recent disease alerts
const diseaseAlerts = await alertService.getAlerts({
  type: 'disease_detected',
  limit: 10,
});
```

### Acknowledging Alerts

```typescript
await alertService.acknowledgeAlert(alertId);
```

## Alert Structure

```typescript
interface DiseaseAlert {
  id: string;
  type: 'disease_detected';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  metadata: {
    plantId: string;
    analysisId: string;
    diseaseName: string;
    confidence: number;
    affectedArea: string;
    recommendations: string[];
  };
}
```

## Configuration

Alert channels can be configured using the `setConfig` method:

```typescript
alertService.setConfig({
  channels: [AlertChannel.IN_APP, AlertChannel.EMAIL],
  emailRecipients: ['operator@greenhouse.com'],
  webhookUrl: 'https://example.com/webhook',
});
```

## Integration with Plant Health Module

The Alert Service is automatically integrated with the Plant Health Module. When disease detection analysis completes:

1. Analysis results are stored
2. If diseases are detected, alerts are created for each disease
3. Alerts are sent through configured channels
4. Alerts appear in the dashboard and can be queried via API

## Future Enhancements

- Email integration (SendGrid, AWS SES, or nodemailer)
- Push notification integration (Firebase Cloud Messaging)
- Webhook delivery with retry logic
- Alert escalation rules
- Alert grouping and deduplication
- WebSocket real-time notifications
