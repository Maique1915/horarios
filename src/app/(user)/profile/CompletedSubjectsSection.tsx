import React, { useState } from 'react';
import { useProfileController } from './useProfileController';

interface CompletedSubjectsSectionProps {
    ctrl: ReturnType<typeof useProfileController>;
}

export const CompletedSubjectsSection = ({ ctrl }: CompletedSubjectsSectionProps) => {
    const [viewFilterSemester, setViewFilterSemester] = useState<string>('all');
    const [viewSearchQuery, setViewSearchQuery] = useState<string>('');

    // Filtrar disciplinas concluídas para visualização
    const filteredCompletedSubjects = ctrl.completedSubjects.filter(subject => {
        // Filtro de período
        if (viewFilterSemester !== 'all') {
            if (viewFilterSemester === 'optativas') {
                if (!subject._el) return false; // Se não é optativa, oculta
            } else {
                if (subject._se != Number(viewFilterSemester)) return false;
            }
        }

        // Filtro de busca por nome
        if (viewSearchQuery) {
            const query = viewSearchQuery.toLowerCase();
            const matchName = subject._di?.toLowerCase().includes(query);
            const matchCode = subject._re?.toLowerCase().includes(query);
            if (!matchName && !matchCode) return false;
        }

        return true;
    });

    return (
        <div className="bg-surface-light dark:bg-surface-dark lg:col-span-2 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden h-fit">
            <div className="px-6 py-4 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-white/5 flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-lg font-bold text-text-light-primary dark:text-text-dark-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600">check_circle</span>
                    Concluídas <span className="text-sm font-normal text-slate-500 ml-1">({ctrl.completedSubjects.length})</span>
                </h2>
                <div className="flex items-center gap-2">
                    {ctrl.isEditingSubjects && (
                        <select
                            value={ctrl.selectedSemesterFilter}
                            onChange={(e) => ctrl.setSelectedSemesterFilter(e.target.value)}
                            className="px-2 py-1.5 rounded-lg text-xs border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 focus:ring-1 focus:ring-primary outline-none"
                        >
                            <option value="all">Todos</option>
                            <option value="optativas">Optativas</option>
                            {Array.from(new Set(ctrl.allSubjects.map(s => s._se).filter(s => s && Number(s) > 0))).sort((a, b) => Number(a) - Number(b)).map((sem: any) => (
                                <option key={sem} value={sem}>{sem}º Per</option>
                            ))}
                        </select>
                    )}
                    {ctrl.isEditingSubjects ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => ctrl.setIsEditingSubjects(false)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Cancelar"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                            <button
                                onClick={ctrl.handleSaveSubjects}
                                disabled={ctrl.savingSubjects}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                                title="Salvar"
                            >
                                {ctrl.savingSubjects ? <span className="material-symbols-outlined text-lg animate-spin">sync</span> : <span className="material-symbols-outlined text-lg">save</span>}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => ctrl.setIsEditingSubjects(true)}
                            className="text-xs font-bold text-primary hover:text-primary-dark transition-colors uppercase tracking-wider flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Editar
                        </button>
                    )}
                </div>
            </div>

            {/* Filtros para modo visualização */}
            {!ctrl.isEditingSubjects && ctrl.completedSubjects.length > 0 && (
                <div className="px-4 py-3 border-b border-border-light dark:border-border-dark bg-slate-50/30 dark:bg-slate-900/20 flex flex-col sm:flex-row gap-2">
                    <select
                        value={viewFilterSemester}
                        onChange={(e) => setViewFilterSemester(e.target.value)}
                        className="px-3 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    >
                        <option value="all">Todos os Períodos</option>
                        <option value="optativas">Optativas</option>
                        {Array.from(new Set(ctrl.completedSubjects.map(s => s._se).filter(s => s && Number(s) > 0))).sort((a, b) => Number(a) - Number(b)).map((sem: any) => (
                            <option key={sem} value={sem}>{sem}º Período</option>
                        ))}
                    </select>
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <span className="material-symbols-outlined text-lg">search</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar disciplina..."
                            value={viewSearchQuery}
                            onChange={(e) => setViewSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm outline-none transition-all"
                        />
                    </div>
                </div>
            )}

            <div className="p-0 overflow-y-auto max-h-[500px] custom-scrollbar">
                {ctrl.isEditingSubjects ? (
                    <div className="divide-y divide-border-light dark:divide-border-dark">
                        {ctrl.allSubjects
                            .filter(s => {
                                if (ctrl.selectedSemesterFilter === 'all') return true;
                                // _el = true significa OPTATIVA
                                if (ctrl.selectedSemesterFilter === 'optativas') return s._el;
                                return s._se == Number(ctrl.selectedSemesterFilter);
                            })
                            .sort((a, b) => {
                                // Ordenar: optativas (_el=true) primeiro, depois obrigatórias (_el=false)
                                if (a._el !== b._el) return a._el ? -1 : 1;
                                return (a._di || "").localeCompare(b._di || "");
                            })
                            .map((subject) => {
                                const isSelected = ctrl.selectedSubjectIds.has(String(subject._id));
                                return (
                                    <div
                                        key={subject._id}
                                        onClick={() => ctrl.handleToggleSubject(String(subject._id))}
                                        className={`px-6 py-3 flex items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${isSelected ? 'bg-green-50/50 dark:bg-green-900/10' : ''}`}
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-green-500 border-green-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                            {isSelected && <span className="material-symbols-outlined text-white text-sm">check</span>}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${isSelected ? 'text-green-900 dark:text-green-100' : 'text-text-light-primary dark:text-text-dark-primary'}`}>{subject._di}</p>
                                            <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary">{subject._re} • {subject._se}º Período</p>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                ) : (
                    <div className="divide-y divide-border-light dark:divide-border-dark">
                        {filteredCompletedSubjects.length === 0 ? (
                            <div className="text-center py-8 px-6">
                                <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm">
                                    {ctrl.completedSubjects.length === 0
                                        ? 'Nenhuma disciplina concluída.'
                                        : 'Nenhuma disciplina encontrada com os filtros aplicados.'}
                                </p>
                            </div>
                        ) : (
                            filteredCompletedSubjects
                                .sort((a, b) => (Number(b._se) || 0) - (Number(a._se) || 0))
                                .map((subject) => (
                                    <div key={subject._id} className="px-6 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-medium text-text-light-primary dark:text-text-dark-primary group-hover:text-primary transition-colors">{subject._di}</p>
                                                <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
                                                    {subject._re} • {subject._se ? `${subject._se}º Período` : 'Optativa'}
                                                </p>
                                            </div>
                                            {subject._el && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                                    OPT
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                )}
            </div>
            {ctrl.isEditingSubjects && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-border-light dark:border-border-dark flex justify-between items-center text-xs text-slate-500">
                    <span>{ctrl.selectedSubjectIds.size} selecionadas</span>
                    {ctrl.selectedSemesterFilter !== 'all' && ctrl.selectedSemesterFilter !== 'optativas' && (
                        <button
                            onClick={() => ctrl.handleTogglePeriod(ctrl.selectedSemesterFilter, true)}
                            className="text-primary hover:underline"
                        >
                            Marcar todo {ctrl.selectedSemesterFilter}º
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
