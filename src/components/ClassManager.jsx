'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import { useParams, useRouter } from 'next/navigation';
import { loadDbData } from '../services/disciplinaService'; // Adjusted path
import { saveClassSchedule, deleteClassSchedule, getClassesBySubjectId } from '../services/classService'; // Adjusted path
import HorarioEditor from './HorarioEditor'; // Adjusted path
import LoadingSpinner, { SavingSpinner } from './LoadingSpinner'; // Adjusted path

const ClassManager = ({ cur }) => { // Accept cur as prop or use hook, prop is safer if passed from server component
    const router = useRouter();
    // const params = useParams(); // Can also use this, but better to be explicit if passed

    const [loading, setLoading] = useState(true);
    const [disciplinas, setDisciplinas] = useState([]);
    const [semestre, setSemestre] = useState(1);
    const [selectedDisciplina, setSelectedDisciplina] = useState(null);
    const [classes, setClasses] = useState([]);
    const [editingClassIndex, setEditingClassIndex] = useState(null); // null means creating new
    const [isEditing, setIsEditing] = useState(false); // true if editor is open
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const data = await loadDbData(cur);
                setDisciplinas(data);
            } catch (error) {
                console.error("Error loading disciplines:", error);
            } finally {
                setLoading(false);
            }
        };
        if (cur) loadData();
    }, [cur]);

    // Filtered Disciplines Options
    const disciplinaOptions = useMemo(() => {
        return disciplinas
            .filter(d => d._se === semestre)
            .map(d => ({ value: d._id, label: d._di, original: d }));
    }, [disciplinas, semestre]);

    // Fetch classes when discipline is selected
    useEffect(() => {
        if (selectedDisciplina) {
            getClassesBySubjectId(selectedDisciplina.value)
                .then(fetchedClasses => setClasses(fetchedClasses))
                .catch(err => console.error(err));
        } else {
            setClasses([]);
        }
        setIsEditing(false);
        setEditingClassIndex(null);
    }, [selectedDisciplina]);


    const handleSaveClass = async (classData) => {
        if (!selectedDisciplina) return;
        setSaving(true);
        try {
            await saveClassSchedule(selectedDisciplina.value, classData);

            // Refresh classes
            const fetchedClasses = await getClassesBySubjectId(selectedDisciplina.value);
            setClasses(fetchedClasses);

            setIsEditing(false);
            setEditingClassIndex(null);
            alert('✅ Turma salva com sucesso!');
        } catch (error) {
            console.error("Error saving class:", error);
            alert('❌ Erro ao salvar turma.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClass = async (className) => {
        if (!window.confirm(`Tem certeza que deseja remover a turma "${className}"?`)) return;
        setSaving(true);
        try {
            await deleteClassSchedule(selectedDisciplina.value, className);
            // Refresh classes
            const fetchedClasses = await getClassesBySubjectId(selectedDisciplina.value);
            setClasses(fetchedClasses);
        } catch (error) {
            console.error("Error deleting class:", error);
            alert('❌ Erro ao remover turma.');
        } finally {
            setSaving(false);
        }
    }

    const startNewClass = () => {
        setEditingClassIndex(null);
        setIsEditing(true);
    };

    const startEditClass = (index) => {
        setEditingClassIndex(index);
        setIsEditing(true);
    }

    // Generate Semester Options (e.g., 1 to 10)
    const semesterOptions = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}º Semestre` }));


    if (loading) return <LoadingSpinner message="Carregando dados..." />;

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark p-6">
            {saving && <SavingSpinner message="Salvando..." />}
            <div className="mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-3xl font-bold">Novas Grades</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Filters and List */}
                    <div className="flex flex-col gap-6">
                        <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6 shadow-sm">
                            <h2 className="text-xl font-bold mb-4">Filtrar Disciplina</h2>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block mb-2 text-sm font-medium">Semestre</label>
                                    <Select
                                        options={semesterOptions}
                                        value={semesterOptions.find(s => s.value === semestre)}
                                        onChange={(opt) => {
                                            setSemestre(opt.value);
                                            setSelectedDisciplina(null);
                                        }}
                                        classNamePrefix="select"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium">Disciplina</label>
                                    <Select
                                        options={disciplinaOptions}
                                        value={selectedDisciplina}
                                        onChange={setSelectedDisciplina}
                                        placeholder="Selecione uma disciplina..."
                                        classNamePrefix="select"
                                        isDisabled={disciplinaOptions.length === 0}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Classes List */}
                        {selectedDisciplina && (
                            <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6 shadow-sm flex-1">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">Turmas de {selectedDisciplina.label}</h2>
                                    <button
                                        onClick={startNewClass}
                                        className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-lg">add</span>
                                        Nova Turma
                                    </button>
                                </div>

                                {classes.length === 0 ? (
                                    <p className="text-text-light-secondary dark:text-text-dark-secondary italic">Nenhuma turma cadastrada.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
                                            <thead>
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-text-light-secondary dark:text-text-dark-secondary">Turma</th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-text-light-secondary dark:text-text-dark-secondary">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                                {classes.map((cls, idx) => (
                                                    <tr key={idx} className="hover:bg-background-light dark:hover:bg-background-dark/50 transition-colors">
                                                        <td className="px-4 py-3 text-sm font-medium">{cls.class_name}</td>
                                                        <td className="px-4 py-3 text-right text-sm font-medium">
                                                            <button
                                                                onClick={() => startEditClass(idx)}
                                                                className="text-primary hover:text-primary/80 mr-3"
                                                            >
                                                                Editar
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClass(cls.class_name)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                Excluir
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Editor */}
                    <div className="flex flex-col">
                        {isEditing && selectedDisciplina ? (
                            <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6 shadow-sm sticky top-6">
                                <h2 className="text-xl font-bold mb-4">
                                    {editingClassIndex !== null ? 'Editar Turma' : 'Nova Turma'}
                                </h2>
                                <HorarioEditor
                                    initialClassName={editingClassIndex !== null ? classes[editingClassIndex].class_name : (classes.length === 0 ? selectedDisciplina.label : `${selectedDisciplina.label} - ${String.fromCharCode(65 + classes.length)}`)}
                                    initialHo={editingClassIndex !== null ? classes[editingClassIndex].ho : []}
                                    initialDa={editingClassIndex !== null ? classes[editingClassIndex].da : []}
                                    onSave={handleSaveClass}
                                    onCancel={() => setIsEditing(false)}
                                // isReviewing={false}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full min-h-[400px] border-2 border-dashed border-border-light dark:border-border-dark rounded-xl">
                                <p className="text-text-light-secondary dark:text-text-dark-secondary text-lg">
                                    {selectedDisciplina
                                        ? "Selecione uma turma para editar ou crie uma nova."
                                        : "Selecione uma disciplina para gerenciar turmas."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassManager;
