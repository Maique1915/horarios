import { saveClassSchedule as saveClassService } from './classService';
import { getDays, getTimeSlots } from './scheduleService';
import { supabase } from '../lib/supabaseClient';
import { Subject } from '../types/Subject';
import * as coursesModel from '../model/coursesModel';
import { DbCourse } from '../model/coursesModel';
import * as subjectsModel from '../model/subjectsModel';
import { DbSubject } from '../model/subjectsModel';
import * as classesModel from '../model/classesModel';
import { DbClass } from '../model/classesModel';
import * as requirementsModel from '../model/subjectRequirementsModel';
import { DbRequirement } from '../model/subjectRequirementsModel';
import * as completedSubjectsModel from '../model/completedSubjectsModel';
import { DbCompletedSubject } from '../model/completedSubjectsModel';
import * as currentEnrollmentsModel from '../model/currentEnrollmentsModel';
import { DbCurrentEnrollment } from '../model/currentEnrollmentsModel';
import * as usersModel from '../model/usersModel';

// Type definitions (Private to Service)
interface CourseRegistryItem {
    _cu: string;
    name: string;
    _da: number[];
    _hd: number[][]; // [days, timeSlots]
    gid: number;
}

interface ClassSchedule {
    class_name: string;
    ho: number[][]; // [[day_id, time_slot_id]]
    da: number[];
    rt: ({ start: string, end: string } | null)[];
}

export interface Enrollment extends Subject {
    class_name: string;
    period: string;
    schedule_data: ClassSchedule[];
    created_at: string;
    course_name?: string;
    // Removed index signature since Subject has it, or keep it if needed for extra props not in Subject
    // _id is in Subject as optional
}

export interface CompletedSubject extends Subject {
    completed_at: string;
    course_name?: string;
}

// State
let cachedData: Record<string, Subject[]> = {};
let loadingPromises: Record<string, Promise<Subject[]>> = {};
let lastFetchTime: number | null = null;
let globalCoursesRegistryPromise: Promise<CourseRegistryItem[]> | null = null;
const CACHE_DURATION = 0; // Disable cache for debugging

// --- Helpers ---

const processCategoryAndOptional = (item: Subject) => {
    return {
        _el: item.optional, // true = OPTATIVA, false = OBRIGATÓRIA
        _category: item.optional ? 'OPTIONAL' : 'MANDATORY'
    };
};

const splitPrerequisites = (prList: string | (string | number)[]) => {
    const subjectAcronyms: string[] = [];
    let minCredits = 0;
    if (prList) {
        if (Array.isArray(prList)) {
            prList.forEach(pr => {
                if (typeof pr === 'string') subjectAcronyms.push(pr);
                else if (typeof pr === 'number') minCredits = pr;
            });
        } else if (typeof prList === 'string') {
            subjectAcronyms.push(prList);
        }
    }
    return { subjectAcronyms, minCredits };
};

const processSubjectData = (item: DbSubject, requirementsMap: Map<number, DbRequirement[]> | null, schedulesBySubjectId: Map<number, ClassSchedule[]> | null): Subject => {
    const subjectRequirements = requirementsMap ? (requirementsMap.get(item.id) || []) : [];
    const _prRaw = subjectRequirements.filter((r) => r.type === 'SUBJECT' && r.prerequisite_subject?.acronym).map((r) => r.prerequisite_subject.acronym);
    const _pr = [...new Set(_prRaw)];
    const creditsReq = subjectRequirements.find((r) => r.type === 'CREDITS');

    // Supabase might return 'courses' (plural) depending on relationship name
    const _cu = (item as any).courses?.name || (item as any).courses?.code || (item as any).course?.name || (item as any).course?.code;
    if (!_cu) console.warn(`Service: Missing course info for subject ${item.acronym}`, item);

    // Use the credits array
    // index 0: theory, index 1: practical (mapping matches SQL migration)
    const credits = item.credits || [];
    const theoryCreds = credits[0] || 0;
    const practCreds = credits[1] || 0;

    return {
        _id: item.id,
        _re: item.acronym,
        _cu: _cu,
        _se: item.semester,
        _di: item.name,
        _ap: practCreds,
        _at: theoryCreds,
        _el: item.optional, // true = OPTATIVA, false = OBRIGATÓRIA (SEM inversão!)
        _category: item.optional ? 'OPTIONAL' : 'MANDATORY',
        _workload: (practCreds + theoryCreds) * 18,
        _ag: item.active,
        _pr: _pr,
        _pr_creditos_input: creditsReq?.min_credits ?? 0,
        _classSchedules: schedulesBySubjectId ? (schedulesBySubjectId.get(item.id) || []) : [],
        course_id: item.course_id
    };
};

