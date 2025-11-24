---
title: Haunted Greenhouse - Smart IoT Monitoring System
status: draft
created: 2025-11-24
---

# Haunted Greenhouse Requirements

## Project Overview
A smart greenhouse with real-time IoT monitoring, AI-based alerts, image analysis, and control automation.

## System Architecture

### Modules

#### 1. EnvironmentModule (Sensor)
**Purpose**: Monitor environmental conditions in real-time

**Sensors**:
- temperature_air
- temperature_soil
- humidity_air
- humidity_soil
- light_intensity
- co2_level
- soil_moisture
- soil_ph
- air_quality

**Actions**:
- read_sensor_data
- store_to_influxdb
- trigger_alerts

#### 2. IrrigationModule (Actuator)
**Purpose**: Automated water management

**Sensors**:
- water_flow
- water_temperature
- reservoir_level

**Actions**:
- start_irrigation
- stop_irrigation
- adjust_flow_rate

#### 3. PlantHealthModule (AI)
**Purpose**: AI-based plant health monitoring

**Inputs**:
- plant_images
- soil_nutrients

**Outputs**:
- growth_analysis
- disease_alerts

#### 4. AnalyticsModule (AI)
**Purpose**: Predictive analytics and optimization

**Inputs**:
- environment_data
- plant_health_data
- weather_data

**Outputs**:
- trend_predictions
- optimization_recommendations
- alert_messages

#### 5. SecurityModule (Sensor)
**Purpose**: Physical security monitoring

**Sensors**:
- motion_detected
- door_status
- window_status

**Actions**:
- send_security_alert

## Data Infrastructure

### InfluxDB2 Time-Series Database
- **Host**: localhost
- **Port**: 8086
- **Connected Modules**: EnvironmentModule, IrrigationModule, PlantHealthModule

## AI Services

### PlantImageAnalyzer
- **Type**: Vision
- **Model**: pretrained_plant_disease_model
- **Input**: plant_images
- **Output**: disease_alerts

## Alert System

### TemperatureAlert
- **Trigger**: temperature_air > 35 OR temperature_air < 10
- **Action**: send_email_alert

## User Stories

### Epic 1: Environment Monitoring
- [ ] As a greenhouse operator, I want to monitor air temperature in real-time so I can ensure optimal growing conditions
- [ ] As a greenhouse operator, I want to track soil moisture levels so I can prevent over/under-watering
- [ ] As a greenhouse operator, I want to receive alerts when environmental conditions exceed safe thresholds
- [ ] As a greenhouse operator, I want to view historical environmental data to identify trends

### Epic 2: Irrigation Control
- [ ] As a greenhouse operator, I want to automatically start irrigation when soil moisture is low
- [ ] As a greenhouse operator, I want to monitor water reservoir levels to prevent running dry
- [ ] As a greenhouse operator, I want to adjust water flow rates based on plant needs
- [ ] As a greenhouse operator, I want to track water usage over time

### Epic 3: Plant Health Monitoring
- [ ] As a greenhouse operator, I want to upload plant images for disease detection
- [ ] As a greenhouse operator, I want to receive alerts when diseases are detected
- [ ] As a greenhouse operator, I want to track plant growth over time
- [ ] As a greenhouse operator, I want recommendations for treating detected issues

### Epic 4: Analytics & Optimization
- [ ] As a greenhouse operator, I want predictive insights on environmental trends
- [ ] As a greenhouse operator, I want optimization recommendations to improve yield
- [ ] As a greenhouse operator, I want to integrate external weather data for better predictions
- [ ] As a greenhouse operator, I want customizable alert thresholds

### Epic 5: Security
- [ ] As a greenhouse operator, I want to be notified of unauthorized access
- [ ] As a greenhouse operator, I want to monitor door and window status remotely
- [ ] As a greenhouse operator, I want motion detection alerts during off-hours

## Acceptance Criteria

### Environment Monitoring
- Sensor data is collected at configurable intervals (default: 60 seconds)
- Data is persisted to InfluxDB2 with proper timestamps
- Alert system triggers within 5 seconds of threshold breach
- Historical data is queryable for at least 90 days

### Irrigation Control
- Irrigation can be triggered manually or automatically
- System prevents irrigation when reservoir level is below 10%
- Flow rate adjustments are applied within 2 seconds
- All irrigation events are logged with timestamps

### Plant Health Monitoring
- Image analysis completes within 10 seconds
- Disease detection accuracy > 85%
- Growth metrics are calculated daily
- Alerts include actionable recommendations

### Analytics
- Predictions are updated every 6 hours
- Recommendations consider last 30 days of data
- Weather data is refreshed every hour
- Alert messages are delivered via email and in-app

### Security
- Motion detection triggers instant alerts
- Door/window status updates within 1 second
- Security logs are retained for 180 days
- Multiple notification channels supported

## Technical Requirements

### Backend
- NestJS backend with TypeScript (already initialized)
- RESTful API for sensor data and control
- WebSocket Gateway for real-time updates
- InfluxDB2 client integration
- Email notification service
- Image upload and processing pipeline
- Swagger/OpenAPI documentation

### Mobile
- Android app with Kotlin (native)
- MVVM + Clean Architecture
- Real-time dashboard with WebSocket
- Push notifications (FCM)
- Image capture and upload
- Manual control interface
- Offline-first with local caching

### AI/ML
- Plant disease detection model integration
- Time-series forecasting for environmental data
- Anomaly detection for sensor readings

### Security
- API authentication and authorization
- Secure sensor communication
- Data encryption at rest and in transit

## Non-Functional Requirements
- System uptime: 99.5%
- API response time: < 200ms (p95)
- Support for up to 50 concurrent sensors
- Mobile app works offline with sync capability
- Scalable to multiple greenhouses

## Future Enhancements
- Multi-greenhouse management
- Advanced ML models for yield prediction
- Integration with external IoT platforms
- Voice control via smart assistants
- Automated nutrient dosing
