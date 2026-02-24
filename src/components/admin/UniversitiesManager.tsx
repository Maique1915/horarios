'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import LoadingSpinner from '../shared/LoadingSpinner';
import Pagination from '../shared/Pagination';
import UniversitiesTable from './UniversitiesTable';
import UniversityForm from './UniversityForm';

interface University {
    id: number;
    name: string;
    created_at?: string;
}

export default function UniversitiesManager() {
    const [loading, setLoading] = useState(true);
    const [universities, setUniversities] = useState<University[]>([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Selection / Edit state
    const [editingUniversity, setEditingUniversity] = useState<University | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUniversities();
    }, []);

    const fetchUniversities = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('universities')
            .select('*')
            .order('name');

        if (data) {
            setUniversities(data);
        } else if (error) {
            console.error('Error fetching universities:', error);
        }
        setLoading(false);
    };

    const handleSave = async (formData: { name: string }) => {
        setLoading(true);
        try {
            if (editingUniversity) {
                // Update
                const { error } = await supabase
                    .from('universities')
                    .update(formData)
                    .eq('id', editingUniversity.id);

                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('universities')
                    .insert([formData]);

                if (error) throw error;
            }

            await fetchUniversities();
            setEditingUniversity(null);
            setIsCreating(false);

        } catch (error: any) {
            console.error('Error saving university:', error);
            alert('Erro ao salvar universidade: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir esta universidade?')) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('universities')
                .delete()
                .eq('id', id);

            if (error) throw error;

            await fetchUniversities();
            if (editingUniversity?.id === id) {
                setEditingUniversity(null);
            }
        } catch (error: any) {
            console.error('Error deleting university:', error);
            alert('Erro ao excluir universidade: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredUniversities = universities.filter(uni => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return uni.name.toLowerCase().includes(q);
    });

    const renderRightPanel = () => {
        const stickyClass = "sticky top-6";

        if (isCreating) {
            return (
                <div className={`${stickyClass} bg-white dark:bg-gray-800 p-6 rounded-lg shadow`}>
                    <div className="flex items-center gap-2 mb-6 text-primary">
                        <span className="material-symbols-outlined">add_circle</span>
                        <h3 className="text-lg font-bold">Nova Universidade</h3>
                    </div>
                    <UniversityForm
                        onSave={handleSave}
                        onCancel={() => setIsCreating(false)}
                    />
                </div>
            );
        }

        if (editingUniversity) {
            return (
                <div className={`${stickyClass} bg-white dark:bg-gray-800 p-6 rounded-lg shadow`}>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2 text-primary">
                            <span className="material-symbols-outlined">edit</span>
                            <h3 className="text-lg font-bold">Editar Universidade</h3>
                        </div>
                        <button
                            onClick={() => setEditingUniversity(null)}
                            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <UniversityForm
                        initialData={editingUniversity}
                        onSave={handleSave}
                        onCancel={() => setEditingUniversity(null)}
                    />
                </div>
            );
        }

        return (
            <div className={`${stickyClass} bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center text-gray-400 py-20 border-2 border-dashed border-gray-100 dark:border-gray-700`}>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-primary">school</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Gerenciar Universidades</h3>
                    <p className="max-w-xs mx-auto text-sm">Selecione uma universidade na lista para editar ou crie uma nova.</p>
                    <button
                        onClick={() => { setIsCreating(true); setEditingUniversity(null); }}
                        className="mt-4 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                    >
                        Criar Nova Universidade
                    </button>
                </div>
            </div>
        );
    };

    if (loading && universities.length === 0) return <LoadingSpinner message="Carregando universidades..." />;

    return (
        <div className="mx-auto max-w-[1920px] p-6 lg:p-8 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-display font-bold leading-tight tracking-tight text-text-light-primary dark:text-text-dark-primary">
                        Gerenciar Universidades
                    </h1>
                    <p className="text-base font-normal leading-normal text-text-light-secondary dark:text-text-dark-secondary">
                        Cadastre e edite as universidades da plataforma.
                    </p>
                </div>
                <button
                    onClick={fetchUniversities}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-11 px-5 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light-primary dark:text-text-dark-primary text-sm font-bold shadow-sm hover:shadow-md transition-all group"
                >
                    <span className="material-symbols-outlined text-xl group-hover:rotate-180 transition-transform duration-500">refresh</span>
                    <span className="truncate">Recarregar</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Column: List */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                        {/* Filters */}
                        <div className="p-4 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/20">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <span className="material-symbols-outlined text-xl">search</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Pesquisar universidade por nome..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <UniversitiesTable
                            universities={filteredUniversities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
                            selectedUniversityId={editingUniversity?.id}
                            onEdit={(uni) => {
                                setEditingUniversity(uni);
                                setIsCreating(false);
                            }}
                            onDelete={handleDelete}
                        />

                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredUniversities.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>

                {/* Right Column: Form */}
                <div className="lg:col-span-2">
                    {renderRightPanel()}
                </div>
            </div>
        </div>
    );
}
