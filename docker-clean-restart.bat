@echo off
echo 🧹 Cleaning up Docker containers and images...

REM Stop and remove all containers
docker-compose down

REM Remove any dangling images and build cache
docker system prune -f

REM Remove specific images if they exist
docker rmi haunted-green-house-backend 2>nul
docker rmi haunted-green-house-frontend 2>nul
docker rmi haunted-green-house-simulator 2>nul

echo 🚀 Starting fresh build...

REM Build and start services
docker-compose up --build -d

echo ⏳ Waiting for services to start...
timeout /t 15 /nobreak >nul

echo 🔍 Checking service status...
docker-compose ps

echo.
echo 📋 Service URLs:
echo   🌐 Frontend:    http://localhost:3001
echo   🔧 Backend API: http://localhost:3000
echo   📈 InfluxDB:    http://localhost:8086
echo   📡 MQTT:        mqtt://localhost:1883
echo.
echo 📊 To view logs: docker-compose logs -f
echo.
pause