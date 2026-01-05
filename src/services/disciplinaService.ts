
import { saveClassSchedule as saveClassService } from './classService';
import { getDays, getTimeSlots } from './scheduleService';
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
}

export interface Enrollment extends Subject {
    class_name: string; // Override optional in Subject if needed, or keep compatible
    semester: number;
    schedule_data: ClassSchedule[];
    created_at: string;
    course_name?: string;
    // Removed index signature since Subject has it, or keep it if needed for extra props not in Subject
    // _id is in Subject as optional
}

interface CompletedSubject extends Subject {
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

const processCategoryAndElective = (item: Subject) => {
    return {
        _el: !item.elective,
        _category: item.elective ? 'ELECTIVE' : 'MANDATORY'
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
    const _pr = subjectRequirements.filter((r) => r.type === 'SUBJECT' && r.prerequisite_subject?.acronym).map((r) => r.prerequisite_subject.acronym);
    const creditsReq = subjectRequirements.find((r) => r.type === 'CREDITS');

    // Supabase might return 'courses' (plural) depending on relationship name
    const _cu = (item as any).courses?.code || (item as any).course?.code;
    if (!_cu) console.warn(`Service: Missing course code for subject ${item.acronym}`, item);

    // Static fallback for credits removed
    const dbPractical = (item.has_practical !== undefined && item.has_practical !== null) ? Number(item.has_practical) : 0;
    const dbTheory = (item.has_theory !== undefined && item.has_theory !== null) ? Number(item.has_theory) : 0;

    const practCreds = dbPractical;
    const theoryCreds = dbTheory;



    return {
        _id: item.id,
        _re: item.acronym,
        _cu: _cu,
        _se: item.semester,
        _di: item.name,
        _ap: practCreds,
        _at: theoryCreds,
        _el: !item.elective, // Logic inlined from processCategoryAndElective if easier, or adapt helper
        _category: item.elective ? 'ELECTIVE' : 'MANDATORY',
        _workload: (practCreds + theoryCreds) * 18,
        _ag: item.active,
        _pr: _pr,
        _pr_creditos_input: creditsReq ? creditsReq.min_credits : 0,
        _classSchedules: schedulesBySubjectId ? (schedulesBySubjectId.get(item.id) || []) : [],
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
                    classSchedule = { class_name: className, ho: [], da: [] };
                    subjectSchedules.push(classSchedule);
                }
                classSchedule.ho.push([day_id, time_slot_id]);
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

    // Logic: _el=true (Mandatory) -> DB: elective=false
    const dbElective = !_el;

    const insertedData = await subjectsModel.insertSubject({
        name: _di,
        acronym: _re,
        semester: _se,
        has_theory: _at,
        has_practical: _ap,
        elective: dbElective,
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
    const dbElective = !_el;

    console.log('Service: Sanitized data for DB:', {
        name: _di,
        acronym: _re,
        semester: Number(_se),
        has_theory: Number(_at),
        has_practical: Number(_ap),
        elective: dbElective,
        active: _ag
    });

    try {
        await subjectsModel.updateSubjectDb(sId, {
            name: _di,
            acronym: _re,
            semester: Number(_se),
            has_theory: Number(_at),
            has_practical: Number(_ap),
            elective: dbElective,
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
                        _se: subject._se, // loadDbData has already processed
                        _di: displayName,
                        _re: subject._re,
                        _ap: subject._ap,
                        _at: subject._at,
                        _el: subject._el,
                        _ag: subject._ag,
                        _pr: subject._pr,
                        _pr_creditos_input: subject._pr_creditos_input,
                        _ho: cls.ho,
                        _da: cls.da || [],
                        class_name: cls.class_name
                    } as Subject);
                });
            }
        });
        // Ensure _se is present and is a number for filtering/sorting
        return gridData.filter(item =>
            item._se !== undefined &&
            Number(item._se) > 0 &&
            item._ag === true
        ).sort((a, b) => Number(a._se || 0) - Number(b._se || 0));
    } catch (error) {
        console.error("Service CRITICAL ERROR in loadClassesForGrid:", error);
        throw error;
    }
};

