-- Insert sample data for development and testing

-- Sample admin users
INSERT INTO admins (id, username, email, password_hash, first_name, last_name, permissions) VALUES
(uuid_generate_v4(), 'admin', 'admin@eventspace.com', crypt('admin123', gen_salt('bf')), 'System', 'Administrator', '{"manage_users": true, "manage_rooms": true, "manage_reservations": true, "view_analytics": true}'),
(uuid_generate_v4(), 'manager', 'manager@eventspace.com', crypt('manager123', gen_salt('bf')), 'Event', 'Manager', '{"manage_rooms": true, "manage_reservations": true, "view_analytics": false}');

-- Sample customer users
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, address, email_verified) VALUES
(uuid_generate_v4(), 'john.doe@example.com', crypt('password123', gen_salt('bf')), 'John', 'Doe', '+1234567890', '123 Main St, City, State 12345', true),
(uuid_generate_v4(), 'jane.smith@example.com', crypt('password123', gen_salt('bf')), 'Jane', 'Smith', '+1987654321', '456 Oak Ave, City, State 12345', true),
(uuid_generate_v4(), 'mike.wilson@example.com', crypt('password123', gen_salt('bf')), 'Mike', 'Wilson', '+1122334455', '789 Pine Rd, City, State 12345', false);

-- Sample rooms
INSERT INTO rooms (id, name, description, capacity, area, hourly_rate, daily_rate, features, images) VALUES
(uuid_generate_v4(), 'Grand Ballroom', 'Elegant ballroom perfect for weddings and large corporate events. Features crystal chandeliers and marble floors.', 200, 500.00, 150.00, 1200.00, '["projector", "sound_system", "air_conditioning", "wifi", "stage", "dance_floor", "bar_area", "bridal_suite"]', '["https://images.unsplash.com/photo-1519167758481-83f550bb49b3", "https://images.unsplash.com/photo-1464207687429-7505649dae38"]'),

(uuid_generate_v4(), 'Garden Pavilion', 'Beautiful outdoor pavilion surrounded by lush gardens. Perfect for intimate weddings and outdoor ceremonies.', 100, 300.00, 100.00, 800.00, '["outdoor_setting", "garden_view", "string_lights", "sound_system", "wifi", "catering_prep_area"]', '["https://images.unsplash.com/photo-1519225421980-715cb0215aed", "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3"]'),

(uuid_generate_v4(), 'Executive Conference Room', 'Modern conference room ideal for business meetings and corporate events. Equipped with latest technology.', 50, 100.00, 75.00, 600.00, '["projector", "whiteboard", "video_conferencing", "air_conditioning", "wifi", "coffee_station", "flipchart"]', '["https://images.unsplash.com/photo-1497366216548-37526070297c", "https://images.unsplash.com/photo-1560472354-b33ff0c44a43"]'),

(uuid_generate_v4(), 'Rooftop Terrace', 'Stunning rooftop venue with city skyline views. Perfect for cocktail parties and evening receptions.', 80, 250.00, 120.00, 960.00, '["city_view", "outdoor_bar", "lounge_seating", "string_lights", "sound_system", "wifi", "elevator_access"]', '["https://images.unsplash.com/photo-1574362848149-11496d93a7c7", "https://images.unsplash.com/photo-1566073771259-6a8506099945"]');

-- Sample packages
INSERT INTO packages (id, name, description, price, duration_hours, max_guests, included_services, add_on_services, images, is_popular) VALUES
(uuid_generate_v4(), 'Wedding Bliss Package', 'Complete wedding package including venue, catering, decoration, and photography. Make your special day unforgettable.', 5999.00, 8, 150, '["venue_rental", "catering_for_150", "floral_decoration", "photography_6_hours", "wedding_coordinator", "sound_system", "lighting"]', '[{"name": "videography", "price": 800}, {"name": "additional_guest_meals", "price": 45}, {"name": "live_band", "price": 1200}]', '["https://images.unsplash.com/photo-1519225421980-715cb0215aed", "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6"]', true),

(uuid_generate_v4(), 'Corporate Elite Package', 'Professional corporate event package with full-service catering and AV equipment for successful business gatherings.', 2499.00, 6, 75, '["venue_rental", "business_catering_for_75", "av_equipment", "wifi", "flipchart", "coffee_breaks", "event_coordinator"]', '[{"name": "live_streaming", "price": 500}, {"name": "photographer", "price": 400}, {"name": "additional_av_equipment", "price": 200}]', '["https://images.unsplash.com/photo-1497366216548-37526070297c", "https://images.unsplash.com/photo-1511578314322-379afb476865"]', false),

