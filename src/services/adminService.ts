import { adminModel, AdminFetchResult } from '../model/adminModel';

export const adminService = {
    async fetchTableData(
        tableName: string,
        page: number,
        pageSize: number,
        primaryKey: string
    ): Promise<AdminFetchResult> {
        return await adminModel.fetchTableData(tableName, page, pageSize, primaryKey);
    },

    async insertRecord(tableName: string, newItem: any): Promise<{ data: any, error: any }> {
        return await adminModel.insertRecord(tableName, newItem);
    },

    async updateRecord(tableName: string, primaryKey: string, id: any, updatedData: any): Promise<{ data: any, error: any }> {
        return await adminModel.updateRecord(tableName, primaryKey, id, updatedData);
    },

    async deleteRecord(tableName: string, primaryKey: string, id: any): Promise<{ error: any }> {
        return await adminModel.deleteRecord(tableName, primaryKey, id);
    },

    async rpcCall(rpcName: string, params: any = {}): Promise<{ data: any, error: any }> {
        return await adminModel.rpcCall(rpcName, params);
    }
};
