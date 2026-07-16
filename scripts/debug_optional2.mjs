import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://wilcgyjhqsrcnwxpohfc.supabase.co',
    'sb_publishable_vXsyF_bOXSpLXQzeMI7Ftg_uIcD9XsX'
);

async function main() {
    console.log('=== DIAGNÓSTICO AVANÇADO: SIMULA loadClassesForGrid ===\n');

    const { data: course } = await supabase
        .from('courses')
        .select('id, code')
        .eq('code', 'engcomp')
        .single();

    // Buscar TODAS as disciplinas do curso (como loadDbData faz)
    const { data: subjects } = await supabase
        .from('subjects')
        .select('id, name, acronym, semester, optional, active, credits, course_id')
        .eq('course_id', course.id)
        .order('semester');

    // Buscar TODAS as turmas
    const { data: classes } = await supabase
        .from('classes')
        .select('subject_id, class, day_id, time_slot_id')
        .in('subject_id', subjects.map(s => s.id));

    // Montar mapa de turmas
    const schedulesBySubjectId = new Map();
    (classes || []).forEach(c => {
        const { subject_id, class: className, day_id, time_slot_id } = c;
        if (!schedulesBySubjectId.has(subject_id)) schedulesBySubjectId.set(subject_id, []);
        const subs = schedulesBySubjectId.get(subject_id);
        let cls = subs.find(s => s.class_name === className);
        if (!cls) { cls = { class_name: className, ho: [] }; subs.push(cls); }
        cls.ho.push([day_id, time_slot_id]);
    });

    // Simula exatamente o que loadClassesForGrid faz
    const gridData = [];

    subjects.forEach(subject => {
        const _classSchedules = schedulesBySubjectId.get(subject.id) || [];
        const _el = subject.optional;

        if (_classSchedules.length > 0) {
            // TEM TURMAS: usa class_name como _di
            _classSchedules.forEach(cls => {
                const displayName = cls.class_name || subject.name;
                gridData.push({
                    _id: subject.id,
                    _re: subject.acronym,
                    _se: subject.semester,
                    _di: displayName,   // ← _di = class_name, NÃO o nome da matéria!
                    _el: _el,
                    _ag: subject.active,
                    _ho: cls.ho,
                    source: 'tem_turma'
                });
            });
        } else if (subject.active) {
            // SEM TURMAS mas ATIVA: usa nome da matéria como _di
            gridData.push({
                _id: subject.id,
                _re: subject.acronym,
                _se: subject.semester,
                _di: subject.name,      // ← _di = nome da matéria
                _el: _el,
                _ag: subject.active,
                _ho: [],
                source: 'sem_turma'
            });
        }
    });

    // Filtra períodos 6 e 7
    const filtered = gridData.filter(s => s._se === 6 || s._se === 7);

    console.log('Resultado do gridData (períodos 6 e 7):');
    console.log(`${'─'.repeat(100)}`);
    console.log(`${'sigla'.padEnd(7)} ${'per'.padEnd(4)} ${'optional'.padEnd(9)} ${'_el'.padEnd(6)} ${'source'.padEnd(11)} _di`);
    console.log(`${'─'.repeat(100)}`);

    filtered.forEach(s => {
        const flag = s._el ? '🟣 OPT' : '⬜ OBG';
        console.log(`${s._re.padEnd(7)} ${String(s._se).padEnd(4)} ${flag.padEnd(9)} ${String(s._el).padEnd(6)} ${s.source.padEnd(11)} "${s._di}"`);
    });

    // Agora simula a função remove()
    console.log('\n\nSimulação da função remove() sobre o gridData:');
    console.log(`${'─'.repeat(100)}`);

    const e = new Set();
    filtered.forEach(i => {
        const key = i._re ? i._re.trim() : i._re;
        if (e.has(key)) return; // duplicata
        e.add(key);

        const newItem = { ...i };
        let action = '';

        // NOVA LÓGICA (após fix)
        if (newItem._di.endsWith(' - A') || newItem._di.endsWith(' - B')) {
            newItem._di = newItem._di.substring(0, newItem._di.length - 4);
            action += '[strip A/B] ';
        }
        if (newItem._el && !newItem._di.includes(' - OPT')) {
            newItem._di += ' - OPT';
            action += '[+OPT] ';
        }

        const showsOPT = newItem._di.includes(' - OPT');
        const bug = i._el && !showsOPT;
        const status = bug ? '❌ BUG!' : '✅';

        console.log(`${status} [${i._re.padEnd(5)}] _el=${String(i._el).padEnd(5)} "${i._di.substring(0,40).padEnd(40)}" → "${newItem._di.substring(0,45)}"  ${action}`);
    });

    // Verificar se o problema pode ser no campo optional chegando como null/undefined
    console.log('\n\nVALORES BRUTOS do campo optional no banco:');
    console.log(`${'─'.repeat(60)}`);
    subjects.filter(s => s.semester === 6 || s.semester === 7).forEach(s => {
        const raw = s.optional;
        const type = typeof raw;
        console.log(`  [${s.acronym.padEnd(5)}] optional = ${JSON.stringify(raw).padEnd(8)} (tipo: ${type})`);
    });
}

main().catch(console.error);
