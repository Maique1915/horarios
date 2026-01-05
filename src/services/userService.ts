import { fetchProfile, updateProfile, DbProfile } from '../model/userProfileModel';

export const userService = {
    /**
     * Get user profile by User ID
     * @param {string} userId
     * @returns {Promise<DbProfile | null>}
     */
    async getProfile(userId: string): Promise<DbProfile | null> {
        return await fetchProfile(userId);
    },

    /**
     * Update user profile
     * @param {string} userId
     * @param {object} updates
     * @returns {Promise<DbProfile>}
     */
    async updateProfile(userId: string, updates: Partial<DbProfile>): Promise<DbProfile> {
        return await updateProfile(userId, updates);
    },

    /**
     * Check if user has a specific role
     * @param {string} userId
     * @param {string} role
     * @returns {Promise<boolean>}
     */
    async hasRole(userId: string, role: string): Promise<boolean> {
        const data = await this.getProfile(userId);
        if (!data) return false;
        return data.role === role;
    }
};
