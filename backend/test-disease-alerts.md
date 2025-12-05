# Testing Disease Detection Alerts

This document describes how to test the disease detection alert functionality.

## Prerequisites

1. Backend server running (`npm run start:dev`)
2. InfluxDB running (via docker-compose)

## Test Scenario 1: Upload Image and Trigger Alert

### Step 1: Upload a Plant Image

```bash
curl -X POST http://localhost:3000/api/plant-health/upload \
  -F "image=@path/to/plant-image.jpg" \
  -F "plantId=plant-001" \
  -F "location=greenhouse-zone-a" \
  -F "notes=Testing disease detection"
```

Expected Response:
```json
{
  "success": true,
  "analysisId": "uuid-here",
  "message": "Image uploaded successfully, analysis in progress",
  "estimatedCompletionTime": "2024-01-01T12:00:10.000Z"
}
```

### Step 2: Wait for Analysis to Complete

Wait approximately 2-3 seconds for the async processing to complete.

### Step 3: Check Analysis Results

```bash
curl http://localhost:3000/api/plant-health/analysis/{analysisId}
```

### Step 4: Check for Alerts

```bash
# Get all alerts
curl http://localhost:3000/api/alerts

# Get only disease alerts
curl http://localhost:3000/api/alerts?type=disease_detected

# Get unacknowledged alerts
curl http://localhost:3000/api/alerts?acknowledged=false

# Get unacknowledged count
curl http://localhost:3000/api/alerts/unacknowledged/count
```

Expected Response (if disease detected):
```json
[
  {
    "id": "alert-uuid",
    "type": "disease_detected",
    "severity": "high",
    "title": "Disease Detected: Powdery Mildew",
    "message": "Plant plant-001 has been diagnosed with Powdery Mildew (92% confidence). White powdery coating on leaves.",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "acknowledged": false,
    "metadata": {
      "plantId": "plant-001",
      "analysisId": "analysis-uuid",
      "diseaseName": "Powdery Mildew",
      "confidence": 0.92,
      "affectedArea": "leaves",
      "recommendations": [
        "Apply fungicide treatment",
        "Improve air circulation"
      ]
    }
  }
]
```

## Test Scenario 2: Acknowledge an Alert

### Step 1: Get Alert ID

From the previous test, note the alert ID.

### Step 2: Acknowledge the Alert

```bash
curl -X PATCH http://localhost:3000/api/alerts/{alertId}/acknowledge
```

Expected Response:
```json
{
  "id": "alert-uuid",
  "type": "disease_detected",
  "severity": "high",
  "title": "Disease Detected: Powdery Mildew",
  "message": "...",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "acknowledged": true,
  "metadata": { ... }
}
```

### Step 3: Verify Unacknowledged Count Decreased

```bash
curl http://localhost:3000/api/alerts/unacknowledged/count
```

## Test Scenario 3: Filter Alerts by Severity

```bash
# Get only critical alerts
curl http://localhost:3000/api/alerts?severity=critical

# Get only high severity alerts
curl http://localhost:3000/api/alerts?severity=high

# Get recent 5 alerts
curl http://localhost:3000/api/alerts?limit=5
```

## Test Scenario 4: View Dashboard with Alerts

```bash
curl http://localhost:3000/api/plant-health/dashboard
```

Expected Response:
```json
{
  "summary": {
    "totalPlants": 5,
    "healthyPlants": 3,
    "plantsWithIssues": 2,
    "criticalIssues": 1,
    "averageHealthScore": 87.5
  },
  "recentAlerts": [
    {
      "plantId": "plant-001",
      "disease": "Powdery Mildew",
      "severity": "high",
      "timestamp": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

## Notes

- Currently, the disease detection uses mock data (returns healthy plants)
- To test with actual disease detection, modify the `processImageAsync` method in `plant-health.service.ts` to return mock disease results
- Alerts are stored in-memory and will be lost on server restart
- Future versions will integrate with actual AI models and persistent storage

## Modifying Mock Data for Testing

To test disease alerts, temporarily modify `backend/src/modules/plant-health/plant-health.service.ts`:

```typescript
// In processImageAsync method, change:
analysis.results = {
  diseaseDetected: true,  // Changed from false
  diseases: [
    {
      name: 'Powdery Mildew',
      confidence: 0.92,
      severity: 'high',
      affectedArea: 'leaves',
      description: 'White powdery coating on leaf surfaces',
    },
  ],
  healthScore: 65,  // Changed from 95
  recommendations: [
    {
      action: 'Apply fungicide treatment',
      priority: 'high',
      timing: 'immediate',
    },
    {
      action: 'Improve air circulation around plants',
      priority: 'medium',
      timing: 'within 24 hours',
    },
  ],
};
```

After making this change, restart the server and upload a new image to trigger a disease alert.
