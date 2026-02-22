import { supabase } from './src/lib/supabaseClient';

async function checkData() {
    // 1. Check if we have ANY equivalencies
    const { data: allEq, error: err1 } = await supabase.from('subject_equivalencies').select('count', { count: 'exact' });
    console.log('Total equivalencies in DB:', allEq?.[0]?.count || 0);

    // 2. Check course IDs
    const { data: courses, error: err2 } = await supabase.from('courses').select('id, code');
    console.log('Courses:', courses);

    // 3. Check sample equivalency
    const { data: eqSample, error: err3 } = await supabase.from('subject_equivalencies').select('*').limit(5);
    console.log('Equivalencies Sample:', eqSample);
}

checkData();
