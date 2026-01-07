import React from 'react';
import { useProfileController } from './useProfileController';
import { Subject } from '@/types/Subject';

interface CurrentEnrollmentsSectionProps {
    ctrl: ReturnType<typeof useProfileController>;
}

export const CurrentEnrollmentsSection = ({ ctrl }: CurrentEnrollmentsSectionProps) => {
    return (
        <div className="bg-surface-light dark:bg-surface-dark lg:col-span-3 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden h-fit">
            <div className="px-6 py-4 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-white/5 flex justify-between items-center">
                <h2 className="text-lg font-bold text-text-light-primary dark:text-text-dark-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">calendar_today</span>
                    Grade Atual (Em Curso)
                </h2>
                {ctrl.currentEnrollments.length > 0 && (
                    <button
                        onClick={() => ctrl.setShowScheduleView(true)}
                        className="text-xs font-bold text-primary hover:text-primary-dark transition-colors uppercase tracking-wider flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">grid_view</span>
                        Visualizar Grade
                    </button>
                )}
            </div>
            <div className="p-6">
                {ctrl.currentEnrollments.length === 0 ? (
                    <div className="text-center py-8">
                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">event_busy</span>
                        <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm">Nenhuma disciplina em curso no momento.</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {ctrl.currentEnrollments.map((subject: Subject, index: number) => {
                            const scheduleGroups = ctrl.getFormattedSchedule(subject.schedule_data);
                            return (
                                <li key={`${subject._id}-${index}`} className="p-4 rounded-xl bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark hover:border-primary/30 transition-colors group">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-text-light-primary dark:text-text-dark-primary text-base leading-tight mb-1" title={subject.name}>{subject.name || subject.class_name || "Disciplina"}</h3>
                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{subject._re || "N/A"}</span>
                                                {(subject.course_name || subject.semester) && (
                                                    <span className="text-xs text-text-light-secondary dark:text-text-dark-secondary flex items-center gap-1">
                                                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                        {subject.course_name || subject.semester}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {scheduleGroups.length > 0 && (
                                            <div className="flex flex-col gap-1.5 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                                                {scheduleGroups.map((group: any, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                                        <span className="text-xs font-bold text-primary dark:text-blue-400 uppercase tracking-wide min-w-[24px]">{group.day}</span>
                                                        <div className="h-3 w-px bg-slate-200 dark:bg-slate-700"></div>
                                                        <div className="flex flex-wrap gap-x-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                                                            {group.times.map((time: string, tIdx: number) => (
                                                                <span key={tIdx} className={tIdx > 0 ? "before:content-[','] before:mr-1 before:text-slate-300 dark:before:text-slate-600" : ""}>{time}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};
