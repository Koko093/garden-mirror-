-- Business logic functions for reservation management

-- Function to get available time slots for a room on a specific date
CREATE OR REPLACE FUNCTION get_available_time_slots(
    p_room_id UUID,
    p_event_date DATE,
    p_duration_hours INTEGER DEFAULT 4
)
RETURNS TABLE(
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN
) AS $$
DECLARE
    current_time TIME;
    slot_end TIME;
    business_start TIME := '08:00:00';
    business_end TIME := '23:00:00';
BEGIN
    current_time := business_start;
    
    WHILE current_time < business_end LOOP
        slot_end := current_time + (p_duration_hours || ' hours')::INTERVAL;
        
        IF slot_end <= business_end THEN
            RETURN QUERY
            SELECT 
                current_time,
                slot_end,
                check_room_availability(p_room_id, p_event_date, current_time, slot_end);
        END IF;
        
        current_time := current_time + '1 hour'::INTERVAL;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to create a new reservation
CREATE OR REPLACE FUNCTION create_reservation(
    p_user_id UUID,
    p_room_id UUID,
    p_package_id UUID DEFAULT NULL,
    p_event_id UUID DEFAULT NULL,
    p_event_title TEXT,
    p_event_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_guest_count INTEGER,
    p_contact_person TEXT,
    p_contact_phone TEXT,
    p_contact_email TEXT,
    p_special_requests TEXT DEFAULT NULL,
    p_additional_services JSONB DEFAULT '[]'
)
RETURNS UUID AS $$
DECLARE
    reservation_id UUID;
    base_amount DECIMAL(10,2);
    total_amount DECIMAL(10,2);
    downpayment_amount DECIMAL(10,2);
    balance_amount DECIMAL(10,2);
    room_rate DECIMAL(10,2);
    duration_hours INTEGER;
    package_price DECIMAL(10,2) := 0;
    event_price DECIMAL(10,2) := 0;
    additional_cost DECIMAL(10,2) := 0;
    service JSONB;
BEGIN
    -- Check room availability
    IF NOT check_room_availability(p_room_id, p_event_date, p_start_time, p_end_time) THEN
        RAISE EXCEPTION 'Room is not available for the selected time slot';
    END IF;
    
    -- Calculate duration in hours
    duration_hours := EXTRACT(EPOCH FROM (p_end_time - p_start_time)) / 3600;
    
    -- Get room hourly rate
    SELECT hourly_rate INTO room_rate FROM rooms WHERE id = p_room_id;
    
    -- Get package price if selected
    IF p_package_id IS NOT NULL THEN
        SELECT price INTO package_price FROM packages WHERE id = p_package_id;
    END IF;
    
    -- Get event price if selected
    IF p_event_id IS NOT NULL THEN
        SELECT base_price INTO event_price FROM events WHERE id = p_event_id;
    END IF;
    
    -- Calculate additional services cost
    FOR service IN SELECT * FROM jsonb_array_elements(p_additional_services)
    LOOP
        additional_cost := additional_cost + (service->>'price')::DECIMAL(10,2);
    END LOOP;
    
    -- Calculate total amounts
    base_amount := (room_rate * duration_hours) + package_price + event_price;
    total_amount := base_amount + additional_cost;
    downpayment_amount := total_amount * 0.30;
    balance_amount := total_amount - downpayment_amount;
    
    -- Create reservation
    INSERT INTO reservations (
        user_id, room_id, package_id, event_id,
        event_title, event_date, start_time, end_time, guest_count,
        base_amount, additional_services, total_amount, downpayment_amount, balance_amount,
        contact_person, contact_phone, contact_email, special_requests,
        status
    ) VALUES (
        p_user_id, p_room_id, p_package_id, p_event_id,
        p_event_title, p_event_date, p_start_time, p_end_time, p_guest_count,
        base_amount, p_additional_services, total_amount, downpayment_amount, balance_amount,
        p_contact_person, p_contact_phone, p_contact_email, p_special_requests,
        'pending'
    ) RETURNING id INTO reservation_id;
    
    RETURN reservation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update reservation status
