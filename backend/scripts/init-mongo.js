// MongoDB initialization script for Docker
db = db.getSiblingDB('garden_mirror');

// Create collections
db.createCollection('users');
db.createCollection('admins');
db.createCollection('packages');
db.createCollection('rooms');
db.createCollection('reservations');
db.createCollection('feedback');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.admins.createIndex({ "email": 1 }, { unique: true });
db.reservations.createIndex({ "userId": 1 });
db.reservations.createIndex({ "eventDate": 1 });
db.reservations.createIndex({ "status": 1 });

// Insert default admin user
db.admins.insertOne({
  name: "Garden Mirror Admin",
  email: "admin@gardenmirror.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1nL2hQj.3q", // admin123
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Insert sample packages
db.packages.insertMany([
  {
    name: "Ultimate Wedding Package",
    description: "Complete wedding package with all amenities",
    price: 25000,
    features: [
      "Complete venue decoration",
      "Professional photography",
      "Catering for 100 guests",
      "Wedding cake",
      "Bridal car decoration",
      "Sound system and lighting"
    ],
    duration: "8 hours",
    maxGuests: 100,
    isActive: true,
    category: "wedding",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Birthday Celebration",
    description: "Perfect birthday party package",
    price: 15000,
    features: [
      "Birthday decorations",
      "Photography",
      "Catering for 50 guests",
      "Birthday cake",
      "Party games setup",
      "Sound system"
    ],
    duration: "6 hours",
    maxGuests: 50,
    isActive: true,
    category: "birthday",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Corporate Event",
    description: "Professional corporate event package",
    price: 20000,
    features: [
      "Professional setup",
      "Audio/Visual equipment",
      "Catering for 75 guests",
      "Photography",
      "Business lunch/dinner",
      "Presentation facilities"
    ],
    duration: "8 hours",
    maxGuests: 75,
    isActive: true,
    category: "corporate",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Insert sample rooms
db.rooms.insertMany([
  {
    name: "Grand Ballroom",
    description: "Elegant ballroom perfect for large events",
    capacity: 200,
    pricePerHour: 1875,
    basePrice: 15000,
    features: [
      "Crystal chandeliers",
      "Hardwood dance floor",
      "Professional lighting",
      "Premium sound system",
      "Bridal suite access",
      "Catering kitchen access"
    ],
    images: [],
    isAvailable: true,
    amenities: [
      "Air conditioning",
      "Wi-Fi",
      "Parking",
      "Restrooms",
      "Catering facilities"
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Garden Pavilion",
    description: "Beautiful outdoor pavilion with garden views",
    capacity: 150,
    pricePerHour: 1500,
    basePrice: 12000,
    features: [
      "Garden setting",
      "Natural lighting",
      "Open-air design",
      "Scenic backdrop",
      "Weather protection",
      "Adjacent restroom facilities"
    ],
    images: [],
    isAvailable: true,
    amenities: [
      "Outdoor setting",
      "Wi-Fi",
      "Parking",
      "Restrooms",
      "Catering setup"
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Intimate Hall",
    description: "Cozy hall ideal for smaller gatherings",
    capacity: 80,
    pricePerHour: 1000,
    basePrice: 8000,
    features: [
      "Intimate setting",
      "Warm lighting",
      "Flexible layout",
      "Personal service",
      "Cozy atmosphere",
      "Easy setup/cleanup"
    ],
    images: [],
    isAvailable: true,
    amenities: [
      "Air conditioning",
      "Wi-Fi",
      "Parking",
      "Restrooms",
      "Basic catering setup"
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print("Database initialized successfully with sample data");