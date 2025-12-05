# PlantHealthModule

## Overview
The PlantHealthModule enables greenhouse operators to upload plant images for AI-based disease detection and health monitoring.

## Current Implementation Status
✅ **Phase 1: Basic Image Upload & Storage** (Completed)

### Features Implemented
- Image upload endpoint with validation
- File size and type validation (JPEG/PNG, max 10MB)
- Image processing and storage using Sharp
- Metadata tracking in InfluxDB
- Asynchronous analysis processing
- Analysis result retrieval
- Plant history tracking
- Dashboard summary

## API Endpoints

### POST /api/plant-health/upload
Upload a plant image for analysis.

**Request:**
- Content-Type: `multipart/form-data`
- Fields:
  - `image`: File (JPEG/PNG, max 10MB)
  - `plantId`: string
  - `location`: string (zone-a, zone-b, zone-c, zone-d)
  - `notes`: string (optional)

**Response:** 202 Accepted
```json
{
  "success": true,
  "analysisId": "uuid",
  "message": "Image uploaded successfully, analysis in progress",
  "estimatedCompletionTime": "2025-11-24T10:30:15Z"
}
```

### GET /api/plant-health/analysis/:id
Get analysis results by ID.

**Response:** 200 OK
```json
{
  "analysisId": "uuid",
  "plantId": "plant-001",
  "timestamp": "2025-11-24T10:30:00Z",
  "status": "completed",
  "imageUrl": "/uploads/plant-images/plant-001-2025-11-24.jpg",
  "results": {
    "diseaseDetected": false,
    "diseases": [],
    "healthScore": 95,
    "recommendations": [...]
  }
}
```

### GET /api/plant-health/plants/:plantId/history
Get health history for a specific plant.

### GET /api/plant-health/dashboard
Get overall health dashboard summary.

## Testing

Run tests:
```bash
npm test -- plant-health
```

## Configuration

Environment variables:
```env
PLANT_HEALTH_UPLOAD_DIR=./uploads/plant-images
PLANT_HEALTH_MAX_FILE_SIZE=10485760  # 10MB
PLANT_HEALTH_CONFIDENCE_THRESHOLD=85
PLANT_HEALTH_ALERT_COOLDOWN_HOURS=24
```

## Next Steps (Future Phases)

### Phase 2: Disease Detection
- Integrate AI/ML model (TensorFlow.js or Python service)
- Implement actual disease detection
- Add confidence scoring

### Phase 3: Growth Tracking
- Extract growth metrics from images
- Compare with historical data
- Detect growth anomalies

### Phase 4: Recommendations & Alerts
- Generate treatment recommendations
- Correlate with environmental data
- Publish MQTT alerts
- Email notifications

## Dependencies
- `sharp`: Image processing
- `multer`: File upload handling
- `uuid`: Unique ID generation
- `@influxdata/influxdb-client`: Time-series data storage
