-- Enable pgcrypto for password hashing
create extension if not exists pgcrypto;

-- 1. Enable RLS on users table
alter table users enable row level security;

-- 2. Policies
--    We deny all access to 'anon' role by default (no policies = implicit deny).
--    We rely solely on RPCs running as SECURITY DEFINER.

-- DROP existing policies to avoid conflicts
drop policy if exists "Users can see own data" on users;
drop policy if exists "Public insert" on users;

-- 3. Function: Login User
--    Returns user JSON (excluding hash) if credentials match.
create or replace function login_user(username_in text, password_in text)
returns json
language plpgsql
security definer
as $$
declare
  found_user users%ROWTYPE;
  course_code text;
begin
  select * into found_user from users where username = username_in;

  if not found (found_user) then
    return null;
  end if;

  if (found_user.password_hash = crypt(password_in, found_user.password_hash)) OR (found_user.password_hash = password_in) then
    select code into course_code
    from courses
    join user_courses uc on uc.course_id = courses.id
    where uc.user_id = found_user.id
    limit 1;

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

-- 4. Function: Register User
create or replace function register_user(username_in text, password_in text, name_in text, course_id_in int)
returns json
language plpgsql
security definer
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

-- 5. Function: Update User (Requires Current Password for Auth)
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
as $$
declare
  target_user users%ROWTYPE;
  course_code text;
begin
  select * into target_user from users where id = user_id_in;

  if not found (target_user) then
    raise exception 'Usuário não encontrado';
  end if;

  -- Authenticate with current password
  if (target_user.password_hash != crypt(current_password_in, target_user.password_hash)) AND (target_user.password_hash != current_password_in) then
    raise exception 'Senha atual incorreta';
  end if;

  -- Check if username taken (if changing)
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

  -- Return updated user
  select code into course_code
  from courses
  join user_courses uc on uc.course_id = courses.id
  where uc.user_id = target_user.id
  limit 1;

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
