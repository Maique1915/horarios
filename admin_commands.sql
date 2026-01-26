-- FUNÇÕES DE ADMINISTRADOR PARA GERENCIAR USUÁRIOS
-- Execute este script no SQL Editor do Supabase para criar as funções necessárias.
-- 1. Função para listar todos os usuários (Requer ID de admin para validação)
-- 1. Função para listar todos os usuários (Requer ID de admin E confirmação de senha para evitar spoofing)
create or replace function admin_get_users(
    requesting_user_id int,
    confirmation_password text default null
  ) returns setof users language plpgsql security definer as $$
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
-- 2. Função para ativar a assinatura de um usuário (Requer ID de admin E validação de senha)
create or replace function admin_activate_user(
    target_user_id int,
    requesting_user_id int,
    confirmation_password text default null
  ) returns void language plpgsql security definer as $$
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