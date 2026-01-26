'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import LoadingSpinner from '../shared/LoadingSpinner';
import Pagination from '../shared/Pagination';
import { TableConfig, ColumnConfig } from './tableConfig';
import { useAuth } from '../../contexts/AuthContext';

interface TableManagerProps {
    config: TableConfig;
}

const TableManager: React.FC<TableManagerProps> = ({ config }) => {
    const { user } = useAuth();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1); // 1-indexed for Pagination component
    const [pageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [editingId, setEditingId] = useState<any | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (user || !config.rpc?.read) {
            fetchData();
        }
    }, [config.tableName, page, user]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            let result;
            let fetchError;
            let count = 0;

            if (config.rpc?.read) {
                if (!user) return;
                const response = await supabase.rpc(config.rpc.read, {
                    requesting_user_id: user.id
                });
                result = response.data;
                fetchError = response.error;
                // RPC pagination might be harder, assuming all data for now or need RPC update. 
                // For now, if RPC, we might not have count easily unless RPC returns it.
                count = result?.length || 0;
                // TODO: RPC server-side pagination support if needed.
            } else {
                const { data, error, count: total } = await supabase
                    .from(config.tableName)
                    .select('*', { count: 'exact' })
                    .range((page - 1) * pageSize, page * pageSize - 1)
                    .order(config.primaryKey, { ascending: true });

                result = data;
                fetchError = error;
                count = total || 0;
            }

            if (fetchError) throw fetchError;
            setData(result || []);
            setTotalItems(count);
        } catch (err: any) {
            console.error('Error fetching data:', JSON.stringify(err, null, 2));
            setError(err.message || 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: any) => {
        if (!confirm('Tem certeza que deseja excluir este registro?')) return;

        try {
            const { error: deleteError } = await supabase
                .from(config.tableName)
                .delete()
                .eq(config.primaryKey, id);

            if (deleteError) throw deleteError;

            setData(data.filter(item => item[config.primaryKey] !== id));
            alert('Registro excluído com sucesso!');
        } catch (err: any) {
            console.error('Error deleting data:', err);
            alert('Erro ao excluir: ' + err.message);
        }
    };

    const startEdit = (item: any) => {
        setEditingId(item[config.primaryKey]);
        setEditForm({ ...item });
        setIsCreating(false);
    };

    const startCreate = () => {
        setEditingId(null);
        setEditForm({});
        setIsCreating(true);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
        setIsCreating(false);
    };

    const handleSave = async () => {
        try {
            let result;
            if (isCreating) {
                // Check if Primary Key is editable (manual entry) or not (auto-increment)
                const pkColumn = config.columns.find(col => col.key === config.primaryKey);
                const isPkEditable = pkColumn?.editable || false;

                let newItem;
                if (isPkEditable) {
                    newItem = editForm;
                } else {
                    // Remove ID if it's auto-increment
                    const { [config.primaryKey]: id, ...rest } = editForm;
                    newItem = rest;
                }

                const { data: inserted, error: insertError } = await supabase
                    .from(config.tableName)
                    .insert([newItem])
                    .select();

                if (insertError) throw insertError;
                result = inserted;
                fetchData(); // Refresh to see new item
            } else {
                const { data: updated, error: updateError } = await supabase
                    .from(config.tableName)
                    .update(editForm)
                    .eq(config.primaryKey, editingId)
                    .select();

                if (updateError) throw updateError;
                // Optimistic update or refresh
                // Optimistic update or refresh
                const updatedItem = (updated && updated.length > 0) ? updated[0] : editForm;
                setData(data.map(item => item[config.primaryKey] === editingId ? updatedItem : item));
            }

            setEditingId(null);
            setIsCreating(false);
            setEditForm({});
            // If creating, we fetched. If updating, we updated local state.
            if (!isCreating) alert('Registro salvo com sucesso!');
            else alert('Registro criado com sucesso!');

        } catch (err: any) {
            console.error('Error saving data:', err);
            alert('Erro ao salvar: ' + err.message);
        }
    };

    const handleInputChange = (key: string, value: any) => {
        setEditForm((prev: any) => ({ ...prev, [key]: value }));
    };

    if (loading && data.length === 0) return <LoadingSpinner message="Carregando dados..." />;

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">{config.displayName}</h2>
                <button
                    onClick={startCreate}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                    Novo Registro
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    {error}
                </div>
            )}

            {/* Edit/Create Form */}
            {(editingId !== null || isCreating) && (
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-border-light dark:border-border-dark mb-4">
                    <h3 className="font-semibold mb-4 text-text-light-primary dark:text-text-dark-primary">{isCreating ? 'Novo Registro' : 'Editar Registro'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {config.columns.map(col => (
                            <div key={col.key}>
                                <label className="block text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary mb-1">
                                    {col.label}
                                </label>
                                {col.editable ? (
                                    col.type === 'boolean' ? (
                                        <select
                                            value={String(editForm[col.key] ?? '')}
                                            onChange={(e) => handleInputChange(col.key, e.target.value === 'true')}
                                            className="w-full p-2 rounded border border-border-light dark:border-border-dark bg-white dark:bg-slate-700 text-text-light-primary dark:text-text-dark-primary"
                                        >
                                            <option value="">Selecione</option>
                                            <option value="true">Sim</option>
                                            <option value="false">Não</option>
                                        </select>
                                    ) : (
                                        <input
                                            type={col.type === 'number' ? 'number' : col.type === 'datetime' ? 'datetime-local' : 'text'}
                                            value={
                                                col.type === 'datetime' && editForm[col.key]
                                                    ? new Date(editForm[col.key]).toISOString().slice(0, 16)
                                                    : editForm[col.key] ?? ''
                                            }
                                            onChange={(e) => handleInputChange(col.key, col.type === 'number' ? Number(e.target.value) : e.target.value)}
                                            className="w-full p-2 rounded border border-border-light dark:border-border-dark bg-white dark:bg-slate-700 text-text-light-primary dark:text-text-dark-primary"
                                        />
                                    )
                                ) : (
                                    <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded text-text-light-disabled dark:text-text-dark-disabled text-sm">
                                        {String(editForm[col.key] ?? '(auto)')}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={cancelEdit} className="px-4 py-2 text-sm text-text-light-secondary dark:text-text-dark-secondary hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition">
                            Cancelar
                        </button>
                        <button onClick={handleSave} className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition">
                            Salvar
                        </button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-border-light dark:border-border-dark">
                <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                        <tr>
                            {config.columns.map(col => (
                                <th key={col.key} className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                    {col.label}
                                </th>
                            ))}
                            <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-border-light dark:divide-border-dark">
                        {data.map(item => (
                            <tr key={item[config.primaryKey]} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                                {config.columns.map(col => (
                                    <td key={`${item[config.primaryKey]}-${col.key}`} className="px-3 py-2 whitespace-nowrap text-sm text-text-light-primary dark:text-text-dark-primary">
                                        {col.type === 'boolean'
                                            ? (item[col.key] ? 'Sim' : 'Não')
                                            : col.type === 'datetime' && item[col.key]
                                                ? new Date(item[col.key]).toLocaleString('pt-BR')
                                                : String(item[col.key] ?? '-')
                                        }
                                    </td>
                                ))}
                                <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        {config.customActions?.map((action, idx) => {
                                            const href = action.hrefPattern.replace(/\{(\w+)\}/g, (_, k) => item[k]);
                                            return (
                                                <a
                                                    key={idx}
                                                    href={href} // Using simple href for now, could use Link
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3 flex items-center"
                                                    title={action.label}
                                                >
                                                    {action.icon && <span className="material-symbols-outlined text-lg mr-1">{action.icon}</span>}
                                                    {/* {action.label} Optional text */}
                                                </a>
                                            );
                                        })}
                                        <button
                                            onClick={() => startEdit(item)}
                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                                        >
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item[config.primaryKey])}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={page}
                totalItems={totalItems}
                itemsPerPage={pageSize}
                onPageChange={setPage}
            />
        </div>
    );
};

export default TableManager;
