'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import LoadingSpinner from '../shared/LoadingSpinner';
import Pagination from '../shared/Pagination';

interface ActivityGroup {
    id: string; // Group Code (A, B, C...)
    description: string;
    min_hours: number;
    max_hours: number;
    course_id: number;
}

interface Course {
    id: number;
    name: string;
    code: string;
}

export default function ComplementaryGroupsManager() {
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<Course[]>([]);
    const [groups, setGroups] = useState<ActivityGroup[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [isCreating, setIsCreating] = useState(false);
    const [editingGroup, setEditingGroup] = useState<ActivityGroup | null>(null);

    // Form data
    const [formData, setFormData] = useState({
        id: '',
        description: '',
        min_hours: 0,
        max_hours: 0
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourseId) {
            fetchGroups(selectedCourseId);
            setCurrentPage(1);
        } else {
            setGroups([]);
        }
    }, [selectedCourseId]);

    const fetchCourses = async () => {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('name');

            if (error) throw error;
            setCourses(data || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGroups = async (courseId: number) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('complementary_activity_groups')
                .select('*')
                .eq('course_id', courseId)
                .order('id'); // Order by Group Code

            if (error) throw error;
            setGroups(data || []);
        } catch (error) {
            console.error('Error fetching groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourseId) return;

        try {
            if (editingGroup) {
                // PK 'id' cannot be changed usually, so we don't include it in update unless necessary/supported
                const { error } = await supabase
                    .from('complementary_activity_groups')
                    .update({
                        description: formData.description,
                        min_hours: formData.min_hours,
                        max_hours: formData.max_hours
                    })
                    .eq('id', editingGroup.id)
                    .eq('course_id', selectedCourseId); // Safety check

                if (error) throw error;
            } else {
                // Ensure ID is unique for this course (or globally if PK is just ID)
                // Assuming ID is unique String PK.
                const { error } = await supabase
                    .from('complementary_activity_groups')
                    .insert([{
                        id: formData.id,
                        description: formData.description,
                        min_hours: formData.min_hours,
                        max_hours: formData.max_hours,
                        course_id: selectedCourseId
                    }]);
                if (error) throw error;
            }

            await fetchGroups(selectedCourseId);
            setIsCreating(false);
            setEditingGroup(null);
            setFormData({ id: '', description: '', min_hours: 0, max_hours: 0 });

        } catch (error: any) {
            alert('Erro ao salvar: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(`Tem certeza que deseja excluir o Grupo ${id}?`)) return;
        try {
            const { error } = await supabase
                .from('complementary_activity_groups')
                .delete()
                .eq('id', id);
            if (error) throw error;
            if (selectedCourseId) fetchGroups(selectedCourseId);
        } catch (error: any) {
            alert('Erro ao excluir: ' + error.message);
        }
    };

    const startEdit = (group: ActivityGroup) => {
        setEditingGroup(group);
        setFormData({
            id: group.id,
            description: group.description,
            min_hours: group.min_hours,
            max_hours: group.max_hours
        });
        setIsCreating(true);
    };

    if (loading && courses.length === 0) return <LoadingSpinner message="Carregando..." />;

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        Grupos de Atividades Complementares
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Gerencie os grupos de atividades (ex: Grupo A, B, C) e seus limites de horas.
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
                        setIsCreating(false);
                        setEditingGroup(null);
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
                                <h3 className="font-bold text-gray-700 dark:text-gray-300">Grupos Cadastrados</h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 uppercase">
                                            <th className="p-4 font-medium">Grupo</th>
                                            <th className="p-4 font-medium">Descrição</th>
                                            <th className="p-4 font-medium">Min Horas</th>
                                            <th className="p-4 font-medium">Max Horas</th>
                                            <th className="p-4 font-medium text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {groups
                                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                            .map(group => (
                                                <tr key={group.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${editingGroup?.id === group.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                                    <td className="p-4 font-bold text-gray-800 dark:text-gray-200">
                                                        {group.id}
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                                                        {group.description}
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                                                        {group.min_hours}
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                                                        {group.max_hours}
                                                    </td>
                                                    <td className="p-4 text-right flex justify-end gap-2">
                                                        <button
                                                            onClick={() => startEdit(group)}
                                                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(group.id)}
                                                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">delete</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        {groups.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-gray-400">
                                                    Nenhum grupo cadastrado para este curso.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination
                                currentPage={currentPage}
                                totalItems={groups.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    </div>

                    {/* Editor Column */}
                    <div className="lg:col-span-1 sticky top-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                                <span className={`material-symbols-outlined rounded-full p-2 ${editingGroup ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {editingGroup ? 'edit' : 'add'}
                                </span>
                                <h4 className="font-bold text-gray-800 dark:text-gray-200">
                                    {editingGroup ? 'Editar Grupo' : 'Novo Grupo'}
                                </h4>
                                {editingGroup && (
                                    <button
                                        onClick={() => {
                                            setIsCreating(false);
                                            setEditingGroup(null);
                                            setFormData({ id: '', description: '', min_hours: 0, max_hours: 0 });
                                        }}
                                        className="ml-auto text-gray-400 hover:text-gray-600"
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Código do Grupo (ID)</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={5}
                                        disabled={!!editingGroup} // PK not editable on update
                                        placeholder="Ex: A"
                                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50"
                                        value={formData.id}
                                        onChange={e => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                                    />
                                    <p className="text-xs text-gray-400">Identificador único (Ex: A, B, C)</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Descrição</label>
                                    <textarea
                                        required
                                        rows={3}
                                        placeholder="Ex: Atividades de Ensino..."
                                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Min. Horas</label>
                                        <input
                                            type="number"
                                            min={0}
                                            required
                                            className="w-full p-2.5 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            value={formData.min_hours}
                                            onChange={e => setFormData({ ...formData, min_hours: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Max. Horas</label>
                                        <input
                                            type="number"
                                            min={0}
                                            required
                                            className="w-full p-2.5 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            value={formData.max_hours}
                                            onChange={e => setFormData({ ...formData, max_hours: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="w-full py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark shadow-md hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">save</span>
                                        {editingGroup ? 'Atualizar Grupo' : 'Adicionar Grupo'}
                                    </button>

                                    {editingGroup && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingGroup(null);
                                                setIsCreating(false);
                                                setFormData({ id: '', description: '', min_hours: 0, max_hours: 0 });
                                            }}
                                            className="w-full mt-2 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">category</span>
                    <p className="text-gray-500 font-medium">Selecione um curso para ver e editar os grupos</p>
                </div>
            )}
        </div>
    );
}
