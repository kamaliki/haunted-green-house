---
title: IoT Device Simulator - MQTT Publisher
status: ready-for-implementation
created: 2025-11-24
parent: environment-module.md
---

# IoT Device Simulator

## Overview
A Node.js/TypeScript script that simulates IoT sensor devices publishing realistic sensor data to an MQTT broker. This allows testing the EnvironmentModule without physical hardware.

## Purpose
- Simulate multiple sensor devices
- Generate realistic sensor readings with variations
- Publish data to MQTT broker at configurable intervals
- Simulate sensor failures and reconnections
- Test alert thresholds and edge cases

## Simulated Devices

### Device 1: Main Environmental Sensor
**Device ID**: `sensor-001`  
**Location**: Center of greenhouse  
**Sensors**:
- temperature_air (20-30°C, normal conditions)
- humidity_air (50-70%)
- co2_level (400-800 ppm)
- light_intensity (0-50000 lux, varies by time)
- air_quality (0-100)

**Publish Interval**: 30 seconds

### Device 2: Soil Sensor Zone A
**Device ID**: `soil-sensor-01`  
**Location**: Zone A (tomatoes)  
**Sensors**:
- temperature_soil (18-25°C)
- humidity_soil (60-80%)
- soil_moisture (15-85%, triggers irrigation at <20%)
- soil_ph (6.0-7.0)

**Publish Interval**: 60 seconds

### Device 3: Soil Sensor Zone B
**Device ID**: `soil-sensor-02`  
**Location**: Zone B (lettuce)  
**Sensors**:
- temperature_soil (16-22°C)
- humidity_soil (70-90%)
- soil_moisture (20-90%)
- soil_ph (6.5-7.5)

**Publish Interval**: 60 seconds

### Device 4: Secondary Environmental Sensor
**Device ID**: `sensor-002`  
**Location**: Near ventilation  
**Sensors**:
- temperature_air (18-28°C)
- humidity_air (45-75%)
- co2_level (350-900 ppm)

**Publish Interval**: 45 seconds

## Simulation Scenarios

### Normal Operation
- All sensors publish within normal ranges
- Small random variations (+/- 5%)
- Gradual changes over time

### Temperature Spike (Test Alert)
- After 2 minutes, temperature_air gradually increases
- Reaches 36°C to trigger high temperature alert
- Returns to normal after 1 minute

### Low Soil Moisture (Test Irrigation Trigger)
- After 3 minutes, soil_moisture drops below 20%
- Should trigger alert to IrrigationModule
- Simulates gradual increase after irrigation starts

### Sensor Failure
- After 5 minutes, one device stops publishing
- Should trigger sensor health alert
- Resumes after 2 minutes

### Night/Day Cycle
- Light intensity follows time-based pattern
- 0 lux during night hours
- Peak at midday

## MQTT Topics Used

### Published by Simulator
```
greenhouse/sensors/sensor-001/temperature_air
greenhouse/sensors/sensor-001/humidity_air
greenhouse/sensors/sensor-001/co2_level
greenhouse/sensors/sensor-001/light_intensity
greenhouse/sensors/sensor-001/air_quality
greenhouse/sensors/soil-sensor-01/temperature_soil
greenhouse/sensors/soil-sensor-01/humidity_soil
greenhouse/sensors/soil-sensor-01/soil_moisture
greenhouse/sensors/soil-sensor-01/soil_ph
greenhouse/sensors/soil-sensor-02/temperature_soil
greenhouse/sensors/soil-sensor-02/humidity_soil
greenhouse/sensors/soil-sensor-02/soil_moisture
greenhouse/sensors/soil-sensor-02/soil_ph
greenhouse/sensors/sensor-002/temperature_air
greenhouse/sensors/sensor-002/humidity_air
greenhouse/sensors/sensor-002/co2_level
```

### Subscribed by Simulator (for feedback)
```
greenhouse/commands/sensor-001/calibrate
greenhouse/commands/+/restart
```

## Implementation

