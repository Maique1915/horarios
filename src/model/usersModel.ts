import { supabase } from '../lib/supabaseClient';

export interface DbUser {
    id: number;
    username: string;
    password_hash: string;
    name: string;
    role: string;
    active: boolean;
    created_at: string;
    course_id: number;
    is_paid: boolean;
    subscription_expires_at: string;
    // extended properties from joins or other logic
    registration?: string;
    course_name?: string;
}

export const fetchStudentData = async (userId: string) => {
    const { data, error } = await supabase
        .from('users')
        .select('name, registration, course_name') // Note: registration and course_name might not be direct columns based on screenshot, checking if they are aliases or joined
        .eq('id', userId)
        .single();
    if (error) return null;
    return data as Partial<DbUser>;
};

export const fetchAllUsers = async () => {
    const { data, error } = await supabase.from('users').select('*').order('name');
    if (error) throw error;
    return data as DbUser[];
};

export const fetchUserById = async (id: number) => {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) return null;
    return data as DbUser;
};

export const fetchUsersByIds = async (ids: number[] | string[]) => {
    const { data, error } = await supabase.from('users').select('id, name').in('id', ids);
    if (error) throw error;
    return data as Partial<DbUser>[];
};

export const insertUser = async (userData: Partial<DbUser>) => {
    const { data, error } = await supabase.from('users').insert(userData).select().single();
    if (error) throw error;
    return data as DbUser;
};

export const updateUser = async (id: number, userData: Partial<DbUser>) => {
    const { data, error } = await supabase.from('users').update(userData).eq('id', id).select().single();
    if (error) throw error;
    return data as DbUser;
};

export const deleteUser = async (id: number) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
};
