
import { createClient } from '@supabase/supabase-js';

// Hardcoded from src/lib/supabaseClient.js
const supabaseUrl = 'https://wilcgyjhqsrcnwxpohfc.supabase.co';
const supabaseKey = 'sb_publishable_vXsyF_bOXSpLXQzeMI7Ftg_uIcD9XsX';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking user_complementary_activities table...');
    try {
        // 1. Check if table exists and can be read (even if empty)
        const { data, count, error } = await supabase
            .from('user_complementary_activities')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Error accessing table:', error);
            if (error.code === '42P01') {
                console.error('TABLE DOES NOT EXIST!');
            }
        } else {
            console.log('Table exists. Row count:', count);
        }

        // 2. Check Foreign Key Relationship Query (simulating the app's query)
        console.log('Testing join query with !fk_activity...');
        const { data: joinData, error: joinError } = await supabase
            .from('user_complementary_activities')
            .select(`
                *,
                activity:complementary_activities!fk_activity(code)
            `)
            .limit(1);

        if (joinError) {
            console.error('Join Query Failed:', joinError);
            if (joinError.message.includes('Could not find relationship')) {
                console.error('FOREIGN KEY RELATIONSHIP MISSING OR NAMED INCORRECTLY');
            }
        } else {
            console.log('Join query successful.');
        }

    } catch (err) {
        console.error('Unexpected Javascript Error:', err);
    }
}

check();
