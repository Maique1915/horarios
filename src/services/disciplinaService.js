import { supabase } from '../lib/supabaseClient';
import { saveClassSchedule } from './classService';

let cachedData = {};
let loadingPromises = {};
let lastFetchTime = null;
let globalDbPromise = null;
let globalRegistryPromise = null;
const CACHE_DURATION = 0; // Disable cache for debugging

// Carrega o registro de cursos
// NOTE: Kept as is, but this might belong to a CourseService in the future
export const loadCoursesRegistry = async () => {
    if (globalRegistryPromise) return globalRegistryPromise;
    globalRegistryPromise = (async () => {
        const { data, error } = await supabase.from('courses').select('*');
        if (error) throw error;
        return data.map(course => ({
            _cu: course.code,
            name: course.name,
            _da: course.dimension || [15, 5],
            _hd: [],
            gid: course.id
        }));
    })();
    return globalRegistryPromise;
};

// Carrega todos os dados de disciplinas, pré-requisitos e turmas
export const loadDbData = async () => {
    const now = Date.now();
    // Cache logic disabled for now
    if (globalDbPromise) return globalDbPromise;

    globalDbPromise = (async () => {
        try {
            const { data: subjectsData, error: subjectsError } = await supabase.from('subjects').select('id, semester, name, acronym, has_practical, has_theory, elective, active, course_id, courses (code)');
            if (subjectsError) throw subjectsError;

            const subjectIds = subjectsData.map(s => s.id);

            const { data: allRequirements, error: reqError } = await supabase.from('subject_requirements').select('subject_id, type, prerequisite_subject_id, min_credits, prerequisite_subject:subjects!fk_req_prereq_subject (acronym)').in('subject_id', subjectIds);
            if (reqError) throw reqError;

            const { data: classesData, error: classesError } = await supabase.from('classes').select('subject_id, class, day_id, time_slot_id').in('subject_id', subjectIds);
            if (classesError) throw classesError;

            const requirementsMap = new Map();
            allRequirements.forEach(req => {
                if (!requirementsMap.has(req.subject_id)) requirementsMap.set(req.subject_id, []);
                requirementsMap.get(req.subject_id).push(req);
            });

            const schedulesBySubjectId = new Map();
            classesData.forEach(schedule => {
                const { subject_id, class: className, day_id, time_slot_id } = schedule;
                if (!schedulesBySubjectId.has(subject_id)) schedulesBySubjectId.set(subject_id, []);
                let subjectSchedules = schedulesBySubjectId.get(subject_id);
                let classSchedule = subjectSchedules.find(cs => cs.class_name === className);
                if (!classSchedule) {
                    classSchedule = { class_name: className, ho: [], da: [] };
                    subjectSchedules.push(classSchedule);
                }
                classSchedule.ho.push([day_id, time_slot_id]);
            });

            const mappedData = subjectsData.map(item => {
                const subjectRequirements = requirementsMap.get(item.id) || [];
                const _pr = subjectRequirements.filter(r => r.type === 'SUBJECT' && r.prerequisite_subject?.acronym).map(r => r.prerequisite_subject.acronym);
                const creditsReq = subjectRequirements.find(r => r.type === 'CREDITS');

                // Robust extraction of course code
                const _cu = Array.isArray(item.courses)
                    ? item.courses[0]?.code
                    : item.courses?.code;

                return {
                    _id: item.id,
                    _re: item.acronym,
                    _cu: _cu,
                    _se: item.semester,
                    _di: item.name,
                    _ap: item.has_practical,
                    _at: item.has_theory,
                    _el: item.elective,
                    _ag: item.active,
                    _pr: _pr,
                    _pr_creditos_input: creditsReq ? creditsReq.min_credits : 0,
                    _classSchedules: schedulesBySubjectId.get(item.id) || [],
                };
            });

            cachedData = {};
            mappedData.forEach(item => {
                if (!cachedData[item._cu]) cachedData[item._cu] = [];
                cachedData[item._cu].push(item);
            });

            lastFetchTime = now;
            return mappedData;
        } catch (error) {
            console.error('Erro ao carregar dados do Supabase:', error);
            throw error;
        } finally {
            globalDbPromise = null;
        }
    })();
    return globalDbPromise;
};

// Limpa o cache
export const clearCache = () => {
    cachedData = {};
    lastFetchTime = null;
};

