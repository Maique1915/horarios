'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { getUserActivities, addUserActivity, updateUserActivity, deleteUserActivity, getComplementaryActivities, getActivityGroups } from '../services/complementaryService';
import LoadingSpinner from './LoadingSpinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const UserActivitiesManager = () => {
    const [userId, setUserId] = useState(null);
    const queryClient = useQueryClient();

    // Form State
    const [editingId, setEditingId] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedActivityId, setSelectedActivityId] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [hours, setHours] = useState('');
    const [semester, setSemester] = useState('');
    const [documentLink, setDocumentLink] = useState('');
    const [description, setDescription] = useState('');

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
            hours: parseFloat(hours),
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
        setHours(activity.hours || '');
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

    if (loading) return <LoadingSpinner message="Carregando suas atividades..." />;

    if (!userId) return <div className="p-4 text-center">Faça login para gerenciar suas atividades.</div>;

    const totalHours = userActivities.reduce((sum, a) => sum + (a.hours || 0), 0);

    return (
        <div className="space-y-8">
            {/* Header / Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left Column: Table List */}
                <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-text-light-secondary dark:text-text-dark-secondary text-xs font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 border-b border-border-light dark:border-border-dark">Grupo</th>
                                        <th className="px-6 py-4 border-b border-border-light dark:border-border-dark">Sub</th>
                                        <th className="px-6 py-4 border-b border-border-light dark:border-border-dark w-1/3">Descrição</th>
                                        <th className="px-6 py-4 border-b border-border-light dark:border-border-dark">Semestre</th>
                                        <th className="px-6 py-4 border-b border-border-light dark:border-border-dark text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm">
                                    {userActivities.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-10 text-center text-text-light-secondary">
                                                <div className="bg-background-light dark:bg-background-dark w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <span className="material-symbols-outlined text-3xl text-slate-300">feed</span>
                                                </div>
                                                <p>Nenhuma atividade registrada ainda.</p>
                                                <p className="text-xs opacity-70 mt-1">Use o formulário ao lado para adicionar.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        userActivities.map((activity) => (
                                            <tr key={activity.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                                <td className="px-6 py-4 text-text-light-primary dark:text-text-dark-primary font-medium">
                                                    <span className="py-1 px-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold border border-slate-200 dark:border-slate-700">
                                                        {activity.activity?.group || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-text-light-secondary dark:text-text-dark-secondary">
                                                    <span className="font-mono text-xs text-primary bg-primary/5 px-1.5 py-0.5 rounded">
                                                        {activity.activity?.code || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-text-light-primary dark:text-text-dark-primary">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="line-clamp-2" title={activity.description || activity.activity?.description}>
                                                            {activity.description || activity.activity?.description}
                                                        </span>
                                                        {activity.document_link && (
                                                            <a href={activity.document_link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 w-fit px-2 py-0.5 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors">
                                                                <span className="material-symbols-outlined text-[10px]">link</span>
                                                                Ver Comprovante
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-text-light-secondary dark:text-text-dark-secondary">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark">
                                                            {activity.semester}
                                                        </span>
                                                        <span className="text-xs font-bold text-text-light-primary dark:text-text-dark-primary">
                                                            {activity.hours}h
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEdit(activity)}
                                                            className="w-8 h-8 flex items-center justify-center text-text-light-secondary hover:text-primary hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all border border-transparent hover:border-border-light hover:shadow-sm"
                                                            title="Editar"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(activity.id)}
                                                            className="w-8 h-8 flex items-center justify-center text-text-light-secondary hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30 hover:shadow-sm"
                                                            title="Excluir"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
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

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wide text-text-light-secondary dark:text-text-dark-secondary">Horas</label>
                                    <div className="relative">
                                        <input
                                            required
                                            type="number"
                                            step="0.1"
                                            min="0.1"
                                            placeholder="0.0"
                                            className="w-full p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pl-3"
                                            value={hours}
                                            onChange={(e) => setHours(e.target.value)}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light-secondary text-xs font-bold">h</span>
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
