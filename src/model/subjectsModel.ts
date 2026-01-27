import { supabase } from '../lib/supabaseClient';
import { DbClass } from './classesModel';
import { DbCourse } from './coursesModel';

export interface DbSubject {
    id: number;
    semester: number;
    name: string;
    acronym: string;
    has_practical: number;
    has_theory: number;
    category?: string;
    optional: boolean;
    active: boolean;
    course_id: number;
    workload?: number;
    course?: DbCourse;
    classes?: DbClass[];
}

export const fetchSubjects = async (courseId?: number) => {
    let q = supabase.from('subjects').select('id, semester, name, acronym, has_practical, has_theory, category, optional, active, course_id, courses (code)');
    if (courseId) q = q.eq('course_id', courseId);

    const { data, error } = await q;
    if (error) throw error;
    return data as DbSubject[];
};

export const fetchSubjectsByAcronyms = async (acronyms: string[]) => {
    const { data, error } = await supabase
        .from('subjects')
        .select('id, acronym')
        .in('acronym', acronyms);
    if (error) throw error;
    return data;
};

export const fetchSubjectsByAcronymsList = async (acronyms: string[]) => {
    const { data, error } = await supabase.from('subjects').select('id, acronym').in('acronym', acronyms);
    if (error) throw error;
    return data;
};

export const insertSubject = async (subjectData: any) => {
    const { data, error } = await supabase.from('subjects').insert(subjectData).select().single();
    if (error) throw error;
    return data;
};

export const updateSubjectDb = async (id: number | string, subjectData: any) => {
    console.log(`Model: updateSubjectDb called for ID: ${id}`, subjectData);
    const { data, error } = await supabase.from('subjects').update(subjectData).eq('id', id).select();
    if (error) {
        console.error(`Model: Error updating subject ${id}:`, error);
        throw error;
    }
    console.log(`Model: Subject ${id} update result:`, data);
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

export const fetchSubjectByAcronymAndCourse = async (acronym: string, courseId: number) => {
    const { data, error } = await supabase.from('subjects').select('id').eq('acronym', acronym).eq('course_id', courseId).single();
    if (error) return null;
    return data;
};

export const getCourseTotalSubjectsCount = async (courseId: number) => {
    const { count, error } = await supabase.from('subjects').select('*', { count: 'exact', head: true }).eq('course_id', courseId).eq('active', true);
    if (error) return 0;
    return count || 0;
};