// --- Exported Services ---

// ... (imports remain the same)

export const loadCoursesRegistry = async (): Promise<CourseRegistryItem[]> => {
    if (globalCoursesRegistryPromise) return globalCoursesRegistryPromise;
    globalCoursesRegistryPromise = (async () => {
        const [coursesData, days, timeSlots] = await Promise.all([
            coursesModel.fetchAllCourses(),
            getDays(),
            getTimeSlots()
        ]);

        const hd = [days, timeSlots];

        return (coursesData as DbCourse[]).map((course) => ({
            _cu: course.code,
            name: course.name,
            _da: [days.length, timeSlots.filter(t => t.course_id === course.id).length],
            _hd: [days.map(d => d.id), timeSlots.filter(t => t.course_id === course.id).map(t => t.id)],
            gid: course.id
        }));
    })();
    return globalCoursesRegistryPromise;
};

export const fetchCourseConfig = async (courseCode: string): Promise<DbCourse | null> => {
    return coursesModel.fetchCourseByCode(courseCode);
};

export const loadDbData = async (courseCode: string | null = null): Promise<Subject[]> => {
    const now = Date.now();
    const cacheKey = courseCode || 'all';

    if (cacheKey in loadingPromises) return loadingPromises[cacheKey]!;

    loadingPromises[cacheKey] = (async () => {
        try {
            let subjectsData: DbSubject[] = [];
            let courseData: DbCourse | null = null;

            if (courseCode) {
                console.time('fetch_course_id');
                courseData = await coursesModel.fetchCourseByCode(courseCode);
                console.timeEnd('fetch_course_id');
                if (!courseData) {
                    console.warn(`Course code '${courseCode}' not found.`);
                    return [];
                }
            }

            try {
                subjectsData = await subjectsModel.fetchSubjects(courseData?.id);
            } catch (err: any) {
                console.warn("Primary subject fetch failed", err.message);
                throw err;
            }

            const subjectIds = subjectsData.map(s => s.id);

            console.time('fetch_dependencies');
            const [allRequirements, classesData] = await Promise.all([
                requirementsModel.fetchRequirements(subjectIds) as Promise<DbRequirement[]>,
                classesModel.fetchClassesBySubjectIds(subjectIds) as Promise<DbClass[]>
            ]);
            console.timeEnd('fetch_dependencies');

            // Process Requirements
            const requirementsMap = new Map<number, DbRequirement[]>();
            allRequirements.forEach(req => {
                if (!requirementsMap.has(req.subject_id)) requirementsMap.set(req.subject_id, []);
                requirementsMap.get(req.subject_id)?.push(req);
            });

            // Process Classes
            const schedulesBySubjectId = new Map<number, ClassSchedule[]>();
            classesData.forEach(schedule => {
                const { subject_id, class: className, day_id, time_slot_id } = schedule;
                if (!schedulesBySubjectId.has(subject_id)) schedulesBySubjectId.set(subject_id, []);
                let subjectSchedules = schedulesBySubjectId.get(subject_id)!;
                let classSchedule = subjectSchedules.find(cs => cs.class_name === className);
                if (!classSchedule) {
                    classSchedule = { class_name: className, ho: [], da: [], rt: [] };
                    subjectSchedules.push(classSchedule);
                }
                classSchedule.ho.push([day_id, time_slot_id]);
                if ((schedule as any).start_real_time && (schedule as any).end_real_time) {
                    classSchedule.rt.push({
                        start: (schedule as any).start_real_time,
                        end: (schedule as any).end_real_time
                    });
                } else {
                    classSchedule.rt.push(null);
                }
            });

            // Map Data
            const mappedData: Subject[] = subjectsData.map(item => processSubjectData(item, requirementsMap, schedulesBySubjectId));

            if (!courseCode) {
                cachedData = {};
                mappedData.forEach(item => {
                    const cu = item._cu as string;
                    if (!cachedData[cu]) cachedData[cu] = [];
                    cachedData[cu].push(item);
                });
            }

            lastFetchTime = now;
            return mappedData;
        } catch (error) {
            console.error('Erro ao carregar dados do Supabase:', JSON.stringify(error, null, 2), error);
            throw error;
        } finally {
            delete loadingPromises[cacheKey];
        }
    })();
    return loadingPromises[cacheKey]!;
};

