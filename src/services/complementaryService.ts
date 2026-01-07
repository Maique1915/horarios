import {
    fetchAllComplementaryActivities,
    insertComplementaryActivity,
    updateComplementaryActivity as updateActivityDb,
    deleteComplementaryActivity as deleteActivityDb,
    DbComplementaryActivity,
    fetchActivityGroups
} from '../model/complementaryActivitiesModel';

import {
    fetchUserComplementaryActivitiesWithDetails,
    fetchUserActivitiesGroups,
    insertUserComplementaryActivity,
    updateUserComplementaryActivity as updateUserActivityDb,
    deleteUserComplementaryActivity as deleteUserActivityDb,
    DbUserComplementaryActivity
} from '../model/userProfileModel';

export const getComplementaryActivities = async (courseId?: number): Promise<DbComplementaryActivity[]> => {
    try {
        const data = await fetchAllComplementaryActivities(courseId);
        return data;
    } catch (err) {
        console.error("Unexpected error in getComplementaryActivities:", err);
        throw err;
    }
};

export const getActivityGroups = async (courseId?: number): Promise<string[]> => {
    try {
        const data = await fetchAllComplementaryActivities(courseId);
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

export const getUserActivities = async (userId: number) => {
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

export const getUserTotalHours = async (userId: number, courseId?: number): Promise<number> => {
    try {
        // 1. Fetch user activities and group definitions
        const [userActivities, dbGroups] = await Promise.all([
            fetchUserActivitiesGroups(userId),
            fetchActivityGroups(courseId)
        ]);

        // 1.1 Filter user activities by course if provided
        const filteredActivities = courseId
            ? userActivities.filter(a => a.activity?.course_id === courseId)
            : userActivities;

        // 2. Cap hours per activity type first
        const activityTypeTotals: Record<number, { group: string, total: number, limit: number }> = {};
        filteredActivities.forEach(item => {
            const aid = item.activity_id;
            if (!activityTypeTotals[aid]) {
                activityTypeTotals[aid] = {
                    group: item.activity?.group || 'OUTROS',
                    total: 0,
                    limit: item.activity?.limit_hours || Infinity
                };
            }
            activityTypeTotals[aid].total += (item.hours || 0);
        });

        // 3. Sum capped activity totals per group
        const groupCappedTotals: Record<string, number> = {};
        Object.values(activityTypeTotals).forEach(item => {
            const cappedHours = Math.min(item.total, item.limit);
            if (!groupCappedTotals[item.group]) groupCappedTotals[item.group] = 0;
            groupCappedTotals[item.group] += cappedHours;
        });

        // 4. Cap group totals by group max_hours
        let finalTotal = 0;
        dbGroups.forEach(group => {
            const groupSum = groupCappedTotals[group.id] || 0;
            finalTotal += Math.min(groupSum, group.max_hours);
        });

        return finalTotal;
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
    capped_total: number;
}

export const getUserGroupProgress = async (userId: number, courseId?: number): Promise<GroupProgress[]> => {
    // 1. Fetch user activities and group definitions
    const [userActivities, dbGroups] = await Promise.all([
        fetchUserActivitiesGroups(userId),
        fetchActivityGroups(courseId)
    ]);

    // 1.1 Filter user activities by course
    const filteredActivities = courseId
        ? userActivities.filter(a => a.activity?.course_id === courseId)
        : userActivities;

    // 2. Aggregate hours by activity type (to cap them individually first)
    const activityTypeTotals: Record<number, { group: string, total: number, limit: number }> = {};
    filteredActivities.forEach(item => {
        const aid = item.activity_id;
        if (!activityTypeTotals[aid]) {
            activityTypeTotals[aid] = {
                group: item.activity?.group || 'OUTROS',
                total: 0,
                limit: item.activity?.limit_hours || Infinity
            };
        }
        activityTypeTotals[aid].total += (item.hours || 0);
    });

    // 3. Aggregate totals per group (raw and capped)
    const rawGroupTotals: Record<string, number> = {};
    const cappedGroupTotals: Record<string, number> = {};

    Object.values(activityTypeTotals).forEach(item => {
        if (!rawGroupTotals[item.group]) rawGroupTotals[item.group] = 0;
        if (!cappedGroupTotals[item.group]) cappedGroupTotals[item.group] = 0;

        rawGroupTotals[item.group] += item.total;
        cappedGroupTotals[item.group] += Math.min(item.total, item.limit);
    });

    // 4. Format result using DB limits
    const result = dbGroups.map(group => {
        const rawTotal = rawGroupTotals[group.id] || 0;
        const cappedTotal = cappedGroupTotals[group.id] || 0;

        return {
            group: group.id,
            label: `Grupo ${group.id}`,
            description: group.description,
            limit: group.max_hours,
            total: rawTotal,
            capped_total: Math.min(cappedTotal, group.max_hours)
        };
    });

    return result;
};
