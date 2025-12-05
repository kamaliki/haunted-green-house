# Docker Troubleshooting Guide

## Current Issues and Solutions

### Issue 1: Docker Compose Version Warning
**Problem:** `attribute 'version' is obsolete`
**Solution:** ✅ Fixed - Removed version field from docker-compose.yml

### Issue 2: Backend Build Error
**Problem:** `failed to checksum file backend/node_modules/backend`
**Solution:** ✅ Fixed - Updated .dockerignore to exclude nested backend directory

## Step-by-Step Recovery

### Option 1: Clean Restart (Recommended)
```cmd
docker-clean-restart.bat
```

### Option 2: Manual Steps

1. **Stop everything:**
   ```cmd
   docker-compose down
   ```

2. **Clean up:**
   ```cmd
   docker system prune -f
   ```

3. **Start infrastructure only (test):**
   ```cmd
   docker-compose -f docker-compose.minimal.yml up -d
   ```

4. **Verify infrastructure:**
   ```cmd
   docker-compose -f docker-compose.minimal.yml ps
   ```

5. **If infrastructure works, start full system:**
   ```cmd
   docker-compose up --build -d
   ```

### Option 3: Local Development (Fallback)

If Docker continues to have issues, you can run services locally:

1. **Start infrastructure only:**
   ```cmd
   docker-compose -f docker-compose.minimal.yml up -d
   ```

2. **Run backend locally:**
   ```cmd
   cd backend
   npm install
   npm run start:dev
   ```

3. **Run frontend locally:**
   ```cmd
   cd frontend
   npm install
   npm run dev
   ```

## Verification Steps

### Check Service Health
```cmd
# PostgreSQL
docker-compose exec postgres pg_isready -U postgres

# InfluxDB
curl http://localhost:8086/health

# Backend (if running in Docker)
curl http://localhost:3000/health

# Frontend (if running in Docker)
curl http://localhost:3001
```

### View Logs
```cmd
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
```

## Common Solutions

### Port Conflicts
If you get port binding errors:
```cmd
# Check what's using the ports
netstat -ano | findstr :3000
netstat -ano | findstr :5432

# Kill processes if needed
taskkill /PID <process_id> /F
```

### Permission Issues
```cmd
# Reset Docker
docker system prune -a -f
docker volume prune -f
```

### Database Connection Issues
1. Make sure PostgreSQL container is fully started
2. Check environment variables match between services
3. Verify network connectivity between containers

## Environment Variables

### For Docker (containers talking to each other):
- `DATABASE_HOST=postgres`
- `MQTT_BROKER_URL=mqtt://mosquitto:1883`
- `INFLUXDB_URL=http://influxdb:8086`

### For Local Development (services on localhost):
- `DATABASE_HOST=localhost`
- `MQTT_BROKER_URL=mqtt://localhost:1883`
- `INFLUXDB_URL=http://localhost:8086`

## Success Indicators

✅ **All services running:**
```cmd
docker-compose ps
```
Should show all services as "Up"

✅ **Backend responding:**
```cmd
curl http://localhost:3000/health
```
Should return: `{"status":"ok","timestamp":"..."}`

✅ **Frontend accessible:**
Open http://localhost:3001 in browser

✅ **Database connected:**
Backend logs should show successful database connection

## Next Steps

Once everything is working:
1. Test the API endpoints
2. Verify MQTT connectivity
3. Check InfluxDB data ingestion
4. Test the complete workflow