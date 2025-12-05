# Requirements Document

## Introduction

The Haunted Greenhouse Web Frontend is a Next.js-based web application that provides a comprehensive dashboard for monitoring and controlling a smart greenhouse system. The application connects to the existing NestJS backend API to display real-time sensor data, manage irrigation systems, analyze plant health through image uploads, view predictive analytics, and monitor security events. The frontend replaces the originally planned Android mobile application while maintaining all the same functionality.

## Glossary

- **WebApp**: The Next.js web application frontend
- **Backend**: The existing NestJS REST API server
- **Zone**: A distinct area within the greenhouse with its own sensors, irrigation, and environmental controls
- **Zone Dashboard**: The main view displaying real-time metrics for a specific zone
- **Zone Management**: The primary interface showing all zones and their summary status
- **Sensor**: IoT device that measures environmental conditions within a zone
- **Actuator**: IoT device that performs actions (e.g., irrigation valve) within a zone
- **InfluxDB**: Time-series database storing historical sensor data per zone
- **MQTT**: Message protocol for real-time sensor communication
- **WebSocket**: Real-time bidirectional communication protocol
- **Alert**: Notification triggered when conditions exceed thresholds in any zone
- **Off-Hours**: Configurable time period for security monitoring

## Requirements

### Requirement 1: Zone Management Interface

**User Story:** As a greenhouse operator, I want to view all zones in my greenhouse at a glance, so that I can quickly assess the overall status and select a zone for detailed monitoring.

#### Acceptance Criteria

1. WHEN the WebApp loads after authentication THEN the System SHALL display a grid of all configured zones
2. WHEN displaying each zone card THEN the System SHALL show zone name, current temperature, humidity, and overall health status
3. WHEN a zone has active alerts THEN the System SHALL display an alert indicator on the zone card
4. WHEN the user clicks on a zone card THEN the System SHALL navigate to that zone's detailed dashboard
5. WHEN zone data updates THEN the System SHALL refresh the zone cards within 2 seconds

### Requirement 2: Real-Time Zone Dashboard

**User Story:** As a greenhouse operator, I want to view real-time environmental data for a specific zone, so that I can monitor current conditions in that area.

#### Acceptance Criteria

1. WHEN the user selects a zone THEN the System SHALL display current values for temperature_air, temperature_soil, humidity_air, humidity_soil, light_intensity, co2_level, soil_moisture, soil_ph, and air_quality for that zone
2. WHEN sensor data updates for the selected zone THEN the System SHALL refresh the displayed values within 2 seconds
3. WHEN a sensor value exceeds a threshold THEN the System SHALL highlight the metric with a visual indicator
4. WHEN the user views the zone dashboard THEN the System SHALL display the zone name and timestamp of the last data update
5. WHEN network connectivity is lost THEN the System SHALL display an offline indicator

### Requirement 3: Historical Data Visualization Per Zone

**User Story:** As a greenhouse operator, I want to view historical trends for environmental metrics in a specific zone, so that I can identify patterns and optimize growing conditions for that area.

#### Acceptance Criteria

1. WHEN the user selects a metric for a zone THEN the System SHALL display a time-series chart for that zone for the last 24 hours
2. WHEN the user adjusts the time range THEN the System SHALL update the chart to show data for the selected zone and period
3. WHEN the chart displays data THEN the System SHALL include axis labels, legend, and tooltips showing exact values
4. WHEN multiple metrics are selected THEN the System SHALL display them on the same chart with different colors for the selected zone
5. WHEN historical data is unavailable for the zone THEN the System SHALL display an appropriate message

### Requirement 4: Irrigation Control Per Zone

**User Story:** As a greenhouse operator, I want to manually start and stop irrigation for a specific zone, so that I can water plants in that area when needed.

#### Acceptance Criteria

1. WHEN the user clicks the start irrigation button for a zone THEN the System SHALL send a command to the Backend to start irrigation for that zone
2. WHEN irrigation starts successfully for a zone THEN the System SHALL display the irrigation status as "active" for that zone
3. WHEN the user clicks the stop irrigation button for a zone THEN the System SHALL send a command to the Backend to stop irrigation for that zone
4. WHEN irrigation stops for a zone THEN the System SHALL update the status to "inactive" for that zone
5. WHEN the reservoir level for a zone is below 10% THEN the System SHALL disable the start irrigation button for that zone and display a warning

### Requirement 5: Plant Health Image Upload Per Zone

