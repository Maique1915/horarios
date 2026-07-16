// Simula EXATAMENTE o que o frontend faz — mesma ordem, mesma query
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://wilcgyjhqsrcnwxpohfc.supabase.co',
    'sb_publishable_vXsyF_bOXSpLXQzeMI7Ftg_uIcD9XsX'
);

// Replica exatamente subjectsModel.fetchSubjects
async function fetchSubjects(courseId) {
    const { data, error } = await supabase
        .from('subjects')
        .select('id, semester, name, acronym, credits, category, optional, active, course_id, courses (code, name)')
        .eq('course_id', courseId);
    if (error) throw error;
    return data;
}

// Replica exatamente classesModel.fetchClassesBySubjectIds
async function fetchClassesBySubjectIds(ids) {
    const { data, error } = await supabase
        .from('classes')
        .select('subject_id, class, day_id, time_slot_id')
        .in('subject_id', ids);
    if (error) throw error;
    return data;
}

// Replica processSubjectData
function processSubjectData(item, requirementsMap, schedulesBySubjectId) {
    const _classSchedules = schedulesBySubjectId ? (schedulesBySubjectId.get(item.id) || []) : [];
    return {
        _id: item.id,
        _re: item.acronym,
        _cu: item.courses?.name || item.courses?.code,
        _se: item.semester,
        _di: item.name,
        _ap: (item.credits || [])[1] || 0,
        _at: (item.credits || [])[0] || 0,
        _el: item.optional,
        _category: item.optional ? 'OPTIONAL' : 'MANDATORY',
        _workload: ((item.credits || [])[0] + (item.credits || [])[1] || 0) * 18,
        _ag: item.active,
        _pr: [],
        _pr_creditos_input: 0,
        _classSchedules,
        course_id: item.course_id
    };
}

// Replica loadClassesForGrid
function loadClassesForGrid(subjects) {
    const gridData = [];
    subjects.forEach(subject => {
        if (subject._classSchedules && subject._classSchedules.length > 0) {
            subject._classSchedules.forEach(cls => {
                const displayName = cls.class_name || subject._di;
                gridData.push({
                    ...subject,
                    _di: displayName,
                    _el: subject._el,
                    _ho: cls.ho,
                    class_name: cls.class_name,
                });
            });
        } else if (subject._ag === true) {
            gridData.push({ ...subject, _ho: [] });
        }
    });
    return gridData.filter(item => item._se !== undefined && Number(item._se) >= 0 && item._ag === true);
}

// Replica remove()
function remove(m) {
    const aux = [];
    const e = new Set();
    for (const i of m) {
        const key = i._re ? i._re.trim() : i._re;
        if (!e.has(key)) {
            e.add(key);
            const newItem = { ...i };
            if (newItem._di.endsWith(' - A') || newItem._di.endsWith(' - B')) {
                newItem._di = newItem._di.substring(0, newItem._di.length - 4);
            }
            if (newItem._el && !newItem._di.includes(' - OPT')) {
                newItem._di += ' - OPT';
            }
            aux.push(newItem);
        } else {
            console.log(`  ❌ DUPLICATA IGNORADA: [${key}] "${i._di}"`);
        }
    }
    return aux;
}

async function main() {
    console.log('=== SIMULAÇÃO EXATA DO PIPELINE FRONTEND ===\n');

    // Buscar curso engcomp (como no GeraGradeClient)
    const { data: course } = await supabase
        .from('courses')
        .select('id, code')
        .eq('code', 'engcomp')
        .single();
    
    console.log(`Curso id=${course.id}\n`);

    // Replicar loadDbData
    const subjectsRaw = await fetchSubjects(course.id);
    console.log(`fetchSubjects retornou ${subjectsRaw.length} disciplinas`);
    
    // Log da ordem de chegada para matérias dos períodos 6 e 7
    console.log('\nOrdem de chegada da query (períodos 6 e 7):');
    subjectsRaw.filter(s => s.semester === 6 || s.semester === 7).forEach((s, idx) => {
        console.log(`  ${idx}: [${s.acronym.padEnd(5)}] Per=${s.semester} optional=${String(s.optional).padEnd(5)} active=${s.active} "${s.name}"`);
    });

    const subjectIds = subjectsRaw.map(s => s.id);
    const classesRaw = await fetchClassesBySubjectIds(subjectIds);
    console.log(`\nfetchClassesBySubjectIds retornou ${classesRaw.length} turmas`);

    // Montar schedulesBySubjectId
    const schedulesBySubjectId = new Map();
    classesRaw.forEach(schedule => {
        const { subject_id, class: className, day_id, time_slot_id } = schedule;
        if (!subject_id || !className || day_id === undefined || time_slot_id === undefined) return;
        if (!schedulesBySubjectId.has(subject_id)) schedulesBySubjectId.set(subject_id, []);
        let subs = schedulesBySubjectId.get(subject_id);
        let cls = subs.find(cs => cs.class_name === className);
        if (!cls) { cls = { class_name: className, ho: [], da: [], rt: [] }; subs.push(cls); }
        cls.ho.push([day_id, time_slot_id]);
    });

    // processSubjectData para todos
    const mappedData = subjectsRaw.map(item => processSubjectData(item, null, schedulesBySubjectId));

    // loadClassesForGrid
    const arr = loadClassesForGrid(mappedData);
    console.log(`\nloadClassesForGrid retornou ${arr.length} entradas`);

    // remove() para os períodos 6 e 7
    const arr67 = arr.filter(s => s._se === 6 || s._se === 7);
    console.log(`\nEntradas dos períodos 6 e 7 antes de remove(): ${arr67.length}`);
    arr67.forEach(s => {
        const flag = s._el ? '🟣 OPT' : '⬜ OBG';
        console.log(`  ${flag} [${s._re.padEnd(5)}] _el=${String(s._el).padEnd(5)} _di="${s._di}"`);
    });

    // Simular periodo() + remove() como no SelectionView (estado=0)
    console.log('\n\n=== RESULTADO FINAL: remove() aplicado a TODOS os períodos ===');
    const afterRemove = remove(arr);
    
    // Filtrar apenas 6 e 7
    const final67 = afterRemove.filter(s => s._se === 6 || s._se === 7);
    console.log('\nDisciplinas dos períodos 6 e 7 após remove():');
    final67.forEach(s => {
        const ok = s._el ? s._di.includes(' - OPT') : !s._di.includes(' - OPT');
        const status = ok ? '✅' : '❌ BUG!';
        const flag = s._el ? '🟣 OPT' : '⬜ OBG';
        console.log(`  ${status} ${flag} [${s._re.padEnd(5)}] "${s._di}"`);
    });

    // Mostrar todos com BUG
    const bugs = afterRemove.filter(s => s._el && !s._di.includes(' - OPT'));
    if (bugs.length > 0) {
        console.log('\n🚨 BUGS ENCONTRADOS — optativas sem OPT:');
        bugs.forEach(s => console.log(`  ❌ [${s._re}] Per=${s._se} _el=${s._el} "${s._di}"`));
    } else {
        console.log('\n✅ Nenhum bug encontrado na simulação.');
        console.log('   Se o problema persiste no browser, o cache do React Query (staleTime 24h)');
        console.log('   pode estar retornando dados antigos. Use Ctrl+Shift+R no browser para forçar refresh.');
    }
}

main().catch(console.error);
