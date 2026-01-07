import { supabase } from '../lib/supabaseClient';

export interface DbCurrentEnrollment {
    id: number;
    user_id: number;
    subject_id: number;
    class_name: string;
    semester: string;
    schedule_data: any; // jsonb
    created_at: string;
    subjects?: any;
    [key: string]: any;
}

export const fetchCurrentEnrollments = async (userId: number) => {
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

export const deleteCurrentEnrollments = async (userId: number, semester: string | number) => {
    const { error } = await supabase
        .from('current_enrollments')
        .delete()
        .eq('user_id', userId)
        .eq('semester', semester);
    if (error) throw error;
};

export const deleteCurrentEnrollmentsList = async (userId: number, semester: string | number, subjectIds: (number | string)[]) => {
    const { error } = await supabase
        .from('current_enrollments')
        .delete()
        .eq('user_id', userId)
        .eq('semester', semester)
        .in('subject_id', subjectIds);
    if (error) throw error;
};

export const insertCurrentEnrollments = async (rows: any[]) => {
    const { error } = await supabase
        .from('current_enrollments')
        .insert(rows);
    if (error) throw error;
};
