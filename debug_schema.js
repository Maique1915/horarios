
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log("Checking subjects table...");
    const { data, error } = await supabase.from('subjects').select('*').limit(1);

    if (error) {
        console.error("Error fetching subjects:", error);
    } else if (data && data.length > 0) {
        console.log("Subjects table keys:", Object.keys(data[0]));
    } else {
        console.log("Subjects table is empty or could not fetch headers.");
    }
}

checkSchema();
