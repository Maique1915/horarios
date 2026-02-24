import React, { useState } from 'react';
import { Subject } from '@/types/Subject';

interface CategoryProgressProps {
    title: string;
    subjects: any[];
    reqHours: number;
    reqCredits: number;
    color: string;
    bgColor: string;
    icon: string;
    customTotalHours?: number;
    onClick?: () => void;
    onViewSubjects?: (title: string, subjects: any[]) => void;
}

const CategoryProgress = ({ title, subjects, reqHours, reqCredits, color, bgColor, icon, customTotalHours, onClick, onViewSubjects }: CategoryProgressProps) => {
    const totalCredits = subjects.reduce((sum: number, s: any) => sum + (Number(s._ap || 0) + Number(s._at || 0)), 0);
    const totalHours = customTotalHours !== undefined ? customTotalHours : totalCredits * 18;
    const hoursPct = reqHours > 0 ? Math.min(100, Math.round((totalHours / reqHours) * 100)) : 0;
    const creditsPct = reqCredits > 0 ? Math.min(100, Math.round((totalCredits / reqCredits) * 100)) : 0;

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (onViewSubjects) {
            onViewSubjects(title, subjects);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-4 flex flex-col gap-3 group h-full cursor-pointer hover:border-primary/50 transition-colors`}
        >
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${bgColor}/10 flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined ${color} text-lg`}>{icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-text-light-primary dark:text-text-dark-primary leading-tight truncate">{title}</h3>
                </div>
            </div>
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between text-[10px] mb-1.5 uppercase font-bold tracking-tight text-text-light-secondary dark:text-text-dark-secondary">
                        <span>Horas</span>
                        <span className="text-text-light-primary dark:text-text-dark-primary">
                            {Math.round(totalHours)}/{reqHours}h
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                        <div className={`h-full rounded-full ${bgColor} transition-all duration-1000`} style={{ width: `${hoursPct}%` }}></div>
                    </div>
                </div>
                {reqCredits > 0 && (
                    <div>
                        <div className="flex justify-between text-[10px] mb-1.5 uppercase font-bold tracking-tight text-text-light-secondary dark:text-text-dark-secondary">
                            <span>Créditos</span>
                            <span className="text-text-light-primary dark:text-text-dark-primary">
                                {totalCredits}/{reqCredits}
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                            <div className={`h-full rounded-full ${bgColor} opacity-70 transition-all duration-1000`} style={{ width: `${creditsPct}%` }}></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const WorkloadSection = ({ categories }: { categories: any[] }) => {
    const [viewingCategory, setViewingCategory] = useState<{ title: string; subjects: any[] } | null>(null);
    const count = categories.length;

    if (count === 0) return null;

    const handleViewSubjects = (title: string, subjects: any[]) => {
        setViewingCategory({ title, subjects });
    };

    // Helper to render a row of cards
    const renderRow = (items: any[], gridColsClass: string) => (
        <div className={`grid ${gridColsClass} gap-6 w-full`}>
            {items.map((stat: any) => (
                <CategoryProgress
                    key={stat.title}
                    {...stat}
                    onViewSubjects={handleViewSubjects}
                />
            ))}
        </div>
    );

    const getLayout = () => {
        switch (count) {
            case 1:
                return (
                    <div className="flex justify-center w-full">
                        <div className="w-full md:w-1/2 lg:w-1/3">
                            <CategoryProgress {...categories[0]} onViewSubjects={handleViewSubjects} />
                        </div>
                    </div>
                );
            case 2:
                return renderRow(categories, "grid-cols-1 md:grid-cols-2");
            case 3:
                return renderRow(categories, "grid-cols-1 md:grid-cols-3");
            case 4:
                return renderRow(categories, "grid-cols-1 md:grid-cols-2 lg:grid-cols-4");
            case 5:
                return (
                    <div className="flex flex-col gap-6 w-full">
                        {renderRow(categories.slice(0, 3), "grid-cols-1 md:grid-cols-3")}
                        <div className="flex justify-center w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full md:w-2/3 lg:w-1/2">
                                {categories.slice(3).map((stat: any) => (
                                    <CategoryProgress key={stat.title} {...stat} onViewSubjects={handleViewSubjects} />
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 6:
                return renderRow(categories, "grid-cols-1 md:grid-cols-3 lg:grid-cols-6");
            default:
                return renderRow(categories, "grid-cols-2 md:grid-cols-3 lg:grid-cols-4");
        }
    };

    return (
        <div className="mb-8 animate-fadeIn delay-100">
            {getLayout()}

            {/* Modal de Detalhes das Matérias */}
            {viewingCategory && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-border-light dark:border-border-dark flex flex-col max-h-[80vh]">
                        <div className="px-6 py-4 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-white/5 flex justify-between items-center shrink-0">
                            <h2 className="text-lg font-bold text-text-light-primary dark:text-text-dark-primary flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">list_alt</span>
                                {viewingCategory.title} - Detalhes
                            </h2>
                            <button onClick={() => setViewingCategory(null)} className="text-text-light-secondary hover:text-primary transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {viewingCategory.subjects.length === 0 ? (
                                <div className="text-center py-12 text-text-light-secondary dark:text-text-dark-secondary">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-20">history_edu</span>
                                    <p>Nenhuma matéria concluída nesta categoria.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-xs font-semibold text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-widest mb-4">
                                        {viewingCategory.subjects.length} Matérias Contabilizadas
                                    </p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {viewingCategory.subjects.map((s, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark hover:border-primary/30 transition-colors group">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded whitespace-nowrap">
                                                            {s._re || s.acronym || 'SYM'}
                                                        </span>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-semibold text-text-light-primary dark:text-text-dark-primary truncate leading-tight">
                                                                {s._di || s.name}
                                                            </h4>
                                                            <p className="text-[10px] text-text-light-secondary dark:text-text-dark-secondary truncate uppercase font-medium mt-0.5">
                                                                {s._cu || s.course_name || 'Curso Original'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 ml-4 shrink-0">
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-text-light-secondary dark:text-text-dark-secondary font-medium uppercase tracking-tighter">Horas</p>
                                                        <p className="text-xs font-bold text-text-light-primary dark:text-text-dark-primary">
                                                            {(Number(s._ap || 0) + Number(s._at || 0)) * 18}h
                                                        </p>
                                                    </div>
                                                    <div className="text-right w-12">
                                                        <p className="text-[10px] text-text-light-secondary dark:text-text-dark-secondary font-medium uppercase tracking-tighter">Créd.</p>
                                                        <p className="text-xs font-bold text-text-light-primary dark:text-text-dark-primary">
                                                            {Number(s._ap || 0) + Number(s._at || 0)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-border-light dark:border-border-dark bg-slate-50/30 dark:bg-white/5 flex justify-end shrink-0">
                            <button
                                onClick={() => setViewingCategory(null)}
                                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-text-light-primary dark:text-text-dark-primary text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
