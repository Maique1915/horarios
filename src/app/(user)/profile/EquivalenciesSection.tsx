import React, { useState } from 'react';
import { useProfileController } from './useProfileController';
import { Subject } from '@/types/Subject';

interface EquivalenciesSectionProps {
    ctrl: ReturnType<typeof useProfileController>;
}

export const EquivalenciesSection = ({ ctrl }: EquivalenciesSectionProps) => {
    const [isOpen, setIsOpen] = useState(false);

    // Map completed subject IDs for quick lookup
    const completedIds = new Set(ctrl.completedSubjects.map(s => s._id));

    // Set of IDs belonging to the current course to filter relevant rules
    const myCourseSubjectIds = new Set(ctrl.allSubjects.map(s => s._id));

    // Group equivalencies by the subject that belongs to the CURRENT course
    // Key: Local Subject ID -> { local: Subject, equivalents: Subject[] }
    const groupedEquivs = ctrl.allEquivalencies.reduce((acc: any, eq) => {
        const isTargetMine = myCourseSubjectIds.has(eq.target_subject_id);
        const isSourceMine = myCourseSubjectIds.has(eq.source_subject_id);

        const processMapping = (localSub: any, equivSub: any) => {
            if (!localSub || !equivSub) return;
            if (!acc[localSub.id]) {
                acc[localSub.id] = {
                    local: localSub,
                    equivalents: []
                };
            }
            // Avoid duplicates
            if (!acc[localSub.id].equivalents.some((e: any) => e.id === equivSub.id)) {
                acc[localSub.id].equivalents.push(equivSub);
            }
        };

        // If target exists in my course, source is the equivalent
        if (isTargetMine) {
            processMapping(eq.target_subject, eq.source_subject);
        }

        // If source exists in my course AND it's a global rule (or specifically for this course), 
        // then target is also an equivalent (bidirectional logic)
        if (isSourceMine && (eq.course_id === null || eq.course_id === ctrl.user?.course_id)) {
            processMapping(eq.source_subject, eq.target_subject);
        }

        return acc;
    }, {});

    const equivList = Object.values(groupedEquivs);

    if (equivList.length === 0) {
        return (
            <div className="bg-slate-50 dark:bg-slate-900/20 rounded-xl p-6 border border-dashed border-slate-300 dark:border-slate-700 text-center animate-fadeIn mt-4">
                <span className="material-symbols-outlined text-slate-400 mb-2">info</span>
                <p className="text-sm text-slate-500">Nenhuma regra de equivalência relevante encontrada para o seu curso.</p>
            </div>
        );
    }

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden h-fit mt-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-white/5 flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
                <div className="flex flex-col items-start">
                    <h2 className="text-lg font-bold text-text-light-primary dark:text-text-dark-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600">sync_alt</span>
                        Matérias Equivalentes
                        <span className="text-xs font-normal text-slate-500 ml-1">({equivList.length} mapeadas)</span>
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                        expand_more
                    </span>
                </div>
            </button>

            {isOpen && (
                <div className="p-6 animate-slideDown">
                    <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mb-6 leading-relaxed">
                        Abaixo estão as disciplinas do seu curso que possuem equivalência direta com matérias de outros cursos.
                        Se você cursou qualquer uma das equivalentes (mesmo as de outros códigos), elas serão consideradas como concluidas aqui.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {equivList.map((group: any, idx: number) => {
                            const isLocalDone = completedIds.has(group.local.id) || ctrl.effectiveCompletedIds.has(group.local.id);

                            return (
                                <div key={idx} className={`p-4 rounded-xl border transition-all duration-300 ${isLocalDone ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="min-w-0 pr-2">
                                            <h4 className={`text-sm font-bold truncate ${isLocalDone ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                                {group.local.name}
                                            </h4>
                                            <p className="text-[10px] font-mono font-bold text-slate-400 mt-0.5">{group.local.acronym}</p>
                                        </div>
                                        {isLocalDone && (
                                            <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Atendida por:</p>
                                        <div className="space-y-1.5">
                                            {group.equivalents.map((equiv: any, sIdx: number) => {
                                                const equivDone = completedIds.has(equiv.id);
                                                return (
                                                    <div key={sIdx} className={`px-2.5 py-2 rounded-lg border flex items-center justify-between gap-2 ${equivDone ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'}`}>
                                                        <div className="min-w-0">
                                                            <p className={`text-[11px] font-bold truncate ${equivDone ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400'}`}>
                                                                {equiv.name}
                                                            </p>
                                                            <p className="text-[9px] text-slate-400 font-medium">{equiv.acronym}</p>
                                                        </div>
                                                        {equivDone && (
                                                            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase">VOCÊ FEZ</span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
