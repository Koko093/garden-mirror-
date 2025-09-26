# 🗄️ MongoDB Setup for Garden Mirror

## 🚀 Quick Start (Choose One Option)

### Option 1: Docker Setup (Easiest)
```bash
# Make script executable and run
chmod +x setup-mongodb.sh
./setup-mongodb.sh
```

### Option 2: MongoDB Atlas (Cloud)
1. Follow the guide in [`setup-mongodb-atlas.md`](./setup-mongodb-atlas.md)
2. Update your `backend/.env` with the Atlas connection string
3. Run the seeding script:
   ```bash
   cd backend
   npm install
   npm run seed
   ```

### Option 3: Local MongoDB Installation
```bash
# Install MongoDB locally, then:
cd backend
npm install
npm run setup-db  # Create collections and indexes
npm run seed      # Populate with sample data
```

## 📋 Default Data After Seeding

### Admin Account
- **Email:** admin@gardenmirror.com  
- **Password:** admin123

### Sample Users
- **User 1:** sarah.johnson@email.com / password123
- **User 2:** michael.chen@email.com / password123

### Sample Data Includes
- **3 Rooms:** Grand Ballroom, Garden Pavilion, Intimate Hall
- **3 Packages:** Wedding, Birthday, Corporate
- **2 Sample Reservations**
- **Sample Feedback/Reviews**

## 🔧 Useful Commands

```bash
cd backend

# Test database connection
npm run test-db

# Reset database with fresh sample data
npm run reset-db

# Start development server
npm run dev

# View database logs (Docker)
docker logs garden-mirror-mongodb
```

## 📊 Database Structure

```
garden_mirror/
├── users          # Customer accounts
├── admins         # Admin accounts
├── rooms          # Venue rooms/spaces
├── packages       # Event packages
├── reservations   # Bookings/reservations
└── feedback       # Customer reviews
```

## 🔍 Database Monitoring

### MongoDB Compass (GUI Tool)
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your MongoDB URI
3. Explore collections visually

### Connection Strings
- **Local Docker:** `mongodb://admin:password123@localhost:27017/garden_mirror?authSource=admin`
- **Atlas:** `mongodb+srv://username:password@cluster.mongodb.net/garden_mirror`

## 🛠️ Troubleshooting

### Connection Issues
```bash
# Check if MongoDB is running (Docker)
docker ps | grep mongodb

# View MongoDB logs
docker logs garden-mirror-mongodb

# Restart MongoDB container
docker restart garden-mirror-mongodb
```

### Permission Issues
```bash
# For local setup scripts
chmod +x setup-mongodb.sh
chmod +x deploy.sh
```

### Port Conflicts
If port 27017 is in use:
```bash
# Find what's using the port
lsof -i :27017

# Kill the process or use different port
docker run -p 27018:27017 ... # Use port 27018 instead
```

## 🔒 Security Notes

### Development
- Default passwords are fine for development
- MongoDB is accessible only locally

### Production
- **Change all default passwords**
- **Use strong, unique passwords**
- **Restrict database access by IP**
- **Enable SSL/TLS connections**
- **Use environment variables for credentials**

## 📈 Performance Tips

### Indexes
All necessary indexes are created automatically:
- Email uniqueness (users, admins)
- Reservation queries (date, status, user)
- Search optimization (rooms, packages)

### Connection Pooling
The backend uses Mongoose's built-in connection pooling for optimal performance.

## 🆘 Getting Help

### Check Status
```bash
# Backend API health
curl http://localhost:5000/api/health

# Database connection test
cd backend && npm run test-db
```

### Common Issues
1. **Connection Refused:** Check if MongoDB is running
2. **Authentication Failed:** Verify username/password
3. **Network Error:** Check firewall/network settings
4. **Permission Denied:** Check user permissions

### Support Resources
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas Support](https://www.mongodb.com/cloud/atlas/support)

---

## ✅ Verification Checklist

After setup, verify these work:
- [ ] Database connection established
- [ ] Sample data loaded
- [ ] Admin login works
- [ ] User registration works
- [ ] Reservations can be created
- [ ] Backend API responds to health check

**🎉 Once verified, your Garden Mirror database is ready for use!**