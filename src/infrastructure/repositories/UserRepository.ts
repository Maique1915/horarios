import { supabase } from '../../lib/supabaseClient';
import { User } from '../../domain/entities/User';

export class UserRepository {
    private static mapToEntity(item: any): User {
        return new User({
            id: item.id,
            username: item.username,
            passwordHash: item.password_hash,
            name: item.name,
            role: item.role,
            active: item.active,
            courseId: item.course_id,
            isPaid: item.is_paid,
            subscriptionExpiresAt: item.subscription_expires_at,
            createdAt: item.created_at
        });
    }

    public static async findAll(): Promise<User[]> {
        const { data, error } = await supabase.from('users').select('*').order('name');
        if (error) throw error;
        return data.map(this.mapToEntity);
    }

    public static async findById(id: number): Promise<User | null> {
        const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
        if (error) return null;
        return this.mapToEntity(data);
    }

    public static async insert(user: User): Promise<User> {
        const { data, error } = await supabase.from('users').insert({
            username: user.username,
            password_hash: user.passwordHash,
            name: user.name,
            role: user.role,
            active: user.active,
            course_id: user.courseId,
            is_paid: user.isPaid,
            subscription_expires_at: user.subscriptionExpiresAt
        }).select().single();

        if (error) throw error;
        return this.mapToEntity(data);
    }

    public static async update(id: number, updates: Partial<User>): Promise<User> {
        const dbPayload: any = {};
        if (updates.username !== undefined) dbPayload.username = updates.username;
        if (updates.passwordHash !== undefined) dbPayload.password_hash = updates.passwordHash;
        if (updates.name !== undefined) dbPayload.name = updates.name;
        if (updates.role !== undefined) dbPayload.role = updates.role;
        if (updates.active !== undefined) dbPayload.active = updates.active;
        if (updates.courseId !== undefined) dbPayload.course_id = updates.courseId;
        if (updates.isPaid !== undefined) dbPayload.is_paid = updates.isPaid;
        if (updates.subscriptionExpiresAt !== undefined) dbPayload.subscription_expires_at = updates.subscriptionExpiresAt;

        const { data, error } = await supabase.from('users').update(dbPayload).eq('id', id).select().single();
        if (error) throw error;
        
        return this.mapToEntity(data);
    }

    public static async delete(id: number): Promise<void> {
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (error) throw error;
    }
}