**User Story:** As a greenhouse operator, I want to upload plant images for disease detection in a specific zone, so that I can identify health issues early in that area.

#### Acceptance Criteria

1. WHEN the user selects an image file for a zone THEN the System SHALL validate the file type is JPEG or PNG
2. WHEN the user uploads an image for a zone THEN the System SHALL send the image and zone identifier to the Backend for analysis
3. WHEN analysis completes THEN the System SHALL display the disease detection results with confidence scores for that zone
4. WHEN diseases are detected THEN the System SHALL display treatment recommendations for that zone
5. WHEN the upload fails THEN the System SHALL display an error message and allow retry

### Requirement 6: Plant Growth Tracking Per Zone

**User Story:** As a greenhouse operator, I want to view plant growth metrics over time for a specific zone, so that I can track development progress in that area.

#### Acceptance Criteria

1. WHEN the user navigates to the growth tracking page for a zone THEN the System SHALL display a list of tracked plants in that zone
2. WHEN the user selects a plant THEN the System SHALL display growth metrics including height, leaf_count, and health_score for that plant
3. WHEN growth data is available THEN the System SHALL display a chart showing metric changes over time for that zone
4. WHEN the user views growth data THEN the System SHALL include comparison to expected growth rates
5. WHEN no growth data exists for the zone THEN the System SHALL display a message prompting the user to upload images

### Requirement 7: Predictive Analytics Per Zone

**User Story:** As a greenhouse operator, I want to view predictive insights for environmental trends in a specific zone, so that I can proactively adjust conditions in that area.

#### Acceptance Criteria

1. WHEN the user navigates to the analytics page for a zone THEN the System SHALL display predictions for temperature_air, humidity_air, and light_intensity for that zone
2. WHEN predictions are displayed THEN the System SHALL include confidence intervals for each forecast for that zone
3. WHEN predicted values exceed thresholds for a zone THEN the System SHALL display proactive alerts for that zone
4. WHEN the user views predictions THEN the System SHALL show the forecast period (next 6-24 hours) for the selected zone
5. WHEN predictions are unavailable for a zone THEN the System SHALL display the last update time and reason

### Requirement 8: Optimization Recommendations Per Zone

**User Story:** As a greenhouse operator, I want to receive optimization recommendations for a specific zone, so that I can improve yield and efficiency in that area.

#### Acceptance Criteria

1. WHEN the user views the recommendations page for a zone THEN the System SHALL display a list of optimization suggestions for that zone
2. WHEN recommendations are displayed THEN the System SHALL include category, priority, expected impact, and action items for that zone
3. WHEN the user clicks a recommendation THEN the System SHALL expand to show detailed information
4. WHEN recommendations are generated THEN the System SHALL sort them by priority (high, medium, low)
5. WHEN no recommendations exist for a zone THEN the System SHALL display a message indicating optimal conditions

### Requirement 9: Security Monitoring

**User Story:** As a greenhouse operator, I want to view security events and access point status across all zones, so that I can monitor for unauthorized access.

#### Acceptance Criteria

1. WHEN the user navigates to the security page THEN the System SHALL display current status of all doors and windows across all zones
2. WHEN an access point changes state THEN the System SHALL update the display within 1 second
3. WHEN the user views security logs THEN the System SHALL display motion events, door events, and window events with timestamps and zone information
4. WHEN the user filters security logs THEN the System SHALL allow filtering by event type, date range, location, and zone
5. WHEN a motion event occurs during off-hours THEN the System SHALL display a prominent alert notification with zone information

### Requirement 10: Off-Hours Configuration

**User Story:** As a greenhouse operator, I want to configure off-hours monitoring periods, so that I receive motion alerts only during specified times.

#### Acceptance Criteria

1. WHEN the user navigates to security settings THEN the System SHALL display the current off-hours configuration
2. WHEN the user enables off-hours monitoring THEN the System SHALL allow setting start hour and end hour (0-23)
3. WHEN the user saves the configuration THEN the System SHALL send the settings to the Backend
4. WHEN the configuration is saved successfully THEN the System SHALL display a confirmation message
5. WHEN the configuration is invalid THEN the System SHALL display validation errors

### Requirement 11: Alert Management

**User Story:** As a greenhouse operator, I want to view and manage alerts across all zones, so that I can respond to critical conditions.

#### Acceptance Criteria

