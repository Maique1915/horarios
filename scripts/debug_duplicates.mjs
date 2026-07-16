import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://wilcgyjhqsrcnwxpohfc.supabase.co',
    'sb_publishable_vXsyF_bOXSpLXQzeMI7Ftg_uIcD9XsX'
);

async function main() {
    console.log('=== DIAGNÓSTICO: SIGLAS DUPLICADAS ===\n');

    const { data: course } = await supabase
        .from('courses')
        .select('id, code')
        .eq('code', 'engcomp')
        .single();

    const { data: subjects } = await supabase
        .from('subjects')
        .select('id, name, acronym, semester, optional, active')
        .eq('course_id', course.id)
        .order('acronym')
        .order('semester');

    // Agrupar por sigla
    const byAcronym = {};
    subjects.forEach(s => {
        if (!byAcronym[s.acronym]) byAcronym[s.acronym] = [];
        byAcronym[s.acronym].push(s);
    });

    // Encontrar duplicatas
    const duplicates = Object.entries(byAcronym).filter(([, subs]) => subs.length > 1);
    
    if (duplicates.length === 0) {
        console.log('Nenhuma sigla duplicada encontrada.');
    } else {
        console.log(`⚠️  ${duplicates.length} sigla(s) com DUPLICATAS encontrada(s):\n`);
        duplicates.forEach(([acronym, subs]) => {
            console.log(`  Sigla: [${acronym}]  (${subs.length} ocorrências)`);
            subs.forEach(s => {
                const act = s.active ? '✅ ativa' : '❌ inativa';
                const opt = s.optional ? '🟣 OPT' : '⬜ OBG';
                console.log(`    ${opt} ${act}  Per=${s.semester}  "${s.name}"`);
            });
            console.log();
        });
    }

    // Simular o que remove() faz com as duplicatas
    const { data: classes } = await supabase
        .from('classes')
        .select('subject_id, class')
        .in('subject_id', subjects.map(s => s.id));

    const classesBySubject = new Map();
    (classes || []).forEach(c => {
        if (!classesBySubject.has(c.subject_id)) classesBySubject.set(c.subject_id, new Set());
        classesBySubject.get(c.subject_id).add(c.class);
    });

    if (duplicates.length > 0) {
        console.log('Simulação de remove() com duplicatas:');
        console.log('(loadClassesForGrid retorna as matérias em ordem, remove() pega a PRIMEIRA e ignora as demais)\n');
        
        duplicates.forEach(([acronym, subs]) => {
            console.log(`  Sigla [${acronym}]:`);
            subs.forEach((s, i) => {
                const turmas = classesBySubject.get(s.id);
                const turmasArr = turmas ? Array.from(turmas) : [s.name];
                turmasArr.forEach(displayName => {
                    let finalName = displayName;
                    if (finalName.endsWith(' - A') || finalName.endsWith(' - B')) {
                        finalName = finalName.substring(0, finalName.length - 4);
                    }
                    if (s.optional && !finalName.includes(' - OPT')) finalName += ' - OPT';
                    
                    const status = i === 0 ? '✅ MOSTRADO' : '❌ IGNORADO (duplicata)';
                    const opt = s.optional ? '🟣 OPT' : '⬜ OBG';
                    console.log(`    ${status} ${opt} Per=${s.semester} _di="${displayName}" → "${finalName}"`);
                });
            });
            console.log();
        });
    }
}

main().catch(console.error);
