import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
    'https://wilcgyjhqsrcnwxpohfc.supabase.co',
    'sb_publishable_vXsyF_bOXSpLXQzeMI7Ftg_uIcD9XsX'
);
async function run() {
    const { data } = await supabase.from('subjects').select('name, optional').limit(5);
    console.log(data);
}
run();
