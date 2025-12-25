
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wilcgyjhqsrcnwxpohfc.supabase.co';
const supabaseKey = 'sb_publishable_vXsyF_bOXSpLXQzeMI7Ftg_uIcD9XsX';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking user_complementary_activities column types...');
    try {
        // Attempt to insert a dummy record with an INTEGER user_id to see if it fails with type error
        // We won't actually commit this, or we'll wrap in a way to just test validity.
        // Actually, easiest way is to query info_schema, but we might not have access.
        // Let's try to select specifying a non-uuid user_id filter.

        const { error } = await supabase
            .from('user_complementary_activities')
            .select('*')
            .eq('user_id', 123) // Integer
            .limit(1);

        if (error) {
            console.error('Error querying with Integer ID:', error.message);
            if (error.message.includes('uuid')) {
                console.log('RESULT: Column is still UUID. Update required.');
            } else {
                console.log('RESULT: Query Failed for other reason.');
            }
        } else {
            console.log('RESULT: Success! Column accepts Integers.');
        }

    } catch (err) {
        console.error('Unexpected Javascript Error:', err);
    }
}

check();
