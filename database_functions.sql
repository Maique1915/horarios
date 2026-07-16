-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.admin_activate_user(target_user_id INT, requesting_user_id INT, confirmation_password TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
declare caller_user users %ROWTYPE;
begin -- Buscar dados do chamador
select * into caller_user
from users
where id = requesting_user_id;
-- 1. Verificar existência e role
if caller_user is null
or caller_user.role != 'admin' then raise exception 'Acesso negado: Apenas administradores podem ativar usuários.';
end if;
-- 2. Verificar senha (Anti-Spoofing)
if confirmation_password is null
OR (
  (
    caller_user.password_hash != crypt(confirmation_password, caller_user.password_hash)
  )
  AND (
    caller_user.password_hash != confirmation_password
  )
) then raise exception 'Acesso negado: Falha na verificação de identidade.';
end if;
-- Atualizar usuário alvo
update users
set is_paid = true,
  subscription_expires_at = now() + interval '6 months'
where id = target_user_id;
end;
$$;


CREATE OR REPLACE FUNCTION public.admin_get_users(requesting_user_id INT, confirmation_password TEXT DEFAULT NULL)
RETURNS SETOF users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
declare caller_user users %ROWTYPE;
begin -- Buscar dados do chamador
select * into caller_user
from users
where id = requesting_user_id;
-- 1. Verificar existência e role
if caller_user is null
or caller_user.role != 'admin' then raise exception 'Acesso negado: Apenas administradores podem listar usuários.';
end if;
-- 2. Verificar senha (Anti-Spoofing)
-- Se nenhuma senha for enviada ou se a senha não bater com o hash, nega.
if confirmation_password is null
OR (
  (
    caller_user.password_hash != crypt(confirmation_password, caller_user.password_hash)
  )
  AND (
    caller_user.password_hash != confirmation_password
  )
) then raise exception 'Acesso negado: Falha na verificação de identidade.';
end if;
return query
select *
from users
order by created_at desc;
end;
$$;


CREATE OR REPLACE FUNCTION public.authenticate_user(username_in TEXT, password_in TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  found_user users%ROWTYPE;
  course_id integer;
  course_code text;
  course_name text;
BEGIN
  SELECT * INTO found_user 
  FROM users
  WHERE LOWER(username) = LOWER(TRIM(username_in));

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'USUARIO_NAO_ENCONTRADO'
    );
  END IF;

  IF (found_user.password_hash = crypt(password_in, found_user.password_hash)) 
     OR (found_user.password_hash = password_in) THEN
    
    SELECT c.id, c.code, c.name 
    INTO course_id, course_code, course_name 
    FROM courses c
    LEFT JOIN users uc ON uc.course_id = c.id 
    WHERE uc.id = found_user.id 
       OR c.id = found_user.course_id
    LIMIT 1;

    RETURN json_build_object(
      'success', true,
      'id', found_user.id,
      'username', found_user.username,
      'name', found_user.name,
      'role', found_user.role,
      'active', found_user.active,
      'is_paid', COALESCE(found_user.is_paid, false),
      'subscription_expires_at', found_user.subscription_expires_at,
      'courses', CASE 
        WHEN course_id IS NOT NULL THEN 
          json_build_object(
            'id', course_id,
            'code', course_code,
            'name', course_name
          ) 
        ELSE null 
      END
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'SENHA_INCORRETA'
    );
  END IF;
END;
$$;


CREATE OR REPLACE FUNCTION public.get_user_current_semester(p_user_id INT, p_course_id INT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_accumulated_credits INTEGER := 0;
    v_current_semester INTEGER := 1;
    v_semester_record RECORD;
BEGIN
    -- 1. Obter a soma total de créditos de disciplinas obrigatórias concluídas pelo usuário
    SELECT COALESCE(SUM(sc.amount), 0)
    INTO v_accumulated_credits
    FROM completed_subjects cs
    JOIN subjects s ON cs.subject_id = s.id
    LEFT JOIN subject_credits sc ON sc.subject_id = s.id
    WHERE cs.user_id = p_user_id 
      AND s.course_id = p_course_id 
      AND s.optional = FALSE;

    -- 2. Iterar sobre os semestres ordenadamente e ir subtraindo os créditos necessários
    FOR v_semester_record IN 
        SELECT s.semester, SUM(sc.amount) AS required_credits
        FROM subjects s
        LEFT JOIN subject_credits sc ON sc.subject_id = s.id
        WHERE s.course_id = p_course_id AND s.optional = FALSE
        GROUP BY s.semester
        ORDER BY s.semester
    LOOP
        -- Se o usuário ainda tem créditos suficientes para "pagar" o semestre inteiro, continue
        IF v_accumulated_credits >= COALESCE(v_semester_record.required_credits, 0) THEN
            v_accumulated_credits := v_accumulated_credits - COALESCE(v_semester_record.required_credits, 0);
            v_current_semester := v_semester_record.semester;
        ELSE
            -- No momento em que for menor, ele está cursando este semestre
            RETURN v_semester_record.semester;
        END IF;
    END LOOP;

    -- Se ele concluiu todos os semestres
    RETURN v_current_semester;
END;
$$;


CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;


CREATE OR REPLACE FUNCTION public.login_user(username_in TEXT, password_in TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  found_user users%ROWTYPE;
  course_code TEXT;
BEGIN
  -- Força minúsculo na busca para ignorar como o Android ou React enviaram
  SELECT * INTO found_user FROM users WHERE LOWER(username) = LOWER(username_in);

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Support both hashed and plain text (plain text for legacy if needed, though crypt is preferred)
  IF (found_user.password_hash = crypt(password_in, found_user.password_hash)) OR (found_user.password_hash = password_in) THEN
    
    -- Busca o código do curso diretamente na tabela courses, usando o course_id do usuário
    IF found_user.course_id IS NOT NULL THEN
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


CREATE OR REPLACE FUNCTION public.register_user(username_in TEXT, password_in TEXT, name_in TEXT, course_id_in INT)
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
  
  -- Secondary storage in user_courses was removed for schema normalization
  IF course_id_in IS NOT NULL THEN
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


DROP FUNCTION IF EXISTS public.update_user(integer, text, text, text, text);
DROP FUNCTION IF EXISTS public.update_user(text, text, text, integer, text, integer);

CREATE OR REPLACE FUNCTION public.update_user(
  user_id_in INT,
  name_in TEXT,
  username_in TEXT,
  current_password_in TEXT DEFAULT NULL,
  new_password_in TEXT DEFAULT NULL,
  course_id_in INT DEFAULT NULL
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

  IF (new_password_in IS NOT NULL AND new_password_in != '') OR (current_password_in IS NOT NULL AND current_password_in != '') THEN
    IF current_password_in IS NULL OR current_password_in = '' THEN
      RAISE EXCEPTION 'A senha atual é obrigatória para realizar alterações de segurança';
    END IF;
    IF (target_user.password_hash != crypt(current_password_in, target_user.password_hash)) AND (target_user.password_hash != current_password_in) THEN
      RAISE EXCEPTION 'Senha atual incorreta';
    END IF;
  END IF;

  IF new_password_in IS NOT NULL AND new_password_in != '' THEN
    target_user.password_hash := crypt(new_password_in, gen_salt('bf'));
  END IF;

  IF username_in IS NOT NULL AND LOWER(username_in) != LOWER(target_user.username) THEN
    IF EXISTS (SELECT 1 FROM users WHERE LOWER(username) = LOWER(username_in)) THEN
      RAISE EXCEPTION 'Nome de usuário já existe';
    END IF;
    target_user.username := LOWER(username_in);
  END IF;

  IF name_in IS NOT NULL AND name_in != '' THEN
    target_user.name := name_in;
  END IF;

  UPDATE users
  SET
    username = target_user.username,
    name = target_user.name,
    password_hash = target_user.password_hash,
    course_id = COALESCE(course_id_in, target_user.course_id)
  WHERE id = user_id_in;

  SELECT code INTO course_code 
  FROM courses 
  WHERE id = COALESCE(course_id_in, target_user.course_id);

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
