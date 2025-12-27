-- FIX RLS ISSUES
-- Run this in Supabase SQL Editor

-- 1. Ensure RLS is enabled (just in case)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Explicitly GRANT permissions to system roles
GRANT ALL ON TABLE public.users TO postgres;
GRANT ALL ON TABLE public.users TO service_role;
GRANT ALL ON TABLE public.users TO supabase_admin;

-- 3. Create Policies to explicit allow these roles to bypass RLS
-- (Even though they should by default, this fixes edge cases)

DROP POLICY IF EXISTS "Allow Postgres All" ON public.users;
CREATE POLICY "Allow Postgres All"
ON public.users
TO postgres
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Service Role All" ON public.users;
CREATE POLICY "Allow Service Role All"
ON public.users
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Supabase Admin All" ON public.users;
CREATE POLICY "Allow Supabase Admin All"
ON public.users
TO supabase_admin
USING (true)
WITH CHECK (true);

-- 4. Re-verify function ownership and security definer
-- We recreate the function just to be absolutely sure it's owned by the runner of this script
create or replace function register_user(username_in text, password_in text, name_in text, course_id_in int)
returns json
language plpgsql
security definer
-- Set search path to public to be safe
SET search_path = public
as $$
declare
  new_userId int;
  new_user users%ROWTYPE;
  course_code text;
begin
  perform 1 from users where username = username_in;
  if found then
    raise exception 'Usuário já existe';
  end if;

  insert into users (username, password_hash, name, role, active, is_paid)
  values (
    username_in,
    crypt(password_in, gen_salt('bf')),
    name_in,
    'user',
    true,
    false
  )
  returning * into new_user;
  
  if course_id_in is not null then
    insert into user_courses (user_id, course_id)
    values (new_user.id, course_id_in);
    select code into course_code from courses where id = course_id_in;
  end if;

  return json_build_object(
    'id', new_user.id,
    'username', new_user.username,
    'name', new_user.name,
    'role', new_user.role,
    'active', new_user.active,
    'is_paid', new_user.is_paid,
    'courses', case when course_code is not null then json_build_object('code', course_code) else null end
  );
end;
$$;