export const clearCache = () => {
    cachedData = {};
    lastFetchTime = null;
    globalCoursesRegistryPromise = null;
};

// --- Atomic Operations ---

export const addSubject = async (courseCode: string, subjectData: Subject): Promise<Subject> => {
    const { _di, _re, _se, _at, _ap, _el, _ag, _pr, _classSchedules } = subjectData;

    const courseData = await coursesModel.fetchCourseByCode(courseCode);
    if (!courseData) throw new Error(`Curso ${courseCode} não encontrado.`);
    const courseId = courseData.id;

    // _el=true (OPTATIVA) -> DB: optional=true (SEM inversão!)
    const dbOptional = _el;

    const insertedData = await subjectsModel.insertSubject({
        name: _di,
        acronym: _re,
        semester: _se,
        credits: subjectData.credits_array || [_at, _ap],
        optional: dbOptional,
        active: _ag,
        course_id: courseId
    });

    const subjectId = insertedData.id;

    const { subjectAcronyms, minCredits } = splitPrerequisites(_pr || []);

    if (subjectAcronyms.length > 0) {
        const prereqSubjects = await subjectsModel.fetchSubjectsByAcronymsList(subjectAcronyms);
        if (prereqSubjects && prereqSubjects.length > 0) {
            const newRequirements = prereqSubjects.map((ps: any) => ({ subject_id: subjectId, prerequisite_subject_id: ps.id, type: 'SUBJECT' }));
            await requirementsModel.insertRequirements(newRequirements);
        }
    }
    if (minCredits > 0) {
        await requirementsModel.insertRequirements([{
            subject_id: subjectId,
            type: 'CREDITS',
            min_credits: minCredits
        }]);
    }

    if (_classSchedules && _classSchedules.length > 0) {
        await saveClassService(subjectId, _classSchedules);
    }
    return insertedData;
};

export const updateSubject = async (courseCode: string, subjectId: number | string, subjectData: Subject): Promise<{ id: number | string }> => {
    console.log('Service: updateSubject called with ID:', subjectId, 'and data:', subjectData);
    const { _di, _re, _se, _at, _ap, _el, _ag, _pr } = subjectData;
    const sId = Number(subjectId);
    const dbOptional = _el; // _el=true (OPTATIVA) -> DB: optional=true

    console.log('Service: Sanitized data for DB:', {
        name: _di,
        acronym: _re,
        semester: Number(_se),
        credits: subjectData.credits_array || [Number(_at), Number(_ap)],
        optional: dbOptional,
        active: _ag
    });

    try {
        await subjectsModel.updateSubjectDb(sId, {
            name: _di,
            acronym: _re,
            semester: Number(_se),
            credits: subjectData.credits_array || [Number(_at), Number(_ap)],
            optional: dbOptional,
            active: _ag
        });
        console.log('Service: Subject updated in DB successfully');
    } catch (err) {
        console.error('Service: Error updating subject in DB:', err);
        throw err;
    }

    // Update requirements
    await requirementsModel.deleteRequirements(sId);

    const { subjectAcronyms, minCredits } = splitPrerequisites(_pr || []);

    if (subjectAcronyms.length > 0) {
        const prereqSubjects = await subjectsModel.fetchSubjectsByAcronymsList(subjectAcronyms);
        if (prereqSubjects && prereqSubjects.length > 0) {
            const newRequirements = prereqSubjects.map((ps: any) => ({
                subject_id: sId,
                prerequisite_subject_id: ps.id,
                type: 'SUBJECT'
            }));
            await requirementsModel.insertRequirements(newRequirements);
            console.log(`Updated ${newRequirements.length} subject requirements for ${sId}`);
        } else {
            console.warn(`No subjects found for acronyms: ${subjectAcronyms.join(', ')}`);
        }
    }
    if (minCredits > 0) {
        await requirementsModel.insertRequirements([{
            subject_id: sId,
            type: 'CREDITS',
            min_credits: minCredits
        }]);
        console.log(`Updated credit requirement (${minCredits}) for ${sId}`);
    }
    return { id: sId };
};

