import { supabase } from '../lib/supabaseClient';

export const getComplementaryActivities = async () => {
    try {
        const { data, error } = await supabase
            .from('complementary_activities')
            .select('*')
            .order('code', { ascending: true });

        if (error) {
            console.error("Supabase error in getComplementaryActivities:", error);
            throw error;
        }
        return data;
    } catch (err) {
        console.error("Unexpected error in getComplementaryActivities:", err);
        throw err;
    }
};

export const getActivityGroups = async () => {
    try {
        const { data, error } = await supabase
            .from('complementary_activities')
            .select('group')
            .order('group', { ascending: true });

        if (error) throw error;

        // Return unique groups
        const uniqueGroups = [...new Set(data.map(item => item.group))];
        return uniqueGroups;
    } catch (error) {
        console.error("Error fetching groups:", error);
        return [];
    }
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
    try {
        const { data, error } = await supabase
            .from('user_complementary_activities')
            .select(`
                *,
                activity:complementary_activities!fk_activity(code, description, group, limit_hours)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Supabase error in getUserActivities (FULL):", JSON.stringify(error, null, 2));
            console.error("Error details:", {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            throw error;
        }
        return data;
    } catch (err) {
        console.error("Unexpected error in getUserActivities (FULL):", err);
        throw err;
    }
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

export const updateUserActivity = async (id, activityData) => {
    const { data, error } = await supabase
        .from('user_complementary_activities')
        .update(activityData)
        .eq('id', id)
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

export const getUserTotalHours = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('user_complementary_activities')
            .select('hours')
            .eq('user_id', userId);

        if (error) {
            console.error('Supabase error in getUserTotalHours:', error);
            throw error;
        }

        const totalHours = data.reduce((sum, activity) => sum + (activity.hours || 0), 0);
        return totalHours;
    } catch (err) {
        console.error('Unexpected error in getUserTotalHours:', err);
        throw err;
    }
};

export const getUserGroupProgress = async (userId) => {
    // 1. Fetch user activities with their related catalog info
    const { data: userActivities, error } = await supabase
        .from('user_complementary_activities')
        .select(`
            hours,
            activity:complementary_activities!fk_activity (
                group
            )
        `)
        .eq('user_id', userId);

    if (error) throw error;

    // 2. Aggregate hours by group
    const groupTotals = userActivities.reduce((acc, curr) => {
        // Handle cases where group might be 'ENSINO' (legacy) or 'A' (new)
        let group = curr.activity?.group?.toUpperCase() || 'OUTROS';

        // Simple mapping if inconsistent data exists (optional safety)
        if (group === 'ENSINO') group = 'A';
        if (group === 'PESQUISA') group = 'A';
        if (group === 'EXTENSÃO') group = 'C';

        if (!acc[group]) {
            acc[group] = 0;
        }
        acc[group] += (curr.hours || 0);
        return acc;
    }, {});

    // 3. Define the 10 Groups (A-J) with assumed limits
    const definedGroups = [
        { group: 'A', label: 'Grupo A', limit: 80, desc: 'Ensino/Pesquisa/Extensão' },
        { group: 'B', label: 'Grupo B', limit: 40, desc: 'Eventos' },
        { group: 'C', label: 'Grupo C', limit: 40, desc: 'Extensão' },
        { group: 'D', label: 'Grupo D', limit: 40, desc: 'Produção Técnica/Científica' },
        { group: 'E', label: 'Grupo E', limit: 40, desc: 'Vivência Profissional' },
        { group: 'F', label: 'Grupo F', limit: 40, desc: 'Formação Social/Humana' },
        { group: 'G', label: 'Grupo G', limit: 40, desc: 'Semana Acadêmica' },
        { group: 'H', label: 'Grupo H', limit: 40, desc: 'Atividades Especiais' },
        { group: 'I', label: 'Grupo I', limit: 40, desc: 'Outros' }
    ];

    // 4. Format result
    const result = definedGroups.map(def => ({
        group: def.group,
        label: def.label,
        description: def.desc,
        limit: def.limit,
        total: groupTotals[def.group] || 0
    }));

    return result;
};
