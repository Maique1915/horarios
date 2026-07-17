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
    const { data, error } = await supabase
        .from('courses')
        .select('id, code, name, university_id, needs_complementary_activities, workloads:course_workloads(*)')
        .eq('code', courseCode)
        .limit(1);

    if (error) throw error;
    if (!data || data.length === 0) return null;
    
    const course = data[0] as DbCourse;
    
    // Buscar o período atual para a universidade
    if (course.university_id) {
        const { data: periodsData } = await supabase
            .from('periods')
            .select('*')
            .eq('university_id', course.university_id)
            .order('start_date', { ascending: false }); // Pega o mais recente caso não haja um ativo
            
        if (periodsData && periodsData.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            const activePeriod = periodsData.find(p => p.start_date <= today && p.end_date >= today) || periodsData[0];
            course.period_start = activePeriod.start_date;
            course.period_end = activePeriod.end_date;
            (course as any).current_period_code = activePeriod.code;
        }
    }
    
    return course;
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
                    class_code
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
