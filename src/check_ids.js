
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIds() {
    const { data: days, error: daysError } = await supabase.from('days').select('*');
    if (daysError) console.error("Error fetching days:", daysError);
    else console.log("Days:", days);

    const { data: slots, error: slotsError } = await supabase.from('time_slots').select('*');
    if (slotsError) console.error("Error fetching slots:", slotsError);
    else console.log("Slots:", slots);
}

checkIds();
