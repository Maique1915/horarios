import { supabase } from '../lib/supabaseClient';

export interface DbComplementaryActivity {
    id: number;
    course_id: number;
    group: string;
    code: string;
    description: string;
    workload_formula: string;
    limit_hours: number;
    requirements: string;
    active: boolean;
    created_at: string;
}

export interface DbComplementaryActivityGroup {
    id: string;
    course_id: number;
    description: string;
    min_hours: number;
    max_hours: number;
    created_at: string;
}

export const fetchAllComplementaryActivities = async (courseId?: number) => {
    let query = supabase.from('complementary_activities').select('*').eq('active', true);
    if (courseId) query = query.eq('course_id', courseId);

    const { data, error } = await query.order('group').order('code');
    if (error) throw error;
    return data as DbComplementaryActivity[];
};

export const insertComplementaryActivity = async (activityData: Partial<DbComplementaryActivity>) => {
    const { data, error } = await supabase.from('complementary_activities').insert(activityData).select().single();
    if (error) throw error;
    return data as DbComplementaryActivity;
};

export const updateComplementaryActivity = async (id: number, activityData: Partial<DbComplementaryActivity>) => {
    const { data, error } = await supabase.from('complementary_activities').update(activityData).eq('id', id).select().single();
    if (error) throw error;
    return data as DbComplementaryActivity;
};

export const deleteComplementaryActivity = async (id: number) => {
    const { error } = await supabase.from('complementary_activities').delete().eq('id', id);
    if (error) throw error;
};

// Activity Groups
export const fetchActivityGroups = async (courseId?: number) => {
    let query = supabase.from('complementary_activity_groups').select('*');
    if (courseId) query = query.eq('course_id', courseId);

    const { data, error } = await query.order('id');
    if (error) throw error;
    return data as DbComplementaryActivityGroup[];
};
