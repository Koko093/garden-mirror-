#!/bin/bash

# Garden Mirror Deployment Script
echo "🌟 Garden Mirror Event Management System Deployment"
echo "=================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment files if they don't exist
if [ ! -f .env ]; then
    echo "📄 Creating frontend .env file..."
    cp .env.example .env
    echo "✅ Please update .env with your configuration"
fi

if [ ! -f backend/.env ]; then
    echo "📄 Creating backend .env file..."
    cp backend/.env.example backend/.env
    echo "✅ Please update backend/.env with your configuration"
fi

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Test API health
echo "🩺 Testing API health..."
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Backend API is healthy"
else
    echo "❌ Backend API health check failed"
fi

# Test frontend
echo "🌐 Testing frontend..."
if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend accessibility check failed"
fi

echo ""
echo "🎉 Deployment Complete!"
echo "========================"
echo "Frontend: http://localhost"
echo "Backend API: http://localhost:5000/api"
echo "API Health: http://localhost:5000/api/health"
echo ""
echo "📋 Default Admin Credentials:"
echo "Email: admin@gardenmirror.com"
echo "Password: admin123"
echo ""
echo "⚠️  IMPORTANT: Change default passwords before production use!"
echo ""
echo "🔧 Useful Commands:"
echo "View logs: docker-compose logs -f"
echo "Stop services: docker-compose down"
echo "Restart services: docker-compose restart"
echo "Update services: docker-compose up -d --force-recreate"