# Quick Start Guide

## Setup & Run

### 1. Start Infrastructure (MQTT + InfluxDB)

```bash
# Start Docker services
docker-compose up -d

# Verify services are running
docker-compose ps

# Expected output:
# haunted-greenhouse-mqtt      running   0.0.0.0:1883->1883/tcp, 0.0.0.0:9001->9001/tcp
# haunted-greenhouse-influxdb  running   0.0.0.0:8086->8086/tcp
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Start Backend (NestJS)

```bash
cd backend
npm run start:dev
```

Expected output:
```
[Nest] INFO [MqttClientService] Connecting to MQTT broker: mqtt://localhost:1883
[Nest] INFO [MqttClientService] Successfully connected to MQTT broker
[Nest] INFO [InfluxDbService] Connecting to InfluxDB: http://localhost:8086
[Nest] INFO [InfluxDbService] InfluxDB client initialized
[Nest] INFO [EnvironmentMqttService] Subscribed to sensor MQTT topics
[Nest] INFO [NestApplication] Nest application successfully started
```

### 4. Install Simulator Dependencies

```bash
cd simulator
npm install
```

### 5. Run Device Simulator

```bash
cd simulator
npm start
```

Expected output:
```
[Simulator] Connecting to MQTT broker: mqtt://localhost:1883
[Simulator] Connected successfully
[Simulator] Starting 4 devices...

[sensor-001] Publishing every 30s
[soil-sensor-01] Publishing every 60s
[soil-sensor-02] Publishing every 60s
[sensor-002] Publishing every 45s
[Scenario] Running normal operation
```

### 6. Watch the Magic Happen! ✨

In the backend terminal, you should see:
```
[EnvironmentService] Processing sensor reading: sensor-001 - temperature_air: 24.5
[EnvironmentService] Processing sensor reading: sensor-001 - humidity_air: 62.3
[EnvironmentService] Processing sensor reading: sensor-001 - co2_level: 450
...
```

## Test Scenarios

### Temperature Spike (Triggers Alert)

```bash
cd simulator
npm start -- --scenario temp-spike
```

After 2 minutes, temperature will spike above 35°C and trigger an alert:
```
[Scenario] TRIGGERING TEMPERATURE SPIKE!
[sensor-001] Temperature spike: 32°C
[sensor-001] Temperature spike: 34°C
[sensor-001] Temperature spike: 36°C  ← Alert triggers!
```

Backend will show:
```
[EnvironmentService] ALERT: temperature_air_high - Air temperature 36°C exceeds safe limit of 35°C
```

### Low Soil Moisture (Triggers Irrigation)

```bash
cd simulator
npm start -- --scenario low-moisture
```

After 1 minute, soil moisture drops below 20%:
```
[Scenario] TRIGGERING LOW SOIL MOISTURE!
[soil-sensor-01] Soil moisture dropping: 35%
[soil-sensor-01] Soil moisture dropping: 30%
[soil-sensor-01] Soil moisture dropping: 25%
[soil-sensor-01] Soil moisture dropping: 20%
[soil-sensor-01] Soil moisture dropping: 15%  ← Alert triggers!
```

Backend will show:
```
[EnvironmentService] ALERT: soil_moisture_low - Soil moisture 15% below threshold of 20% - irrigation recommended
```

## Monitor MQTT Traffic

### Option 1: Command Line (requires mosquitto-clients)

```bash
# Subscribe to all topics
mosquitto_sub -h localhost -p 1883 -t "greenhouse/#" -v

# Subscribe to sensor data only
mosquitto_sub -h localhost -p 1883 -t "greenhouse/sensors/#" -v

# Subscribe to alerts only
mosquitto_sub -h localhost -p 1883 -t "greenhouse/alerts/#" -v
```

### Option 2: MQTT Explorer (GUI)

1. Download: http://mqtt-explorer.com/
2. Connect to `localhost:1883`
3. View all topics in real-time

## Access InfluxDB

1. Open browser: http://localhost:8086
2. Login:
   - Username: `admin`
   - Password: `adminpassword`
3. Navigate to Data Explorer
4. Query sensor data:
   ```flux
   from(bucket: "sensor-data")
     |> range(start: -1h)
     |> filter(fn: (r) => r["_measurement"] == "sensor_readings")
   ```

## Troubleshooting

### MQTT Broker Not Running

```bash
docker-compose ps
# If not running:
docker-compose up -d mosquitto
```

### Backend Can't Connect to MQTT

Check `.env` file exists in project root:
```bash
cat .env
# Should show MQTT_BROKER_URL=mqtt://localhost:1883
```

### No Data in InfluxDB

1. Check backend is running and connected
2. Check simulator is publishing
3. View backend logs for errors

### Port Already in Use

```bash
# Check what's using port 1883
netstat -ano | findstr :1883  # Windows
lsof -i :1883                 # Mac/Linux

# Stop conflicting service or change port in docker-compose.yml
```

## Next Steps

1. ✅ EnvironmentModule is working!
2. 🚧 Implement IrrigationModule (subscribes to low_soil_moisture alerts)
3. 🚧 Add WebSocket Gateway for real-time dashboard
4. 🚧 Implement PlantHealthModule (AI image analysis)
5. 🚧 Build Android mobile app

## Useful Commands

```bash
# View all logs
docker-compose logs -f

# View MQTT broker logs only
docker-compose logs -f mosquitto

# Restart services
docker-compose restart

# Stop everything
docker-compose down

# Clean slate (removes volumes)
docker-compose down -v
```

## Architecture Flow

```
IoT Devices (Simulator)
    ↓ publish: greenhouse/sensors/{deviceId}/{sensorType}
MQTT Broker (Mosquitto)
    ↓ subscribe
EnvironmentModule (NestJS)
    ├─ Validate sensor data
    ├─ Store to InfluxDB2
    ├─ Check alert thresholds
    └─ Publish alerts: greenhouse/alerts/{alertType}
        ↓
IrrigationModule (Coming Next!)
```

Happy greenhouse monitoring! 🌱
