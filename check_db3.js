import { supabase } from './src/lib/supabaseClient.js';
async function test() {
    let { data, error } = await supabase.from('subjects').select('id, name').eq('id', 377);
    console.log("SUBJECTS:", data);
}
test();
