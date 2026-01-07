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
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import ComplementaryActivityForm from '../../../components/activities/ComplementaryActivityForm';
import {
    Activity,
    GroupProgress,
    Catalog
} from '../../../types/complementary';

// Types are now in src/types/complementary.ts

// --- Controller ---
const useActivitiesController = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const userId = user?.id;

    // --- State ---
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Section: Table State
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnFilters, setColumnFilters] = useState<any[]>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    });

    const [selectedGroupDetails, setSelectedGroupDetails] = useState<GroupProgress | null>(null);

    // --- Data Fetching ---

    // 1. Group Progress (Summary)
    const { data: groupProgress = [], isLoading: loadingProgress } = useQuery<GroupProgress[]>({
        queryKey: ['userGroupProgress', userId, user?.course_id],
        queryFn: () => getUserGroupProgress(userId!, user?.course_id),
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
        queryKey: ['complementaryCatalog', user?.course_id],
        queryFn: async () => {
            const data = await getComplementaryActivities(user?.course_id);
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

    const handleDelete = (id: number) => {
        if (!confirm('Excluir esta atividade?')) return;
        deleteActivityMutation.mutate(id);
    };

    const handleEdit = (activity: Activity) => {
        setEditingActivity(activity);
        setIsFormOpen(true);
    };

    const handleNewActivity = () => {
        setEditingActivity(null);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setEditingActivity(null);
        setIsFormOpen(false);
    };

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
        editingActivity,
        table,
        globalFilter, setGlobalFilter,
        columnFilters, setColumnFilters,
        selectedGroupDetails, setSelectedGroupDetails,

        // Actions
        handleNewActivity,
        handleCloseForm,
        handleEdit,
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
                    <span className="text-2xl font-bold">{ctrl.groupProgress.reduce((acc, curr) => acc + curr.capped_total, 0).toFixed(2)}h</span>
                </div>
                <div className="relative z-10">
                    <h3 className="font-bold text-sm mb-1 truncate">
                        Horas Integralizadas
                    </h3>

                    {(() => {
                        const total = ctrl.groupProgress.reduce((acc, curr) => acc + curr.capped_total, 0);
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
                const percent = Math.min(100, (group.capped_total / group.limit) * 100);
                const isFinished = group.capped_total >= (group.min_limit || group.limit);

                return (
                    <div
                        key={group.group}
                        onClick={() => ctrl.setSelectedGroupDetails(group)}
                        className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-border-light dark:border-border-dark shadow-sm flex flex-col justify-between hover:shadow-md hover:border-primary/40 transition-all group cursor-pointer relative overflow-hidden"
                    >
                        {isFinished && (
                            <div className="absolute top-0 right-0 p-1">
                                <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-lg bg-background-light dark:bg-background-dark text-text-light-secondary group-hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-xl">{ctrl.getGroupIcon(group.group)}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">{group.capped_total.toFixed(2)}h</span>
                                {group.total > group.capped_total && (
                                    <span className="text-[10px] text-orange-500 font-bold">-{(group.total - group.capped_total).toFixed(1)}h excedente</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-text-light-primary dark:text-text-dark-primary mb-1 truncate text-wrap line-clamp-2 min-h-[2.5rem]" title={group.description}>
                                {group.label}
                            </h3>
                            <div className="w-full h-1.5 bg-background-light dark:bg-background-dark rounded-full overflow-hidden mb-2">
                                <div
                                    className={`h-full transition-all duration-1000 ease-out rounded-full ${isFinished ? 'bg-green-500' : 'bg-primary'}`}
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-text-light-secondary uppercase font-bold tracking-wider">
                                <span>{Math.round(percent)}%</span>
                                <span>META: {group.min_limit ? `${group.min_limit}-${group.limit}` : group.limit}H</span>
                            </div>
                        </div>
                    </div>
                );
            })}

            {ctrl.selectedGroupDetails && (
                <GroupDetailsModal group={ctrl.selectedGroupDetails} onClose={() => ctrl.setSelectedGroupDetails(null)} />
            )}
        </div>
    );
};

const GroupDetailsModal = ({ group, onClose }: { group: GroupProgress, onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div className="bg-surface-light dark:bg-surface-dark w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-border-light dark:border-border-dark animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-slate-50 dark:bg-slate-900/40">
                    <div>
                        <h2 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">{group.label}</h2>
                        <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-1">{group.description}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-background-light dark:hover:bg-background-dark rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-background-light dark:bg-background-dark p-4 rounded-xl border border-border-light dark:border-border-dark">
                            <span className="text-[10px] uppercase font-bold text-text-light-secondary block mb-1">Mínimo Requerido</span>
                            <span className="text-lg font-bold text-text-light-primary dark:text-text-dark-primary">{group.min_limit || group.limit}h</span>
                        </div>
                        <div className="bg-background-light dark:bg-background-dark p-4 rounded-xl border border-border-light dark:border-border-dark">
                            <span className="text-[10px] uppercase font-bold text-text-light-secondary block mb-1">Limite Máximo</span>
                            <span className="text-lg font-bold text-text-light-primary dark:text-text-dark-primary">{group.limit}h</span>
                        </div>
                    </div>

                    <h3 className="font-bold text-sm uppercase tracking-wider text-text-light-secondary mb-4">Subgrupos / Tipos de Atividade</h3>

                    <div className="space-y-3">
                        {group.subgroups.map(sub => {
                            const subPercent = sub.limit ? Math.min(100, (sub.capped_total / sub.limit) * 100) : 0;
                            return (
                                <div key={sub.id} className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-slate-900/20">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                                                    {sub.code}
                                                </span>
                                                <h4 className="font-bold text-sm text-text-light-primary dark:text-text-dark-primary">{sub.description}</h4>
                                            </div>
                                            {sub.formula && <p className="text-[10px] text-text-light-secondary italic">{sub.formula}</p>}
                                        </div>
                                        <div className="text-right ml-4">
                                            <span className="font-bold text-sm">{sub.capped_total.toFixed(2)}h</span>
                                            {sub.limit && <span className="text-[10px] text-text-light-secondary block">/ {sub.limit}h</span>}
                                        </div>
                                    </div>
                                    {sub.limit && (
                                        <div className="w-full h-1.5 bg-background-light dark:bg-background-dark rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary/60 rounded-full transition-all duration-700"
                                                style={{ width: `${subPercent}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-t border-border-light dark:border-border-dark text-center">
                    <p className="text-[10px] text-text-light-secondary">
                        * O total do grupo é limitado a {group.limit}h, mesmo que a soma dos subgrupos seja maior.
                    </p>
                </div>
            </div>
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

// --- Moved Confetti to separate component ---

// --- Moved ActivityFormView to separate component ---

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
                        <ComplementaryActivityForm
                            userId={ctrl.userId!}
                            catalog={ctrl.catalog}
                            groupProgress={ctrl.groupProgress}
                            editingActivity={ctrl.editingActivity}
                            isFormOpen={ctrl.isFormOpen}
                            onClose={ctrl.handleCloseForm}
                            onSuccess={ctrl.handleCloseForm}
                        />
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
