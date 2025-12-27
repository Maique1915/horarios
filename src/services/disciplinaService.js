import { supabase } from '../lib/supabaseClient.js';
import { saveClassSchedule } from './classService.js';
import staticDbData from '../model/db.json';

let cachedData = {};
let loadingPromises = {};
let lastFetchTime = null;
let globalDbPromise = null;
let globalRegistryPromise = null;
const CACHE_DURATION = 0; // Disable cache for debugging

import { getDays, getTimeSlots } from './scheduleService.js';

// ... (existing imports)

// Carrega o registro de cursos
export const loadCoursesRegistry = async () => {
    if (globalRegistryPromise) return globalRegistryPromise;
    globalRegistryPromise = (async () => {
        const [coursesResult, days, timeSlots] = await Promise.all([
            supabase.from('courses').select('*'),
            getDays(),
            getTimeSlots()
        ]);

        const { data, error } = coursesResult;
        if (error) throw error;

        // Populate _hd with [days, timeSlots]
        const hd = [days, timeSlots];

        return data.map(course => ({
            _cu: course.code,
            name: course.name,
            _da: course.dimension || [15, 5],
            _hd: hd,
            gid: course.id
        }));
    })();
    return globalRegistryPromise;
};

// Carrega todos os dados de disciplinas, pré-requisitos e turmas
export const loadDbData = async (courseCode = null) => {
    const now = Date.now();
    const cacheKey = courseCode || 'all';

    if (loadingPromises[cacheKey]) return loadingPromises[cacheKey];

    loadingPromises[cacheKey] = (async () => {
        try {
            let subjectsData, subjectsError;
            let courseData = null;

            if (courseCode) {
                console.time('fetch_course_id');
                const result = await supabase.from('courses').select('id').eq('code', courseCode).single();
                console.timeEnd('fetch_course_id');
                if (result.error) throw result.error;
                courseData = result.data;
            }

            try {
                // Corrected Query: Use 'has_practical' (typo) and 'has_theory' as the source of credits
                let q = supabase.from('subjects').select('id, semester, name, acronym, has_practical, has_theory, category, elective, active, course_id, courses (code)');
                if (courseCode && courseData) q = q.eq('course_id', courseData.id);

                const result = await q;
                if (result.error) throw result.error;
                subjectsData = result.data;
            } catch (err) {
                console.warn("Primary subject fetch failed, trying legacy...", err.message);
                subjectsError = err;
            }

            if (subjectsError) throw subjectsError;

            const staticDataMap = new Map(staticDbData.map(item => [item._di, item]));
            const subjectIds = subjectsData.map(s => s.id);

            console.time('fetch_dependencies');
            const [
                { data: allRequirements, error: reqError },
                { data: classesData, error: classesError }
            ] = await Promise.all([
                supabase.from('subject_requirements').select('subject_id, type, prerequisite_subject_id, min_credits, prerequisite_subject:subjects!fk_req_prereq_subject (acronym)').in('subject_id', subjectIds),
                supabase.from('classes').select('subject_id, class, day_id, time_slot_id').in('subject_id', subjectIds)
            ]);
            console.timeEnd('fetch_dependencies');

            if (reqError) throw reqError;
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

                const _cu = Array.isArray(item.courses)
                    ? item.courses[0]?.code
                    : item.courses?.code;

                const staticItem = staticDataMap.get(item.name);

                // MAPPING CORRECTION: 'has_practical' and 'has_theory' ARE the credit values (integers)
                const practCreds = item.has_practical;
                const theoryCreds = item.has_theory;

                return {
                    _id: item.id,
                    _re: item.acronym,
                    _cu: _cu,
                    _se: item.semester,
                    _di: item.name,
                    _ap: practCreds,
                    _at: theoryCreds,
                    ...processCategoryAndElective(item), // Refactored categorization
                    _workload: (practCreds + theoryCreds) * 18,
                    _ag: item.active,
                    _pr: _pr,
                    _pr_creditos_input: creditsReq ? creditsReq.min_credits : 0,
                    _classSchedules: schedulesBySubjectId ? (schedulesBySubjectId.get(item.id) || []) : [],
                };
            });

            if (!courseCode) {
                cachedData = {};
                mappedData.forEach(item => {
                    if (!cachedData[item._cu]) cachedData[item._cu] = [];
                    cachedData[item._cu].push(item);
                });
            }

            lastFetchTime = now;
            return mappedData;
        } catch (error) {
            console.error('Erro ao carregar dados do Supabase:', error);
            throw error;
        } finally {
            delete loadingPromises[cacheKey];
            globalDbPromise = null;
        }
    })();
    return loadingPromises[cacheKey];
};

