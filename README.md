# Haunted Greenhouse 🌱👻

A smart greenhouse with real-time IoT monitoring, AI-based alerts, image analysis, and control automation.

## Architecture

```
IoT Devices (Simulated)
    ↓ MQTT Publish
Mosquitto MQTT Broker
    ↓ Subscribe
Backend (NestJS)
    ├─ EnvironmentModule → Monitor sensors, trigger alerts
    ├─ IrrigationModule → Automated water management
    ├─ PlantHealthModule → AI-based plant analysis
    ├─ AnalyticsModule → Predictive insights
    └─ SecurityModule → Security monitoring
    ↓ Store
InfluxDB2 (Time-series data)
    ↓ Query
Dashboard & Mobile App
```

## Features

### EnvironmentModule
- 9 sensor types: air/soil temperature, humidity, CO2, light, moisture, pH, air quality
- Real-time MQTT data ingestion
- Alert system with configurable thresholds
- Historical data queries
- WebSocket streaming to dashboard

### IrrigationModule
- Automatic irrigation triggered by low soil moisture
- Manual control via REST API
- Water flow and reservoir monitoring
- Safety interlocks (max duration, min intervals)
- Usage tracking and analytics

### Device Simulator
- Simulates 4 IoT devices publishing to MQTT
- Realistic sensor data with variations
- Test scenarios: temperature spike, low moisture, sensor failure
- Configurable intervals and scenarios

## Quick Start

### Prerequisites
- **Docker & Docker Compose** - For MQTT broker and InfluxDB
- **Node.js 18+** - For backend and simulator
- **npm** - Package manager (comes with Node.js)
- **Git** - Version control

