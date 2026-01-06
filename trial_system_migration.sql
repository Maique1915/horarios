-- Migration to implement 10-day trial system
-- Apply this in your Supabase SQL Editor

-- Update register_user to set 10-day trial
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

  insert into users (username, password_hash, name, role, active, is_paid, subscription_expires_at)
  values (
    username_in,
    crypt(password_in, gen_salt('bf')),
    name_in,
    'user',
    true,
    false,
    NOW() + interval '10 days'
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
    'subscription_expires_at', new_user.subscription_expires_at,
    'courses', case when course_code is not null then json_build_object('code', course_code) else null end
  );
end;
$$;
