import { supabase } from './src/lib/supabaseClient';

async function checkCols() {
    const { data, error } = await supabase.from('subject_equivalencies').select('*').limit(1);
    if (error) { console.error(error); return; }
    console.log('Columns:', Object.keys(data[0]));
}

checkCols();
