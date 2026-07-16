import { supabase } from '../lib/supabaseClient';
import { DbClass } from './classesModel';
import { DbCourse } from './coursesModel';
import { Subject } from '../domain/entities/Subject';

export interface DbSubject {
    id: number;
    semester: number;
    name: string;
    acronym: string;
    category?: string;
    optional: boolean;
    active: boolean;
    course_id: number;
    workload?: number;
    course?: DbCourse;
    classes?: DbClass[];
}

export const fetchSubjects = async (courseId?: number) => {
    let q = supabase.from('subjects').select('id, semester, name, acronym, category, optional, active, course_id, courses (code, name)');
    if (courseId) q = q.eq('course_id', courseId);

    const { data, error } = await q;
    if (error) throw error;
    return data as DbSubject[];
};

export const fetchSubjectsByIds = async (ids: number[]) => {
    const { data, error } = await supabase
        .from('subjects')
        .select('id, semester, name, acronym, category, optional, active, course_id, courses (code, name)')
        .in('id', ids);
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
    // DDD: Criação da entidade valida as regras de negócio antes de ir pro banco
    const subjectEntity = new Subject({
        id: 0,
        courseId: subjectData.course_id || 0,
        semester: subjectData.semester || 0,
        name: subjectData.name || '',
        acronym: subjectData.acronym || '',
        optional: subjectData.optional || false,
        active: subjectData.active ?? true,
        categoryId: subjectData.category_id,
        category: subjectData.category,
        hasPractical: subjectData.has_practical,
        hasTheory: subjectData.has_theory,
        elective: subjectData.elective,
        workload: subjectData.workload
    });

    const { data, error } = await supabase.from('subjects').insert(subjectData).select().single();
    if (error) throw error;
    return data;
};

export const updateSubjectDb = async (id: number | string, subjectData: any) => {
    console.log(`Model: updateSubjectDb called for ID: ${id}`, subjectData);
    
    // DDD: Validações parciais se os campos críticos estiverem sendo atualizados
    if (subjectData.name !== undefined && subjectData.name.trim().length < 2) {
        throw new Error('SUBJECT_VALIDATION_ERROR: O nome da disciplina deve ter pelo menos 2 caracteres.');
    }
    if (subjectData.acronym !== undefined && subjectData.acronym.trim().length === 0) {
        throw new Error('SUBJECT_VALIDATION_ERROR: A sigla da disciplina é obrigatória.');
    }

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