(uuid_generate_v4(), 'Birthday Celebration Package', 'Fun birthday party package with decorations, entertainment, and catering. Perfect for milestone celebrations.', 1299.00, 4, 50, '["venue_rental", "party_decorations", "birthday_cake", "catering_for_50", "sound_system", "party_coordinator"]', '[{"name": "dj_service", "price": 300}, {"name": "photo_booth", "price": 250}, {"name": "balloon_arch", "price": 150}]', '["https://images.unsplash.com/photo-1464366400600-7168b8af9bc3", "https://images.unsplash.com/photo-1530103862676-de8c9debad1d"]', false),

(uuid_generate_v4(), 'Cocktail Reception Package', 'Elegant cocktail reception with premium bar service and gourmet hors d\'oeuvres for sophisticated gatherings.', 1899.00, 4, 80, '["venue_rental", "premium_bar_service", "gourmet_hors_doeuvres", "cocktail_tables", "ambient_lighting", "event_coordinator"]', '[{"name": "live_jazz_trio", "price": 600}, {"name": "premium_spirits_upgrade", "price": 300}, {"name": "cigar_bar", "price": 400}]', '["https://images.unsplash.com/photo-1574362848149-11496d93a7c7", "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136"]', true);

-- Sample events
INSERT INTO events (id, title, description, category, base_price, duration_hours, min_guests, max_guests, requirements, images) VALUES
(uuid_generate_v4(), 'Elegant Wedding Ceremony', 'Traditional wedding ceremony with full decoration and coordination services.', 'wedding', 3500.00, 6, 50, 200, '{"setup_time": "3 hours", "cleanup_time": "2 hours", "special_requirements": ["bridal_suite_access", "vendor_coordination"]}', '["https://images.unsplash.com/photo-1519225421980-715cb0215aed", "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6"]'),

(uuid_generate_v4(), 'Corporate Conference', 'Professional business conference with full AV support and catering.', 'corporate', 1800.00, 8, 20, 100, '{"av_requirements": ["projector", "microphones", "laptops"], "catering": "business_lunch"}', '["https://images.unsplash.com/photo-1497366216548-37526070297c", "https://images.unsplash.com/photo-1511578314322-379afb476865"]'),

(uuid_generate_v4(), 'Birthday Party Celebration', 'Fun birthday party with decorations, entertainment, and catering.', 'birthday', 800.00, 4, 10, 80, '{"age_group": "adult", "entertainment": "dj_music", "decoration_theme": "customizable"}', '["https://images.unsplash.com/photo-1464366400600-7168b8af9bc3", "https://images.unsplash.com/photo-1530103862676-de8c9debad1d"]'),

(uuid_generate_v4(), 'Product Launch Event', 'Professional product launch with marketing support and media coordination.', 'corporate', 2200.00, 5, 30, 120, '{"marketing_support": true, "media_coordination": true, "product_display_area": "required"}', '["https://images.unsplash.com/photo-1505373877841-8d25f7d46678", "https://images.unsplash.com/photo-1556761175-4b46a572b786"]'),

(uuid_generate_v4(), 'Anniversary Celebration', 'Romantic anniversary celebration with elegant decoration and fine dining.', 'anniversary', 1200.00, 4, 2, 50, '{"romantic_setup": true, "fine_dining": true, "special_lighting": "candles_and_soft_lighting"}', '["https://images.unsplash.com/photo-1519167758481-83f550bb49b3", "https://images.unsplash.com/photo-1414235077428-338989a2e8c0"]');