// Salva (commit) um conjunto de alterações de disciplinas
export const commitChanges = async (changes, courseCode) => {
    const { data: courseData, error: courseError } = await supabase.from('courses').select('id').eq('code', courseCode).single();
    if (courseError || !courseData) throw new Error(`Curso ${courseCode} não encontrado no Supabase.`);
    const courseId = courseData.id;

    for (const change of changes) {
        const { type, payload } = change;
        const appData = payload.data;

        if (type === 'addDiscipline') {
            const { _di, _re, _se, _at, _ap, _el, _ag, _pr, _classSchedules } = appData;
            const { data: insertedData, error } = await supabase.from('subjects').insert({ name: _di, acronym: _re, semester: _se, has_theory: _at, has_practical: _ap, elective: _el, active: _ag, course_id: courseId }).select().single();
            if (error) throw error;
            const subjectId = insertedData.id;

            if (_pr && _pr.length > 0) {
                const { data: prereqSubjects, error: prereqError } = await supabase.from('subjects').select('id, acronym').in('acronym', _pr);
                if (prereqError) throw prereqError;
                const newRequirements = prereqSubjects.map(ps => ({ subject_id: subjectId, prerequisite_subject_id: ps.id, type: 'SUBJECT' }));
                await supabase.from('subject_requirements').insert(newRequirements);
            }
            if (_classSchedules && _classSchedules.length > 0) await saveClassSchedule(subjectId, _classSchedules);

        } else if (type === 'updateDiscipline') {
            const { _di, _re, _se, _at, _ap, _el, _ag, _pr } = payload.data;
            let subjectId = payload.id;
            if (!subjectId) {
                const { data: subject } = await supabase.from('subjects').select('id').eq('acronym', payload.reference).eq('course_id', courseId).single();
                subjectId = subject.id;
            }
            await supabase.from('subjects').update({ name: _di, acronym: _re, semester: _se, has_theory: _at, has_practical: _ap, elective: _el, active: _ag }).eq('id', subjectId);

            await supabase.from('subject_requirements').delete().eq('subject_id', subjectId);
            if (_pr && _pr.length > 0) {
                const { data: prereqSubjects } = await supabase.from('subjects').select('id, acronym').in('acronym', _pr);
                const newRequirements = prereqSubjects.map(ps => ({ subject_id: subjectId, prerequisite_subject_id: ps.id, type: 'SUBJECT' }));
                await supabase.from('subject_requirements').insert(newRequirements);
            }

        } else if (type === 'deleteDiscipline') {
            if (payload.id) await supabase.from('subjects').delete().eq('id', payload.id);
            else await supabase.from('subjects').delete().eq('acronym', payload.reference).eq('course_id', courseId);
        } else if (type === 'activate' || type === 'deactivate') {
            await supabase.from('subjects').update({ active: type === 'activate' }).eq('acronym', payload.reference).eq('course_id', courseId);
        }
    }
};

/**
 * Reconstructs the object that Comum.jsx needs to populate the grid.
 * Uses 'subjects' and 'courses' for main data and 'classes' for class name (_di) and schedule (_ho).
 * Flattens the structure so each Class (Turma) is a separate object.
 */
export const loadClassesForGrid = async () => {
    console.log("Service: loadClassesForGrid CALLED");
    try {
        // Reuse loadDbData to get the joined data from Supabase
        const subjects = await loadDbData();
        console.log("Service: Raw subjects loaded from DB:", subjects ? subjects.length : "NULL", subjects);

        const gridData = [];

        subjects.forEach(subject => {
            if (subject._classSchedules && subject._classSchedules.length > 0) {
                subject._classSchedules.forEach(cls => {
                    // USER REQUEST: Use ONLY the class name as it contains the full description.
                    let displayName = cls.class_name || subject._di;

                    gridData.push({
                        _cu: subject._cu,
                        _se: subject._se,
                        _di: displayName,
                        _re: subject._re,
                        _ap: subject._ap,
                        _at: subject._at,
                        _el: subject._el,
                        _ag: subject._ag,
                        _pr: subject._pr,
                        _ho: cls.ho,
                        _da: cls.da || ""
                    });
                });
            }
        });

        const filteredGridData = gridData
            .filter(item => item._se > 0 && item._ag === true)
            .sort((a, b) => a._se - b._se);

        console.log("Service: Final processed gridData:", filteredGridData.length, filteredGridData);
        return filteredGridData;
    } catch (error) {
        console.error("Service CRITICAL ERROR in loadClassesForGrid:", error);
        throw error;
    }
};
