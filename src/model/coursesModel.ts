import { supabase } from '../lib/supabaseClient';
import { DbSubject } from './subjectsModel';

export interface DbCourse {
    id: number;
    code: string;
    name: string;
    shift: string | null;
    modalities: string | null;
    periods: number | null;
    campus: string | null;
    activies?: boolean;
    university_id?: number | null;
    needs_complementary_activities?: boolean;
    credit_categories?: any[];
    workloads?: any[];
    subjects: DbSubject[];
    university?: {
        name: string;
    }
}

export const fetchAllCourses = async () => {
    const { data, error } = await supabase.from('courses').select('*, workloads:course_workloads(*)');
    if (error) throw error;
    return data as DbCourse[];
};

export const fetchCourseByCode = async (courseCode: string) => {
    const { data, error } = await supabase
        .from('courses')
        .select('id, code, name, university_id, needs_complementary_activities, credit_categories, workloads:course_workloads(*)')
        .eq('code', courseCode)
        .limit(1);
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
            shift,
            modalities,
            periods,
            campus,
            activies,
            university_id,
            university:universities (
                name
            ),
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
