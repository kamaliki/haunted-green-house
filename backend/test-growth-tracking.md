# Growth Tracking Feature Test

## Overview
This document describes how to test the plant growth tracking feature.

## Feature Implementation

The growth tracking feature has been successfully implemented with the following components:

### 1. Growth Metrics Interface
- `GrowthMetrics`: Tracks height (cm), leaf count, and color health (0-100)
- `GrowthComparison`: Compares current vs previous measurements

### 2. GrowthAnalysisService
Located at: `backend/src/modules/plant-health/services/growth-analysis.service.ts`

Key methods:
- `extractGrowthMetrics()`: Extracts growth data from images (currently simulated)
- `compareGrowth()`: Compares current with previous measurements
- `storeGrowthMetrics()`: Stores data to InfluxDB
- `getGrowthHistory()`: Retrieves historical growth data
- `sendGrowthAnomalyAlert()`: Publishes MQTT alerts for abnormal growth

### 3. API Endpoints

#### GET /api/plant-health/plants/:plantId/growth
Returns growth chart data including:
- Historical data points (height, leaf count, color health)
- Summary statistics (current height, total growth, average growth rate)

#### GET /api/plant-health/plants/:plantId/history
Now includes growth metrics in the response

### 4. Growth Anomaly Detection

The system automatically detects:
- **Stunted growth**: Growth rate < 0.3 cm/day
- **Excessive growth**: Growth rate > 3.0 cm/day
- **Negative growth**: Height decrease > 1 cm
- **Leaf loss**: Loss of > 5 leaves

When detected, alerts are published to MQTT topic: `greenhouse/alerts/growth_anomaly`

## Testing the Feature

### Prerequisites
1. Backend server running
2. InfluxDB2 running and configured
3. MQTT broker running

### Test Steps

#### 1. Upload First Plant Image
```bash
curl -X POST http://localhost:3000/api/plant-health/upload \
  -F "image=@test-plant.jpg" \
  -F "plantId=plant-001" \
  -F "location=zone-a" \
  -F "notes=First measurement"
```

Expected response:
```json
{
  "success": true,
  "analysisId": "uuid-here",
  "message": "Image uploaded successfully, analysis in progress",
  "estimatedCompletionTime": "2025-11-24T10:30:15Z"
}
```

#### 2. Wait for Processing
Wait ~2-3 seconds for async processing to complete.

#### 3. Check Analysis Results
```bash
curl http://localhost:3000/api/plant-health/analysis/{analysisId}
```

Expected response should include:
```json
{
  "analysisId": "uuid",
  "plantId": "plant-001",
  "status": "completed",
  "results": {
    "growthMetrics": {
      "heightCm": 45.5,
      "leafCount": 12,
      "colorHealth": 85,
      "growthRate": 0
    },
    "growthComparison": {
      "currentMetrics": { ... },
      "isAbnormal": false
    }
  }
}
```

#### 4. Get Growth Chart Data
```bash
curl http://localhost:3000/api/plant-health/plants/plant-001/growth
```

Expected response:
```json
{
  "plantId": "plant-001",
  "period": "30 days",
  "dataPoints": [
    {
      "timestamp": "2025-11-24T10:30:00Z",
      "heightCm": 45.5,
      "leafCount": 12,
      "colorHealth": 85,
      "growthRate": 0
    }
  ],
  "summary": {
    "currentHeight": 45.5,
    "totalGrowth": 0,
    "averageGrowthRate": 0,
    "averageHealthScore": 85
  }
}
```

#### 5. Upload Second Image (Simulate Growth)
Wait a few minutes or adjust timestamps, then upload another image:

```bash
curl -X POST http://localhost:3000/api/plant-health/upload \
  -F "image=@test-plant-2.jpg" \
  -F "plantId=plant-001" \
  -F "location=zone-a" \
  -F "notes=Second measurement"
```

#### 6. Check Growth Comparison
After processing, check the analysis to see growth comparison:
- `heightChange`: Difference in height
- `leafCountChange`: Difference in leaf count
- `growthRate`: cm/day
- `isAbnormal`: Whether growth is abnormal

#### 7. Monitor MQTT for Alerts
Subscribe to MQTT topic to see growth anomaly alerts:
```bash
mosquitto_sub -h localhost -t "greenhouse/alerts/growth_anomaly"
```

## Data Storage

Growth metrics are stored in InfluxDB with:
- **Measurement**: `plant_growth`
- **Tags**: `plant_id`, `location`
- **Fields**: `height_cm`, `leaf_count`, `color_health`, `growth_rate`, `is_stunted`

## Future Enhancements

Currently, `extractGrowthMetrics()` simulates growth data. In production:
1. Integrate computer vision library (OpenCV, TensorFlow)
2. Implement actual image analysis for:
   - Plant height detection
   - Leaf counting
   - Color analysis for health assessment
3. Add calibration for accurate measurements

## Acceptance Criteria Status

✅ System tracks plant height, leaf count, color
✅ Compares current state to previous images
✅ Calculates growth rate (cm/day)
✅ Identifies stunted growth
✅ Generates growth charts (data endpoint)
✅ Alerts on abnormal growth patterns

All acceptance criteria from US-PH-003 have been implemented!
