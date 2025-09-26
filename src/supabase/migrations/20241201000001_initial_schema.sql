-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_type AS ENUM ('downpayment', 'balance', 'full');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE room_status AS ENUM ('available', 'occupied', 'maintenance');
CREATE TYPE feedback_status AS ENUM ('pending', 'approved', 'rejected');

-- Users table (for customer authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    address TEXT,
    role user_role DEFAULT 'customer',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admins table (separate from users for enhanced security)
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    permissions JSONB DEFAULT '{}',
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rooms table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    area DECIMAL(10,2), -- in square meters
    status room_status DEFAULT 'available',
    hourly_rate DECIMAL(10,2) NOT NULL CHECK (hourly_rate >= 0),
    daily_rate DECIMAL(10,2) NOT NULL CHECK (daily_rate >= 0),
    features JSONB DEFAULT '[]', -- Array of features like ["projector", "air_conditioning", "wifi"]
    images JSONB DEFAULT '[]', -- Array of image URLs
    floor_plan_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Packages table
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    duration_hours INTEGER NOT NULL CHECK (duration_hours > 0),
    max_guests INTEGER NOT NULL CHECK (max_guests > 0),
    included_services JSONB DEFAULT '[]', -- Array of included services
    add_on_services JSONB DEFAULT '[]', -- Array of optional add-ons with prices
    images JSONB DEFAULT '[]', -- Array of image URLs
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table (template events that can be booked)
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- e.g., "wedding", "corporate", "birthday"
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
    duration_hours INTEGER NOT NULL CHECK (duration_hours > 0),
    min_guests INTEGER DEFAULT 1,
    max_guests INTEGER,
    requirements JSONB DEFAULT '{}', -- Special requirements or notes
    images JSONB DEFAULT '[]',
    status event_status DEFAULT 'published',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reservations table
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE RESTRICT,
    package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    
    -- Event details
    event_title VARCHAR(200) NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    guest_count INTEGER NOT NULL CHECK (guest_count > 0),
    
    -- Pricing
    base_amount DECIMAL(10,2) NOT NULL CHECK (base_amount >= 0),
    additional_services JSONB DEFAULT '[]', -- Array of selected add-on services with prices
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    downpayment_amount DECIMAL(10,2) NOT NULL CHECK (downpayment_amount >= 0),
    balance_amount DECIMAL(10,2) NOT NULL CHECK (balance_amount >= 0),
    
    -- Contact and special requirements
    contact_person VARCHAR(200) NOT NULL,
    contact_phone VARCHAR(15) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    special_requests TEXT,
    
    -- Status and dates
    status reservation_status DEFAULT 'pending',
    confirmed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_time_range CHECK (start_time < end_time),
    CONSTRAINT valid_downpayment CHECK (downpayment_amount = total_amount * 0.30),
    CONSTRAINT valid_balance CHECK (balance_amount = total_amount - downpayment_amount)
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
    
    -- Payment details
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_type payment_type NOT NULL,
    payment_method VARCHAR(50), -- e.g., "credit_card", "bank_transfer", "cash"
    
    -- Payment gateway information
    transaction_id VARCHAR(100),
    gateway_response JSONB DEFAULT '{}',
    
    -- Status and dates
    status payment_status DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    
    -- Invoice information
    invoice_number VARCHAR(50) UNIQUE,
    invoice_url VARCHAR(500),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback table
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Feedback content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT NOT NULL,
    
    -- Media attachments
    images JSONB DEFAULT '[]',
    
    -- Moderation
    status feedback_status DEFAULT 'pending',
    moderated_by UUID REFERENCES admins(id) ON DELETE SET NULL,
    moderated_at TIMESTAMP WITH TIME ZONE,
    moderation_notes TEXT,
    
    -- Display settings
    is_featured BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chatbot table (for storing chat sessions and training data)
CREATE TABLE chatbot_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(100) NOT NULL, -- For anonymous users
    
    -- Conversation data
    messages JSONB NOT NULL DEFAULT '[]', -- Array of message objects
    context JSONB DEFAULT '{}', -- Current conversation context
    
    -- Session metadata
    user_agent TEXT,
    ip_address INET,
    is_resolved BOOLEAN DEFAULT FALSE,
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File Management table (for Firebase integration)
CREATE TABLE file_management (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- File information
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL CHECK (file_size > 0),
    mime_type VARCHAR(100) NOT NULL,
    
    -- Firebase storage information
    firebase_url VARCHAR(500),
    firebase_path VARCHAR(500),
    
    -- Association
    entity_type VARCHAR(50) NOT NULL, -- e.g., "room", "package", "event", "feedback"
    entity_id UUID NOT NULL,
    
    -- Metadata
    uploaded_by UUID, -- Can reference either users or admins
    description TEXT,
    alt_text VARCHAR(255), -- For accessibility
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_room_id ON reservations(room_id);
CREATE INDEX idx_reservations_event_date ON reservations(event_date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_payments_reservation_id ON payments(reservation_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_feedback_reservation_id ON feedback(reservation_id);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_rating ON feedback(rating);
CREATE INDEX idx_chatbot_sessions_user_id ON chatbot_sessions(user_id);
CREATE INDEX idx_chatbot_sessions_session_id ON chatbot_sessions(session_id);
CREATE INDEX idx_file_management_entity ON file_management(entity_type, entity_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chatbot_sessions_updated_at BEFORE UPDATE ON chatbot_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_file_management_updated_at BEFORE UPDATE ON file_management FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();