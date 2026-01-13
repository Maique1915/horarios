'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import LoadingSpinner from '../shared/LoadingSpinner';
import Pagination from '../shared/Pagination';

interface TimeSlot {
    id: number;
    start_time: string;
    end_time: string;
    course_id: number;
}

interface Course {
    id: number;
    name: string;
    code: string;
}

export default function TimeSlotsManager() {
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<Course[]>([]);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [isCreating, setIsCreating] = useState(false);
    const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);

    // Form data
    const [formData, setFormData] = useState({
        start_time: '',
        end_time: ''
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourseId) {
            fetchTimeSlots(selectedCourseId);
            setCurrentPage(1);
        } else {
            setTimeSlots([]);
        }
    }, [selectedCourseId]);

    const fetchCourses = async () => {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*') // Might need minimal selection
                .order('name');

            if (error) throw error;
            setCourses(data || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTimeSlots = async (courseId: number) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('time_slots')
                .select('*')
                .eq('course_id', courseId)
                .order('start_time');

            if (error) throw error;
            setTimeSlots(data || []);
        } catch (error) {
            console.error('Error fetching time slots:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourseId) return;

        try {
            if (editingSlot) {
                const { error } = await supabase
                    .from('time_slots')
                    .update({
                        start_time: formData.start_time,
                        end_time: formData.end_time
                    })
                    .eq('id', editingSlot.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('time_slots')
                    .insert([{
                        start_time: formData.start_time,
                        end_time: formData.end_time,
                        course_id: selectedCourseId
                    }]);
                if (error) throw error;
            }

            await fetchTimeSlots(selectedCourseId);
            setIsCreating(false);
            setEditingSlot(null);
            setFormData({ start_time: '', end_time: '' });

        } catch (error: any) {
            alert('Erro ao salvar: ' + error.message);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir este horário?')) return;
        try {
            const { error } = await supabase
                .from('time_slots')
                .delete()
                .eq('id', id);
            if (error) throw error;
            if (selectedCourseId) fetchTimeSlots(selectedCourseId);
        } catch (error: any) {
            alert('Erro ao excluir: ' + error.message);
        }
    };

    const startEdit = (slot: TimeSlot) => {
        setEditingSlot(slot);
        setFormData({
            start_time: slot.start_time,
            end_time: slot.end_time
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
                        Gerenciar Horários
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Defina os horários de aula para cada curso.
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
                        setEditingSlot(null);
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
                        {/* Filters / Header for Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                                <h3 className="font-bold text-gray-700 dark:text-gray-300">Horários Cadastrados</h3>
                                {/* Mobile-only add button if needed, but we have the form on the right now */}
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 uppercase">
                                            <th className="p-4 font-medium">Início</th>
                                            <th className="p-4 font-medium">Fim</th>
                                            <th className="p-4 font-medium text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {timeSlots
                                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                            .map(slot => (
                                                <tr key={slot.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${editingSlot?.id === slot.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                                    <td className="p-4 font-medium text-gray-800 dark:text-gray-200">
                                                        {slot.start_time.substring(0, 5)}
                                                    </td>
                                                    <td className="p-4 font-medium text-gray-800 dark:text-gray-200">
                                                        {slot.end_time.substring(0, 5)}
                                                    </td>
                                                    <td className="p-4 text-right flex justify-end gap-2">
                                                        <button
                                                            onClick={() => startEdit(slot)}
                                                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(slot.id)}
                                                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">delete</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        {timeSlots.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="p-8 text-center text-gray-400">
                                                    Nenhum horário cadastrado para este curso.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination
                                currentPage={currentPage}
                                totalItems={timeSlots.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    </div>

                    {/* Editor Column */}
                    <div className="lg:col-span-1 sticky top-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                                <span className={`material-symbols-outlined rounded-full p-2 ${editingSlot ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {editingSlot ? 'edit' : 'add'}
                                </span>
                                <h4 className="font-bold text-gray-800 dark:text-gray-200">
                                    {editingSlot ? 'Editar Horário' : 'Novo Horário'}
                                </h4>
                                {editingSlot && (
                                    <button
                                        onClick={() => {
                                            setIsCreating(false);
                                            setEditingSlot(null);
                                            setFormData({ start_time: '', end_time: '' });
                                        }}
                                        className="ml-auto text-gray-400 hover:text-gray-600"
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Hora de Início</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-3 text-gray-400">schedule</span>
                                        <input
                                            type="time"
                                            required
                                            className="w-full pl-10 p-2.5 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            value={formData.start_time}
                                            onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Hora de Fim</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-3 text-gray-400">schedule</span>
                                        <input
                                            type="time"
                                            required
                                            className="w-full pl-10 p-2.5 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            value={formData.end_time}
                                            onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="w-full py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark shadow-md hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">save</span>
                                        {editingSlot ? 'Atualizar Horário' : 'Adicionar Horário'}
                                    </button>

                                    {editingSlot && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingSlot(null);
                                                setIsCreating(false);
                                                setFormData({ start_time: '', end_time: '' });
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
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">schedule</span>
                    <p className="text-gray-500 font-medium">Selecione um curso para ver e editar os horários</p>
                </div>
            )}
        </div>
    );
}
