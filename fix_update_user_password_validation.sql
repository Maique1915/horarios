-- Fix update_user function to only require current password when changing password
-- This should be run in Supabase SQL Editor
-- Drop the old function first (required when changing parameter order)
DROP FUNCTION IF EXISTS public.update_user(INT, TEXT, TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.update_user(
        user_id_in INT,
        name_in TEXT,
        username_in TEXT,
        new_password_in TEXT DEFAULT NULL,
        current_password_in TEXT DEFAULT NULL
    ) RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public,
    extensions AS $$
DECLARE target_user users %ROWTYPE;
course_code TEXT;
BEGIN
SELECT * INTO target_user
FROM users
WHERE id = user_id_in;
IF NOT FOUND THEN RAISE EXCEPTION 'Usuário não encontrado';
END IF;
-- Only authenticate with current password if trying to change password
IF new_password_in IS NOT NULL
AND new_password_in != '' THEN IF current_password_in IS NULL
OR current_password_in = '' THEN RAISE EXCEPTION 'Senha atual é necessária para alterar a senha';
END IF;
IF (
    target_user.password_hash != crypt(current_password_in, target_user.password_hash)
)
AND (target_user.password_hash != current_password_in) THEN RAISE EXCEPTION 'Senha atual incorreta';
END IF;
-- Update password
target_user.password_hash := crypt(new_password_in, gen_salt('bf'));
END IF;
-- Check if username is taken if it's being changed
IF username_in IS NOT NULL
AND username_in != target_user.username THEN IF EXISTS (
    SELECT 1
    FROM users
    WHERE username = username_in
) THEN RAISE EXCEPTION 'Nome de usuário já existe';
END IF;
target_user.username := username_in;
END IF;
IF name_in IS NOT NULL THEN target_user.name := name_in;
END IF;
UPDATE users
SET username = target_user.username,
    name = target_user.name,
    password_hash = target_user.password_hash
WHERE id = user_id_in;
-- Get course code for response
SELECT code INTO course_code
FROM courses
    JOIN user_courses uc ON uc.course_id = courses.id
WHERE uc.user_id = target_user.id
LIMIT 1;
IF course_code IS NULL
AND target_user.course_id IS NOT NULL THEN
SELECT code INTO course_code
FROM courses
WHERE id = target_user.course_id;
END IF;
RETURN json_build_object(
    'id',
    target_user.id,
    'username',
    target_user.username,
    'name',
    target_user.name,
    'role',
    target_user.role,
    'active',
    target_user.active,
    'is_paid',
    COALESCE(target_user.is_paid, FALSE),
    'subscription_expires_at',
    target_user.subscription_expires_at,
    'courses',
    CASE
        WHEN course_code IS NOT NULL THEN json_build_object('code', course_code)
        ELSE NULL
    END
);
END;
$$;
-- Update permissions
GRANT EXECUTE ON FUNCTION public.update_user(INT, TEXT, TEXT, TEXT, TEXT) TO authenticated,
    service_role;
-- Reload PostgREST
NOTIFY pgrst,
'reload config';