export const deleteSubject = async (subjectId: number | string): Promise<void> => {
    await subjectsModel.deleteSubjectDb(subjectId);
};

export const deleteSubjectByAcronym = async (courseCode: string, acronym: string): Promise<void> => {
    const courseData = await coursesModel.fetchCourseByCode(courseCode);
    if (!courseData) throw new Error("Course not found");

    await subjectsModel.deleteSubjectByAcronymDb(acronym, courseData.id);
};

export const toggleSubjectStatus = async (subjectId: number | string, isActive: boolean): Promise<void> => {
    await subjectsModel.updateSubjectActiveStatus(subjectId, isActive);
};

export const commitChanges = async (changes: any[], courseCode: string): Promise<void> => {
    const courseData = await coursesModel.fetchCourseByCode(courseCode);
    if (!courseData) throw new Error(`Curso ${courseCode} não encontrado.`);
    const courseId = courseData.id;

    for (const change of changes) {
        const { type, payload } = change;
        const appData = payload.data;

        if (type === 'addDiscipline') {
            await addSubject(courseCode, appData);
        } else if (type === 'updateDiscipline') {
            let subjectId = payload.id;
            if (!subjectId) {
                const subject = await subjectsModel.fetchSubjectByAcronymAndCourse(payload.reference, courseId);
                if (!subject) throw new Error(`Discipline ${payload.reference} not found to update.`);
                subjectId = subject.id;
            }
            await updateSubject(courseCode, subjectId, appData);
        } else if (type === 'deleteDiscipline') {
            if (payload.id) await deleteSubject(payload.id);
            else await deleteSubjectByAcronym(courseCode, payload.reference);
        } else if (type === 'activate' || type === 'deactivate') {
            await subjectsModel.updateSubjectActiveStatusByAcronym(payload.reference, courseId, type === 'activate');
        }
    }
};

export const loadClassesForGrid = async (courseCode: string): Promise<Subject[]> => {
    try {
        const subjects = await loadDbData(courseCode);
        const gridData: Subject[] = [];
        subjects.forEach(subject => {
            if (subject._classSchedules && subject._classSchedules.length > 0) {
                subject._classSchedules.forEach((cls: any) => {
                    let displayName = cls.class_name || subject._di;
                    gridData.push({
                        _id: subject._id,
                        _cu: subject._cu,
                        _se: subject._se,
                        _di: displayName,
                        _re: subject._re,
                        _ap: subject._ap,
                        _at: subject._at,
                        _el: subject._el,
                        _ag: subject._ag,
                        _pr: subject._pr,
                        _pr_creditos_input: subject._pr_creditos_input,
                        _ho: cls.ho,
                        _rt: cls.rt || [],
                        _da: cls.da || [],
                        class_name: cls.class_name,
                        original_name: subject._di,
                        course_id: subject.course_id
                    } as Subject);
                });
            } else if (subject._ag === true) {
                // Incluir matéria ativa mesmo sem turmas para visibilidade no passo 1
                const { _el, _category } = processCategoryAndOptional(subject);
                gridData.push({
                    _id: subject._id,
                    _cu: subject._cu,
                    _se: subject._se,
                    _di: subject._di,
                    _re: subject._re,
                    _ap: subject._ap,
                    _at: subject._at,
                    _el: _el,
                    _category: _category,
                    _workload: (Number(subject._ap || 0) + Number(subject._at || 0)) * 18,
                    _ag: subject._ag,
                    _pr: subject._pr,
                    _pr_creditos_input: subject._pr_creditos_input,
                    _ho: [],
                    _rt: [],
                    _da: [],
                    class_name: undefined,
                    original_name: subject._di,
                    course_id: subject.course_id
                } as Subject);
            }
        });
        // Ensure _se is present and is a number for filtering/sorting
        return gridData.filter(item =>
            item._se !== undefined &&
            Number(item._se) >= 0 &&
            item._ag === true
        ).sort((a, b) => Number(a._se || 0) - Number(b._se || 0));
    } catch (error) {
        console.error("Service CRITICAL ERROR in loadClassesForGrid:", error);
        throw error;
    }
};

