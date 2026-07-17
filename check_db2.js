import { supabase } from './src/lib/supabaseClient.js';
async function test() {
    let { data, error } = await supabase.from('subject_credits').select('*').in('subject_id', [2, 3, 377]);
    console.log("SUBJECT CREDITS:", data);
}
test();
