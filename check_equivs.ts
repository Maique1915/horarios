import { supabase } from './src/lib/supabaseClient';

async function checkEquivalencies() {
    const { data: subjects, error: subError } = await supabase
        .from('subjects')
        .select('id, acronym, name')
        .ilike('name', '%Álgebra Linear%');

    if (subError) {
        console.error('Error fetching subjects:', subError);
        return;
    }

    console.log('--- Subjects ---');
    console.table(subjects);

    if (subjects && subjects.length > 0) {
        const ids = subjects.map(s => s.id);
        const { data: equivs, error: eqError } = await supabase
            .from('subject_equivalencies')
            .select('*')
            .or(`target_subject_id.in.(${ids.join(',')}),source_subject_id.in.(${ids.join(',')})`);

        if (eqError) {
            console.error('Error fetching equivalencies:', eqError);
            return;
        }

        console.log('--- Equivalencies ---');
        console.table(equivs);
    }
}

checkEquivalencies();
