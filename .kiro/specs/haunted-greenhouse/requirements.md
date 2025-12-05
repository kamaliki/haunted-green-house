# Requirements Document

## Introduction

The Haunted Greenhouse is a smart IoT monitoring system that provides real-time environmental monitoring, automated irrigation control, AI-based plant health analysis, predictive analytics, and physical security monitoring for greenhouse operations. The system integrates sensors, actuators, AI services, and a time-series database to enable data-driven greenhouse management with automated alerts and control capabilities.

## Glossary

- **System**: The Haunted Greenhouse IoT monitoring and control platform
- **Operator**: A greenhouse operator or manager who uses the system
- **EnvironmentModule**: The subsystem responsible for monitoring environmental sensor data
- **IrrigationModule**: The subsystem responsible for automated water management
- **PlantHealthModule**: The subsystem responsible for AI-based plant health monitoring
- **AnalyticsModule**: The subsystem responsible for predictive analytics and optimization
- **SecurityModule**: The subsystem responsible for physical security monitoring
- **InfluxDB**: The time-series database used for storing sensor data
- **Sensor Reading**: A single data point collected from a physical sensor
- **Alert**: A notification triggered when a condition exceeds defined thresholds
- **Threshold**: A configurable limit that triggers an alert when exceeded
- **Irrigation Event**: A period during which water is actively being delivered to plants
- **Disease Detection**: The process of analyzing plant images to identify health issues
- **Prediction**: A forecast of future environmental conditions based on historical data
- **Recommendation**: A suggested action to optimize greenhouse operations

## Requirements

### Requirement 1: Real-time Environmental Monitoring

**User Story:** As a greenhouse operator, I want to monitor environmental conditions in real-time, so that I can ensure optimal growing conditions for my plants.

#### Acceptance Criteria

1. WHEN the EnvironmentModule collects sensor data, THE System SHALL store the data to InfluxDB with a timestamp accurate to the second
2. WHEN an operator requests current sensor readings, THE System SHALL return data collected within the last 60 seconds
3. WHEN environmental data is stored, THE System SHALL include sensor type, value, unit, and location metadata
4. THE System SHALL collect sensor data from temperature_air, temperature_soil, humidity_air, humidity_soil, light_intensity, co2_level, soil_moisture, soil_ph, and air_quality sensors
5. WHEN the EnvironmentModule is configured with a collection interval, THE System SHALL collect sensor data at that specified interval

### Requirement 2: Environmental Alert System

**User Story:** As a greenhouse operator, I want to receive alerts when environmental conditions exceed safe thresholds, so that I can take corrective action before plants are damaged.

#### Acceptance Criteria

1. WHEN temperature_air exceeds 35 degrees Celsius, THE System SHALL trigger a high temperature alert within 5 seconds
2. WHEN temperature_air falls below 10 degrees Celsius, THE System SHALL trigger a low temperature alert within 5 seconds
3. WHEN an environmental threshold is breached, THE System SHALL send an email alert to the configured operator address
4. WHEN an alert is triggered, THE System SHALL include the sensor type, current value, threshold value, and timestamp in the alert message
5. WHERE an operator has configured custom thresholds, THE System SHALL use those thresholds instead of default values

### Requirement 3: Historical Data Access

**User Story:** As a greenhouse operator, I want to view historical environmental data, so that I can identify trends and patterns in growing conditions.

#### Acceptance Criteria

1. WHEN an operator queries historical data, THE System SHALL return data for the requested time range from InfluxDB
2. THE System SHALL retain environmental sensor data for at least 90 days
3. WHEN historical data is requested, THE System SHALL support filtering by sensor type, time range, and location
4. WHEN an operator requests trend data, THE System SHALL return data aggregated at appropriate intervals for the time range

### Requirement 4: Manual Irrigation Control

**User Story:** As a greenhouse operator, I want to manually start and stop irrigation, so that I can water plants when needed regardless of automation.

#### Acceptance Criteria

1. WHEN an operator sends a start irrigation command, THE System SHALL activate the irrigation system within 2 seconds
2. WHEN an operator sends a stop irrigation command, THE System SHALL deactivate the irrigation system within 2 seconds
3. WHEN irrigation is started or stopped, THE System SHALL log the event with a timestamp, operator identifier, and action type
4. WHEN an irrigation command is received, THE System SHALL validate that the reservoir level is above 10 percent before starting irrigation
5. IF the reservoir level is below 10 percent, THEN THE System SHALL reject the start irrigation command and return an error message

### Requirement 5: Automated Irrigation Control

**User Story:** As a greenhouse operator, I want irrigation to start automatically when soil moisture is low, so that plants receive water without constant manual monitoring.

