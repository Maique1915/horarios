import { supabase } from './src/lib/supabaseClient.js';
async function test() {
    let { data, error } = await supabase.from('courses').select('id, name, workload');
    console.log("COURSES:", data);
}
test();
