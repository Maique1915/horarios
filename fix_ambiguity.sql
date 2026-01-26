-- REMOVE OLD INSECURE FUNCTIONS TO FIX AMBIGUITY
drop function if exists admin_get_users(int);
drop function if exists admin_activate_user(int, int);