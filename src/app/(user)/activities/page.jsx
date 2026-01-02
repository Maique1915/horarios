'use client';

import Link from 'next/link';
import React from 'react';
import UserActivitiesManager from '../../../components/UserActivitiesManager';
import { getUserGroupProgress } from '../../../services/complementaryService';
import { useAuth } from '../../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

export default function ActivitiesPage() {
    // Only one view now: User Activities + Group Progress Summary
    const { user } = useAuth();

    const { data: groupProgress = [], isLoading: loading } = useQuery({
        queryKey: ['userGroupProgress', user?.id],
        queryFn: () => getUserGroupProgress(user.id),
        enabled: !!user?.id,
        staleTime: Infinity, // Query invalidated by UserActivitiesManager mutations
    });

    // Icons mapping for known groups
    const getGroupIcon = (groupName) => {
        const map = {
            'A': 'school',         // Ensino
            'B': 'event',          // Eventos
            'C': 'groups',         // Extensão
            'D': 'science',        // Produção Científica
            'E': 'work',           // Vivência Profissional
            'F': 'palette',        // Cultural
            'G': 'calendar_month', // Semana Acadêmica
            'H': 'star',           // Especiais
            'I': 'category',       // Outros
            'J': 'add_circle',     // Extra
        };
        return map[groupName] || 'folder_open';
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl animate-fadeIn">
            <header className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6 border-b border-border-light dark:border-border-dark">
                <div>
                    <h1 className="text-3xl font-bold text-text-light-primary dark:text-text-dark-primary mb-2 tracking-tight">
                        Atividades Complementares
                    </h1>
                    <p className="text-text-light-secondary dark:text-text-dark-secondary text-lg font-light">
                        Gerencie suas atividades extracurriculares e acompanhe seu progresso.
                    </p>
                </div>
                <Link
                    href="/profile"
                    className="group px-5 py-2.5 bg-white dark:bg-surface-dark text-text-light-secondary dark:text-text-dark-secondary font-medium rounded-lg border border-border-light dark:border-border-dark hover:text-primary hover:border-primary/50 transition-all duration-300 flex items-center gap-2 self-start md:self-auto shadow-sm"
                >
                    <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    <span>Voltar ao Perfil</span>
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-32 bg-surface-light dark:bg-surface-dark rounded-xl animate-pulse border border-border-light dark:border-border-dark" />
                    ))
                ) : (
                    <>
                        {/* Summary Card - Highlighted */}
                        <div className="bg-primary text-white p-5 rounded-xl shadow-lg shadow-primary/20 flex flex-col justify-between hover:-translate-y-1 transition-transform relative overflow-hidden group">
                            <div className="absolute -right-6 -top-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-9xl transform rotate-12">emoji_events</span>
                            </div>
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="p-2 rounded-lg bg-white/20 text-white backdrop-blur-sm">
                                    <span className="material-symbols-outlined text-xl">emoji_events</span>
                                </div>
                                <span className="text-2xl font-bold">{groupProgress.reduce((acc, curr) => acc + curr.total, 0).toFixed(2)}h</span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="font-bold text-sm mb-1 truncate">
                                    Total Acumulado
                                </h3>

                                {(() => {
                                    const total = groupProgress.reduce((acc, curr) => acc + curr.total, 0);
                                    const limit = 210;
                                    const percent = Math.min(100, (total / limit) * 100);
                                    return (
                                        <>
                                            <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden mb-2">
                                                <div
                                                    className="h-full bg-white transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[10px] text-white/90 font-medium tracking-wide">
                                                <span>{Math.round(percent)}% Concluído</span>
                                                <span>Meta: {limit}h</span>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {groupProgress.map((group) => {
                            const percent = Math.min(100, (group.total / group.limit) * 100);
                            return (
                                <div key={group.group} className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-border-light dark:border-border-dark shadow-sm flex flex-col justify-between hover:shadow-md hover:border-primary/40 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 rounded-lg bg-background-light dark:bg-background-dark text-text-light-secondary group-hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-xl">{getGroupIcon(group.group)}</span>
                                        </div>
                                        <span className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">{group.total.toFixed(2)}h</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-text-light-primary dark:text-text-dark-primary mb-1 truncate" title={group.description}>
                                            {group.label}
                                        </h3>
                                        <p className="text-[10px] text-text-light-secondary dark:text-text-dark-secondary mb-3 truncate font-medium">
                                            {group.description}
                                        </p>
                                        <div className="w-full h-1.5 bg-background-light dark:bg-background-dark rounded-full overflow-hidden mb-2">
                                            <div
                                                className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] text-text-light-secondary uppercase font-bold tracking-wider">
                                            <span>{Math.round(percent)}%</span>
                                            <span>Meta: {group.limit}h</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>

            <div className="animate-fadeIn">
                <UserActivitiesManager />
            </div>
        </div>
    );
}
