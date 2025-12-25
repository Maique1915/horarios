
import { createClient } from '@supabase/supabase-js';

// Hardcoded from src/lib/supabaseClient.js
const supabaseUrl = 'https://wilcgyjhqsrcnwxpohfc.supabase.co';
const supabaseKey = 'sb_publishable_vXsyF_bOXSpLXQzeMI7Ftg_uIcD9XsX';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking users table schema...');
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .limit(1);

        if (error) {
            console.error('Error finding users table:', error);
        } else {
            console.log('Users table found. Sample ID:', data[0]?.id);
            console.log('Type of ID:', typeof data[0]?.id);
        }
    } catch (err) {
        console.error('Unexpected Javascript Error:', err);
    }
}

check();