export const clearCache = () => {
    cachedData = {};
    lastFetchTime = null;
};

const splitPrerequisites = (prList) => {
    const subjectAcronyms = [];
    let minCredits = 0;
    if (prList) {
        prList.forEach(pr => {
            if (typeof pr === 'string') subjectAcronyms.push(pr);
            else if (typeof pr === 'number') minCredits = pr;
        });
    }
    return { subjectAcronyms, minCredits };
};

const processCategoryAndElective = (item) => {
    // CORRECTION: Direct Mapping as explicitly requested.
    // DB elective=true -> Elective
    // DB elective=false -> Mandatory

    return {
        _el: !!item.elective,
        _category: item.elective ? 'ELECTIVE' : 'MANDATORY'
    };
};


// Main processor for individual item (used by loadCompletedSubjects)
const processSubjectData = (item, requirementsMap, schedulesBySubjectId) => {
    const subjectRequirements = requirementsMap ? (requirementsMap.get(item.id) || []) : [];
    const _pr = subjectRequirements.filter(r => r.type === 'SUBJECT' && r.prerequisite_subject?.acronym).map(r => r.prerequisite_subject.acronym);
    const creditsReq = subjectRequirements.find(r => r.type === 'CREDITS');

    const _cu = Array.isArray(item.courses) ? item.courses[0]?.code : item.courses?.code;

    // Static fallback for credits
    const staticItem = staticDbData.find(s => s._di === item.name);
    // User DB schema: has_pratical (typo) / has_theory are INTEGER columns storing credits
    const dbPractical = (item.has_pratical !== undefined && item.has_pratical !== null) ? Number(item.has_pratical) : ((item.has_practical !== undefined && item.has_practical !== null) ? Number(item.has_practical) : 0);
    const dbTheory = (item.has_theory !== undefined && item.has_theory !== null) ? Number(item.has_theory) : 0;

    const practCreds = dbPractical > 0 ? dbPractical : (staticItem ? (staticItem._ap || 0) : 0);
    const theoryCreds = dbTheory > 0 ? dbTheory : (staticItem ? (staticItem._at || 0) : 0);

    // Refactored logic
    const { _el, _category } = processCategoryAndElective(item);

    return {
        _id: item.id,
        _re: item.acronym,
        _cu: _cu,
        _se: item.semester,
        _di: item.name,
        _ap: practCreds,
        _at: theoryCreds,
        _el,
        _category,
        _workload: (practCreds + theoryCreds) * 18,
        _ag: item.active,
        _pr: _pr,
        _pr_creditos_input: creditsReq ? creditsReq.min_credits : 0,
        _classSchedules: schedulesBySubjectId ? (schedulesBySubjectId.get(item.id) || []) : [],
    };
};

// Atomic Operations for Immediate Persistence

export const addSubject = async (courseCode, subjectData) => {
    const { _di, _re, _se, _at, _ap, _el, _ag, _pr, _classSchedules } = subjectData;

    const { data: courseData, error: courseError } = await supabase.from('courses').select('id').eq('code', courseCode).single();
    if (courseError || !courseData) throw new Error(`Curso ${courseCode} não encontrado.`);
    const courseId = courseData.id;

    // Logic: _el=true (Elective) -> DB: elective=true
    const dbElective = !!_el;

    const { data: insertedData, error } = await supabase.from('subjects').insert({
        name: _di,
        acronym: _re,
        semester: _se,
        has_theory: _at,
        has_practical: _ap,
        elective: dbElective,
        active: _ag,
        course_id: courseId
    }).select().single();

    if (error) throw error;
    const subjectId = insertedData.id;

    const { subjectAcronyms, minCredits } = splitPrerequisites(_pr);

    if (subjectAcronyms.length > 0) {
        const { data: prereqSubjects, error: prereqError } = await supabase.from('subjects').select('id, acronym').in('acronym', subjectAcronyms);
        if (prereqError) throw prereqError;
        const newRequirements = prereqSubjects.map(ps => ({ subject_id: subjectId, prerequisite_subject_id: ps.id, type: 'SUBJECT' }));
        await supabase.from('subject_requirements').insert(newRequirements);
    }
    if (minCredits > 0) {
        await supabase.from('subject_requirements').insert({
            subject_id: subjectId,
            type: 'CREDITS',
            min_credits: minCredits
        });
    }

    if (_classSchedules && _classSchedules.length > 0) await saveClassSchedule(subjectId, _classSchedules);
    return insertedData;
};

