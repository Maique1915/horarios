import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wilcgyjhqsrcnwxpohfc.supabase.co';
const supabaseAnonKey = 'sb_publishable_vXsyF_bOXSpLXQzeMI7Ftg_uIcD9XsX'; // Using the key from the codebase

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSequence() {
    console.log('Checking subjects table...');

    // Check max ID
    const { data, error } = await supabase
        .from('subjects')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error fetching max ID:', error);
        return;
    }

    console.log('Current max ID in subjects:', data[0]?.id);

    // Try to check table info if possible (though limited with anon key)
    // We mainly need to confirm the max ID to understand the sequence gap.
}

checkSequence();
