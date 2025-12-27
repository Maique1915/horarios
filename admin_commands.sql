-- FUNÇÕES DE ADMINISTRADOR PARA GERENCIAR USUÁRIOS
-- Execute este script no SQL Editor do Supabase para criar as funções necessárias.

-- 1. Função para listar todos os usuários (Requer ID de admin para validação)
create or replace function admin_get_users(requesting_user_id int)
returns setof users
language plpgsql
security definer
as $$
declare
  caller_role text;
begin
  -- Verificar se quem está chamando é admin
  select role into caller_role from users where id = requesting_user_id;
  
  if caller_role is null or caller_role != 'admin' then
    raise exception 'Acesso negado: Apenas administradores podem listar usuários.';
  end if;

  return query select * from users order by created_at desc;
end;
$$;

-- 2. Função para ativar a assinatura de um usuário (Requer ID de admin para validação)
create or replace function admin_activate_user(target_user_id int, requesting_user_id int)
returns void
language plpgsql
security definer
as $$
declare
  caller_role text;
begin
  -- Verificar se quem está chamando é admin
  select role into caller_role from users where id = requesting_user_id;
  
  if caller_role is null or caller_role != 'admin' then
    raise exception 'Acesso negado: Apenas administradores podem ativar usuários.';
  end if;

  -- Atualizar usuário alvo
  update users
  set is_paid = true,
      subscription_expires_at = now() + interval '6 months'
  where id = target_user_id;
end;
$$;
