# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new project called "Garden Mirror"

## Step 2: Create a Cluster

1. Click "Build a Database"
2. Choose **M0 Sandbox** (Free tier)
3. Select your preferred cloud provider and region
4. Name your cluster: `garden-mirror-cluster`
5. Click "Create"

## Step 3: Configure Database Access

1. Go to **Database Access** in the left sidebar
2. Click "Add New Database User"
3. Create a user:
   - Username: `garden_mirror_user`
   - Password: Generate a secure password (save it!)
   - Database User Privileges: "Read and write to any database"
4. Click "Add User"

## Step 4: Configure Network Access

1. Go to **Network Access** in the left sidebar
2. Click "Add IP Address"
3. Choose **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Note: For production, restrict to specific IPs
4. Click "Confirm"

## Step 5: Get Connection String

1. Go to **Database** in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (it looks like this):
   ```
   mongodb+srv://garden_mirror_user:<password>@garden-mirror-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add the database name at the end: `/garden_mirror`

Final connection string example:
```
mongodb+srv://garden_mirror_user:your_password@garden-mirror-cluster.xxxxx.mongodb.net/garden_mirror?retryWrites=true&w=majority
```

## Step 6: Update Environment Variables

Update your `backend/.env` file:

```bash
MONGODB_URI=mongodb+srv://garden_mirror_user:your_password@garden-mirror-cluster.xxxxx.mongodb.net/garden_mirror?retryWrites=true&w=majority
```

## Step 7: Seed the Database

From your project root:

```bash
cd backend
npm install
npm run seed
```

## ✅ Verification

Your database is ready when you see:
- ✅ MongoDB connected successfully
- ✅ Database seeding completed successfully!
- ✅ Admin credentials: admin@gardenmirror.com / admin123

## 🔍 Optional: Install MongoDB Compass

Download [MongoDB Compass](https://www.mongodb.com/products/compass) to visually explore your database using the same connection string.