export const getStudentData = async (userId: number): Promise<any> => {
    return usersModel.fetchStudentData(userId);
};

export const loadCompletedSubjects = async (userId: number): Promise<CompletedSubject[]> => {
    // Handling legacy error fallback in Service layer?
    // Model just fetches. Let's keep catch block here if needed, but model is simpler now.
    try {
        const data = await completedSubjectsModel.fetchCompletedSubjects(userId);
        return (data as DbCompletedSubject[]).map(item => {
            if (!item.subjects) return null;
            const processedSubject = processSubjectData(item.subjects, null, null);
            return {
                ...processedSubject,
                completed_at: item.completed_at,
                course_name: item.subjects.courses?.name
            };
        }).filter(item => item !== null) as CompletedSubject[];
    } catch (error: any) {
        console.warn("Service: Error loading completed subjects", error.message);
        throw error;
    }
};

export const loadCurrentEnrollments = async (userId: number): Promise<Enrollment[]> => {
    const data = await currentEnrollmentsModel.fetchCurrentEnrollments(userId);
    return (data as DbCurrentEnrollment[]).map(item => {
        const processedSubject = processSubjectData(item.subjects, null, null);
        const schedule_data = typeof item.schedule_data === 'string' ? JSON.parse(item.schedule_data) : item.schedule_data;

        // Ensure _ho and name are present for frontend consistency
        return {
            ...processedSubject,
            _di: processedSubject._di || item.subjects?.name,
            name: processedSubject.name || item.subjects?.name,
            class_name: item.class_name,
            period: item.semester, // Academic period (e.g. 2026.1)
            schedule_data: schedule_data,
            _ho: schedule_data?.ho || schedule_data?.[0]?.ho || [], // Populate _ho from schedule_data
            created_at: item.created_at,
            course_name: item.subjects?.courses?.name,
            course_id: item.course_id
        };
    });
};

export const getCourseTotalSubjects = async (courseCode: string): Promise<number> => {
    if (!courseCode) return 0;
    const courseData = await coursesModel.fetchCourseByCode(courseCode);
    if (!courseData) return 0;
    return subjectsModel.getCourseTotalSubjectsCount(courseData.id);
};

export const toggleCompletedSubject = async (userId: number, subjectId: number | string, isCompleted: boolean): Promise<void> => {
    if (isCompleted) {
        await completedSubjectsModel.upsertCompletedSubjects([{ user_id: userId, subject_id: subjectId }]);
    } else {
        await completedSubjectsModel.deleteCompletedSubject(userId, subjectId);
    }
};

export const toggleMultipleSubjects = async (userId: number, subjectIds: (number | string)[], isCompleted: boolean): Promise<void> => {
    console.log("toggleMultipleSubjects called:", { userId, count: subjectIds?.length, isCompleted });
    if (!subjectIds || subjectIds.length === 0) return;

    if (isCompleted) {
        const rows = subjectIds.map(id => ({ user_id: userId, subject_id: id }));
        await completedSubjectsModel.upsertCompletedSubjects(rows);
    } else {
        await completedSubjectsModel.deleteCompletedSubjects(userId, subjectIds);
    }
};

