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
        staleTime: 1000 * 60 * 5, // 5 minutes cache
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
        <div className="mx-auto p-6 md:p-8">
            <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-light-primary dark:text-text-dark-primary mb-2">
                        Gerenciamento de Atividades Complementares
                    </h1>
                    <p className="text-text-light-secondary dark:text-text-dark-secondary">
                        Acompanhe seu progresso por grupo e gerencie suas atividades.
                    </p>
                </div>
                <Link
                    href="/profile"
                    className="group px-5 py-2.5 bg-primary text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 self-start md:self-auto"
                >
                    <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    <span>Voltar ao Perfil</span>
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="h-32 bg-surface-light dark:bg-surface-dark rounded-xl animate-pulse border border-border-light dark:border-border-dark" />
                    ))
                ) : (
                    groupProgress.map((group) => {
                        const percent = Math.min(100, (group.total / group.limit) * 100);
                        return (
                            <div key={group.group} className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                        <span className="material-symbols-outlined text-xl">{getGroupIcon(group.group)}</span>
                                    </div>
                                    <span className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">{group.total}h</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-text-light-primary dark:text-text-dark-primary mb-0.5" title={group.description}>
                                        {group.label}
                                    </h3>
                                    <p className="text-[10px] text-text-light-secondary dark:text-text-dark-secondary mb-2 truncate">
                                        {group.description}
                                    </p>
                                    <div className="w-full h-1.5 bg-background-light dark:bg-background-dark rounded-full overflow-hidden mb-1">
                                        <div
                                            className="h-full bg-primary transition-all duration-500 rounded-full"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-text-light-secondary opacity-80">
                                        <span>{Math.round(percent)}%</span>
                                        <span>Meta: {group.limit}h</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Summary Card (replaces Group J) */}
                {!loading && (
                    <div className="bg-primary text-white p-4 rounded-xl border border-primary shadow-lg flex flex-col justify-between hover:shadow-xl transition-shadow relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <span className="material-symbols-outlined text-9xl">school</span>
                        </div>
                        <div className="flex justify-between items-start mb-2 relative z-10">
                            <div className="p-1.5 rounded-lg bg-white/20 text-white">
                                <span className="material-symbols-outlined text-xl">emoji_events</span>
                            </div>
                            <span className="text-xl font-bold">{groupProgress.reduce((acc, curr) => acc + curr.total, 0)}h</span>
                        </div>
                        <div className="relative z-10">
                            <h3 className="font-bold text-sm mb-0.5 truncate" title="Minhas Atividades Complementares">
                                Total Acumulado
                            </h3>
                            <p className="text-[10px] text-white/80 mb-2 truncate">
                                Progresso Geral
                            </p>

                            {(() => {
                                const total = groupProgress.reduce((acc, curr) => acc + curr.total, 0);
                                const limit = 210;
                                const percent = Math.min(100, (total / limit) * 100);
                                return (
                                    <>
                                        <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden mb-1">
                                            <div
                                                className="h-full bg-white transition-all duration-500 rounded-full"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] text-white/90">
                                            <span>{Math.round(percent)}%</span>
                                            <span>Meta: {limit}h</span>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </div>

            <div className="animate-fadeIn">
                <UserActivitiesManager />
            </div>
        </div>
    );
}
