import React from 'react';
import { useProfileController } from './useProfileController';
import { Enrollment } from '@/services/disciplinaService';

interface PeriodReviewSectionProps {
    ctrl: ReturnType<typeof useProfileController>;
}

export const PeriodReviewSection = ({ ctrl }: PeriodReviewSectionProps) => {
    const semester = ctrl.reviewEnrollments[0]?.period ?? '—';
    const total = ctrl.reviewEnrollments.length;
    const approvedCount = ctrl.approvedReviewIds.size;
    const failedCount = total - approvedCount;

    return (
        <div className="rounded-xl overflow-hidden border border-amber-300 dark:border-amber-600 shadow-md mb-6">
            {/* Header — banner de ação necessária */}
            <div className="bg-amber-50 dark:bg-amber-950/60 px-6 py-4 border-b border-amber-200 dark:border-amber-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl mt-0.5 shrink-0">
                        pending_actions
                    </span>
                    <div>
                        <h2 className="text-base font-bold text-amber-900 dark:text-amber-200 leading-tight">
                            Revisão do Semestre {semester}
                        </h2>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 max-w-lg">
                            O período letivo encerrou. Selecione as disciplinas que você foi <strong>aprovado</strong> — 
                            as marcadas serão movidas para &ldquo;Concluídas&rdquo;. As não marcadas serão removidas da grade.
                        </p>
                    </div>
                </div>

                {/* Contadores + fechar (modo manual) */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="text-center px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                        <p className="text-lg font-bold text-green-700 dark:text-green-400 leading-none">{approvedCount}</p>
                        <p className="text-[10px] text-green-600 dark:text-green-500 font-medium mt-0.5">Aprovadas</p>
                    </div>
                    <div className="text-center px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                        <p className="text-lg font-bold text-red-700 dark:text-red-400 leading-none">{failedCount}</p>
                        <p className="text-[10px] text-red-600 dark:text-red-500 font-medium mt-0.5">Reprovadas</p>
                    </div>
                    {ctrl.isManualReview && (
                        <button
                            onClick={() => ctrl.setIsManualReview(false)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                            title="Fechar revisão"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Lista de disciplinas */}
            <div className="bg-surface-light dark:bg-surface-dark divide-y divide-border-light dark:divide-border-dark">
                {ctrl.reviewEnrollments.map((enrollment: Enrollment, index: number) => {
                    const id = String(enrollment._id);
                    const isApproved = ctrl.approvedReviewIds.has(id);

                    return (
                        <div
                            key={`${id}-${index}`}
                            className={`flex items-center gap-4 px-6 py-3.5 cursor-pointer transition-colors group
                                ${isApproved
                                    ? 'bg-green-50/60 dark:bg-green-900/10 hover:bg-green-50 dark:hover:bg-green-900/20'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                            onClick={() => ctrl.handleToggleApprovedReview(id)}
                        >
                            {/* Toggle button */}
                            <button
                                type="button"
                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all
                                    ${isApproved
                                        ? 'bg-green-500 border-green-500 shadow-sm shadow-green-200 dark:shadow-green-900'
                                        : 'border-slate-300 dark:border-slate-600 bg-transparent group-hover:border-slate-400'
                                    }`}
                                aria-label={isApproved ? 'Marcado como aprovado' : 'Marcar como aprovado'}
                            >
                                {isApproved
                                    ? <span className="material-symbols-outlined text-white text-lg">check</span>
                                    : <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-lg group-hover:text-slate-400">close</span>
                                }
                            </button>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold leading-tight truncate
                                    ${isApproved
                                        ? 'text-green-900 dark:text-green-100'
                                        : 'text-text-light-primary dark:text-text-dark-primary'
                                    }`}>
                                    {enrollment.name || enrollment.class_name || 'Disciplina'}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                        {enrollment._re || 'N/A'}
                                    </span>
                                    {enrollment._el && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                            OPT
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Status badge */}
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 transition-all
                                ${isApproved
                                    ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                                    : 'bg-red-50 dark:bg-red-900/20 text-red-400 dark:text-red-500 border border-red-100 dark:border-red-900/40'
                                }`}>
                                {isApproved ? '✓ Aprovado' : '✗ Reprovado'}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Footer — ação */}
            <div className="bg-amber-50/50 dark:bg-amber-950/30 border-t border-amber-200 dark:border-amber-700 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-amber-700 dark:text-amber-500">
                    <span className="font-semibold">Dica:</span> Clique em cada disciplina para alternar entre aprovado e reprovado.
                </p>
                <button
                    onClick={ctrl.handleGraduateEnrollments}
                    disabled={ctrl.graduatingSubjects}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold text-sm transition-colors shadow-sm disabled:cursor-not-allowed"
                >
                    {ctrl.graduatingSubjects
                        ? <><span className="material-symbols-outlined text-lg animate-spin">sync</span>Salvando...</>
                        : <><span className="material-symbols-outlined text-lg">done_all</span>Confirmar Resultados</>
                    }
                </button>
            </div>
        </div>
    );
};
