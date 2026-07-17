import { supabase } from './src/lib/supabaseClient.js';
async function test() {
    let { data, error } = await supabase.from('subject_credits').select('*').eq('subject_id', 377);
    console.log("SUBJECT CREDITS:", data);
    let { data: rpcData, error: rpcError } = await supabase.rpc('get_subjects_with_credits');
    console.log("RPC SINAIS E SISTEMAS:", rpcData.find(x => x.id === 377));
}
test();