### Project Structure
```
simulator/
  ├── src/
  │   ├── index.ts                    # Main entry point
  │   ├── mqtt-client.ts              # MQTT connection
  │   ├── devices/
  │   │   ├── base-device.ts          # Abstract device class
  │   │   ├── environmental-sensor.ts
  │   │   └── soil-sensor.ts
  │   ├── generators/
  │   │   ├── temperature.generator.ts
  │   │   ├── humidity.generator.ts
  │   │   ├── light.generator.ts
  │   │   └── soil.generator.ts
  │   ├── scenarios/
  │   │   ├── normal.scenario.ts
  │   │   ├── temperature-spike.scenario.ts
  │   │   ├── low-moisture.scenario.ts
  │   │   └── sensor-failure.scenario.ts
  │   └── config/
  │       └── devices.config.ts
  ├── package.json
  ├── tsconfig.json
  └── README.md
```

### Configuration
```typescript
// devices.config.ts
export const DEVICES = [
  {
    id: 'sensor-001',
    type: 'environmental',
    location: 'center',
    sensors: ['temperature_air', 'humidity_air', 'co2_level', 'light_intensity', 'air_quality'],
    interval: 30000,
  },
  {
    id: 'soil-sensor-01',
    type: 'soil',
    location: 'zone-a',
    sensors: ['temperature_soil', 'humidity_soil', 'soil_moisture', 'soil_ph'],
    interval: 60000,
  },
  // ... more devices
];

export const MQTT_CONFIG = {
  broker: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
  username: process.env.MQTT_USERNAME || 'greenhouse',
  password: process.env.MQTT_PASSWORD || 'password',
  clientId: 'device-simulator',
};
```

### Sample Device Class
```typescript
// base-device.ts
export abstract class BaseDevice {
  constructor(
    protected deviceId: string,
    protected location: string,
    protected mqttClient: MqttClient,
  ) {}

  abstract generateReading(sensorType: string): number;

  async publishReading(sensorType: string): Promise<void> {
    const value = this.generateReading(sensorType);
    const topic = `greenhouse/sensors/${this.deviceId}/${sensorType}`;
    const payload = {
      deviceId: this.deviceId,
      sensorType,
      value,
      unit: this.getUnit(sensorType),
      timestamp: new Date().toISOString(),
    };

    await this.mqttClient.publish(topic, JSON.stringify(payload), { qos: 1 });
    console.log(`[${this.deviceId}] Published ${sensorType}: ${value}`);
  }

  abstract getUnit(sensorType: string): string;
}
```

### Running the Simulator

```bash
# Install dependencies
cd simulator
npm install

# Run with default config
npm start

# Run specific scenario
npm start -- --scenario temperature-spike

# Run with custom broker
MQTT_BROKER_URL=mqtt://192.168.1.100:1883 npm start

# Run in verbose mode
npm start -- --verbose
```

## CLI Options
```
--scenario <name>     Run specific scenario (normal, temp-spike, low-moisture, failure)
--devices <ids>       Comma-separated device IDs to simulate
--interval <ms>       Override default publish interval
--duration <minutes>  Run for specified duration then exit
--verbose            Enable detailed logging
--broker <url>       MQTT broker URL
```

## Expected Output
```
[Simulator] Connecting to MQTT broker: mqtt://localhost:1883
[Simulator] Connected successfully
[Simulator] Starting 4 devices...
[sensor-001] Publishing every 30s
[soil-sensor-01] Publishing every 60s
[soil-sensor-02] Publishing every 60s
[sensor-002] Publishing every 45s

[sensor-001] Published temperature_air: 24.5
[sensor-001] Published humidity_air: 62.3
[sensor-001] Published co2_level: 450
[sensor-001] Published light_intensity: 15000
[sensor-001] Published air_quality: 85

[soil-sensor-01] Published temperature_soil: 22.1
[soil-sensor-01] Published humidity_soil: 75.5
[soil-sensor-01] Published soil_moisture: 45.2
[soil-sensor-01] Published soil_ph: 6.8

[Scenario] Temperature spike starting in 2 minutes...
```

## Testing Checklist
- [ ] All devices connect to MQTT broker
- [ ] Sensor readings are within valid ranges
- [ ] Data is published at correct intervals
- [ ] Temperature spike triggers alert
- [ ] Low soil moisture triggers irrigation alert
- [ ] Sensor failure is detected
- [ ] Devices reconnect after network interruption
- [ ] Batch publishing works correctly
- [ ] Light intensity follows day/night cycle

## Dependencies
```json
{
  "dependencies": {
    "mqtt": "^5.3.0",
    "dotenv": "^16.3.1",
    "commander": "^11.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "ts-node": "^10.9.0"
  }
}
```
