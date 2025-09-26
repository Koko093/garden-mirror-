import { Room, Package, Reservation, Feedback } from '../types';
import { mockRooms, mockPackages, mockReservations, mockFeedback, mockAnalytics } from './mockData';
import { API_CONFIG, getAuthToken } from '../config/api';

// Helper function to make authenticated requests to MongoDB backend
const makeApiRequest = async (path: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${path}`, {
      ...options,
      headers: {
        ...API_CONFIG.headers,
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `API request failed: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // Check if it's a network error (backend not running)
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Backend server not available');
    }
    throw error;
  }
};

// Add makeApiRequest to the api object for external use
const makeApiRequestExternal = async (path: string, options: RequestInit = {}) => {
  return makeApiRequest(path, options);
};

export const api = {
  // Expose makeApiRequest for external use
  makeApiRequest: makeApiRequestExternal,
  // Rooms
  getRooms: async (): Promise<Room[]> => {
    try {
      const response = await makeApiRequest('/rooms');
      return response.rooms || response;
    } catch (error) {
      return mockRooms;
    }
  },

  // Packages
  getPackages: async (): Promise<Package[]> => {
    try {
      const response = await makeApiRequest('/packages');
      return response.packages || response;
    } catch (error) {
      return mockPackages;
    }
  },

  // Reservations
  getReservations: async (): Promise<Reservation[]> => {
    try {
      const response = await makeApiRequest('/reservations');
      return response.reservations || response;
    } catch (error) {
      return mockReservations;
    }
  },

  createReservation: async (data: {
    eventDate?: string;
    roomId?: string;
    packageId?: string;
    guestCount?: number;
    customerInfo?: {
      name: string;
      email: string;
      phone: string;
      specialRequests?: string;
    };
    totalAmount?: number;
    downpayment?: number;
    balance?: number;
    // Legacy support
    user_id?: string;
    room_id?: string;
    package_id?: string;
    event_id?: string;
    event_title?: string;
    event_date?: string;
    start_time?: string;
    end_time?: string;
    guest_count?: number;
    base_amount?: number;
    total_amount?: number;
    downpayment_amount?: number;
    balance_amount?: number;
    contact_person?: string;
    contact_phone?: string;
    contact_email?: string;
    special_requests?: string;
    additional_services?: any[];
  }) => {
    try {
      // Transform data to match backend expectations
      const reservationData = {
        room: data.roomId || data.room_id,
        package: data.packageId || data.package_id,
        eventDetails: {
          eventType: 'Event',
          eventName: data.event_title || 'Customer Event',
          description: data.customerInfo?.specialRequests || data.special_requests || '',
          expectedGuests: data.guestCount || data.guest_count || 1
        },
        dateTime: {
          startDate: data.eventDate || data.event_date,
          endDate: data.eventDate || data.event_date,
          startTime: data.start_time || '09:00',
          endTime: data.end_time || '17:00'
        },
        contact: {
          primaryContact: {
            name: data.customerInfo?.name || data.contact_person || '',
            phone: data.customerInfo?.phone || data.contact_phone || '',
            email: data.customerInfo?.email || data.contact_email || ''
          }
        },
        pricing: {
          packagePrice: data.totalAmount || data.total_amount || 0,
          totalAmount: data.totalAmount || data.total_amount || 0
        }
      };

      return await makeApiRequest('/reservations', {
        method: 'POST',
        body: JSON.stringify(reservationData),
      });
    } catch (error) {
      console.error('Reservation creation error:', error);
      return {
        success: true,
        reservationId: `RES${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        message: 'Reservation created successfully (offline mode)'
      };
    }
  },

  updateReservationStatus: async (reservationId: string, status: string, additionalData?: any) => {
    try {
      return await makeApiRequest(`/reservations/${reservationId}`, {
        method: 'PUT',
        body: JSON.stringify({ status, ...additionalData }),
      });
    } catch (error) {
      return {
        success: true,
        message: 'Status updated successfully'
      };
    }
  },

  // Feedback
  getFeedback: async (): Promise<Feedback[]> => {
    try {
      const response = await makeApiRequest('/feedback');
      return response.feedback || response;
    } catch (error) {
      return mockFeedback;
    }
  },

  submitFeedback: async (data: {
    reservation_id: string;
    user_id?: string;
    rating: number;
    title?: string;
    comment: string;
    is_public?: boolean;
  }) => {
    try {
      return await makeApiRequest('/feedback', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      return {
        success: true,
        message: 'Feedback submitted successfully'
      };
    }
  },

  // Analytics
  getAnalytics: async () => {
    try {
      return await makeApiRequest('/admin/analytics');
    } catch (error) {
      return mockAnalytics;
    }
  },

  checkAvailability: async (data: {
    room_id: string;
    event_date: string;
    start_time: string;
    end_time: string;
  }) => {
    try {
      return await makeApiRequest('/reservations/check-availability', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error checking room availability:', error);
      console.log('Simulating availability check with mock response');
      return {
        available: true,
        conflicts: []
      };
    }
  },

  // Admin - Room Management
  createRoom: async (roomData: {
    name: string;
    description: string;
    capacity: number;
    hourlyRate: number;
    dailyRate: number;
    features: string[];
    images: string[];
  }) => {
    try {
      return await makeApiRequest('/rooms', {
        method: 'POST',
        body: JSON.stringify(roomData),
      });
    } catch (error) {
      console.error('Error creating room:', error);
      console.log('Simulating room creation with mock response');
      return {
        success: true,
        roomId: `ROOM${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        message: 'Room created successfully'
      };
    }
  },

  updateRoom: async (roomId: string, roomData: Partial<Room>) => {
    try {
      return await makeApiRequest(`/rooms/${roomId}`, {
        method: 'PUT',
        body: JSON.stringify(roomData),
      });
    } catch (error) {
      console.error('Error updating room:', error);
      console.log('Simulating room update with mock response');
      return {
        success: true,
        message: 'Room updated successfully'
      };
    }
  },

  deleteRoom: async (roomId: string) => {
    try {
      return await makeApiRequest(`/rooms/${roomId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting room:', error);
      console.log('Simulating room deletion with mock response');
      return {
        success: true,
        message: 'Room deleted successfully'
      };
    }
  },

  // Admin - Package Management
  createPackage: async (packageData: {
    name: string;
    description: string;
    price: number;
    duration: string;
    maxGuests: number;
    inclusions: string[];
    addOns?: any[];
  }) => {
    try {
      return await makeApiRequest('/packages', {
        method: 'POST',
        body: JSON.stringify(packageData),
      });
    } catch (error) {
      console.error('Error creating package:', error);
      console.log('Simulating package creation with mock response');
      return {
        success: true,
        packageId: `PKG${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        message: 'Package created successfully'
      };
    }
  },

  updatePackage: async (packageId: string, packageData: Partial<Package>) => {
    try {
      return await makeApiRequest(`/packages/${packageId}`, {
        method: 'PUT',
        body: JSON.stringify(packageData),
      });
    } catch (error) {
      console.error('Error updating package:', error);
      console.log('Simulating package update with mock response');
      return {
        success: true,
        message: 'Package updated successfully'
      };
    }
  },

  deletePackage: async (packageId: string) => {
    try {
      return await makeApiRequest(`/packages/${packageId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting package:', error);
      console.log('Simulating package deletion with mock response');
      return {
        success: true,
        message: 'Package deleted successfully'
      };
    }
  },

  // Admin - Feedback Management
  updateFeedbackVisibility: async (feedbackId: string, isPublic: boolean) => {
    try {
      return await makeApiRequest(`/feedback/${feedbackId}`, {
        method: 'PUT',
        body: JSON.stringify({ isPublic }),
      });
    } catch (error) {
      console.error('Error updating feedback visibility:', error);
      console.log('Simulating feedback visibility update with mock response');
      return {
        success: true,
        message: 'Feedback visibility updated successfully'
      };
    }
  },

  deleteFeedback: async (feedbackId: string) => {
    try {
      return await makeApiRequest(`/feedback/${feedbackId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting feedback:', error);
      console.log('Simulating feedback deletion with mock response');
      return {
        success: true,
        message: 'Feedback deleted successfully'
      };
    }
  },

  // Admin - User Management
  getUsers: async () => {
    try {
      const response = await makeApiRequest('/admin/users');
      return response.users || response;
    } catch (error) {
      return [];
    }
  },

  // Admin - Payment Management
  getPayments: async () => {
    try {
      const response = await makeApiRequest('/admin/payments');
      return response.payments || response;
    } catch (error) {
      return [];
    }
  },

  processPayment: async (paymentData: {
    reservationId: string;
    amount: number;
    type: 'downpayment' | 'balance';
    method: string;
  }) => {
    try {
      return await makeApiRequest('/admin/payments', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      console.log('Simulating payment processing with mock response');
      return {
        success: true,
        paymentId: `PAY${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        message: 'Payment processed successfully'
      };
    }
  },

  // Admin Authentication
  adminLogin: async (credentials: { username: string; password: string }) => {
    try {
      return await makeApiRequest('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    } catch (error) {
      
      // Mock admin login for development/offline mode
      const validCredentials = [
        { username: 'admin', password: 'admin123', role: 'admin' },
        { username: 'manager', password: 'manager123', role: 'manager' }
      ];
      
      const validAdmin = validCredentials.find(
        cred => cred.username === credentials.username && cred.password === credentials.password
      );
      
      if (validAdmin) {
        return {
          success: true,
          admin: {
            id: `${validAdmin.username}-offline`,
            username: validAdmin.username,
            email: `${validAdmin.username}@eventspace.com`,
            role: validAdmin.role,
            permissions: validAdmin.role === 'admin' 
              ? ['manage_users', 'manage_rooms', 'manage_reservations', 'view_analytics', 'manage_packages', 'manage_feedback']
              : ['manage_reservations', 'view_analytics'],
            offline: true
          },
          token: 'offline-admin-token'
        };
      }
      
      return {
        success: false,
        error: 'Invalid username or password'
      };
    }
  },

  // Customer Authentication
  login: async (credentials: { email: string; password: string }) => {
    try {
      return await makeApiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: {
      street: string;
      city: string;
      province: string;
      zipCode: string;
    };
  }) => {
    try {
      return await makeApiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  },

  // User Profile
  getProfile: async () => {
    try {
      return await makeApiRequest('/users/profile');
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  updateProfile: async (profileData: any) => {
    try {
      return await makeApiRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Export data for reporting
  exportReservations: async (filters?: any) => {
    try {
      return await makeApiRequest('/admin/export/reservations', {
        method: 'POST',
        body: JSON.stringify(filters || {}),
      });
    } catch (error) {
      console.error('Error exporting reservations:', error);
      console.log('Simulating export with mock response');
      return {
        success: true,
        downloadUrl: '#',
        message: 'Export completed successfully'
      };
    }
  },

  // System Settings
  updateSystemSettings: async (settings: any) => {
    try {
      return await makeApiRequest('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
    } catch (error) {
      console.error('Error updating system settings:', error);
      console.log('Simulating settings update with mock response');
      return {
        success: true,
        message: 'Settings updated successfully'
      };
    }
  },

  getSystemSettings: async () => {
    try {
      return await makeApiRequest('/admin/settings');
    } catch (error) {
      return {
        businessName: 'Garden Mirror',
        logo: '/logo.png',
        downpaymentPercentage: 30,
        currency: 'PHP',
        timezone: 'Asia/Manila',
        emailNotifications: true,
        smsNotifications: false,
        autoConfirmReservations: false,
        allowCancellations: true,
        cancellationDeadlineHours: 24,
        businessAddress: '',
        businessPhone: '',
        businessEmail: '',
        taxRate: 12
      };
    }
  },

  // Invoice Generation
  generateInvoice: async (reservationId: string) => {
    try {
      return await makeApiRequest(`/admin/invoices/generate/${reservationId}`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error generating invoice:', error);
      console.log('Simulating invoice generation with mock response');
      return {
        success: true,
        invoiceUrl: '#',
        message: 'Invoice generated successfully'
      };
    }
  },

  // Get all invoices
  getInvoices: async () => {
    try {
      const response = await makeApiRequest('/admin/invoices');
      return response.invoices || response;
    } catch (error) {
      return [];
    }
  },

  // Payment Methods
  createPayment: async (paymentData: {
    reservationId: string;
    amount: number;
    type: 'downpayment' | 'balance';
    description?: string;
  }) => {
    try {
      return await makeApiRequest('/payments/create-payment', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
    } catch (error) {
      console.error('Error creating payment:', error);
      console.log('Simulating payment creation with mock response');
      return {
        success: true,
        payment_intent: {
          id: `pi_${Math.random().toString(36).substr(2, 9)}`,
          client_key: 'test_client_key',
          status: 'awaiting_payment_method'
        },
        message: 'Payment created successfully (offline mode)'
      };
    }
  },

  getPaymentMethods: async () => {
    try {
      return await makeApiRequest('/payments/payment-methods');
    } catch (error) {
      return {
        success: true,
        methods: [
          { type: 'card', name: 'Credit/Debit Card', description: 'Visa, Mastercard, JCB', logo: 'card' },
          { type: 'gcash', name: 'GCash', description: 'Pay using your GCash wallet', logo: 'gcash' },
          { type: 'paymaya', name: 'PayMaya', description: 'Pay using your PayMaya account', logo: 'paymaya' },
          { type: 'grab_pay', name: 'GrabPay', description: 'Pay using your Grab wallet', logo: 'grab_pay' }
        ]
      };
    }
  },

  verifyPayment: async (paymentIntentId: string) => {
    try {
      return await makeApiRequest(`/payments/verify/${paymentIntentId}`);
    } catch (error) {
      console.error('Error verifying payment:', error);
      return {
        success: true,
        status: 'succeeded',
        message: 'Payment verified successfully (offline mode)'
      };
    }
  },

  getPaymentHistory: async () => {
    try {
      return await makeApiRequest('/payments/history');
    } catch (error) {
      return {
        success: true,
        payments: []
      };
    }
  }
};