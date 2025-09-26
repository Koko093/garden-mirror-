# Garden Mirror Setup Guide

This guide will help you set up the complete Garden Mirror Event Management System with both frontend and backend.

## Quick Start (Frontend Only)

If you just want to see the frontend in action with mock data:

```bash
npm install
npm run dev
```

The application will run with fallback mock data and you can explore all features.

## Full Setup (Frontend + Backend)

For complete functionality with database integration:

### Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** (local installation or MongoDB Atlas)
3. **Git**

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd garden-mirror

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 2: Set Up MongoDB

#### Option A: Local MongoDB
```bash
# Install MongoDB Community Edition
# On macOS with Homebrew:
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb/brew/mongodb-community

# On Ubuntu:
sudo apt update
sudo apt install mongodb

# Start MongoDB
sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Update the `.env` file in the backend folder

### Step 3: Configure Backend

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env file with your settings
# The default settings work for local MongoDB
```

### Step 4: Seed the Database

```bash
# From the backend directory
npm run seed
```

This will create:
- Admin user: `admin` / `admin123`
- Sample users, rooms, packages, and reservations
- Sample feedback and analytics data

### Step 5: Start the Servers

#### Terminal 1: Backend
```bash
cd backend
npm run dev
```

Backend will start on http://localhost:5000

#### Terminal 2: Frontend
```bash
# From the root directory
npm run dev
```

Frontend will start on http://localhost:3000

## Usage

### Customer Interface
1. Visit http://localhost:3000
2. Browse packages, rooms, and feedback
3. Register an account to make reservations
4. Use the chatbot for support

### Admin Interface
1. Go to http://localhost:3000/admin/login
2. Login with: `admin` / `admin123`
3. Access the full admin dashboard with:
   - Reservation management
   - Room and package management
   - Invoice generation
   - Analytics and reporting

## API Documentation

When the backend is running, you can test the API endpoints:

### Authentication
- `POST /api/auth/login` - Customer login
- `POST /api/auth/register` - Customer registration
- `POST /api/auth/admin/login` - Admin login

### Public Endpoints
- `GET /api/rooms` - Get all rooms
- `GET /api/packages` - Get all packages
- `GET /api/feedback` - Get public feedback

### Admin Endpoints (require authentication)
- `GET /api/admin/analytics` - Dashboard analytics
- `GET /api/admin/users` - User management
- `POST /api/admin/payments` - Process payments
- `POST /api/admin/invoices/generate/:id` - Generate invoices

## Troubleshooting

### Frontend Issues

**"Backend unavailable" messages in console:**
- This is normal when the backend isn't running
- The app will use mock data automatically
- No action needed for frontend-only usage

### Backend Issues

**MongoDB connection failed:**
```bash
# Check if MongoDB is running
# On macOS:
brew services list | grep mongodb

# On Ubuntu:
sudo systemctl status mongod

# Restart if needed:
brew services restart mongodb/brew/mongodb-community
# or
sudo systemctl restart mongod
```

**Port 5000 already in use:**
```bash
# Find and kill the process
lsof -ti:5000 | xargs kill -9

# Or change the port in backend/.env
PORT=5001
```

**Dependencies issues:**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Issues

**Reset database:**
```bash
cd backend
npm run seed
```

**View database contents:**
```bash
# Connect to MongoDB shell
mongosh

# Switch to database
use garden-mirror

# View collections
show collections

# View sample data
db.rooms.find()
db.packages.find()
```

## Development Features

### Hot Reload
Both frontend and backend support hot reload during development.

### Mock Data
The system includes comprehensive mock data that works without any backend:
- 3 sample rooms
- 3 sample packages  
- Sample reservations and feedback
- Analytics data for charts

### Offline Mode
The admin authentication includes offline mode with these credentials:
- `admin` / `admin123` (full access)
- `manager` / `manager123` (limited access)

## Production Deployment

### Environment Variables
Update these for production:
- `NODE_ENV=production`
- `JWT_SECRET=your-secure-secret`
- `MONGODB_URI=your-production-mongodb-url`
- `FRONTEND_URL=your-production-domain`

### Build
```bash
# Frontend
npm run build

# Backend
cd backend
npm start
```

## Support

If you encounter issues:
1. Check this setup guide first
2. Verify all prerequisites are installed
3. Check console logs for specific error messages
4. Ensure all environment variables are set correctly

The system is designed to work gracefully with or without the backend, so you can always use the frontend-only mode for development and testing.