export const saveCurrentEnrollments = async (userId: number, enrollments: Subject[], semester: number | string, defaultCourseId?: number): Promise<void> => {
    // 1. Fetch existing enrollments for this user
    // Note: We fetch all and filter by semester in code or query by semester.
    // Given the model, let's fetch all (cheap) and filter.
    const allEnrollments = await currentEnrollmentsModel.fetchCurrentEnrollments(userId);
    // Ensure we match semester type (string vs number) logic
    const existingInSemester = (allEnrollments || []).filter((e: any) => String(e.semester) === String(semester));

    // 2. Identify incoming unique IDs
    const uniqueIncoming = Array.from(new Map(enrollments.map(item => [item._id, item])).values());
    const incomingIds = new Set(uniqueIncoming.map(i => i._id));

    // 3. Identify existing IDs
    const existingIds = new Set(existingInSemester.map((e: any) => e.subjects?.id || e.subject_id));

    // 4. Calculate diff
    const toDelete = Array.from(existingIds).filter(id => !incomingIds.has(id));
    const toInsert = uniqueIncoming.filter(item => !existingIds.has(item._id));

    // 5. Perform updates
    if (toDelete.length > 0) {
        // We need to cast back to (number | string)[]
        await currentEnrollmentsModel.deleteCurrentEnrollmentsList(userId, semester, toDelete);
    }

    if (toInsert.length > 0) {
        // Encontrar se algum item está sem course_id
        const missingCourseId = toInsert.filter(item => !item.course_id);
        if (missingCourseId.length > 0) {
            console.warn(`Atenção: ${missingCourseId.length} disciplinas sem course_id detectadas.`, missingCourseId.map(m => m._re));
        }

        const rows = toInsert.map(item => {
            // Get schedule from _ho or schedule_data or first available class
            let schedule = item._ho || [];
            if (schedule.length === 0 && item.schedule_data) {
                schedule = item.schedule_data.ho || (Array.isArray(item.schedule_data) ? item.schedule_data[0]?.ho : []);
            }
            if (schedule.length === 0 && item._classSchedules?.length > 0) {
                schedule = item._classSchedules[0].ho;
            }

            return {
                user_id: userId,
                subject_id: item._id,
                class_name: item.class_name || (item._classSchedules?.[0]?.class_name) || null,
                semester: semester,
                schedule_data: schedule,
                course_id: item.course_id || defaultCourseId || 3
            };
        });

        try {
            await currentEnrollmentsModel.insertCurrentEnrollments(rows);
        } catch (dbError: any) {
            const errorSnapshot = {
                message: dbError.message || "Erro desconhecido",
                details: dbError.details,
                hint: dbError.hint,
                code: dbError.code,
                rowsSample: rows.slice(0, 1)
            };
            console.error("Erro DETALHADO ao inserir no banco (current_enrollments):", errorSnapshot);
            throw new Error(JSON.stringify(errorSnapshot)); // Transforma em string para o component conseguir logar/mostrar
        }
    }

    console.log(`Smart Update: Deleted ${toDelete.length}, Inserted ${toInsert.length}`);
};

export const getCourseStats = async (): Promise<any[]> => {
    const courses = await coursesModel.fetchCourseStats(); // Assuming this fetches the deep nested structure

    // Model returns raw data. We process it here.
    return (courses as any[]).map(course => {
        const activeSubjects = course.subjects ? course.subjects.filter((s: DbSubject) => s.active) : [];
        const hasClasses = activeSubjects.some((s: any) => s.classes && s.classes.length > 0);
        const actualPeriods = new Set(activeSubjects.map((s: DbSubject) => s.semester)).size;
        const targetPeriods = course.periods || 0;
        const isComplete = actualPeriods > 0 && actualPeriods === targetPeriods;

        // Calculate how many periods have at least one registered class
        const registeredPeriods = new Set(
            activeSubjects
                .filter((s: any) => s.classes && s.classes.length > 0)
                .map((s: DbSubject) => s.semester)
        ).size;

        return {
            code: course.code,
            name: course.name,
            shift: course.shift,
            modalities: course.modalities,
            campus: course.campus || (course.code.includes('P') ? 'Petrópolis' : 'Maracanã'),
            universityName: course.university?.name || 'Universidade',
            disciplineCount: activeSubjects.length,
            periods: targetPeriods || actualPeriods,
            registeredPeriodsCount: registeredPeriods,
            status: course.activies ? 'active' : 'upcoming'
        };
    });
};

export const saveCompletedSubjects = async (userId: number, subjectIds: (number | string)[]): Promise<void> => {
    if (!subjectIds || subjectIds.length === 0) return;

    const rows = subjectIds.map((id) => ({
        user_id: userId,
        subject_id: id
    }));

    await completedSubjectsModel.upsertCompletedSubjects(rows);
    console.log(`Saved ${rows.length} completed subjects.`);
};

