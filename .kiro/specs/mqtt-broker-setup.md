---
title: MQTT Broker Setup - Mosquitto on Docker
status: ready-for-implementation
created: 2025-11-24
---

# MQTT Broker Setup

## Overview
Set up Eclipse Mosquitto MQTT broker using Docker for local development and testing. The broker will handle all pub/sub communication between IoT devices, backend modules, and actuators.

## Architecture
```
Docker Container: Mosquitto MQTT Broker
    ├─ Port 1883: MQTT (unencrypted, local dev)
    ├─ Port 9001: WebSocket (for browser clients)
    └─ Volume: ./mqtt/config, ./mqtt/data, ./mqtt/log

Clients:
    ├─ IoT Device Simulator
    ├─ EnvironmentModule (NestJS)
    ├─ IrrigationModule (NestJS)
    └─ Dashboard (WebSocket)
```

## Docker Setup

### docker-compose.yml
```yaml
version: '3.8'

services:
  mosquitto:
    image: eclipse-mosquitto:2.0
    container_name: haunted-greenhouse-mqtt
    restart: unless-stopped
    ports:
      - "1883:1883"    # MQTT
      - "9001:9001"    # WebSocket
    volumes:
      - ./mqtt/config/mosquitto.conf:/mosquitto/config/mosquitto.conf
      - ./mqtt/data:/mosquitto/data
      - ./mqtt/log:/mosquitto/log
    networks:
      - greenhouse-network

  influxdb:
    image: influxdb:2.7
    container_name: haunted-greenhouse-influxdb
    restart: unless-stopped
    ports:
      - "8086:8086"
    environment:
      - DOCKER_INFLUXDB_INIT_MODE=setup
      - DOCKER_INFLUXDB_INIT_USERNAME=admin
      - DOCKER_INFLUXDB_INIT_PASSWORD=adminpassword
      - DOCKER_INFLUXDB_INIT_ORG=haunted-greenhouse
      - DOCKER_INFLUXDB_INIT_BUCKET=sensor-data
      - DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=my-super-secret-auth-token
    volumes:
      - influxdb-data:/var/lib/influxdb2
      - influxdb-config:/etc/influxdb2
    networks:
      - greenhouse-network

networks:
  greenhouse-network:
    driver: bridge

volumes:
  influxdb-data:
  influxdb-config:
```

### Mosquitto Configuration

#### mqtt/config/mosquitto.conf
```conf
# Mosquitto Configuration for Haunted Greenhouse

# General Settings
persistence true
persistence_location /mosquitto/data/
log_dest file /mosquitto/log/mosquitto.log
log_dest stdout
log_type all

# Default Listener (MQTT)
listener 1883
protocol mqtt
allow_anonymous true

# WebSocket Listener (for browser clients)
listener 9001
protocol websockets
allow_anonymous true

# Security (for production, enable authentication)
# password_file /mosquitto/config/passwd
# allow_anonymous false

# Access Control (optional)
# acl_file /mosquitto/config/acl.conf

# Connection Settings
max_connections -1
max_queued_messages 1000
message_size_limit 0

# Persistence Settings
autosave_interval 300
autosave_on_changes false

# Logging
log_timestamp true
log_timestamp_format %Y-%m-%dT%H:%M:%S

# QoS Settings
max_inflight_messages 20
max_queued_messages 1000
```

### Optional: Authentication Setup

#### mqtt/config/passwd (for production)
```bash
# Create password file
docker exec -it haunted-greenhouse-mqtt mosquitto_passwd -c /mosquitto/config/passwd greenhouse

# Add more users
docker exec -it haunted-greenhouse-mqtt mosquitto_passwd /mosquitto/config/passwd device-simulator
docker exec -it haunted-greenhouse-mqtt mosquitto_passwd /mosquitto/config/passwd backend
```

#### mqtt/config/acl.conf (Access Control List)
```conf
# Admin user - full access
user admin
topic readwrite #

# Backend services - full access
user backend
topic readwrite greenhouse/#

# Device simulator - can publish sensor data
user device-simulator
topic write greenhouse/sensors/#
topic read greenhouse/commands/#

# IoT devices - limited access
pattern read greenhouse/commands/%u/#
pattern write greenhouse/sensors/%u/#
```

## Directory Structure
```
project-root/
  ├── docker-compose.yml
  ├── mqtt/
  │   ├── config/
  │   │   ├── mosquitto.conf
  │   │   ├── passwd (optional)
  │   │   └── acl.conf (optional)
  │   ├── data/              # Persistence data (auto-created)
  │   └── log/               # Log files (auto-created)
  ├── backend/
  ├── simulator/
  └── mobile/
```

## Setup Instructions

### 1. Create Directory Structure
```bash
# Create MQTT directories
mkdir -p mqtt/config mqtt/data mqtt/log

# Set permissions (Linux/Mac)
chmod -R 755 mqtt
```

### 2. Create Configuration Files
Create `docker-compose.yml` and `mqtt/config/mosquitto.conf` as shown above.

