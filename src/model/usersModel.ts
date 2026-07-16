import { supabase } from '../lib/supabaseClient';
import { DbCourse } from './coursesModel';
import { User } from '../domain/entities/User';

export interface DbUser {
    id: number;
    username: string;
    password_hash: string;
    name: string;
    role: string;
    active: boolean;
    created_at: string;
    course_id: number;
    courses: DbCourse;
    is_paid: boolean;
    subscription_expires_at: string;
    // extended properties from joins or other logic
    registration?: string;
    course_name?: string;
}

export const fetchStudentData = async (userId: number) => {
    const { data, error } = await supabase
        .from('users')
        .select('name, registration, course_name, course_id')
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
    // DDD: Criação da entidade valida as regras de negócio antes de ir pro banco
    const userEntity = new User({
        id: 0,
        username: userData.username || '',
        passwordHash: userData.password_hash || '',
        name: userData.name || '',
        role: userData.role || 'user',
        active: userData.active ?? true,
        courseId: userData.course_id,
        isPaid: userData.is_paid ?? false,
        subscriptionExpiresAt: userData.subscription_expires_at
    });

    const { data, error } = await supabase.from('users').insert(userData).select().single();
    if (error) throw error;
    return data as DbUser;
};

export const updateUser = async (id: number, userData: Partial<DbUser>) => {
    // DDD: Validações parciais se campos críticos forem passados
    if (userData.username !== undefined && userData.username.trim().length < 3) {
        throw new Error('USER_VALIDATION_ERROR: O nome de usuário deve ter pelo menos 3 caracteres.');
    }
    if (userData.name !== undefined && userData.name.trim().length < 2) {
        throw new Error('USER_VALIDATION_ERROR: O nome deve ter pelo menos 2 caracteres.');
    }
    if (userData.role !== undefined && !['user', 'admin'].includes(userData.role)) {
        throw new Error('USER_VALIDATION_ERROR: Papel de usuário inválido.');
    }

    const { data, error } = await supabase.from('users').update(userData).eq('id', id).select().single();
    if (error) throw error;
    return data as DbUser;
};

export const deleteUser = async (id: number) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
};
