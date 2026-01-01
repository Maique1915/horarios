import { supabase } from '../lib/supabaseClient';

export const getComments = async () => {
    const { data, error } = await supabase
        .from('comments')
        .select(`
            id,
            content,
            rating,
            created_at,
            user_id
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch user details for each comment (manual join if foreign key is not set up perfectly or for flexibility)
    // Or improved query if relationship is set: .select('*, user:users(name, username)')
    // Since we are not sure about the 'users' table relation, we might need to fetch users separately or hope for the best.
    // For now, let's try to assume a 'users' table exists and we can select from it.
    // If not, we might only show user_id.

    // Better approach: Try to join with users if possible
    const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, username')
        .in('id', data.map(c => c.user_id));

    if (!usersError && usersData) {
        const userMap = new Map(usersData.map(u => [u.id, u]));
        return data.map(comment => ({
            ...comment,
            user: userMap.get(comment.user_id) || { name: 'Usuário', username: 'user' }
        }));
    }

    return data;
};

export const addComment = async (userId, content, rating = 5) => {
    const { data, error } = await supabase
        .from('comments')
        .insert([
            { user_id: userId, content, rating }
        ])
        .select()
        .single();

    if (error) throw error;
    return data;
};
