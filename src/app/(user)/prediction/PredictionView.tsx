import React, { useMemo } from 'react';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import MapaMentalVisualizacao from '../../../components/prediction/MapaMentalVisualizacao';
import { useRouter } from 'next/navigation';
import ROUTES from '../../../routes';
import { usePredictionController, Subject, COLUMN_WIDTH, ROW_HEIGHT, NODE_WIDTH, NODE_HEIGHT, TITLE_WIDTH, TITLE_HEIGHT } from './usePredictionController';

// --- Views ---

const LoadingView = () => <LoadingSpinner message="Inicializando simulador..." />;

const SidebarView = ({ ctrl }: { ctrl: ReturnType<typeof usePredictionController> }) => {
    // Group optionals for sidebar
    // _el = true significa OPTATIVA
    const optionals = useMemo(() =>
        ctrl.allSubjects.filter(s => s._el && s._ag).sort((a, b) => (a._di || '').localeCompare(b._di || '')),
        [ctrl.allSubjects]);

    return (
        <div className={`flex flex-col border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark transition-all duration-300 ${ctrl.isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
            <div className="p-4 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                <h2 className="font-bold text-lg text-text-light-primary dark:text-text-dark-primary">Controles</h2>
                <button onClick={() => ctrl.setIsSidebarOpen(false)} className="md:hidden">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {ctrl.selectedSemesterIndex !== null ? (
                    /* EDIT MODE: Show Suggestions */
                    <div className="space-y-4">
                        <div className="mb-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                            <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">edit</span>
                                Editando {ctrl.selectedSemesterIndex + 1}º Semestre
                            </h3>
                            <p className="text-xs text-slate-500 mb-3">
                                Adicione matérias sugeridas abaixo. Elas não têm choque de horário com as já adicionadas.
                            </p>
                            <button
                                onClick={() => ctrl.setSelectedSemesterIndex(null)}
                                className="w-full py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                                Sair da Edição
                            </button>
                        </div>

                        {/* Selected Subjects List */}
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 block">
                                Matérias Selecionadas
                            </h3>
                            <div className="space-y-1 mb-6">
                                {(ctrl.fixedSemesters[ctrl.selectedSemesterIndex] || []).map(subject => (
                                    <div key={subject._id} className="flex items-center justify-between group p-2 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20">
                                        <div className="flex-1 min-w-0 mr-2">
                                            <div className="truncate text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2" title={subject._di}>
                                                {subject._di}
                                            </div>
                                            <div className="text-[10px] text-slate-400 dark:text-slate-500">
                                                {(subject._ap || 0) + (subject._at || 0)} cr • {subject._workload}h
                                            </div>
                                        </div>
                                        {ctrl.canInteract && (
                                            <button
                                                onClick={() => subject._id !== undefined && ctrl.handleRemoveSubjectFromSemester(subject._id, ctrl.selectedSemesterIndex)}
                                                className="w-8 h-8 rounded flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                title="Remover do semestre"
                                            >
                                                <span className="material-symbols-outlined text-base">remove_circle</span>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {(ctrl.fixedSemesters[ctrl.selectedSemesterIndex] || []).length === 0 && (
                                    <div className="text-sm text-slate-400 text-center py-2 italic">
                                        Semestre vazio
                                    </div>
                                )}
                            </div>
                        </div>

                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 block">
                            Matérias Sugeridas ({ctrl.suggestions.length})
                        </h3>
                        <div className="space-y-1">
                            {ctrl.suggestions.map(subject => (
                                <div key={subject._id} className="flex items-center justify-between group p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-state-800/50 border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                                    <div className="flex-1 min-w-0 mr-2">
                                        <div className="truncate text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2" title={subject._di}>
                                            {subject._di}
                                            {!subject._el && <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-100 text-red-700 font-bold">OBG</span>}
                                        </div>
                                        <div className="text-[10px] text-slate-400 dark:text-slate-500">
                                            {(subject._ap || 0) + (subject._at || 0)} cr • {subject._workload}h
                                        </div>
                                    </div>
                                    {ctrl.canInteract && (
                                        <button
                                            onClick={() => ctrl.handleAddSubjectToSemester(subject, ctrl.selectedSemesterIndex)}
                                            className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                                            title="Adicionar"
                                        >
                                            <span className="material-symbols-outlined text-base">add_circle</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                            {ctrl.suggestions.length === 0 && (
                                <div className="text-sm text-slate-400 text-center py-4">
                                    Nenhuma sugestão disponível sem conflito.
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* DEFAULT MODE: Show Blacklist Electives */
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 block">
                                Matérias Optativas
                            </h3>
                            <div className="space-y-1">
                                {optionals.map(subject => {
                                    const isBlacklisted = subject._id !== undefined && ctrl.blacklistedIds.has(subject._id);
                                    // Check if currently IN the plan (Fixed or Predicted)
                                    // This is expensive to scan every render, optimization needed if slow.
                                    const isInPlan = ctrl.simulationResult?.semesters.some(sem => sem.some(s => s._id === subject._id));
                                    const isCompleted = ctrl.completedSubjects.some(s => s._id === subject._id);

                                    if (isCompleted) return null; // Don't show completed

                                    return (
                                        <div key={subject._id} className="flex items-center justify-between group p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-state-800/50 border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <div className="flex-1 min-w-0">
                                                    <div className={`truncate text-sm ${isBlacklisted ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`} title={subject._di}>
                                                        {subject._di}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 dark:text-slate-500">
                                                        {(subject._ap || 0) + (subject._at || 0)} cr • {subject._workload}h
                                                    </div>
                                                </div>
                                                {ctrl.canInteract && (
                                                    <input
                                                        type="checkbox"
                                                        checked={!isBlacklisted}
                                                        onChange={() => subject._id !== undefined && ctrl.toggleBlacklist(subject._id)}
                                                        className="rounded border-slate-300 text-primary focus:ring-primary"
                                                        title={isBlacklisted ? "Incluir na simulação" : "Remover da simulação"}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const CanvasView = ({ ctrl }: { ctrl: ReturnType<typeof usePredictionController> }) => {
    return (
        <div className="flex-1 relative bg-slate-50 dark:bg-slate-900/50 w-full h-full overflow-hidden">
            {!ctrl.isSidebarOpen && (
                <button
                    onClick={() => ctrl.setIsSidebarOpen(true)}
                    className="absolute top-4 left-4 z-10 w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-border-light dark:border-border-dark flex items-center justify-center hover:bg-slate-50"
                >
                    <span className="material-symbols-outlined">menu_open</span>
                </button>
            )}

            {/* Info Bar */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-border-light dark:border-border-dark text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="text-slate-600 dark:text-slate-300">Previsto</span>
                </div>
            </div>

            {ctrl.mindMapData && (
                <MapaMentalVisualizacao
                    svgRef={ctrl.svgRef}
                    nodes={ctrl.mindMapData.nodes}
                    links={ctrl.mindMapData.links}
                    graphBounds={ctrl.mindMapData.graphBounds}
                    selectedNodeId={ctrl.selectedNodeId}
                    onNodeClick={(nodeId: string | number) => {
                        if (ctrl.selectedSemesterIndex !== null) {
                            // If editing, clicking a subject node in this semester REMOVES it
                            const currentFixed = ctrl.fixedSemesters[ctrl.selectedSemesterIndex];
                            if (currentFixed && currentFixed.some(s => s._id === nodeId || s._re === nodeId)) {
                                const subject = currentFixed.find(s => s._id === nodeId || s._re === nodeId);
                                if (subject && subject._id !== undefined) ctrl.handleRemoveSubjectFromSemester(subject._id, ctrl.selectedSemesterIndex);
                            }
                        } else {
                            // Visualization Mode: Toggle Highlight
                            ctrl.setSelectedNodeId(prev => prev === nodeId ? null : nodeId);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default function PredictionView({ ctrl }: { ctrl: ReturnType<typeof usePredictionController> }) {
    const router = useRouter();
    if (ctrl.loading) return <LoadingView />;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background-light dark:bg-background-dark">
            {!ctrl.canInteract && (
                <div className="bg-amber-100 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center justify-center gap-3 animate-slideDown">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">info</span>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Você está no modo de visualização (Trial). Adquira um plano para personalizar sua predição.
                    </p>
                    <button
                        onClick={() => router.push(ROUTES.PLANS)}
                        className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 hover:underline"
                    >
                        Ver Planos
                    </button>
                </div>
            )}
            <div className="flex flex-1 overflow-hidden">
                <SidebarView ctrl={ctrl} />
                <CanvasView ctrl={ctrl} />
            </div>
        </div>
    );
}
