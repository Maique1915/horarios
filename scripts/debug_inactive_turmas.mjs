import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://wilcgyjhqsrcnwxpohfc.supabase.co',
    'sb_publishable_vXsyF_bOXSpLXQzeMI7Ftg_uIcD9XsX'
);

async function main() {
    // Buscar as disciplinas duplicadas inativas
    const duplicateNames = ['Organização do Trabalho e Normas', 'Iniciação Científica I', 
                            'Iniciação Científica II', 'Iniciação Científica III'];
    const duplicateAcronyms = ['2O', '1O', '4O', '5O'];

    const { data: subjects } = await supabase
        .from('subjects')
        .select('id, name, acronym, semester, optional, active')
        .in('acronym', duplicateAcronyms);

    console.log('Disciplinas com siglas duplicadas:');
    subjects.forEach(s => {
        console.log(`  [${s.acronym}] Per=${s.semester} active=${s.active} "${s.name}" (id=${s.id})`);
    });

    // Verificar se têm turmas
    const { data: classes } = await supabase
        .from('classes')
        .select('subject_id, class')
        .in('subject_id', subjects.map(s => s.id));

    console.log('\nTurmas dessas disciplinas:');
    if (!classes || classes.length === 0) {
        console.log('  Nenhuma turma encontrada para essas disciplinas.');
    } else {
        classes.forEach(c => {
            const subj = subjects.find(s => s.id === c.subject_id);
            console.log(`  [${subj?.acronym}] Per=${subj?.semester} active=${subj?.active} class="${c.class}"`);
        });
    }

    // Simula loadClassesForGrid
    console.log('\nSimulação completa de loadClassesForGrid para essas disciplinas:');
    const classesBySubject = new Map();
    (classes || []).forEach(c => {
        if (!classesBySubject.has(c.subject_id)) classesBySubject.set(c.subject_id, []);
        const arr = classesBySubject.get(c.subject_id);
        let cls = arr.find(x => x.class_name === c.class);
        if (!cls) { cls = { class_name: c.class, ho: [] }; arr.push(cls); }
    });

    const gridEntries = [];
    subjects.forEach(subject => {
        const _classSchedules = classesBySubject.get(subject.id) || [];
        if (_classSchedules.length > 0) {
            // TEM turmas — é incluído independente de _ag!
            _classSchedules.forEach(cls => {
                const displayName = cls.class_name || subject.name;
                gridEntries.push({ ...subject, _di: displayName, source: 'tem_turma_ENTRA' });
            });
        } else if (subject.active === true) {
            gridEntries.push({ ...subject, _di: subject.name, source: 'sem_turma_ativa_ENTRA' });
        } else {
            gridEntries.push({ ...subject, _di: subject.name, source: 'IGNORADO(_ag=false)' });
        }
    });

    gridEntries.forEach(g => {
        const flag = g.source.includes('IGNORADO') ? '⛔' : '➡️';
        console.log(`  ${flag} [${g.acronym}] Per=${g.semester} active=${g.active} source=${g.source} _di="${g._di}"`);
    });

    // Filtro final de loadClassesForGrid: _se >= 0 && _ag === true
    console.log('\nApós filtro final (_ag === true):');
    const filtered = gridEntries.filter(g => g.active === true && g.source !== 'IGNORADO(_ag=false)');
    filtered.forEach(g => {
        console.log(`  ✅ [${g.acronym}] Per=${g.semester} _di="${g._di}"`);
    });
    if (filtered.length === 0) console.log('  Nenhuma (correto — todas inativas)');
}

main().catch(console.error);
