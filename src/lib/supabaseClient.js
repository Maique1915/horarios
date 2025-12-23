import { createClient } from '@supabase/supabase-js';

// URL do seu projeto Supabase
const supabaseUrl = 'https://wilcgyjhqsrcnwxpohfc.supabase.co';

// Recupere sua 'anon public' API Key do painel do Supabase (Project Settings > API)
// TODO: Substitua pelo valor real da sua API Key
const supabaseAnonKey = 'sb_publishable_vXsyF_bOXSpLXQzeMI7Ftg_uIcD9XsX';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
