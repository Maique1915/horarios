import { supabase } from '../lib/supabaseClient';

export interface DbRequirement {
    subject_id: number;
    type: string;
    prerequisite_subject_id?: number;
    min_credits?: number;
    prerequisite_subject?: any;
    [key: string]: any;
}

export const fetchRequirements = async (subjectIds: number[]) => {
    const { data, error } = await supabase
        .from('subject_requirements')
        .select('subject_id, type, prerequisite_subject_id, min_credits, prerequisite_subject:subjects!fk_req_prereq_subject (acronym)')
        .in('subject_id', subjectIds);

    if (error) throw error;
    return data as DbRequirement[];
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

// Single operations
export const insertRequirement = async (requirementData: Partial<DbRequirement>) => {
    const { data, error } = await supabase.from('subject_requirements').insert(requirementData).select().single();
    if (error) throw error;
    return data as DbRequirement;
};

export const updateRequirement = async (id: number, requirementData: Partial<DbRequirement>) => {
    const { data, error } = await supabase.from('subject_requirements').update(requirementData).eq('id', id).select().single();
    if (error) throw error;
    return data as DbRequirement;
};

export const deleteRequirement = async (id: number) => {
    const { error } = await supabase.from('subject_requirements').delete().eq('id', id);
    if (error) throw error;
};
