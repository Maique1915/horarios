import { supabase } from '../lib/supabaseClient';

export const getComplementaryActivities = async () => {
    const { data, error } = await supabase
        .from('complementary_activities')
        .select('*')
        .order('code', { ascending: true });

    if (error) throw error;
    return data;
};

export const addComplementaryActivity = async (activityData) => {
    const { data, error } = await supabase
        .from('complementary_activities')
        .insert([activityData])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateComplementaryActivity = async (id, activityData) => {
    const { data, error } = await supabase
        .from('complementary_activities')
        .update(activityData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteComplementaryActivity = async (id) => {
    const { error } = await supabase
        .from('complementary_activities')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
};

// --- User Activities Management ---

export const getUserActivities = async (userId) => {
    const { data, error } = await supabase
        .from('user_complementary_activities')
        .select(`
            *,
            activity:complementary_activities(code, description, group, limit_hours)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const addUserActivity = async (activityData) => {
    const { data, error } = await supabase
        .from('user_complementary_activities')
        .insert([activityData])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteUserActivity = async (id) => {
    const { error } = await supabase
        .from('user_complementary_activities')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
};
