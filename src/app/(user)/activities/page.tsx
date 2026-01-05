'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender,
    ColumnDef,
} from '@tanstack/react-table';

import { useAuth } from '../../../contexts/AuthContext';
import {
    getUserActivities,
    addUserActivity,
    updateUserActivity,
    deleteUserActivity,
    getComplementaryActivities,
    getUserGroupProgress
} from '../../../services/complementaryService';
import LoadingSpinner from '../../../components/LoadingSpinner';

// --- Types ---
// --- Types ---
interface Activity {
    id: number;
    activity_id: number;
    hours: number;
    semester: string;
    document_link?: string;
    description?: string;
    activity?: {
        group: string;
        code: string;
        description: string;
        limit_hours?: number;
    };
    [key: string]: any;
}

interface GroupProgress {
    group: string;
    label: string;
    description: string;
    limit: number;
    total: number;
}

interface CatalogItem {
    id: number;
    group: string;
    code: string;
    description: string;
    limit_hours: number;
}

interface Catalog {
    [key: string]: CatalogItem[];
}

// --- Controller ---
const useActivitiesController = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const userId = user?.id;

    // --- State ---
    // Section: Form State
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedActivityId, setSelectedActivityId] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');
    const [semester, setSemester] = useState('');
    const [documentLink, setDocumentLink] = useState('');
    const [description, setDescription] = useState('');

    // Section: Table State
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnFilters, setColumnFilters] = useState<any[]>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    });

    // --- Data Fetching ---

    // 1. Group Progress (Summary)
    const { data: groupProgress = [], isLoading: loadingProgress } = useQuery<GroupProgress[]>({
        queryKey: ['userGroupProgress', userId],
        queryFn: () => getUserGroupProgress(userId!),
        enabled: !!userId,
        staleTime: Infinity, // Query invalidated by mutations
    });

    // 2. User Activities
    const {
        data: userActivities = [],
        isLoading: loadingActivities,
    } = useQuery<Activity[]>({
        queryKey: ['userActivities', userId],
        queryFn: () => getUserActivities(userId!),
        enabled: !!userId,
    });

    // 3. Catalog (Grouped)
    const {
        data: catalog = {} as Catalog,
        isLoading: loadingCatalog
    } = useQuery<Catalog>({
        queryKey: ['complementaryCatalog'],
        queryFn: async () => {
            const data = await getComplementaryActivities();
            const grouped = data.reduce((acc: any, item: any) => {
                const key = item.group;
                if (!acc[key]) acc[key] = [];
                acc[key].push(item);
                return acc;
            }, {});
            return grouped;
        },
        staleTime: Infinity,
    });

    const loading = loadingProgress || loadingActivities || loadingCatalog;

    // --- Mutations ---
    const addActivityMutation = useMutation({
        mutationFn: addUserActivity,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userActivities', userId] });
            queryClient.invalidateQueries({ queryKey: ['userGroupProgress', userId] });
            queryClient.invalidateQueries({ queryKey: ['userTotalHours', userId] });
            resetForm();
        },
        onError: (error) => {
            console.error("Error adding activity:", error);
            alert("Erro ao registrar atividade.");
        }
    });

    const updateActivityMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: any }) => updateUserActivity(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userActivities', userId] });
            queryClient.invalidateQueries({ queryKey: ['userGroupProgress', userId] });
            queryClient.invalidateQueries({ queryKey: ['userTotalHours', userId] });
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
            queryClient.invalidateQueries({ queryKey: ['userActivities', userId] });
            queryClient.invalidateQueries({ queryKey: ['userGroupProgress', userId] });
            queryClient.invalidateQueries({ queryKey: ['userTotalHours', userId] });
        },
        onError: (error) => {
            console.error(error);
            alert("Erro ao excluir.");
        }
    });

    // --- Handlers ---

    const resetForm = () => {
        setHours('');
        setMinutes('');
        setSemester('');
        setDocumentLink('');
        setDescription('');
        setSelectedActivityId('');
        // Keep selectedGroup if desired
        // setSelectedGroup(''); 
        setEditingId(null);
        setIsFormOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        const payload = {
            user_id: userId,
            activity_id: parseInt(selectedActivityId), // Convert to number for DB
            hours: parseFloat(hours || '0') + (parseFloat(minutes || '0') / 60),
            semester,
            document_link: documentLink,
            description,
            status: 'PENDING'
        };

        if (editingId) {
            updateActivityMutation.mutate({ id: editingId, data: payload }, {
                onSuccess: () => setIsFormOpen(false)
            });
        } else {
            addActivityMutation.mutate(payload, {
                onSuccess: () => setIsFormOpen(false)
            });
        }
    };

    const handleDelete = (id: number) => {
        if (!confirm('Excluir esta atividade?')) return;
        deleteActivityMutation.mutate(id);
    };

    const handleEdit = (activity: Activity) => {
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

    const handleCancelEdit = () => resetForm();

    // --- Helpers ---
    const getGroupIcon = (groupName: string) => {
        const map: { [key: string]: string } = {
            'A': 'school',
            'B': 'event',
            'C': 'groups',
            'D': 'science',
            'E': 'work',
            'F': 'palette',
            'G': 'calendar_month',
            'H': 'star',
            'I': 'category',
            'J': 'add_circle',
        };
        return map[groupName] || 'folder_open';
    };

    const formatHours = (totalHours: number) => {
        const h = Math.floor(totalHours);
        const m = Math.round((totalHours - h) * 60);
        if (h === 0) return `${m}m`;
        if (m === 0) return `${h}h`;
        return `${h}h e ${m}min`;
    };

    const selectedCatalogItem = useMemo(() => {
        if (!selectedGroup || !selectedActivityId) return null;
        return catalog[selectedGroup]?.find(c => c.id.toString() === selectedActivityId);
    }, [catalog, selectedGroup, selectedActivityId]);

    // --- Table React Table Defs ---
    const columns = useMemo<ColumnDef<Activity>[]>(() => [
        {
            accessorFn: (row) => row.activity?.group,
            id: 'group',
            header: 'Grupo',
            cell: info => (
                <span className="py-1 px-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold border border-slate-200 dark:border-slate-700">
                    {(info.getValue() as string) || '-'}
                </span>
            ),
        },
        {
            accessorFn: (row) => row.activity?.code,
            id: 'code',
            header: 'Sub',
            cell: info => (
                <span className="font-mono text-xs text-primary bg-primary/5 px-1.5 py-0.5 rounded">
                    {(info.getValue() as string) || '-'}
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
                        <span className="line-clamp-2 text-slate-700 dark:text-slate-200" title={desc}>
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
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-background-light dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-border-light dark:border-border-dark">
                    {info.getValue() as string}
                </span>
            )
        },
        {
            accessorKey: 'hours',
            header: 'Horas',
            cell: info => (
                <span className="text-xs font-bold text-slate-700 dark:text-slate-100">
                    {formatHours(info.getValue() as number)}
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
    ], []);

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

    return {
        // Data & State
        userId,
        groupProgress,
        loading,
        catalog,
        isFormOpen,
        editingId,
        selectedGroup, selectedActivityId,
        hours, minutes, semester, documentLink, description,
        selectedCatalogItem,
        table,
        globalFilter, setGlobalFilter,
        columnFilters, setColumnFilters,

        // Actions
        handleSubmit,
        handleNewActivity,
        handleCancelEdit,
        setSelectedGroup, setSelectedActivityId,
        setHours, setMinutes, setSemester, setDocumentLink, setDescription,
        getGroupIcon
    };
};

// --- Views ---

const LoadingView = () => (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-32 bg-surface-light dark:bg-surface-dark rounded-xl animate-pulse border border-border-light dark:border-border-dark" />
            ))}
        </div>
        <LoadingSpinner message="Carregando atividades..." />
    </div>
);

