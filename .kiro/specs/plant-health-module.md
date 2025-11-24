---
title: PlantHealthModule - AI-Based Plant Monitoring
status: ready-for-implementation
created: 2025-11-24
parent: haunted-greenhouse-requirements.md
dependencies: [environment-module.md]
---

# PlantHealthModule Specification

## Overview
The PlantHealthModule uses AI/ML to analyze plant images and soil nutrient data to detect diseases, monitor growth, and provide actionable recommendations. It integrates with the EnvironmentModule to correlate health issues with environmental conditions.

## Architecture
```
Mobile App / Dashboard
    ↓ (upload image)
REST API: POST /api/plant-health/analyze
    ↓
PlantHealthModule
    ├─ Image Processing
    ├─ AI Model (Disease Detection)
    ├─ Growth Analysis
    ├─ Correlation with Environment Data
    └─ Generate Recommendations
        ↓
Store Results to InfluxDB
Publish Alerts to MQTT
```

## Module Responsibilities
1. Accept plant image uploads via REST API
2. Process images using AI/ML model for disease detection
3. Analyze growth patterns over time
4. Correlate health issues with environmental data
5. Generate actionable recommendations
6. Store analysis results in InfluxDB2
7. Publish disease alerts via MQTT
8. Provide historical health tracking

## User Stories

### US-PH-001: Upload Plant Images
**As a** greenhouse operator  
**I want to** upload plant images for analysis  
**So that** I can detect diseases early

**Acceptance Criteria**:
- POST endpoint accepts image files (JPEG, PNG)
- Maximum file size: 10MB
- Image metadata includes: plant_id, location, timestamp
- Returns analysis job ID immediately
- Processing happens asynchronously
- Supports multiple images per plant

### US-PH-002: Disease Detection
**As a** greenhouse operator  
**I want to** automatically detect plant diseases from images  
**So that** I can treat problems before they spread

**Acceptance Criteria**:
- AI model analyzes uploaded images
- Detects common diseases: blight, mildew, rust, leaf spot, etc.
- Confidence score > 85% for alerts
- Results include: disease name, severity, affected area
- Processing completes within 10 seconds
- False positive rate < 10%

### US-PH-003: Growth Tracking
**As a** greenhouse operator  
**I want to** track plant growth over time  
**So that** I can optimize growing conditions

**Acceptance Criteria**:
- System tracks plant height, leaf count, color
- Compares current state to previous images
- Calculates growth rate (cm/day)
- Identifies stunted growth
- Generates growth charts
- Alerts on abnormal growth patterns

### US-PH-004: Health Recommendations
**As a** greenhouse operator  
**I want to** receive actionable recommendations  
**So that** I know how to treat detected issues

**Acceptance Criteria**:
- Recommendations include: treatment method, products, timing
- Correlates with environmental data (temp, humidity, etc.)
- Suggests preventive measures
- Links to detailed guides
- Prioritizes by severity
- Tracks recommendation effectiveness

### US-PH-005: Disease Alerts
**As a** greenhouse operator  
**I want to** be alerted when diseases are detected  
**So that** I can respond immediately

**Acceptance Criteria**:
- Alert triggers when confidence > 85%
- Published to MQTT: `greenhouse/alerts/disease_detected`
- Includes: plant_id, disease, severity, image_url
- Email notification for critical diseases
- Dashboard notification
- Alert cooldown: 24 hours per plant

## API Endpoints

### POST /api/plant-health/upload
Upload plant image for analysis

**Request**: multipart/form-data
```
image: File (JPEG/PNG, max 10MB)
plantId: string
location: string (zone-a, zone-b)
notes: string (optional)
```

**Response**: 202 Accepted
```json
{
  "success": true,
  "analysisId": "analysis-uuid",
  "message": "Image uploaded successfully, analysis in progress",
  "estimatedCompletionTime": "2025-11-24T10:30:15Z"
}
```

### GET /api/plant-health/analysis/:id
Get analysis results

