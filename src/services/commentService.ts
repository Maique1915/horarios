import { fetchAllComments, insertComment, DbComment, CommentWithUser } from '../model/commentsModel';
import { fetchUsersByIds, DbUser } from '../model/usersModel';

export const getComments = async (): Promise<CommentWithUser[]> => {
    const comments = await fetchAllComments();

    if (!comments.length) return [];

    const userIds = [...new Set(comments.map(c => c.user_id))];
    const users = await fetchUsersByIds(userIds);

    const userMap = new Map<number | string, { name: string; username?: string }>();
    users.forEach((u: Partial<DbUser>) => {
        if (u.id) {
            userMap.set(u.id, { name: u.name || 'Usuário', username: u.username }); // username might be missing if not selected
        }
    });

    return comments.map(comment => ({
        ...comment,
        user: userMap.get(comment.user_id) || { name: 'Usuário', username: 'user' }
    } as CommentWithUser));
};

export const addComment = async (userId: string, content: string, rating: number = 5): Promise<DbComment> => {
    const newComment = await insertComment({
        user_id: userId,
        content,
        rating
    });
    return newComment as DbComment;
};
