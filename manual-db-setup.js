// Manual Database Setup Script
// Run this if you want to create collections and indexes manually

const mongoose = require('mongoose');
require('dotenv').config();

async function setupDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/garden-mirror';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Create collections
    const collections = [
      'users',
      'admins', 
      'rooms',
      'packages',
      'reservations',
      'feedback'
    ];

    console.log('📁 Creating collections...');
    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } catch (error) {
        if (error.code === 48) {
          console.log(`ℹ️  Collection already exists: ${collectionName}`);
        } else {
          console.error(`❌ Error creating ${collectionName}:`, error.message);
        }
      }
    }

    // Create indexes for performance
    console.log('🔍 Creating indexes...');
    
    // Users indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ phone: 1 });
    console.log('✅ Created users indexes');

    // Admins indexes
    await db.collection('admins').createIndex({ email: 1 }, { unique: true });
    await db.collection('admins').createIndex({ username: 1 }, { unique: true });
    console.log('✅ Created admins indexes');

    // Reservations indexes
    await db.collection('reservations').createIndex({ userId: 1 });
    await db.collection('reservations').createIndex({ eventDate: 1 });
    await db.collection('reservations').createIndex({ status: 1 });
    await db.collection('reservations').createIndex({ roomId: 1 });
    await db.collection('reservations').createIndex({ packageId: 1 });
    console.log('✅ Created reservations indexes');

    // Rooms indexes
    await db.collection('rooms').createIndex({ name: 1 });
    await db.collection('rooms').createIndex({ isActive: 1 });
    await db.collection('rooms').createIndex({ capacity: 1 });
    console.log('✅ Created rooms indexes');

    // Packages indexes
    await db.collection('packages').createIndex({ name: 1 });
    await db.collection('packages').createIndex({ isActive: 1 });
    await db.collection('packages').createIndex({ price: 1 });
    console.log('✅ Created packages indexes');

    // Feedback indexes
    await db.collection('feedback').createIndex({ userId: 1 });
    await db.collection('feedback').createIndex({ reservationId: 1 });
    await db.collection('feedback').createIndex({ rating: 1 });
    await db.collection('feedback').createIndex({ isPublic: 1 });
    console.log('✅ Created feedback indexes');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('📋 Next steps:');
    console.log('1. Run: npm run seed (to populate with sample data)');
    console.log('2. Start your application');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the setup
setupDatabase();