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

interface SubgroupProgress {
    id: number;
    code: string;
    description: string;
    limit: number;
    formula?: string;
    total: number;
    capped_total: number;
}

interface GroupProgress {
    group: string;
    label: string;
    description: string;
    limit: number;
    min_limit?: number;
    total: number;
    capped_total: number;
    subgroups: SubgroupProgress[];
}

export const getUserGroupProgress = async (userId: number, courseId?: number): Promise<GroupProgress[]> => {
    // 1. Fetch user activities, group definitions and ALL catalog activities
    const [userActivities, dbGroups, catalogActivities] = await Promise.all([
        fetchUserActivitiesGroups(userId),
        fetchActivityGroups(courseId),
        getComplementaryActivities(courseId)
    ]);

    // 1.1 Filter user activities by course
    const filteredActivities = courseId
        ? userActivities.filter(a => a.activity?.course_id === courseId)
        : userActivities;

    // 2. Aggregate hours by activity type
    const activityTypeTotals: Record<number, { total: number }> = {};
    filteredActivities.forEach(item => {
        const aid = item.activity_id;
        if (!activityTypeTotals[aid]) activityTypeTotals[aid] = { total: 0 };
        activityTypeTotals[aid].total += (item.hours || 0);
    });

    // 3. Format result using DB limits and Catalog details
    const result = dbGroups.map(group => {
        const groupActivities = catalogActivities.filter(a => a.group === group.id);

        let rawGroupTotal = 0;
        let cappedGroupTotal = 0;

        const subgroups: SubgroupProgress[] = groupActivities.map(activity => {
            const rawTotal = activityTypeTotals[activity.id]?.total || 0;
            const cappedTotal = Math.min(rawTotal, activity.limit_hours || Infinity);

            rawGroupTotal += rawTotal;
            cappedGroupTotal += cappedTotal;

            return {
                id: activity.id,
                code: activity.code,
                description: activity.description,
                limit: activity.limit_hours,
                formula: activity.workload_formula,
                total: rawTotal,
                capped_total: cappedTotal
            };
        });

        return {
            group: group.id,
            label: `Grupo ${group.id}`,
            description: group.description,
            limit: group.max_hours,
            min_limit: group.min_hours,
            total: rawGroupTotal,
            capped_total: Math.min(cappedGroupTotal, group.max_hours),
            subgroups
        };
    });

    return result;
};
