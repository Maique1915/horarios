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
        staleTime: 1000 * 60 * 60, // 1 hour cache
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
            updateActivityMutation.mutate({ id: editingId, data: payload });
        } else {
            addActivityMutation.mutate(payload);
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
        <div className="space-y-6">
            {/* Header / Summary */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">Minhas Atividades Complementares</h2>
                    <p className="text-text-light-secondary dark:text-text-dark-secondary">Registre suas horas e anexe comprovantes.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">Total Acumulado</p>
                    <p className="text-3xl font-bold text-primary">{Number(totalHours).toFixed(1).replace(/\.0$/, '')}h <span className="text-base font-normal text-text-light-secondary">/ 210h</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* Right Column (Form) - Moved to be rendered "on the right" structurally (order-2 lg:order-2) but usually code order matters for mobile stack 
                   User said "lado direito". 
                */}

                {/* Left Column: Table List */}
                <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-background-light dark:bg-background-dark text-text-light-secondary dark:text-text-dark-secondary text-sm uppercase">
                                    <tr>
                                        <th className="p-4 font-medium border-b border-border-light dark:border-border-dark">Grupo</th>
                                        <th className="p-4 font-medium border-b border-border-light dark:border-border-dark">Subgrupo</th>
                                        <th className="p-4 font-medium border-b border-border-light dark:border-border-dark">Descrição</th>
                                        <th className="p-4 font-medium border-b border-border-light dark:border-border-dark">Ano/Sem</th>
                                        <th className="p-4 font-medium border-b border-border-light dark:border-border-dark text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                    {userActivities.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-text-light-secondary">
                                                Nenhuma atividade registrada.
                                            </td>
                                        </tr>
                                    ) : (
                                        userActivities.map((activity) => (
                                            <tr key={activity.id} className="hover:bg-background-light dark:hover:bg-background-dark/50 transition-colors">
                                                <td className="p-4 text-text-light-primary dark:text-text-dark-primary font-medium">
                                                    {activity.activity?.group || '-'}
                                                </td>
                                                <td className="p-4 text-text-light-secondary dark:text-text-dark-secondary">
                                                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">
                                                        {activity.activity?.code || '-'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-text-light-primary dark:text-text-dark-primary">
                                                    <div className="flex flex-col">
                                                        <span>{activity.description || activity.activity?.description}</span>
                                                        {activity.document_link && (
                                                            <a href={activity.document_link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                                                                <span className="material-symbols-outlined text-[10px]">link</span>
                                                                Comprovante
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-text-light-secondary dark:text-text-dark-secondary text-sm">
                                                    {activity.semester}
                                                    <div className="text-xs mt-1 font-semibold">
                                                        {activity.hours}h
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEdit(activity)}
                                                            className="p-1.5 text-text-light-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                            title="Editar"
                                                        >
                                                            <span className="material-symbols-outlined text-xl">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(activity.id)}
                                                            className="p-1.5 text-text-light-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                            title="Excluir"
                                                        >
                                                            <span className="material-symbols-outlined text-xl">delete</span>
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

                {/* Right Column: Sticky Form */}
                <div className="lg:col-span-1 order-1 lg:order-2">
                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm sticky top-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg text-text-light-primary dark:text-text-dark-primary">
                                {editingId ? 'Editar Atividade' : 'Nova Atividade'}
                            </h3>
                            {editingId && (
                                <button
                                    onClick={handleCancelEdit}
                                    className="text-xs text-red-500 hover:underline"
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Group Selection */}
                            <div>
                                <label className="block text-xs font-medium mb-1 uppercase text-text-light-secondary">Grupo</label>
                                <select
                                    className="w-full p-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary text-sm"
                                    value={selectedGroup}
                                    onChange={(e) => {
                                        setSelectedGroup(e.target.value);
                                        setSelectedActivityId('');
                                    }}
                                >
                                    <option value="">Selecione...</option>
                                    {Object.keys(catalog).sort().map(g => (
                                        <option key={g} value={g}>Grupo {g}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium mb-1 uppercase text-text-light-secondary">Atividade</label>
                                <select
                                    required
                                    disabled={!selectedGroup}
                                    className="w-full p-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary disabled:opacity-50 text-sm"
                                    value={selectedActivityId}
                                    onChange={(e) => setSelectedActivityId(e.target.value)}
                                >
                                    <option value="">Selecione...</option>
                                    {selectedGroup && catalog[selectedGroup] && catalog[selectedGroup].map(c => (
                                        <option key={c.id} value={c.id}>{c.code} - {c.description.substring(0, 30)}...</option>
                                    ))}
                                </select>
                            </div>

                            {selectedCatalogItem && (
                                <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 text-xs">
                                    <p className="font-bold text-primary mb-1">{selectedCatalogItem.code}</p>
                                    <p className="text-text-light-primary dark:text-text-dark-primary mb-1 leading-relaxed">
                                        {selectedCatalogItem.description}
                                    </p>
                                    <div className="flex gap-3 text-text-light-secondary mt-2 pt-2 border-t border-primary/10">
                                        <span>Máx: {selectedCatalogItem.limit_hours}h</span>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium mb-1 uppercase text-text-light-secondary">Semestre</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="ex: 2024.1"
                                        className="w-full p-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm"
                                        value={semester}
                                        onChange={(e) => setSemester(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium mb-1 uppercase text-text-light-secondary">Horas</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        className="w-full p-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm"
                                        value={hours}
                                        onChange={(e) => setHours(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium mb-1 uppercase text-text-light-secondary">Descrição</label>
                                <textarea
                                    className="w-full p-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Detalhes da atividade..."
                                    rows="2"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium mb-1 uppercase text-text-light-secondary">Link (Opcional)</label>
                                <input
                                    type="url"
                                    className="w-full p-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm"
                                    value={documentLink}
                                    onChange={(e) => setDocumentLink(e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>

                            <button type="submit" className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-bold shadow-md transition-colors flex items-center justify-center gap-2 mt-2">
                                <span className="material-symbols-outlined text-xl">{editingId ? 'save' : 'add_circle'}</span>
                                {editingId ? 'Salvar Alterações' : 'Adicionar Atividade'}
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserActivitiesManager;
