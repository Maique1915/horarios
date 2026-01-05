
import { supabase } from '../lib/supabaseClient.js';

// Types reflecting the DB structure mostly
export interface DbCourse {
    id: number;
    code: string;
    name: string;
    dimension?: number[];
}

export interface DbSubject {
    id: number;
    semester: number;
    name: string;
    acronym: string;
    has_practical: number;
    has_theory: number;
    category?: string;
    elective: boolean;
    active: boolean;
    course_id: number;
    courses?: any;
    [key: string]: any;
}

export interface DbRequirement {
    subject_id: number;
    type: string;
    prerequisite_subject_id?: number;
    min_credits?: number;
    prerequisite_subject?: any;
}

export interface DbClass {
    subject_id: number;
    class: string;
    day_id: number;
    time_slot_id: number;
}

// --- READ Operations ---

export const fetchAllCourses = async () => {
    const { data, error } = await supabase.from('courses').select('*');
    if (error) throw error;
    return data;
};

export const fetchCourseByCode = async (courseCode: string) => {
    // Use limit(1) instead of single() to avoid error on 0 rows if handled by caller
    const { data, error } = await supabase.from('courses').select('id, code, name').eq('code', courseCode).limit(1);
    if (error) throw error;
    return data && data.length > 0 ? (data[0] as DbCourse) : null;
};

export const fetchSubjects = async (courseId?: number) => {
    let q = supabase.from('subjects').select('id, semester, name, acronym, has_practical, has_theory, category, elective, active, course_id, courses (code)');
    if (courseId) q = q.eq('course_id', courseId);

    const { data, error } = await q;
    if (error) throw error;
    return data as DbSubject[];
};

export const fetchRequirements = async (subjectIds: number[]) => {
    const { data, error } = await supabase
        .from('subject_requirements')
        .select('subject_id, type, prerequisite_subject_id, min_credits, prerequisite_subject:subjects!fk_req_prereq_subject (acronym)')
        .in('subject_id', subjectIds);

    if (error) throw error;
    return data as DbRequirement[];
};

export const fetchClassesBySubjectIds = async (subjectIds: number[]) => {
    const { data, error } = await supabase
        .from('classes')
        .select('subject_id, class, day_id, time_slot_id')
        .in('subject_id', subjectIds);

    if (error) throw error;
    return data as DbClass[];
};

export const fetchStudentData = async (userId: string) => {
    const { data, error } = await supabase
        .from('users')
        .select('name, registration, course_name')
        .eq('id', userId)
        .single();
    if (error) return null; // Original behavior was return null on error/not found
    return data;
};

export const fetchCompletedSubjects = async (userId: string) => {
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
    return data;
};

export const fetchCurrentEnrollments = async (userId: string) => {
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
    return data;
};

export const fetchCourseStats = async () => {
    const { data, error } = await supabase
        .from('courses')
        .select(`
            id,
            code,
            name,
            subjects (
                id,
                semester,
                active,
                classes (
                    class
                )
            )
        `);
    if (error) throw error;
    return data;
};

export const fetchSubjectsByAcronyms = async (acronyms: string[]) => {
    const { data, error } = await supabase
        .from('subjects')
        .select('id, acronym')
        .in('acronym', acronyms);
    if (error) throw error;
    return data;
};

// --- WRITE Operations ---

export const insertSubject = async (subjectData: any) => {
    const { data, error } = await supabase.from('subjects').insert(subjectData).select().single();
    if (error) throw error;
    return data;
};

export const updateSubjectDb = async (id: number | string, subjectData: any) => {
    const { error } = await supabase.from('subjects').update(subjectData).eq('id', id);
    if (error) throw error;
};

export const deleteSubjectDb = async (id: number | string) => {
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) throw error;
};

export const deleteSubjectByAcronymDb = async (acronym: string, courseId: number) => {
    const { error } = await supabase.from('subjects').delete().eq('acronym', acronym).eq('course_id', courseId);
    if (error) throw error;
};

export const updateSubjectActiveStatus = async (id: number | string, isActive: boolean) => {
    const { error } = await supabase.from('subjects').update({ active: isActive }).eq('id', id);
    if (error) throw error;
};

export const updateSubjectActiveStatusByAcronym = async (acronym: string, courseId: number, isActive: boolean) => {
    await supabase.from('subjects').update({ active: isActive }).eq('acronym', acronym).eq('course_id', courseId);
};

export const insertRequirements = async (requirements: any[]) => {
    if (!requirements || requirements.length === 0) return;
    const { error } = await supabase.from('subject_requirements').insert(requirements);
    if (error) throw error;
};

export const deleteRequirements = async (subjectId: number | string) => {
    const { error } = await supabase.from('subject_requirements').delete().eq('subject_id', subjectId);
    if (error) throw error;
};

export const fetchSubjectsByAcronymsList = async (acronyms: string[]) => {
    const { data, error } = await supabase.from('subjects').select('id, acronym').in('acronym', acronyms);
    if (error) throw error;
    return data;
};

export const upsertCompletedSubjects = async (rows: any[]) => {
    const { error } = await supabase.from('completed_subjects').upsert(rows, {
        onConflict: 'user_id, subject_id'
    });
    if (error) throw error;
};

export const deleteCompletedSubject = async (userId: string, subjectId: number | string) => {
    const { error } = await supabase.from('completed_subjects').delete().eq('user_id', userId).eq('subject_id', subjectId);
    if (error) throw error;
};

export const deleteCompletedSubjects = async (userId: string, subjectIds: (number | string)[]) => {
    const { error } = await supabase.from('completed_subjects').delete().eq('user_id', userId).in('subject_id', subjectIds);
    if (error) throw error;
};

export const deleteCurrentEnrollments = async (userId: string, semester: number) => {
    const { error } = await supabase
        .from('current_enrollments')
        .delete()
        .eq('user_id', userId)
        .eq('semester', semester);
    if (error) throw error;
};

export const insertCurrentEnrollments = async (rows: any[]) => {
    const { error } = await supabase
        .from('current_enrollments')
        .insert(rows);
    if (error) throw error;
};

export const fetchSubjectByAcronymAndCourse = async (acronym: string, courseId: number) => {
    const { data, error } = await supabase.from('subjects').select('id').eq('acronym', acronym).eq('course_id', courseId).single();
    if (error) return null;
    return data;
};

export const getCourseTotalSubjectsCount = async (courseId: number) => {
    const { count, error } = await supabase.from('subjects').select('*', { count: 'exact', head: true }).eq('course_id', courseId).eq('active', true);
    if (error) return 0;
    return count || 0;
}
