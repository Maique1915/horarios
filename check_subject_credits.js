import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// we need to find the supabase url and key.
// usually in src/lib/supabaseClient.ts
