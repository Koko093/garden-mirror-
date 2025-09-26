-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_management ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    -- Check if user is an admin
    IF EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) THEN
        RETURN 'admin';
    -- Check if user is a customer
    ELSIF EXISTS (SELECT 1 FROM users WHERE id = auth.uid()) THEN
        RETURN 'customer';
    ELSE
        RETURN 'anonymous';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "Admins can update users" ON users
    FOR UPDATE USING (get_user_role() = 'admin');

-- Admins table policies
CREATE POLICY "Admins can view other admins" ON admins
    FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "Admins can update their own profile" ON admins
    FOR UPDATE USING (id = auth.uid());

-- Rooms table policies
CREATE POLICY "Anyone can view active rooms" ON rooms
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage rooms" ON rooms
    FOR ALL USING (get_user_role() = 'admin');

-- Packages table policies
CREATE POLICY "Anyone can view active packages" ON packages
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage packages" ON packages
    FOR ALL USING (get_user_role() = 'admin');

-- Events table policies
CREATE POLICY "Anyone can view published events" ON events
    FOR SELECT USING (status = 'published' AND is_active = true);

CREATE POLICY "Admins can manage events" ON events
    FOR ALL USING (get_user_role() = 'admin');

-- Reservations table policies
CREATE POLICY "Users can view their own reservations" ON reservations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create reservations" ON reservations
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pending reservations" ON reservations
    FOR UPDATE USING (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins can view all reservations" ON reservations
    FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "Admins can update reservations" ON reservations
    FOR UPDATE USING (get_user_role() = 'admin');

CREATE POLICY "Admins can delete reservations" ON reservations
    FOR DELETE USING (get_user_role() = 'admin');

-- Payments table policies
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM reservations 
        WHERE reservations.id = reservation_id 
        AND reservations.user_id = auth.uid()
    ));

CREATE POLICY "Users can create payments for their reservations" ON payments
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM reservations 
        WHERE reservations.id = reservation_id 
        AND reservations.user_id = auth.uid()
    ));

CREATE POLICY "Admins can manage all payments" ON payments
    FOR ALL USING (get_user_role() = 'admin');

-- Feedback table policies
CREATE POLICY "Anyone can view approved public feedback" ON feedback
    FOR SELECT USING (status = 'approved' AND is_public = true);

CREATE POLICY "Users can create feedback for their reservations" ON feedback
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND EXISTS (
            SELECT 1 FROM reservations 
            WHERE reservations.id = reservation_id 
            AND reservations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own feedback" ON feedback
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own pending feedback" ON feedback
    FOR UPDATE USING (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins can manage all feedback" ON feedback
    FOR ALL USING (get_user_role() = 'admin');

-- Chatbot sessions policies
CREATE POLICY "Users can view their own chat sessions" ON chatbot_sessions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own chat sessions" ON chatbot_sessions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own chat sessions" ON chatbot_sessions
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all chat sessions" ON chatbot_sessions
    FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "Anonymous users can create chat sessions" ON chatbot_sessions
    FOR INSERT WITH CHECK (user_id IS NULL);

CREATE POLICY "Anonymous users can update their sessions by session_id" ON chatbot_sessions
    FOR UPDATE USING (user_id IS NULL AND session_id = current_setting('app.session_id', true));

-- File management policies
CREATE POLICY "Anyone can view active files" ON file_management
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can upload files" ON file_management
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own uploaded files" ON file_management
    FOR UPDATE USING (uploaded_by = auth.uid());

CREATE POLICY "Admins can manage all files" ON file_management
    FOR ALL USING (get_user_role() = 'admin');

-- Create functions for business logic

-- Function to automatically generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    invoice_num TEXT;
    counter INTEGER;
BEGIN
    -- Get current year and month
    SELECT EXTRACT(YEAR FROM NOW())::TEXT || EXTRACT(MONTH FROM NOW())::TEXT INTO invoice_num;
    
    -- Get count of invoices this month
    SELECT COUNT(*) + 1 INTO counter
    FROM payments 
    WHERE invoice_number LIKE invoice_num || '%';
    
    -- Format: YYYYMM-0001
    RETURN invoice_num || '-' || LPAD(counter::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to validate reservation time slots
CREATE OR REPLACE FUNCTION check_room_availability(
    p_room_id UUID,
    p_event_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_reservation_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if the room is available for the requested time slot
    RETURN NOT EXISTS (
        SELECT 1 FROM reservations
        WHERE room_id = p_room_id
        AND event_date = p_event_date
        AND status IN ('confirmed', 'pending')
        AND (p_reservation_id IS NULL OR id != p_reservation_id)
        AND (
            (start_time <= p_start_time AND end_time > p_start_time) OR
            (start_time < p_end_time AND end_time >= p_end_time) OR
            (start_time >= p_start_time AND end_time <= p_end_time)
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set payment amounts and generate invoice numbers
CREATE OR REPLACE FUNCTION set_payment_details()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate invoice number if not provided
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number := generate_invoice_number();
    END IF;
    
    -- Set payment status to paid and timestamp when marked as paid
    IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
        NEW.paid_at := NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_payment_details
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION set_payment_details();

-- Trigger to validate room availability before reservation
CREATE OR REPLACE FUNCTION validate_reservation()
RETURNS TRIGGER AS $$
BEGIN
    -- Check room availability
    IF NOT check_room_availability(NEW.room_id, NEW.event_date, NEW.start_time, NEW.end_time, NEW.id) THEN
        RAISE EXCEPTION 'Room is not available for the selected time slot';
    END IF;
    
    -- Set confirmation timestamp when status changes to confirmed
    IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
        NEW.confirmed_at := NOW();
    END IF;
    
    -- Set cancellation timestamp when status changes to cancelled
    IF NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled') THEN
        NEW.cancelled_at := NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_reservation
    BEFORE INSERT OR UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION validate_reservation();