-- Sample reservations
INSERT INTO reservations (
    id, user_id, room_id, package_id, event_id, 
    event_title, event_date, start_time, end_time, guest_count,
    base_amount, total_amount, downpayment_amount, balance_amount,
    contact_person, contact_phone, contact_email, special_requests,
    status
) VALUES
(
    uuid_generate_v4(),
    (SELECT id FROM users WHERE email = 'john.doe@example.com'),
    (SELECT id FROM rooms WHERE name = 'Grand Ballroom'),
    (SELECT id FROM packages WHERE name = 'Wedding Bliss Package'),
    (SELECT id FROM events WHERE title = 'Elegant Wedding Ceremony'),
    'John & Sarah Wedding',
    '2024-12-15',
    '16:00:00',
    '23:00:00',
    120,
    5999.00,
    5999.00,
    1799.70,
    4199.30,
    'John Doe',
    '+1234567890',
    'john.doe@example.com',
    'Need extra decorations for the entrance hall. Vegetarian menu for 15 guests.',
    'confirmed'
),
(
    uuid_generate_v4(),
    (SELECT id FROM users WHERE email = 'jane.smith@example.com'),
    (SELECT id FROM rooms WHERE name = 'Executive Conference Room'),
    (SELECT id FROM packages WHERE name = 'Corporate Elite Package'),
    (SELECT id FROM events WHERE title = 'Corporate Conference'),
    'Annual Sales Conference',
    '2024-12-20',
    '09:00:00',
    '17:00:00',
    60,
    2499.00,
    2499.00,
    749.70,
    1749.30,
    'Jane Smith',
    '+1987654321',
    'jane.smith@example.com',
    'Need live streaming capability. Coffee breaks at 10:30 AM and 3:00 PM.',
    'pending'
);

-- Sample payments
INSERT INTO payments (
    id, reservation_id, amount, payment_type, payment_method, 
    status, transaction_id, gateway_response
) VALUES
(
    uuid_generate_v4(),
    (SELECT id FROM reservations WHERE event_title = 'John & Sarah Wedding'),
    1799.70,
    'downpayment',
    'credit_card',
    'paid',
    'txn_1234567890',
    '{"gateway": "stripe", "card_last4": "4242", "card_brand": "visa"}'
),
(
    uuid_generate_v4(),
    (SELECT id FROM reservations WHERE event_title = 'Annual Sales Conference'),
    749.70,
    'downpayment',
    'bank_transfer',
    'pending',
    NULL,
    '{}'
);

-- Sample feedback
INSERT INTO feedback (
    id, reservation_id, user_id, rating, title, comment, status, is_public
) VALUES
(
    uuid_generate_v4(),
    (SELECT id FROM reservations WHERE event_title = 'John & Sarah Wedding'),
    (SELECT id FROM users WHERE email = 'john.doe@example.com'),
    5,
    'Perfect Wedding Venue!',
    'EventSpace made our wedding day absolutely magical. The Grand Ballroom was stunning, and the staff went above and beyond to make everything perfect. The wedding coordinator was amazing and handled every detail flawlessly. Highly recommended!',
    'approved',
    true
);

-- Sample chat sessions
INSERT INTO chatbot_sessions (
    id, user_id, session_id, messages, context, is_resolved
) VALUES
(
    uuid_generate_v4(),
    (SELECT id FROM users WHERE email = 'mike.wilson@example.com'),
    'session_' || extract(epoch from now())::text,
    '[
        {"role": "user", "message": "Hi, I need information about wedding packages", "timestamp": "2024-12-01T10:00:00Z"},
        {"role": "bot", "message": "Hello! I''d be happy to help you with our wedding packages. We offer several options including our popular Wedding Bliss Package. What specific information would you like to know?", "timestamp": "2024-12-01T10:00:05Z"},
        {"role": "user", "message": "What does the Wedding Bliss Package include?", "timestamp": "2024-12-01T10:01:00Z"},
        {"role": "bot", "message": "The Wedding Bliss Package is our comprehensive wedding solution for $5,999. It includes venue rental, catering for up to 150 guests, floral decoration, 6-hour photography, wedding coordinator, sound system, and lighting. Would you like to know about add-on services?", "timestamp": "2024-12-01T10:01:10Z"}
    ]',
    '{"topic": "wedding_packages", "interested_package": "wedding_bliss", "guest_count": "unknown"}',
    false
);

-- Update sequences to avoid conflicts
SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));
SELECT setval(pg_get_serial_sequence('admins', 'id'), (SELECT MAX(id) FROM admins));
SELECT setval(pg_get_serial_sequence('rooms', 'id'), (SELECT MAX(id) FROM rooms));
SELECT setval(pg_get_serial_sequence('packages', 'id'), (SELECT MAX(id) FROM packages));
SELECT setval(pg_get_serial_sequence('events', 'id'), (SELECT MAX(id) FROM events));
SELECT setval(pg_get_serial_sequence('reservations', 'id'), (SELECT MAX(id) FROM reservations));
SELECT setval(pg_get_serial_sequence('payments', 'id'), (SELECT MAX(id) FROM payments));
SELECT setval(pg_get_serial_sequence('feedback', 'id'), (SELECT MAX(id) FROM feedback));
SELECT setval(pg_get_serial_sequence('chatbot_sessions', 'id'), (SELECT MAX(id) FROM chatbot_sessions));