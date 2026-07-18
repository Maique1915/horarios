import { supabase } from '../lib/supabaseClient';

export interface AdminFetchResult<T = any> {
    data: T[];
    error: any;
    count: number;
}

export const adminModel = {
    async fetchTableData(
        tableName: string,
        page: number,
        pageSize: number,
        primaryKey: string
    ): Promise<AdminFetchResult> {
        const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact' })
            .range((page - 1) * pageSize, page * pageSize - 1)
            .order(primaryKey, { ascending: true });
        
        return { data: data || [], error, count: count || 0 };
    },

    async insertRecord(tableName: string, newItem: any): Promise<{ data: any, error: any }> {
        const { data, error } = await supabase
            .from(tableName)
            .insert([newItem])
            .select();
        return { data, error };
    },

    async updateRecord(tableName: string, primaryKey: string, id: any, updatedData: any): Promise<{ data: any, error: any }> {
        const { data, error } = await supabase
            .from(tableName)
            .update(updatedData)
            .eq(primaryKey, id)
            .select();
        return { data, error };
    },

    async deleteRecord(tableName: string, primaryKey: string, id: any): Promise<{ error: any }> {
        const { error } = await supabase
            .from(tableName)
            .delete()
            .eq(primaryKey, id);
        return { error };
    },

    async rpcCall(rpcName: string, params: any = {}): Promise<{ data: any, error: any }> {
        const { data, error } = await supabase.rpc(rpcName, params);
        return { data, error };
    }
};
