import { supabase } from './src/lib/supabaseClient';

async function checkData() {
    const { data: user, error: userError } = await supabase.from('users').select('*, courses(*)').eq('username', 'maique').single();
    if (userError) { console.error('user error', userError); return; }
    console.log('User Course ID:', user.course_id);

    const { data: equivs, error: eqError } = await supabase
        .from('subject_equivalencies')
        .select(`
            *,
            target_subject:subjects!target_subject_id(acronym, name),
            source_subject:subjects!source_subject_id(acronym, name)
        `)
        .or(`course_id.eq.${user.course_id},course_id.is.null`);

    if (eqError) { console.error('equiv error', eqError); return; }
    console.log('Equivalencies Count:', equivs?.length);
    console.table(equivs?.map(e => ({
        course: e.course_id,
        target: e.target_subject?.name,
        source: e.source_subject?.name
    })));
}

checkData();
