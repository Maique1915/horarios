'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { getUserActivities, addUserActivity, updateUserActivity, deleteUserActivity, getComplementaryActivities, getActivityGroups } from '../services/complementaryService';
import LoadingSpinner from './LoadingSpinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender,
} from '@tanstack/react-table';

const UserActivitiesManager = () => {
    const [userId, setUserId] = useState(null);
    const queryClient = useQueryClient();

    // Form State
    const [editingId, setEditingId] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedActivityId, setSelectedActivityId] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');
    const [semester, setSemester] = useState('');
    const [documentLink, setDocumentLink] = useState('');
    const [description, setDescription] = useState('');

    // Table State
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnFilters, setColumnFilters] = useState([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    });

    const { user } = useAuth();

    // Set userId
    useEffect(() => {
        if (user) setUserId(user.id);
    }, [user]);

    // 1. Fetch User Activities
    const {
        data: userActivities = [],
        isLoading: loadingActivities,
        isError: isActivitiesError,
        error: activitiesError
    } = useQuery({
        queryKey: ['userActivities', userId],
        queryFn: () => getUserActivities(userId),
        enabled: !!userId,
    });

    // 2. Fetch Catalog (Grouped)
    const {
        data: catalog = {},
        isLoading: loadingCatalog
    } = useQuery({
        queryKey: ['complementaryCatalog'],
        queryFn: async () => {
            const data = await getComplementaryActivities();
            const grouped = data.reduce((acc, item) => {
                const key = item.group;
                if (!acc[key]) acc[key] = [];
                acc[key].push(item);
                return acc;
            }, {});
            return grouped;
        },
        staleTime: Infinity, // Static data, never changes
    });

    const loading = loadingActivities || loadingCatalog;

    if (isActivitiesError) {
        console.error("Error loading activities:", activitiesError);
    }

    // Mutations
    const addActivityMutation = useMutation({
        mutationFn: addUserActivity,
        onSuccess: () => {
            queryClient.invalidateQueries(['userActivities', userId]);
            queryClient.invalidateQueries(['userGroupProgress', userId]);
            queryClient.invalidateQueries(['userTotalHours', userId]);
            resetForm();
        },
        onError: (error) => {
            console.error("Error adding activity:", error);
            alert("Erro ao registrar atividade.");
        }
    });

    const updateActivityMutation = useMutation({
        mutationFn: ({ id, data }) => updateUserActivity(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['userActivities', userId]);
            queryClient.invalidateQueries(['userGroupProgress', userId]);
            queryClient.invalidateQueries(['userTotalHours', userId]);
            resetForm();
        },
        onError: (error) => {
            console.error("Error updating activity:", error);
            alert("Erro ao atualizar atividade.");
        }
    });

    const deleteActivityMutation = useMutation({
        mutationFn: deleteUserActivity,
        onSuccess: () => {
            queryClient.invalidateQueries(['userActivities', userId]);
            queryClient.invalidateQueries(['userGroupProgress', userId]);
            queryClient.invalidateQueries(['userTotalHours', userId]);
        },
        onError: (error) => {
            console.error(error);
            alert("Erro ao excluir.");
        }
    });

    const resetForm = () => {
        setHours('');
        setMinutes('');
        setSemester('');
        setDocumentLink('');
        setDescription('');
        setSelectedActivityId('');
        // Keep selectedGroup if desired, but reseting is safer to avoid confusion
        // setSelectedGroup(''); 
        setEditingId(null);
        setIsFormOpen(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!userId) return;

        const payload = {
            user_id: userId,
            activity_id: selectedActivityId,
            hours: parseFloat(hours || 0) + (parseFloat(minutes || 0) / 60),
            semester,
            document_link: documentLink,
            description,
            status: 'PENDING' // Reset status on edit? Or keep? Usually edits reset to pending approval
        };

        if (editingId) {
            updateActivityMutation.mutate({ id: editingId, data: payload }, {
                onSuccess: () => {
                    setIsFormOpen(false);
                }
            });
        } else {
            addActivityMutation.mutate(payload, {
                onSuccess: () => {
                    setIsFormOpen(false);
                }
            });
        }
    };

    const handleDelete = (id) => {
        if (!confirm('Excluir esta atividade?')) return;
        deleteActivityMutation.mutate(id);
    };

    const handleEdit = (activity) => {
        setEditingId(activity.id);
        setSelectedGroup(activity.activity?.group || '');
        setSelectedActivityId(activity.activity_id?.toString() || '');
        setHours(Math.floor(activity.hours || 0).toString());
        setMinutes(Math.round(((activity.hours || 0) - Math.floor(activity.hours || 0)) * 60).toString());
        setSemester(activity.semester || '');
        setDocumentLink(activity.document_link || '');
        setDescription(activity.description || '');
        setIsFormOpen(true);
    };

    const handleNewActivity = () => {
        resetForm();
        setIsFormOpen(true);
    };

    const handleCancelEdit = () => {
        resetForm();
    };

    // Derived state for selected catalog item
    const selectedCatalogItem = React.useMemo(() => {
        if (!selectedGroup || !selectedActivityId) return null;
        return catalog[selectedGroup]?.find(c => c.id.toString() === selectedActivityId);
    }, [catalog, selectedGroup, selectedActivityId]);

    const formatHours = (totalHours) => {
        const h = Math.floor(totalHours);
        const m = Math.round((totalHours - h) * 60);
        if (h === 0) return `${m}m`;
        if (m === 0) return `${h}h`;
        return `${h}h e ${m}min`;
    };

    // Columns Definition
    const columns = React.useMemo(() => [
        {
            accessorFn: (row) => row.activity?.group,
            id: 'group',
            header: 'Grupo',
            cell: info => (
                <span className="py-1 px-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold border border-slate-200 dark:border-slate-700">
                    {info.getValue() || '-'}
                </span>
            ),
        },
        {
            accessorFn: (row) => row.activity?.code,
            id: 'code',
            header: 'Sub',
            cell: info => (
                <span className="font-mono text-xs text-primary bg-primary/5 px-1.5 py-0.5 rounded">
                    {info.getValue() || '-'}
                </span>
            ),
        },
        {
            accessorFn: (row) => row.description || row.activity?.description,
            id: 'description',
            header: 'Descrição',
            cell: ({ row }) => {
                const desc = row.original.description || row.original.activity?.description;
                const link = row.original.document_link;
                return (
                    <div className="flex flex-col gap-1">
                        <span className="line-clamp-2" title={desc}>
                            {desc}
                        </span>
                        {link && (
                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 w-fit px-2 py-0.5 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors">
                                <span className="material-symbols-outlined text-[10px]">link</span>
                                Ver Comprovante
                            </a>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: 'semester',
            header: 'Semestre',
            cell: info => (
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark">
                    {info.getValue()}
                </span>
            )
        },
        {
            accessorKey: 'hours',
            header: 'Horas',
            cell: info => (
                <span className="text-xs font-bold text-text-light-primary dark:text-text-dark-primary">
                    {formatHours(info.getValue())}
                </span>
            )
        },
        {
            id: 'actions',
            header: 'Ações',
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => handleEdit(row.original)}
                        className="w-8 h-8 flex items-center justify-center text-text-light-secondary hover:text-primary hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all border border-transparent hover:border-border-light hover:shadow-sm"
                        title="Editar"
                    >
                        <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button
                        onClick={() => handleDelete(row.original.id)}
                        className="w-8 h-8 flex items-center justify-center text-text-light-secondary hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30 hover:shadow-sm"
                        title="Excluir"
                    >
                        <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                </div>
            )
        }
    ], [handleEdit, handleDelete]);

    const table = useReactTable({
        data: userActivities,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            globalFilter,
            columnFilters,
            pagination,
        },
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: setPagination,
        globalFilterFn: (row, columnId, filterValue) => {
            const search = filterValue.toLowerCase();
            const desc = (row.original.description || row.original.activity?.description || "").toLowerCase();
            const code = (row.original.activity?.code || "").toLowerCase();
            const group = (row.original.activity?.group || "").toLowerCase();
            return desc.includes(search) || code.includes(search) || group.includes(search);
        }
    });

    if (loading) return <LoadingSpinner message="Carregando suas atividades..." />;

    if (!userId) return <div className="p-4 text-center">Faça login para gerenciar suas atividades.</div>;

    const totalHours = userActivities.reduce((sum, a) => sum + (a.hours || 0), 0);

    return (
        <div className="space-y-8">
            {/* Header / Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left Column: Table List */}
                <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm flex flex-col">

                        {/* Filters */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/20">
                            <div>
                                <select
                                    className="w-full p-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    onChange={e => {
                                        const val = e.target.value;
                                        setColumnFilters(old => val ? [{ id: 'group', value: val }] : []);
                                    }}
                                    value={columnFilters.find(f => f.id === 'group')?.value || ''}
                                >
                                    <option value="">Todos os Grupos</option>
                                    {Object.keys(catalog).sort().map(g => (
                                        <option key={g} value={g}>Grupo {g}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">search</span>
                                <input
                                    type="text"
                                    placeholder="Pesquisar..."
                                    className="w-full p-2.5 pl-10 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    value={globalFilter}
                                    onChange={e => setGlobalFilter(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto min-h-[300px]">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-text-light-secondary dark:text-text-dark-secondary text-xs font-semibold uppercase tracking-wider sticky top-0 z-10">
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th key={header.id} className="px-6 py-4 border-b border-border-light dark:border-border-dark whitespace-nowrap">
                                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm">
                                    {table.getRowModel().rows.length === 0 ? (
                                        <tr>
                                            <td colSpan={columns.length} className="p-10 text-center text-text-light-secondary">
                                                <div className="bg-background-light dark:bg-background-dark w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <span className="material-symbols-outlined text-3xl text-slate-300">search_off</span>
                                                </div>
                                                <p>Nenhuma atividade encontrada.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        table.getRowModel().rows.map(row => (
                                            <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                                {row.getVisibleCells().map(cell => (
                                                    <td key={cell.id} className="px-6 py-4">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/20">
                            <span className="text-xs text-text-light-secondary dark:text-text-dark-secondary font-medium">
                                Página <span className="text-text-light-primary dark:text-text-dark-primary font-bold">{table.getState().pagination.pageIndex + 1}</span> de <span className="text-text-light-primary dark:text-text-dark-primary font-bold">{table.getPageCount() || 1}</span>
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="p-1.5 px-3 rounded-lg border border-border-light dark:border-border-dark hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-bold text-text-light-secondary"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="p-1.5 px-3 rounded-lg border border-border-light dark:border-border-dark hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-bold text-text-light-secondary"
                                >
                                    Próxima
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sticky Form (Desktop) / Modal (Mobile) */}
                <div className={`lg:col-span-1 order-1 lg:order-2 ${isFormOpen ? 'fixed inset-0 z-50 overflow-y-auto bg-background-light dark:bg-background-dark p-4 animate-in fade-in slide-in-from-bottom-10 lg:static lg:p-0 lg:overflow-visible lg:bg-transparent lg:animate-none' : 'hidden lg:block'}`}>
                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm sticky top-6 h-full lg:h-auto overflow-y-auto lg:overflow-visible">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-light dark:border-border-dark">
                            <h3 className="font-bold text-lg text-text-light-primary dark:text-text-dark-primary flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">
                                    {editingId ? 'edit_note' : 'post_add'}
                                </span>
                                {editingId ? 'Editar Atividade' : 'Nova Atividade'}
                            </h3>
                            {(editingId || isFormOpen) && (
                                <button
                                    onClick={handleCancelEdit}
                                    className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded bg-red-50 dark:bg-red-900/10 hover:bg-red-100 transition-colors"
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Group Selection */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wide text-text-light-secondary dark:text-text-dark-secondary">Grupo</label>
                                <div className="relative">
                                    <select
                                        className="w-full p-3 pl-4 pr-10 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none transition-all cursor-pointer hover:border-primary/50"
                                        value={selectedGroup}
                                        onChange={(e) => {
                                            setSelectedGroup(e.target.value);
                                            setSelectedActivityId('');
                                        }}
                                    >
                                        <option value="">Selecione um grupo...</option>
                                        {Object.keys(catalog).sort().map(g => (
                                            <option key={g} value={g}>Grupo {g}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-light-secondary">
                                        <span className="material-symbols-outlined text-lg">expand_more</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wide text-text-light-secondary dark:text-text-dark-secondary">Atividade</label>
                                <div className="relative">
                                    <select
                                        required
                                        disabled={!selectedGroup}
                                        className="w-full p-3 pl-4 pr-10 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:border-primary/50"
                                        value={selectedActivityId}
                                        onChange={(e) => setSelectedActivityId(e.target.value)}
                                    >
                                        <option value="">Selecione a atividade...</option>
                                        {selectedGroup && catalog[selectedGroup] && catalog[selectedGroup].map(c => (
                                            <option key={c.id} value={c.id}>{c.code} - {c.description.substring(0, 30)}...</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-light-secondary">
                                        <span className="material-symbols-outlined text-lg">expand_more</span>
                                    </div>
                                </div>
                            </div>

                            {selectedCatalogItem && (
                                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800 text-xs animate-fadeIn">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-mono font-bold text-primary bg-white dark:bg-black/20 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                                            {selectedCatalogItem.code}
                                        </span>
                                        <span className="text-text-light-secondary">Limite: <span className="font-bold">{selectedCatalogItem.limit_hours}h</span></span>
                                    </div>
                                    <p className="text-text-light-primary dark:text-text-dark-primary leading-relaxed opacity-90">
                                        {selectedCatalogItem.description}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-12 sm:col-span-6 space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wide text-text-light-secondary dark:text-text-dark-secondary">Semestre</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="ex: 2024.1"
                                        className="w-full p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        value={semester}
                                        onChange={(e) => setSemester(e.target.value)}
                                    />
                                </div>

                                <div className="col-span-6 sm:col-span-3 space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wide text-text-light-secondary dark:text-text-dark-secondary">Horas</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            className="w-full p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pl-3"
                                            value={hours}
                                            onChange={(e) => setHours(e.target.value)}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light-secondary text-xs font-bold">h</span>
                                    </div>
                                </div>

                                <div className="col-span-6 sm:col-span-3 space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wide text-text-light-secondary dark:text-text-dark-secondary">Minutos</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            max="59"
                                            placeholder="0"
                                            className="w-full p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pl-3"
                                            value={minutes}
                                            onChange={(e) => setMinutes(e.target.value)}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light-secondary text-xs font-bold">m</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wide text-text-light-secondary dark:text-text-dark-secondary">Descrição</label>
                                <textarea
                                    className="w-full p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Detalhes adicionais da atividade..."
                                    rows="3"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wide text-text-light-secondary dark:text-text-dark-secondary">Link do Comprovante</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light-secondary pointer-events-none">
                                        <span className="material-symbols-outlined text-lg">link</span>
                                    </div>
                                    <input
                                        type="url"
                                        className="w-full p-3 pl-10 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        value={documentLink}
                                        onChange={(e) => setDocumentLink(e.target.value)}
                                        placeholder="https://drive.google.com/..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 bg-primary text-white rounded-lg hover:bg-primary-dark font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-2"
                            >
                                <span className="material-symbols-outlined text-xl">{editingId ? 'save' : 'add_circle'}</span>
                                {editingId ? 'Salvar Alterações' : 'Adicionar Atividade'}
                            </button>
                        </form>
                    </div>
                </div>

            </div>
            {/* Mobile Floating Action Button for New Activity */}
            {!isFormOpen && (
                <button
                    onClick={handleNewActivity}
                    className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-40"
                    title="Adicionar Nova Atividade"
                >
                    <span className="material-symbols-outlined text-3xl">add</span>
                </button>
            )}
        </div>
    );
};

export default UserActivitiesManager;
