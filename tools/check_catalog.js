
import { createClient } from '@supabase/supabase-js';

// Hardcoded from src/lib/supabaseClient.js
const supabaseUrl = 'https://wilcgyjhqsrcnwxpohfc.supabase.co';
const supabaseKey = 'sb_publishable_vXsyF_bOXSpLXQzeMI7Ftg_uIcD9XsX';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking complementary_activities table...');
    try {
        const { data, count, error } = await supabase
            .from('complementary_activities')
            .select('*', { count: 'exact', head: false })
            .limit(1);

        if (error) {
            console.error('Supabase Error:', error);
        } else {
            console.log('Success! Connection worked.');
            console.log('First row sample:', data[0]);
        }
    } catch (err) {
        console.error('Unexpected Javascript Error:', err);
    }
}

check();
