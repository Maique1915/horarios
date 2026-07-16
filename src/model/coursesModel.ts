import { supabase } from '../lib/supabaseClient';
import { DbSubject } from './subjectsModel';
import { Course } from '../domain/entities/Course';

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
    };
    /** Data de início do período letivo ativo (ex: '2026-03-01') */
    period_start?: string | null;
    /** Data de fim do período letivo ativo (ex: '2026-07-31') */
    period_end?: string | null;
}

export const fetchAllCourses = async () => {
    const { data, error } = await supabase.from('courses').select('*, workloads:course_workloads(*)');
    if (error) throw error;
    return data as DbCourse[];
};

export const fetchCourseByCode = async (courseCode: string) => {
    // Try with period date columns first (requires migration to have been run)
    const { data, error } = await supabase
        .from('courses')
        .select('id, code, name, university_id, needs_complementary_activities, credit_categories, period_start, period_end, workloads:course_workloads(*)')
        .eq('code', courseCode)
        .limit(1);

    if (!error) {
        return data && data.length > 0 ? (data[0] as DbCourse) : null;
    }

    // Fallback: period columns might not exist yet (migration pending)
    // Try without them so the rest of the app keeps working
    console.warn('fetchCourseByCode: period columns unavailable, falling back (run add_period_dates_to_courses.sql)', error);
    const { data: fallbackData, error: fallbackError } = await supabase
        .from('courses')
        .select('id, code, name, university_id, needs_complementary_activities, credit_categories, workloads:course_workloads(*)')
        .eq('code', courseCode)
        .limit(1);

    if (fallbackError) throw fallbackError;
    return fallbackData && fallbackData.length > 0 ? (fallbackData[0] as DbCourse) : null;
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
    // DDD: Criação da entidade valida as regras de negócio antes de ir pro banco
    const courseEntity = new Course({
        id: 0,
        code: courseData.code || '',
        name: courseData.name || '',
        shift: courseData.shift || null,
        modalities: courseData.modalities || null,
        periods: courseData.periods || null,
        campus: courseData.campus || null,
        activies: courseData.activies,
        universityId: courseData.university_id,
        needsComplementaryActivities: courseData.needs_complementary_activities,
        periodStart: courseData.period_start,
        periodEnd: courseData.period_end
    });

    const { data, error } = await supabase.from('courses').insert(courseData).select().single();
    if (error) throw error;
    return data as DbCourse;
};

export const updateCourse = async (id: number, courseData: Partial<DbCourse>) => {
    // DDD: Para validar a atualização, tentamos criar uma Entidade se tivermos os dados chave, 
    // ou validamos individualmente os campos que estão sendo atualizados se possível.
    if (courseData.name !== undefined && courseData.name.trim().length < 3) {
        throw new Error('COURSE_VALIDATION_ERROR: O nome do curso deve ter pelo menos 3 caracteres.');
    }
    
    const { data, error } = await supabase.from('courses').update(courseData).eq('id', id).select().single();
    if (error) throw error;
    return data as DbCourse;
};

export const deleteCourse = async (id: number) => {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) throw error;
};
