# Testing Treatment Recommendations

This guide shows how to test the treatment recommendations feature.

## Prerequisites

1. Backend server running:
```bash
cd backend
npm run start:dev
```

2. Have a test image ready (any image file will work for testing)

## Step 1: Upload a Plant Image

```bash
curl -X POST http://localhost:3000/api/plant-health/upload \
  -F "image=@test-plant.jpg" \
  -F "plantId=plant-001" \
  -F "location=zone-a" \
  -F "notes=Testing treatment recommendations"
```

**Expected Response:**
```json
{
  "success": true,
  "analysisId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Image uploaded successfully, analysis in progress",
  "estimatedCompletionTime": "2025-11-24T10:30:15.000Z"
}
```

**Save the `analysisId` for the next steps.**

## Step 2: Simulate Disease Detection

Replace `{analysisId}` with the ID from Step 1.

### Test Early Blight
```bash
curl -X POST http://localhost:3000/api/plant-health/analysis/{analysisId}/simulate-disease \
  -H "Content-Type: application/json" \
  -d '{"diseaseName": "Early Blight"}'
```

### Test Late Blight (Critical)
```bash
curl -X POST http://localhost:3000/api/plant-health/analysis/{analysisId}/simulate-disease \
  -H "Content-Type: application/json" \
  -d '{"diseaseName": "Late Blight"}'
```

### Test Powdery Mildew
```bash
curl -X POST http://localhost:3000/api/plant-health/analysis/{analysisId}/simulate-disease \
  -H "Content-Type: application/json" \
  -d '{"diseaseName": "Powdery Mildew"}'
```

### Test Septoria Leaf Spot
```bash
curl -X POST http://localhost:3000/api/plant-health/analysis/{analysisId}/simulate-disease \
  -H "Content-Type: application/json" \
  -d '{"diseaseName": "Septoria Leaf Spot"}'
```

### Test Nutrient Deficiency
```bash
curl -X POST http://localhost:3000/api/plant-health/analysis/{analysisId}/simulate-disease \
  -H "Content-Type: application/json" \
  -d '{"diseaseName": "Nutrient Deficiency"}'
```

## Step 3: View Analysis with Recommendations

```bash
curl http://localhost:3000/api/plant-health/analysis/{analysisId}
```

**Expected Response Structure:**
```json
{
  "analysisId": "550e8400-e29b-41d4-a716-446655440000",
  "plantId": "plant-001",
  "timestamp": "2025-11-24T10:30:00.000Z",
  "status": "completed",
  "results": {
    "diseaseDetected": true,
    "diseases": [
      {
        "name": "Early Blight",
        "confidence": 92,
        "severity": "moderate",
        "affectedArea": "lower leaves",
        "description": "Fungal disease causing dark spots with concentric rings on leaves"
      }
    ],
    "healthScore": 65,
    "recommendations": [
      {
        "action": "Remove and destroy affected leaves",
        "priority": "high",
        "timing": "immediately",
        "treatmentMethod": "Physical removal",
        "guideUrl": "https://extension.umn.edu/diseases/early-blight"
      },
      {
        "action": "Isolate affected plants if possible",
        "priority": "high",
        "timing": "immediately",
        "treatmentMethod": "Quarantine"
      },
      {
        "action": "Apply copper-based fungicide",
        "priority": "high",
        "timing": "within 24 hours",
        "treatmentMethod": "Chemical treatment",
        "products": [
          "Copper sulfate",
          "Bordeaux mixture",
          "Copper hydroxide"
        ],
        "guideUrl": "https://extension.umn.edu/diseases/early-blight"
      },
      {
        "action": "Improve air circulation around plants",
        "priority": "medium",
        "timing": "within 48 hours",
        "treatmentMethod": "Environmental modification",
        "products": [
          "Fans",
          "Pruning shears"
        ]
      },
      {
        "action": "Implement crop rotation schedule",
        "priority": "medium",
        "timing": "next growing season",
        "treatmentMethod": "Cultural practice",
        "preventiveMeasures": [
          "Rotate crops every 2-3 years",
          "Avoid planting in same location"
        ]
      },
      {
        "action": "Apply preventive fungicide spray schedule",
        "priority": "medium",
        "timing": "ongoing",
        "treatmentMethod": "Preventive treatment",
        "products": [
          "Chlorothalonil",
          "Mancozeb"
        ]
      }
    ]
  },
  "environmentalContext": {
    "temperature": 28.5,
    "humidity": 85,
    "note": "High humidity may contribute to fungal growth"
  },
  "imageUrl": "/uploads/plant-images/plant-001-20251124.jpg"
}
```