**Optional**:
- **mosquitto-clients** - For testing MQTT (Linux: `apt-get install mosquitto-clients`, Mac: `brew install mosquitto`)
- **MQTT Explorer** - GUI tool for monitoring MQTT traffic (http://mqtt-explorer.com/)
- **Kotlin & Android Studio** - For mobile app (future)

### 1. Start Infrastructure

```bash
# Start MQTT broker and InfluxDB
docker-compose up -d

# Verify services are running
docker-compose ps

# View logs
docker-compose logs -f
```

### 2. Access Services

- **MQTT Broker**: `mqtt://localhost:1883`
- **MQTT WebSocket**: `ws://localhost:9001`
- **InfluxDB UI**: http://localhost:8086
  - Username: `admin`
  - Password: `adminpassword`
  - Org: `haunted-greenhouse`
  - Bucket: `sensor-data`

### 3. Setup Backend

```bash
cd backend
npm install
cp ../.env.example .env  # Edit with your settings
npm run start:dev
```

### 4. Run Device Simulator

```bash
cd simulator
npm install
npm start

# Run specific scenario
npm start -- --scenario temperature-spike
```

### 5. Test MQTT

```bash
# Subscribe to all topics (requires mosquitto-clients)
mosquitto_sub -h localhost -p 1883 -t "greenhouse/#" -v

# Publish test message
mosquitto_pub -h localhost -p 1883 -t "greenhouse/test" -m "Hello"
```

## Project Structure

```
.
├── .kiro/                      # Kiro specs and steering
│   ├── specs/                  # Feature specifications
│   └── steering/               # Project standards
├── backend/                    # NestJS backend
│   └── src/
│       ├── modules/
│       │   ├── environment/    # Sensor monitoring
│       │   ├── irrigation/     # Water management
│       │   ├── plant-health/   # AI analysis
│       │   ├── analytics/      # Predictions
│       │   └── security/       # Security monitoring
│       └── common/
│           └── services/
│               ├── mqtt/       # MQTT client
│               ├── influxdb/   # InfluxDB client
│               └── alerts/     # Alert service
├── simulator/                  # IoT device simulator
├── mobile/                     # Android app (Kotlin)
├── mqtt/                       # MQTT broker config
│   ├── config/
│   ├── data/                   # Persistence (gitignored)
│   └── log/                    # Logs (gitignored)
├── docker-compose.yml          # Infrastructure
└── .env                        # Environment variables
```

## MQTT Topics

### Sensor Data (Devices → Backend)
```
greenhouse/sensors/{deviceId}/{sensorType}
greenhouse/sensors/{deviceId}/batch
```

### Alerts (Backend → Modules)
```
greenhouse/alerts/temperature_high
greenhouse/alerts/temperature_low
greenhouse/alerts/low_soil_moisture
greenhouse/alerts/low_reservoir
```

### Commands (Backend → Actuators)
```
greenhouse/irrigation/{zone}/command
greenhouse/commands/{deviceId}/calibrate
```

### Status Updates
```
greenhouse/status/sensors
greenhouse/irrigation/{zone}/status
```

## Development

### Backend Development
```bash
cd backend
npm run start:dev     # Development mode with hot reload
npm run test          # Run tests
npm run test:watch    # Watch mode
npm run lint          # Lint code
```

### Simulator Development
```bash
cd simulator
npm start                              # Normal operation
npm start -- --scenario temp-spike     # Temperature spike test
npm start -- --verbose                 # Verbose logging
npm start -- --duration 10             # Run for 10 minutes
```

### View MQTT Traffic
```bash
# All topics
mosquitto_sub -h localhost -p 1883 -t "#" -v

# Sensor data only
mosquitto_sub -h localhost -p 1883 -t "greenhouse/sensors/#" -v

# Alerts only
mosquitto_sub -h localhost -p 1883 -t "greenhouse/alerts/#" -v
```

## Specifications

Detailed specifications are in `.kiro/specs/`:
- `haunted-greenhouse-requirements.md` - Overall project requirements
- `environment-module.md` - Environment monitoring module
- `irrigation-module.md` - Irrigation control module
- `device-simulator.md` - IoT device simulator
- `mqtt-broker-setup.md` - MQTT broker configuration

## Testing

### Test Flow: Low Moisture → Irrigation
1. Start all services (Docker, backend, simulator)
2. Run simulator with low moisture scenario:
   ```bash
   npm start -- --scenario low-moisture
   ```
3. Watch for:
   - Soil moisture drops below 20%
   - Alert published to `greenhouse/alerts/low_soil_moisture`
   - IrrigationModule receives alert
   - Irrigation command published to `greenhouse/irrigation/zone-a/command`
   - Water flow monitoring begins

### Monitor with MQTT Explorer
1. Download MQTT Explorer: http://mqtt-explorer.com/
2. Connect to `localhost:1883`
3. View all topics in real-time

## Troubleshooting

### MQTT Connection Issues
```bash
# Check if broker is running
docker-compose ps

# Check logs
docker-compose logs mosquitto

# Test connection
mosquitto_sub -h localhost -p 1883 -t "test" -v
```

### InfluxDB Issues
```bash
# Check if running
docker-compose ps influxdb

# View logs
docker-compose logs influxdb

# Access UI
open http://localhost:8086
```

### Backend Issues
```bash
# Check environment variables
cat backend/.env

# View logs
cd backend
npm run start:dev
```

## Production Deployment

### Enable MQTT Authentication
1. Create password file:
   ```bash
   docker exec -it haunted-greenhouse-mqtt mosquitto_passwd -c /mosquitto/config/passwd greenhouse
   ```
2. Update `mosquitto.conf`:
   ```conf
   password_file /mosquitto/config/passwd
   allow_anonymous false
   ```
3. Restart broker:
   ```bash
   docker-compose restart mosquitto
   ```

### Enable TLS/SSL
See `mqtt-broker-setup.md` for TLS configuration.

## Contributing

1. Review specs in `.kiro/specs/`
2. Follow project standards in `.kiro/steering/project-standards.md`
3. Write tests for new features
4. Update documentation

## License

MIT

## Team

Built for the Haunted Greenhouse hackathon 🎃
