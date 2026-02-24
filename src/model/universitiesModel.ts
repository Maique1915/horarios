import { supabase } from '../lib/supabaseClient';

export interface DbUniversity {
    id: number;
    name: string;
    created_at?: string;
}

export const fetchAllUniversities = async () => {
    const { data, error } = await supabase
        .from('universities')
        .select('*')
        .order('name');
    if (error) throw error;
    return data as DbUniversity[];
};

export const insertUniversity = async (name: string) => {
    const { data, error } = await supabase
        .from('universities')
        .insert([{ name }])
        .select()
        .single();
    if (error) throw error;
    return data as DbUniversity;
};

export const deleteUniversity = async (id: number) => {
    const { error } = await supabase
        .from('universities')
        .delete()
        .eq('id', id);
    if (error) throw error;
};