#### Acceptance Criteria

1. WHEN soil_moisture falls below a configured threshold, THE System SHALL automatically start irrigation
2. WHEN soil_moisture reaches a configured upper threshold, THE System SHALL automatically stop irrigation
3. WHEN automated irrigation is triggered, THE System SHALL log the event with timestamp, trigger condition, and soil moisture value
4. WHERE an operator has disabled automatic irrigation, THE System SHALL not start irrigation automatically regardless of soil moisture levels

### Requirement 6: Irrigation Flow Control

**User Story:** As a greenhouse operator, I want to adjust water flow rates, so that I can match water delivery to plant needs and growth stages.

#### Acceptance Criteria

1. WHEN an operator sends a flow rate adjustment command, THE System SHALL apply the new flow rate within 2 seconds
2. WHEN flow rate is adjusted, THE System SHALL validate that the requested rate is within the supported range of the irrigation hardware
3. WHEN flow rate is changed, THE System SHALL log the event with timestamp, previous rate, new rate, and operator identifier
4. THE System SHALL monitor water_flow sensor readings and report actual flow rate to the operator

### Requirement 7: Water Resource Monitoring

**User Story:** As a greenhouse operator, I want to monitor water reservoir levels and usage, so that I can prevent running dry and track consumption patterns.

#### Acceptance Criteria

1. THE System SHALL monitor reservoir_level sensor and store readings to InfluxDB at the configured interval
2. WHEN reservoir_level falls below 10 percent, THE System SHALL trigger a low reservoir alert
3. WHEN an irrigation event occurs, THE System SHALL calculate water usage based on flow rate and duration
4. WHEN an operator requests water usage data, THE System SHALL return total usage aggregated by day, week, or month

### Requirement 8: Plant Image Upload and Analysis

**User Story:** As a greenhouse operator, I want to upload plant images for disease detection, so that I can identify health issues early.

#### Acceptance Criteria

1. WHEN an operator uploads a plant image, THE System SHALL accept images in JPEG, PNG, or WebP format
2. WHEN an image is uploaded, THE System SHALL validate that the file size is less than 10 megabytes
3. WHEN a valid image is received, THE System SHALL store the image with metadata including upload timestamp, operator identifier, and plant location
4. WHEN an image is stored, THE System SHALL initiate disease detection analysis within 1 second
5. WHEN image analysis completes, THE System SHALL return results within 10 seconds of upload

### Requirement 9: Disease Detection and Alerts

**User Story:** As a greenhouse operator, I want to receive alerts when diseases are detected in plant images, so that I can treat problems before they spread.

#### Acceptance Criteria

1. WHEN the PlantHealthModule analyzes a plant image, THE System SHALL identify any diseases present with a confidence score
2. WHEN a disease is detected with confidence above 70 percent, THE System SHALL trigger a disease alert
3. WHEN a disease alert is triggered, THE System SHALL include the disease name, confidence score, affected plant location, and image reference
4. WHEN a disease is detected, THE System SHALL send an alert via email and in-app notification within 5 seconds

### Requirement 10: Growth Tracking

**User Story:** As a greenhouse operator, I want to track plant growth over time, so that I can monitor development and identify slow-growing plants.

#### Acceptance Criteria

1. WHEN plant images are uploaded over time, THE System SHALL calculate growth metrics by comparing sequential images
2. THE System SHALL calculate growth metrics including height change, leaf area change, and overall size change
3. WHEN growth metrics are calculated, THE System SHALL store the metrics with timestamp and plant identifier
4. WHEN an operator requests growth data, THE System SHALL return metrics aggregated by plant and time period

### Requirement 11: Treatment Recommendations

**User Story:** As a greenhouse operator, I want recommendations for treating detected plant health issues, so that I know what actions to take.

#### Acceptance Criteria

1. WHEN a disease is detected, THE System SHALL generate treatment recommendations based on the disease type
2. WHEN treatment recommendations are generated, THE System SHALL include specific actions, required materials, and application timing
3. WHEN recommendations are provided, THE System SHALL prioritize treatments by effectiveness and ease of implementation
4. WHEN an operator views a disease alert, THE System SHALL display associated treatment recommendations

### Requirement 12: Environmental Trend Predictions

**User Story:** As a greenhouse operator, I want predictive insights on environmental trends, so that I can anticipate conditions and plan accordingly.

#### Acceptance Criteria

1. WHEN the AnalyticsModule generates predictions, THE System SHALL analyze the last 30 days of environmental data
2. THE System SHALL generate predictions for temperature_air, humidity_air, and light_intensity for the next 24 hours
3. THE System SHALL update predictions every 6 hours using the latest available data
4. WHEN predictions are generated, THE System SHALL include confidence intervals or uncertainty estimates
5. WHEN predicted conditions exceed alert thresholds, THE System SHALL generate proactive alerts