export const getStudentData = async (userId: string): Promise<any> => {
    return usersModel.fetchStudentData(userId);
};

export const loadCompletedSubjects = async (userId: string): Promise<CompletedSubject[]> => {
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

export const loadCurrentEnrollments = async (userId: string): Promise<Enrollment[]> => {
    const data = await currentEnrollmentsModel.fetchCurrentEnrollments(userId);
    return (data as DbCurrentEnrollment[]).map(item => {
        const processedSubject = processSubjectData(item.subjects, null, null);
        return {
            ...processedSubject,
            class_name: item.class_name,
            semester: parseInt(item.semester), // Ensure number
            schedule_data: typeof item.schedule_data === 'string' ? JSON.parse(item.schedule_data) : item.schedule_data,
            created_at: item.created_at,
            course_name: item.subjects.courses?.name
        };
    });
};

export const getCourseTotalSubjects = async (courseCode: string): Promise<number> => {
    if (!courseCode) return 0;
    const courseData = await coursesModel.fetchCourseByCode(courseCode);
    if (!courseData) return 0;
    return subjectsModel.getCourseTotalSubjectsCount(courseData.id);
};

export const toggleCompletedSubject = async (userId: string, subjectId: number | string, isCompleted: boolean): Promise<void> => {
    if (isCompleted) {
        await completedSubjectsModel.upsertCompletedSubjects([{ user_id: userId, subject_id: subjectId }]);
    } else {
        await completedSubjectsModel.deleteCompletedSubject(userId, subjectId);
    }
};

export const toggleMultipleSubjects = async (userId: string, subjectIds: (number | string)[], isCompleted: boolean): Promise<void> => {
    console.log("toggleMultipleSubjects called:", { userId, count: subjectIds?.length, isCompleted });
    if (!subjectIds || subjectIds.length === 0) return;

    if (isCompleted) {
        const rows = subjectIds.map(id => ({ user_id: userId, subject_id: id }));
        await completedSubjectsModel.upsertCompletedSubjects(rows);
    } else {
        await completedSubjectsModel.deleteCompletedSubjects(userId, subjectIds);
    }
};

export const saveCurrentEnrollments = async (userId: string, enrollments: Subject[], semester: number | string): Promise<void> => {
    const sem = Number(semester);
    await currentEnrollmentsModel.deleteCurrentEnrollments(userId, sem);

    if (!enrollments || enrollments.length === 0) return;

    const rows = enrollments.map(item => ({
        user_id: userId,
        subject_id: item._id,
        class_name: item.class_name || null,
        semester: sem,
        schedule_data: item._ho || []
    }));

    await currentEnrollmentsModel.insertCurrentEnrollments(rows);
};

export const getCourseStats = async (): Promise<any[]> => {
    const courses = await coursesModel.fetchCourseStats(); // Assuming this fetches the deep nested structure

    // Model returns raw data. We process it here.
    return (courses as any[]).map(course => {
        const activeSubjects = course.subjects ? course.subjects.filter((s: DbSubject) => s.active) : [];
        const hasClasses = activeSubjects.some((s: any) => s.classes && s.classes.length > 0);
        return {
            code: course.code,
            name: course.name,
            disciplineCount: activeSubjects.length,
            periods: new Set(activeSubjects.map((s: DbSubject) => s.semester)).size,
            status: hasClasses ? 'active' : 'upcoming'
        };
    });
};

export const saveCompletedSubjects = async (userId: string, acronyms: string[]): Promise<void> => {
    if (!acronyms || acronyms.length === 0) return;

    const subjects = await subjectsModel.fetchSubjectsByAcronymsList(acronyms);
    if (!subjects || subjects.length === 0) return;

    const rows = subjects.map((s: any) => ({
        user_id: userId,
        subject_id: s.id
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
