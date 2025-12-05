@echo off
REM Haunted Greenhouse - Docker Compose Startup Script for Windows

echo 🌱 Starting Haunted Greenhouse System...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ docker-compose not found. Please install Docker Compose.
    pause
    exit /b 1
)

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist mqtt\data mkdir mqtt\data
if not exist mqtt\log mkdir mqtt\log

REM Check for environment file
if not exist .env.docker (
    echo ❌ .env.docker file not found. Please create it first.
    pause
    exit /b 1
)

echo 🔧 Using Docker environment configuration...

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose down

REM Build and start all services
echo 🚀 Building and starting all services...
docker-compose up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check service health
echo 🔍 Checking service health...

echo   📊 PostgreSQL...
docker-compose exec -T postgres pg_isready -U postgres >nul 2>&1 && echo     ✅ PostgreSQL is ready || echo     ⚠️  PostgreSQL not ready yet

echo   📈 InfluxDB...
curl -s http://localhost:8086/health >nul 2>&1 && echo     ✅ InfluxDB is ready || echo     ⚠️  InfluxDB not ready yet

echo   🔧 Backend API...
curl -s http://localhost:3000/health >nul 2>&1 && echo     ✅ Backend is ready || echo     ⚠️  Backend not ready yet

echo   🌐 Frontend...
curl -s http://localhost:3001 >nul 2>&1 && echo     ✅ Frontend is ready || echo     ⚠️  Frontend not ready yet

echo.
echo 🎉 Haunted Greenhouse System Started!
echo.
echo 📋 Service URLs:
echo   🌐 Frontend:    http://localhost:3001
echo   🔧 Backend API: http://localhost:3000
echo   📈 InfluxDB:    http://localhost:8086
echo   📡 MQTT:        mqtt://localhost:1883
echo.
echo 📊 Useful Commands:
echo   View logs:      docker-compose logs -f [service_name]
echo   Stop all:       docker-compose down
echo   Restart:        docker-compose restart [service_name]
echo   Shell access:   docker-compose exec [service_name] sh
echo.
echo 🔍 To monitor logs in real-time:
echo   docker-compose logs -f
echo.
pause