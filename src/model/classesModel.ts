import { supabase } from '../lib/supabaseClient';

export interface DbClass {
    subject_id: number;
    class: string;
    day_id: number;
    time_slot_id: number;
    start_real_time?: string;
    end_real_time?: string;
    [key: string]: any;
}

export const fetchClassesBySubjectIds = async (subjectIds: number[]) => {
    const { data, error } = await supabase
        .from('classes')
        .select('subject_id, class, day_id, time_slot_id')
        .in('subject_id', subjectIds);

    if (error) throw error;
    return data as DbClass[];
};

// CRUD operations
export const insertClasses = async (classesData: any[]) => {
    const { error } = await supabase.from('classes').insert(classesData);
    if (error) throw error;
};

export const deleteClassesBySubjectId = async (subjectId: number | string) => {
    const { error } = await supabase.from('classes').delete().eq('subject_id', subjectId);
    if (error) throw error;
};

// Single operations
export const insertClass = async (classData: Partial<DbClass>) => {
    const { data, error } = await supabase.from('classes').insert(classData).select().single();
    if (error) throw error;
    return data as DbClass;
};

export const updateClass = async (id: number, classData: Partial<DbClass>) => {
    const { data, error } = await supabase.from('classes').update(classData).eq('id', id).select().single();
    if (error) throw error;
    return data as DbClass;
};

export const deleteClass = async (id: number) => {
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) throw error;
};

export const deleteClassScheduleBySubjectAndName = async (subjectId: number | string, className: string) => {
    const { error } = await supabase.from('classes').delete().match({ subject_id: subjectId, class: className });
    if (error) throw error;
};

export const fetchFullClassesBySubjectId = async (subjectId: number | string) => {
    const { data, error } = await supabase
        .from('classes')
        .select('subject_id, class, day_id, time_slot_id')
        .eq('subject_id', subjectId);

    if (error) throw error;
    return data as DbClass[];
};