CREATE OR REPLACE FUNCTION update_reservation_status(
    p_reservation_id UUID,
    p_status reservation_status,
    p_admin_id UUID DEFAULT NULL,
    p_cancellation_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update reservation status
    UPDATE reservations 
    SET status = p_status,
        cancellation_reason = CASE WHEN p_status = 'cancelled' THEN p_cancellation_reason ELSE cancellation_reason END,
        updated_at = NOW()
    WHERE id = p_reservation_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to process payment
CREATE OR REPLACE FUNCTION process_payment(
    p_reservation_id UUID,
    p_amount DECIMAL(10,2),
    p_payment_type payment_type,
    p_payment_method TEXT,
    p_transaction_id TEXT DEFAULT NULL,
    p_gateway_response JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    payment_id UUID;
    expected_amount DECIMAL(10,2);
BEGIN
    -- Validate payment amount based on type
    IF p_payment_type = 'downpayment' THEN
        SELECT downpayment_amount INTO expected_amount FROM reservations WHERE id = p_reservation_id;
    ELSIF p_payment_type = 'balance' THEN
        SELECT balance_amount INTO expected_amount FROM reservations WHERE id = p_reservation_id;
    ELSE -- full payment
        SELECT total_amount INTO expected_amount FROM reservations WHERE id = p_reservation_id;
    END IF;
    
    IF p_amount != expected_amount THEN
        RAISE EXCEPTION 'Payment amount does not match expected amount';
    END IF;
    
    -- Create payment record
    INSERT INTO payments (
        reservation_id, amount, payment_type, payment_method,
        transaction_id, gateway_response, status
    ) VALUES (
        p_reservation_id, p_amount, p_payment_type, p_payment_method,
        p_transaction_id, p_gateway_response, 'paid'
    ) RETURNING id INTO payment_id;
    
    -- Update reservation status if downpayment is completed
    IF p_payment_type = 'downpayment' THEN
        UPDATE reservations 
        SET status = 'confirmed', confirmed_at = NOW()
        WHERE id = p_reservation_id;
    END IF;
    
    RETURN payment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get reservation details with related data
CREATE OR REPLACE FUNCTION get_reservation_details(
    p_reservation_id UUID
)
RETURNS TABLE(
    reservation_id UUID,
    user_email TEXT,
    user_name TEXT,
    room_name TEXT,
    package_name TEXT,
    event_title TEXT,
    event_date DATE,
    start_time TIME,
    end_time TIME,
    guest_count INTEGER,
    total_amount DECIMAL(10,2),
    downpayment_amount DECIMAL(10,2),
    balance_amount DECIMAL(10,2),
    status reservation_status,
    contact_person TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    payments JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        u.email,
        u.first_name || ' ' || u.last_name,
        rm.name,
        p.name,
        r.event_title,
        r.event_date,
        r.start_time,
        r.end_time,
        r.guest_count,
        r.total_amount,
        r.downpayment_amount,
        r.balance_amount,
        r.status,
        r.contact_person,
        r.contact_phone,
        r.contact_email,
        r.special_requests,
        r.created_at,
        COALESCE(
            (SELECT jsonb_agg(jsonb_build_object(
                'id', pay.id,
                'amount', pay.amount,
                'payment_type', pay.payment_type,
                'payment_method', pay.payment_method,
                'status', pay.status,
                'paid_at', pay.paid_at,
                'invoice_number', pay.invoice_number
            )) FROM payments pay WHERE pay.reservation_id = r.id),
            '[]'::jsonb
        )
    FROM reservations r
    JOIN users u ON r.user_id = u.id
    JOIN rooms rm ON r.room_id = rm.id
    LEFT JOIN packages p ON r.package_id = p.id
    WHERE r.id = p_reservation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get dashboard statistics for admin
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats(
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
    total_reservations INTEGER,
    confirmed_reservations INTEGER,
    pending_reservations INTEGER,
    cancelled_reservations INTEGER,
    total_revenue DECIMAL(10,2),
    pending_revenue DECIMAL(10,2),
    popular_rooms JSONB,
    popular_packages JSONB,
    monthly_bookings JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM reservations WHERE created_at::DATE BETWEEN p_start_date AND p_end_date),
        (SELECT COUNT(*)::INTEGER FROM reservations WHERE status = 'confirmed' AND created_at::DATE BETWEEN p_start_date AND p_end_date),
        (SELECT COUNT(*)::INTEGER FROM reservations WHERE status = 'pending' AND created_at::DATE BETWEEN p_start_date AND p_end_date),
        (SELECT COUNT(*)::INTEGER FROM reservations WHERE status = 'cancelled' AND created_at::DATE BETWEEN p_start_date AND p_end_date),
        (SELECT COALESCE(SUM(total_amount), 0) FROM reservations WHERE status = 'confirmed' AND created_at::DATE BETWEEN p_start_date AND p_end_date),
        (SELECT COALESCE(SUM(total_amount), 0) FROM reservations WHERE status = 'pending' AND created_at::DATE BETWEEN p_start_date AND p_end_date),
        (SELECT jsonb_agg(jsonb_build_object('room_name', rm.name, 'booking_count', booking_count))
         FROM (
             SELECT room_id, COUNT(*) as booking_count
             FROM reservations 
             WHERE created_at::DATE BETWEEN p_start_date AND p_end_date
             GROUP BY room_id 
             ORDER BY booking_count DESC 
             LIMIT 5
         ) r
         JOIN rooms rm ON r.room_id = rm.id),
        (SELECT jsonb_agg(jsonb_build_object('package_name', p.name, 'booking_count', booking_count))
         FROM (
             SELECT package_id, COUNT(*) as booking_count
             FROM reservations 
             WHERE package_id IS NOT NULL AND created_at::DATE BETWEEN p_start_date AND p_end_date
             GROUP BY package_id 
             ORDER BY booking_count DESC 
             LIMIT 5
         ) r
         JOIN packages p ON r.package_id = p.id),
        (SELECT jsonb_agg(jsonb_build_object('month', month_year, 'booking_count', booking_count))
         FROM (
             SELECT 
                 TO_CHAR(created_at, 'YYYY-MM') as month_year,
                 COUNT(*) as booking_count
             FROM reservations 
             WHERE created_at::DATE BETWEEN p_start_date AND p_end_date
             GROUP BY TO_CHAR(created_at, 'YYYY-MM')
             ORDER BY month_year
         ) monthly_data);
END;
$$ LANGUAGE plpgsql;

-- Function to get user reservation history
CREATE OR REPLACE FUNCTION get_user_reservations(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    reservation_id UUID,
    room_name TEXT,
    package_name TEXT,
    event_title TEXT,
    event_date DATE,
    start_time TIME,
    end_time TIME,
    guest_count INTEGER,
    total_amount DECIMAL(10,2),
    status reservation_status,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        rm.name,
        p.name,
        r.event_title,
        r.event_date,
        r.start_time,
        r.end_time,
        r.guest_count,
        r.total_amount,
        r.status,
        r.created_at
    FROM reservations r
    JOIN rooms rm ON r.room_id = rm.id
    LEFT JOIN packages p ON r.package_id = p.id
    WHERE r.user_id = p_user_id
    ORDER BY r.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;