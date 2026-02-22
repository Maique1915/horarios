import { supabase } from './src/lib/supabaseClient';

async function checkRows() {
    const { data, error } = await supabase
        .from('subject_equivalencies')
        .select(`
            *,
            target:subjects!target_subject_id(acronym, name),
            source:subjects!source_subject_id(acronym, name)
        `);

    if (error) { console.error(error); return; }

    console.log('Total Equivalencies:', data.length);
    const filtered = data.filter(d =>
        d.target?.name?.toLowerCase().includes('algebra') ||
        d.source?.name?.toLowerCase().includes('algebra') ||
        d.target?.acronym?.toLowerCase().includes('alg') ||
        d.source?.acronym?.toLowerCase().includes('alg')
    );

    console.table(filtered.map(f => ({
        target: `${f.target?.acronym} - ${f.target?.name}`,
        source: `${f.source?.acronym} - ${f.source?.name}`,
        course: f.course_id
    })));
}

checkRows();
