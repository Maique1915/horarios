import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Usage: node --env-file=.env.local fix_subjects_data.js

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need admin to bypass RLS if enabled

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials. Run with: node --env-file=.env.local fix_subjects_data.js");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAdminKey || supabaseKey);

async function fixData() {
    const dbPath = path.join(process.cwd(), 'src', 'model', 'db.json');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    console.log(`Loaded ${dbData.length} subjects from db.json`);

    let updatedCount = 0;
    let errors = 0;

    for (const item of dbData) {
        // Find subject by name (and course 'engcomp' hardcoded or from item._cu)
        // We assume names are unique per course

        const practicalCredits = Number(item._ap) || 0;
        const theoryCredits = Number(item._at) || 0;
        const totalCredits = practicalCredits + theoryCredits;

        // APPROXIMATION: 1 credit = 18 hours (user specified)
        const workload = totalCredits * 18;

        // Heuristic for Category:
        // If semester is between 1 and 10, it's almost certainly MANDATORY in this context,
        // overriding the _el flag which seems to be uniformly true in the source data.
        let category = 'MANDATORY';
        if (item._se && item._se >= 1 && item._se <= 10) {
            category = 'MANDATORY';
        } else if (item._el) {
            category = 'ELECTIVE';
        }

        // SPECIAL CASE: If name contains "Atividade Complementar", set category
        if (item._di.toLowerCase().includes('complementar') || item._di.toLowerCase().includes('monitoria')) {
            category = 'COMPLEMENTARY';
        }

        // We need to find the subject ID. 
        // Best effort: match by name and course code.
        const { data: courses } = await supabase.from('courses').select('id').eq('code', item._cu);
        if (!courses || courses.length === 0) continue;
        const courseId = courses[0].id;

        const { error } = await supabase
            .from('subjects')
            .update({
                practical_credits: practicalCredits,
                theory_credits: theoryCredits,
                category: category
            })
            .eq('course_id', courseId)
            .eq('name', item._di);

        if (error) {
            console.error(`Error updating ${item._di}:`, error);
            errors++;
        } else {
            updatedCount++;
        }

        if (updatedCount % 50 === 0) process.stdout.write('.');
    }

    console.log(`\nFinished. Updated: ${updatedCount}, Errors: ${errors}`);
}

fixData();
