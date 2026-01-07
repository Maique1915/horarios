'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Activity,
    Catalog,
    GroupProgress
} from '../../types/complementary';
import {
    addUserActivity,
    updateUserActivity
} from '../../services/complementaryService';

interface ComplementaryActivityFormProps {
    userId: number;
    catalog: Catalog;
    groupProgress: GroupProgress[];
    editingActivity: Activity | null;
    isFormOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-[200] flex items-center justify-center overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
            <div
                key={i}
                className="absolute w-2 h-2 rounded-sm animate-confetti"
                style={{
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5],
                    left: `${Math.random() * 100}%`,
                    top: `-10px`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                    transform: `rotate(${Math.random() * 360}deg)`
                }}
            />
        ))}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl border border-primary/20 text-center animate-in zoom-in duration-500 max-w-sm mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <span className="material-symbols-outlined text-6xl text-yellow-500 mb-4 block">emoji_events</span>
            <h2 className="text-2xl font-bold text-text-light-primary dark:text-text-dark-primary mb-2">Parabéns!</h2>
            <p className="text-text-light-secondary dark:text-text-dark-secondary">Você atingiu o limite de horas para este subgrupo!</p>
        </div>
    </div>
);

const ComplementaryActivityForm: React.FC<ComplementaryActivityFormProps> = ({
    userId,
    catalog,
    groupProgress,
    editingActivity,
    isFormOpen,
    onClose,
    onSuccess
}) => {
    const queryClient = useQueryClient();

    // --- Form State ---
    const [selectedActivityId, setSelectedActivityId] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');
    const [semester, setSemester] = useState('');
    const [documentLink, setDocumentLink] = useState('');
    const [description, setDescription] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);

    // --- Sync with editingActivity ---
    useEffect(() => {
        if (editingActivity) {
            setSelectedGroup(editingActivity.activity?.group || '');
            setSelectedActivityId(editingActivity.activity_id?.toString() || '');
            setHours(Math.floor(editingActivity.hours || 0).toString());
            setMinutes(Math.round(((editingActivity.hours || 0) - Math.floor(editingActivity.hours || 0)) * 60).toString());
            setSemester(editingActivity.semester || '');
            setDocumentLink(editingActivity.document_link || '');
            setDescription(editingActivity.description || '');
        } else {
            resetForm();
        }
    }, [editingActivity]);

    const resetForm = () => {
        setHours('');
        setMinutes('');
        setSemester('');
        setDocumentLink('');
        setDescription('');
        setSelectedActivityId('');
        // setSelectedGroup(''); // Keep selectedGroup or not? Usually keep is better for bulk entry
    };

    // --- Mutations ---
    const addMutation = useMutation({
        mutationFn: addUserActivity,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userActivities', userId] });
            queryClient.invalidateQueries({ queryKey: ['userGroupProgress', userId] });
            queryClient.invalidateQueries({ queryKey: ['userTotalHours', userId] });
            resetForm();
            onSuccess();
        },
        onError: (err) => {
            console.error(err);
            alert("Erro ao adicionar");
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: any }) => updateUserActivity(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userActivities', userId] });
            queryClient.invalidateQueries({ queryKey: ['userGroupProgress', userId] });
            queryClient.invalidateQueries({ queryKey: ['userTotalHours', userId] });
            resetForm();
            onSuccess();
        },
        onError: (err) => {
            console.error(err);
            alert("Erro ao atualizar");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            user_id: userId,
            activity_id: parseInt(selectedActivityId),
            hours: parseFloat(hours || '0') + (parseFloat(minutes || '0') / 60),
            semester,
            document_link: documentLink,
            description,
            status: 'PENDING'
        };

        if (editingActivity) {
            updateMutation.mutate({ id: editingActivity.id, data: payload });
        } else {
            addMutation.mutate(payload);
        }
    };

    // --- Real-time Progress Logic ---
    const selectedCatalogItem = useMemo(() => {
        if (!selectedGroup || !selectedActivityId) return null;
        return catalog[selectedGroup]?.find(c => c.id.toString() === selectedActivityId);
    }, [catalog, selectedGroup, selectedActivityId]);

    const currentSubgroupProgress = useMemo(() => {
        if (!selectedGroup || !selectedActivityId || !groupProgress) return null;
        const group = groupProgress.find(g => g.group === selectedGroup);
        if (!group) return null;
        const sub = group.subgroups.find(s => s.id.toString() === selectedActivityId);
        if (!sub) return null;

        const incomingHours = parseFloat(hours || '0') + (parseFloat(minutes || '0') / 60);
        const newTotal = sub.capped_total + incomingHours;
        const isLimitReached = sub.limit > 0 && newTotal >= sub.limit;

        return {
            ...sub,
            incomingHours,
            newTotal,
            isLimitReached,
            percent: sub.limit ? Math.min(100, (sub.capped_total / sub.limit) * 100) : 0,
            newPercent: sub.limit ? Math.min(100, (newTotal / sub.limit) * 100) : 0
        };
    }, [groupProgress, selectedGroup, selectedActivityId, hours, minutes]);

    useEffect(() => {
        if (currentSubgroupProgress?.isLimitReached && !showConfetti) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        }
    }, [currentSubgroupProgress?.isLimitReached]);


    return (
        <div className={`lg:col-span-1 order-1 lg:order-2 ${isFormOpen ? 'fixed inset-0 z-50 overflow-y-auto bg-background-light dark:bg-background-dark p-4 animate-in fade-in slide-in-from-bottom-10 lg:static lg:p-0 lg:overflow-visible lg:bg-transparent lg:animate-none' : 'hidden lg:block'}`}>
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm sticky top-6 h-full lg:h-auto overflow-y-auto lg:overflow-visible">
                {showConfetti && <Confetti />}

                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-light dark:border-border-dark">
                    <h3 className="font-bold text-lg text-text-light-primary dark:text-text-dark-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">
                            {editingActivity ? 'edit_note' : 'post_add'}
                        </span>
                        {editingActivity ? 'Editar Atividade' : 'Nova Atividade'}
                    </h3>
                    {(editingActivity || isFormOpen) && (
                        <button
                            onClick={onClose}
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
                                className="w-full p-3 pl-4 pr-10 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none transition-all cursor-pointer hover:border-primary/50"
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
                                className="w-full p-3 pl-4 pr-10 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:border-primary/50"
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
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800 text-xs animate-fadeIn space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-primary bg-white dark:bg-black/20 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                                        {selectedCatalogItem.code}
                                    </span>
                                    <span className="text-text-light-secondary">Limite: <span className="font-bold">{selectedCatalogItem.limit_hours}h</span></span>
                                </div>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                    Atual: {currentSubgroupProgress?.capped_total.toFixed(1)}h
                                </span>
                            </div>

                            {currentSubgroupProgress && (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        <span>Progresso do Subgrupo</span>
                                        <span>{currentSubgroupProgress.newTotal.toFixed(1)}h / {currentSubgroupProgress.limit}h</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative">
                                        <div
                                            className="absolute inset-y-0 left-0 bg-primary/30 transition-all duration-500"
                                            style={{ width: `${currentSubgroupProgress.percent}%` }}
                                        />
                                        <div
                                            className={`absolute inset-y-0 left-0 transition-all duration-500 ${currentSubgroupProgress.isLimitReached ? 'bg-green-500' : 'bg-primary'}`}
                                            style={{ width: `${currentSubgroupProgress.newPercent}%` }}
                                        />
                                    </div>
                                    {currentSubgroupProgress.isLimitReached && (
                                        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-bold animate-pulse">
                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                            <span>Limite atingido!</span>
                                        </div>
                                    )}
                                    {currentSubgroupProgress.newTotal > currentSubgroupProgress.limit && (
                                        <div className="flex items-center gap-1.5 text-orange-500 font-bold p-1 bg-orange-50 dark:bg-orange-950/20 rounded">
                                            <span className="material-symbols-outlined text-sm">warning</span>
                                            <span>Excedente: {(currentSubgroupProgress.newTotal - currentSubgroupProgress.limit).toFixed(1)}h não serão contabilizadas.</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <p className="text-text-light-primary dark:text-text-dark-primary leading-relaxed opacity-90 border-t border-blue-100 dark:border-blue-800 pt-2">
                                {selectedCatalogItem.description}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 sm:col-span-6 space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wide text-text-light-secondary dark:text-text-dark-secondary">Semestre</label>
                            <input
                                required
                                type="text"
                                placeholder="ex: 2024.1"
                                className="w-full p-3 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={semester}
                                onChange={(e) => setSemester(e.target.value)}
                            />
                        </div>

                        <div className="col-span-6 sm:col-span-3 space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wide text-text-light-secondary dark:text-text-dark-secondary">Horas</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    className="w-full p-3 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pl-3"
                                    value={hours}
                                    onChange={(e) => setHours(e.target.value)}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light-secondary text-xs font-bold">h</span>
                            </div>
                        </div>

                        <div className="col-span-6 sm:col-span-3 space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wide text-text-light-secondary dark:text-text-dark-secondary">Minutos</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    placeholder="0"
                                    className="w-full p-3 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pl-3"
                                    value={minutes}
                                    onChange={(e) => setMinutes(e.target.value)}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light-secondary text-xs font-bold">m</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wide text-text-light-secondary dark:text-text-dark-secondary">Descrição</label>
                        <textarea
                            className="w-full p-3 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Detalhes adicionais da atividade..."
                            rows={3}
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
                                className="w-full p-3 pl-10 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={documentLink}
                                onChange={(e) => setDocumentLink(e.target.value)}
                                placeholder="https://drive.google.com/..."
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3.5 bg-primary text-white rounded-lg hover:bg-primary-dark font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-2"
                        disabled={addMutation.isPending || updateMutation.isPending}
                    >
                        <span className="material-symbols-outlined text-xl">
                            {editingActivity ? 'save' : 'add_circle'}
                        </span>
                        {editingActivity ? 'Salvar Alterações' : 'Adicionar Atividade'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ComplementaryActivityForm;