export const getCourseSchedule = async (courseCode: string): Promise<[any[], any[]]> => {
    const courseData = await coursesModel.fetchCourseByCode(courseCode);
    if (!courseData) return [[], []];
    const [days, timeSlots] = await Promise.all([getDays(), getTimeSlots()]);
    // @ts-ignore
    const courseSlots = timeSlots.filter(t => t.course_id === courseData.id);
    return [days, courseSlots];
};

export const getCourseDimension = async (courseCode: string): Promise<number[]> => {
    const [days, slots] = await getCourseSchedule(courseCode);
    return [days.length, slots.length];
};

// --- Equivalency Operations ---

export interface DbEquivalency {
    id: number;
    course_id: number | null;
    target_subject_id: number;
    source_subject_id: number;
    // Joined data
    target_subject?: { id: number; acronym: string; name: string; semester: number | null; course_id: number | null };
    source_subject?: { id: number; acronym: string; name: string; semester: number | null; course_id: number | null };
}

export const getEquivalencies = async (courseId?: number): Promise<DbEquivalency[]> => {
    let query = supabase
        .from('subject_equivalencies')
        .select(`
            *,
            target_subject:subjects!target_subject_id(id, acronym, name, semester, course_id),
            source_subject:subjects!source_subject_id(id, acronym, name, semester, course_id)
        `);

    if (courseId) {
        query = query.or(`course_id.eq.${courseId},course_id.is.null`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching equivalencies:', error);
        throw error;
    }

    return (data || []) as DbEquivalency[];
};

export const saveEquivalency = async (equivalency: Partial<DbEquivalency>): Promise<DbEquivalency> => {
    if (equivalency.id) {
        const { data, error } = await supabase
            .from('subject_equivalencies')
            .update(equivalency)
            .eq('id', equivalency.id)
            .select()
            .single();

        if (error) throw error;
        return data as DbEquivalency;
    } else {
        // Ensure id is not present at all in the insert payload
        const { id, ...insertData } = equivalency;
        const { data, error } = await supabase
            .from('subject_equivalencies')
            .insert([insertData])
            .select()
            .single();

        if (error) throw error;
        return data as DbEquivalency;
    }
};

export const loadEffectiveCompletedSubjects = async (userId: number): Promise<Set<number>> => {
    try {
        const [completedRows, allEquivalencies] = await Promise.all([
            completedSubjectsModel.fetchCompletedSubjects(userId),
            getEquivalencies()
        ]);

        const completedSet = new Set<number>((completedRows as any[]).map(r => r.subjects?.id).filter(id => id !== undefined));
        const effectiveSet = new Set<number>(completedSet);

        // Recursive/Iterative expansion until no more subjects are added
        let added = true;
        while (added) {
            added = false;
            for (const eq of allEquivalencies) {
                // Forward check: Source satisfies Target
                // Note: If we had N-to-1 grouping, we'd need more complex logic, 
                // but usually each row is an independent equivalency option.
                if (!effectiveSet.has(eq.target_subject_id)) {
                    if (effectiveSet.has(eq.source_subject_id)) {
                        effectiveSet.add(eq.target_subject_id);
                        added = true;
                    }
                }

                // Backward check: Target satisfies Source (usually for global equivalencies)
                if (eq.course_id === null && effectiveSet.has(eq.target_subject_id)) {
                    if (!effectiveSet.has(eq.source_subject_id)) {
                        effectiveSet.add(eq.source_subject_id);
                        added = true;
                    }
                }
            }
        }

        return effectiveSet;
    } catch (error) {
        console.error("Error calculating effective completed subjects:", error);
        throw error;
    }
};

export const deleteEquivalency = async (id: number): Promise<void> => {
    const { error } = await supabase
        .from('subject_equivalencies')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

/**
 * Fetches equivalent subjects and their classes for a list of subject IDs.
 * Used in Grade Generation to show alternative cross-course options.
 */
export const fetchEquivalentOptionsForSubjects = async (subjectIds: number[], targetCourseId?: number): Promise<Map<number, Subject[]>> => {
    if (subjectIds.length === 0) return new Map();

    console.log(`[Equivalence] Fetching for ${subjectIds.length} subjects. CourseID: ${targetCourseId}`);

    // 1. Fetch all equivalencies involving these subjects
    const { data: equivalencies, error: eqError } = await supabase
        .from('subject_equivalencies')
        .select(`
            target_subject_id,
            source_subject_id,
            course_id
        `)
        .or(`target_subject_id.in.(${subjectIds.join(',')}),source_subject_id.in.(${subjectIds.join(',')})`);

    if (eqError) throw eqError;

    console.log(`[Equivalence] Raw found: ${equivalencies.length} rows.`);

    // 2. Identify all related subject IDs
    const relatedIds = new Set<number>();
    const eqMap = new Map<number, Set<number>>();

    equivalencies.forEach(eq => {
        // FILTER: Validity for current course
        if (eq.course_id !== null && targetCourseId && eq.course_id !== targetCourseId) {
            // This rule is specific to another course. Skip it.
            return;
        }

        const isTargetInList = subjectIds.includes(eq.target_subject_id);
        const isSourceInList = subjectIds.includes(eq.source_subject_id);

        // Debug
        // if (eq.target_subject_id === 315 || eq.source_subject_id === 315) {
        //     console.log(`[Equivalence-Debug] 315 found. S:${eq.source_subject_id} T:${eq.target_subject_id} C:${eq.course_id}. InList? S:${isSourceInList} T:${isTargetInList}`);
        // }

        if (isTargetInList) {
            // S is target, so source is an equivalent
            if (!eqMap.has(eq.target_subject_id)) eqMap.set(eq.target_subject_id, new Set());
            eqMap.get(eq.target_subject_id)!.add(eq.source_subject_id);
            relatedIds.add(eq.source_subject_id);
        }

        if (isSourceInList) {
            // S is source, so target is an equivalent
            if (!eqMap.has(eq.source_subject_id)) eqMap.set(eq.source_subject_id, new Set());
            eqMap.get(eq.source_subject_id)!.add(eq.target_subject_id);
            relatedIds.add(eq.target_subject_id);
        }
    });

    console.log(`[Equivalence] Related IDs found: ${relatedIds.size}`);

    if (relatedIds.size === 0) return new Map();

    // 3. Fetch detailed data for all related subjects (including classes)
    const allRelatedIds = Array.from(relatedIds);
    const [subjectsData, classesData] = await Promise.all([
        subjectsModel.fetchSubjectsByIds(allRelatedIds),
        classesModel.fetchClassesBySubjectIds(allRelatedIds)
    ]);

    // Group subjects by ID
    const subjectDetailsMap = new Map<number, DbSubject>();
    subjectsData.forEach(s => subjectDetailsMap.set(s.id, s));

    // Process Classes
    const schedulesMap = new Map<number, ClassSchedule[]>();
    classesData.forEach(schedule => {
        const { subject_id, class: className, day_id, time_slot_id } = schedule;
        if (!schedulesMap.has(subject_id)) schedulesMap.set(subject_id, []);
        let subjectSchedules = schedulesMap.get(subject_id)!;
        let classSchedule = subjectSchedules.find(cs => cs.class_name === className);
        if (!classSchedule) {
            classSchedule = { class_name: className, ho: [], da: [], rt: [] };
            subjectSchedules.push(classSchedule);
        }
        classSchedule.ho.push([day_id, time_slot_id]);
    });

    // Final Mapping
    const resultMap = new Map<number, Subject[]>();
    eqMap.forEach((equivIds, originalId) => {
        const equivalents: Subject[] = [];
        equivIds.forEach(eid => {
            const dbSub = subjectDetailsMap.get(eid);
            if (dbSub) {
                const sub = processSubjectData(dbSub, new Map(), schedulesMap);
                // Only include if has classes
                if (sub._classSchedules && sub._classSchedules.length > 0) {
                    equivalents.push(sub);
                }
            }
        });
        if (equivalents.length > 0) {
            resultMap.set(originalId, equivalents);
        }
    });

    return resultMap;
};
