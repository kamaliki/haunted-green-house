# Haunted Greenhouse - Docker Setup

This guide will help you run the entire Haunted Greenhouse system using Docker Compose, including all services: PostgreSQL, InfluxDB, MQTT, Backend, Frontend, and Simulator.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (usually included with Docker Desktop)
- Git (to clone the repository)

## Quick Start

### Windows Users

1. **Run the startup script:**
   ```cmd
   docker-start.bat
   ```

### Linux/Mac Users

1. **Make the script executable:**
   ```bash
   chmod +x docker-start.sh
   ```

2. **Run the startup script:**
   ```bash
   ./docker-start.sh
   ```

### Manual Setup

If you prefer to run commands manually:

1. **Start all services:**
   ```bash
   docker-compose up --build -d
   ```

2. **Check service status:**
   ```bash
   docker-compose ps
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

## Service URLs

Once everything is running, you can access:

- **Frontend (Next.js):** http://localhost:3001
- **Backend API (NestJS):** http://localhost:3000
- **InfluxDB UI:** http://localhost:8086
- **MQTT Broker:** mqtt://localhost:1883

## Environment Configuration

The system uses `.env.docker` for Docker-specific configuration. Key differences from local development:

- Database host: `postgres` (container name) instead of `localhost`
- MQTT broker: `mosquitto` (container name) instead of `localhost`
- InfluxDB: `influxdb` (container name) instead of `localhost`

## Development vs Production

### Development Mode (Default)
- Uses `Dockerfile.dev` for hot reloading
- Mounts source code as volumes
- Includes dev dependencies
- Runs `npm run start:dev` or `npm run dev`

### Production Mode
- Uses production `Dockerfile`
- Builds optimized images
- Excludes dev dependencies
- Runs `npm run start:prod` or `npm start`

To switch to production mode, update `docker-compose.yml` to use `Dockerfile` instead of `Dockerfile.dev`.

## Useful Commands

### Service Management
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart a specific service
docker-compose restart backend

# Rebuild and restart
docker-compose up --build -d

# View service status
docker-compose ps
```

### Logs and Debugging
```bash
# View all logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# Access container shell
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres -d haunted_greenhouse
```

### Database Operations
```bash
# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d haunted_greenhouse

# Access InfluxDB CLI
docker-compose exec influxdb influx
```

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   - Make sure ports 3000, 3001, 5432, 8086, 1883 are not in use
   - Stop local services running on these ports

2. **Docker not running:**
   - Start Docker Desktop
   - Wait for it to fully initialize

3. **Permission errors (Linux/Mac):**
   ```bash
   sudo chown -R $USER:$USER .
   ```

4. **Services not starting:**
   - Check logs: `docker-compose logs [service_name]`
   - Rebuild: `docker-compose up --build -d`

5. **Database connection issues:**
   - Wait for PostgreSQL to fully start (check with `docker-compose logs postgres`)
   - Verify environment variables in containers

### Health Checks

The system includes health checks for all services:

```bash
# Check backend health
curl http://localhost:3000/health

# Check InfluxDB health
curl http://localhost:8086/health

# Check PostgreSQL
docker-compose exec postgres pg_isready -U postgres
```

## Data Persistence

Data is persisted using Docker volumes:
- `postgres-data`: PostgreSQL database
- `influxdb-data`: InfluxDB time-series data
- `influxdb-config`: InfluxDB configuration

To reset all data:
```bash
docker-compose down -v
docker volume prune
```

## Network Architecture

All services run on the `greenhouse-network` Docker network:
- Services communicate using container names as hostnames
- External access through mapped ports
- Isolated from other Docker networks

## Security Notes

For production deployment:
1. Change default passwords in environment files
2. Use Docker secrets for sensitive data
3. Enable TLS/SSL for external connections
4. Restrict network access using firewalls
5. Regular security updates for base images

## Performance Optimization

For better performance:
1. Allocate more resources to Docker Desktop
2. Use SSD storage for Docker volumes
3. Optimize container resource limits
4. Use multi-stage builds for smaller images