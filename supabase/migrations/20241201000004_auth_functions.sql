-- Authentication and user management functions

-- Function to create a new customer user
CREATE OR REPLACE FUNCTION create_customer_user(
    p_email TEXT,
    p_password TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_phone TEXT DEFAULT NULL,
    p_address TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Insert new user
    INSERT INTO users (email, password_hash, first_name, last_name, phone, address)
    VALUES (p_email, crypt(p_password, gen_salt('bf')), p_first_name, p_last_name, p_phone, p_address)
    RETURNING id INTO user_id;
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to authenticate customer users
CREATE OR REPLACE FUNCTION authenticate_customer(
    p_email TEXT,
    p_password TEXT
)
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    address TEXT,
    role user_role,
    email_verified BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.address, u.role, u.email_verified
    FROM users u
    WHERE u.email = p_email 
    AND u.password_hash = crypt(p_password, u.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to authenticate admin users
CREATE OR REPLACE FUNCTION authenticate_admin(
    p_username TEXT,
    p_password TEXT
)
RETURNS TABLE(
    admin_id UUID,
    username TEXT,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    role TEXT,
    permissions JSONB,
    is_active BOOLEAN
) AS $$
BEGIN
    -- Update last login timestamp
    UPDATE admins 
    SET last_login = NOW() 
    WHERE admins.username = p_username 
    AND admins.password_hash = crypt(p_password, admins.password_hash)
    AND admins.is_active = true;
    
    RETURN QUERY
    SELECT a.id, a.username, a.email, a.first_name, a.last_name, a.role, a.permissions, a.is_active
    FROM admins a
    WHERE a.username = p_username 
    AND a.password_hash = crypt(p_password, a.password_hash)
    AND a.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to change user password
CREATE OR REPLACE FUNCTION change_user_password(
    p_user_id UUID,
    p_old_password TEXT,
    p_new_password TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    password_valid BOOLEAN := FALSE;
BEGIN
    -- Verify old password
    SELECT EXISTS (
        SELECT 1 FROM users 
        WHERE id = p_user_id 
        AND password_hash = crypt(p_old_password, password_hash)
    ) INTO password_valid;
    
    IF NOT password_valid THEN
        RETURN FALSE;
    END IF;
    
    -- Update password
    UPDATE users 
    SET password_hash = crypt(p_new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to change admin password
CREATE OR REPLACE FUNCTION change_admin_password(
    p_admin_id UUID,
    p_old_password TEXT,
    p_new_password TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    password_valid BOOLEAN := FALSE;
BEGIN
    -- Verify old password
    SELECT EXISTS (
        SELECT 1 FROM admins 
        WHERE id = p_admin_id 
        AND password_hash = crypt(p_old_password, password_hash)
    ) INTO password_valid;
    
    IF NOT password_valid THEN
        RETURN FALSE;
    END IF;
    
    -- Update password
    UPDATE admins 
    SET password_hash = crypt(p_new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = p_admin_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify email
CREATE OR REPLACE FUNCTION verify_user_email(
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE users 
    SET email_verified = TRUE,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset password (generates a temporary token)
CREATE OR REPLACE FUNCTION request_password_reset(
    p_email TEXT
)
RETURNS TEXT AS $$
DECLARE
    reset_token TEXT;
    user_exists BOOLEAN;
BEGIN
    -- Check if user exists
    SELECT EXISTS (
        SELECT 1 FROM users WHERE email = p_email
    ) INTO user_exists;
    
    IF NOT user_exists THEN
        RETURN NULL;
    END IF;
    
    -- Generate reset token (in production, this should be more secure)
    reset_token := encode(gen_random_bytes(32), 'hex');
    
    -- In a real implementation, you would store this token with an expiration
    -- For now, we'll return it directly
    RETURN reset_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user profile
CREATE OR REPLACE FUNCTION get_user_profile(
    p_user_id UUID
)
RETURNS TABLE(
    id UUID,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    address TEXT,
    role user_role,
    email_verified BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.address, u.role, u.email_verified, u.created_at
    FROM users u
    WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user profile
CREATE OR REPLACE FUNCTION update_user_profile(
    p_user_id UUID,
    p_first_name TEXT,
    p_last_name TEXT,
    p_phone TEXT DEFAULT NULL,
    p_address TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE users 
    SET first_name = p_first_name,
        last_name = p_last_name,
        phone = p_phone,
        address = p_address,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin profile
CREATE OR REPLACE FUNCTION get_admin_profile(
    p_admin_id UUID
)
RETURNS TABLE(
    id UUID,
    username TEXT,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    role TEXT,
    permissions JSONB,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT a.id, a.username, a.email, a.first_name, a.last_name, a.role, a.permissions, a.last_login, a.created_at
    FROM admins a
    WHERE a.id = p_admin_id AND a.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;