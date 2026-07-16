// Simula EXATAMENTE o processSubjectData do service
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://wilcgyjhqsrcnwxpohfc.supabase.co',
    'sb_publishable_vXsyF_bOXSpLXQzeMI7Ftg_uIcD9XsX'
);

async function main() {
    console.log('=== DIAGNÓSTICO 3: ESTADO FINAL _el PÓS-processSubjectData ===\n');

    const { data: course } = await supabase
        .from('courses')
        .select('id, code')
        .eq('code', 'engcomp')
        .single();

    // Exatamente como subjectsModel.fetchSubjects faz
    const { data: rawSubjects } = await supabase
        .from('subjects')
        .select('id, semester, name, acronym, credits, category, optional, active, course_id, courses (code, name)')
        .eq('course_id', course.id);

    console.log(`Raw subjects: ${rawSubjects.length}`);

    // Checar EXATAMENTE os valores do campo optional
    const periods6and7 = rawSubjects.filter(s => s.semester === 6 || s.semester === 7);
    
    console.log('\n--- CAMPO optional BRUTO DO BANCO (como subjectsModel retorna) ---');
    periods6and7.forEach(s => {
        const v = s.optional;
        // Simula processSubjectData:  _el: item.optional
        const _el = v;
        console.log(`  [${String(s.acronym).padEnd(5)}] Per=${s.semester}  optional=${JSON.stringify(v).padEnd(8)}  type=${typeof v}  → _el=${_el}`);
    });

    // Agora buscar turmas e simular loadClassesForGrid COMPLETO
    const { data: classes } = await supabase
        .from('classes')
        .select('subject_id, class, day_id, time_slot_id')
        .in('subject_id', rawSubjects.map(s => s.id));

    const schedulesBySubjectId = new Map();
    (classes || []).forEach(c => {
        if (!schedulesBySubjectId.has(c.subject_id)) schedulesBySubjectId.set(c.subject_id, []);
        const arr = schedulesBySubjectId.get(c.subject_id);
        let cls = arr.find(x => x.class_name === c.class);
        if (!cls) { cls = { class_name: c.class, ho: [] }; arr.push(cls); }
        cls.ho.push([c.day_id, c.time_slot_id]);
    });

    // processSubjectData para cada disciplina
    const mappedData = rawSubjects.map(item => {
        const _classSchedules = schedulesBySubjectId.get(item.id) || [];
        return {
            _id: item.id,
            _re: item.acronym,
            _se: item.semester,
            _di: item.name,
            _el: item.optional,          // exatamente: item.optional
            _category: item.optional ? 'OPTIONAL' : 'MANDATORY',
            _ag: item.active,
            _classSchedules,
        };
    });

    // Depois: loadClassesForGrid
    const gridData = [];
    mappedData.forEach(subject => {
        if (subject._classSchedules.length > 0) {
            subject._classSchedules.forEach(cls => {
                const displayName = cls.class_name || subject._di;
                gridData.push({
                    ...subject,
                    _di: displayName,
                    _ho: cls.ho,
                    class_name: cls.class_name,
                });
            });
        } else if (subject._ag === true) {
            gridData.push({ ...subject, _ho: [] });
        }
    });

    // Filtrar apenas períodos 6 e 7
    const g67 = gridData.filter(s => (s._se === 6 || s._se === 7) && s._ag === true);

    console.log('\n--- GRID FINAL (como remove() recebe) ---');
    g67.forEach(s => {
        const flag = s._el ? '🟣 OPT' : '⬜ OBG';
        console.log(`  ${flag} [${String(s._re).padEnd(5)}] _el=${String(s._el).padEnd(5)} _di="${s._di}"`);
    });

    // remove() com nova lógica
    console.log('\n--- RESULTADO remove() → nomes finais ---');
    const e = new Set();
    g67.forEach(i => {
        const key = i._re ? i._re.trim() : i._re;
        if (e.has(key)) { console.log(`  [DUPLICATA IGNORADA] ${key}`); return; }
        e.add(key);
        const newItem = { ...i };
        if (newItem._di.endsWith(' - A') || newItem._di.endsWith(' - B')) {
            newItem._di = newItem._di.substring(0, newItem._di.length - 4);
        }
        if (newItem._el && !newItem._di.includes(' - OPT')) {
            newItem._di += ' - OPT';
        }
        const ok = newItem._el ? newItem._di.includes(' - OPT') : !newItem._di.includes(' - OPT');
        const status = ok ? '✅' : '❌ BUG';
        console.log(`  ${status} [${String(i._re).padEnd(5)}] ${newItem._di}`);
    });
}

main().catch(console.error);
