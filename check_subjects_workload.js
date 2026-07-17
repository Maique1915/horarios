import { supabase } from './src/lib/supabaseClient.js';
async function test() {
    let { data, error } = await supabase.from('subjects').select('id, name, workload').limit(10);
    console.log("SUBJECTS WORKLOADS:", data);
}
test();