export const updateSubject = async (courseCode, subjectId, subjectData) => {
    const { _di, _re, _se, _at, _ap, _el, _ag, _pr } = subjectData;

    // Logic: _el=true (Elective) -> DB: elective=true
    const dbElective = !!_el;

    const { error } = await supabase.from('subjects').update({
        name: _di,
        acronym: _re,
        semester: _se,
        has_theory: _at,
        has_practical: _ap,
        elective: dbElective,
        active: _ag
    }).eq('id', subjectId);

    if (error) throw error;

    // Update requirements
    await supabase.from('subject_requirements').delete().eq('subject_id', subjectId);

    const { subjectAcronyms, minCredits } = splitPrerequisites(_pr);

    if (subjectAcronyms.length > 0) {
        const { data: prereqSubjects } = await supabase.from('subjects').select('id, acronym').in('acronym', subjectAcronyms);
        const newRequirements = prereqSubjects.map(ps => ({ subject_id: subjectId, prerequisite_subject_id: ps.id, type: 'SUBJECT' }));
        await supabase.from('subject_requirements').insert(newRequirements);
    }
    if (minCredits > 0) {
        await supabase.from('subject_requirements').insert({
            subject_id: subjectId,
            type: 'CREDITS',
            min_credits: minCredits
        });
    }
    return { id: subjectId };
};

export const deleteSubject = async (subjectId) => {
    const { error } = await supabase.from('subjects').delete().eq('id', subjectId);
    if (error) throw error;
};

export const deleteSubjectByAcronym = async (courseCode, acronym) => {
    const { data: courseData } = await supabase.from('courses').select('id').eq('code', courseCode).single();
    if (!courseData) throw new Error("Course not found");

    const { error } = await supabase.from('subjects').delete().eq('acronym', acronym).eq('course_id', courseData.id);
    if (error) throw error;
};

export const toggleSubjectStatus = async (subjectId, isActive) => {
    const { error } = await supabase.from('subjects').update({ active: isActive }).eq('id', subjectId);
    if (error) throw error;
};

export const commitChanges = async (changes, courseCode) => {
    // Legacy function support if needed, or redirect to new atomic functions
    const { data: courseData, error: courseError } = await supabase.from('courses').select('id').eq('code', courseCode).single();
    if (courseError || !courseData) throw new Error(`Curso ${courseCode} não encontrado no Supabase.`);
    const courseId = courseData.id;

    for (const change of changes) {
        const { type, payload } = change;
        const appData = payload.data;

        if (type === 'addDiscipline') {
            await addSubject(courseCode, appData);
        } else if (type === 'updateDiscipline') {
            let subjectId = payload.id;
            if (!subjectId) {
                const { data: subject } = await supabase.from('subjects').select('id').eq('acronym', payload.reference).eq('course_id', courseId).single();
                subjectId = subject.id;
            }
            await updateSubject(courseCode, subjectId, appData);
        } else if (type === 'deleteDiscipline') {
            if (payload.id) await deleteSubject(payload.id);
            else await deleteSubjectByAcronym(courseCode, payload.reference);
        } else if (type === 'activate' || type === 'deactivate') {
            // This one is tricky because we need ID or Acronym. 
            // payload.reference is acronym.
            // Let's look up ID or use acronym updater.
            await supabase.from('subjects').update({ active: type === 'activate' }).eq('acronym', payload.reference).eq('course_id', courseId);
        }
    }
};

export const loadClassesForGrid = async (courseCode) => {
    try {
        const subjects = await loadDbData(courseCode);
        const gridData = [];
        subjects.forEach(subject => {
            if (subject._classSchedules && subject._classSchedules.length > 0) {
                subject._classSchedules.forEach(cls => {
                    let displayName = cls.class_name || subject._di;
                    gridData.push({
                        _id: subject._id, // Required for saving
                        _cu: subject._cu,
                        _se: subject._se, // Uses logic from processCategoryAndElective now implicitly? No, loadDbData uses it.
                        _di: displayName,
                        _re: subject._re,
                        _ap: subject._ap,
                        _at: subject._at,
                        _el: subject._el,
                        _ag: subject._ag,
                        _pr: subject._pr,
                        _pr_creditos_input: subject._pr_creditos_input,
                        _ho: cls.ho,
                        _da: cls.da || "",
                        class_name: cls.class_name // Passed for saving
                    });
                });
            }
        });
        return gridData.filter(item => item._se > 0 && item._ag === true).sort((a, b) => a._se - b._se);
    } catch (error) {
        console.error("Service CRITICAL ERROR in loadClassesForGrid:", error);
        throw error;
    }
};

