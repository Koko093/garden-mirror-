#!/bin/bash

echo "🚀 Setting up MongoDB for Garden Mirror"
echo "======================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "📄 Creating backend .env file..."
    cp backend/.env.example backend/.env
    
    # Update MongoDB URI for local development
    sed -i 's|MONGODB_URI=.*|MONGODB_URI=mongodb://admin:password123@localhost:27017/garden_mirror?authSource=admin|g' backend/.env
    echo "✅ Updated MongoDB URI in backend/.env"
fi

# Start MongoDB container
echo "🐳 Starting MongoDB container..."
docker run -d \
  --name garden-mirror-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -e MONGO_INITDB_DATABASE=garden_mirror \
  -v garden_mirror_data:/data/db \
  mongo:7-jammy

# Wait for MongoDB to start
echo "⏳ Waiting for MongoDB to start..."
sleep 10

# Check if MongoDB is running
if docker ps | grep garden-mirror-mongodb > /dev/null; then
    echo "✅ MongoDB container is running"
else
    echo "❌ Failed to start MongoDB container"
    exit 1
fi

# Navigate to backend directory and install dependencies
cd backend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Run database seeding
echo "🌱 Seeding database with sample data..."
npm run seed

echo ""
echo "🎉 MongoDB Setup Complete!"
echo "=========================="
echo "MongoDB URI: mongodb://admin:password123@localhost:27017/garden_mirror?authSource=admin"
echo "Database: garden_mirror"
echo "Username: admin"
echo "Password: password123"
echo ""
echo "📋 Default Login Credentials:"
echo "Admin: admin@gardenmirror.com / admin123"
echo "User 1: sarah.johnson@email.com / password123"
echo "User 2: michael.chen@email.com / password123"
echo ""
echo "🔧 Useful Commands:"
echo "Stop MongoDB: docker stop garden-mirror-mongodb"
echo "Start MongoDB: docker start garden-mirror-mongodb"
echo "Remove MongoDB: docker rm -f garden-mirror-mongodb"
echo "View MongoDB logs: docker logs garden-mirror-mongodb"
echo ""
echo "🌐 Connect with MongoDB tools:"
echo "MongoDB Compass: mongodb://admin:password123@localhost:27017/garden_mirror?authSource=admin"