import { supabase } from '../lib/supabaseClient';

export interface DbCompletedSubject {
    id: number;
    user_id: number;
    subject_id: number;
    completed_at: string;
    subjects?: any;
    [key: string]: any;
}

export const fetchCompletedSubjects = async (userId: number) => {
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

export const upsertCompletedSubjects = async (rows: any[]) => {
    const { error } = await supabase.from('completed_subjects').upsert(rows, {
        onConflict: 'user_id, subject_id'
    });
    if (error) throw error;
};

export const deleteCompletedSubject = async (userId: number, subjectId: number | string) => {
    const { error } = await supabase.from('completed_subjects').delete().eq('user_id', userId).eq('subject_id', subjectId);
    if (error) throw error;
};

export const deleteCompletedSubjects = async (userId: number, subjectIds: (number | string)[]) => {
    const { error } = await supabase.from('completed_subjects').delete().eq('user_id', userId).in('subject_id', subjectIds);
    if (error) throw error;
};
