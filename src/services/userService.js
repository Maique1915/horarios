import { supabase } from '../lib/supabaseClient';

export const userService = {
    /**
     * Get user profile by User ID
     * @param {string} userId 
     * @returns {Promise<{data: any, error: any}>}
     */
    async getProfile(userId) {
        return await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
    },

    /**
     * Update user profile
     * @param {string} userId 
     * @param {object} updates 
     * @returns {Promise<{data: any, error: any}>}
     */
    async updateProfile(userId, updates) {
        return await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);
    },

    /**
     * Check if user has a specific role
     * @param {string} userId 
     * @param {string} role 
     * @returns {Promise<boolean>}
     */
    async hasRole(userId, role) {
        const { data, error } = await this.getProfile(userId);
        if (error || !data) return false;
        return data.role === role;
    }
};
