import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://wilcgyjhqsrcnwxpohfc.supabase.co',
    'sb_publishable_vXsyF_bOXSpLXQzeMI7Ftg_uIcD9XsX'
);

async function main() {
    console.log('=== TODOS OS PERÍODOS - OPTATIVAS ===\n');

    const { data: course } = await supabase
        .from('courses')
        .select('id, code')
        .eq('code', 'engcomp')
        .single();

    const { data: subjects } = await supabase
        .from('subjects')
        .select('id, name, acronym, semester, optional, active')
        .eq('course_id', course.id)
        .eq('optional', true)
        .order('semester');

    const { data: classes } = await supabase
        .from('classes')
        .select('subject_id, class')
        .in('subject_id', subjects.map(s => s.id));

    const classesBySubject = new Map();
    (classes || []).forEach(c => {
        if (!classesBySubject.has(c.subject_id)) classesBySubject.set(c.subject_id, new Set());
        classesBySubject.get(c.subject_id).add(c.class);
    });

    console.log('Todas as matérias marcadas como optional=true no banco:');
    console.log('─'.repeat(80));

    const byPeriod = {};
    subjects.forEach(s => {
        if (!byPeriod[s.semester]) byPeriod[s.semester] = [];
        byPeriod[s.semester].push(s);
    });

    Object.keys(byPeriod).sort((a,b)=>Number(a)-Number(b)).forEach(per => {
        console.log(`\n  ${per}º Período:`);
        byPeriod[per].forEach(s => {
            const turmas = classesBySubject.get(s.id);
            const act = s.active ? '✅' : '❌';
            if (turmas && turmas.size > 0) {
                Array.from(turmas).forEach(t => {
                    // Simula remove()
                    let finalName = t;
                    if (finalName.endsWith(' - A') || finalName.endsWith(' - B')) {
                        finalName = finalName.substring(0, finalName.length - 4);
                    }
                    if (!finalName.includes(' - OPT')) finalName += ' - OPT';
                    const bug = !finalName.includes(' - OPT');
                    console.log(`    ${bug ? '❌ BUG' : '✅'} ${act} [${s.acronym.padEnd(5)}] turma="${t}" → "${finalName}"`);
                });
            } else {
                let finalName = s.name;
                if (!finalName.includes(' - OPT')) finalName += ' - OPT';
                console.log(`    ✅ ${act} [${s.acronym.padEnd(5)}] (sem turma) "${s.name}" → "${finalName}"`);
            }
        });
    });

    console.log('\n\n=== VERIFICANDO class_name COM POSSÍVEIS PROBLEMAS ===');
    // Buscar TODAS as turmas de todas as disciplinas do curso
    const { data: allSubjs } = await supabase
        .from('subjects')
        .select('id, name, acronym, semester, optional, active')
        .eq('course_id', course.id);

    const { data: allClasses } = await supabase
        .from('classes')
        .select('subject_id, class')
        .in('subject_id', allSubjs.map(s => s.id));

    // Procurar class_names que têm " - A" ou " - B" mas NÃO no final
    const suspicious = [];
    allClasses.forEach(c => {
        const subj = allSubjs.find(s => s.id === c.subject_id);
        if (!subj) return;
        const name = c.class || '';
        // Tem " - A" ou " - B" mas NÃO é sufixo puro
        const hasAorB_includes = name.includes(' - A') || name.includes(' - B');
        const hasAorB_endsWith = name.endsWith(' - A') || name.endsWith(' - B');
        if (hasAorB_includes && !hasAorB_endsWith) {
            suspicious.push({ subject: subj, class_name: name });
        }
        // Ou: é optativa e tem class_name estranho
        if (subj.optional && (name.includes(' - A') || name.includes(' - B'))) {
            suspicious.push({ subject: subj, class_name: name, opt: true });
        }
    });

    if (suspicious.length > 0) {
        console.log('Turmas com " - A" ou " - B" em posição suspeita:');
        suspicious.forEach(s => {
            console.log(`  ${s.opt ? '🟣 OPT' : ''} [${s.subject.acronym}] Per=${s.subject.semester} class="${s.class_name}"`);
        });
    } else {
        console.log('Nenhuma turma com " - A" / " - B" em posição suspeita encontrada.');
    }
}

main().catch(console.error);