### Requirement 13: Optimization Recommendations

**User Story:** As a greenhouse operator, I want optimization recommendations to improve yield, so that I can maximize plant productivity.

#### Acceptance Criteria

1. WHEN the AnalyticsModule generates recommendations, THE System SHALL analyze environmental data, plant health data, and growth metrics
2. WHEN recommendations are generated, THE System SHALL identify specific adjustments to temperature, humidity, light, or irrigation schedules
3. WHEN recommendations are provided, THE System SHALL include expected impact on plant growth or health
4. THE System SHALL generate optimization recommendations at least once per week

### Requirement 14: External Weather Integration

**User Story:** As a greenhouse operator, I want external weather data integrated into predictions, so that forecasts account for outside conditions.

#### Acceptance Criteria

1. THE System SHALL retrieve weather forecast data from an external weather API every hour
2. WHEN weather data is retrieved, THE System SHALL store temperature, humidity, precipitation, and solar radiation forecasts
3. WHEN generating environmental predictions, THE System SHALL incorporate external weather data into the prediction model
4. IF the weather API is unavailable, THEN THE System SHALL generate predictions using only internal historical data

### Requirement 15: Motion Detection and Security Alerts

**User Story:** As a greenhouse operator, I want to be notified of unauthorized access, so that I can protect my greenhouse and equipment.

#### Acceptance Criteria

1. WHEN the SecurityModule detects motion, THE System SHALL trigger a motion detection alert within 1 second
2. WHEN a motion alert is triggered, THE System SHALL include timestamp, sensor location, and motion detection confidence
3. WHERE an operator has configured off-hours monitoring, THE System SHALL only trigger motion alerts during specified time periods
4. WHEN a security alert is triggered, THE System SHALL send notifications via email and in-app channels

### Requirement 16: Access Point Monitoring

**User Story:** As a greenhouse operator, I want to monitor door and window status remotely, so that I can ensure the greenhouse is properly secured.

#### Acceptance Criteria

1. THE System SHALL monitor door_status and window_status sensors and report current state as open or closed
2. WHEN a door or window changes state, THE System SHALL update the status within 1 second
3. WHEN a door or window is opened, THE System SHALL log the event with timestamp and location
4. WHEN an operator requests access point status, THE System SHALL return the current state of all monitored doors and windows

### Requirement 17: Security Event Logging

**User Story:** As a greenhouse operator, I want security events logged for review, so that I can investigate incidents and identify patterns.

#### Acceptance Criteria

1. WHEN a security event occurs, THE System SHALL store the event in InfluxDB with timestamp, event type, sensor location, and details
2. THE System SHALL retain security logs for at least 180 days
3. WHEN an operator queries security logs, THE System SHALL support filtering by event type, time range, and location
4. WHEN security logs are accessed, THE System SHALL return events in reverse chronological order

### Requirement 18: System Performance and Reliability

**User Story:** As a greenhouse operator, I want the system to be reliable and responsive, so that I can depend on it for critical operations.

#### Acceptance Criteria

1. THE System SHALL maintain an uptime of at least 99.5 percent measured over any 30-day period
2. WHEN an API request is received, THE System SHALL respond within 200 milliseconds for 95 percent of requests
3. THE System SHALL support concurrent data collection from at least 50 sensors without performance degradation
4. WHEN a sensor fails to report data, THE System SHALL log the failure and continue operating with remaining sensors

### Requirement 19: Data Security

**User Story:** As a greenhouse operator, I want my data to be secure, so that sensitive operational information is protected.

#### Acceptance Criteria

1. THE System SHALL require authentication for all API endpoints except health check endpoints
2. WHEN data is stored in InfluxDB, THE System SHALL encrypt data at rest using AES-256 encryption
3. WHEN data is transmitted between components, THE System SHALL use TLS 1.2 or higher for encryption in transit
4. WHEN an authentication attempt fails three times, THE System SHALL temporarily lock the account for 15 minutes

### Requirement 20: Mobile Application Offline Support

**User Story:** As a greenhouse operator, I want the mobile app to work offline, so that I can view data and queue commands even without network connectivity.

#### Acceptance Criteria

1. WHEN the mobile application loses network connectivity, THE System SHALL continue displaying the last synchronized data
2. WHEN an operator issues a command while offline, THE System SHALL queue the command for transmission when connectivity is restored
3. WHEN network connectivity is restored, THE System SHALL synchronize queued commands and fetch updated data within 10 seconds
4. WHEN offline data is displayed, THE System SHALL indicate the age of the data and offline status to the operator
