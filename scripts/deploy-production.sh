#!/bin/bash

# Garden Mirror Production Deployment Script
echo "🚀 Starting Garden Mirror Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env files exist
print_status "Checking environment configuration..."

if [ ! -f "backend/.env" ]; then
    print_error "Backend .env file not found!"
    print_status "Please copy backend/.env.example to backend/.env and configure it"
    exit 1
fi

if [ ! -f ".env" ]; then
    print_warning "Frontend .env file not found. Using default configuration."
fi

# Validate required environment variables
print_status "Validating environment variables..."

# Backend validation
cd backend
if ! grep -q "MONGODB_URI=" .env; then
    print_error "MONGODB_URI not set in backend/.env"
    exit 1
fi

if ! grep -q "JWT_SECRET=" .env; then
    print_error "JWT_SECRET not set in backend/.env"
    exit 1
fi

if ! grep -q "PAYMONGO_SECRET_KEY=" .env; then
    print_error "PAYMONGO_SECRET_KEY not set in backend/.env"
    exit 1
fi

cd ..

print_status "Environment validation passed ✅"

# Install dependencies
print_status "Installing backend dependencies..."
cd backend && npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install backend dependencies"
    exit 1
fi

cd ..

print_status "Installing frontend dependencies..."
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Build frontend
print_status "Building frontend for production..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Frontend build failed"
    exit 1
fi

# Test MongoDB connection
print_status "Testing MongoDB connection..."
cd backend
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connection successful');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
" 2>/dev/null

if [ $? -ne 0 ]; then
    print_error "MongoDB connection test failed"
    print_warning "Please check your MONGODB_URI configuration"
    exit 1
fi

cd ..

# Seed database
print_status "Seeding database with initial data..."
cd backend
node scripts/seedDatabase.js
if [ $? -ne 0 ]; then
    print_warning "Database seeding failed, but deployment will continue"
fi

cd ..

print_status "🎉 Deployment preparation completed successfully!"
echo ""
echo "Next steps:"
echo "1. Deploy backend to your hosting platform (Railway, Render, etc.)"
echo "2. Deploy frontend to your hosting platform (Vercel, Netlify, etc.)"
echo "3. Configure PayMongo webhook URL in your PayMongo dashboard"
echo "4. Test the complete application flow"
echo ""
echo "Webhook URL: https://your-backend-domain.com/api/payments/webhook"
echo ""
print_status "Happy deploying! 🚀"