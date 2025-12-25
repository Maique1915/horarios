'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getUserActivities, addUserActivity, deleteUserActivity, getComplementaryActivities } from '../services/complementaryService';
import LoadingSpinner from './LoadingSpinner';

const UserActivitiesManager = () => {
    const [userActivities, setUserActivities] = useState([]);
    const [catalog, setCatalog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [selectedActivityId, setSelectedActivityId] = useState('');
    const [hours, setHours] = useState('');
    const [semester, setSemester] = useState('');
    const [documentLink, setDocumentLink] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        const init = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setUserId(user.id);
                    const [activitiesData, catalogData] = await Promise.all([
                        getUserActivities(user.id),
                        getComplementaryActivities()
                    ]);
                    setUserActivities(activitiesData);
                    setCatalog(catalogData);
                }
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId) return;

        try {
            await addUserActivity({
                user_id: userId,
                activity_id: selectedActivityId,
                hours: parseFloat(hours),
                semester,
                document_link: documentLink,
                description,
                status: 'PENDING'
            });

            // Refresh list
            const updatedList = await getUserActivities(userId);
            setUserActivities(updatedList);

            // Reset form
            setShowForm(false);
            setHours('');
            setSemester('');
            setDocumentLink('');
            setDescription('');
            setSelectedActivityId('');
        } catch (error) {
            console.error(error);
            alert('Erro ao registrar atividade. Verifique os dados.');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Excluir esta atividade?')) return;
        try {
            await deleteUserActivity(id);
            setUserActivities(userActivities.filter(a => a.id !== id));
        } catch (error) {
            console.error(error);
            alert('Erro ao excluir.');
        }
    };

    // Derived state for selected catalog item
    const selectedCatalogItem = catalog.find(c => c.id.toString() === selectedActivityId);

    if (loading) return <LoadingSpinner message="Carregando suas atividades..." />;

    if (!userId) return <div className="p-4 text-center">Faça login para gerenciar suas atividades.</div>;

    const totalHours = userActivities.reduce((sum, a) => sum + (a.hours || 0), 0);

    return (
        <div className="space-y-8">
            {/* Summary Card */}
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

            {/* Action Bar */}
            <button
                onClick={() => setShowForm(!showForm)}
                className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium shadow-md"
            >
                <span className="material-symbols-outlined">{showForm ? 'close' : 'add_circle'}</span>
                {showForm ? 'Cancelar Registro' : 'Registrar Nova Atividade'}
            </button>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-background-light dark:bg-background-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-inner animate-fadeIn grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Atividade (Catálogo)</label>
                        <select
                            required
                            className="w-full p-2.5 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light-primary dark:text-text-dark-primary"
                            value={selectedActivityId}
                            onChange={(e) => setSelectedActivityId(e.target.value)}
                        >
                            <option value="">Selecione uma atividade...</option>
                            {catalog.map(c => (
                                <option key={c.id} value={c.id}>{c.code} - {c.description.substring(0, 80)}...</option>
                            ))}
                        </select>
                        {selectedCatalogItem && (
                            <p className="text-xs text-text-light-secondary mt-1 ml-1">
                                Limite: {selectedCatalogItem.limit_hours}h • Fórmula: {selectedCatalogItem.workload_formula}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Semestre de Realização</label>
                        <input
                            required
                            type="text"
                            placeholder="ex: 2024.1"
                            className="w-full p-2.5 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Horas Solicitadas</label>
                        <input
                            required
                            type="number"
                            step="0.1"
                            min="0.1"
                            className="w-full p-2.5 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Descrição / Detalhes</label>
                        <input
                            className="w-full p-2.5 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="ex: Monitoria de Algoritmos com Prof. Fulano"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                            Link do Comprovante (Drive/Dropbox)
                            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">Recomendado</span>
                        </label>
                        <input
                            type="url"
                            className="w-full p-2.5 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
                            value={documentLink}
                            onChange={(e) => setDocumentLink(e.target.value)}
                            placeholder="https://..."
                        />
                        <p className="text-xs text-text-light-secondary mt-1 ml-1">
                            Cole o link público para o documento comprobatório.
                        </p>
                    </div>

                    <div className="md:col-span-2 flex justify-end mt-2">
                        <button type="submit" className="px-8 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-lg transition-transform hover:scale-105">
                            Salvar Atividade
                        </button>
                    </div>
                </form>
            )}

            {/* List */}
            <div className="space-y-4">
                {userActivities.length === 0 ? (
                    <div className="text-center py-12 bg-surface-light/50 dark:bg-surface-dark/50 rounded-xl border border-dashed border-border-light dark:border-border-dark">
                        <span className="material-symbols-outlined text-4xl text-text-light-secondary opacity-50 mb-2">inbox</span>
                        <p className="text-text-light-secondary">Nenhuma atividade registrada ainda.</p>
                    </div>
                ) : (
                    userActivities.map((activity) => (
                        <div key={activity.id} className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-border-light dark:border-border-dark hover:border-primary/30 transition-all shadow-sm group relative">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="bg-primary/10 text-primary font-bold px-2 py-1 rounded text-sm">
                                        {activity.activity?.code}
                                    </span>
                                    <h3 className="font-semibold text-text-light-primary dark:text-text-dark-primary">
                                        {activity.description || activity.activity?.description}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium bg-background-light dark:bg-background-dark px-3 py-1 rounded-full border border-border-light dark:border-border-dark">
                                        {activity.hours}h
                                    </span>
                                    <button
                                        onClick={() => handleDelete(activity.id)}
                                        className="text-text-light-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                        title="Excluir"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-text-light-secondary dark:text-text-dark-secondary mt-3">
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-base">calendar_month</span>
                                    {activity.semester}
                                </span>
                                {activity.document_link && (
                                    <a
                                        href={activity.document_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-primary hover:underline"
                                    >
                                        <span className="material-symbols-outlined text-base">link</span>
                                        Ver Comprovante
                                    </a>
                                )}
                                <span className="flex items-center gap-1 ml-auto">
                                    Status:
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${activity.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                        activity.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {activity.status === 'APPROVED' ? 'Aprovado' :
                                            activity.status === 'REJECTED' ? 'Rejeitado' : 'Pendente'}
                                    </span>
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UserActivitiesManager;