const NotLoggedView = () => (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="p-4 text-center">Faça login para gerenciar suas atividades.</div>
    </div>
);

const ProgressSummaryView = ({ ctrl }: { ctrl: ReturnType<typeof useActivitiesController> }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            {/* Summary Card - Highlighted */}
            <div className="bg-primary text-white p-5 rounded-xl shadow-lg shadow-primary/20 flex flex-col justify-between hover:-translate-y-1 transition-transform relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-9xl transform rotate-12">emoji_events</span>
                </div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-2 rounded-lg bg-white/20 text-white backdrop-blur-sm">
                        <span className="material-symbols-outlined text-xl">emoji_events</span>
                    </div>
                    <span className="text-2xl font-bold">{ctrl.groupProgress.reduce((acc, curr) => acc + curr.total, 0).toFixed(2)}h</span>
                </div>
                <div className="relative z-10">
                    <h3 className="font-bold text-sm mb-1 truncate">
                        Total Acumulado
                    </h3>

                    {(() => {
                        const total = ctrl.groupProgress.reduce((acc, curr) => acc + curr.total, 0);
                        const limit = 210;
                        const percent = Math.min(100, (total / limit) * 100);
                        return (
                            <>
                                <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden mb-2">
                                    <div
                                        className="h-full bg-white transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-white/90 font-medium tracking-wide">
                                    <span>{Math.round(percent)}% Concluído</span>
                                    <span>Meta: {limit}h</span>
                                </div>
                            </>
                        );
                    })()}
                </div>
            </div>

            {ctrl.groupProgress.map((group) => {
                const percent = Math.min(100, (group.total / group.limit) * 100);
                return (
                    <div key={group.group} className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-border-light dark:border-border-dark shadow-sm flex flex-col justify-between hover:shadow-md hover:border-primary/40 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-lg bg-background-light dark:bg-background-dark text-text-light-secondary group-hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-xl">{ctrl.getGroupIcon(group.group)}</span>
                            </div>
                            <span className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">{group.total.toFixed(2)}h</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-text-light-primary dark:text-text-dark-primary mb-1 truncate" title={group.description}>
                                {group.label}
                            </h3>
                            <p className="text-[10px] text-text-light-secondary dark:text-text-dark-secondary mb-3 truncate font-medium">
                                {group.description}
                            </p>
                            <div className="w-full h-1.5 bg-background-light dark:bg-background-dark rounded-full overflow-hidden mb-2">
                                <div
                                    className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-text-light-secondary uppercase font-bold tracking-wider">
                                <span>{Math.round(percent)}%</span>
                                <span>Meta: {group.limit}h</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const ActivitiesTableView = ({ ctrl }: { ctrl: ReturnType<typeof useActivitiesController> }) => {
    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm flex flex-col">
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/20">
                <div>
                    <select
                        className="w-full p-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        onChange={e => {
                            const val = e.target.value;
                            ctrl.setColumnFilters(old => val ? [{ id: 'group', value: val }] : []);
                        }}
                        value={ctrl.columnFilters.find(f => f.id === 'group')?.value || ''}
                    >
                        <option value="">Todos os Grupos</option>
                        {Object.keys(ctrl.catalog).sort().map(g => (
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
                        value={ctrl.globalFilter}
                        onChange={e => ctrl.setGlobalFilter(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider sticky top-0 z-10">
                        {ctrl.table.getHeaderGroups().map(headerGroup => (
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
                        {ctrl.table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-10 text-center text-text-light-secondary">
                                    <div className="bg-background-light dark:bg-background-dark w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="material-symbols-outlined text-3xl text-slate-300">search_off</span>
                                    </div>
                                    <p>Nenhuma atividade encontrada.</p>
                                </td>
                            </tr>
                        ) : (
                            ctrl.table.getRowModel().rows.map(row => (
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
                    Página <span className="text-text-light-primary dark:text-text-dark-primary font-bold">{ctrl.table.getState().pagination.pageIndex + 1}</span> de <span className="text-text-light-primary dark:text-text-dark-primary font-bold">{ctrl.table.getPageCount() || 1}</span>
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => ctrl.table.previousPage()}
                        disabled={!ctrl.table.getCanPreviousPage()}
                        className="p-1.5 px-3 rounded-lg border border-border-light dark:border-border-dark hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-bold text-text-light-secondary"
                    >
                        Anterior
                    </button>
                    <button
                        onClick={() => ctrl.table.nextPage()}
                        disabled={!ctrl.table.getCanNextPage()}
                        className="p-1.5 px-3 rounded-lg border border-border-light dark:border-border-dark hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-bold text-text-light-secondary"
                    >
                        Próxima
                    </button>
                </div>
            </div>
        </div>
    );
};

const ActivityFormView = ({ ctrl }: { ctrl: ReturnType<typeof useActivitiesController> }) => {
    return (
        <div className={`lg:col-span-1 order-1 lg:order-2 ${ctrl.isFormOpen ? 'fixed inset-0 z-50 overflow-y-auto bg-background-light dark:bg-background-dark p-4 animate-in fade-in slide-in-from-bottom-10 lg:static lg:p-0 lg:overflow-visible lg:bg-transparent lg:animate-none' : 'hidden lg:block'}`}>
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm sticky top-6 h-full lg:h-auto overflow-y-auto lg:overflow-visible">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-light dark:border-border-dark">
                    <h3 className="font-bold text-lg text-text-light-primary dark:text-text-dark-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">
                            {ctrl.editingId ? 'edit_note' : 'post_add'}
                        </span>
                        {ctrl.editingId ? 'Editar Atividade' : 'Nova Atividade'}
                    </h3>
                    {(ctrl.editingId || ctrl.isFormOpen) && (
                        <button
                            onClick={ctrl.handleCancelEdit}
                            className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded bg-red-50 dark:bg-red-900/10 hover:bg-red-100 transition-colors"
                        >
                            Cancelar
                        </button>
                    )}
                </div>

                <form onSubmit={ctrl.handleSubmit} className="space-y-5">
                    {/* Group Selection */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wide text-text-light-secondary dark:text-text-dark-secondary">Grupo</label>
                        <div className="relative">
                            <select
                                className="w-full p-3 pl-4 pr-10 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none transition-all cursor-pointer hover:border-primary/50"
                                value={ctrl.selectedGroup}
                                onChange={(e) => {
                                    ctrl.setSelectedGroup(e.target.value);
                                    ctrl.setSelectedActivityId('');
                                }}
                            >
                                <option value="">Selecione um grupo...</option>
                                {Object.keys(ctrl.catalog).sort().map(g => (
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
                                disabled={!ctrl.selectedGroup}
                                className="w-full p-3 pl-4 pr-10 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:border-primary/50"
                                value={ctrl.selectedActivityId}
                                onChange={(e) => ctrl.setSelectedActivityId(e.target.value)}
                            >
                                <option value="">Selecione a atividade...</option>
                                {ctrl.selectedGroup && ctrl.catalog[ctrl.selectedGroup] && ctrl.catalog[ctrl.selectedGroup].map(c => (
                                    <option key={c.id} value={c.id}>{c.code} - {c.description.substring(0, 30)}...</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-light-secondary">
                                <span className="material-symbols-outlined text-lg">expand_more</span>
                            </div>
                        </div>
                    </div>

                    {ctrl.selectedCatalogItem && (
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800 text-xs animate-fadeIn">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-mono font-bold text-primary bg-white dark:bg-black/20 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                                    {ctrl.selectedCatalogItem.code}
                                </span>
                                <span className="text-text-light-secondary">Limite: <span className="font-bold">{ctrl.selectedCatalogItem.limit_hours}h</span></span>
                            </div>
                            <p className="text-text-light-primary dark:text-text-dark-primary leading-relaxed opacity-90">
                                {ctrl.selectedCatalogItem.description}
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
                                className="w-full p-3 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={ctrl.semester}
                                onChange={(e) => ctrl.setSemester(e.target.value)}
                            />
                        </div>

                        <div className="col-span-6 sm:col-span-3 space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wide text-text-light-secondary dark:text-text-dark-secondary">Horas</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    className="w-full p-3 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pl-3"
                                    value={ctrl.hours}
                                    onChange={(e) => ctrl.setHours(e.target.value)}
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
                                    className="w-full p-3 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pl-3"
                                    value={ctrl.minutes}
                                    onChange={(e) => ctrl.setMinutes(e.target.value)}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light-secondary text-xs font-bold">m</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wide text-text-light-secondary dark:text-text-dark-secondary">Descrição</label>
                        <textarea
                            className="w-full p-3 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                            value={ctrl.description}
                            onChange={(e) => ctrl.setDescription(e.target.value)}
                            placeholder="Detalhes adicionais da atividade..."
                            rows={3}
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
                                className="w-full p-3 pl-10 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={ctrl.documentLink}
                                onChange={(e) => ctrl.setDocumentLink(e.target.value)}
                                placeholder="https://drive.google.com/..."
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3.5 bg-primary text-white rounded-lg hover:bg-primary-dark font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-2"
                    >
                        <span className="material-symbols-outlined text-xl">{ctrl.editingId ? 'save' : 'add_circle'}</span>
                        {ctrl.editingId ? 'Salvar Alterações' : 'Adicionar Atividade'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const ActivitiesView = ({ ctrl }: { ctrl: ReturnType<typeof useActivitiesController> }) => {
    if (ctrl.loading) return <LoadingView />;
    if (!ctrl.userId) return <NotLoggedView />;

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl animate-fadeIn">
            <header className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6 border-b border-border-light dark:border-border-dark">
                <div>
                    <h1 className="text-3xl font-bold text-text-light-primary dark:text-text-dark-primary mb-2 tracking-tight">
                        Atividades Complementares
                    </h1>
                    <p className="text-text-light-secondary dark:text-text-dark-secondary text-lg font-light">
                        Gerencie suas atividades extracurriculares e acompanhe seu progresso.
                    </p>
                </div>
                <Link
                    href="/profile"
                    className="group px-5 py-2.5 bg-white dark:bg-surface-dark text-text-light-secondary dark:text-text-dark-secondary font-medium rounded-lg border border-border-light dark:border-border-dark hover:text-primary hover:border-primary/50 transition-all duration-300 flex items-center gap-2 self-start md:self-auto shadow-sm"
                >
                    <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    <span>Voltar ao Perfil</span>
                </Link>
            </header>

            <ProgressSummaryView ctrl={ctrl} />

            <div className="animate-fadeIn">
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Left Column: Table List */}
                        <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
                            <ActivitiesTableView ctrl={ctrl} />
                        </div>

                        {/* Right Column: Form */}
                        <ActivityFormView ctrl={ctrl} />
                    </div>

                    {/* Mobile Floating Action Button */}
                    {!ctrl.isFormOpen && (
                        <button
                            onClick={ctrl.handleNewActivity}
                            className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-40"
                            title="Adicionar Nova Atividade"
                        >
                            <span className="material-symbols-outlined text-3xl">add</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Main Component
const ActivitiesPageContent = () => {
    const ctrl = useActivitiesController();
    return <ActivitiesView ctrl={ctrl} />;
}

export default function ActivitiesPage() {
    return (
        <Suspense fallback={<LoadingSpinner message="Carregando..." />}>
            <ActivitiesPageContent />
        </Suspense>
    );
}
