const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Admin = require('../models/Admin');
const Room = require('../models/Room');
const Package = require('../models/Package');
const Reservation = require('../models/Reservation');
const Feedback = require('../models/Feedback');

// Sample data
const sampleRooms = [
  {
    name: 'Grand Ballroom',
    description: 'Elegant ballroom perfect for large celebrations and weddings with stunning chandeliers and marble floors',
    capacity: 200,
    price: 15000,
    hourlyRate: 2000,
    dailyRate: 15000,
    features: ['Air Conditioning', 'Sound System', 'Professional Stage', 'Dance Floor'],
    amenities: ['Bridal Room', 'Bar Area', 'Kitchen Access', 'Parking'],
    images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800'],
    isActive: true
  },
  {
    name: 'Garden Pavilion',
    description: 'Beautiful outdoor venue surrounded by lush gardens with romantic fairy lights',
    capacity: 150,
    price: 12000,
    hourlyRate: 1500,
    dailyRate: 12000,
    features: ['Garden Setting', 'Covered Pavilion', 'Natural Lighting'],
    amenities: ['Bar Area', 'Outdoor Kitchen', 'Garden Access', 'Parking'],
    images: ['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800'],
    isActive: true
  },
  {
    name: 'Intimate Hall',
    description: 'Cozy venue perfect for smaller gatherings and private events with modern decor',
    capacity: 80,
    price: 8000,
    hourlyRate: 1000,
    dailyRate: 8000,
    features: ['Intimate Setting', 'Flexible Layout', 'Modern Decor'],
    amenities: ['Private Entrance', 'Lounge Area', 'Kitchen Access', 'Parking'],
    images: ['https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=800'],
    isActive: true
  }
];

const samplePackages = [
  {
    name: 'Ultimate Wedding Package',
    description: 'Everything you need for your dream wedding celebration',
    price: 25000,
    duration: '8 hours',
    maxGuests: 200,
    inclusions: [
      'Professional Photography (8 hours)',
      'Videography Service',
      'Bridal Bouquet & Groom Boutonniere',
      'Wedding Cake (3-tier)',
      'Complete Table Setup',
      'Centerpieces & Floral Arrangements',
      'Ceremony Arch Decoration',
      'Sound System & Microphones',
      'LED Lighting Package',
      'Wedding Coordination',
      'Complimentary Bridal Suite',
      'Welcome Drinks for Guests'
    ],
    images: ['https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800'],
    isActive: true
  },
  {
    name: 'Birthday Celebration',
    description: 'Perfect package for memorable birthday parties',
    price: 15000,
    duration: '6 hours',
    maxGuests: 150,
    inclusions: [
      'Birthday Photography (4 hours)',
      'Custom Birthday Cake',
      'Balloon Decorations',
      'Party Games & Activities',
      'Sound System',
      'Party Favors for Guests',
      'Themed Table Setup',
      'Birthday Banners',
      'Party Host/Coordinator'
    ],
    images: ['https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800'],
    isActive: true
  },
  {
    name: 'Corporate Event',
    description: 'Professional package for corporate gatherings and conferences',
    price: 20000,
    duration: 'Full Day',
    maxGuests: 100,
    inclusions: [
      'Event Photography',
      'Professional Audio/Visual Setup',
      'Projector & Screen',
      'High-Speed WiFi',
      'Coffee Break Service',
      'Lunch Catering',
      'Name Tags & Lanyards',
      'Welcome Signage',
      'Event Coordination',
      'Networking Area Setup'
    ],
    images: ['https://images.unsplash.com/photo-1511578314322-379afb476865?w=800'],
    isActive: true
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/garden-mirror');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Admin.deleteMany({}),
      Room.deleteMany({}),
      Package.deleteMany({}),
      Reservation.deleteMany({}),
      Feedback.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const admin = new Admin({
      username: 'admin',
      email: 'admin@gardenmirror.com',
      password: hashedPassword,
      role: 'admin',
      permissions: ['manage_users', 'manage_rooms', 'manage_reservations', 'view_analytics', 'manage_packages', 'manage_feedback']
    });
    await admin.save();
    console.log('Created admin user');

    // Create sample users
    const hashedUserPassword = await bcrypt.hash('password123', 12);
    const users = [
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        password: hashedUserPassword,
        phone: '+1234567890',
        address: {
          street: '123 Main St',
          city: 'Manila',
          province: 'Metro Manila',
          zipCode: '1001'
        },
        isActive: true
      },
      {
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        password: hashedUserPassword,
        phone: '+1234567891',
        address: {
          street: '456 Oak Ave',
          city: 'Quezon City',
          province: 'Metro Manila',
          zipCode: '1100'
        },
        isActive: true
      }
    ];

    const savedUsers = await User.insertMany(users);
    console.log('Created sample users');

    // Create rooms
    const savedRooms = await Room.insertMany(sampleRooms);
    console.log('Created sample rooms');

    // Create packages
    const savedPackages = await Package.insertMany(samplePackages);
    console.log('Created sample packages');

    // Create sample reservations
    const reservations = [
      {
        userId: savedUsers[0]._id,
        roomId: savedRooms[0]._id,
        packageId: savedPackages[0]._id,
        eventTitle: 'Sarah & John Wedding',
        eventDate: new Date('2024-12-15'),
        startTime: '10:00 AM',
        endTime: '6:00 PM',
        guestCount: 120,
        baseAmount: 40000,
        totalAmount: 40000,
        downpaymentAmount: 12000,
        balanceAmount: 28000,
        contactPerson: 'Sarah Johnson',
        contactPhone: '+1234567890',
        contactEmail: 'sarah.johnson@email.com',
        specialRequests: 'Vegetarian menu preferred',
        status: 'confirmed'
      },
      {
        userId: savedUsers[1]._id,
        roomId: savedRooms[1]._id,
        packageId: savedPackages[1]._id,
        eventTitle: 'Michael\'s 30th Birthday',
        eventDate: new Date('2024-12-22'),
        startTime: '2:00 PM',
        endTime: '8:00 PM',
        guestCount: 80,
        baseAmount: 27000,
        totalAmount: 27000,
        downpaymentAmount: 0,
        balanceAmount: 27000,
        contactPerson: 'Michael Chen',
        contactPhone: '+1234567891',
        contactEmail: 'michael.chen@email.com',
        specialRequests: 'Birthday decorations in blue theme',
        status: 'pending'
      }
    ];

    const savedReservations = await Reservation.insertMany(reservations);
    console.log('Created sample reservations');

    // Create sample feedback
    const feedback = [
      {
        userId: savedUsers[0]._id,
        reservationId: savedReservations[0]._id,
        rating: 5,
        title: 'Perfect Wedding Venue!',
        comment: 'Absolutely perfect venue for our wedding! The staff was professional and the setup exceeded our expectations.',
        isPublic: true
      },
      {
        userId: savedUsers[1]._id,
        reservationId: savedReservations[1]._id,
        rating: 4,
        title: 'Great Birthday Party',
        comment: 'Great birthday celebration! The Garden Pavilion was beautiful and the kids loved the activities.',
        isPublic: true
      }
    ];

    await Feedback.insertMany(feedback);
    console.log('Created sample feedback');

    console.log('Database seeding completed successfully!');
    console.log('Admin credentials: admin / admin123');
    console.log('User credentials: sarah.johnson@email.com / password123 or michael.chen@email.com / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase();