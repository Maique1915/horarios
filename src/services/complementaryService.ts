import {
    fetchAllComplementaryActivities,
    insertComplementaryActivity,
    updateComplementaryActivity as updateActivityDb,
    deleteComplementaryActivity as deleteActivityDb,
    DbComplementaryActivity
} from '../model/complementaryActivitiesModel';

import {
    fetchUserComplementaryActivitiesWithDetails,
    fetchUserActivitiesGroups,
    insertUserComplementaryActivity,
    updateUserComplementaryActivity as updateUserActivityDb,
    deleteUserComplementaryActivity as deleteUserActivityDb,
    DbUserComplementaryActivity
} from '../model/userProfileModel';

export const getComplementaryActivities = async (): Promise<DbComplementaryActivity[]> => {
    try {
        const data = await fetchAllComplementaryActivities();
        return data;
    } catch (err) {
        console.error("Unexpected error in getComplementaryActivities:", err);
        throw err;
    }
};

export const getActivityGroups = async (): Promise<string[]> => {
    try {
        const data = await fetchAllComplementaryActivities();
        // Return unique groups
        const uniqueGroups = [...new Set(data.map(item => item.group))];
        return uniqueGroups;
    } catch (error) {
        console.error("Error fetching groups:", error);
        return [];
    }
};

export const addComplementaryActivity = async (activityData: Partial<DbComplementaryActivity>) => {
    return await insertComplementaryActivity(activityData);
};

export const updateComplementaryActivity = async (id: number, activityData: Partial<DbComplementaryActivity>) => {
    return await updateActivityDb(id, activityData);
};

export const deleteComplementaryActivity = async (id: number) => {
    await deleteActivityDb(id);
    return true;
};

// --- User Activities Management ---

export const getUserActivities = async (userId: string) => {
    try {
        return await fetchUserComplementaryActivitiesWithDetails(userId);
    } catch (err) {
        console.error("Unexpected error in getUserActivities (FULL):", err);
        throw err;
    }
};

export const addUserActivity = async (activityData: Partial<DbUserComplementaryActivity>) => {
    return await insertUserComplementaryActivity(activityData);
};

export const updateUserActivity = async (id: number, activityData: Partial<DbUserComplementaryActivity>) => {
    return await updateUserActivityDb(id, activityData);
};

export const deleteUserActivity = async (id: number) => {
    await deleteUserActivityDb(id);
    return true;
};

export const getUserTotalHours = async (userId: string): Promise<number> => {
    try {
        const activities = await fetchUserActivitiesGroups(userId);
        const totalHours = activities.reduce((sum, activity) => sum + (activity.hours || 0), 0);
        return totalHours;
    } catch (err) {
        console.error('Unexpected error in getUserTotalHours:', err);
        throw err;
    }
};

interface GroupProgress {
    group: string;
    label: string;
    description: string;
    limit: number;
    total: number;
}

export const getUserGroupProgress = async (userId: string): Promise<GroupProgress[]> => {
    // 1. Fetch user activities with their related catalog info
    const userActivities = await fetchUserActivitiesGroups(userId);

    // 2. Aggregate hours by group
    const groupTotals = userActivities.reduce((acc: Record<string, number>, curr) => {
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
