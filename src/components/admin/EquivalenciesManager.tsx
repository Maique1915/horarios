'use client';
import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../shared/LoadingSpinner';
import Pagination from '../shared/Pagination';
import EquivalencyTable from './EquivalencyTable';
import EquivalencyForm from './EquivalencyForm';
import { getEquivalencies, saveEquivalency, deleteEquivalency, DbEquivalency } from '../../services/disciplinaService';
import { supabase } from '../../lib/supabaseClient';

export default function EquivalenciesManager() {
    const [loading, setLoading] = useState(true);
    const [equivalencies, setEquivalencies] = useState<DbEquivalency[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Selection / Edit state
    const [editingEquiv, setEditingEquiv] = useState<DbEquivalency | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCourses();
        fetchEquivalencies();
    }, []);

    const fetchCourses = async () => {
        const { data } = await supabase.from('courses').select('id, code, name').order('name');
        if (data) setCourses(data);
    };

    const fetchEquivalencies = async () => {
        setLoading(true);
        try {
            const data = await getEquivalencies();
            setEquivalencies(data);
        } catch (error) {
            console.error('Error fetching equivalencies:', error);
        }
        setLoading(false);
    };

    const handleSave = async (data: any) => {
        setLoading(true);
        try {
            const { source_subject_ids, ...baseData } = data;

            // If editing a single row but changed to a group, or just saving group
            // We'll save each source subject as a separate row in the group
            const savePromises = source_subject_ids.map((sourceId: number) => {
                return saveEquivalency({
                    ...baseData,
                    source_subject_id: sourceId
                });
            });

            await Promise.all(savePromises);

            await fetchEquivalencies();
            setEditingEquiv(null);
            setIsCreating(false);
            // alert('Vínculo de equivalência salvo com sucesso!');
        } catch (error: any) {
            console.error('Error saving equivalency:', error);
            alert('Erro ao salvar equivalência: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir esta equivalência?')) return;

        setLoading(true);
        try {
            await deleteEquivalency(id);
            await fetchEquivalencies();
        } catch (error: any) {
            console.error('Error deleting equivalency:', error);
            alert('Erro ao excluir equivalência: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredEquivalencies = equivalencies.filter(equiv => {
        const courseMatches = !selectedCourseId || equiv.course_id === selectedCourseId;
        if (!courseMatches) return false;

        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            equiv.target_subject?.name.toLowerCase().includes(q) ||
            equiv.target_subject?.acronym.toLowerCase().includes(q) ||
            equiv.source_subject?.name.toLowerCase().includes(q) ||
            equiv.source_subject?.acronym.toLowerCase().includes(q)
        );
    });

    const renderRightPanel = () => {
        const stickyClass = "sticky top-6";

        if (isCreating) {
            return (
                <div className={`${stickyClass} bg-white dark:bg-slate-900/40 backdrop-blur-sm p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none text-slate-900 dark:text-white`}>
                    <div className="flex items-center gap-2 mb-8 text-primary">
                        <span className="material-symbols-outlined text-2xl">add_circle</span>
                        <h3 className="text-xl font-bold tracking-tight">Nova Equivalência</h3>
                    </div>
                    <EquivalencyForm
                        onSave={handleSave}
                        onCancel={() => setIsCreating(false)}
                    />
                </div>
            );
        }

        if (editingEquiv) {
            return (
                <div className={`${stickyClass} bg-white dark:bg-slate-900/40 backdrop-blur-sm p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none text-slate-900 dark:text-white`}>
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-2 text-primary">
                            <span className="material-symbols-outlined text-2xl">edit</span>
                            <h3 className="text-xl font-bold tracking-tight">Editar Equivalência</h3>
                        </div>
                        <button
                            onClick={() => setEditingEquiv(null)}
                            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <EquivalencyForm
                        initialData={editingEquiv || undefined}
                        onSave={handleSave}
                        onCancel={() => setEditingEquiv(null)}
                    />
                </div>
            );
        }

        return (
            <div className={`${stickyClass} bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center text-gray-400 py-20 border-2 border-dashed border-gray-100 dark:border-gray-700`}>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-primary">swap_horiz</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Gerenciar Equivalências</h3>
                    <p className="max-w-xs mx-auto text-sm">Selecione uma equivalência na lista para editar ou crie uma nova.</p>
                    <button
                        onClick={() => { setIsCreating(true); setEditingEquiv(null); }}
                        className="mt-4 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                    >
                        Criar Nova Equivalência
                    </button>
                </div>
            </div>
        );
    };

    if (loading && equivalencies.length === 0) return <LoadingSpinner message="Carregando equivalências..." />;

    return (
        <div className="mx-auto max-w-[1920px] p-6 lg:p-8 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-display font-bold leading-tight tracking-tight text-text-light-primary dark:text-text-dark-primary">
                        Equivalências de Disciplinas
                    </h1>
                    <p className="text-base font-normal leading-normal text-text-light-secondary dark:text-text-dark-secondary">
                        Defina quais disciplinas de diferentes cursos são equivalentes entre si.
                    </p>
                </div>
                <button
                    onClick={fetchEquivalencies}
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
                        <div className="p-4 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/20 flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <span className="material-symbols-outlined text-xl">search</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Pesquisar disciplina..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div className="md:w-64">
                                <select
                                    value={selectedCourseId || ''}
                                    onChange={(e) => setSelectedCourseId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                >
                                    <option value="">Todos os Cursos</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.code}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="flex-1 overflow-auto">
                            <EquivalencyTable
                                equivalencies={filteredEquivalencies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
                                selectedId={editingEquiv?.id}
                                onEdit={(equiv) => {
                                    setEditingEquiv(equiv);
                                    setIsCreating(false);
                                }}
                                onDelete={handleDelete}
                            />
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredEquivalencies.length}
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
