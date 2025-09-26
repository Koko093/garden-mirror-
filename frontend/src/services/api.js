import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('admin');
      window.location.href = '/login';
    }
    
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  // User Authentication
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),

  // Admin Authentication
  adminLogin: (credentials) => api.post('/auth/admin/login', credentials),
  adminLogout: () => api.post('/auth/admin/logout'),
  getAdminProfile: () => api.get('/auth/admin/me'),
};

// Users API
export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUserStats: () => api.get('/users/stats'),
};

// Packages API
export const packagesAPI = {
  getPackages: (params) => api.get('/packages', { params }),
  getPackage: (id) => api.get(`/packages/${id}`),
  createPackage: (packageData) => api.post('/packages', packageData),
  updatePackage: (id, packageData) => api.put(`/packages/${id}`, packageData),
  deletePackage: (id) => api.delete(`/packages/${id}`),
  getPopularPackages: (limit = 6) => api.get(`/packages/popular?limit=${limit}`),
  getPackagesByCategory: (category, limit = 10) => api.get(`/packages/category/${category}?limit=${limit}`),
  incrementViews: (id) => api.post(`/packages/${id}/views`),
  addReview: (id, reviewData) => api.post(`/packages/${id}/reviews`, reviewData),
};

// Reservations API
export const reservationsAPI = {
  getReservations: (params) => api.get('/reservations', { params }),
  getReservation: (id) => api.get(`/reservations/${id}`),
  createReservation: (reservationData) => api.post('/reservations', reservationData),
  updateReservation: (id, reservationData) => api.put(`/reservations/${id}`, reservationData),
  deleteReservation: (id) => api.delete(`/reservations/${id}`),
  getUserReservations: (userId) => api.get(`/reservations/user/${userId}`),
  checkAvailability: (roomId, startDate, endDate) => 
    api.get(`/reservations/availability/check?roomId=${roomId}&startDate=${startDate}&endDate=${endDate}`),
  getReservationsByDateRange: (startDate, endDate, status) => 
    api.get(`/reservations/date-range?startDate=${startDate}&endDate=${endDate}&status=${status}`),
  updateStatus: (id, status, reason) => 
    api.put(`/reservations/${id}/status`, { status, reason }),
  processPayment: (id, paymentData) => 
    api.post(`/reservations/${id}/payment`, paymentData),
  addNote: (id, note) => 
    api.post(`/reservations/${id}/notes`, { note }),
  getStats: () => api.get('/reservations/stats'),
};

// Rooms API
export const roomsAPI = {
  getRooms: (params) => api.get('/rooms', { params }),
  getRoom: (id) => api.get(`/rooms/${id}`),
  createRoom: (roomData) => api.post('/rooms', roomData),
  updateRoom: (id, roomData) => api.put(`/rooms/${id}`, roomData),
  deleteRoom: (id) => api.delete(`/rooms/${id}`),
  getAvailableRooms: (startDate, endDate, capacity) => 
    api.get(`/rooms/available?startDate=${startDate}&endDate=${endDate}&capacity=${capacity}`),
  getRoomAvailability: (id, month, year) => 
    api.get(`/rooms/${id}/availability?month=${month}&year=${year}`),
};

// Feedback API
export const feedbackAPI = {
  getFeedback: (params) => api.get('/feedback', { params }),
  getFeedbackItem: (id) => api.get(`/feedback/${id}`),
  createFeedback: (feedbackData) => api.post('/feedback', feedbackData),
  updateFeedback: (id, feedbackData) => api.put(`/feedback/${id}`, feedbackData),
  deleteFeedback: (id) => api.delete(`/feedback/${id}`),
  getPublicFeedback: (limit = 10) => api.get(`/feedback/public?limit=${limit}`),
  moderateFeedback: (id, action) => api.put(`/feedback/${id}/moderate`, { action }),
  getFeedbackStats: () => api.get('/feedback/stats'),
};

// Events API
export const eventsAPI = {
  getEvents: (params) => api.get('/events', { params }),
  getEvent: (id) => api.get(`/events/${id}`),
  createEvent: (eventData) => api.post('/events', eventData),
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  getUpcomingEvents: (limit = 10) => api.get(`/events/upcoming?limit=${limit}`),
  getEventsByDateRange: (startDate, endDate) => 
    api.get(`/events/date-range?startDate=${startDate}&endDate=${endDate}`),
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: (message) => api.post('/chatbot/message', { message }),
  getChatHistory: (sessionId) => api.get(`/chatbot/history/${sessionId}`),
  getFAQs: () => api.get('/chatbot/faqs'),
  createFAQ: (faqData) => api.post('/chatbot/faqs', faqData),
  updateFAQ: (id, faqData) => api.put(`/chatbot/faqs/${id}`, faqData),
  deleteFAQ: (id) => api.delete(`/chatbot/faqs/${id}`),
};

// Files API
export const filesAPI = {
  uploadFile: (file, type = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteFile: (fileId) => api.delete(`/files/${fileId}`),
  getFile: (fileId) => api.get(`/files/${fileId}`),
};

// Admin API
export const adminAPI = {
  // Dashboard Stats
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getAnalytics: (period = '30d') => api.get(`/admin/analytics?period=${period}`),
  
  // Admin Management
  getAdmins: (params) => api.get('/admin/admins', { params }),
  createAdmin: (adminData) => api.post('/admin/admins', adminData),
  updateAdmin: (id, adminData) => api.put(`/admin/admins/${id}`, adminData),
  deleteAdmin: (id) => api.delete(`/admin/admins/${id}`),
  updateAdminPermissions: (id, permissions) => 
    api.put(`/admin/admins/${id}/permissions`, { permissions }),
  
  // System Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settings) => api.put('/admin/settings', settings),
  
  // Reports
  generateReport: (type, params) => api.post(`/admin/reports/${type}`, params),
  downloadReport: (reportId) => api.get(`/admin/reports/${reportId}/download`, {
    responseType: 'blob'
  }),
  
  // Activity Logs
  getActivityLogs: (params) => api.get('/admin/activity-logs', { params }),
  
  // Backup & Restore
  createBackup: () => api.post('/admin/backup'),
  getBackups: () => api.get('/admin/backups'),
  restoreBackup: (backupId) => api.post(`/admin/backup/${backupId}/restore`),
};

// Health Check
export const healthAPI = {
  check: () => api.get('/health'),
};

// Export configured axios instance for custom requests
export default api;