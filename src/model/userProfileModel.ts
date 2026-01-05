import { supabase } from '../lib/supabaseClient';

export interface DbProfile {
    id: string;
    full_name: string;
    payment_status: string;
    role: string;
    [key: string]: any;
}

// Profiles
export const fetchProfile = async (userId: number) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) return null;
    return data as DbProfile;
};

// User Courses
export interface DbUserCourse {
    user_id: number;
    course_id: number;
    courses?: any;
}

export const fetchUserCourses = async (userId: number) => {
    const { data, error } = await supabase.from('user_courses').select('*, courses(*)').eq('user_id', userId);
    if (error) throw error;
    return data as DbUserCourse[];
};

// User Complementary Activities
export interface DbUserComplementaryActivity {
    id: number;
    user_id: number;
    activity_id: number;
    description: string;
    hours: number;
    semester: string;
    document_link: string;
    status: string;
    created_at: string;
}

export const fetchUserComplementaryActivities = async (userId: number) => {
    const { data, error } = await supabase.from('user_complementary_activities').select('*').eq('user_id', userId);
    if (error) throw error;
    return data as DbUserComplementaryActivity[];
};

export interface DbUserComplementaryActivityWithDetails extends DbUserComplementaryActivity {
    activity: {
        code: string;
        description: string;
        group: string;
        limit_hours: number;
    };
}

export const fetchUserComplementaryActivitiesWithDetails = async (userId: number) => {
    const { data, error } = await supabase
        .from('user_complementary_activities')
        .select(`
            *,
            activity:complementary_activities!fk_activity(code, description, group, limit_hours)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as DbUserComplementaryActivityWithDetails[];
};

export const fetchUserActivitiesGroups = async (userId: number) => {
    const { data, error } = await supabase
        .from('user_complementary_activities')
        .select(`
            hours,
            activity:complementary_activities!fk_activity (
                group
            )
        `)
        .eq('user_id', userId);

    if (error) throw error;
    // Cast to unknown first to avoid "not overlap" error, as Supabase types can be tricky with joins
    return data as unknown as { hours: number; activity: { group: string } }[];
};

// CRUD Operations

// Profile
export const updateProfile = async (userId: number, profileData: Partial<DbProfile>) => {
    const { data, error } = await supabase.from('profiles').update(profileData).eq('id', userId).select().single();
    if (error) throw error;
    return data as DbProfile;
};

// User Courses
export const insertUserCourse = async (userCourseData: DbUserCourse) => {
    const { error } = await supabase.from('user_courses').insert(userCourseData);
    if (error) throw error;
};

export const deleteUserCourse = async (userId: number, courseId: number) => {
    const { error } = await supabase.from('user_courses').delete().eq('user_id', userId).eq('course_id', courseId);
    if (error) throw error;
};

// User Complementary Activities
export const insertUserComplementaryActivity = async (activityData: Partial<DbUserComplementaryActivity>) => {
    const { data, error } = await supabase.from('user_complementary_activities').insert(activityData).select().single();
    if (error) throw error;
    return data as DbUserComplementaryActivity;
};

export const updateUserComplementaryActivity = async (id: number, activityData: Partial<DbUserComplementaryActivity>) => {
    const { data, error } = await supabase.from('user_complementary_activities').update(activityData).eq('id', id).select().single();
    if (error) throw error;
    return data as DbUserComplementaryActivity;
};

export const deleteUserComplementaryActivity = async (id: number) => {
    const { error } = await supabase.from('user_complementary_activities').delete().eq('id', id);
    if (error) throw error;
};

