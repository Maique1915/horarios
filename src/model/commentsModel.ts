import { supabase } from '../lib/supabaseClient';

export interface DbComment {
    id: number;
    user_id: string;
    content: string;
    rating: number;
    created_at: string;
}

export interface CommentWithUser extends DbComment {
    user?: {
        name: string;
        username: string;
    };
}

export const fetchAllComments = async () => {
    const { data, error } = await supabase.from('comments').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as DbComment[];
};

export const fetchCommentsByUserId = async (userId: string) => {
    const { data, error } = await supabase.from('comments').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data as DbComment[];
};

export const insertComment = async (comment: Partial<DbComment>) => {
    const { data, error } = await supabase.from('comments').insert(comment).select().single();
    if (error) throw error;
    return data;
};

export const updateComment = async (id: number, commentData: Partial<DbComment>) => {
    const { data, error } = await supabase.from('comments').update(commentData).eq('id', id).select().single();
    if (error) throw error;
    return data as DbComment;
};

export const deleteComment = async (id: number) => {
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) throw error;
};
