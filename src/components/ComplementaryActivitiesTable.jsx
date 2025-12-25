'use client';

import React, { useState, useEffect } from 'react';
import { getComplementaryActivities, addComplementaryActivity, deleteComplementaryActivity } from '../services/complementaryService';
import LoadingSpinner from './LoadingSpinner';

const ComplementaryActivitiesTable = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newActivity, setNewActivity] = useState({
        group: '',
        code: '',
        description: '',
        workload_formula: '',
        limit_hours: '',
        requirements: ''
    });

    const loadActivities = async () => {
        try {
            setLoading(true);
            const data = await getComplementaryActivities();
            setActivities(data);
        } catch (error) {
            console.error(error);
            alert('Erro ao carregar atividades.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadActivities();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addComplementaryActivity(newActivity);
            setNewActivity({ group: '', code: '', description: '', workload_formula: '', limit_hours: '', requirements: '' });
            setShowForm(false);
            loadActivities();
        } catch (error) {
            console.error(error);
            alert('Erro ao adicionar atividade. Verifique se a tabela foi criada no Supabase.');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir esta atividade?')) return;
        try {
            await deleteComplementaryActivity(id);
            loadActivities();
        } catch (error) {
            console.error(error);
            alert('Erro ao excluir atividade.');
        }
    };

    if (loading) return <LoadingSpinner message="Carregando tabela..." />;

    return (
        <div className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">
                    Tabela de Atividades Complementares
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <span className="material-symbols-outlined">{showForm ? 'close' : 'add'}</span>
                    {showForm ? 'Cancelar' : 'Adicionar Nova'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 p-4 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                    <div>
                        <label className="block text-sm font-medium mb-1">Grupo</label>
                        <input
                            required
                            maxLength="1"
                            className="w-full p-2 rounded border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark uppercase"
                            value={newActivity.group}
                            onChange={e => setNewActivity({ ...newActivity, group: e.target.value.toUpperCase() })}
                            placeholder="A"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Código</label>
                        <input
                            required
                            className="w-full p-2 rounded border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark uppercase"
                            value={newActivity.code}
                            onChange={e => setNewActivity({ ...newActivity, code: e.target.value.toUpperCase() })}
                            placeholder="A1"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Atividade</label>
                        <input
                            required
                            className="w-full p-2 rounded border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
                            value={newActivity.description}
                            onChange={e => setNewActivity({ ...newActivity, description: e.target.value })}
                            placeholder="Descrição completa..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Carga Horária (Fórmula)</label>
                        <input
                            className="w-full p-2 rounded border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
                            value={newActivity.workload_formula}
                            onChange={e => setNewActivity({ ...newActivity, workload_formula: e.target.value })}
                            placeholder="ex: 10h por semestre"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Limite (Horas)</label>
                        <input
                            type="number"
                            className="w-full p-2 rounded border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
                            value={newActivity.limit_hours}
                            onChange={e => setNewActivity({ ...newActivity, limit_hours: e.target.value })}
                            placeholder="40"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Requisitos/Documentos</label>
                        <input
                            className="w-full p-2 rounded border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
                            value={newActivity.requirements}
                            onChange={e => setNewActivity({ ...newActivity, requirements: e.target.value })}
                            placeholder="Documentos necessários..."
                        />
                    </div>
                    <div className="md:col-span-2 flex justify-end mt-2">
                        <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold">
                            Salvar na Tabela
                        </button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-background-light dark:bg-background-dark text-text-light-secondary dark:text-text-dark-secondary uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3">Grp</th>
                            <th className="px-4 py-3">Cod</th>
                            <th className="px-4 py-3">Atividade</th>
                            <th className="px-4 py-3">Carga Hr.</th>
                            <th className="px-4 py-3">Limit</th>
                            <th className="px-4 py-3">Requisitos</th>
                            <th className="px-4 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light dark:divide-border-dark">
                        {activities.map((activity) => (
                            <tr key={activity.id} className="hover:bg-background-light/50 dark:hover:bg-background-dark/50">
                                <td className="px-4 py-3 font-medium">{activity.group}</td>
                                <td className="px-4 py-3 font-bold">{activity.code}</td>
                                <td className="px-4 py-3">{activity.description}</td>
                                <td className="px-4 py-3 text-text-light-secondary dark:text-text-dark-secondary">{activity.workload_formula}</td>
                                <td className="px-4 py-3">{activity.limit_hours}h</td>
                                <td className="px-4 py-3 text-xs text-text-light-secondary dark:text-text-dark-secondary max-w-xs truncate" title={activity.requirements}>
                                    {activity.requirements}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => handleDelete(activity.id)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                        title="Excluir"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {activities.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-4 py-8 text-center text-text-light-secondary dark:text-text-dark-secondary italic">
                                    Nenhuma atividade registrada ainda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ComplementaryActivitiesTable;
