import { Room, Package, Reservation, Feedback } from '../types';

export const mockRooms: Room[] = [
  {
    id: '1',
    name: 'Grand Ballroom',
    description: 'Elegant ballroom perfect for large celebrations and weddings with stunning chandeliers and marble floors',
    capacity: 200,
    price: 15000,
    images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800'],
    amenities: ['Air Conditioning', 'Sound System', 'Professional Stage', 'Dance Floor', 'Bridal Room'],
    availability: []
  },
  {
    id: '2',
    name: 'Garden Pavilion',
    description: 'Beautiful outdoor venue surrounded by lush gardens with romantic fairy lights',
    capacity: 150,
    price: 12000,
    images: ['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800'],
    amenities: ['Garden Setting', 'Covered Pavilion', 'Natural Lighting', 'Bar Area', 'Outdoor Kitchen'],
    availability: []
  },
  {
    id: '3',
    name: 'Intimate Hall',
    description: 'Cozy venue perfect for smaller gatherings and private events with modern decor',
    capacity: 80,
    price: 8000,
    images: ['https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=800'],
    amenities: ['Intimate Setting', 'Flexible Layout', 'Modern Decor', 'Private Entrance', 'Lounge Area'],
    availability: []
  }
];

export const mockPackages: Package[] = [
  {
    id: '1',
    name: 'Ultimate Wedding Package',
    description: 'Everything you need for your dream wedding celebration',
    price: 25000,
    duration: '8 hours',
    images: ['https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800'],
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
    ]
  },
  {
    id: '2',
    name: 'Birthday Celebration',
    description: 'Perfect package for memorable birthday parties',
    price: 15000,
    duration: '6 hours',
    images: ['https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800'],
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
    ]
  },
  {
    id: '3',
    name: 'Corporate Event',
    description: 'Professional package for corporate gatherings and conferences',
    price: 20000,
    duration: 'Full Day',
    images: ['https://images.unsplash.com/photo-1511578314322-379afb476865?w=800'],
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
    ]
  }
];

export const mockReservations: Reservation[] = [
  {
    id: 'RES001',
    userId: 'user1',
    eventDate: new Date('2024-12-15'),
    roomId: '1',
    packageId: '1',
    guestCount: 120,
    customerInfo: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1234567890',
      specialRequests: 'Vegetarian menu preferred'
    },
    totalAmount: 40000,
    downpayment: 12000,
    balance: 28000,
    status: 'confirmed',
    paymentStatus: 'partial',
    createdAt: new Date('2024-11-01')
  },
  {
    id: 'RES002',
    userId: 'user2',
    eventDate: new Date('2024-12-22'),
    roomId: '2',
    packageId: '2',
    guestCount: 80,
    customerInfo: {
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+1234567891',
      specialRequests: 'Birthday decorations in blue theme'
    },
    totalAmount: 27000,
    downpayment: 8100,
    balance: 18900,
    status: 'pending',
    paymentStatus: 'unpaid',
    createdAt: new Date('2024-11-05')
  },
  {
    id: 'RES003',
    userId: 'user3',
    eventDate: new Date('2024-11-30'),
    roomId: '3',
    packageId: '3',
    guestCount: 60,
    customerInfo: {
      name: 'Amanda Davis',
      email: 'amanda.davis@company.com',
      phone: '+1234567892',
      specialRequests: 'Need extra tables for product display'
    },
    totalAmount: 28000,
    downpayment: 8400,
    balance: 19600,
    status: 'completed',
    paymentStatus: 'paid',
    createdAt: new Date('2024-10-15')
  }
];

export const mockFeedback: Feedback[] = [
  {
    id: '1',
    reservationId: 'RES003',
    userId: 'user3',
    customerInfo: {
      name: 'Amanda Davis',
      email: 'amanda.davis@company.com'
    },
    rating: 5,
    comment: 'Absolutely perfect venue for our corporate event! The staff was professional and the setup exceeded our expectations. The catering was delicious and the AV equipment worked flawlessly.',
    isPublic: true,
    createdAt: new Date('2024-11-02')
  },
  {
    id: '2',
    reservationId: 'RES001',
    userId: 'user1',
    customerInfo: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com'
    },
    rating: 5,
    comment: 'Our wedding day was magical! The Grand Ballroom looked stunning with the decorations, and the photographer captured every beautiful moment. The coordination team made everything seamless.',
    isPublic: true,
    createdAt: new Date('2024-12-16')
  },
  {
    id: '3',
    reservationId: 'RES002',
    userId: 'user2',
    customerInfo: {
      name: 'Michael Chen',
      email: 'michael.chen@email.com'
    },
    rating: 4,
    comment: 'Great birthday celebration! The Garden Pavilion was beautiful and the kids loved the activities. Only minor issue was the sound system could have been louder, but overall fantastic experience.',
    isPublic: true,
    createdAt: new Date('2024-12-23')
  }
];

export const mockAnalytics = {
  totalBookings: 48,
  totalRevenue: 1250000,
  pendingPayments: 150000,
  activeUsers: 34,
  revenueTrend: '+12.5%',
  bookingsTrend: '+8.2%',
  pendingTrend: '-5.1%',
  usersTrend: '+18.7%',
  monthlyBookings: [
    { month: 'Jun', revenue: 180000, bookings: 8 },
    { month: 'Jul', revenue: 220000, bookings: 12 },
    { month: 'Aug', revenue: 190000, bookings: 9 },
    { month: 'Sep', revenue: 250000, bookings: 13 },
    { month: 'Oct', revenue: 200000, bookings: 10 },
    { month: 'Nov', revenue: 210000, bookings: 11 }
  ],
  roomUtilization: [
    { room: 'Grand Ballroom', utilization: 85 },
    { room: 'Garden Pavilion', utilization: 72 },
    { room: 'Intimate Hall', utilization: 68 }
  ]
};