**Response**: 200 OK
```json
{
  "analysisId": "analysis-uuid",
  "plantId": "plant-001",
  "timestamp": "2025-11-24T10:30:00Z",
  "status": "completed",
  "results": {
    "diseaseDetected": true,
    "diseases": [
      {
        "name": "Early Blight",
        "confidence": 92.5,
        "severity": "moderate",
        "affectedArea": "lower leaves",
        "description": "Fungal disease causing dark spots on leaves"
      }
    ],
    "healthScore": 65,
    "recommendations": [
      {
        "action": "Remove affected leaves",
        "priority": "high",
        "timing": "immediately"
      },
      {
        "action": "Apply copper-based fungicide",
        "priority": "high",
        "timing": "within 24 hours"
      },
      {
        "action": "Improve air circulation",
        "priority": "medium",
        "timing": "ongoing"
      }
    ]
  },
  "environmentalContext": {
    "temperature": 28.5,
    "humidity": 85,
    "note": "High humidity may contribute to fungal growth"
  }
}
```

### GET /api/plant-health/plants/:plantId/history
Get health history for a plant

**Response**: 200 OK
```json
{
  "plantId": "plant-001",
  "analyses": [
    {
      "timestamp": "2025-11-24T10:30:00Z",
      "healthScore": 65,
      "diseaseDetected": true,
      "diseases": ["Early Blight"],
      "imageUrl": "/uploads/plant-001-20251124.jpg"
    },
    {
      "timestamp": "2025-11-20T10:30:00Z",
      "healthScore": 85,
      "diseaseDetected": false,
      "imageUrl": "/uploads/plant-001-20251120.jpg"
    }
  ],
  "growthMetrics": {
    "currentHeight": 45.2,
    "growthRate": 1.2,
    "averageHealthScore": 75
  }
}
```

### GET /api/plant-health/dashboard
Get overall health dashboard

**Response**: 200 OK
```json
{
  "summary": {
    "totalPlants": 50,
    "healthyPlants": 42,
    "plantsWithIssues": 8,
    "criticalIssues": 2,
    "averageHealthScore": 82
  },
  "recentAlerts": [
    {
      "plantId": "plant-001",
      "disease": "Early Blight",
      "severity": "moderate",
      "timestamp": "2025-11-24T10:30:00Z"
    }
  ],
  "byZone": {
    "zone-a": {
      "plants": 25,
      "averageHealthScore": 85,
      "issues": 3
    },
    "zone-b": {
      "plants": 25,
      "averageHealthScore": 79,
      "issues": 5
    }
  }
}
```

### POST /api/plant-health/feedback
Provide feedback on analysis accuracy

**Request Body**:
```json
{
  "analysisId": "analysis-uuid",
  "accurate": true,
  "actualDisease": "Early Blight",
  "notes": "Diagnosis was correct, treatment worked"
}
```

## MQTT Topics

### Published Topics

#### greenhouse/alerts/disease_detected
Disease detection alert

**Payload**:
```json
{
  "alertType": "disease_detected",
  "plantId": "plant-001",
  "location": "zone-a",
  "disease": "Early Blight",
  "severity": "moderate",
  "confidence": 92.5,
  "healthScore": 65,
  "imageUrl": "/uploads/plant-001-20251124.jpg",
  "recommendations": [
    "Remove affected leaves",
    "Apply fungicide"
  ],
  "timestamp": "2025-11-24T10:30:00Z"
}
```

#### greenhouse/alerts/growth_anomaly
Abnormal growth pattern detected

**Payload**:
```json
{
  "alertType": "growth_anomaly",
  "plantId": "plant-001",
  "location": "zone-a",
  "issue": "stunted_growth",
  "currentHeight": 25.5,
  "expectedHeight": 35.0,
  "growthRate": 0.3,
  "expectedGrowthRate": 1.2,
  "timestamp": "2025-11-24T10:30:00Z"
}
```

## AI/ML Model

### Model Architecture
- **Type**: Convolutional Neural Network (CNN)
- **Framework**: TensorFlow.js or Python-based service
- **Pre-trained Model**: PlantVillage dataset or custom trained
- **Input**: 224x224 RGB images
- **Output**: Disease classification + confidence scores

### Supported Diseases
1. **Tomato Diseases**:
   - Early Blight
   - Late Blight
   - Leaf Mold
   - Septoria Leaf Spot
   - Spider Mites
   - Target Spot
   - Mosaic Virus
   - Yellow Leaf Curl Virus

2. **General Issues**:
   - Nutrient Deficiency (N, P, K)
   - Pest Damage
   - Water Stress
   - Heat Stress

### Model Integration Options

