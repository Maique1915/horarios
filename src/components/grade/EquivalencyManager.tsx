
import React, { useState } from 'react';
import { Subject } from '../../types/Subject';

interface EquivalencyManagerProps {
    // List of ALL subjects in the current course scope that HAVE equivalents
    subjectsWithEquivalents: Subject[];
    // Map of Subject ID (local) -> List of Equivalent Subjects
    equivalentsMap: Map<number, Subject[]>;
    // The set of selected equivalent IDs
    selectedEquivalentIds: Set<number>;
    // Handler to toggle selection
    onToggle: (localId: number, equivId: number, isChecked: boolean) => void;
    // Close modal callback
    onClose: () => void;
}

export const EquivalencyManager: React.FC<EquivalencyManagerProps> = ({
    subjectsWithEquivalents,
    equivalentsMap,
    selectedEquivalentIds,
    onToggle,
    onClose
}) => {
    const [activeSubjectId, setActiveSubjectId] = useState<number | null>(
        subjectsWithEquivalents.length > 0 ? (subjectsWithEquivalents[0]._id as number) : null
    );

    const activeSubject = subjectsWithEquivalents.find(s => s._id === activeSubjectId);
    const activeEquivalents = activeSubjectId ? (equivalentsMap.get(activeSubjectId) || []) : [];

    // Group equivalents by Course Code
    const groupedEquivalents = activeEquivalents.reduce((acc, eq) => {
        const course = eq._cu || 'Outros';
        if (!acc[course]) acc[course] = [];
        acc[course].push(eq);
        return acc;
    }, {} as Record<string, Subject[]>);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-surface-light dark:bg-surface-dark w-full max-w-5xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border-light dark:border-border-dark">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900/50">
                    <h2 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600">sync_alt</span>
                        Gerenciar Equivalências
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-500"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar: List of Subjects */}
                    <div className="w-1/3 border-r border-border-light dark:border-border-dark overflow-y-auto bg-slate-50/30 dark:bg-slate-900/10">
                        <div className="p-4 space-y-2">
                            <p className="px-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Matérias com Opções
                            </p>
                            {subjectsWithEquivalents.map(sub => {
                                const isActive = sub._id === activeSubjectId;
                                const equivalents = equivalentsMap.get(sub._id as number) || [];
                                const hasSelection = equivalents.some(eq => selectedEquivalentIds.has(eq._id as number));
                                const id = typeof sub._id === 'number' ? sub._id : parseInt(String(sub._id));

                                return (
                                    <button
                                        key={id}
                                        onClick={() => setActiveSubjectId(id)}
                                        className={`w-full text-left p-3 rounded-xl transition-all border ${isActive
                                            ? 'bg-white dark:bg-slate-800 border-emerald-500 shadow-md transform scale-[1.02]'
                                            : 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="min-w-0">
                                                <h4 className={`text-sm font-bold truncate ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {sub.original_name || sub._di}
                                                </h4>
                                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{sub._re}</p>
                                            </div>
                                            {hasSelection && (
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Content: Options for Active Subject */}
                    <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 p-6">
                        {activeSubject ? (
                            <div className="max-w-3xl mx-auto space-y-8 animate-slideDown">
                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold text-text-light-primary dark:text-text-dark-primary mb-2">
                                        {activeSubject.original_name || activeSubject._di}
                                    </h3>
                                    <p className="text-text-light-secondary dark:text-text-dark-secondary">
                                        Selecione uma opção alternativa para cursar esta disciplina.
                                    </p>
                                </div>

                                {Object.entries(groupedEquivalents).map(([courseName, group]) => (
                                    <div key={courseName} className="space-y-3">
                                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-widest px-1">
                                            <span className="w-1 h-4 rounded-full bg-primary/40"></span>
                                            {courseName}
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {group.map(equiv => {
                                                const equivId = typeof equiv._id === 'number' ? equiv._id : parseInt(String(equiv._id));
                                                const isSelected = selectedEquivalentIds.has(equivId);
                                                const subjectId = typeof activeSubject._id === 'number' ? activeSubject._id : parseInt(String(activeSubject._id));

                                                return (
                                                    <div
                                                        key={equivId}
                                                        onClick={() => onToggle(subjectId, equivId, !isSelected)}
                                                        className={`relative group cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ${isSelected
                                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 shadow-lg shadow-emerald-500/10'
                                                            : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800'
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-start gap-4">
                                                            <div>
                                                                <h5 className={`font-bold text-sm mb-1 ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                                                    {equiv.original_name || equiv._di}
                                                                </h5>
                                                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                                    <span className="font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                                                        {equiv._re}
                                                                    </span>
                                                                    <span>•</span>
                                                                    <span>{equiv._ap + equiv._at} Créditos</span>
                                                                </div>
                                                            </div>

                                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                                                ? 'bg-emerald-500 border-emerald-500 text-white scale-110'
                                                                : 'border-slate-300 dark:border-slate-600 group-hover:border-emerald-400'
                                                                }`}>
                                                                {isSelected && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                                                            </div>
                                                        </div>

                                                        {isSelected && (
                                                            <div className="absolute -top-3 left-4 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm animate-bounce-short">
                                                                Opção Ativa
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined text-5xl mb-4 opacity-50">arrow_back</span>
                                <p>Selecione uma matéria à esquerda</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
                    >
                        Concluir
                    </button>
                </div>
            </div>
        </div>
    );
};
