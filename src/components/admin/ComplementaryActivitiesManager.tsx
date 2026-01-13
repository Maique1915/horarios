'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import LoadingSpinner from '../shared/LoadingSpinner';
import Pagination from '../shared/Pagination';

interface Activity {
    id: number;
    group: string; // FK to ActivityGroup.id
    code: string;
    description: string;
    workload_formula: string;
    limit_hours: number;
    requirements: string;
    active: boolean;
    course_id: number;
}

interface ActivityGroup {
    id: string; // Group Code (A, B, C...)
    description: string;
}

interface Course {
    id: number;
    name: string;
    code: string;
}

export default function ComplementaryActivitiesManager() {
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<Course[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [groups, setGroups] = useState<ActivityGroup[]>([]);

    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [isCreating, setIsCreating] = useState(false);
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

    // Form data
    const [formData, setFormData] = useState({
        group: '',
        code: '',
        description: '',
        workload_formula: '',
        limit_hours: 0,
        requirements: '',
        active: true
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourseId) {
            fetchActivities(selectedCourseId);
            fetchGroups(selectedCourseId);
            setCurrentPage(1);
        } else {
            setActivities([]);
            setGroups([]);
        }
    }, [selectedCourseId]);

    const fetchCourses = async () => {
        try {
            const { data, error } = await supabase.from('courses').select('*').order('name');
            if (error) throw error;
            setCourses(data || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGroups = async (courseId: number) => {
        try {
            const { data, error } = await supabase
                .from('complementary_activity_groups')
                .select('id, description')
                .eq('course_id', courseId)
                .order('id');
            if (error) throw error;
            setGroups(data || []);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const fetchActivities = async (courseId: number) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('complementary_activities')
                .select('*')
                .eq('course_id', courseId)
                .order('group')
                .order('code');
            if (error) throw error;
            setActivities(data || []);
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourseId) return;

        try {
            const payload = {
                group: formData.group,
                code: formData.code,
                description: formData.description,
                workload_formula: formData.workload_formula,
                limit_hours: formData.limit_hours,
                requirements: formData.requirements,
                active: formData.active,
                course_id: selectedCourseId
            };

            if (editingActivity) {
                const { error } = await supabase
                    .from('complementary_activities')
                    .update(payload)
                    .eq('id', editingActivity.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('complementary_activities')
                    .insert([payload]);
                if (error) throw error;
            }

            await fetchActivities(selectedCourseId);
            resetForm();

        } catch (error: any) {
            alert('Erro ao salvar: ' + error.message);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir esta atividade?')) return;
        try {
            const { error } = await supabase.from('complementary_activities').delete().eq('id', id);
            if (error) throw error;
            if (selectedCourseId) fetchActivities(selectedCourseId);
        } catch (error: any) {
            alert('Erro ao excluir: ' + error.message);
        }
    };

    const startEdit = (activity: Activity) => {
        setEditingActivity(activity);
        setFormData({
            group: activity.group,
            code: activity.code,
            description: activity.description,
            workload_formula: activity.workload_formula,
            limit_hours: activity.limit_hours,
            requirements: activity.requirements,
            active: activity.active
        });
        setIsCreating(true);
    };

    const resetForm = () => {
        setIsCreating(false);
        setEditingActivity(null);
        setFormData({
            group: '',
            code: '',
            description: '',
            workload_formula: '',
            limit_hours: 0,
            requirements: '',
            active: true
        });
    };

    if (loading && courses.length === 0) return <LoadingSpinner message="Carregando..." />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        Atividades Complementares
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Gerencie as atividades complementares base (Ex: Monitoria, Iniciação Científica).
                    </p>
                </div>
            </div>

            {/* Course Selector */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
                <span className="font-bold text-gray-600 dark:text-gray-300">Curso:</span>
                <select
                    className="flex-1 p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={selectedCourseId || ''}
                    onChange={(e) => {
                        setSelectedCourseId(Number(e.target.value));
                        resetForm();
                    }}
                >
                    <option value="">Selecione um curso...</option>
                    {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                    ))}
                </select>
            </div>

            {/* Content Area */}
            {selectedCourseId ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* List Column */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                                <h3 className="font-bold text-gray-700 dark:text-gray-300">Atividades Cadastradas</h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 uppercase">
                                            <th className="p-4 font-medium">Cod</th>
                                            <th className="p-4 font-medium">Descrição</th>
                                            <th className="p-4 font-medium">Grupo</th>
                                            <th className="p-4 font-medium">CH Max</th>
                                            <th className="p-4 font-medium text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {activities
                                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                            .map(activity => (
                                                <tr key={activity.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${editingActivity?.id === activity.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                                    <td className="p-4 font-bold text-gray-800 dark:text-gray-200">
                                                        {activity.code}
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate" title={activity.description}>
                                                        {activity.description}
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                                                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-bold">
                                                            {activity.group}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                                                        {activity.limit_hours}h
                                                    </td>
                                                    <td className="p-4 text-right flex justify-end gap-2">
                                                        <button
                                                            onClick={() => startEdit(activity)}
                                                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(activity.id)}
                                                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">delete</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        {activities.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-gray-400">
                                                    Nenhuma atividade cadastrada.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination
                                currentPage={currentPage}
                                totalItems={activities.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    </div>

                    {/* Editor Column */}
                    <div className="lg:col-span-1 sticky top-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                                <span className={`material-symbols-outlined rounded-full p-2 ${editingActivity ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {editingActivity ? 'edit' : 'add'}
                                </span>
                                <h4 className="font-bold text-gray-800 dark:text-gray-200">
                                    {editingActivity ? 'Editar Atividade' : 'Nova Atividade'}
                                </h4>
                                {editingActivity && (
                                    <button
                                        onClick={resetForm}
                                        className="ml-auto text-gray-400 hover:text-gray-600"
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Grupo</label>
                                    <select
                                        required
                                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        value={formData.group}
                                        onChange={e => setFormData({ ...formData, group: e.target.value })}
                                    >
                                        <option value="">Selecione o Grupo...</option>
                                        {groups.map(g => (
                                            <option key={g.id} value={g.id}>
                                                Grupo {g.id} {g.description ? `- ${g.description.substring(0, 20)}...` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Código</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: A1"
                                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Descrição</label>
                                    <textarea
                                        required
                                        rows={3}
                                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Fórmula Carga Horária</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: 20hs por semestre"
                                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        value={formData.workload_formula}
                                        onChange={e => setFormData({ ...formData, workload_formula: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Limite de Horas</label>
                                    <input
                                        type="number"
                                        min={0}
                                        required
                                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        value={formData.limit_hours}
                                        onChange={e => setFormData({ ...formData, limit_hours: Number(e.target.value) })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Requisitos</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Ex: Declaração do professor..."
                                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        value={formData.requirements}
                                        onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="active"
                                        className="w-4 h-4 text-primary rounded focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                                        checked={formData.active}
                                        onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                    />
                                    <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300">Ativo</label>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="w-full py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark shadow-md hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">save</span>
                                        {editingActivity ? 'Atualizar Atividade' : 'Adicionar Atividade'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">assignment</span>
                    <p className="text-gray-500 font-medium">Selecione um curso para ver e editar as atividades</p>
                </div>
            )}
        </div>
    );
}