#### Option 1: TensorFlow.js (Node.js)
```typescript
import * as tf from '@tensorflow/tfjs-node';

async loadModel() {
  this.model = await tf.loadLayersModel('file://./models/plant-disease/model.json');
}

async analyzeImage(imagePath: string) {
  const image = await this.preprocessImage(imagePath);
  const predictions = await this.model.predict(image);
  return this.interpretPredictions(predictions);
}
```

#### Option 2: Python Microservice
```python
# Separate Python service with FastAPI
from fastapi import FastAPI, File, UploadFile
import tensorflow as tf

@app.post("/analyze")
async def analyze_image(file: UploadFile):
    image = preprocess_image(file)
    predictions = model.predict(image)
    return interpret_predictions(predictions)
```

## Data Models

### PlantAnalysis (InfluxDB2)
```
measurement: plant_analyses
tags:
  - plant_id
  - location
  - disease_detected (boolean)
fields:
  - health_score (float)
  - confidence (float)
  - disease_name (string)
  - severity (string)
  - growth_height (float)
timestamp: analysis time
```

### PlantGrowth (InfluxDB2)
```
measurement: plant_growth
tags:
  - plant_id
  - location
fields:
  - height_cm (float)
  - leaf_count (int)
  - growth_rate (float)
timestamp: measurement time
```

## NestJS Module Structure
```
src/modules/plant-health/
  ├── plant-health.module.ts
  ├── plant-health.controller.ts
  ├── plant-health.service.ts
  ├── dto/
  │   ├── upload-image.dto.ts
  │   ├── analysis-result.dto.ts
  │   └── feedback.dto.ts
  ├── services/
  │   ├── image-processing.service.ts
  │   ├── disease-detection.service.ts
  │   └── growth-analysis.service.ts
  ├── interfaces/
  │   ├── analysis.interface.ts
  │   └── disease.interface.ts
  └── models/
      └── plant-disease/  # AI model files
```

## Dependencies
```json
{
  "@tensorflow/tfjs-node": "^4.11.0",
  "sharp": "^0.32.0",  // Image processing
  "multer": "^1.4.5-lts.1",  // File upload
  "@nestjs/platform-express": "^11.0.1"
}
```

## Configuration
```env
# Plant Health Module
PLANT_HEALTH_MODEL_PATH=./models/plant-disease
PLANT_HEALTH_UPLOAD_DIR=./uploads/plant-images
PLANT_HEALTH_MAX_FILE_SIZE=10485760  # 10MB
PLANT_HEALTH_CONFIDENCE_THRESHOLD=85
PLANT_HEALTH_ALERT_COOLDOWN_HOURS=24
```

## Implementation Phases

### Phase 1: Basic Image Upload & Storage
- File upload endpoint
- Image storage
- Metadata tracking
- Basic validation

### Phase 2: Disease Detection
- Integrate AI model
- Image preprocessing
- Disease classification
- Confidence scoring

### Phase 3: Growth Tracking
- Extract growth metrics from images
- Compare with historical data
- Calculate growth rates
- Detect anomalies

### Phase 4: Recommendations & Alerts
- Generate recommendations
- Correlate with environment data
- MQTT alert publishing
- Email notifications

### Phase 5: Dashboard & Analytics
- Health dashboard
- Historical trends
- Effectiveness tracking
- Reporting

## Testing Requirements

### Unit Tests
- Image upload validation
- Model prediction parsing
- Recommendation generation
- Growth calculation

### Integration Tests
- End-to-end image analysis flow
- InfluxDB storage
- MQTT alert publishing
- Environment data correlation

### Model Testing
- Accuracy on test dataset (>85%)
- False positive rate (<10%)
- Processing time (<10s)
- Edge cases (poor lighting, partial images)

## Performance Requirements
- Image upload: < 2 seconds
- Analysis processing: < 10 seconds
- Concurrent analyses: 10 simultaneous
- Image storage: 1000 images
- Historical query: < 500ms

## Security Requirements
- Image upload size limits
- File type validation (JPEG, PNG only)
- Sanitize filenames
- Secure storage paths
- Access control for plant data

## Future Enhancements
- Video analysis for real-time monitoring
- 3D plant modeling
- Pest identification
- Nutrient deficiency detection
- Automated treatment recommendations
- Integration with treatment tracking
- Mobile app with camera integration
- AR overlay for in-field diagnosis
