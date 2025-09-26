export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  role?: 'customer' | 'admin';
  email_verified?: boolean;
  created_at: string;
  updated_at: string;
  // Legacy fields for backward compatibility
  name?: string;
  createdAt?: Date;
}

export interface Admin {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  permissions?: any;
  last_login?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  area?: number;
  status?: 'available' | 'occupied' | 'maintenance';
  hourly_rate: number;
  daily_rate: number;
  features?: string[];
  images: string[];
  floor_plan_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Legacy fields for backward compatibility
  price?: number;
  amenities?: string[];
}

export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_hours: number;
  max_guests: number;
  included_services?: string[];
  add_on_services?: any[];
  images: string[];
  is_popular?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Legacy fields for backward compatibility
  inclusions?: string[];
  duration?: string;
}

export interface Reservation {
  id: string;
  user_id?: string;
  room_id: string;
  package_id?: string;
  event_id?: string;
  event_title: string;
  event_date: string;
  start_time: string;
  end_time: string;
  guest_count: number;
  base_amount: number;
  additional_services?: any[];
  total_amount: number;
  downpayment_amount: number;
  balance_amount: number;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  special_requests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  confirmed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  // Relations
  user?: User;
  room?: Room;
  package?: Package;
  event?: Event;
  // Legacy fields for backward compatibility
  userId?: string;
  roomId?: string;
  packageId?: string;
  eventDate?: string | Date;
  guestCount?: number;
  totalAmount?: number;
  downpayment?: number;
  balance?: number;
  specialRequests?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
}

export interface Payment {
  id: string;
  reservation_id: string;
  amount: number;
  payment_type: 'downpayment' | 'balance' | 'full';
  payment_method?: string;
  transaction_id?: string;
  gateway_response?: any;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paid_at?: string;
  failed_at?: string;
  failure_reason?: string;
  invoice_number?: string;
  invoice_url?: string;
  created_at: string;
  updated_at: string;
  // Relations
  reservation?: Reservation;
  // Legacy fields for backward compatibility
  reservationId?: string;
  type?: 'downpayment' | 'balance';
  method?: 'credit_card' | 'bank_transfer' | 'cash';
  transactionId?: string;
  paidAt?: Date;
}

export interface Feedback {
  id: string;
  reservation_id: string;
  user_id?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  status: 'pending' | 'approved' | 'rejected';
  moderated_by?: string;
  moderated_at?: string;
  moderation_notes?: string;
  is_featured?: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  reservation?: Reservation;
  user?: User;
  // Legacy fields for backward compatibility
  userId?: string;
  reservationId?: string;
  isPublic?: boolean;
  createdAt?: string | Date;
  customerInfo?: {
    name: string;
    email: string;
  };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  base_price: number;
  duration_hours: number;
  min_guests?: number;
  max_guests?: number;
  requirements?: any;
  images: string[];
  status: 'draft' | 'published' | 'archived';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Legacy fields for backward compatibility
  date?: Date;
}

export interface ChatbotSession {
  id: string;
  user_id?: string;
  session_id: string;
  messages: any[];
  context?: any;
  user_agent?: string;
  ip_address?: string;
  is_resolved: boolean;
  satisfaction_rating?: number;
  created_at: string;
  updated_at: string;
}

export interface FileManagement {
  id: string;
  original_name: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  firebase_url?: string;
  firebase_path?: string;
  entity_type: string;
  entity_id: string;
  uploaded_by?: string;
  description?: string;
  alt_text?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}