#!/bin/bash

# Haunted Greenhouse - Docker Compose Startup Script

echo "🌱 Starting Haunted Greenhouse System..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose not found. Please install Docker Compose."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p mqtt/data mqtt/log

# Copy environment file for Docker
if [ ! -f .env.docker ]; then
    echo "❌ .env.docker file not found. Please create it first."
    exit 1
fi

echo "🔧 Using Docker environment configuration..."

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start all services
echo "🚀 Building and starting all services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check PostgreSQL
echo "  📊 PostgreSQL..."
docker-compose exec -T postgres pg_isready -U postgres || echo "    ⚠️  PostgreSQL not ready yet"

# Check InfluxDB
echo "  📈 InfluxDB..."
curl -s http://localhost:8086/health > /dev/null && echo "    ✅ InfluxDB is ready" || echo "    ⚠️  InfluxDB not ready yet"

# Check MQTT
echo "  📡 MQTT Broker..."
docker-compose logs mosquitto | grep -q "mosquitto version" && echo "    ✅ MQTT Broker is ready" || echo "    ⚠️  MQTT Broker not ready yet"

# Check Backend
echo "  🔧 Backend API..."
curl -s http://localhost:3000/health > /dev/null && echo "    ✅ Backend is ready" || echo "    ⚠️  Backend not ready yet"

# Check Frontend
echo "  🌐 Frontend..."
curl -s http://localhost:3001 > /dev/null && echo "    ✅ Frontend is ready" || echo "    ⚠️  Frontend not ready yet"

echo ""
echo "🎉 Haunted Greenhouse System Started!"
echo ""
echo "📋 Service URLs:"
echo "  🌐 Frontend:    http://localhost:3001"
echo "  🔧 Backend API: http://localhost:3000"
echo "  📈 InfluxDB:    http://localhost:8086"
echo "  📡 MQTT:        mqtt://localhost:1883"
echo ""
echo "📊 Useful Commands:"
echo "  View logs:      docker-compose logs -f [service_name]"
echo "  Stop all:       docker-compose down"
echo "  Restart:        docker-compose restart [service_name]"
echo "  Shell access:   docker-compose exec [service_name] sh"
echo ""
echo "🔍 To monitor logs in real-time:"
echo "  docker-compose logs -f"