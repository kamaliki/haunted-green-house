# Setup Guide for Collaborators

This guide will help you set up the Haunted Greenhouse project on your local machine.

## System Requirements

### Required Software
- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
  - Download: https://www.docker.com/products/docker-desktop
  - Minimum version: 20.x
- **Node.js** 18 or higher
  - Download: https://nodejs.org/
  - Verify: `node --version`
- **npm** (comes with Node.js)
  - Verify: `npm --version`
- **Git**
  - Download: https://git-scm.com/
  - Verify: `git --version`

### Optional Tools
- **MQTT Explorer** - GUI for monitoring MQTT traffic
  - Download: http://mqtt-explorer.com/
- **mosquitto-clients** - Command-line MQTT tools
  - Mac: `brew install mosquitto`
  - Linux: `apt-get install mosquitto-clients`
  - Windows: Download from https://mosquitto.org/download/

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd haunted-green-house
```

### 2. Start Docker Services

```bash
# Start MQTT broker and InfluxDB
docker-compose up -d

# Verify services are running
docker-compose ps
```

You should see:
```
NAME                          STATUS    PORTS
haunted-greenhouse-mqtt       running   0.0.0.0:1883->1883/tcp, 0.0.0.0:9001->9001/tcp
haunted-greenhouse-influxdb   running   0.0.0.0:8086->8086/tcp
```

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

**Required**: Get an OpenWeatherMap API key:
1. Sign up at https://openweathermap.org/api (free tier is sufficient)
2. Copy your API key from the dashboard
3. Edit `.env` and add:
   ```
   OPENWEATHER_API_KEY=your-api-key-here
   ```

The default values for other settings work for local development. You only need to edit if:
- You're using different ports
- You're connecting to remote services
- You want to customize thresholds

### 4. Install Backend Dependencies

```bash
cd backend
npm install --legacy-peer-deps
```

**Why `--legacy-peer-deps`?**
NestJS 11 has peer dependency requirements that need this flag. This is normal and expected.

**If installation fails:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

### 5. Install Simulator Dependencies

```bash
cd ../simulator
npm install
```

## Running the Application

### Terminal 1: Backend

```bash
cd backend
npm run start:dev
```

Wait for:
```
Application is running on: http://localhost:3000
Swagger documentation: http://localhost:3000/api
```

### Terminal 2: Simulator

```bash
cd simulator
npm start
```

You should see:
```
[Simulator] Connected successfully
[Simulator] Starting 4 devices...
[sensor-001] Publishing every 30s
[soil-sensor-01] Publishing every 60s
```

## Verify Installation

### 1. Check Backend API

Open browser: http://localhost:3000/api

You should see Swagger UI with available endpoints.

### 2. Check InfluxDB

Open browser: http://localhost:8086

Login credentials:
- Username: `admin`
- Password: `adminpassword`

Navigate to Data Explorer and query:
```flux
from(bucket: "sensor-data")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "sensor_readings")
```

### 3. Check MQTT (Optional)

If you have mosquitto-clients installed:

```bash
# Subscribe to all topics
mosquitto_sub -h localhost -p 1883 -t "greenhouse/#" -v
```

You should see sensor data flowing.

## Common Issues

### Issue: Docker containers won't start

**Solution:**
```bash
# Check Docker is running
docker --version

# View logs
docker-compose logs

# Restart services
docker-compose down
docker-compose up -d
```

### Issue: Port already in use

**Solution:**
```bash
# Find what's using the port (example for port 1883)
# Windows:
netstat -ano | findstr :1883

# Mac/Linux:
lsof -i :1883

# Kill the process or change the port in docker-compose.yml
```

### Issue: Backend won't connect to MQTT

**Solution:**
1. Verify MQTT broker is running: `docker-compose ps`
2. Check `.env` file exists and has correct MQTT_BROKER_URL
3. Restart backend: `npm run start:dev`

### Issue: npm install fails

**Solution:**
```bash
# Make sure you're using Node.js 18+
node --version

# Use legacy peer deps flag
npm install --legacy-peer-deps

# If still failing, clean install
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

### Issue: No data in InfluxDB

**Solution:**
1. Check backend is running and connected
2. Check simulator is publishing (you should see logs)
3. Check backend logs for errors
4. Verify InfluxDB bucket exists: http://localhost:8086

## Development Workflow

### Starting Work

```bash
# 1. Pull latest changes
git pull

# 2. Start Docker services
docker-compose up -d

# 3. Start backend (Terminal 1)
cd backend
npm run start:dev

# 4. Start simulator (Terminal 2)
cd simulator
npm start
```

### Stopping Work

```bash
# Stop backend: Ctrl+C in Terminal 1
# Stop simulator: Ctrl+C in Terminal 2

# Stop Docker services (optional, they can keep running)
docker-compose down
```

### Running Tests

```bash
# Backend tests
cd backend
npm test

# E2E tests
npm run test:e2e
```

## Project Structure

```
haunted-green-house/
├── .kiro/                    # Kiro specs and steering
│   ├── specs/               # Feature specifications
│   └── steering/            # Project standards
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── modules/
│   │   │   ├── environment/ # Sensor monitoring
│   │   │   └── irrigation/  # Water management
│   │   └── common/
│   │       └── services/
│   │           ├── mqtt/    # MQTT client
│   │           └── influxdb/# InfluxDB client
│   └── package.json
├── simulator/               # IoT device simulator
│   ├── src/
│   │   └── index.ts
│   └── package.json
├── mqtt/                    # MQTT broker config
│   └── config/
│       └── mosquitto.conf
├── docker-compose.yml       # Infrastructure
├── .env                     # Environment variables
└── README.md
```

## Available Scripts

### Backend
```bash
npm run start:dev    # Development mode with hot reload
npm run start:prod   # Production mode
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Lint code
```

### Simulator
```bash
npm start                              # Normal operation
npm start -- --scenario temp-spike     # Temperature spike test
npm start -- --scenario low-moisture   # Low moisture test
npm start -- --verbose                 # Verbose logging
npm start -- --duration 10             # Run for 10 minutes
```

## Getting Help

1. Check this guide first
2. Review the main README.md
3. Check the specs in `.kiro/specs/`
4. Ask the team in Slack/Discord
5. Create an issue on GitHub

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test locally
4. Commit: `git commit -m "Description"`
5. Push: `git push origin feature/your-feature`
6. Create a Pull Request

## Resources

- **Swagger API**: http://localhost:3000/api
- **InfluxDB UI**: http://localhost:8086
- **MQTT Broker**: mqtt://localhost:1883
- **NestJS Docs**: https://docs.nestjs.com/
- **InfluxDB Docs**: https://docs.influxdata.com/
- **MQTT Docs**: https://mqtt.org/

Happy coding! 🌱
