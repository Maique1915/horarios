-- CONSOLIDATED AUTH SYSTEM MIGRATION
-- Apply this in your Supabase SQL Editor to fix 404/Function Not Found errors.

-- 1. Ensure extensions are available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Ensure users table has all required columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS course_id INT;

-- 3. Reset functional permissions (just in case)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Function: Register User (with 10-day trial)
CREATE OR REPLACE FUNCTION public.register_user(
    username_in TEXT, 
    password_in TEXT, 
    name_in TEXT, 
    course_id_in INT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  new_user users%ROWTYPE;
  course_code TEXT;
BEGIN
  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM users WHERE username = username_in) THEN
    RAISE EXCEPTION 'Usuário já existe';
  END IF;

  -- Insert new user with 10-day trial
  INSERT INTO users (
    username, 
    password_hash, 
    name, 
    role, 
    active, 
    is_paid, 
    subscription_expires_at,
    course_id
  )
  VALUES (
    username_in,
    crypt(password_in, gen_salt('bf')),
    name_in,
    'user',
    TRUE,
    FALSE,
    NOW() + INTERVAL '10 days',
    course_id_in
  )
  RETURNING * INTO new_user;
  
  -- Secondary storage in user_courses for legacy compatibility
  IF course_id_in IS NOT NULL THEN
    INSERT INTO user_courses (user_id, course_id)
    VALUES (new_user.id, course_id_in)
    ON CONFLICT DO NOTHING;
    
    SELECT code INTO course_code FROM courses WHERE id = course_id_in;
  END IF;

  RETURN json_build_object(
    'id', new_user.id,
    'username', new_user.username,
    'name', new_user.name,
    'role', new_user.role,
    'active', new_user.active,
    'is_paid', new_user.is_paid,
    'subscription_expires_at', new_user.subscription_expires_at,
    'courses', CASE WHEN course_code IS NOT NULL THEN json_build_object('code', course_code) ELSE NULL END
  );
END;
$$;

-- 5. Function: Login User
CREATE OR REPLACE FUNCTION public.login_user(
    username_in TEXT, 
    password_in TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  found_user users%ROWTYPE;
  course_code TEXT;
BEGIN
  SELECT * INTO found_user FROM users WHERE username = username_in;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Support both hashed and plain text (plain text for legacy if needed, though crypt is preferred)
  IF (found_user.password_hash = crypt(password_in, found_user.password_hash)) OR (found_user.password_hash = password_in) THEN
    
    -- Try to get course code from user_courses first
    SELECT code INTO course_code
    FROM courses
    JOIN user_courses uc ON uc.course_id = courses.id
    WHERE uc.user_id = found_user.id
    LIMIT 1;
    
    -- Fallback to users.course_id
    IF course_code IS NULL AND found_user.course_id IS NOT NULL THEN
        SELECT code INTO course_code FROM courses WHERE id = found_user.course_id;
    END IF;

    RETURN json_build_object(
      'id', found_user.id,
      'username', found_user.username,
      'name', found_user.name,
      'role', found_user.role,
      'active', found_user.active,
      'is_paid', COALESCE(found_user.is_paid, FALSE),
      'subscription_expires_at', found_user.subscription_expires_at,
      'courses', CASE WHEN course_code IS NOT NULL THEN json_build_object('code', course_code) ELSE NULL END
    );
  ELSE
    RETURN NULL;
  END IF;
END;
$$;

-- 6. Function: Update User
CREATE OR REPLACE FUNCTION public.update_user(
  user_id_in INT,
  current_password_in TEXT,
  name_in TEXT,
  username_in TEXT,
  new_password_in TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  target_user users%ROWTYPE;
  course_code TEXT;
BEGIN
  SELECT * INTO target_user FROM users WHERE id = user_id_in;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  -- Authenticate with current password
  IF (target_user.password_hash != crypt(current_password_in, target_user.password_hash)) AND (target_user.password_hash != current_password_in) THEN
    RAISE EXCEPTION 'Senha atual incorreta';
  END IF;

  -- Check if username is taken if it's being changed
  IF username_in IS NOT NULL AND username_in != target_user.username THEN
    IF EXISTS (SELECT 1 FROM users WHERE username = username_in) THEN
      RAISE EXCEPTION 'Nome de usuário já existe';
    END IF;
    target_user.username := username_in;
  END IF;

  IF name_in IS NOT NULL THEN
    target_user.name := name_in;
  END IF;

  IF new_password_in IS NOT NULL AND new_password_in != '' THEN
    target_user.password_hash := crypt(new_password_in, gen_salt('bf'));
  END IF;

  UPDATE users
  SET
    username = target_user.username,
    name = target_user.name,
    password_hash = target_user.password_hash
  WHERE id = user_id_in;

  -- Get course code for response
  SELECT code INTO course_code
  FROM courses
  JOIN user_courses uc ON uc.course_id = courses.id
  WHERE uc.user_id = target_user.id
  LIMIT 1;
  
  IF course_code IS NULL AND target_user.course_id IS NOT NULL THEN
      SELECT code INTO course_code FROM courses WHERE id = target_user.course_id;
  END IF;

  RETURN json_build_object(
    'id', target_user.id,
    'username', target_user.username,
    'name', target_user.name,
    'role', target_user.role,
    'active', target_user.active,
    'is_paid', COALESCE(target_user.is_paid, FALSE),
    'subscription_expires_at', target_user.subscription_expires_at,
    'courses', CASE WHEN course_code IS NOT NULL THEN json_build_object('code', course_code) ELSE NULL END
  );
END;
$$;

-- 7. Admin Functions
CREATE OR REPLACE FUNCTION public.admin_get_users(requesting_user_id INT)
RETURNS SETOF users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  SELECT role INTO caller_role FROM users WHERE id = requesting_user_id;
  
  IF caller_role IS NULL OR caller_role != 'admin' THEN
    RAISE EXCEPTION 'Acesso negado: Apenas administradores podem listar usuários.';
  END IF;

  RETURN QUERY SELECT * FROM users ORDER BY created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_activate_user(target_user_id INT, requesting_user_id INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  SELECT role INTO caller_role FROM users WHERE id = requesting_user_id;
  
  IF caller_role IS NULL OR caller_role != 'admin' THEN
    RAISE EXCEPTION 'Acesso negado: Apenas administradores podem ativar usuários.';
  END IF;

  UPDATE users
  SET is_paid = TRUE,
      subscription_expires_at = NOW() + INTERVAL '6 months'
  WHERE id = target_user_id;
END;
$$;

-- 8. Grant permissions
GRANT EXECUTE ON FUNCTION public.login_user(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.register_user(TEXT, TEXT, TEXT, INT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_user(INT, TEXT, TEXT, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_get_users(INT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_activate_user(INT, INT) TO authenticated, service_role;

-- 9. Reload PostgREST
NOTIFY pgrst, 'reload config';