1. WHEN an alert is triggered for any zone THEN the System SHALL display a notification in the UI with zone information
2. WHEN the user views the alerts page THEN the System SHALL display all active and recent alerts with zone identifiers
3. WHEN the user clicks an alert THEN the System SHALL show detailed information including timestamp, type, affected metrics, and zone
4. WHEN the user acknowledges an alert THEN the System SHALL mark it as read
5. WHEN multiple alerts exist THEN the System SHALL sort them by severity, timestamp, and allow filtering by zone

### Requirement 12: Responsive Design

**User Story:** As a greenhouse operator, I want the application to work on different screen sizes, so that I can access it from desktop, tablet, or mobile devices.

#### Acceptance Criteria

1. WHEN the WebApp is viewed on desktop THEN the System SHALL display a multi-column layout
2. WHEN the WebApp is viewed on tablet THEN the System SHALL adapt to a two-column layout
3. WHEN the WebApp is viewed on mobile THEN the System SHALL display a single-column layout with collapsible sections
4. WHEN the user rotates a mobile device THEN the System SHALL adjust the layout appropriately
5. WHEN touch gestures are used THEN the System SHALL respond to swipe, tap, and pinch interactions

### Requirement 13: Authentication and Authorization

**User Story:** As a system administrator, I want users to authenticate before accessing the application, so that greenhouse data remains secure.

#### Acceptance Criteria

1. WHEN an unauthenticated user accesses the WebApp THEN the System SHALL redirect to a login page
2. WHEN a user submits valid credentials THEN the System SHALL authenticate with the Backend and grant access to the zone management interface
3. WHEN authentication fails THEN the System SHALL display an error message
4. WHEN a user session expires THEN the System SHALL redirect to the login page
5. WHEN a user logs out THEN the System SHALL clear the session and redirect to the login page

### Requirement 14: Data Refresh and Caching

**User Story:** As a greenhouse operator, I want data to refresh automatically for each zone, so that I always see current information without manual reloading.

#### Acceptance Criteria

1. WHEN a zone dashboard is active THEN the System SHALL fetch sensor data for that zone every 5 seconds
2. WHEN historical data is requested for a zone THEN the System SHALL cache the results for 60 seconds
3. WHEN predictions are displayed for a zone THEN the System SHALL refresh them every 6 hours
4. WHEN the user navigates between zones THEN the System SHALL preserve cached data to improve performance
5. WHEN the user manually refreshes THEN the System SHALL bypass the cache and fetch fresh data for the current zone

### Requirement 15: Error Handling and User Feedback

**User Story:** As a greenhouse operator, I want clear error messages and loading indicators, so that I understand the application state.

#### Acceptance Criteria

1. WHEN data is loading THEN the System SHALL display a loading spinner or skeleton screen
2. WHEN an API request fails THEN the System SHALL display a user-friendly error message
3. WHEN a network error occurs THEN the System SHALL provide a retry option
4. WHEN an action succeeds THEN the System SHALL display a success notification
5. WHEN form validation fails THEN the System SHALL highlight invalid fields with error messages

### Requirement 16: Weather Integration Display

**User Story:** As a greenhouse operator, I want to view external weather data, so that I can correlate it with greenhouse conditions.

#### Acceptance Criteria

1. WHEN the user views the weather widget THEN the System SHALL display current temperature, humidity, and conditions
2. WHEN weather data is available THEN the System SHALL show a 5-day forecast
3. WHEN the user clicks the weather widget THEN the System SHALL expand to show detailed information
4. WHEN weather data is stale THEN the System SHALL display the last update time
5. WHEN weather data is unavailable THEN the System SHALL display an appropriate message

### Requirement 17: Spooky Retro Game Aesthetic UI

**User Story:** As a greenhouse operator, I want the interface to have a spooky retro game aesthetic with haunted/Halloween themes, so that monitoring the greenhouse is visually engaging and matches the "Haunted Greenhouse" concept.

#### Acceptance Criteria

1. WHEN the WebApp renders THEN the System SHALL use pixel art with spooky elements (ghosts, skulls, cobwebs, fog) throughout the zone management and zone-specific interfaces
2. WHEN displaying UI components THEN the System SHALL apply a dark color palette with neon greens, toxic purples, and blood reds
3. WHEN animations occur THEN the System SHALL use smooth transitions with haunted effects (floating, glowing, flickering)
4. WHEN text is displayed THEN the System SHALL use fonts that evoke both retro gaming and spooky themes while maintaining readability
5. WHEN the user interacts with elements THEN the System SHALL provide satisfying visual feedback with eerie glows and optional spooky sound effects