## What to Look For

### 1. Comprehensive Recommendations
Each recommendation should include:
- ✅ Clear action to take
- ✅ Priority level (critical, high, medium, low)
- ✅ Timing (immediately, within 24 hours, etc.)
- ✅ Treatment method
- ✅ Specific products (when applicable)
- ✅ Links to guides (when applicable)

### 2. Priority Ordering
Recommendations should be sorted by priority:
1. Critical actions first
2. High priority actions
3. Medium priority actions
4. Low priority actions

### 3. Environmental Context
If environmental data is available:
- ✅ Temperature reading
- ✅ Humidity reading
- ✅ Contextual notes about conditions

### 4. Disease-Specific Information
- ✅ Disease name and description
- ✅ Confidence score
- ✅ Severity level
- ✅ Affected area

## Testing Different Scenarios

### High Humidity Scenario
If you have environmental data with high humidity (>80%), you should see additional recommendations like:
```json
{
  "action": "Reduce greenhouse humidity to below 70%",
  "priority": "high",
  "timing": "within 24 hours",
  "treatmentMethod": "Environmental control",
  "products": ["Dehumidifier", "Ventilation fans"],
  "environmentalFactors": ["Current humidity: 85%"]
}
```

### High Temperature Scenario
If temperature is above 30°C, you should see:
```json
{
  "action": "Lower temperature to optimal range (20-25°C)",
  "priority": "medium",
  "timing": "within 48 hours",
  "treatmentMethod": "Environmental control",
  "products": ["Shade cloth", "Cooling system"],
  "environmentalFactors": ["Current temperature: 32°C"]
}
```

## Using Postman

### 1. Upload Image
- Method: POST
- URL: `http://localhost:3000/api/plant-health/upload`
- Body: form-data
  - `image`: (file) Select your test image
  - `plantId`: plant-001
  - `location`: zone-a
  - `notes`: Testing treatment recommendations

### 2. Simulate Disease
- Method: POST
- URL: `http://localhost:3000/api/plant-health/analysis/{analysisId}/simulate-disease`
- Headers: `Content-Type: application/json`
- Body: raw JSON
```json
{
  "diseaseName": "Early Blight"
}
```

### 3. Get Analysis
- Method: GET
- URL: `http://localhost:3000/api/plant-health/analysis/{analysisId}`

## Troubleshooting

### No Environmental Context
If you don't see environmental context in the response:
- Make sure the EnvironmentModule is running and collecting data
- Check that InfluxDB is running and accessible
- Environmental data is queried from the last hour

### Generic Recommendations
If you see generic recommendations like "Isolate affected plant":
- This means the disease name wasn't recognized
- Check that you're using one of the supported disease names
- Supported: Early Blight, Late Blight, Powdery Mildew, Septoria Leaf Spot, Nutrient Deficiency

### Analysis Not Found
If you get a 404 error:
- Make sure you're using the correct analysisId from the upload response
- The analysis must exist before you can simulate disease detection

## Next Steps

After testing, you can:
1. View plant history: `GET /api/plant-health/plants/plant-001/history`
2. Check dashboard: `GET /api/plant-health/dashboard`
3. View growth data: `GET /api/plant-health/plants/plant-001/growth`

## Notes

- The simulate-disease endpoint is for testing purposes
- In production, the AI model will automatically detect diseases
- Treatment recommendations are based on established agricultural extension guidelines
- Links point to University of Minnesota Extension resources
