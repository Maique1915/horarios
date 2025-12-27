-- FIX REGISTRATION: POPULATE users.course_id
-- Run this in Supabase SQL Editor

-- 1. Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Explicitly GRANT permissions (just in case)
GRANT ALL ON TABLE public.users TO postgres, service_role, supabase_admin;
GRANT ALL ON TABLE public.user_courses TO postgres, service_role, supabase_admin;
GRANT ALL ON TABLE public.courses TO postgres, service_role, supabase_admin;

-- 3. RLS Policies (Idempotent)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow Postgres All" ON public.users;
CREATE POLICY "Allow Postgres All" ON public.users TO postgres USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Service Role All" ON public.users;
CREATE POLICY "Allow Service Role All" ON public.users TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Supabase Admin All" ON public.users;
CREATE POLICY "Allow Supabase Admin All" ON public.users TO supabase_admin USING (true) WITH CHECK (true);

-- 4. Recreate register_user function
-- KEY CHANGE: SAVE course_id IN users TABLE
create or replace function register_user(username_in text, password_in text, name_in text, course_id_in int)
returns json
language plpgsql
security definer
SET search_path = public, extensions
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

  -- Insert new user
  -- NOW INCLUDING course_id
  insert into users (username, password_hash, name, role, active, is_paid, course_id)
  values (
    username_in,
    crypt(password_in, gen_salt('bf')),
    name_in,
    'user',
    true,
    false,
    course_id_in  -- <--- HERE IS THE FIX
  )
  returning * into new_user;
  
  -- We ALSO keep inserting into user_courses just to be safe and compatible with both approaches
  if course_id_in is not null then
    insert into user_courses (user_id, course_id)
    values (new_user.id, course_id_in)
    ON CONFLICT DO NOTHING; -- Avoid errors if duplicate
    
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

-- 5. Update login_user to be robust
create or replace function login_user(username_in text, password_in text)
returns json
language plpgsql
security definer
SET search_path = public, extensions
as $$
declare
  found_user users%ROWTYPE;
  course_code text;
begin
  select * into found_user from users where username = username_in;

  if not found then
    return null;
  end if;

  if (found_user.password_hash = crypt(password_in, found_user.password_hash)) OR (found_user.password_hash = password_in) then
    
    -- Try to get course from user_courses first
    select code into course_code
    from courses
    join user_courses uc on uc.course_id = courses.id
    where uc.user_id = found_user.id
    limit 1;
    
    -- If not found, try to get from users.course_id (fallback)
    if course_code is null and found_user.course_id is not null then
        select code into course_code from courses where id = found_user.course_id;
    end if;

    return json_build_object(
      'id', found_user.id,
      'username', found_user.username,
      'name', found_user.name,
      'role', found_user.role,
      'active', found_user.active,
      'is_paid', found_user.is_paid,
      'subscription_expires_at', found_user.subscription_expires_at,
      'courses', case when course_code is not null then json_build_object('code', course_code) else null end
    );
  else
    return null;
  end if;
end;
$$;

-- 6. Update update_user to be robust (and fix found() syntax)
create or replace function update_user(
  user_id_in int,
  current_password_in text,
  name_in text,
  username_in text,
  new_password_in text default null
)
returns json
language plpgsql
security definer
SET search_path = public, extensions
as $$
declare
  target_user users%ROWTYPE;
  course_code text;
begin
  select * into target_user from users where id = user_id_in;

  if not found then
    raise exception 'Usuário não encontrado';
  end if;

  if (target_user.password_hash != crypt(current_password_in, target_user.password_hash)) AND (target_user.password_hash != current_password_in) then
    raise exception 'Senha atual incorreta';
  end if;

  if username_in is not null and username_in != target_user.username then
    perform 1 from users where username = username_in;
    if found then
      raise exception 'Nome de usuário já existe';
    end if;
    target_user.username := username_in;
  end if;

  if name_in is not null then
    target_user.name := name_in;
  end if;

  if new_password_in is not null and new_password_in != '' then
    target_user.password_hash := crypt(new_password_in, gen_salt('bf'));
  end if;

  update users
  set
    username = target_user.username,
    name = target_user.name,
    password_hash = target_user.password_hash
  where id = user_id_in;

  select code into course_code
  from courses
  join user_courses uc on uc.course_id = courses.id
  where uc.user_id = target_user.id
  limit 1;
  
  -- Fallback check
  if course_code is null and target_user.course_id is not null then
      select code into course_code from courses where id = target_user.course_id;
  end if;

  return json_build_object(
    'id', target_user.id,
    'username', target_user.username,
    'name', target_user.name,
    'role', target_user.role,
    'active', target_user.active,
    'is_paid', target_user.is_paid,
    'subscription_expires_at', target_user.subscription_expires_at,
    'courses', case when course_code is not null then json_build_object('code', course_code) else null end
  );
end;
$$;