export const getStudentData = async (userId) => {
    const { data, error } = await supabase
        .from('users')
        .select('name, registration, course_name')
        .eq('id', userId)
        .single();

    if (error) {
        // console.error('Error loading student data:', error);
        return null;
    }
    return data;
};

const mapCompletedSubjects = (data) => {
    return data.map(item => {
        // DEBUG LOG
        // console.log("Processing item:", item.subjects.acronym, "Pratical:", item.subjects.has_pratical, "Practical:", item.subjects.has_practical, "Theory:", item.subjects.has_theory);

        const processedSubject = processSubjectData(item.subjects, null, null);
        return {
            ...processedSubject,
            completed_at: item.completed_at,
            course_name: item.subjects.courses?.name
        };
    });
};

export const loadCompletedSubjects = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('completed_subjects')
            .select(`
                completed_at,
                subjects (
                    *,
                    courses (code, name)
                )
            `)
            .eq('user_id', userId);

        if (error) throw error;
        return mapCompletedSubjects(data);
    } catch (error) {
        console.warn("Service: Attempting legacy fetch due to:", error.message);
        const { data, error: legacyError } = await supabase
            .from('completed_subjects')
            .select(`
                completed_at,
                subjects (
                    *,
                    courses (code, name)
                )
            `)
            .eq('user_id', userId);

        if (legacyError) throw legacyError;
        return mapCompletedSubjects(data);
    }
};

export const loadCurrentEnrollments = async (userId) => {
    const { data, error } = await supabase
        .from('current_enrollments')
        .select(`
            class_name,
            semester,
            schedule_data,
            created_at,
            subjects (
                id,
                name,
                acronym,
                semester,
                course_id,
                courses (code, name)
            )
        `)
        .eq('user_id', userId);

    if (error) throw error;
    return data.map(item => ({
        ...item.subjects,
        class_name: item.class_name,
        semester: item.semester, // Prefer enrollment semester if available
        schedule_data: typeof item.schedule_data === 'string' ? JSON.parse(item.schedule_data) : item.schedule_data,
        created_at: item.created_at,
        course_name: item.subjects.courses?.name
    }));
};

export const getCourseTotalSubjects = async (courseCode) => {
    if (!courseCode) return 0;
    const { data: course, error: courseError } = await supabase.from('courses').select('id').eq('code', courseCode).single();
    if (courseError) return 0;
    const { count, error } = await supabase.from('subjects').select('*', { count: 'exact', head: true }).eq('course_id', course.id).eq('active', true);
    if (error) return 0;
    return count;
};

export const toggleCompletedSubject = async (userId, subjectId, isCompleted) => {
    if (isCompleted) {
        const { error } = await supabase.from('completed_subjects').upsert({ user_id: userId, subject_id: subjectId }, { onConflict: 'user_id, subject_id' });
        if (error) throw error;
    } else {
        const { error } = await supabase.from('completed_subjects').delete().eq('user_id', userId).eq('subject_id', subjectId);
        if (error) throw error;
    }
};

export const toggleMultipleSubjects = async (userId, subjectIds, isCompleted) => {
    if (!subjectIds || subjectIds.length === 0) return;

    if (isCompleted) {
        const rows = subjectIds.map(id => ({ user_id: userId, subject_id: id }));
        const { error } = await supabase.from('completed_subjects').upsert(rows, { onConflict: 'user_id, subject_id' });
        if (error) throw error;
    } else {
        const { error } = await supabase.from('completed_subjects').delete().eq('user_id', userId).in('subject_id', subjectIds);
        if (error) throw error;
    }
};

export const saveCurrentEnrollments = async (userId, enrollments, semester) => {
    // 1. Clear existing enrollments for this specific semester
    const { error: deleteError } = await supabase
        .from('current_enrollments')
        .delete()
        .eq('user_id', userId)
        .eq('semester', semester);

    if (deleteError) throw deleteError;

    if (!enrollments || enrollments.length === 0) return;

    // 2. Insert new enrollments
    const rows = enrollments.map(item => ({
        user_id: userId,
        subject_id: item._id,
        class_name: item.class_name || null,
        semester: semester,
        schedule_data: item._ho || []
    }));

    const { error: insertError } = await supabase
        .from('current_enrollments')
        .insert(rows);

    if (insertError) throw insertError;
};
