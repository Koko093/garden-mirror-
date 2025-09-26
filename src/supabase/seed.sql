-- This file runs after migrations and is used to populate the database with initial data

-- Set up admin users for immediate use
DO $$
BEGIN
    -- Only insert if the table is empty
    IF NOT EXISTS (SELECT 1 FROM admins LIMIT 1) THEN
        INSERT INTO admins (id, username, email, password_hash, first_name, last_name, permissions) VALUES
        (
            uuid_generate_v4(), 
            'admin', 
            'admin@eventspace.com', 
            crypt('admin123', gen_salt('bf')), 
            'System', 
            'Administrator', 
            '{"manage_users": true, "manage_rooms": true, "manage_reservations": true, "view_analytics": true, "manage_packages": true, "manage_events": true, "manage_feedback": true}'::jsonb
        ),
        (
            uuid_generate_v4(), 
            'manager', 
            'manager@eventspace.com', 
            crypt('manager123', gen_salt('bf')), 
            'Event', 
            'Manager', 
            '{"manage_rooms": true, "manage_reservations": true, "view_analytics": true, "manage_packages": true}'::jsonb
        );
    END IF;
END $$;

-- Set up sample data for demonstration
DO $$
BEGIN
    -- Insert sample rooms if table is empty
    IF NOT EXISTS (SELECT 1 FROM rooms LIMIT 1) THEN
        INSERT INTO rooms (name, description, capacity, area, hourly_rate, daily_rate, features, images) VALUES
        ('Grand Ballroom', 'Elegant ballroom perfect for weddings and large corporate events', 200, 500.00, 150.00, 1200.00, '["projector", "sound_system", "air_conditioning", "wifi", "stage", "dance_floor"]'::jsonb, '[]'::jsonb),
        ('Garden Pavilion', 'Beautiful outdoor pavilion surrounded by lush gardens', 100, 300.00, 100.00, 800.00, '["outdoor_setting", "garden_view", "string_lights", "sound_system"]'::jsonb, '[]'::jsonb),
        ('Executive Conference Room', 'Modern conference room for business meetings', 50, 100.00, 75.00, 600.00, '["projector", "whiteboard", "video_conferencing", "air_conditioning", "wifi"]'::jsonb, '[]'::jsonb),
        ('Rooftop Terrace', 'Stunning rooftop venue with city skyline views', 80, 250.00, 120.00, 960.00, '["city_view", "outdoor_bar", "lounge_seating", "string_lights"]'::jsonb, '[]'::jsonb);
    END IF;

    -- Insert sample packages if table is empty
    IF NOT EXISTS (SELECT 1 FROM packages LIMIT 1) THEN
        INSERT INTO packages (name, description, price, duration_hours, max_guests, included_services, add_on_services, is_popular) VALUES
        ('Wedding Bliss Package', 'Complete wedding package with venue, catering, and decoration', 5999.00, 8, 150, '["venue_rental", "catering_for_150", "floral_decoration", "photography_6_hours"]'::jsonb, '[{"name": "videography", "price": 800}, {"name": "live_band", "price": 1200}]'::jsonb, true),
        ('Corporate Elite Package', 'Professional corporate event package', 2499.00, 6, 75, '["venue_rental", "business_catering_for_75", "av_equipment", "wifi"]'::jsonb, '[{"name": "live_streaming", "price": 500}, {"name": "photographer", "price": 400}]'::jsonb, false),
        ('Birthday Celebration Package', 'Fun birthday party package', 1299.00, 4, 50, '["venue_rental", "party_decorations", "birthday_cake", "catering_for_50"]'::jsonb, '[{"name": "dj_service", "price": 300}, {"name": "photo_booth", "price": 250}]'::jsonb, false),
        ('Cocktail Reception Package', 'Elegant cocktail reception', 1899.00, 4, 80, '["venue_rental", "premium_bar_service", "gourmet_hors_doeuvres", "cocktail_tables"]'::jsonb, '[{"name": "live_jazz_trio", "price": 600}, {"name": "premium_spirits_upgrade", "price": 300}]'::jsonb, true);
    END IF;

    -- Insert sample events if table is empty
    IF NOT EXISTS (SELECT 1 FROM events LIMIT 1) THEN
        INSERT INTO events (title, description, category, base_price, duration_hours, min_guests, max_guests, requirements) VALUES
        ('Elegant Wedding Ceremony', 'Traditional wedding ceremony with full decoration', 'wedding', 3500.00, 6, 50, 200, '{"setup_time": "3 hours", "cleanup_time": "2 hours"}'::jsonb),
        ('Corporate Conference', 'Professional business conference with AV support', 'corporate', 1800.00, 8, 20, 100, '{"av_requirements": ["projector", "microphones"], "catering": "business_lunch"}'::jsonb),
        ('Birthday Party Celebration', 'Fun birthday party with decorations and entertainment', 'birthday', 800.00, 4, 10, 80, '{"age_group": "adult", "entertainment": "dj_music"}'::jsonb),
        ('Product Launch Event', 'Professional product launch with marketing support', 'corporate', 2200.00, 5, 30, 120, '{"marketing_support": true, "media_coordination": true}'::jsonb);
    END IF;
END $$;