### 3. Start Services
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f mosquitto
docker-compose logs -f influxdb
```

### 4. Verify MQTT Broker
```bash
# Test connection (requires mosquitto-clients)
# Install: apt-get install mosquitto-clients (Linux) or brew install mosquitto (Mac)

# Subscribe to all topics
mosquitto_sub -h localhost -p 1883 -t "greenhouse/#" -v

# Publish test message
mosquitto_pub -h localhost -p 1883 -t "greenhouse/test" -m "Hello MQTT"
```

### 5. Verify InfluxDB
```bash
# Access InfluxDB UI
# Open browser: http://localhost:8086
# Login: admin / adminpassword
# Org: haunted-greenhouse
# Bucket: sensor-data
```

## Environment Variables

### .env (project root)
```env
# MQTT Broker
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=greenhouse
MQTT_PASSWORD=your-secure-password
MQTT_CLIENT_ID_PREFIX=haunted-greenhouse

# InfluxDB
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=my-super-secret-auth-token
INFLUXDB_ORG=haunted-greenhouse
INFLUXDB_BUCKET=sensor-data

# Backend
NODE_ENV=development
PORT=3000
```

## MQTT Topics Structure

### Sensor Data (Published by Devices)
```
greenhouse/sensors/{deviceId}/{sensorType}
greenhouse/sensors/{deviceId}/batch
```

### Alerts (Published by EnvironmentModule)
```
greenhouse/alerts/temperature_high
greenhouse/alerts/temperature_low
greenhouse/alerts/low_soil_moisture
greenhouse/alerts/high_humidity
greenhouse/alerts/low_reservoir
```

### Commands (Published by Backend Modules)
```
greenhouse/irrigation/{zone}/command
greenhouse/commands/{deviceId}/calibrate
greenhouse/commands/{deviceId}/restart
```

### Status Updates
```
greenhouse/status/sensors
greenhouse/irrigation/{zone}/status
greenhouse/irrigation/reservoir/level
```

## Monitoring & Debugging

### View Live MQTT Traffic
```bash
# Subscribe to all topics with verbose output
mosquitto_sub -h localhost -p 1883 -t "#" -v

# Subscribe to specific topic pattern
mosquitto_sub -h localhost -p 1883 -t "greenhouse/sensors/#" -v
mosquitto_sub -h localhost -p 1883 -t "greenhouse/alerts/#" -v
```

### Check Mosquitto Logs
```bash
# Follow logs
docker-compose logs -f mosquitto

# View last 100 lines
docker-compose logs --tail=100 mosquitto
```

### MQTT Client Tools
- **MQTT Explorer**: GUI client for Windows/Mac/Linux
  - Download: http://mqtt-explorer.com/
  - Connect to: localhost:1883
  
- **MQTTX**: Cross-platform MQTT client
  - Download: https://mqttx.app/

## Docker Commands

### Start/Stop Services
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart specific service
docker-compose restart mosquitto

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### View Container Status
```bash
# List running containers
docker-compose ps

# View resource usage
docker stats haunted-greenhouse-mqtt
```

### Access Container Shell
```bash
# Access Mosquitto container
docker exec -it haunted-greenhouse-mqtt sh

# Access InfluxDB container
docker exec -it haunted-greenhouse-influxdb bash
```

## Troubleshooting

### Issue: Connection Refused
```bash
# Check if container is running
docker-compose ps

# Check if port is listening
netstat -an | grep 1883  # Linux/Mac
netstat -an | findstr 1883  # Windows

# Check firewall rules
# Ensure port 1883 is not blocked
```

### Issue: Permission Denied
```bash
# Fix permissions on Linux/Mac
sudo chown -R 1883:1883 mqtt/data mqtt/log

# Or use current user
sudo chown -R $USER:$USER mqtt/
```

### Issue: Logs Not Appearing
```bash
# Check log configuration in mosquitto.conf
# Ensure log_dest is set correctly

# View container logs directly
docker logs haunted-greenhouse-mqtt
```

## Production Considerations

### Enable Authentication
1. Uncomment authentication lines in `mosquitto.conf`
2. Create password file
3. Update client configurations with credentials

### Enable TLS/SSL
```conf
# Add to mosquitto.conf
listener 8883
protocol mqtt
cafile /mosquitto/config/ca.crt
certfile /mosquitto/config/server.crt
keyfile /mosquitto/config/server.key
require_certificate false
```

### Persistent Sessions
```conf
# Ensure persistence is enabled
persistence true
persistent_client_expiration 1h
```

### Resource Limits
```yaml
# Add to docker-compose.yml
services:
  mosquitto:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

## Testing Checklist
- [ ] Docker containers start successfully
- [ ] MQTT broker accepts connections on port 1883
- [ ] WebSocket listener works on port 9001
- [ ] Can publish and subscribe to topics
- [ ] InfluxDB UI accessible at http://localhost:8086
- [ ] Logs are being written to mqtt/log/
- [ ] Data persists after container restart
- [ ] Multiple clients can connect simultaneously

## Next Steps
1. Start Docker services
2. Test MQTT connectivity
3. Implement MQTT client in NestJS backend
4. Create device simulator
5. Test end-to-end message flow
