import { supabase } from '../lib/supabaseClient';
import { DbSubject } from './subjectsModel';

export interface DbCourse {
    id: number;
    code: string;
    name: string;
    subjects: DbSubject[];
}

export const fetchAllCourses = async () => {
    const { data, error } = await supabase.from('courses').select('*');
    if (error) throw error;
    return data as DbCourse[];
};

export const fetchCourseByCode = async (courseCode: string) => {
    const { data, error } = await supabase.from('courses').select('id, code, name').eq('code', courseCode).limit(1);
    if (error) throw error;
    return data && data.length > 0 ? (data[0] as DbCourse) : null;
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

export const insertCourse = async (courseData: Partial<DbCourse>) => {
    const { data, error } = await supabase.from('courses').insert(courseData).select().single();
    if (error) throw error;
    return data as DbCourse;
};

export const updateCourse = async (id: number, courseData: Partial<DbCourse>) => {
    const { data, error } = await supabase.from('courses').update(courseData).eq('id', id).select().single();
    if (error) throw error;
    return data as DbCourse;
};

export const deleteCourse = async (id: number) => {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) throw error;
};
